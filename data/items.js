/* ===========================================================
   ITEMS - the junk you raid your own house for

   Hendrix: every thing you can pick up during the scavenge is
   one line in this list. The game reads it at the start of
   every night and scatters the things round the house. Some
   end up lying about where anyone could see them. The rest go
   in cupboards, drawers, under beds and inside the piano.

   HOW AN ITEM WORKS
       id      a short name the game uses. Small letters, dashes
               instead of spaces, no two the same.
       name    what the game calls it on screen.
       look    which drawing to use, from the list below.
       colour  optional. A colour name from css/tokens.css, like
               'fabric-b'. Changes the main colour of the drawing.
       rare    true for the special ones. Only a few turn up
               each night, and only in awkward places (the safe,
               the piano, the shed, the cellar).
       kind    what sort of thing it is, so it hides somewhere that
               makes sense: food, fresh, tools, toys, washing or
               stuff. Food goes in cupboards, fresh things in the
               fridge, tools on the tool wall. Every hiding place
               in data/rooms.js says which kinds it holds.
       foundIn which rooms it usually lives in. Flour hides in
               the kitchen, rope in the garage. The game hides it
               in one of those rooms if it can, so if you want
               flour, go to the kitchen.
       worksAs other things it can stand in for in a trap. String
               works as rope (a bit weaker, nobody can tell in the
               dark). So a trap that needs rope also takes string.
       riddle  how YOU describe it at the workbench when you are
               dropping a hint. Never say its name! Say what it is
               like, so an eight year old could guess it.
               'something bees make' is a good one for honey.

   THE LOOKS YOU CAN PICK FROM
       bucket  marbles  bottle  pillow  string  rope  sack  tape
       cans  flour  toycar  hairdryer  bell  tin  jar  skate
       lights  hose  blender  glitter  balloon
       banana  cushion  custard  alarm  chicken  loo
   Anything else gets a brown parcel, so a typo never breaks
   the game. It just looks like a parcel.

   YOUR WATER BALLOON (M3)
   It is in! It is the last thing in the common list. This is the
   line that added it:
       { id: 'water-balloon', name: 'Water Balloon', look: 'balloon', colour: 'fabric-b', kind: 'toys',
         riddle: 'a squidgy rubber thing full of water', foundIn: ['bathroom', 'kitchen'] },
   Find it in the bathroom or the kitchen. It makes the Splash
   Line, and it turns a Flour Bomb into your Glue Bomb.
   =========================================================== */

