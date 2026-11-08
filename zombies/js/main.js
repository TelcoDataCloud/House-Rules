/* ===========================================================
   MAIN: boot, the title screen, and the day / night / dawn loop

   Title -> Day (build) -> Night (run about) -> Dawn (result)
   -> Day ... until the village is full.
   =========================================================== */

import { state, fresh } from './state.js';
import { LINES } from '../data/lines.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { MILESTONES } from '../data/milestones.js';
import { START as START_THINGS } from '../data/traps.js';
import { WIN_AT } from '../data/villagers.js';
import { loadArt } from './art.js';
import { drawGround, placeThing, clearThings } from './grid.js';
import { startVillage } from './villagers.js';
import { startDay, dayClick, dayHover, clearHover } from './day.js';
import { startNight, stopNight, nightDown, nightMove, nightUp, checkWin } from './night.js';
import * as hero from './hero.js';
import { say } from './voice.js';
import { icon } from './art.js';

const $ = (id) => document.getElementById(id);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function show(id) {
  ['screen-title', 'screen-result'].forEach((s) => { $(s).hidden = s !== id; });
  $('game').hidden = id !== null;
}

function titleScreen() {
  state.phase = 'title';
  $('title-name').textContent = LINES.title;
  document.title = LINES.title[0] + LINES.title.slice(1).toLowerCase();
  $('title-tagline').textContent = LINES.tagline;
  $('milestones').innerHTML = MILESTONES.map((m) => `<span class="${m.done ? 'done' : ''}" title="${m.id} ${m.name}"></span>`).join('');
  const done = MILESTONES.filter((m) => m.done).length;
  $('milestones-note').textContent = `${done} of ${MILESTONES.length} steps built`;
  modeNote();
  show('screen-title');
}

function modeNote() {
  $('mode-note').textContent = DIFFICULTY[state.mode].note;
  document.querySelectorAll('.mode').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === state.mode ? 'true' : 'false'));
}

function newGame() {
  stopNight();
  const mode = state.mode;
  fresh();
  state.mode = mode;
  clearThings();
  document.getElementById('mobs').innerHTML = '';
  document.getElementById('fx').innerHTML = '';
  START_THINGS.forEach((s) => placeThing(s.thing, s.col, s.row));
  startVillage();
  show(null);
  day();
}

function day() {
  startDay(night);
}

function night() {
  if (![...state.things.values()].some((t) => t.does === 'bed')) { say('build a bed first'); return; }
  startNight(dawnResult);
}

function dawnResult() {
  const n = state.villagers.length;
  const won = checkWin();
  $('result-title').textContent = won ? LINES.win : 'DAWN';
  const taken = state.taken.length ? `<p>${icon('zombieicon')} ${state.taken.length} carried off. Cure them tomorrow.</p>` : '';
  const broke = state.brokeTonight ? `<p>${icon('plank')} ${state.brokeTonight} traps broke</p>` : '';
  const pits = state.zombies.length ? `<p>${icon('pit')} ${state.zombies.length} waiting in pits</p>` : '';
  $('result-counts').innerHTML =
    `<p>${icon('bucket')} ${state.curedTonight} cured tonight</p>` +
    `<p>${icon('villager')} ${n} villagers (${WIN_AT} wins)</p>` + taken + pits + broke;
  $('result-tip').textContent = won ? 'Keep going for a bigger village, or start again on Hard.' : pick(LINES.tip);
  say(won ? LINES.win : `${state.curedTonight} cured. ${n} villagers.`);
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
  $('next-day').addEventListener('click', nextDay);
  $('to-title').addEventListener('click', () => { stopNight(); titleScreen(); });

  const village = $('village');
  village.addEventListener('pointerdown', (ev) => {
    if (state.phase === 'day') dayClick(ev);
    else if (state.phase === 'night') { nightDown(ev); ev.preventDefault(); }
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

  // for testing: ?fast=3 runs the night three times faster
  const q = new URLSearchParams(location.search);
  if (q.get('fast')) window.ZOMBIES.fast = Number(q.get('fast'));
  if (q.get('mode')) state.mode = q.get('mode');
  if (q.get('horde')) window.ZOMBIES.horde = q.get('horde').split(',');
}

async function boot() {
  await loadArt();
  drawGround();
  wire();
  titleScreen();
}

boot();
