/* ===========================================================
   HUD: the numbers at the top, the hearts, the sun, the bar

   Everything you can read at a glance while playing.
   =========================================================== */

import { state } from './state.js';
import { icon } from './art.js';
import { TRAPS } from '../data/traps.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { LINES } from '../data/lines.js';

export function drawCounts() {
  document.getElementById('counts').innerHTML =
    `<span title="Villagers">${icon('villager')} ${state.villagers.length}</span>` +
    `<span title="Planks">${icon('plank')} ${state.planks}</span>` +
    `<span title="Carrots">${icon('carrot')} ${state.carrots}</span>` +
    `<span title="Potion">${icon('bucket')} ${state.potion}</span>` +
    (state.phase === 'night' ? `<span title="Zombies">${icon('zombieicon')} ${state.zombies.length}</span>` : '');
  drawHearts();
  drawBar();
}

export function drawHearts() {
  const h = document.getElementById('hearts');
  let out = '';
  for (let i = 0; i < 5; i++) {
    out += `<svg style="${i < state.hero.hearts ? '' : 'filter: grayscale(1); opacity: 0.4'}"><use href="#art-heart"></use></svg>`;
  }
  h.innerHTML = out;
  h.setAttribute('aria-label', `${state.hero.hearts} hearts`);
}

export function drawDay() {
  const t = state.phase === 'night' ? LINES.nightTitle : LINES.dayTitle;
  document.getElementById('day-label').textContent = t.replace('{n}', state.night);
  const sky = document.getElementById('skybar');
  sky.classList.toggle('night', state.phase === 'night');
  // the moon strip, Hard only
  const strip = document.getElementById('moon-strip');
  strip.hidden = !DIFFICULTY[state.mode].moon;
  if (!strip.hidden) {
    strip.innerHTML = [0, 1, 2, 3, 4, 5, 6, 7].map((d) =>
      `<span class="${d === 4 ? 'full' : ''} ${d === state.moonDay ? 'now' : ''}" title="${d === 4 ? 'Full moon' : d === 0 ? 'New moon' : ''}"></span>`
    ).join('');
  }
}

export function drawSun(fraction) {
  const sky = document.getElementById('skybar');
  const w = sky.clientWidth - 26;
  document.getElementById('sun').style.left = Math.max(0, Math.min(w, fraction * w)) + 'px';
}

export function lookoutSay(text) {
  document.getElementById('lookout-line').textContent = text;
}

let bannerTimer = 0;
export function banner(text, ms = 1800) {
  const b = document.getElementById('banner');
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove('show'), ms);
}

// The build bar: one button per thing in data/traps.js
let onPick = null;
export function buildBar(pickHandler) {
  onPick = pickHandler;
  const bar = document.getElementById('bar');
  const hard = state.mode === 'hard';
  bar.innerHTML = '';
  Object.entries(TRAPS).forEach(([id, t]) => {
    if (t.hard && !hard) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thing';
    b.dataset.id = id;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `${icon('' + t.art, 44)}<span>${t.name}</span><span class="cost">${t.planks} ${icon('plank', 16)}${t.crew ? ' ' + t.crew + icon('villager', 16) : ''}</span>`;
    b.addEventListener('click', () => onPick(id));
    bar.appendChild(b);
  });
  const sp = document.createElement('div'); sp.className = 'spacer'; bar.appendChild(sp);
  const go = document.createElement('button');
  go.type = 'button'; go.className = 'go'; go.id = 'night-falls'; go.textContent = LINES.nightFalls;
  bar.appendChild(go);
}

export function drawBar() {
  document.querySelectorAll('#bar .thing').forEach((b) => {
    const t = TRAPS[b.dataset.id];
    if (!t) return;
    b.classList.toggle('cannot', state.planks < t.planks);
    b.setAttribute('aria-pressed', state.picked === b.dataset.id ? 'true' : 'false');
  });
}
