/* ===========================================================
   SHIP: the Comet

   Flies where you tell it and fires all by itself. Every upgrade
   you pick switches on a part of the ship picture (the <g class="up">
   bits in art/comet.svg), so you can see what you have.

   Weapons it can have, all from data/weapons.js:
     guns (Spread), laser colour, a beam, homing missiles, faster
     fire (Rapid), helper drones, and a bigger bomb bay.
   =========================================================== */

import { state, W, H, hardness, after } from './state.js';
import { sprite, put, layer, rawArt } from './art.js';
import { input } from './input.js';
import { SHIP } from '../data/ship.js';
import { WEAPONS, EXTRAS, START_SHOTS, POWER_BAR } from '../data/weapons.js';
import { addShot, addMissile, clearFoes } from './bullets.js';
import { targets } from './collide.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

const SHIP_W = 59;
const SHIP_H = 64;
const NOSE = 30;                 // from the middle of the ship up to its nose
const TRIM = { none: '#38f0ff', green: '#4dff7c', red: '#ff3b3b', purple: '#c07cff' };

let box, shieldEl, beamEl, beamTip, upParts = [], flames = [], droneEls = [];
let shownLevels = '';

export function makeShip() {
  box = document.createElement('div');
  box.className = 'ship';
  // The ship is put straight into the page (not as a copy), so every
  // upgrade part can be switched on and off.
  box.innerHTML = rawArt(SHIP.art);
  upParts = [...box.querySelectorAll('.up')];
  flames = [25, 34].map((left) => {
    const f = document.createElement('div');
    f.className = 'flame';
    f.style.left = `${left}px`;
    box.prepend(f);
    return f;
  });
  shieldEl = document.createElement('div');
  shieldEl.className = 'shield';
  box.appendChild(shieldEl);
  layer('ship').replaceChildren(box);

  droneEls = [0, 1].map(() => {
    const d = sprite('drone', 18, 20, 'drone');
    d.hidden = true;
    layer('ship').appendChild(d);
    return d;
  });

  beamEl = document.createElement('div');
  beamEl.className = 'beam';
  beamEl.hidden = true;
  beamTip = document.createElement('div');
  beamTip.className = 'beam-tip';
  beamTip.hidden = true;
  layer('shots').append(beamEl, beamTip);
  shownLevels = '';
}

// --- what each upgrade gives right now ---
function step(track) {
  const level = state.ship[track];
  return level > 0 ? WEAPONS[track].steps[level - 1] : null;
}

function laserLook() {
  const l = step('laser');
  return { damage: l ? l.damage : 1, through: l ? l.through : 0, colour: l ? l.laser : '' };
}

function fireRate() {
  const r = step('rapid');
  return SHIP.fireRate + (r ? r.extra : 0);
}

function fire() {
  const s = state.ship;
  const spread = step('spread');
  const pattern = spread ? spread.shots : START_SHOTS;
  const rapid = step('rapid');
  const look = laserLook();
  const cls = look.colour || (rapid && rapid.gold ? 'gold' : '');
  for (const shot of pattern) {
    const a = (shot.angle * Math.PI) / 180;
    addShot(s.x + shot.x, s.y - 18, Math.sin(a) * SHIP.shotSpeed, -Math.cos(a) * SHIP.shotSpeed,
      { cls, damage: look.damage, through: look.through });
  }
}

function launchMissiles() {
  const s = state.ship;
  const m = step('homing');
  const spots = m.missiles === 2 ? [[-19, 0]] : [[-19, 0], [-23, 3]];
  for (const [ox, oy] of spots) {
    addMissile(s.x + ox, s.y + oy, m.damage, -1);
    addMissile(s.x - ox, s.y + oy, m.damage, 1);
  }
  s.missileWait = m.every;
}

// --- drones fly beside you, a little behind, and shoot ---
function updateDrones(dt) {
  const s = state.ship;
  const d = step('drones');
  const count = d ? d.drones : 0;
  s.droneList = s.droneList || [];
  while (s.droneList.length < count) s.droneList.push({ x: s.x, y: s.y + 40, wait: 0.2 });
  s.droneList.length = count;
  const look = laserLook();
  s.droneList.forEach((drone, i) => {
    const side = i === 0 ? -1 : 1;
    const tx = s.x + side * 40;
    const ty = s.y + 10;
    drone.x += (tx - drone.x) * Math.min(1, dt * 7);
    drone.y += (ty - drone.y) * Math.min(1, dt * 7);
    drone.wait -= dt;
    if (drone.wait <= 0 && s.dead <= 0) {
      drone.wait = d.every;
      // Drones fire their own amber shots, so you can tell them apart.
      addShot(drone.x, drone.y - 10, 0, -SHIP.shotSpeed, { cls: 'drone', damage: look.damage, through: look.through });
    }
  });
}

