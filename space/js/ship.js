/* ===========================================================
   SHIP: the Comet

   Flies where you tell it and fires all by itself. Every upgrade
   you pick switches on a part of the ship picture (the <g class="up">
   bits in art/comet.svg), so you can see what you have.

   One main gun at a time (data/weapons.js): Blaster, Laser, Beam
   or Railgun, level 1 to 6. Helpers on top: homing missiles and
   drones. One kind of bomb (data/bombs.js, fired in js/bombs.js).
   =========================================================== */

import { state, W, H, hardness, powerBar, giveBombs } from './state.js';
import { rawArt } from './art.js';
import { ctx, art, sprite, radial } from './canvas.js';
import { input } from './input.js';
import { SHIP, STAR } from '../data/ship.js';
import { GUNS, HELPERS, EXTRAS,  MAX_LEVEL } from '../data/weapons.js';
import { BOMBS } from '../data/bombs.js';
import { addShot, addMissile } from './bullets.js';
import { targets } from './collide.js';
import { fireBomb } from './bombs.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

const SHIP_W = 59;
const SHIP_H = 64;
const NOSE = 30;                 // from the middle of the ship up to its nose
const TRIM = { none: '#38f0ff', green: '#4dff7c', red: '#ff3b3b', purple: '#c07cff', pink: '#ff3fa4', yellow: '#ffd23f' };

// The ship's picture is remade (once) whenever its parts change.
let shownLook = '';
let shipText = '';
let lastShip = null;
let lastDrone = null;

export function makeShip() {
  shownLook = '';
  shipText = '';
}

// --- what you have right now ---
function gunNow() {
  const s = state.ship;
  return GUNS[s.gun].levels[s.gunLevel - 1];
}

function helper(track) {
  const level = state.ship[track];
  return level > 0 ? HELPERS[track].steps[level - 1] : null;
}

function fire() {
  const s = state.ship;
  const g = gunNow();
  const look = s.gun === 'laser' ? g.look : s.gunLevel >= 5 ? 'gold' : '';
  sound.shot(s.gun, s.x);
  for (const shot of g.shots) {
    const a = (shot.angle * Math.PI) / 180;
    addShot(s.x + shot.x, s.y - 18, Math.sin(a) * SHIP.shotSpeed, -Math.cos(a) * SHIP.shotSpeed,
      { cls: look, damage: shot.damage, through: g.through || 0, small: shot.damage < 0.5 });
  }
  return 1 / g.rate;
}

// The railgun: one flash straight up. Everything in the line gets hit.
function fireRail() {
  const s = state.ship;
  const g = gunNow();
  const top = -20;
  // A twin railgun fires two lines, a little apart. Still straight ahead.
  const lines = g.twin ? [-7, 7] : [0];
  for (const off of lines) {
    const x = s.x + off;
    // The nearest ones in the line get hit, up to pierce of them.
    const inLine = targets().filter((t) => t.y < s.y - 20 && t.y > top && Math.abs(t.x - x) < t.r + 7)
      .sort((a, b) => b.y - a.y).slice(0, g.pierce || 3);
    for (const t of inLine) t.onHit(g.twin ? g.damage / 2 : g.damage);
    // Shots in the way that can be shot down pop too.
    for (const b of state.foes) if (b.hp > 0 && b.y < s.y && Math.abs(b.x - x) < 14) { b.dead = true; fx.pop(b.x, b.y, b.colour); }
    fx.rail(x, s.y - NOSE, s.gunLevel);
  }
  sound.rail();
  return g.every;
}

function launchMissiles() {
  const s = state.ship;
  const m = helper('homing');
  const spots = m.missiles === 2 ? [[-19, 0]] : [[-19, 0], [-23, 3]];
  for (const [ox, oy] of spots) {
    addMissile(s.x + ox, s.y + oy, m.damage, -1);
    addMissile(s.x - ox, s.y + oy, m.damage, 1);
  }
  s.missileWait = m.every;
  sound.shot('missile', s.x);
}

// --- drones fly beside you, a little behind, and shoot ---
function updateDrones(dt) {
  const s = state.ship;
  const d = helper('drones');
  const count = d ? d.drones : 0;
  s.droneList = s.droneList || [];
  while (s.droneList.length < count) s.droneList.push({ x: s.x, y: s.y + 40, wait: 0.2 });
  s.droneList.length = count;
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
      addShot(drone.x, drone.y - 10, 0, -SHIP.shotSpeed, { cls: 'drone', damage: d.damage, through: 0 });
      if (i === 0) sound.shot('drone', drone.x);
    }
  });
}

