/* ===========================================================
   GRID: the squares, and the things sitting on them

   The village is 36 squares across and 24 down. The outer three
   rows and columns are the dark wood where zombies come from.
   Every thing you build sits on one square. This file draws
   the ground, puts things on it and answers "what is here?".
   =========================================================== */

import { state, key, COLS, ROWS, TILE } from './state.js';
import { TRAPS } from '../data/traps.js';
import { WATER, BRIDGE, ROCKS, POND } from '../data/map.js';

// Where the stream is on each row (its left edge), so we know which bank a point is on
const STREAM_COL = [];
for (let r = 0; r < ROWS; r++) {
  const cols = WATER.filter(([c, rr]) => rr === r).map(([c]) => c).concat(BRIDGE.filter(([c, rr]) => rr === r).map(([c]) => c));
  STREAM_COL[r] = cols.length ? Math.min(...cols) : 99;
}
export function eastBank(x, y) { const r = Math.max(0, Math.min(ROWS - 1, Math.floor(y))); return x >= STREAM_COL[r] + 0.5; }
// Each bridge: the row it is on, and a step off each end. Bridges are
// rows of '=' in data/map.js; any number of them works.
export const BRIDGES = [];
[...new Set(BRIDGE.map(([, r]) => r))].sort((a, b) => a - b).forEach((r) => {
  const cols = BRIDGE.filter(([, rr]) => rr === r).map(([c]) => c);
  const last = BRIDGES[BRIDGES.length - 1];
  if (last && last.rows.includes(r - 1)) { last.rows.push(r); last.y = (last.rows[0] + r + 1) / 2; return; }
  BRIDGES.push({ rows: [r], y: r + 0.5, west: Math.min(...cols) - 0.6, east: Math.max(...cols) + 1.6 });
});

const setOf = (list) => new Set(list.map(([c, r]) => c + ',' + r));
const WATER_SET = setOf(WATER), ROCK_SET = setOf(ROCKS), POND_SET = setOf(POND), BRIDGE_SET = setOf(BRIDGE);
export function isWater(col, row) { return WATER_SET.has(col + ',' + row); }
export function isRock(col, row) { return ROCK_SET.has(col + ',' + row); }
export function isPond(col, row) { return POND_SET.has(col + ',' + row); }
export function isBridge(col, row) { return BRIDGE_SET.has(col + ',' + row); }
// Rocks nearby? (for building a mine)
export function nearRock(col, row) { return [[1,0],[-1,0],[0,1],[0,-1]].some(([dc, dr]) => isRock(col + dc, row + dr)); }
// Can you build on this square at all?
export function buildable(col, row) { return !isEdge(col, row) && !isWater(col, row) && !isRock(col, row) && !isPond(col, row) && !isBridge(col, row); }

const SVG = 'http://www.w3.org/2000/svg';
export const EDGE = 3;   // how many squares of woods round the edge

export function el(tag, attrs = {}) {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

export function isEdge(col, row) {
  return col < EDGE || row < EDGE || col >= COLS - EDGE || row >= ROWS - EDGE;
}

export function drawGround() {
  const ground = document.getElementById('ground');
  ground.innerHTML = '';
  // the painted map first (art/map.svg), stretched to the grid
  const map = el('svg', { viewBox: '0 0 1024 688', preserveAspectRatio: 'none', x: 0, y: 0, width: COLS * TILE, height: ROWS * TILE, class: 'map' });
  map.appendChild(el('use', { href: '#art-map', width: 1024, height: 688 }));
  ground.appendChild(map);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = el('rect', {
        x: col * TILE, y: row * TILE, width: TILE, height: TILE,
        class: 'tile' + (isEdge(col, row) ? ' edge' : '') + (isWater(col, row) ? ' water' : '') + (isRock(col, row) ? ' rock' : ''),
        'data-col': col, 'data-row': row,
      });
      ground.appendChild(tile);
      // invisible markers for the trees builders chop (the map draws the forest)
      if (isEdge(col, row) && col < 19 && ((col * 31 + row * 17 + 3) % 5 === 0)) {
        ground.appendChild(el('rect', { class: 'tree', 'data-col': col, 'data-row': row, x: col * TILE, y: row * TILE, width: TILE, height: TILE, fill: 'none', 'pointer-events': 'none' }));
      }
    }
  }
}

// What the thing on a square is, if anything.
export function thingAt(col, row) {
  return state.things.get(key(col, row)) || null;
}

export function placeThing(kind, col, row) {
  const data = TRAPS[kind] || { art: kind, does: kind };
  const g = el('g', { class: 'thing thing-' + kind, transform: `translate(${col * TILE} ${row * TILE})` });
  g.appendChild(el('use', { href: '#art-' + (data.art || kind), width: TILE + 8, height: TILE + 8, x: -4, y: -6 }));
  document.getElementById('things').appendChild(g);
  const thing = { kind, col, row, el: g, used: false, held: [], crew: 0, hp: 3, does: data.does, data };
  state.things.set(key(col, row), thing);
  if (data.does === 'scare') drawGlow(thing);
  if (JOINS.has(kind)) relink();
  // cottages puff smoke from the chimney (top right of the picture)
  if (data.does === 'bed') {
    const smoke = el('g', { class: 'smoke' });
    [0, 1, 2].forEach((i) => smoke.appendChild(el('circle', { cx: TILE - 4, cy: -2, r: 4, style: `animation-delay: ${i * 0.9}s` })));
    g.appendChild(smoke);
  }
  return thing;
}

