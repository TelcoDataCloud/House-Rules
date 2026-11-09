/* ===========================================================
   COMBAT: what makes whacking feel good

   The whack itself, using the weapon from data/weapons.js:
   stars for "stun" seconds, a flight of "knock" squares, a
   chance of an arm flying off (it crawls back and clicks on,
   and a zombie with an arm off cannot grab you). On top:
   - hit stop: the game freezes for a blink so a hit lands
   - shake: the village jolts
   - combo: hits in a row count up; at COMBO_SUPER, SUPER WHACK
   - spin: hold the whack for a moment and let go, hits all round
   - loot: whacked zombies drop carrots, planks and socks; run
     over them to pick them up
   =========================================================== */

import { state, TILE } from './state.js';
import { WEAPONS, SPIN_HOLD, SPIN_REACH, SPIN_COOLDOWN, COMBO_TIME, COMBO_SUPER, LOOT } from '../data/weapons.js';
import { LINES } from '../data/lines.js';
import { el } from './grid.js';
import { burst } from './fx.js';
import { blip, say } from './voice.js';
import { rescue } from './folk.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function weapon() { return WEAPONS[Math.min(state.weapon || 0, WEAPONS.length - 1)]; }
export function nextWeapon() { return WEAPONS[(state.weapon || 0) + 1] || null; }

// ---------- the swing ----------
let comboN = 0, comboAt = -99, spinReadyAt = 0;

export function swing(spin = false) {
  const h = state.hero;
  if (h.down > 0) return 0;
  const w = weapon();
  if (spin && state.time < spinReadyAt) { burst(h.x, h.y - 1, 'not yet'); return 0; }
  const reach = w.reach * (spin ? SPIN_REACH : 1);
  const superHit = !spin && comboN + 1 >= COMBO_SUPER;
  let n = 0;
  state.zombies.forEach((z) => {
    if (z.pit || z.big || z.leaving) return;
    const d = Math.hypot(z.x - h.x, z.y - h.y);
    if (d >= reach) return;
    if (z.data.heavy && !superHit && !spin) { burst(z.x, z.y - 0.8, 'nope'); return; }
    hit(z, w, superHit ? 2 : spin ? 1.3 : 1);
    n++;
  });
  swingLook(spin);
  if (!n) { burst(h.x, h.y - 0.9, 'swish'); blip('whoosh', { volume: 0.6 }); return 0; }

  // combo
  if (state.time - comboAt < COMBO_TIME) comboN += n; else comboN = n;
  comboAt = state.time;
  if (superHit) { burst(h.x, h.y - 1.4, 'SUPER WHACK'); comboN = 0; shake(2); blip('super'); }
  else if (comboN >= 2) burst(h.x, h.y - 1.4, `COMBO x${comboN}`);
  if (spin) { spinReadyAt = state.time + SPIN_COOLDOWN; burst(h.x, h.y - 1.4, 'SPIN!'); blip('whoosh'); }

  burst(h.x, h.y - 0.8, pick(LINES.whack));
  // each hit in a combo is a little higher, so a run of whacks sounds like it is building
  blip(w.sound || 'bonk', { rate: 1 + Math.min(comboN, 6) * 0.05 });
  hitStop(spin || superHit ? 0.12 : 0.06);
  shake(spin || superHit ? 2 : 1);
  if (!state.whackedOnce) {
    state.whackedOnce = true;
    say(LINES.firstWhack);
    import('./hud.js').then((m) => m.banner(LINES.firstWhack, 2200));
  }
  return n;
}

function hit(z, w, power) {
  const h = state.hero;
  rescue(z);   // was he dragging someone out of a cottage?
  z.dizzy = w.stun * (power > 1 ? 1.3 : 1);
  z.bedSince = 0;
  z.circle = null;
  const dx = z.x - h.x, dy = z.y - h.y, len = Math.hypot(dx, dy) || 1;
  const knock = w.knock * power;
  z.flyX = dx / len * knock / 0.35; z.flyY = dy / len * knock / 0.35;
  z.flying = 0.35;
  z.bowled = null; z.launchTrap = 'hero';   // whack him into a trap for a COMBO TRAP
  if (z.carrying) { z.carrying.taken = false; z.carrying = null; z.leaving = false; }
  if (!z.armOff && Math.random() < w.armOff) dropArm(z);
  if (Math.random() < w.drop) dropLoot(z.x, z.y);
  // Loose Bits always loses an arm (his trick)
  if (z.data.trick === 'loosebits' && !z.armOff) dropArm(z);
}

// The weapon in the hero's hand swings round
function swingLook(spin) {
  const g = document.querySelector('.hero .weapon');
  if (!g) return;
  g.classList.remove('swing', 'spin');
  void g.getBoundingClientRect();
  g.classList.add(spin ? 'spin' : 'swing');
}

