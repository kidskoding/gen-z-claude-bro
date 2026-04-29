#!/usr/bin/env node
// UserPromptSubmit hook — tracks /gen-z mode changes and "stop gen z"

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const FLAG_FILE = path.join(os.homedir(), '.claude', '.gen-z-active');

const MODE_MAP = {
  '/bro': 'full',
  '/bro lite': 'lite',
  '/bro full': 'full',
  '/bro ultra': 'ultra',
  // namespaced form when installed as plugin
  '/gen-z-claude-bro:bro': 'full',
  '/gen-z-claude-bro:bro lite': 'lite',
  '/gen-z-claude-bro:bro full': 'full',
  '/gen-z-claude-bro:bro ultra': 'ultra',
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

    for (const [cmd, mode] of Object.entries(MODE_MAP)) {
      if (prompt === cmd || prompt.startsWith(cmd + ' ')) {
        try { fs.writeFileSync(FLAG_FILE, mode, 'utf8'); } catch (_) {}
        return;
      }
    }
  } catch (_) {
    // silent fail
  }
});
