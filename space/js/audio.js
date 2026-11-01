/* ===========================================================
   AUDIO: little beeps and booms

   No sound files. The browser makes every sound from scratch
   with a tiny synthesiser. Each sound is a pitch that slides,
   or a burst of noise that fades.
   =========================================================== */

import { state } from './state.js';

let ctx = null;
let noise = null;

// Browsers only allow sound after you click something, so Play calls this.
export function wakeAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  ctx = new Ctx();
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
}

function tone(from, to, time, type = 'square', volume = 0.08) {
  if (!ctx || state.muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + time);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + time);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + time);
}

function crash(time, volume, low = 800) {
  if (!ctx || state.muted) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(low, t);
  filter.frequency.exponentialRampToValueAtTime(60, t + time);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + time);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
  src.stop(t + time);
}

let lastPop = 0;
export const sound = {
  pop() {
    const now = performance.now();
    if (now - lastPop < 40) return;   // lots of pops at once sound like one
    lastPop = now;
    crash(0.18, 0.18, 2000);
  },
  boom() { crash(0.7, 0.35, 900); tone(160, 40, 0.5, 'sine', 0.2); },
  ping() { tone(1400, 1200, 0.04, 'square', 0.03); },
  pickup() { tone(500, 1200, 0.12, 'square', 0.07); },
  power() { [0, 0.08, 0.16].forEach((d, i) => setTimeout(() => tone(500 + i * 250, 900 + i * 300, 0.12, 'square', 0.07), d * 1000)); },
  hurt() { tone(600, 80, 0.5, 'sawtooth', 0.12); crash(0.4, 0.25, 1500); },
  shield() { tone(900, 300, 0.25, 'triangle', 0.15); },
  bomb() { crash(1.2, 0.45, 600); tone(200, 30, 1, 'sine', 0.25); },
  warn() { [0, 0.5, 1, 1.5].forEach((d) => setTimeout(() => tone(440, 330, 0.3, 'square', 0.06), d * 1000)); },
  nope() { tone(200, 150, 0.12, 'square', 0.05); },
  win() { [0, 0.15, 0.3, 0.5].forEach((d, i) => setTimeout(() => tone(400 + i * 150, 500 + i * 200, 0.2, 'square', 0.08), d * 1000)); },
};
