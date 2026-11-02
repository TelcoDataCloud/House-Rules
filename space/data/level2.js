/* ===========================================================
   LEVEL 2: INTO THE CLOUDS  (falling into the planet's sky)

   Hendrix: same as level1.js. A bit harder: enemies are
   tougher, shoot more, and there are more of them.
   =========================================================== */

export const LEVEL = {
  name: 'Into the Clouds',
  world: 'sky',
  scroll: 70,
  length: 250,
  tough: 1.3,
  // Easy only: seconds until a popped shield grows back on this level.
  shieldBack: 12,
  // Enemies get tougher as YOUR gun gets stronger. Each gun level
  // above 1 adds this much to their hits. Bosses get double.
  powerScale: 0.08,
  bulletSpeed: 1.1,
  shootMore: 1.25,
  grades: { S: 40000, A: 28000, B: 16000 },

  // The little film before this level starts.
  intro: {
    scene: 'atmosphere',
    lines: ['Next stop: the planet!', 'ENTERING THE ATMOSPHERE', 'LEVEL 2: INTO THE CLOUDS'],
  },

  waves: [
    { at: 1,   say: 'INTO THE CLOUDS' },

    { at: 3,   what: 'saucer', count: 4, how: 'row' },
    { at: 8,   what: 'dart', count: 6, how: 'row' },
    { at: 13,  what: 'weaver', count: 4, how: 'left' },
    { at: 15,  what: 'weaver', count: 4, how: 'right' },

    { at: 20,  say: 'CLOUD DOCK' },
    { at: 20,  base: 'skydock' },
    { at: 26,  what: 'saucer', count: 5, how: 'row' },
    { at: 32,  what: 'diver', count: 3, how: 'one' },

    { at: 42,  what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 50,  what: 'saucer', count: 6, how: 'row' },
    { at: 56,  what: 'weaver', count: 6, how: 'middle' },

    { at: 66,  what: 'bruiser', count: 1, how: 'middle' },
    { at: 70,  what: 'dart', count: 6, how: 'row' },
    { at: 76,  what: 'diver', count: 4, how: 'one' },
    { at: 86,  what: 'red', count: 5, how: 'v', from: 'right' },
    { at: 92,  what: 'saucer', count: 6, how: 'row' },

    { at: 100, say: 'MINI BOSS' },
    { at: 101, boss: 'hauler2' },

    { at: 134, say: 'CLOUD CITY' },
    { at: 134, base: 'cloudcity' },
    { at: 140, what: 'saucer', count: 5, how: 'row' },
    { at: 147, what: 'weaver', count: 6, how: 'left' },
    { at: 153, what: 'dart', count: 7, how: 'row' },
    { at: 159, what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 165, what: 'diver', count: 4, how: 'one' },
    { at: 173, what: 'bruiser', count: 2, how: 'middle' },

    { at: 185, what: 'saucer', count: 7, how: 'row' },
    { at: 189, what: 'weaver', count: 6, how: 'right' },
    { at: 193, what: 'dart', count: 8, how: 'row' },

    { at: 203, say: 'WARNING' },
    { at: 208, boss: 'fortress' },
  ],
};
