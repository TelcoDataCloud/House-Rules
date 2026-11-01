/* ===========================================================
   SCREENS: title, upgrade pick, pause, game over, you win

   Each screen is a <section> in index.html. Showing one means
   taking away its "hidden". Every button is a real button, so
   Tab and Enter work as well as clicks.
   =========================================================== */

import { state } from './state.js';
import { GAME_NAME } from '../data/ship.js';
import { WEAPONS, EXTRAS } from '../data/weapons.js';
import { MILESTONES } from '../data/milestones.js';
import { LEVELS } from '../data/levels.js';
import { takeUpgrade } from './ship.js';
import { sound } from './audio.js';
import { say } from './voice.js';
import { saveBest } from './best.js';

const $ = (id) => document.getElementById(id);
const SCREENS = ['title', 'pick', 'pause', 'over', 'win', 'cut'];

export function show(name) {
  for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
  $('hud').hidden = name === 'title' || name === 'cut';
  if (name === 'title' || name === 'cut') $('hud-weapons').hidden = true;
  const first = name && $(`screen-${name}`).querySelector('button:not([disabled])');
  if (first) first.focus();
  else $('field').focus();
}

export function setupTitle(onPlay) {
  $('game-name').textContent = GAME_NAME;
  document.title = GAME_NAME;
  $('field').setAttribute('aria-label', `${GAME_NAME} game`);
  // One star for every step we have built. Gold means done.
  $('milestones').innerHTML = MILESTONES.map((m) =>
    `<li class="star ${m.done ? 'done' : ''}" title="${m.id} ${m.name}" aria-hidden="false"><span aria-hidden="true">&#9733;</span><span class="sr-only">${m.id} ${m.name}${m.done ? ' done' : ' not yet'}</span></li>`).join('');
  showHelp();

  for (const btn of document.querySelectorAll('[data-controls]')) {
    btn.addEventListener('click', () => {
      state.controls = btn.dataset.controls;
      for (const b of document.querySelectorAll('[data-controls]')) b.setAttribute('aria-pressed', String(b === btn));
      showHelp();
    });
  }
  for (const btn of document.querySelectorAll('[data-difficulty]')) {
    btn.addEventListener('click', () => {
      state.difficulty = btn.dataset.difficulty;
      for (const b of document.querySelectorAll('[data-difficulty]')) b.setAttribute('aria-pressed', String(b === btn));
    });
  }
  $('btn-play').addEventListener('click', onPlay);
}

// The help, on the title and in the side panel, matches Keys or Mouse.
const HELP = {
  keys: {
    line: 'Arrows: fly. Space: bomb. M: power up.',
    list: ['<kbd>&larr; &uarr; &darr; &rarr;</kbd> fly', '<kbd>Space</kbd> bomb', '<kbd>M</kbd> or <kbd>0</kbd> power up', '<kbd>P</kbd> pause'],
  },
  mouse: {
    line: 'Move the mouse to fly. Click: bomb. Right click: power up.',
    list: ['<kbd>Move mouse</kbd> fly', '<kbd>Click</kbd> bomb', '<kbd>Right click</kbd> power up', '<kbd>P</kbd> pause'],
  },
};

function showHelp() {
  const help = HELP[state.controls];
  $('how-keys').textContent = help.line;
  $('side-keys').innerHTML = help.list.map((t) => `<li>${t}</li>`).join('');
}

export function showTitleBest() {
  $('title-best').hidden = state.best === 0;
  $('title-best').textContent = `Best: ${state.best.toLocaleString('en-AU')}`;
}

// --- the upgrade pick: three cards ---
const PICS = {
  spread: '<circle cx="35" cy="12" r="5" fill="#38f0ff"/><circle cx="20" cy="18" r="5" fill="#38f0ff"/><circle cx="50" cy="18" r="5" fill="#38f0ff"/><circle cx="8" cy="26" r="5" fill="#38f0ff"/><circle cx="62" cy="26" r="5" fill="#38f0ff"/>',
  laser: '<rect x="18" y="2" width="6" height="26" rx="3" fill="#4dff7c"/><rect x="32" y="2" width="6" height="26" rx="3" fill="#ff3b3b"/><rect x="46" y="2" width="6" height="26" rx="3" fill="#c07cff"/>',
  beam: '<rect x="29" y="0" width="12" height="34" rx="6" fill="#ff3fa4"/><rect x="32" y="0" width="6" height="34" rx="3" fill="#ffffff"/>',
  homing: '<path d="M22 32 C14 18 22 8 52 4" stroke="#ff3fa4" stroke-width="3" fill="none" stroke-dasharray="4 4"/><circle cx="52" cy="4" r="5" fill="#ff3fa4"/><path d="M48 32 C56 18 48 8 18 4" stroke="#ff3fa4" stroke-width="3" fill="none" stroke-dasharray="4 4"/>',
  rapid: '<circle cx="35" cy="4" r="4.5" fill="#ffd23f"/><circle cx="35" cy="14" r="4.5" fill="#ffd23f"/><circle cx="35" cy="24" r="4.5" fill="#ffd23f"/>',
  drones: '<use href="#art-drone" x="2" y="14" width="18" height="20"/><use href="#art-drone" x="50" y="14" width="18" height="20"/>',
  bay: '<ellipse cx="24" cy="18" rx="7" ry="12" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/><ellipse cx="46" cy="18" rx="7" ry="12" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/>',
  shield: '<circle cx="35" cy="44" r="30" fill="none" stroke="#38f0ff" stroke-width="4"/>',
  bombpack: '<circle cx="24" cy="18" r="10" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/><circle cx="46" cy="18" r="10" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/>',
};

