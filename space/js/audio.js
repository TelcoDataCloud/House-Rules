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

// The upgrade sounds. Hendrix: change the numbers to make new ones!
// Each note: [start pitch, end pitch, seconds, wave shape, when it starts].
// Wave shapes: 'sine' is soft, 'square' is beepy, 'sawtooth' is buzzy,
// 'triangle' is in between.
const UPGRADE_TUNES = {
  spread:   [[523, 523, 0.1, 'square', 0], [659, 659, 0.1, 'square', 0.09], [784, 784, 0.1, 'square', 0.18], [1047, 1047, 0.25, 'square', 0.27]],
  laser:    [[1800, 300, 0.25, 'sawtooth', 0], [2200, 400, 0.25, 'sawtooth', 0.12], [2600, 600, 0.35, 'square', 0.24]],
  beam:     [[150, 900, 0.7, 'sawtooth', 0], [300, 1800, 0.7, 'sine', 0.05], [1800, 1800, 0.3, 'triangle', 0.7]],
  homing:   [[400, 1600, 0.3, 'sine', 0], [1600, 1600, 0.06, 'square', 0.35], [1600, 1600, 0.06, 'square', 0.5], [2000, 2000, 0.12, 'square', 0.65]],
  rapid:    [[600, 600, 0.05, 'square', 0], [700, 700, 0.05, 'square', 0.06], [800, 800, 0.05, 'square', 0.12], [900, 900, 0.05, 'square', 0.18], [1000, 1000, 0.05, 'square', 0.24], [1200, 1200, 0.2, 'square', 0.3]],
  drones:   [[880, 880, 0.08, 'square', 0], [440, 440, 0.08, 'square', 0.1], [880, 880, 0.08, 'square', 0.2], [1320, 1320, 0.25, 'triangle', 0.3]],
  bay:      [[120, 60, 0.5, 'sine', 0], [523, 523, 0.12, 'triangle', 0.3], [784, 784, 0.25, 'triangle', 0.42]],
  shield:   [[400, 1200, 0.5, 'triangle', 0], [800, 2400, 0.5, 'sine', 0.1]],
  bombpack: [[200, 80, 0.3, 'sine', 0], [200, 80, 0.3, 'sine', 0.2]],
};

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
  // A whoosh of air, for the films between levels.
  whoosh() { crash(1.6, 0.3, 3000); },

  // Every upgrade has its own sound. Each one is a few notes
  // played one after another: [start pitch, end pitch, length, wave].
  upgrade(key) {
    const tunes = UPGRADE_TUNES[key] || UPGRADE_TUNES.shield;
    tunes.forEach(([from, to, time, type, at]) => setTimeout(() => tone(from, to, time, type, 0.09), at * 1000));
    if (key === 'bay' || key === 'bombpack') crash(0.5, 0.25, 500);
  },

  win() { [0, 0.15, 0.3, 0.5].forEach((d, i) => setTimeout(() => tone(400 + i * 150, 500 + i * 200, 0.2, 'square', 0.08), d * 1000)); },
};
