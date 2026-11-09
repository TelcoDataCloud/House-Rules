/* ===========================================================
   COST: what things cost, in planks, stone and carrots

   Planks build things. Carrots buy things (the gross traps,
   better weapons, and swaps at the market). Stone is for the
   strong stuff. Any thing in data/ can have any mix of the
   three: { planks: 2, carrots: 3 }.
   =========================================================== */

import { state } from './state.js';
import { icon } from './art.js';

const KINDS = [['planks', 'plank'], ['stone', 'stone'], ['carrots', 'carrot']];

export function costHTML(item, size = 16) {
  return KINDS.filter(([k]) => item[k]).map(([k, art]) => `${item[k]} ${icon(art, size)}`).join(' ');
}

// What is missing, or null if you can pay
export function missing(item) {
  for (const [k] of KINDS) if ((state[k] || 0) < (item[k] || 0)) return k;
  return null;
}

export function pay(item, times = 1) {
  KINDS.forEach(([k]) => { state[k] = (state[k] || 0) - (item[k] || 0) * times; });
}
