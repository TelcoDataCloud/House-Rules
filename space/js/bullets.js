/* ===========================================================
   BULLETS: your shots, your missiles, and enemy shots

   Every bullet is a small round box. Each frame it moves by its
   speed. Off the screen, it is thrown away. There is a cap of
   200 on screen at once so the game never slows down.
   =========================================================== */

import { state, W, H, hardness } from './state.js';
import { put, layer } from './art.js';
import { targets } from './collide.js';
import { trail } from './fx.js';

const CAP = 200;

function count() {
  return state.shots.length + state.missiles.length + state.foes.length;
}

function make(cls, where, w, h) {
  const el = document.createElement('div');
  el.className = cls;
  layer(where).appendChild(el);
  return { el, w, h };
}

// Your shot. vx and vy are how fast it moves sideways and up.
export function addShot(x, y, vx, vy, gold) {
  if (count() >= CAP) return;
  const b = make(gold ? 'shot gold' : 'shot', 'shots', 8, 28);
  Object.assign(b, { x, y, vx, vy, r: 6, damage: 1 });
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
  const red = colour === 'red';
  const b = make(`foe ${colour}`, 'foes', red ? 14 : 20, red ? 26 : 20);
  Object.assign(b, { x, y, vx: Math.sin(rad) * sp, vy: Math.cos(rad) * sp, r: 6 });
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
  for (const list of [state.shots, state.foes]) {
    for (const b of list) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (gone(b)) b.dead = true;
    }
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
  for (const b of state.foes) put(b.el, b.x, b.y, b.w, b.h);
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