// --- the beam: hits the nearest thing along its line ---
// angle 0 is straight up. Returns how far the beam reaches.
function beamRay(angle, width, power, dt, slot) {
  const s = state.ship;
  const ox = s.x;
  const oy = s.y - NOSE + 6;
  const dx = Math.sin((angle * Math.PI) / 180);
  const dy = -Math.cos((angle * Math.PI) / 180);
  let best = null;
  let bestAlong = 2000;
  for (const t of targets()) {
    const rx = t.x - ox;
    const ry = t.y - oy;
    const along = rx * dx + ry * dy;           // how far along the beam
    const across = Math.abs(rx * dy - ry * dx); // how far to the side
    if (along > 0 && t.y > -30 && across < width / 2 + t.r && along < bestAlong) { best = t; bestAlong = along; }
  }
  if (best) {
    const key = `beamHeat${slot}`;
    best[key] = (best[key] || 0) + power * dt;
    // Small steps, so a weak beam still chips away.
    while (best[key] >= 0.5 && best.hp > 0) { best[key] -= 0.5; best.onHit(0.5); }
    return { len: Math.max(0, bestAlong - best.r * 0.7), hit: true };
  }
  return { len: 1000, hit: false };
}

function updateBeam(dt) {
  const s = state.ship;
  s.beamOn = s.gun === 'beam' && s.dead <= 0 && s.entering <= 0;
  if (!s.beamOn) return;
  const g = gunNow();
  s.beams = [{ angle: 0, width: g.width, ...beamRay(0, g.width, g.power, dt, 0) }];
  if (g.split) {
    const w = Math.max(5, g.width * 0.45);
    s.beams.push({ angle: -g.split.angle, width: w, ...beamRay(-g.split.angle, w, g.split.power, dt, 1) });
    s.beams.push({ angle: g.split.angle, width: w, ...beamRay(g.split.angle, w, g.split.power, dt, 2) });
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
  if (s.star > 0) s.star -= dt;

  const back = hardness().shieldBack;
  if (!s.shield && back && s.shieldWait > 0) {
    s.shieldWait -= dt;
    if (s.shieldWait <= 0) { s.shield = true; sound.shield(); fx.floatText(s.x, s.y - 50, 'SHIELD'); }
  }

  s.fireWait -= dt;
  if (s.fireWait <= 0 && s.gun !== 'beam') {
    const wait = s.gun === 'rail' ? fireRail() : fire();
    s.fireWait = Math.max(s.fireWait, -0.1) + wait;
  }
  if (s.homing > 0) {
    s.missileWait -= dt;
    if (s.missileWait <= 0) launchMissiles();
  }
  updateBeam(dt);
}

// Which step of each ship part to show. The parts in art/comet.svg
// still use the old names: spread is the Blaster's extra guns, rapid
// is the bigger engines, bay is the bomb racks.
function partLevels() {
  const s = state.ship;
  const lv = s.gunLevel;
  return {
    spread: s.gun === 'blaster' ? Math.min(3, lv - 1) : 0,
    beam: s.gun === 'beam' ? Math.min(3, lv) : 0,
    rail: s.gun === 'rail' ? 1 : 0,
    rapid: Math.min(3, lv - 1),
    homing: s.homing,
    bay: s.bombLevel,
  };
}

// The ship picture with only the parts you have, in your trim colour.
function shipLook() {
  const s = state.ship;
  const lv = partLevels();
  const trim = s.gun === 'laser' ? gunNow().look : s.gun === 'beam' ? 'pink' : s.gun === 'rail' ? 'yellow' : 'none';
  const key = JSON.stringify(lv) + trim;
  if (key !== shownLook) {
    shownLook = key;
    const colour = TRIM[trim] || TRIM.none;
    shipText = rawArt(SHIP.art)
      .replace(/<g class="up" data-track="(\w+)" data-level="(\d)">[\s\S]*?<\/g>/g,
        (all, track, level) => ((lv[track] || 0) >= Number(level) ? all : ''))
      .replace(/var\(--trim,\s*#[0-9a-fA-F]+\)/g, colour);
    s.trimColour = colour;
  }
  const set = art(SHIP.art, { key, text: shipText });
  if (set) lastShip = set;
  return lastShip;
}

function droneLook() {
  const colour = state.ship.trimColour || TRIM.none;
  const set = art('drone', { key: colour, text: rawArt('drone').replace(/var\(--trim,\s*#[0-9a-fA-F]+\)/g, colour) });
  if (set) lastDrone = set;
  return lastDrone;
}

// Engine fire out of the two nozzles. Bigger as your gun grows.
function flames(s) {
  const len = 12 + Math.min(4, s.gunLevel - 1) * 3;
  for (const side of [-4.5, 4.5]) {
    const flick = 0.85 + Math.random() * 0.3;
    const x = s.x + side;
    const y = s.y + 24;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, y, 0, y + len * flick);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, '#7fe6f0');
    g.addColorStop(1, 'rgba(56,240,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.quadraticCurveTo(x, y + len * flick * 1.2, x + 4, y);
    ctx.fill();
    ctx.restore();
  }
}

function drawBeams(s) {
  if (!s.beamOn || !s.beams) return;
  const ox = s.x;
  const oy = s.y - NOSE + 6;
  const lv = s.gunLevel;
  s.beams.forEach((b, i) => {
    const len = Math.min(b.len, 1000);
    const flicker = 0.85 + Math.random() * 0.15;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.rotate((b.angle * Math.PI) / 180);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (i === 0 ? 1 : 0.6) * (lv === 1 ? 0.75 : 1) * flicker;
    const w = b.width;
    const g = ctx.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, 'rgba(255,63,164,0)');
    g.addColorStop(0.25, 'rgba(255,63,164,0.6)');
    g.addColorStop(0.42, '#ffd0ea');
    g.addColorStop(0.5, '#ffffff');
    g.addColorStop(0.58, '#ffd0ea');
    g.addColorStop(0.75, 'rgba(255,63,164,0.6)');
    g.addColorStop(1, 'rgba(255,63,164,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-w, -len, w * 2, len);
    ctx.restore();
    if (i === 0 && b.hit) {
      radial(ox, oy - len, w * 1.4, [[0, '#ffffff'], [0.3, '#ff3fa4'], [1, 'rgba(255,63,164,0)']], flicker, 'lighter');
    }
  });
}

export function drawShip() {
  const s = state.ship;
  const ship = shipLook();
  const blink = !(s.star > 0) && s.invuln > 0 && s.dead <= 0 && Math.floor(s.invuln * 8) % 2 === 0;

  (s.droneList || []).forEach((d) => {
    sprite(droneLook(), d.x, d.y, 18, 20, { shadow: [6, 14, 0.35] });
  });
  drawBeams(s);
  if (s.dead > 0) return;
  flames(s);
  sprite(ship, s.x, s.y, SHIP_W, SHIP_H, { alpha: blink ? 0.3 : 1, shadow: [6, 13, 0.35] });
  if (s.star > 0) {
    // STAR POWER: a gold glow, and a gold ring that shrinks as time runs out.
    const left = s.star / STAR.seconds;
    const flick = s.star < 1.2 && Math.floor(s.star * 10) % 2 === 0;
    radial(s.x, s.y, 50, [[0, 'rgba(255,225,74,0.5)'], [0.6, 'rgba(255,170,40,0.25)'], [1, 'rgba(255,170,40,0)']], flick ? 0.4 : 1, 'lighter');
    ctx.save();
    ctx.strokeStyle = '#ffe14a';
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 40, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
    ctx.stroke();
    ctx.restore();
  }
  if (s.shield) {
    // A thin, see-through bubble, so you can still see your ship.
    ctx.save();
    ctx.globalAlpha = 0.55 + 0.15 * Math.sin(state.time * 6);
    ctx.strokeStyle = '#38f0ff';
    ctx.shadowColor = '#38f0ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + 1, 36, 38, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    radial(s.x, s.y + 1, 38, [[0.7, 'rgba(56,240,255,0)'], [1, 'rgba(56,240,255,0.18)']]);
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
    sound.shieldBreak();
    fx.spark(s.x, s.y);
    fx.floatText(s.x, s.y - 50, 'SHIELD GONE');
    return;
  }
  s.lives--;
  state.stats.livesLost++;
  // Losing a ship costs a gun level (on Easy, only from level 3 on),
  // but never below level 2.
  if (state.levelIndex + 1 >= hardness().loseGun && s.gunLevel > 2) {
    s.gunLevel--;
    fx.floatText(s.x, s.y - 80, 'GUN DOWN', true);
  }
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
  s.bombs--;
  state.stats.bombsUsed++;
  s.invuln = Math.max(s.invuln, 1.5);
  fireBomb(s.bomb, s.bombLevel);
}

export function canPick() {
  return state.ship.power >= powerBar();
}

// --- the cards ---
// A card is a word like 'gun-up', 'gun-rail', 'homing', 'bomb-up',
// 'bomb-nuke', 'shield' or 'bombpack'.

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Pick three different cards at random from what you can still get.
export function rollChoices() {
  const s = state.ship;
  const pool = [];
  if (s.gunLevel < MAX_LEVEL) pool.push('gun-up');
  const otherGun = shuffle(Object.keys(GUNS).filter((k) => k !== s.gun))[0];
  pool.push(`gun-${otherGun}`);
  for (const k of Object.keys(HELPERS)) if (s[k] < 3) pool.push(k);
  // Rare bombs (like the Nuke) turn up less often.
  const others = Object.keys(BOMBS).filter((k) => k !== s.bomb);
  const weight = (k) => BOMBS[k].rare || 1;
  let roll = Math.random() * others.reduce((n, k) => n + weight(k), 0);
  const otherBomb = others.find((k) => (roll -= weight(k)) <= 0) || others[0];
  pool.push(s.bombLevel < 3 && Math.random() < 0.5 ? 'bomb-up' : `bomb-${otherBomb}`);
  shuffle(pool);
  // Levelling up your gun turns up more often than anything else.
  if (s.gunLevel < MAX_LEVEL && Math.random() < 0.6) {
    pool.splice(pool.indexOf('gun-up'), 1);
    pool.unshift('gun-up');
  }
  const cards = pool.slice(0, 3);
  // One-off cards, but never a pointless one (a shield when you have
  // one, bombs when you are full).
  const extras = Object.keys(EXTRAS).filter((k) => !(k === 'shield' && s.shield) && !(k === 'bombpack' && s.bombs >= SHIP.maxBombs));
  if (cards.length === 3 && Math.random() < 0.2) cards[2] = extras[Math.floor(Math.random() * extras.length)];
  for (const e of extras) if (cards.length < 3 && !cards.includes(e)) cards.push(e);
  return shuffle(cards);
}

// What a card shows: its name, what it does, its colour, and dots
// for how far along you are.
export function cardInfo(key) {
  const s = state.ship;
  if (EXTRAS[key]) return { name: EXTRAS[key].name, say: EXTRAS[key].say, colour: EXTRAS[key].colour, pic: key, tag: 'ONE GO' };
  if (key === 'gun-up') {
    const g = GUNS[s.gun];
    return { name: g.name, say: g.levels[s.gunLevel].say, colour: g.colour, pic: s.gun, level: s.gunLevel, max: MAX_LEVEL };
  }
  if (key.startsWith('gun-')) {
    const g = GUNS[key.slice(4)];
    return { name: g.name, say: `Swap gun. Keep level ${s.gunLevel}`, colour: g.colour, pic: key.slice(4), tag: 'SWAP' };
  }
  if (key === 'bomb-up') {
    const b = BOMBS[s.bomb];
    return { name: b.name, say: b.levels[s.bombLevel].say, colour: b.colour, pic: `bomb-${s.bomb}`, level: s.bombLevel, max: 3 };
  }
  if (key.startsWith('bomb-')) {
    const b = BOMBS[key.slice(5)];
    return { name: b.name, say: `New bombs, +1 bomb`, colour: b.colour, pic: key, tag: 'SWAP' };
  }
  const h = HELPERS[key];
  return { name: h.name, say: h.steps[s[key]].say, colour: h.colour, pic: key, level: s[key], max: 3, tag: s[key] === 0 ? 'NEW' : '' };
}

export function takeUpgrade(key) {
  const s = state.ship;
  let say = '';
  let tune = key;
  if (EXTRAS[key]) {
    if (key === 'shield') s.shield = true;
    if (key === 'bombpack') giveBombs(2);
    if (key === 'points') state.score += 3000;
    say = EXTRAS[key].say;
  } else if (key === 'gun-up') {
    if (s.gunLevel >= MAX_LEVEL) return false;
    s.gunLevel++;
    say = gunNow().say;
    tune = s.gun;
  } else if (key.startsWith('gun-')) {
    s.gun = key.slice(4);
    say = GUNS[s.gun].name;
    tune = s.gun;
  } else if (key === 'bomb-up') {
    if (s.bombLevel >= 3) return false;
    s.bombLevel++;
    giveBombs(1);
    say = BOMBS[s.bomb].levels[s.bombLevel - 1].say;
    tune = 'bay';
  } else if (key.startsWith('bomb-')) {
    s.bomb = key.slice(5);
    giveBombs(1);
    say = BOMBS[s.bomb].name;
    tune = 'bombpack';
  } else if (HELPERS[key]) {
    if (s[key] >= 3) return false;
    s[key]++;
    say = HELPERS[key].steps[s[key] - 1].say;
  } else return false;
  s.power -= powerBar();
  sound.upgrade(tune);
  fx.floatText(s.x, s.y - 60, say.toUpperCase(), true);
  return true;
}

// Auto power-up (a setting on the title screen): when the bar is
// full, pick for you straight away. A stronger gun first, then a
// helper, then whatever is left. No need to stop and press M.
export function autoUpgrade() {
  const cards = rollChoices();
  const pick = cards.find((k) => k === 'gun-up')
    || cards.find((k) => HELPERS[k])
    || cards.find((k) => k === 'bomb-up')
    || cards[0];
  takeUpgrade(pick);
}
