/* ===========================================================
   VILLAGERS: the people who live here

   By day they walk to work (js/work.js). At night they sleep in
   beds, one each; anyone without a bed sleeps by the well, and on
   Hard they are the first the zombies go for.
   =========================================================== */

import { state, TILE, CENTRE } from './state.js';
import { JOBS, POCKETS, START, NAMES } from '../data/villagers.js';
import { el, thingAt, buildable } from './grid.js';

let nextId = 1;

export function startVillage() {
  state.planks = POCKETS.planks;
  state.carrots = POCKETS.carrots;
  state.potion = POCKETS.potion;
  state.stone = POCKETS.stone || 0;
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
  if (!v.home) assignHomes();
  v.x = v.home.x; v.y = v.home.y;
}

// Everyone gets their own patch of ground to stand on: a free square
// near their cottage, or near the well, never next to someone else's.
// The patches are drawn as little boxes with the name in them.
export function assignHomes() {
  const taken = [];
  const free = (c, r) => buildable(c, r) && !thingAt(c, r) && !taken.some(([tc, tr]) => Math.abs(tc - c) < 2 && Math.abs(tr - r) < 2);
  const near = (cx, cy, max) => {
    const list = [];
    for (let r = Math.floor(cy) - max; r <= Math.floor(cy) + max; r++) {
      for (let c = Math.floor(cx) - max; c <= Math.floor(cx) + max; c++) list.push([c, r, Math.hypot(c + 0.5 - cx, r + 0.5 - cy)]);
    }
    return list.sort((a, b) => a[2] - b[2]);
  };
  state.villagers.forEach((v) => {
    if (v.crewOf) { v.home = { x: v.crewOf.col + 0.5, y: v.crewOf.row - 0.4 }; return; }
    let spot = null;
    if (v.bed && v.bed.col !== undefined) spot = near(v.bed.col + 0.5, v.bed.row + 0.5, 2).find(([c, r, d]) => d > 0.6 && free(c, r));
    if (!spot) spot = near(CENTRE.x, CENTRE.y, 7).find(([c, r, d]) => d > 1.2 && free(c, r));
    if (!spot) spot = [Math.floor(CENTRE.x), Math.floor(CENTRE.y) + 1, 0];
    taken.push([spot[0], spot[1]]);
    v.home = { x: spot[0] + 0.5, y: spot[1] + 0.75, col: spot[0], row: spot[1] };
  });
  drawHomes();
}

export function drawHomes() {
  const g = document.getElementById('homes');
  if (!g) return;
  g.innerHTML = '';
  state.villagers.forEach((v) => {
    if (!v.home || v.home.col === undefined) return;
    g.appendChild(el('rect', { class: 'home-box', x: v.home.col * TILE + 3, y: v.home.row * TILE + 3, width: TILE - 6, height: TILE - 6, rx: 6 }));
    const t = el('text', { class: 'home-name', x: v.home.col * TILE + TILE / 2, y: v.home.row * TILE + TILE - 5, 'text-anchor': 'middle' });
    t.textContent = v.name;
    g.appendChild(t);
  });
}

// Who gets which bed: one each, in order, the rest have none
export function assignBeds() {
  const beds = [];
  for (const t of state.things.values()) if (t.does === 'bed') for (let i = 0; i < (t.data.holds || 1); i++) beds.push(t);
  state.villagers.forEach((v, i) => { v.bed = beds[i] || null; });
  return state.villagers.filter((v) => !v.bed);
}

// At night everyone finds a bed
export function sendToBed() {
  assignBeds();
  state.villagers.forEach((v, i) => {
    const bed = v.bed;
    if (bed) { v.x = bed.col + 0.3 + (i % 2) * 0.4; v.y = bed.row + 0.7; }
    else { v.x = CENTRE.x + (i % 3) * 0.6; v.y = CENTRE.y + 1 + Math.floor(i / 3) * 0.5; }
    v.el.classList.remove('walking');
    draw(v);
  });
}

export function wakeUp() {
  assignHomes();
  state.villagers.forEach((v) => { placeAtWork(v); draw(v); });
}

export function draw(v) {
  v.el.setAttribute('transform', `translate(${v.x * TILE - 20} ${v.y * TILE - 36})`);
}

export function crewFor(thing) {
  return state.villagers.find((v) => v.job === 'crew' && v.crewOf === thing);
}
