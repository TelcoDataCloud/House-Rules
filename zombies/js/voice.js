/* ===========================================================
   VOICE and SOUND

   Three kinds of noise:
   - say(): the browser's own voice reads a short line out loud.
   - blip('bonk'): a real recorded sound. They come from Kenney
     (kenney.nl, free for anyone) and live in sounds/, packed
     into text files by tools/pack-sounds.py. Each sound has a
     few versions (bonk-1, bonk-2) and the game picks one at
     random, a bit higher or lower each time, so a horde never
     sounds the same twice. Record your own with the same name
     and it replaces the Kenney one.
   - The gross noises (fart, burp, sneeze, snore, laugh) are
     made right here with WebAudio, because no pack has a good
     enough fart.
   Music: a tune by day, a sneaky tune at night with drums that
   get louder as more zombies come, and a dance tune for the
   disco ball. The sound button turns everything off.
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
  const line = new SpeechSynthesisUtterance(text.replace(/[!{}#@%]/g, '').toLowerCase());
  line.rate = 1.05; line.pitch = 1.1;
  if (urgent) window.speechSynthesis.cancel();
  else if (window.speechSynthesis.pending) return;   // one waiting is plenty
  window.speechSynthesis.speak(line);
}

let ctx = null, sfxGain = null, musicGain = null;
function audio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      sfxGain = ctx.createGain(); sfxGain.gain.value = 0.8; sfxGain.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.22; musicGain.connect(ctx.destination);
    } catch (e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// ---------- the recorded sounds ----------
const raw = {};        // name -> base64 text (or its parts)
const buffers = {};    // 'bonk' -> [AudioBuffer, AudioBuffer...]
let packsLoaded = false;

async function fetchPacks(list) {
  await Promise.all(list.map(async (file) => {
    try {
      const pack = await (await fetch('sounds/' + file)).json();
      Object.assign(raw, pack);
    } catch (e) { /* a missing pack just means fewer sounds */ }
  }));
}

// Called once from main.js. Sound effects first, music after.
export async function loadSounds() {
  try {
    const packs = await (await fetch('sounds/packs.json')).json();
    await fetchPacks(packs.sfx);
    packsLoaded = true;
    fetchPacks(packs.music).then(() => { if (wantMusic) playMusic(wantMusic, true); });
  } catch (e) { /* no sounds folder: the beeps below still work */ }
}

function b64ToBytes(text) {
  const bin = atob(text);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Every version of a sound, decoded the first time it is needed
const decoding = {};
function versions(kind) {
  if (buffers[kind]) return buffers[kind];
  if (decoding[kind] || !ctx) return null;
  const names = Object.keys(raw).filter((k) => k.replace(/~\d+$/, '').replace(/-\d+$/, '') === kind);
  const stems = [...new Set(names.map((k) => k.replace(/~\d+$/, '')))];
  if (!stems.length) return null;
  decoding[kind] = Promise.all(stems.map((stem) => {
    const parts = names.filter((k) => k === stem || k.startsWith(stem + '~')).sort((a, b) => (+a.split('~')[1] || 0) - (+b.split('~')[1] || 0));
    // !q190! in a pack means 190 q's in a row (see tools/pack-sounds.py)
    const text = parts.map((k) => raw[k]).join('').replace(/!(.)(\d+)!/g, (m, ch, n) => ch.repeat(Number(n)));
    return new Promise((ok) => ctx.decodeAudioData(b64ToBytes(text), ok, () => ok(null)));
  })).then((list) => { buffers[kind] = list.filter(Boolean); });
  return null;
}

// Warm up the common ones so the first whack is not silent
export function warmSounds() {
  if (!audio() || !packsLoaded) return;
  ['bonk', 'spoon', 'pan', 'mallet', 'chicken', 'splat', 'boing', 'pop', 'whoosh', 'coin', 'build', 'click', 'super', 'cheer', 'slip', 'pin', 'thud', 'tap', 'joined', 'dawn', 'night']
    .forEach(versions);
}

function playBuffer(buf, { rate = 1, volume = 1, out = sfxGain } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = ctx.createGain(); g.gain.value = volume;
  src.connect(g); g.connect(out);
  src.start();
  return src;
}

// A sound from the packs. Falls back to a beep if it is not loaded yet.
// options: { rate: 1.5 makes it higher, volume: 0.5 quieter, steady: true no random pitch }
export function blip(kind, options = {}) {
  if (state.muted) return;
  const c = audio();
  if (!c) return;
  const list = versions(kind);
  // the gross noises are made from scratch, unless someone recorded their own
  if (GROSS[kind] && !(list && list.length) && !Object.keys(raw).some((k) => k.startsWith(kind + '-'))) return GROSS[kind](c, options);
  if (list && list.length) {
    const buf = list[Math.floor(Math.random() * list.length)];
    const wobble = options.steady ? 1 : 0.9 + Math.random() * 0.2;
    playBuffer(buf, { rate: (options.rate || 1) * wobble, volume: options.volume ?? 1 });
    if (kind === 'chicken') GROSS.squawk(c);   // a rubber chicken needs its squeak
    return;
  }
  beep(c, kind);
}

// ---------- the beeps (used before the packs load) ----------
function beep(c, kind) {
  const set = {
    pop: ['sine', 500, 1200, 0.25], bonk: ['square', 220, 90, 0.2], boing: ['triangle', 150, 700, 0.35],
    splat: ['square', 400, 60, 0.3], twang: ['triangle', 300, 900, 0.3], yawn: ['sine', 300, 150, 0.8],
    dong: ['triangle', 660, 330, 0.9], bong: ['triangle', 880, 220, 0.5], squeak: ['sine', 900, 1600, 0.25],
    thud: ['square', 120, 40, 0.35], cheer: ['square', 523, 1046, 0.5],
  }[kind];
  if (!set) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(sfxGain);
  const t = c.currentTime;
  o.type = set[0];
  o.frequency.setValueAtTime(set[1], t);
  o.frequency.exponentialRampToValueAtTime(set[2], t + set[3]);
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + set[3]);
  o.start(t); o.stop(t + set[3]);
}

