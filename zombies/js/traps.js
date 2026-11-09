/* ===========================================================
   TRAPS: what happens when a zombie steps on something

   One function per "does" word from data/traps.js. The zombie
   walks onto a square, the game looks at the thing there and
   calls the matching function below. To invent a new kind of
   trap, add a word here and in data/traps.js.
   =========================================================== */

import { state, TILE } from './state.js';
import { burst, splash } from './fx.js';
import { blip } from './voice.js';
import { wear } from './hard.js';
import { playMusic } from './voice.js';

const LAUGHS = ['HAHA', 'HEE HEE', 'HOHO', 'SNORT'];
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

// Send a zombie flying. Anything he hits on the way falls over too
// (zombies.js), and if he lands on another trap that is a COMBO TRAP.
function launch(z, t, fx, fy, seconds = 0.6) {
  z.flyX = fx; z.flyY = fy; z.flying = seconds;
  z.launchTrap = t; z.bowled = null;
}

const ACT = {
  pit(z, t) {
    if (z.big || t.held.length >= (t.data.holds || 3)) return;
    t.held.push(z);
    z.pit = t;
    z.x = t.col + 0.35 + t.held.length * 0.15;
    z.y = t.row + 0.6;
    z.el.classList.add('stuck');
    burst(z.x, z.y - 0.5, 'WHUMP');
    blip('bonk');
    if (t.held.length >= (t.data.holds || 3)) wear(t);
  },
  circle(z, t) {
    if (z.circle === t) return;
    z.circle = t;
    z.angle = Math.atan2(z.y - (t.row + 0.5), z.x - (t.col + 0.5));
    burst(t.col + 0.5, t.row, 'ooh brains');
  },
  bounce(z, t) {
    if (z.bounced === t) return;
    z.bounced = t;
    const dx = z.x - z.lastX, dy = z.y - z.lastY;
    const len = Math.hypot(dx, dy) || 1;
    launch(z, t, -dx / len * (t.data.tiles || 5), -dy / len * (t.data.tiles || 5));
    z.dizzy = 3;
    burst(z.x, z.y - 0.5, 'BOING');
    blip('boing');
    wear(t);
  },
  spin(z, t) {
    if (z.spun === t) return;
    z.spun = t;
    z.spinT = t.data.seconds || 5;
    z.dizzy = 1;
    burst(z.x, z.y - 0.5, 'WHIRL');
    blip('twang');
    wear(t);
  },
  drop(z, t) {
    if (t.used) return;
    t.used = true;
    t.el.style.opacity = 0.35;
    z.blind = 10;
    burst(z.x, z.y - 0.5, 'SPLAT');
    blip('splat');
    wear(t);
  },
  stick(z, t) {
    if (z.stuckBy === t) return;
    z.stuckBy = t;
    z.stuck = t.data.seconds || 15;
    z.el.classList.add('stuck');
    burst(z.x, z.y - 0.5, 'STUCK');
    blip('splat');
    wear(t);
  },
  log(z, t) {
    if (t.used) return;
    t.used = true;
    t.el.style.opacity = 0.35;
    let n = 0;
    state.zombies.forEach((o) => {
      if (Math.abs(o.y - (t.row + 0.5)) < 0.9 && Math.abs(o.x - (t.col + 0.5)) < 10 && !o.pit) {
        o.dizzy = Math.max(o.dizzy, 4); n++;
      }
    });
    burst(t.col + 0.5, t.row, n >= 3 ? 'STRIKE' : 'WHACK');
    blip('bonk');
    wear(t);
  },
  slow(z, t) { z.slowOn = t.data.slow || 0.4; },
  ice(z, t) {
    if (z.iced === t) return;
    z.iced = t;
    const dx = z.x - z.lastX, dy = z.y - z.lastY;
    const len = Math.hypot(dx, dy) || 1;
    launch(z, t, dx / len * (t.data.tiles || 4), dy / len * (t.data.tiles || 4));
    z.dizzy = 2;
    burst(z.x, z.y - 0.5, 'WHEEE');
    blip('boing');
    wear(t);
  },
  mirror(z, t) {
    if (z.mirrored === t) return;
    z.mirrored = t;
    if (z.data.hates === 'garlic') { burst(z.x, z.y - 0.5, 'no reflection?'); return; }   // vampires have no reflection
    z.stuck = t.data.seconds || 20;
    z.el.classList.add('stuck');
    burst(z.x, z.y - 0.5, 'hello handsome');
    wear(t);
  },
  whoopee(z, t) {
    if (z.whooped === t) return;
    z.whooped = t;
    const reach = t.data.reach || 3;
    burst(t.col + 0.5, t.row - 0.2, 'PFFFRRRT');
    blip('fart', { big: true });
    setTimeout(() => blip('laugh'), 500);
    state.zombies.forEach((o) => {
      if (o.pit || o.leaving || Math.hypot(o.x - t.col - 0.5, o.y - t.row - 0.5) > reach) return;
      o.pose = 'laughing'; o.poseT = t.data.seconds || 3;
      if (Math.random() < 0.6) burst(o.x, o.y - 0.7, pickOne(LAUGHS));
    });
    wear(t);
  },
  banana(z, t) {
    if (z.slipped === t) return;
    z.slipped = t;
    const dx = z.x - z.lastX, dy = z.y - z.lastY;
    const len = Math.hypot(dx, dy) || 1;
    launch(z, t, dx / len * (t.data.tiles || 4), dy / len * (t.data.tiles || 4), 0.8);
    z.dizzy = 2.5;
    burst(z.x, z.y - 0.5, 'WHOOPS');
    blip('slip');
    wear(t);
  },
  sneeze(z, t) {
    if (z.sneezed === t) return;
    z.sneezed = t;
    const dx = z.x - z.lastX, dy = z.y - z.lastY;
    const len = Math.hypot(dx, dy) || 1;
    z.pose = 'sneezing'; z.poseT = 0.5;
    burst(z.x, z.y - 0.6, 'aaah...');
    blip('sneeze');
    setTimeout(() => {
      if (!state.zombies.includes(z) || z.pit) return;
      z.pose = null; z.poseT = 0;
      launch(z, t, -dx / len * (t.data.tiles || 6), -dy / len * (t.data.tiles || 6), 0.7);
      z.dizzy = 2.5;
      burst(z.x, z.y - 0.6, 'CHOO!');
    }, 500 / (window.ZOMBIES.fast || 1));
    wear(t);
  },
  disco(z, t) {
    if (z.discoed === t || t.discoOn > state.time) return;
    z.discoed = t;
    const secs = t.data.seconds || 8;
    t.discoOn = state.time + secs;
    state.discoUntil = Math.max(state.discoUntil || 0, state.time + secs);
    burst(t.col + 0.5, t.row - 0.3, 'DANCE OFF!');
    t.el.classList.add('disco-on');
    playMusic('disco');
    state.zombies.forEach((o) => {
      if (o.pit || o.leaving || Math.hypot(o.x - t.col - 0.5, o.y - t.row - 0.5) > (t.data.reach || 3)) return;
      o.pose = 'dancing'; o.poseT = secs;
    });
    wear(t);
  },
  net(z, t) {
    if (!z.big || t.held.length) return;
    t.held.push(z);
    z.pit = t;
    z.x = t.col + 0.5; z.y = t.row + 0.5;
    burst(z.x, z.y - 1, 'GOT HIM');
    blip('twang');
  },
  farm(z, t) {
    if (z.eatT > 0 || z.data.wants !== 'farm') return;
    z.eatT = 2;
    if (state.carrots > 0) {
      state.carrots--;
      if (z.data.steals) { z.leaving = true; z.goal = null; burst(z.x, z.y - 0.5, 'GOT ONE'); }
      else burst(z.x, z.y - 0.5, 'munch');
    }
  },
  // Cottages: the zombies are after the villagers, not the house.
  // The munching is in js/zombies.js.
  bed() {},
};

export function stepOn(z, thing) {
  if (!thing || z.pit || thing.broken) return;
  const f = ACT[thing.does];
  if (f) f(z, thing);
}

// A bucket of potion lands here: cure what it hits
export function potionAt(x, y, radius = 1.2) {
  splash(x, y, radius);
  blip('pop');
  const hit = state.zombies.filter((z) => Math.hypot(z.x - x, z.y - y) <= radius);
  return hit;
}

export function pumpkinAt(x, y, radius = 1) {
  splash(x, y, radius, 'var(--pumpkin)');
  blip('splat');
  state.zombies.forEach((z) => {
    if (Math.hypot(z.x - x, z.y - y) <= radius && !z.pit) { z.blind = 10; z.dizzy = 1.5; burst(z.x, z.y - 0.5, 'SPLAT'); }
  });
}
