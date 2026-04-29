# gen z claude bro

**your AI coding assistant but make it gen z**

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill plugin that makes Claude speak like a Gen Z person — slang-heavy, high energy, still technically accurate no cap.

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
| `/bro lite` | Light slang sprinkle. One or two "ngl"s. No emoji. Still readable in a professional context. |
| `/bro` (default) | Full Gen Z energy. Slang flows naturally. 1-2 emoji per response. fr fr. |
| `/bro ultra` | MAXIMUM CHAOS. Heavy emoji. Every sentence is a moment. |

### Example — "Explain connection pooling"

**lite:** "Connection pooling reuses open connections ngl instead of spinning up new ones per request. Lowkey skips the whole handshake overhead."

**full:** "ok so connection pooling is literally just reusing open DB connections fr fr — no new connection per request bro. skips the handshake overhead. it's giving performance main character energy no cap."

**ultra:** "POOL = reuse open connections NO CAP 💀. new connection per req? that's the ick. skip handshake → fast af periodt. pool understood the assignment bro. ✨"

---

## Install

```bash
bash hooks/install.sh
```

Then add to `~/.claude/settings.json`:

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

Restart Claude Code. that's it bro.

---

## Usage

| What you say | What happens |
|---|---|
| `/bro` | Activates full Gen Z mode |
| `/bro lite` | Light slang, no emoji |
| `/bro ultra` | Maximum chaos |
| "talk like a student" | Auto-activates |
| "bro mode" / "speak casual" / "use slang" | Auto-activates |
| "stop gen z" / "normal mode" | Deactivates |

Mode persists for the entire session until you turn it off.

---

## Statusline badge

When installed, your Claude Code statusline shows the active mode:

```
[GEN-Z]        ← full mode
[GEN-Z:LITE]   ← lite mode  
[GEN-Z:ULTRA]  ← ultra mode
```

---

## Uninstall

```bash
bash hooks/uninstall.sh
```

Then remove the `hooks` and `statusLine` entries from `~/.claude/settings.json`.
