/* ===========================================================
   AUDIO: the sounds

   Most sounds are recorded sound files in the sounds folder
   (free sounds by Kenney, kenney.nl, and others that anyone may
   use: see sounds/README.md).
   Each one has 2 or 3 versions, and each time one plays it is
   picked at random and its pitch nudged a little, so a hundred
   shots never sound exactly the same.

   Big sounds are built from layers: a crack at the start, a
   boom in the middle, and debris rattling at the end. While a
   big sound plays, the small ones go quieter for a moment.
   Sounds are panned left or right to match where things are.

   If a file can't load, a little synthesiser makes a beep
   instead (the tone() and crash() below).
   =========================================================== */

import { state, W } from './state.js';

let ctx = null;
let noise = null;
let master = null;     // everything goes through here
let smallBus = null;   // small sounds go through here, so they can be turned down

// The sound files, and how many versions of each there are.
const FILES = {
  blaster: 3, laser: 3, rail: 2, drone: 2, missile: 2,
  hit: 3, clang: 3, pop: 3, boom: 2, crunch: 2, debris: 2,
  shield: 2, shatter: 2,
  bigboom: 1, launch: 1, spark: 2, stomp: 1,
  fire: 2, ice: 2, roar: 1,
};
const buffers = {};

// All the sound files come packed in a few text files, listed in
// sounds/packs.json (made by tools/pack-sounds.py from .mp3 files).
async function loadSounds() {
  const pack = {};
  let list = [];
  try { list = await (await fetch('sounds/packs.json')).json(); } catch (e) { return; }
  // Each pack on its own, so one missing pack doesn't stop the rest.
  await Promise.all(list.map(async (name) => {
    try { Object.assign(pack, await (await fetch(`sounds/${name}`)).json()); } catch (e) { /* the synth covers it */ }
  }));
  await Promise.all(Object.entries(FILES).flatMap(([name, n]) => Array.from({ length: n }, async (_, i) => {
    const text = pack[`${name}-${i + 1}`];
    if (!text) return;
    try {
      const bytes = Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
      const data = await ctx.decodeAudioData(bytes.buffer);
      (buffers[name] = buffers[name] || []).push(data);
    } catch (e) { /* can't play it: the synth plays instead */ }
  })));
}

// Browsers only allow sound after you click something, so Play calls this.
export function wakeAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  ctx = new Ctx();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  smallBus = ctx.createGain();
  smallBus.connect(master);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  loadSounds();
}

// Play a sound file. Returns false if it isn't loaded (use the synth).
//   vol    how loud (0 to 1)
//   x      where it is across the screen, for left and right
//   rate   1 is normal pitch; it is nudged up or down 5% each time
//   big    a big sound: turns the small ones down for a moment
//   delay  seconds to wait first
function play(name, { vol = 0.5, x = null, rate = 1, big = false, delay = 0 } = {}) {
  if (!ctx || state.muted) return true;
  const list = buffers[name];
  if (!list || !list.length) return false;
  const src = ctx.createBufferSource();
  src.buffer = list[Math.floor(Math.random() * list.length)];
  src.playbackRate.value = rate * (0.95 + Math.random() * 0.1);
  const gain = ctx.createGain();
  gain.gain.value = vol;
  let node = src.connect(gain);
  if (x !== null && ctx.createStereoPanner) {
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.max(-0.8, Math.min(0.8, (x / W) * 2 - 1));
    node = node.connect(pan);
  }
  node.connect(big ? master : smallBus);
  src.start(ctx.currentTime + delay);
  if (big) duck();
  return true;
}

// Turn the small sounds down while a big one plays.
function duck() {
  const g = smallBus.gain;
  const t = ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0.35, t + 0.05);
  g.linearRampToValueAtTime(1, t + 0.9);
}

function tone(from, to, time, type = 'square', volume = 0.08) {
  if (!ctx || state.muted) return;
  const out = master || ctx.destination;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + time);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + time);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + time);
}

function crash(time, volume, low = 800) {
  if (!ctx || state.muted) return;
  const out = master || ctx.destination;
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
  src.connect(filter).connect(gain).connect(out);
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
  blaster:  [[523, 523, 0.1, 'square', 0], [659, 659, 0.1, 'square', 0.09], [784, 784, 0.1, 'square', 0.18], [1047, 1047, 0.25, 'square', 0.27]],
  rail:     [[90, 90, 0.3, 'sawtooth', 0], [200, 2400, 0.25, 'sawtooth', 0.3], [2400, 2400, 0.15, 'square', 0.55]],
};

