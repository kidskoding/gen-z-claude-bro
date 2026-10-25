#!/usr/bin/env node
// SessionStart hook — sets this session's Gen Z mode and injects the skill rules

const fs = require('fs');
const path = require('path');
const state = require('./gen-z-state');
const { parseMode } = require('./gen-z-mode-tracker');

const input = state.readStdinJson();
const sessionId = input.session_id;

// resume and compact continue a session, so keep whatever mode it had;
// startup and clear begin fresh in the default mode
const continuing = input.source === 'resume' || input.source === 'compact';
// Copilot CLI hands the first prompt to SessionStart and fires no UserPromptSubmit for it
const asked = parseMode(String(input.initial_prompt || ''));
const mode = asked || (continuing && state.readMode(sessionId)) || state.defaultMode();
state.writeMode(sessionId, mode);
state.pruneStaleSessions();

// The statusline badge is Claude Code only
const claude = state.HARNESS === 'claude';

// Copy the statusline script to a stable path: the plugin cache path changes on every update
const statuslineTarget = path.join(state.stateDir(), 'statusline.sh');
try {
  if (claude) {
    fs.mkdirSync(state.stateDir(), { recursive: true });
    fs.copyFileSync(path.join(__dirname, 'gen-z-statusline.sh'), statuslineTarget);
    fs.chmodSync(statuslineTarget, 0o755);
  }
} catch (_) {}

// Nudge statusline setup once, shown to the user rather than the model
let nudge = '';
try {
  const marker = path.join(state.stateDir(), '.statusline-nudged');
  if (claude && !fs.existsSync(marker)) {
    let settings = {};
    try {
      settings = JSON.parse(fs.readFileSync(path.join(state.claudeDir(), 'settings.json'), 'utf8'));
    } catch (_) {}
    if (!settings.statusLine) {
      nudge =
        'gen-z-claude-bro: want a [GEN-Z] badge in your statusline? Add to ~/.claude/settings.json: ' +
        `"statusLine": {"type": "command", "command": "bash ${statuslineTarget}"}`;
    }
    fs.writeFileSync(marker, new Date().toISOString(), 'utf8');
  }
} catch (_) {}

if (mode === state.OFF) {
  if (nudge) process.stdout.write(JSON.stringify({ systemMessage: nudge }));
  process.exit(0);
}

const body = state.loadSkillBody();
if (!body) process.exit(0);

state.emit(
  'SessionStart',
  `${body}\n\n## Current session\n\nGen Z mode is ACTIVE at **${mode}** intensity.`,
  nudge
);
