package scanner_test

import (
	"testing"

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
