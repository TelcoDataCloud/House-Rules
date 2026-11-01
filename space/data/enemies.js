/* ===========================================================
   ENEMIES IN THE AIR

   Hendrix: every enemy ship is a picture and some numbers.
     art     the picture in the art folder
     size    how big it is drawn
     hits    how many of your shots it takes
     speed   how fast it flies
     points  what you score for getting it
     pattern how it flies. One of:
               'straight'  straight down
               'weave'     wiggles side to side
               'dive'      stops, flashes, then dives
               'hover'     comes down, floats, shoots a fan
               'loop'      swoops across in a big curve
   =========================================================== */

export const ENEMIES = {
  dart:    { art: 'dart',     size: 48, hits: 1, speed: 120, points: 100, pattern: 'straight' },
  weaver:  { art: 'weaver',   size: 56, hits: 1, speed: 95,  points: 150, pattern: 'weave' },
  diver:   { art: 'diver',    size: 56, hits: 2, speed: 110, points: 200, pattern: 'dive' },
  bruiser: { art: 'bruiser',  size: 92, hits: 6, speed: 60,  points: 500, pattern: 'hover', fireEvery: 2 },
  red:     { art: 'red-dart', size: 44, hits: 1, speed: 0,   points: 100, pattern: 'loop' },
};

// Every this many air enemies you get, one drops a power token.
export const DROP_EVERY = 3;
