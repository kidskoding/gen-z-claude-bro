#!/usr/bin/env bash
# Prints this session's Gen Z badge for the Claude Code statusline.
# Claude Code pipes session JSON on stdin; the badge reads that session's mode.
# Set GEN_Z_STATUSLINE_COLOR=0 for a plain badge, e.g. when composing with another statusline.

DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
INPUT=""
[ -t 0 ] || INPUT=$(cat)

SESSION=$(printf '%s' "$INPUT" | sed -n 's/.*"session_id"[[:space:]]*:[[:space:]]*"\([A-Za-z0-9_-]*\)".*/\1/p' | head -n 1)

if [ -n "$SESSION" ] && [ -f "$DIR/gen-z-claude-bro/sessions/$SESSION" ]; then
  MODE=$(cat "$DIR/gen-z-claude-bro/sessions/$SESSION" 2>/dev/null)
elif [ -f "$DIR/.gen-z-active" ]; then
  MODE=$(cat "$DIR/.gen-z-active" 2>/dev/null)
else
  exit 0
fi

case "$MODE" in
  lite)  LABEL="GEN-Z:LITE";  COLOR="36" ;;
  ultra) LABEL="GEN-Z:ULTRA"; COLOR="1;35" ;;
  full|"") LABEL="GEN-Z";     COLOR="1;32" ;;
  *) exit 0 ;;
esac

if [ "${GEN_Z_STATUSLINE_COLOR:-1}" = "0" ]; then
  printf '[%s]' "$LABEL"
else
  printf '\033[%sm[%s]\033[0m' "$COLOR" "$LABEL"
fi
