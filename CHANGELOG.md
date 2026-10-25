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
- Plugin icon, `bun test` suite, CI, and `bun run sync` to keep all nine manifests and the Codex copy of the skill on one version.

## 0.1.0

- Initial release: `bro` skill with lite / full / ultra intensity, Claude Code, Codex, Cursor, Copilot CLI and Gemini CLI manifests.
