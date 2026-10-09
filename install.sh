#!/usr/bin/env bash
set -e

# imgv - Single-file Installer & Uninstaller for Linux
#
# USAGE:
#   ./install.sh              Install for current user (~/.local, NO sudo needed)
#   sudo ./install.sh         Install system-wide (/usr/local, requires sudo)
#   ./install.sh --uninstall  Uninstall imgv and remove desktop integration

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Determine installation prefix
if [ "$(id -u)" -eq 0 ]; then
    PREFIX="/usr/local"
    APPS_DIR="/usr/share/applications"
    ICONS_DIR="/usr/share/icons/hicolor"
    MODE_MSG="System-wide (/usr/local)"
else
    PREFIX="${HOME}/.local"
    APPS_DIR="${HOME}/.local/share/applications"
    ICONS_DIR="${HOME}/.local/share/icons/hicolor"
    MODE_MSG="User-level (${HOME}/.local)"
fi
BIN_DIR="${PREFIX}/bin"

# Handle Uninstallation
if [ "$1" = "--uninstall" ] || [ "$1" = "-u" ]; then
    echo "🗑️  Uninstalling imgv (${MODE_MSG})..."
    rm -f "${BIN_DIR}/imgv"
    rm -f "${APPS_DIR}/imgv.desktop"
    for size in 32x32 48x48 64x64 128x128 256x256 512x512; do
        rm -f "${ICONS_DIR}/${size}/apps/imgv.png"
    done
    rm -f "${ICONS_DIR}/scalable/apps/imgv.svg"

    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database "${APPS_DIR}" 2>/dev/null || true
    fi
    if command -v gtk-update-icon-cache >/dev/null 2>&1; then
        gtk-update-icon-cache -f -t "${ICONS_DIR}" 2>/dev/null || true
    fi
    echo "✅ Successfully uninstalled imgv."
    exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🖼️  imgv - One-Click Installer for Linux"
echo "  📦 Mode: ${MODE_MSG}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Compile binary
echo ""
echo "⚙️  [1/4] Compiling imgv binary..."
go build -ldflags="-s -w" -o "${SCRIPT_DIR}/imgv" "${SCRIPT_DIR}"
echo "   ✅ Build successful: ${SCRIPT_DIR}/imgv"

# 2. Install executable
echo ""
echo "📁 [2/4] Installing binary to ${BIN_DIR}..."
mkdir -p "${BIN_DIR}"
install -m 755 "${SCRIPT_DIR}/imgv" "${BIN_DIR}/imgv"
echo "   ✅ Installed: ${BIN_DIR}/imgv"

# 3. Install desktop launcher
echo ""
echo "🖥️  [3/4] Installing desktop entry to ${APPS_DIR}..."
mkdir -p "${APPS_DIR}"
install -m 644 "${SCRIPT_DIR}/imgv.desktop" "${APPS_DIR}/imgv.desktop"
echo "   ✅ Installed: ${APPS_DIR}/imgv.desktop"

# 4. Install all icon resolutions
echo ""
echo "🎨 [4/4] Installing application icons..."
declare -A ICONS=(
    ["assets/icon-32.png"]="${ICONS_DIR}/32x32/apps/imgv.png"
    ["assets/icon-48.png"]="${ICONS_DIR}/48x48/apps/imgv.png"
    ["assets/icon-64.png"]="${ICONS_DIR}/64x64/apps/imgv.png"
    ["assets/icon-128.png"]="${ICONS_DIR}/128x128/apps/imgv.png"
    ["assets/icon-256.png"]="${ICONS_DIR}/256x256/apps/imgv.png"
    ["assets/icon-512.png"]="${ICONS_DIR}/512x512/apps/imgv.png"
    ["assets/icon.svg"]="${ICONS_DIR}/scalable/apps/imgv.svg"
)

for rel_src in "${!ICONS[@]}"; do
    src="${SCRIPT_DIR}/${rel_src}"
    dest="${ICONS[$rel_src]}"
    if [ -f "$src" ]; then
        mkdir -p "$(dirname "$dest")"
        install -m 644 "$src" "$dest"
        echo "   • Icon: $dest"
    fi
done

# Refresh Linux desktop & icon caches
echo ""
echo "🔄 Refreshing system desktop & icon caches..."
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "${APPS_DIR}" 2>/dev/null || true
fi
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    gtk-update-icon-cache -f -t "${ICONS_DIR}" 2>/dev/null || true
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Installation completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo "⚠️  NOTE: '${BIN_DIR}' is not in your current PATH."
    echo "   To run 'imgv' from anywhere in terminal, add this to your ~/.bashrc or ~/.zshrc:"
    echo "   export PATH=\"${BIN_DIR}:\$PATH\""
    echo ""
fi

echo "✨ imgv is now ready! You can launch it from your application"
echo "   launcher or right-click any image to open with full icon support."
