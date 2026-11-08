/* ===========================================================
   WORK: what villagers do while you build

   Every day (Day 1 too) each villager with a job makes a fixed
   number of trips (trips in data/difficulty.js): walk to the
   workplace, do the job, walk back, and the carrots, planks or
   potion pop up over their head and tick onto the counts. Then
   they idle until night. That fixed number is what stops the
   day going on forever: the day only ends when you press NIGHT
   FALLS.

   Workplaces: a farmer needs a free carrot plot (one farmer per
   plot at a time). A builder needs a tree on the woods edge.
   A brewer needs a free brewery and enough carrots.
   =========================================================== */

import { state, TILE, COLS, ROWS } from './state.js';
import { JOBS } from '../data/villagers.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { thingAt, eastBank } from './grid.js';

// Villagers only mind walls; they squeeze past everything else
function wallAt(col, row) { const t = thingAt(col, row); return !!(t && t.does === 'block'); }
import { draw as drawVillager } from './villagers.js';
import { burst } from './fx.js';
import { blip } from './voice.js';
import { drawCounts, flashCount, helpSay, drawSun } from './hud.js';

const WALK = 2.2;          // squares a second
const JOB_TIME = 1.4;      // seconds spent doing the job

// Which workplace each job walks to, and what it makes there.
// trips: a job that works slower than the others (potion is rare on purpose)
const WORK = {
  farmer:  { at: 'farm',    makes: 'carrots', amount: 2, verb: 'picked' },
  builder: { at: 'tree',    makes: 'planks',  amount: 3, verb: 'chopped' },
  brewer:  { at: 'brewery', makes: 'potion',  amount: 1, verb: 'cooked', trips: 1 },
  miner:   { at: 'mine',    makes: 'stone',   amount: 2, verb: 'dug' },
  chicken: { at: 'farm',    makes: 'carrots', amount: 1, verb: 'scratched up' },
  cow:     { at: 'brewery', makes: 'potion',  amount: 1, verb: 'milked', cheap: true, trips: 1 },
  pig:     { at: 'tree',    makes: 'potion',  amount: 1, verb: 'snuffled up', free: true, trips: 1 },
  sheep:   { at: 'tree',    makes: 'planks',  amount: 1, verb: 'rolled in' },
  nightshift: { at: 'tree', makes: 'planks',  amount: 2, verb: 'chopped' },
  giant:   { at: 'tree',    makes: 'planks',  amount: 6, verb: 'uprooted' },
  pumpkinfarmer: { at: 'farm', makes: 'carrots', amount: 4, verb: 'grew' },
};

// Start of a day: everyone gets their trips
export function startWork() {
  const diff = DIFFICULTY[state.mode];
  state.villagers.forEach((v) => {
    v.trips = WORK[v.job] ? Math.min(diff.trips, WORK[v.job].trips || diff.trips) : 0;
    if (diff.bedlessHalfTrips && !v.bed) v.trips = Math.ceil(v.trips / 2);
    v.task = null;
    v.busy = 0;
  });
  state.tripsTotal = state.villagers.reduce((n, v) => n + (v.trips || 0), 0);
  state.tripsDone = 0;
}

// A villager changed job mid day: leftover trips use the new job
export function retask(v) { v.task = null; }

function tripsLeft() { return state.villagers.some((v) => v.trips > 0 || v.task); }

// Find a free workplace for this job. Returns {x, y, thing} or null.
function workplace(v) {
  const w = WORK[v.job];
  if (!w) return null;
  if (w.at === 'tree') {
    // the nearest tree on the woods edge
    let best = null, bd = 1e9;
    document.querySelectorAll('#ground .tree').forEach((t) => {
      const x = Number(t.dataset.col) + 0.5, y = Number(t.dataset.row) + 0.5;
      if (eastBank(x, y)) return;   // the far bank is over the stream
      const d = Math.hypot(x - v.x, y - v.y);
      if (d < bd) { bd = d; best = { x, y: y + 0.4, thing: null }; }
    });
    return best;
  }
  let best = null, bd = 1e9;
  for (const t of state.things.values()) {
    if (t.does !== w.at || t.broken) continue;
    if (t.worker && t.worker !== v) continue;     // someone else is on it
    const d = Math.hypot(t.col + 0.5 - v.x, t.row + 0.5 - v.y);
    // stand just below a building rather than inside it
    const standY = (w.at === 'brewery' || w.at === 'mine') ? t.row + 1.3 : t.row + 0.5;
    if (d < bd) { bd = d; best = { x: t.col + 0.5, y: standY, thing: t }; }
  }
  return best;
}

