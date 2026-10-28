/* ===========================================================
   PUZZLES - the locked places in the house

   Hendrix: ten things in the house are locked. Each one has a
   puzzle, and each one has something good inside (the rare junk
   loves a locked place). Solve it and it stays open for the rest
   of the night.

   Which prop or room is locked is set in data/rooms.js, with
   lock: 'safe', lock: 'books' and so on. This file says what the
   puzzle for each one is.

   Every night the game makes up a new code, a new word, a new
   tune and a new pattern, so you cannot just remember the answer.

   Want to cheat? Open the console and type
       HOUSE.state.puzzles
   That is tonight's answers. Do not tell Dad.
   =========================================================== */

/* ===========================================================
   HOW HARD

   You pick one of these on the title screen. Every puzzle below
   has an easy, a tricky and a brainbuster version.
   =========================================================== */

export const PUZZLE_LEVELS = [
  { id: 'easy',        name: 'Easy',         note: 'Small sums. A warm up.' },
  { id: 'tricky',      name: 'Tricky',       note: 'Times tables, bigger sums, longer tunes.' },
  { id: 'brainbuster', name: 'Brainbuster',  note: 'Proper hard. Two steps, no help.' }
];

/* Which one is picked when the game starts. */
export const DEFAULT_PUZZLE_LEVEL = 'tricky';

/* HINTS. Every puzzle has a Hint button. A hint costs seconds off
   your scavenge clock, so it is a trade. cost is how many seconds,
   most is how many hints you can have on one puzzle. */
export const HINTS = {
  cost: 10,
  most: 2
};

/* ===========================================================
   THE SAFE in Mum and Dad's room. It needs a code. Dad can never
   remember codes, so he writes each number down as a sum and
   hides the note somewhere. The note hides in one of noteRooms.

   digits is how many numbers in the code.
   kinds is the sorts of sum Dad writes. The game picks one for
   each number, and every answer is a single number, 0 to 9:
       add          4 + 3
       take         45 - 38
       times-take   7 x 8 - 49
       square-take  9 x 9 - 74       (a number times itself)
       two-times    6 x 9 - 7 x 7    (two times tables)
   =========================================================== */
export const SAFE = {
  name: "Mum and Dad's safe",
  noteRooms: ['hall', 'lounge', 'dining', 'kitchen', 'landing', 'utility', 'porch'],
  noteSays: 'Safe code. Do not tell the kids!',
  levels: {
    easy:        { digits: 3, kinds: ['add'] },
    tricky:      { digits: 3, kinds: ['take', 'times-take'] },
    brainbuster: { digits: 4, kinds: ['times-take', 'square-take', 'two-times'] }
  }
};

/* ===========================================================
   THE SHED PADLOCK has letters on it, all jumbled up. Read the
   riddle on the tag and spell out the answer.

   Add your own riddles here. The answer must be in CAPITALS.
   Easy only uses words of 3 or 4 letters. Tricky uses up to 5
   and throws in a spare letter you do not need. Brainbuster uses
   5 to 7 letters and throws in two spare letters.
   =========================================================== */
export const SHED = {
  name: 'Shed padlock',
  riddles: [
    { riddle: 'You sleep in me.', word: 'BED' },
    { riddle: 'I am hot and up in the sky.', word: 'SUN' },
    { riddle: 'I go moo.', word: 'COW' },
    { riddle: 'I go woof.', word: 'DOG' },
    { riddle: 'Burglars hate me.', word: 'TRAP' },
    { riddle: 'I fall from clouds and make puddles.', word: 'RAIN' },
    { riddle: 'I am cold and white and you make men out of me.', word: 'SNOW' },
    { riddle: 'You kick me into a goal.', word: 'BALL' },
    { riddle: 'Bees make me.', word: 'HONEY' },
    { riddle: 'Cats chase me.', word: 'MOUSE' },
    { riddle: 'I am Hendrix\'s favourite food.', word: 'CANDY' },
    { riddle: 'I have keys but open no doors.', word: 'PIANO' },
    { riddle: 'I go beep boop and do what I am told.', word: 'ROBOT' },
    { riddle: 'I am yellow, bent, and burglars slip on my skin.', word: 'BANANA' },
    { riddle: 'I go up into space with a whoosh.', word: 'ROCKET' },
    { riddle: 'I say arr and look for treasure.', word: 'PIRATE' },
    { riddle: 'I am a bird in a dinner suit who cannot fly.', word: 'PENGUIN' },
    { riddle: 'I breathe fire in stories.', word: 'DRAGON' },
    { riddle: 'Nine of us go round the sun.', word: 'PLANETS' }
  ],
  levels: {
    easy:        { shortest: 3, longest: 4, spare: 0 },
    tricky:      { shortest: 4, longest: 5, spare: 1 },
    brainbuster: { shortest: 5, longest: 7, spare: 2 }
  }
};

