/* ===========================================================
   BOMBS: what happens when you press Space

   Five kinds, from data/bombs.js. Every one wipes the enemy
   shots off the screen first, so a bomb always gets you out of
   trouble. Then each one hurts things in its own way:

     he         one big bang just in front of the ship
     cluster    little bombs fly to the nearest enemies and pop
     lightning  red lightning jumps from enemy to enemy
     laser      a giant laser straight up that follows you for 2 seconds
     nuke       a missile flies to where the enemies are, then a huge
                flash, a shockwave, and a mushroom cloud rising up

   Hits from a bomb say 'bomb', so a boss only takes a little bit
   (BOSS_SHARE in data/bombs.js).

   Everything you see is a particle (js/fx.js), drawn on the canvas.
   =========================================================== */

import { state, W, H, after } from './state.js';
import { ctx, radial } from './canvas.js';
import { targets } from './collide.js';
import { BOMBS, LIGHTNING_FADE } from '../data/bombs.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
const lerp = (a, b, k) => a + (b - a) * k;

// Everything inside the bang gets hit: full in the middle, half at the edge.
function hitAround(x, y, size, damage, edge = 0.5) {
  for (const t of targets()) {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d < size / 2 + t.r) t.onHit(damage * lerp(1, edge, Math.min(1, d / (size / 2))), 'bomb');
  }
}

// A thing that flies from one place to another along a curve.
function fly(from, to, time, look) {
  fx.add('fly', from[0], from[1], time, {
    draw(p, k) {
      const x = lerp(from[0], to[0], k);
      const y = lerp(from[1], to[1], k) - Math.sin(k * Math.PI) * (look.arc || 0);
      look.draw(x, y, k);
    },
    tick(p) {
      if (look.smoke) {
        const k = p.t / p.life;
        if (Math.random() < 0.7) fx.smokePuff(lerp(from[0], to[0], k), lerp(from[1], to[1], k) + 8);
      }
    },
  });
}

function shell(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#3a3f56';
  ctx.strokeStyle = '#10121e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffb35a';
  ctx.fillRect(-4, -9, 8, 5);
  ctx.restore();
}

