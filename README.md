<p align="center"><img src="assets/icon.png" width="128" alt="gen z claude bro icon"></p>

<h1 align="center">gen z claude bro</h1>

<p align="center"><b>your AI coding assistant but make it gen z</b></p>

<p align="center">
  <a href="https://github.com/kidskoding/gen-z-claude-bro/actions/workflows/ci.yml"><img src="https://github.com/kidskoding/gen-z-claude-bro/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/github/package-json/v/kidskoding/gen-z-claude-bro?color=22C55E" alt="version">
  <a href="https://skills.sh/kidskoding/gen-z-claude-bro"><img src="https://img.shields.io/badge/skills.sh-bro-000" alt="skills.sh"></a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license">
</p>

Makes your coding agent talk like a Gen Z person — slang-heavy, high energy, still technically accurate no cap. Your code, commits and PRs stay normal; only the chat gets the vibe. Works with Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf, Cline, and any agent that takes a system prompt.

- **On by default.** Every new session starts in Gen Z mode. No setup prompt to remember.
- **Three intensities.** `lite` for work chats, `full` for daily driving, `ultra` for chaos.
- **Knows when to chill.** Security warnings and destructive-action confirmations drop the slang so nothing gets misread.
- **Per-session.** "stop gen z" turns it off in that session only; your other terminals keep their vibe.
- **Statusline badge** (Claude Code): `[GEN-Z]`, `[GEN-Z:LITE]`, `[GEN-Z:ULTRA]`.
- **Every major harness.** Native plugins for Claude Code, Codex, Copilot CLI, Cursor and Gemini CLI, plus [skills.sh](https://skills.sh/kidskoding/gen-z-claude-bro) for the other 40+ agents.

---

## Before / After

<table>
<tr>
<td width="50%">

### 🤖 Normal Claude

> "The reason your React component is re-rendering is likely because you're creating a new object reference on each render cycle. When you pass an inline object as a prop, React's shallow comparison sees it as a different object every time, which triggers a re-render. I'd recommend using `useMemo` to memoize the object."

</td>
<td width="50%">

### 🔥 Gen Z Claude

> "ok so here's the tea 🍵 — new object ref every render, that's literally the red flag. inline object prop = new ref = re-render city. wrap it in `useMemo`, that's the move fr fr."

</td>
</tr>
<tr>
<td>

### 🤖 Normal Claude

> "The issue is in your auth middleware. The token expiry check is using the wrong operator, which means expired tokens are being accepted."

</td>
<td>

### 🔥 Gen Z Claude

> "bro your auth middleware did NOT understand the assignment 💀 token expiry check is using `<` not `<=` — that's the ick. fix:"

</td>
</tr>
</table>

---

## Intensity levels

| Level | Vibe |
|-------|------|
| lite | Light slang sprinkle. One or two "ngl"s. No emoji. Still readable in a professional context. |
| full (default) | Full Gen Z energy. Slang flows naturally. 1-2 emoji per response. fr fr. |
| ultra | MAXIMUM CHAOS. Heavy emoji. Every sentence is a moment. |

### Example — "Explain connection pooling"

**lite:** "Connection pooling reuses open connections ngl instead of spinning up new ones per request. Lowkey skips the whole handshake overhead."

**full:** "ok so connection pooling is literally just reusing open DB connections fr fr — no new connection per request bro. skips the handshake overhead. it's giving performance main character energy no cap."

**ultra:** "POOL = reuse open connections NO CAP 💀. new connection per req? that's the ick. skip handshake → fast af periodt. pool understood the assignment bro. ✨"

---

## Install

Pick your harness. Using more than one? Install it in each.

| Harness | Install | Always on | Switch intensity |
|---|---|---|---|
| [Claude Code](#claude-code) | plugin | ✅ hooks | `/gen-z-claude-bro:bro ultra` |
| [Codex](#codex) | plugin | ✅ hooks (trust once) | `$bro ultra` |
| [GitHub Copilot CLI](#github-copilot-cli) | plugin | ✅ hooks | `/bro ultra` |
| [Cursor](#cursor) | plugin | ✅ rule | "gen z mode ultra" |
| [Gemini CLI](#gemini-cli) | extension | ✅ context file | "gen z mode ultra" |
| [Any agent via skills.sh](#any-agent-skillssh) | `npx skills add` | on trigger ¹ | "gen z mode ultra" |
| [Windsurf, Cline, Copilot in VS Code](#rules-files) | rules file | ✅ rule | "gen z mode ultra" |

¹ Skills load when the agent picks them. For always-on, also paste [`rules/gen-z-activate.md`](rules/gen-z-activate.md) into your `AGENTS.md`.

The hooks run on `node` or `bun`, whichever is on your `PATH`. With neither, they skip quietly and the skill still works.

### Any agent (skills.sh)

Installs the `bro` skill into OpenCode, Codex, Cursor, Claude Code, Gemini CLI, Windsurf, Cline and every other agent the [skills CLI](https://skills.sh) supports:

```sh
npx skills add kidskoding/gen-z-claude-bro
# or with bun
bunx skills add kidskoding/gen-z-claude-bro
```

Add `-g` to install for your user instead of the current project, or `-a opencode` to target one agent. Update with `npx skills update`. This installs the skill only; the native plugins below add the hooks that turn it on automatically.

### Claude Code

```
/plugin marketplace add kidskoding/gen-z-claude-bro
/plugin install gen-z-claude-bro@gen-z-claude-bro
```

Restart Claude Code and you're in — the next session starts in Gen Z mode.

| What you type | What happens |
|---|---|
| `/gen-z-claude-bro:bro` or "bro mode" | Full Gen Z mode |
| `/gen-z-claude-bro:bro lite` or "gen z mode lite" | Light slang, no emoji |
| `/gen-z-claude-bro:bro ultra` or "gen z mode ultra" | Maximum chaos |
| `/gen-z-claude-bro:bro off`, "stop gen z" or "normal mode" | Off for this session |

#### Statusline badge

Plugins can't set your statusline, so the first session shows a one-time tip. Add this to `~/.claude/settings.json`:

```json
"statusLine": {
  "type": "command",
  "command": "bash ~/.claude/gen-z-claude-bro/statusline.sh"
}
```

Already have a statusline? Pipe the session JSON through the badge script and append its output to yours; `GEN_Z_STATUSLINE_COLOR=0` prints it without color:

```bash
input=$(cat)
badge=$(printf '%s' "$input" | bash ~/.claude/gen-z-claude-bro/statusline.sh)
echo "$(your-statusline <<<"$input") $badge"
```

#### Default intensity

Set `GEN_Z_DEFAULT_MODE` to `lite`, `full` (default), `ultra` or `off` in your shell or in the `env` block of `settings.json`. With `off`, the plugin stays dormant until you type `/gen-z-claude-bro:bro`.

#### Without the plugin system

```
git clone https://github.com/kidskoding/gen-z-claude-bro.git
bash gen-z-claude-bro/hooks/install.sh
```

This copies the hooks and skill into `~/.claude/`, adds them to `settings.json` (backup at `settings.json.bak`) and sets the statusline if you don't have one. Commands are `/bro`, `/bro lite`, and so on. `hooks/uninstall.sh` reverses all of it.

---

### Codex

```sh
codex plugin marketplace add kidskoding/gen-z-claude-bro
codex plugin add gen-z-claude-bro@gen-z-claude-bro
```

In the Codex app or TUI you can instead open `/plugins`, add the marketplace `kidskoding/gen-z-claude-bro` and install `gen-z-claude-bro`.

The plugin ships two hooks. Codex runs a plugin's hooks only after you trust them, so the next session asks once: pick **Trust all and continue**, or review them in `/hooks`. Until then the skill still works when you ask for it.

| What you type | What happens |
|---|---|
| New session | Gen Z mode, `full` intensity |
| `$bro lite` or "gen z mode lite" | Light slang, no emoji |
| `$bro ultra` or "gen z mode ultra" | Maximum chaos |
| `$bro off`, "stop gen z" or "normal mode" | Off for this session |

### Cursor

Add the plugin from Cursor Agent chat:

```
/add-plugin gen-z-claude-bro
```

Not listed in your marketplace yet? Open Cursor Dashboard → Settings → Plugins, import a team marketplace, paste `https://github.com/kidskoding/gen-z-claude-bro`, then run `/add-plugin gen-z-claude-bro`.

The plugin ships an always-apply rule plus the skill. If Settings → Rules shows `gen-z` as "Agent Decides", switch it to **Always**; some Cursor versions downgrade plugin rules.

For local development:

```sh
git clone https://github.com/kidskoding/gen-z-claude-bro.git
mkdir -p ~/.cursor/plugins/local
ln -s "$(pwd)/gen-z-claude-bro" ~/.cursor/plugins/local/gen-z-claude-bro
# or, for one cursor-agent run:
cursor-agent --plugin-dir ./gen-z-claude-bro
```

### GitHub Copilot CLI

```sh
copilot plugin marketplace add kidskoding/gen-z-claude-bro
copilot plugin install gen-z-claude-bro@gen-z-claude-bro
```

Inside an interactive session, the same commands work with a leading `/`. The plugin's hooks start every session in Gen Z mode; `/bro ultra`, "gen z mode lite" and "stop gen z" switch it, including as the prompt you pass to `copilot -p`.

### Gemini CLI

The extension loads the skill through `GEMINI.md`, so every session starts in Gen Z mode.

Install:

```
gemini extensions install https://github.com/kidskoding/gen-z-claude-bro
```

Update later:

```
gemini extensions update gen-z-claude-bro
```

### Rules files

For harnesses without plugins, paste [`rules/gen-z-activate.md`](rules/gen-z-activate.md) into their always-on rules file:

| Harness | File |
|---|---|
| Cursor (no plugin) | `.cursor/rules/gen-z.mdc` — or copy [`rules/gen-z.mdc`](rules/gen-z.mdc), which already has the `alwaysApply` frontmatter |
| GitHub Copilot in VS Code / github.com | `.github/copilot-instructions.md` |
| Windsurf | `.windsurf/rules/gen-z.md` |
| Cline | `.clinerules/gen-z.md` |
| OpenCode, Codex, Amp and other `AGENTS.md` readers | `AGENTS.md` |

---

### One session, no install

Paste the contents of `skills/bro/SKILL.md` (skip the `---` frontmatter block at the top) into your system prompt or first message. Works for a single session, no install.

Natural language turns it on anywhere the skill is loaded:

> "talk like a student" / "bro mode" / "speak casual" / "use slang" / "be my friend"

---

## How it works

| Piece | Job |
|---|---|
| `skills/bro/SKILL.md` | The whole personality: vocab map, intensities, when to drop the slang. Every harness reads this file (or a copy of it). |
| `hooks/gen-z-activate.js` | Claude Code `SessionStart`: picks the session's mode and injects the skill. |
| `hooks/gen-z-mode-tracker.js` | Claude Code `UserPromptSubmit`: catches `/bro …` and "stop gen z", saves the mode, and tells the model. |
| `hooks/gen-z-statusline.sh` | Prints the badge for the current session. |
| `hooks/run.sh` | Picks `node` or `bun` to run the hooks. |
| `hooks/hooks.json` / `hooks.codex.json` / `hooks.copilot.json` | The same two hooks wired up for Claude Code, Codex and Copilot CLI. |
| `rules/gen-z-activate.md` | Short always-on version of the skill for Cursor, Windsurf, Cline and `AGENTS.md`. |

Mode state lives per session and is cleaned up after a week: `~/.claude/gen-z-claude-bro/sessions/` for Claude Code, and each plugin's data directory for Codex and Copilot CLI.

## Troubleshooting

- **It's not talking Gen Z in Claude Code.** Run `/hooks` and check the two `gen-z` hooks are listed; if not, reinstall the plugin and restart. The hooks need `node` or `bun` on your `PATH`.
- **Codex ignores it.** Open `/hooks` and trust the two `gen-z-claude-bro` hooks. Codex skips untrusted plugin hooks silently.
- **Skill installed with `npx skills` but it stays normal.** Skills load when the agent picks them. Say "bro mode", or paste `rules/gen-z-activate.md` into `AGENTS.md` for always-on.
- **The badge never changes.** Make sure your `statusLine` points at `~/.claude/gen-z-claude-bro/statusline.sh`, not a path inside the plugin cache (that one moves on every update).
- **I want it off by default.** `GEN_Z_DEFAULT_MODE=off`.

## Contributing

Edit behavior in `skills/bro/SKILL.md` (and the short form in `rules/gen-z-activate.md`), then:

```sh
bun run sync          # stamps package.json's version everywhere and regenerates rules/gen-z.mdc
bun run test          # sync check + hook and manifest tests
bun run skills:list   # what skills.sh will see
```

To release, bump `version` in `package.json`, run `bun run sync`, and add a `CHANGELOG.md` entry.

## License

MIT
