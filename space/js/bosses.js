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

   Phases: stage 1 is the shell (engines or turrets). When that is
   gone the boss POWERS UP (stage 2): a moment where it can't be
   hurt, then it moves faster and its big cannon slides out. The
   cannon stops the boss, draws a red line where it will fire, then
   fires a huge laser down that line. A core boss has a stage 3,
   LAST STAND, when its eye is nearly done.
   =========================================================== */

import { state, W, H, hardness, after, level, isLastLevel } from './state.js';
import { sprite, put, layer } from './art.js';
import { BOSSES } from '../data/bosses.js';
import { BOSS_SHARE } from '../data/bombs.js';
import { addFoe } from './bullets.js';
import { spawnWave } from './enemies.js';
import { hitShip } from './ship.js';
import { SHIP } from '../data/ship.js';
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
    onHit(n, how) { hurt(boss, p, n, how); },
  };
  boss.parts.push(p);
  return p;
}

function makeHauler(cfg, name, cx) {
  const boss = { name, cfg, kind: 'hauler', t: 0, phase: 'enter', cx, x: cx, y: -160, parts: [], fireWait: 1.5, gun: 0, stage: 1, charging: 0, swayT: 0, hold: 0, twinDelay: cx > W / 2 ? 2.2 : 0 };
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
  const boss = { name, cfg, kind: 'core', t: 0, phase: 'enter', x: W / 2, y: -h, parts: [], fireWait: 1.5, stage: 1, charging: 0, swayT: 0, hold: 0, twinDelay: 0 };
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

function hurt(boss, p, n, how) {
  if (!p.alive || !p.open || boss.phase === 'dying' || boss.charging > 0) return;
  // A bomb only takes a little bit off a boss.
  if (how === 'bomb') n = Math.min(n, p.max * BOSS_SHARE);
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
    else if (!boss.left.alive && !boss.right.alive) powerUp(boss);
  } else if (p === boss.eye) {
    die(boss);
  } else {
    fx.award(boss.cfg.turretPoints, p.x, p.y - 20);
    if (boss.turrets.every((t) => !t.alive)) powerUp(boss);
  }
}

// Watch the eye: nearly done means LAST STAND.
function checkLastStand(boss) {
  if (boss.kind !== 'core' || boss.stage !== 2 || !hardness().lastStand || boss.eye.hp > boss.eye.max * 0.4) return;
  boss.stage = 3;
  boss.charging = 1;
  boss.el.classList.add('charging');
  fx.banner('LAST STAND!', 'warn');
  sound.powerUp();
  fx.shake(true);
  boss.escortWait = 2;
}

// Stage 2: the shell is gone. The boss can't be hurt for a moment
// while it powers up and its cannon slides out.
function powerUp(boss) {
  boss.stage = 2;
  boss.charging = 2;
  boss.el.classList.add('angry', 'charging');
  fx.banner('POWERING UP!', 'warn');
  sound.powerUp();
  fx.shake(true);
  const c = sprite('boss-cannon', 90, 120);
  if (boss.cfg.tint) c.classList.add(`tint-${boss.cfg.tint}`);
  layer('air').insertBefore(c, boss.el);           // behind the body
  const out = boss.kind === 'hauler' ? 62 : boss.h / 2 + 4;
  boss.cannon = { el: c, from: out - 70, to: out, oy: out - 70, angle: 0 };
  boss.cannonWait = 2.6 + boss.twinDelay;
}

// The end of powering up: open the weak spot.
function awake(boss) {
  boss.el.classList.remove('charging');
  if (boss.stage === 3) return;
  if (boss.kind === 'hauler') {
    boss.body.open = true;
    fx.banner('NOW THE BODY!');
  } else {
    boss.eye.open = true;
    boss.eye.el.classList.remove('dark');
    boss.eye.el.classList.add('awake');
    boss.fireWait = 1.2;
    fx.banner('HIT THE EYE!');
  }
}

// --- the big cannon: red line first, then the laser ---
function beamBox(cls) {
  const el = document.createElement('div');
  el.className = cls;
  layer('foes').appendChild(el);
  return el;
}

function placeBeam(el, shot, width) {
  el.style.width = `${width}px`;
  el.style.transformOrigin = '50% 0';
  el.style.height = `${shot.len.toFixed(0)}px`;
  el.style.transform = `translate(${(shot.x0 - width / 2).toFixed(1)}px, ${shot.y0.toFixed(1)}px) rotate(${shot.angle.toFixed(1)}deg)`;
}

function startCannon(boss) {
  const c = boss.cannon;
  // The cannon turns on its top hinge to aim where you are now.
  const px = boss.x;
  const py = boss.y + c.oy - 46;
  const tx = state.ship.x;
  const ty = H + 40;
  const rad = Math.atan2(px - tx, ty - py);
  const angle = (rad * 180) / Math.PI;
  const x0 = px - Math.sin(rad) * 98;             // the end of the barrel
  const y0 = py + Math.cos(rad) * 98;
  const len = Math.hypot(tx - x0, ty - y0) + 60;
  const warn = hardness().cannonWarn || 1.3;
  boss.shot = { x0, y0, angle, len, t: 0, warn, fire: 0.9, el: beamBox('boss-warn') };
  c.angle = angle;
  boss.hold = warn + 1.1;                         // keep still while it fires
  placeBeam(boss.shot.el, boss.shot, 6);
  sound.charge();
}

