/* ===========================================================
   MAIN: starts everything

   Loads the pictures, sets up the keys and buttons, fits the
   game to the screen, and starts the loop. Play wipes the old
   game clean and starts a new one.
   =========================================================== */

import { state, newGame, W, H } from './state.js';
import { loadArt } from './art.js';
import { setupInput } from './input.js';
import { makeShip } from './ship.js';
import { resetHud } from './hud.js';
import { clearFx } from './fx.js';
import { setupTitle, show } from './screens.js';
import { frame } from './loop.js';
import { wakeAudio } from './audio.js';
import { SHIP } from '../data/ship.js';
import { ENEMIES } from '../data/enemies.js';
import { PARTS } from '../data/parts.js';

const $ = (id) => document.getElementById(id);

// Make the 480 by 720 play area as big as the window allows.
function fit() {
  const side = window.innerWidth > 860 ? 260 + 24 : 0;
  const scale = Math.min((window.innerHeight - 16) / H, (window.innerWidth - 16 - side) / W);
  $('field').style.transform = `scale(${scale})`;
  $('stage').style.width = `${W * scale}px`;
  $('stage').style.height = `${H * scale}px`;
}

// Empty every layer, so nothing from the last game is left on screen.
function clearAll() {
  clearFx();
  for (const name of ['ground', 'pickups', 'air', 'shots', 'ship', 'foes']) $(`layer-${name}`).replaceChildren();
}

function play() {
  wakeAudio();
  clearAll();
  newGame();
  resetHud();
  makeShip();
  show(null);
  $('field').focus();
}

function toMenu() {
  clearAll();
  state.mode = 'title';
  show('title');
}

function setupToggles() {
  $('theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const day = root.dataset.theme !== 'day';
    root.dataset.theme = day ? 'day' : 'space';
    $('theme-toggle').setAttribute('aria-label', day ? 'Switch to dark theme' : 'Switch to light theme');
    $('theme-toggle').innerHTML = day ? '&#127769;' : '&#9728;&#65039;';
  });
  $('sound-toggle').addEventListener('click', () => {
    state.muted = !state.muted;
    $('sound-toggle').setAttribute('aria-label', state.muted ? 'Turn sound on' : 'Turn sound off');
    $('sound-toggle').innerHTML = state.muted ? '&#128263;' : '&#128266;';
  });
  $('btn-resume').addEventListener('click', () => { state.mode = 'play'; show(null); });
  $('btn-restart').addEventListener('click', play);
  $('btn-again-over').addEventListener('click', play);
  $('btn-again-win').addEventListener('click', play);
  for (const id of ['btn-menu', 'btn-menu-over', 'btn-menu-win']) $(id).addEventListener('click', toMenu);
}

// Pause by itself if you switch tabs.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'play') { state.mode = 'paused'; show('pause'); }
});

// For testing: ?god makes you safe, ?fast=4 plays four times as fast.
const params = new URLSearchParams(location.search);
if (params.has('god')) state.god = true;
if (params.has('fast')) state.fast = Math.max(1, Math.min(10, Number(params.get('fast')) || 1));
window.STAR_BASE = { state };     // type STAR_BASE.state in the console to look inside

async function boot() {
  const names = [
    SHIP.art, 'comet-pods',
    ...Object.values(ENEMIES).map((e) => e.art),
    ...Object.values(PARTS).map((p) => p.art),
    'hauler', 'hauler-engine', 'core', 'core-turret', 'core-eye',
  ];
  // Set up the screen straight away, but keep Play switched off
  // until every picture has arrived, or the ships would be invisible.
  const btn = $('btn-play');
  btn.disabled = true;
  btn.textContent = 'Loading';
  setupInput($('field'));
  setupTitle(play);
  setupToggles();
  fit();
  window.addEventListener('resize', fit);
  show('title');
  requestAnimationFrame(frame);
  await loadArt(names);
  btn.disabled = false;
  btn.textContent = 'Play';
  btn.focus();
}

boot();
