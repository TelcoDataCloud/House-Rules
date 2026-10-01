/* ===========================================================
   AUDIO - little beeps we make ourselves

   There are no sound files in this game. Not one. The browser
   has a tone generator built into it, and we poke it to make
   a short noise. That means nothing to download and nothing
   that can go missing.

   Browsers refuse to make noise until the person has clicked
   something, so we do not build the audio machine until the
   first click. That is not a bug, it is a rule of the web.
   =========================================================== */

import { state } from './state.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

/* One short note.
   freq  = how high it is, in hertz. 200 is low, 1200 is squeaky.
   ms    = how long it lasts.
   shape = 'square' is retro, 'sine' is soft, 'sawtooth' is rude. */
function blip(freq, ms, shape = 'square', volume = 0.06) {
  if (!state.soundOn) return;
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;

  osc.type = shape;
  osc.frequency.setValueAtTime(freq, now);

  /* Fade in fast and out slowly so it does not click. */
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + ms / 1000 + 0.02);
}

/* A note that slides from one pitch to another. Good for
   whistles, yelps and things falling over. */
function slide(from, to, ms, shape = 'sawtooth', volume = 0.05) {
  if (!state.soundOn) return;
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const now = audio.currentTime;
  osc.type = shape;
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + ms / 1000);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + ms / 1000 + 0.02);
}

/* A short burst of hiss, like a splat or a whoosh. tone is how
   bright it is: low numbers are thuds, high numbers are hisses. */
function hiss(ms, tone = 1200, volume = 0.12) {
  if (!state.soundOn) return;
  const audio = getCtx();
  if (!audio) return;
  const length = Math.floor(audio.sampleRate * ms / 1000);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = tone;
  const gain = audio.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(audio.destination);
  src.start();
}

const later = (ms, fn) => setTimeout(fn, ms);

/* The named sounds the game actually uses.
   Add your own here and call sfx.whatever() from anywhere. */
export const sfx = {
  tick()    { blip(520, 70, 'square'); },
  select()  { blip(660, 90, 'square'); blip(880, 90, 'square'); },
  start()   { blip(440, 120, 'square'); setTimeout(() => blip(660, 160, 'square'), 110); },
  back()    { blip(330, 110, 'sine'); },
  toggle()  { blip(760, 60, 'sine'); },
  pickup()  { blip(660, 70, 'square'); setTimeout(() => blip(990, 90, 'square'), 70); },
  rare()    { [660, 830, 990, 1320].forEach((f, i) => setTimeout(() => blip(f, 90, 'square'), i * 70)); },
  full()    { blip(140, 160, 'sawtooth', 0.05); },
  timeUp()  { blip(520, 160, 'square'); setTimeout(() => blip(390, 160, 'square'), 170); setTimeout(() => blip(260, 320, 'square'), 340); },
  craft()   { [392, 523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 110, 'square'), i * 90)); },
  nope()    { blip(110, 260, 'sawtooth', 0.05); setTimeout(() => blip(90, 200, 'sawtooth', 0.05), 150); },
  creak()   { blip(150, 220, 'sawtooth', 0.03); setTimeout(() => blip(120, 280, 'sawtooth', 0.03), 200); },
  grab()    { blip(330, 90, 'square'); setTimeout(() => blip(250, 90, 'square'), 90); setTimeout(() => blip(180, 160, 'square'), 180); },
  /* --- the night: one sound for each kind of payoff --- */
  slip()    { slide(900, 200, 520, 'sine', 0.07); later(480, () => hiss(140, 300, 0.25)); },
  swing()   { hiss(260, 2500, 0.05); later(300, () => { blip(1200, 90, 'square'); blip(310, 260, 'triangle', 0.08); }); },
  drop()    { slide(1400, 500, 300, 'sine', 0.05); later(300, () => { blip(880, 120, 'square'); blip(220, 220, 'triangle', 0.08); }); },
  cloud()   { hiss(380, 900, 0.18); },
  pour()    { hiss(600, 500, 0.12); later(250, () => slide(300, 120, 200, 'sine', 0.06)); },
  stick()   { slide(160, 90, 300, 'sawtooth', 0.05); later(320, () => slide(150, 80, 300, 'sawtooth', 0.05)); },
  tangle()  { [0, 90, 180].forEach((t) => later(t, () => slide(500, 260, 90, 'triangle', 0.05))); },
  noise()   { for (let i = 0; i < 8; i += 1) later(i * 55, () => blip(300 + Math.random() * 900, 50, 'square', 0.05)); },
  flash()   { for (let i = 0; i < 6; i += 1) later(i * 80, () => blip(i % 2 ? 1500 : 1100, 50, 'square', 0.04)); },
  yelp()    { slide(500, 1300, 220, 'sawtooth', 0.04); },
  panic()   { [0, 120, 240].forEach((t, i) => later(t, () => slide(700 + i * 150, 1200 + i * 150, 110, 'square', 0.04))); },
  siren()   { for (let i = 0; i < 6; i += 1) later(i * 420, () => slide(i % 2 ? 950 : 650, i % 2 ? 650 : 950, 400, 'sine', 0.05)); },
  win()     { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => later(i * 120, () => blip(f, 140, 'square'))); },
  lose()    { [392, 370, 349, 262].forEach((f, i) => later(i * 260, () => slide(f, f * 0.94, 240, 'triangle', 0.08))); },
  rummage() { blip(180, 60, 'sawtooth', 0.04); setTimeout(() => blip(150, 60, 'sawtooth', 0.04), 90); setTimeout(() => blip(210, 70, 'sawtooth', 0.04), 180); }
};
