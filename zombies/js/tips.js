/* ===========================================================
   TIPS: little helpers that pop up while you play

   Each tip in data/guide.js shows once a game, when it is
   useful (no brewery yet, a zombie munching, lots of carrots).
   The light bulb button turns them off and on. The tip is read
   out loud too.
   =========================================================== */

import { state } from './state.js';
import { TIPS, LAND } from '../data/guide.js';
import { say } from './voice.js';
import { isWater, isRock, isPond, isBridge, isEdge } from './grid.js';
import { TRACK } from '../data/map.js';

let hideT = null;

export function tip(id) {
  if (state.tipsOff || !TIPS[id]) return;
  state.tipsSeen = state.tipsSeen || [];
  if (state.tipsSeen.includes(id)) return;
  state.tipsSeen.push(id);
  const box = document.getElementById('tip');
  box.querySelector('span').textContent = TIPS[id];
  box.hidden = false;
  say(TIPS[id].replace(/^Tip: /, ''));
  clearTimeout(hideT);
  hideT = setTimeout(() => { box.hidden = true; }, 12000);
}

export function hideTip() { document.getElementById('tip').hidden = true; }

export function setTipsOff(off) {
  state.tipsOff = off;
  if (off) hideTip();
  const b = document.getElementById('tips-toggle');
  b.setAttribute('aria-pressed', off ? 'false' : 'true');
  b.setAttribute('aria-label', off ? 'Turn tips on' : 'Turn tips off');
  b.classList.toggle('off', off);
}

// Checked every day and night: is there a tip worth giving now?
export function checkTips() {
  const things = [...state.things.values()];
  if (state.phase === 'day') {
    if (state.night === 1) tip('day1');
    if (state.night >= 1 && !things.some((t) => t.does === 'brewery')) tip('brewery');
    else if (!state.villagers.some((v) => v.job === 'brewer')) tip('brewer');
    if (state.carrots >= 20) tip('carrots');
    if (state.night >= 2 && !things.some((t) => t.does === 'mine')) tip('mine');
    if (things.some((t) => t.held && t.held.length)) tip('pit');
    if (state.socks > 0) tip('socks');
  } else if (state.phase === 'night') {
    if (state.night === 1) tip('night1');
    if (state.potion === 0) tip('nopotion');
    if (state.zombies.some((z) => z.munch)) tip('munch');
    if (state.night >= 2 && !state.pillowUsed) tip('pillows');
  }
}

// Tap the land with nothing picked: what is it for?
const TRACK_SET = new Set(TRACK.map(([c, r]) => c + ',' + r));
export function landLine(col, row) {
  if (isBridge(col, row)) return LAND.bridge;
  if (isWater(col, row)) return LAND.water;
  if (isRock(col, row)) return LAND.rock;
  if (isPond(col, row)) return LAND.pond;
  if (isEdge(col, row)) return LAND.forest;
  if (TRACK_SET.has(col + ',' + row)) return LAND.track;
  return LAND.grass;
}
