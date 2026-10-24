/* ===========================================================
   ROOMS - the map of the house

   Hendrix: this file is the floor plan. The game reads it and
   draws whatever it finds here. The walls, the floors between
   storeys, the roof and the grass all work out where to go from
   the rooms below, so nothing in js/ ever needs touching.

   THE PICTURE
   The whole house is drawn on a picture 1560 wide and 740 tall.
   Every number below is a position on that picture.

   HOW A ROOM WORKS
   Every room is a rectangle. Four numbers say where it is:

       x  how far across from the left
       y  how far down from the top
       w  how wide it is
       h  how tall it is

   Bigger y means further DOWN, which feels backwards until you
   have done it twice.

   Every room also says which floor it is on: attic, upstairs,
   ground, cellar, or outside. Outside ones get their own little
   roof.

   PAINT
   Rooms are white unless they say otherwise. To repaint one, give
   it a paint: white, green, blue, yellow or pink. Those colours
   live in css/tokens.css, so a new colour goes there first.

   FLOORING
   Wood unless it says tile or carpet. The cellar, garage and shed
   are concrete whatever you say, because they would be.

   PROPS
   The furniture. Each one is a kind (the name of a drawing in
   js/props.js) and an x (how far in from the room's left wall).
   Some take a colour, like the duvet on your bed. Some take a
   lift, which moves them up the wall. They are drawn in order, so
   something later in the list stands in front of something
   earlier. Move the piano, swap the bed, add a second plant.

   CLOSE UP
   The small stuff: a teddy, a vase, a shelf of bottles. From the
   whole house they would be a few dots, so they only appear once
   you zoom into the room. Same kind, x and lift as a prop.

   IN THE OPEN
   Places where a bit of junk can be left lying about for anyone
   to see: on the floor, a worktop, the top of the washing machine.
   Each is an x and a lift, like a prop. Every night the game
   picks a few of these and leaves something there. Easy grabs.

   HIDING PLACES
   Give any prop or close up thing a search, like
       search: 'Under your bed', holds: ['toys', 'stuff']
   and it becomes somewhere you can look. Point at it and it
   lights up. Click it and you rummage. Most of the junk hides in
   these. The words are what the game says when you look. No
   search means it is just furniture.

   holds says what sort of thing fits in there: food, fresh,
   tools, toys, washing or stuff (every item has a kind in
   data/items.js). The game puts flour in the kitchen cupboards,
   not the fridge, because the fridge only holds fresh things.
   Leave holds off and anything can go in.

   LOCKS
   Give a hiding place a lock, like
       lock: 'piano'
   and you cannot look inside until you solve its puzzle. Give a
   whole ROOM a lock and you cannot even go in. The puzzles are in
   data/puzzles.js: 'safe', 'shed', 'piano', 'fuse', 'keypad',
   'telly', 'mirror', 'morse', 'books' and 'hoover'.
   A locked room with dark: true has its lights out instead of
   chains, like the cellar until you fix the fuse box.

   Try this: find the lounge, change its w from 234 to 360, save,
   refresh. It eats the dining room. Change it back.

   HOW AN ANCHOR WORKS
   An anchor is a glowing spot where a trap can go later. It has
   an x and a y like a room, plus a mount:

       FLOOR     something on the ground to step in
       DOORWAY   something across a gap they walk through
       OVERHEAD  something hanging above their head
       STAIRS    something on the stairs

   In M5 a trap will only fit an anchor with the same mount, so a
   swinging paint tin needs OVERHEAD and marbles need FLOOR.

   Mum and Dad's room and the box room only have an anchor on the
   door. Your room has one on the floor too (M5): Sid always comes
   in to look at the laptop, so it is a good place for a trap.
   This is the line that added it:

   { id: 'my-floor', name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR', x: 630, y: 372 },

   Try one in the box room: copy it, change the id, name and room,
   and move it with x and y.
   =========================================================== */

export const PICTURE = { w: 1560, h: 740 };

