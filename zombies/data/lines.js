/* ===========================================================
   LINES: every word the game says

   Hendrix: change any of these and the game says your words.
   The game reads them out loud too, so keep them short.
   The first one is the name of the game. Your turn: rename it.
   =========================================================== */

export const LINES = {
  title: 'SNOT MOON',
  tagline: 'Cure the zombies. Grow the village.',
  dayTitle: 'DAY {n}',
  nightTitle: 'NIGHT {n}',
  lookout: [
    'Tonight: {count} coming from the {side}.',
    'I count {count}. From the {side}. Get building.',
    '{count} of them. {side} side. Did you hear that?',
  ],
  nightFalls: 'NIGHT FALLS',
  dawn: 'DAWN! Ooh, sun. Home time.',
  cured: ['POP! A new villager.', 'POP! Welcome home.', 'Cured! Off you go.'],
  whack: ['BONK', 'WHACK', 'THUD'],
  noPotion: 'No potion left. Trap them!',
  taken: '{name} was carried off. Cure them tomorrow.',
  heroDown: 'Oof. Sit down a bit.',
  bitten: 'Bitten! They come back as a vampire.',
  broken: '{n} traps broke. Builders fix them in the morning.',
  win: 'A FULL VILLAGE! You did it.',
  tip: [
    'Pits hold three. Pour potion in tomorrow.',
    'Brains on a string keep one zombie busy all night.',
    'Torches steer them. Fences hold them. Walls stop them.',
    'Carrots make potion. Farmers make carrots. Cure farmers.',
  ],
};
