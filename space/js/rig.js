/* ===========================================================
   RIG: the boss's big weapon, which comes out when it gets angry

   Each kind of big attack has its own hardware (the pictures are
   in the art folder):

     laser      a turret rises out of its back and swings round
                to aim at you (art/weapon-turret.svg)
     missiles   two wings slide out of its sides, with missiles
                on racks (art/weapon-wing.svg)
     lightning  two tesla coils rise up, crackle with lightning
                between them, then strike (art/weapon-tesla.svg)
     plasma     armour doors slide open and show a glowing plasma
                core that fires (art/weapon-door.svg and
                art/weapon-core.svg)

   Omega ('all') brings out every one of them.

   Places are measured from the middle of the boss, as a share of
   its size: x 0.5 is its right edge, y 0.5 its bottom edge.
   =========================================================== */

import { ctx, art, sprite, radial } from './canvas.js';

const ease = (k) => 1 - (1 - k) * (1 - k);

// The turret turns on a point 40px down its picture; its barrel ends
// 76px below that.
const BARREL = 76;

// Where each bit of hardware sits on the boss.
const SPOT = {
  laser: [0, 0.12],
  plasma: [0, 0.32],
  tesla: [0.3, 0.28],      // and the same on the left
  wing: [0.36, 0.05],      // the wing root, under the body's side
};

export function makeRig(boss) {
  const kind = boss.cfg.cannon || 'laser';
  return {
    kinds: kind === 'all' ? ['laser', 'missiles', 'lightning', 'plasma'] : [kind],
    out: 0,                // 0 tucked away, 1 all the way out
    angle: 0,              // where the turret is aiming
    kind: null,            // the attack being fired now
    scale: Math.max(0.55, Math.min(0.9, boss.w / 460)),
  };
}

function at(boss, x, y) {
  return [boss.x + x * boss.w, boss.y + y * boss.h];
}

// Where an attack comes from.
export function rigMuzzle(boss, kind) {
  const r = boss.cannon;
  const s = r.scale;
  if (kind === 'laser') {
    // The end of the turret's barrel: 76px from where it turns,
    // pointing the way it is aiming.
    const [x, y] = at(boss, ...SPOT.laser);
    const a = (r.angle * Math.PI) / 180;
    return [x - Math.sin(a) * BARREL * s, y + Math.cos(a) * BARREL * s];
  }
  if (kind === 'lightning') {
    // Between the two coils.
    const [x, y] = at(boss, 0, SPOT.tesla[1]);
    return [x, y + 10];
  }
  if (kind === 'plasma') return at(boss, ...SPOT.plasma);
  // missiles: the middle, between the wings
  return at(boss, 0, SPOT.wing[1] + 0.2);
}

// Every rocket rack on both wings, for the missile fan.
export function rigFire(boss) {
  const r = boss.cannon;
  const s = r.scale;
  const out = [];
  for (const side of [-1, 1]) {
    const [rx, ry] = at(boss, side * SPOT.wing[0], SPOT.wing[1]);
    // Wing picture is 120 wide; its root is at its inner edge.
    for (const tip of [24, 46, 68, 90]) {
      out.push([rx + side * (120 - tip) * s, ry + 27 * s]);
    }
  }
  return out;
}

