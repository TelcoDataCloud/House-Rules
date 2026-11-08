/* ===========================================================
   DAY: build things, read the lookout, press NIGHT FALLS

   Pick a thing on the bar, click a square to put it there.
   Click a thing you built to take it back (planks refunded).
   Click a pit with zombies in it while you have potion to
   cure one. The lookout tells you what is coming, and on Easy
   teaches one new zombie a night.
   =========================================================== */

import { state, key, TILE } from './state.js';
import { TRAPS } from '../data/traps.js';
import { ZOMBIES } from '../data/zombies.js';
import { LINES } from '../data/lines.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { POCKETS } from '../data/villagers.js';
import { placeThing, removeThing, thingAt, pointToTile, isEdge, el } from './grid.js';
import { buildBar, drawCounts, drawDay, drawSun, lookoutSay, helpSay, banner, flashCount } from './hud.js';
import { morning, wakeUp, placeAtWork, draw as drawVillager } from './villagers.js';
import { tonight, cure } from './zombies.js';
import { burst } from './fx.js';
import { say, blip } from './voice.js';
import { mend, fixTrap } from './hard.js';
import { saveGame } from './save.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
let plan = null;
let hoverTile = null;
let onNightHandler = null;

const DAY_HELP = 'Pick a thing on the bar, then click a square. Click a thing to take it back. Click a pit with zombies to pour potion in.';

// loaded: true means this day came from a save, so the morning already happened
export function startDay(onNight, loaded = false) {
  state.phase = 'day';
  state.picked = null;
  state.hero.hearts = 5; state.hero.down = 0;
  document.getElementById('down-timer').hidden = true;
  document.getElementById('stage').classList.remove('is-night');
  document.getElementById('bar').hidden = false;
  helpSay(DAY_HELP);
  clearGhost();

  // clear last night's used traps so they work again (Easy) or need a builder (Hard)
  for (const t of state.things.values()) {
    if (t.used && !t.broken) { t.used = false; t.el.style.opacity = 1; }
  }

  // Day 1: no morning, just what you start with. After that the jobs make things.
  let made = null, stillBroken = 0;
  if (state.night > 1 && !loaded) { made = morning(); stillBroken = mend(); }
  wakeUp();
  plan = tonight();

  // the lookout: what is coming, the moon, and one new zombie to meet
  let line = pick(LINES.lookout).replace('{count}', plan.kinds.length).replace('{side}', plan.side === 'all' ? 'everywhere' : plan.side);
  if (plan.moon) line += state.moonDay === 4 ? ' FULL MOON. Something howled.' : ' New moon. Very quiet. Too quiet.';
  const diff = DIFFICULTY[state.mode];
  const newKind = diff.meet ? diff.meet[state.night] : null;
  const tipKind = newKind || (state.night === 1 ? 'bob' : null);
  if (tipKind && ZOMBIES[tipKind] && ZOMBIES[tipKind].tip) line += ' ' + ZOMBIES[tipKind].tip;
  lookoutSay(line);
  say(line);

  buildBar(pickThing);
  onNightHandler = onNight;
  drawDay();
  drawSun(0.1);
  drawCounts();
  if (made) {
    banner(`+${made.carrots} carrots  +${made.planks} planks  +${made.potion} potion`, 2500);
    helpSay(LINES.morning.replace('{carrots}', made.carrots).replace('{planks}', made.planks).replace('{potion}', made.potion) + ' ' + DAY_HELP);
  } else {
    banner(LINES.start.replace('{planks}', POCKETS.planks).replace('{carrots}', POCKETS.carrots).replace('{potion}', POCKETS.potion), 3000);
  }
  if (stillBroken) lookoutSay(`${stillBroken} traps still broken. Click one to mend it for a plank.`);
  if (!loaded) saveGame();
}

export function nightFallsPressed() {
  if (![...state.things.values()].some((t) => t.does === 'bed')) {
    banner(LINES.noBed, 2500);
    say(LINES.noBed);
    helpSay(LINES.noBed);
    return;
  }
  if (onNightHandler) onNightHandler();
}

export function getPlan() { return plan; }

