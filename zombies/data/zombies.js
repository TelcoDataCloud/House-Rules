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
   throws    a gross thing it throws at the hero: 'snot' or 'gas'
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
