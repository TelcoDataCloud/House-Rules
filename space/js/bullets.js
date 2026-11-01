/* ===========================================================
   BULLETS: your shots, your missiles, and enemy shots

   Every bullet is a small round box. Each frame it moves by its
   speed. Off the screen, it is thrown away. There is a cap of
   200 on screen at once so the game never slows down.
   =========================================================== */

import { state, W, H, hardness } from './state.js';
import { put, layer } from './art.js';
import { targets } from './collide.js';
import { trail, smokePuff } from './fx.js';
import { FOE_SHOTS, ROCKET_START, ROCKET_TOP, MINE_WAKE, MINE_FUSE } from '../data/foeshots.js';

const CAP = 200;

function count() {
  return state.shots.length + state.missiles.length + state.foes.length;
}

function make(cls, where, w, h) {
  const el = document.createElement('div');
  el.className = cls;
  el.style.width = `${w}px`;      // every bullet gets its size here
  el.style.height = `${h}px`;
  layer(where).appendChild(el);
  return { el, w, h };
}

// Your shot. vx and vy are how fast it moves sideways and up.
// cls is its colour, damage how hard it hits, through how many
// enemies it can go right through.
export function addShot(x, y, vx, vy, { cls = '', damage = 1, through = 0, small = false } = {}) {
  if (count() >= CAP) return;
  // Weak side shots are drawn thinner, so you can see they hit less.
  const b = small ? make(`shot weak ${cls}`.trim(), 'shots', 5, 20) : make(`shot ${cls}`.trim(), 'shots', 8, 28);
  Object.assign(b, { x, y, vx, vy, r: 6, damage, through });
  state.shots.push(b);
}

// A homing missile. It turns towards the nearest thing it can hit.
export function addMissile(x, y, damage, dir) {
  if (count() >= CAP) return;
  const big = damage > 1;
  const [w, h] = big ? [16, 30] : [12, 22];
  const b = make(big ? 'missile big' : 'missile', 'shots', w, h);
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
  const b = make(`foe ${colour}`, 'foes', kind.size[0], kind.size[1]);
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
        b.el.classList.add('armed');
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

// Lasers and missiles turn to point the way they are flying.
function aim(b) {
  const deg = (Math.atan2(b.vx, -b.vy) * 180) / Math.PI;
  b.el.style.transform = `translate(${(b.x - b.w / 2).toFixed(1)}px, ${(b.y - b.h / 2).toFixed(1)}px) rotate(${deg.toFixed(0)}deg)`;
}

export function drawBullets() {
  for (const b of state.shots) aim(b);
  for (const b of state.missiles) aim(b);
  for (const b of state.foes) {
    // Lasers, bullets and rockets point the way they fly.
    if ((b.colour === 'red' || b.colour === 'bullet' || b.colour === 'rocket') && b.vx) aim(b);
    else put(b.el, b.x, b.y, b.w, b.h);
  }
}

// Throw away bullets marked dead.
export function sweep(list) {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].dead) { list[i].el.remove(); list.splice(i, 1); }
  }
}

export function clearFoes() {
  for (const b of state.foes) b.el.remove();
  state.foes.length = 0;
}
