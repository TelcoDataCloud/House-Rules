/* ===========================================================
   BREAKUP: how a boss breaks apart

   1. Glowing cracks spread out from the middle of the boss.
   2. Bangs go off along the cracks.
   3. The boss splits along the cracks. Each piece is the same
      boss picture, cut out with a clip-path, and flies off
      spinning and smoking, falling down the screen.

   The cracks are lines from the middle out past the edge, with
   a kink or two in each, so no two bosses break the same way.
   Points are in "boss units": -0.5 to 0.5 across the boss.
   =========================================================== */

import { layer } from './art.js';
import * as fx from './fx.js';

const SVG = 'http://www.w3.org/2000/svg';
const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
let maskId = 0;

export function makeCracks(n) {
  const cracks = [];
  const start = Math.random() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = start + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const pts = [[0, 0]];
    for (const r of [0.2, 0.42, 0.8]) {
      const k = a + (Math.random() - 0.5) * 0.45;
      pts.push([Math.cos(k) * r, Math.sin(k) * r]);
    }
    cracks.push({ a, pts });
  }
  return cracks.sort((p, q) => p.a - q.a);
}

// Where a crack point is on the screen.
export function crackSpot(boss, [x, y]) {
  return [boss.x + x * boss.w, boss.y + y * boss.h];
}

// Step 1: the glowing cracks, drawn on top of the boss. A mask made
// from the boss picture keeps them on the metal, not in empty space.
export function showCracks(boss, seconds) {
  const { w, h } = boss;
  const id = `crack-mask-${++maskId}`;
  const svg = document.createElementNS(SVG, 'svg');
  svg.classList.add('cracks');
  svg.setAttribute('aria-hidden', 'true');
  let lines = '';
  boss.cracks.forEach((c, i) => {
    const pts = c.pts.map(([x, y]) => `${((0.5 + x) * w).toFixed(1)},${((0.5 + y) * h).toFixed(1)}`).join(' ');
    lines += `<polyline points="${pts}" pathLength="1" style="animation-delay:${(i * 0.12).toFixed(2)}s;animation-duration:${seconds}s"/>`;
  });
  svg.innerHTML = `<mask id="${id}" mask-type="alpha" style="mask-type:alpha">
      <svg width="${w}" height="${h}"><use href="#art-${boss.el.dataset.art}" width="100%" height="100%"/></svg>
    </mask>
    <g mask="url(#${id})">${lines}</g>`;
  boss.el.appendChild(svg);
}

// Step 3: split into pieces that fly apart.
export function breakApart(boss) {
  boss.el.hidden = true;
  if (calm.matches) return;          // calm mode: the big bang is enough
  const { w, h } = boss;
  const art = boss.el.dataset.art;
  const tint = boss.cfg.tint ? ` tint-${boss.cfg.tint}` : '';
  const n = boss.cracks.length;
  const pc = (x, y) => `${((0.5 + x) * 100).toFixed(1)}% ${((0.5 + y) * 100).toFixed(1)}%`;

  for (let i = 0; i < n; i++) {
    const c0 = boss.cracks[i];
    const c1 = boss.cracks[(i + 1) % n];
    const a0 = c0.a;
    const a1 = i + 1 < n ? c1.a : c1.a + Math.PI * 2;
    // The piece: out along one crack, round the outside, back along the next.
    const poly = c0.pts.map(([x, y]) => pc(x, y));
    for (let k = 0; k <= 6; k++) {
      const a = a0 + ((a1 - a0) * k) / 6;
      poly.push(pc(Math.cos(a) * 1.3, Math.sin(a) * 1.3));
    }
    for (const [x, y] of c1.pts.slice(1).reverse()) poly.push(pc(x, y));

    const mid = (a0 + a1) / 2;
    const cx = Math.cos(mid) * 0.28;     // the middle of this piece
    const cy = Math.sin(mid) * 0.28;
    const el = document.createElement('div');
    el.className = `thing piece${tint}`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.clipPath = `polygon(${poly.join(', ')})`;
    el.style.transformOrigin = pc(cx, cy);
    el.innerHTML = `<svg aria-hidden="true"><use href="#art-${art}" width="100%" height="100%"/></svg>`;
    layer('fx').appendChild(el);

    // Push it out from the middle, a little upward, then let it fall.
    const speed = 40 + Math.random() * 35;
    const vx = Math.cos(mid) * speed * 1.4;
    const vy = Math.sin(mid) * speed - 45;
    const gravity = 110;
    const spin = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60);
    const T = 3.4;
    const left = boss.x - w / 2;
    const top = boss.y - h / 2;
    const where = (t) => [vx * t, vy * t + 0.5 * gravity * t * t];
    const frames = [];
    for (let s = 0; s <= 14; s++) {
      const t = (T * s) / 14;
      const [dx, dy] = where(t);
      frames.push({
        transform: `translate(${(left + dx).toFixed(1)}px, ${(top + dy).toFixed(1)}px) rotate(${(spin * t).toFixed(1)}deg) scale(${(1 - 0.12 * (t / T)).toFixed(3)})`,
        filter: s === 0 ? 'brightness(2.4) sepia(0.6)' : s < 3 ? 'brightness(1.4) sepia(0.3)' : `brightness(${(1 - 0.4 * (t / T)).toFixed(2)})`,
        opacity: s < 10 ? 1 : 1 - (s - 10) / 4,
      });
    }
    el.animate(frames, { duration: T * 1000, easing: 'linear', fill: 'forwards' });
    setTimeout(() => el.remove(), T * 1000 + 50);

    // Fire and smoke pouring off the broken edge as it goes.
    for (const t of [0.1, 0.3, 0.55, 0.85, 1.2, 1.6, 2.0, 2.5]) {
      setTimeout(() => {
        const [dx, dy] = where(t);
        fx.puff(boss.x + cx * w * 0.6 + dx, boss.y + cy * h * 0.6 + dy, t < 0.9);
      }, t * 1000);
    }
  }

  // Metal shards: little dark bits with hot edges.
  for (let i = 0; i < 16; i++) shard(boss.x, boss.y, w, h);
}

function shard(x, y, w, h) {
  const el = document.createElement('div');
  el.className = 'shard';
  const s = 8 + Math.random() * 12;
  el.style.width = `${s}px`;
  el.style.height = `${s * (0.6 + Math.random() * 0.6)}px`;
  layer('fx').appendChild(el);
  const a = Math.random() * Math.PI * 2;
  const sp = 160 + Math.random() * 200;
  const x0 = x + (Math.random() - 0.5) * w * 0.4 - s / 2;
  const y0 = y + (Math.random() - 0.5) * h * 0.4 - s / 2;
  const spin = (Math.random() - 0.5) * 900;
  const T = 1.4 + Math.random() * 0.6;
  const frames = [];
  for (let k = 0; k <= 8; k++) {
    const t = (T * k) / 8;
    frames.push({
      transform: `translate(${(x0 + Math.cos(a) * sp * t).toFixed(1)}px, ${(y0 + Math.sin(a) * sp * t + 0.5 * 260 * t * t).toFixed(1)}px) rotate(${(spin * t).toFixed(0)}deg)`,
      opacity: k < 6 ? 1 : 1 - (k - 5) / 3,
    });
  }
  el.animate(frames, { duration: T * 1000, easing: 'linear', fill: 'forwards' });
  setTimeout(() => el.remove(), T * 1000 + 50);
}
