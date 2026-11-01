/* ===========================================================
   COLLIDE: did two things touch?

   Everything in this game is treated as a circle. Two circles
   touch when the gap between their middles is smaller than
   their two sizes added together. That's all.
   =========================================================== */

import { state, H } from './state.js';

export function touching(a, b, extra = 0) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const r = a.r + b.r + extra;
  return dx * dx + dy * dy < r * r;
}

// Everything your shots can hit right now: enemies, base parts,
// and the bits of a boss that are open. Each has an onHit().
export function targets() {
  const list = [];
  for (const e of state.enemies) if (!e.dead && e.wait <= 0) list.push(e);
  for (const p of state.parts) if (p.alive && p.hittable && p.y > -20 && p.y < H + 20) list.push(p);
  for (const boss of state.bosses) for (const p of boss.parts) if (p.alive && p.open) list.push(p);
  return list;
}
