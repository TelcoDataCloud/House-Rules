/* ===========================================================
   ENEMIES: the ships in the air

   A line in data/waves.js makes a group of them. Each one flies
   using a "pattern", a small recipe for how it moves. The
   patterns are here; which enemy uses which is in data/enemies.js.

   Small enemies shoot slow orbs if data/difficulty.js lets them.
   On Easy and Medium the orbs go straight down. On Hard, some
   come straight at you.
   =========================================================== */

import { state, W, H, hardness, after, level } from './state.js';
import { art, sprite } from './canvas.js';
import { ENEMIES, DROP_EVERY } from '../data/enemies.js';
import { addFoe } from './bullets.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

let flockId = 0;
let spawnCount = 0;

// Where each member of a group starts, and when.
function places(how, count, from) {
  const list = [];
  for (let i = 0; i < count; i++) {
    if (how === 'row') list.push({ x: (W * (i + 1)) / (count + 1), y: -40, wait: 0 });
    else if (how === 'left') list.push({ x: 110, y: -40, wait: i * 0.5 });
    else if (how === 'right') list.push({ x: W - 110, y: -40, wait: i * 0.5 });
    else if (how === 'middle') list.push({ x: W / 2 + (i % 2 ? 70 : -70) * Math.ceil(i / 2), y: -40, wait: i * 0.6 });
    else if (how === 'one') list.push({ x: [150, 330, 240, 120, 360][i % 5], y: -40, wait: i * 3.2 });
    else if (how === 'v') {
      const row = Math.ceil(i / 2);
      const side = i % 2 ? -1 : 1;
      list.push({ ox: row * 30 * side, oy: -row * 30, wait: 0, dir: from === 'right' ? -1 : 1 });
    }
  }
  return list;
}

export function spawnWave(line) {
  const spec = ENEMIES[line.what];
  if (!spec) { console.warn(`No enemy called ${line.what}`); return; }
  const group = places(line.how || 'row', line.count || 1, line.from);
  let flock = null;
  if (spec.pattern === 'loop') {
    flock = `f${++flockId}`;
    state.flocks[flock] = { size: group.length, got: 0, broken: false };
  }
  const hard = hardness();
  const shoots = spec.shotEvery > 0 && hard.shooters.includes(line.what);
  for (const p of group) {
    // A tank's turret is its own picture, so it can turn to aim.
    spawnCount++;
    const every = spec.shotEvery / hard.shootMore;
    state.enemies.push({
      spec, aim: 0, flock, kind: line.what,
      x: p.x ?? -100, y: p.y ?? -100, x0: p.x, ox: p.ox, oy: p.oy, dir: p.dir,
      wait: p.wait, t: 0, phase: 0,
      // Spread out the first shots so a group never fires all at once.
      shoots, shotWait: every * (0.5 + (spawnCount % 4) * 0.25), every,
      hp: Math.ceil(spec.hits * hard.tough), r: spec.size * 0.36, w: spec.size, h: spec.h || spec.size, flashT: 0,
      onHit(n) { hurt(this, n); },
    });
  }
}

// A small enemy fires one slow orb. Straight down, unless Hard says aim.
function shoot(e) {
  if (e.y < 30 || e.y > state.ship.y - 170) return;
  let angle = 0;
  if (e.spec.aims) angle = e.aimAt;                 // tanks aim with their turret
  else if (hardness().aim && spawnCount % 2 === 0) {
    angle = (Math.atan2(state.ship.x - e.x, state.ship.y - e.y) * 180) / Math.PI;
  }
  spawnCount++;
  const kind = e.spec.shot || 'pink';
  if (kind === 'bullet') {
    // Bullets come in a quick burst of three.
    for (let i = 0; i < 3; i++) after(i * 0.12, () => { if (!e.dead) addFoe(e.x, e.y + e.h * 0.35, angle, SHOT_SPEED.bullet, 'bullet'); });
  } else {
    addFoe(e.x, e.y + e.h * 0.35, angle, SHOT_SPEED[kind] || 120, kind);
  }
}

// How fast each kind of enemy shot flies.
export const SHOT_SPEED = { pink: 130, green: 140, red: 170, bullet: 230, rocket: 150, plasma: 85, mine: 90, bolt: 190 };

