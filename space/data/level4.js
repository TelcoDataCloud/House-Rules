/* ===========================================================
   LEVEL 4: ROBOT BASE  (a whole planet of machines)

   Hendrix: robot tanks drive along the ground and aim at you.
   Spider robots walk and drop mines. Stay away from mines!
   The Crusher is the mini boss. Goliath, the walking robot,
   is waiting at the end.
   =========================================================== */

export const LEVEL = {
  name: 'Robot Base',
  world: 'robot',
  scroll: 85,
  length: 270,
  tough: 1.8,
  // Easy only: seconds until a popped shield grows back on this level.
  shieldBack: 40,
  // Enemies get tougher as YOUR gun gets stronger. Each gun level
  // above 1 adds this much to their hits. Bosses get double.
  powerScale: 0.2,
  bulletSpeed: 1.25,
  shootMore: 1.6,
  grades: { S: 85000, A: 60000, B: 35000 },

  intro: {
    scene: 'factory',
    lines: ['Something is down there...', 'A CITY OF ROBOTS', 'LEVEL 4: ROBOT BASE'],
  },

  waves: [
    { at: 1,   say: 'ROBOT BASE' },

    { at: 3,   what: 'tank', count: 2, how: 'row' },
    { at: 6,   what: 'dart', count: 6, how: 'row' },
    { at: 10,  what: 'spider', count: 2, how: 'middle' },
    { at: 14,  what: 'saucer', count: 5, how: 'row' },

    { at: 20,  say: 'ROBOT FACTORY' },
    { at: 20,  base: 'factory' },
    { at: 24,  what: 'tank', count: 3, how: 'row' },
    { at: 30,  what: 'weaver', count: 6, how: 'left' },
    { at: 36,  what: 'spider', count: 3, how: 'row' },
    { at: 42,  what: 'bruiser', count: 1, how: 'middle' },
    { at: 48,  what: 'dart', count: 8, how: 'right' },
    { at: 54,  what: 'tank', count: 2, how: 'row' },
    { at: 58,  what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 64,  what: 'red', count: 5, how: 'v', from: 'right' },
    { at: 70,  what: 'gunship', count: 1, how: 'middle' },
    { at: 76,  what: 'spider', count: 4, how: 'row' },
    { at: 82,  what: 'diver', count: 4, how: 'one' },

    { at: 92,  say: 'MINI BOSS' },
    { at: 93,  boss: 'crusher' },

    { at: 134, what: 'tank', count: 3, how: 'row' },
    { at: 138, what: 'saucer', count: 8, how: 'row' },
    { at: 144, say: 'THE ASSEMBLY LINE' },
    { at: 144, base: 'factory' },
    { at: 150, what: 'spider', count: 4, how: 'row' },
    { at: 156, what: 'gunship', count: 2, how: 'middle' },
    { at: 164, what: 'tank', count: 4, how: 'row' },
    { at: 170, what: 'weaver', count: 8, how: 'middle' },
    { at: 178, what: 'bruiser', count: 2, how: 'middle' },
    { at: 186, what: 'dart', count: 10, how: 'row' },
    { at: 192, what: 'spider', count: 3, how: 'row' },
    { at: 198, what: 'tank', count: 3, how: 'row' },

    { at: 206, say: 'WARNING' },
    { at: 211, boss: 'goliath' },
  ],
};
