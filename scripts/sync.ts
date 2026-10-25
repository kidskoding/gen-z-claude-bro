// Propagates package.json's version into every plugin manifest and
// mirrors skills/bro/SKILL.md into the Codex plugin directory.
// Usage: bun run sync
import { join } from "node:path";
import { MANIFESTS, ROOT, SKILL_MIRRORS, SKILL_SOURCE, packageVersion, readJson, writeJson } from "./manifests";

const version = await packageVersion();

for (const manifest of MANIFESTS) {
  const json = await readJson(manifest.path);
  for (const slot of manifest.versions(json)) slot.set(version);
  await writeJson(manifest.path, json);
}

const skill = await Bun.file(join(ROOT, SKILL_SOURCE)).text();
for (const mirror of SKILL_MIRRORS) {
  await Bun.write(join(ROOT, mirror), skill);
}

console.log(`synced ${MANIFESTS.length} manifests to v${version} and ${SKILL_MIRRORS.length} skill mirror(s)`);
