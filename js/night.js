/* ===========================================================
   NIGHT - phase 4: they come in

   You are up in the attic with the security monitors. Sid and
   Bruno let themselves in and walk their routes from
   data/burglars.js, one stop at a time:

     wait  ->  walk to the next stop  ->  stop, say something,
     take any loot  ->  walk to the next stop  ->  ...  ->  walk
     back out the way they came

   THE TRAPS
   Walk past a spot with a trap on it and the trap goes off
   (once, on whoever gets there first). js/fx.js plays the
   slapstick. Then his nerve drops by the trap's nerve number,
   times two if it is a kind he hates, times a half if it is a
   kind he shrugs off. A trap with two kinds uses whichever
   hurts him more. That is the whole sum:

       nerve lost = trap nerve  x  2, 1 or a half

   When his nerve runs out he panics, drops everything he is
   carrying, and runs for the nearest way out. Traps leave a
   running burglar alone. He has had enough.

   THE NEIGHBOURS
   LOUD traps wake the street. Enough noise and the police get
   called (the numbers are in data/difficulty.js). When they
   arrive, anybody still in the house gets arrested.

   Everything runs on one night clock (run.t, in seconds). The
   Faster button makes that clock tick faster.
   =========================================================== */

import { state, setPhase } from './state.js';
import { BURGLARS, LOOT } from '../data/burglars.js';
import { NEIGHBOURS } from '../data/difficulty.js';
import { ROOMS, ANCHORS, PICTURE } from '../data/rooms.js';
import { TRAPS, UPGRADES } from '../data/recipes.js';
import {
  heroLayer, roomAt, floorLine, followHero, startFollowing, stopFollowing, isFollowing,
  showWholeHouse, zoomToRoom, setRoomClickHandler, sayInHud, sayUnderHouse, showTrapOnAnchor
} from './house.js';
import { findRoom, level, findWay, pointsFor } from './paths.js';
import { drawBurglar, HEIGHT } from './burglar-art.js';
import { drawHero, pyjamaPattern } from './hero-art.js';
import { lootIn, takeLoot, dropLoot, resetLoot } from './loot.js';
import { playFx, policeLights, sign, lessMotion } from './fx.js';
import { sfx } from './audio.js';

const NS = 'http://www.w3.org/2000/svg';
const FAST = 2.5;                  // how much faster Faster is
const RUN = 1.9;                   // how much faster a panicking burglar runs

const ui = {};
const run = {
  on: false, frame: null, last: 0, t: 0,
  crew: [], watch: null, fast: false, over: false,
  fxLayer: null, hero: null,
  gen: 0,                          // which night this is, so old timers know to stop
  police: null,                    // null, or the night time they arrive
  policeHere: false,
  timers: []
};

function make(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  return node;
}

/* setTimeout that gets cancelled if the night is stopped. */
function after(ms, fn) {
  run.timers.push(setTimeout(fn, ms));
}

function pick(list) {
  if (!list || !list.length) return '';
  return Array.isArray(list) ? list[Math.floor(Math.random() * list.length)] : list;
}

function findTrap(id) {
  return [...TRAPS, ...UPGRADES].find((t) => t.id === id);
}

/* 'your Flour Bomb', and 'your Doorbell' rather than 'your The Doorbell' */
function trapName(trap) {
  return trap ? trap.name.replace(/^The /, '') : 'trap';
}

/* The ground floor rooms at each end of the house. A burglar who
   comes in from the left starts by the first one, from the right
   by the last one (the shed). */
function edgeRoom(side) {
  const row = ROOMS.filter((r) => level(r) === 'ground').sort((a, b) => a.x - b.x);
  return side === 'right' ? row[row.length - 1] : row[0];
}

/* --- THE MONITOR LOG ----------------------------------------- */

function log(words, who, kind = '') {
  const li = document.createElement('li');
  if (who) {
    const name = document.createElement('strong');
    name.textContent = `${who}: `;
    li.append(name, document.createTextNode(`"${words}"`));
    li.className = 'night-line is-talk';
  } else {
    li.textContent = words;
    li.className = `night-line ${kind}`;
  }
  ui.log.append(li);
  ui.log.scrollTop = ui.log.scrollHeight;
  sayUnderHouse(li.textContent);         // the newest line also goes right under the house
}

