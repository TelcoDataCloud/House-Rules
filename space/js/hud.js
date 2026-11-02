/* ===========================================================
   HUD: score, lives, bombs, the power bar and your weapons

   Pictures, not words, so you can read it at a glance.
   It only changes the page when a number actually changes.
   =========================================================== */

import { state, powerBar } from './state.js';
import {  GUNS, HELPERS, MAX_LEVEL } from '../data/weapons.js';
import { BOMBS } from '../data/bombs.js';
import { icon } from './icons.js';
import { SHIP } from '../data/ship.js';
import { bossHealth } from './bosses.js';

const $ = (id) => document.getElementById(id);
let last = {};

export function resetHud() {
  last = {};
}

function changed(key, value) {
  if (last[key] === value) return false;
  last[key] = value;
  return true;
}

export function drawHud() {
  const s = state.ship;
  if (changed('score', state.score)) $('hud-score').textContent = state.score.toLocaleString('en-AU');

  if (changed('lives', s.lives)) {
    // Up to 5 little ships. More than that: one ship and a number.
    const life = `<svg class="hud-life" aria-hidden="true"><use href="#art-${SHIP.art}" width="100%" height="100%"/></svg>`;
    $('hud-lives').innerHTML = s.lives > 5 ? `${life}<b class="hud-count">x${s.lives}</b>`
      : Array.from({ length: Math.max(0, s.lives) }, () => life).join('');
    $('hud-lives').setAttribute('aria-label', `${s.lives} lives`);
  }

  if (changed('bombs', s.bombs)) {
    $('hud-bombs').innerHTML = s.bombs > 5 ? `<i class="hud-bomb"></i><b class="hud-count">x${s.bombs}</b>`
      : Array.from({ length: s.bombs }, () => '<i class="hud-bomb"></i>').join('');
    $('hud-bombs').setAttribute('aria-label', `${s.bombs} bombs`);
  }

  if (changed('power', s.power)) {
    // One bar on screen. If you have saved up more full bars,
    // a badge says how many (x2, x3...).
    const bars = Math.floor(s.power / powerBar());
    const full = bars > 0;
    const shown = full ? powerBar() : s.power;
    let html = '';
    for (let i = 0; i < powerBar(); i++) html += `<i class="${i < shown ? 'on' : ''}"></i>`;
    if (bars > 1) html += `<span class="bank">x${bars}</span>`;
    if (full) html += `<span class="press">${state.touch ? 'TAP M' : 'PRESS M'}</span>`;
    $('hud-power').innerHTML = html;
    $('hud-power').classList.toggle('full', full);
    $('hud-power').setAttribute('aria-label', `Power ${s.power} of ${powerBar()}`);
  }

  // Your gun, your helpers and your bomb, each with dots for its level.
  const weapons = [s.gun, s.gunLevel, s.homing, s.drones, s.bomb, s.bombLevel].join();
  if (changed('weapons', weapons)) {
    // A picture for each thing, and dots for how far it is upgraded.
    const chip = (thing, pic, level, max) => {
      const pips = Array.from({ length: max }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('');
      return `<span class="hud-weapon ${thing.colour}" title="${thing.name}" aria-label="${thing.name} level ${level}">${icon(pic)}<span class="pips">${pips}</span></span>`;
    };
    let html = chip(GUNS[s.gun], s.gun, s.gunLevel, MAX_LEVEL);
    for (const k of Object.keys(HELPERS)) if (s[k] > 0) html += chip(HELPERS[k], k, s[k], 3);
    html += chip(BOMBS[s.bomb], `bomb-${s.bomb}`, s.bombLevel, 3);
    $('hud-weapons').hidden = false;
    $('hud-weapons').innerHTML = html;
  }

  const boss = bossHealth();
  const bar = $('boss-bar');
  if (changed('boss', boss ? boss.name : '')) {
    bar.hidden = !boss;
    if (boss) $('boss-name').textContent = boss.name;
  }
  if (boss) {
    const pct = Math.round(boss.left * 100);
    if (changed('bossPct', pct)) $('boss-fill').style.width = `${pct}%`;
  }
}
