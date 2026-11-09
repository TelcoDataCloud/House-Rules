/* ===========================================================
   ATTACKS: each boss's own patterns and LAST STAND

   Every boss in data/bosses.js has:

     phase2     the pattern it fires once it is ANGRY (stage 2)
     lastStand  the special attack it uses in its LAST STAND
                (stage 3, Medium and Hard only)

   Some attacks are shots (they live with the other enemy shots in
   js/bullets.js). Others are DANGERS: a sweeping laser, a jet of
   fire, a wall of fire, a shockwave, lightning between two orbs,
   a black hole. Dangers live in state.dangers, and each one knows
   how to move, how to draw itself and when it hits you.

   Every danger warns you first (a thin line, a flicker, a glow),
   and every one has a way through.
   =========================================================== */

import { state, W, H, hardness, after } from './state.js';
import { ctx, radial, made2d } from './canvas.js';
import { addFoe } from './bullets.js';
import { SHOT_SPEED, spawnWave } from './enemies.js';
import { hitShip } from './ship.js';
import { SHIP } from '../data/ship.js';
import { sound } from './audio.js';
import * as fx from './fx.js';
import { smoke, sparks } from './damage.js';
import { lightningArc } from './rig.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - 2 * (1 - k) * (1 - k));

// --- shots ---

// One shot from a boss gun, in its own kind (data/bosses.js).
// Bullets come in a burst of three. slow < 1 makes a ring gentler.
export function bossShot(x, y, angle, kind = 'pink', slow = 1) {
  const speed = (SHOT_SPEED[kind] || 140) * slow;
  if (kind === 'bullet') {
    for (let i = 0; i < 3; i++) after(i * 0.1, () => addFoe(x, y, angle, speed, 'bullet'));
  } else {
    addFoe(x, y, angle, speed, kind);
  }
}

// A single shot (bullets too: patterns have plenty already).
function shot(x, y, angle, kind, speed = 0) {
  addFoe(x, y, angle, speed || SHOT_SPEED[kind] || 140, kind);
}

// Which way is the ship from here? 0 is straight down.
function toShip(x, y) {
  const s = state.ship;
  return (Math.atan2(s.x - x, s.y - y) * 180) / Math.PI;
}

// Fewer shots on Easy (patternShots in data/difficulty.js).
function many(count) {
  return Math.max(2, Math.round(count * (hardness().patternShots || 1)));
}

const fighting = (boss) => boss.phase === 'fight';
const gun = (boss) => [boss.x, boss.y + boss.h * 0.35];

// Only while the boss is still fighting.
function later(boss, t, fn) {
  after(t, () => { if (fighting(boss)) fn(); });
}

// --- PHASE 2: a pattern for each boss ---
const PATTERNS = {
  // A spray of shots that sweeps across, one way then the other.
  sweep(boss, kind) {
    const n = many(11);
    boss.sweepDir = -(boss.sweepDir || 1);
    for (let i = 0; i < n; i++) later(boss, i * 0.07, () => shot(...gun(boss), boss.sweepDir * (-55 + (110 * i) / (n - 1)), kind));
  },
  // Three quick bursts of three, at you.
  aimed(boss, kind) {
    for (let b = 0; b < 3; b++) later(boss, b * 0.38, () => {
      const [x, y] = gun(boss);
      const a = toShip(x, y);
      for (const k of [-9, 0, 9]) shot(x, y, a + k, kind);
    });
  },
  // Four streams that make a cross. Stay between them.
  cross(boss, kind) {
    const n = many(4);
    for (let i = 0; i < n; i++) later(boss, i * 0.13, () => { for (const a of [-42, -14, 14, 42]) shot(...gun(boss), a, kind); });
  },
  // A spinning spiral from the middle.
  spiral(boss, kind) {
    const n = many(24);
    const turn = Math.random() * 360;
    for (let i = 0; i < n; i++) later(boss, i * 0.065, () => {
      shot(boss.x, boss.y, turn + i * 27, kind, (SHOT_SPEED[kind] || 140) * 0.8);
      shot(boss.x, boss.y, turn + 180 + i * 27, kind, (SHOT_SPEED[kind] || 140) * 0.8);
    });
  },
  // Two walls of shots, each with a gap to fly through.
  walls(boss, kind) {
    const slots = 9;
    let gap = 1 + Math.floor(Math.random() * (slots - 3));
    for (let row = 0; row < 2; row++) {
      later(boss, row * 0.9, () => {
        for (let i = 0; i < slots; i++) {
          if (i === gap || i === gap + 1) continue;
          shot(30 + (i * (W - 60)) / (slots - 1), boss.y + boss.h * 0.4, 0, kind, 110);
        }
        gap = Math.max(0, Math.min(slots - 2, gap + (Math.random() < 0.5 ? -2 : 2)));
      });
    }
  },
  // Mines tossed out across the screen.
  mines(boss) {
    const n = many(3);
    for (let i = 0; i < n; i++) later(boss, i * 0.3, () => shot(...gun(boss), -35 + (70 * i) / Math.max(1, n - 1), 'mine', 120));
  },
  // Rockets fall from the top of the screen. A spark shows where first.
  rain(boss) {
    const n = many(7);
    for (let i = 0; i < n; i++) {
      const x = 40 + Math.random() * (W - 80);
      later(boss, i * 0.25, () => fx.spark(x, 8));
      later(boss, i * 0.25 + 0.5, () => shot(x, -10, 0, 'rocket', 150));
    }
  },
  // Calls in helper ships.
  drones(boss) {
    spawnWave({ what: boss.cfg.escort || 'dart', how: 'row', count: 3 });
  },
  // A wavy stream, snaking left and right.
  wave(boss, kind) {
    const n = many(14);
    for (let i = 0; i < n; i++) later(boss, i * 0.08, () => shot(...gun(boss), Math.sin(i * 0.6) * 40, kind));
  },
  // A different one every time (Omega).
  storm(boss, kind) {
    const list = ['sweep', 'spiral', 'walls', 'aimed', 'cross'];
    PATTERNS[list[Math.floor(Math.random() * list.length)]](boss, kind);
  },
};

