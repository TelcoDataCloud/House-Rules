/* ===========================================================
   DIFFICULTY - how long you get to raid your own house

   Hendrix: this folder is YOURS. Nothing in here is code that
   does anything clever. It is just a list of facts about the
   game, and the game reads the list.

   There is exactly one dial here: how many seconds the
   scavenge phase lasts. Change a number, save, refresh, play.

   Try setting hard to 20 and see if you can still win.
   =========================================================== */

export const DIFFICULTY = [
  {
    id: 'easy',
    name: 'Easy',
    seconds: 200,
    note: 'Plenty of time. Grab everything.'
  },
  {
    id: 'medium',
    name: 'Medium',
    seconds: 150,
    note: 'You will miss a room. Choose which one.'
  },
  {
    id: 'hard',
    name: 'Hard',
    seconds: 100,
    note: 'Run. Do not think. Regret it later.'
  }
];

/* Which one is already picked when the game starts. */
export const DEFAULT_DIFFICULTY = 'easy';
