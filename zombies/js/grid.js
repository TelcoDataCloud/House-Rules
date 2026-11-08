/* ===========================================================
   GRID: the squares, and the things sitting on them

   The village is 24 squares across and 16 down. The outer two
   rows and columns are the dark wood where zombies come from.
   Every thing you build sits on one square. This file draws
   the ground, puts things on it and answers "what is here?".
   =========================================================== */

import { state, key, COLS, ROWS, TILE } from './state.js';
import { TRAPS } from '../data/traps.js';

const SVG = 'http://www.w3.org/2000/svg';
export const EDGE = 2;   // how many squares of woods round the edge

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
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = el('rect', {
        x: col * TILE, y: row * TILE, width: TILE, height: TILE,
        class: 'tile' + ((col + row) % 2 ? ' alt' : '') + (isEdge(col, row) ? ' edge' : ''),
        'data-col': col, 'data-row': row,
      });
      ground.appendChild(tile);
      if (isEdge(col, row) && ((col * 31 + row * 17 + 3) % 5 === 0)) {
        ground.appendChild(el('use', { href: '#art-tree', class: 'tree', 'data-col': col, 'data-row': row, x: col * TILE - 8, y: row * TILE - 16, width: TILE + 16, height: TILE + 16 }));
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
  return thing;
}

export function removeThing(col, row) {
  const t = thingAt(col, row);
  if (!t) return;
  t.el.remove();
  if (t.glow) t.glow.remove();
  state.things.delete(key(col, row));
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
  const t = thingAt(col, row);
  if (!t) return false;
  if (t.does === 'block') return !(who && (who.digs || who.big));
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
