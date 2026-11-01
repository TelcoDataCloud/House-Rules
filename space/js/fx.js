/* ===========================================================
   FX: the bangs, sparks, floating scores and big words

   Every effect is a little box added to the fx layer with a CSS
   animation (in css/game.css), then thrown away when it is done.
   Every kill gets the same beats: white flash, fireball with
   bits flying out, a puff of smoke, and the score floating up.
   =========================================================== */

import { state } from './state.js';
import { layer } from './art.js';
import { say } from './voice.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

function add(className, x, y, w, h, life, extra = {}) {
  const el = document.createElement('div');
  el.className = className;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.setProperty('--at', `translate(${x - w / 2}px, ${y - h / 2}px)`);
  for (const [k, v] of Object.entries(extra)) el.style.setProperty(k, v);
  layer('fx').appendChild(el);
  setTimeout(() => el.remove(), life);
  return el;
}

const BIT_COLOURS = ['#ffd23f', '#ff7a1a', '#ffffff'];

// A fireball, a shock ring, smoke, and bits flying out of it.
// colour is the colour of the ship that went bang.
export function boom(x, y, size = 60, bits = 8, colour = '#ff7a1a') {
  add('smoke', x, y, size * 1.3, size * 1.3, 900);
  add('boom', x, y, size, size, 520);
  add('shock', x, y, size, size, 420);
  for (let i = 0; i < bits; i++) {
    const a = (i / bits) * Math.PI * 2 + Math.random() * 0.7;
    const d = size * (0.7 + Math.random() * 0.8);
    const s = 4 + Math.random() * 7;
    const el = add('bit', x, y, s, s, 760, {
      '--from': `translate(${x - s / 2}px, ${y - s / 2}px)`,
      '--to': `translate(${x - s / 2 + Math.cos(a) * d}px, ${y - s / 2 + Math.sin(a) * d}px)`,
    });
    el.style.background = i % 2 ? colour : BIT_COLOURS[i % 3];
  }
}

export function spark(x, y) {
  add('spark', x, y, 16, 16, 160).style.transform = `translate(${x - 8}px, ${y - 8}px)`;
}

// The edge of a mine's bang, so you can see how far it reached.
export function mineRing(x, y, r) {
  add('mine-ring', x, y, r * 2, r * 2, 450);
}

// A grey puff of smoke behind an enemy rocket.
export function smokePuff(x, y) {
  add('rocket-smoke', x, y, 12, 12, 500);
}

// A little pink puff behind a homing missile.
export function trail(x, y) {
  add('trail', x, y, 10, 10, 320);
}

// Words that float up and fade, above where something was.
export function floatText(x, y, text, big = false) {
  const el = add(big ? 'float big' : 'float', x, y, 10, 10, 1100);
  el.textContent = text;
  const half = text.length * (big ? 8 : 5.5);
  el.style.setProperty('--at', `translate(${Math.max(4, Math.min(470 - half * 2, x - half))}px, ${y - 16}px)`);
}

// Add points to the score and show them floating up.
export function award(points, x, y) {
  if (!points) return;
  state.score += points;
  floatText(x, y, `+${points}`, points >= 1000);
}

export function bombRing(x, y) {
  add('ring', x, y, 40, 40, 760);
  flash();
  shake();
}

export function flash() {
  if (calm.matches) return;
  const el = document.createElement('div');
  el.className = 'flash';
  document.getElementById('field').appendChild(el);
  setTimeout(() => el.remove(), 380);
}

export function shake(big = false) {
  if (calm.matches) return;
  const field = document.getElementById('field');
  field.classList.remove('shake', 'shake-big');
  void field.offsetWidth;            // restart the animation
  field.classList.add(big ? 'shake-big' : 'shake');
}

// The pilot floats off in a bubble, waving. Nobody gets hurt.
export function pilot(x, y) {
  const el = add('pilot', x, y, 48, 48, 2450);
  el.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="rgba(56,240,255,0.15)" stroke="#38f0ff" stroke-width="3"/>
    <circle cx="32" cy="28" r="9" fill="#ffd23f"/>
    <circle cx="29" cy="27" r="1.5" fill="#070b1c"/><circle cx="35" cy="27" r="1.5" fill="#070b1c"/>
    <path d="M29 31 Q32 34 35 31" stroke="#070b1c" stroke-width="1.5" fill="none"/>
    <rect x="24" y="38" width="16" height="12" rx="4" fill="#38f0ff"/>
    <path d="M40 40 L48 30" stroke="#38f0ff" stroke-width="4" stroke-linecap="round"/>
    <path d="M18 26 Q14 18 22 14" stroke="#ffffff" stroke-width="2" fill="none"/>
  </svg>`;
}

// The railgun: a bright line straight up from the nose, gone in a blink.
export function rail(x, y, level = 1) {
  const w = 4 + level * 2;
  const el = add('rail', x, y / 2, w, y + 20, 260);
  el.style.setProperty('--at', `translate(${x - w / 2}px, -20px)`);
  add('rail-ring', x, y, 26 + level * 4, 26 + level * 4, 260);
}

// An enemy orb shot out of the air: a small pop.
export function pop(x, y, colour = 'pink') {
  add(`shock pop-${colour}`, x, y, 26, 26, 420);
  add('boom', x, y, 18, 18, 520);
}

// A puff of smoke (and fire, if hot) behind a falling boss piece.
export function puff(x, y, hot = true) {
  add('smoke', x, y, 40, 40, 900);
  if (hot) add('boom', x, y, 26, 26, 520);
}

let bannerTimer = 0;
export function banner(text, kind = '') {
  const el = document.getElementById('banner');
  el.textContent = text;
  el.className = 'banner';
  void el.offsetWidth;
  el.classList.add('show');
  if (text === 'WARNING') el.classList.add('warn');
  if (kind) el.classList.add(kind);
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { el.className = 'banner'; }, 4200);
  say(text);
}

export function clearFx() {
  layer('fx').replaceChildren();
  const el = document.getElementById('banner');
  el.className = 'banner';
  el.textContent = '';
}
