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
import { WIN_AT, JOBS } from '../data/villagers.js';
import { loadArt, loadPictures, icon } from './art.js';
import { drawGround, placeThing, clearThings } from './grid.js';
import { startVillage } from './villagers.js';
import { startDay, stopDay, nightFallsPressed, buyWeapon, swapCarrots, dayClick, dayHover, clearHover } from './day.js';
import { startNight, stopNight, pauseNight, isPaused, wireNightButtons, nightDown, nightTap, nightMove, nightUp, checkWin } from './night.js';
import { setupCamera, setAiming, startView } from './camera.js';
import * as hero from './hero.js';
import { say, blip, loadSounds, warmSounds, playMusic, stopMusic, setMuted } from './voice.js';
import { saveGame, loadGame, hasSave, clearSave } from './save.js';
import { GUIDE } from '../data/guide.js';
import { setTipsOff, hideTip } from './tips.js';
import { setupBarArrows } from './hud.js';

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
  document.title = LINES.title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  $('title-credits').textContent = LINES.credits;
  $('title-tagline').textContent = LINES.tagline;
  $('continue').hidden = !hasSave();
  stopMusic();
  modeNote();
  show('screen-title');
}

function modeNote() {
  $('mode-note').textContent = DIFFICULTY[state.mode].note;
  document.querySelectorAll('.mode').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === state.mode ? 'true' : 'false'));
}

// The how-to cards come from GUIDE in data/guide.js. The ? button opens them any time.
function howToScreen(then) {
  $('how-cards').innerHTML = GUIDE.map((c) =>
    `<div class="how-card">${icon(c.art, 72)}<h3>${c.head}</h3><p>${c.text}</p></div>`).join('');
  afterHowTo = then;
  show('screen-how');
  say(GUIDE[0].head + '. ' + GUIDE[0].text);
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
  startView();
  day();
}

function continueGame() {
  stopNight();
  fresh();
  $('fx').innerHTML = '';
  if (!loadGame()) { titleScreen(); return; }
  setTipsOff(!!state.tipsOff);
  seenHowTo = true;
  show(null);
  startView();
  playMusic('day');
  startDay(night, true);
}

function day() {
  startView();
  playMusic('day');
  startDay(night);
}

function night() {
  stopDay();
  blip('night');
  playMusic('night');
  startNight(dawnResult);
}

