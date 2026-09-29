/* ===========================================================
   LOOT - the good stuff, sitting in the house

   Puts every bit of loot from data/burglars.js into its room when
   the game starts. At night a burglar can take one (it vanishes
   from the room). Restart puts everything back.

   Who has what lives in state.taken, like { telly: 'bruno' }.
   =========================================================== */

import { LOOT } from '../data/burglars.js';
import { placeInRoom } from './house.js';
import { drawLoot } from './loot-art.js';
import { state } from './state.js';

const nodes = {};

export function setupLoot() {
  LOOT.forEach((loot) => {
    const at = placeInRoom(loot.room, loot.x, loot.lift);
    if (!at) return;
    at.setAttribute('class', 'loot-item');
    at.dataset.loot = loot.id;
    drawLoot(loot, at);
    nodes[loot.id] = at;
  });
}

/* The loot in a room that nobody has taken yet. */
export function lootIn(roomId) {
  return LOOT.filter((loot) => loot.room === roomId && !state.taken[loot.id]);
}

export function takeLoot(lootId, burglarId) {
  state.taken[lootId] = burglarId;
  if (nodes[lootId]) nodes[lootId].classList.add('is-taken');
}

/* Everything back where it was. */
export function resetLoot() {
  state.taken = {};
  Object.values(nodes).forEach((node) => node.classList.remove('is-taken'));
}
