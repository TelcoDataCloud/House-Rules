/* ===========================================================
   HUD: the numbers at the top, the hearts, the sun, the bar

   Everything you can read at a glance while playing. Words next
   to every number, because a seven year old does not hover.
   =========================================================== */

import { state } from './state.js';
import { icon } from './art.js';
import { TRAPS } from '../data/traps.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { WIN_AT } from '../data/villagers.js';
import { LINES } from '../data/lines.js';

export function drawCounts() {
  document.getElementById('counts').innerHTML =
    `<span id="count-villagers">${icon('villager')} Village ${state.villagers.length} / ${WIN_AT}</span>` +
    `<span id="count-planks">${icon('plank')} Planks ${state.planks}</span>` +
    `<span id="count-carrots">${icon('carrot')} Carrots ${state.carrots}</span>` +
    `<span id="count-potion">${icon('bucket')} Potion ${state.potion}</span>` +
    (state.phase === 'night' ? `<span>${icon('zombieicon')} Zombies ${state.zombies.filter((z) => !z.pit).length}</span>` : '');
  const pc = document.getElementById('btn-potion-count');
  if (pc) pc.textContent = state.potion;
  drawHearts();
  drawBar();
}

// Flash one of the counts red when you are short of it
export function flashCount(which) {
  const e = document.getElementById('count-' + which);
  if (!e) return;
  e.classList.remove('flash');
  void e.offsetWidth;
  e.classList.add('flash');
}

export function drawHearts() {
  const h = document.getElementById('hearts');
  h.hidden = state.phase !== 'night' && state.phase !== 'dawn';
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
  document.getElementById('sky-label').textContent = state.phase === 'night' ? 'Night ends' : 'Work done';
  document.getElementById('night-falls').hidden = state.phase !== 'day';
  document.getElementById('night-buttons').hidden = state.phase !== 'night';
  document.getElementById('pause-btn').hidden = state.phase !== 'night';
  // the moon strip, Hard only
  const strip = document.getElementById('moon-strip');
  strip.hidden = !DIFFICULTY[state.mode].moon;
  if (!strip.hidden) {
    const name = state.moonDay === 4 ? 'FULL MOON' : state.moonDay === 0 ? 'NEW MOON' : '';
    strip.innerHTML = '<b>Moon</b> ' + [0, 1, 2, 3, 4, 5, 6, 7].map((d) =>
      `<span class="${d === 4 ? 'full' : ''} ${d === state.moonDay ? 'now' : ''}" title="${d === 4 ? 'Full moon' : d === 0 ? 'New moon' : ''}"></span>`
    ).join('') + (name ? ` <b>${name}</b>` : '');
  }
}

export function drawSun(fraction) {
  const sky = document.getElementById('skybar');
  const w = sky.clientWidth - 26;
  document.getElementById('sun').style.left = Math.max(0, Math.min(w, fraction * w)) + 'px';
  if (state.phase === 'night') {
    const left = Math.max(0, Math.ceil(DIFFICULTY[state.mode].nightSeconds * (1 - fraction)));
    document.getElementById('sky-label').textContent = `Night ends in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }
}

export function lookoutSay(text) {
  document.getElementById('lookout-line').textContent = text;
}

export function helpSay(text) {
  document.getElementById('help').innerHTML = text;
}

let bannerTimer = 0;
export function banner(text, ms = 1800) {
  const b = document.getElementById('banner');
  b.textContent = text;
  b.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove('show'), ms);
}

// Which things are on the bar tonight. Easy unlocks them a few a
// night ("from" in data/traps.js) so there is less to tap at random.
export function barThings() {
  const diff = DIFFICULTY[state.mode];
  return Object.entries(TRAPS).filter(([id, t]) => {
    if (t.hard && state.mode !== 'hard') return false;
    if (diff.barUnlocks && (t.from || 1) > state.night) return false;
    return true;
  });
}

// The build bar: one button per thing in data/traps.js
let onPick = null;
export function buildBar(pickHandler) {
  onPick = pickHandler;
  const bar = document.getElementById('bar');
  bar.innerHTML = '';
  barThings().forEach(([id, t]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'thing';
    b.dataset.id = id;
    b.setAttribute('aria-pressed', 'false');
    b.title = t.what || '';
    b.innerHTML = `${icon('' + t.art, 44)}<span>${t.name}</span><span class="cost">${t.planks} ${icon('plank', 16)}${t.crew ? ' ' + t.crew + icon('villager', 16) : ''}</span>`;
    b.addEventListener('click', () => onPick(id));
    bar.appendChild(b);
  });
}

export function drawBar() {
  document.querySelectorAll('#bar .thing').forEach((b) => {
    const t = TRAPS[b.dataset.id];
    if (!t) return;
    b.classList.toggle('cannot', state.planks < t.planks);
    b.setAttribute('aria-pressed', state.picked === b.dataset.id ? 'true' : 'false');
  });
}
