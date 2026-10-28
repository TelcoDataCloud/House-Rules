/* ===========================================================
   CREW - who is coming tonight

   data/burglars.js has five burglars. Every night some of them
   come, picked at random, so you never quite know who to rig
   for. How many: PER_NIGHT in data/burglars.js, or the night's
   own number in data/nights.js when you are playing a week.

   Tonight's crew is a list of ids in state.crew, like
   ['sid', 'dolores']. The intro shows them, the night sends them
   in. A new night picks a new crew.
   =========================================================== */

import { BURGLARS, PER_NIGHT } from '../data/burglars.js';
import { WEEK } from '../data/nights.js';
import { state } from './state.js';

function shuffle(list) {
  const deck = [...list];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/* Tonight's night of the week, or null on a single night. */
export function thisNight() {
  return state.week ? WEEK[state.week.night] || null : null;
}

export function howMany() {
  const night = thisNight();
  return Math.max(1, Math.min(BURGLARS.length, night ? night.burglars : PER_NIGHT));
}

export function pickCrew() {
  state.crew = shuffle(BURGLARS).slice(0, howMany()).map((b) => b.id);
  return state.crew;
}

/* The burglars coming tonight, picking them if nobody has yet. */
export function tonight() {
  if (!state.crew || !state.crew.length) pickCrew();
  return state.crew.map((id) => BURGLARS.find((b) => b.id === id)).filter(Boolean);
}

/* How much braver everybody is tonight (a week gets harder). */
export function braveness() {
  const night = thisNight();
  return night ? night.nerve : 1;
}

/* 'he' or 'she', with a capital if you want one. */
export function pronoun(data, capital = false) {
  const p = data.pronoun || 'he';
  return capital ? p[0].toUpperCase() + p.slice(1) : p;
}