/* ===========================================================
   THE PIANO LID is locked. There is music on the stand: play the
   colours in order and it pops open.
   keys is the colours of the five piano keys, left to right.
   notes is how long the tune is. On brainbuster the music falls
   off the stand after peek seconds, so you have to remember it.
   =========================================================== */
export const PIANO = {
  name: 'Piano lid',
  keys: ['red', 'yellow', 'green', 'blue', 'pink'],
  levels: {
    easy:        { notes: 4, peek: 0 },
    tricky:      { notes: 6, peek: 0 },
    brainbuster: { notes: 8, peek: 6 }
  }
};

/* ===========================================================
   THE FUSE BOX in the utility room runs the cellar lights. Until
   you fix it the cellar is pitch black and you cannot go down.
   Flip on fuses that add up to the number on the label, then pull
   the big switch.

   fuses is the numbers on the fuses, left to right. The game
   picks some of them and adds them up to make the label, so it
   always works.

   Brainbuster uses 1, 2, 4, 8, 16, 32. Every number from 1 to 63
   can be made from those in exactly one way. That is how a
   computer counts. It is called binary.
   =========================================================== */
export const FUSE = {
  name: 'Fuse box',
  levels: {
    easy:        { fuses: [1, 2, 3, 4, 5],         pick: 2 },
    tricky:      { fuses: [3, 4, 6, 7, 9, 11],     pick: 3 },
    brainbuster: { fuses: [1, 2, 4, 8, 16, 32],    pick: 4 }
  }
};

/* ===========================================================
   THE GARAGE KEYPAD. The garage door has a keypad, and Dad left
   clues on a sticky note. Every clue is true. Put them together
   and only one code fits. No number is used twice.

   digits is how long the code is.
   clues is which sorts of clue the game is allowed to use:
       is       The first number is 3 + 4
       plus     The second number is the first number plus 2
       double   The third number is double the first
       total    All the numbers add up to 17
       odd      The last number is odd (or even)
       bigger   The first number is bigger than the second
       times    The first two numbers times together make 24
       apart    The first and last numbers are 5 apart
   =========================================================== */
export const KEYPAD = {
  name: 'Garage keypad',
  levels: {
    easy:        { digits: 3, clues: ['is', 'plus', 'odd'] },
    tricky:      { digits: 3, clues: ['plus', 'double', 'total', 'odd', 'bigger'] },
    brainbuster: { digits: 4, clues: ['times', 'double', 'total', 'apart', 'odd', 'bigger'] }
  }
};

/* ===========================================================
   THE TV CABINET has a parental lock. The telly shows a pattern
   of numbers. Type the next number and it opens.

   kinds is which patterns the game can use:
       up         goes up the same each time        4, 7, 10, 13
       down       goes down the same each time      50, 44, 38
       doubles    doubles every time                3, 6, 12, 24
       growing    goes up by one more each time     1, 2, 4, 7, 11
       squares    a number times itself             1, 4, 9, 16
       times3     times 3 every time                2, 6, 18, 54
       zigzag     up a bit, down a bit              10, 15, 13, 18, 16
       twoback    add the two before it             1, 2, 3, 5, 8
       double-up  double it, then add 1             1, 3, 7, 15
   =========================================================== */
export const TELLY = {
  name: 'TV cabinet',
  levels: {
    easy:        { kinds: ['up', 'down'] },
    tricky:      { kinds: ['doubles', 'growing', 'squares', 'zigzag'] },
    brainbuster: { kinds: ['times3', 'twoback', 'double-up', 'squares', 'zigzag'] }
  }
};

