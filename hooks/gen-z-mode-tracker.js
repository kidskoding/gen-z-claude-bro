#!/usr/bin/env node
// UserPromptSubmit hook — tracks session-local mode changes and "stop gen z"

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const FLAG_FILE = path.join(os.homedir(), '.claude', '.gen-z-active');

const MODE_MAP = {
  '/bro lite': 'lite',
  '/bro full': 'full',
  '/bro ultra': 'ultra',
  '/bro': 'full',
  // namespaced form when installed as plugin
  '/gen-z-claude-bro:bro lite': 'lite',
  '/gen-z-claude-bro:bro full': 'full',
  '/gen-z-claude-bro:bro ultra': 'ultra',
  '/gen-z-claude-bro:bro': 'full',
};

const STOP_PHRASES = ['stop gen z', 'normal mode'];

const rl = readline.createInterface({ input: process.stdin });
let data = '';

rl.on('line', line => { data += line; });
rl.on('close', () => {
  try {
    const input = JSON.parse(data);
    const prompt = (input.prompt || '').trim().toLowerCase();

    if (STOP_PHRASES.some(p => prompt === p)) {
      try { fs.unlinkSync(FLAG_FILE); } catch (_) {}
      return;
    }

    const modeEntries = Object.entries(MODE_MAP).sort((a, b) => b[0].length - a[0].length);
    for (const [cmd, mode] of modeEntries) {
      if (prompt === cmd || prompt.startsWith(cmd + ' ')) {
        try {
          fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
          fs.writeFileSync(FLAG_FILE, mode, 'utf8');
        } catch (_) {}
        return;
      }
    }
  } catch (_) {
    // silent fail
  }
});
