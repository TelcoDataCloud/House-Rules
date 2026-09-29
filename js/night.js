/* ===========================================================
   NIGHT - phase 4: they come in

   You are up in the attic with the security monitors. Sid and
   Bruno let themselves in and walk their routes from
   data/burglars.js, one stop at a time:

     wait   ->  walk to the next stop  ->  stop, say something,
     take any loot  ->  walk to the next stop  ->  ...  ->  walk
     back out the way they came

   On the way they walk straight past your traps. In M6 nothing
   happens when they do. That is M7's job. For now the spot just
   flashes and the monitors tell you what you missed.

   Everything here runs on one night clock (run.t, in seconds).
   The Faster button just makes that clock tick faster, so the
   walking, the stopping and the talking all speed up together.
   =========================================================== */

import { state, setPhase } from './state.js';
import { BURGLARS, LOOT } from '../data/burglars.js';
import { ROOMS, ANCHORS, PICTURE } from '../data/rooms.js';
import { TRAPS, UPGRADES } from '../data/recipes.js';
import {
  heroLayer, roomAt, floorLine, followHero, startFollowing, stopFollowing, isFollowing,
  showWholeHouse, zoomToRoom, setRoomClickHandler, sayInHud, sayUnderHouse, pingAnchor
} from './house.js';
import { findRoom, level, findWay, pointsFor } from './paths.js';
import { drawBurglar, HEIGHT } from './burglar-art.js';
import { drawHero, pyjamaPattern } from './hero-art.js';
import { lootIn, takeLoot, resetLoot } from './loot.js';
import { sfx } from './audio.js';

const NS = 'http://www.w3.org/2000/svg';
const FAST = 2.5;                  // how much faster Faster is

const ui = {};
const run = {
  on: false, frame: null, last: 0, t: 0,
  crew: [], watch: null, fast: false, over: false
};

function make(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  return node;
}

