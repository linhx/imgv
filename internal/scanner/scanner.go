package scanner

import (
	"bytes"
	"crypto/md5"
	"encoding/binary"
	"encoding/hex"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "golang.org/x/image/bmp"
	_ "golang.org/x/image/tiff"
	"golang.org/x/image/webp"
)

// SupportedExtensions maps lower-case extensions to canonical format name
var SupportedExtensions = map[string]string{
	".jpg":   "jpeg",
	".jpeg":  "jpeg",
	".jfif":  "jpeg",
	".pjpeg": "jpeg",
	".pjp":   "jpeg",
	".png":   "png",
	".apng":  "apng",
	".gif":   "gif",
	".webp":  "webp",
	".svg":   "svg",
	".svgz":  "svg",
	".bmp":   "bmp",
	".ico":   "ico",
	".cur":   "ico",
	".avif":  "avif",
	".avis":  "avif",
	".tif":   "tiff",
	".tiff":  "tiff",
	".heic":  "heic",
	".heif":  "heif",
}

// IgnoredDirectoryNames lists directories to skip during recursive scan to maximize speed
var IgnoredDirectoryNames = map[string]bool{
	".git":         true,
	".svn":         true,
	".hg":          true,
	"node_modules": true,
	".cache":       true,
	".npm":         true,
	".yarn":        true,
	".cargo":       true,
	".rustup":      true,
	"vendor":       true,
	"__pycache__":  true,
	".thumbnails":  true,
	".vscode":      true,
	".idea":        true,
	"$RECYCLE.BIN": true,
	".Trash":       true,
	".Trash-1000":  true,
}

// ImageItem holds all metadata for an image file
type ImageItem struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Path        string    `json:"path"`     // Absolute file path
	RelPath     string    `json:"rel_path"` // Path relative to root folder
	Size        int64     `json:"size"`     // File size in bytes
	ModTime     time.Time `json:"mod_time"`
	Format      string    `json:"format"`      // canonical format name: jpeg, png, gif, webp, svg, etc.
	Ext         string    `json:"ext"`         // e.g. ".gif"
	IsAnimated  bool      `json:"is_animated"` // true if animated GIF, animated WebP, APNG, animated SVG/AVIF
	Width       int       `json:"width"`
	Height      int       `json:"height"`
	AspectRatio float64   `json:"aspect_ratio"`
}

// ScanResult contains scanned items and summary stats
type ScanResult struct {
	RootDir       string      `json:"root_dir"`
	TotalImages   int         `json:"total_images"`
	AnimatedCount int         `json:"animated_count"`
	StaticCount   int         `json:"static_count"`
	Formats       []string    `json:"formats"`
	Items         []ImageItem `json:"items"`
}

// In-memory cache for fast rescans & repeated queries
type cacheEntry struct {
	size       int64
	modNano    int64
	item       ImageItem
}

var (
	metaCacheMu sync.RWMutex
	metaCache   = make(map[string]cacheEntry)
)

// IsImageFile returns whether the filename has a supported image extension
func IsImageFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	_, ok := SupportedExtensions[ext]
	return ok
}

// GenerateID produces a deterministic short ID for an image path
func GenerateID(path string) string {
	h := md5.Sum([]byte(path))
	return hex.EncodeToString(h[:8])
}

type fileCandidate struct {
	absPath string
	relPath string
	name    string
	size    int64
	modTime time.Time
}

