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
   =========================================================== */

export const ZOMBIES = {
  bob: {
    name: 'Plain Bob',
    art: 'bob',
    speed: 1.2,
    cure: 1,
    wants: 'bed',
    line: ['sock... sock...', 'braaains? no. socks.', 'ooh, carrots'],
    becomes: 'farmer',
  },
  hopper: {
    name: 'Hopper',
    art: 'hopper',
    speed: 2.6,
    cure: 1,
    wants: 'farm',
    line: ['boing', 'boing boing', 'wheee'],
    becomes: 'builder',
  },
  digger: {
    name: 'Digger',
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
    art: 'werewolf',
    speed: 3.2,
    cure: 2,
    wants: 'anyone',
    jumps: true,
    line: ['AWOOO', 'where are my trousers', 'howl'],
    becomes: 'builder',
  },
  giant: {
    name: 'Giant Gary',
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
