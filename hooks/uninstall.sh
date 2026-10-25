#!/usr/bin/env bash
# Reverses install.sh: removes the hooks, skill, session state and settings.json entries.

set -euo pipefail

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HOOKS_DIR="$CLAUDE_DIR/hooks"
SKILLS_DIR="$CLAUDE_DIR/skills/bro"
SETTINGS="$CLAUDE_DIR/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for f in gen-z-activate.js gen-z-mode-tracker.js gen-z-state.js gen-z-statusline.sh gen-z-run.sh; do
  if [ -f "$HOOKS_DIR/$f" ]; then rm "$HOOKS_DIR/$f" && echo "✓ removed $f"; fi
done

if [ -d "$SKILLS_DIR" ]; then rm -rf "$SKILLS_DIR" && echo "✓ removed skill dir"; fi
if [ -d "$CLAUDE_DIR/gen-z-claude-bro" ]; then rm -rf "$CLAUDE_DIR/gen-z-claude-bro" && echo "✓ removed session state"; fi
rm -f "$CLAUDE_DIR/.gen-z-active"

JS=$(command -v node || command -v bun || true)
if [ -f "$SETTINGS" ] && [ -n "$JS" ]; then
  "$JS" "$SCRIPT_DIR/gen-z-settings.js" uninstall "$SETTINGS" "$HOOKS_DIR"
  echo "✓ hooks removed from $SETTINGS"
fi

echo ""
echo "Uninstall complete. back to normal mode bro."
