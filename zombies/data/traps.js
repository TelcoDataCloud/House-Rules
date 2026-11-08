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
   what     one short line for kids: what it does (shows when you pick it)
   stone    how many stone it costs (as well as planks)
   holds    for a cottage: how many villagers sleep in it
   nearRock true means it can only go next to the boulders (the mine)
   auto     for the catapult: seconds between the pumpkins it throws by itself
   from     Easy only: the first night this shows on the bar (1 if missing)
   =========================================================== */

export const TRAPS = {
  wall:    { name: 'Wall',      art: 'wall',    planks: 2, crew: 0, does: 'block', what: 'Zombies cannot get past it. Diggers go under.' },
  stonewall: { name: 'Stone wall', art: 'stonewall', planks: 0, stone: 2, crew: 0, does: 'block', what: 'Nothing gets past, over or under it.', from: 4 },
  fence:   { name: 'Fence',     art: 'fence',   planks: 1, crew: 0, does: 'hold', seconds: 8, what: 'Holds a zombie for a bit, then he climbs over.' },
  torch:   { name: 'Torch',     art: 'torch',   planks: 1, crew: 0, does: 'scare', reach: 2, what: 'Zombies walk away from the light.' },
  mud:     { name: 'Mud pit',   art: 'mud',     planks: 1, crew: 0, does: 'slow', slow: 0.35, what: 'Zombies go slow in it.', from: 2 },
  pit:     { name: 'Pit trap',  art: 'pit',     planks: 2, crew: 0, does: 'pit', holds: 3, uses: 2, what: 'Holds 3 zombies. Pour potion in tomorrow.' },
  brains:  { name: 'Brains',    art: 'brains',  planks: 2, crew: 0, does: 'circle', what: 'One zombie walks round it all night.', from: 2 },
  tramp:   { name: 'Trampoline', art: 'tramp',  planks: 3, crew: 0, does: 'bounce', tiles: 5, uses: 4, what: 'Boing! The zombie flies back.', from: 2 },
  spin:    { name: 'Spin door', art: 'spin',    planks: 3, crew: 0, does: 'spin', seconds: 5, uses: 4, what: 'In, round, and back out. Confused.', from: 4 },
  drop:    { name: 'Pumpkin drop', art: 'drop', planks: 2, crew: 0, does: 'drop', uses: 1, what: 'A pumpkin on the head. He cannot see.', from: 4 },
  honey:   { name: 'Honey',     art: 'honey',   planks: 2, crew: 0, does: 'stick', seconds: 15, uses: 3, what: 'Stuck fast for a while.', from: 3 },
  scare:   { name: 'Scarecrow', art: 'scare',   planks: 2, crew: 0, does: 'bait', reach: 4, seconds: 20, uses: 3, what: 'Zombies think it is a villager and crowd it.', from: 3 },
  log:     { name: 'Log',       art: 'log',     planks: 3, crew: 0, does: 'log', uses: 1, what: 'Rolls along the row and knocks them over. Once.', from: 3 },
  bed:     { name: 'Cottage',   art: 'cottage', planks: 4, crew: 0, does: 'bed', holds: 2, what: 'Two villagers sleep here. Zombies want these.' },
  mine:    { name: 'Mine',      art: 'mine',    planks: 6, crew: 0, does: 'mine', nearRock: true, what: 'Build it next to the boulders. Miners dig stone here.', from: 4 },
  farm:    { name: 'Carrots',   art: 'farm',    planks: 1, crew: 0, does: 'farm', what: 'Carrots grow here. Carrots make potion.' },
  catapult:{ name: 'Catapult',  art: 'catapult', planks: 6, crew: 1, does: 'catapult', auto: 5, what: 'Throws pumpkins by itself every few seconds. Drag from it to aim potion. One villager works it.', from: 3 },
  brewery: { name: 'Brewery',   art: 'brewery', planks: 8, crew: 0, does: 'brewery', what: 'One brewer at a time cooks potion here. Build another for a second brewer.', from: 2 },
  // These only show on Hard
  bell:    { name: 'Bell tower', art: 'bell',  planks: 5, crew: 1, does: 'bell', reach: 9, seconds: 6, hard: true, what: 'Ring it and every zombie comes to look. One villager rings it.' },
  garlic:  { name: 'Garlic',    art: 'garlic',  planks: 2, crew: 0, does: 'garlic', hard: true, what: 'Vampires cannot cross it.' },
  silver:  { name: 'Silver bell', art: 'silver', planks: 3, crew: 0, does: 'silver', reach: 4, hard: true, what: 'The werewolf runs away from it.' },
  ice:     { name: 'Ice slide', art: 'ice',     planks: 2, crew: 0, does: 'ice', tiles: 4, uses: 4, hard: true, what: 'Zombies slide right off it.' },
  mirror:  { name: 'Mirror',    art: 'mirror',  planks: 3, crew: 0, does: 'mirror', seconds: 20, uses: 2, hard: true, what: 'A zombie waves at himself for ages.' },
  dawn:    { name: 'Dawn mirror', art: 'dawn',  planks: 4, crew: 0, does: 'dawn', reach: 2, from: 0.7, hard: true, what: 'Late in the night, zombies near it go home early.' },
  sprinkler: { name: 'Sprinkler', art: 'sprinkler', planks: 6, crew: 2, does: 'sprinkler', reach: 2, seconds: 15, hard: true, what: 'Cures one zombie nearby now and then. Two villagers run it.' },
  net:     { name: 'Giant net',  art: 'net',    planks: 4, crew: 0, does: 'net', needsJob: 'giant', hard: true, what: 'Catches Giant Gary. Needs a giant villager to set up.' },
};

// The things the village starts with. Row and column are squares
// on the grid, counted from the top left corner.
export const START = [
  { thing: 'brewery', col: 17, row: 11 },
  { thing: 'well',    col: 18, row: 12 },
  { thing: 'bed', col: 15,  row: 10 }, { thing: 'bed', col: 20, row: 10 },
  { thing: 'farm', col: 16, row: 14 }, { thing: 'farm', col: 17, row: 14 },
  { thing: 'farm', col: 18, row: 14 }, { thing: 'farm', col: 19, row: 14 },
  { thing: 'torch', col: 14, row: 9 }, { thing: 'torch', col: 21, row: 9 },
  { thing: 'torch', col: 14, row: 15 }, { thing: 'torch', col: 21, row: 15 },
];
