/* ===========================================================
   VILLAGERS: the people who live here

   By day they stand at their work. At night they sleep in beds
   (one each; anyone without a bed sleeps by the well). Each
   morning every job makes its thing (data/villagers.js).
   =========================================================== */

import { state, TILE } from './state.js';
import { JOBS, POCKETS, START, NAMES } from '../data/villagers.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { el, thingAt } from './grid.js';

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

export function removeVillager(v) {
  v.el.remove();
  state.villagers = state.villagers.filter((x) => x !== v);
}

// Where each villager stands by day: farmers by the farm, builders by
// the walls, brewers by the brewery, everyone else near the well.
export function placeAtWork(v) {
  const things = [...state.things.values()];
  const want = { farmer: 'farm', brewer: 'brewery', crew: 'catapult', lookout: 'tower' }[v.job];
  const spot = want ? things.find((t) => t.does === want) : null;
  if (spot) { v.x = spot.col + 0.5 + (Math.random() - 0.5); v.y = spot.row - 0.6; }
  else { v.x = 11 + Math.random() * 3; v.y = 8 + Math.random() * 2; }
}

// At night everyone finds a bed
export function sendToBed() {
  const beds = [...state.things.values()].filter((t) => t.does === 'bed');
  state.villagers.forEach((v, i) => {
    const bed = beds[i];
    v.bed = bed || null;
    if (bed) { v.x = bed.col + 0.5; v.y = bed.row + 0.5; }
    else { v.x = 12 + (i % 3) * 0.6; v.y = 9 + Math.floor(i / 3) * 0.5; }
    v.el.classList.remove('walking');
    draw(v);
  });
}

export function wakeUp() {
  state.villagers.forEach((v) => { placeAtWork(v); draw(v); });
}

// Every morning: the jobs make things
export function morning() {
  const diff = DIFFICULTY[state.mode];
  const made = { carrots: 0, planks: 0, potion: 0 };
  // farmers and builders first, then the brewers use the fresh carrots
  const order = [...state.villagers].sort((a, b) => (JOBS[a.job]?.makes === 'potion') - (JOBS[b.job]?.makes === 'potion'));
  order.forEach((v) => {
    const job = JOBS[v.job];
    if (!job || !job.makes) return;
    if (job.needs && ![...state.things.values()].some((t) => t.does === job.needs)) return;
    if (job.makes === 'potion') {
      let n = job.amount;
      while (n > 0 && state.carrots >= diff.potionCostCarrots) {
        state.carrots -= diff.potionCostCarrots; state.potion += 1; made.potion += 1; n--;
      }
    } else {
      state[job.makes] += job.amount;
      made[job.makes] += job.amount;
    }
  });
  return made;
}

export function draw(v) {
  v.el.setAttribute('transform', `translate(${v.x * TILE - 20} ${v.y * TILE - 36})`);
}

export function crewFor(thing) {
  return state.villagers.find((v) => v.job === 'crew' && v.crewOf === thing);
}
