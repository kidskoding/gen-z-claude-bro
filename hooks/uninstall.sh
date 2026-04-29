#!/usr/bin/env bash
# Removes gen-z hooks from ~/.claude/hooks/ and cleans up flag file

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SKILLS_DIR="$HOME/.claude/skills/bro"
FLAG="$HOME/.claude/.gen-z-active"

for f in gen-z-activate.js gen-z-mode-tracker.js gen-z-statusline.sh; do
  [ -f "$HOOKS_DIR/$f" ] && rm "$HOOKS_DIR/$f" && echo "✓ removed $f"
done

[ -d "$SKILLS_DIR" ] && rm -rf "$SKILLS_DIR" && echo "✓ removed skill dir"
[ -f "$FLAG" ] && rm "$FLAG" && echo "✓ removed flag file"

echo ""
echo "Remove the hooks and statusLine entries from ~/.claude/settings.json manually."
echo "Uninstall complete. back to normal mode bro."