// --- the beam: hits the nearest thing straight in front of you ---
function updateBeam(dt) {
  const s = state.ship;
  const b = step('beam');
  s.beamOn = !!b && s.dead <= 0 && s.entering <= 0;
  if (!s.beamOn) return;
  let best = null;
  for (const t of targets()) {
    if (t.y > s.y - 30 || t.y < -30) continue;
    if (Math.abs(t.x - s.x) < b.width / 2 + t.r && (!best || t.y > best.y)) best = t;
  }
  s.beamWidth = b.width;
  s.beamTop = best ? best.y + best.r * 0.3 : -20;
  s.beamHitting = !!best;
  if (best) {
    best.beamHeat = (best.beamHeat || 0) + b.power * dt;
    while (best.beamHeat >= 1 && best.hp > 0) { best.beamHeat -= 1; best.onHit(1); }
  }
}

function move(dt) {
  const s = state.ship;
  const usePointer = (state.controls === 'mouse' && !state.touch) || (state.touch && input.dragging);
  if (usePointer && input.pointer) {
    // Chase the pointer, a bit behind it, so it feels like flying.
    const tx = input.pointer.x;
    const ty = input.pointer.y - (state.touch ? 70 : 0);
    const dx = tx - s.x;
    const dy = ty - s.y;
    const d = Math.hypot(dx, dy);
    const stepSize = Math.min(d, SHIP.speed * 1.6 * dt, d * 12 * dt);
    if (d > 0.5) { s.x += (dx / d) * stepSize; s.y += (dy / d) * stepSize; }
  } else {
    let vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let vy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    if (vx && vy) { vx *= 0.707; vy *= 0.707; }
    s.x += vx * SHIP.speed * dt;
    s.y += vy * SHIP.speed * dt;
  }
  // Keep the whole ship, shield and all, inside the play area.
  s.x = Math.max(36, Math.min(W - 36, s.x));
  s.y = Math.max(120, Math.min(H - 40, s.y));
}

export function updateShip(dt) {
  const s = state.ship;
  updateDrones(dt);
  if (s.dead > 0) {
    s.beamOn = false;
    s.dead -= dt;
    if (s.dead <= 0 && s.lives > 0) respawn();
    return;
  }
  if (s.entering > 0) {
    s.entering -= dt;
    s.y += (H - 120 - s.y) * Math.min(1, dt * 4);
  } else {
    move(dt);
  }

  if (s.invuln > 0) s.invuln -= dt;

  const back = hardness().shieldBack;
  if (!s.shield && back && s.shieldWait > 0) {
    s.shieldWait -= dt;
    if (s.shieldWait <= 0) { s.shield = true; sound.shield(); fx.floatText(s.x, s.y - 50, 'SHIELD'); }
  }

  s.fireWait -= dt;
  if (s.fireWait <= 0) {
    fire();
    s.fireWait = Math.max(s.fireWait, -0.1) + 1 / fireRate();
  }
  if (s.homing > 0) {
    s.missileWait -= dt;
    if (s.missileWait <= 0) launchMissiles();
  }
  updateBeam(dt);
}

// Switch on the ship parts for every upgrade you have.
function showParts() {
  const s = state.ship;
  const levels = Object.keys(WEAPONS).map((k) => s[k]).join('');
  if (levels === shownLevels) return;
  shownLevels = levels;
  for (const g of upParts) {
    g.style.display = s[g.dataset.track] >= Number(g.dataset.level) ? '' : 'none';
  }
  const l = step('laser');
  box.style.setProperty('--trim', TRIM[l ? l.laser : 'none']);
  for (const d of droneEls) d.style.setProperty('--trim', TRIM[l ? l.laser : 'none']);
  beamEl.className = `beam beam-${s.beam}`;
}

