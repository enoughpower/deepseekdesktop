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

# A Homebrew `node` can stop working after an unrelated icu4c upgrade (its dylib
# is pinned to a specific ICU version). Prefer a Node.js that actually runs:
# an nvm-managed v22 first, then whatever `node` resolves to, and fail loudly
# rather than bundling a broken binary.
resolve_node() {
  for candidate in \
    "$HOME/.nvm/versions/node/v22.19.0/bin/node" \
    "$HOME/.nvm/versions/node/v22.15.0/bin/node" \
    "$(command -v node 2>/dev/null)"; do
    [ -n "$candidate" ] && [ -x "$candidate" ] && "$candidate" --version >/dev/null 2>&1 && {
      echo "$candidate"; return 0;
    }
  done
  echo "build.sh: no working node binary found" >&2
  return 1
}

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

# --- 1b. integrated desktop plugins (tracked source, not npm deps) ----------
# Copy directory CONTENTS (`/.`) so a destination that already exists from the
# node_modules copy is merged, never nested one level deeper.
mkdir -p "$BACKEND/node_modules/@deepseek-ai"
for p in dsh-git dsh-client-ui-git dsh-billing dsh-client-ui-billing dsh-updater dsh-client-ui-updater; do
  cp -a "$ROOT/plugins/$p/." "$BACKEND/node_modules/@deepseek-ai/$p/"
done

# --- 1c. Settings-panel nav icons (idempotent patch) ------------------------
# ui-settings-general maps nav glyphs by section id; teach it the "git" and
# "updater" ids so those sections show fitting icons instead of the gear.
python3 - "$BACKEND/node_modules/@deepseek-ai/dsh-client-ui-settings-general/lib/client.js" << 'PYEOF'
import sys, pathlib
p = pathlib.Path(sys.argv[1])
s = p.read_text()
icons = [("git", "IconBranchOutline16"), ("updater", "IconRefreshOutline16")]
if not all(f'if (id === "{i[0]}") return' in s for i in icons):
    lines = s.split("\n")
    for i, line in enumerate(lines):
        if "IconSettingsOutline16, {" in line and i + 1 < len(lines) and "navIcon" in lines[i + 1]:
            indent = line[: len(line) - len(line.lstrip("\t "))]
            prop = lines[i + 1][: len(lines[i + 1]) - len(lines[i + 1].lstrip("\t "))]
            block = []
            for section_id, icon in icons:
                if f'if (id === "{section_id}") return' in s:
                    continue
                block += [
                    f'{indent}if (id === "{section_id}") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.{icon}, {{',
                    f'{prop}className: SettingsRoot_module_css_default.navIcon,',
                    f'{prop}size: 16',
                    f'{indent}}});',
                ]
            lines[i:i] = block
            break
    p.write_text("\n".join(lines))
PYEOF

# --- 2. bundle the Node.js runtime (strip local symbols, re-sign) ----------
NODE_SRC="$(resolve_node)"
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
cp "$ROOT/git.patch.yml" "$BACKEND/git.patch.yml"
cp "$ROOT/billing.patch.yml" "$BACKEND/billing.patch.yml"
cp "$ROOT/updater.patch.yml" "$BACKEND/updater.patch.yml"

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
