package main

import (
	"embed"
	"flag"
	"fmt"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"imgv/internal/browser"
	"imgv/internal/daemon"
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
    [DIRECTORY]             Target directory containing images (default: current directory ".")

OPTIONS:
    --flat, --no-recursive  Scan only the top-level directory (non-recursive)
    -f, --foreground        Run in foreground (do not detach from terminal)
    -p, --port <port>       Port to listen on (default: auto-assign free port)
    --no-open               Do not automatically open the desktop app/browser
    --no-app                Open in default system browser instead of standalone app window
    --lang <en|vi>          Initial language ('en' or 'vi', default: en)
    -v, --version           Show version information
    -h, --help              Show this help message

BEHAVIOR:
    - By default, imgv opens the window immediately and exits the CLI prompt.
    - By default, recursive scanning is ENABLED.

EXAMPLES:
    imgv .                  # Open viewer for current folder and free the terminal prompt
    imgv ~/Pictures         # Open viewer for ~/Pictures in background
    imgv --flat /path/to    # View only images in /path/to without subfolders
    imgv -f .               # Run attached in the foreground with console logs
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
	var flat bool
	var recursiveDummy bool
	var foreground bool
	var isDaemon bool
	var noOpen bool
	var noApp bool
	var keepAlive bool
	var lang string
	var showVersion bool
	var showHelp bool

	flag.IntVar(&port, "p", 0, "Port to listen on")
	flag.IntVar(&port, "port", 0, "Port to listen on")
	flag.BoolVar(&flat, "flat", false, "Scan only top-level directory (non-recursive)")
	flag.BoolVar(&flat, "no-recursive", false, "Scan only top-level directory (non-recursive)")
	flag.BoolVar(&flat, "nr", false, "Scan only top-level directory (non-recursive)")
	flag.BoolVar(&recursiveDummy, "r", true, "Recursive scan (enabled by default)")
	flag.BoolVar(&recursiveDummy, "recursive", true, "Recursive scan (enabled by default)")
	flag.BoolVar(&foreground, "f", false, "Run attached in foreground")
	flag.BoolVar(&foreground, "foreground", false, "Run attached in foreground")
	flag.BoolVar(&isDaemon, "daemon", false, "Internal daemon flag")
	flag.BoolVar(&noOpen, "no-open", false, "Do not launch browser window")
	flag.BoolVar(&noApp, "no-app", false, "Open in default browser instead of app window")
	flag.BoolVar(&keepAlive, "keep-alive", false, "Keep server alive after window closes")
	flag.StringVar(&lang, "lang", "", "Language ('en' or 'vi', default 'en')")
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

	recursive := !flat

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

	// If not running in foreground, daemonize to detach and free CLI prompt immediately
	isAlreadyDaemon := isDaemon || os.Getenv("__IMGV_DAEMON") == "1"
	if !foreground && !noOpen && !isAlreadyDaemon {
		execPath, err := os.Executable()
		if err != nil {
			execPath = os.Args[0]
		}

		var childArgs []string
		dirArgAdded := false
		for _, a := range os.Args[1:] {
			if a == "-f" || a == "--foreground" {
				continue
			}
			if a == targetDir || a == "." {
				childArgs = append(childArgs, absDir)
				dirArgAdded = true
				continue
			}
			childArgs = append(childArgs, a)
		}
		if !dirArgAdded {
			childArgs = append(childArgs, absDir)
		}
		childArgs = append(childArgs, "--daemon")

		cmd := exec.Command(execPath, childArgs...)
		cmd.Env = append(os.Environ(), "__IMGV_DAEMON=1")
		daemon.SetSysProcAttr(cmd)
		cmd.Stdin = nil
		cmd.Stdout = nil
		cmd.Stderr = nil

		if err := cmd.Start(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to launch imgv: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("🖼️  imgv opened for: %s\n", absDir)
		os.Exit(0)
	}

	// Running as background daemon or attached foreground process:
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

	if lang != "" {
		appURL = fmt.Sprintf("%s?lang=%s", appURL, lang)
	}

	if foreground {
		scanRes, _ := scanner.ScanDirectory(absDir, recursive)
		total := 0
		animCount := 0
		staticCount := 0
		if scanRes != nil {
			total = scanRes.TotalImages
			animCount = scanRes.AnimatedCount
			staticCount = scanRes.StaticCount
		}

		fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		fmt.Printf("  🖼️  imgv - Image Viewer v%s (Foreground Mode)\n", Version)
		fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
		fmt.Printf("  📂 Folder:     %s\n", absDir)
		fmt.Printf("  📸 Images:     %d total (%d animated ⚡, %d static)\n", total, animCount, staticCount)
		fmt.Printf("  🌐 Local URL:  %s\n", appURL)
		if !noOpen {
			fmt.Println("  🚀 Window:     Launching desktop viewer...")
		}
		fmt.Println("  🛑 Quit:       Press Ctrl+C to exit")
		fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	}

	// Launch desktop window or default browser
	if !noOpen {
		go func() {
			_, _ = browser.LaunchApp(appURL, !noApp, func() {
				srv.TriggerShutdown()
			})
		}()
	}

	// Listen for termination signals
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	select {
	case <-sigChan:
		if foreground {
			fmt.Println("\n👋 Exiting imgv. Goodbye!")
		}
	case <-srv.ShutdownChan():
		if foreground {
			fmt.Println("\n🪟 Window closed. Exiting imgv...")
		}
	}

	os.Exit(0)
}
