const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const json = file => JSON.parse(read(file));

test('SKILL.md frontmatter follows the Agent Skills spec', () => {
  const skill = read('skills/bro/SKILL.md');
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/)[1];
  const name = frontmatter.match(/^name: (.+)$/m)[1];
  assert.strictEqual(name, 'bro', 'name must match the skill directory');
  assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);

  const description = frontmatter
    .match(/^description: >\n((?: {2}.*\n?)+)/m)[1]
    .replace(/\s+/g, ' ')
    .trim();
  assert.ok(description.length > 0 && description.length <= 1024, `description is ${description.length} chars`);
  assert.doesNotMatch(description, /[<>]/);
  assert.match(frontmatter, new RegExp(`version: "${json('package.json').version}"`));
});

test('every hooks file points at scripts that exist', () => {
  const files = {
    'hooks/hooks.json': '${CLAUDE_PLUGIN_ROOT}',
    'hooks/hooks.codex.json': '${PLUGIN_ROOT}',
    'hooks/hooks.copilot.json': '$COPILOT_PLUGIN_ROOT',
  };
  for (const [file, rootVar] of Object.entries(files)) {
    const commands = JSON.stringify(json(file)).match(/sh \\"[^"]*?\\" [a-z-]+\.js [a-z]+/g);
    assert.strictEqual(commands.length, 2, file);
    for (const command of commands) {
      assert.ok(command.includes(rootVar), `${file} uses ${rootVar}`);
      const script = command.match(/ ([a-z-]+\.js) /)[1];
      assert.ok(fs.existsSync(path.join(root, 'hooks', script)), `${file} → ${script}`);
    }
  }
});

test('each harness manifest wires the right hooks file', () => {
  assert.strictEqual(json('.codex-plugin/plugin.json').hooks, './hooks/hooks.codex.json');
  assert.strictEqual(json('plugin.json').hooks, 'hooks/hooks.copilot.json');
  assert.strictEqual(json('.agents/plugins/marketplace.json').plugins[0].source.path, './');
  // Claude Code finds hooks/hooks.json on its own; declaring it too would load it twice
  assert.strictEqual(json('.claude-plugin/plugin.json').hooks, undefined);
  assert.ok(fs.existsSync(path.join(root, json('.cursor-plugin/plugin.json').rules)));
});
