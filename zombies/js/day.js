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
import { POCKETS, POCKETS_HARD } from '../data/villagers.js';
import { placeThing, removeThing, thingAt, pointToTile, isEdge, el, buildable, nearRock } from './grid.js';
import { buildBar, drawCounts, drawDay, drawSun, lookoutSay, helpSay, banner, flashCount } from './hud.js';
import { wakeUp, placeAtWork, draw as drawVillager, setJob, assignBeds, assignHomes, drawHomes } from './villagers.js';
import { chatLine, highFive, buyHat, hatsFor, rename, morningRequests, builtNear, startFolkDay, updateFolkDay } from './folk.js';
import { icon } from './art.js';
import { JOBS } from '../data/villagers.js';
import { startWork, updateWork, retask, joinWork } from './work.js';
import { tonight, cure } from './zombies.js';
import { nextWeapon } from './combat.js';
import { burst } from './fx.js';
import { say, blip, voiceFor } from './voice.js';
import { mend, fixTrap } from './hard.js';
import { saveGame } from './save.js';
import { costHTML, missing, pay } from './cost.js';
import { MARKET } from '../data/weapons.js';
import { landLine, checkTips } from './tips.js';
let tipClock = 0, saveClock = 0;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
let plan = null;
let hoverTile = null;
let onNightHandler = null;
let raf = 0;
let last = 0;
let picking = null;   // the villager whose job picker is open

const DAY_HELP = 'Pick a thing, click a square. Tap a villager to chat, change their job or buy them a hat.';

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

  const stillBroken = state.night > 1 && !loaded ? mend() : 0;   // a saved day was already mended
  wakeUp();
  assignBeds();
  if (loaded && state.resumeTrips) {
    // carry on the day where it was saved
    state.villagers.forEach((v) => { v.task = null; v.busy = 0; });
    state.tripsTotal = state.tripsDone + state.villagers.reduce((n, v) => n + (v.trips || 0), 0);
  } else startWork();
  state.resumeTrips = false;
  closePicker();
  if (!loaded) morningRequests();
  startFolkDay();
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
  drawSun(state.tripsTotal ? state.tripsDone / state.tripsTotal : 0);
  drawCounts();
  const pockets = state.mode === 'hard' ? POCKETS_HARD : POCKETS;
  if (state.night === 1 && !loaded) helpSay(LINES.start.replace('{planks}', pockets.planks).replace('{carrots}', pockets.carrots).replace('{potion}', pockets.potion) + ' ' + DAY_HELP);
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
  updateFolkDay(dt);
  saveClock += dt;
  if (saveClock > 8) { saveClock = 0; saveGame(); }   // keep the day's work if the page reloads
  tipClock += dt;
  if (tipClock > 2) { tipClock = 0; checkTips(); }
  raf = requestAnimationFrame(dayTick);
}

export function stopDay() { cancelAnimationFrame(raf); closePicker(); }

// The market: swap carrots for planks
export function swapCarrots() {
  if (missing(MARKET.give)) { flashCount('carrots'); helpSay(`You need ${costHTML(MARKET.give)} to swap. Farmers grow carrots.`); blip('nope', { volume: 0.5 }); return; }
  pay(MARKET.give);
  pay(MARKET.get, -1);
  helpSay(`Swapped ${costHTML(MARKET.give)} for ${costHTML(MARKET.get)}.`);
  blip('coin');
  flashCount('planks');
  drawCounts();
}

// Buy the next weapon
export function buyWeapon() {
  const next = nextWeapon();
  if (!next) return;
  const short = missing(next);
  if (short) { flashCount(short); helpSay(`The ${next.name} needs ${costHTML(next)}.` + (short === 'stone' ? ' Build a mine.' : short === 'carrots' ? ' Farmers grow carrots.' : '')); return; }
  pay(next);
  state.weapon = (state.weapon || 0) + 1;
  helpSay(`<b>${next.name}!</b> Stuns for ${next.stun} seconds and whacks them ${next.knock} squares.`);
  say(next.name);
  blip('upgrade');
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
  blip('nope', { volume: 0.5 });
  if (which) flashCount(which);
}

