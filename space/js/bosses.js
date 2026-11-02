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
import { ctx, art as bitmap, sprite, glowOver, radial } from './canvas.js';
import { BOSSES } from '../data/bosses.js';
import { BOSS_SHARE } from '../data/bombs.js';
import { addFoe } from './bullets.js';
import { spawnWave } from './enemies.js';
import { hitShip } from './ship.js';
import { SHIP } from '../data/ship.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';
import { makeCracks, crackSpot, breakApart } from './breakup.js';

function part(boss, name, art, w, h, ox, oy, r, hits, open) {

  const hard = hardness();
  // Bosses get extra tough when your gun is strong (bossPower).
  const hp = Math.ceil(hits * (hard.tough / hard.power) * hard.bossPower);
  const p = {
    name, art, hidden: !art, w, h, ox, oy, r, hp, max: hp, alive: true, open, x: 0, y: -999, flashT: 0,
    onHit(n, how) { hurt(boss, p, n, how); },
  };
  boss.parts.push(p);
  return p;
}

function makeHauler(cfg, name, cx) {
  const boss = { name, cfg, kind: 'hauler', t: 0, phase: 'enter', cx, x: cx, y: -160, parts: [], fireWait: 1.5, gun: 0, stage: 1, charging: 0, swayT: 0, hold: 0, twinDelay: cx > W / 2 ? 2.2 : 0 };
  boss.title = cfg.name;
  // The Hauler kind: a body and two side parts (engines or guns) to shoot off.
  const [w, h] = cfg.size || [220, 120];
  const [ew, eh] = cfg.engineSize || [40, 70];
  const [ex, ey] = cfg.engineAt || [56, 3];
  boss.w = w; boss.h = h;
  boss.sway = cfg.twins ? 40 : 90;
  boss.art = cfg.art || 'hauler';
  const engine = cfg.engineArt || 'hauler-engine';
  boss.left = part(boss, 'left engine', engine, ew, eh, -ex, ey, 22, cfg.engineHits, true);
  boss.right = part(boss, 'right engine', engine, ew, eh, ex, ey, 22, cfg.engineHits, true);
  boss.body = part(boss, 'body', null, 0, 0, 0, -6, 40, cfg.bodyHits, false);
  state.bosses.push(boss);
}

function makeCore(cfg, name) {
  const [w, h] = cfg.size;
  const boss = { name, cfg, kind: 'core', t: 0, phase: 'enter', x: W / 2, y: -h, parts: [], fireWait: 1.5, stage: 1, charging: 0, swayT: 0, hold: 0, twinDelay: 0 };
  boss.title = cfg.name;
  boss.w = w; boss.h = h;
  boss.art = cfg.art;
  boss.turrets = cfg.turrets.map(([ox, oy], i) => {
    const t = part(boss, 'turret', 'core-turret', 44, 56, ox, oy, 22, cfg.turretHits, true);
    t.fireWait = 1 + i * 0.5;
    return t;
  });
  const [ex, ey] = cfg.eye;
  boss.eye = part(boss, 'eye', 'core-eye', 92, 92, ex, ey, 40, cfg.eyeHits, false);
  boss.eye.look = 'dark';
  // Walking bosses have legs underneath. Some legs can be shot off.
  boss.legs = [];
  if (cfg.legs) {
    const L = cfg.legs;
    boss.legs = L.at.map(([lx, ly], i) => {
      const leg = part(boss, 'leg', L.art, L.size[0], L.size[1], lx, ly, L.size[0] * 0.4, L.hits || 1, !!L.hits);
      leg.leg = true;                                // drawn under the body
      leg.side = i === 0 ? -1 : 1;
      leg.solid = !!L.hits;
      return leg;
    });
  }
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
  if (p.art) p.flashT = 0.06;
  else boss.flashT = 0.06;
  if (p.hp > 0) { sound.ping(p.x, true); return; }
  p.alive = false;
  sound.boom(p.x);
  fx.boom(p.x, p.y, 90, 8);
  if (p.art && !p.leg) p.hidden = true;

  if (boss.kind === 'hauler') {
    if (p === boss.body) die(boss);
    else if (!boss.left.alive && !boss.right.alive) powerUp(boss);
  } else if (p === boss.eye) {
    die(boss);
  } else {
    fx.award(boss.cfg.turretPoints, p.x, p.y - 20);
    if (p.name === 'leg') legOff(boss, p);
    const shell = [...boss.turrets, ...boss.legs.filter((l) => l.solid)];
    if (shell.every((t) => !t.alive)) powerUp(boss);
  }
}

