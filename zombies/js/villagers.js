/* ===========================================================
   VILLAGERS: the people who live here

   By day they walk to work (js/work.js). At night they sleep in
   beds, one each; anyone without a bed sleeps by the well, and on
   Hard they are the first the zombies go for.
   =========================================================== */

import { state, TILE } from './state.js';
import { JOBS, POCKETS, START, NAMES } from '../data/villagers.js';
import { el } from './grid.js';

let nextId = 1;

export function startVillage() {
  state.planks = POCKETS.planks;
  state.carrots = POCKETS.carrots;
  state.potion = POCKETS.potion;
  START.forEach((job) => addVillager(job));
}

export function addVillager(job, x, y) {
  const v = { id: nextId++, job, x: x ?? 12, y: y ?? 8, el: null, taken: false, bed: null, name: NAMES[(nextId - 2) % NAMES.length] };
  v.el = el('g', { class: 'mob villager' });
  const body = el('g', { class: 'body' });
  body.appendChild(el('use', { href: '#art-' + (JOBS[job]?.art || 'farmer'), width: 48, height: 52, x: -4, y: -8 }));
  v.el.appendChild(body);
  document.getElementById('mobs').appendChild(v.el);
  state.villagers.push(v);
  if (x === undefined) placeAtWork(v);
  draw(v);
  return v;
}

// Change what a villager does. The picture changes with it.
export function setJob(v, job) {
  v.job = job;
  const use = v.el.querySelector('use');
  use.setAttribute('href', '#art-' + (JOBS[job]?.art || 'farmer'));
}

export function removeVillager(v) {
  v.el.remove();
  state.villagers = state.villagers.filter((x) => x !== v);
}

// Where each villager stands by day: farmers by the farm, builders by
// the walls, brewers by the brewery, everyone else near the well.
export function placeAtWork(v) {
  if (v.crewOf) { v.x = v.crewOf.col + 0.5; v.y = v.crewOf.row - 0.4; return; }
  v.x = 11 + Math.random() * 3; v.y = 8.5 + Math.random() * 1.5;
}

// Who gets which bed: one each, in order, the rest have none
export function assignBeds() {
  const beds = [...state.things.values()].filter((t) => t.does === 'bed');
  state.villagers.forEach((v, i) => { v.bed = beds[i] || null; });
  return state.villagers.filter((v) => !v.bed);
}

// At night everyone finds a bed
export function sendToBed() {
  assignBeds();
  const beds = [...state.things.values()].filter((t) => t.does === 'bed');
  state.villagers.forEach((v, i) => {
    const bed = beds[i];
    if (bed) { v.x = bed.col + 0.5; v.y = bed.row + 0.5; }
    else { v.x = 12 + (i % 3) * 0.6; v.y = 9 + Math.floor(i / 3) * 0.5; }
    v.el.classList.remove('walking');
    draw(v);
  });
}

export function wakeUp() {
  state.villagers.forEach((v) => { placeAtWork(v); draw(v); });
}

export function draw(v) {
  v.el.setAttribute('transform', `translate(${v.x * TILE - 20} ${v.y * TILE - 36})`);
}

export function crewFor(thing) {
  return state.villagers.find((v) => v.job === 'crew' && v.crewOf === thing);
}
