/* ===========================================================
   ROOMS - the map of the house

   Hendrix: this file is the floor plan. The game reads it and
   draws whatever it finds here. Nothing in js/ needs touching.

   HOW A ROOM WORKS
   Every room is a rectangle. Four numbers say where it is:

       x  how far across from the left
       y  how far down from the top
       w  how wide it is
       h  how tall it is

   The whole picture is 900 wide and 640 tall. So x: 68 means
   68 steps in from the left edge. Bigger y means further DOWN,
   which feels backwards until you have done it twice.

   Try this: find the lounge, change its w from 212 to 300, save,
   refresh. It eats the kitchen. Change it back.

   HOW AN ANCHOR WORKS
   An anchor is a glowing spot where a trap can go later. It has
   an x and a y like a room, plus a mount:

       FLOOR     something on the ground to step in
       DOORWAY   something across a gap they walk through
       OVERHEAD  something hanging above their head
       STAIRS    something on the stairs

   In M5 a trap will only fit an anchor with the same mount, so a
   swinging paint tin needs OVERHEAD and marbles need FLOOR.

   The bedroom and the bathroom have no anchors at all. That is
   deliberate. Adding one is your job later on.
   =========================================================== */

export const ROOMS = [
  /* --- THE ATTIC, up in the roof, where you hide --- */
  {
    id: 'attic',
    name: 'Attic',
    floor: 'attic',
    x: 250, y: 100, w: 260, h: 66,
    note: 'You watch the monitors from up here.'
  },

  /* --- UPSTAIRS --- */
  {
    id: 'landing',
    name: 'Landing',
    floor: 'upstairs',
    x: 68, y: 176, w: 168, h: 172,
    note: 'The stairs come up into this room.'
  },
  {
    id: 'hallway',
    name: 'Hallway',
    floor: 'upstairs',
    x: 240, y: 176, w: 104, h: 172,
    note: 'A narrow bit they have to walk down.'
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    floor: 'upstairs',
    x: 348, y: 176, w: 160, h: 172,
    note: 'Jewellery and cash live in here.'
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    floor: 'upstairs',
    x: 512, y: 176, w: 180, h: 172,
    note: 'Nothing worth stealing. They check anyway.'
  },

  /* --- GROUND FLOOR --- */
  {
    id: 'foyer',
    name: 'Foyer',
    floor: 'ground',
    x: 68, y: 366, w: 168, h: 178,
    note: 'The front door and the bottom of the stairs.'
  },
  {
    id: 'lounge',
    name: 'Lounge',
    floor: 'ground',
    x: 240, y: 366, w: 212, h: 178,
    note: 'The telly. The one they really want.'
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    floor: 'ground',
    x: 456, y: 366, w: 236, h: 178,
    note: 'Back door, window, and a lot of useful junk.'
  },

  /* --- OUTSIDE --- */
  {
    id: 'shed',
    name: 'Shed',
    floor: 'outside',
    x: 742, y: 408, w: 136, h: 136,
    note: 'Worth the walk. The best junk is in here.'
  }
];

/* Nine anchor points. One trap each, later on. */
export const ANCHORS = [
  { id: 'front-door',   name: 'Front door',      room: 'foyer',    mount: 'DOORWAY',  x: 92,  y: 502 },
  { id: 'stairs-bottom',name: 'Bottom of stairs',room: 'foyer',    mount: 'STAIRS',   x: 198, y: 508 },
  { id: 'lounge',       name: 'Lounge floor',    room: 'lounge',   mount: 'FLOOR',    x: 346, y: 502 },
  { id: 'kitchen',      name: 'Kitchen',         room: 'kitchen',  mount: 'OVERHEAD', x: 496, y: 446 },
  { id: 'kitchen-window',name:'Kitchen window',  room: 'kitchen',  mount: 'DOORWAY',  x: 604, y: 430 },
  { id: 'back-door',    name: 'Back door',       room: 'kitchen',  mount: 'DOORWAY',  x: 668, y: 496 },
  { id: 'stairs-top',   name: 'Top of stairs',   room: 'landing',  mount: 'STAIRS',   x: 200, y: 328 },
  { id: 'landing',      name: 'Landing',         room: 'landing',  mount: 'OVERHEAD', x: 124, y: 216 },
  { id: 'upstairs-hall',name: 'Upstairs hallway',room: 'hallway',  mount: 'FLOOR',    x: 292, y: 328 }
];

/* What each mount type means, in words the game shows on screen.
   Change the line and the caption under the house changes too. */
export const MOUNTS = {
  FLOOR:    { name: 'Floor',    line: 'Something on the ground for them to step in.' },
  DOORWAY:  { name: 'Doorway',  line: 'Something across a gap they walk through.' },
  OVERHEAD: { name: 'Overhead', line: 'Something hanging above their head.' },
  STAIRS:   { name: 'Stairs',   line: 'Something on the stairs. The classic.' }
};
