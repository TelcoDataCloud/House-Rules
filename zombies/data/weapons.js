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
   carrots   what it costs to buy (stone too, for the big ones)
   stone     stone it costs too
   sound     the noise it makes, a name from the sounds folder:
             'spoon', 'pan', 'chicken', 'mallet', 'bonk'
   =========================================================== */

export const WEAPONS = [
  { id: 'spoon',   name: 'Wooden spoon',   art: 'spoon',   stun: 3, knock: 1.8, reach: 1.4, armOff: 0.25, drop: 0.25, carrots: 0,  stone: 0, sound: 'spoon' },
  { id: 'pan',     name: 'Frying pan',     art: 'pan',     stun: 5, knock: 2.6, reach: 1.6, armOff: 0.45, drop: 0.3,  carrots: 15, stone: 0, sound: 'pan' },
  { id: 'chicken', name: 'Rubber chicken', art: 'rubberchicken', stun: 6, knock: 3.4, reach: 1.9, armOff: 0.65, drop: 0.35, carrots: 25, stone: 2, sound: 'chicken' },
  { id: 'mallet',  name: 'Giant mallet',   art: 'mallet',  stun: 8, knock: 4.6, reach: 2.3, armOff: 0.9,  drop: 0.45, carrots: 40, stone: 6, sound: 'mallet' },
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

// The market: swap carrots for planks in the day, as often as you like
export const MARKET = { give: { carrots: 5 }, get: { planks: 2 } };
