/* ===========================================================
   ZOMBIES: everyone who comes at night

   Hendrix: each zombie is a picture plus a few numbers.
   To add one, copy a block, give it a new name (the word
   before the colon) and a picture (a file in the art folder),
   then put its name in a "mix" list in data/difficulty.js.

   name      what the game calls it
   art       the picture, art/NAME.svg
   speed     squares per second (the hero is 5)
   cure      buckets of potion it takes to cure it
   wants     what it walks toward: 'bed', 'farm' or 'anyone'
   line      what it groans (one is picked at random)
   jumps     true means fences do not stop it
   digs      true means it goes under walls
   big       true means only the catapult can cure it
   becomes   the job the cured villager gets (data/villagers.js)
   throws    a gross thing it throws at the hero: 'snot', 'gas' or 'bogey'
   trick     a special habit: 'eyeball' (his eye rolls off and he chases it),
             'loosebits' (drops an arm when whacked and hops after it),
             'vomit' (spews a slippy puddle now and then),
             'burp' (a burp flattens fences nearby)
   heavy     true means the spoon does not budge him
   size      how big to draw it (1 is normal)
   quiet     true means no groaning, he sneaks
   tip       what the lookout says the first night this one comes
   bites     true means a villager he reaches turns, no carrying
   hates     a trap word he cannot pass: 'garlic' (data/traps.js)
   fears     what sends him running: 'silver' (the silver bell)
   steals    'carrots' means it runs off with a carrot when it reaches the farm
   harmless  true means it never grabs the hero
   throws    'pumpkin' (the king): a pumpkin lands on a villager's head and
             zombies cannot see him for a while
   =========================================================== */

