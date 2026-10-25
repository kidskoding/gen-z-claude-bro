# Changelog

## 0.2.0

- Install via the Vercel skills CLI / [skills.sh](https://skills.sh): `bunx skills add kidskoding/gen-z-claude-bro`.
- Claude Code plugin now ships `hooks/hooks.json`, so the SessionStart and `/bro` tracker hooks are wired automatically.
- Hooks run on Bun when available and fall back to Node (`hooks/run.sh`). They never block a session if neither is installed.
- Fixed the `settings.json` snippet printed by `install.sh`, which used an invalid hook format.
- Fixed the statusline nudge, which printed invalid JSON.
- The mode tracker now reads stdin robustly and accepts trailing punctuation ("normal mode.").
- Frontmatter stripping now handles CRLF line endings.
- The Gemini extension now imports `SKILL.md` instead of only referencing it.
- Bun tooling: `bun run sync` (version + skill mirror), `bun run validate`, `bun test`, and CI on Ubuntu and macOS.

## 0.1.0

- Initial release: `/bro` skill with lite / full / ultra intensity, plus Claude Code, Codex, Cursor, Copilot and Gemini manifests.
