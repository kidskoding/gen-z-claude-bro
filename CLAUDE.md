# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A cross-harness plugin (Claude Code, Codex, Copilot CLI, Cursor, Gemini CLI, skills.sh) that makes coding agents respond like a Gen Z person — slang-heavy, high energy, still technically accurate. Activated via `/bro` or natural-language triggers like "talk like a student" / "bro mode" / "speak casual".

## File structure

| File | What it controls |
|------|-----------------|
| `skills/bro/SKILL.md` | **Single source of truth** for all behavior: vocab map, intensity levels, auto-clarity rules, emoji guide. Edit only this file for behavior changes, then `bun run sync`. |
| `hooks/hooks.json` | Wires the hooks into Claude Code when installed as a plugin (`${CLAUDE_PLUGIN_ROOT}` paths). Auto-discovered; don't also declare it in `.claude-plugin/plugin.json`. |
| `hooks/hooks.codex.json` | Same hooks for Codex (`${PLUGIN_ROOT}`), declared in `.codex-plugin/plugin.json`. |
| `hooks/hooks.copilot.json` | Same hooks for Copilot CLI (`$COPILOT_PLUGIN_ROOT`), declared in root `plugin.json`. |
| `hooks/run.sh` | Runs a hook on `node`, else `bun`, else exits 0 silently. Each hooks file passes the harness name (`claude`/`codex`/`copilot`) as the last arg. |
| `hooks/gen-z-state.js` | Shared helpers: harness from argv, per-session mode files, stdin JSON, skill loading, hook JSON output (Copilot also gets top-level `additionalContext`). |
| `hooks/gen-z-activate.js` | SessionStart hook — picks the session's mode (resume/compact keep it, startup/clear reset to `GEN_Z_DEFAULT_MODE` or `full`), injects SKILL.md as `additionalContext`, copies the statusline to a stable path, shows a one-time statusline tip as `systemMessage` (statusline bits are Claude Code only). Also parses Copilot's `initial_prompt`, since Copilot fires no UserPromptSubmit for the first prompt. |
| `hooks/gen-z-mode-tracker.js` | UserPromptSubmit hook — parses `/bro [lite|full|ultra|off]` (also `$bro` for Codex), "gen z mode ultra", "stop gen z", "normal mode"; saves the mode and tells the model via `additionalContext`. |
| `hooks/gen-z-statusline.sh` | Reads `session_id` from stdin, prints a colored `[GEN-Z]` / `[GEN-Z:LITE]` / `[GEN-Z:ULTRA]` badge (`GEN_Z_STATUSLINE_COLOR=0` for plain). |
| `hooks/gen-z-settings.js` | Idempotently adds/removes the hooks and statusline in `settings.json` for manual installs. |
| `hooks/install.sh` / `uninstall.sh` | Manual (non-plugin) install into `~/.claude/` and its reversal. |
| `rules/gen-z-activate.md` | Always-on activation rule body for non-hook agents (Cursor, Copilot, Windsurf, Cline, `AGENTS.md`). |
| `rules/gen-z.mdc` | Cursor plugin rule (`alwaysApply: true`). Generated from `gen-z-activate.md` by `bun run sync`; never edit by hand. |
| `GEMINI.md` | Gemini CLI context; imports the skill with `@./skills/bro/SKILL.md`. |
| `scripts/sync.js` | Stamps `package.json`'s version on all manifests and SKILL.md `metadata.version`, regenerates `rules/gen-z.mdc`. `--check` fails on drift (CI). |
| `test/hooks.test.js` | `node:test` suite running the real hooks (node, bun, and via `run.sh` per harness) against temp dirs. |
| `test/manifests.test.js` | Agent Skills frontmatter rules (skills.sh), hooks files → existing scripts, manifests → right hooks file. |
| `assets/icon.png` | 512px plugin icon. |

## Hook architecture

```
SessionStart ──writes mode──▶ ~/.claude/gen-z-claude-bro/sessions/<session_id> ◀──writes mode── UserPromptSubmit
                                               │
                                       reads (session_id from stdin)
                                               ▼
                                      gen-z-statusline.sh
                                 [GEN-Z] / [GEN-Z:LITE] / [GEN-Z:ULTRA]
```

Codex and Copilot CLI store sessions in their plugin data dir (`PLUGIN_DATA` / `COPILOT_PLUGIN_DATA`) instead. State is per session, so "stop gen z" in one terminal doesn't touch the others. Session files older than 7 days are pruned at session start. `~/.claude/.gen-z-active` is still written as a legacy fallback for old statusline setups. All paths honor `CLAUDE_CONFIG_DIR`.

Hooks must **silent-fail on all filesystem errors** — a crash here blocks session start. Keep `require.main === module` guards so tests can import parsers.

Codex trusts hooks by a hash of their command string, event and position. Changing a command in `hooks/hooks.codex.json` makes every Codex user re-trust it, so only do it on purpose.

## Intensity levels

Three levels defined in `skills/bro/SKILL.md`: `lite` (light slang, no emoji), `full` (default — full Gen Z, 1-2 emoji), `ultra` (maximum chaos). Plus `off`. Persists for the session until changed.

## Slash command

`/bro` (`/gen-z-claude-bro:bro` as a plugin) — activates or switches intensity (`/bro lite|full|ultra|off`). Natural language also triggers: "talk like a student", "bro mode", "speak casual", "use slang", "be my friend". Off with "stop gen z" or "normal mode".

## Development

```sh
bun run sync          # after editing SKILL.md, rules/gen-z-activate.md or the version in package.json
bun run test          # sync --check + tests (CI also runs them on node, plus skills.sh and Gemini validation)
bun run skills:list   # what `npx skills add` finds
claude plugin validate .
```

Release: bump `version` in `package.json`, `bun run sync`, add a `CHANGELOG.md` entry.

## Manual settings.json wiring

`hooks/install.sh` writes this for you:

```json
{
  "hooks": {
    "SessionStart": [
      {"hooks": [{"type": "command", "command": "sh \"$HOME/.claude/hooks/gen-z-run.sh\" gen-z-activate.js"}]}
    ],
    "UserPromptSubmit": [
      {"hooks": [{"type": "command", "command": "sh \"$HOME/.claude/hooks/gen-z-run.sh\" gen-z-mode-tracker.js"}]}
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "bash \"$HOME/.claude/hooks/gen-z-statusline.sh\""
  }
}
```