/* ===========================================================
   THE BATHROOM MIRROR. Somebody wrote a question in the steam on
   the bathroom cabinet mirror, back to front. Read it, work it
   out, type the answer.

   questions has a, b and c in it. The game swaps them for random
   numbers and works out the answer itself. upsideDown flips it
   the other way too.
   =========================================================== */
export const MIRROR = {
  name: 'Bathroom cabinet',
  levels: {
    easy: { upsideDown: false, questions: [
      { ask: 'WHAT IS a + b', a: [5, 20], b: [5, 20], answer: 'a + b' },
      { ask: 'WHAT IS a TAKE b', a: [20, 40], b: [2, 19], answer: 'a - b' }
    ] },
    tricky: { upsideDown: false, questions: [
      { ask: 'WHAT IS a TIMES b', a: [6, 12], b: [6, 12], answer: 'a * b' },
      { ask: 'a BAGS OF b SWEETS. HOW MANY SWEETS', a: [3, 9], b: [4, 12], answer: 'a * b' },
      { ask: 'WHAT IS a TIMES b TAKE c', a: [5, 12], b: [3, 9], c: [1, 9], answer: 'a * b - c' }
    ] },
    brainbuster: { upsideDown: true, questions: [
      { ask: 'a BAGS OF b SWEETS. DAD EATS c. HOW MANY LEFT', a: [4, 9], b: [6, 12], c: [3, 15], answer: 'a * b - c' },
      { ask: 'WHAT IS a TIMES b PLUS c TIMES 2', a: [6, 12], b: [6, 12], c: [5, 25], answer: 'a * b + c * 2' },
      { ask: 'a BURGLARS. b TRAPS EACH. c MISSED. HOW MANY HIT', a: [2, 9], b: [3, 9], c: [1, 6], answer: 'a * b - c' }
    ] }
  }
};

/* ===========================================================
   THE KEY SAFE by the front door beeps a word in Morse code. A
   dot is a short beep, a dash is a long one. Find each group of
   beeps in the chart and tap that letter.

   words is the secret words. chart is how many letters the chart
   shows (all 26 is the whole alphabet).
   =========================================================== */
export const MORSE = {
  name: 'Key safe',
  levels: {
    easy:        { chart: 10, words: ['SOS', 'CAT', 'DOG', 'HAT', 'BIN', 'MAT'] },
    tricky:      { chart: 16, words: ['TRAP', 'BELL', 'KEYS', 'SAFE', 'JUMP', 'SLIP'] },
    brainbuster: { chart: 26, words: ['BURGLAR', 'MARBLE', 'CUSTARD', 'PYJAMAS', 'HONEY', 'GOTCHA'] }
  }
};

/* ===========================================================
   THE BOOKSHELF in the box room has a secret drawer. Pull the
   books out from smallest number to biggest and it opens. The
   numbers on the spines are sums, so work them out first.

   books is how many books. kinds is the sort of sum on each spine
   (the same names as the safe, plus 'plain' for just a number and
   'times' for a times table).
   =========================================================== */
export const BOOKS = {
  name: 'Bookshelf',
  levels: {
    easy:        { books: 5, kinds: ['plain'] },
    tricky:      { books: 6, kinds: ['add', 'take', 'times'] },
    brainbuster: { books: 7, kinds: ['times', 'times-take', 'square-take', 'add'] }
  }
};

/* ===========================================================
   THE ROBOT HOOVER lives in the cupboard under the stairs, and
   it has jammed the door. Write it a program to drive back to its
   charger (the C) without bumping into anything.

   A map is rows of letters, like a picture:
       #   a wall
       .   floor
       H   where the hoover starts. It always starts facing right.
       C   the charger
       b   the cat bowl         s   shoes        l   Lego (ouch)

   most is the most lines your program can have. 0 means as many
   as you like. With a small most you have to use repeat.
   best is one program that works. The Hint button shows a bit of
   it. Make your own map: copy one, change the letters, and write
   a best that works. If it does not work, the game says so in the
   console.
   =========================================================== */
