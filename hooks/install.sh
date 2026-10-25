#!/usr/bin/env bash
# Manual install for Claude Code without the plugin system:
# copies the hooks and skill into ~/.claude and wires them into settings.json.

set -euo pipefail

CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
HOOKS_DIR="$CLAUDE_DIR/hooks"
SKILLS_DIR="$CLAUDE_DIR/skills/bro"
SETTINGS="$CLAUDE_DIR/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if command -v node >/dev/null; then JS=node
elif command -v bun >/dev/null; then JS=bun
else echo "✗ the gen-z hooks need node or bun on your PATH" >&2; exit 1
fi

mkdir -p "$HOOKS_DIR" "$SKILLS_DIR"

for f in gen-z-activate.js gen-z-mode-tracker.js gen-z-state.js gen-z-statusline.sh; do
  cp "$SCRIPT_DIR/$f" "$HOOKS_DIR/"
done
# prefixed copy so it can't clash with other tools' hooks in the shared dir
cp "$SCRIPT_DIR/run.sh" "$HOOKS_DIR/gen-z-run.sh"
chmod +x "$HOOKS_DIR/gen-z-activate.js" "$HOOKS_DIR/gen-z-mode-tracker.js" "$HOOKS_DIR/gen-z-statusline.sh" "$HOOKS_DIR/gen-z-run.sh"
cp "$SCRIPT_DIR/../skills/bro/SKILL.md" "$SKILLS_DIR/"

echo "✓ gen-z hooks installed to $HOOKS_DIR"
echo "✓ gen-z skill installed to $SKILLS_DIR"

"$JS" "$SCRIPT_DIR/gen-z-settings.js" install "$SETTINGS" "$HOOKS_DIR"
echo "✓ hooks added to $SETTINGS (backup at settings.json.bak)"
echo ""
echo "Restart Claude Code and you're in. fr fr."
