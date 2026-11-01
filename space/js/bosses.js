/* ===========================================================
   BOSSES: the big ones at the middle and end of each level

   Every boss comes from data/bosses.js and is one of two kinds:

   'hauler'  a big ship with two engines. The engines are open
             (you can hurt them); the body opens when both
             engines are off. Its side guns shoot straight down.
   'core'    a station with turrets round it and an eye in the
             middle. The eye opens when every turret is gone, then
             fires rings of bullets. The ring always has a gap on
             your side, so there is always a way through.
   =========================================================== */

import { state, W, hardness, after, level, isLastLevel } from './state.js';
import { sprite, put, layer } from './art.js';
import { BOSSES } from '../data/bosses.js';
import { addFoe } from './bullets.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';
import { makeCracks, crackSpot, showCracks, breakApart } from './breakup.js';

function part(boss, name, art, w, h, ox, oy, r, hits, open) {
  const el = art ? sprite(art, w, h) : null;
  if (el) {
    if (boss.cfg.tint) el.classList.add(`tint-${boss.cfg.tint}`);
    layer('air').appendChild(el);
  }
  const hp = Math.ceil(hits * hardness().tough);
  const p = {
    name, el, w, h, ox, oy, r, hp, max: hp, alive: true, open, x: 0, y: -999, flashT: 0,
    onHit(n) { hurt(boss, p, n); },
  };
  boss.parts.push(p);
  return p;
}

function makeHauler(cfg, name, cx) {
  const boss = { name, cfg, kind: 'hauler', t: 0, phase: 'enter', cx, x: cx, y: -160, parts: [], fireWait: 1.5, gun: 0 };
  boss.title = cfg.name;
  boss.w = 220; boss.h = 120;
  boss.sway = cfg.twins ? 40 : 90;
  boss.el = sprite('hauler', 220, 120);
  if (cfg.tint) boss.el.classList.add(`tint-${cfg.tint}`);
  layer('air').appendChild(boss.el);
  boss.left = part(boss, 'left engine', 'hauler-engine', 40, 70, -56, 3, 22, cfg.engineHits, true);
  boss.right = part(boss, 'right engine', 'hauler-engine', 40, 70, 56, 3, 22, cfg.engineHits, true);
  boss.body = part(boss, 'body', null, 0, 0, 0, -6, 40, cfg.bodyHits, false);
  state.bosses.push(boss);
}

function makeCore(cfg, name) {
  const [w, h] = cfg.size;
  const boss = { name, cfg, kind: 'core', t: 0, phase: 'enter', x: W / 2, y: -h, parts: [], fireWait: 1.5 };
  boss.title = cfg.name;
  boss.w = w; boss.h = h;
  boss.el = sprite(cfg.art, w, h);
  layer('air').appendChild(boss.el);
  boss.turrets = cfg.turrets.map(([ox, oy], i) => {
    const t = part(boss, 'turret', 'core-turret', 44, 56, ox, oy, 22, cfg.turretHits, true);
    t.fireWait = 1 + i * 0.5;
    return t;
  });
  const [ex, ey] = cfg.eye;
  boss.eye = part(boss, 'eye', 'core-eye', 92, 92, ex, ey, 40, cfg.eyeHits, false);
  boss.eye.el.classList.add('dark');
  state.bosses.push(boss);
}

export function spawnBoss(name) {
  const cfg = BOSSES[name];
  if (!cfg) { console.warn(`No boss called ${name}`); return; }
  if (cfg.kind === 'hauler') {
    if (cfg.twins) { makeHauler(cfg, name, W / 2 - 110); makeHauler(cfg, name, W / 2 + 110); }
    else makeHauler(cfg, name, W / 2);
  } else {
    makeCore(cfg, name);
  }
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

  if (boss.kind === 'hauler') {
    if (p === boss.body) die(boss);
    else if (!boss.left.alive && !boss.right.alive) { boss.body.open = true; fx.banner('NOW THE BODY!'); }
  } else if (p === boss.eye) {
    die(boss);
  } else {
    fx.award(boss.cfg.turretPoints, p.x, p.y - 20);
    if (boss.turrets.every((t) => !t.alive)) {
      boss.eye.open = true;
      boss.eye.el.classList.remove('dark');
      boss.eye.el.classList.add('awake');
      boss.fireWait = 1.2;
      fx.banner('HIT THE EYE!');
    }
  }
}

