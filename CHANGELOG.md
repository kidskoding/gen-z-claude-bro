# Changelog

## 0.2.0

- **Claude Code plugin now ships its hooks** (`hooks/hooks.json`): Gen Z mode turns on at session start and `/bro` / "stop gen z" actually switch modes. Before, the plugin installed only the skill.
- **Per-session mode.** "stop gen z" in one terminal no longer turns it off in your other sessions. Resuming a session keeps its mode; new sessions start fresh in `full`.
- Hooks tell the model when you switch intensity or turn it off, instead of hoping it notices.
- `/bro off` plus natural switches: "gen z mode ultra", "bro mode", "normal mode".
- `GEN_Z_DEFAULT_MODE` env var (`lite` | `full` | `ultra` | `off`) sets the starting intensity.
- Colored statusline badge that follows the current session, installed at a stable path that survives plugin updates. The setup tip shows once, to you, not the model.
- `hooks/install.sh` now patches `settings.json` itself (idempotent, with a `.bak`), and `uninstall.sh` reverses it. The old snippet used a hook format Claude Code no longer accepts.
- Gemini CLI imports the skill directly via `GEMINI.md`.
- **Works across harnesses, verified in each.** Codex and GitHub Copilot CLI plugins now ship the same hooks as Claude Code, so they start every session in Gen Z mode too (Codex asks you to trust the hooks once). Cursor's plugin adds an always-apply rule. Codex installs from the repo root; the `plugins/gen-z-claude-bro` copy is gone.
- **Installable from [skills.sh](https://skills.sh):** `npx skills add kidskoding/gen-z-claude-bro` (or `bunx`). SKILL.md frontmatter now follows the Agent Skills spec, with `license` and `metadata.version`.
- **Hooks run on node or bun**, whichever is installed, and skip quietly with neither (Claude Code's native installer ships no JS runtime).
- `$bro` switches intensity in Codex; Copilot's `copilot -p "/bro ultra"` works because the first prompt is read at session start.
- Plugin icon, `bun test` suite (also run on node in CI), skills.sh and Gemini extension checks in CI, and `bun run sync` to keep every manifest on one version.

## 0.1.0

- Initial release: `bro` skill with lite / full / ultra intensity, Claude Code, Codex, Cursor, Copilot CLI and Gemini CLI manifests.
