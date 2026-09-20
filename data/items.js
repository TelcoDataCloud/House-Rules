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
       rare    true for the special ones. Only a couple turn up
               each night, and only in awkward places.

   THE LOOKS YOU CAN PICK FROM
       bucket  marbles  bottle  pillow  string  rope  sack  tape
       cans  flour  toycar  hairdryer  bell  tin  jar  skate
       lights  hose  blender  glitter  balloon
   Anything else gets a brown parcel, so a typo never breaks
   the game. It just looks like a parcel.

   YOUR TURN (M3)
   Add your Water Balloon to the end of the common list:
       { id: 'water-balloon', name: 'Water Balloon', look: 'balloon', colour: 'fabric-b' },
   Save, refresh, start a night, and go and find it.
   =========================================================== */

export const ITEMS = [
  /* --- COMMON: every one of these is in the house every night --- */
  { id: 'bucket',       name: 'Bucket',         look: 'bucket' },
  { id: 'marbles',      name: 'Marbles',        look: 'marbles' },
  { id: 'cooking-oil',  name: 'Cooking Oil',    look: 'bottle' },
  { id: 'pillow',       name: 'Feather Pillow', look: 'pillow' },
  { id: 'string',       name: 'String',         look: 'string' },
  { id: 'rope',         name: 'Rope',           look: 'rope' },
  { id: 'sack',         name: 'Sack',           look: 'sack' },
  { id: 'duct-tape',    name: 'Duct Tape',      look: 'tape' },
  { id: 'tin-cans',     name: 'Tin Cans',       look: 'cans' },
  { id: 'flour',        name: 'Bag of Flour',   look: 'flour' },
  { id: 'toy-car',      name: 'Toy Car',        look: 'toycar' },
  { id: 'hair-dryer',   name: 'Hair Dryer',     look: 'hairdryer' },
  { id: 'bell',         name: 'Bell',           look: 'bell' },
  { id: 'paint-tin',    name: 'Paint Tin',      look: 'tin' },
  { id: 'honey',        name: 'Jar of Honey',   look: 'jar' },
  { id: 'roller-skate', name: 'Roller Skate',   look: 'skate' },

  /* --- RARE: only a couple of these turn up each night --- */
  { id: 'lights',         name: 'Christmas Lights', look: 'lights',  rare: true },
  { id: 'garden-hose',    name: 'Garden Hose',      look: 'hose',    rare: true },
  { id: 'blender',        name: 'Blender',          look: 'blender', rare: true },
  { id: 'glitter-cannon', name: 'Glitter Cannon',   look: 'glitter', rare: true }
];

/* How many things you can carry. When your bag is full, it is
   full. Choose carefully. */
export const CARRY_LIMIT = 8;

/* How many of the common things are left lying about in plain
   sight each night. The rest are hidden. Make it 16 and nothing
   is hidden at all. Make it 0 and you have to search for the lot. */
export const OUT_IN_THE_OPEN = 6;

/* How many rare things turn up each night. */
export const RARE_EACH_NIGHT = 2;

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
