#!/usr/bin/env node
// SessionStart hook — injects Gen Z mode rules and writes flag file

const fs = require('fs');
const os = require('os');
const path = require('path');

const FLAG_FILE = path.join(os.homedir(), '.claude', '.gen-z-active');
const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');

// Write default mode to flag file
try {
  fs.writeFileSync(FLAG_FILE, 'full', 'utf8');
} catch (_) {
  // silent fail — never block session start
}

// Nudge statusline setup if not configured
try {
  const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const settings = JSON.parse(raw);
  if (!settings.statusLine) {
    const statuslineCmd = `bash "${path.join(__dirname, 'gen-z-statusline.sh')}"`;
    process.stdout.write(
      `\n> **Gen Z Mode statusline not configured.** ` +
      `Add to ~/.claude/settings.json: \`"statusLine": {"type": "command", "command": "${statuslineCmd}"}\`\n`
    );
  }
} catch (_) {
  // silent fail
}

// Emit skill rules as system context
// Try ~/.claude/skills/bro/SKILL.md (installed location), fall back to sibling skills/ dir
const candidatePaths = [
  path.join(os.homedir(), '.claude', 'skills', 'bro', 'SKILL.md'),
  path.join(os.homedir(), '.claude', 'skills', 'gen-z', 'SKILL.md'),
  path.join(__dirname, '..', 'skills', 'bro', 'SKILL.md'),
  path.join(__dirname, '..', 'skills', 'gen-z', 'SKILL.md'),
];
for (const skillPath of candidatePaths) {
  try {
    const skill = fs.readFileSync(skillPath, 'utf8');
    // Strip YAML frontmatter before injecting
    const body = skill.replace(/^---[\s\S]*?---\n/, '');
    process.stdout.write(body);
    break;
  } catch (_) {
    // try next path
  }
}
