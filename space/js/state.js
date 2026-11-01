/* ===========================================================
   STATE: the one object that holds everything happening now

   Where the ship is, every enemy, every bullet, the score.
   newGame() wipes it clean, so Play again always starts fresh.
   Only your best score is saved (js/best.js). Everything else
   is gone when you refresh.
   =========================================================== */

import { SHIP } from '../data/ship.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { loadBest } from './best.js';

// The play area, in dots. CSS scales it to fit the screen.
export const W = 480;
export const H = 720;

export const state = {
  mode: 'title',          // title, play, pick, paused, over, win
  controls: 'keys',       // keys or mouse
  difficulty: 'easy',
  muted: false,
  touch: false,
  god: false,             // testing only: nothing can hit you
  best: loadBest(),       // your best score, kept in this browser (js/best.js)
};

export function newGame() {
  const hard = DIFFICULTY[state.difficulty];
  Object.assign(state, {
    mode: 'play',
    time: 0,              // seconds since the level started
    waveIndex: 0,         // the next line to read in data/waves.js
    score: 0,
    dropCounter: 0,
    ship: {
      x: W / 2, y: H + 60,
      lives: SHIP.lives, bombs: SHIP.bombs,
      power: 0,
      // upgrade levels, 0 to 3 (see data/weapons.js)
      spread: 0, laser: 0, beam: 0, homing: 0, rapid: 0, drones: 0, bay: 0,
      droneList: [],
      shield: hard.shield, shieldWait: 0,
      invuln: 0, dead: 0, entering: 1.2,
      fireWait: 0.4, missileWait: 0.8,
    },
    enemies: [], plates: [], parts: [], bosses: [],
    shots: [], missiles: [], foes: [], pickups: [],
    flocks: {}, later: [],
    stats: { livesLost: 0, partsDestroyed: 0, reactors: 0, flocks: 0, escaped: false, bombsUsed: 0 },
    endTimer: 0, ending: null,
    slow: 0,              // seconds of slow motion left
    hintWait: 20,         // seconds before the bomb hint may show
  });
}

// Do something a bit later, in game time (so pausing waits too).
export function after(seconds, fn) {
  state.later.push({ at: state.time + seconds, fn });
}

export function hardness() {
  return DIFFICULTY[state.difficulty];
}
