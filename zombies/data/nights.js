/* ===========================================================
   NIGHTS: what each night brings

   Hendrix: night 1 is the first block. The game uses the last
   block for every night after the list runs out, and adds
   hordeGrow from data/difficulty.js each night.

   side     where they come from: 'north', 'south', 'east', 'west'
            or 'all'
   extra    special zombies that always come (names from
            data/zombies.js)
   giant    true means Giant Gary comes (Hard: from night 3,
            Easy: from night 5, set in js/nights.js)
   =========================================================== */

export const NIGHTS = [
  { side: 'north', extra: [] },
  { side: 'east',  extra: ['hopper'] },
  { side: 'west',  extra: ['digger', 'hopper'] },
  { side: 'south', extra: ['digger', 'burplord'] },
  { side: 'all',   extra: ['hopper', 'hopper', 'digger', 'burplord'] },
];

// Easy: the giant comes from this night. Hard: from this one.
export const GIANT_FROM = { easy: 5, hard: 3 };

// The moon (Hard only). 8 nights round. 0 is new moon, 4 is full.
// "maybe" comes with the given chance (0.6 is 6 times in 10).
export const MOON = {
  full: { speed: 1.4, torch: 0.5, extra: ['werewolf'] },
  new:  { speed: 0.7, torch: 1.0, extra: [], maybe: ['vampire'], chance: 0.6 },
};