export const ZOMBIES = {
  bob: {
    name: 'Plain Bob',
    tip: 'Plain Bobs are slow. Whack, then potion.',
    art: 'bob',
    speed: 1.2,
    cure: 1,
    wants: 'bed',
    line: ['sock... sock...', 'braaains? no. socks.', 'ooh, carrots'],
    becomes: 'farmer',
  },
  hopper: {
    name: 'Hopper',
    tip: 'Hoppers jump fences!',
    art: 'hopper',
    speed: 2.6,
    cure: 1,
    wants: 'farm',
    jumps: true,
    line: ['boing', 'boing boing', 'wheee'],
    becomes: 'builder',
  },
  digger: {
    name: 'Digger',
    tip: 'Diggers go under walls. Use mud or a pit.',
    art: 'digger',
    speed: 1.0,
    cure: 1,
    wants: 'bed',
    digs: true,
    line: ['dig dig dig', 'is this a worm', 'tunnel time'],
    becomes: 'builder',
  },
  snot: {
    name: 'Snot Bucket',
    tip: 'Snot Buckets throw snot. Keep moving.',
    art: 'snot',
    speed: 1.1,
    cure: 1,
    wants: 'anyone',
    throws: 'snot',
    line: ['sniiiff', 'got a cold', 'bless me'],
    becomes: 'brewer',
  },
  gasbag: {
    name: 'Gas Bag',
    tip: 'Gas Bags let one go. Hold your nose.',
    art: 'gasbag',
    speed: 0.8,
    cure: 2,
    wants: 'bed',
    throws: 'gas',
    line: ['pardon', 'was that you', 'better out than in'],
    becomes: 'farmer',
  },
  bogey: {
    name: 'Bogey Bomber',
    tip: 'Bogey Bombers flick. Ew.',
    art: 'bogey',
    speed: 2.2,
    cure: 1,
    wants: 'anyone',
    throws: 'bogey',
    line: ['pick', 'flick', 'got a good one'],
    becomes: 'builder',
  },
  eyeball: {
    name: 'Eyeball Roll',
    tip: 'Eyeball Roll chases his own eye.',
    art: 'eyeball',
    speed: 1.3,
    cure: 1,
    wants: 'bed',
    trick: 'eyeball',
    line: ['where did it go', 'eye eye', 'come back'],
    becomes: 'lookout',
  },
  loosebits: {
    name: 'Loose Bits',
    tip: 'Whack Loose Bits and his arm comes off.',
    art: 'loosebits',
    speed: 1.2,
    cure: 1,
    wants: 'bed',
    trick: 'loosebits',
    line: ['oops', 'hang on', 'my arm'],
    becomes: 'farmer',
  },
  vomit: {
    name: 'Vomit Comet',
    tip: 'Vomit Comet makes puddles. Everyone slides.',
    art: 'vomit',
    speed: 1.0,
    cure: 1,
    wants: 'farm',
    trick: 'vomit',
    line: ['urp', 'bad pumpkin', 'oh no'],
    becomes: 'farmer',
  },
  burplord: {
    name: 'Burp Lord',
    tip: 'The Burp Lord burps fences flat. Potion only.',
    art: 'burplord',
    speed: 0.7,
    cure: 2,
    wants: 'bed',
    trick: 'burp',
    heavy: true,
    size: 1.7,
    line: ['BUUURP', 'pardon me', 'more pop'],
    becomes: 'builder',
  },
  werewolf: {
    name: 'Werewolf',
    tip: 'A werewolf! The silver bell sends him off.',
    art: 'werewolf',
    speed: 3.2,
    cure: 2,
    wants: 'anyone',
    jumps: true,
    fears: 'silver',
    line: ['AWOOO', 'where are my trousers', 'howl'],
    becomes: 'builder',
  },
  vampire: {
    name: 'Vampire',
    tip: 'A vampire! Garlic stops him. Torches too.',
    art: 'vampire',
    speed: 1.7,
    cure: 2,
    wants: 'bed',
    quiet: true,
    bites: true,
    hates: 'garlic',
    line: ['...', 'bleh', 'sunscreen'],
    becomes: 'nightshift',
  },
  cow: {
    name: 'Zombie Cow',
    tip: 'A zombie cow. Moos backwards. Cure it for milk.',
    art: 'cow',
    speed: 0.9,
    cure: 1,
    wants: 'farm',
    line: ['oom', 'oooom', 'ooM'],
    becomes: 'cow',
  },
  chicken: {
    name: 'Zombie Chicken',
    tip: 'Zombie chickens steal carrots one at a time.',
    art: 'chicken',
    speed: 2.4,
    cure: 1,
    wants: 'farm',
    steals: 'carrots',
    harmless: true,
    line: ['bwok', 'bwaaak', 'egg?'],
    becomes: 'chicken',
  },
  sheep: {
    name: 'Zombie Sheep',
    tip: 'A zombie sheep. Its wool keeps falling off.',
    art: 'sheep',
    speed: 1.0,
    cure: 1,
    wants: 'bed',
    harmless: true,
    line: ['baa', 'baaaa', 'itchy'],
    becomes: 'sheep',
  },
  pig: {
    name: 'Zombie Pig',
    tip: 'Zombie pigs dig under fences. Cure one for truffles.',
    art: 'pig',
    speed: 1.6,
    cure: 1,
    wants: 'farm',
    digs: true,
    line: ['oink', 'snort', 'mud'],
    becomes: 'pig',
  },
  horse: {
    name: 'Zombie Horse',
    tip: 'A zombie horse! The rider falls off at every fence.',
    art: 'horse',
    speed: 3.0,
    cure: 2,
    wants: 'bed',
    rider: true,
    line: ['neigh', 'whoa', 'hold on'],
    becomes: 'builder',
  },
  goldfish: {
    name: 'Zombie Goldfish',
    tip: 'A zombie goldfish. In a bowl. Somehow.',
    art: 'goldfish',
    speed: 2.0,
    cure: 1,
    wants: 'anyone',
    harmless: true,
    line: ['blub', 'glub', 'flop'],
    becomes: 'farmer',
  },
  pumpkinking: {
    name: 'Pumpkin King',
    tip: 'THE PUMPKIN KING. Catapult only. His pumpkins hide villagers from zombies.',
    art: 'pumpkinking',
    speed: 0.45,
    cure: 3,
    wants: 'bed',
    jumps: true,
    big: true,
    throws: 'pumpkin',
    line: ['BOW TO THE GOURD', 'squash you', 'pie time'],
    becomes: 'pumpkinfarmer',
  },
  giant: {
    name: 'Giant Gary',
    tip: 'Giant Gary. Only the catapult reaches him.',
    art: 'giant',
    speed: 0.5,
    cure: 3,
    wants: 'bed',
    jumps: true,
    big: true,
    line: ['FEE FI FO', 'my foot is stuck', 'hello down there'],
    becomes: 'giant',
  },
};
