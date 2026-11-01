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
  easy:        { a: [1, 5],  b: [1, 5],  c: [1, 5] },
  tricky:      { a: [2, 5],  b: [1, 10], c: [1, 10] },
  brainbuster: { a: [2, 10], b: [2, 10], c: [1, 20] }
};

/* How many goes you get at each one. */
export const TRIES = 2;

/* SPELLING. Half the time the blueprint asks you to spell
   something instead: a picture, and the letters all jumbled up.
   item is which picture to show (an id from data/items.js). Easy
   uses words of 3 letters, Tricky up to 4, Brainbuster any. Add
   your own! */
export const SPELLING = [
  { word: 'EGG', item: 'eggs' },
  { word: 'ICE', item: 'ice' },
  { word: 'CAN', item: 'tin-cans' },
  { word: 'CAR', item: 'toy-car' },
  { word: 'MUD', item: 'compost' },
  { word: 'JAR', item: 'honey' },
  { word: 'BAG', item: 'flour' },
  { word: 'BELL', item: 'bell' },
  { word: 'ROPE', item: 'rope' },
  { word: 'SACK', item: 'sack' },
  { word: 'TAPE', item: 'duct-tape' },
  { word: 'SOAP', item: 'soap' },
  { word: 'GLUE', item: 'glue' },
  { word: 'RAKE', item: 'rake' },
  { word: 'HORN', item: 'air-horn' },
  { word: 'POOL', item: 'paddling-pool' },
  { word: 'BUCKET', item: 'bucket' },
  { word: 'BANANA', item: 'banana' },
  { word: 'PILLOW', item: 'pillow' }
];

/* Easy only uses the adding ones (+). Tricky adds times (*).
   Brainbuster uses all of them, two steps too. Keep the words SHORT:
   the sum is shown big underneath as well. */
export const BLUEPRINTS = {
  SLIPPERY: [
    { ask: 'a marbles. b more. How many?', answer: 'a + b' },
    { ask: 'a jars. b marbles in each. How many?', answer: 'a * b' }
  ],
  MESSY: [
    { ask: 'a cups of gloop. b more. How many?', answer: 'a + b' },
    { ask: 'a buckets. b cups in each. How many cups?', answer: 'a * b' },
    { ask: 'a bags. b scoops in each. c scoops fall out. How many scoops left?', answer: 'a * b - c' }
  ],
  STICKY: [
    { ask: 'a jars of honey. b more. How many?', answer: 'a + b' },
    { ask: 'a jars. b spoons in each. How many spoons?', answer: 'a * b' }
  ],
  LOUD: [
    { ask: 'a cans. b more cans. How many?', answer: 'a + b' },
    { ask: 'a cans. Each one clangs b times. How many clangs?', answer: 'a * b' }
  ],
  STARTLE: [
    { ask: 'a chickens. b more. How many?', answer: 'a + b' },
    { ask: 'a chickens. b squeaks each. How many squeaks?', answer: 'a * b' }
  ],
  TANGLE: [
    { ask: 'a strings. b more. How many?', answer: 'a + b' },
    { ask: 'a doors. b strings on each. How many strings?', answer: 'a * b' }
  ],
  UPGRADE: [
    { ask: 'a bolts. b more. How many?', answer: 'a + b' },
    { ask: 'a parts. b bolts on each. How many bolts?', answer: 'a * b' },
    { ask: 'a parts. b bolts each. c spare. How many?', answer: 'a * b + c' }
  ]
};
