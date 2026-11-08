/* ===========================================================
   HARD: the things that only happen on Hard

   Traps wear out (uses in data/traps.js) and builders mend them
   in the morning. The bell tower makes every zombie look. The
   silver bell scares the werewolf. The dawn mirror sends zombies
   near it home early. The sprinkler cures slowly on its own. The
   giant net catches Giant Gary. The vampire bites instead of
   carrying, hates garlic and hisses at torches.
   =========================================================== */

import { state, TILE } from './state.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { LINES } from '../data/lines.js';
import { burst, splash } from './fx.js';
import { blip, say } from './voice.js';
import { cure } from './zombies.js';

// A trap has just gone off. On Hard it wears a little.
export function wear(t) {
  if (!DIFFICULTY[state.mode].trapsBreak || !t.data.uses) return;
  t.wear = (t.wear || 0) + 1;
  if (t.wear >= t.data.uses) {
    t.broken = true;
    t.el.classList.add('broken');
    burst(t.col + 0.5, t.row, 'CRACK');
    state.brokeTonight = (state.brokeTonight || 0) + 1;
  }
}

// Morning: each builder mends two broken traps
export function mend() {
  const builders = state.villagers.filter((v) => v.job === 'builder').length;
  let fixes = builders * 2;
  let left = 0;
  for (const t of state.things.values()) {
    if (!t.broken) continue;
    if (fixes > 0) { fixes--; fixTrap(t); } else left++;
  }
  return left;
}

export function fixTrap(t) {
  t.broken = false;
  t.wear = 0;
  t.used = false;
  t.el.classList.remove('broken');
  t.el.style.opacity = 1;
}

// Ring the bell tower: everyone turns to look
export function ringBell(t) {
  const diff = DIFFICULTY[state.mode];
  if (t.cooldown > 0) { burst(t.col + 0.5, t.row, 'wait'); return false; }
  t.cooldown = diff.bellEvery || 20;
  const reach = t.data.reach || 9;
  state.zombies.forEach((z) => {
    if (z.pit) return;
    if (Math.hypot(z.x - t.col - 0.5, z.y - t.row - 0.5) < reach) {
      z.goal = { x: t.col + 0.5, y: t.row + 1.2, bell: true };
      z.goalT = t.data.seconds || 6;
      z.circle = null;
    }
  });
  burst(t.col + 0.5, t.row - 0.5, 'DONG');
  blip('twang');
  return true;
}

// Every frame: the passive Hard traps
export function updateHard(dt) {
  const diff = DIFFICULTY[state.mode];
  for (const t of state.things.values()) {
    if (t.broken) continue;
    if (t.cooldown > 0) t.cooldown -= dt;
    const cx = t.col + 0.5, cy = t.row + 0.5;

    if (t.does === 'silver') {
      state.zombies.forEach((z) => {
        if (z.data.fears === 'silver' && !z.leaving && Math.hypot(z.x - cx, z.y - cy) < (t.data.reach || 4)) {
          z.leaving = true; z.circle = null; z.goal = null;
          burst(z.x, z.y - 0.8, 'YIPE');
          blip('boing');
        }
      });
    }

    if (t.does === 'dawn' && state.time > diff.nightSeconds * (t.data.from || 0.7)) {
      state.zombies.forEach((z) => {
        if (!z.leaving && !z.pit && Math.hypot(z.x - cx, z.y - cy) < (t.data.reach || 2)) {
          z.leaving = true; z.circle = null; z.goal = null;
          z.bubble.textContent = 'ooh, sun';
          burst(z.x, z.y - 0.8, 'yawn');
          blip('yawn');
        }
      });
    }

    if (t.does === 'sprinkler') {
      t.tick = (t.tick ?? t.data.seconds) - dt;
      if (t.tick <= 0) {
        t.tick = t.data.seconds || 15;
        const near = state.zombies.find((z) => !z.big && Math.hypot(z.x - cx, z.y - cy) < (t.data.reach || 2));
        splash(cx, cy, t.data.reach || 2);
        if (near) cure(near);
      }
    }
  }
  // the bell's pull on the zombies runs out
  state.zombies.forEach((z) => {
    if (z.goal && z.goal.bell) { z.goalT -= dt; if (z.goalT <= 0) z.goal = null; }
  });
}

// The vampire reaches a bed
export function bite(z, v) {
  v.taken = true;
  state.taken.push({ job: v.job, kind: z.kind });
  v.el.remove();
  state.villagers = state.villagers.filter((p) => p !== v);
  burst(z.x, z.y - 0.8, 'CHOMP');
  blip('groan');
  say(LINES.bitten);
  z.bedSince = 0;
}
