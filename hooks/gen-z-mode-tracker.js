#!/usr/bin/env node
// UserPromptSubmit hook — tracks /bro intensity switches and "stop gen z" for this session

const state = require('./gen-z-state');

// $bro is how Codex mentions a skill
const COMMANDS = ['/bro', '/gen-z-claude-bro:bro', '$bro'];
const ON_PHRASES = ['gen z mode', 'bro mode', 'use gen z mode', 'speak gen z', 'talk like gen z'];
const OFF_PHRASES = ['stop gen z', 'stop gen z mode', 'normal mode', 'gen z off', 'stop bro mode'];

// Returns 'lite' | 'full' | 'ultra' | 'off' | null
function parseMode(prompt) {
  const text = prompt
    .trim()
    .toLowerCase()
    .replace(/[\s.!?]+$/, '')
    .replace(/\s+/g, ' ');
  if (OFF_PHRASES.includes(text)) return state.OFF;

  const [head, arg = ''] = text.split(' ');
  if (COMMANDS.includes(head)) {
    if (!arg) return 'full';
    if (arg === state.OFF || arg === 'stop') return state.OFF;
    return state.MODES.includes(arg) ? arg : 'full';
  }

  for (const phrase of ON_PHRASES) {
    if (text === phrase) return 'full';
    const level = text.startsWith(phrase + ' ') ? text.slice(phrase.length + 1) : '';
    if (state.MODES.includes(level)) return level;
  }
  return null;
}

function main() {
  const input = state.readStdinJson();
  const next = parseMode(String(input.prompt || ''));
  if (!next) return;

  const previous = state.readMode(input.session_id) || state.defaultMode();
  state.writeMode(input.session_id, next);

  if (next === state.OFF) {
    state.emit(
      'UserPromptSubmit',
      'The user turned Gen Z mode OFF for this session. Respond in your normal voice from now on, with no Gen Z slang, until they turn it back on.'
    );
  } else if (previous === state.OFF) {
    // the rules may not be in context (e.g. resumed while off), so send them again
    const body = state.loadSkillBody();
    state.emit('UserPromptSubmit', `${body}\n\nThe user turned Gen Z mode back ON at **${next}** intensity.`);
  } else {
    state.emit('UserPromptSubmit', `Gen Z mode intensity is now **${next}**. Match that level from this response on.`);
  }
}

if (require.main === module) main();

module.exports = { parseMode };
