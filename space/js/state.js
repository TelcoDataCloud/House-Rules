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
import { LEVELS } from '../data/levels.js';
import { START_GUN, POWER_BAR, POWER_GROW } from '../data/weapons.js';
import { START_BOMB } from '../data/bombs.js';

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
  levelIndex: 0,          // which level: 0 is level 1
};

// A brand new game, from level 1 (or another level, for testing).
export function newGame(startAt = 0) {
  const hard = DIFFICULTY[state.difficulty];
  Object.assign(state, {
    score: 0,
    levelIndex: startAt,
    stats: { livesLost: 0, partsDestroyed: 0, reactors: 0, flocks: 0, escaped: false, bombsUsed: 0 },
    ship: {
      x: W / 2, y: H + 60,
      lives: SHIP.lives, bombs: SHIP.bombs,
      power: 0,
      // your main gun and its level, 1 to 4 (see data/weapons.js)
      gun: START_GUN, gunLevel: 1,
      // helpers, 0 to 3
      homing: 0, drones: 0,
      // your kind of bomb and its level, 1 to 3 (see data/bombs.js)
      bomb: START_BOMB, bombLevel: 1,
      droneList: [],
      shield: hard.shield, shieldWait: 0,
      invuln: 0, dead: 0, entering: 1.2,
      fireWait: 0.4, missileWait: 0.8,
    },
  });
  startLevel();
}

// Start the current level. Your ship keeps its upgrades, lives,
// bombs and score; everything else is wiped.
export function startLevel() {
  const s = state.ship;
  Object.assign(state, {
    mode: 'play',
    time: 0,              // seconds since the level started
    waveIndex: 0,         // the next line to read in the level's waves
    dropCounter: 0,
    enemies: [], plates: [], parts: [], bosses: [],
    shots: [], missiles: [], foes: [], pickups: [],
    flocks: {}, later: [],
    endTimer: 0, ending: null,
    slow: 0,              // seconds of slow motion left
    hintWait: 20,         // seconds before the bomb hint may show
  });
  Object.assign(s, { x: W / 2, y: H + 60, entering: 1.2, invuln: 0, dead: 0, droneList: [] });
  // Remember how you started, so Try again can put you back here.
  state.levelStart = { score: state.score, ship: JSON.parse(JSON.stringify(s)) };
}

// Try the same level again after running out of ships.
export function retryLevel() {
  const snap = state.levelStart;
  state.score = snap.score;
  state.ship = JSON.parse(JSON.stringify(snap.ship));
  state.ship.lives = Math.max(state.ship.lives, SHIP.lives);
  startLevel();
}

export function level() {
  return LEVELS[state.levelIndex];
}

export function isLastLevel() {
  return state.levelIndex >= LEVELS.length - 1;
}

// Do something a bit later, in game time (so pausing waits too).
export function after(seconds, fn) {
  state.later.push({ at: state.time + seconds, fn });
}

// How hard things are right now: the button you picked on the
// title screen, made harder by each level.
export function hardness() {
  const d = DIFFICULTY[state.difficulty];
  const l = level() || LEVELS[0];
  // The stronger your gun, the tougher everything gets (powerScale
  // in each level file). Bosses get twice as much.
  const s = state.ship || {};
  const power = Math.max(0, (s.gunLevel || 1) - 1) + ((s.homing || 0) + (s.drones || 0)) / 3;
  return {
    ...d,
    // On Easy the shield grows back fast on the first levels, then slower, then not at all.
    shieldBack: d.shieldBack ? (l.shieldBack ?? null) : null,
    power: 1 + (l.powerScale || 0) * power,
    bossPower: 1 + 2 * (l.powerScale || 0) * power,
    tough: d.tough * l.tough * (1 + (l.powerScale || 0) * power),
    bulletSpeed: d.bulletSpeed * l.bulletSpeed,
    shootMore: d.shootMore * l.shootMore,
  };
}

// How many power tokens fill the bar on this level. It grows each level.
export function powerBar() {
  return POWER_BAR + POWER_GROW * (state.levelIndex || 0);
}

// Give bombs or ships, up to the most you can have (data/ship.js).
// Returns how many did not fit, so they can be turned into points.
export function giveBombs(n) {
  const s = state.ship;
  const room = Math.max(0, SHIP.maxBombs - s.bombs);
  s.bombs += Math.min(room, n);
  return n - Math.min(room, n);
}
export function giveLife() {
  const s = state.ship;
  if (s.lives >= SHIP.maxLives) return 1;
  s.lives++;
  return 0;
}
