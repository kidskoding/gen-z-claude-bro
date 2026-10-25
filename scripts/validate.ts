// Checks that the plugin is publishable: manifests parse, versions agree,
// the skill frontmatter is valid for the skills CLI, and mirrors are in sync.
// Usage: bun run validate
import { existsSync } from "node:fs";
import { join } from "node:path";
import { MANIFESTS, OTHER_JSON, ROOT, SKILL_MIRRORS, SKILL_SOURCE, packageVersion, readJson } from "./manifests";

const errors: string[] = [];
const version = await packageVersion();

for (const manifest of MANIFESTS) {
  try {
    const json = await readJson(manifest.path);
    const slots = manifest.versions(json);
    if (slots.length === 0) errors.push(`${manifest.path}: no version field found`);
    for (const slot of slots) {
      if (slot.get() !== version) {
        errors.push(`${manifest.path}: version ${slot.get()} != package.json ${version} (run \`bun run sync\`)`);
      }
    }
  } catch (err) {
    errors.push(`${manifest.path}: ${(err as Error).message}`);
  }
}

for (const path of OTHER_JSON) {
  try {
    await readJson(path);
  } catch (err) {
    errors.push(`${path}: ${(err as Error).message}`);
  }
}

// Every script referenced from hooks.json must exist
const hooksJson = await Bun.file(join(ROOT, "hooks/hooks.json")).text();
for (const [, rel] of hooksJson.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)) {
  if (!existsSync(join(ROOT, rel))) errors.push(`hooks/hooks.json: missing ${rel}`);
}

const skill = await Bun.file(join(ROOT, SKILL_SOURCE)).text();
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
if (!frontmatter) {
  errors.push(`${SKILL_SOURCE}: missing YAML frontmatter`);
} else {
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  if (!name) errors.push(`${SKILL_SOURCE}: frontmatter needs a name`);
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) errors.push(`${SKILL_SOURCE}: name "${name}" must be lowercase-hyphenated`);
  if (!/^description:/m.test(frontmatter)) errors.push(`${SKILL_SOURCE}: frontmatter needs a description`);
}

for (const mirror of SKILL_MIRRORS) {
  const copy = await Bun.file(join(ROOT, mirror)).text().catch(() => "");
  if (copy !== skill) errors.push(`${mirror}: out of sync with ${SKILL_SOURCE} (run \`bun run sync\`)`);
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ v${version}: ${MANIFESTS.length + OTHER_JSON.length} manifests valid, skill + mirrors in sync`);
