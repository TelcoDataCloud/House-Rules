/* ===========================================================
   ROOMS - the map of the house

   Hendrix: this file is the floor plan. The game reads it and
   draws whatever it finds here. The walls, the floors between
   storeys, the roof and the grass all work out where to go from
   the rooms below, so nothing in js/ ever needs touching.

   THE PICTURE
   The whole house is drawn on a picture 1040 wide and 740 tall.
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

   HIDING PLACES
   Give any prop or close up thing a search, like
       search: 'Under your bed'
   and it becomes somewhere you can look. Point at it and it
   lights up. Click it and you rummage. The words are what the
   game says when you find it. No search means it is just
   furniture.

   Try this: find the lounge, change its w from 156 to 240, save,
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

   Your room, Mum and Dad's room and the box room only have an
   anchor on the door. Nothing inside. Adding one is your job in
   M5.
   =========================================================== */

export const PICTURE = { w: 1040, h: 740 };

export const ROOMS = [
  /* --- THE ATTIC, up in the roof, where you hide --- */
  { id: 'attic',    name: 'Attic',         floor: 'attic', paint: 'wood',
    x: 250, y: 150, w: 340, h: 70,
    note: 'You watch the monitors from up here.',
    props: [
      { kind: 'monitors', x: 110 },
      { kind: 'boxes',    x: 232, search: 'Boxes of old toys' },
      { kind: 'porthole', x: 302 }
    ],
    closeUp: [
      { kind: 'trunk',    x: 20, search: 'Old trunk' },
      { kind: 'suitcase', x: 66, search: 'Dusty suitcase', colour: 'fabric-a' },
      { kind: 'teddy',    x: 240, lift: 50 }
    ] },

  /* --- UPSTAIRS --- */
  { id: 'bathroom', name: 'Bathroom',      floor: 'upstairs', paint: 'blue',
    flooring: 'tile',
    x: 48,  y: 232, w: 124, h: 160,
    note: 'Nothing worth stealing. They check anyway.',
    props: [
      { kind: 'bath',   x: 4,  search: 'Behind the bath panel' },
      { kind: 'toilet', x: 92, search: 'Toilet cistern' }
    ],
    closeUp: [
      { kind: 'towel',   x: 30, colour: 'fabric-b' },
      { kind: 'cabinet', x: 93, search: 'Bathroom cabinet' }
    ] },
  { id: 'landing',  name: 'Landing',       floor: 'upstairs',
    flooring: 'carpet',
    x: 176, y: 232, w: 160, h: 160,
    note: 'The stairs come up here. The loft hatch is in the ceiling.',
    props: [
      { kind: 'plant',    x: 2,  search: 'Plant pot' },
      { kind: 'airing',   x: 26, search: 'Airing cupboard' },
      { kind: 'picture',  x: 68 },
      { kind: 'radiator', x: 64, search: 'Behind the radiator' }
    ],
    closeUp: [
      { kind: 'socket', x: 106 }
    ] },
  { id: 'my-room',  name: "Hendrix's room", floor: 'upstairs', paint: 'green',
    flooring: 'carpet',
    x: 340, y: 232, w: 156, h: 160,
    note: 'The workbench lives in here.',
    props: [
      { kind: 'window',    x: 46, colour: 'fabric-c' },
      { kind: 'bed',       x: 2,  colour: 'fabric-c', search: 'Under your bed' },
      { kind: 'workbench', x: 98, search: 'Under the workbench' }
    ],
    closeUp: [
      { kind: 'trophyshelf', x: 2, search: 'Your shelf' },
      { kind: 'football',    x: 60 },
      { kind: 'socket',      x: 88 }
    ] },
  { id: 'big-room', name: "Mum and Dad's", floor: 'upstairs',
    flooring: 'carpet',
    x: 500, y: 232, w: 152, h: 160,
    note: 'Jewellery box. Sid goes straight here.',
    props: [
      { kind: 'wardrobe', x: 2,  search: 'Wardrobe' },
      { kind: 'picture',  x: 86 },
      { kind: 'bed',      x: 54, colour: 'fabric-a', search: 'Under their bed' }
    ],
    closeUp: [
      { kind: 'hatbox',   x: 12, lift: 104, search: 'Box on the wardrobe' },
      { kind: 'slippers', x: 58 }
    ] },
  { id: 'box-room', name: 'Box room',      floor: 'upstairs',
    x: 656, y: 232, w: 136, h: 160,
    note: 'Nobody has opened some of these boxes in years.',
    props: [
      { kind: 'boxes',     x: 6,  search: 'Pile of boxes' },
      { kind: 'bookshelf', x: 80, search: 'Behind the books' }
    ],
    closeUp: [
      { kind: 'suitcase', x: 12, lift: 50, search: 'Old suitcase' },
      { kind: 'teddy',    x: 94, lift: 92 }
    ] },

  /* --- GROUND FLOOR --- */
  { id: 'porch',    name: 'Porch',         floor: 'ground',
    flooring: 'tile',
    x: 48,  y: 402, w: 80,  h: 154,
    note: 'Wellies, coats, and the front door.',
    props: [
      { kind: 'coats', x: 6,  search: 'Coat pockets' },
      { kind: 'plant', x: 56, search: 'Plant pot' }
    ],
    closeUp: [
      { kind: 'mat',       x: 2 },
      { kind: 'umbrellas', x: 41, search: 'Umbrella stand' }
    ] },
  { id: 'hall',     name: 'Hall',          floor: 'ground',
    x: 132, y: 402, w: 160, h: 154,
    note: 'Both of them come through here. Both.',
    props: [
      { kind: 'clock',   x: 2 },
      { kind: 'picture', x: 30, lift: 22, search: 'Behind the picture' }
    ],
    closeUp: [
      { kind: 'keys', x: 4, search: 'Key hooks' },
      { kind: 'post', x: 0 }
    ] },
  { id: 'lounge',   name: 'Lounge',        floor: 'ground',
    x: 296, y: 402, w: 156, h: 154,
    note: 'The telly, and the piano. Always check the piano.',
    props: [
      { kind: 'window', x: 78 },
      { kind: 'rug',    x: 36, search: 'Under the rug' },
      { kind: 'piano',  x: 2,  search: 'Inside the piano' },
      { kind: 'tv',     x: 72, search: 'TV cabinet' },
      { kind: 'lamp',   x: 132 }
    ],
    closeUp: [
      { kind: 'books',  x: 6, lift: 66 },
      { kind: 'socket', x: 134 }
    ] },
  { id: 'dining',   name: 'Dining room',   floor: 'ground',
    x: 456, y: 402, w: 124, h: 154,
    note: 'The cash tin is in the dresser drawer.',
    props: [
      { kind: 'picture', x: 34 },
      { kind: 'table',   x: 2,  search: 'Under the tablecloth' },
      { kind: 'dresser', x: 96, search: 'Dresser drawers' }
    ],
    closeUp: [
      { kind: 'vase',   x: 100, lift: 86, search: 'Big vase' },
      { kind: 'teapot', x: 64,  lift: 37 }
    ] },
  { id: 'kitchen',  name: 'Kitchen',       floor: 'ground', paint: 'yellow',
    flooring: 'tile',
    x: 584, y: 402, w: 118, h: 154,
    note: 'Window, cupboards, and a lot of useful junk.',
    props: [
      { kind: 'window',  x: 44, colour: 'fabric-b' },
      { kind: 'counter', x: 2,  search: 'Kitchen cupboards' },
      { kind: 'fridge',  x: 84, search: 'Fridge' }
    ],
    closeUp: [
      { kind: 'wallcupboard', x: 2,  search: 'Top cupboard' },
      { kind: 'cereal',       x: 88, lift: 84, search: 'On top of the fridge' }
    ] },
  { id: 'utility',  name: 'Utility',       floor: 'ground',
    flooring: 'tile',
    x: 706, y: 402, w: 86,  h: 154,
    note: 'Back door. Steps down to the cellar.',
    props: [
      { kind: 'washer', x: 4,  search: 'Washing machine' },
      { kind: 'boiler', x: 48, search: 'Behind the boiler' },
      { kind: 'bucket', x: 44, search: 'Mop bucket' }
    ],
    closeUp: [
      { kind: 'bottleshelf', x: 2, search: 'Shelf of bottles' }
    ] },

  /* --- THE CELLAR, under the ground --- */
  { id: 'cellar',   name: 'Cellar',        floor: 'cellar',
    x: 456, y: 572, w: 336, h: 128,
    note: 'Dark, far away, and the best junk in the house.',
    props: [
      { kind: 'shelves', x: 8,   search: 'Metal shelves' },
      { kind: 'boxes',   x: 72,  search: 'Old boxes' },
      { kind: 'freezer', x: 142, search: 'Chest freezer' },
      { kind: 'shelves', x: 200, search: 'Back shelves' }
    ],
    closeUp: [
      { kind: 'toolbox', x: 150, lift: 38, search: 'Toolbox on the freezer' },
      { kind: 'tins',    x: 60 }
    ] },

  /* --- OUTSIDE --- */
  { id: 'garage',   name: 'Garage',        floor: 'outside',
    x: 812, y: 460, w: 120, h: 96,
    note: 'Tools, paint, a garden hose.',
    props: [
      { kind: 'pegboard', x: 30, lift: -6, search: 'Tool wall' },
      { kind: 'car',      x: 10, search: 'Car boot' }
    ],
    closeUp: [
      { kind: 'hosereel', x: 98, search: 'Hose reel' }
    ] },
  { id: 'shed',     name: 'Shed',          floor: 'outside', walls: 'planks',
    x: 948, y: 476, w: 84,  h: 80,
    note: 'A long walk. Worth it.',
    props: [
      { kind: 'pegboard',  x: 22, lift: -26, search: 'Shed wall' },
      { kind: 'lawnmower', x: 2,  search: 'Grass box' },
      { kind: 'bucket',    x: 60 }
    ],
    closeUp: [
      { kind: 'flowerpots', x: 44, search: 'Stack of flower pots' }
    ] }
];

