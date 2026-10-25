const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseMode } = require('../hooks/gen-z-mode-tracker');

const hooks = path.join(__dirname, '..', 'hooks');

function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-z-'));
  const run = (file, input, extraEnv = {}) => {
    const cmd = file.endsWith('.sh') ? 'bash' : 'node';
    const res = spawnSync(cmd, [path.join(hooks, file)], {
      input: JSON.stringify(input),
      env: { ...process.env, CLAUDE_CONFIG_DIR: dir, GEN_Z_DEFAULT_MODE: '', ...extraEnv },
      encoding: 'utf8',
    });
    assert.strictEqual(res.status, 0, res.stderr);
    return res.stdout;
  };
  const mode = id => fs.readFileSync(path.join(dir, 'gen-z-claude-bro', 'sessions', id), 'utf8');
  return { dir, run, mode };
}

test('parseMode recognizes commands and phrases', () => {
  assert.strictEqual(parseMode('/bro'), 'full');
  assert.strictEqual(parseMode('/bro ultra'), 'ultra');
  assert.strictEqual(parseMode('/gen-z-claude-bro:bro lite'), 'lite');
  assert.strictEqual(parseMode('/bro off'), 'off');
  assert.strictEqual(parseMode('Stop Gen Z!'), 'off');
  assert.strictEqual(parseMode('normal mode'), 'off');
  assert.strictEqual(parseMode('gen z mode ultra'), 'ultra');
  assert.strictEqual(parseMode('bro mode'), 'full');
  assert.strictEqual(parseMode('what does normal mode mean in vim'), null);
  assert.strictEqual(parseMode('/brother'), null);
});

test('SessionStart injects the skill at full intensity', () => {
  const { run, mode } = sandbox();
  const out = JSON.parse(run('gen-z-activate.js', { session_id: 's1', source: 'startup' }));
  assert.strictEqual(out.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(out.hookSpecificOutput.additionalContext, /understood the assignment/);
  assert.match(out.hookSpecificOutput.additionalContext, /\*\*full\*\* intensity/);
  assert.doesNotMatch(out.hookSpecificOutput.additionalContext, /^---/);
  assert.match(out.systemMessage, /statusLine/);
  assert.strictEqual(mode('s1'), 'full');
});

test('statusline nudge shows only once', () => {
  const { run } = sandbox();
  run('gen-z-activate.js', { session_id: 'a', source: 'startup' });
  const out = JSON.parse(run('gen-z-activate.js', { session_id: 'b', source: 'startup' }));
  assert.strictEqual(out.systemMessage, undefined);
});

test('stop gen z is per session and survives resume, not a new session', () => {
  const { run, mode } = sandbox();
  run('gen-z-activate.js', { session_id: 'one', source: 'startup' });
  run('gen-z-activate.js', { session_id: 'two', source: 'startup' });

  const off = JSON.parse(run('gen-z-mode-tracker.js', { session_id: 'one', prompt: 'stop gen z' }));
  assert.match(off.hookSpecificOutput.additionalContext, /OFF/);
  assert.strictEqual(mode('one'), 'off');
  assert.strictEqual(mode('two'), 'full');

  assert.strictEqual(run('gen-z-activate.js', { session_id: 'one', source: 'resume' }), '');
  assert.strictEqual(mode('one'), 'off');

  run('gen-z-activate.js', { session_id: 'three', source: 'startup' });
  assert.strictEqual(mode('three'), 'full');
});

test('turning back on re-sends the rules; switching levels sends a short note', () => {
  const { run, mode } = sandbox();
  run('gen-z-mode-tracker.js', { session_id: 's', prompt: 'normal mode' });
  const on = JSON.parse(run('gen-z-mode-tracker.js', { session_id: 's', prompt: '/bro lite' }));
  assert.match(on.hookSpecificOutput.additionalContext, /Core Vocab/);
  assert.strictEqual(mode('s'), 'lite');

  const ultra = JSON.parse(run('gen-z-mode-tracker.js', { session_id: 's', prompt: '/bro ultra' }));
  assert.doesNotMatch(ultra.hookSpecificOutput.additionalContext, /Core Vocab/);
  assert.match(ultra.hookSpecificOutput.additionalContext, /ultra/);
});

test('unrelated prompts produce no output', () => {
  const { run } = sandbox();
  assert.strictEqual(run('gen-z-mode-tracker.js', { session_id: 's', prompt: 'fix my build' }), '');
});

test('GEN_Z_DEFAULT_MODE sets the starting intensity', () => {
  const { run, mode } = sandbox();
  run('gen-z-activate.js', { session_id: 's', source: 'startup' }, { GEN_Z_DEFAULT_MODE: 'lite' });
  assert.strictEqual(mode('s'), 'lite');
});

test('hooks never fail on garbage input', () => {
  const { dir } = sandbox();
  for (const file of ['gen-z-activate.js', 'gen-z-mode-tracker.js']) {
    const res = spawnSync('node', [path.join(hooks, file)], {
      input: 'not json',
      env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    });
    assert.strictEqual(res.status, 0);
  }
});

test('statusline badge follows the session', () => {
  const { run } = sandbox();
  run('gen-z-activate.js', { session_id: 's', source: 'startup' });
  const plain = { GEN_Z_STATUSLINE_COLOR: '0' };
  assert.strictEqual(run('gen-z-statusline.sh', { session_id: 's' }, plain), '[GEN-Z]');
  run('gen-z-mode-tracker.js', { session_id: 's', prompt: '/bro ultra' });
  assert.strictEqual(run('gen-z-statusline.sh', { session_id: 's' }, plain), '[GEN-Z:ULTRA]');
  assert.match(run('gen-z-statusline.sh', { session_id: 's' }), /\x1b\[1;35m\[GEN-Z:ULTRA\]\x1b\[0m/);
  run('gen-z-mode-tracker.js', { session_id: 's', prompt: 'stop gen z' });
  assert.strictEqual(run('gen-z-statusline.sh', { session_id: 's' }, plain), '');
});

test('settings patcher is idempotent and reversible', () => {
  const { dir } = sandbox();
  const file = path.join(dir, 'settings.json');
  const existing = {
    model: 'opus',
    hooks: {
      SessionStart: [{ hooks: [{ type: 'command', command: 'echo hi' }] }],
      UserPromptSubmit: [{ command: 'node ~/.claude/hooks/gen-z-mode-tracker.js' }],
    },
  };
  fs.writeFileSync(file, JSON.stringify(existing));
  const patch = action => spawnSync('node', [path.join(hooks, 'gen-z-settings.js'), action, file, '/h']);

  patch('install');
  patch('install');
  const installed = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.strictEqual(installed.hooks.SessionStart.length, 2);
  assert.strictEqual(installed.hooks.UserPromptSubmit.length, 1);
  assert.match(installed.statusLine.command, /gen-z-statusline/);

  patch('uninstall');
  const removed = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepStrictEqual(removed, {
    model: 'opus',
    hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'echo hi' }] }] },
  });
});

