/* ===========================================================
   STATE - the one object that holds the whole game

   There is exactly one of these. Every other file reads it and
   writes to it. If you ever want to know what the game thinks
   is happening right now, open the browser console and type:

       window.HOUSE.state

   Nothing here is saved. Close the tab and it is gone. Every
   refresh is a brand new night, on purpose.
   =========================================================== */

import { DEFAULT_DIFFICULTY } from '../data/difficulty.js';
import { DEFAULT_PUZZLE_LEVEL } from '../data/puzzles.js';

/* The phases of one night, in the order they happen.
   'title' and 'result' are the bookends. */
export const PHASES = [
  'title',
  'intro',
  'scavenge',
  'workshop',
  'rig',
  'night',
  'result'
];

/* Build a completely fresh game. Restart calls this, which is
   why restart always resets everything: there is nothing left
   over to forget about. */
export function freshState() {
  return {
    phase: 'title',
    difficulty: DEFAULT_DIFFICULTY,
    mode: 'night',      // 'night' for one night, 'week' for five in a row (data/nights.js)
    puzzleLevel: DEFAULT_PUZZLE_LEVEL,  // how hard the puzzles are (data/puzzles.js)
    theme: 'night',
    soundOn: true,

    /* Which room the camera is zoomed into. null is the whole house. */
    room: null,

    /* The hero (M2). Which room Hendrix is standing in, and whether
       he is on the move. */
    heroRoom: null,
    walking: false,

    /* Hiding places you have already looked in, like 'lounge-inside-the-piano'. */
    searched: [],

    /* The scavenge (M3). */
    inventory: [],      // ids of the things in your bag
    hidden: {},         // which hiding place holds what, like { 'hall-key-hooks': 'bell' }
    lying: [],          // ids of things left lying about in plain sight
    timeLeft: 0,        // seconds left on the scavenge clock
    scavenging: false,  // true while the clock is running
    scavengeBegun: false, // true once tonight's junk is hidden, so going back out does not hide it all again

    /* The puzzles (js/puzzles.js). Tonight's answers are in
       puzzles. Type HOUSE.state.puzzles in the console to cheat. */
    puzzles: null,      // { safe: { code, sums }, shed: { riddle, word }, ... one for every lock }
    unlocked: [],       // locks you have opened, like 'safe'
    notes: [],          // clues you have found, like Dad's note for 'safe'
    noteSpot: null,     // the hiding place Dad's note is in
    hintsUsed: {},      // how many hints you have had on each lock, like { safe: 1 }

    /* The traps, the night, and how it all went. */
    traps: [],          // M4: traps built at the workbench
    rigged: {},         // M5: which trap is at which anchor
    perfect: {},        // M14: how many PERFECT builds of each trap are on your shelf, like { 'egg-drop': 1 }
    perfectAt: {},      // M14: which anchors have a perfect trap on them
    timers: {},         // M17: when each TIMED trap goes off, in night seconds, like { 'back-lawn': 25 }
    notebook: [],       // M4: recipes discovered so far (kept on restart)
    burglars: [],       // M6: the burglars at night: where they are, what they carry
    crew: [],           // M17: who is coming tonight, like ['sid', 'dolores'] (js/crew.js)
    week: null,         // M17: playing a week? { night: 0, results: [] } (data/nights.js)
    taken: {},          // M6: which loot has gone, like { telly: 'bruno' }
    fired: [],          // M7: every trap that went off tonight, and who it got
    noticed: 0,         // M9: the neighbours noticed meter
    night: null         // M9: how the night ended, for the result screen
  };
}

export const state = freshState();

/* Change phase. Everything that cares listens for this. */
export function setPhase(next) {
  if (!PHASES.includes(next)) {
    console.warn('Unknown phase:', next);
    return;
  }
  state.phase = next;
  document.dispatchEvent(new CustomEvent('phasechange', { detail: next }));
}

/* The next night of a week (data/nights.js). Everything about
   the house starts fresh, but you keep your settings, your
   notebook, the week so far, and any traps you did not use
   (including ones still set that never went off). */
export function nextNight() {
  const fresh = freshState();
  ['theme', 'soundOn', 'difficulty', 'puzzleLevel', 'mode', 'notebook', 'week'].forEach((k) => { fresh[k] = state[k]; });
  fresh.traps = [...state.traps, ...Object.values(state.rigged)];
  fresh.perfect = { ...state.perfect };
  Object.entries(state.perfectAt).forEach(([anchorId]) => {
    const id = state.rigged[anchorId];
    if (id) fresh.perfect[id] = (fresh.perfect[id] || 0) + 1;
  });
  fresh.week.night += 1;
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  setPhase('intro');
}

/* Wipe the state back to a fresh night without reloading the
   page. Test this at every milestone that adds anything. */
export function resetGame() {
  const fresh = freshState();
  /* Keep the settings that belong to the person, not the game:
     day or night, sound, and how hard they like it. */
  fresh.theme = state.theme;
  fresh.soundOn = state.soundOn;
  fresh.difficulty = state.difficulty;
  fresh.puzzleLevel = state.puzzleLevel;
  /* The recipe notebook is yours for the whole visit, so you learn
     more every night. Refresh the page and it starts empty. */
  fresh.notebook = state.notebook;
  fresh.mode = state.mode;
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  setPhase('title');
}
