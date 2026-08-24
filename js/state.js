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

/* The phases of one night, in the order they happen.
   'title' and 'result' are the bookends. */
export const PHASES = [
  'title',
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
    theme: 'night',
    soundOn: true,

    /* These are empty until the milestones that fill them. */
    inventory: [],      // M3: items the hero is carrying
    traps: [],          // M4: traps built at the workbench
    rigged: {},         // M5: which trap is at which anchor
    notebook: [],       // M4: recipes discovered so far
    burglars: [],       // M6: Sid and Bruno, once they exist
    noticed: 0          // M9: the neighbours noticed meter
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

/* Wipe the state back to a fresh night without reloading the
   page. Test this at every milestone that adds anything. */
export function resetGame() {
  const fresh = freshState();
  /* Keep the two settings that belong to the person, not the game. */
  fresh.theme = state.theme;
  fresh.soundOn = state.soundOn;
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, fresh);
  setPhase('title');
}
