#!/usr/bin/env sh
# Runs a Gen Z hook script on whichever JS runtime is installed: node, then bun.
# Claude Code's native installer ships no JS runtime, so with neither present the
# hook exits 0 silently instead of erroring on every session start and prompt.
# Usage: sh run.sh <script.js> [claude|codex|copilot]

DIR=$(cd "$(dirname "$0")" && pwd)
SCRIPT="$DIR/$1"
shift

if command -v node >/dev/null 2>&1; then
  exec node "$SCRIPT" "$@"
elif command -v bun >/dev/null 2>&1; then
  exec bun "$SCRIPT" "$@"
fi

# drain stdin so the caller never sees a broken pipe
cat >/dev/null 2>&1
exit 0
