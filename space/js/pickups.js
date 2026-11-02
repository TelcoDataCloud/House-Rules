/* ===========================================================
   PICKUPS: the tokens that fall out of things

   P power, B bomb, S shield, 1UP extra ship.
   They drift down slowly, and if your ship is close they are
   pulled towards you, so they are easy to catch.
   =========================================================== */

import { state, H, powerBar, giveBombs, giveLife } from './state.js';
import { autoUpgrade } from './ship.js';
import { STAR } from '../data/ship.js';
import { art, sprite, outlinedText, radial } from './canvas.js';
import { rawArt } from './art.js';
import {  BANK } from '../data/weapons.js';
import { sound } from './audio.js';
import { floatText, banner } from './fx.js';

// The glow colour of each capsule.
const CAP = { P: '#ff7a1a', B: '#ffd23f', S: '#38f0ff', '1UP': '#4dff7c', STAR: '#ffe14a' };
// What is written on each capsule.
const LABEL = { STAR: '\u2605' };

export function drop(type, x, y) {
  // A floating capsule (art/capsule.svg). Its glow colour says what is inside.
  state.pickups.push({ type, x, y, r: 16, w: 34, h: 44, vx: (Math.random() - 0.5) * 40, t: Math.random() * 3 });
}

export function updatePickups(dt) {
  const s = state.ship;
  for (const p of state.pickups) {
    p.t += dt;
    p.y += 55 * dt;
    p.x += p.vx * dt;
    p.vx *= 0.97;
    if (s.dead <= 0) {
      const dx = s.x - p.x;
      const dy = s.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 90) { p.x += (dx / d) * 220 * dt; p.y += (dy / d) * 220 * dt; }
      if (d < 30) collect(p);
    }
    if (p.y > H + 30) p.dead = true;
  }
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const p = state.pickups[i];
    if (p.dead) state.pickups.splice(i, 1);
  }
}

function collect(p) {
  const s = state.ship;
  p.dead = true;
  sound.pickup();
  if (p.type === 'P') {
    // Extra power is saved up, up to BANK more full bars.
    if (s.power < powerBar() * (BANK + 1)) {
      s.power++;
      if (s.power === powerBar() && state.autoPower) autoUpgrade();
      else if (s.power === powerBar()) { banner('PRESS M!'); sound.power(); }
      else if (s.power % powerBar() === 0) { floatText(p.x, p.y - 20, 'POWER SAVED!', true); sound.power(); }
    } else {
      state.score += 100;
      floatText(p.x, p.y, '+100');
    }
  }
  if (p.type === 'B') {
    if (giveBombs(1)) { state.score += 1000; floatText(p.x, p.y, '+1000'); } else floatText(p.x, p.y, 'BOMB');
  }
  if (p.type === 'S') { s.shield = true; floatText(p.x, p.y, 'SHIELD'); }
  if (p.type === 'STAR') {
    s.star = STAR.seconds;
    s.invuln = Math.max(s.invuln, STAR.seconds);
    banner('STAR POWER!', 'gold');
    sound.power();
    sound.shield();
  }
  if (p.type === '1UP') {
    if (giveLife()) { state.score += 5000; floatText(p.x, p.y, '+5000', true); } else floatText(p.x, p.y, '1UP!', true);
  }
}

// Draw the capsules, bobbing and rocking as they float.
export function drawPickups() {
  for (const p of state.pickups) {
    const colour = CAP[p.type];
    const look = art('capsule', { key: p.type, text: capsuleText(colour) });
    const bob = Math.sin(p.t * 3.5) * 2;
    const tilt = Math.sin(p.t * 3.5) * 0.07;
    radial(p.x, p.y + bob, 26, [[0, colour + '88'], [1, colour + '00']], 1, 'lighter');
    sprite(look, p.x, p.y + bob, p.w, p.h, { rot: tilt, shadow: [5, 10, 0.35] });
    outlinedText(LABEL[p.type] || p.type, p.x, p.y + bob - 0.5, p.type === '1UP' ? 10 : p.type === 'STAR' ? 16 : 13, '#ffffff');
    if (p.type === 'STAR') {
      // Star capsules sparkle, so you notice them.
      radial(p.x, p.y + bob, 40 + Math.sin(p.t * 8) * 6, [[0, 'rgba(255,225,74,0.45)'], [1, 'rgba(255,225,74,0)']], 1, 'lighter');
    }
  }
}

// The capsule picture with its glow colour filled in.
const texts = {};
function capsuleText(colour) {
  if (!texts[colour]) texts[colour] = rawArt('capsule').replace(/var\(--cap,\s*#[0-9a-fA-F]+\)/g, colour);
  return texts[colour];
}