export const HOOVER = {
  name: 'Cupboard under the stairs',
  levels: {
    easy: {
      repeat: false,
      maps: [
        { most: 0, best: 'forward 3, right, forward 2', map: [
          '#######',
          '#H...b#',
          '#.s#..#',
          '#...C.#',
          '#######'
        ] },
        { most: 0, best: 'right, forward 2, left, forward 5', map: [
          '#######',
          '#H.l..#',
          '#..s..#',
          '#.....C',
          '#######'
        ] }
      ]
    },
    tricky: {
      repeat: true,
      maps: [
        { most: 6, best: 'repeat 3, forward 1, right, forward 1, left, end', map: [
          '########',
          '#H.s...#',
          '##..l..#',
          '#b#..s.#',
          '#..#C..#',
          '########'
        ] },
        { most: 6, best: 'repeat 3, forward 2, right, forward 1, left, end', map: [
          '#########',
          '#H..#sb.#',
          '#ll....l#',
          '#s.l#...#',
          '#..s.b.C#',
          '#########'
        ] }
      ]
    },
    brainbuster: {
      repeat: true,
      maps: [
        { most: 6, best: 'repeat 4, forward 1, right, forward 1, left, end', map: [
          '#########',
          '#H.lbs..#',
          '##..ls..#',
          '#b#..b..#',
          '#.l#..s.#',
          '#..s#C..#',
          '#########'
        ] },
        { most: 10, best: 'repeat 2, forward 4, right, forward 2, right, forward 4, left, forward 2, left, end', map: [
          '#######',
          '#H....#',
          '#ssss.#',
          '#.....#',
          '#.ssss#',
          '#.....#',
          '#ssss.#',
          '#C....#',
          '#######'
        ] }
      ]
    }
  }
};

/* ===========================================================
   DAD'S OLD COMPUTER, in the attic, has a BUG. A bug is a
   mistake in code. One line is wrong. Tap the line with the bug,
   then pick the fix.

   Two sorts of bug:
       data      a bit of game data (like the files in data/)
                 with a mistake in it. These are below, in
                 SNIPPETS. Write your own!
       program   a robot hoover program that crashes. The game
                 makes these itself from the hoover maps above,
                 by breaking one line of a program that works.

   HOW A SNIPPET WORKS
       level   easy, tricky or hard
       lines   the code, one line each
       bug     which line is wrong. The first line is 0.
       fixes   what the line should say FIRST, then two wrong
               ideas. The game shuffles them.
       why     what was wrong, shown when you fix it
   =========================================================== */