const KINDS = {
  he(lv, s) {
    const x = s.x;
    const y = s.y - 170;
    fly([s.x, s.y - 30], [x, y], 0.22, { draw: shell });
    after(0.22, () => {
      fx.boom(x, y, lv.size, 18, '#ff7a1a');
      fx.add('shock', x, y, 0.6, { size: lv.size, colour: '#fff6c0', width: 5 });
      fx.flash();
      fx.shake(true);
      sound.bomb();
      hitAround(x, y, lv.size, lv.damage, 0.5);
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
        fly([s.x, s.y - 30], [x, y], 0.38, {
          arc: 70,
          draw: (bx, by) => radial(bx, by, 8, [[0, '#ffffff'], [0.4, '#ffd23f'], [1, 'rgba(166,107,0,0)']], 1, 'lighter'),
        });
      });
      after(delay + 0.38, () => {
        fx.boom(x, y, lv.size, 8, '#ffd23f');
        sound.pop();
        hitAround(x, y, lv.size, lv.damage, 0.8);
      });
    }
    sound.bomb();
  },

  lightning(lv, s) {
    // 1. A crackling ball of red lightning shoots up ahead of you,
    //    to the middle of the enemies (or straight ahead).
    const [tx, ty] = ballTarget(s, lv.size / 2);
    const from = [s.x, s.y - 30];
    fx.add('ball', from[0], from[1], 0.35, {
      draw(p, k) {
        const x = lerp(from[0], tx, k);
        const y = lerp(from[1], ty, k);
        lightningBall(x, y, 14 + 6 * k, p.t, 0.9);
      },
    });
    sound.zap(s.x);
    after(0.35, () => {
      // 2. It bursts: a big sphere of red lightning, crackling arcs
      //    out to the edge, a shock ring, and a red flash.
      const R = lv.size / 2;
      fx.add('tint', 0, 0, 0.3, { draw: (p, k) => screenTint('255,30,50', 0.3 * (1 - k)) });
      fx.add('burst', tx, ty, 1.1, {
        draw(p, k) {
          const r = R * (k < 0.18 ? k / 0.18 : 1);
          const a = k < 0.65 ? 1 : 1 - (k - 0.65) / 0.35;
          lightningBall(tx, ty, r, p.t, a);
        },
      });
      fx.add('shock', tx, ty, 0.45, { size: R * 2 / 1.5, colour: '#ff4a5a', width: 5 });
      fx.flash();
      fx.shake(true);
      sound.thunder();
      // 3. Arcs jump out to the enemies inside it: the nearest first,
      //    a bit weaker after every jump.
      const inside = targets()
        .filter((t) => Math.hypot(t.x - tx, t.y - ty) < R + t.r)
        .sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty))
        .slice(0, lv.jumps);
      inside.forEach((t, i) => {
        after(0.05 + i * 0.04, () => {
          const end = { x: t.x, y: t.y };
          fx.add('bolt', 0, 0, 0.35, { draw: (p, k) => bolt({ x: tx, y: ty }, end, k, p) });
          t.onHit(lv.damage * LIGHTNING_FADE ** i, 'bomb');
          sparks(end.x, end.y, '#ff4a5a', 8);
          if (i % 3 === 0) sound.zap(end.x);
        });
      });
    });
  },

  laser(lv, s) {
    // A giant laser that follows your ship for two seconds.
    fx.add('laserbomb', s.x, s.y, 2, {
      draw(p, k) {
        const ship = state.ship;
        const w = lv.size * (k < 0.08 ? k / 0.08 : k > 0.9 ? (1 - k) / 0.1 : 1) * (0.92 + Math.random() * 0.08);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(ship.x - w / 2, 0, ship.x + w / 2, 0);
        g.addColorStop(0, 'rgba(255,59,59,0)');
        g.addColorStop(0.12, 'rgba(255,59,59,0.75)');
        g.addColorStop(0.32, '#ffd0d0');
        g.addColorStop(0.5, '#ffffff');
        g.addColorStop(0.68, '#ffd0d0');
        g.addColorStop(0.88, 'rgba(255,59,59,0.75)');
        g.addColorStop(1, 'rgba(255,59,59,0)');
        ctx.fillStyle = g;
        ctx.fillRect(ship.x - w / 2, 0, w, Math.max(0, ship.y - 30));
        ctx.restore();
      },
      tick(p, dt) {
        const ship = state.ship;
        for (const t of targets()) {
          if (t.y < ship.y && Math.abs(t.x - ship.x) < lv.size / 2 + t.r) t.onHit(lv.damage * dt, 'bomb');
        }
        for (const b of state.foes) if (Math.abs(b.x - ship.x) < lv.size / 2 && b.y < ship.y) b.dead = true;
      },
    });
    sound.laserBomb();
    fx.shake(true);
  },

  nuke(lv, s) {
    // Where to send it: the boss, or the busiest spot, or straight ahead.
    const [tx, ty] = nukeTarget(s);
    sound.launch();
    fly([s.x, s.y - 30], [tx, ty], 0.4, {
      smoke: true,
      draw: (x, y) => {
        shell(x, y);
        radial(x, y + 12, 8, [[0, '#ffffff'], [0.4, '#ffd23f'], [1, 'rgba(255,122,26,0)']], 1, 'lighter');
      },
    });
    after(0.4, () => {
      state.slow = Math.max(state.slow, 0.6);   // the world slows down
      fx.flash();
      fx.shake(true);
      sound.nuke();
      mushroom(tx, ty);
      for (const t of targets()) t.onHit(lv.damage, 'bomb');
      // Then everything keeps burning for 3 seconds.
      for (let i = 1; i <= 6; i++) {
        after(i * 0.5, () => { for (const t of targets()) t.onHit(lv.burn / 2, 'bomb'); });
      }
    });
  },
};

export function fireBomb(kind, level) {
  const s = state.ship;
  const lv = BOMBS[kind].levels[level - 1];
  // Every bomb clears the enemy shots, with a crackle on each one.
  for (const b of state.foes) if (b.y > -10 && b.y < H) fx.spark(b.x, b.y);
  state.foes.length = 0;
  fx.floatText(s.x, s.y - 60, BOMBS[kind].name.toUpperCase(), true);
  (KINDS[kind] || KINDS.he)(lv, s);
}

// ---------- the pieces of the bombs ----------

// Where the ball of lightning goes: the middle of the most enemies
// it can catch, or straight ahead if there are none.
function ballTarget(s, R) {
  const list = targets().filter((t) => t.y > 30 && t.y < s.y - 80);
  let best = null;
  let bestCount = 0;
  for (const t of list) {
    const n = list.filter((o) => Math.hypot(o.x - t.x, o.y - t.y) < R).length;
    if (n > bestCount) { best = t; bestCount = n; }
  }
  if (best) return [best.x, Math.min(best.y, s.y - 160)];
  return [s.x, Math.max(120, s.y - 240)];
}

