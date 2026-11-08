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
import { placeThing, removeThing, thingAt, pointToTile, isEdge, el, buildable, nearRock } from './grid.js';
import { buildBar, drawCounts, drawDay, drawSun, lookoutSay, helpSay, banner, flashCount } from './hud.js';
import { wakeUp, placeAtWork, draw as drawVillager, setJob, assignBeds, assignHomes } from './villagers.js';
import { JOBS } from '../data/villagers.js';
import { startWork, updateWork, retask } from './work.js';
import { tonight, cure } from './zombies.js';
import { nextWeapon } from './combat.js';
import { burst } from './fx.js';
import { say, blip } from './voice.js';
import { mend, fixTrap } from './hard.js';
import { saveGame } from './save.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];
let plan = null;
let hoverTile = null;
let onNightHandler = null;
let raf = 0;
let last = 0;
let picking = null;   // the villager whose job picker is open

const DAY_HELP = 'Pick a thing, click a square. Tap a villager to change their job.';

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

  const stillBroken = state.night > 1 ? mend() : 0;
  wakeUp();
  assignBeds();
  startWork();
  closePicker();
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
  drawSun(0);
  drawCounts();
  if (state.night === 1) helpSay(LINES.start.replace('{planks}', POCKETS.planks).replace('{carrots}', POCKETS.carrots).replace('{potion}', POCKETS.potion) + ' ' + DAY_HELP);
  if (stillBroken) lookoutSay(`${stillBroken} traps still broken. Click one to mend it for a plank.`);
  const noBed = state.villagers.find((v) => !v.bed);
  if (noBed) { lookoutSay(LINES.noBedFor.replace('{name}', noBed.name) + ' ' + line); say(LINES.noBedFor.replace('{name}', noBed.name)); }
  if (!loaded) saveGame();
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(dayTick);
}

// The day loop: villagers walk to work while you build
function dayTick(now) {
  if (state.phase !== 'day') return;
  const dt = Math.min(0.05, (now - last) / 1000) * (window.ZOMBIES.fast || 1);
  last = now;
  updateWork(dt);
  raf = requestAnimationFrame(dayTick);
}

export function stopDay() { cancelAnimationFrame(raf); closePicker(); }

// Buy the next weapon
export function buyWeapon() {
  const next = nextWeapon();
  if (!next) return;
  if (state.planks < next.planks) { flashCount('planks'); helpSay(`The ${next.name} needs ${next.planks} planks.`); return; }
  if ((state.stone || 0) < (next.stone || 0)) { flashCount('stone'); helpSay(`The ${next.name} needs ${next.stone} stone. Build a mine.`); return; }
  state.planks -= next.planks;
  state.stone = (state.stone || 0) - (next.stone || 0);
  state.weapon = (state.weapon || 0) + 1;
  helpSay(`<b>${next.name}!</b> Stuns for ${next.stun} seconds and whacks them ${next.knock} squares.`);
  say(next.name);
  blip('cheer');
  drawCounts();
  saveGame();
}

export function nightFallsPressed() {
  closePicker();
  if (![...state.things.values()].some((t) => t.does === 'bed')) {
    banner(LINES.noBed, 2500);
    say(LINES.noBed);
    helpSay(LINES.noBed);
    return;
  }
  cancelAnimationFrame(raf);
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

// Tap a villager: a three button picker to change their job
function openPicker(v, ev) {
  closePicker();
  picking = v;
  const box = document.createElement('div');
  box.className = 'job-picker';
  box.innerHTML = `<p><b>${v.name}</b> the ${(JOBS[v.job] || { name: v.job }).name.toLowerCase()}</p>` +
    ['farmer', 'builder', 'brewer', 'miner'].filter((j) => j !== 'miner' || [...state.things.values()].some((t) => t.does === 'mine')).map((j) => `<button type="button" data-job="${j}" ${v.job === j ? 'aria-pressed="true"' : ''}>${JOBS[j].name}</button>`).join('') +
    '<button type="button" class="quiet" data-job="">Close</button>';
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.job) {
      if (b.dataset.job === 'brewer' && ![...state.things.values()].some((t) => t.does === 'brewery')) { helpSay('No brewery to cook in.'); return; }
      setJob(v, b.dataset.job);
      retask(v);
      helpSay(`<b>${v.name}</b> is a ${JOBS[v.job].name.toLowerCase()} now. ${JOBS[v.job].does || ''}`);
      saveGame();
    }
    closePicker();
    drawCounts();
  });
  const stage = document.getElementById('stage');
  stage.appendChild(box);
  const r = stage.getBoundingClientRect();
  box.style.left = Math.min(r.width - 200, Math.max(0, ev.clientX - r.left - 90)) + 'px';
  box.style.top = Math.max(0, ev.clientY - r.top - 120) + 'px';
}

