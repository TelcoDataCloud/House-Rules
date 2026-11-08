/* ===========================================================
   HERO: you, with a wooden spoon and a bucket

   WASD or the arrows to run, click a square to run there.
   Space whacks the nearest zombie (dizzy, not cured). E throws
   a bucket of potion at the nearest zombie, if you have one.
   Five hearts; lose them all and you sit down for ten seconds.
   =========================================================== */

import { state, TILE, COLS, ROWS } from './state.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { LINES } from '../data/lines.js';
import { el, blocked } from './grid.js';
import { whackAt, cure } from './zombies.js';
import { burst } from './fx.js';
import { say } from './voice.js';
import { drawHearts } from './hud.js';

export const SPEED = 5;   // squares a second
const keys = new Set();
let elHero = null;
let goal = null;

export function makeHero() {
  if (elHero) elHero.remove();
  elHero = el('g', { class: 'mob hero' });
  const body = el('g', { class: 'body' });
  body.appendChild(el('use', { href: '#art-hero', width: 48, height: 52, x: -4, y: -8 }));
  elHero.appendChild(body);
  document.getElementById('mobs').appendChild(elHero);
  state.hero.x = 12; state.hero.y = 9; state.hero.hearts = 5; state.hero.down = 0;
  goal = null;
  draw();
}

export function listen() {
  window.addEventListener('keydown', (e) => {
    if (state.phase !== 'night') return;
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { keys.add(k); goal = null; e.preventDefault(); }
    if (k === ' ') { whack(); e.preventDefault(); }
    if (k === 'e') { throwPotion(); e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
}

export function runTo(x, y) { goal = { x, y }; }

export function update(dt) {
  const h = state.hero;
  const diff = DIFFICULTY[state.mode];
  if (h.down > 0) {
    h.down -= dt;
    const t = document.getElementById('down-timer');
    t.hidden = false; t.textContent = Math.ceil(h.down);
    elHero.classList.add('down');
    if (h.down <= 0) { h.hearts = 3; t.hidden = true; elHero.classList.remove('down'); drawHearts(); }
    return;
  }
  if (diff.heartsRegrow && h.hearts < 5 && state.time - (h.lastHurt || 0) > diff.heartsRegrow) {
    h.hearts++; h.lastHurt = state.time; drawHearts();
  }
  let dx = 0, dy = 0;
  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;
  if (!dx && !dy && goal) {
    dx = goal.x - h.x; dy = goal.y - h.y;
    if (Math.hypot(dx, dy) < 0.15) { goal = null; dx = dy = 0; }
  }
  const len = Math.hypot(dx, dy);
  if (len) {
    dx /= len; dy /= len;
    let speed = SPEED;
    if (state.gasAt && state.gasAt.t > 0 && Math.hypot(state.gasAt.x - h.x, state.gasAt.y - h.y) < 2) speed *= 0.5;
    const nx = h.x + dx * speed * dt, ny = h.y + dy * speed * dt;
    if (!blocked(Math.floor(nx), Math.floor(h.y))) h.x = Math.max(0.5, Math.min(COLS - 0.5, nx));
    if (!blocked(Math.floor(h.x), Math.floor(ny))) h.y = Math.max(0.5, Math.min(ROWS - 0.5, ny));
    elHero.classList.add('walking');
  } else {
    elHero.classList.remove('walking');
  }
  draw();
}

function draw() {
  elHero.setAttribute('transform', `translate(${state.hero.x * TILE - 20} ${state.hero.y * TILE - 36})`);
}

export function whack() {
  if (state.hero.down > 0) return;
  const h = state.hero;
  if (!whackAt(h.x, h.y)) burst(h.x, h.y - 0.8, 'swish');
}

export function throwPotion(at) {
  const h = state.hero;
  if (h.down > 0) return false;
  if (state.potion <= 0) { burst(h.x, h.y - 0.8, 'empty'); say(LINES.noPotion); return false; }
  let best = null, bd = at ? 1.2 : 2.2;
  const px = at ? at.x : h.x, py = at ? at.y : h.y;
  state.zombies.forEach((z) => {
    if (z.big) return;
    const d = Math.hypot(z.x - px, z.y - py);
    if (d < bd && Math.hypot(z.x - h.x, z.y - h.y) < 3.5) { bd = d; best = z; }
  });
  if (!best) { burst(h.x, h.y - 0.8, 'too far'); return false; }
  state.potion--;
  cure(best);
  return true;
}