// ---------- the spin: hold to charge ----------
let holdStart = 0, holding = false, spun = false;
export function holdDown() {
  if (holding) return;
  holding = true; spun = false; holdStart = performance.now();
  swing(false);   // a tap whacks straight away
  document.querySelector('.hero')?.classList.add('charging');
}
export function holdUp() {
  if (!holding) return;
  holding = false;
  document.querySelector('.hero')?.classList.remove('charging');
  const held = (performance.now() - holdStart) / 1000;
  if (held >= SPIN_HOLD && !spun) { spun = true; swing(true); }
}

// ---------- hit stop and shake ----------
export function hitStop(seconds) { state.hitStop = Math.max(state.hitStop || 0, seconds); }

function shake(size) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const s = document.getElementById('stage');
  s.classList.remove('shake', 'shake2');
  void s.offsetWidth;
  s.classList.add(size > 1 ? 'shake2' : 'shake');
}

// ---------- arms that fly off and crawl back ----------
function dropArm(z) {
  z.armOff = true;
  const a = Math.random() * Math.PI * 2;
  const e = el('use', { href: '#art-arm', width: 26, height: 26, class: 'dropped' });
  document.getElementById('things').appendChild(e);
  state.arms = state.arms || [];
  state.arms.push({ owner: z, x: z.x, y: z.y, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, wait: 4, el: e });
  burst(z.x, z.y - 0.7, 'ARM OFF');
  blip('twang');
}

// ---------- loot ----------
function dropLoot(x, y) {
  let r = Math.random(), item = LOOT[0];
  for (const l of LOOT) { if (r < l.chance) { item = l; break; } r -= l.chance; }
  const e = el('use', { href: '#art-' + item.art, width: 24, height: 24, class: 'loot' });
  document.getElementById('fx').appendChild(e);
  const a = Math.random() * Math.PI * 2;
  state.loot = state.loot || [];
  state.loot.push({ item, x, y, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, t: 25, el: e });
}

// Every frame: arms crawl, loot settles and gets picked up
export function updateCombat(dt) {
  const h = state.hero;
  (state.arms || []).forEach((a) => {
    a.x += a.vx * dt; a.y += a.vy * dt; a.vx *= 0.9; a.vy *= 0.9;
    a.wait -= dt;
    const z = a.owner;
    if (a.wait <= 0) {
      if (!state.zombies.includes(z)) { a.done = true; }
      else {
        const dx = z.x - a.x, dy = z.y - a.y, d = Math.hypot(dx, dy);
        if (d < 0.4) { a.done = true; z.armOff = false; burst(z.x, z.y - 0.7, 'click'); }
        else { a.x += dx / d * 2.2 * dt; a.y += dy / d * 2.2 * dt; }
      }
    }
    a.el.setAttribute('x', a.x * TILE - 13); a.el.setAttribute('y', a.y * TILE - 13);
    a.el.classList.toggle('crawling', a.wait <= 0);
  });
  state.arms = (state.arms || []).filter((a) => { if (a.done) a.el.remove(); return !a.done; });

  (state.loot || []).forEach((l) => {
    l.x += l.vx * dt; l.y += l.vy * dt; l.vx *= 0.88; l.vy *= 0.88;
    l.t -= dt;
    const d = Math.hypot(h.x - l.x, h.y - l.y);
    if (d < 1.6 && h.down <= 0) { l.x += (h.x - l.x) * Math.min(1, dt * 6); l.y += (h.y - l.y) * Math.min(1, dt * 6); }  // magnet
    if (d < 0.5 && h.down <= 0) {
      l.got = true;
      state[l.item.gives] = (state[l.item.gives] || 0) + l.item.amount;
      if (l.item.gives === 'socks') state.socksTonight = (state.socksTonight || 0) + 1;
      burst(h.x, h.y - 1, `+${l.item.amount} ${l.item.gives}`);
      blip('coin');
      import('./hud.js').then((m) => { m.drawCounts(); m.flashCount(l.item.gives); });
    }
    l.el.setAttribute('x', l.x * TILE - 12); l.el.setAttribute('y', l.y * TILE - 12);
    l.el.style.opacity = l.t < 4 ? (Math.floor(l.t * 6) % 2 ? 0.3 : 1) : 1;
  });
  state.loot = (state.loot || []).filter((l) => { if (l.got || l.t <= 0) l.el.remove(); return !(l.got || l.t <= 0); });
}

export function clearCombat() {
  (state.arms || []).forEach((a) => a.el.remove());
  (state.loot || []).forEach((l) => l.el.remove());
  state.arms = []; state.loot = [];
  comboN = 0; holding = false;
}

// The weapon drawn in the hero's hand
export function weaponLook(heroEl) {
  heroEl.querySelector('.weapon')?.remove();
  const w = weapon();
  const g = el('g', { class: 'weapon' });
  g.appendChild(el('use', { href: '#art-' + w.art, width: 30, height: 30, x: 22, y: -6 }));
  heroEl.appendChild(g);
}
