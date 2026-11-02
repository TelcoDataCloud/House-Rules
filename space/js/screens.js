/* ===========================================================
   SCREENS: title, upgrade pick, pause, game over, you win

   Each screen is a <section> in index.html. Showing one means
   taking away its "hidden". Every button is a real button, so
   Tab and Enter work as well as clicks.
   =========================================================== */

import { state } from './state.js';
import { GAME_NAME } from '../data/ship.js';
import { MILESTONES } from '../data/milestones.js';
import { LEVELS } from '../data/levels.js';
import { takeUpgrade, cardInfo } from './ship.js';
import { PICS } from './icons.js';
import { sound } from './audio.js';
import { say } from './voice.js';
import { saveBest } from './best.js';

const $ = (id) => document.getElementById(id);
const SCREENS = ['title', 'pick', 'pause', 'over', 'win', 'cut'];

export function show(name) {
  for (const s of SCREENS) $(`screen-${s}`).hidden = s !== name;
  $('hud').hidden = name === 'title' || name === 'cut';
  if (name === 'title' || name === 'cut') $('hud-weapons').hidden = true;
  // In the game the help panel goes away and the game gets bigger.
  const playing = name !== 'title';
  if (document.body.classList.contains('in-game') !== playing) {
    document.body.classList.toggle('in-game', playing);
    window.dispatchEvent(new Event('resize'));
  }
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
  for (const btn of document.querySelectorAll('[data-autopower]')) {
    btn.addEventListener('click', () => {
      state.autoPower = btn.dataset.autopower === 'on';
      for (const b of document.querySelectorAll('[data-autopower]')) b.setAttribute('aria-pressed', String(b === btn));
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
function cardPic(key) {
  return `<svg viewBox="0 0 70 70" class="card-pic" aria-hidden="true">${PICS[key] || ''}<use href="#art-comet" x="20" y="30" width="30" height="38"/></svg>`;
}

let pickDone = null;
let choices = [];

export function openPick(cards, onDone) {
  pickDone = onDone;
  choices = cards;
  document.getElementById('banner').className = 'banner';
  $('pick-cards').innerHTML = cards.map((k, i) => {
    const c = cardInfo(k);
    const pips = c.max
      ? Array.from({ length: c.max }, (_, j) => `<i class="${j < c.level ? 'on' : j === c.level ? 'next' : ''}"></i>`).join('')
      : '';
    const tag = c.tag ? `<span class="card-${c.tag === 'NEW' ? 'new' : 'once'}">${c.tag}</span>` : '';
    return `<button type="button" class="card" data-track="${k}" aria-label="${c.name}: ${c.say}. Key ${i + 1}.">
      <span class="card-name ${c.colour}">${c.name.toUpperCase()}</span>
      ${cardPic(c.pic)}
      <span class="card-say">${c.say}</span>
      <span class="card-pips">${tag || pips}</span>
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
