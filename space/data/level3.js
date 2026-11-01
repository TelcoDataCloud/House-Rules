/* ===========================================================
   LEVEL 3: PLANET FALL  (down on the planet itself)

   Hendrix: the hardest one. Gunships, twin Haulers, and the
   Overlord at the end.
   =========================================================== */

export const LEVEL = {
  name: 'Planet Fall',
  world: 'ground',
  scroll: 80,
  length: 265,
  tough: 1.6,
  bulletSpeed: 1.2,
  shootMore: 1.45,
  grades: { S: 60000, A: 42000, B: 24000 },

  intro: {
    scene: 'dive',
    lines: ['Diving under the clouds...', 'TOUCHDOWN ZONE', 'LEVEL 3: PLANET FALL'],
  },

  waves: [
    { at: 1,   say: 'PLANET FALL' },

    { at: 3,   what: 'dart', count: 6, how: 'row' },
    { at: 7,   what: 'saucer', count: 5, how: 'row' },
    { at: 11,  what: 'diver', count: 3, how: 'one' },

    { at: 16,  say: 'ENEMY CAMP' },
    { at: 16,  base: 'camp' },
    { at: 22,  what: 'weaver', count: 6, how: 'left' },
    { at: 26,  what: 'dart', count: 6, how: 'right' },

    { at: 34,  what: 'gunship', count: 1, how: 'middle' },
    { at: 38,  what: 'saucer', count: 6, how: 'row' },
    { at: 46,  what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 52,  what: 'red', count: 5, how: 'v', from: 'right' },
    { at: 60,  what: 'diver', count: 4, how: 'one' },
    { at: 66,  what: 'dart', count: 8, how: 'row' },

    { at: 74,  base: 'camp' },
    { at: 80,  what: 'bruiser', count: 2, how: 'middle' },
    { at: 88,  what: 'weaver', count: 8, how: 'middle' },

    { at: 96,  say: 'MINI BOSS' },
    { at: 97,  boss: 'twins' },

    { at: 134, say: 'THE CITADEL' },
    { at: 134, base: 'citadel' },
    { at: 140, what: 'gunship', count: 1, how: 'middle' },
    { at: 148, what: 'saucer', count: 8, how: 'row' },
    { at: 154, what: 'dart', count: 8, how: 'left' },
    { at: 160, what: 'diver', count: 5, how: 'one' },
    { at: 168, what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 174, what: 'gunship', count: 2, how: 'middle' },
    { at: 182, what: 'weaver', count: 8, how: 'right' },

    { at: 192, what: 'dart', count: 8, how: 'row' },
    { at: 196, what: 'saucer', count: 8, how: 'row' },

    { at: 206, say: 'WARNING' },
    { at: 211, boss: 'overlord' },
  ],
};