export const ITEMS = [
  /* --- COMMON: every one of these is in the house every night --- */
  { id: 'bucket',       name: 'Bucket',         look: 'bucket', kind: 'washing',
    riddle: 'something you take to the beach to build castles',
    foundIn: ['utility', 'garage', 'shed'], worksAs: ['sack'] },
  { id: 'marbles',      name: 'Marbles',        look: 'marbles', kind: 'toys',
    riddle: 'little glass balls that roll under the sofa',
    foundIn: ['my-room', 'box-room', 'attic'] },
  { id: 'cooking-oil',  name: 'Cooking Oil',    look: 'bottle', kind: 'food',
    riddle: 'something slippy that lives next to the cooker',
    foundIn: ['kitchen', 'utility'] },
  { id: 'pillow',       name: 'Feather Pillow', look: 'pillow', kind: 'stuff',
    riddle: 'something soft and fluffy you put your head on',
    foundIn: ['my-room', 'big-room', 'box-room'] },
  { id: 'string',       name: 'String',         look: 'string', kind: 'tools',
    riddle: 'something long and thin that cats love to chase',
    foundIn: ['kitchen', 'utility', 'box-room', 'attic'], worksAs: ['rope'] },
  { id: 'rope',         name: 'Rope',           look: 'rope', kind: 'tools',
    riddle: 'something long and strong, for tug of war',
    foundIn: ['garage', 'shed', 'cellar'] },
  { id: 'sack',         name: 'Sack',           look: 'sack', kind: 'tools',
    riddle: 'a big baggy bag, like for potatoes',
    foundIn: ['cellar', 'shed', 'garage'] },
  { id: 'duct-tape',    name: 'Duct Tape',      look: 'tape', kind: 'tools',
    riddle: 'something sticky that comes on a roll',
    foundIn: ['garage', 'cellar', 'utility'], worksAs: ['string', 'rope'] },
  { id: 'tin-cans',     name: 'Tin Cans',       look: 'cans', kind: 'food',
    riddle: 'something that rattles when you kick it',
    foundIn: ['kitchen', 'cellar'], worksAs: ['bell'] },
  { id: 'flour',        name: 'Bag of Flour',   look: 'flour', kind: 'food',
    riddle: 'white powder for baking cakes',
    foundIn: ['kitchen', 'cellar'] },
  { id: 'toy-car',      name: 'Toy Car',        look: 'toycar', kind: 'toys',
    riddle: 'something tiny with four wheels',
    foundIn: ['my-room', 'attic', 'lounge'], worksAs: ['roller-skate'] },
  { id: 'hair-dryer',   name: 'Hair Dryer',     look: 'hairdryer', kind: 'washing',
    riddle: 'something that blows hot wind at your head',
    foundIn: ['bathroom', 'big-room'] },
  { id: 'bell',         name: 'Bell',           look: 'bell', kind: 'stuff',
    riddle: 'something that goes DING',
    foundIn: ['hall', 'porch', 'attic', 'dining'], worksAs: ['alarm-clock'] },
  { id: 'paint-tin',    name: 'Paint Tin',      look: 'tin', kind: 'tools',
    riddle: 'something heavy and full of colour',
    foundIn: ['garage', 'shed', 'cellar'], worksAs: ['custard'] },
  { id: 'honey',        name: 'Jar of Honey',   look: 'jar', kind: 'food',
    riddle: 'something bees make',
    foundIn: ['kitchen', 'dining'], worksAs: ['custard'] },
  { id: 'roller-skate', name: 'Roller Skate',   look: 'skate', kind: 'toys',
    riddle: 'a shoe with wheels on',
    foundIn: ['my-room', 'porch', 'box-room'], worksAs: ['toy-car'] },
  { id: 'banana',       name: 'Banana',         look: 'banana', kind: 'fresh',
    riddle: 'a yellow fruit that monkeys love',
    foundIn: ['kitchen', 'dining'] },
  { id: 'whoopee',      name: 'Whoopee Cushion', look: 'cushion', kind: 'toys',
    riddle: 'something that makes a rude noise when you sit on it',
    foundIn: ['my-room', 'lounge', 'attic'] },
  { id: 'custard',      name: 'Tin of Custard', look: 'custard', kind: 'food',
    riddle: 'something yellow and gloopy you pour on pudding',
    foundIn: ['kitchen', 'cellar', 'dining'], worksAs: ['paint-tin', 'honey'] },
  { id: 'alarm-clock',  name: 'Alarm Clock',    look: 'alarm', kind: 'stuff',
    riddle: 'something that goes BRRRING in the morning',
    foundIn: ['big-room', 'my-room', 'landing'], worksAs: ['bell'] },
  { id: 'rubber-chicken', name: 'Rubber Chicken', look: 'chicken', kind: 'toys',
    riddle: 'a bird that is not real and goes squeak',
    foundIn: ['box-room', 'attic', 'my-room'] },
  { id: 'loo-roll',     name: 'Loo Roll',       look: 'loo', kind: 'washing',
    riddle: 'paper on a roll that lives in the bathroom',
    foundIn: ['bathroom', 'landing', 'utility'], worksAs: ['string'] },
  { id: 'water-balloon', name: 'Water Balloon', look: 'balloon', colour: 'fabric-b', kind: 'toys',
    riddle: 'a squidgy rubber thing full of water', foundIn: ['bathroom', 'kitchen'] },

  /* --- RARE: only a few of these turn up each night --- */
  { id: 'lights',         name: 'Christmas Lights', look: 'lights', kind: 'stuff',  rare: true,
    riddle: 'something twinkly that comes out at Christmas',
    foundIn: ['attic', 'box-room', 'cellar'] },
  { id: 'garden-hose',    name: 'Garden Hose',      look: 'hose', kind: 'tools',    rare: true,
    riddle: 'a long green snake that squirts',
    foundIn: ['garage', 'shed'] },
  { id: 'blender',        name: 'Blender',          look: 'blender', kind: 'food', rare: true,
    riddle: 'a kitchen thing that goes WHIZZ',
    foundIn: ['kitchen', 'cellar'] },
  { id: 'glitter-cannon', name: 'Glitter Cannon',   look: 'glitter', kind: 'toys', rare: true,
    riddle: 'something sparkly that goes BOOM',
    foundIn: ['my-room', 'box-room', 'attic'] }
];

/* How many things you can carry. When your bag is full, tap
   something in your bag to drop it, then grab the better thing. */
export const CARRY_LIMIT = 15;

/* How many of the common things are left lying about in plain
   sight each night. The rest are hidden. Make it 22 and nothing
   is hidden at all. Make it 0 and you have to search for the lot. */
export const OUT_IN_THE_OPEN = 7;

/* How many rare things turn up each night. The locked places in
   data/puzzles.js (the safe, the piano, the shed, the dark cellar)
   get one each, in that order, until they run out. */
export const RARE_EACH_NIGHT = 4;

/* Where the rare things are allowed to hide. A room name means any
   hiding place in that room. A hiding place's full name, like
   lounge-inside-the-piano, means just that one. The piano is your
   pick. */
export const RARE_HIDEOUTS = [
  'cellar',
  'box-room',
  'shed',
  'garage',
  'lounge-inside-the-piano'
];