export function updateWork(dt) {
  const diff = DIFFICULTY[state.mode];
  state.villagers.forEach((v) => {
    // a job with no work (catapult crew, a lookout) drops whatever trip it was on
    if (!WORK[v.job]) { if (v.task && v.task.spot.thing) v.task.spot.thing.worker = null; v.task = null; v.trips = 0; return; }
    if (!v.task) {
      if (!(v.trips > 0)) { v.el.classList.remove('walking'); return; }
      const w = WORK[v.job];
      const spot = workplace(v);
      if (!spot) return;                           // nothing to work on; wait
      if (w.makes === 'potion') {
        const cost = w.free ? 0 : w.cheap ? Math.ceil(diff.potionCostCarrots / 2) : diff.potionCostCarrots;
        if (state.carrots < cost) return;          // wait for carrots
      }
      if (spot.thing) spot.thing.worker = v;
      v.task = { step: 'go', spot, age: 0 };
    }
    const t = v.task;
    t.age += dt;
    // stuck somewhere silly for too long: give up the walk and count the trip
    if (t.age > 14) { if (t.spot.thing) t.spot.thing.worker = null; v.x = v.home.x; v.y = v.home.y; drawVillager(v); finishTrip(v); return; }
    if (t.step === 'go' || t.step === 'home') {
      const goal = t.step === 'go' ? t.spot : v.home;
      const dx = goal.x - v.x, dy = goal.y - v.y, d = Math.hypot(dx, dy);
      if (d < 0.25) {
        if (t.step === 'go') { t.step = 'work'; v.busy = JOB_TIME; v.el.classList.remove('walking'); }
        else finishTrip(v);
        return;
      }
      const step = Math.min(d, WALK * dt);
      let nx = v.x + dx / d * step, ny = v.y + dy / d * step;
      // walk round walls: try straight, then sideways
      if (wallAt(Math.floor(nx), Math.floor(ny))) {
        if (!wallAt(Math.floor(nx), Math.floor(v.y))) ny = v.y;
        else if (!wallAt(Math.floor(v.x), Math.floor(ny))) nx = v.x;
        else { nx = v.x + dy / d * step; ny = v.y - dx / d * step; }
      }
      // step round anyone in the way
      state.villagers.forEach((o) => {
        if (o === v) return;
        const ox = nx - o.x, oy = ny - o.y, od = Math.hypot(ox, oy);
        if (od > 0.01 && od < 0.6) { nx += ox / od * (0.6 - od) * 0.5; ny += oy / od * (0.6 - od) * 0.5; }
      });
      v.x = nx; v.y = ny;
      v.el.classList.add('walking');
      drawVillager(v);
    } else if (t.step === 'work') {
      v.busy -= dt;
      v.el.classList.add('working');
      if (v.busy <= 0) {
        v.el.classList.remove('working');
        if (t.spot.thing) t.spot.thing.worker = null;
        t.step = 'home';
      }
    }
  });
}

function finishTrip(v) {
  const w = WORK[v.job];
  const diff = DIFFICULTY[state.mode];
  v.task = null;
  v.trips--;
  state.tripsDone++;
  let made = w.amount;
  if (w.makes === 'potion') {
    const cost = w.free ? 0 : w.cheap ? Math.ceil(diff.potionCostCarrots / 2) : diff.potionCostCarrots;
    state.carrots -= cost;
    state.potion += 1;
    flashCount('carrots');
  } else {
    state[w.makes] += made;
  }
  flashCount(w.makes);
  burst(v.x, v.y - 1, `+${made} ${w.makes}`);
  blip('pop');
  const job = JOBS[v.job] ? JOBS[v.job].name.toLowerCase() : v.job;
  helpSay(`<b>${v.name}</b> the ${job} ${w.verb} ${made} ${w.makes}.`);
  drawCounts();
  drawSun(state.tripsTotal ? state.tripsDone / state.tripsTotal : 0);
}

export function workLeft() { return tripsLeft(); }
