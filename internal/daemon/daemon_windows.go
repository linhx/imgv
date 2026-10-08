//go:build windows

package daemon

import (
	"os/exec"
	"syscall"
)

// SetSysProcAttr detaches the child process on Windows
func SetSysProcAttr(cmd *exec.Cmd) {
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP,
	}
}
