/* ===========================================================
   HERO - you

   Hendrix: this is you, in the game. In your pyjamas and
   slippers, because you are meant to be in bed.

   You walk from room to room. Tap a room, or use the arrow
   keys, and you set off. Walking takes time, and the scavenge
   clock does not wait for you. That is the whole game.

       name        what the game calls you
       startRoom   where you are when the night starts. It has to
                   be an id from data/rooms.js, like 'kitchen'.
       walkSpeed   how fast you walk. Bigger is faster.
       size        how big you are drawn. 1 is normal.

   YOUR TURN (M2)
   Change walkSpeed to 50. Save, refresh, start a night and try
   to get to the shed. Then try 600. Then pick the number you
   think is fair and leave it there.

   The colours of your pyjamas are in css/tokens.css, called
   --pj-a (the main colour) and --pj-b (the stripes). Your
   slippers are --slippers. Change them and you change your outfit.
   =========================================================== */

export const HERO = {
  name: 'Hendrix',
  startRoom: 'my-room',
  walkSpeed: 160,
  size: 1
};
