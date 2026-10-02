/* ===========================================================
   DIFFICULTY - how long you get to raid your own house

   Hendrix: this folder is YOURS. Nothing in here is code that
   does anything clever. It is just a list of facts about the
   game, and the game reads the list.

   The first dial here is how many seconds the scavenge phase
   lasts. The clock stops while you are at the workbench, so you
   can build some traps, see what you are missing, and go back out
   for more. Change a number, save, refresh, play. The second one,
   at the bottom, is how easily the neighbours call the police.

   Try setting hard to 20 and see if you can still win.
   =========================================================== */

export const DIFFICULTY = [
  {
    id: 'easy',
    name: 'Easy',
    seconds: 300,
    note: 'Plenty of time. Grab everything.'
  },
  {
    id: 'medium',
    name: 'Medium',
    seconds: 200,
    note: 'You will miss a room. Choose which one.'
  },
  {
    id: 'hard',
    name: 'Hard',
    seconds: 125,
    note: 'Run. Do not think. Regret it later.'
  }
];

/* Which one is already picked when the game starts. */
export const DEFAULT_DIFFICULTY = 'easy';

/* ===========================================================
   THE NEIGHBOURS

   Every LOUD trap that goes off wakes the street up a bit. The
   noise it makes is the same as its nerve number in
   data/recipes.js, so the Doorbell makes 1 and the Bellringer 5.

   When the noise adds up to callPoliceAt, a neighbour rings the
   police. They turn up policeTake seconds later, and anybody
   still inside the house gets arrested. Anybody already out of
   the door gets away.

   Make callPoliceAt small and the police come all the time.
   Make it big and you will hardly ever see them. It was 6. There
   are more LOUD traps now, so it went up to 7.
   =========================================================== */

export const NEIGHBOURS = {
  callPoliceAt: 7,
  policeTake: 9
};
