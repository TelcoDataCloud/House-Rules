/* ===========================================================
   DAMAGE: things that are broken, burning and smoking

   When a gun, a fuel tank or a crate on a base is blown up, it
   doesn't just vanish. It explodes, then leaves a scorched crater
   with a burning wreck in it, smoke rising off it, until it slides
   off the screen.

   Bosses do the same: every gun or engine you shoot off leaves a
   burning hole that keeps pouring out fire, smoke and sparks. And
   the more you hurt a boss, the worse it looks: light smoke, then
   fire and black smoke, then little explosions all over it.

   Everything here is drawn on the canvas with the particles from
   js/fx.js.
   =========================================================== */

import { ctx, radial } from './canvas.js';
import * as fx from './fx.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

// --- particles that rise off fires ---

// Smoke: drifts up the screen (away from you) and spreads out.
// dark = black smoke from a bad fire; light = grey wisps.
// ground: how fast the ground under it is moving (it drifts along with it).
export function smoke(x, y, size = 16, dark = false, ground = 0) {
  fx.add('smoke', x, y, 1.2 + Math.random() * 0.6, {
    size, vx: (Math.random() - 0.5) * 14, vy: ground - 26 - Math.random() * 18,
    tint: dark ? '28,22,24' : '90,86,92', layer: ground ? 0 : 1,
  });
}

// A flame licking up off something that is burning.
export function flame(x, y, size = 10, ground = 0) {
  fx.add('flame', x, y, 0.35 + Math.random() * 0.2, {
    size, vx: (Math.random() - 0.5) * 16, vy: ground - 40 - Math.random() * 30, layer: ground ? 0 : 1,
    draw(p, k) {
      const r = p.size * (1 - k * 0.7);
      radial(p.x, p.y, r, [[0, '#fff6c0'], [0.3, '#ffd23f'], [0.65, '#ff7a1a'], [1, 'rgba(255,59,26,0)']], 1 - k, 'lighter');
    },
  });
}

// Sparks: bright orange dots that spray out and fall.
export function sparks(x, y, n = 4) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
    const sp = 60 + Math.random() * 120;
    fx.add('bit', x, y, 0.4 + Math.random() * 0.3, {
      size: 2 + Math.random() * 2, colour: Math.random() < 0.5 ? '#ffd23f' : '#ff9a2a',
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, gravity: 260, vr: 10,
    });
  }
}

// Bits of metal and crate flying out of a blast.
export function debris(x, y, n = 8, colours = ['#3a3f56', '#5a6078', '#8a90a8', '#ffb35a']) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 80 + Math.random() * 180;
    fx.add('bit', x, y, 0.7 + Math.random() * 0.5, {
      size: 3 + Math.random() * 6, colour: colours[i % colours.length],
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.2, vr: (Math.random() - 0.5) * 20,
    });
  }
}

// --- the big bang when something on the ground goes up ---

// How each kind of base part blows up.
//   boom     how big the fireball is (times the part's size)
//   pops     extra little bangs after the first (missiles cooking off)
//   fire     how much it keeps burning afterwards (0 none, 1 small, 2 big)
//   bits     colours of the debris
const BLASTS = {
  turret:  { boom: 1.4, pops: 0, fire: 1, bits: ['#3a3f56', '#5a6078', '#ff3b3b'] },
  missile: { boom: 1.3, pops: 4, fire: 2, bits: ['#3a3f56', '#6b6a48', '#ff3b3b'] },
  tank:    { boom: 2.4, pops: 1, fire: 2, bits: ['#ff7a1a', '#3a3f56', '#ffd23f'] },
  hangar:  { boom: 1.2, pops: 2, fire: 1, bits: ['#5a6078', '#8a90a8', '#3a3f56'] },
  dish:    { boom: 1.2, pops: 0, fire: 0, bits: ['#d8dcea', '#8a90a8', '#3a3f56'] },
  cargo:   { boom: 1.1, pops: 0, fire: 0, bits: ['#6b5a32', '#8a6a3a', '#5a6a48', '#a87a3a'] },
  pylon:   { boom: 1.2, pops: 0, fire: 0, bits: ['#38f0ff', '#5a6078', '#8a90a8'], zap: true },
  reactor: { boom: 1.6, pops: 5, fire: 2, bits: ['#ff3fa4', '#38f0ff', '#3a3f56'] },
};

export function blowUp(part) {
  const b = BLASTS[part.kind] || BLASTS.turret;
  const size = Math.max(part.w, part.h);
  fx.boom(part.x, part.y, size * b.boom, 0, '#ff7a1a');
  debris(part.x, part.y, 10, b.bits);
  smoke(part.x, part.y, size * 0.5, true);
  if (b.zap) for (let i = 0; i < 6; i++) fx.add('spark', part.x + (Math.random() - 0.5) * 40, part.y + (Math.random() - 0.5) * 40, 0.3);
  // Missiles left inside cook off: little bangs one after another.
  for (let i = 0; i < b.pops; i++) {
    const t = 0.15 + i * 0.13 + Math.random() * 0.1;
    setTimeout(() => {
      if (part.plate && part.plate.gone) return;
      fx.boom(part.x + (Math.random() - 0.5) * size * 0.6, part.y + (Math.random() - 0.5) * size * 0.6, size * 0.45, 3);
    }, t * 1000);
  }
  part.burn = b.fire;
  part.crater = 0.55 + Math.random() * 0.15;
  part.seed = Math.random() * 1000;
}