// A ball of red lightning: a glowing red core, and jagged arcs
// crackling out from the middle to the edge, new ones every frame.
function lightningBall(x, y, r, t, alpha) {
  radial(x, y, r * 1.15, [[0, 'rgba(255,255,255,0.9)'], [0.2, 'rgba(255,90,100,0.75)'], [0.6, 'rgba(200,0,30,0.35)'], [1, 'rgba(120,0,20,0)']], alpha, 'lighter');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  const arcs = Math.max(5, Math.round(r / 8));
  for (const [w, colour, blur] of [[5, 'rgba(220,20,50,0.6)', 14], [2, '#ff6a78', 6], [0.9, '#ffffff', 0]]) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = w;
    ctx.shadowColor = '#ff2a3a';
    ctx.shadowBlur = blur;
    ctx.beginPath();
    for (let i = 0; i < arcs; i++) {
      // Each arc wanders out from the middle in a zigzag.
      const seed = Math.floor(t * 24) * 97 + i * 13;
      const rnd = (n) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
      let ang = (i / arcs) * Math.PI * 2 + rnd(1);
      ctx.moveTo(x, y);
      const steps = 8;
      for (let j = 1; j <= steps; j++) {
        ang += (rnd(j + 2) - 0.5) * 1.1;
        const d = (r * j) / steps;
        ctx.lineTo(x + Math.cos(ang) * d, y + Math.sin(ang) * d);
      }
    }
    ctx.stroke();
  }
  // A crackling rim round the outside.
  ctx.strokeStyle = 'rgba(255,120,130,0.7)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const wob = r * (0.94 + 0.08 * Math.sin(a * 7 + t * 40));
    const px = x + Math.cos(a) * wob;
    const py = y + Math.sin(a) * wob;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

function screenTint(rgb, alpha) {
  ctx.save();
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function sparks(x, y, colour, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 80 + Math.random() * 160;
    fx.add('bit', x, y, 0.35 + Math.random() * 0.2, { size: 3, colour, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3 });
  }
  fx.spark(x, y);
}

// One jagged lightning bolt from a to b. It flickers: it is redrawn
// with new zigzags a few times, and blinks.
function bolt(a, b, k, p) {
  if (!p.zig || Math.floor(k * 8) !== p.zigAt) {
    p.zigAt = Math.floor(k * 8);
    const n = Math.max(4, Math.floor(Math.hypot(b.x - a.x, b.y - a.y) / 18));
    p.zig = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const off = i === 0 || i === n ? 0 : (Math.random() - 0.5) * 26;
      const nx = -(b.y - a.y);
      const ny = b.x - a.x;
      const len = Math.hypot(nx, ny) || 1;
      p.zig.push([lerp(a.x, b.x, u) + (nx / len) * off, lerp(a.y, b.y, u) + (ny / len) * off]);
    }
  }
  if (Math.floor(k * 12) % 3 === 2) return;   // blink
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 1 - k * 0.6;
  ctx.lineJoin = 'round';
  for (const [width, colour, blur] of [[9, 'rgba(200,0,30,0.6)', 18], [4, '#ff3b4a', 8], [1.6, '#ffffff', 0]]) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.shadowColor = '#ff2a3a';
    ctx.shadowBlur = blur;
    ctx.beginPath();
    p.zig.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.restore();
}

function nukeTarget(s) {
  const boss = state.bosses.find((b) => b.phase === 'fight' || b.phase === 'enter');
  if (boss) return [boss.x, Math.max(260, boss.y)];
  // The busiest spot: the enemy with the most others near it.
  const list = targets().filter((t) => t.y > 40 && t.y < s.y - 60);
  let best = null;
  let bestCount = 0;
  for (const t of list) {
    const n = list.filter((o) => Math.hypot(o.x - t.x, o.y - t.y) < 140).length;
    if (n > bestCount) { best = t; bestCount = n; }
  }
  // Low enough that the mushroom cloud fits on the screen.
  if (best) return [best.x, Math.max(260, best.y)];
  return [s.x, Math.max(120, s.y - 260)];
}

