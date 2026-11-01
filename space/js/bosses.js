/* ===========================================================
   BOSSES: the Hauler (mini boss) and the Core (the big one)

   A boss is a body plus parts. Some parts are "open" (you can
   hurt them) and some are shut until something else is gone:
   the Hauler's body opens when both engines are off, and the
   Core's eye opens when all four turrets are gone.

   Every shot they fire is a pattern you can learn. Nothing aims
   at you, and the Core's ring always has a gap on your side.
   =========================================================== */

import { state, W, hardness, after } from './state.js';
import { sprite, put, layer } from './art.js';
import { HAULER, CORE } from '../data/bosses.js';
import { LEVEL } from '../data/waves.js';
import { addFoe } from './bullets.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

function part(boss, name, art, w, h, ox, oy, r, hits, open) {
  const el = art ? sprite(art, w, h) : null;
  if (el) layer('air').appendChild(el);
  const hp = Math.ceil(hits * hardness().tough);
  const p = {
    name, el, w, h, ox, oy, r, hp, max: hp, alive: true, open, x: 0, y: -999, flashT: 0,
    onHit(n) { hurt(boss, p, n); },
  };
  boss.parts.push(p);
  return p;
}

export function spawnBoss(name) {
  const boss = { name, t: 0, phase: 'enter', x: W / 2, y: -160, parts: [], fireWait: 1.5, gun: 0 };
  if (name === 'hauler') {
    boss.title = HAULER.name;
    boss.w = 220; boss.h = 120;
    boss.el = sprite('hauler', 220, 120);
    layer('air').appendChild(boss.el);
    boss.left = part(boss, 'left engine', 'hauler-engine', 40, 70, -56, 3, 22, HAULER.engineHits, true);
    boss.right = part(boss, 'right engine', 'hauler-engine', 40, 70, 56, 3, 22, HAULER.engineHits, true);
    boss.body = part(boss, 'body', null, 0, 0, 0, -6, 40, HAULER.bodyHits, false);
  } else {
    boss.title = CORE.name;
    boss.w = 320; boss.h = 220;
    boss.y = -200;
    boss.el = sprite('core', 320, 220);
    layer('air').appendChild(boss.el);
    boss.turrets = [
      part(boss, 'turret', 'core-turret', 44, 56, -118, -14, 22, CORE.turretHits, true),
      part(boss, 'turret', 'core-turret', 44, 56, 118, -14, 22, CORE.turretHits, true),
      part(boss, 'turret', 'core-turret', 44, 56, -50, 62, 22, CORE.turretHits, true),
      part(boss, 'turret', 'core-turret', 44, 56, 50, 62, 22, CORE.turretHits, true),
    ];
    boss.turrets.forEach((t, i) => { t.fireWait = 1 + i * 0.6; });
    boss.eye = part(boss, 'eye', 'core-eye', 92, 92, 0, -20, 40, CORE.eyeHits, false);
    boss.eye.el.classList.add('dark');
  }
  state.bosses.push(boss);
}

function hurt(boss, p, n) {
  if (!p.alive || !p.open || boss.phase === 'dying') return;
  p.hp -= n;
  if (p.el) { p.el.classList.add('hit'); p.flashT = 0.06; }
  else { boss.el.classList.add('hit'); boss.flashT = 0.06; }
  if (p.hp > 0) { sound.ping(); return; }
  p.alive = false;
  sound.boom();
  fx.boom(p.x, p.y, 90, 8);
  if (p.el) p.el.hidden = true;

  if (boss.name === 'hauler') {
    if (p === boss.body) die(boss);
    else if (!boss.left.alive && !boss.right.alive) { boss.body.open = true; fx.banner('NOW THE BODY!'); }
  } else {
    if (p === boss.eye) die(boss);
    else {
      fx.award(CORE.turretPoints, p.x, p.y - 20);
      if (boss.turrets.every((t) => !t.alive)) {
        boss.eye.open = true;
        boss.eye.el.classList.remove('dark');
        boss.eye.el.classList.add('awake');
        boss.fireWait = 1.2;
        fx.banner('HIT THE EYE!');
      }
    }
  }
}

