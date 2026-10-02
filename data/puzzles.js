/* ===========================================================
   PUZZLES - the locked places in the house

   Hendrix: four things in the house are locked. Each one has a
   simple puzzle, and each one has something good inside (the
   rare junk loves a locked place). Solve it before the clock
   runs out and it stays open for the rest of the night.

   Which prop or room is locked is set in data/rooms.js, with
   lock: 'safe', lock: 'piano', lock: 'shed' or lock: 'fuse'.
   This file says what the puzzle for each one is.

   Every night the game picks a new code, a new word, a new tune
   and a new fuse number, so you cannot just remember the answer.

   Want to cheat? Open the console and type
       HOUSE.state.puzzles
   That is tonight's answers. Do not tell Dad.
   =========================================================== */

/* THE SAFE in Mum and Dad's room. It needs a code. Dad can never
   remember codes, so he writes them down as sums and hides the
   note somewhere. The note hides in one of these rooms. */
export const SAFE = {
  name: "Mum and Dad's safe",
  digits: 3,
  noteRooms: ['hall', 'lounge', 'dining', 'kitchen', 'landing', 'utility', 'porch'],
  noteSays: 'Safe code. Do not tell the kids!'
};

/* THE SHED PADLOCK has letters on it, all jumbled up. Read the
   riddle on the tag and spell out the answer.
   Add your own riddles here. The answer must be in CAPITALS and
   only 3, 4 or 5 letters, so it fits on the lock. */
export const SHED = {
  name: 'Shed padlock',
  riddles: [
    { riddle: 'Bees make me.', word: 'HONEY' },
    { riddle: 'You sleep in me.', word: 'BED' },
    { riddle: 'I am hot and up in the sky.', word: 'SUN' },
    { riddle: 'Burglars hate me.', word: 'TRAP' },
    { riddle: 'I go moo.', word: 'COW' },
    { riddle: 'I fall from clouds and make puddles.', word: 'RAIN' },
    { riddle: 'I am cold and white and you make men out of me.', word: 'SNOW' },
    { riddle: 'Cats chase me.', word: 'MOUSE' },
    { riddle: 'I go woof.', word: 'DOG' },
    { riddle: 'You kick me into a goal.', word: 'BALL' },
    { riddle: 'I am Hendrix\'s favourite food.', word: 'CANDY' }
  ]
};

/* THE PIANO LID is locked. There is music on the stand: play the
   colours in order and it pops open.
   keys is the colours of the five piano keys, left to right.
   tuneLength is how many notes the tune has. */
export const PIANO = {
  name: 'Piano lid',
  keys: ['red', 'yellow', 'green', 'blue', 'pink'],
  tuneLength: 4
};

/* THE FUSE BOX in the utility room runs the cellar lights. Until
   you fix it the cellar is pitch black and you cannot go down.
   Each fuse has a number on it. Flip on the fuses that add up to
   the number on the label, then pull the big switch.
   fuses is the numbers on the fuses, left to right.
   targets is the numbers the label might ask for. Every one of
   them must be possible to make out of the fuses.

   YOUR TURN (M12)
   Make it harder: only even numbers. Change fuses to
       fuses: [2, 4, 6, 8, 10],
   and targets to
       targets: [10, 12, 14, 16, 18],
   Save, refresh, go to the cellar. Can you still do it in time? */
export const FUSE = {
  name: 'Fuse box',
  fuses: [1, 2, 3, 4, 5],
  targets: [6, 7, 8, 9, 10, 11, 12]
};
