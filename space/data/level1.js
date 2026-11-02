/* ===========================================================
   LEVEL 1: MOONFALL  (out in space, over floating moon rocks)

   Hendrix: this list IS the level. The game reads it from the
   top. Each line happens at a time in seconds.

     at     when it happens (60 is one minute)
     say    big words on the screen
     what   an enemy from enemies.js
     count  how many
     how    where they come from:
              'row'    side by side across the top
              'left'   follow the leader down the left
              'right'  follow the leader down the right
              'middle' down the middle
              'one'    one at a time
              'v'      a V shape (for the red flock)
     from   for the V: 'left' or 'right'
     base   a star base from bases.js
     boss   a boss from bosses.js

   Add a wave: copy a line, change the time. That's it!
   =========================================================== */

export const LEVEL = {
  name: 'Moonfall',
  world: 'space',     // space, sky or ground
  scroll: 60,         // how fast the ground slides past
  length: 240,        // seconds. The boss gives up after this.
  tough: 1,           // enemies take this many times more hits
  // Easy only: seconds until a popped shield grows back on this level.
  shieldBack: 10,
  // Enemies get tougher as YOUR gun gets stronger. Each gun level
  // above 1 adds this much to their hits. Bosses get double.
  powerScale: 0.05,
  bulletSpeed: 1,     // enemy bullets this many times faster
  shootMore: 1,       // enemies shoot this many times more often
  grades: { S: 24000, A: 16000, B: 9000 },   // points for each grade

  waves: [
    { at: 1,   say: 'MOONFALL' },

    // Warm up
    { at: 3,   what: 'dart', count: 4, how: 'row' },
    { at: 7,   what: 'dart', count: 4, how: 'row' },
    { at: 11,  what: 'dart', count: 5, how: 'row' },

    // The outpost
    { at: 18,  say: 'SHOOT THE GROUND' },
    { at: 18,  base: 'outpost' },
    { at: 24,  what: 'dart', count: 4, how: 'left' },
    { at: 29,  what: 'dart', count: 4, how: 'right' },

    // Weavers
    { at: 38,  what: 'weaver', count: 3, how: 'left' },
    { at: 42,  what: 'weaver', count: 3, how: 'right' },
    { at: 48,  what: 'dart', count: 6, how: 'row' },

    // Red flock
    { at: 56,  say: 'GET ALL FIVE!' },
    { at: 57,  what: 'red', count: 5, how: 'v', from: 'left' },
    { at: 67,  what: 'dart', count: 5, how: 'row' },
    { at: 70,  what: 'weaver', count: 4, how: 'middle' },

    // Divers
    { at: 78,  what: 'diver', count: 4, how: 'one' },
    { at: 84,  what: 'dart', count: 4, how: 'left' },
    { at: 92,  what: 'dart', count: 6, how: 'row' },

    // Mini boss
    { at: 98,  say: 'MINI BOSS' },
    { at: 99,  boss: 'hauler' },

    // The big star base, and more enemies as it goes
    { at: 126, say: 'STAR BASE' },
    { at: 126, base: 'big' },
    { at: 131, what: 'dart', count: 5, how: 'left' },
    { at: 137, what: 'dart', count: 5, how: 'right' },
    { at: 144, what: 'weaver', count: 5, how: 'middle' },
    { at: 152, what: 'red', count: 5, how: 'v', from: 'right' },
    { at: 160, what: 'dart', count: 7, how: 'row' },
    { at: 166, what: 'diver', count: 3, how: 'one' },

    // Everything
    { at: 180, what: 'bruiser', count: 1, how: 'middle' },
    { at: 182, what: 'dart', count: 5, how: 'left' },
    { at: 185, what: 'weaver', count: 4, how: 'right' },
    { at: 188, what: 'diver', count: 3, how: 'one' },
    { at: 191, what: 'dart', count: 7, how: 'row' },

    // The boss
    { at: 197, say: 'WARNING' },
    { at: 202, boss: 'core' },
  ],
};
