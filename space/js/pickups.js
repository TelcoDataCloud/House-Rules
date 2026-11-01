/* ===========================================================
   PICKUPS: the tokens that fall out of things

   P power, B bomb, S shield, 1UP extra ship.
   They drift down slowly, and if your ship is close they are
   pulled towards you, so they are easy to catch.
   =========================================================== */

import { state, H } from './state.js';
import { put, layer } from './art.js';
import { POWER_BAR, BANK } from '../data/weapons.js';
import { sound } from './audio.js';
import { floatText, banner } from './fx.js';

export function drop(type, x, y) {
  const el = document.createElement('div');
  el.className = 'pickup';
  el.innerHTML = `<span class="token token-${type}">${type}</span>`;
  layer('pickups').appendChild(el);
  const size = type === '1UP' ? 34 : 30;
  state.pickups.push({ type, x, y, r: 14, el, w: size, h: size, vx: (Math.random() - 0.5) * 40 });
}

export function updatePickups(dt) {
  const s = state.ship;
  for (const p of state.pickups) {
    p.y += 55 * dt;
    p.x += p.vx * dt;
    p.vx *= 0.97;
    if (s.dead <= 0) {
      const dx = s.x - p.x;
      const dy = s.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 90) { p.x += (dx / d) * 220 * dt; p.y += (dy / d) * 220 * dt; }
      if (d < 30) collect(p);
    }
    if (p.y > H + 30) p.dead = true;
  }
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const p = state.pickups[i];
    if (p.dead) { p.el.remove(); state.pickups.splice(i, 1); }
    else put(p.el, p.x, p.y, p.w, p.h);
  }
}

function collect(p) {
  const s = state.ship;
  p.dead = true;
  sound.pickup();
  if (p.type === 'P') {
    // Extra power is saved up, up to BANK more full bars.
    if (s.power < POWER_BAR * (BANK + 1)) {
      s.power++;
      if (s.power === POWER_BAR) { banner('PRESS M!'); sound.power(); }
      else if (s.power % POWER_BAR === 0) { floatText(p.x, p.y - 20, 'POWER SAVED!', true); sound.power(); }
    } else {
      state.score += 100;
      floatText(p.x, p.y, '+100');
    }
  }
  if (p.type === 'B') { s.bombs = Math.min(9, s.bombs + 1); floatText(p.x, p.y, 'BOMB'); }
  if (p.type === 'S') { s.shield = true; floatText(p.x, p.y, 'SHIELD'); }
  if (p.type === '1UP') { s.lives = Math.min(9, s.lives + 1); floatText(p.x, p.y, '1UP!', true); }
}
