/* ===========================================================
   STATE: the one object that holds the whole game

   Hendrix: type ZOMBIES.state in the console while playing and
   you can see everything: the village, the zombies, your
   pockets. Nothing is saved; refresh and it is day 1 again.
   =========================================================== */

export const COLS = 24;
export const ROWS = 16;
export const TILE = 40;

export const state = {
  phase: 'title',       // 'title', 'day', 'night', 'dawn'
  mode: 'easy',
  night: 1,
  muted: false,
  planks: 0,
  carrots: 0,
  potion: 0,
  villagers: [],        // { id, job, col, row, x, y, el, taken }
  things: new Map(),    // "col,row" -> { kind, col, row, el, used, held: [], crew }
  zombies: [],          // { id, kind, x, y, el, ... }
  hero: { x: 12, y: 8, hearts: 5, down: 0, dizzyTimer: 0 },
  time: 0,              // seconds into the night
  moonDay: 2,           // 0..7, 4 is full
  picked: null,         // the thing picked on the build bar
  taken: [],            // names of villagers carried off tonight
  curedTonight: 0,
  log: [],
};

export function key(col, row) { return col + ',' + row; }

export function fresh() {
  state.phase = 'title';
  state.night = 1;
  state.planks = 0; state.carrots = 0; state.potion = 0;
  state.villagers = [];
  state.things = new Map();
  state.zombies = [];
  state.hero = { x: 12, y: 8, hearts: 5, down: 0, dizzyTimer: 0 };
  state.time = 0;
  state.moonDay = 2;
  state.picked = null;
  state.taken = [];
  state.curedTonight = 0;
  state.log = [];
}

window.ZOMBIES = { state };
