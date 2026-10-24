// Shared helpers for the Gen Z hooks: per-session mode state, stdin parsing,
// skill loading. Every function here swallows filesystem errors — a hook that
// throws can block session start or prompt submission.

const fs = require('fs');
const os = require('os');
const path = require('path');

const MODES = ['lite', 'full', 'ultra'];
const OFF = 'off';
const STALE_MS = 7 * 24 * 60 * 60 * 1000;

function claudeDir() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
}

function stateDir() {
  return path.join(claudeDir(), 'gen-z-claude-bro');
}

function sessionKey(sessionId) {
  // session ids are UUIDs; strip anything that could escape the directory
  const safe = String(sessionId || '').replace(/[^A-Za-z0-9_-]/g, '');
  return safe || 'default';
}

function sessionFile(sessionId) {
  return path.join(stateDir(), 'sessions', sessionKey(sessionId));
}

function defaultMode() {
  const env = String(process.env.GEN_Z_DEFAULT_MODE || '').trim().toLowerCase();
  return MODES.includes(env) || env === OFF ? env : 'full';
}

function readMode(sessionId) {
  try {
    const mode = fs.readFileSync(sessionFile(sessionId), 'utf8').trim();
    return MODES.includes(mode) || mode === OFF ? mode : null;
  } catch (_) {
    return null;
  }
}

function writeMode(sessionId, mode) {
  try {
    const file = sessionFile(sessionId);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, mode, 'utf8');
    // legacy single flag file, still read by older statusline setups
    const legacy = path.join(claudeDir(), '.gen-z-active');
    if (mode === OFF) fs.rmSync(legacy, { force: true });
    else fs.writeFileSync(legacy, mode, 'utf8');
  } catch (_) {}
}

function pruneStaleSessions() {
  try {
    const dir = path.join(stateDir(), 'sessions');
    const cutoff = Date.now() - STALE_MS;
    for (const name of fs.readdirSync(dir)) {
      const file = path.join(dir, name);
      if (fs.statSync(file).mtimeMs < cutoff) fs.rmSync(file, { force: true });
    }
  } catch (_) {}
}

function readStdinJson() {
  try {
    if (process.stdin.isTTY) return {};
    const raw = fs.readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function loadSkillBody() {
  const candidates = [
    path.join(__dirname, '..', 'skills', 'bro', 'SKILL.md'),
    path.join(claudeDir(), 'skills', 'bro', 'SKILL.md'),
  ];
  for (const file of candidates) {
    try {
      return fs.readFileSync(file, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
    } catch (_) {}
  }
  return '';
}

function emit(eventName, additionalContext, systemMessage) {
  const out = { hookSpecificOutput: { hookEventName: eventName, additionalContext } };
  if (systemMessage) out.systemMessage = systemMessage;
  process.stdout.write(JSON.stringify(out));
}

module.exports = {
  MODES,
  OFF,
  claudeDir,
  stateDir,
  defaultMode,
  readMode,
  writeMode,
  pruneStaleSessions,
  readStdinJson,
  loadSkillBody,
  emit,
};
