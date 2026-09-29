/* ===========================================================
   BURGLARS - who is coming tonight, the way they go, and what
   they say

   Hendrix: these two are yours. Change their names, change what
   they say, change where they go. The game reads this list and
   does whatever it says.

   HOW A BURGLAR WORKS

       name        what the game calls him
       look        which drawing to use (in js/burglar-art.js).
                   'sid' is tall and thin, 'bruno' is big and wide.
       speed       how fast he walks. Hendrix walks at 160.
       comesIn     which side of the picture he walks in from:
                   'left' (the front door) or 'right' (round the
                   back, past the shed)
       waitsFirst  how many seconds he waits before he sets off
       pause       how many seconds he stops in each room

   HIS ROUTE
   A list of stops, in order. Each stop is a room (the id from
   data/rooms.js) and the thing he says when he gets there. He
   finds his own way between stops, stairs and all. If a room
   has loot in it, he takes it. When he runs out of stops, he
   walks back out the way he came in.

       { room: 'kitchen', says: 'Smells of toast.' },

   Keep what he says short. It has to fit in a speech bubble.

   grabs is what he says when he picks something up.
   tooLate is what he says if the other one got there first
   and took the loot.
   leaving is what he says on the way out.

   Try this: change Sid's name to something worse. Then rewrite
   one of the things he says. Save, refresh, let them in.

   The rest of what makes them tick (how brave they are, what
   scares them) arrives in M7, when your traps start going off.
   =========================================================== */

export const BURGLARS = [
  {
    id: 'sid',
    name: 'Sid',
    look: 'sid',
    speed: 100,
    comesIn: 'right',
    waitsFirst: 0,
    pause: 1.6,
    route: [
      { room: 'utility',  says: 'Back door. Nobody locks the back door.' },
      { room: 'landing',  says: 'Did that stair just creak at me?' },
      { room: 'big-room', says: 'Jewellery box. Come to Sid.' },
      { room: 'my-room',  says: 'A kid lives here. I hate kids.' },
      { room: 'box-room', says: 'Ooh. A guitar.' },
      { room: 'dining',   says: 'Cash tin. Where it always is.' }
    ],
    grabs: 'Mine now.',
    tooLate: 'Bruno! That was mine!',
    leaving: 'Easy. Too easy. I hate it when it is easy.'
  },
  {
    id: 'bruno',
    name: 'Bruno',
    look: 'bruno',
    speed: 70,
    comesIn: 'left',
    waitsFirst: 3,
    pause: 2.2,
    route: [
      { room: 'porch',    says: 'Wipe your feet, Bruno.' },
      { room: 'hall',     says: 'Quiet house. I like a quiet house.' },
      { room: 'lounge',   says: 'Big telly. Bigger than mine.' },
      { room: 'dining',   says: 'Anything in the drawer?' },
      { room: 'kitchen',  says: 'Is that jam? That is jam.' },
      { room: 'cellar',   says: 'Nothing down here but spiders.' }
    ],
    grabs: 'That can come with me.',
    tooLate: 'Sid had it. Course he did.',
    leaving: 'Right. Home. Kettle on.'
  }
];

/* ===========================================================
   LOOT - the good stuff they came for

   Each one sits in a room. x is how far in from the room's left
   wall and lift moves it up off the floor, same as a prop in
   data/rooms.js. look is the drawing (in js/loot-art.js).

   A burglar takes whatever loot is in a room he STOPS in. Walking
   through a room is not enough. So if you move the laptop to a
   room that is not on anyone's route, nobody takes it. That is
   also a way to find out where they go.
   =========================================================== */

export const LOOT = [
  { id: 'telly',     name: 'the telly',          room: 'lounge',   look: 'telly',     x: 72,  lift: 28 },
  { id: 'console',   name: 'the games console',  room: 'lounge',   look: 'console',   x: 42,  lift: 0 },
  { id: 'laptop',    name: 'the laptop',         room: 'my-room',  look: 'laptop',    x: 52,  lift: 38 },
  { id: 'jewellery', name: 'the jewellery box',  room: 'big-room', look: 'jewellery', x: 118, lift: 36 },
  { id: 'cash',      name: 'the cash tin',       room: 'dining',   look: 'cashtin',   x: 99,  lift: 44 },
  { id: 'guitar',    name: 'the guitar',         room: 'box-room', look: 'guitar',    x: 60,  lift: 0 }
];
