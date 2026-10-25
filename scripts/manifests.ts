// Shared list of every manifest that carries the plugin version, plus helpers.
import { join } from "node:path";

export const ROOT = join(import.meta.dir, "..");

export const SKILL_SOURCE = "skills/bro/SKILL.md";
// Codex marketplace installs from plugins/gen-z-claude-bro, so it needs its own copy
export const SKILL_MIRRORS = ["plugins/gen-z-claude-bro/skills/bro/SKILL.md"];

type Json = Record<string, any>;

export interface Manifest {
  path: string;
  // Every place in the file that should hold the package version
  versions: (json: Json) => { get: () => unknown; set: (v: string) => void }[];
}

const field = (obj: Json | undefined, key: string) => ({
  get: () => obj?.[key],
  set: (v: string) => {
    if (obj) obj[key] = v;
  },
});

const self = (json: Json) => [field(json, "version")];
const plugins = (json: Json) => (json.plugins ?? []).map((p: Json) => field(p, "version"));

export const MANIFESTS: Manifest[] = [
  { path: "plugin.json", versions: self },
  { path: ".claude-plugin/plugin.json", versions: self },
  { path: ".claude-plugin/marketplace.json", versions: plugins },
  { path: ".codex-plugin/plugin.json", versions: self },
  { path: "plugins/gen-z-claude-bro/.codex-plugin/plugin.json", versions: self },
  { path: ".cursor-plugin/plugin.json", versions: self },
  { path: ".cursor-plugin/marketplace.json", versions: plugins },
  {
    path: ".github/plugin/marketplace.json",
    versions: (json) => [field(json.metadata, "version"), ...plugins(json)],
  },
  { path: "gemini-extension.json", versions: self },
];

// Manifests with no version field, validated for JSON syntax only
export const OTHER_JSON = [".agents/plugins/marketplace.json", "hooks/hooks.json"];

export async function readJson(path: string): Promise<Json> {
  return JSON.parse(await Bun.file(join(ROOT, path)).text());
}

export async function writeJson(path: string, json: Json) {
  await Bun.write(join(ROOT, path), JSON.stringify(json, null, 2) + "\n");
}

export async function packageVersion(): Promise<string> {
  return (await readJson("package.json")).version;
}
