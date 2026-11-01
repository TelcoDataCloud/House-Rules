/* ===========================================================
   HUD: score, lives, bombs, the power bar and your weapons

   Pictures, not words, so you can read it at a glance.
   It only changes the page when a number actually changes.
   =========================================================== */

import { state } from './state.js';
import { POWER_BAR, WEAPONS } from '../data/weapons.js';
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
    $('hud-lives').innerHTML = Array.from({ length: Math.max(0, s.lives) }, () =>
      `<svg class="hud-life" aria-hidden="true"><use href="#art-${SHIP.art}" width="100%" height="100%"/></svg>`).join('');
    $('hud-lives').setAttribute('aria-label', `${s.lives} lives`);
  }

  if (changed('bombs', s.bombs)) {
    $('hud-bombs').innerHTML = Array.from({ length: s.bombs }, () => '<i class="hud-bomb"></i>').join('');
    $('hud-bombs').setAttribute('aria-label', `${s.bombs} bombs`);
  }

  if (changed('power', s.power)) {
    const full = s.power >= POWER_BAR;
    let html = '';
    for (let i = 0; i < POWER_BAR; i++) html += `<i class="${i < s.power ? 'on' : ''}"></i>`;
    if (full) html += `<span class="press">${state.touch ? 'TAP M' : 'PRESS M'}</span>`;
    $('hud-power').innerHTML = html;
    $('hud-power').classList.toggle('full', full);
    $('hud-power').setAttribute('aria-label', `Power ${s.power} of ${POWER_BAR}`);
  }

  const weapons = `${s.spread}${s.homing}${s.rapid}`;
  if (changed('weapons', weapons)) {
    $('hud-weapons').innerHTML = ['spread', 'homing', 'rapid'].map((k) => {
      const w = WEAPONS[k];
      const pips = [0, 1, 2].map((i) => `<i class="${i < s[k] ? 'on' : ''}"></i>`).join('');
      return `<span class="hud-weapon ${w.colour}"><b>${w.name[0]}</b>${pips}</span>`;
    }).join('');
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
