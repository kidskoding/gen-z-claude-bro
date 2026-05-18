# gen z claude bro

**your AI coding assistant but make it gen z**

Makes Claude speak like a Gen Z person — slang-heavy, high energy, still technically accurate no cap. Works with Claude Code, Cursor, Copilot, Windsurf, Cline, and any agent that supports system prompts.

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

## Installation

Installation differs by harness. If you use more than one agent, install this plugin separately in each one.

### Codex CLI

This repo includes a Codex marketplace catalog at `.agents/plugins/marketplace.json`.

Add the marketplace, then install the plugin from it:

```
/marketplace add kidskoding/gen-z-claude-bro
/plugin install gen-z-claude-bro@gen-z-claude-bro
```

In the `/plugins` UI, choose the option to add a marketplace and paste:

```
kidskoding/gen-z-claude-bro
```

Then install `gen-z-claude-bro` from that marketplace.

Or, if you cloned the repo locally, add it as a local marketplace:

```
/marketplace add /path/to/gen-z-claude-bro
/plugin install gen-z-claude-bro@gen-z-claude-bro
```

Then ask Codex for Gen Z mode:

| What you type | What happens |
|---|---|
| New session after install | Gen Z mode starts automatically |
| "use gen z mode" | Activate full Gen Z mode |
| "use gen z mode lite" | Light slang, no emoji |
| "use gen z mode ultra" | Maximum chaos |
| "stop gen z" / "normal mode" | Deactivate for the current session |

### Codex App

Add the marketplace:

```
kidskoding/gen-z-claude-bro
```

Then install `gen-z-claude-bro` from that marketplace. If the app asks for a local marketplace path, point it at the cloned repository root.

### Claude Code

In Claude Code, run:

```
/plugin marketplace add kidskoding/gen-z-claude-bro
/plugin install gen-z-claude-bro@gen-z-claude-bro
```

Restart Claude Code. Then:

| What you type | What happens |
|---|---|
| `/gen-z-claude-bro:bro` | Activate full Gen Z mode |
| `/gen-z-claude-bro:bro lite` | Light slang, no emoji |
| `/gen-z-claude-bro:bro ultra` | Maximum chaos |
| "stop gen z" / "normal mode" | Deactivate for the current session |


---

### Cursor — plugin

This repo includes a Cursor plugin manifest at `.cursor-plugin/plugin.json`.

If the plugin has been added to your Cursor plugin marketplace:

```
/add-plugin gen-z-claude-bro
```

To add this repo as a Cursor marketplace, open Cursor Dashboard -> Settings -> Plugins, import a team marketplace, and paste:

```
https://github.com/kidskoding/gen-z-claude-bro
```

Then install it from Cursor Agent chat:

```
/add-plugin gen-z-claude-bro
```

For local development or private use:

```
git clone https://github.com/kidskoding/gen-z-claude-bro.git
mkdir -p ~/.cursor/plugins/local
ln -s "$(pwd)/gen-z-claude-bro" ~/.cursor/plugins/local/gen-z-claude-bro
```

Restart Cursor, then ask the agent to "use gen z mode".

### GitHub Copilot CLI

Add the marketplace, then install the plugin from it:

```
copilot plugin marketplace add kidskoding/gen-z-claude-bro
copilot plugin install gen-z-claude-bro@gen-z-claude-bro
```

Inside an interactive Copilot CLI session, the same commands work with leading slashes:

```
/plugin marketplace add kidskoding/gen-z-claude-bro
/plugin install gen-z-claude-bro@gen-z-claude-bro
```

### Gemini CLI

This repo includes `gemini-extension.json` and `GEMINI.md`.

Install:

```
gemini extensions install https://github.com/kidskoding/gen-z-claude-bro
```

Update later:

```
gemini extensions update gen-z-claude-bro
```

### Manual Cursor rule

Add to `.cursor/rules/gen-z.mdc`:

```
---
alwaysApply: true
---
```

Paste the contents of `rules/gen-z-activate.md` below the frontmatter.

---

### GitHub Copilot

Paste the contents of `rules/gen-z-activate.md` into `.github/copilot-instructions.md`.

---

### Windsurf

Add the contents of `rules/gen-z-activate.md` to `.windsurf/rules/gen-z.md`.

---

### Cline

Add the contents of `rules/gen-z-activate.md` to `.clinerules/gen-z.md`.

---

### One-time session (any agent)

Paste the contents of `skills/bro/SKILL.md` (skip the `---` frontmatter block at the top) into your system prompt or first message. No install needed — works for a single session.

---

### Auto-activation (any agent)

Natural language also triggers Gen Z mode — no slash command needed:

> "talk like a student" / "bro mode" / "speak casual" / "use slang" / "be my friend"