function showHaul() {
  const parts = run.crew
    .filter((b) => b.info.carrying.length)
    .map((b) => `${b.data.name} has ${listOf(b.info.carrying.map((l) => l.name))}.`);
  ui.haul.textContent = parts.length ? parts.join(' ') : 'Nothing taken. Yet.';
}

/* ['the telly', 'the laptop', 'the guitar'] -> 'the telly, the laptop and the guitar' */
export function listOf(things) {
  if (things.length < 2) return things.join('');
  return `${things.slice(0, -1).join(', ')} and ${things[things.length - 1]}`;
}

/* --- THE METERS ---------------------------------------------- */

/* Words instead of numbers, so you work out who is tough by
   watching, not by reading. */
function mood(b) {
  const left = Math.max(0, b.info.nerve) / b.data.nerve;
  if (b.info.status === 'arrested') return 'Arrested';
  if (b.info.status === 'fled') return 'Ran away';
  if (b.info.status === 'escaped') return 'Got away';
  if (left <= 0) return 'Running for it';
  if (left < 0.35) return 'Shaking';
  if (left < 0.7) return 'Twitchy';
  return 'Calm';
}

function buildMeters() {
  ui.meters.innerHTML = '';
  run.crew.forEach((b) => {
    const row = document.createElement('div');
    row.className = 'meter';
    const label = document.createElement('span');
    label.className = 'meter-name';
    label.textContent = `${b.data.name}'s nerve`;
    const bar = document.createElement('span');
    bar.className = `meter-bar meter-${b.data.look}`;
    bar.setAttribute('role', 'meter');
    bar.setAttribute('aria-label', `${b.data.name}'s nerve`);
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    const fill = document.createElement('span');
    fill.className = 'meter-fill';
    bar.append(fill);
    const word = document.createElement('span');
    word.className = 'meter-word';
    row.append(label, bar, word);
    ui.meters.append(row);
    b.meter = { bar, fill, word };
  });

  const row = document.createElement('div');
  row.className = 'meter meter-noise';
  const label = document.createElement('span');
  label.className = 'meter-name';
  label.textContent = 'Neighbours noticed';
  const bar = document.createElement('span');
  bar.className = 'meter-bar';
  bar.setAttribute('role', 'meter');
  bar.setAttribute('aria-label', 'How much the neighbours have noticed');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  const fill = document.createElement('span');
  fill.className = 'meter-fill';
  bar.append(fill);
  const word = document.createElement('span');
  word.className = 'meter-word';
  row.append(label, bar, word);
  ui.meters.append(row);
  run.noiseMeter = { bar, fill, word };
  drawMeters();
}

function drawMeters() {
  run.crew.forEach((b) => {
    const pct = Math.round((Math.max(0, b.info.nerve) / b.data.nerve) * 100);
    b.meter.fill.style.width = `${pct}%`;
    b.meter.bar.setAttribute('aria-valuenow', String(pct));
    b.meter.bar.setAttribute('aria-valuetext', mood(b));
    b.meter.word.textContent = mood(b);
  });
  const pct = Math.min(100, Math.round((state.noticed / NEIGHBOURS.callPoliceAt) * 100));
  const words = run.policeHere ? 'Police are here' : run.police !== null ? 'Police on the way'
    : pct >= 50 ? 'Curtains twitching' : pct > 0 ? 'A light went on' : 'Fast asleep';
  run.noiseMeter.fill.style.width = `${pct}%`;
  run.noiseMeter.bar.setAttribute('aria-valuenow', String(pct));
  run.noiseMeter.bar.setAttribute('aria-valuetext', words);
  run.noiseMeter.word.textContent = words;
}

/* --- DRAWING THEM -------------------------------------------- */

function drawHendrix(layer) {
  const defs = make('defs');
  pyjamaPattern(defs, 'pat-pyjamas');
  layer.append(defs);
  const attic = findRoom('attic');
  if (!attic) return;
  const at = make('g', { class: 'hero', transform: `translate(${attic.x + 92} ${floorLine('attic')})` });
  const hop = make('g', { class: 'hero-cheer' });
  drawHero(hop);
  at.append(hop);
  layer.append(at);
  run.hero = hop;
}

/* Four groups, one inside the other: where he is, which way he
   faces, the slapstick (css/fx.css moves this one), and the
   drawing (which bobs as he walks). His speech bubble sits
   outside the flip so the words never come out backwards. */
