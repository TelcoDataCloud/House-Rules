/* ===========================================================
   RIG - phase 3: put your traps round the house

   Your traps from the workbench sit in a tray above the house.
   Pick one, and every spot in the house it FITS lights up in the
   colour of its mount (a floor trap lights the floor spots, and
   so on). Tap one of those and the trap goes there.

     Wrong kind of spot   -> it tells you where that trap goes
     Spot already rigged  -> the old trap comes back to the tray
     Tap a rigged spot    -> with nothing picked, the trap comes
                             off and goes back in the tray

   Which trap is where lives in state.rigged, like
       { 'front-door': 'flour-bomb' }
   and the mount rules live in data/recipes.js (each trap's mount)
   and data/rooms.js (each spot's mount). This file only checks
   that the two match.

   When at least one trap is set, LET THEM IN goes live.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS } from '../data/items.js';
import { TRAPS, UPGRADES } from '../data/recipes.js';
import { ANCHORS, MOUNTS } from '../data/rooms.js';
import { itemPicture } from './item-art.js';
import { setAnchorHandler, highlightMount, showTrapOnAnchor, clearAnchorTraps } from './house.js';
import { sfx } from './audio.js';

const ALL = [...TRAPS, ...UPGRADES];
const ui = {};
let picked = null;              // the number of the trap you picked in the tray

function findTrap(id) { return ALL.find((trap) => trap.id === id); }
function findItem(id) { return ITEMS.find((item) => item.id === id); }
function findAnchor(id) { return ANCHORS.find((anchor) => anchor.id === id); }

/* The first thing a trap was made from, for its little picture. */
function firstItem(trapId) {
  const trap = findTrap(trapId);
  if (!trap) return { look: 'parcel' };
  const first = trap.needs[0];
  return findTrap(first) ? firstItem(first) : (findItem(first) || { look: 'parcel' });
}

function mountName(mount) {
  return MOUNTS[mount] ? MOUNTS[mount].name.toLowerCase() : mount;
}

/* 'the front door', but 'your bedroom door' */
function spot(anchor) {
  const name = anchor.name.toLowerCase();
  return name.startsWith('your ') ? name : `the ${name}`;
}

function say(words) {
  ui.say.textContent = words;
}

/* --- THE TRAY ------------------------------------------------ */

function drawTray() {
  ui.tray.innerHTML = '';
  state.traps.forEach((id, i) => {
    const trap = findTrap(id);
    if (!trap) return;
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rig-card' + (picked === i ? ' is-picked' : '');
    btn.dataset.mount = trap.mount;
    btn.dataset.id = id;
    btn.setAttribute('aria-pressed', String(picked === i));
    btn.append(itemPicture(firstItem(id)));
    const name = document.createElement('span');
    name.className = 'rig-card-name';
    name.textContent = trap.name;
    const where = document.createElement('span');
    where.className = 'rig-card-mount';
    where.textContent = mountName(trap.mount);
    btn.append(name, where);
    btn.addEventListener('click', () => pick(i));
    li.append(btn);
    ui.tray.append(li);
  });
  if (!state.traps.length) {
    const li = document.createElement('li');
    li.className = 'rig-empty';
    li.textContent = Object.keys(state.rigged).length
      ? 'Every trap is set.'
      : 'No traps. Go back to the workbench and build some.';
    ui.tray.append(li);
  }
  const set = Object.keys(state.rigged).length;
  ui.count.textContent = set === 1 ? '1 trap set' : `${set} traps set`;
  ui.letIn.disabled = set === 0;
}

function pick(i) {
  if (picked === i) {                       // tap it again to put it down
    picked = null;
    highlightMount(null);
    say('Pick a trap, then tap a glowing spot in the house.');
  } else {
    picked = i;
    const trap = findTrap(state.traps[i]);
    highlightMount(trap.mount);
    sfx.tick();
    say(`${trap.name} goes on a ${mountName(trap.mount)} spot. Tap one that is glowing.`);
  }
  drawTray();
}

/* --- THE SPOTS IN THE HOUSE ---------------------------------- */

function place(anchor) {
  const trapId = state.traps[picked];
  const trap = findTrap(trapId);
  if (anchor.mount !== trap.mount) {
    sfx.nope();
    say(`${trap.name} will not go on ${spot(anchor)}. It needs a ${mountName(trap.mount)} spot.`);
    return;
  }
  state.traps.splice(picked, 1);
  const old = state.rigged[anchor.id];
  if (old) state.traps.push(old);           // swap: the old one goes back
  state.rigged[anchor.id] = trapId;
  showTrapOnAnchor(anchor.id, firstItem(trapId), trap.name);
  picked = null;
  highlightMount(null);
  sfx.craft();
  say(old
    ? `${trap.name} on ${spot(anchor)}. ${findTrap(old).name} is back in your tray.`
    : `${trap.name} set on ${spot(anchor)}.`);
  drawTray();
}

function takeOff(anchor) {
  const trapId = state.rigged[anchor.id];
  delete state.rigged[anchor.id];
  state.traps.push(trapId);
  showTrapOnAnchor(anchor.id, null);
  sfx.back();
  say(`${findTrap(trapId).name} is back in your tray.`);
  drawTray();
}

function onAnchor(anchor) {
  if (picked !== null) place(anchor);
  else if (state.rigged[anchor.id]) takeOff(anchor);
  else say('Pick a trap from your tray first.');
}

function describe(anchor) {
  const rigged = state.rigged[anchor.id];
  if (rigged) return `${anchor.name}: ${findTrap(rigged).name}. Tap to take it off.`;
  return `${anchor.name}. ${MOUNTS[anchor.mount].line}`;
}

/* --- START AND STOP ------------------------------------------ */

export function setupRig(els) {
  Object.assign(ui, els);
  ui.back.addEventListener('click', () => setPhase('workshop'));
  ui.letIn.addEventListener('click', () => {
    if (Object.keys(state.rigged).length) setPhase('night');
  });
}

/* Put every trap in state.rigged back on its spot. Used when you
   come back to the house after the workbench. */
export function drawRigged() {
  clearAnchorTraps();
  Object.entries(state.rigged).forEach(([anchorId, trapId]) => {
    if (findAnchor(anchorId)) showTrapOnAnchor(anchorId, firstItem(trapId), findTrap(trapId).name);
  });
}

export function showRig() {
  picked = null;
  ui.panel.hidden = false;
  setAnchorHandler(onAnchor, describe);
  drawRigged();
  say(state.traps.length
    ? 'Pick a trap, then tap a glowing spot in the house.'
    : 'Nothing to set. Build some traps first.');
  drawTray();
}

export function hideRig() {
  picked = null;
  ui.panel.hidden = true;
  setAnchorHandler(null, null);
  highlightMount(null);
}
