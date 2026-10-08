package scanner_test

import (
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"os"
	"path/filepath"
	"testing"
	"time"

	"imgv/internal/scanner"
)

func TestScanDirectory(t *testing.T) {
	result, err := scanner.ScanDirectory("../../test_images", false)
	if err != nil {
		t.Fatalf("ScanDirectory failed: %v", err)
	}

	t.Logf("Total images found: %d", result.TotalImages)
	t.Logf("Animated images: %d, Static images: %d", result.AnimatedCount, result.StaticCount)

	foundAnimGif := false
	foundAnimWebp := false
	foundAnimSvg := false
	foundAnimPng := false
	foundStaticJpg := false
	foundStaticWebp := false

	for _, item := range result.Items {
		t.Logf("Item: %s | Format: %s | Animated: %v | Dimensions: %dx%d",
			item.Name, item.Format, item.IsAnimated, item.Width, item.Height)

		switch item.Name {
		case "sample_animated.gif":
			if !item.IsAnimated {
				t.Errorf("sample_animated.gif should be animated")
			}
			foundAnimGif = true
		case "sample_animated.webp":
			if !item.IsAnimated {
				t.Errorf("sample_animated.webp should be animated")
			}
			foundAnimWebp = true
		case "sample_animated.svg":
			if !item.IsAnimated {
				t.Errorf("sample_animated.svg should be animated")
			}
			foundAnimSvg = true
		case "sample_animated.png":
			if !item.IsAnimated {
				t.Errorf("sample_animated.png should be animated (APNG)")
			}
			foundAnimPng = true
		case "sample_static.jpg":
			if item.IsAnimated {
				t.Errorf("sample_static.jpg should NOT be animated")
			}
			foundStaticJpg = true
		case "sample_static.webp":
			if item.IsAnimated {
				t.Errorf("sample_static.webp should NOT be animated")
			}
			foundStaticWebp = true
		}
	}

	if !foundAnimGif || !foundAnimWebp || !foundAnimSvg || !foundAnimPng || !foundStaticJpg || !foundStaticWebp {
		t.Errorf("Some test files were missing from scan")
	}
}

func TestRecursivePerformance(t *testing.T) {
	tmpDir := t.TempDir()

	// Create nested structure with 200 dummy images
	img := image.NewRGBA(image.Rect(0, 0, 10, 10))
	for x := 0; x < 10; x++ {
		for y := 0; y < 10; y++ {
			img.Set(x, y, color.RGBA{100, 150, 200, 255})
		}
	}

	dirs := []string{
		tmpDir,
		filepath.Join(tmpDir, "sub1"),
		filepath.Join(tmpDir, "sub1", "sub2"),
		filepath.Join(tmpDir, "sub3"),
	}

	for _, d := range dirs {
		_ = os.MkdirAll(d, 0755)
		for i := 0; i < 50; i++ {
			f, _ := os.Create(filepath.Join(d, fmt.Sprintf("test_%d.jpg", i)))
			_ = jpeg.Encode(f, img, nil)
			_ = f.Close()
		}
	}

	start := time.Now()
	result, err := scanner.ScanDirectory(tmpDir, true)
	if err != nil {
		t.Fatalf("Failed recursive scan: %v", err)
	}
	elapsed := time.Since(start)
	t.Logf("Scanned %d nested images in %s", result.TotalImages, elapsed)
	if result.TotalImages != 200 {
		t.Errorf("Expected 200 images, got %d", result.TotalImages)
	}
}