// The big moment: time slows right down, BOSS DOWN! Glowing cracks
// spread over the boss and bangs go off along them. Then it splits
// along the cracks and the pieces tumble away. (See js/breakup.js.)
function die(boss) {
  boss.phase = 'dying';
  boss.t = 0;
  boss.el.classList.add('dying');
  state.slow = 1.6;
  fx.banner('BOSS DOWN!', 'gold');
  fx.shake(true);
  boss.cracks = makeCracks(boss.kind === 'core' ? 5 : 4);
  const booms = boss.kind === 'core' ? 14 : 9;
  const end = booms * 0.16 + 0.2;
  showCracks(boss, end);
  for (let i = 0; i < booms; i++) {
    after(i * 0.16, () => {
      // Each bang is a bit further out along one of the cracks.
      const crack = boss.cracks[i % boss.cracks.length];
      const step = Math.min(2, 1 + Math.floor(i / boss.cracks.length / 1.5));
      const [x, y] = crackSpot(boss, crack.pts[step]);
      fx.boom(x, y, 60 + Math.random() * 40, 8, '#9aa0bd');
      sound.boom();
      if (i % 3 === 0) fx.shake(true);
    });
  }
  after(end, () => {
    fx.boom(boss.x, boss.y, boss.w * 0.9, 18, '#ffd23f');
    fx.flash();
    fx.shake(true);
    breakApart(boss);
    fx.award(boss.cfg.points, boss.x, boss.y - 40);
    if (boss.cfg.drops) boss.cfg.drops.forEach((d, i) => drop(d, boss.x + (i - 1.5) * 34, boss.y));
    boss.gone = true;
  });
  // The level's last boss: the level is won.
  if (boss.kind === 'core') {
    state.ending = isLastLevel() ? 'win' : 'clear';
    state.endTimer = end + 3;
  }
}

// A ring of bullets from the eye, with a gap pointing at you.
function fireRing(boss, turn = 0) {
  const eye = boss.eye;
  const s = state.ship;
  const slots = boss.cfg.ring + 2;
  const stepAngle = 360 / slots;
  // Which way is the ship? 0 means straight down.
  const toShip = (Math.atan2(s.x - eye.x, s.y - eye.y) * 180) / Math.PI;
  for (let k = 0; k < slots; k++) {
    if (k === 0 || k === slots - 1) continue;        // the gap, always on your side
    addFoe(eye.x, eye.y, toShip + stepAngle / 2 + k * stepAngle + turn, 105, 'pink');
  }
}

function fight(boss, dt) {
  const cfg = boss.cfg;
  if (boss.kind === 'hauler') {
    const wobble = boss.body.open ? Math.sin(boss.t * 14) * 5 : 0;
    boss.x = boss.cx + Math.sin((boss.t - 2.5) * 0.9) * boss.sway + wobble;
    boss.fireWait -= dt;
    if (boss.fireWait <= 0) {
      boss.fireWait = cfg.fireEvery / 2;
      boss.gun = 1 - boss.gun;
      addFoe(boss.x + (boss.gun ? 25 : -25), boss.y + 30, 0, 140, 'pink');
    }
    if (boss.t > cfg.stay) { boss.phase = 'leave'; fx.banner('IT GOT AWAY'); }
    return;
  }
  // A small sway, so every gun stays on screen.
  const sway = Math.max(8, Math.min(28, (W - boss.w) / 2 + 20));
  boss.x = W / 2 + Math.sin(boss.t * 0.4) * sway;
  for (const t of boss.turrets) {
    if (!t.alive) continue;
    t.fireWait -= dt;
    if (t.fireWait <= 0) { t.fireWait = cfg.turretEvery; addFoe(t.x, t.y + 30, 0, cfg.turretShot === 'red' ? 190 : 140, cfg.turretShot || 'green'); }
  }
  if (boss.eye.open) {
    boss.fireWait -= dt;
    if (boss.fireWait <= 0) {
      boss.fireWait = cfg.ringEvery;
      fireRing(boss);
      if (cfg.double) after(0.5, () => { if (boss.phase === 'fight') fireRing(boss); });
    }
  }
  if (state.time > level().length) {
    boss.phase = 'leave';
    state.stats.escaped = true;
    fx.banner('IT GOT AWAY');
  }
}

export function updateBosses(dt) {
  for (const boss of state.bosses) {
    boss.t += dt;
    if (boss.phase === 'enter') {
      const stop = boss.kind === 'hauler' ? 170 : 210;
      boss.y += (stop - boss.y) * Math.min(1, dt * 1.6);
      if (boss.t > 2.5) {
        boss.phase = 'fight';
        boss.t = 2.5;
        if (boss === state.bosses[0]) fx.banner(boss.kind === 'hauler' ? 'SHOOT THE ENGINES!' : 'SHOOT THE GUNS!');
      }
    } else if (boss.phase === 'fight') {
      fight(boss, dt);
    } else if (boss.phase === 'leave') {
      boss.y -= 120 * dt;
      if (boss.y < -boss.h - 60) {
        boss.gone = true;
        if (boss.kind === 'core') { state.ending = isLastLevel() ? 'win' : 'clear'; state.endTimer = 1; }
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

// For the bar across the top: how much boss is left? (Both twins count.)
export function bossHealth() {
  const live = state.bosses.filter((b) => b.phase !== 'dying');
  if (live.length === 0) return null;
  let hp = 0;
  let max = 0;
  for (const boss of live) for (const p of boss.parts) { hp += Math.max(0, p.hp); max += p.max; }
  return { name: live[0].title, left: hp / max };
}
