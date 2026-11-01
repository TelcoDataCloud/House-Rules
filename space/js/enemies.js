/* ===========================================================
   ENEMIES: the ships in the air

   A line in data/waves.js makes a group of them. Each one flies
   using a "pattern", a small recipe for how it moves. The
   patterns are here; which enemy uses which is in data/enemies.js.
   =========================================================== */

import { state, W, H, hardness } from './state.js';
import { sprite, put, layer } from './art.js';
import { ENEMIES, DROP_EVERY } from '../data/enemies.js';
import { addFoe } from './bullets.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

let flockId = 0;

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
  for (const p of group) {
    const el = sprite(spec.art, spec.size, spec.size);
    el.hidden = true;
    layer('air').appendChild(el);
    const hp = Math.ceil(spec.hits * hardness().tough);
    state.enemies.push({
      spec, el, flock,
      x: p.x ?? -100, y: p.y ?? -100, x0: p.x, ox: p.ox, oy: p.oy, dir: p.dir,
      wait: p.wait, t: 0, phase: 0, fireWait: spec.fireEvery || 0,
      hp, r: spec.size * 0.36, w: spec.size, h: spec.size, flashT: 0,
      onHit(n) { hurt(this, n); },
    });
  }
}

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
      if (e.y > 140) { e.phase = 1; e.t = 0; e.el.classList.add('warn'); }
    } else if (e.phase === 1) {
      if (e.t > 1.1) {
        e.phase = 2;
        e.el.classList.remove('warn');
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

  // The Bruiser: come down, float side to side, fire a fan straight down.
  hover(e, dt) {
    if (e.phase === 0) {
      e.y += e.spec.speed * dt;
      if (e.y > 150) { e.phase = 1; e.t = 0; }
      return;
    }
    e.x = e.x0 + Math.sin(e.t * 0.6) * 100;
    if (e.t > 16) e.y += 70 * dt;          // gets bored and leaves
    e.fireWait -= dt;
    if (e.fireWait <= 0 && e.y < H - 200) {
      e.fireWait = e.spec.fireEvery;
      for (const a of [-20, 0, 20]) addFoe(e.x, e.y + 30, a, 140, 'pink');
    }
  },

  // The red flock: one big swoop across the screen.
  loop(e, dt) {
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
    if (e.el.hidden) e.el.hidden = false;
    e.t += dt;
    PATTERNS[e.spec.pattern](e, dt);
    if (e.flashT > 0) { e.flashT -= dt; if (e.flashT <= 0) e.el.classList.remove('hit'); }
    if (e.spec.pattern !== 'loop' && (e.y > H + 60 || e.x < -80 || e.x > W + 80)) e.dead = true;
  }
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.dead) {
      if (e.escaped && e.flock) state.flocks[e.flock].broken = true;
      e.el.remove();
      state.enemies.splice(i, 1);
    }
  }
}

export function drawEnemies() {
  for (const e of state.enemies) if (e.wait <= 0) put(e.el, e.x, e.y, e.w, e.h);
}

function hurt(e, n) {
  if (e.dead) return;
  e.hp -= n;
  e.el.classList.add('hit');
  e.flashT = 0.06;
  if (e.hp <= 0) kill(e);
  else sound.ping();
}

function kill(e) {
  e.dead = true;
  sound.pop();
  fx.boom(e.x, e.y, e.spec.size * 1.2, e.spec.size > 70 ? 10 : 6);
  fx.award(e.spec.points, e.x, e.y - 20);
  state.dropCounter++;
  if (e.spec.size > 70) drop('P', e.x, e.y);            // big ones always drop
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