export function drawShip() {
  const s = state.ship;
  showParts();
  box.hidden = s.dead > 0;
  put(box, s.x, s.y, SHIP_W, SHIP_H);
  box.classList.toggle('blinking', s.invuln > 0 && s.dead <= 0);
  shieldEl.hidden = !s.shield;
  for (const f of flames) f.style.height = `${12 + s.rapid * 5}px`;

  droneEls.forEach((el, i) => {
    const d = s.droneList && s.droneList[i];
    el.hidden = !d;
    if (d) put(el, d.x, d.y, 18, 20);
  });

  beamEl.hidden = !s.beamOn;
  beamTip.hidden = !s.beamOn || !s.beamHitting;
  if (s.beamOn) {
    const bottom = s.y - NOSE + 6;
    const top = Math.max(-10, s.beamTop);
    const w = s.beamWidth;
    beamEl.style.width = `${w}px`;
    beamEl.style.height = `${Math.max(0, bottom - top).toFixed(0)}px`;
    beamEl.style.transform = `translate(${(s.x - w / 2).toFixed(1)}px, ${top.toFixed(1)}px)`;
    if (s.beamHitting) put(beamTip, s.x, top, w * 2.4, w * 2.4);
  }
}

function respawn() {
  const s = state.ship;
  s.x = W / 2;
  s.y = H + 60;
  s.entering = 1;
  s.invuln = 3;
  s.dead = 0;
}

// Something touched the ship.
export function hitShip() {
  const s = state.ship;
  if (state.god || s.invuln > 0 || s.dead > 0 || s.entering > 0 || state.mode !== 'play') return;
  if (s.shield) {
    s.shield = false;
    s.invuln = 1.2;
    s.shieldWait = hardness().shieldBack || 0;
    sound.shield();
    fx.spark(s.x, s.y);
    fx.floatText(s.x, s.y - 50, 'SHIELD GONE');
    return;
  }
  s.lives--;
  state.stats.livesLost++;
  s.dead = 1.4;
  s.shieldWait = hardness().shieldBack || 0;
  sound.hurt();
  fx.boom(s.x, s.y, 110, 14, '#38f0ff');
  fx.pilot(s.x, s.y);
  fx.shake();
  if (s.lives <= 0) {
    s.dead = 999;
    state.ending = 'over';
    state.endTimer = 2.2;
  }
}

export function useBomb() {
  const s = state.ship;
  if (s.dead > 0 || s.entering > 0) return;
  if (s.bombs <= 0) { sound.nope(); return; }
  const bay = step('bay');
  s.bombs--;
  state.stats.bombsUsed++;
  s.invuln = Math.max(s.invuln, 1.5);
  if (bay && bay.shield) s.shield = true;
  sound.bomb();
  fx.bombRing(s.x, s.y);
  clearFoes();
  // Everything on screen gets hit, a moment after the ring goes out.
  const damage = bay ? bay.damage : 3;
  after(0.15, () => { for (const t of targets()) t.onHit(damage); });
}

export function canPick() {
  return state.ship.power >= POWER_BAR;
}

// Pick three different cards at random from what you can still get.
export function rollChoices() {
  const s = state.ship;
  const open = Object.keys(WEAPONS).filter((k) => s[k] < 3);
  for (let i = open.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [open[i], open[j]] = [open[j], open[i]];
  }
  const cards = open.slice(0, 3);
  const extras = Object.keys(EXTRAS).filter((k) => !(k === 'shield' && s.shield));
  // Now and then, a one-off card sneaks in.
  if (cards.length === 3 && Math.random() < 0.25) cards[2] = extras[Math.floor(Math.random() * extras.length)];
  for (const e of extras) if (cards.length < 3 && !cards.includes(e)) cards.push(e);
  return cards;
}

export function takeUpgrade(key) {
  const s = state.ship;
  if (EXTRAS[key]) {
    if (key === 'shield') s.shield = true;
    if (key === 'bombpack') s.bombs = Math.min(9, s.bombs + 2);
    s.power -= POWER_BAR;
    sound.upgrade(key);
    fx.floatText(s.x, s.y - 60, EXTRAS[key].say.toUpperCase(), true);
    return true;
  }
  if (!WEAPONS[key] || s[key] >= 3) return false;
  s[key]++;
  s.power -= POWER_BAR;
  const now = WEAPONS[key].steps[s[key] - 1];
  if (key === 'bay') s.bombs = Math.min(9, s.bombs + now.add);
  sound.upgrade(key);
  fx.floatText(s.x, s.y - 60, now.say.toUpperCase(), true);
  return true;
}
