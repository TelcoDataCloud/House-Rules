/* ===========================================================
   BASES: the moon plates and everything built on them

   A base slides down the screen under you. Its parts come from
   data/bases.js (where they are) and data/parts.js (what they
   do). Turrets and missile pods shoot straight down the screen.
   Fuel tanks blow up their neighbours. Hangars launch Darts
   unless you get them first. Pylons power turrets. And the
   reactor takes the whole base with it.
   =========================================================== */

import { state, W, H, hardness, after, level } from './state.js';
import { sprite, put, layer } from './art.js';
import { BASES } from '../data/bases.js';
import { PARTS, TANK_BLAST, TANK_DAMAGE, PYLON_REACH } from '../data/parts.js';
import { addFoe } from './bullets.js';
import { spawnWave } from './enemies.js';
import { drop } from './pickups.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

const SVG = 'http://www.w3.org/2000/svg';

// A little dice that always rolls the same, so a base looks the same every game.
function dice(seed) {
  let n = seed;
  return () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
}

// Draw a long lumpy piece of moon with craters and a metal walkway.
function drawPlate(name, length) {
  const roll = dice(name.length * 977 + length);
  const top = 0;
  const bottom = length + 60;
  const left = [];
  const right = [];
  for (let y = bottom; y >= top; y -= 60) left.push([22 + roll() * 22, y]);
  for (let y = top; y <= bottom; y += 60) right.push([W - 22 - roll() * 22, y]);
  const edge = [...left, [80, top - 20], [W / 2, top - 30], [W - 80, top - 20], ...right, [W - 80, bottom + 20], [W / 2, bottom + 30], [80, bottom + 20]];
  const path = `M${edge.map((p) => p.map((v) => v.toFixed(0)).join(' ')).join(' L')} Z`;

  let craters = '';
  for (let i = 0; i < length / 110; i++) {
    const x = 60 + roll() * (W - 120);
    const y = 30 + roll() * length;
    const r = 8 + roll() * 18;
    if (Math.abs(x - W / 2) < 50) continue;
    craters += `<circle class="crater" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}"/>`
      + `<path class="crater-rim" d="M${(x - r * 0.8).toFixed(0)} ${(y - r * 0.2).toFixed(0)} A${r.toFixed(0)} ${r.toFixed(0)} 0 0 1 ${(x + r * 0.2).toFixed(0)} ${(y - r * 0.85).toFixed(0)}"/>`;
  }
  let lines = '';
  for (let y = 40; y < length; y += 70) lines += `<path class="walk-line" d="M${W / 2 - 26} ${y} L${W / 2 + 26} ${y}"/>`;

  // Coloured deck panels, blinking beacons and hazard stripes,
  // so the base looks built and busy, not just grey rock.
  let deck = '';
  for (let y = 40; y < length - 40; y += 150 + roll() * 60) {
    const leftSide = roll() < 0.5;
    const w = 70 + roll() * 50;
    const h = 46 + roll() * 40;
    const x = leftSide ? 60 + roll() * 60 : W - 60 - w - roll() * 60;
    deck += `<rect class="deck" x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="8"/>`
      + `<path class="deck-line" d="M${(x + 8).toFixed(0)} ${(y + h / 2).toFixed(0)} L${(x + w - 8).toFixed(0)} ${(y + h / 2).toFixed(0)}"/>`;
  }
  let beacons = '';
  for (let y = 60; y < length; y += 140) {
    beacons += `<circle class="beacon" cx="${W / 2 - 36}" cy="${y}" r="4.5"/><circle class="beacon beacon-b" cx="${W / 2 + 36}" cy="${y + 70}" r="4.5"/>`;
  }

  const el = document.createElement('div');
  el.className = 'plate';
  el.innerHTML = `<svg width="${W}" height="${bottom + 70}" viewBox="0 -30 ${W} ${bottom + 70}" aria-hidden="true">
    <defs><linearGradient id="rock-${name}" x1="0" x2="1">
      <stop offset="0" style="stop-color: var(--moon-light)"/>
      <stop offset="0.2" style="stop-color: var(--moon-rock)"/>
      <stop offset="1" style="stop-color: var(--moon-shadow)"/>
    </linearGradient>
    <pattern id="speck-${name}" width="70" height="70" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="12" r="1.6" class="speck-dark"/><circle cx="40" cy="6" r="1" class="speck-light"/>
      <circle cx="58" cy="30" r="2" class="speck-dark"/><circle cx="22" cy="44" r="1.2" class="speck-light"/>
      <circle cx="50" cy="58" r="1.4" class="speck-dark"/><circle cx="10" cy="62" r="0.9" class="speck-light"/>
      <circle cx="34" cy="26" r="0.8" class="speck-dark"/>
    </pattern></defs>
    <path class="rock" d="${path}" style="fill: url(#rock-${name})"/>
    <path d="${path}" style="fill: url(#speck-${name})"/>
    <path class="rim" d="${path}" transform="translate(3 4)"/>
    <path class="shade" d="M${W - 120} ${top} L${W - 40} ${top + 10} L${W - 40} ${bottom - 10} L${W - 120} ${bottom} Z"/>
    ${craters}
    ${deck}
    <path class="hazard" d="M${W / 2 - 30} 12 L${W / 2 - 30} ${length + 8}"/>
    <path class="hazard" d="M${W / 2 + 30} 12 L${W / 2 + 30} ${length + 8}"/>
    <rect class="walk" x="${W / 2 - 26}" y="10" width="52" height="${length}" rx="8"/>
    <rect class="walk-light" x="${W / 2 - 22}" y="14" width="10" height="${length - 8}" rx="4"/>
    ${lines}
    ${beacons}
  </svg>`;
  return el;
}

