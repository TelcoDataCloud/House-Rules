/* ===========================================================
   WORLD: what is behind everything

   Each level says which world it is in (data/level1.js...):
     'space'   stars, a nebula and a far planet
     'sky'     a sunset sky with clouds rushing past
     'ground'  the red planet's ground sliding underneath

   The look of each world is in css/game.css. This file just
   says which world we are in, and slides the backdrop along.
   =========================================================== */

import { state, level } from './state.js';

const $ = (id) => document.getElementById(id);

export function applyWorld(name) {
  $('field').dataset.world = name;
}

let far = 0;
let near = 0;

export function drawWorld(dt, playing) {
  const speed = playing ? (level() ? level().scroll : 60) : 30;
  far += dt * speed * 0.5;
  near += dt * speed * 1.5;
  const world = $('field').dataset.world || 'space';
  if (world === 'space') {
    // The far planet drifts down very slowly, so it feels far away.
    $('planet').style.transform = `translateY(${((state.time || 0) * 1.3).toFixed(1)}px)`;
    $('stars-far').style.backgroundPosition = `0 ${(far * 0.6).toFixed(1)}px`;
    $('stars-near').style.backgroundPosition = `0 ${near.toFixed(1)}px`;
  } else if (world === 'sky') {
    $('clouds-far').style.backgroundPosition = `0 ${far.toFixed(1)}px`;
    $('clouds-near').style.backgroundPosition = `0 ${(near * 1.4).toFixed(1)}px`;
  } else {
    // The ground moves at exactly the scroll speed, like the bases on it.
    $('terrain').style.backgroundPosition = `0 ${((state.time || 0) * speed).toFixed(1)}px`;
  }
}
