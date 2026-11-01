/* ===========================================================
   FX: the bangs, sparks, floating scores and big words

   Every effect is a little box added to the fx layer with a CSS
   animation (in css/game.css), then thrown away when it is done.
   Every kill gets the same four beats: flash, bang, score, token.
   =========================================================== */

import { state } from './state.js';
import { layer } from './art.js';

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

// A fireball, with bits flying out of it.
export function boom(x, y, size = 60, bits = 6) {
  add('boom', x, y, size, size, 520);
  for (let i = 0; i < bits; i++) {
    const a = (i / bits) * Math.PI * 2 + Math.random() * 0.6;
    const d = size * (0.6 + Math.random() * 0.6);
    add('bit', x, y, 8, 8, 640, {
      '--from': `translate(${x - 4}px, ${y - 4}px)`,
      '--to': `translate(${x - 4 + Math.cos(a) * d}px, ${y - 4 + Math.sin(a) * d}px)`,
    });
  }
}

export function spark(x, y) {
  add('spark', x, y, 14, 14, 160).style.transform = `translate(${x - 7}px, ${y - 7}px)`;
}

export function floatText(x, y, text, big = false) {
  const el = add(big ? 'float big' : 'float', x, y, 10, 10, 950);
  el.textContent = text;
  el.style.setProperty('--at', `translate(${x - text.length * (big ? 8 : 5)}px, ${y - 10}px)`);
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

export function shake() {
  if (calm.matches) return;
  const field = document.getElementById('field');
  field.classList.remove('shake');
  void field.offsetWidth;            // restart the animation
  field.classList.add('shake');
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

// The boss cracks into chunks that drift off. No blood, just rock.
export function chunks(x, y) {
  const spots = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  spots.forEach(([dx, dy], i) => {
    add('chunk', x, y, 80, 60, 2600, {
      '--from': `translate(${x - 40 + dx * 40}px, ${y - 30 + dy * 30}px)`,
      '--to': `translate(${x - 40 + dx * 260}px, ${y - 30 + dy * 200 + 160}px)`,
      '--spin': `${(i % 2 ? 1 : -1) * 120}deg`,
    });
  });
}

let bannerTimer = 0;
export function banner(text) {
  const el = document.getElementById('banner');
  el.textContent = text;
  el.className = 'banner';
  void el.offsetWidth;
  el.classList.add('show');
  if (text === 'WARNING') el.classList.add('warn');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { el.className = 'banner'; }, 4200);
}

export function clearFx() {
  layer('fx').replaceChildren();
  const el = document.getElementById('banner');
  el.className = 'banner';
  el.textContent = '';
}
