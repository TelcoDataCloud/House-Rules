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

/* The named sounds the game actually uses.
   Add your own here and call sfx.whatever() from anywhere. */
export const sfx = {
  tick()    { blip(520, 70, 'square'); },
  select()  { blip(660, 90, 'square'); blip(880, 90, 'square'); },
  start()   { blip(440, 120, 'square'); setTimeout(() => blip(660, 160, 'square'), 110); },
  back()    { blip(330, 110, 'sine'); },
  toggle()  { blip(760, 60, 'sine'); },
  rummage() { blip(180, 60, 'sawtooth', 0.04); setTimeout(() => blip(150, 60, 'sawtooth', 0.04), 90); setTimeout(() => blip(210, 70, 'sawtooth', 0.04), 180); }
};
