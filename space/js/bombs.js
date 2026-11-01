/* ===========================================================
   BOMBS: what happens when you press Space

   Five kinds, from data/bombs.js. Every one wipes the enemy
   shots off the screen first, so a bomb always gets you out of
   trouble. Then each one hurts things in its own way:

     he       one big bang just in front of the ship
     cluster  little bombs fly to the nearest enemies and pop
     plasma   a wall of fire rolls up the screen, hitting all it touches
     laser    a giant laser straight up that follows you for 2 seconds
     nuke     a white flash and everything on screen gets hit

   Hits from a bomb say 'bomb', so a boss only takes a little bit
   (BOSS_SHARE in data/bombs.js).
   =========================================================== */

import { state, W, H, after } from './state.js';
import { layer } from './art.js';
import { targets } from './collide.js';
import { clearFoes } from './bullets.js';
import { BOMBS } from '../data/bombs.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

// A box on the fx layer that plays one animation, then goes away.
function show(cls, x, y, w, h, frames, ms) {
  const el = document.createElement('div');
  el.className = cls;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`;
  layer('fx').appendChild(el);
  if (frames && !calm.matches) el.animate(frames, { duration: ms, easing: 'ease-out', fill: 'forwards' });
  else if (frames) el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
  setTimeout(() => el.remove(), ms + 50);
  return el;
}

function hitAround(x, y, size, damage) {
  for (const t of targets()) {
    if (Math.hypot(t.x - x, t.y - y) < size / 2 + t.r) t.onHit(damage, 'bomb');
  }
}

const KINDS = {
  he(lv, s) {
    const x = s.x;
    const y = s.y - 170;
    show('bomb-shell', s.x, s.y - 30, 16, 22, [
      { transform: `translate(${s.x - 8}px, ${s.y - 41}px)` },
      { transform: `translate(${x - 8}px, ${y - 11}px) scale(1.3)` },
    ], 220);
    after(0.22, () => {
      fx.boom(x, y, lv.size, 18, '#ff7a1a');
      show('bomb-blast', x, y, lv.size, lv.size, [
        { transform: `translate(${x - lv.size / 2}px, ${y - lv.size / 2}px) scale(0.2)`, opacity: 1 },
        { transform: `translate(${x - lv.size / 2}px, ${y - lv.size / 2}px) scale(1.1)`, opacity: 0 },
      ], 600);
      fx.flash();
      fx.shake(true);
      sound.bomb();
      hitAround(x, y, lv.size, lv.damage);
    });
  },

  cluster(lv, s) {
    // Aim at the nearest enemies; spare bomblets spread out ahead.
    const list = targets().filter((t) => t.y > 0 && t.y < s.y)
      .sort((a, b) => Math.hypot(a.x - s.x, a.y - s.y) - Math.hypot(b.x - s.x, b.y - s.y));
    for (let i = 0; i < lv.bomblets; i++) {
      const t = list[i % Math.max(1, list.length)];
      const spread = ((i / Math.max(1, lv.bomblets - 1)) - 0.5) * 360;
      const x = t ? t.x : Math.max(30, Math.min(W - 30, s.x + spread));
      const y = t ? t.y : s.y - 220 - (i % 3) * 60;
      const delay = 0.08 * i;
      after(delay, () => {
        show('bomblet', s.x, s.y, 12, 12, [
          { transform: `translate(${s.x - 6}px, ${s.y - 36}px)` },
          { transform: `translate(${(s.x + x) / 2 - 6}px, ${Math.min(s.y, y) - 70}px)` },
          { transform: `translate(${x - 6}px, ${y - 6}px)` },
        ], 380);
      });
      after(delay + 0.38, () => {
        fx.boom(x, y, lv.size, 8, '#ffd23f');
        sound.pop();
        hitAround(x, y, lv.size, lv.damage);
      });
    }
    sound.bomb();
  },

  plasma(lv, s) {
    // A wall of blue fire from the ship to the top of the screen.
    const hit = new Set();
    const steps = 10;
    const from = s.y;
    show('plasma-wall', W / 2, from, W + 40, 70, [
      { transform: `translate(-20px, ${from - 35}px)`, opacity: 1 },
      { transform: `translate(-20px, ${-80}px)`, opacity: 0.9 },
    ], 900);
    for (let i = 0; i <= steps; i++) {
      after((0.9 * i) / steps, () => {
        const y = from - ((from + 60) * i) / steps;
        for (const t of targets()) {
          if (!hit.has(t) && Math.abs(t.y - y) < 50 + t.r) { hit.add(t); t.onHit(lv.damage, 'bomb'); fx.spark(t.x, t.y); }
        }
      });
    }
    sound.whoosh();
    fx.shake();
  },

  laser(lv, s) {
    // A giant laser that follows your ship for two seconds.
    const el = document.createElement('div');
    el.className = 'laser-bomb';
    el.style.width = `${lv.size}px`;
    layer('fx').appendChild(el);
    const ticks = 20;
    for (let i = 0; i <= ticks; i++) {
      after((2 * i) / ticks, () => {
        const ship = state.ship;
        el.style.height = `${Math.max(0, ship.y - 30)}px`;
        el.style.transform = `translate(${ship.x - lv.size / 2}px, 0px)`;
        for (const t of targets()) {
          if (t.y < ship.y && Math.abs(t.x - ship.x) < lv.size / 2 + t.r) t.onHit(lv.damage / ticks, 'bomb');
        }
        for (const b of state.foes) if (Math.abs(b.x - ship.x) < lv.size / 2) b.dead = true;
        if (i === ticks) el.remove();
      });
    }
    sound.laserBomb();
    fx.shake(true);
  },

  nuke(lv) {
    fx.flash();
    mushroom();
    fx.shake(true);
    sound.bomb();
    after(0.35, () => {
      sound.bomb();
      fx.shake(true);
      for (const t of targets()) { t.onHit(lv.damage, 'bomb'); }
    });
  },
};

// The nuke: one huge mushroom cloud that rises up the middle of the
// screen. A fireball climbs on a column of smoke, then cools to grey.
function mushroom() {
  const w = 420;
  const h = 520;
  const el = document.createElement('div');
  el.className = 'nuke';
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  el.style.transform = `translate(${W / 2 - w / 2}px, ${H - 70 - h}px)`;
  el.innerHTML = `<svg viewBox="0 0 420 520" aria-hidden="true">
    <defs>
      <radialGradient id="nk-fire" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#ffffff"/><stop offset="0.25" stop-color="#fff2a8"/><stop offset="0.5" stop-color="#ff9a2a"/><stop offset="0.8" stop-color="#c2301a"/><stop offset="1" stop-color="#5a1a12"/></radialGradient>
      <radialGradient id="nk-smoke" cx="0.45" cy="0.35" r="0.7"><stop offset="0" stop-color="#b8a89a"/><stop offset="0.6" stop-color="#6a5a52"/><stop offset="1" stop-color="#2a2226"/></radialGradient>
      <linearGradient id="nk-stem" x1="0" x2="1"><stop offset="0" stop-color="#4a3a36"/><stop offset="0.35" stop-color="#ff8a2a"/><stop offset="0.5" stop-color="#fff2a8"/><stop offset="0.65" stop-color="#ff8a2a"/><stop offset="1" stop-color="#4a3a36"/></linearGradient>
    </defs>
    <g class="nk-base"><ellipse cx="210" cy="485" rx="200" ry="34" fill="url(#nk-smoke)"/><ellipse cx="210" cy="480" rx="120" ry="18" fill="#ff9a2a" opacity="0.7"/></g>
    <g class="nk-stem"><path d="M178 490 C186 400 190 300 192 215 L228 215 C230 300 234 400 242 490 Z" fill="url(#nk-stem)"/></g>
    <g class="nk-cap">
      <ellipse cx="210" cy="232" rx="165" ry="30" fill="url(#nk-smoke)" opacity="0.85"/>
      <circle cx="130" cy="180" r="62" fill="url(#nk-smoke)"/><circle cx="290" cy="180" r="62" fill="url(#nk-smoke)"/>
      <circle cx="170" cy="130" r="72" fill="url(#nk-smoke)"/><circle cx="250" cy="130" r="72" fill="url(#nk-smoke)"/>
      <circle cx="210" cy="110" r="80" fill="url(#nk-smoke)"/>
      <g class="nk-glow">
        <circle cx="140" cy="182" r="50" fill="url(#nk-fire)"/><circle cx="280" cy="182" r="50" fill="url(#nk-fire)"/>
        <circle cx="175" cy="135" r="60" fill="url(#nk-fire)"/><circle cx="245" cy="135" r="60" fill="url(#nk-fire)"/>
        <circle cx="210" cy="118" r="68" fill="url(#nk-fire)"/>
      </g>
    </g>
  </svg>`;
  layer('fx').appendChild(el);
  const ms = 3400;
  const part = (sel) => el.querySelector(sel);
  if (!calm.matches) {
    part('.nk-stem').animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)', offset: 0.3 }, { transform: 'scaleY(1.05)' }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
    part('.nk-cap').animate([
      { transform: 'translateY(300px) scale(0.15)' },
      { transform: 'translateY(0) scale(1)', offset: 0.35 },
      { transform: 'translateY(-20px) scale(1.12)' },
    ], { duration: ms, easing: 'ease-out', fill: 'forwards' });
    part('.nk-base').animate([{ transform: 'scaleX(0.2)', opacity: 1 }, { transform: 'scaleX(1.3)', opacity: 0.8 }], { duration: ms, easing: 'ease-out', fill: 'forwards' });
  }
  part('.nk-glow').animate([{ opacity: 1 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0 }], { duration: ms * 0.75, fill: 'forwards' });
  el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: ms, fill: 'forwards' });
  setTimeout(() => el.remove(), ms + 50);
}

export function fireBomb(kind, level) {
  const s = state.ship;
  const lv = BOMBS[kind].levels[level - 1];
  clearFoes();                         // every bomb clears the shots
  fx.floatText(s.x, s.y - 60, BOMBS[kind].name.toUpperCase(), true);
  KINDS[kind](lv, s);
}