function drawOne(b, layer) {
  b.node = make('g', { class: `burglar burglar-${b.data.look}`, 'data-burglar': b.data.id });
  b.face = make('g');
  b.fxg = make('g', { class: 'burglar-fx' });
  b.body = make('g', { class: 'burglar-body' });
  b.bag = drawBurglar(b.body, b.data.look);
  b.fxg.append(b.body);
  b.face.append(b.fxg);
  b.bubble = make('g', { class: 'bubble', hidden: '' });
  b.node.append(b.face, b.bubble);
  layer.append(b.node);
}

function place(b) {
  b.node.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
  b.face.setAttribute('transform', `scale(${b.facing} 1)`);
  const moving = ['walking', 'leaving', 'fleeing'].includes(b.info.status);
  b.node.classList.toggle('is-walking', moving);
  b.node.classList.toggle('is-fleeing', b.info.status === 'fleeing');
  if (!b.bubble.hasAttribute('hidden')) keepBubbleInside(b);
}

function growSack(b) {
  b.bag.setAttribute('transform', `scale(${Math.min(2.4, 1 + b.info.carrying.length * 0.35)})`);
}

/* --- SPEECH BUBBLES ------------------------------------------ */

/* Chop words into lines of about 22 letters. */
function wrap(words, width = 22) {
  const lines = [''];
  words.split(' ').forEach((word) => {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + word).length > width) lines.push(word);
    else lines[lines.length - 1] = last ? `${last} ${word}` : word;
  });
  return lines;
}

function say(b, words) {
  if (!words) return;
  const lines = wrap(words);
  const w = Math.max(...lines.map((l) => l.length)) * 5.1 + 14;
  const h = lines.length * 11 + 8;
  const top = -(HEIGHT[b.data.look] || 80) - 10 - h;
  b.bubble.innerHTML = '';
  const inner = make('g', { class: 'bubble-at' });
  inner.append(make('rect', { x: -w / 2, y: top, width: w, height: h, rx: 6, class: 'bubble-back' }));
  inner.append(make('path', { d: `M-4 ${top + h - 1} L2 ${top + h + 8} L5 ${top + h - 1} Z`, class: 'bubble-tail' }));
  const text = make('text', { x: 0, y: top + 13, class: 'bubble-text', 'text-anchor': 'middle' });
  lines.forEach((line, i) => {
    const span = make('tspan', { x: 0, dy: i ? 11 : 0 });
    span.textContent = line;
    text.append(span);
  });
  inner.append(text);
  b.bubble.append(inner);
  b.bubble.removeAttribute('hidden');
  b.bubbleW = w;
  b.bubbleUntil = run.t + Math.max(2.4, words.length * 0.07);
  keepBubbleInside(b);
  log(words, b.data.name);
}

/* Slide the bubble sideways so it never hangs off the picture. */
function keepBubbleInside(b) {
  const half = b.bubbleW / 2;
  const shift = Math.min(0, PICTURE.w - 4 - (b.x + half)) + Math.max(0, 4 - (b.x - half));
  b.bubble.firstChild.setAttribute('transform', `translate(${shift.toFixed(1)} 0)`);
}

/* --- WHERE THEY GO NEXT -------------------------------------- */

/* Two burglars in one room stand a little apart. */
function nudge(b) {
  return b.i === 0 ? -14 : 14;
}

function headFor(b, roomId, status = 'walking') {
  const steps = findWay(b.info.room, roomId) || [];
  b.path = pointsFor(steps, roomId, nudge(b));
  b.info.status = status;
}

/* Out of the house: to the edge room, then off the picture. */
function headOut(b, side, status) {
  const edge = edgeRoom(side);
  headFor(b, edge.id, status);
  b.path[b.path.length - 1] = { x: side === 'right' ? PICTURE.w + 40 : -40, y: floorLine(edge.id) };
  b.exitSide = side;
}

function nextStop(b) {
  b.stop += 1;
  const stop = b.data.route[b.stop];
  if (stop && findRoom(stop.room)) {
    headFor(b, stop.room);
  } else {
    say(b, b.data.leaving);
    headOut(b, b.data.comesIn, 'leaving');
  }
}