export function removeThing(col, row) {
  const t = thingAt(col, row);
  if (!t) return;
  t.el.remove();
  if (t.glow) t.glow.remove();
  state.things.delete(key(col, row));
  if (JOINS.has(t.kind)) relink();
}

// ---------- fences and walls that join up ----------
// A fence on its own uses its picture. Next to another fence (or a
// wall) it uses the painted joining pieces instead:
//   fence-h  the same fence seen straight on, for left and right runs.
//            Each square shows one whole piece, edge to edge, so the
//            next one carries on in a straight line.
//   fence-v  a long column of the same pickets, for up and down runs.
//            It is cut into squares like a sticker on a roll, so the
//            pickets carry on from one square to the next.
// The pictures are in pics/ (the packs), made in Higgsfield from the
// original fence, wall and stone wall.
const JOINS = new Set(['fence', 'wall', 'stonewall']);
const joins = (c, r) => { const n = thingAt(c, r); return !!(n && JOINS.has(n.kind)); };

// Sizes in pixels (a square is 40):
//   tall   how tall the left and right piece stands
//   width  how wide the up and down column is
//   v      how wide the column painting is compared to how long it is
const SHAPE = {
  fence:     { tall: 38, width: 20, v: 0.186 },
  wall:      { tall: 42, width: 22, v: 0.211 },
  stonewall: { tall: 32, width: 22, v: 0.222 },
};

export function relink() {
  for (const t of state.things.values()) {
    if (!JOINS.has(t.kind)) continue;
    const n = joins(t.col, t.row - 1), s = joins(t.col, t.row + 1);
    const w = joins(t.col - 1, t.row), e = joins(t.col + 1, t.row);
    t.el.querySelector('.run')?.remove();
    const pic = t.el.querySelector('use');
    const ready = document.getElementById('art-' + t.kind + '-h');   // paintings not here yet: keep the picture
    if ((!n && !s && !w && !e) || !ready) { if (pic) pic.style.display = ''; continue; }
    if (pic) pic.style.display = 'none';
    t.el.prepend(drawRun(t, { n, s, w, e }));
  }
}

function drawRun(t, { n, s, w, e }) {
  const g = el('g', { class: 'run' });
  const H = TILE, mid = H / 2, foot = H * 0.9;
  const shape = SHAPE[t.kind];
  const across = w || e;
  // up and down: a column of pickets down the middle of the square
  if (n || s) {
    const top = n ? 0 : (across ? mid - 12 : 0);
    const bottom = s ? H : (across ? mid + 4 : foot);
    // where the column starts: the top square of this run
    let first = t.row;
    while (joins(t.col, first - 1)) first--;
    const firstAcross = joins(t.col - 1, first) || joins(t.col + 1, first);
    const startY = (first - t.row) * H + (first === t.row ? top : (firstAcross ? mid - 12 : 0));
    const cw = shape.width, long = cw / shape.v;
    const clip = box(mid - cw / 2 - 2, top, cw + 4, bottom - top);
    for (let y = startY; y < bottom; y += long) {
      if (y + long <= top) continue;
      clip.appendChild(el('use', { href: '#art-' + t.kind + '-v', x: 2, y: y - top, width: cw, height: long }));
    }
    g.appendChild(clip);
  }
  // left and right: the straight-on piece, standing on the bottom of the square
  if (across) {
    const pw = H + 2, ph = shape.tall;
    const x0 = w ? -1 : mid - 4, x1 = e ? H + 1 : mid + 4;
    const whole = !(n || s);   // a straight line gets the whole piece, even at its ends
    const clip = whole ? box(-1, foot - ph, pw, ph) : box(x0, foot - ph, x1 - x0, ph);
    clip.appendChild(el('use', { href: '#art-' + t.kind + '-h', x: whole ? 0 : -1 - x0, y: 0, width: pw, height: ph }));
    g.appendChild(clip);
  }
  return g;
}

// A window: anything inside it is cut off at its edges
function box(x, y, width, height) {
  return el('svg', { x, y, width: Math.max(0, width), height: Math.max(0, height), overflow: 'hidden' });
}

function drawGlow(thing) {
  const r = (thing.data.reach || 2) * TILE * 1.3;
  thing.glow = el('circle', {
    class: 'torch-glow', cx: thing.col * TILE + TILE / 2, cy: thing.row * TILE + TILE / 2, r,
  });
  document.getElementById('glows').appendChild(thing.glow);
}

// Can something walk onto this square?
export function blocked(col, row, who) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return true;
  if (isWater(col, row) || isRock(col, row)) return true;
  const t = thingAt(col, row);
  if (!t) return false;
  if (t.does === 'block') return !(t.down > 0) && !(who && ((who.digs && !t.data.stone) || who.big));
  if (t.does === 'garlic') return !!(who && who.data && who.data.hates === 'garlic');
  if (t.broken) return false;
  if (t.does === 'hold') return !(t.down > 0) && !(who && (who.jumps || who.digs || who.climbed === t));
  if (t.does === 'brewery' || t.does === 'well' || t.does === 'tower') return true;
  if (t.does === 'catapult' || t.does === 'bell' || t.does === 'sprinkler') return !who;   // zombies walk round it, the hero too
  return false;
}

// Mouse or finger position to a square
export function pointToTile(ev) {
  const svg = document.getElementById('village');
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { col: Math.floor(p.x / TILE), row: Math.floor(p.y / TILE), x: p.x / TILE, y: p.y / TILE };
}

export function clearThings() {
  document.getElementById('things').innerHTML = '';
  document.getElementById('glows').innerHTML = '';
  state.things = new Map();
}
