package main

import (
	"embed"
	"flag"
	"fmt"
	"net"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"imgv/internal/browser"
	"imgv/internal/scanner"
	"imgv/internal/server"
)

//go:embed web/*
var staticFS embed.FS

const Version = "1.0.0"

func printHelp() {
	fmt.Printf(`imgv - High-Performance Image Viewer & Animated Player (v%s)

USAGE:
    imgv [OPTIONS] [DIRECTORY]

ARGUMENTS:
    [DIRECTORY]      Target directory containing images (default: current directory ".")

OPTIONS:
    -p, --port       Port to listen on (default: auto-assign free port)
    -r, --recursive  Recursively scan all subdirectories
    --no-open        Do not automatically open the desktop app/browser
    --no-app         Open in default system browser instead of standalone app window
    --keep-alive     Keep server running even after window is closed
    -v, --version    Show version information
    -h, --help       Show this help message

EXAMPLES:
    imgv .                  # View all images in the current folder
    imgv ~/Pictures         # View images in ~/Pictures
    imgv -r /path/to/folder # View all images including subfolders
    imgv -p 8080 --no-open  # Run as a local web server on port 8080
`, Version)
}

func getFreePort() (int, error) {
	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return 0, err
	}
	defer listener.Close()
	return listener.Addr().(*net.TCPAddr).Port, nil
}

func expandHomeDir(path string) string {
	if strings.HasPrefix(path, "~/") || path == "~" {
		home, err := os.UserHomeDir()
		if err == nil {
			if path == "~" {
				return home
			}
			return filepath.Join(home, path[2:])
		}
	}
	return path
}

func main() {
	var port int
	var recursive bool
	var noOpen bool
	var noApp bool
	var keepAlive bool
	var showVersion bool
	var showHelp bool

	flag.IntVar(&port, "p", 0, "Port to listen on")
	flag.IntVar(&port, "port", 0, "Port to listen on")
	flag.BoolVar(&recursive, "r", false, "Recursively scan subdirectories")
	flag.BoolVar(&recursive, "recursive", false, "Recursively scan subdirectories")
	flag.BoolVar(&noOpen, "no-open", false, "Do not launch browser window")
	flag.BoolVar(&noApp, "no-app", false, "Open in default browser instead of app window")
	flag.BoolVar(&keepAlive, "keep-alive", false, "Keep server alive after window closes")
	flag.BoolVar(&showVersion, "v", false, "Show version")
	flag.BoolVar(&showVersion, "version", false, "Show version")
	flag.BoolVar(&showHelp, "h", false, "Show help")
	flag.BoolVar(&showHelp, "help", false, "Show help")

	flag.Usage = printHelp
	flag.Parse()

	if showHelp {
		printHelp()
		return
	}

	if showVersion {
		fmt.Printf("imgv version %s\n", Version)
		return
	}

	targetDir := "."
	args := flag.Args()
	if len(args) > 0 {
		targetDir = args[0]
	}

	targetDir = expandHomeDir(targetDir)
	absDir, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fi, err := os.Stat(absDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: directory '%s' does not exist.\n", absDir)
		os.Exit(1)
	}
	if !fi.IsDir() {
		fmt.Fprintf(os.Stderr, "Error: '%s' is a file, not a directory.\n", absDir)
		os.Exit(1)
	}

	// Initial scan to show summary in terminal
	scanRes, err := scanner.ScanDirectory(absDir, recursive)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error scanning directory: %v\n", err)
		os.Exit(1)
	}

	if port == 0 {
		freePort, err := getFreePort()
		if err != nil {
			port = 8420
		} else {
			port = freePort
		}
	}

	srv := server.New(server.Config{
		RootDir:   absDir,
		Recursive: recursive,
		AutoExit:  !keepAlive && !noOpen,
		StaticFS:  staticFS,
	})

	appURL, err := srv.Start(port)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error starting server: %v\n", err)
		os.Exit(1)
	}

	// Pretty terminal output
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("  🖼️  imgv - Image Viewer v%s\n", Version)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("  📂 Folder:     %s\n", absDir)
	fmt.Printf("  📸 Images:     %d total (%d animated ⚡, %d static)\n",
		scanRes.TotalImages, scanRes.AnimatedCount, scanRes.StaticCount)
	fmt.Printf("  🌐 Local URL:  %s\n", appURL)
	if !noOpen {
		fmt.Println("  🚀 Window:     Launching desktop viewer...")
	}
	fmt.Println("  ⌨️  Shortcuts:  Space: Play/Pause | Arrows: Next/Prev | F: Fullscreen")
	fmt.Println("  🛑 Quit:       Press Ctrl+C to exit")
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Launch desktop window or default browser
	if !noOpen {
		go func() {
			_, _ = browser.LaunchApp(appURL, !noApp)
		}()
	}

	// Listen for termination signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	select {
	case <-sigChan:
		fmt.Println("\n👋 Exiting imgv. Goodbye!")
	case <-srv.ShutdownChan():
		fmt.Println("\n🪟 Window closed. Exiting imgv...")
	}
}
