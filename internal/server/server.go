package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"image/png"
	"io/fs"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"imgv/internal/browser"
	"imgv/internal/scanner"
	"golang.org/x/image/tiff"
)

// Server coordinates HTTP API and embedded UI assets
type Server struct {
	rootDir         string
	recursive       bool
	staticFS        embed.FS
	mu              sync.RWMutex
	lastHeartbeat   time.Time
	hasHeartbeat    atomic.Bool
	autoExit        bool
	shutdownChan    chan struct{}
}

// Config provides initial server parameters
type Config struct {
	RootDir   string
	Recursive bool
	AutoExit  bool
	StaticFS  embed.FS
}

// New creates a new Server instance
func New(cfg Config) *Server {
	absRoot, _ := filepath.Abs(cfg.RootDir)
	return &Server{
		rootDir:      absRoot,
		recursive:    cfg.Recursive,
		staticFS:     cfg.StaticFS,
		autoExit:     cfg.AutoExit,
		shutdownChan: make(chan struct{}),
	}
}

// Start begins HTTP serving on the given listener
func (s *Server) Start(port int) (string, error) {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/images", s.handleImages)
	mux.HandleFunc("/api/file", s.handleFile)
	mux.HandleFunc("/api/open-system", s.handleOpenSystem)
	mux.HandleFunc("/api/open-default", s.handleOpenDefault)
	mux.HandleFunc("/api/delete", s.handleDelete)
	mux.HandleFunc("/api/heartbeat", s.handleHeartbeat)

	// Embedded Static Assets
	subFS, err := fs.Sub(s.staticFS, "web")
	if err != nil {
		return "", fmt.Errorf("failed to load embedded web assets: %w", err)
	}
	fileServer := http.FileServer(http.FS(subFS))
	mux.Handle("/", fileServer)

	// Background watcher for window-close auto-exit
	if s.autoExit {
		go s.heartbeatWatcher()
	}

	addr := fmt.Sprintf("127.0.0.1:%d", port)
	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// Start listener
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Server error: %v\n", err)
		}
	}()

	url := fmt.Sprintf("http://127.0.0.1:%d", port)
	return url, nil
}

// ShutdownChan returns the notification channel when server is ready to quit
func (s *Server) ShutdownChan() <-chan struct{} {
	return s.shutdownChan
}

func (s *Server) heartbeatWatcher() {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// Give the browser 15 seconds to open initially
	time.Sleep(5 * time.Second)

	for range ticker.C {
		if s.hasHeartbeat.Load() {
			s.mu.RLock()
			last := s.lastHeartbeat
			s.mu.RUnlock()

			if time.Since(last) > 7*time.Second {
				// Window was closed by user
				close(s.shutdownChan)
				return
			}
		}
	}
}

func (s *Server) handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	s.lastHeartbeat = time.Now()
	s.hasHeartbeat.Store(true)
	s.mu.Unlock()
	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleImages(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	folder := r.URL.Query().Get("folder")
	if folder != "" {
		if abs, err := filepath.Abs(folder); err == nil {
			s.rootDir = abs
		}
	}
	recStr := r.URL.Query().Get("recursive")
	if recStr != "" {
		s.recursive = (recStr == "true" || recStr == "1")
	}
	dirToScan := s.rootDir
	rec := s.recursive
	s.mu.Unlock()

	result, err := scanner.ScanDirectory(dirToScan, rec)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(result)
}

func (s *Server) handleFile(w http.ResponseWriter, r *http.Request) {
	filePath := r.URL.Query().Get("path")
	if filePath == "" {
		http.Error(w, "missing path", http.StatusBadRequest)
		return
	}

	cleanPath := filepath.Clean(filePath)
	info, err := os.Stat(cleanPath)
	if err != nil {
		http.Error(w, "file not found", http.StatusNotFound)
		return
	}
	if info.IsDir() {
		http.Error(w, "target is a directory", http.StatusBadRequest)
		return
	}

	ext := strings.ToLower(filepath.Ext(cleanPath))

	// Handle TIFF conversion on-the-fly for browser compatibility
	if ext == ".tif" || ext == ".tiff" {
		f, err := os.Open(cleanPath)
		if err == nil {
			defer f.Close()
			img, err := tiff.Decode(f)
			if err == nil {
				w.Header().Set("Content-Type", "image/png")
				w.Header().Set("Cache-Control", "public, max-age=3600")
				_ = png.Encode(w, img)
				return
			}
		}
	}

	// Set exact Content-Type
	mimeType := mime.TypeByExtension(ext)
	if mimeType == "" {
		switch ext {
		case ".webp":
			mimeType = "image/webp"
		case ".avif", ".avis":
			mimeType = "image/avif"
		case ".svg", ".svgz":
			mimeType = "image/svg+xml"
		case ".bmp":
			mimeType = "image/bmp"
		case ".ico", ".cur":
			mimeType = "image/x-icon"
		case ".gif":
			mimeType = "image/gif"
		case ".png", ".apng":
			mimeType = "image/png"
		case ".jpg", ".jpeg", ".jfif":
			mimeType = "image/jpeg"
		default:
			mimeType = "application/octet-stream"
		}
	}

	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Cache-Control", "public, max-age=3600")

	f, err := os.Open(cleanPath)
	if err != nil {
		http.Error(w, "cannot open file", http.StatusInternalServerError)
		return
	}
	defer f.Close()

	http.ServeContent(w, r, filepath.Base(cleanPath), info.ModTime(), f)
}

func (s *Server) handleOpenSystem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := browser.OpenInFileManager(req.Path); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleOpenDefault(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := browser.OpenFileWithDefaultApp(req.Path); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (s *Server) handleDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	cleanPath := filepath.Clean(req.Path)
	if err := os.Remove(cleanPath); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
