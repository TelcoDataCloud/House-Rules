/* ===========================================================
   VOICE and SOUND

   The game reads short lines out loud with the browser's own
   voice, and makes little beeps with WebAudio. No sound files.
   The sound button turns both off.
   =========================================================== */

import { state } from './state.js';

let last = '', lastAt = 0;

// Lines wait their turn instead of talking over each other.
// urgent: true jumps the queue (OW, carried off).
export function say(text, urgent = false) {
  if (state.muted || !('speechSynthesis' in window)) return;
  const now = performance.now();
  if (text === last && now - lastAt < 3000) return;
  last = text; lastAt = now;
  const line = new SpeechSynthesisUtterance(text.replace(/[!{}]/g, '').toLowerCase());
  line.rate = 1.05; line.pitch = 1.1;
  if (urgent) window.speechSynthesis.cancel();
  else if (window.speechSynthesis.pending) return;   // one waiting is plenty
  window.speechSynthesis.speak(line);
}

let ctx = null;
function audio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// A quick beep. kind: 'pop', 'bonk', 'boing', 'groan', 'splat', 'twang'
export function blip(kind) {
  if (state.muted) return;
  const c = audio();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  const t = c.currentTime;
  const set = {
    pop:   ['sine', 500, 1200, 0.25],
    bonk:  ['square', 220, 90, 0.2],
    boing: ['triangle', 150, 700, 0.35],
    groan: ['sawtooth', 110, 70, 0.6],
    splat: ['square', 400, 60, 0.3],
    twang: ['triangle', 300, 900, 0.3],
    yawn:  ['sine', 300, 150, 0.8],
    dong:  ['triangle', 660, 330, 0.9],
    bong:  ['triangle', 880, 220, 0.5],
    squeak: ['sine', 900, 1600, 0.25],
    thud:  ['square', 120, 40, 0.35],
    cheer: ['square', 523, 1046, 0.5],
  }[kind] || ['sine', 440, 440, 0.2];
  o.type = set[0];
  o.frequency.setValueAtTime(set[1], t);
  o.frequency.exponentialRampToValueAtTime(set[2], t + set[3]);
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + set[3]);
  o.start(t); o.stop(t + set[3]);
}