function pickThing(id) {
  state.picked = state.picked === id ? null : id;
  const t = TRAPS[id];
  if (state.picked && t) helpSay(`<b>${t.name}</b> picked. ${t.what || ''} Click a square inside the village.`);
  else helpSay(DAY_HELP);
  clearGhost();
  drawCounts();
}

function cannot(p, text, which) {
  burst(p.col + 0.5, p.row + 0.5, text);
  helpSay(text + '.');
  if (which) flashCount(which);
}

export function dayClick(ev) {
  const p = pointToTile(ev);
  const here = thingAt(p.col, p.row);
  // cure a zombie in a pit
  if (here && here.does === 'pit' && here.held.length) {
    if (state.potion <= 0) { cannot(p, 'No potion', 'potion'); say(LINES.noPotion); return; }
    state.potion--;
    cure(here.held[0]);
    drawCounts();
    return;
  }
  // mend a broken trap for a plank
  if (here && here.broken) {
    if (state.planks < 1) { cannot(p, 'Need a plank', 'planks'); return; }
    state.planks--;
    fixTrap(here);
    burst(p.col + 0.5, p.row, 'mended');
    blip('bonk');
    drawCounts();
    return;
  }
  // take something back (not the last bed, the village needs it)
  if (here && TRAPS[here.kind] && !here.held.length) {
    if (here.kind === 'bed' && [...state.things.values()].filter((t) => t.does === 'bed').length <= 1) { cannot(p, 'Keep one bed'); return; }
    state.villagers.filter((v) => v.crewOf === here).forEach((c) => { c.job = c.oldJob || 'farmer'; c.crewOf = null; placeAtWork(c); drawVillager(c); });
    state.planks += TRAPS[here.kind].planks;
    removeThing(p.col, p.row);
    burst(p.col + 0.5, p.row + 0.5, 'back');
    drawCounts();
    return;
  }
  if (!state.picked) return;
  const t = TRAPS[state.picked];
  if (here || isEdge(p.col, p.row) || p.col < 0 || p.row < 0) { cannot(p, 'Not here'); return; }
  if (state.planks < t.planks) { cannot(p, 'Need planks', 'planks'); return; }
  if (t.needsJob && !state.villagers.some((v) => v.job === t.needsJob)) { cannot(p, 'Needs a ' + t.needsJob); return; }
  const crew = [];
  if (t.crew) {
    const free = state.villagers.filter((v) => v.job !== 'crew' && v.job !== 'brewer');
    if (free.length < t.crew) { cannot(p, `Need ${t.crew} villagers`, 'villagers'); return; }
    crew.push(...free.slice(0, t.crew));
  }
  state.planks -= t.planks;
  const thing = placeThing(state.picked, p.col, p.row);
  crew.forEach((c, i) => {
    c.oldJob = c.job; c.job = 'crew'; c.crewOf = thing; thing.crewMember = c;
    c.x = p.col + 0.2 + i * 0.6; c.y = p.row - 0.4; drawVillager(c);
  });
  blip('bonk');
  drawCounts();
}

// A see-through copy of the thing follows the pointer
function clearGhost() { document.getElementById('ghost').innerHTML = ''; }

export function dayHover(ev) {
  const p = pointToTile(ev);
  if (hoverTile) hoverTile.classList.remove('hover', 'bad');
  clearGhost();
  if (!state.picked) return;
  const tile = document.querySelector(`.tile[data-col="${p.col}"][data-row="${p.row}"]`);
  if (!tile) return;
  hoverTile = tile;
  const bad = thingAt(p.col, p.row) || isEdge(p.col, p.row);
  tile.classList.add(bad ? 'bad' : 'hover');
  if (!bad) {
    const t = TRAPS[state.picked];
    document.getElementById('ghost').appendChild(el('use', {
      href: '#art-' + t.art, width: TILE + 8, height: TILE + 8, x: p.col * TILE - 4, y: p.row * TILE - 6, class: 'ghost',
    }));
  }
}

export function clearHover() { if (hoverTile) hoverTile.classList.remove('hover', 'bad'); clearGhost(); }