function arrive(b) {
  if (b.info.status === 'leaving' || b.info.status === 'fleeing') {
    b.info.status = b.info.status === 'fleeing' ? 'fled' : 'escaped';
    b.node.setAttribute('hidden', '');
    const bag = b.info.carrying.length ? `with ${listOf(b.info.carrying.map((l) => l.name))}` : 'with nothing';
    log(b.info.status === 'fled'
      ? `${b.data.name} has run off into the night, ${bag}.`
      : `${b.data.name} is gone, ${bag}.`, null, b.info.carrying.length ? 'is-bad' : 'is-good');
    drawMeters();
    return;
  }
  const stop = b.data.route[b.stop];
  b.info.status = 'stopped';
  b.until = run.t + (b.data.pause || 2);
  const loot = lootIn(stop.room);
  /* the other one got here first and took it all */
  const beaten = !loot.length && b.data.tooLate &&
    LOOT.some((l) => l.room === stop.room && state.taken[l.id] && state.taken[l.id] !== b.data.id);
  say(b, beaten ? b.data.tooLate : stop.says);
  if (loot.length) {
    loot.forEach((thing) => {
      takeLoot(thing.id, b.data.id);
      b.info.carrying.push(thing);
    });
    growSack(b);
    b.grabAt = run.t + 1.2;
    b.until += 1.4;
    log(`${b.data.name} takes ${listOf(loot.map((l) => l.name))}.`, null, 'is-bad');
    sfx.grab();
    showHaul();
  }
}

/* --- TRAPS GOING OFF ----------------------------------------- */

/* How much a trap knocks off this burglar's nerve, and whether it
   was a kind he hates (2), shrugs off (0.5), or neither (1). */
function hurt(trap, data) {
  const times = trap.cat.map((c) => {
    if ((data.weakTo || []).includes(c)) return 2;
    if ((data.shrugsOff || []).includes(c)) return 0.5;
    return 1;
  });
  const most = Math.max(...times);
  return { amount: trap.nerve * most, times: most };
}

function checkTraps(b) {
  if (b.info.status !== 'walking' && b.info.status !== 'leaving') return;
  for (const [anchorId, trapId] of Object.entries(state.rigged)) {
    const a = ANCHORS.find((one) => one.id === anchorId);
    if (!a) continue;
    const below = b.y - a.y;
    if (Math.abs(b.x - a.x) < 18 && below > -12 && below < 145) {
      fire(b, a, findTrap(trapId));
      return;
    }
  }
}

function fire(b, anchor, trap) {
  delete state.rigged[anchor.id];
  showTrapOnAnchor(anchor.id, null);
  if (!trap) return;
  const before = b.info.status;
  b.info.status = 'hit';
  b.resume = before;
  const { amount, times } = hurt(trap, b.data);
  const record = { trap: trap.id, name: trap.name, anchor: anchor.id, who: b.data.id, amount, times };
  state.fired.push(record);
  log(`${b.data.name} sets off your ${trapName(trap)}!`, null, 'is-good');

  const gen = run.gen;
  const length = playFx({
    trap, b, anchor, layer: run.fxLayer,
    onImpact: () => {
      if (!run.on || gen !== run.gen) return;
      b.info.nerve -= amount;
      if (trap.mess && !b.info.mess.includes(trap.mess)) b.info.mess.push(trap.mess);
      cheer();
      sfx.yelp();
      say(b, times === 2 ? pick(b.data.hates) : times < 1 ? pick(b.data.meh) : pick(b.data.ouch));
      log(times === 2 ? `${b.data.name} HATED that.` : times < 1 ? `${b.data.name} barely noticed.` : `${b.data.name} did not like that.`, null, 'is-note');
      if (trap.cat.includes('LOUD')) makeNoise(trap.nerve);
      drawMeters();
    }
  });
  b.hitUntil = performance.now() + length;
}

/* Hendrix does a little jump up in the attic. */
function cheer() {
  if (!run.hero) return;
  run.hero.classList.remove('is-cheering');
  void run.hero.getBBox();
  run.hero.classList.add('is-cheering');
}

/* After the slapstick: carry on, or panic and run. */
function recover(b) {
  if (b.info.nerve > 0) {
    b.info.status = b.resume;
    return;
  }
  panic(b);
}

function panic(b) {
  sfx.panic();
  say(b, b.data.panic);
  if (b.info.carrying.length) {
    b.info.carrying.forEach((thing) => dropLoot(thing.id));
    log(`${b.data.name} drops ${listOf(b.info.carrying.map((l) => l.name))} and runs!`, null, 'is-good');
    b.info.carrying = [];
    growSack(b);
    showHaul();
  } else {
    log(`${b.data.name} has had enough. He runs!`, null, 'is-good');
  }
  /* the nearest way out: left or right side of the picture */
  const side = b.x < PICTURE.w * 0.55 ? 'left' : 'right';
  headOut(b, side, 'fleeing');
  drawMeters();
}