// A wreck on the ground keeps burning and smoking. Called every frame.
export function smoulder(part, dt, ground) {
  if (calm.matches) return;
  part.smokeWait = (part.smokeWait || 0) - dt;
  if (part.smokeWait > 0) return;
  part.smokeWait = part.burn === 2 ? 0.12 : part.burn === 1 ? 0.22 : 0.45;
  const size = Math.max(part.w, part.h);
  const ox = (Math.random() - 0.5) * size * 0.3;
  const oy = (Math.random() - 0.5) * size * 0.3;
  smoke(part.x + ox, part.y + oy, size * (part.burn ? 0.55 : 0.4), part.burn === 2, ground);
  if (part.burn) flame(part.x + ox, part.y + oy, size * (part.burn === 2 ? 0.22 : 0.14), ground);
}

// The scorched crater under a wreck: a dark burnt patch with a
// jagged edge, and a glowing hot middle while it still burns.
export function drawCrater(part, time) {
  const r = Math.max(part.w, part.h) * part.crater;
  ctx.save();
  ctx.translate(part.x, part.y);
  ctx.fillStyle = 'rgba(14, 10, 10, 0.75)';
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const wob = r * (0.78 + 0.22 * Math.abs(Math.sin(part.seed + i * 1.7)));
    if (i) ctx.lineTo(Math.cos(a) * wob, Math.sin(a) * wob); else ctx.moveTo(Math.cos(a) * wob, Math.sin(a) * wob);
  }
  ctx.fill();
  ctx.restore();
  radial(part.x, part.y, r, [[0, 'rgba(0,0,0,0.5)'], [0.7, 'rgba(30,20,16,0.35)'], [1, 'rgba(30,20,16,0)']]);
  if (part.burn) {
    const glow = 0.5 + 0.3 * Math.sin(time * 9 + part.seed);
    radial(part.x, part.y, r * 0.6, [[0, 'rgba(255,150,40,0.7)'], [0.5, 'rgba(255,80,20,0.35)'], [1, 'rgba(255,60,20,0)']], glow, 'lighter');
  }
}

// --- bosses ---

// A hole where a gun or engine was, on a boss. Drawn every frame.
export function drawHole(x, y, size, time) {
  radial(x, y, size * 0.55, [[0, 'rgba(8,6,8,0.95)'], [0.6, 'rgba(20,14,14,0.85)'], [1, 'rgba(20,14,14,0)']]);
  // The torn metal glows red-hot round the edge.
  const glow = 0.5 + 0.3 * Math.sin(time * 8 + x);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = glow;
  ctx.strokeStyle = '#ff6a1a';
  ctx.shadowColor = '#ff3b1a';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const r = size * (0.3 + 0.08 * Math.sin(i * 2.3 + x));
    if (i) ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); else ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.stroke();
  ctx.restore();
}

// Fire, smoke and sparks pouring out of a boss's holes, and more
// smoke and bangs the more it is hurt. Called every frame.
//   holes  the [x, y] of every broken part
//   hurt   0 (fine) to 1 (nearly dead)
//   last   true in LAST STAND: the worst of all
export function bossDamage(boss, holes, hurt, last, dt) {
  if (calm.matches) return;
  boss.fireWait2 = (boss.fireWait2 || 0) - dt;
  if (boss.fireWait2 > 0) return;
  boss.fireWait2 = 0.07;
  for (const [x, y] of holes) {
    if (Math.random() < 0.7) flame(x, y, 12);
    if (Math.random() < 0.55) smoke(x, y, 26, true);
    if (Math.random() < 0.15) sparks(x, y, 3);
  }
  // Somewhere on the hull, as it gets worse.
  const spot = () => [boss.x + (Math.random() - 0.5) * boss.w * 0.7, boss.y + (Math.random() - 0.5) * boss.h * 0.6];
  if (hurt > 0.34 && Math.random() < 0.35) { const [x, y] = spot(); smoke(x, y, 28, false); }
  if (hurt > 0.67 && Math.random() < 0.5) { const [x, y] = spot(); smoke(x, y, 32, true); flame(x, y, 13); }
  if (hurt > 0.67 && Math.random() < 0.06) { const [x, y] = spot(); fx.boom(x, y, 40, 4); sparks(x, y, 6); }
  if (last && Math.random() < 0.6) {
    const [x, y] = spot();
    smoke(x, y, 38, true);
    if (Math.random() < 0.12) debris(x, y, 3);
  }
}
