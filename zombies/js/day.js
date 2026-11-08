/* ===========================================================
   DAY: build things, read the lookout, press NIGHT FALLS

   Pick a thing on the bar, click a square to put it there.
   Click a thing you built to take it back (planks refunded).
   Click a pit with zombies in it while you have potion to
   cure one. The lookout tells you what is coming.
   =========================================================== */

import { state, key } from './state.js';
import { TRAPS } from '../data/traps.js';
import { LINES } from '../data/lines.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { placeThing, removeThing, thingAt, pointToTile, isEdge, blocked } from './grid.js';
import { buildBar, drawCounts, drawDay, drawSun, lookoutSay, banner } from './hud.js';
import { morning, wakeUp, placeAtWork, draw as drawVillager } from './villagers.js';
import { tonight, cure } from './zombies.js';
import { burst } from './fx.js';
import { say, blip } from './voice.js';
import { mend, fixTrap } from './hard.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
let plan = null;
let hoverTile = null;

export function startDay(onNight) {
  state.phase = 'day';
  state.picked = null;
  state.hero.hearts = 5; state.hero.down = 0;
  document.getElementById('down-timer').hidden = true;
  document.getElementById('stage').classList.remove('is-night');
  document.getElementById('bar').hidden = false;
  document.getElementById('help').textContent = 'Pick a thing on the bar, then click a square. Click a thing to take it back. Click a pit to cure what is in it.';

  // clear last night's used traps so they work again (Easy) or need a builder (Hard)
  for (const t of state.things.values()) {
    if (t.used) {
      if (DIFFICULTY[state.mode].trapsBreak && !state.villagers.some((v) => v.job === 'builder')) continue;
      t.used = false; t.el.style.opacity = 1;
    }
  }

  const made = morning();
  const stillBroken = mend();
  wakeUp();
  plan = tonight();
  const line = pick(LINES.lookout).replace('{count}', plan.kinds.length).replace('{side}', plan.side === 'all' ? 'everywhere' : plan.side);
  lookoutSay(line + (plan.moon === null ? '' : ''));
  if (plan.moon) lookoutSay(line + (state.moonDay === 4 ? ' FULL MOON. Something howled.' : ' New moon. Very quiet. Too quiet.'));
  say(line);
  buildBar(pickThing);
  document.getElementById('night-falls').addEventListener('click', onNight);
  drawDay();
  drawSun(0.1);
  drawCounts();
  if (made.carrots || made.planks || made.potion) {
    banner(`+${made.carrots} carrots  +${made.planks} planks  +${made.potion} potion`, 2500);
  }
  if (stillBroken) { lookoutSay(`${stillBroken} traps still broken. Click one to mend it for a plank.`); }
}

export function getPlan() { return plan; }

function pickThing(id) {
  state.picked = state.picked === id ? null : id;
  drawCounts();
}

export function dayClick(ev) {
  const p = pointToTile(ev);
  const here = thingAt(p.col, p.row);
  // cure a zombie in a pit
  if (here && here.does === 'pit' && here.held.length) {
    if (state.potion <= 0) { burst(p.col + 0.5, p.row, 'no potion'); say(LINES.noPotion); return; }
    state.potion--;
    cure(here.held[0]);
    drawCounts();
    return;
  }
  // mend a broken trap for a plank
  if (here && here.broken) {
    if (state.planks < 1) { burst(p.col + 0.5, p.row, 'need a plank'); return; }
    state.planks--;
    fixTrap(here);
    burst(p.col + 0.5, p.row, 'mended');
    blip('bonk');
    drawCounts();
    return;
  }
  // take something back
  if (here && TRAPS[here.kind] && !here.held.length && here.kind !== 'bed' && here.kind !== 'farm') {
    state.villagers.filter((v) => v.crewOf === here).forEach((c) => { c.job = c.oldJob || 'farmer'; c.crewOf = null; placeAtWork(c); drawVillager(c); });
    state.planks += TRAPS[here.kind].planks;
    removeThing(p.col, p.row);
    burst(p.col + 0.5, p.row + 0.5, 'back');
    drawCounts();
    return;
  }
  if (!state.picked) return;
  const t = TRAPS[state.picked];
  if (here || isEdge(p.col, p.row) || p.col < 0 || p.row < 0) { burst(p.col + 0.5, p.row + 0.5, 'not here'); return; }
  if (state.planks < t.planks) { burst(p.col + 0.5, p.row + 0.5, 'need planks'); return; }
  if (t.needsJob && !state.villagers.some((v) => v.job === t.needsJob)) { burst(p.col + 0.5, p.row + 0.5, 'needs a ' + t.needsJob); return; }
  const crew = [];
  if (t.crew) {
    const free = state.villagers.filter((v) => v.job !== 'crew' && v.job !== 'brewer');
    if (free.length < t.crew) { burst(p.col + 0.5, p.row + 0.5, `need ${t.crew} villagers`); return; }
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

export function dayHover(ev) {
  const p = pointToTile(ev);
  if (hoverTile) hoverTile.classList.remove('hover', 'bad');
  if (!state.picked) return;
  const tile = document.querySelector(`.tile[data-col="${p.col}"][data-row="${p.row}"]`);
  if (!tile) return;
  hoverTile = tile;
  tile.classList.add(thingAt(p.col, p.row) || isEdge(p.col, p.row) ? 'bad' : 'hover');
}

export function clearHover() { if (hoverTile) hoverTile.classList.remove('hover', 'bad'); }
