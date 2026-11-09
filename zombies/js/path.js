/* ===========================================================
   PATH: how a zombie finds its way round fences

   The map is a grid of squares. To get somewhere a zombie
   floods outwards from where it stands, one square at a time,
   like water spreading, skipping squares it cannot walk on
   (water, rocks, fences, walls). When the flood reaches the
   goal, it walks back along the trail: that is the path.

   If the village is fenced in all the way round, the flood
   never gets there. Then the zombie walks to the closest spot
   it CAN reach, right up against the fence, and starts trying
   to climb over (zombies.js does the climbing).

   Each zombie works its path out again every second or so,
   because villagers move and fences break. The hero uses it too
   when you tap somewhere to walk.
   =========================================================== */

import { COLS, ROWS } from './state.js';
import { blocked } from './grid.js';

const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const seen = new Uint8Array(COLS * ROWS);
const from = new Int32Array(COLS * ROWS);
const queue = new Int32Array(COLS * ROWS);

// Returns the squares to walk through (not counting the one it is on),
// and whether they reach the goal or only get as close as possible.
export function findPath(z, gx, gy, who = z) {
  const sc = clampC(Math.floor(z.x)), sr = clampR(Math.floor(z.y));
  const gc = clampC(Math.floor(gx)), gr = clampR(Math.floor(gy));
  const start = sr * COLS + sc, goal = gr * COLS + gc;
  seen.fill(0);
  seen[start] = 1; from[start] = -1;
  let head = 0, tail = 0;
  queue[tail++] = start;
  let best = start, bestD = Math.hypot(sc - gc, sr - gr);
  while (head < tail) {
    const i = queue[head++];
    if (i === goal) { best = goal; break; }
    const c = i % COLS, r = (i - c) / COLS;
    for (const [dc, dr] of STEPS) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
      const n = nr * COLS + nc;
      if (seen[n]) continue;
      if (blocked(nc, nr, who)) continue;
      // no cutting corners past a fence post
      if (dc && dr && (blocked(c + dc, r, who) || blocked(c, r + dr, who))) continue;
      seen[n] = 1; from[n] = i;
      queue[tail++] = n;
      const d = Math.hypot(nc - gc, nr - gr);
      if (d < bestD) { bestD = d; best = n; }
    }
  }
  const cells = [];
  for (let i = best; i !== start && i !== -1; i = from[i]) cells.push({ c: i % COLS, r: Math.floor(i / COLS) });
  cells.reverse();
  return { cells, reached: best === goal };
}

const clampC = (c) => Math.max(0, Math.min(COLS - 1, c));
const clampR = (r) => Math.max(0, Math.min(ROWS - 1, r));

// The next point to walk towards on the way to goal.
// who: what blocked() should treat the walker as (the hero passes null)
export function nextStep(z, goal, dt, who = z) {
  z.pathT = (z.pathT || 0) - dt;
  const key = Math.floor(goal.x) + ',' + Math.floor(goal.y);
  if (!z.path || z.pathT <= 0 || z.pathKey !== key) {
    const p = findPath(z, goal.x, goal.y, who);
    z.path = p.cells; z.pathReached = p.reached; z.pathKey = key;
    z.pathT = 0.8 + Math.random() * 0.5;
  }
  const cx = Math.floor(z.x), cy = Math.floor(z.y);
  // drop squares already reached
  while (z.path.length && z.path[0].c === cx && z.path[0].r === cy) z.path.shift();
  // in the goal's square, or as close as we can get: head straight for it
  if (!z.path.length) return goal;
  if (z.path.length === 1 && z.pathReached) return goal;
  const a = z.path[0];
  return { x: a.c + 0.5, y: a.r + 0.5 };
}
