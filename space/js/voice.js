/* ===========================================================
   VOICE: the game reads short lines out loud

   Uses the speaking voice built into the browser. Only for a
   few words at a time: the big messages and the upgrade cards.
   The sound button turns it off too.
   =========================================================== */

import { state } from './state.js';

let last = '';
let lastAt = 0;

export function say(text) {
  if (state.muted || !('speechSynthesis' in window)) return;
  const now = performance.now();
  if (text === last && now - lastAt < 3000) return;   // don't repeat ourselves
  last = text;
  lastAt = now;
  const words = text.replace(/!/g, '').toLowerCase();
  const line = new SpeechSynthesisUtterance(words);
  line.rate = 1.05;
  line.pitch = 1.1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(line);
}