/* The three ways between floors. Steps are a staircase, a ladder
   is a ladder. left and right say how wide. bottom is the floor it
   starts on and top is the floor it arrives at, so they line up
   with the floors of the rooms. handrail: false leaves the
   banister off. cupboard: true puts a cupboard under the stairs,
   and search makes its door a hiding place in that room. */
export const STAIRS = [
  { id: 'main',   name: 'The stairs',  kind: 'steps',
    cupboard: true, room: 'hall', search: 'Cupboard under the stairs',
    left: 140, right: 286, bottom: 544, top: 380, steps: 9 },
  { id: 'cellar', name: 'Cellar steps', kind: 'steps', handrail: false,
    left: 712, right: 790, bottom: 688, top: 544, steps: 7 },
  { id: 'loft',   name: 'Loft ladder',  kind: 'ladder',
    left: 306, right: 330, bottom: 380, top: 208, steps: 6 }
];

/* Twenty four anchor points. One trap each, later on. */
export const ANCHORS = [
  /* upstairs */
  { id: 'loft-hatch',    name: 'Loft hatch',       room: 'landing',  mount: 'OVERHEAD', x: 318, y: 244 },
  { id: 'bath-ceiling',  name: 'Bathroom ceiling', room: 'bathroom', mount: 'OVERHEAD', x: 110, y: 290 },
  { id: 'bath-door',     name: 'Bathroom door',    room: 'bathroom', mount: 'DOORWAY',  x: 174, y: 360 },
  { id: 'upstairs-hall', name: 'Upstairs hall',    room: 'landing',  mount: 'OVERHEAD', x: 220, y: 290 },
  { id: 'landing-floor', name: 'Landing floor',    room: 'landing',  mount: 'FLOOR',    x: 206, y: 372 },
  { id: 'stairs-top',    name: 'Top of stairs',    room: 'landing',  mount: 'STAIRS',   x: 282, y: 372 },
  { id: 'my-door',       name: 'Your bedroom door', room: 'my-room', mount: 'DOORWAY',  x: 338, y: 360 },
  { id: 'big-door',      name: 'Their room door',  room: 'big-room', mount: 'DOORWAY',  x: 498, y: 360 },
  { id: 'box-door',      name: 'Box room door',    room: 'box-room', mount: 'DOORWAY',  x: 654, y: 360 },

  /* ground floor */
  { id: 'front-door',    name: 'Front door',       room: 'porch',    mount: 'DOORWAY',  x: 46,  y: 522 },
  { id: 'porch-ceiling', name: 'Porch ceiling',    room: 'porch',    mount: 'OVERHEAD', x: 88,  y: 460 },
  { id: 'stairs-bottom', name: 'Bottom of stairs', room: 'hall',     mount: 'STAIRS',   x: 152, y: 540 },
  { id: 'hall-ceiling',  name: 'Hall ceiling',     room: 'hall',     mount: 'OVERHEAD', x: 186, y: 460 },
  { id: 'lounge-door',   name: 'Lounge door',      room: 'lounge',   mount: 'DOORWAY',  x: 294, y: 522 },
  { id: 'lounge-ceiling',name: 'Lounge ceiling',   room: 'lounge',   mount: 'OVERHEAD', x: 374, y: 460 },
  { id: 'dining-door',   name: 'Dining door',      room: 'dining',   mount: 'DOORWAY',  x: 454, y: 522 },
  { id: 'dining-floor',  name: 'Dining floor',     room: 'dining',   mount: 'FLOOR',    x: 518, y: 536 },
  { id: 'kitchen-door',  name: 'Kitchen door',     room: 'kitchen',  mount: 'DOORWAY',  x: 582, y: 522 },
  { id: 'kitchen-window',name: 'Kitchen window',   room: 'kitchen',  mount: 'DOORWAY',  x: 644, y: 470 },
  { id: 'kitchen-floor', name: 'Kitchen floor',    room: 'kitchen',  mount: 'FLOOR',    x: 644, y: 536 },
  { id: 'utility-door',  name: 'Utility door',     room: 'utility',  mount: 'DOORWAY',  x: 704, y: 522 },
  { id: 'back-door',     name: 'Back door',        room: 'utility',  mount: 'DOORWAY',  x: 794, y: 470 },

  /* the cellar */
  { id: 'cellar-steps',  name: 'Cellar steps',     room: 'cellar',   mount: 'STAIRS',   x: 748, y: 630 },
  { id: 'cellar-floor',  name: 'Cellar floor',     room: 'cellar',   mount: 'FLOOR',    x: 560, y: 682 }
];

/* What each mount type means, in words the game shows on screen.
   Change the line and the caption under the house changes too. */
export const MOUNTS = {
  FLOOR:    { name: 'Floor',    line: 'Something on the ground for them to step in.' },
  DOORWAY:  { name: 'Doorway',  line: 'Something across a gap they walk through.' },
  OVERHEAD: { name: 'Overhead', line: 'Something hanging above their head.' },
  STAIRS:   { name: 'Stairs',   line: 'Something on the stairs. The classic.' }
};
