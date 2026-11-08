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
import { DIFFICULTY } from '../data/difficulty.js';
import { KEEP_AT_LEAST } from '../data/villagers.js';
import { wear, bite } from './hard.js';

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
    z.flyX = -dx / len * (t.data.tiles || 5);
    z.flyY = -dy / len * (t.data.tiles || 5);
    z.flying = 0.6;
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
    z.flyX = dx / len * (t.data.tiles || 4); z.flyY = dy / len * (t.data.tiles || 4);
    z.flying = 0.6; z.dizzy = 2;
    burst(z.x, z.y - 0.5, 'WHEEE');
    blip('boing');
    wear(t);
  },
  mirror(z, t) {
    if (z.mirrored === t) return;
    z.mirrored = t;
    z.stuck = t.data.seconds || 20;
    z.el.classList.add('stuck');
    burst(z.x, z.y - 0.5, 'hello handsome');
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
  bed(z, t) {
    const diff = DIFFICULTY[state.mode];
    const v = state.villagers.find((p) => p.bed === t && !p.taken && !(p.pumpkin > 0));
    if (!v) return;
    const canTake = diff.takeVillagers && state.night >= (diff.takeFrom || 1) && state.villagers.filter((p) => !p.taken).length > KEEP_AT_LEAST;
    if (canTake && z.data.bites) {
      if (!z.bedSince) { z.bedSince = state.time; burst(z.x, z.y - 0.5, 'hsss'); }
      if (state.time - z.bedSince < 3) return;
      bite(z, v);
      z.leaving = true;
      return;
    }
    if (canTake && !z.carrying) {
      // it takes three seconds of tugging: whack him off before then
      if (!z.bedSince) { z.bedSince = state.time; burst(z.x, z.y - 0.5, 'heave'); }
      if (state.time - z.bedSince < 3) return;
      z.bedSince = 0;
      v.taken = true;
      z.carrying = v;
      z.leaving = true;
      burst(z.x, z.y - 0.5, 'GOT ONE');
      blip('groan');
    } else if (!z.scaredT) {
      // Easy: the villager is scared, hops to the well, the zombie just stands there puzzled
      z.scaredT = 4;
      z.dizzy = 2;
      v.x = 12 + Math.random(); v.y = 9;
      burst(z.x, z.y - 0.5, 'eek');
    }
  },
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