export const ROOMS = [
  /* --- THE ATTIC, up in the roof, where you hide --- */
  { id: 'attic',    name: 'Attic',         floor: 'attic', paint: 'wood',
    x: 375, y: 150, w: 510, h: 70,
    note: 'You watch the monitors from up here.',
    inTheOpen: [ { x: 170 }, { x: 36, lift: 24 }, { x: 440 } ],
    props: [
      { kind: 'monitors', x: 210 },
      { kind: 'toybox',   x: 110, colour: 'fabric-c', search: 'Old toy box', holds: ['toys'] },
      { kind: 'boxes',    x: 360, search: 'Boxes of old toys', holds: ['toys', 'stuff'] },
      { kind: 'porthole', x: 462 }
    ],
    closeUp: [
      { kind: 'trunk',    x: 20, search: 'Old trunk', holds: ['toys', 'stuff'] },
      { kind: 'suitcase', x: 64, search: 'Dusty suitcase', holds: ['stuff', 'toys'], colour: 'fabric-a' },
      { kind: 'teddy',    x: 380, lift: 50 }
    ] },

  /* --- UPSTAIRS --- */
  { id: 'bathroom', name: 'Bathroom',      floor: 'upstairs', paint: 'blue',
    flooring: 'tile',
    x: 72,  y: 232, w: 186, h: 160,
    note: 'The cabinet has a steamed up mirror. Somebody wrote on it.',
    inTheOpen: [ { x: 56, lift: 39 }, { x: 136 } ],
    props: [
      { kind: 'bath',   x: 4,   search: 'Behind the bath panel', holds: ['washing'] },
      { kind: 'sink',   x: 102, search: 'Under the sink', holds: ['washing', 'tools'] },
      { kind: 'toilet', x: 150, search: 'Toilet cistern', holds: ['washing'] }
    ],
    closeUp: [
      { kind: 'towel',   x: 40, colour: 'fabric-b' },
      { kind: 'cabinet', x: 101, search: 'Bathroom cabinet', lock: 'mirror' }
    ] },
  { id: 'landing',  name: 'Landing',       floor: 'upstairs',
    flooring: 'carpet',
    x: 264, y: 232, w: 240, h: 160,
    note: 'The stairs come up here. The loft hatch is in the ceiling.',
    inTheOpen: [ { x: 176 }, { x: 108, lift: 30 } ],
    props: [
      { kind: 'plant',    x: 4,   search: 'Plant pot', holds: ['tools', 'stuff'] },
      { kind: 'airing',   x: 30,  search: 'Airing cupboard', holds: ['washing', 'stuff'] },
      { kind: 'picture',  x: 104 },
      { kind: 'radiator', x: 96,  search: 'Behind the radiator', holds: ['toys', 'stuff'] },
      { kind: 'drawers',  x: 142, search: 'Landing drawers', holds: ['washing', 'stuff'] }
    ],
    closeUp: [
      { kind: 'socket', x: 196 }
    ] },
  { id: 'my-room',  name: "Hendrix's room", floor: 'upstairs', paint: 'green',
    flooring: 'carpet',
    x: 510, y: 232, w: 234, h: 160,
    note: 'The workbench lives in here.',
    inTheOpen: [ { x: 158 }, { x: 192, lift: 42 } ],
    props: [
      { kind: 'window',    x: 76, colour: 'fabric-c' },
      { kind: 'bed',       x: 4,   colour: 'fabric-c', search: 'Under your bed', holds: ['toys', 'stuff'] },
      { kind: 'toybox',    x: 108, search: 'Your toy box', holds: ['toys'] },
      { kind: 'workbench', x: 172, search: 'Under the workbench', holds: ['tools', 'toys'] }
    ],
    closeUp: [
      { kind: 'trophyshelf', x: 4, search: 'Your shelf', holds: ['toys'] },
      { kind: 'football',    x: 150 },
      { kind: 'socket',      x: 160 }
    ] },
  { id: 'big-room', name: "Mum and Dad's", floor: 'upstairs',
    flooring: 'carpet',
    x: 750, y: 232, w: 228, h: 160,
    note: 'Jewellery box, and a safe on the wall. What is in the safe?',
    inTheOpen: [ { x: 66 }, { x: 140, lift: 36 } ],
    props: [
      { kind: 'wardrobe', x: 4,   search: 'Wardrobe', holds: ['stuff', 'washing'] },
      { kind: 'safe',     x: 70,  search: 'Wall safe', lock: 'safe' },
      { kind: 'picture',  x: 126 },
      { kind: 'bed',      x: 98,  colour: 'fabric-a', search: 'Under their bed', holds: ['stuff', 'toys'] },
      { kind: 'bedside',  x: 198, search: 'Bedside drawer', holds: ['stuff'] }
    ],
    closeUp: [
      { kind: 'hatbox',   x: 14, lift: 104, search: 'Box on the wardrobe', holds: ['stuff'] },
      { kind: 'slippers', x: 70 }
    ] },
  { id: 'box-room', name: 'Box room',      floor: 'upstairs',
    x: 984, y: 232, w: 204, h: 160,
    note: 'Nobody has opened some of these boxes in years. The books are in a funny order.',
    inTheOpen: [ { x: 116, lift: 27 }, { x: 146 } ],
    props: [
      { kind: 'boxes',     x: 6,   search: 'Pile of boxes', holds: ['toys', 'stuff', 'tools'] },
      { kind: 'trunk',     x: 100, search: 'Old trunk', holds: ['toys', 'stuff'] },
      { kind: 'bookshelf', x: 150, search: 'Behind the books', lock: 'books' }
    ],
    closeUp: [
      { kind: 'suitcase', x: 14, lift: 50, search: 'Old suitcase', holds: ['stuff', 'toys'] },
      { kind: 'teddy',    x: 166, lift: 92 }
    ] },

  /* --- GROUND FLOOR --- */
  { id: 'porch',    name: 'Porch',         floor: 'ground',
    flooring: 'tile',
    x: 72,  y: 402, w: 120, h: 154,
    note: 'Wellies, coats, and a key safe that beeps.',
    inTheOpen: [ { x: 6 }, { x: 70, lift: 28 } ],
    props: [
      { kind: 'coats',    x: 10,  search: 'Coat pockets', holds: ['toys', 'stuff'] },
      { kind: 'keysafe',  x: 72,  search: 'Key safe', lock: 'morse' },
      { kind: 'shoerack', x: 58,  search: 'Shoe rack', holds: ['stuff', 'toys'] },
      { kind: 'plant',    x: 100, search: 'Plant pot', holds: ['tools', 'stuff'] }
    ],
    closeUp: [
      { kind: 'mat',       x: 2 },
      { kind: 'umbrellas', x: 46, search: 'Umbrella stand', holds: ['toys', 'stuff'] }
    ] },
  { id: 'hall',     name: 'Hall',          floor: 'ground',
    x: 198, y: 402, w: 240, h: 154,
    note: 'Both of them come through here. Both. The robot hoover lives under the stairs.',
    props: [
      { kind: 'clock',   x: 4 },
      { kind: 'picture', x: 44, lift: 22, search: 'Behind the picture', holds: ['stuff'] }
    ],
    closeUp: [
      { kind: 'keys', x: 6, search: 'Key hooks', holds: ['stuff'] },
      { kind: 'post', x: 0 }
    ] },
  { id: 'lounge',   name: 'Lounge',        floor: 'ground',
    x: 444, y: 402, w: 234, h: 154,
    note: 'The telly, the sofa and the piano. The piano lid and the TV cabinet are locked.',
    inTheOpen: [ { x: 60 }, { x: 150, lift: 22 } ],
    props: [
      { kind: 'window', x: 120 },
      { kind: 'rug',    x: 96,  search: 'Under the rug', holds: ['toys'] },
      { kind: 'piano',  x: 4,   search: 'Inside the piano', lock: 'piano' },
      { kind: 'lamp',   x: 96 },
      { kind: 'sofa',   x: 84,  colour: 'fabric-b', search: 'Down the back of the sofa', holds: ['toys', 'stuff', 'food'] },
      { kind: 'tv',     x: 176, search: 'TV cabinet', lock: 'telly' }
    ],
    closeUp: [
      { kind: 'books',  x: 10, lift: 78 },
      { kind: 'socket', x: 220 }
    ] },
  { id: 'dining',   name: 'Dining room',   floor: 'ground',
    x: 684, y: 402, w: 186, h: 154,
    note: 'The cash tin is on the dresser.',
    inTheOpen: [ { x: 30, lift: 37 }, { x: 116, lift: 84 } ],
    props: [
      { kind: 'picture', x: 60 },
      { kind: 'table',   x: 4,   search: 'Under the tablecloth', holds: ['food', 'stuff'] },
      { kind: 'drawers', x: 106, search: 'Sideboard', holds: ['food', 'stuff', 'washing'] },
      { kind: 'dresser', x: 154, search: 'Dresser drawers', holds: ['stuff', 'food'] }
    ],
    closeUp: [
      { kind: 'vase',   x: 160, lift: 86, search: 'Big vase', holds: ['stuff'] },
      { kind: 'teapot', x: 62,  lift: 37 }
    ] },
  { id: 'kitchen',  name: 'Kitchen',       floor: 'ground', paint: 'yellow',
    flooring: 'tile',
    x: 876, y: 402, w: 177, h: 154,
    note: 'Window, cupboards, the cooker, and a lot of useful junk.',
    inTheOpen: [ { x: 40, lift: 45 }, { x: 104, lift: 48 } ],
    props: [
      { kind: 'window',  x: 70, colour: 'fabric-b' },
      { kind: 'counter', x: 4,   search: 'Kitchen cupboards', holds: ['food', 'washing'] },
      { kind: 'cooker',  x: 94,  search: 'Oven drawer', holds: ['food', 'tools'] },
      { kind: 'fridge',  x: 138, search: 'Fridge', holds: ['fresh'] }
    ],
    closeUp: [
      { kind: 'wallcupboard', x: 4,   search: 'Top cupboard', holds: ['food'] },
      { kind: 'cereal',       x: 143, lift: 84, search: 'On top of the fridge', holds: ['food', 'fresh'] }
    ] },
  { id: 'utility',  name: 'Utility',       floor: 'ground',
    flooring: 'tile',
    x: 1059, y: 402, w: 129, h: 154,
    note: 'Back door. Steps down to the cellar.',
    inTheOpen: [ { x: 12, lift: 40 }, { x: 52 } ],
    props: [
      { kind: 'washer',  x: 4,  search: 'Washing machine', holds: ['washing'] },
      { kind: 'fusebox', x: 20 },
      { kind: 'bucket',  x: 64, search: 'Mop bucket', holds: ['washing'] },
      { kind: 'boiler',  x: 92, search: 'Behind the boiler', holds: ['tools', 'washing'] }
    ],
    closeUp: [
      { kind: 'bottleshelf', x: 54, search: 'Shelf of bottles', holds: ['food', 'washing'] }
    ] },

  /* --- THE CELLAR, under the ground --- */
  { id: 'cellar',   name: 'Cellar',        floor: 'cellar',
    x: 684, y: 572, w: 504, h: 128, lock: 'fuse', dark: true,
    note: 'Dark, far away, and the best junk in the house.',
    inTheOpen: [ { x: 160 }, { x: 222, lift: 38 }, { x: 372 } ],
    props: [
      { kind: 'shelves',   x: 12,  search: 'Metal shelves', holds: ['tools', 'food'] },
      { kind: 'boxes',     x: 90,  search: 'Old boxes', holds: ['stuff', 'toys'] },
      { kind: 'freezer',   x: 170, search: 'Chest freezer', holds: ['fresh'] },
      { kind: 'workbench', x: 248, search: 'Old workbench', holds: ['tools', 'toys'] },
      { kind: 'shelves',   x: 316, search: 'Back shelves', holds: ['tools', 'food'] }
    ],
    closeUp: [
      { kind: 'toolbox', x: 182, lift: 38, search: 'Toolbox on the freezer', holds: ['tools'] },
      { kind: 'tins',    x: 64 }
    ] },

  /* --- OUTSIDE --- */
  { id: 'garage',   name: 'Garage',        floor: 'outside',
    x: 1218, y: 460, w: 180, h: 96, lock: 'keypad',
    note: 'Tools, paint, a garden hose. The door has a keypad.',
    inTheOpen: [ { x: 128 } ],
    props: [
      { kind: 'pegboard', x: 112, lift: -6, search: 'Tool wall', holds: ['tools'] },
      { kind: 'car',      x: 8,   search: 'Car boot', holds: ['tools', 'stuff'] }
    ],
    closeUp: [
      { kind: 'hosereel', x: 156, search: 'Hose reel', holds: ['tools'] }
    ] },
  { id: 'shed',     name: 'Shed',          floor: 'outside', walls: 'planks',
    x: 1422, y: 476, w: 126, h: 80, lock: 'shed',
    note: 'A long walk, and a padlock. Worth it.',
    inTheOpen: [ { x: 60 } ],
    props: [
      { kind: 'pegboard',  x: 48, lift: -26, search: 'Shed wall', holds: ['tools', 'stuff', 'toys'] },
      { kind: 'lawnmower', x: 4,  search: 'Grass box', holds: ['tools'] },
      { kind: 'bucket',    x: 100 }
    ],
    closeUp: [
      { kind: 'flowerpots', x: 80, search: 'Stack of flower pots', holds: ['tools', 'fresh'] }
    ] }
];