// The mushroom cloud. Lots of smoke balls: a fireball, a ring of dust
// on the ground, a stem rising, and a cap rolling over at the top.
// Lit orange from underneath, cooling to grey. Then embers fall.
function mushroom(x, y) {
  const life = calm.matches ? 1.5 : 3.2;
  // White-out, then an orange tint that fades.
  fx.add('tint', 0, 0, life, {
    draw: (p, k) => {
      if (k < 0.06) screenTint('255,255,255', 0.9 * (1 - k / 0.06));
      else screenTint('255,120,40', 0.22 * (1 - k));
    },
  });
  // The shockwave: a bright ring with a dark ring just inside it,
  // so the world behind looks bent.
  fx.add('shockwave', x, y, 0.9, {
    draw(p, k) {
      const r = 20 + 560 * (1 - (1 - k) * (1 - k));
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.lineWidth = 14 * (1 - k) + 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 10 * (1 - k) + 2;
      ctx.strokeStyle = 'rgba(20,10,30,0.35)';
      ctx.beginPath(); ctx.arc(x, y, Math.max(0, r - 14), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    },
  });
  // The fireball.
  fx.add('fireball', x, y, 1.3, {
    draw(p, k) {
      const r = 30 + 110 * Math.min(1, k * 3);
      radial(x, y, r * 1.4, [[0, 'rgba(255,170,60,0.6)'], [1, 'rgba(255,120,40,0)']], 1 - k, 'lighter');
      radial(x, y, r, [[0, '#ffffff'], [0.25, '#fff2a8'], [0.55, '#ff9a2a'], [0.85, '#c2301a'], [1, 'rgba(90,26,18,0)']], 1 - k * k);
    },
  });
  if (calm.matches) return;
  // A smoke ball: hot and bright when new, grey and dark when old,
  // with orange light from below.
  const ball = (heat0) => (p, k) => {
    const heat = Math.max(0, heat0 - k * 1.4);
    const a = k < 0.8 ? 1 : 1 - (k - 0.8) / 0.2;
    const c = `rgb(${Math.round(lerp(106, 255, heat))},${Math.round(lerp(90, 200, heat * heat))},${Math.round(lerp(82, 120, heat))})`;
    radial(p.x, p.y, p.size, [[0, c], [0.55, `rgba(70,56,52,${0.85 * a})`], [1, 'rgba(40,30,30,0)']], a);
    radial(p.x, p.y + p.size * 0.35, p.size * 0.8, [[0, 'rgba(255,140,50,0.7)'], [1, 'rgba(255,90,30,0)']], a * Math.max(0, 1 - k * 1.3), 'lighter');
  };
  // Dust ring along the ground.
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    fx.add('dust', x, y + 18, life * 0.9, {
      size: 18 + Math.random() * 12, vx: Math.cos(a) * 260, vy: Math.sin(a) * 60, drag: 2.2, draw: ball(0.4),
    });
  }
  // The stem: smoke rushing up from the blast.
  for (let i = 0; i < 18; i++) {
    const delay = i * 0.03;
    const up = 70 + (i / 18) * 90;
    fx.add('stem', x + (Math.random() - 0.5) * 30, y, life - delay, {
      size: 18 + Math.random() * 10, vy: -up, drag: 0.6, draw: ball(1),
      tick(p) { p.size += 0.1; },
    });
  }
  // The cap: a ring of rolling smoke at the top that keeps rising.
  const capY = y - 150;
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const ring = i % 2 ? 1 : 0.6;
    fx.add('cap', x, y - 30, life, {
      size: 26 + Math.random() * 20, draw: ball(1.1), a, ring,
      tick(p) {
        const k = Math.min(1, p.t / 0.8);
        const rise = capY - 25 * (p.t / life);
        const rx = (40 + 70 * k) * p.ring;
        const ry = (16 + 22 * k) * p.ring;
        const roll = p.a + p.t * 0.6;
        p.x = x + Math.cos(roll) * rx;
        p.y = lerp(y - 30, rise, k) + Math.sin(roll) * ry - (1 - p.ring) * 30;
        p.size += 0.15;
      },
    });
  }
  // Glowing embers drifting down afterwards.
  after(0.8, () => {
    for (let i = 0; i < 30; i++) {
      fx.add('ember', x + (Math.random() - 0.5) * 240, y - 150 + (Math.random() - 0.5) * 120, 1.6 + Math.random(), {
        vx: (Math.random() - 0.5) * 30, vy: 40 + Math.random() * 50,
        draw: (p, k) => radial(p.x, p.y, 3, [[0, '#fff2a8'], [0.5, '#ff7a1a'], [1, 'rgba(255,90,30,0)']], 1 - k, 'lighter'),
      });
    }
  });
}
