#!/usr/bin/env bash
# add-plugin.sh - install a third-party plugin into the desktop overlay.
#
# Usage:
#   ./add-plugin.sh <local-plugin-dir>            [--patch <file.yml>]
#   ./add-plugin.sh <npm-package-name>[@version]  [--patch <file.yml>]
#   ./add-plugin.sh --remove <plugin-name>
#   ./add-plugin.sh --runtime <add|remove|list> <package> [--profile name]
#
# Non-runtime mode (build-time): copy the plugin bundle into plugins/ and
# ensure a root *.patch.yml registers it (reusing the plugin's own
# cordis.patch.yml when present). launcher.mjs + build.sh auto-discover so no
# code change is needed to add a bundled plugin.
#
# --runtime mode: forward to the official per-profile plugin mechanism so a
# third-party plugin can be installed/removed in the RUNNING app without a
# rebuild (see plugins.mjs + desktop-bin.mjs).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGINS="$ROOT/plugins"
MODE=add
SRC=""
PATCH_FILE=""

resolve_node() {
  for candidate in \
    "$HOME/.nvm/versions/node/v22.19.0/bin/node" \
    "$HOME/.nvm/versions/node/v22.15.0/bin/node" \
    "$(command -v node 2>/dev/null)"; do
    [ -n "$candidate" ] && [ -x "$candidate" ] && "$candidate" --version >/dev/null 2>&1 && {
      echo "$candidate"; return 0;
    }
  done
  echo "add-plugin.sh: no working node binary found" >&2
  return 1
}
NODE_BIN="$(resolve_node)"

# `--runtime` alias: strip it and forward every remaining arg verbatim to
# plugins.mjs (add/remove/list on the running profile via `dsh plugin`).
if [ "${1:-}" = "--runtime" ]; then
  shift
  exec "$NODE_BIN" "$ROOT/plugins.mjs" "$@"
fi

usage() { sed -n "3,15p" "$0" >&2; }
while [ $# -gt 0 ]; do
  case "$1" in
    --remove) MODE=remove; SRC="$2"; shift 2 ;;
    --patch)  PATCH_FILE="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) if [ -z "$SRC" ]; then SRC="$1"; else echo "unexpected arg: $1" >&2; exit 2; fi; shift ;;
  esac
done

[ -n "$SRC" ] || { usage; exit 2; }
plugins_dir_for() { echo "$PLUGINS/$1"; }

read_pkg_name() {
  "$NODE_BIN" -e 'const p=process.argv[1];try{const j=require(require("path").resolve(p));process.stdout.write(j.name||"")}catch(e){}' "$1/package.json" 2>/dev/null || true
}

if [ "$MODE" = "remove" ]; then
  name="$SRC"
  if [ -d "$PLUGINS/$SRC" ]; then name="$(read_pkg_name "$PLUGINS/$SRC")" || name="$SRC"; fi
  dir="$(plugins_dir_for "$name")"
  echo "==> removing $name"
  rm -rf "$dir"
  # prune now-empty scope container dirs (e.g. plugins/@acme)
  parent="$dir"
  while :; do
    parent="$(dirname "$parent")"
    [ "$parent" = "$PLUGINS" ] && break
    rmdir "$parent" 2>/dev/null || break
  done
  # drop the root patch referencing this plugin (package name OR basename)
  for patch in "$ROOT"/*.patch.yml; do
    [ -f "$patch" ] || continue
    if grep -qF "$name" "$patch" || grep -qF "$(basename "$dir")" "$patch"; then
      echo "   removing patch ${patch##*/} (references $name)"
      rm -f "$patch"
    fi
  done
  echo "done."
  exit 0
fi

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

if [ -d "$SRC" ]; then
  SRCDIR="$SRC"
else
  echo "==> fetching npm package: $SRC"
  (cd "$WORK" && "$NODE_BIN" "$ROOT/node_modules/.bin/npm" install --omit=dev --no-audit --no-fund --no-save --no-package-lock --prefix "$WORK" "$SRC" >/dev/null 2>&1) || true
  SRCDIR=""
  if [ -d "$WORK/node_modules/$SRC" ]; then SRCDIR="$WORK/node_modules/$SRC"; fi
  if [ -z "$SRCDIR" ]; then
    for d in "$WORK"/node_modules/@*/*/; do [ -d "$d" ] && SRCDIR="$d" && break; done
  fi
  [ -n "$SRCDIR" ] && [ -d "$SRCDIR" ] || { echo "failed to fetch $SRC; use a local dir instead" >&2; exit 1; }
  echo "   fetched to $SRCDIR"
fi

name="$(read_pkg_name "$SRCDIR")" || name=""
[ -n "$name" ] || { echo "error: no package.json name found in $SRC" >&2; exit 1; }
dest_dir="$(plugins_dir_for "$name")"
echo "==> staging $name -> ${dest_dir#$ROOT/}"
rm -rf "$dest_dir"
mkdir -p "$(dirname "$dest_dir")"
cp -a "$SRCDIR/." "$dest_dir/"

# ensure a root patch registers the plugin
patch_src=""
if [ -n "$PATCH_FILE" ]; then
  patch_src="$PATCH_FILE"
elif [ -f "$dest_dir/cordis.patch.yml" ]; then
  patch_src="$dest_dir/cordis.patch.yml"
fi
slug="$(echo "$name" | tr "/@" "__")"
patch_path="$ROOT/${slug}.patch.yml"

if [ -n "$patch_src" ] && [ -f "$patch_src" ]; then
  cp "$patch_src" "$patch_path"
  echo "   patch -> ${patch_path#$ROOT/} (from ${patch_src##*/})"
else
  {
    echo "# add-plugin.sh: register $name"
    echo "- insert:"
    echo "    - id: ${name##*/}"
    echo "      name: '$name'"
  } > "$patch_path"
  echo "   generated minimal patch -> ${patch_path#$ROOT/}"
  echo "   (edit it if $name needs an id / inject / config)"
fi

echo
echo "==> done. ./build.sh will auto-bundle $name next build."