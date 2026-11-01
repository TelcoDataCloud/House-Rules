/* ===========================================================
   WORLD: what is behind everything

   Each level says which world it is in (data/level1.js...):
     'space'   stars, a nebula and a far planet
     'sky'     a sunset sky with clouds rushing past
     'ground'  the red planet's ground sliding underneath
     'robot'   a huge metal robot city
     'magma'   deep inside the volcano, rivers of lava

   The painted backdrops are art/bg-*.svg. bg-far moves slowly,
   bg-near faster, bg-top fastest (on top of everything behind).

   The look of each world is in css/game.css. This file just
   says which world we are in, and slides the backdrop along.
   =========================================================== */

import { state, level } from './state.js';

const $ = (id) => document.getElementById(id);

export function applyWorld(name) {
  $('field').dataset.world = name;
}

// Slide a painted strip down. When it has moved one whole tile it
// jumps back, and because the tile repeats you can't see the jump.
const tiles = new Map();
function slide(el, y) {
  if (!tiles.has(el) || tiles.get(el).world !== $('field').dataset.world) {
    tiles.set(el, { world: $('field').dataset.world, size: parseFloat(getComputedStyle(el).getPropertyValue('--tile')) || 1440 });
  }
  const tile = tiles.get(el).size;
  el.style.transform = `translateY(${((y % tile) - tile * 2).toFixed(1)}px)`;
}

let far = 0;
let near = 0;

export function drawWorld(dt, playing) {
  const speed = playing ? (level() ? level().scroll : 60) : 30;
  far += dt * speed * 0.5;
  near += dt * speed * 1.5;
  const world = $('field').dataset.world || 'space';
  // Ground worlds move at exactly the scroll speed, like the bases on them.
  const ground = (state.time || 0) * speed;
  const pos = {
    space: [far * 0.25, near * 0.9, 0],
    sky: [far * 0.35, 0, 0],
    ground: [ground, 0, 0],
    robot: [ground, 0, 0],
    magma: [ground, ground * 1.6, near * 2.2],
  }[world] || [0, 0, 0];
  ['bg-far', 'bg-near', 'bg-top'].forEach((id, i) => slide($(id), pos[i]));
  if (world === 'space') {
    // The far planet drifts down very slowly, so it feels far away.
    $('planet').style.transform = `translateY(${((state.time || 0) * 1.3).toFixed(1)}px)`;
    slide($('stars-far'), far * 0.6);
    slide($('stars-near'), near);
  } else if (world === 'sky') {
    slide($('clouds-far'), far);
    slide($('clouds-near'), near * 1.4);
  }
}