export function pattern(boss) {
  const fn = PATTERNS[boss.cfg.phase2];
  if (fn) fn(boss, boss.cfg.phase2Shot || boss.cfg.guns || 'pink');
}

// --- LAST STAND: each boss's special attack ---
const LAST = {
  // Flak shells: they slow down and burst into shards.
  flak(boss) {
    const n = many(5);
    for (let i = 0; i < n; i++) later(boss, i * 0.18, () => {
      const k = i - (n - 1) / 2;
      shot(boss.x + k * 26, boss.y + boss.h * 0.3, k * 14, 'flak', 200);
    });
  },
  // A fan of icicles that shatter into frost.
  ice(boss) {
    const [x, y] = gun(boss);
    const n = many(5);
    const a = toShip(x, y);
    for (let i = 0; i < n; i++) shot(x, y, a + (i - (n - 1) / 2) * 18, 'ice', 190);
    sound.ice(x);
  },
  // Globs of melted rock that fall and splash.
  slag(boss) {
    const n = many(4);
    for (let i = 0; i < n; i++) later(boss, i * 0.22, () => shot(boss.x + (Math.random() - 0.5) * boss.w * 0.5, boss.y + boss.h * 0.3, (Math.random() - 0.5) * 50, 'slag', 80));
    sound.slag(boss.x);
  },
  // Two jets of fire that sweep from side to side.
  flame(boss) {
    boss.hold = Math.max(boss.hold, 3.1);
    for (const side of [-1, 1]) state.dangers.push({ kind: 'flame', boss, side, t: 0, warn: 0.8, time: 2.2, swing: side * 28 });
    after(0.8, () => { if (fighting(boss)) sound.flame(boss.x); });
  },
  // The eye fires a laser that sweeps right across the screen.
  eyelaser(boss) {
    boss.hold = Math.max(boss.hold, 3.6);
    // Start on the far side from you, and sweep towards you and past.
    const from = state.ship.x < boss.x ? 60 : -60;
    state.dangers.push({ kind: 'eyelaser', boss, t: 0, warn: 1.1, time: 2.4, from, to: -from });
    after(1.1, () => { if (fighting(boss)) sound.eyeLaser(); });
  },
  // Two orbs drift down with lightning between them, on and off.
  chain(boss) {
    state.dangers.push({ kind: 'chain', boss, t: 0, cx: boss.x, y: boss.y + boss.h * 0.3 });
  },
  // A black hole: it pulls you in and eats your shots. Then it pops.
  gravity(boss) {
    state.dangers.push({ kind: 'gravity', boss, t: 0, x: boss.x, y: boss.y + boss.h * 0.3, life: 4.5 });
    sound.gravity();
  },
  // Shockwaves roll out from its feet. Fly through the gaps.
  shock(boss) {
    for (let i = 0; i < 2; i++) later(boss, i * 0.7, () => {
      const g = Math.random() * 360;
      state.dangers.push({ kind: 'shock', boss, t: 0, x: boss.x, y: boss.y + boss.h * 0.45, r: 30, gaps: [g, g + 180] });
      sound.shock(boss.x);
      fx.shake(true);
    });
  },
  // A wall of fire comes down the screen, with one gap in it.
  firewall(boss) {
    for (let i = 0; i < 2; i++) later(boss, i * 1.6, () => {
      const gap = 90 + Math.random() * (W - 180);
      state.dangers.push({ kind: 'firewall', boss, t: 0, y: boss.y + boss.h * 0.5, gap });
      sound.fireWall();
    });
  },
  // Omega: a different one each time.
  cycle(boss) {
    const list = ['flak', 'eyelaser', 'chain', 'gravity', 'shock', 'firewall', 'ice', 'slag', 'flame'];
    boss.lastTurn = ((boss.lastTurn ?? -1) + 1) % list.length;
    fx.floatText(boss.x, boss.y + boss.h * 0.6, list[boss.lastTurn].toUpperCase(), true);
    LAST[list[boss.lastTurn]](boss);
  },
};