/* The three ways between floors. Steps are a staircase, a ladder
   is a ladder. left and right say how wide. bottom is the floor it
   starts on and top is the floor it arrives at, so they line up
   with the floors of the rooms. handrail: false leaves the
   banister off. cupboard: true puts a cupboard under the stairs,
   and search makes its door a hiding place in that room.

   joins says which two rooms the stairs connect: the room at the
   bottom first, then the room at the top. That is how you get
   from one floor to another. Steps always climb from left to
   right. */
export const STAIRS = [
  { id: 'main',   name: 'The stairs',  kind: 'steps', joins: ['hall', 'landing'],
    cupboard: true, room: 'hall', search: 'Cupboard under the stairs', lock: 'hoover',
    left: 210, right: 429, bottom: 544, top: 380, steps: 9 },
  { id: 'cellar', name: 'Cellar steps', kind: 'steps', joins: ['cellar', 'utility'],
    handrail: false,
    left: 1068, right: 1185, bottom: 688, top: 544, steps: 7 },
  { id: 'loft',   name: 'Loft ladder',  kind: 'ladder', joins: ['landing', 'attic'],
    left: 459, right: 495, bottom: 380, top: 208, steps: 6 }
];

/* Thirty two anchor points. One trap each. */
export const ANCHORS = [
  /* upstairs */
  { id: 'loft-hatch',    name: 'Loft hatch',       room: 'landing',  mount: 'OVERHEAD', x: 477, y: 244 },
  { id: 'bath-ceiling',  name: 'Bathroom ceiling', room: 'bathroom', mount: 'OVERHEAD', x: 165, y: 290 },
  { id: 'bath-door',     name: 'Bathroom door',    room: 'bathroom', mount: 'DOORWAY',  x: 261, y: 360 },
  { id: 'upstairs-hall', name: 'Upstairs hall',    room: 'landing',  mount: 'OVERHEAD', x: 330, y: 290 },
  { id: 'landing-floor', name: 'Landing floor',    room: 'landing',  mount: 'FLOOR',    x: 309, y: 372 },
  { id: 'stairs-top',    name: 'Top of stairs',    room: 'landing',  mount: 'STAIRS',   x: 423, y: 372 },
  { id: 'my-door',       name: 'Your bedroom door', room: 'my-room', mount: 'DOORWAY',  x: 507, y: 360 },
  { id: 'my-floor',      name: 'Your bedroom floor', room: 'my-room', mount: 'FLOOR',    x: 630, y: 372 },
  { id: 'big-door',      name: 'Their room door',  room: 'big-room', mount: 'DOORWAY',  x: 747, y: 360 },
  { id: 'box-door',      name: 'Box room door',    room: 'box-room', mount: 'DOORWAY',  x: 981, y: 360 },
  { id: 'big-floor',     name: 'Their bedroom floor', room: 'big-room', mount: 'FLOOR', x: 830, y: 372 },
  { id: 'big-ceiling',   name: 'Their bedroom ceiling', room: 'big-room', mount: 'OVERHEAD', x: 920, y: 290 },
  { id: 'box-floor',     name: 'Box room floor',   room: 'box-room', mount: 'FLOOR',    x: 1070, y: 372 },

  /* ground floor */
  { id: 'front-door',    name: 'Front door',       room: 'porch',    mount: 'DOORWAY',  x: 69,  y: 522 },
  { id: 'porch-ceiling', name: 'Porch ceiling',    room: 'porch',    mount: 'OVERHEAD', x: 132,  y: 460 },
  { id: 'stairs-bottom', name: 'Bottom of stairs', room: 'hall',     mount: 'STAIRS',   x: 228, y: 540 },
  { id: 'hall-ceiling',  name: 'Hall ceiling',     room: 'hall',     mount: 'OVERHEAD', x: 279, y: 460 },
  { id: 'hall-floor',    name: 'Hall floor',       room: 'hall',     mount: 'FLOOR',    x: 380, y: 536 },
  { id: 'lounge-door',   name: 'Lounge door',      room: 'lounge',   mount: 'DOORWAY',  x: 441, y: 522 },
  { id: 'lounge-ceiling',name: 'Lounge ceiling',   room: 'lounge',   mount: 'OVERHEAD', x: 561, y: 460 },
  { id: 'lounge-floor',  name: 'Lounge floor',     room: 'lounge',   mount: 'FLOOR',    x: 514, y: 536 },
  { id: 'dining-door',   name: 'Dining door',      room: 'dining',   mount: 'DOORWAY',  x: 681, y: 522 },
  { id: 'dining-floor',  name: 'Dining floor',     room: 'dining',   mount: 'FLOOR',    x: 777, y: 536 },
  { id: 'dining-ceiling',name: 'Dining ceiling',   room: 'dining',   mount: 'OVERHEAD', x: 774, y: 460 },
  { id: 'kitchen-door',  name: 'Kitchen door',     room: 'kitchen',  mount: 'DOORWAY',  x: 873, y: 522 },
  { id: 'kitchen-window',name: 'Kitchen window',   room: 'kitchen',  mount: 'DOORWAY',  x: 966, y: 470 },
  { id: 'kitchen-floor', name: 'Kitchen floor',    room: 'kitchen',  mount: 'FLOOR',    x: 966, y: 536 },
  { id: 'kitchen-ceiling',name: 'Kitchen ceiling', room: 'kitchen',  mount: 'OVERHEAD', x: 996, y: 460 },
  { id: 'utility-door',  name: 'Utility door',     room: 'utility',  mount: 'DOORWAY',  x: 1056, y: 522 },
  { id: 'back-door',     name: 'Back door',        room: 'utility',  mount: 'DOORWAY',  x: 1191, y: 470 },

  /* the cellar */
  { id: 'cellar-steps',  name: 'Cellar steps',     room: 'cellar',   mount: 'STAIRS',   x: 1122, y: 630 },
  { id: 'cellar-floor',  name: 'Cellar floor',     room: 'cellar',   mount: 'FLOOR',    x: 840, y: 682 }
];

/* What each mount type means, in words the game shows on screen.
   Change the line and the caption under the house changes too. */
export const MOUNTS = {
  FLOOR:    { name: 'Floor',    line: 'Something on the ground for them to step in.' },
  DOORWAY:  { name: 'Doorway',  line: 'Something across a gap they walk through.' },
  OVERHEAD: { name: 'Overhead', line: 'Something hanging above their head.' },
  STAIRS:   { name: 'Stairs',   line: 'Something on the stairs. The classic.' }
};
