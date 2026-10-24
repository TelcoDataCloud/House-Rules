/* ===========================================================
   BLUEPRINTS - the maths you do when you build a trap

   Hendrix: every time you bolt a trap together, you get a quick
   blueprint question. Get it right and it is a PERFECT build: the
   trap gets a gold star and scares a burglar one more than usual.
   Get it wrong and the trap still works. It is just a bit wonky.

   HOW A QUESTION WORKS
   Like the bathroom mirror in data/puzzles.js. Write the question
   with a, b and c in it. The game swaps them for random numbers,
   then works out answer itself.

       { ask: 'a cans, each clangs b times. How many clangs?', answer: 'a * b' }

   answer can use + (add), - (take) and * (times).
   The questions are grouped by the kind of trap (its cat in
   data/recipes.js). Upgrades get the UPGRADE ones.

   How big a, b and c are depends on how hard you set the puzzles
   on the title screen. NUMBERS says.
   =========================================================== */

export const NUMBERS = {
  easy:        { a: [2, 9],  b: [2, 9],  c: [1, 9] },
  tricky:      { a: [3, 12], b: [3, 12], c: [2, 20] },
  brainbuster: { a: [6, 15], b: [6, 15], c: [5, 40] }
};

/* How many goes you get at each one. */
export const TRIES = 2;

export const BLUEPRINTS = {
  SLIPPERY: [
    { ask: 'You tip a marbles on each of b stairs. How many marbles?', answer: 'a * b' },
    { ask: 'The slippy patch is a tiles long and b tiles wide. How many tiles?', answer: 'a * b' }
  ],
  MESSY: [
    { ask: 'The bucket holds a cups. You fill it b times. How many cups of gloop?', answer: 'a * b' },
    { ask: 'a bags of flour, b scoops in each. You spill c. How many scoops are left?', answer: 'a * b - c' }
  ],
  STICKY: [
    { ask: 'a jars, b spoonfuls in each. How many spoonfuls of sticky?', answer: 'a * b' },
    { ask: 'You need a strips of tape, each b centimetres long. How many centimetres?', answer: 'a * b' }
  ],
  LOUD: [
    { ask: 'a cans on the string. Each one clangs b times. How many clangs?', answer: 'a * b' },
    { ask: 'a bells ring b times each, then the horn honks c times. How many noises?', answer: 'a * b + c' }
  ],
  STARTLE: [
    { ask: 'a rubber chickens, b squeaks each. How many squeaks?', answer: 'a * b' },
    { ask: 'The rope is a metres. You add b more, then cut off c. How long is it now?', answer: 'a + b - c' }
  ],
  TANGLE: [
    { ask: 'You wrap the door a times, using b centimetres each time. How much string?', answer: 'a * b' }
  ],
  UPGRADE: [
    { ask: 'a parts, b bolts on each part, plus c spare bolts. How many bolts?', answer: 'a * b + c' },
    { ask: 'a buckets of b cups each, and c cups spilled. How many cups made it?', answer: 'a * b - c' }
  ]
};