// ScanDirectory scans a folder (flat or recursive) with high performance
func ScanDirectory(rootDir string, recursive bool) (*ScanResult, error) {
	absRoot, err := filepath.Abs(rootDir)
	if err != nil {
		return nil, err
	}

	info, err := os.Stat(absRoot)
	if err != nil {
		return nil, err
	}
	if !info.IsDir() {
		return nil, os.ErrInvalid
	}

	var candidates []fileCandidate

	if recursive {
		// Use filepath.WalkDir for optimal speed (avoids stat calls on non-matches)
		err = filepath.WalkDir(absRoot, func(p string, d fs.DirEntry, err error) error {
			if err != nil {
				return nil // Skip unreadable paths
			}
			if d.IsDir() {
				// Skip high-noise directories
				if p != absRoot && IgnoredDirectoryNames[d.Name()] {
					return filepath.SkipDir
				}
				return nil
			}

			name := d.Name()
			if IsImageFile(name) {
				rel, _ := filepath.Rel(absRoot, p)
				fi, err := d.Info()
				if err == nil {
					candidates = append(candidates, fileCandidate{
						absPath: p,
						relPath: rel,
						name:    name,
						size:    fi.Size(),
						modTime: fi.ModTime(),
					})
				}
			}
			return nil
		})
		if err != nil {
			return nil, err
		}
	} else {
		entries, err := os.ReadDir(absRoot)
		if err != nil {
			return nil, err
		}
		for _, entry := range entries {
			if !entry.IsDir() && IsImageFile(entry.Name()) {
				fi, err := entry.Info()
				if err == nil {
					candidates = append(candidates, fileCandidate{
						absPath: filepath.Join(absRoot, entry.Name()),
						relPath: entry.Name(),
						name:    entry.Name(),
						size:    fi.Size(),
						modTime: fi.ModTime(),
					})
				}
			}
		}
	}

	// Concurrently process metadata with bounded worker pool
	numWorkers := runtime.NumCPU() * 4
	if numWorkers < 8 {
		numWorkers = 8
	}
	if numWorkers > 32 {
		numWorkers = 32
	}
	if len(candidates) < numWorkers {
		numWorkers = len(candidates)
	}
	if numWorkers <= 0 {
		numWorkers = 1
	}

	items := make([]ImageItem, len(candidates))
	var wg sync.WaitGroup
	ch := make(chan int, len(candidates))

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for idx := range ch {
				c := candidates[idx]
				items[idx] = inspectImageFast(c)
			}
		}()
	}

	for i := range candidates {
		ch <- i
	}
	close(ch)
	wg.Wait()

	// Compute summary stats
	animatedCount := 0
	formatMap := make(map[string]bool)
	for _, item := range items {
		if item.IsAnimated {
			animatedCount++
		}
		if item.Format != "" {
			formatMap[item.Format] = true
		}
	}

	formats := make([]string, 0, len(formatMap))
	for f := range formatMap {
		formats = append(formats, f)
	}

	return &ScanResult{
		RootDir:       absRoot,
		TotalImages:   len(items),
		AnimatedCount: animatedCount,
		StaticCount:   len(items) - animatedCount,
		Formats:       formats,
		Items:         items,
	}, nil
}

// inspectImageFast checks in-memory cache first, skips unnecessary I/O for static formats
func inspectImageFast(c fileCandidate) ImageItem {
	// Check memory cache
	metaCacheMu.RLock()
	cached, ok := metaCache[c.absPath]
	metaCacheMu.RUnlock()

	if ok && cached.size == c.size && cached.modNano == c.modTime.UnixNano() {
		return cached.item
	}

	ext := strings.ToLower(filepath.Ext(c.absPath))
	format := SupportedExtensions[ext]
	if format == "" {
		format = strings.TrimPrefix(ext, ".")
	}

	item := ImageItem{
		ID:      GenerateID(c.absPath),
		Name:    c.name,
		Path:    c.absPath,
		RelPath: c.relPath,
		Size:    c.size,
		ModTime: c.modTime,
		Ext:     ext,
		Format:  format,
	}

	// Optimize: JPG, JPEG, BMP, TIFF, ICO are GUARANTEED static! Zero animation check needed!
	switch format {
	case "jpeg", "bmp", "tiff", "ico", "heic", "heif":
		item.IsAnimated = false
		// Read dimensions quickly
		item.Width, item.Height = readDimensions(c.absPath, format)

	case "gif":
		// Scan GIF blocks
		f, err := os.Open(c.absPath)
		if err == nil {
			item.IsAnimated = checkAnimatedGIF(f)
			_, _ = f.Seek(0, io.SeekStart)
			if cfg, _, err := image.DecodeConfig(f); err == nil {
				item.Width = cfg.Width
				item.Height = cfg.Height
			}
			_ = f.Close()
		}

	case "webp":
		f, err := os.Open(c.absPath)
		if err == nil {
			isAnim, w, h := inspectWebP(f)
			item.IsAnimated = isAnim
			item.Width = w
			item.Height = h
			if item.Width == 0 || item.Height == 0 {
				_, _ = f.Seek(0, io.SeekStart)
				if cfg, err := webp.DecodeConfig(f); err == nil {
					item.Width = cfg.Width
					item.Height = cfg.Height
				}
			}
			_ = f.Close()
		}

	case "png", "apng":
		f, err := os.Open(c.absPath)
		if err == nil {
			item.IsAnimated = checkAnimatedPNG(f)
			if item.IsAnimated {
				item.Format = "apng"
			}
			_, _ = f.Seek(0, io.SeekStart)
			if cfg, _, err := image.DecodeConfig(f); err == nil {
				item.Width = cfg.Width
				item.Height = cfg.Height
			}
			_ = f.Close()
		}

	case "svg":
		item.IsAnimated = checkAnimatedSVG(c.absPath)
		item.Width, item.Height = parseSVGDimensions(c.absPath)

	case "avif":
		f, err := os.Open(c.absPath)
		if err == nil {
			item.IsAnimated = checkAnimatedAVIF(f)
			_ = f.Close()
		}
	}

	if item.Height > 0 {
		item.AspectRatio = float64(item.Width) / float64(item.Height)
	}

	// Cache result
	metaCacheMu.Lock()
	metaCache[c.absPath] = cacheEntry{
		size:    c.size,
		modNano: c.modTime.UnixNano(),
		item:    item,
	}
	metaCacheMu.Unlock()

	return item
}

