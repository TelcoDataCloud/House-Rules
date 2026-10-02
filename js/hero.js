/* ===========================================================
   HERO - walking Hendrix round the house

   Tap a room and Hendrix works out the way there, then walks
   it. (js/paths.js does the working out. The burglars use it
   too.) Getting from your room to the cellar means: along the
   landing, down the stairs, through the ground floor to the
   utility, and down the cellar steps. Every step of it costs
   time off the clock.

   The camera follows him. When he gets there, the room opens and
   its hiding places wake up. You can only search the room you
   are actually standing in.

   A locked room (the shed, the dark cellar) stops him at the door:
   he walks to the room next to it and js/scavenge.js shows its
   puzzle.

   How fast he walks, and where he starts, is in data/hero.js.
   =========================================================== */

import { ROOMS } from '../data/rooms.js';
import { HERO } from '../data/hero.js';
import { state } from './state.js';
import {
  heroLayer, zoomToRoom, followHero, startFollowing, isFollowing,
  setRoomClickHandler, setArrowHandler, sayInHud, roomAt
} from './house.js';
import { findRoom, level, standAt, neighbours, findWay, pointsFor } from './paths.js';
import { drawHero, pyjamaPattern } from './hero-art.js';

const NS = 'http://www.w3.org/2000/svg';

/* Who says a room is locked, and what to do at its door.
   js/scavenge.js sets it: { blocked(roomId), onBlocked(roomId) } */
let gate = null;
export function setGate(g) { gate = g; }

const me = {
  on: false,          // true during the scavenge
  x: 0, y: 0,         // where his feet are, on the house picture
  facing: 1,          // 1 is right, -1 is left
  path: [],           // the points he still has to walk to
  goal: null,         // the room he is walking to
  next: null,         // a room you tapped while he was still walking
  then: null,         // a locked room he is standing outside of
  frame: null,        // the animation that moves him
  last: 0,
  node: null, face: null
};

/* --- DRAWING HIM --------------------------------------------- */

function draw() {
  me.node.setAttribute('transform', `translate(${me.x} ${me.y}) scale(${HERO.size})`);
  me.face.setAttribute('transform', `scale(${me.facing} 1)`);
}

function build() {
  const layer = heroLayer();
  layer.innerHTML = '';
  /* his pyjama stripes, made once, right next to him */
  const defs = document.createElementNS(NS, 'defs');
  pyjamaPattern(defs, 'pat-pyjamas');
  layer.append(defs);
  /* Three groups, one inside the other: where he is, which way he
     faces, and the bob as he walks. The outer two are moved by
     this file, the inner one by css/hero.css. */
  me.node = document.createElementNS(NS, 'g');
  me.node.setAttribute('class', 'hero');
  me.face = document.createElementNS(NS, 'g');
  const bob = document.createElementNS(NS, 'g');
  bob.setAttribute('class', 'hero-bob');
  drawHero(bob);
  me.face.append(bob);
  me.node.append(me.face);
  layer.append(me.node);
}

/* --- WALKING ------------------------------------------------- */

function step(now) {
  const seconds = Math.min(0.05, (now - me.last) / 1000);
  me.last = now;
  let left = HERO.walkSpeed * seconds;        // how far he can go this frame

  while (left > 0 && me.path.length) {
    const to = me.path[0];
    const dx = to.x - me.x;
    const dy = to.y - me.y;
    const far = Math.hypot(dx, dy);
    if (Math.abs(dx) > 0.5) me.facing = dx > 0 ? 1 : -1;
    if (far <= left) {
      me.x = to.x; me.y = to.y;
      left -= far;
      me.path.shift();
    } else {
      me.x += (dx / far) * left;
      me.y += (dy / far) * left;
      left = 0;
    }
  }

  draw();
  const here = roomAt(me.x, me.y);
  if (here) state.heroRoom = here;
  followHero(me.x, me.y, state.heroRoom);

  if (me.path.length) me.frame = requestAnimationFrame(step);
  else arrive();
}

function arrive() {
  me.frame = null;
  state.heroRoom = me.goal;
  state.walking = false;
  me.node.classList.remove('is-walking');
  if (me.next && me.next !== me.goal) {
    const again = me.next;
    me.next = null;
    walkTo(again);
    return;
  }
  me.next = null;
  if (isFollowing()) zoomToRoom(me.goal);
  if (me.then && gate) {
    const locked = me.then;
    me.then = null;
    gate.onBlocked(locked);
  }
}

export function walkTo(roomId) {
  if (!me.on || !findRoom(roomId)) return;
  if (state.walking) {                        // already on the way somewhere
    me.next = roomId;
    sayInHud('On the way', `Then the ${findRoom(roomId).name}.`);
    return;
  }
  me.then = null;
  /* locked? walk to the room next to it instead, then try the lock */
  if (gate && gate.blocked(roomId)) {
    const way = findWay(state.heroRoom, roomId);
    if (!way) return;
    const door = way.length > 1 ? way[way.length - 2].to : state.heroRoom;
    if (door === state.heroRoom) { zoomToRoom(door); gate.onBlocked(roomId); return; }
    me.then = roomId;
    roomId = door;
  }
  if (roomId === state.heroRoom) {            // already there, just look
    zoomToRoom(roomId);
    return;
  }
  const steps = findWay(state.heroRoom, roomId);
  if (!steps) return;
  me.goal = roomId;
  me.path = pointsFor(steps, roomId);
  state.walking = true;
  me.node.classList.add('is-walking');
  startFollowing();
  sayInHud('Walking', `To the ${findRoom(roomId).name}.`);
  me.last = performance.now();
  me.frame = requestAnimationFrame(step);
}

/* Arrow keys: left and right along the floor, up and down only
   where there are stairs. */
function arrow(dir) {
  /* from where he is, or where he is already heading */
  const room = findRoom(state.walking ? (me.next || me.goal) : state.heroRoom);
  let target = null;
  if (dir === 'left' || dir === 'right') {
    const row = ROOMS.filter((r) => level(r) === level(room)).sort((a, b) => a.x - b.x);
    target = row[row.indexOf(room) + (dir === 'right' ? 1 : -1)];
  } else {
    const way = neighbours(room.id).find((n) => n.stairs && n.up === (dir === 'up'));
    if (way) target = findRoom(way.to);
    else sayInHud(room.name, dir === 'up' ? 'No way up from here.' : 'No way down from here.');
  }
  if (target) walkTo(target.id);
}

/* --- START AND STOP ------------------------------------------ */

/* Put him in the house: in his room at the start of the night,
   or back where he was when he went to the workbench. */
export function startHero(room = HERO.startRoom) {
  stopWalking();
  me.on = true;
  build();
  state.heroRoom = room;
  state.walking = false;
  const spot = standAt(room);
  me.x = spot.x; me.y = spot.y; me.facing = 1;
  draw();
  setRoomClickHandler(walkTo);
  setArrowHandler(arrow);
  startFollowing();
  zoomToRoom(room);
}

/* Where his feet are, on the house picture. */
export function heroSpot() {
  return { x: me.x, y: me.y };
}

/* Freeze where he is (time up). He stays on screen. */
export function stopWalking() {
  if (me.frame) cancelAnimationFrame(me.frame);
  me.frame = null;
  me.path = [];
  me.next = null;
  me.then = null;
  state.walking = false;
  if (me.node) me.node.classList.remove('is-walking');
}

/* Take him out of the house altogether. */
export function hideHero() {
  stopWalking();
  me.on = false;
  setRoomClickHandler(null);
  setArrowHandler(null);
  const layer = heroLayer();
  if (layer) layer.innerHTML = '';
  me.node = null;
}