export const BUGS = {
  name: "Dad's old computer",
  levels: {
    easy:        { kinds: ['data'], snippets: ['easy'] },
    tricky:      { kinds: ['data', 'program'], snippets: ['easy', 'tricky'] },
    brainbuster: { kinds: ['program', 'data'], snippets: ['tricky', 'hard'] }
  },
  SNIPPETS: [
    { level: 'easy', bug: 1,
      lines: ["{ id: 'egg-drop', name: 'Egg Drop',", "  needs: ['eggs', 'bukket'],", "  nerve: 3, mount: 'OVERHEAD' }"],
      fixes: ["  needs: ['eggs', 'bucket'],", "  needs: ['eggs', 'buckets'],", "  needs: ['egg', 'bukket'],"],
      why: 'There is no item called bukket. The id is bucket, spelled exactly right.' },
    { level: 'easy', bug: 2,
      lines: ['export const HERO = {', "  name: 'Hendrix',", '  walkSpeed: fast,', '  size: 1', '};'],
      fixes: ['  walkSpeed: 250,', "  walkSpeed: 'fast',", '  walk speed: 250,'],
      why: 'walkSpeed has to be a number. The game cannot do sums with the word fast.' },
    { level: 'easy', bug: 1,
      lines: ['props: [', "  { kind: 'sofa' x: 84 },", "  { kind: 'lamp', x: 96 }", ']'],
      fixes: ["  { kind: 'sofa', x: 84 },", "  { kind: sofa, x: 84 },", "  { kind: 'sofa'. x: 84 },"],
      why: 'Every bit needs a comma before the next bit. Computers are very fussy about commas.' },
    { level: 'easy', bug: 1,
      lines: ["{ code: 'M16', name: 'Robot Hoover', done: true },", "{ code: 'M17', name: 'Gardens', done: yes }"],
      fixes: ["{ code: 'M17', name: 'Gardens', done: true }", "{ code: 'M17', name: 'Gardens', done: 'yes' }", "{ code: 'M17', name: 'Gardens', done: YES }"],
      why: 'Code says yes and no as true and false.' },
    { level: 'tricky', bug: 2,
      lines: ["{ id: 'pendulum', name: 'The Pendulum',", "  cat: ['STARTLE'], nerve: 3,", "  mount: 'CEILING' }"],
      fixes: ["  mount: 'OVERHEAD' }", "  mount: 'ceiling' }", "  mount: 'UP' }"],
      why: 'The mounts are FLOOR, DOORWAY, OVERHEAD, STAIRS and GARDEN. CEILING is not one of them.' },
    { level: 'tricky', bug: 2,
      lines: ["{ id: 'sid', name: 'Sid',", '  nerve: 8,', "  weakTo: ['loud', 'startle'],"],
      fixes: ["  weakTo: ['LOUD', 'STARTLE'],", '  weakTo: [LOUD, STARTLE],', "  weakTo: 'LOUD STARTLE',"],
      why: 'Trap kinds are in CAPITALS. To a computer, loud and LOUD are different words.' },
    { level: 'tricky', bug: 1,
      lines: ["{ id: 'easy', name: 'Easy',", '  seconds: -300,', "  puzzleClock: 'stop' }"],
      fixes: ['  seconds: 300,', '  seconds: 3:00,', "  seconds: '300 seconds',"],
      why: 'Minus 300 seconds would mean the clock ran out before you started.' },
    { level: 'tricky', bug: 1,
      lines: ['riddles: [', "  { riddle: 'Bees make me.', word: 'honey' },", "  { riddle: 'I go moo.', word: 'COW' }", ']'],
      fixes: ["  { riddle: 'Bees make me.', word: 'HONEY' },", "  { riddle: 'Bees make me.', word: HONEY },", "  { riddle: 'Bees make me.', word: 'Honey' },"],
      why: 'Shed answers must be in CAPITALS, like the letters on the padlock.' },
    { level: 'hard', bug: 1,
      lines: ['brainbuster: {', '  fuses: [2, 4, 6],', '  pick: 4', '}'],
      fixes: ['  fuses: [2, 4, 6, 8],', '  fuses: [2, 4, 6, 4],', '  fuses: [2, 4],'],
      why: 'You cannot pick 4 different fuses when there are only 3. Add a fourth fuse.' },
    { level: 'hard', bug: 1,
      lines: ["{ id: 'glue-bomb', name: 'Glue Bomb',", "  needs: ['water-balloon', 'flour-bomb'],", "  cat: ['STICKY', 'MESSY'], nerve: 5 }"],
      fixes: ["  needs: ['flour-bomb', 'water-balloon'],", "  needs: ['flour-bomb' + 'water-balloon'],", "  needs: ['glue-bomb', 'water-balloon'],"],
      why: 'An upgrade starts with the trap you already built, then the extra thing.' },
    { level: 'hard', bug: 2,
      lines: ['route: [', "  { room: 'kitchen', says: 'Toast!' },", "  { room: 'livingroom', says: 'Telly!' }", ']'],
      fixes: ["  { room: 'lounge', says: 'Telly!' }", "  { room: 'living room', says: 'Telly!' }", "  { room: 'Lounge', says: 'Telly!' }"],
      why: 'There is no room called livingroom. In data/rooms.js it is lounge, all small letters.' },
    { level: 'hard', bug: 0,
      lines: ["{ id: 'my-floor', name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR', x: 790, y: 9000 },"],
      fixes: ["{ id: 'my-floor', name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR', x: 790, y: 372 },", "{ id: 'my-floor', name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR', x: 790 },", "{ id: 'my-floor', name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR', x: 9000, y: 9000 },"],
      why: 'y 9000 is miles below the bottom of the house. Nobody would ever walk past it.' }
  ]
};
