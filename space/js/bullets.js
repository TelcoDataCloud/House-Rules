/* ===========================================================
   BULLETS: your shots, your missiles, and enemy shots

   Every bullet is a dot with a speed. Each frame it moves, and
   off the screen it is thrown away. There is a cap of 300 on
   screen at once so the game never slows down. How each kind is
   drawn is in js/looks.js.
   =========================================================== */

import { state, W, H, hardness } from './state.js';
import { ctx, radial } from './canvas.js';
import { shotLook, missileLook, foeLook } from './looks.js';
import { targets } from './collide.js';
import { trail, smokePuff } from './fx.js';
import { FOE_SHOTS, ROCKET_START, ROCKET_TOP, MINE_WAKE, MINE_FUSE } from '../data/foeshots.js';

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
  Object.assign(b, {
    x, y, dx: Math.sin(rad), dy: Math.cos(rad), speed: sp, vx: Math.sin(rad) * sp * start, vy: Math.cos(rad) * sp * start,
    r: kind.hitSize, colour, move: kind.move, t: 0,
    hp: kind.canShoot ? kind.hits : 0, points: kind.points || 0,
  });
  state.foes.push(b);
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
  for (const b of state.shots) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (gone(b)) b.dead = true;
  }
  for (const b of state.foes) {
    b.t += dt;
    if (b.move === 'speedup') {
      // A rocket: slow at first, then faster and faster, with smoke.
      const k = Math.min(ROCKET_TOP, ROCKET_START + b.t * 1.1);
      b.vx = b.dx * b.speed * k;
      b.vy = b.dy * b.speed * k;
      b.puff = (b.puff || 0) - dt;
      if (b.puff <= 0) { b.puff = 0.06; smokePuff(b.x - b.dx * 16, b.y - b.dy * 16); }
    } else if (b.move === 'mine') {
      // A mine: drifts, slows down, wakes up when you are close.
      b.vx *= 1 - dt * 0.6;
      b.vy = Math.max(45, b.vy * (1 - dt * 0.6));
      const s = state.ship;
      if (!b.armed && s.dead <= 0 && Math.hypot(s.x - b.x, s.y - b.y) < MINE_WAKE) {
        b.armed = MINE_FUSE;
      }
      if (b.armed) {
        b.armed -= dt;
        b.vy *= 0.9;
        if (b.armed <= 0) b.blow = true;     // js/loop.js does the bang
      }
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (gone(b)) b.dead = true;
  }
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
      case 'plasma': {
        // A plasma torpedo: a pulsing core, two rings of energy spinning
        // round it at different tilts, and sparks crackling off it.
        const pulse = 1 + Math.sin(b.t * 20) * 0.07;
        stamp(foeLook('plasma'), b, 54 * pulse, 54 * pulse, false);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(200,150,255,0.9)';
        ctx.shadowColor = '#b05cff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        for (const [tilt, speed] of [[0.5, 4], [-0.9, -5]]) {
          ctx.save();
          ctx.rotate(tilt + b.t * speed);
          ctx.beginPath();
          ctx.ellipse(0, 0, 19, 7, 0, 0, Math.PI * 2);
          ctx.stroke();
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
