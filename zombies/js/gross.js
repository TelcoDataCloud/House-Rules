/* ===========================================================
   GROSS: the disgusting habits

   Each zombie in data/zombies.js can have a "trick" and a
   "throws". The tricks live here, one function each:

   bogey     flicks a bogey at the hero; it sticks, hero slows
   eyeball   his eye pops out and rolls off, he chases it
   loosebits when whacked he drops an arm and hops after it
   vomit     now and then he spews a puddle; anyone who steps
             in it slides
   burp      a burp flattens every fence nearby for a while

   To invent a new habit: add a word to a zombie in the data
   file and a function with that name in TRICKS below.
   =========================================================== */

import { state, TILE, COLS, ROWS } from './state.js';
import { el, thingAt } from './grid.js';
import { burst, splash } from './fx.js';
import { blip } from './voice.js';

const fx = () => document.getElementById('fx');

// A small picture that lives on the ground for a while (an eye,
// an arm, a puddle). Returns it so the zombie can chase it.
function dropThing(art, x, y, seconds, size = 28) {
  const e = el('use', { href: '#art-' + art, width: size, height: size, x: x * TILE - size / 2, y: y * TILE - size / 2, class: 'dropped' });
  document.getElementById('things').appendChild(e);   // under the people, on the ground
  const d = { art, x, y, t: seconds, el: e };
  state.dropped = state.dropped || [];
  state.dropped.push(d);
  return d;
}

export function updateDropped(dt) {
  if (!state.dropped) return;
  state.dropped.forEach((d) => {
    d.t -= dt;
    if (d.vx) { d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= 0.96; d.vy *= 0.96; d.el.setAttribute('x', d.x * TILE - 14); d.el.setAttribute('y', d.y * TILE - 14); }
    if (d.t <= 0) d.el.remove();
  });
  state.dropped = state.dropped.filter((d) => d.t > 0);
}

export function clearDropped() {
  (state.dropped || []).forEach((d) => d.el.remove());
  state.dropped = [];
}

// Every frame, for a zombie with a trick
export const TRICKS = {
  eyeball(z, dt) {
    z.trickT = (z.trickT ?? 6 + Math.random() * 8) - dt;
    if (z.eye) {
      // chase the eye
      const d = Math.hypot(z.eye.x - z.x, z.eye.y - z.y);
      z.goal = { x: z.eye.x, y: z.eye.y, eye: true };
      if ((d < 0.5 && z.eye.t < 11) || z.eye.t <= 0) { z.eye.t = 0; z.eye = null; z.goal = null; burst(z.x, z.y - 0.6, 'found it'); z.trickT = 15 + Math.random() * 10; }
      return;
    }
    if (z.trickT <= 0) {
      const a = Math.random() * Math.PI * 2;
      z.eye = dropThing('eye', z.x, z.y, 12);
      z.eye.vx = Math.cos(a) * 4; z.eye.vy = Math.sin(a) * 4;
      burst(z.x, z.y - 0.6, 'plop');
      blip('boing');
    }
  },
  loosebits(z, dt) {
    if (z.arm) {
      const d = Math.hypot(z.arm.x - z.x, z.arm.y - z.y);
      z.goal = { x: z.arm.x, y: z.arm.y, arm: true };
      z.hopping = true;
      if ((d < 0.5 && z.arm.t < 9) || z.arm.t <= 0) { z.arm.t = 0; z.arm = null; z.goal = null; z.hopping = false; burst(z.x, z.y - 0.6, 'click'); }
    }
  },
  vomit(z, dt) {
    z.trickT = (z.trickT ?? 8 + Math.random() * 6) - dt;
    if (z.trickT <= 0) {
      z.trickT = 14 + Math.random() * 8;
      const p = dropThing('puddle', z.x + 0.6, z.y + 0.3, 20, 40);
      p.puddle = true;
      splash(z.x + 0.6, z.y + 0.3, 0.8, 'var(--snot)');
      burst(z.x, z.y - 0.6, 'BLEURGH');
      blip('splat');
      z.dizzy = 1.5;
    }
  },
  burp(z, dt) {
    z.trickT = (z.trickT ?? 6) - dt;
    if (z.trickT <= 0) {
      z.trickT = 10;
      let n = 0;
      for (const t of state.things.values()) {
        if ((t.does === 'hold' || (t.does === 'block' && !t.data.stone)) && Math.hypot(t.col + 0.5 - z.x, t.row + 0.5 - z.y) < 3.5) {
          t.down = 15; t.el.style.transform = 'rotate(80deg)'; t.el.style.opacity = 0.6; n++;
        }
      }
      splash(z.x, z.y, 3, 'var(--gas)');
      burst(z.x, z.y - 1, n ? 'BUUURP' : 'burp');
      blip('groan');
    }
  },
};


// Fences that were burped flat stand up again
export function updateFlattened(dt) {
  for (const t of state.things.values()) {
    if (t.down > 0) {
      t.down -= dt;
      if (t.down <= 0) { t.down = 0; t.el.style.transform = ''; t.el.style.opacity = 1; }
    }
  }
}

// Anyone (zombie or hero) standing in a puddle slides
export function puddleAt(x, y) {
  return (state.dropped || []).find((d) => d.puddle && Math.hypot(d.x - x, d.y - y) < 0.7);
}

// The bogey: a little blob that flies at the hero
export function flickBogey(z) {
  const h = state.hero;
  const blob = el('use', { href: '#art-bogeyblob', width: 16, height: 16, class: 'shot' });
  fx().appendChild(blob);
  const sx = z.x, sy = z.y, start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / 500);
    const x = sx + (h.x - sx) * t, y = sy + (h.y - sy) * t - Math.sin(t * Math.PI) * 1.2;
    blob.setAttribute('x', x * TILE - 8); blob.setAttribute('y', y * TILE - 8);
    if (t < 1 && state.phase === 'night') requestAnimationFrame(step);
    else {
      blob.remove();
      if (state.phase !== 'night') return;
      if (Math.hypot(h.x - x, h.y - y) < 0.8) { h.sticky = 3; burst(h.x, h.y - 0.8, 'EW'); blip('splat'); }
    }
  }
  requestAnimationFrame(step);
  burst(z.x, z.y - 0.6, 'flick');
}
