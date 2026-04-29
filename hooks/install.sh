#!/usr/bin/env bash
# Installs gen-z hooks into ~/.claude/hooks/ and patches ~/.claude/settings.json

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SKILLS_DIR="$HOME/.claude/skills/gen-z"
mkdir -p "$HOOKS_DIR" "$SKILLS_DIR"

# Copy hook files
cp "$SCRIPT_DIR/gen-z-activate.js" "$HOOKS_DIR/"
cp "$SCRIPT_DIR/gen-z-mode-tracker.js" "$HOOKS_DIR/"
cp "$SCRIPT_DIR/gen-z-statusline.sh" "$HOOKS_DIR/"
chmod +x "$HOOKS_DIR/gen-z-activate.js"
chmod +x "$HOOKS_DIR/gen-z-mode-tracker.js"
chmod +x "$HOOKS_DIR/gen-z-statusline.sh"

# Copy skill file so the hook can find it after installation
cp "$SCRIPT_DIR/../skills/gen-z/SKILL.md" "$SKILLS_DIR/"

echo "✓ gen-z hooks installed to $HOOKS_DIR"
echo "✓ gen-z skill installed to $SKILLS_DIR"
echo ""
echo "Add to $SETTINGS (inside the top-level object):"
echo ""
cat <<'EOF'
  "hooks": {
    "SessionStart": [
      {"command": "node ~/.claude/hooks/gen-z-activate.js"}
    ],
    "UserPromptSubmit": [
      {"command": "node ~/.claude/hooks/gen-z-mode-tracker.js"}
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/hooks/gen-z-statusline.sh"
  }
EOF
echo ""
echo "Then restart Claude Code. fr fr."
