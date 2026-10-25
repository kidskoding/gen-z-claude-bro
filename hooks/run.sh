#!/usr/bin/env bash
# Runs a gen-z hook with Bun when available, falling back to Node.
# Exits 0 silently if neither runtime exists — a hook must never block a session.

SCRIPT="$1"
shift

if command -v bun >/dev/null 2>&1; then
  exec bun "$SCRIPT" "$@"
elif command -v node >/dev/null 2>&1; then
  exec node "$SCRIPT" "$@"
fi

exit 0
