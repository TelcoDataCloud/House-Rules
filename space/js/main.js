/* ===========================================================
   MAIN: starts everything

   Loads the pictures, sets up the keys and buttons, fits the
   game to the screen, and starts the loop. What happens when
   you press Play, Try again or Menu is in js/flow.js.
   =========================================================== */

import { state, W, H } from './state.js';
import { loadArt } from './art.js';
import { setupInput } from './input.js';
import { setupTitle, show, showTitleBest } from './screens.js';
import { frame } from './loop.js';
import { playGame, retry, toMenu } from './flow.js';
import { setupCut } from './cutscene.js';
import { applyWorld } from './world.js';
import { SHIP } from '../data/ship.js';
import { ENEMIES } from '../data/enemies.js';
import { PARTS } from '../data/parts.js';
import { BOSSES } from '../data/bosses.js';

const $ = (id) => document.getElementById(id);

// For testing: ?god makes you safe, ?fast=4 plays four times as fast,
// ?level=2 starts on level 2.
const params = new URLSearchParams(location.search);
if (params.has('god')) state.god = true;
if (params.has('fast')) state.fast = Math.max(1, Math.min(10, Number(params.get('fast')) || 1));
const startAt = Math.max(0, (Number(params.get('level')) || 1) - 1);
window.STAR_BASE = { state };     // type STAR_BASE.state in the console to look inside

// Make the 480 by 720 play area as big as the window allows.
function fit() {
  const side = window.innerWidth > 860 ? 260 + 24 : 0;
  const scale = Math.min((window.innerHeight - 16) / H, (window.innerWidth - 16 - side) / W);
  $('field').style.transform = `scale(${scale})`;
  $('stage').style.width = `${W * scale}px`;
  $('stage').style.height = `${H * scale}px`;
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
  $('btn-restart').addEventListener('click', () => playGame(0));
  $('btn-retry').addEventListener('click', retry);
  $('btn-again-over').addEventListener('click', () => playGame(0));
  $('btn-again-win').addEventListener('click', () => playGame(0));
  for (const id of ['btn-menu', 'btn-menu-over', 'btn-menu-win']) $(id).addEventListener('click', toMenu);
}

// Pause by itself if you switch tabs.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.mode === 'play') { state.mode = 'paused'; show('pause'); }
});

async function boot() {
  const names = [
    SHIP.art, 'drone', 'hauler-engine', 'core-turret', 'core-eye', 'hauler', 'boss-cannon',
    ...Object.values(ENEMIES).map((e) => e.art),
    ...Object.values(PARTS).map((p) => p.art),
    ...Object.values(BOSSES).map((b) => b.art).filter(Boolean),
  ];
  // Set up the screen straight away, but keep Play switched off
  // until every picture has arrived, or the ships would be invisible.
  const btn = $('btn-play');
  btn.disabled = true;
  btn.textContent = 'Loading';
  setupInput($('field'));
  setupTitle(() => playGame(startAt));
  setupToggles();
  setupCut();
  applyWorld('space');
  fit();
  window.addEventListener('resize', fit);
  show('title');
  requestAnimationFrame(frame);
  await loadArt(names);
  btn.disabled = false;
  btn.textContent = 'Play';
  showTitleBest();
  btn.focus();
}

boot();