// The big moment: the boss shakes, booms go off all over it for two
// seconds, time slows right down, BOSS DOWN! Then it falls apart.
function die(boss) {
  boss.phase = 'dying';
  boss.t = 0;
  boss.el.classList.add('dying');
  state.slow = 1.6;
  fx.banner('BOSS DOWN!', 'gold');
  fx.shake(true);
  const booms = boss.name === 'core' ? 14 : 9;
  for (let i = 0; i < booms; i++) {
    after(i * 0.16, () => {
      fx.boom(boss.x + (Math.random() - 0.5) * boss.w * 0.8, boss.y + (Math.random() - 0.5) * boss.h * 0.7, 90 + Math.random() * 60, 10, '#9aa0bd');
      sound.boom();
      if (i % 3 === 0) fx.shake(true);
    });
  }
  const end = booms * 0.16 + 0.2;
  const points = boss.name === 'hauler' ? HAULER.points : CORE.points;
  after(end, () => {
    fx.boom(boss.x, boss.y, boss.w * 1.1, 18, '#ffd23f');
    fx.flash();
    fx.chunks(boss.x, boss.y);
    fx.award(points, boss.x, boss.y - 40);
    if (boss.name === 'hauler') HAULER.drops.forEach((d, i) => drop(d, boss.x + (i - 1.5) * 34, boss.y));
    boss.gone = true;
  });
  if (boss.name === 'core') {
    state.ending = 'win';
    state.endTimer = end + 3;
  }
}

function fireRing(boss) {
  const eye = boss.eye;
  const s = state.ship;
  // Which way is the ship? 0 means straight down.
  const toShip = (Math.atan2(s.x - eye.x, s.y - eye.y) * 180) / Math.PI;
  for (let k = 0; k < 10; k++) {
    if (k === 0 || k === 9) continue;        // the gap, always on your side
    addFoe(eye.x, eye.y, toShip + 18 + k * 36, 105, 'pink');
  }
}

function fight(boss, dt) {
  if (boss.name === 'hauler') {
    const wobble = boss.body.open ? Math.sin(boss.t * 14) * 5 : 0;
    boss.x = W / 2 + Math.sin((boss.t - 2.5) * 0.9) * 90 + wobble;
    boss.fireWait -= dt;
    if (boss.fireWait <= 0) {
      boss.fireWait = HAULER.fireEvery / 2;
      boss.gun = 1 - boss.gun;
      addFoe(boss.x + (boss.gun ? 25 : -25), boss.y + 30, 0, 140, 'pink');
    }
    if (boss.t > HAULER.stay) { boss.phase = 'leave'; fx.banner('IT GOT AWAY'); }
  } else {
    boss.x = W / 2 + Math.sin(boss.t * 0.4) * 28;   // small sway, so every gun stays on screen
    for (const t of boss.turrets) {
      if (!t.alive) continue;
      t.fireWait -= dt;
      if (t.fireWait <= 0) { t.fireWait = CORE.turretEvery; addFoe(t.x, t.y + 30, 0, 140, 'green'); }
    }
    if (boss.eye.open) {
      boss.fireWait -= dt;
      if (boss.fireWait <= 0) { boss.fireWait = CORE.ringEvery; fireRing(boss); }
    }
    if (state.time > LEVEL.length) {
      boss.phase = 'leave';
      state.stats.escaped = true;
      fx.banner('IT GOT AWAY');
    }
  }
}

export function updateBosses(dt) {
  for (const boss of state.bosses) {
    boss.t += dt;
    if (boss.phase === 'enter') {
      const stop = boss.name === 'hauler' ? 170 : 205;
      boss.y += (stop - boss.y) * Math.min(1, dt * 1.6);
      if (boss.t > 2.5) {
        boss.phase = 'fight';
        boss.t = 2.5;
        fx.banner(boss.name === 'hauler' ? 'SHOOT THE ENGINES!' : 'SHOOT THE GUNS!');
      }
    } else if (boss.phase === 'fight') {
      fight(boss, dt);
    } else if (boss.phase === 'leave') {
      boss.y -= 120 * dt;
      if (boss.y < -260) {
        boss.gone = true;
        if (boss.name === 'core') { state.ending = 'win'; state.endTimer = 1; }
      }
    }
    for (const p of boss.parts) {
      p.x = boss.x + p.ox;
      p.y = boss.y + p.oy;
      if (p.flashT > 0) { p.flashT -= dt; if (p.flashT <= 0 && p.el) p.el.classList.remove('hit'); }
    }
    if (boss.flashT > 0) { boss.flashT -= dt; if (boss.flashT <= 0) boss.el.classList.remove('hit'); }
  }
  for (let i = state.bosses.length - 1; i >= 0; i--) {
    const boss = state.bosses[i];
    if (boss.gone) {
      boss.el.remove();
      for (const p of boss.parts) if (p.el) p.el.remove();
      state.bosses.splice(i, 1);
    }
  }
}

export function drawBosses() {
  for (const boss of state.bosses) {
    put(boss.el, boss.x, boss.y, boss.w, boss.h);
    for (const p of boss.parts) if (p.el) put(p.el, p.x, p.y, p.w, p.h);
  }
}

// For the bar across the top: how much boss is left?
export function bossHealth() {
  const boss = state.bosses.find((b) => b.phase !== 'dying');
  if (!boss) return null;
  let hp = 0;
  let max = 0;
  for (const p of boss.parts) { hp += Math.max(0, p.hp); max += p.max; }
  return { name: boss.title, left: hp / max };
}