// Draw the hardware. 'under' is what sits under the body (the
// wings slide out from under it); 'over' is on top.
export function drawRig(boss, r, layer, jx = 0, jy = 0) {
  const k = ease(r.out);
  const s = r.scale;
  const charging = boss.shot && !boss.shot.firing ? boss.shot.t / boss.shot.warn : 0;
  const firing = boss.shot && boss.shot.firing;
  const now = boss.shot ? boss.shot.kind : null;

  if (layer === 'under' && r.kinds.includes('missiles')) {
    const set = art('weapon-wing');
    for (const side of [-1, 1]) {
      const [rx, ry] = at(boss, side * SPOT.wing[0], SPOT.wing[1]);
      // The wing slides out sideways from under the body.
      const reach = 120 * s * k;
      const cx = rx + side * (reach - 60 * s);
      sprite(set, cx + jx, ry + jy, 120 * s, 70 * s, { flipX: side > 0, shadow: [6, 12, 0.3] });
      if (now === 'missiles' && charging) {
        // The rocket tips glow as they get ready.
        for (const tip of [24, 46, 68, 90]) {
          radial(rx + side * (120 - tip) * s * k, ry + 27 * s, 6 + 6 * charging, [[0, '#fff6c0'], [0.5, '#ff9a2a'], [1, 'rgba(255,122,26,0)']], 0.9, 'lighter');
        }
      }
    }
  }
  if (layer !== 'over') return;

  if (r.kinds.includes('plasma')) {
    const [x, y] = at(boss, ...SPOT.plasma);
    const size = 100 * s;
    // The doors slide apart and the core is under them.
    sprite(art('weapon-core'), x + jx, y + jy, size, size);
    const glow = now === 'plasma' ? 0.4 + 0.6 * (firing ? 1 : charging) : 0.3;
    radial(x, y, size * 0.45, [[0, '#ffffff'], [0.3, '#f0d8ff'], [0.7, 'rgba(176,92,255,0.6)'], [1, 'rgba(176,92,255,0)']], glow * k, 'lighter');
    // Each door picture is 60 wide over the 100 wide core (its hinges
    // stick out past the edge); shut, they meet in the middle.
    const open = size * 0.42 * k;
    sprite(art('weapon-door'), x - size * 0.3 - open + jx, y + jy, size * 0.6, size, {});
    sprite(art('weapon-door'), x + size * 0.3 + open + jx, y + jy, size * 0.6, size, { flipX: true });
  }

  if (r.kinds.includes('lightning')) {
    const coils = [-1, 1].map((side) => at(boss, side * SPOT.tesla[0], SPOT.tesla[1]));
    // The coils rise up: they grow, and their shadows move away.
    const grow = 0.35 + 0.65 * k;
    for (const [x, y] of coils) {
      sprite(art('weapon-tesla'), x + jx, y + jy, 60 * s * grow, 60 * s * grow, { shadow: [10 * k, 18 * k, 0.35] });
    }
    // Lightning crackles between them while they charge.
    if (k > 0.9 && (now === 'lightning' ? true : Math.random() < 0.08)) {
      const strong = now === 'lightning' ? Math.max(charging, firing ? 1 : 0) : 0.3;
      arc(coils[0], coils[1], strong);
      if (now === 'lightning' && charging > 0.4) {
        // Sparks jump from each coil down to the striking point.
        const [mx, my] = rigMuzzle(boss, 'lightning');
        arc(coils[0], [mx, my], strong * 0.7);
        arc(coils[1], [mx, my], strong * 0.7);
      }
    }
  }

  if (r.kinds.includes('laser')) {
    const [x, y] = at(boss, ...SPOT.laser);
    const grow = 0.4 + 0.6 * k;
    const aim = now === 'laser' ? r.angle : 0;
    // The turret rises out of its back (grows), then turns to aim.
    // The picture's middle is 20px below the point it turns on.
    sprite(art('weapon-turret'), x + jx, y + 20 * s * grow + jy, 96 * s * grow, 120 * s * grow, {
      rot: (aim * Math.PI) / 180, oy: -20 * s * grow, shadow: [8 * k, 16 * k, 0.35],
    });
    if (now === 'laser' && charging) {
      const [mx, my] = rigMuzzle(boss, 'laser');
      radial(mx, my, 8 + 20 * charging, [[0, '#ffffff'], [0.4, '#ff3b3b'], [1, 'rgba(255,59,59,0)']], 0.9, 'lighter');
    }
  }
}

// A crackling arc of lightning between two points. (The fortress's
// chain lightning uses it too.)
export function lightningArc(a, b, strength) { arc(a, b, strength); }

function arc([ax, ay], [bx, by], strength) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  const n = 8;
  for (const [w, c, blur] of [[6, `rgba(150,80,255,${0.4 * strength})`, 16], [2.5, `rgba(210,170,255,${strength})`, 8], [1, `rgba(255,255,255,${strength})`, 0]]) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.shadowColor = '#b05cff';
    ctx.shadowBlur = blur;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    for (let i = 1; i < n; i++) {
      const u = i / n;
      ctx.lineTo(ax + (bx - ax) * u + (Math.random() - 0.5) * 18, ay + (by - ay) * u + (Math.random() - 0.5) * 18);
    }
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
  ctx.restore();
}
