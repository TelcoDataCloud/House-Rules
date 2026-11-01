/* ===========================================================
   ENEMIES IN THE AIR

   Hendrix: every enemy ship is a picture and some numbers.
     art        the picture in the art folder
     size       how big it is drawn
     hits       how many of your shots it takes
     speed      how fast it flies
     points     what you score for getting it
     colour     the colour of the bits when it goes bang
     shotEvery  seconds between its shots (if it is allowed to
                shoot: look at shooters in difficulty.js)
     pattern    how it flies. One of:
                  'straight'  straight down
                  'weave'     wiggles side to side
                  'dive'      stops, flashes, then dives
                  'hover'     comes down, floats, shoots a fan
                  'loop'      swoops across in a big curve
   =========================================================== */

export const ENEMIES = {
  dart:    { art: 'dart',     size: 52, hits: 1, speed: 120, points: 100, colour: '#ff7a1a', shotEvery: 3.5, pattern: 'straight' },
  weaver:  { art: 'weaver',   size: 60, hits: 1, speed: 95,  points: 150, colour: '#ff3fa4', shotEvery: 2.6, pattern: 'weave' },
  diver:   { art: 'diver',    size: 58, hits: 2, speed: 110, points: 200, colour: '#ffd23f', shotEvery: 2.2, pattern: 'dive' },
  bruiser: { art: 'bruiser',  size: 96, hits: 6, speed: 60,  points: 500, colour: '#9b5cff', shotEvery: 2,   pattern: 'hover' },
  red:     { art: 'red-dart', size: 48, hits: 1, speed: 0,   points: 100, colour: '#ff3b3b', shotEvery: 0,   pattern: 'loop' },
};

// Every this many air enemies you get, one drops a power token.
export const DROP_EVERY = 3;
