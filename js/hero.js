/* ===========================================================
   HERO - walking Hendrix round the house

   Tap a room and Hendrix works out the way there, then walks it.
   Rooms next to each other on the same floor are joined. The
   stairs, the cellar steps and the loft ladder join floors
   together (STAIRS in data/rooms.js says which rooms each one
   joins). So getting from your room to the cellar means: along
   the landing, down the stairs, through the ground floor to the
   utility, and down the cellar steps. Every step of it costs
   time off the clock.

   The camera follows him. When he gets there, the room opens and
   its hiding places wake up. You can only search the room you
   are actually standing in.

   How fast he walks, and where he starts, is in data/hero.js.
   =========================================================== */

import { ROOMS, STAIRS } from '../data/rooms.js';
import { HERO } from '../data/hero.js';
import { state } from './state.js';
import {
  heroLayer, zoomToRoom, followHero, startFollowing, isFollowing,
  setRoomClickHandler, setArrowHandler, sayInHud, roomAt, floorLine
} from './house.js';
import { drawHero } from './hero-art.js';

const NS = 'http://www.w3.org/2000/svg';

const me = {
  on: false,          // true during the scavenge
  x: 0, y: 0,         // where his feet are, on the house picture
  facing: 1,          // 1 is right, -1 is left
  path: [],           // the points he still has to walk to
  goal: null,         // the room he is walking to
  next: null,         // a room you tapped while he was still walking
  frame: null,        // the animation that moves him
  last: 0,
  node: null, face: null
};

function findRoom(id) {
  return ROOMS.find((room) => room.id === id);
}

/* The garage and the shed are on the ground floor, just outside. */
function level(room) {
  return room.floor === 'outside' ? 'ground' : room.floor;
}

/* Where he stands in a room: in the middle, on the floor. */
function standAt(roomId) {
  const room = findRoom(roomId);
  return { x: room.x + (room.stand ?? room.w / 2), y: floorLine(roomId) };
}

/* --- FINDING THE WAY ------------------------------------------
   Every room knows its neighbours: the rooms either side on the
   same floor, plus any stairs. To find the way, we spread out
   from where he is, one room at a time, until we reach the
   target. That always finds the shortest way in rooms. (It is
   called a breadth first search, if you ever want to look it up.)
   ------------------------------------------------------------ */

function neighbours(roomId) {
  const here = findRoom(roomId);
  const row = ROOMS.filter((r) => level(r) === level(here)).sort((a, b) => a.x - b.x);
  const i = row.indexOf(here);
  const out = [];
  if (row[i - 1]) out.push({ to: row[i - 1].id });
  if (row[i + 1]) out.push({ to: row[i + 1].id });
  STAIRS.forEach((stairs) => {
    if (!stairs.joins) return;
    const [bottom, top] = stairs.joins;
    if (bottom === roomId) out.push({ to: top, stairs, up: true });
    if (top === roomId) out.push({ to: bottom, stairs, up: false });
  });
  return out;
}

function findWay(from, to) {
  const came = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const room = queue.shift();
    if (room === to) break;
    neighbours(room).forEach((step) => {
      if (step.to in came) return;
      came[step.to] = { from: room, step };
      queue.push(step.to);
    });
  }
  if (!(to in came)) return null;
  const steps = [];
  for (let at = to; came[at]; at = came[at].from) steps.unshift(came[at].step);
  return steps;
}

/* Turn the list of rooms into points to walk to. Along a floor he
   just walks; for stairs he walks to the bottom (or top), climbs,
   and carries on from the other end. */
function stairEnds(stairs) {
  if (stairs.kind === 'ladder') {
    const mid = (stairs.left + stairs.right) / 2;
    return { low: { x: mid, y: stairs.bottom }, high: { x: mid, y: stairs.top } };
  }
  return { low: { x: stairs.left, y: stairs.bottom }, high: { x: stairs.right, y: stairs.top } };
}

function pointsFor(steps, goal) {
  const points = [];
  steps.forEach((step) => {
    if (!step.stairs) return;
    const ends = stairEnds(step.stairs);
    if (step.up) points.push(ends.low, ends.high);
    else points.push(ends.high, ends.low);
  });
  points.push(standAt(goal));
  return points;
}

/* --- DRAWING HIM --------------------------------------------- */

function draw() {
  me.node.setAttribute('transform', `translate(${me.x} ${me.y}) scale(${HERO.size})`);
  me.face.setAttribute('transform', `scale(${me.facing} 1)`);
}

function build() {
  const layer = heroLayer();
  layer.innerHTML = '';
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
}

export function walkTo(roomId) {
  if (!me.on || !findRoom(roomId)) return;
  if (state.walking) {                        // already on the way somewhere
    me.next = roomId;
    sayInHud('On the way', `Then the ${findRoom(roomId).name}.`);
    return;
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

export function startHero() {
  stopWalking();
  me.on = true;
  build();
  state.heroRoom = HERO.startRoom;
  state.walking = false;
  const spot = standAt(HERO.startRoom);
  me.x = spot.x; me.y = spot.y; me.facing = 1;
  draw();
  setRoomClickHandler(walkTo);
  setArrowHandler(arrow);
  startFollowing();
  zoomToRoom(HERO.startRoom);
}

/* Freeze where he is (time up). He stays on screen. */
export function stopWalking() {
  if (me.frame) cancelAnimationFrame(me.frame);
  me.frame = null;
  me.path = [];
  me.next = null;
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