export function spawnBase(name) {
  const base = BASES[name];
  if (!base) { console.warn(`No base called ${name}`); return; }
  const el = drawPlate(name, base.length);
  layer('ground').appendChild(el);
  // "front" is where the start of the base is on screen. It begins at the top edge.
  const plate = { name, length: base.length, front: -20, el };
  state.plates.push(plate);

  for (const p of base.parts) {
    const spec = PARTS[p.part];
    if (!spec) { console.warn(`No part called ${p.part}`); continue; }
    const [w, h] = spec.size;
    const partEl = sprite(spec.art, w, h, spec.hits > 0 ? 'target' : '');
    partEl.hidden = true;
    layer('ground').appendChild(partEl);
    const part = {
      kind: p.part, spec, plate, el: partEl, w, h,
      x: p.across, y: plate.front - p.along, along: p.along,
      hp: Math.ceil(spec.hits * hardness().tough),
      hittable: spec.hits > 0, alive: true,
      r: Math.min(w, h) * 0.42,
      gives: p.gives || spec.drops,
      fireWait: spec.fireEvery ? (p.along % 100) / 100 * spec.fireEvery + 0.6 : 0,
      burst: 0, dark: false, launched: false, flashT: 0,
      onHit(n) { hurtPart(this, n); },
    };
    state.parts.push(part);
  }
}

function canShoot(part) {
  return part.alive && !part.dark && part.y > 20 && part.y < state.ship.y - 140;
}

