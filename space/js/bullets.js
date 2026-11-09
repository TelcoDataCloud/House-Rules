/* ===========================================================
   BULLETS: your shots, your missiles, and enemy shots

   Every bullet is a dot with a speed. Each frame it moves, and
   off the screen it is thrown away. There is a cap of 300 on
   screen at once so the game never slows down. How each kind is
   drawn is in js/looks.js.
   =========================================================== */

import { state, W, H, hardness } from './state.js';
import { ctx, radial, made2d } from './canvas.js';
import { shotLook, missileLook, foeLook } from './looks.js';
import { targets } from './collide.js';
import { trail, smokePuff } from './fx.js';
import { FOE_SHOTS, ROCKET_START, ROCKET_TOP, MINE_WAKE, MINE_FUSE } from '../data/foeshots.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

// How fast the bits of a burst fly.
const SHOT_SPEED_OF = { shard: 150, frost: 120, ember: 90 };

function burstFx(b) {
  if (b.colour === 'flak') { fx.boom(b.x, b.y, 34, 6, '#ffd23f'); sound.flak(b.x); }
  else if (b.colour === 'ice') { fx.spark(b.x, b.y); sound.ice(b.x); }
  else { fx.boom(b.x, b.y, 30, 6, '#ff7a1a'); sound.slag(b.x); }
}

const CAP = 300;

function count() {
  return state.shots.length + state.missiles.length + state.foes.length;
}

// Your shot. vx and vy are how fast it moves sideways and up.
// cls is its colour, damage how hard it hits, through how many
// enemies it can go right through.
export function addShot(x, y, vx, vy, { cls = '', damage = 1, through = 0, small = false } = {}) {
  if (count() >= CAP) return;
  // Weak side shots are drawn thinner, so you can see they hit less.
  const b = { cls, weak: small, w: small ? 5 : 8, h: small ? 20 : 28 };
  Object.assign(b, { x, y, vx, vy, r: 6, damage, through });
  state.shots.push(b);
}

// A homing missile. It turns towards the nearest thing it can hit.
export function addMissile(x, y, damage, dir) {
  if (count() >= CAP) return;
  const big = damage >= 0.6;
  const b = { big, w: 24, h: 40 };
  Object.assign(b, { x, y, vx: dir * 160, vy: -260, r: big ? 10 : 7, damage, life: 3 });
  state.missiles.push(b);
}

// An enemy shot. angle 0 is straight down the screen, towards you.
export function addFoe(x, y, angle, speed, colour = 'pink') {
  if (count() >= CAP) return;
  const sp = speed * hardness().bulletSpeed;
  const rad = (angle * Math.PI) / 180;
  // What kind of shot it is, and how it moves: data/foeshots.js.
  const kind = FOE_SHOTS[colour] || FOE_SHOTS.pink;
  const b = { w: kind.size[0], h: kind.size[1] };
  const start = kind.move === 'speedup' ? ROCKET_START : kind.move === 'mine' ? 0.45 : 1;
  b.fuse = kind.fuse || 0;
  b.into = kind.into;
  b.count = kind.count || 0;
  Object.assign(b, {
    x, y, dx: Math.sin(rad), dy: Math.cos(rad), speed: sp, vx: Math.sin(rad) * sp * start, vy: Math.cos(rad) * sp * start,
    r: kind.hitSize, colour, move: kind.move, t: 0,
    hp: kind.canShoot ? kind.hits : 0, points: kind.points || 0,
  });
  state.foes.push(b);
}

// A shell bursts: its bits fly out in a ring.
const bursting = [];
function burst(b) {
  b.dead = true;
  bursting.push(b);
}
function burstNow() {
  for (const b of bursting.splice(0)) {
    const turn = Math.random() * 360;
    const sp = SHOT_SPEED_OF[b.into] || 140;
    for (let i = 0; i < b.count; i++) {
      // 'ember' splashes up and out, then falls.
      const a = b.into === 'ember' ? 180 + (i - (b.count - 1) / 2) * 30 : turn + (i * 360) / b.count;
      addFoe(b.x, b.y, a, sp, b.into);
    }
    burstFx(b);
  }
}

function gone(b) {
  return b.y < -40 || b.y > H + 40 || b.x < -40 || b.x > W + 40;
}

