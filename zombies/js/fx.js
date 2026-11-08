/* ===========================================================
   FX: bursts, splashes, clouds, snot on the screen

   Small pictures that appear for a moment and go away.
   =========================================================== */

import { TILE } from './state.js';
import { el } from './grid.js';

const fx = () => document.getElementById('fx');

export function burst(x, y, word) {
  const t = el('text', { class: 'burst', x: x * TILE, y: y * TILE, 'text-anchor': 'middle' });
  t.textContent = word;
  fx().appendChild(t);
  setTimeout(() => t.remove(), 1000);
}

export function splash(x, y, r = 1.2, colour) {
  const c = el('circle', { class: 'splash', cx: x * TILE, cy: y * TILE, r: r * TILE, style: 'transform-origin:' + (x * TILE) + 'px ' + (y * TILE) + 'px' });
  if (colour) c.style.fill = colour;
  fx().appendChild(c);
  setTimeout(() => c.remove(), 800);
}

export function cloud(x, y, r, seconds) {
  const c = el('circle', { class: 'gascloud', cx: x * TILE, cy: y * TILE, r: r * TILE });
  fx().appendChild(c);
  setTimeout(() => c.remove(), seconds * 1000);
  return c;
}

export function snotScreen() {
  const s = document.getElementById('snot-screen');
  s.classList.remove('on');
  void s.offsetWidth;
  s.classList.add('on');
  setTimeout(() => s.classList.remove('on'), 5200);
}

export function clearFx() { fx().innerHTML = ''; }