/* --- THE NEIGHBOURS AND THE POLICE --------------------------- */

function makeNoise(amount) {
  state.noticed += amount;
  if (run.police === null && state.noticed >= NEIGHBOURS.callPoliceAt) {
    run.police = run.t + NEIGHBOURS.policeTake;
    log('A neighbour has called the police! They are on the way.', null, 'is-good');
    sfx.siren();
  }
}

function policeArrive() {
  run.policeHere = true;
  sfx.siren();
  policeLights(run.fxLayer, lessMotion() ? 1500 : 4000);
  log('The police are here!', null, 'is-good');
  run.crew.forEach((b) => {
    const s = b.info.status;
    if (s === 'fled' || s === 'escaped') return;
    if (s === 'waiting') {
      b.info.status = 'escaped';
      log(`${b.data.name} sees the blue lights and never comes in.`, null, 'is-note');
      return;
    }
    b.info.status = 'arrested';
    b.path = [];
    b.info.carrying.forEach((thing) => dropLoot(thing.id));
    b.info.carrying = [];
    growSack(b);
    say(b, b.data.caught);
    sign(run.fxLayer, b.x, b.y - (HEIGHT[b.data.look] || 80) - 6, 'BUSTED!', 2600);
    log(`${b.data.name} is arrested.`, null, 'is-good');
    after(2600, () => { if (b.node) b.node.setAttribute('hidden', ''); });
  });
  showHaul();
  drawMeters();
}

/* --- EVERY FRAME --------------------------------------------- */

function walk(b, dt) {
  const speed = b.data.speed * (b.info.status === 'fleeing' ? RUN : 1);
  let left = speed * dt;
  while (left > 0 && b.path.length) {
    const to = b.path[0];
    const dx = to.x - b.x;
    const dy = to.y - b.y;
    const far = Math.hypot(dx, dy);
    if (Math.abs(dx) > 0.5) b.facing = dx > 0 ? 1 : -1;
    if (far <= left) {
      b.x = to.x; b.y = to.y;
      left -= far;
      b.path.shift();
    } else {
      b.x += (dx / far) * left;
      b.y += (dy / far) * left;
      left = 0;
    }
  }
  const here = roomAt(b.x, b.y);
  if (here && here !== b.info.room) {
    b.info.room = here;
    if (run.watch === b.data.id) sayInHud(`Watching ${b.data.name}`, `In the ${findRoom(here).name}.`);
  }
  checkTraps(b);
  if (b.info.status !== 'hit' && !b.path.length) arrive(b);
}

function tick(now) {
  const dt = Math.min(0.05, (now - run.last) / 1000) * (run.fast ? FAST : 1);
  run.last = now;
  run.t += dt;

  run.crew.forEach((b) => {
    const s = b.info.status;
    if (s === 'waiting' && run.t >= b.until) {
      log(b.data.comesIn === 'right'
        ? `${b.data.name} is coming round the back.`
        : `${b.data.name} is at the front door.`);
      sfx.creak();
      nextStop(b);
    } else if (s === 'walking' || s === 'leaving' || s === 'fleeing') {
      walk(b, dt);
    } else if (s === 'stopped') {
      if (b.grabAt && run.t >= b.grabAt) { b.grabAt = 0; say(b, b.data.grabs); }
      if (run.t >= b.until) nextStop(b);
    } else if (s === 'hit') {
      if (now >= b.hitUntil) recover(b);
    }
    if (b.bubbleUntil && run.t >= b.bubbleUntil) {
      b.bubbleUntil = 0;
      b.bubble.setAttribute('hidden', '');
    }
    if (b.node) place(b);
  });

  if (run.police !== null && !run.policeHere && run.t >= run.police) policeArrive();

  follow();

  const done = (b) => ['fled', 'escaped', 'arrested'].includes(b.info.status);
  if (run.crew.every(done)) {
    finish();
    return;
  }
  run.frame = requestAnimationFrame(tick);
}

/* --- THE MONITORS: who you are watching ----------------------- */

function follow() {
  if (!run.watch) return;
  if (!isFollowing()) { setWatch(null, false); return; }   // you pressed Whole house or Escape
  const b = run.crew.find((one) => one.data.id === run.watch);
  if (!b || ['fled', 'escaped', 'arrested'].includes(b.info.status)) { setWatch(null); return; }
  followHero(b.x, b.y, b.info.room);
}