// Watch the eye: nearly done means LAST STAND.
function checkLastStand(boss) {
  if (boss.kind !== 'core' || boss.stage !== 2 || !hardness().lastStand || boss.eye.hp > boss.eye.max * 0.4) return;
  boss.stage = 3;
  boss.charging = 1;
  fx.banner('LAST STAND!', 'warn');
  sound.powerUp();
  fx.shake(true);
  boss.escortWait = 2;
}

// A leg is shot off: it falls away, and the boss staggers.
function legOff(boss, leg) {
  leg.offT = 0;                       // it falls off (see drawBosses)
  fx.shake(true);
  fx.banner('LEG DOWN!');
  after(1.2, () => { leg.hidden = true; });
}

// Stage 2: the shell is gone. The boss can't be hurt for a moment
// while it powers up and its cannon slides out.
function powerUp(boss) {
  boss.stage = 2;
  boss.charging = 2;
  boss.angry = true;
  fx.banner('POWERING UP!', 'warn');
  sound.powerUp();
  fx.shake(true);
  // A flying boss: the legs drop off and the jets light up.
  if (boss.cfg.flies) {
    for (const leg of boss.legs) { leg.alive = false; if (leg.offT === undefined) leg.offT = 0; }
    after(1.2, () => { for (const leg of boss.legs) leg.hidden = true; });
    boss.flying = true;
    fx.banner('IT CAN FLY!', 'warn');
    sound.whoosh();
  }
  const out = boss.kind === 'hauler' ? 62 : boss.h / 2 + 4;
  boss.cannon = { from: out - 70, to: out, oy: out - 70, angle: 0 };
  boss.cannonWait = 2.6 + boss.twinDelay;
}

// The end of powering up: open the weak spot.
function awake(boss) {
  if (boss.stage === 3) return;
  if (boss.kind === 'hauler') {
    boss.body.open = true;
    fx.banner('NOW THE BODY!');
  } else {
    boss.eye.open = true;
    boss.eye.look = 'awake';
    boss.fireWait = 1.2;
    fx.banner('HIT THE EYE!');
  }
}

// --- the big cannon: red line first, then the laser ---
// Draw the cannon's red warning line, or its big laser.
function drawShot(boss) {
  const sh = boss.shot;
  if (!sh) return;
  ctx.save();
  ctx.translate(sh.x0, sh.y0);
  ctx.rotate((sh.angle * Math.PI) / 180);
  if (!sh.firing) {
    // A dashed red line that blinks: this is where it will fire.
    if (Math.floor(sh.t * 11) % 2 === 0) {
      ctx.strokeStyle = '#ff3b3b';
      ctx.shadowColor = '#ff3b3b';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, sh.len);
      ctx.stroke();
    }
  } else {
    const w = boss.cfg.cannonWidth * (0.9 + Math.random() * 0.2);
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, 'rgba(255,59,59,0)');
    g.addColorStop(0.1, 'rgba(255,59,59,0.85)');
    g.addColorStop(0.25, '#ff7a1a');
    g.addColorStop(0.42, '#fff3d6');
    g.addColorStop(0.5, '#ffffff');
    g.addColorStop(0.58, '#fff3d6');
    g.addColorStop(0.75, '#ff7a1a');
    g.addColorStop(0.9, 'rgba(255,59,59,0.85)');
    g.addColorStop(1, 'rgba(255,59,59,0)');
    ctx.shadowColor = '#ff3b3b';
    ctx.shadowBlur = 30;
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, 0, w, sh.len);
  }
  ctx.restore();
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
  boss.shot = { x0, y0, angle, len, t: 0, warn, fire: 0.9 };
  c.angle = angle;
  boss.hold = warn + 1.1;                         // keep still while it fires
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
      boss.shot = null;
      c.angle = 0;
      boss.cannonWait = boss.cfg.cannonEvery * (boss.stage === 3 ? 0.7 : 1);
    }
  }
}

function clearCannon(boss) {
  boss.shot = null;
  boss.cannon = null;
}

