/* ===========================================================
   SAVE: the village is kept in the browser between visits

   Asa's call, 8 Nov 2026 (the one exception to "nothing
   persists", like Star Base's high score): refreshing after
   five nights should not throw the village away. The game is
   saved at the start of each day, in localStorage, under one
   key. CONTINUE on the title loads it. PLAY starts fresh and
   wipes it.
   =========================================================== */

import { state } from './state.js';
import { placeThing, clearThings } from './grid.js';
import { addVillager } from './villagers.js';

const KEY = 'snot-moon-save';

export function saveGame() {
  try {
    const data = {
      mode: state.mode, night: state.night, moonDay: state.moonDay,
      planks: state.planks, carrots: state.carrots, potion: state.potion, stone: state.stone || 0, weapon: state.weapon || 0, socks: state.socks || 0,
      villagers: state.villagers.map((v) => ({ job: v.job, oldJob: v.oldJob || null, name: v.name, crewAt: v.crewOf ? [v.crewOf.col, v.crewOf.row] : null })),
      things: [...state.things.values()].map((t) => ({ kind: t.kind, col: t.col, row: t.row, broken: !!t.broken, wear: t.wear || 0 })),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) { /* private window, or storage full: play on without saving */ }
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch (e) { /* nothing to do */ }
}

// Rebuilds the village from the save. Returns false if there is none.
export function loadGame() {
  let data = null;
  try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { return false; }
  if (!data || !data.things) return false;
  state.mode = data.mode;
  state.night = data.night;
  state.moonDay = data.moonDay;
  state.planks = data.planks; state.carrots = data.carrots; state.potion = data.potion; state.stone = data.stone || 0; state.weapon = data.weapon || 0; state.socks = data.socks || 0;
  clearThings();
  document.getElementById('mobs').innerHTML = '';
  state.villagers = [];
  data.things.forEach((s) => {
    const t = placeThing(s.kind, s.col, s.row);
    t.wear = s.wear;
    if (s.broken) { t.broken = true; t.el.classList.add('broken'); }
  });
  data.villagers.forEach((s) => {
    const v = addVillager(s.job);
    v.name = s.name;
    v.oldJob = s.oldJob;
    if (s.crewAt) {
      const t = state.things.get(s.crewAt[0] + ',' + s.crewAt[1]);
      if (t) { v.crewOf = t; t.crewMember = v; }
    }
  });
  return true;
}
