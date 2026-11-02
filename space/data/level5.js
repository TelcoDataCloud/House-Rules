/* ===========================================================
   LEVEL 5: MAGMA CORE  (deep inside the volcano)

   Hendrix: the last level! Fire drones fire rockets: shoot
   them before they speed up. Inferno is the mini boss.
   Then OMEGA, the biggest robot of all. Shoot its guns and its
   legs off... and get ready, because then it FLIES.
   =========================================================== */

export const LEVEL = {
  name: 'Magma Core',
  world: 'magma',
  scroll: 90,
  length: 280,
  tough: 2.0,
  // Easy only: seconds until a popped shield grows back on this level.
  shieldBack: null,
  // Enemies get tougher as YOUR gun gets stronger. Each gun level
  // above 1 adds this much to their hits. Bosses get double.
  powerScale: 0.24,
  bulletSpeed: 1.3,
  shootMore: 1.75,
  grades: { S: 110000, A: 80000, B: 45000 },

  intro: {
    scene: 'crater',
    lines: ['The robots came from the volcano...', 'DOWN INTO THE FIRE', 'LEVEL 5: MAGMA CORE'],
  },

  // The film after the final boss: the volcano blows and you escape.
  ending: {
    scene: 'finale',
    length: 16,
    lines: ['OMEGA IS DOWN!', 'The volcano is blowing up...', 'GO GO GO!', 'You made it out!', 'THE GALAXY IS SAFE', 'Made by Hendrix and Dad'],
  },

  waves: [
    { at: 1,   say: 'MAGMA CORE' },

    { at: 3,   what: 'firedrone', count: 4, how: 'row' },
    { at: 8,   what: 'tank', count: 2, how: 'row' },
    { at: 12,  what: 'dart', count: 8, how: 'row' },
    { at: 16,  what: 'spider', count: 3, how: 'row' },

    { at: 22,  say: 'THE FORGE' },
    { at: 22,  base: 'forge' },
    { at: 26,  what: 'firedrone', count: 5, how: 'left' },
    { at: 32,  what: 'gunship', count: 1, how: 'middle' },
    { at: 38,  what: 'tank', count: 3, how: 'row' },
    { at: 44,  what: 'weaver', count: 8, how: 'right' },
    { at: 50,  what: 'bruiser', count: 2, how: 'middle' },
    { at: 56,  what: 'red', count: 6, how: 'v', from: 'left' },
    { at: 62,  what: 'firedrone', count: 6, how: 'row' },
    { at: 68,  what: 'spider', count: 4, how: 'row' },
    { at: 74,  what: 'saucer', count: 8, how: 'row' },
    { at: 80,  what: 'diver', count: 5, how: 'one' },

    { at: 90,  say: 'MINI BOSS' },
    { at: 91,  boss: 'inferno' },

    { at: 134, what: 'firedrone', count: 6, how: 'row' },
    { at: 140, say: 'THE DEEP FORGE' },
    { at: 140, base: 'forge' },
    { at: 146, what: 'gunship', count: 2, how: 'middle' },
    { at: 154, what: 'tank', count: 4, how: 'row' },
    { at: 160, what: 'red', count: 6, how: 'v', from: 'right' },
    { at: 166, what: 'firedrone', count: 6, how: 'left' },
    { at: 172, what: 'spider', count: 4, how: 'row' },
    { at: 178, what: 'bruiser', count: 2, how: 'middle' },
    { at: 186, what: 'dart', count: 10, how: 'row' },
    { at: 192, what: 'firedrone', count: 6, how: 'right' },
    { at: 198, what: 'saucer', count: 8, how: 'row' },

    { at: 206, say: 'WARNING' },
    { at: 208, say: 'FINAL BOSS' },
    { at: 212, boss: 'omega' },
  ],
};
