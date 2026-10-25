#!/usr/bin/env node
// Keeps every harness manifest and generated file in sync with the sources of truth:
//   version → package.json, Cursor rule → rules/gen-z-activate.md
// `bun scripts/sync.js` rewrites drifted files; `--check` only reports them and exits 1.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const check = process.argv.includes('--check');
const version = readJson('package.json').version;
const drifted = [];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function write(file, expected) {
  const full = path.join(root, file);
  const actual = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
  if (actual === expected) return;
  drifted.push(file);
  if (!check) {
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, expected);
  }
}

function setVersions(file, paths) {
  const json = readJson(file);
  for (const keys of paths) {
    let obj = json;
    for (const key of keys.slice(0, -1)) obj = obj[key];
    obj[keys[keys.length - 1]] = version;
  }
  write(file, JSON.stringify(json, null, 2) + '\n');
}

const top = [['version']];
const firstPlugin = [['plugins', 0, 'version']];
setVersions('plugin.json', top);
setVersions('gemini-extension.json', top);
setVersions('.claude-plugin/plugin.json', top);
setVersions('.claude-plugin/marketplace.json', firstPlugin);
setVersions('.codex-plugin/plugin.json', top);
setVersions('.cursor-plugin/plugin.json', top);
setVersions('.cursor-plugin/marketplace.json', firstPlugin);
setVersions('.github/plugin/marketplace.json', [['metadata', 'version'], ...firstPlugin]);

// skills.sh and other Agent Skills tools read the version from the skill's own metadata
const skillFile = 'skills/bro/SKILL.md';
const skill = fs.readFileSync(path.join(root, skillFile), 'utf8');
write(skillFile, skill.replace(/^(  version: ).*$/m, `$1"${version}"`));

// Cursor plugins load rules as .mdc; alwaysApply keeps the vibe on without the skill being picked
const rule = fs.readFileSync(path.join(root, 'rules/gen-z-activate.md'), 'utf8');
write(
  'rules/gen-z.mdc',
  `---\ndescription: Gen Z communication mode (gen-z-claude-bro). Generated from rules/gen-z-activate.md by \`bun run sync\`.\nalwaysApply: true\n---\n\n${rule}`
);

if (drifted.length === 0) {
  console.log(`✓ everything in sync at v${version}`);
} else if (check) {
  console.error(`✗ out of sync with v${version} (run \`bun run sync\`):\n  ${drifted.join('\n  ')}`);
  process.exit(1);
} else {
  console.log(`✓ synced to v${version}:\n  ${drifted.join('\n  ')}`);
}