// ---------- the gross noises, made from scratch ----------
function noise(c, seconds) {
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  return src;
}

// A low buzzy tone that wobbles: farts, burps and groans are all this
function rasp(c, { from, to, seconds, wobble = 18, depth = 30, type = 'sawtooth', volume = 0.35, cutoff = 600, delay = 0 }) {
  const t = c.currentTime + delay;
  const o = c.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + seconds);
  const lfo = c.createOscillator(); lfo.frequency.value = wobble;
  const lfoGain = c.createGain(); lfoGain.gain.value = depth;
  lfo.connect(lfoGain); lfoGain.connect(o.frequency);
  const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.03);
  g.gain.setValueAtTime(volume, t + seconds * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  o.connect(f); f.connect(g); g.connect(sfxGain);
  o.start(t); lfo.start(t); o.stop(t + seconds + 0.05); lfo.stop(t + seconds + 0.05);
}

const GROSS = {
  fart(c, o = {}) {
    const big = o.big ? 1.6 : 1;
    rasp(c, { from: 95 + Math.random() * 30, to: 55, seconds: 0.7 * big + Math.random() * 0.5, wobble: 22 + Math.random() * 14, depth: 25, volume: 0.45 });
    rasp(c, { from: 140, to: 80, seconds: 0.18, wobble: 40, depth: 20, volume: 0.25, delay: 0.75 * big });   // the little one at the end
  },
  burp(c) { rasp(c, { from: 130, to: 70, seconds: 0.9, wobble: 9, depth: 22, volume: 0.4, cutoff: 900 }); },
  groan(c) { rasp(c, { from: 110 + Math.random() * 30, to: 70, seconds: 0.8, wobble: 5, depth: 8, volume: 0.22, cutoff: 700 }); },
  laugh(c) {   // hur hur hur
    [0, 0.2, 0.4].forEach((d, i) => rasp(c, { from: 170 - i * 12, to: 130 - i * 10, seconds: 0.14, wobble: 6, depth: 6, volume: 0.25, cutoff: 1200, delay: d }));
  },
  sneeze(c) {   // aaah... CHOO
    rasp(c, { from: 300, to: 520, seconds: 0.5, wobble: 5, depth: 6, type: 'triangle', volume: 0.15, cutoff: 2000 });
    const t = c.currentTime + 0.55;
    const n = noise(c, 0.35);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2500; f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    n.connect(f); f.connect(g); g.connect(sfxGain); n.start(t);
  },
  snore(c) {
    rasp(c, { from: 70, to: 60, seconds: 1.1, wobble: 30, depth: 10, volume: 0.12, cutoff: 400 });
  },
  squawk(c) {   // the rubber chicken
    rasp(c, { from: 900, to: 1500, seconds: 0.25, wobble: 35, depth: 120, type: 'square', volume: 0.12, cutoff: 3000, delay: 0.04 });
  },
  squeak(c) { beep(c, 'squeak'); },
  yawn(c) { beep(c, 'yawn'); },
  bong(c) { beep(c, 'bong'); },
};

// ---------- music ----------
let wantMusic = null;     // 'day', 'night' or 'disco'
let playing = null;       // { name, src, gain }
let drums = null;         // the drum layer at night

function loopBuffer(name) {
  const list = versions('music-' + name);
  return list && list[0];
}

function startLoop(name, volume) {
  const buf = loopBuffer(name);
  if (!buf) return null;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  src.loopStart = 0.03; src.loopEnd = buf.duration - 0.03;   // skip the mp3's silent edges
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 1);
  src.connect(g); g.connect(musicGain);
  src.start();
  return { name, src, gain: g };
}

function fadeOut(m) {
  if (!m) return;
  const t = ctx.currentTime;
  m.gain.gain.cancelScheduledValues(t);
  m.gain.gain.setValueAtTime(m.gain.gain.value || 0.001, t);
  m.gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  m.src.stop(t + 0.85);
}

// The tune for now. Tries again by itself once the music packs arrive.
export function playMusic(name, retry = false) {
  wantMusic = name;
  if (state.muted || !audio()) return;
  if (playing && playing.name === name) return;
  if (!loopBuffer(name)) {   // still decoding: try again in a moment
    setTimeout(() => { if (wantMusic === name) playMusic(name, true); }, 600);
    return;
  }
  fadeOut(playing); fadeOut(drums); drums = null;
  playing = startLoop(name, 1);
  if (name === 'night') { versions('music-drums'); drums = startLoop('drums', 0.0001); }
}

// Night drums: 0 is silent, 1 is full. Night calls this as the horde grows.
export function setDrums(level) {
  if (!ctx || state.muted) return;
  if (!drums && playing && playing.name === 'night') drums = startLoop('drums', 0.0001);
  if (!drums) return;
  const v = Math.max(0.0001, Math.min(1, level) * 0.9);
  drums.gain.gain.setTargetAtTime(v, ctx.currentTime, 0.8);
}

export function stopMusic() {
  wantMusic = null;
  if (!ctx) return;
  fadeOut(playing); fadeOut(drums);
  playing = null; drums = null;
}

// The sound button
export function setMuted(on) {
  state.muted = on;
  if (on) {
    const keep = wantMusic;
    stopMusic(); wantMusic = keep;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  } else if (wantMusic) playMusic(wantMusic, true);
}
