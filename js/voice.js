/* ===========================================================
   VOICE - the game reads Hendrix's lines out loud

   Every browser has a speaking voice built in (it is called
   speech synthesis). We give it the words, make it higher so it
   sounds like a kid, and it talks. No sound files, nothing to
   download, same as js/audio.js.

   Some computers have lots of voices, some have one, and a few
   have none at all. If there is no voice, the game just stays
   quiet and the words are still on screen.

   How high and how fast is in data/hints.js (VOICE).
   =========================================================== */

import { state } from './state.js';
import { VOICE } from '../data/hints.js';

/* British first, because Hendrix is. Then any English voice.
   Of those, the ones that sound lighter, so pitching them up
   sounds more like a kid and less like a cartoon mouse. */
const LIGHTER = /female|girl|child|kid|junior|martha|kate|serena|samantha|karen|moira|tessa|libby|sonia|mia/i;

function pickVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const english = voices.filter((v) => /^en/i.test(v.lang));
  const british = english.filter((v) => /GB/i.test(v.lang));
  const pool = british.length ? british : english.length ? english : voices;
  return pool.find((v) => LIGHTER.test(v.name)) || pool[0];
}

/* Say something. onEnd is called when it finishes (or straight
   away if there is no voice), so the face can stop talking. */
export function speak(words, onEnd) {
  const done = () => { if (onEnd) onEnd(); };
  if (!state.soundOn || !('speechSynthesis' in window) || !words) { done(); return; }
  try {
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(words.replace(/\.\.\./g, ', '));
    const voice = pickVoice();
    if (voice) { line.voice = voice; line.lang = voice.lang; }
    line.pitch = VOICE.pitch;
    line.rate = VOICE.rate;
    line.onend = done;
    line.onerror = done;
    window.speechSynthesis.speak(line);
  } catch (e) {
    done();
  }
}

/* Stop talking, like when you leave the workbench. */
export function hush() {
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) { /* nothing to stop */ }
  }
}

/* Some browsers load their voices a moment after the page. */
if ('speechSynthesis' in window) {
  try { window.speechSynthesis.getVoices(); } catch (e) { /* no voices here */ }
}