export function lastStand(boss) {
  const fn = LAST[boss.cfg.lastStand];
  if (fn) fn(boss);
  else PATTERNS.spiral(boss, 'pink');
}

// --- dangers ---

// Is the ship close to the line from (ax, ay) to (bx, by)?
function nearLine(ax, ay, bx, by, width) {
  const s = state.ship;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const k = Math.max(0, Math.min(1, ((s.x - ax) * dx + (s.y - ay) * dy) / len2));
  return Math.hypot(s.x - (ax + dx * k), s.y - (ay + dy * k)) < width / 2 + SHIP.hitSize;
}

const alive = () => state.ship.dead <= 0;

// A ball of fire, painted once and stamped many times (fast).
function fireBall() {
  return made2d('fx|fire', 64, 64, (g) => {
    const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, '#fff6c0');
    glow.addColorStop(0.3, '#ffd23f');
    glow.addColorStop(0.65, '#ff7a1a');
    glow.addColorStop(1, 'rgba(255,59,26,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, 64, 64);
  });
}
function fire(x, y, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(fireBall(), x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

// A flame particle flying along a jet.
function jet(x, y, vx, vy, size) {
  fx.add('jet', x, y, 0.35, {
    vx, vy, size,
    draw(p, k) { fire(p.x, p.y, p.size * (0.5 + k * 1.2), 1 - k); },
  });
}

const FLAME_LEN = 250;
const FLAME_HALF = 13;       // half the width of the jet, in degrees

const DANGER = {
  flame: {
    update(d, dt) {
      const b = d.boss;
      d.x = b.x + d.side * b.w * 0.22;
      d.y = b.y + b.h * 0.35;
      const k = Math.max(0, (d.t - d.warn) / d.time);
      // It swings across and back.
      d.angle = d.swing * Math.cos(k * Math.PI * 2) * 0.9 - d.side * 4;
      const rad = (d.angle * Math.PI) / 180;
      if (d.t < d.warn) {
        // Warning: sputters at the nozzle.
        if (Math.random() < 0.5) jet(d.x, d.y, Math.sin(rad) * 60, Math.cos(rad) * 60, 6);
        return d.t < d.warn + d.time;
      }
      if (!calm.matches) for (let i = 0; i < 2; i++) {
        const a = rad + ((Math.random() - 0.5) * FLAME_HALF * 1.6 * Math.PI) / 180;
        const sp = FLAME_LEN / 0.35;
        jet(d.x, d.y, Math.sin(a) * sp, Math.cos(a) * sp, 9 + Math.random() * 5);
      }
      const s = state.ship;
      const dist = Math.hypot(s.x - d.x, s.y - d.y);
      const off = Math.abs(Math.atan2(s.x - d.x, s.y - d.y) * 180 / Math.PI - d.angle);
      if (alive() && dist < FLAME_LEN && off < FLAME_HALF + (SHIP.hitSize / Math.max(20, dist)) * 57) hitShip('fire');
      return d.t < d.warn + d.time;
    },
    draw(d) {
      if (d.t < d.warn) {
        radial(d.x, d.y, 10 + 8 * (d.t / d.warn), [[0, '#ffffff'], [0.4, '#ff9a2a'], [1, 'rgba(255,122,26,0)']], 0.9, 'lighter');
        return;
      }
      const rad = (d.angle * Math.PI) / 180;
      radial(d.x + Math.sin(rad) * FLAME_LEN * 0.4, d.y + Math.cos(rad) * FLAME_LEN * 0.4, FLAME_LEN * 0.4, [[0, 'rgba(255,150,40,0.35)'], [1, 'rgba(255,90,20,0)']], 1, 'lighter');
    },
  },

  eyelaser: {
    update(d, dt) {
      const b = d.boss;
      const eye = b.eye || b.body;
      d.x = eye.x;
      d.y = eye.y + 10;
      const k = Math.max(0, Math.min(1, (d.t - d.warn) / d.time));
      d.angle = d.from + (d.to - d.from) * ease(k);
      if (d.t >= d.warn && alive()) {
        const rad = (d.angle * Math.PI) / 180;
        if (nearLine(d.x, d.y, d.x + Math.sin(rad) * 1000, d.y + Math.cos(rad) * 1000, 18)) hitShip('red');
      }
      return d.t < d.warn + d.time;
    },
    draw(d) {
      ctx.save();
      ctx.translate(d.x, d.y);
      if (d.t < d.warn) {
        // Where it starts, and the way it will sweep.
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ff3b3b';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const a0 = Math.PI / 2 - (d.from * Math.PI) / 180;
        const a1 = Math.PI / 2 - (d.to * Math.PI) / 180;
        ctx.arc(0, 0, 160, Math.min(a0, a1), Math.max(a0, a1));
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = Math.floor(d.t * 14) % 2 ? 0.9 : 0.4;
        ctx.rotate((-d.from * Math.PI) / 180);
        ctx.strokeStyle = '#ff3b3b';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 8]);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 900); ctx.stroke();
      } else {
        ctx.rotate((-d.angle * Math.PI) / 180);
        ctx.globalCompositeOperation = 'lighter';
        const w = 20 * (0.9 + Math.random() * 0.2);
        const g = ctx.createLinearGradient(-w, 0, w, 0);
        g.addColorStop(0, 'rgba(255,59,59,0)');
        g.addColorStop(0.3, 'rgba(255,59,59,0.8)');
        g.addColorStop(0.5, '#ffffff');
        g.addColorStop(0.7, 'rgba(255,59,59,0.8)');
        g.addColorStop(1, 'rgba(255,59,59,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-w, 0, w * 2, 1000);
      }
      ctx.restore();
      radial(d.x, d.y, 26, [[0, '#ffffff'], [0.4, '#ff3b3b'], [1, 'rgba(255,59,59,0)']], 0.9, 'lighter');
    },
  },

  firewall: {
    update(d, dt) {
      if (d.t > 0.8) d.y += 85 * dt;
      if (d.t > 0.8 && alive()) {
        const s = state.ship;
        if (Math.abs(s.y - d.y) < 14 + SHIP.hitSize && Math.abs(s.x - d.gap) > 62 - SHIP.hitSize) hitShip('fire');
      }
      if (!calm.matches && Math.random() < 0.2) {
        let x = Math.random() * W;
        if (Math.abs(x - d.gap) > 64) smoke(x, d.y - 10, 22, true);
      }
      return d.y < H + 40;
    },
    draw(d) {
      const warn = d.t < 0.8;
      for (let x = 8; x < W; x += 18) {
        if (Math.abs(x - d.gap) < 64) continue;
        const flick = 0.75 + Math.random() * 0.35;
        fire(x, d.y, (warn ? 8 : 22) * flick, warn ? 0.6 : 1);
      }
      if (!warn) {
        // The gap glows a little, so you can find it.
        radial(d.gap, d.y, 40, [[0, 'rgba(120,220,255,0.25)'], [1, 'rgba(120,220,255,0)']], 1, 'lighter');
      }
    },
  },

  shock: {
    update(d, dt) {
      d.r += 170 * dt;
      if (alive()) {
        const s = state.ship;
        const dist = Math.hypot(s.x - d.x, s.y - d.y);
        if (Math.abs(dist - d.r) < 8 + SHIP.hitSize && !inGap(d, s.x, s.y)) hitShip('crash');
      }
      return d.r < 800;
    },
    draw(d) {
      ctx.save();
      ctx.globalAlpha = Math.max(0.2, 1 - d.r / 800);
      ctx.strokeStyle = '#ffe2b0';
      ctx.shadowColor = '#ff9a2a';
      ctx.shadowBlur = 14;
      ctx.lineWidth = 10;
      // The ring, with its two gaps left out.
      for (const g of d.gaps) {
        const start = ((90 - g + 22) * Math.PI) / 180;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, start, start + Math.PI - (44 * Math.PI) / 180);
        ctx.stroke();
      }
      ctx.restore();
    },
  },

  chain: {
    update(d, dt) {
      d.y += 55 * dt;
      const spread = 70 + 45 * Math.sin(d.t * 1.3);
      const cx = d.cx + Math.sin(d.t * 0.7) * 60;
      d.a = [cx - spread, d.y];
      d.b = [cx + spread, d.y];
      // On and off: 0.6s warning, 0.8s on, 0.6s off.
      const p = d.t % 2;
      const was = d.on;
      d.warnOn = p < 0.6;
      d.on = p >= 0.6 && p < 1.4;
      if (d.on && !was) sound.chain(cx);
      if (d.on && alive() && nearLine(...d.a, ...d.b, 12)) hitShip('bolt');
      return d.y < H + 40;
    },
    draw(d) {
      if (d.on) lightningArc(d.a, d.b, 1);
      else if (d.warnOn && Math.random() < 0.3) lightningArc(d.a, d.b, 0.25);
      for (const [x, y] of [d.a, d.b]) {
        radial(x, y, 20, [[0, '#ffffff'], [0.3, '#d8b0ff'], [0.7, 'rgba(176,92,255,0.6)'], [1, 'rgba(176,92,255,0)']], 1, 'lighter');
      }
    },
  },

  gravity: {
    update(d, dt) {
      d.y += 45 * dt;
      const s = state.ship;
      const dist = Math.hypot(s.x - d.x, s.y - d.y);
      // It pulls you towards it.
      if (alive() && dist < 210 && dist > 1) {
        const pull = 75 * (1 - dist / 210) * dt;
        s.x += ((d.x - s.x) / dist) * pull;
        s.y += ((d.y - s.y) / dist) * pull;
      }
      if (alive() && dist < 16 + SHIP.hitSize) hitShip('plasma');
      // It eats your shots.
      for (const b of state.shots) if (Math.hypot(b.x - d.x, b.y - d.y) < 36) { b.dead = true; fx.spark(b.x, b.y); }
      if (d.t >= d.life) {
        // It pops into a ring of darts.
        const n = many(10);
        for (let i = 0; i < n; i++) shot(d.x, d.y, (i * 360) / n, 'pink', 120);
        fx.boom(d.x, d.y, 70, 10, '#b05cff');
        sound.boom(d.x);
        return false;
      }
      return true;
    },
    draw(d) {
      const pulse = 1 + 0.08 * Math.sin(d.t * 9);
      radial(d.x, d.y, 70 * pulse, [[0, 'rgba(176,92,255,0.35)'], [1, 'rgba(176,92,255,0)']], 1, 'lighter');
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.t * 4);
      ctx.strokeStyle = '#d8b0ff';
      ctx.shadowColor = '#b05cff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 30 - i * 4, 11 - i * 2, (i * Math.PI) / 3, 0, Math.PI * 1.4);
        ctx.stroke();
      }
      ctx.restore();
      radial(d.x, d.y, 18, [[0, '#000000'], [0.75, '#05020a'], [1, 'rgba(60,20,100,0)']]);
      // Warning: it is about to pop.
      if (d.life - d.t < 0.6 && Math.floor(d.t * 16) % 2) radial(d.x, d.y, 34, [[0, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']], 1, 'lighter');
    },
  },
};

function inGap(d, x, y) {
  const a = (((Math.atan2(x - d.x, y - d.y) * 180) / Math.PI) + 360) % 360;
  return d.gaps.some((g) => {
    const diff = Math.abs(((a - (g % 360) + 540) % 360) - 180);
    return diff < 22;
  });
}

export function updateDangers(dt) {
  const list = state.dangers || (state.dangers = []);
  for (let i = list.length - 1; i >= 0; i--) {
    const d = list[i];
    d.t += dt;
    const keep = d.boss.phase === 'fight' && DANGER[d.kind].update(d, dt);
    if (!keep) list.splice(i, 1);
  }
}

export function drawDangers() {
  for (const d of state.dangers || []) DANGER[d.kind].draw(d);
}

// A boss is beaten or leaves: its dangers go with it.
export function clearDangers(boss) {
  if (state.dangers) state.dangers = state.dangers.filter((d) => d.boss !== boss);
}
