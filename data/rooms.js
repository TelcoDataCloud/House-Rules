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
  { id: 'attic',    name: 'Attic',         floor: 'attic',
    x: 250, y: 150, w: 340, h: 70,
    note: 'You watch the monitors from up here.' },

  /* --- UPSTAIRS --- */
  { id: 'bathroom', name: 'Bathroom',      floor: 'upstairs',
    x: 48,  y: 232, w: 124, h: 160,
    note: 'Nothing worth stealing. They check anyway.' },
  { id: 'landing',  name: 'Landing',       floor: 'upstairs',
    x: 176, y: 232, w: 160, h: 160,
    note: 'The stairs come up here. The loft hatch is in the ceiling.' },
  { id: 'my-room',  name: "Hendrix's room", floor: 'upstairs',
    x: 340, y: 232, w: 156, h: 160,
    note: 'The workbench lives in here.' },
  { id: 'big-room', name: "Mum and Dad's", floor: 'upstairs',
    x: 500, y: 232, w: 152, h: 160,
    note: 'Jewellery box. Sid goes straight here.' },
  { id: 'box-room', name: 'Box room',      floor: 'upstairs',
    x: 656, y: 232, w: 136, h: 160,
    note: 'Nobody has opened some of these boxes in years.' },

  /* --- GROUND FLOOR --- */
  { id: 'porch',    name: 'Porch',         floor: 'ground',
    x: 48,  y: 402, w: 80,  h: 154,
    note: 'Wellies, coats, and the front door.' },
  { id: 'hall',     name: 'Hall',          floor: 'ground',
    x: 132, y: 402, w: 160, h: 154,
    note: 'Both of them come through here. Both.' },
  { id: 'lounge',   name: 'Lounge',        floor: 'ground',
    x: 296, y: 402, w: 156, h: 154,
    note: 'The telly. The one Bruno really wants.' },
  { id: 'dining',   name: 'Dining room',   floor: 'ground',
    x: 456, y: 402, w: 124, h: 154,
    note: 'The cash tin is in the sideboard.' },
  { id: 'kitchen',  name: 'Kitchen',       floor: 'ground',
    x: 584, y: 402, w: 118, h: 154,
    note: 'Window, cupboards, and a lot of useful junk.' },
  { id: 'utility',  name: 'Utility',       floor: 'ground',
    x: 706, y: 402, w: 86,  h: 154,
    note: 'Back door. Steps down to the cellar.' },

  /* --- THE CELLAR, under the ground --- */
  { id: 'cellar',   name: 'Cellar',        floor: 'cellar',
    x: 456, y: 572, w: 336, h: 128,
    note: 'Dark, far away, and the best junk in the house.' },

  /* --- OUTSIDE --- */
  { id: 'garage',   name: 'Garage',        floor: 'outside',
    x: 812, y: 460, w: 120, h: 96,
    note: 'Tools, paint, a garden hose.' },
  { id: 'shed',     name: 'Shed',          floor: 'outside',
    x: 948, y: 476, w: 84,  h: 80,
    note: 'A long walk. Worth it.' }
];

/* The three ways between floors. Steps are a staircase, a ladder
   is a ladder. left and right say how wide, bottom and top say
   how far it climbs. */
export const STAIRS = [
  { id: 'main',   name: 'The stairs',  kind: 'steps',
    left: 140, right: 286, bottom: 556, top: 392, steps: 9 },
  { id: 'cellar', name: 'Cellar steps', kind: 'steps',
    left: 712, right: 790, bottom: 700, top: 556, steps: 7 },
  { id: 'loft',   name: 'Loft ladder',  kind: 'ladder',
    left: 306, right: 330, bottom: 392, top: 222, steps: 6 }
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