// --- the patterns ---
const PATTERNS = {
  straight(e, dt) {
    e.y += e.spec.speed * dt;
  },

  weave(e, dt) {
    e.y += e.spec.speed * dt;
    e.x = e.x0 + Math.sin(e.t * 2.2) * 80;
  },

  // Come down, stop, flash for a second, then dive at where you WERE.
  dive(e, dt) {
    if (e.phase === 0) {
      e.y += (150 - e.y) * Math.min(1, dt * 2.2);
      if (e.y > 140) { e.phase = 1; e.t = 0; e.warn = true; }
    } else if (e.phase === 1) {
      if (e.t > 1.1) {
        e.phase = 2;
        e.warn = false;
        const dx = state.ship.x - e.x;
        const dy = Math.max(80, state.ship.y - e.y);
        const d = Math.hypot(dx, dy);
        e.vx = (dx / d) * 330;
        e.vy = (dy / d) * 330;
      }
    } else {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    }
  },

  // Bounce off the sides of the screen on the way down.
  zigzag(e, dt) {
    if (e.vx === undefined) e.vx = (e.x < W / 2 ? 1 : -1) * 120;
    e.y += e.spec.speed * dt;
    e.x += e.vx * dt;
    if (e.x < 40) { e.x = 40; e.vx = Math.abs(e.vx); }
    if (e.x > W - 40) { e.x = W - 40; e.vx = -Math.abs(e.vx); }
  },

  // The Bruiser and Gunship: come down, float side to side, fire a fan straight down.
  hover(e, dt) {
    if (e.phase === 0) {
      e.y += e.spec.speed * dt;
      if (e.y > 150) { e.phase = 1; e.t = 0; }
      return;
    }
    e.x = e.x0 + Math.sin(e.t * 0.6) * 100;
    if (e.t > 16) e.y += 70 * dt;          // gets bored and leaves
    e.shotWait -= dt;
    if (e.shotWait <= 0 && e.y < H - 200) {
      e.shotWait = e.spec.shotEvery / hardness().shootMore;
      const n = e.spec.fan || 3;
      const kind = e.spec.shot || 'pink';
      for (let i = 0; i < n; i++) addFoe(e.x, e.y + 34, (i - (n - 1) / 2) * 16, SHOT_SPEED[kind] || 140, kind);
    }
  },

  // A tank drives down the ground, a bit faster than it scrolls,
  // and steers gently side to side. Its turret turns to aim at you.
  tank(e, dt) {
    e.y += (level().scroll + e.spec.speed) * dt;
    e.x = e.x0 + Math.sin(e.t * 0.5) * 50;
    const dx = state.ship.x - e.x;
    const dy = Math.max(1, state.ship.y - e.y);
    e.aimAt = (Math.atan2(dx, dy) * 180) / Math.PI;
    e.aim += (e.aimAt - e.aim) * Math.min(1, dt * 3);
  },

  // A walker: steps down the screen, swaying, dropping mines.
  walk(e, dt) {
    e.y += e.spec.speed * dt;
    e.x = e.x0 + Math.sin(e.t * 1.2) * 45;
  },

  // The red flock: one big swoop across the screen.
  loop(e) {
    const u = e.t / 7;
    e.x = W / 2 + e.dir * (-280 + 560 * u) + e.ox;
    e.y = -60 + 470 * Math.sin(Math.PI * u) + e.oy;
    if (u >= 1) {
      e.dead = true;
      e.escaped = true;
    }
  },
};

export function updateEnemies(dt) {
  for (const e of state.enemies) {
    if (e.dead) continue;
    if (e.wait > 0) {
      e.wait -= dt;
      if (e.wait > 0) continue;
    }
    e.t += dt;
    PATTERNS[e.spec.pattern](e, dt);
    if (e.shoots && e.spec.pattern !== 'hover' && !(e.spec.pattern === 'dive' && e.phase === 2)) {
      e.shotWait -= dt;
      if (e.shotWait <= 0) { e.shotWait = e.every; shoot(e); }
    }
    if (e.flashT > 0) e.flashT -= dt;
    if (e.spec.pattern !== 'loop' && (e.y > H + 60 || e.x < -80 || e.x > W + 80)) e.dead = true;
  }
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.dead) {
      if (e.escaped && e.flock) state.flocks[e.flock].broken = true;
      state.enemies.splice(i, 1);
    }
  }
}

// Draw the enemies. ground: true for tanks and walkers (drawn
// under everything that flies), false for the ones in the air.
export function drawEnemies(ground) {
  for (const e of state.enemies) {
    if (e.wait > 0 || !!e.spec.ground !== ground) continue;
    const look = e.flashT > 0 ? 'white' : e.warn && Math.floor(e.t * 10) % 2 ? 'red' : 'img';
    // Flying things cast a soft shadow on the ground far below.
    sprite(art(e.spec.art), e.x, e.y, e.w, e.h, { look, shadow: ground ? [3, 5, 0.45] : [8, 16, 0.32] });
    if (e.spec.turret) {
      // The turret turns on its ring, which is 20px down its picture.
      sprite(art(e.spec.turret), e.x, e.y + 8, 40, 56, { rot: (-e.aim * Math.PI) / 180, oy: -8, look: e.flashT > 0 ? 'white' : 'img' });
    }
  }
}

function hurt(e, n) {
  if (e.dead) return;
  e.hp -= n;
  e.flashT = 0.08;
  if (e.hp <= 0) kill(e);
  else sound.ping(e.x);
}

function kill(e) {
  e.dead = true;
  const big = e.spec.size > 70;
  if (big) sound.boom(e.x); else sound.pop(e.x);
  fx.boom(e.x, e.y, e.spec.size * (big ? 1.6 : 1.3), big ? 14 : 9, e.spec.colour);
  fx.award(e.spec.points, e.x, e.y - e.h / 2);
  state.dropCounter++;
  if (big) drop('P', e.x, e.y);            // big ones always drop
  else if (state.dropCounter >= DROP_EVERY) { state.dropCounter = 0; drop('P', e.x, e.y); }
  if (e.flock) {
    const f = state.flocks[e.flock];
    f.got++;
    if (f.got === f.size && !f.broken) {
      state.stats.flocks++;
      fx.banner('FLOCK BONUS!');
      fx.award(500, e.x, e.y - 40);
      for (let i = 0; i < 3; i++) drop('P', e.x + (i - 1) * 30, e.y);
    }
  }
}