function steer(m, dt) {
  let best = null;
  let bestD = Infinity;
  for (const t of targets()) {
    if (t.y < -10 || t.y > H) continue;
    const d = (t.x - m.x) ** 2 + (t.y - m.y) ** 2;
    if (d < bestD) { bestD = d; best = t; }
  }
  const speed = 380;
  let want = Math.atan2(-1, 0);
  if (best) want = Math.atan2(best.y - m.y, best.x - m.x);
  let now = Math.atan2(m.vy, m.vx);
  let turn = want - now;
  while (turn > Math.PI) turn -= Math.PI * 2;
  while (turn < -Math.PI) turn += Math.PI * 2;
  now += Math.max(-5 * dt, Math.min(5 * dt, turn));
  m.vx = Math.cos(now) * speed;
  m.vy = Math.sin(now) * speed;
}

export function updateBullets(dt) {
  // TIME WARP (an Easy helper): enemy shots fly at half speed.
  const foeDt = state.warp > 0 ? dt * 0.5 : dt;
  for (const b of state.shots) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (gone(b)) b.dead = true;
  }
  for (const b of state.foes) {
    b.t += foeDt;
    if (b.move === 'speedup') {
      // A rocket: slow at first, then faster and faster, with smoke.
      const k = Math.min(ROCKET_TOP, ROCKET_START + b.t * 1.1);
      b.vx = b.dx * b.speed * k;
      b.vy = b.dy * b.speed * k;
      b.puff = (b.puff || 0) - foeDt;
      if (b.puff <= 0) { b.puff = 0.06; smokePuff(b.x - b.dx * 16, b.y - b.dy * 16); }
    } else if (b.move === 'mine') {
      // A mine: drifts, slows down, wakes up when you are close.
      b.vx *= 1 - foeDt * 0.6;
      b.vy = Math.max(45, b.vy * (1 - foeDt * 0.6));
      const s = state.ship;
      if (!b.armed && s.dead <= 0 && Math.hypot(s.x - b.x, s.y - b.y) < MINE_WAKE) {
        b.armed = MINE_FUSE;
      }
      if (b.armed) {
        b.armed -= foeDt;
        b.vy *= 0.9;
        if (b.armed <= 0) b.blow = true;     // js/loop.js does the bang
      }
    } else if (b.move === 'burst') {
      // Flak and ice: slows down, then bursts into bits all round.
      b.vx *= 1 - foeDt * 1.6;
      b.vy *= 1 - foeDt * 1.6;
      if (b.t >= b.fuse) burst(b);
    } else if (b.move === 'lob') {
      // Slag: falls faster and faster, then splashes.
      b.vy += 140 * foeDt;
      if (b.t >= b.fuse) burst(b);
    } else if (b.move === 'fall') {
      b.vy += 220 * foeDt;
    }
    b.x += b.vx * foeDt;
    b.y += b.vy * foeDt;
    if (gone(b)) b.dead = true;
  }
  burstNow();
  for (const m of state.missiles) {
    steer(m, dt);
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.life -= dt;
    m.puff = (m.puff || 0) - dt;
    if (m.puff <= 0) { m.puff = 0.05; trail(m.x - m.vx * 0.02, m.y - m.vy * 0.02); }
    if (m.life <= 0 || gone(m)) m.dead = true;
  }
}

// Turn to point the way it is flying, then stamp its picture.
function stamp(img, b, w, h, turn = true) {
  ctx.save();
  ctx.translate(b.x, b.y);
  if (turn) ctx.rotate(Math.atan2(b.vx, -b.vy));
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

export function drawShots() {
  for (const b of state.shots) stamp(shotLook(b.cls, b.weak), b, 24, 44);
  for (const m of state.missiles) stamp(missileLook(m.big), m, 24, 40);
}

// A plasma ring, with its glow, painted once.
function plasmaRing() {
  return made2d('foe|plasma-ring', 48, 24, (g) => {
    g.strokeStyle = 'rgba(200,150,255,0.9)';
    g.shadowColor = '#b05cff';
    g.shadowBlur = 8;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(24, 12, 19, 7, 0, 0, Math.PI * 2);
    g.stroke();
  });
}

// Enemy shots are drawn pointing DOWN (js/looks.js); turn each one
// to point the way it is flying.
function stampFoe(img, b, w, h, tipUp = false) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(Math.atan2(-b.vx, b.vy) + (tipUp ? Math.PI : 0));
  ctx.drawImage(img, -w / 2, -h * 0.6, w, h);
  ctx.restore();
}