export function closePicker() {
  document.querySelectorAll('.job-picker').forEach((e) => e.remove());
  picking = null;
}

export function dayClick(ev) {
  const p = pointToTile(ev);
  if (picking) { closePicker(); return; }
  // a villager under the pointer?
  const v = state.villagers.find((x) => x.job !== 'crew' && Math.abs(x.x - p.x) < 0.6 && p.y > x.y - 1.1 && p.y < x.y + 0.3);
  if (v && !state.picked) { openPicker(v, ev); return; }
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
    if (here.kind === 'bed' && [...state.things.values()].filter((t) => t.does === 'bed').length <= 1) { cannot(p, 'Keep one cottage'); return; }
    state.villagers.filter((v) => v.crewOf === here).forEach((c) => { c.job = c.oldJob || 'farmer'; c.crewOf = null; placeAtWork(c); drawVillager(c); });
    state.planks += TRAPS[here.kind].planks;
    state.stone += TRAPS[here.kind].stone || 0;
    removeThing(p.col, p.row);
    burst(p.col + 0.5, p.row + 0.5, 'back');
    rehome();
    drawCounts();
    return;
  }
  if (!state.picked) return;
  const t = TRAPS[state.picked];
  if (here || !buildable(p.col, p.row)) { cannot(p, 'Not here'); return; }
  if (t.nearRock && !nearRock(p.col, p.row)) { cannot(p, 'Next to the boulders'); return; }
  if (state.planks < t.planks) { cannot(p, 'Need planks', 'planks'); return; }
  if (state.stone < (t.stone || 0)) { cannot(p, 'Need stone', 'stone'); return; }
  if (t.needsJob && !state.villagers.some((v) => v.job === t.needsJob)) { cannot(p, 'Needs a ' + t.needsJob); return; }
  const crew = [];
  if (t.crew) {
    const free = state.villagers.filter((v) => v.job !== 'crew' && v.job !== 'brewer');
    if (free.length < t.crew) { cannot(p, `Need ${t.crew} villagers`, 'villagers'); return; }
    crew.push(...free.slice(0, t.crew));
  }
  state.planks -= t.planks;
  state.stone -= t.stone || 0;
  const thing = placeThing(state.picked, p.col, p.row);
  crew.forEach((c, i) => {
    c.oldJob = c.job; c.job = 'crew'; c.crewOf = thing; thing.crewMember = c;
    c.x = p.col + 0.2 + i * 0.6; c.y = p.row - 0.4; drawVillager(c);
  });
  blip('bonk');
  rehome();
  drawCounts();
}

// Something was built or taken away: anyone whose patch is now covered moves
function rehome() {
  assignBeds();
  assignHomes();
  state.villagers.forEach((v) => { if (!v.task) { v.x = v.home.x; v.y = v.home.y; drawVillager(v); } });
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
  const bad = thingAt(p.col, p.row) || !buildable(p.col, p.row);
  tile.classList.add(bad ? 'bad' : 'hover');
  if (!bad) {
    const t = TRAPS[state.picked];
    document.getElementById('ghost').appendChild(el('use', {
      href: '#art-' + t.art, width: TILE + 8, height: TILE + 8, x: p.col * TILE - 4, y: p.row * TILE - 6, class: 'ghost',
    }));
  }
}

export function clearHover() { if (hoverTile) hoverTile.classList.remove('hover', 'bad'); clearGhost(); }
