//go:build !windows

package daemon

import (
	"os/exec"
	"syscall"
)

// SetSysProcAttr detaches the child process from the controlling terminal session on Unix
func SetSysProcAttr(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setsid: true,
	}
}