let lastPop = 0;
let lastHit = 0;
let lastShot = 0;
export const sound = {
  // A small enemy blows up.
  pop(x = null) {
    const now = performance.now();
    if (now - lastPop < 40) return;   // lots of pops at once sound like one
    lastPop = now;
    if (!play('pop', { vol: 0.35, x })) crash(0.18, 0.18, 2000);
  },
  // A big bang: crack, boom, then bits of metal falling.
  boom(x = null) {
    const ok = play('crunch', { vol: 0.45, x, big: true });
    play('boom', { vol: 0.8, x, rate: 0.9, big: true });
    play('debris', { vol: 0.25, x, delay: 0.18 });
    if (!ok) { crash(0.7, 0.35, 900); tone(160, 40, 0.5, 'sine', 0.2); }
  },
  // Your shot hits something that didn't break (yet).
  ping(x = null, armour = false) {
    const now = performance.now();
    if (now - lastHit < 55) return;
    lastHit = now;
    if (!play(armour ? 'clang' : 'hit', { vol: armour ? 0.18 : 0.12, x })) tone(1400, 1200, 0.04, 'square', 0.03);
  },
  // Your guns. Each one sounds different.
  shot(gun, x = null) {
    const now = performance.now();
    if (now - lastShot < 70) return;
    lastShot = now;
    const file = { blaster: 'blaster', laser: 'laser', drone: 'drone', missile: 'missile' }[gun] || 'blaster';
    play(file, { vol: gun === 'drone' || gun === 'missile' ? 0.06 : 0.09, x, rate: gun === 'drone' ? 1.25 : 1 });
  },
  pickup() { tone(500, 1200, 0.12, 'square', 0.07); },
  power() { [0, 0.08, 0.16].forEach((d, i) => setTimeout(() => tone(500 + i * 250, 900 + i * 300, 0.12, 'square', 0.07), d * 1000)); },
  hurt() {
    if (!play('crunch', { vol: 0.6, big: true })) crash(0.4, 0.25, 1500);
    tone(600, 80, 0.5, 'sawtooth', 0.1);
  },
  // The shield takes a hit (and stays), or breaks.
  shield() { if (!play('shield', { vol: 0.4 })) tone(900, 300, 0.25, 'triangle', 0.15); },
  shieldBreak() { if (!play('shatter', { vol: 0.5, big: true })) tone(900, 300, 0.25, 'triangle', 0.15); },
  // A hit the shield holds: a soft hum. A big hit that cracks it: a crack.
  shieldHit(x = null) { if (!play('shield', { vol: 0.28, x, rate: 1.4 })) tone(1200, 700, 0.12, 'triangle', 0.08); },
  shieldCrack(x = null) {
    if (!play('ice', { vol: 0.4, x, rate: 1.3 }) && !play('shatter', { vol: 0.3, x, rate: 1.6 })) tone(1600, 400, 0.15, 'square', 0.06);
  },
  // High Explosive and the other plain bangs.
  bomb() {
    play('crunch', { vol: 0.6, big: true, rate: 0.8 });
    if (!play('boom', { vol: 1, big: true, rate: 0.75 })) { crash(1.2, 0.45, 600); tone(200, 30, 1, 'sine', 0.25); }
    play('debris', { vol: 0.35, delay: 0.25 });
    play('debris', { vol: 0.25, delay: 0.5, rate: 0.8 });
  },
  warn() { [0, 0.5, 1, 1.5].forEach((d) => setTimeout(() => tone(440, 330, 0.3, 'square', 0.06), d * 1000)); },
  nope() { tone(200, 150, 0.12, 'square', 0.05); },
  // A whoosh of air, for the films between levels.
  whoosh() { crash(1.6, 0.3, 3000); },
  // Red Lightning: a crackle and a snap for each jump, thunder after.
  zap(x = null) { if (!play('spark', { vol: 0.45, x })) { crash(0.08, 0.18, 6000); tone(1800, 200, 0.08, 'sawtooth', 0.04); } },
  thunder() { setTimeout(() => { crash(1.6, 0.35, 400); tone(70, 40, 1.4, 'sine', 0.18); }, 250); },
  // The nuke: a missile goes, then a huge low boom, then rumble.
  launch() { if (!play('launch', { vol: 0.6 }) && !play('missile', { vol: 0.5, rate: 0.7 })) { crash(0.4, 0.2, 2500); tone(300, 900, 0.4, 'sawtooth', 0.04); } },
  nuke() {
    play('bigboom', { vol: 1, big: true, rate: 0.85 });
    play('boom', { vol: 1, big: true, rate: 0.55 });
    play('boom', { vol: 0.8, big: true, rate: 0.45, delay: 0.12 });
    play('crunch', { vol: 0.6, big: true, rate: 0.6 });
    tone(45, 25, 2.6, 'sine', 0.3);
    crash(2.8, 0.35, 500);
    play('debris', { vol: 0.35, delay: 0.6, rate: 0.7 });
    play('debris', { vol: 0.3, delay: 1.1, rate: 0.6 });
  },
  // A walking boss puts a foot down.
  stomp(x = null) { play('stomp', { vol: 0.5, x, rate: 0.85 }); },
  // A boss's last big bang.
  bossDeath(x = null) { if (!play('bigboom', { vol: 1, x, big: true })) this.boom(x); play('debris', { vol: 0.4, x, delay: 0.4 }); },
  // --- each boss's own sounds ---
  // A boss arrives: a roar, pitched for each boss (data/bosses.js voice).
  bossIn(voice = 1) {
    if (!play('roar', { vol: 0.55, rate: voice, big: true })) tone(80 * voice, 40 * voice, 1.2, 'sawtooth', 0.12);
    tone(50 * voice, 35 * voice, 1.4, 'sine', 0.2);
  },
  // LAST STAND attacks.
  flak(x = null) { play('crunch', { vol: 0.25, x, rate: 1.8 }); play('pop', { vol: 0.3, x, rate: 1.4 }); },
  flame(x = null) { if (!play('fire', { vol: 0.6, x })) crash(1.2, 0.25, 1800); },
  ice(x = null) { if (!play('ice', { vol: 0.5, x })) tone(2400, 900, 0.2, 'triangle', 0.06); },
  eyeLaser() { if (!play('rail', { vol: 0.6, rate: 0.35, big: true })) tone(90, 60, 2, 'sawtooth', 0.12); tone(300, 220, 2.2, 'square', 0.03); },
  chain(x = null) { play('spark', { vol: 0.35, x, rate: 0.8 }); },
  gravity() { tone(160, 40, 1.6, 'sine', 0.2); tone(320, 80, 1.6, 'triangle', 0.05); },
  slag(x = null) { if (!play('fire', { vol: 0.45, x, rate: 0.7 })) crash(0.6, 0.2, 700); },
  shock(x = null) { play('stomp', { vol: 0.7, x, rate: 0.6, big: true }); play('boom', { vol: 0.4, x, rate: 0.6 }); },
  fireWall() { if (!play('fire', { vol: 0.7, rate: 0.8 })) crash(1.5, 0.3, 1200); play('roar', { vol: 0.25, rate: 1.4 }); },
  // Each boss goes down its own way (data/bosses.js death).
  death(style, x = null) {
    if (style === 'shatter') { play('ice', { vol: 0.8, x, big: true }); play('ice', { vol: 0.6, x, rate: 0.7, delay: 0.15 }); }
    else if (style === 'melt') { play('fire', { vol: 0.8, x, big: true, rate: 0.6 }); play('roar', { vol: 0.4, x, rate: 0.5 }); }
    else if (style === 'zap') { for (let i = 0; i < 4; i++) play('spark', { vol: 0.5, x, delay: i * 0.12 }); }
    else if (style === 'blackhole' || style === 'implode') { tone(900, 40, 1.2, 'sine', 0.2); tone(1800, 80, 1.2, 'triangle', 0.05); }
    else if (style === 'nova') { this.nuke(); return; }
    else if (style === 'crush') { play('clang', { vol: 0.7, x, rate: 0.5, big: true }); }
    else if (style === 'topple') { play('stomp', { vol: 0.9, x, rate: 0.5, big: true }); }
    this.bossDeath(x);
  },
  laserBomb() { tone(80, 120, 2, 'sawtooth', 0.12); tone(900, 700, 2, 'square', 0.03); },
  // A boss powering up: a long rising hum.
  powerUp() { tone(60, 600, 1.8, 'sawtooth', 0.08); tone(120, 1200, 1.8, 'square', 0.03); },
  // The boss cannon charging, then its big laser.
  charge() { tone(200, 900, 1.2, 'triangle', 0.06); },
  bigLaser() { if (!play('rail', { vol: 0.7, rate: 0.5, big: true })) { tone(110, 60, 0.9, 'sawtooth', 0.14); crash(0.9, 0.25, 1200); } },
  // A railgun shot: a sharp crack and a falling zing.
  rail() { if (!play('rail', { vol: 0.35 })) { crash(0.12, 0.2, 4000); tone(2600, 300, 0.18, 'sawtooth', 0.05); } },

  // Every upgrade has its own sound. Each one is a few notes
  // played one after another: [start pitch, end pitch, length, wave].
  upgrade(key) {
    const tunes = UPGRADE_TUNES[key] || UPGRADE_TUNES.shield;
    tunes.forEach(([from, to, time, type, at]) => setTimeout(() => tone(from, to, time, type, 0.09), at * 1000));
    if (key === 'bay' || key === 'bombpack') crash(0.5, 0.25, 500);
  },

  win() { [0, 0.15, 0.3, 0.5].forEach((d, i) => setTimeout(() => tone(400 + i * 150, 500 + i * 200, 0.2, 'square', 0.08), d * 1000)); },
};
