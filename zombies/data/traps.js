/* ===========================================================
   TRAPS AND THINGS YOU CAN BUILD

   Hendrix: this is the build bar. Each thing is one block.
   To add one, copy a block and change the words. The game
   reads this list to draw the bar, so a new block here is a
   new button in the game, no other file needed.

   name     the word on the button
   art      the picture, art/NAME.svg
   planks   how many planks it costs
   crew     how many villagers it needs to run (they stay there)
   does     what happens when a zombie walks on it:
            'block'   zombies cannot pass (walls)
            'hold'    zombies stop for "seconds", then climb over (fence)
            'scare'   zombies turn away from it (torch)
            'slow'    zombies walk slowly on it (mud)
            'pit'     catches "holds" zombies and keeps them
            'circle'  zombies walk round it all night (brains)
            'bounce'  zombies fly back "tiles" squares (trampoline)
            'spin'    zombies walk out the way they came in (door)
            'drop'    a pumpkin on the head, zombie goes blind (once)
            'stick'   stuck for "seconds" (honey)
            'bait'    zombies nearby crowd round it (scarecrow)
            'log'     a log rolls along the row, knocks them dizzy (once)
            'bed'     a villager sleeps here (zombies want these)
            'farm'    carrots grow here
            'brewery' potion is made here
            'catapult' you aim and fire it
            'tower'   the lookout stands here
   hard     true means it only shows on Hard
   uses     Hard only: how many times it works before it breaks
            (builders fix broken traps in the morning, or click
            one and pay a plank)
   needsJob a villager job that must live here before you can build it
   =========================================================== */

export const TRAPS = {
  wall:    { name: 'Wall',      art: 'wall',    planks: 2, crew: 0, does: 'block' },
  fence:   { name: 'Fence',     art: 'fence',   planks: 1, crew: 0, does: 'hold', seconds: 8 },
  torch:   { name: 'Torch',     art: 'torch',   planks: 1, crew: 0, does: 'scare', reach: 2 },
  mud:     { name: 'Mud pit',   art: 'mud',     planks: 1, crew: 0, does: 'slow', slow: 0.35 },
  pit:     { name: 'Pit trap',  art: 'pit',     planks: 2, crew: 0, does: 'pit', holds: 3, uses: 2 },
  brains:  { name: 'Brains',    art: 'brains',  planks: 2, crew: 0, does: 'circle' },
  tramp:   { name: 'Trampoline', art: 'tramp',  planks: 3, crew: 0, does: 'bounce', tiles: 5, uses: 4 },
  spin:    { name: 'Spin door', art: 'spin',    planks: 3, crew: 0, does: 'spin', seconds: 5, uses: 4 },
  drop:    { name: 'Pumpkin drop', art: 'drop', planks: 2, crew: 0, does: 'drop', uses: 1 },
  honey:   { name: 'Honey',     art: 'honey',   planks: 2, crew: 0, does: 'stick', seconds: 15, uses: 3 },
  scare:   { name: 'Scarecrow', art: 'scare',   planks: 2, crew: 0, does: 'bait', reach: 4, seconds: 20, uses: 3 },
  log:     { name: 'Log',       art: 'log',     planks: 3, crew: 0, does: 'log', uses: 1 },
  bed:     { name: 'Bed',       art: 'bed',     planks: 2, crew: 0, does: 'bed' },
  farm:    { name: 'Carrots',   art: 'farm',    planks: 1, crew: 0, does: 'farm' },
  catapult:{ name: 'Catapult',  art: 'catapult', planks: 6, crew: 1, does: 'catapult' },
  // These only show on Hard
  bell:    { name: 'Bell tower', art: 'bell',  planks: 5, crew: 1, does: 'bell', reach: 9, seconds: 6, hard: true },
  garlic:  { name: 'Garlic',    art: 'garlic',  planks: 2, crew: 0, does: 'garlic', hard: true },
  silver:  { name: 'Silver bell', art: 'silver', planks: 3, crew: 0, does: 'silver', reach: 4, hard: true },
  ice:     { name: 'Ice slide', art: 'ice',     planks: 2, crew: 0, does: 'ice', tiles: 4, uses: 4, hard: true },
  mirror:  { name: 'Mirror',    art: 'mirror',  planks: 3, crew: 0, does: 'mirror', seconds: 20, uses: 2, hard: true },
  dawn:    { name: 'Dawn mirror', art: 'dawn',  planks: 4, crew: 0, does: 'dawn', reach: 2, from: 0.7, hard: true },
  sprinkler: { name: 'Sprinkler', art: 'sprinkler', planks: 6, crew: 2, does: 'sprinkler', reach: 2, seconds: 15, hard: true },
  net:     { name: 'Giant net',  art: 'net',    planks: 4, crew: 0, does: 'net', needsJob: 'giant', hard: true },
};

// The things the village starts with. Row and column are squares
// on the grid, counted from the top left corner.
export const START = [
  { thing: 'brewery', col: 11, row: 7 },
  { thing: 'well',    col: 12, row: 8 },
  { thing: 'bed', col: 9,  row: 6 }, { thing: 'bed', col: 9,  row: 8 },
  { thing: 'bed', col: 14, row: 6 }, { thing: 'bed', col: 14, row: 8 },
  { thing: 'farm', col: 10, row: 10 }, { thing: 'farm', col: 11, row: 10 },
  { thing: 'farm', col: 12, row: 10 }, { thing: 'farm', col: 13, row: 10 },
  { thing: 'torch', col: 8, row: 5 }, { thing: 'torch', col: 15, row: 5 },
  { thing: 'torch', col: 8, row: 11 }, { thing: 'torch', col: 15, row: 11 },
];