function runner(file, input, env, args = []) {
  return spawnSync('sh', [path.join(hooks, 'run.sh'), file, ...args], {
    input: JSON.stringify(input),
    env: { ...process.env, GEN_Z_DEFAULT_MODE: '', ...env },
    encoding: 'utf8',
  });
}

test('run.sh passes the harness through and exits silently with no JS runtime', () => {
  const { dir, mode } = sandbox();
  const res = runner('gen-z-activate.js', { session_id: 'r', source: 'startup' }, { CLAUDE_CONFIG_DIR: dir }, ['claude']);
  assert.strictEqual(res.status, 0, res.stderr);
  assert.match(res.stdout, /hookSpecificOutput/);
  assert.strictEqual(mode('r'), 'full');

  // a PATH with only the shell tools run.sh needs, so neither node nor bun is found
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-z-bin-'));
  for (const tool of ['sh', 'dirname', 'cat']) {
    const found = spawnSync('sh', ['-c', `command -v ${tool}`], { encoding: 'utf8' }).stdout.trim();
    fs.symlinkSync(found, path.join(bin, tool));
  }
  const bare = runner('gen-z-activate.js', { session_id: 'r' }, { CLAUDE_CONFIG_DIR: dir, PATH: bin });
  assert.strictEqual(bare.status, 0, bare.stderr);
  assert.strictEqual(bare.stdout + bare.stderr, '');
});

test('hooks also run on bun', { skip: !spawnSync('sh', ['-c', 'command -v bun']).stdout.length }, () => {
  const { dir, mode } = sandbox();
  const res = spawnSync('bun', [path.join(hooks, 'gen-z-mode-tracker.js')], {
    input: JSON.stringify({ session_id: 'b', prompt: '/bro ultra' }),
    env: { ...process.env, CLAUDE_CONFIG_DIR: dir },
    encoding: 'utf8',
  });
  assert.strictEqual(res.status, 0, res.stderr);
  assert.match(JSON.parse(res.stdout).hookSpecificOutput.additionalContext, /ultra/);
  assert.strictEqual(mode('b'), 'ultra');
});

test('Codex keeps state in PLUGIN_DATA and skips the Claude statusline', () => {
  const { dir } = sandbox();
  const data = path.join(dir, 'codex-data');
  const env = { CLAUDE_CONFIG_DIR: dir, PLUGIN_DATA: data };
  const out = JSON.parse(runner('gen-z-activate.js', { session_id: 'c', source: 'startup' }, env, ['codex']).stdout);
  assert.strictEqual(out.systemMessage, undefined);
  assert.match(out.hookSpecificOutput.additionalContext, /\*\*full\*\* intensity/);

  runner('gen-z-mode-tracker.js', { session_id: 'c', prompt: '$bro lite' }, env, ['codex']);
  assert.strictEqual(fs.readFileSync(path.join(data, 'sessions', 'c'), 'utf8'), 'lite');
  assert.deepStrictEqual(fs.readdirSync(dir).sort(), ['codex-data']);
});

test('Copilot gets top-level additionalContext and its first prompt can set the mode', () => {
  const { dir } = sandbox();
  const data = path.join(dir, 'copilot-data');
  const input = { session_id: 'p', source: 'new', initial_prompt: 'gen z mode ultra' };
  const res = runner('gen-z-activate.js', input, { CLAUDE_CONFIG_DIR: dir, COPILOT_PLUGIN_DATA: data }, ['copilot']);
  const out = JSON.parse(res.stdout);
  assert.match(out.additionalContext, /\*\*ultra\*\* intensity/);
  assert.strictEqual(fs.readFileSync(path.join(data, 'sessions', 'p'), 'utf8'), 'ultra');
});