function cardPic(key) {
  return `<svg viewBox="0 0 70 70" class="card-pic" aria-hidden="true">${PICS[key] || ''}<use href="#art-comet" x="20" y="30" width="30" height="38"/></svg>`;
}

let pickDone = null;
let choices = [];

export function openPick(cards, onDone) {
  pickDone = onDone;
  choices = cards;
  document.getElementById('banner').className = 'banner';
  const s = state.ship;
  $('pick-cards').innerHTML = cards.map((k, i) => {
    const extra = EXTRAS[k];
    const w = extra || WEAPONS[k];
    const level = extra ? 0 : s[k];
    const next = extra ? extra.say : w.steps[level].say;
    const pips = extra ? '<span class="card-once">ONE GO</span>'
      : level === 0 ? '<span class="card-new">NEW</span>'
      : [0, 1, 2].map((j) => `<i class="${j < level ? 'on' : j === level ? 'next' : ''}"></i>`).join('');
    return `<button type="button" class="card" data-track="${k}" aria-label="${w.name}: ${next}. Key ${i + 1}.">
      <span class="card-name ${w.colour}">${w.name.toUpperCase()}</span>
      ${cardPic(k)}
      <span class="card-say">${next}</span>
      <span class="card-pips">${pips}</span>
      <span class="card-key">${i + 1}</span>
    </button>`;
  }).join('');
  for (const card of $('pick-cards').querySelectorAll('.card')) {
    card.addEventListener('click', () => choose(card.dataset.track));
    // Read the card out when you land on it.
    card.addEventListener('focus', () => say(card.querySelector('.card-name').textContent + '. ' + card.querySelector('.card-say').textContent));
  }
  show('pick');
  say('Power up! Pick one.');
}

export function choose(key) {
  if (state.mode !== 'pick') return;
  if (!takeUpgrade(key)) { sound.nope(); return; }
  show(null);
  if (pickDone) pickDone();
}

export function pickByNumber(n) {
  if (choices[n - 1]) choose(choices[n - 1]);
}

// Arrow keys move between the cards.
$('pick-cards').addEventListener('keydown', (e) => {
  const cards = [...$('pick-cards').querySelectorAll('.card:not([disabled])')];
  const at = cards.indexOf(document.activeElement);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); cards[(at + 1) % cards.length].focus(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); cards[(at - 1 + cards.length) % cards.length].focus(); }
});

// --- the end screens ---
function gradeFor() {
  const st = state.stats;
  let points = state.score - st.livesLost * 2000 + state.ship.bombs * 500;
  // Add up the grade points of every level you played.
  const g = { S: 0, A: 0, B: 0 };
  for (const lv of LEVELS.slice(0, state.levelIndex + 1)) for (const k of ['S', 'A', 'B']) g[k] += lv.grades[k];
  let grade = points >= g.S ? 'S' : points >= g.A ? 'A' : points >= g.B ? 'B' : 'C';
  if (st.escaped && (grade === 'S' || grade === 'A')) grade = 'B';
  return grade;
}

function tipFor(won) {
  const st = state.stats;
  if (!won && st.livesLost >= 3) return 'Bullets go in straight lines. Fly to the side!';
  if (state.ship.bombs >= 3) return 'Use your bombs! Press space when it gets busy.';
  if (st.reactors === 0) return 'Blow up the pink reactor at the end of the big base.';
  if (st.escaped) return 'Shoot the boss turrets first, then its eye.';
  if (st.flocks === 0) return 'Get all five red ships for a prize.';
  return state.difficulty === 'easy' ? 'Try Medium next!' : 'You are a star pilot!';
}

// Your best score ever in this browser. A new best gets a cheer.
function showBest(id) {
  const el = $(id);
  const isNew = state.score > state.best && state.score > 0;
  if (isNew) { state.best = state.score; saveBest(state.best); }
  el.textContent = isNew ? 'NEW BEST!' : `Best: ${state.best.toLocaleString('en-AU')}`;
  el.classList.toggle('new', isNew);
  showTitleBest();
  return isNew;
}

export function showOver() {
  $('over-score').textContent = state.score.toLocaleString('en-AU');
  if (showBest('over-best')) say('New best!');
  $('over-tip').textContent = tipFor(false);
  $('btn-retry').textContent = `Try level ${state.levelIndex + 1} again`;
  show('over');
}

export function showWin() {
  const st = state.stats;
  $('win-title').textContent = 'YOU WIN!';
  const isNew = showBest('win-best');
  say(isNew ? 'You win! New best!' : 'You win!');
  $('win-grade').textContent = gradeFor();
  $('win-score').textContent = state.score.toLocaleString('en-AU');
  $('win-stats').innerHTML = [
    ...(st.escaped ? ['A boss got away'] : []),
    `Levels: ${state.levelIndex + 1}`,
    `Ships lost: ${st.livesLost}`,
    `Base parts: ${st.partsDestroyed}`,
    `Reactors: ${st.reactors}`,
    `Bombs left: ${state.ship.bombs}`,
  ].map((t) => `<li>${t}</li>`).join('');
  $('win-tip').textContent = tipFor(true);
  sound.win();
  show('win');
}
