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
  bitten: '{name} was bitten! They come back as a vampire.',
  broken: '{n} traps broke. Builders fix them in the morning.',
  win: 'A FULL VILLAGE! You did it.',
  gotUp: 'You got back up!',
  firstWhack: 'BONK! Stunned. Potion cures them.',
  noBed: 'Build a bed first. Villagers need somewhere to sleep.',
  start: 'You start with {planks} planks, {carrots} carrots and {potion} potion.',
  noBedFor: '{name} has no bed! Build one.',
  joined: 'POP! {name} the {job} joined the village. {does}',
  howTo: [
    { art: 'wall',  head: 'DAY: BUILD', text: 'Pick a thing. Click a square. Walls stop zombies. Pits catch them.' },
    { art: 'hero',  head: 'NIGHT: RUN', text: 'Zombies come. Click where to run, or WASD. The WHACK button stuns one. Stunned is not cured!' },
    { art: 'bucket', head: 'POTION CURES', text: 'The POTION button cures the nearest zombie. He joins your village! Potion is rare, so trap the rest.' },
    { art: 'pit',   head: 'MORNING', text: 'Click a pit with zombies in it to pour potion in. Tap a villager to give them a job.' },
    { art: 'stonewall', head: 'STONE', text: 'Build a mine by the boulders. Miners dig stone. Stone walls cannot be dug under or burped over.' },
    { art: 'villager', head: 'CURE PEOPLE TO GROW', text: 'Potion turns a zombie into a villager. Villagers collect carrots and wood. More people means more buildings and more potion.' },
  ],
  tip: [
    'Pits hold three. Pour potion in tomorrow.',
    'Brains on a string keep one zombie busy all night.',
    'Torches steer them. Fences hold them. Walls stop them.',
    'Carrots make potion. Farmers make carrots. Cure farmers.',
  ],
};
