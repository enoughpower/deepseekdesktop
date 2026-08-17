#!/usr/bin/env bash
# Build the DeepSeek Harness macOS desktop app into dist/DeepSeekHarness.app.
#
# Usage:
#   ./build.sh                 minimal build (DeepSeek provider only, ~small)
#   KEEP_EXTRA_PROVIDERS=1 ./build.sh   keep Pi.ai/multi-provider SDKs (~+110 MB)
#
# Requires: macOS with Xcode command line tools (swiftc, codesign), node + npm.
set -euo pipefail

APP_NAME="DeepSeekHarness"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST="$ROOT/dist"
APP="$DIST/$APP_NAME.app"
CONTENTS="$APP/Contents"
MACOS="$CONTENTS/MacOS"
RES="$CONTENTS/Resources"
BACKEND="$RES/backend"

ARCH="$(uname -m)"   # arm64 or x86_64
case "$ARCH" in
  arm64|x86_64) ;;
  *) echo "unsupported arch: $ARCH" >&2; exit 1 ;;
esac

# --- 0. dependencies -------------------------------------------------------
if [ ! -f "$ROOT/node_modules/@deepseek-ai/dsh/lib/bin.js" ]; then
  echo "==> installing production dependencies (one-time)"
  (cd "$ROOT" && npm install --omit=dev --no-audit --no-fund --loglevel=error)
fi

# --- 1. stage the backend --------------------------------------------------
rm -rf "$DIST"
mkdir -p "$MACOS" "$BACKEND"

echo "==> copying node_modules and pruning"
cp -a "$ROOT/node_modules" "$BACKEND/node_modules"
"$ROOT/prune.sh" "$BACKEND/node_modules"

# --- 2. bundle the Node.js runtime (strip local symbols, re-sign) ----------
NODE_SRC="$(node -p 'process.execPath')"
echo "==> bundling node runtime from $NODE_SRC"
cp "$NODE_SRC" "$BACKEND/node"
# `-x` drops local symbols (~21 MB of debug/local symtab) while keeping the
# exported global symbols that native addons link against. A full `strip`
# removes those exports and segfaults when sharp/koffi/node-pty/etc. dlopen.
strip -x "$BACKEND/node" 2>/dev/null || true
codesign --force --sign - "$BACKEND/node" 2>/dev/null || true

# --- 3. launcher + profile overlay ----------------------------------------
cp "$ROOT/launcher.mjs" "$BACKEND/launcher.mjs"
cp "$ROOT/prune.patch.yml" "$BACKEND/prune.patch.yml"

# --- 4. compile the native WKWebView shell ---------------------------------
echo "==> compiling Swift shell"
swiftc -O -target "$ARCH-apple-macosx12.0" \
  -framework AppKit -framework WebKit \
  -o "$MACOS/$APP_NAME" \
  "$ROOT/App/main.swift"

# --- 5. Info.plist + icon --------------------------------------------------
cp "$ROOT/App/Info.plist" "$CONTENTS/Info.plist"
if [ -f "$ROOT/App/icon.icns" ]; then
  cp "$ROOT/App/icon.icns" "$RES/AppIcon.icns"
fi

# --- 6. sign (ad-hoc, for local use) ---------------------------------------
echo "==> code signing"
codesign --force --deep --sign - "$APP" 2>/dev/null || true

echo
echo "==> built: $APP"
du -sh "$APP" 2>/dev/null
echo "   backend: $(du -sh "$BACKEND" 2>/dev/null | cut -f1)"
