/* ===========================================================
   LEVEL 1: MOONFALL

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
     boss   'hauler' or 'core'

   Add a wave: copy a line, change the time. That's it!
   =========================================================== */

export const LEVEL = {
  name: 'Moonfall',
  scroll: 60,        // how fast the moon slides past
  length: 240,       // seconds. The boss gives up after this.
  grades: { S: 24000, A: 16000, B: 9000 },   // points for each grade
};

export const WAVES = [
  { at: 1,   say: 'MOONFALL' },

  // Warm up
  { at: 3,   what: 'dart', count: 4, how: 'row' },
  { at: 7,   what: 'dart', count: 4, how: 'row' },
  { at: 11,  what: 'dart', count: 4, how: 'row' },

  // The outpost
  { at: 18,  say: 'SHOOT THE GROUND' },
  { at: 18,  base: 'outpost' },
  { at: 24,  what: 'dart', count: 4, how: 'left' },
  { at: 29,  what: 'dart', count: 4, how: 'right' },

  // Weavers
  { at: 38,  what: 'weaver', count: 3, how: 'left' },
  { at: 42,  what: 'weaver', count: 3, how: 'right' },
  { at: 48,  what: 'dart', count: 5, how: 'row' },

  // Red flock
  { at: 56,  say: 'GET ALL FIVE!' },
  { at: 57,  what: 'red', count: 5, how: 'v', from: 'left' },
  { at: 67,  what: 'dart', count: 4, how: 'row' },
  { at: 70,  what: 'weaver', count: 3, how: 'middle' },

  // Divers
  { at: 78,  what: 'diver', count: 4, how: 'one' },
  { at: 92,  what: 'dart', count: 4, how: 'row' },

  // Mini boss
  { at: 98,  say: 'MINI BOSS' },
  { at: 99,  boss: 'hauler' },

  // The big star base
  { at: 124, say: 'STAR BASE' },
  { at: 124, base: 'big' },
  { at: 130, what: 'dart', count: 4, how: 'left' },
  { at: 138, what: 'dart', count: 4, how: 'right' },
  { at: 146, what: 'weaver', count: 3, how: 'middle' },
  { at: 154, what: 'red', count: 5, how: 'v', from: 'right' },
  { at: 164, what: 'dart', count: 4, how: 'row' },

  // Everything
  { at: 180, what: 'bruiser', count: 1, how: 'middle' },
  { at: 182, what: 'dart', count: 4, how: 'left' },
  { at: 186, what: 'weaver', count: 3, how: 'right' },
  { at: 189, what: 'diver', count: 2, how: 'one' },

  // The boss
  { at: 196, say: 'WARNING' },
  { at: 201, boss: 'core' },
];