function setWatch(id, move = true) {
  run.watch = id;
  ui.cams.querySelectorAll('button').forEach((btn) => {
    btn.setAttribute('aria-pressed', String((btn.dataset.watch || null) === id));
  });
  if (!move) return;
  if (id) {
    const b = run.crew.find((one) => one.data.id === id);
    startFollowing();
    sayInHud(`Watching ${b.data.name}`, `In the ${findRoom(b.info.room).name}.`);
  } else {
    stopFollowing();
    showWholeHouse();
  }
}

function buildCams() {
  ui.cams.innerHTML = '';
  const add = (label, id) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-quiet night-cam';
    btn.textContent = label;
    btn.dataset.watch = id || '';
    btn.addEventListener('click', () => { sfx.toggle(); setWatch(id); });
    ui.cams.append(btn);
  };
  add('Whole house', null);
  BURGLARS.forEach((data) => add(`Follow ${data.name}`, data.id));
}

/* --- START AND STOP ------------------------------------------ */

/* Everything the result screen (js/result.js) needs to know. */
function finish() {
  run.frame = null;
  run.over = true;
  state.night = {
    burglars: run.crew.map((b) => ({
      id: b.data.id, name: b.data.name, look: b.data.look,
      status: b.info.status, carrying: b.info.carrying.map((l) => l.name),
      nerveLeft: Math.max(0, b.info.nerve), nerve: b.data.nerve, mess: [...b.info.mess]
    })),
    fired: [...state.fired],
    unfired: Object.values(state.rigged).length,
    noticed: state.noticed,
    police: run.policeHere
  };
  log('The night is over.', null, 'is-note');
  after(lessMotion() ? 400 : 1800, () => setPhase('result'));
}

export function setupNight(els) {
  Object.assign(ui, els);
  ui.fast.addEventListener('click', () => {
    run.fast = !run.fast;
    ui.fast.setAttribute('aria-pressed', String(run.fast));
    sfx.toggle();
  });
}

export function startBreakIn() {
  stopBreakIn();
  run.gen += 1;
  run.on = true;
  run.t = 0;
  run.over = false;
  run.police = null;
  run.policeHere = false;
  state.fired = [];
  state.noticed = 0;
  ui.panel.hidden = false;
  ui.log.innerHTML = '';
  ui.fast.setAttribute('aria-pressed', String(run.fast));

  const layer = heroLayer();
  layer.innerHTML = '';
  drawHendrix(layer);

  run.crew = BURGLARS.map((data, i) => {
    const edge = edgeRoom(data.comesIn);
    const b = {
      data, i, edge,
      facing: data.comesIn === 'right' ? -1 : 1,
      path: [], stop: -1, until: data.waitsFirst || 0,
      bubbleUntil: 0, grabAt: 0, hitUntil: 0, messCount: i * 10,
      info: {
        id: data.id, name: data.name, room: edge.id, status: 'waiting',
        nerve: data.nerve, carrying: [], mess: []
      }
    };
    b.x = data.comesIn === 'right' ? PICTURE.w + 40 : -40;
    b.y = floorLine(edge.id);
    drawOne(b, layer);
    place(b);
    return b;
  });
  state.burglars = run.crew.map((b) => b.info);

  /* the slapstick goes on top of everybody */
  run.fxLayer = make('g', { class: 'fx-layer' });
  layer.append(run.fxLayer);

  buildCams();
  buildMeters();
  setRoomClickHandler((roomId) => {           // tap a room to look at it on its own
    setWatch(null, false);
    stopFollowing();
    zoomToRoom(roomId);
  }, 'Tap a room to watch it.');
  setWatch(null);
  log('The monitors flicker on. Here they come.');
  showHaul();

  run.last = performance.now();
  run.frame = requestAnimationFrame(tick);
}

/* Stop everything, take them out of the house, put the loot back. */
export function stopBreakIn() {
  if (run.frame) cancelAnimationFrame(run.frame);
  run.timers.forEach((t) => clearTimeout(t));
  run.timers = [];
  run.frame = null;
  run.on = false;
  run.watch = null;
  run.crew = [];
  run.hero = null;
  state.burglars = [];
  if (ui.panel) ui.panel.hidden = true;
  setRoomClickHandler(null);
  stopFollowing();
  const layer = heroLayer();
  if (layer) layer.innerHTML = '';
  resetLoot();
}