// readDimensions extracts image dimensions with minimal reads
func readDimensions(filePath string, format string) (int, int) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, 0
	}
	defer f.Close()

	cfg, _, err := image.DecodeConfig(f)
	if err == nil {
		return cfg.Width, cfg.Height
	}
	return 0, 0
}

// checkAnimatedGIF checks whether a GIF contains more than one image descriptor
func checkAnimatedGIF(r io.ReadSeeker) bool {
	var header [6]byte
	if _, err := io.ReadFull(r, header[:]); err != nil {
		return false
	}
	if string(header[:]) != "GIF87a" && string(header[:]) != "GIF89a" {
		return false
	}

	var lsd [7]byte
	if _, err := io.ReadFull(r, lsd[:]); err != nil {
		return false
	}
	// Check global color table
	if lsd[4]&0x80 != 0 {
		gctSize := int64(3 * (1 << ((lsd[4] & 0x07) + 1)))
		if _, err := r.Seek(gctSize, io.SeekCurrent); err != nil {
			return false
		}
	}

	imagesFound := 0
	for {
		var blockType [1]byte
		if _, err := r.Read(blockType[:]); err != nil {
			break
		}
		if blockType[0] == 0x3B { // Trailer
			break
		}
		if blockType[0] == 0x21 { // Extension block
			var extType [1]byte
			if _, err := r.Read(extType[:]); err != nil {
				break
			}
			// Skip data sub-blocks
			for {
				var subLen [1]byte
				if _, err := r.Read(subLen[:]); err != nil {
					return imagesFound > 1
				}
				if subLen[0] == 0 {
					break
				}
				if _, err := r.Seek(int64(subLen[0]), io.SeekCurrent); err != nil {
					return imagesFound > 1
				}
			}
		} else if blockType[0] == 0x2C { // Image Descriptor
			imagesFound++
			if imagesFound > 1 {
				return true
			}
			var idDesc [9]byte
			if _, err := io.ReadFull(r, idDesc[:]); err != nil {
				break
			}
			if idDesc[8]&0x80 != 0 {
				lctSize := int64(3 * (1 << ((idDesc[8] & 0x07) + 1)))
				if _, err := r.Seek(lctSize, io.SeekCurrent); err != nil {
					break
				}
			}
			// Skip LZW code size
			var lzw [1]byte
			if _, err := r.Read(lzw[:]); err != nil {
				break
			}
			// Skip sub-blocks
			for {
				var subLen [1]byte
				if _, err := r.Read(subLen[:]); err != nil {
					return imagesFound > 1
				}
				if subLen[0] == 0 {
					break
				}
				if _, err := r.Seek(int64(subLen[0]), io.SeekCurrent); err != nil {
					return imagesFound > 1
				}
			}
		}
	}
	return imagesFound > 1
}

