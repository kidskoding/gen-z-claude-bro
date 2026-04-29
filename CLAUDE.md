# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Claude Code skill plugin that makes Claude respond like a Gen Z person — slang-heavy, high energy, still technically accurate. Activated via `/bro` or natural-language triggers like "talk like a student" / "bro mode" / "speak casual".

## File structure

| File | What it controls |
|------|-----------------|
| `skills/gen-z/SKILL.md` | **Single source of truth** for all behavior: vocab map, intensity levels, auto-clarity rules, emoji guide. Edit only this file for behavior changes. |
| `hooks/gen-z-activate.js` | SessionStart hook — writes `~/.claude/.gen-z-active` flag, injects SKILL.md body as system context, nudges statusline setup if missing. |
| `hooks/gen-z-mode-tracker.js` | UserPromptSubmit hook — detects `/bro [lite|full|ultra]` and "stop gen z"/"normal mode", updates or deletes flag file. |
| `hooks/gen-z-statusline.sh` | Reads flag file, emits `[GEN-Z]` or `[GEN-Z:ULTRA]` badge for Claude Code statusline. |
| `hooks/install.sh` | Copies hooks to `~/.claude/hooks/`, prints settings.json snippet to paste. |
| `hooks/uninstall.sh` | Removes hook files and flag file. |
| `rules/gen-z-activate.md` | Always-on activation rule body for non-hook agents (Cursor, Copilot, etc.). |

## Hook architecture

```
SessionStart hook ──writes "full"──▶ ~/.claude/.gen-z-active ◀──writes mode── UserPromptSubmit hook
                                               │
                                            reads
                                               ▼
                                      gen-z-statusline.sh
                                     [GEN-Z] / [GEN-Z:ULTRA] / ...
```

Hooks must **silent-fail on all filesystem errors** — a crash here blocks session start.

## Intensity levels

Three levels defined in `skills/gen-z/SKILL.md`: `lite` (light slang, no emoji), `full` (default — full Gen Z, 1-2 emoji), `ultra` (maximum chaos). Persists until changed or session ends.

## Slash command

`/bro` — activates or switches intensity (`/bro lite|full|ultra`). Natural language also triggers: "talk like a student", "bro mode", "speak casual", "use slang", "be my friend". Off with "stop gen z" or "normal mode".

## settings.json wiring

```json
{
  "hooks": {
    "SessionStart": [
      {"command": "node ~/.claude/hooks/gen-z-activate.js"}
    ],
    "UserPromptSubmit": [
      {"command": "node ~/.claude/hooks/gen-z-mode-tracker.js"}
    ]
  },
  "statusLine": {
    "type": "command",
    "command": "bash ~/.claude/hooks/gen-z-statusline.sh"
  }
}
```
