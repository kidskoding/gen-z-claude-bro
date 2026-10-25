# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code skill plugin that makes Claude respond like a Gen Z person — slang-heavy, high energy, still technically accurate. Activated via `/bro` or natural-language triggers like "talk like a student" / "bro mode" / "speak casual".

## File structure

| File | What it controls |
|------|-----------------|
| `skills/bro/SKILL.md` | **Single source of truth** for all behavior: vocab map, intensity levels, auto-clarity rules, emoji guide. Edit only this file for behavior changes. |
| `hooks/hooks.json` | Plugin hook wiring (uses `${CLAUDE_PLUGIN_ROOT}`), auto-loaded by Claude Code plugin installs. |
| `hooks/run.sh` | Runtime launcher — runs a hook with `bun`, falls back to `node`, exits 0 if neither exists. |
| `hooks/gen-z-activate.js` | SessionStart hook — writes `~/.claude/.gen-z-active` flag, injects SKILL.md body as system context, nudges statusline setup if missing. |
| `hooks/gen-z-mode-tracker.js` | UserPromptSubmit hook — detects `/bro [lite|full|ultra]` and "stop gen z"/"normal mode", updates or deletes flag file. |
| `hooks/gen-z-statusline.sh` | Reads flag file, emits `[GEN-Z]` or `[GEN-Z:ULTRA]` badge for Claude Code statusline. |
| `hooks/install.sh` | Copies hooks to `~/.claude/hooks/`, prints settings.json snippet to paste. |
| `hooks/uninstall.sh` | Removes hook files and flag file. |
| `rules/gen-z-activate.md` | Always-on activation rule body for non-hook agents (Cursor, Copilot, etc.). |
| `package.json` | Bun tooling + **single source of truth for the version**. |
| `scripts/sync.ts` | `bun run sync` — copies the version into every manifest and mirrors SKILL.md to `plugins/gen-z-claude-bro/`. |
| `scripts/validate.ts` | `bun run validate` — checks manifests parse, versions agree, SKILL.md frontmatter is valid, mirrors are in sync. |
| `tests/` | `bun test` — spawns the hooks under both bun and node with a temp `HOME`. |

## Tooling

Use **bun**, not npm: `bun install`, `bun run check` (validate + typecheck + test). After editing `skills/bro/SKILL.md` or bumping `package.json` version, run `bun run sync`. CI fails if anything is out of sync.

Hooks are plain CommonJS so they run under bun or node. Don't use bun-only APIs in `hooks/`.

## Distribution

- skills.sh / Vercel skills CLI: `bunx skills add kidskoding/gen-z-claude-bro`. It discovers `skills/bro/SKILL.md`, and the frontmatter `name` must stay lowercase-hyphenated.
- Claude Code / Copilot / Cursor / Codex / Gemini: see the manifests listed in `scripts/manifests.ts`.

## Hook architecture

```
SessionStart hook ──writes "full"──▶ ~/.claude/.gen-z-active ◀──writes mode── UserPromptSubmit hook
                                               │
                                            reads
                                               ▼
                                      gen-z-statusline.sh
                                     [GEN-Z] / [GEN-Z:ULTRA] / ...
```

Hooks must **silent-fail on all filesystem errors** — a crash here blocks session start. Tests enforce exit 0 on malformed input.

## Intensity levels

Three levels defined in `skills/bro/SKILL.md`: `lite` (light slang, no emoji), `full` (default — full Gen Z, 1-2 emoji), `ultra` (maximum chaos). Persists until changed or session ends.

## Slash command

`/bro` — activates or switches intensity (`/bro lite|full|ultra`). Natural language also triggers: "talk like a student", "bro mode", "speak casual", "use slang", "be my friend". Off with "stop gen z" or "normal mode".

## settings.json wiring (manual install only — plugin installs use hooks/hooks.json)

```json
{
  "hooks": {
    "SessionStart": [
      {"hooks": [{"type": "command", "command": "bash ~/.claude/hooks/gen-z-run.sh ~/.claude/hooks/gen-z-activate.js"}]}
    ],
    "UserPromptSubmit": [
      {"hooks": [{"type": "command", "command": "bash ~/.claude/hooks/gen-z-run.sh ~/.claude/hooks/gen-z-mode-tracker.js"}]}
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/hooks/gen-z-statusline.sh"
  }
}
```
