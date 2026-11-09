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
import { weapon, nextWeapon } from './combat.js';
import { costHTML, missing } from './cost.js';
import { MARKET } from '../data/weapons.js';

export function drawCounts() {
  document.getElementById('counts').innerHTML =
    `<span id="count-villagers">${icon('villager')} Village ${state.villagers.length} / ${WIN_AT}</span>` +
    `<span id="count-planks">${icon('plank')} Planks ${state.planks}</span>` +
    `<span id="count-carrots">${icon('carrot')} Carrots ${state.carrots}</span>` +
    `<span id="count-potion">${icon('bucket')} Potion ${state.potion}</span>` +
    (state.stone || [...state.things.values()].some((t) => t.does === 'mine') ? `<span id="count-stone">${icon('stone')} Stone ${state.stone}</span>` : '') +
    (state.socks ? `<span id="count-socks">${icon('sock')} Socks ${state.socks}</span>` : '') +
    (state.phase === 'night' ? `<span>${icon('zombieicon')} Zombies ${state.zombies.filter((z) => !z.pit).length}</span>` : '');
  drawUpgrade();
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

// The weapon button: what you have, and what the next one costs
export function drawUpgrade() {
  drawSwap();
  const b = document.getElementById('upgrade-btn');
  if (!b) return;
  const next = nextWeapon();
  b.hidden = state.phase !== 'day';
  const now = weapon();
  if (!next) { b.innerHTML = `${icon(now.art, 26)} ${now.name}`; b.disabled = true; return; }
  const cost = costHTML(next);
  b.innerHTML = `${icon(now.art, 26)} Upgrade to ${icon(next.art, 26)} <b>${next.name}</b> ${cost}`;
  b.disabled = false;
  b.classList.toggle('cannot', !!missing(next));
}

// The market button: carrots for planks
function drawSwap() {
  const b = document.getElementById('swap-btn');
  if (!b) return;
  b.hidden = state.phase !== 'day';
  b.innerHTML = `Swap ${costHTML(MARKET.give)} for ${costHTML(MARKET.get)}`;
  b.setAttribute('aria-label', `Swap ${MARKET.give.carrots} carrots for ${MARKET.get.planks} planks`);
  b.classList.toggle('cannot', !!missing(MARKET.give));
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

// Called every frame at night, so it never measures the page (that
// made the browser redo the layout 60 times a second): the bar's width
// is remembered and only checked again when the window changes size.
let skyWidth = 0, lastLabel = '', lastLeft = '';
window.addEventListener('resize', () => { skyWidth = 0; });
export function drawSun(fraction) {
  if (!skyWidth) skyWidth = Math.max(1, document.getElementById('skybar').clientWidth - 26);
  const left = Math.max(0, Math.min(skyWidth, fraction * skyWidth)).toFixed(0) + 'px';
  if (left !== lastLeft) { lastLeft = left; document.getElementById('sun').style.left = left; }
  if (state.phase === 'night') {
    const secs = Math.max(0, Math.ceil(DIFFICULTY[state.mode].nightSeconds * (1 - fraction)));
    const label = `Night ends in ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    if (label !== lastLabel) { lastLabel = label; document.getElementById('sky-label').textContent = label; }
  } else lastLabel = '';
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
    const cost = costHTML(t) + (t.crew ? ' ' + t.crew + icon('villager', 16) : '');
    b.innerHTML = `${icon('' + t.art, 44)}<span>${t.name}</span><span class="cost">${cost}</span>`;
    b.addEventListener('click', () => onPick(id));
    bar.appendChild(b);
  });
  barArrows();
}

// Arrows on the build bar when there is more to scroll to
function barArrows() {
  const bar = document.getElementById('bar');
  const l = document.getElementById('bar-left'), r = document.getElementById('bar-right');
  if (!l) return;
  const more = bar.scrollWidth > bar.clientWidth + 4;
  l.hidden = !more || bar.scrollLeft < 4 || bar.hidden;
  r.hidden = !more || bar.scrollLeft + bar.clientWidth > bar.scrollWidth - 4 || bar.hidden;
}
export function setupBarArrows() {
  const bar = document.getElementById('bar');
  bar.addEventListener('scroll', barArrows, { passive: true });
  window.addEventListener('resize', barArrows);
  document.getElementById('bar-left').addEventListener('click', () => bar.scrollBy({ left: -bar.clientWidth * 0.7, behavior: 'smooth' }));
  document.getElementById('bar-right').addEventListener('click', () => bar.scrollBy({ left: bar.clientWidth * 0.7, behavior: 'smooth' }));
}

export function drawBar() {
  document.querySelectorAll('#bar .thing').forEach((b) => {
    const t = TRAPS[b.dataset.id];
    if (!t) return;
    b.classList.toggle('cannot', !!missing(t));
    b.setAttribute('aria-pressed', state.picked === b.dataset.id ? 'true' : 'false');
    // someone has no bed: the cottage button flashes with a badge, so kids see what to build
    if (t.does === 'bed') {
      const need = state.phase === 'day' && state.villagers.some((v) => !v.bed);
      b.classList.toggle('needed', need);
      b.querySelector('.badge')?.remove();
      if (need) b.insertAdjacentHTML('beforeend', '<span class="badge" aria-hidden="true">!</span>');
      b.setAttribute('aria-label', t.name + (need ? ': someone needs a bed' : ''));
    }
  });
}
