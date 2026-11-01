/* ===========================================================
   STAR BASES

   Hendrix: a base is a list of parts on a long piece of moon.
     part    which thing (look in parts.js)
     across  left to right. 40 is the left edge, 440 is the right.
     along   how far into the base. Small numbers come first.
     gives   (only for cargo) what is inside: 'P', 'B', 'S' or '1UP'

   length is how long the piece of moon is.
   Build your own base: copy the outpost, give it a new name,
   then put it in waves.js.
   =========================================================== */

export const BASES = {

  // A little one to learn on.
  outpost: {
    length: 420,
    parts: [
      { part: 'pad',    across: 240, along: 60 },
      { part: 'turret', across: 130, along: 170 },
      { part: 'cargo',  across: 300, along: 200, gives: 'P' },
      { part: 'cargo',  across: 360, along: 200, gives: 'P' },
      { part: 'tank',   across: 240, along: 330 },
    ],
  },

  // The big one. The reactor is right at the end.
  big: {
    length: 2400,
    parts: [
      { part: 'pad',     across: 240, along: 70 },
      { part: 'turret',  across: 110, along: 220 },
      { part: 'turret',  across: 370, along: 220 },
      { part: 'cargo',   across: 240, along: 300, gives: 'B' },

      { part: 'tank',    across: 150, along: 440 },
      { part: 'tank',    across: 210, along: 440 },
      { part: 'tank',    across: 270, along: 440 },
      { part: 'turret',  across: 380, along: 470 },

      { part: 'hangar',  across: 240, along: 640 },
      { part: 'pylon',   across: 90,  along: 760 },
      { part: 'turret',  across: 170, along: 820 },
      { part: 'dish',    across: 360, along: 820 },

      { part: 'missile', across: 240, along: 1000 },
      { part: 'cargo',   across: 110, along: 1060, gives: 'S' },
      { part: 'cargo',   across: 370, along: 1060, gives: 'P' },

      { part: 'tank',    across: 330, along: 1220 },
      { part: 'tank',    across: 390, along: 1220 },
      { part: 'turret',  across: 120, along: 1240 },

      { part: 'hangar',  across: 300, along: 1420 },
      { part: 'pylon',   across: 400, along: 1540 },
      { part: 'turret',  across: 330, along: 1600 },
      { part: 'turret',  across: 140, along: 1600 },
      { part: 'dish',    across: 240, along: 1700 },

      { part: 'cargo',   across: 100, along: 1860, gives: 'P' },
      { part: 'cargo',   across: 160, along: 1860, gives: '1UP' },
      { part: 'missile', across: 360, along: 1900 },
      { part: 'tank',    across: 240, along: 2000 },

      { part: 'reactor', across: 240, along: 2220 },
    ],
  },
};