// Tap a villager: they say something, and you can change their
// job, give them a high five, buy them a hat or give them a name.
function openPicker(v, ev) {
  closePicker();
  picking = v;
  const line = chatLine(v);
  say(line, true, voiceFor(v.name));
  const box = document.createElement('div');
  box.className = 'job-picker';
  const jobs = ['farmer', 'builder', 'brewer', 'miner'].filter((j) => j !== 'miner' || [...state.things.values()].some((t) => t.does === 'mine'));
  box.innerHTML = `<p><b>${v.name}</b> the ${(JOBS[v.job] || { name: v.job }).name.toLowerCase()}</p>` +
    `<p class="says">${line}</p>` +
    (JOBS[v.job] && JOBS[v.job].does ? `<p class="small">${JOBS[v.job].does}</p>` : '') +
    `<div class="row">${jobs.map((j) => `<button type="button" data-job="${j}" ${v.job === j ? 'aria-pressed="true"' : ''}>${JOBS[j].name}</button>`).join('')}</div>` +
    '<button type="button" data-do="five">High five!</button>' +
    `<p class="small">Hats, paid in odd socks (you have ${state.socks || 0}):</p>` +
    `<div class="row hats">${hatsFor().map((h) => `<button type="button" data-hat="${h.id}" aria-label="${h.name}, ${h.socks} socks" ${v.wear === h.id ? 'aria-pressed="true"' : ''} ${(state.socks || 0) < h.socks ? 'class="cannot"' : ''}>${icon(h.id, 30)}<span>${h.socks}</span></button>`).join('')}</div>` +
    `<form class="row name-form"><label class="sr-only" for="vname">New name</label><input id="vname" maxlength="10" placeholder="New name" autocomplete="off"><button type="submit">Name</button></form>` +
    '<button type="button" class="quiet" data-do="close">Close</button>';
  box.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.type === 'submit') return;
    if (b.dataset.job) {
      if (b.dataset.job === 'brewer' && ![...state.things.values()].some((t) => t.does === 'brewery')) { helpSay('No brewery to cook in.'); return; }
      setJob(v, b.dataset.job);
      retask(v);
      helpSay(`<b>${v.name}</b> is a ${JOBS[v.job].name.toLowerCase()} now. ${JOBS[v.job].does || ''}`);
      saveGame();
    } else if (b.dataset.do === 'five') {
      highFive(v);
    } else if (b.dataset.hat) {
      if (!buyHat(v, b.dataset.hat)) return;
      saveGame();
    }
    closePicker();
    drawCounts();
  });
  box.querySelector('.name-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (rename(v, box.querySelector('#vname').value)) { drawHomes(); saveGame(); closePicker(); }
  });
  const stage = document.getElementById('stage');
  stage.appendChild(box);
  const r = stage.getBoundingClientRect();
  const bw = box.offsetWidth || 250, bh = box.offsetHeight || 300;
  box.style.left = Math.min(r.width - bw - 4, Math.max(4, ev.clientX - r.left - bw / 2)) + 'px';
  box.style.top = Math.min(Math.max(4, r.height - bh - 4), Math.max(4, ev.clientY - r.top - bh / 2)) + 'px';
}

export function closePicker() {
  document.querySelectorAll('.job-picker').forEach((e) => e.remove());
  picking = null;
}

export function dayClick(ev) {
  const p = pointToTile(ev);
  if (picking) closePicker();   // and carry on: the tap still counts
  // a villager under the pointer? (when you are building on an empty
  // square, the building wins, so a villager standing near never eats the tap)
  const v = state.villagers.find((x) => x.job !== 'crew' && Math.abs(x.x - p.x) < 0.6 && p.y > x.y - 1.1 && p.y < x.y + 0.3);
  const building = state.picked && !thingAt(p.col, p.row) && buildable(p.col, p.row);
  if (v && !building) { openPicker(v, ev); return; }
  const here = thingAt(p.col, p.row);
  // cure a zombie in a pit
  if (here && here.does === 'pit' && here.held.length) {
    if (state.potion <= 0) { cannot(p, 'No potion', 'potion'); say(LINES.noPotion); return; }
    state.potion--;
    const before = state.villagers.length;
    cure(here.held[0]);
    // the new villager gets a home and starts work today, not tomorrow
    if (state.villagers.length > before) { rehome(); joinWork(state.villagers[state.villagers.length - 1]); }
    drawCounts();
    return;
  }
  // mend a broken trap for a plank
  if (here && here.broken) {
    if (state.planks < 1) { cannot(p, 'Need a plank', 'planks'); return; }
    state.planks--;
    fixTrap(here);
    burst(p.col + 0.5, p.row, 'mended');
    blip('build');
    drawCounts();
    return;
  }
  // take something back (not the last bed, the village needs it)
  if (here && TRAPS[here.kind] && !here.held.length) {
    if (here.kind === 'bed' && [...state.things.values()].filter((t) => t.does === 'bed').length <= 1) { cannot(p, 'Keep one cottage'); return; }
    state.villagers.filter((v) => v.crewOf === here).forEach((c) => { c.job = c.oldJob || 'farmer'; c.crewOf = null; placeAtWork(c); drawVillager(c); });
    pay(TRAPS[here.kind], -1);   // you get it all back
    removeThing(p.col, p.row);
    burst(p.col + 0.5, p.row + 0.5, 'back');
    rehome();
    drawCounts();
    return;
  }
  if (!state.picked) { const line = landLine(p.col, p.row); helpSay(line); say(line); return; }
  const t = TRAPS[state.picked];
  if (here) { cannot(p, 'Something is already here'); return; }
  if (!buildable(p.col, p.row)) { const line = landLine(p.col, p.row); cannot(p, 'Not here'); helpSay('You cannot build here. ' + line); return; }
  if (t.nearRock && !nearRock(p.col, p.row)) { cannot(p, 'Next to the boulders'); return; }
  const short = missing(t);
  if (short) { cannot(p, 'Need ' + short, short); return; }
  if (t.needsJob && !state.villagers.some((v) => v.job === t.needsJob)) { cannot(p, 'Needs a ' + t.needsJob); return; }
  const crew = [];
  if (t.crew) {
    const free = state.villagers.filter((v) => v.job !== 'crew' && v.job !== 'brewer');
    if (free.length < t.crew) { cannot(p, `Need ${t.crew} villagers`, 'villagers'); return; }
    crew.push(...free.slice(0, t.crew));
  }
  pay(t);
  const thing = placeThing(state.picked, p.col, p.row);
  crew.forEach((c, i) => {
    c.oldJob = c.job; c.job = 'crew'; c.crewOf = thing; thing.crewMember = c;
    c.x = p.col + 0.2 + i * 0.6; c.y = p.row - 0.4; drawVillager(c);
  });
  blip('build');
  rehome();
  builtNear(thing);
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
