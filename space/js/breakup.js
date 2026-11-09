/* ===========================================================
   BREAKUP: how a boss breaks apart

   1. Glowing cracks spread out from the middle of the boss
      (drawn in js/bosses.js while it is dying).
   2. Bangs go off along the cracks.
   3. The boss splits along the cracks. Each piece is the same
      boss picture, cut out along two cracks, and flies off
      spinning and smoking, falling down the screen.

   The cracks are lines from the middle out past the edge, with
   a kink or two in each, so no two bosses break the same way.
   Points are in "boss units": -0.5 to 0.5 across the boss.
   =========================================================== */

import { ctx, art } from './canvas.js';
import * as fx from './fx.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

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

// Draw one piece: the boss picture, clipped to the piece's shape.
function drawPiece(p, k) {
  const set = p.set;
  if (!set) return;
  ctx.save();
  ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.scale(1 - 0.12 * k, 1 - 0.12 * k);
  // The piece's own middle is (cx, cy); the boss's middle is offset from it.
  ctx.translate(-p.cx * p.w, -p.cy * p.h);
  ctx.beginPath();
  p.poly.forEach(([x, y], i) => (i ? ctx.lineTo(x * p.w, y * p.h) : ctx.moveTo(x * p.w, y * p.h)));
  ctx.closePath();
  ctx.clip();
  // Glowing hot at first, then cooling down.
  ctx.drawImage(set.img, -p.w / 2, -p.h / 2, p.w, p.h);
  if (k < 0.25) {
    ctx.globalAlpha *= 1 - k / 0.25;
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(set.red, -p.w / 2, -p.h / 2, p.w, p.h);
  }
  ctx.restore();
}

// Step 3: split into pieces that fly apart.
//   pieces  false: no big pieces (a boss that shrank to nothing)
//   shards  how many little bits fly out
//   ice     true for bits of ice instead of metal
export function breakApart(boss, { pieces = true, shards = 16, ice = false } = {}) {
  boss.broken = true;                 // stop drawing the whole boss
  if (calm.matches) return;           // calm mode: the big bang is enough
  const { w, h } = boss;
  const set = art(boss.art, { tint: boss.tint || '' });
  const n = pieces ? boss.cracks.length : 0;

  for (let i = 0; i < n; i++) {
    const c0 = boss.cracks[i];
    const c1 = boss.cracks[(i + 1) % n];
    const a0 = c0.a;
    const a1 = i + 1 < n ? c1.a : c1.a + Math.PI * 2;
    // The piece: out along one crack, round the outside, back along the next.
    const poly = c0.pts.map(([x, y]) => [x, y]);
    for (let k = 0; k <= 6; k++) {
      const a = a0 + ((a1 - a0) * k) / 6;
      poly.push([Math.cos(a) * 1.3, Math.sin(a) * 1.3]);
    }
    for (const pt of c1.pts.slice(1).reverse()) poly.push(pt);

    const mid = (a0 + a1) / 2;
    const cx = Math.cos(mid) * 0.28;     // the middle of this piece
    const cy = Math.sin(mid) * 0.28;
    // Push it out from the middle, a little upward, then let it fall.
    const speed = 40 + Math.random() * 35;
    fx.add('piece', boss.x + cx * w, boss.y + cy * h, 3.4, {
      draw: drawPiece, set, poly, cx, cy, w, h,
      vx: Math.cos(mid) * speed * 1.4,
      vy: Math.sin(mid) * speed - 45,
      gravity: 110,
      vr: ((Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60) * Math.PI) / 180,
      // Fire and smoke pour off the broken edge as it goes.
      tick(p, dt) {
        p.puffWait = (p.puffWait || 0) - dt;
        if (p.puffWait <= 0 && p.t < 2.5) { p.puffWait = 0.3; fx.puff(p.x, p.y, p.t < 0.9); }
      },
    });
  }

  // Metal shards: little dark bits with hot edges.
  for (let i = 0; i < shards; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 160 + Math.random() * 200;
    fx.add('shard', boss.x + (Math.random() - 0.5) * w * 0.4, boss.y + (Math.random() - 0.5) * h * 0.4, 1.4 + Math.random() * 0.6, {
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, gravity: 260,
      vr: (Math.random() - 0.5) * 16, size: 8 + Math.random() * 12,
      draw: drawShard, ice,
    });
  }
}

function drawShard(p, k) {
  ctx.save();
  ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const s = p.size;
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  // Ice shards are pale blue and white; metal ones dark with hot edges.
  g.addColorStop(0, p.ice ? '#ffffff' : '#ffb35a');
  g.addColorStop(0.35, p.ice ? '#bfe8ff' : '#5a5f78');
  g.addColorStop(1, p.ice ? '#5aa8e0' : '#2a2d40');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-s / 2, -s / 2);
  ctx.lineTo(s / 2, -s / 5);
  ctx.lineTo(-s / 10, s / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
