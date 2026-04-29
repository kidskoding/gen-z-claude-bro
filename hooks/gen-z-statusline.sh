#!/usr/bin/env bash
# Reads gen-z flag file and outputs statusline badge for Claude Code

FLAG="$HOME/.claude/.gen-z-active"

[ ! -f "$FLAG" ] && exit 0

MODE=$(cat "$FLAG" 2>/dev/null)

case "$MODE" in
  full|"")
    printf "[GEN-Z]"
    ;;
  *)
    printf "[GEN-Z:%s]" "$(echo "$MODE" | tr '[:lower:]' '[:upper:]')"
    ;;
esac
