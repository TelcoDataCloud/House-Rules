/* ===========================================================
   WEAPONS: what the hero whacks with

   Hendrix: the hero starts with the first one. Each morning you
   can buy the next one with the button at the top. Change the
   numbers and see what happens. A mallet that stuns for 60
   seconds? Try it.

   stun      seconds a whacked zombie sees stars
   knock     how many squares the zombie flies back
   reach     how far the swing reaches, in squares
   armOff    how likely an arm flies off (0 never, 1 every time)
   drop      how likely a whacked zombie drops a carrot, plank or sock
   planks    what it costs to buy
   stone     stone it costs too
   sound     'bonk', 'bong' (a pan), 'squeak', 'thud'
   =========================================================== */

export const WEAPONS = [
  { id: 'spoon',   name: 'Wooden spoon',   art: 'spoon',   stun: 3, knock: 1.8, reach: 1.4, armOff: 0.25, drop: 0.25, planks: 0,  stone: 0, sound: 'bonk' },
  { id: 'pan',     name: 'Frying pan',     art: 'pan',     stun: 5, knock: 2.6, reach: 1.6, armOff: 0.45, drop: 0.3,  planks: 12, stone: 0, sound: 'bong' },
  { id: 'chicken', name: 'Rubber chicken', art: 'rubberchicken', stun: 6, knock: 3.4, reach: 1.9, armOff: 0.65, drop: 0.35, planks: 18, stone: 2, sound: 'squeak' },
  { id: 'mallet',  name: 'Giant mallet',   art: 'mallet',  stun: 8, knock: 4.6, reach: 2.3, armOff: 0.9,  drop: 0.45, planks: 28, stone: 6, sound: 'thud' },
];

// The super whack: hold the whack button (or Space) and let go.
// It spins round and hits everyone within reach x SPIN_REACH.
export const SPIN_HOLD = 0.6;     // seconds to hold
export const SPIN_REACH = 1.7;
export const SPIN_COOLDOWN = 3;   // seconds before the next one

// Hit a few zombies quickly for a combo. At COMBO_SUPER the next
// whack knocks twice as far.
export const COMBO_TIME = 2;      // seconds between hits to keep it going
export const COMBO_SUPER = 5;

// What a whacked zombie can drop, and what picking it up gives you
export const LOOT = [
  { art: 'carrot', gives: 'carrots', amount: 1, chance: 0.55 },
  { art: 'plank',  gives: 'planks',  amount: 2, chance: 0.35 },
  { art: 'sock',   gives: 'socks',   amount: 1, chance: 0.10 },
];
