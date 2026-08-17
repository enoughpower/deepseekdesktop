#!/usr/bin/env bash
# Prune a node_modules tree down to the runtime footprint the desktop app needs.
# Usage: prune.sh <node_modules_dir>
#
# Idempotent: safe to run more than once. Only ever deletes, never reinstalls.
set -euo pipefail

TARGET="${1:?usage: prune.sh <node_modules_dir>}"
[ -d "$TARGET" ] || { echo "prune.sh: $TARGET is not a directory" >&2; exit 1; }
cd "$TARGET"

# ---------------------------------------------------------------------------
# 1. Optional multi-provider SDK stack (Pi.ai) + session telemetry.
#    The bundled profile disables the `llm-pi-ai` and `session-telemetry-otel`
#    rows, so these packages are never loaded. Saves ~110 MB.
#    Set KEEP_EXTRA_PROVIDERS=1 to retain full multi-provider support.
# ---------------------------------------------------------------------------
if [ "${KEEP_EXTRA_PROVIDERS:-0}" != "1" ]; then
  for p in \
    @deepseek-ai/dsh-llm-pi-ai \
    @deepseek-ai/dsh-session-telemetry-otel \
    @earendil-works \
    @anthropic-ai \
    @aws-sdk \
    @aws-crypto \
    @smithy \
    @google \
    @mistralai \
    @opentelemetry \
    openai \
    typebox \
    partial-json \
    gaxios; do
    rm -rf -- "$p"
  done
fi

# ---------------------------------------------------------------------------
# 2. Foreign-platform native binaries. Only darwin-arm64 prebuilds run here.
# ---------------------------------------------------------------------------
rm -rf node-pty/prebuilds/win32-arm64 \
       node-pty/prebuilds/win32-x64 \
       node-pty/prebuilds/linux-arm64 \
       node-pty/prebuilds/linux-x64 \
       node-pty/prebuilds/darwin-x64 \
       @img/sharp-wasm32 2>/dev/null || true

# ---------------------------------------------------------------------------
# 3. Source, type declarations, source maps, and docs (never loaded by node).
# ---------------------------------------------------------------------------
find . -type f \( \
    -name '*.ts' -o -name '*.mts' -o -name '*.cts' \
    -o -name '*.tsx' -o -name '*.jsx' \
    -o -name '*.map' -o -name '*.tsbuildinfo' -o -name '*.flow' \
  \) -delete 2>/dev/null || true

# Third-party README/docs (keep @deepseek-ai markdown: SKILL.md and shipped
# assets like dsh-badge.md are functional content).
find . -path './@deepseek-ai' -prune -o -type f -name '*.md' -delete 2>/dev/null || true

# Third-party license/notice/changelog and VCS/tooling metadata.
find . -type f \( \
    -name 'LICENSE' -o -name 'LICENSE.*' -o -name 'LICENCE' -o -name 'LICENCE.*' \
    -o -name 'COPYING*' -o -name 'NOTICE*' -o -name 'AUTHORS*' \
    -o -name 'CHANGELOG*' -o -name 'CONTRIBUTING*' -o -name 'CODE_OF_CONDUCT*' \
    -o -name 'HISTORY*' -o -name 'SECURITY*' -o -name 'THREAT_MODEL*' \
    -o -name 'FUNDING*' -o -name 'BACKERS*' -o -name 'SPONSORS*' \
    -o -name '.npmignore' -o -name '.gitignore' -o -name '.gitattributes' \
    -o -name '.gitmodules' -o -name '.DS_Store' -o -name '.editorconfig' \
    -o -name '.eslintrc*' -o -name '.prettierrc*' -o -name 'tsconfig*.json' \
  \) -delete 2>/dev/null || true

# Test / example / CI directories. NOTE: `doc`/`docs` are deliberately NOT
# removed here — some packages (e.g. `yaml`) keep runtime modules under a
# `dist/doc/` path, and treating it as documentation breaks boot.
find . \( \
    -name test -o -name tests -o -name __tests__ -o -name __mocks__ \
    -o -name spec -o -name specs \
    -o -name examples -o -name example -o -name demo \
    -o -name benchmark -o -name bench \
    -o -name .github -o -name coverage -o -name .circleci \
  \) -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Collapse now-empty directories.
find . -type d -empty -delete 2>/dev/null || true

echo "pruned: $(du -sh . | cut -f1) remaining in $TARGET"