function dawnResult() {
  const n = state.villagers.length;
  const won = checkWin();
  const justWon = won && !state.wonAlready;
  if (justWon) state.wonAlready = true;
  $('result-title').textContent = justWon ? LINES.win : won ? 'DAWN. Still winning.' : 'DAWN';
  const taken = state.taken.length ? `<p>${icon('zombieicon')} ${state.taken.map((t) => t.name || t.job).join(', ')} turned into ${state.taken.length > 1 ? 'zombies' : 'a zombie'}. They come back tomorrow night. Cure them!</p>` : '';
  const broke = state.brokeTonight ? `<p>${icon('plank')} ${state.brokeTonight} traps broke</p>` : '';
  const pits = state.zombies.length ? `<p>${icon('pit')} ${state.zombies.length} waiting in pits</p>` : '';
  const joined = (state.joined || []).length ? `<p>${icon('villager')} Joined: ${state.joined.map((j) => `${j.name} the ${(JOBS[j.job] || { name: j.job }).name.toLowerCase()}`).join(', ')}</p>` : '';
  let beds = 0;
  for (const t of state.things.values()) if (t.does === 'bed') beds += t.data.holds || 1;
  const noBed = state.villagers[beds];
  const bedLine = noBed ? `<p>${icon('bed')} ${LINES.noBedFor.replace('{name}', noBed.name)}</p>` : '';
  const socks = state.socksTonight ? `<p>${icon('sock')} ${state.socksTonight} odd socks found. Plain Bob is jealous.</p>` : '';
  $('result-counts').innerHTML =
    `<p>${icon('bucket')} ${state.curedTonight} cured tonight</p>` + joined + bedLine + socks +
    `<p>${icon('villager')} Village ${n} / ${WIN_AT}</p>` + taken + pits + broke;
  $('result-tip').textContent = justWon
    ? `You won! Keep going for a village of ${WIN_AT * 2}, or play again on ${state.mode === 'easy' ? 'Hard' : 'Easy'}.`
    : won ? `New goal: a village of ${WIN_AT * 2}.` : pick(LINES.tip);
  $('next-day').textContent = justWon ? 'KEEP GOING' : 'NEXT DAY';
  $('play-again').hidden = !won;
  say(justWon ? LINES.win : `${state.curedTonight} cured. ${n} villagers.`);
  blip(justWon ? 'win' : 'dawn');
  playMusic('day');
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
  // the ? button: the guide at any time (the night pauses while you read)
  $('guide-btn').addEventListener('click', () => {
    if (state.phase === 'title') { howToScreen(titleScreen); return; }
    if (state.phase === 'night' && !isPaused()) pauseNight(true);
    howToScreen(() => show(null));
  });
  $('tips-toggle').addEventListener('click', () => { setTipsOff(!state.tipsOff); if (state.phase === 'day') saveGame(); });
  document.querySelector('#tip .tip-ok').addEventListener('click', hideTip);
  $('how-done').addEventListener('click', () => { const f = afterHowTo; afterHowTo = null; if (f) f(); });
  $('next-day').addEventListener('click', nextDay);
  $('play-again').addEventListener('click', () => { stopDay(); clearSave(); titleScreen(); });
  $('to-title').addEventListener('click', () => { stopDay(); stopNight(); titleScreen(); });
  $('night-falls').addEventListener('click', nightFallsPressed);
  $('upgrade-btn').addEventListener('click', buyWeapon);
  $('swap-btn').addEventListener('click', swapCarrots);
  $('pause-btn').addEventListener('click', () => { if (state.phase === 'night') pauseNight(!isPaused()); });
  $('resume').addEventListener('click', () => pauseNight(false));
  $('pause-title').addEventListener('click', () => { stopNight(); titleScreen(); });
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'p' || e.key === 'Escape') && state.phase === 'night') pauseNight(!isPaused());
  });
  wireNightButtons();

  const village = $('village');
  // the camera decides what is a tap, a drag (pan) or a pinch
  setupCamera((ev, kind) => {
    if (kind === 'down') {
      if (state.phase === 'night' && !isPaused()) { const r = nightDown(ev); setAiming(r === 'hold'); return r; }
      return undefined;
    }
    if (kind === 'move') { if (state.phase === 'night') nightMove(ev); return; }
    if (kind === 'up') { if (state.phase === 'night') nightUp(); setAiming(false); return; }
    if (kind === 'tap') {
      if (state.phase === 'day') dayClick(ev);
      else if (state.phase === 'night' && !isPaused()) nightTap(ev);
    }
  });
  village.addEventListener('pointermove', (ev) => { if (state.phase === 'day') dayHover(ev); });
  village.addEventListener('pointerleave', clearHover);
  village.addEventListener('contextmenu', (e) => e.preventDefault());
  hero.listen();

  $('theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme !== 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    $('theme-toggle').textContent = dark ? '☀️' : '🌙';
    $('theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  });
  // Sound on or off: the corner button and the big one on the title do the
  // same thing, and the choice is remembered on this device
  const soundButtons = (muted) => {
    $('sound-toggle').textContent = muted ? '🔇' : '🔊';
    $('sound-toggle').setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
    $('title-sound').textContent = muted ? '🔇 Sound off' : '🔊 Sound on';
    $('title-sound').setAttribute('aria-pressed', muted ? 'false' : 'true');
  };
  const setSound = (muted) => {
    setMuted(muted);
    soundButtons(muted);
    try { localStorage.setItem('zombie-wars-muted', muted ? '1' : '0'); } catch (e) { /* private window: fine */ }
  };
  try { if (localStorage.getItem('zombie-wars-muted') === '1') { state.muted = true; soundButtons(true); } } catch (e) { /* fine */ }
  $('title-sound').addEventListener('click', () => setSound(!state.muted));
  $('sound-toggle').addEventListener('click', () => {
    setSound(!state.muted);
  });
  // browsers only allow sound after the first tap or key, so get the sounds ready then
  ['pointerdown', 'keydown'].forEach((type) => window.addEventListener(type, warmSounds));

  // for testing: ?fast=3 runs the night three times faster, ?mode=hard,
  // ?horde=bogey,eyeball picks tonight's zombies, ?skiphow skips the how-to
  const q = new URLSearchParams(location.search);
  if (q.get('fast')) window.ZOMBIES.fast = Number(q.get('fast'));
  if (q.get('mode')) state.mode = q.get('mode');
  if (q.get('horde')) window.ZOMBIES.horde = q.get('horde').split(',');
  if (q.has('skiphow')) seenHowTo = true;
}

async function boot() {
  loadSounds();   // no need to wait: the beeps cover until they arrive
  await loadArt();
  loadPictures();   // the paintings take over as they arrive
  setupBarArrows();
  drawGround();
  wire();
  titleScreen();
}

boot();
