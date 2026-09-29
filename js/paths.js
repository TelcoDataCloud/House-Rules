/* ===========================================================
   PATHS - how anybody finds their way round the house

   Hendrix and both burglars use this same file. Give it two
   rooms and it hands back the points to walk through to get
   from one to the other: along the floor, up or down the
   stairs, along the next floor.

   Rooms next to each other on the same floor are joined. The
   stairs, the cellar steps and the loft ladder join floors
   together (STAIRS in data/rooms.js says which rooms each one
   joins). The garage and the shed count as the ground floor,
   just outside.

   To find the way, we spread out from where you are, one room
   at a time, until we reach the target. That always finds the
   shortest way in rooms. (It is called a breadth first search,
   if you ever want to look it up.)
   =========================================================== */

import { ROOMS, STAIRS } from '../data/rooms.js';
import { floorLine } from './house.js';

export function findRoom(id) {
  return ROOMS.find((room) => room.id === id);
}

export function level(room) {
  return room.floor === 'outside' ? 'ground' : room.floor;
}

/* Where somebody stands in a room: in the middle, on the floor.
   nudge moves them left or right a bit, so two people in one
   room do not stand inside each other. */
export function standAt(roomId, nudge = 0) {
  const room = findRoom(roomId);
  return { x: room.x + (room.stand ?? room.w / 2) + nudge, y: floorLine(roomId) };
}

/* The rooms you can walk to straight from this one. */
export function neighbours(roomId) {
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

/* Every step from one room to another, or null if there is no way. */
export function findWay(from, to) {
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

/* The two ends of a staircase or a ladder. */
function stairEnds(stairs) {
  if (stairs.kind === 'ladder') {
    const mid = (stairs.left + stairs.right) / 2;
    return { low: { x: mid, y: stairs.bottom }, high: { x: mid, y: stairs.top } };
  }
  return { low: { x: stairs.left, y: stairs.bottom }, high: { x: stairs.right, y: stairs.top } };
}

/* Turn the list of steps into points to walk to. Along a floor you
   just walk; for stairs you walk to the bottom (or top), climb,
   and carry on from the other end. The last point is where you
   stand in the room you wanted. */
export function pointsFor(steps, goal, nudge = 0) {
  const points = [];
  steps.forEach((step) => {
    if (!step.stairs) return;
    const ends = stairEnds(step.stairs);
    if (step.up) points.push(ends.low, ends.high);
    else points.push(ends.high, ends.low);
  });
  points.push(standAt(goal, nudge));
  return points;
}
