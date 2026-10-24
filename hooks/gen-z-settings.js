#!/usr/bin/env node
// Adds or removes the Gen Z hooks and statusline in settings.json for manual (non-plugin) installs.
// Usage: node gen-z-settings.js install|uninstall <settings.json> <hooks dir>

const fs = require('fs');

const [action, settingsFile, hooksDir] = process.argv.slice(2);
const MARKER = 'gen-z-';

const ENTRIES = {
  SessionStart: `node "${hooksDir}/gen-z-activate.js"`,
  UserPromptSubmit: `node "${hooksDir}/gen-z-mode-tracker.js"`,
};

let settings = {};
if (fs.existsSync(settingsFile)) {
  settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  fs.copyFileSync(settingsFile, `${settingsFile}.bak`);
}
settings.hooks = settings.hooks || {};

const isOurs = cmd => typeof cmd === 'string' && cmd.includes(MARKER);

// drop any previous Gen Z entries first so installs are idempotent
for (const event of Object.keys(settings.hooks)) {
  settings.hooks[event] = (settings.hooks[event] || [])
    .map(group => ({ ...group, hooks: (group.hooks || []).filter(h => !isOurs(h.command)) }))
    .filter(group => group.hooks.length > 0 && !isOurs(group.command));
  if (settings.hooks[event].length === 0) delete settings.hooks[event];
}

let statusNote = '';
if (action === 'install') {
  for (const [event, command] of Object.entries(ENTRIES)) {
    settings.hooks[event] = settings.hooks[event] || [];
    settings.hooks[event].push({ hooks: [{ type: 'command', command, timeout: 10 }] });
  }
  if (!settings.statusLine) {
    settings.statusLine = { type: 'command', command: `bash "${hooksDir}/gen-z-statusline.sh"` };
    statusNote = 'statusline set to the [GEN-Z] badge';
  } else if (!isOurs(settings.statusLine.command)) {
    statusNote = 'kept your existing statusLine (see README to add the badge to it)';
  }
} else if (action === 'uninstall') {
  if (settings.statusLine && isOurs(settings.statusLine.command)) {
    delete settings.statusLine;
    statusNote = 'removed the [GEN-Z] statusline';
  }
} else {
  console.error('usage: gen-z-settings.js install|uninstall <settings.json> <hooks dir>');
  process.exit(2);
}

if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + '\n');
if (statusNote) console.log(`✓ ${statusNote}`);