// inspectWebP checks animation bit and extracts canvas width/height from VP8X
func inspectWebP(r io.Reader) (isAnimated bool, width int, height int) {
	var header [32]byte
	n, err := io.ReadFull(r, header[:])
	if err != nil && n < 30 {
		return false, 0, 0
	}
	if string(header[0:4]) != "RIFF" || string(header[8:12]) != "WEBP" {
		return false, 0, 0
	}

	chunk := string(header[12:16])
	if chunk == "VP8X" {
		flags := header[20]
		isAnimated = (flags & 0x02) != 0 // Bit 1: Animation
		width = 1 + int(header[24]) | (int(header[25]) << 8) | (int(header[26]) << 16)
		height = 1 + int(header[27]) | (int(header[28]) << 8) | (int(header[29]) << 16)
	}
	return isAnimated, width, height
}

// checkAnimatedPNG checks if a PNG has the acTL chunk before IDAT
func checkAnimatedPNG(r io.Reader) bool {
	var header [8]byte
	if _, err := io.ReadFull(r, header[:]); err != nil {
		return false
	}
	if string(header[:]) != "\x89PNG\r\n\x1a\n" {
		return false
	}

	for {
		var chunkHdr [8]byte
		if _, err := io.ReadFull(r, chunkHdr[:]); err != nil {
			break
		}
		length := int64(binary.BigEndian.Uint32(chunkHdr[0:4]))
		name := string(chunkHdr[4:8])

		if name == "acTL" {
			return true
		}
		if name == "IDAT" || name == "IEND" {
			break
		}
		// Skip data + 4-byte CRC
		if _, err := io.CopyN(io.Discard, r, length+4); err != nil {
			break
		}
	}
	return false
}

// checkAnimatedSVG checks for animation tags or keyframes inside SVG
func checkAnimatedSVG(filePath string) bool {
	f, err := os.Open(filePath)
	if err != nil {
		return false
	}
	defer f.Close()

	buf := make([]byte, 16*1024)
	n, _ := f.Read(buf)
	content := strings.ToLower(string(buf[:n]))

	return strings.Contains(content, "<animate") ||
		strings.Contains(content, "<animatetransform") ||
		strings.Contains(content, "<animatemotion") ||
		strings.Contains(content, "@keyframes") ||
		strings.Contains(content, "<set ")
}

// parseSVGDimensions inspects viewBox or width/height attributes
func parseSVGDimensions(filePath string) (int, int) {
	f, err := os.Open(filePath)
	if err != nil {
		return 0, 0
	}
	defer f.Close()

	buf := make([]byte, 4096)
	n, _ := f.Read(buf)
	content := string(buf[:n])

	vbRe := regexp.MustCompile(`(?i)viewBox\s*=\s*["']\s*([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)\s+([0-9\.\-]+)`)
	if match := vbRe.FindStringSubmatch(content); len(match) == 5 {
		w, _ := strconv.ParseFloat(match[3], 64)
		h, _ := strconv.ParseFloat(match[4], 64)
		if w > 0 && h > 0 {
			return int(w), int(h)
		}
	}

	wRe := regexp.MustCompile(`(?i)\bwidth\s*=\s*["']([0-9]+)`)
	hRe := regexp.MustCompile(`(?i)\bheight\s*=\s*["']([0-9]+)`)
	wMatch := wRe.FindStringSubmatch(content)
	hMatch := hRe.FindStringSubmatch(content)
	if len(wMatch) == 2 && len(hMatch) == 2 {
		w, _ := strconv.Atoi(wMatch[1])
		h, _ := strconv.Atoi(hMatch[1])
		return w, h
	}

	return 0, 0
}

// checkAnimatedAVIF checks if AVIF file contains 'avis' brand
func checkAnimatedAVIF(r io.Reader) bool {
	var buf [4096]byte
	n, err := r.Read(buf[:])
	if err != nil && n < 16 {
		return false
	}
	return bytes.Contains(buf[:n], []byte("avis"))
}
