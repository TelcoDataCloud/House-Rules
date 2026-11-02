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

export function drawFoes() {
  for (const b of state.foes) {
    if (b.colour === 'red') stamp(foeLook('red'), b, 24, 46);
    else if (b.colour === 'bullet') stamp(foeLook('bullet'), b, 18, 30);
    else if (b.colour === 'rocket') {
      // Fire out of the back of a rocket, flickering.
      radial(b.x - b.dx * 18, b.y - b.dy * 18, 7 + Math.random() * 3, [[0, '#ffffff'], [0.35, '#ffd23f'], [1, 'rgba(255,122,26,0)']], 1, 'lighter');
      stamp(foeLook('rocket'), b, 26, 44);
    } else if (b.colour === 'mine') {
      const blink = b.armed && Math.floor(b.t * 16) % 2 === 0;
      stamp(foeLook('mine', blink), b, 46, 46, false);
      if (blink) radial(b.x, b.y, 30, [[0, 'rgba(255,59,59,0.6)'], [1, 'rgba(255,59,59,0)']], 1, 'lighter');
    } else {
      const big = b.colour === 'plasma';
      const size = big ? 50 : b.colour === 'green' ? 38 : 36;
      // A pulsing glow and a spinning ring of energy round each orb.
      const pulse = big ? 1 + Math.sin(b.t * 20) * 0.06 : 1;
      stamp(foeLook(b.colour), b, size * pulse, size * pulse, false);
      const col = b.colour === 'green' ? '77,255,124' : big ? '176,92,255' : '255,63,164';
      ctx.save();
      ctx.strokeStyle = `rgba(${col},0.85)`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 6]);
      ctx.lineDashOffset = -b.t * 40;
      ctx.beginPath();
      ctx.arc(b.x, b.y, (b.w / 2) + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
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