export function drawFoes() {
  for (const b of state.foes) {
    switch (b.colour) {
      // These two are drawn tip-up, so turn them round.
      case 'red': stampFoe(foeLook('red'), b, 24, 46, true); break;
      case 'bullet': stampFoe(foeLook('bullet'), b, 18, 30, true); break;
      case 'bolt':
        // Lightning crackles: it flips side to side as it flies.
        ctx.save(); ctx.translate(b.x, b.y); ctx.scale(Math.floor(b.t * 18) % 2 ? -1 : 1, 1); ctx.translate(-b.x, -b.y);
        stampFoe(foeLook('bolt'), b, 28, 48);
        ctx.restore();
        break;
      case 'rocket':
        // Fire out of the back of a rocket, flickering.
        radial(b.x - b.dx * 18, b.y - b.dy * 18, 7 + Math.random() * 3, [[0, '#ffffff'], [0.35, '#ffd23f'], [1, 'rgba(255,122,26,0)']], 1, 'lighter');
        stampFoe(foeLook('rocket'), b, 26, 44);
        break;
      case 'mine': {
        const blink = b.armed && Math.floor(b.t * 16) % 2 === 0;
        stamp(foeLook('mine', blink), b, 46, 46, false);
        if (blink) radial(b.x, b.y, 30, [[0, 'rgba(255,59,59,0.6)'], [1, 'rgba(255,59,59,0)']], 1, 'lighter');
        break;
      }
      case 'flak': {
        // Blinks faster and faster as it gets ready to burst.
        const left = b.fuse - b.t;
        const blink = left < 0.5 && Math.floor(b.t * 20) % 2 === 0;
        stamp(foeLook('flak', blink), b, 30, 30, false);
        break;
      }
      case 'shard': stampFoe(foeLook('shard'), b, 14, 22); break;
      case 'frost': stampFoe(foeLook('frost'), b, 16, 24); break;
      case 'ice':
        stampFoe(foeLook('ice'), b, 24, 46);
        radial(b.x, b.y, 16, [[0, 'rgba(160,220,255,0.4)'], [1, 'rgba(160,220,255,0)']], 1, 'lighter');
        break;
      case 'slag':
        radial(b.x, b.y, 26 + Math.sin(b.t * 18) * 3, [[0, 'rgba(255,140,40,0.55)'], [1, 'rgba(255,80,20,0)']], 1, 'lighter');
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.t * 3); ctx.translate(-b.x, -b.y);
        stamp(foeLook('slag'), b, 40, 40, false);
        ctx.restore();
        break;
      case 'ember': stamp(foeLook('ember'), b, 18, 18, false); break;
      case 'plasma': {
        // A plasma torpedo: a pulsing core, two rings of energy spinning
        // round it at different tilts, and sparks crackling off it.
        const pulse = 1 + Math.sin(b.t * 20) * 0.07;
        stamp(foeLook('plasma'), b, 54 * pulse, 54 * pulse, false);
        // (The rings are painted once with their glow, then turned:
        // glows drawn every frame slow the game right down.)
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.globalCompositeOperation = 'lighter';
        for (const [tilt, speed] of [[0.5, 4], [-0.9, -5]]) {
          ctx.save();
          ctx.rotate(tilt + b.t * speed);
          ctx.drawImage(plasmaRing(), -24, -12, 48, 24);
          ctx.restore();
        }
        if (Math.random() < 0.5) {
          const a = Math.random() * Math.PI * 2;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
          ctx.lineTo(Math.cos(a + 0.3) * 18 + (Math.random() - 0.5) * 6, Math.sin(a + 0.3) * 18 + (Math.random() - 0.5) * 6);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
      default: {
        // Energy darts (pink) and ion shots (green), with a shimmer.
        const green = b.colour === 'green';
        stampFoe(foeLook(b.colour), b, green ? 30 : 26, green ? 46 : 44);
        radial(b.x, b.y, 9 + Math.sin(b.t * 30) * 2, [[0, green ? 'rgba(77,255,124,0.5)' : 'rgba(255,63,164,0.5)'], [1, 'rgba(0,0,0,0)']], 1, 'lighter');
      }
    }
  }
}

// Throw away bullets marked dead.
export function sweep(list) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].dead) list.splice(i, 1);
  }
}

export function clearFoes() {
  state.foes.length = 0;
}