/* 'your Flour Bomb', and 'your Doorbell' rather than 'your The Doorbell' */
function trapName(id) {
  const trap = [...TRAPS, ...UPGRADES].find((t) => t.id === id);
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

function log(words, who) {
  const li = document.createElement('li');
  if (who) {
    const name = document.createElement('strong');
    name.textContent = `${who}: `;
    li.append(name, document.createTextNode(`"${words}"`));
    li.className = 'night-line is-talk';
  } else {
    li.textContent = words;
    li.className = 'night-line';
  }
  ui.log.append(li);
  ui.log.scrollTop = ui.log.scrollHeight;
  sayUnderHouse(li.textContent);         // the newest line also goes right under the house
}

function showHaul() {
  const parts = run.crew
    .filter((b) => b.info.carrying.length)
    .map((b) => `${b.data.name} has ${listOf(b.info.carrying)}.`);
  ui.haul.textContent = parts.length ? parts.join(' ') : 'Nothing taken. Yet.';
}

/* ['the telly', 'the laptop', 'the guitar'] -> 'the telly, the laptop and the guitar' */
function listOf(things) {
  if (things.length < 2) return things.join('');
  return `${things.slice(0, -1).join(', ')} and ${things[things.length - 1]}`;
}

/* --- DRAWING THEM -------------------------------------------- */

function drawHendrix(layer) {
  const defs = make('defs');
  pyjamaPattern(defs, 'pat-pyjamas');
  layer.append(defs);
  const attic = findRoom('attic');
  if (!attic) return;
  const g = make('g', { class: 'hero', transform: `translate(${attic.x + 92} ${floorLine('attic')})` });
  drawHero(g);
  layer.append(g);
}

/* Three groups again: where he is, which way he faces (only this
   one flips, so his speech bubble does not come out backwards),
   and the drawing. */
function drawOne(b, layer) {
  b.node = make('g', { class: `burglar burglar-${b.data.look}`, 'data-burglar': b.data.id });
  b.face = make('g');
  const body = make('g', { class: 'burglar-body' });
  b.bag = drawBurglar(body, b.data.look);
  b.face.append(body);
  b.bubble = make('g', { class: 'bubble', hidden: '' });
  b.node.append(b.face, b.bubble);
  layer.append(b.node);
}

function place(b) {
  b.node.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
  b.face.setAttribute('transform', `scale(${b.facing} 1)`);
  b.node.classList.toggle('is-walking', b.status === 'walking' || b.status === 'leaving');
  if (!b.bubble.hasAttribute('hidden')) keepBubbleInside(b);
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

function headFor(b, roomId, out = false) {
  const steps = findWay(b.info.room, roomId) || [];
  b.path = pointsFor(steps, roomId, nudge(b));
  if (out) b.path[b.path.length - 1] = { x: b.edgeX, y: floorLine(roomId) };
  b.status = out ? 'leaving' : 'walking';
}

function nextStop(b) {
  b.stop += 1;
  const stop = b.data.route[b.stop];
  if (stop && findRoom(stop.room)) {
    headFor(b, stop.room);
  } else {
    say(b, b.data.leaving);
    headFor(b, b.edge.id, true);
  }
}

function arrive(b) {
  if (b.status === 'leaving') {
    b.status = 'gone';
    b.info.gone = true;
    b.node.setAttribute('hidden', '');
    const bag = b.info.carrying.length ? `with ${listOf(b.info.carrying)}` : 'with nothing';
    log(`${b.data.name} is gone, ${bag}.`);
    return;
  }
  const stop = b.data.route[b.stop];
  b.status = 'stopped';
  b.until = run.t + (b.data.pause || 2);
  const loot = lootIn(stop.room);
  /* the other one got here first and took it all */
  const beaten = !loot.length && b.data.tooLate &&
    LOOT.some((l) => l.room === stop.room && state.taken[l.id] && state.taken[l.id] !== b.data.id);
  say(b, beaten ? b.data.tooLate : stop.says);
  if (loot.length) {
    loot.forEach((thing) => {
      takeLoot(thing.id, b.data.id);
      b.info.carrying.push(thing.name);
    });
    b.bag.setAttribute('transform', `scale(${Math.min(2.4, 1 + b.info.carrying.length * 0.35)})`);
    b.grabAt = run.t + 1.2;
    b.until += 1.4;
    log(`${b.data.name} takes ${listOf(loot.map((l) => l.name))}.`);
    sfx.grab();
    showHaul();
  }
}

/* Did he just walk past a spot with a trap on it? */
function checkTraps(b) {
  Object.entries(state.rigged).forEach(([anchorId, trapId]) => {
    if (b.passed.has(anchorId)) return;
    const a = ANCHORS.find((one) => one.id === anchorId);
    if (!a) return;
    const below = b.y - a.y;
    if (Math.abs(b.x - a.x) < 18 && below > -12 && below < 145) {
      b.passed.add(anchorId);
      pingAnchor(anchorId);
      log(`${b.data.name} walks right past your ${trapName(trapId)}. Nothing happens.`);
    }
  });
}

/* --- EVERY FRAME --------------------------------------------- */

function walk(b, dt) {
  let left = b.data.speed * dt;
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
  if (!b.path.length) arrive(b);
}

function tick(now) {
  const dt = Math.min(0.05, (now - run.last) / 1000) * (run.fast ? FAST : 1);
  run.last = now;
  run.t += dt;

  run.crew.forEach((b) => {
    if (b.status === 'waiting' && run.t >= b.until) {
      log(b.data.comesIn === 'right'
        ? `${b.data.name} is coming round the back.`
        : `${b.data.name} is at the front door.`);
      sfx.creak();
      nextStop(b);
    } else if (b.status === 'walking' || b.status === 'leaving') {
      walk(b, dt);
    } else if (b.status === 'stopped') {
      if (b.grabAt && run.t >= b.grabAt) { b.grabAt = 0; say(b, b.data.grabs); }
      if (run.t >= b.until) nextStop(b);
    }
    if (b.bubbleUntil && run.t >= b.bubbleUntil) {
      b.bubbleUntil = 0;
      b.bubble.setAttribute('hidden', '');
    }
    if (b.node) place(b);
  });

  follow();

  if (run.crew.every((b) => b.status === 'gone')) {
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
  if (!b || b.status === 'gone') { setWatch(null); return; }
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

function finish() {
  run.frame = null;
  run.over = true;
  const taken = run.crew.flatMap((b) => b.info.carrying);
  ui.endText.textContent = taken.length
    ? `They got away with ${listOf(taken)}.`
    : 'They left with nothing. Lucky.';
  ui.end.hidden = false;
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ui.end.scrollIntoView({ block: 'nearest', behavior: still ? 'auto' : 'smooth' });
  sfx.timeUp();
}

export function setupNight(els) {
  Object.assign(ui, els);
  ui.fast.addEventListener('click', () => {
    run.fast = !run.fast;
    ui.fast.setAttribute('aria-pressed', String(run.fast));
    sfx.toggle();
  });
  ui.again.addEventListener('click', () => { sfx.start(); startBreakIn(); });
  ui.move.addEventListener('click', () => setPhase('rig'));
}

export function startBreakIn() {
  stopBreakIn();
  run.on = true;
  run.t = 0;
  run.over = false;
  ui.panel.hidden = false;
  ui.end.hidden = true;
  ui.log.innerHTML = '';
  ui.fast.setAttribute('aria-pressed', String(run.fast));

  const layer = heroLayer();
  layer.innerHTML = '';
  drawHendrix(layer);

  run.crew = BURGLARS.map((data, i) => {
    const edge = edgeRoom(data.comesIn);
    const b = {
      data, i, edge,
      edgeX: data.comesIn === 'right' ? PICTURE.w + 40 : -40,
      facing: data.comesIn === 'right' ? -1 : 1,
      path: [], stop: -1, status: 'waiting', until: data.waitsFirst || 0,
      passed: new Set(), bubbleUntil: 0, grabAt: 0,
      info: { id: data.id, name: data.name, room: edge.id, carrying: [], gone: false }
    };
    b.x = b.edgeX;
    b.y = floorLine(edge.id);
    drawOne(b, layer);
    place(b);
    return b;
  });
  state.burglars = run.crew.map((b) => b.info);

  buildCams();
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
  run.frame = null;
  run.on = false;
  run.watch = null;
  run.crew = [];
  state.burglars = [];
  if (ui.panel) ui.panel.hidden = true;
  setRoomClickHandler(null);
  stopFollowing();
  const layer = heroLayer();
  if (layer) layer.innerHTML = '';
  resetLoot();
}