// The big moment: time slows right down, BOSS DOWN! Glowing cracks
// spread over the boss and bangs go off along them. Then it splits
// along the cracks and the pieces tumble away. (See js/breakup.js.)
function die(boss) {
  clearCannon(boss);
  boss.phase = 'dying';
  boss.t = 0;
  state.slow = 1.6;
  fx.banner('BOSS DOWN!', 'gold');
  fx.shake(true);
  boss.cracks = makeCracks(boss.kind === 'core' ? 5 : 4);
  const booms = boss.kind === 'core' ? 14 : 9;
  const end = booms * 0.16 + 0.2;
  boss.crackTime = end;
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
    sound.bossDeath(boss.x);
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
      // Angry: big slow plasma balls instead of little orbs.
      boss.volley = (boss.volley || 0) + 1;
      if (angry && boss.volley % 3 === 0) for (const a of [-16, 16]) addFoe(gx, boss.y + 30, a, 85, 'plasma');
      else addFoe(gx, boss.y + 30, 0, 140, 'pink');
    }
    // It only gives up and flies away if you haven't made it angry yet.
    // It gives up and flies away if you take too long (a bit longer once it is angry).
    if (boss.t > cfg.stay * (angry ? 1.6 : 1) && !boss.shot) { clearCannon(boss); boss.phase = 'leave'; fx.banner('IT GOT AWAY'); }
    return;
  }
  if (boss.flying && boss.charging <= 0) {
    // Flying: big loops across the screen, a figure of eight.
    const k = boss.stage === 3 ? 1.35 : 1;
    boss.x = W / 2 + Math.sin(boss.swayT * 0.55 * k) * 95;
    boss.y += (200 + Math.sin(boss.swayT * 1.1 * k) * 55 - boss.y) * Math.min(1, dt * 2);
  } else {
    // A small sway, so every gun stays on screen.
    const sway = Math.max(8, Math.min(28, (W - boss.w) / 2 + 20));
    boss.x = W / 2 + Math.sin(boss.swayT * 0.4) * sway;
  }
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
    if (boss.escortWait <= 0) { boss.escortWait = 7; spawnWave({ what: boss.cfg.escort || 'dart', how: 'row', count: 2 }); }
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
    // Walking: the legs step forward and back, one after the other.
    const walking = boss.legs && boss.legs.length && !boss.flying && boss.phase !== 'dying' && boss.hold <= 0;
    if (walking) {
      // A stomp each time a foot comes down.
      const before = Math.floor((boss.step || 0) / Math.PI);
      boss.step = (boss.step || 0) + dt * 2.6;
      if (Math.floor(boss.step / Math.PI) !== before) { sound.stomp(boss.x); if (boss.kind === 'core') fx.shake(); }
    }
    for (const p of boss.parts) {
      p.x = boss.x + p.ox;
      p.y = boss.y + p.oy;
      if (p.name === 'leg' && boss.cfg.legs) p.y += Math.sin((boss.step || 0) + (p.side > 0 ? Math.PI : 0)) * boss.cfg.legs.stride;
      if (p.flashT > 0) p.flashT -= dt;
      if (p.offT !== undefined) p.offT += dt;
    }
    if (boss.flashT > 0) boss.flashT -= dt;
    boss.clock = (boss.clock || 0) + dt;
  }
  for (let i = state.bosses.length - 1; i >= 0; i--) {
    const boss = state.bosses[i];
    if (boss.gone) {
      clearCannon(boss);
      state.bosses.splice(i, 1);
    }
  }
}