function updateCannon(boss, dt) {
  const c = boss.cannon;
  if (!c) return;
  c.oy += (c.to - c.oy) * Math.min(1, dt * 2);
  if (boss.charging > 0 || boss.phase !== 'fight') return;
  const sh = boss.shot;
  if (!sh) {
    boss.cannonWait -= dt;
    if (boss.cannonWait <= 0) startCannon(boss);
    return;
  }
  sh.t += dt;
  if (sh.t >= sh.warn && !sh.firing) {
    sh.firing = true;
    sh.el.remove();
    sh.el = beamBox('boss-beam');
    placeBeam(sh.el, sh, boss.cfg.cannonWidth);
    sound.bigLaser();
    fx.shake();
  }
  if (sh.firing) {
    // Does the laser touch the ship? Distance from the ship to the line.
    const s = state.ship;
    const rad = (sh.angle * Math.PI) / 180;
    const dx = -Math.sin(rad);
    const dy = Math.cos(rad);
    const rx = s.x - sh.x0;
    const ry = s.y - sh.y0;
    const along = rx * dx + ry * dy;
    const across = Math.abs(rx * dy - ry * dx);
    if (along > 0 && across < boss.cfg.cannonWidth / 2 + SHIP.hitSize) hitShip();
    if (sh.t >= sh.warn + sh.fire) {
      sh.el.remove();
      boss.shot = null;
      c.angle = 0;
      boss.cannonWait = boss.cfg.cannonEvery * (boss.stage === 3 ? 0.7 : 1);
    }
  }
}

function clearCannon(boss) {
  if (boss.shot) { boss.shot.el.remove(); boss.shot = null; }
  if (boss.cannon) { boss.cannon.el.remove(); boss.cannon = null; }
}

// The big moment: time slows right down, BOSS DOWN! Glowing cracks
// spread over the boss and bangs go off along them. Then it splits
// along the cracks and the pieces tumble away. (See js/breakup.js.)
function die(boss) {
  clearCannon(boss);
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
  const angry = boss.stage >= 2;
  if (boss.charging > 0) {
    boss.charging -= dt;
    if (boss.charging <= 0) awake(boss);
  }
  // Sway side to side, faster when angry. Stand still while the cannon fires.
  if (boss.hold > 0) boss.hold -= dt;
  else boss.swayT += dt * (angry ? (boss.kind === 'hauler' ? 1.7 : 2.2) : 1);
  updateCannon(boss, dt);

  if (boss.kind === 'hauler') {
    boss.x = boss.cx + Math.sin((boss.swayT - 2.5) * 0.9) * boss.sway;
    boss.fireWait -= dt;
    if (boss.fireWait <= 0 && boss.charging <= 0) {
      boss.fireWait = cfg.fireEvery / 2;
      boss.gun = 1 - boss.gun;
      const gx = boss.x + (boss.gun ? 25 : -25);
      if (angry) for (const a of [-14, 0, 14]) addFoe(gx, boss.y + 30, a, 140, 'pink');
      else addFoe(gx, boss.y + 30, 0, 140, 'pink');
    }
    // It only gives up and flies away if you haven't made it angry yet.
    if (!angry && boss.t > cfg.stay) { boss.phase = 'leave'; fx.banner('IT GOT AWAY'); }
    return;
  }
  // A small sway, so every gun stays on screen.
  const sway = Math.max(8, Math.min(28, (W - boss.w) / 2 + 20));
  boss.x = W / 2 + Math.sin(boss.swayT * 0.4) * sway;
  for (const t of boss.turrets) {
    if (!t.alive) continue;
    t.fireWait -= dt;
    if (t.fireWait <= 0) { t.fireWait = cfg.turretEvery; addFoe(t.x, t.y + 30, 0, cfg.turretShot === 'red' ? 190 : 140, cfg.turretShot || 'green'); }
  }
  if (boss.eye.open && boss.charging <= 0) {
    boss.fireWait -= dt;
    if (boss.fireWait <= 0) {
      boss.fireWait = cfg.ringEvery * (boss.stage === 3 ? 0.6 : 0.8);
      fireRing(boss);
      if (cfg.double || boss.stage === 3) after(0.5, () => { if (boss.phase === 'fight') fireRing(boss, 12); });
    }
    checkLastStand(boss);
  }
  // Last stand: it calls in helper ships.
  if (boss.stage === 3) {
    boss.escortWait -= dt;
    if (boss.escortWait <= 0) { boss.escortWait = 7; spawnWave({ what: 'dart', how: 'row', count: 2 }); }
  }
  // A big boss gives up and flies away if you take too long.
  if (boss.t > (cfg.stay || 80)) {
    clearCannon(boss);
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
        boss.swayT = 2.5;
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
      clearCannon(boss);
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
    const c = boss.cannon;
    if (c) {
      // The cannon hangs from its top and turns to aim.
      c.el.style.transformOrigin = '50% 12%';
      c.el.style.transform = `translate(${(boss.x - 45).toFixed(1)}px, ${(boss.y + c.oy - 60).toFixed(1)}px) rotate(${c.angle.toFixed(1)}deg)`;
    }
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
