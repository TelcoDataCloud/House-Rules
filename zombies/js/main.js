/* ===========================================================
   MAIN: boot, the title screen, and the day / night / dawn loop

   Title -> How to play (first time) -> Day (build) -> Night
   (run about) -> Dawn (result) -> Day ... until the village is
   full. The village is saved at the start of each day, so
   CONTINUE on the title picks it up again.
   =========================================================== */

import { state, fresh } from './state.js';
import { LINES } from '../data/lines.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { START as START_THINGS } from '../data/traps.js';
import { WIN_AT } from '../data/villagers.js';
import { loadArt, icon } from './art.js';
import { drawGround, placeThing, clearThings } from './grid.js';
import { startVillage } from './villagers.js';
import { startDay, nightFallsPressed, dayClick, dayHover, clearHover } from './day.js';
import { startNight, stopNight, pauseNight, isPaused, wireNightButtons, nightDown, nightMove, nightUp, checkWin } from './night.js';
import * as hero from './hero.js';
import { say } from './voice.js';
import { saveGame, loadGame, hasSave, clearSave } from './save.js';

const $ = (id) => document.getElementById(id);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
let seenHowTo = false;
let afterHowTo = null;

function show(id) {
  ['screen-title', 'screen-result', 'screen-how'].forEach((s) => { $(s).hidden = s !== id; });
  $('game').hidden = id !== null;
}

function titleScreen() {
  state.phase = 'title';
  $('title-name').textContent = LINES.title;
  document.title = LINES.title[0] + LINES.title.slice(1).toLowerCase();
  $('title-tagline').textContent = LINES.tagline;
  $('continue').hidden = !hasSave();
  modeNote();
  show('screen-title');
}

function modeNote() {
  $('mode-note').textContent = DIFFICULTY[state.mode].note;
  document.querySelectorAll('.mode').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === state.mode ? 'true' : 'false'));
}

// The four how-to cards come from LINES.howTo in data/lines.js
function howToScreen(then) {
  $('how-cards').innerHTML = LINES.howTo.map((c) =>
    `<div class="how-card">${icon(c.art, 72)}<h3>${c.head}</h3><p>${c.text}</p></div>`).join('');
  afterHowTo = then;
  show('screen-how');
  say(LINES.howTo[0].head + '. ' + LINES.howTo[0].text);
}

function newGame() {
  if (!seenHowTo) { seenHowTo = true; howToScreen(newGame); return; }
  stopNight();
  clearSave();
  const mode = state.mode;
  fresh();
  state.mode = mode;
  clearThings();
  $('mobs').innerHTML = '';
  $('fx').innerHTML = '';
  START_THINGS.forEach((s) => placeThing(s.thing, s.col, s.row));
  startVillage();
  show(null);
  day();
}

function continueGame() {
  stopNight();
  fresh();
  $('fx').innerHTML = '';
  if (!loadGame()) { titleScreen(); return; }
  seenHowTo = true;
  show(null);
  startDay(night, true);
}

function day() {
  startDay(night);
}

function night() {
  startNight(dawnResult);
}

function dawnResult() {
  const n = state.villagers.length;
  const won = checkWin();
  const justWon = won && !state.wonAlready;
  if (justWon) state.wonAlready = true;
  $('result-title').textContent = justWon ? LINES.win : won ? 'DAWN. Still winning.' : 'DAWN';
  const taken = state.taken.length ? `<p>${icon('zombieicon')} ${state.taken.map((t) => t.name || t.job).join(', ')} carried off. Cure them tomorrow.</p>` : '';
  const broke = state.brokeTonight ? `<p>${icon('plank')} ${state.brokeTonight} traps broke</p>` : '';
  const pits = state.zombies.length ? `<p>${icon('pit')} ${state.zombies.length} waiting in pits</p>` : '';
  $('result-counts').innerHTML =
    `<p>${icon('bucket')} ${state.curedTonight} cured tonight</p>` +
    `<p>${icon('villager')} Village ${n} / ${WIN_AT}</p>` + taken + pits + broke;
  $('result-tip').textContent = justWon
    ? `You won! Keep going for a village of ${WIN_AT * 2}, or play again on ${state.mode === 'easy' ? 'Hard' : 'Easy'}.`
    : won ? `New goal: a village of ${WIN_AT * 2}.` : pick(LINES.tip);
  $('next-day').textContent = justWon ? 'KEEP GOING' : 'NEXT DAY';
  $('play-again').hidden = !won;
  say(justWon ? LINES.win : `${state.curedTonight} cured. ${n} villagers.`);
  show('screen-result');
}

function nextDay() {
  state.night++;
  if (DIFFICULTY[state.mode].moon) state.moonDay = (state.moonDay + 1) % 8;
  show(null);
  day();
}

function wire() {
  document.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => { state.mode = b.dataset.mode; modeNote(); }));
  $('start').addEventListener('click', newGame);
  $('continue').addEventListener('click', continueGame);
  $('how-btn').addEventListener('click', () => howToScreen(titleScreen));
  $('how-done').addEventListener('click', () => { const f = afterHowTo; afterHowTo = null; if (f) f(); });
  $('next-day').addEventListener('click', nextDay);
  $('play-again').addEventListener('click', () => { clearSave(); titleScreen(); });
  $('to-title').addEventListener('click', () => { stopNight(); titleScreen(); });
  $('night-falls').addEventListener('click', nightFallsPressed);
  $('pause-btn').addEventListener('click', () => { if (state.phase === 'night') pauseNight(!isPaused()); });
  $('resume').addEventListener('click', () => pauseNight(false));
  $('pause-title').addEventListener('click', () => { stopNight(); titleScreen(); });
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'p' || e.key === 'Escape') && state.phase === 'night') pauseNight(!isPaused());
  });
  wireNightButtons();

  const village = $('village');
  village.addEventListener('pointerdown', (ev) => {
    if (state.phase === 'day') dayClick(ev);
    else if (state.phase === 'night' && !isPaused()) { nightDown(ev); ev.preventDefault(); }
  });
  village.addEventListener('pointermove', (ev) => {
    if (state.phase === 'day') dayHover(ev);
    else if (state.phase === 'night') nightMove(ev);
  });
  window.addEventListener('pointerup', () => { if (state.phase === 'night') nightUp(); });
  village.addEventListener('pointerleave', clearHover);
  village.addEventListener('contextmenu', (e) => e.preventDefault());
  hero.listen();

  $('theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('theme-toggle').textContent = dark ? '☀️' : '🌙';
    $('theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  });
  $('sound-toggle').addEventListener('click', () => {
    state.muted = !state.muted;
    $('sound-toggle').textContent = state.muted ? '🔇' : '🔊';
    $('sound-toggle').setAttribute('aria-label', state.muted ? 'Turn sound on' : 'Turn sound off');
    if (state.muted && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  // for testing: ?fast=3 runs the night three times faster, ?mode=hard,
  // ?horde=bogey,eyeball picks tonight's zombies, ?skiphow skips the how-to
  const q = new URLSearchParams(location.search);
  if (q.get('fast')) window.ZOMBIES.fast = Number(q.get('fast'));
  if (q.get('mode')) state.mode = q.get('mode');
  if (q.get('horde')) window.ZOMBIES.horde = q.get('horde').split(',');
  if (q.has('skiphow')) seenHowTo = true;
}

async function boot() {
  await loadArt();
  drawGround();
  wire();
  titleScreen();
}

boot();
