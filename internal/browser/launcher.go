package browser

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

// ChromeCandidates lists Chromium-based browser binaries by OS
var chromeCandidates = map[string][]string{
	"linux": {
		"google-chrome",
		"google-chrome-stable",
		"chromium",
		"chromium-browser",
		"brave-browser",
		"microsoft-edge-stable",
		"microsoft-edge",
	},
	"darwin": {
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"/Applications/Chromium.app/Contents/MacOS/Chromium",
		"/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
		"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
	},
	"windows": {
		`C:\Program Files\Google\Chrome\Application\chrome.exe`,
		`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`,
		`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
		`C:\Program Files\Microsoft\Edge\Application\msedge.exe`,
	},
}

// FindChromiumExecutable looks for an installed Chromium binary
func FindChromiumExecutable() string {
	candidates := chromeCandidates[runtime.GOOS]
	for _, candidate := range candidates {
		if runtime.GOOS == "darwin" || runtime.GOOS == "windows" {
			if _, err := os.Stat(candidate); err == nil {
				return candidate
			}
		} else {
			if path, err := exec.LookPath(candidate); err == nil {
				return path
			}
		}
	}
	return ""
}

// LaunchApp opens the URL in a dedicated app window (if Chromium is found) or system browser
func LaunchApp(url string, appMode bool) (*exec.Cmd, error) {
	if appMode {
		chromePath := FindChromiumExecutable()
		if chromePath != "" {
			// Create a temporary user data dir so it launches as an isolated app window
			tmpDir := filepath.Join(os.TempDir(), fmt.Sprintf("imgv-profile-%d", os.Getpid()))
			_ = os.MkdirAll(tmpDir, 0700)

			args := []string{
				fmt.Sprintf("--app=%s", url),
				fmt.Sprintf("--user-data-dir=%s", tmpDir),
				"--no-first-run",
				"--no-default-browser-check",
				"--window-size=1366,860",
			}
			cmd := exec.Command(chromePath, args...)
			if err := cmd.Start(); err == nil {
				return cmd, nil
			}
		}
	}

	// Fallback to default system browser
	return OpenURL(url)
}

// OpenURL opens the target URL with the default system browser
func OpenURL(url string) (*exec.Cmd, error) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "linux":
		cmd = exec.Command("xdg-open", url)
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	default:
		return nil, fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
	err := cmd.Start()
	return cmd, err
}

// OpenInFileManager opens the file's parent folder and selects the file in OS file explorer
func OpenInFileManager(targetPath string) error {
	absPath, err := filepath.Abs(targetPath)
	if err != nil {
		return err
	}
	dir := filepath.Dir(absPath)

	switch runtime.GOOS {
	case "linux":
		// Try to highlight if file manager supports it, else open directory
		if _, err := exec.LookPath("nautilus"); err == nil {
			return exec.Command("nautilus", "--select", absPath).Start()
		}
		return exec.Command("xdg-open", dir).Start()
	case "darwin":
		return exec.Command("open", "-R", absPath).Start()
	case "windows":
		return exec.Command("explorer", "/select,", absPath).Start()
	default:
		return fmt.Errorf("unsupported OS")
	}
}
