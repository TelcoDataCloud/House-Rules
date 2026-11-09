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
// wall) it is drawn as a straight run instead: rails that go right to
// the edge of the square, so the next one carries on in a straight
// line. Left and right runs show the pickets from the front; up and
// down runs show a column of pickets. Colours: css/game.css (.run-*).
const JOINS = new Set(['fence', 'wall', 'stonewall']);
const joins = (c, r) => { const n = thingAt(c, r); return !!(n && JOINS.has(n.kind)); };

export function relink() {
  for (const t of state.things.values()) {
    if (!JOINS.has(t.kind)) continue;
    const n = joins(t.col, t.row - 1), s = joins(t.col, t.row + 1);
    const w = joins(t.col - 1, t.row), e = joins(t.col + 1, t.row);
    t.el.querySelector('.run')?.remove();
    const pic = t.el.querySelector('use');
    if (!n && !s && !w && !e) { if (pic) pic.style.display = ''; continue; }
    if (pic) pic.style.display = 'none';
    t.el.prepend(drawRun(t.kind, { n, s, w, e }));
  }
}

function drawRun(kind, { n, s, w, e }) {
  const g = el('g', { class: 'run run-' + kind });
  const H = TILE, mid = H / 2, foot = H * 0.78;
  const stone = kind === 'stonewall', wall = kind === 'wall';
  // up and down: a column down the middle, drawn top to bottom so lower pickets sit in front
  if (n || s) {
    const top = n ? -H * 0.25 : mid - 6, bottom = s ? foot : mid + 6;
    if (stone) {
      for (let y = top; y < bottom; y += 10) g.appendChild(el('rect', { class: 'block', x: mid - 10, y, width: 20, height: Math.min(10, bottom - y), rx: 2 }));
    } else {
      g.appendChild(el('rect', { class: 'rail', x: mid - 8, y: top, width: 4, height: bottom - top }));
      g.appendChild(el('rect', { class: 'rail', x: mid + 4, y: top, width: 4, height: bottom - top }));
      for (let y = top - 8; y < bottom - 12; y += 8) g.appendChild(picket(mid, y, wall ? 16 : 14, 20, wall));
    }
  }
  // left and right: rails right to the edge, pickets in front
  if (w || e) {
    const x0 = w ? 0 : mid - 4, x1 = e ? H : mid + 4;
    if (stone) {
      [[foot - 20, 0], [foot - 10, 6]].forEach(([y, shift]) => {
        for (let x = x0 - shift; x < x1; x += 13) {
          const a = Math.max(x, x0), b = Math.min(x + 13, x1);
          if (b - a > 2) g.appendChild(el('rect', { class: 'block', x: a, y, width: b - a, height: 10, rx: 2 }));
        }
      });
    } else {
      [foot - 18, foot - 8].forEach((y) => g.appendChild(el('rect', { class: 'rail', x: x0, y, width: x1 - x0, height: 5 })));
      const gap = wall ? 10 : 10, pw = wall ? 10 : 8;
      for (let x = (w ? 5 : mid); x <= (e ? H - 4 : mid); x += gap) g.appendChild(picket(x, foot - (wall ? 30 : 26), pw, wall ? 30 : 26, wall));
    }
  }
  return g;
}

// One picket: a plank with a point (fence) or a round top (log wall)
function picket(x, y, w, h, round) {
  if (round) return el('rect', { class: 'picket', x: x - w / 2, y, width: w, height: h, rx: w / 2 });
  return el('polygon', { class: 'picket', points: `${x - w / 2},${y + h} ${x - w / 2},${y + 5} ${x},${y} ${x + w / 2},${y + 5} ${x + w / 2},${y + h}` });
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
