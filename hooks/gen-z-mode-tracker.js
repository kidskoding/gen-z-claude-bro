#!/usr/bin/env node
// UserPromptSubmit hook — tracks session-local mode changes and "stop gen z".
// Runs under Bun or Node. Must never throw or exit non-zero.

const fs = require('fs');
const os = require('os');
const path = require('path');

const FLAG_FILE = path.join(os.homedir(), '.claude', '.gen-z-active');

const COMMANDS = ['/bro', '/gen-z-claude-bro:bro'];
const LEVELS = ['lite', 'full', 'ultra'];
const STOP_PHRASES = ['stop gen z', 'normal mode'];

// Returns 'lite' | 'full' | 'ultra' | 'off' | null (no change)
function detectMode(rawPrompt) {
  const prompt = String(rawPrompt || '').trim().toLowerCase();
  const phrase = prompt.replace(/[.!?\s]+$/, '');

  if (STOP_PHRASES.includes(phrase)) return 'off';

  const [cmd, arg] = prompt.split(/\s+/);
  if (!COMMANDS.includes(cmd)) return null;
  return LEVELS.includes(arg) ? arg : 'full';
}

function applyMode(mode) {
  try {
    if (mode === 'off') {
      fs.rmSync(FLAG_FILE, { force: true });
    } else if (mode) {
      fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
      fs.writeFileSync(FLAG_FILE, mode, 'utf8');
    }
  } catch (_) {
    // silent fail
  }
}

if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { data += chunk; });
  process.stdin.on('end', () => {
    try {
      applyMode(detectMode(JSON.parse(data).prompt));
    } catch (_) {
      // silent fail
    }
  });
  process.stdin.on('error', () => {});
}

module.exports = { detectMode };
