#!/usr/bin/env node
// SessionStart hook — injects Gen Z mode rules and writes flag file.
// Runs under Bun or Node. Must never throw or exit non-zero.

const fs = require('fs');
const os = require('os');
const path = require('path');

const FLAG_FILE = path.join(os.homedir(), '.claude', '.gen-z-active');
const SETTINGS_FILE = path.join(os.homedir(), '.claude', 'settings.json');

// Write default mode to flag file
try {
  fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
  fs.writeFileSync(FLAG_FILE, 'full', 'utf8');
} catch (_) {
  // silent fail — never block session start
}

// Nudge statusline setup if not configured
try {
  const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const settings = JSON.parse(raw);
  if (!settings.statusLine) {
    const snippet = JSON.stringify({
      statusLine: {
        type: 'command',
        command: `bash "${path.join(__dirname, 'gen-z-statusline.sh')}"`,
      },
    });
    process.stdout.write(
      `\n> **Gen Z Mode statusline not configured.** ` +
      `Add to ~/.claude/settings.json: \`${snippet.slice(1, -1)}\`\n`
    );
  }
} catch (_) {
  // silent fail
}

// Emit skill rules as system context
// Prefer the skill shipped next to this hook (plugin install or install.sh copy),
// then fall back to a standalone ~/.claude/skills install (e.g. via `bunx skills add`)
const candidatePaths = [
  path.join(__dirname, '..', 'skills', 'bro', 'SKILL.md'),
  path.join(os.homedir(), '.claude', 'skills', 'bro', 'SKILL.md'),
];
for (const skillPath of candidatePaths) {
  try {
    const skill = fs.readFileSync(skillPath, 'utf8');
    // Strip YAML frontmatter before injecting
    const body = skill.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
    process.stdout.write(body);
    break;
  } catch (_) {
    // try next path
  }
}