export function updateBases(dt) {
  for (const plate of state.plates) {
    plate.front += level().scroll * dt;
    if (plate.front - plate.length > H + 80) plate.gone = true;
  }

  for (const part of state.parts) {
    part.y = part.plate.front - part.along;
    if (part.flashT > 0) { part.flashT -= dt; if (part.flashT <= 0) part.el.classList.remove('hit'); }
    if (!part.alive) continue;

    if (part.kind === 'turret' && canShoot(part)) {
      part.fireWait -= dt;
      if (part.fireWait <= 0) { part.fireWait = part.spec.fireEvery; addFoe(part.x, part.y + 30, 0, 150, 'green'); }
    }

    if (part.kind === 'missile' && canShoot(part)) {
      part.fireWait -= dt;
      if (part.fireWait <= 0) { part.fireWait = part.spec.fireEvery; part.burst = 3; part.burstWait = 0; }
      if (part.burst > 0) {
        part.burstWait -= dt;
        if (part.burstWait <= 0) { part.burst--; part.burstWait = 0.35; addFoe(part.x, part.y + 30, 0, 115, 'red'); }
      }
    }

    // The hangar opens when it gets near, and three Darts fly out.
    if (part.kind === 'hangar' && !part.launched && part.y > 210) {
      part.launched = true;
      part.el.classList.add('open');
      launchDarts(part);
    }
  }

  for (let i = state.parts.length - 1; i >= 0; i--) {
    const part = state.parts[i];
    if (part.plate.gone) { part.el.remove(); state.parts.splice(i, 1); }
  }
  for (let i = state.plates.length - 1; i >= 0; i--) {
    if (state.plates[i].gone) { state.plates[i].el.remove(); state.plates.splice(i, 1); }
  }
}

function launchDarts(hangar) {
  const before = state.enemies.length;
  spawnWave({ what: 'dart', count: 3, how: 'middle' });
  // Move the new Darts so they start at the hangar door, not the top.
  const darts = state.enemies.slice(before);
  darts.forEach((d, i) => { d.x = hangar.x + (i - 1) * 34; d.y = hangar.y + 20; d.wait = i * 0.3; });
}

export function drawBases() {
  for (const plate of state.plates) {
    plate.el.style.transform = `translate(0px, ${(plate.front - plate.length - 30).toFixed(1)}px)`;
  }
  for (const part of state.parts) {
    const onScreen = part.y > -120 && part.y < H + 120;
    part.el.hidden = !onScreen;
    if (onScreen) put(part.el, part.x, part.y, part.w, part.h);
  }
}

function hurtPart(part, n) {
  if (!part.alive) return;
  part.hp -= n;
  part.el.classList.add('hit');
  part.flashT = 0.06;
  if (part.hp <= 0) breakPart(part);
  else sound.ping();
}

// A part breaks. It stays on the moon as burnt wreckage.
function breakPart(part, chained = false) {
  if (!part.alive) return;
  part.alive = false;
  part.el.classList.remove('open', 'dark');
  part.el.classList.add('wreck');
  state.stats.partsDestroyed++;
  const big = part.kind === 'reactor' || part.kind === 'tank';
  fx.boom(part.x, part.y, big ? 130 : Math.max(part.w, 60) * 1.2, big ? 10 : 6);
  if (big) { sound.boom(); fx.shake(); } else sound.pop();
  fx.award(chained ? 100 : part.spec.points, part.x, part.y - 20);
  // On Hard, crates never give extra ships (the reactor still does).
  let gives = part.gives;
  if (gives === '1UP' && part.kind !== 'reactor' && !hardness().extraShips) gives = 'P';
  if (gives && !chained) drop(gives, part.x, part.y);

  if (part.kind === 'tank') {
    // BOOM: everything close by takes a big hit, a moment later.
    for (const other of state.parts) {
      if (other === part || !other.alive || !other.hittable || other.plate !== part.plate) continue;
      if (Math.hypot(other.x - part.x, other.along - part.along) < TANK_BLAST) after(0.15, () => hurtPart(other, TANK_DAMAGE));
    }
  }

  if (part.kind === 'pylon') {
    for (const t of state.parts) {
      if (t.kind === 'turret' && t.alive && t.plate === part.plate
        && Math.hypot(t.x - part.x, t.along - part.along) < PYLON_REACH) {
        t.dark = true;
        t.el.classList.add('dark');
      }
    }
  }

  if (part.kind === 'reactor') {
    state.stats.reactors++;
    fx.banner('BASE DOWN!');
    // Every part still standing goes up, one after another.
    const left = state.parts.filter((p) => p.alive && p.hittable && p.plate === part.plate);
    left.sort((a, b) => b.along - a.along);
    left.forEach((p, i) => after(0.12 + i * 0.09, () => breakPart(p, true)));
  }
}

