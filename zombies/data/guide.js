/* ===========================================================
   GUIDE: the How to play pages, the tips, and what the land does

   Hendrix: this is everything the game tells you. The guide is
   what you see when you press the ? button. Tips pop up while
   you play (the light bulb button turns them off). Change any
   words you like.
   =========================================================== */

// The How to play guide, one card each
export const GUIDE = [
  { art: 'wall',     head: 'DAY: BUILD',     text: 'Pick a thing from the bar, then click a square. Click it again to take it back and get everything back.' },
  { art: 'plank',    head: 'PLANKS BUILD',   text: 'Builders chop planks in the forest. Walls, fences, torches and houses cost planks.' },
  { art: 'carrot',   head: 'CARROTS BUY',    text: 'Farmers grow carrots on the carrot plots. Carrots buy the gross traps, better weapons and potion. Too many? Swap them for planks.' },
  { art: 'bucket',   head: 'MAKING POTION',  text: 'Build a brewery. Tap a villager and make them a brewer. Each day they cook 1 potion from a few carrots.' },
  { art: 'stone',    head: 'STONE',          text: 'Build a mine right next to the big grey rocks. Miners dig stone. Stone walls cannot be climbed or dug under.' },
  { art: 'hero',     head: 'NIGHT: FIGHT',   text: 'Click where to run, or use WASD. Space or WHACK hits. Hold it to spin. Whacked is not cured!' },
  { art: 'bucket',   head: 'POTION CURES',   text: 'The POTION button cures the nearest zombie. He joins your village! Trap the rest in pits and cure them in the morning.' },
  { art: 'villager', head: 'SAVE THEM',      text: 'A zombie next to a villager munches their brains. Whack him before the red bar fills, or they turn into a zombie.' },
  { art: 'pillow',   head: 'PILLOW FIGHT',   text: 'Once a night, press PILLOWS and everyone runs out to bop the zombies.' },
  { art: 'sock',     head: 'ODD SOCKS',      text: 'Zombies drop odd socks. Tap a villager in the day to buy them a hat with socks.' },
  { art: 'farmer',   head: 'GROW THE VILLAGE', text: 'Every cured zombie is a new villager. 12 villagers and you win!' },
];

// What the land does: tap it in the day (with nothing picked) to hear it
export const LAND = {
  forest: 'The forest. Builders chop trees here for planks. Zombies come out of it at night.',
  water:  'Water. Nobody can walk in it. Zombies cross by the bridges, so guard them.',
  bridge: 'A bridge. The only way over the stream. A great place for traps!',
  rock:   'Big rocks. Nobody can walk through them. Build a mine right next to them to dig stone.',
  pond:   'The pond. Zombies wade in slowly and splash about.',
  track:  'The dirt track. Zombies like to walk along it.',
  grass:  'Grass. You can build anything here.',
};

// Tips: each one shows once a game, when it is useful
export const TIPS = {
  day1:      'Tip: builders get planks, farmers grow carrots. Build walls and traps, then press NIGHT FALLS.',
  brewery:   'Tip: potion is made in a brewery. Build one, then tap a villager and make them a brewer.',
  brewer:    'Tip: you have a brewery but no brewer. Tap a villager and make them a brewer.',
  carrots:   'Tip: lots of carrots! Swap them for planks, buy a better weapon, or build a whoopee cushion.',
  mine:      'Tip: the grey rocks have stone in them. Build a mine right next to them.',
  night1:    'Tip: click to run. Space or WHACK to hit. Hold it to spin. POTION cures.',
  munch:     'Tip: a zombie is munching a villager! Run over and whack him before the red bar fills.',
  pit:       'Tip: zombies in a pit wait till morning. Tap the pit in the day to cure them.',
  nopotion:  'Tip: no potion tonight. Trap zombies in pits and cure them tomorrow.',
  socks:     'Tip: you found an odd sock! Tap a villager in the day to buy them a hat.',
  pillows:   'Tip: press PILLOWS (or F) and the whole village has a pillow fight.',
};
