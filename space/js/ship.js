/* ===========================================================
   SHIP: the Comet

   Flies where you tell it, fires all by itself, fires homing
   missiles once you have them, drops bombs, picks upgrades,
   and floats the pilot off in a bubble when it gets hit.
   =========================================================== */

import { state, W, H, hardness, after } from './state.js';
import { sprite, put, layer } from './art.js';
import { input } from './input.js';
import { SHIP } from '../data/ship.js';
import { WEAPONS, START_SHOTS, POWER_BAR } from '../data/weapons.js';
import { addShot, addMissile, clearFoes } from './bullets.js';
import { targets } from './collide.js';
import { sound } from './audio.js';
import * as fx from './fx.js';

let box, pods, shieldEl, flame;

export function makeShip() {
  box = document.createElement('div');
  box.className = 'ship';
  box.appendChild(sprite(SHIP.art, 64, 80));
  pods = sprite('comet-pods', 64, 80);
  box.appendChild(pods);
  flame = document.createElement('div');
  flame.className = 'flame';
  box.prepend(flame);
  shieldEl = document.createElement('div');
  shieldEl.className = 'shield';
  box.appendChild(shieldEl);
  layer('ship').replaceChildren(box);
}

function fireRate() {
  const s = state.ship;
  const extra = s.rapid > 0 ? WEAPONS.rapid.steps[s.rapid - 1].extra : 0;
  return SHIP.fireRate + extra;
}

function fire() {
  const s = state.ship;
  const pattern = s.spread > 0 ? WEAPONS.spread.steps[s.spread - 1].shots : START_SHOTS;
  const gold = s.rapid > 0 && WEAPONS.rapid.steps[s.rapid - 1].gold;
  for (const shot of pattern) {
    const a = (shot.angle * Math.PI) / 180;
    addShot(s.x + shot.x, s.y - 34, Math.sin(a) * SHIP.shotSpeed, -Math.cos(a) * SHIP.shotSpeed, gold);
  }
}

function launchMissiles() {
  const s = state.ship;
  const step = WEAPONS.homing.steps[s.homing - 1];
  const sides = step.missiles === 1 ? [-1] : [-1, 1];
  for (const side of sides) addMissile(s.x + side * 30, s.y + 4, step.damage, side);
  s.missileWait = step.every;
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
    const step = Math.min(d, SHIP.speed * 1.6 * dt, d * 12 * dt);
    if (d > 0.5) { s.x += (dx / d) * step; s.y += (dy / d) * step; }
  } else {
    let vx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    let vy = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    if (vx && vy) { vx *= 0.707; vy *= 0.707; }
    s.x += vx * SHIP.speed * dt;
    s.y += vy * SHIP.speed * dt;
  }
  s.x = Math.max(28, Math.min(W - 28, s.x));
  s.y = Math.max(110, Math.min(H - 40, s.y));
}

export function updateShip(dt) {
  const s = state.ship;
  if (s.dead > 0) {
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
    if (s.shieldWait <= 0) { s.shield = true; sound.shield(); fx.floatText(s.x, s.y - 40, 'SHIELD'); }
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
}

export function drawShip() {
  const s = state.ship;
  box.hidden = s.dead > 0;
  put(box, s.x, s.y, 64, 80);
  box.classList.toggle('blinking', s.invuln > 0 && s.dead <= 0);
  pods.hidden = s.homing === 0;
  shieldEl.hidden = !s.shield;
  flame.style.height = `${24 + s.rapid * 9}px`;
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
    fx.floatText(s.x, s.y - 40, 'SHIELD GONE');
    return;
  }
  s.lives--;
  state.stats.livesLost++;
  s.dead = 1.4;
  s.shieldWait = hardness().shieldBack || 0;
  sound.hurt();
  fx.boom(s.x, s.y, 90, 10);
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
  sound.bomb();
  fx.bombRing(s.x, s.y);
  clearFoes();
  // Everything on screen takes 3 hits, a moment after the ring goes out.
  after(0.15, () => { for (const t of targets()) t.onHit(3); });
}

export function canPick() {
  return state.ship.power >= POWER_BAR && ['spread', 'homing', 'rapid'].some((k) => state.ship[k] < 3);
}

export function takeUpgrade(track) {
  const s = state.ship;
  if (s[track] >= 3) return false;
  s[track]++;
  s.power = 0;
  sound.power();
  fx.floatText(s.x, s.y - 50, WEAPONS[track].steps[s[track] - 1].say.toUpperCase(), true);
  return true;
}