// Draw every boss: legs underneath, then the cannon, then the
// body, then its guns and eye on top, then the cannon's laser.
export function drawBosses() {
  for (const boss of state.bosses) {
    if (boss.gone || boss.broken) continue;
    const tint = boss.cfg.tint || '';
    const t = boss.clock || 0;
    const dying = boss.phase === 'dying';
    // Shaking when it is dying.
    const jx = dying ? (Math.random() - 0.5) * 6 : 0;
    const jy = dying ? (Math.random() - 0.5) * 4 : 0;

    for (const p of boss.parts) {
      if (!p.leg || p.hidden) continue;
      let y = p.y;
      let rot = 0;
      let alpha = 1;
      if (p.offT !== undefined) {
        // A leg falling away: it drops, turns and fades.
        const k = Math.min(1, p.offT / 1.2);
        y += 120 * k * k;
        rot = 0.45 * k * p.side;
        alpha = 1 - k;
      }
      sprite(bitmap(p.art, { tint }), p.x + jx, y + jy, p.w, p.h, { rot, alpha, look: p.flashT > 0 ? 'white' : 'img', shadow: boss.flying ? null : [8, 16, 0.32] });
    }

    const c = boss.cannon;
    if (c) {
      // The cannon hangs from its top and turns to aim.
      sprite(bitmap('boss-cannon', { tint }), boss.x + jx, boss.y + c.oy + jy, 90, 120, { rot: (c.angle * Math.PI) / 180, oy: -45 });
    }

    // The body. White when hit, flashing when powering up or dying.
    const flashOn = (boss.charging > 0 || dying) && Math.floor(t * 14) % 2 === 0;
    const look = boss.flashT > 0 || flashOn ? 'white' : 'img';
    const body = bitmap(boss.art, { tint });
    if (boss.flying) {
      // Jet fire pours out of its back.
      for (const side of [-1, 1]) {
        const fx = boss.x + side * boss.w * 0.22;
        const len = 1 + Math.random() * 0.3;
        radial(fx, boss.y - boss.h / 2 - 8, 34 * len, [[0, '#ffffff'], [0.25, '#ffd23f'], [0.55, '#ff7a1a'], [1, 'rgba(255,59,26,0)']], 1, 'lighter');
      }
    }
    // Flying things are far above the ground, so their shadow is far away.
    const shadow = boss.flying ? [30, 60, 0.3] : [8, 16, 0.32];
    sprite(body, boss.x + jx, boss.y + jy, boss.w, boss.h, { look, shadow });
    if (boss.angry && !dying) glowOver(body, boss.x, boss.y, boss.w, boss.h, 'red', 0.12 + 0.12 * Math.sin(t * 12));
    if (dying && boss.cracks) drawCracks(boss, body);

    for (const p of boss.parts) {
      if (p.leg || p.hidden || !p.art) continue;
      const set = bitmap(p.art, { tint: p.name === 'eye' ? '' : tint });
      let pl = p.flashT > 0 ? 'white' : p.look === 'dark' ? 'dark' : 'img';
      sprite(set, p.x + jx, p.y + jy, p.w, p.h, { look: pl });
      if (p.look === 'awake') {
        // The eye glows pink when you can hurt it.
        radial(p.x, p.y, p.w * 0.75, [[0, 'rgba(255,63,164,0.5)'], [1, 'rgba(255,63,164,0)']], 0.6 + 0.4 * Math.sin(t * 10), 'lighter');
        glowOver(set, p.x, p.y, p.w, p.h, 'pink', 0.15 + 0.15 * Math.sin(t * 10));
      }
    }
    drawShot(boss);
  }
}

// Glowing cracks spread over a dying boss, only on its metal.
let crackCanvas = null;
function drawCracks(boss, body) {
  if (!body) return;
  const k = Math.min(1, (boss.t || 0) / boss.crackTime);
  const w = Math.ceil(boss.w);
  const h = Math.ceil(boss.h);
  if (!crackCanvas) crackCanvas = document.createElement('canvas');
  crackCanvas.width = w;
  crackCanvas.height = h;
  const g = crackCanvas.getContext('2d');
  g.drawImage(body.img, 0, 0, w, h);
  // 'source-in' keeps the cracks only where the boss has metal.
  g.globalCompositeOperation = 'source-in';
  g.strokeStyle = '#fff3c4';
  g.shadowColor = '#ff7a1a';
  g.shadowBlur = 8;
  g.lineWidth = 3 + 3 * k;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  for (const c of boss.cracks) {
    // Each crack grows out from the middle.
    const pts = c.pts.map(([x, y]) => [(0.5 + x) * w, (0.5 + y) * h]);
    const n = Math.min(pts.length - 1, Math.max(1, Math.floor(k * (pts.length - 1) * 1.2 + 1)));
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= n; i++) g.lineTo(pts[i][0], pts[i][1]);
  }
  g.stroke();
  ctx.drawImage(crackCanvas, boss.x - w / 2, boss.y - h / 2, w, h);
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
