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

  // LEVEL 2: a small dock floating on the clouds.
  skydock: {
    length: 520,
    parts: [
      { part: 'pad',     across: 240, along: 60 },
      { part: 'turret',  across: 120, along: 170 },
      { part: 'turret',  across: 360, along: 170 },
      { part: 'cargo',   across: 240, along: 230, gives: 'P' },
      { part: 'tank',    across: 180, along: 340 },
      { part: 'tank',    across: 240, along: 340 },
      { part: 'tank',    across: 300, along: 340 },
      { part: 'dish',    across: 240, along: 450 },
    ],
  },

  // LEVEL 2: a whole city on the clouds.
  cloudcity: {
    length: 2400,
    parts: [
      { part: 'pad',     across: 240, along: 70 },
      { part: 'turret',  across: 100, along: 200 },
      { part: 'turret',  across: 380, along: 200 },
      { part: 'missile', across: 240, along: 300 },
      { part: 'hangar',  across: 130, along: 460 },
      { part: 'hangar',  across: 350, along: 560 },
      { part: 'cargo',   across: 240, along: 640, gives: 'B' },
      { part: 'pylon',   across: 400, along: 760 },
      { part: 'turret',  across: 320, along: 820 },
      { part: 'turret',  across: 160, along: 820 },
      { part: 'tank',    across: 210, along: 960 },
      { part: 'tank',    across: 270, along: 960 },
      { part: 'dish',    across: 100, along: 1040 },
      { part: 'missile', across: 380, along: 1100 },
      { part: 'cargo',   across: 240, along: 1180, gives: 'S' },
      { part: 'turret',  across: 120, along: 1320 },
      { part: 'turret',  across: 240, along: 1320 },
      { part: 'turret',  across: 360, along: 1320 },
      { part: 'hangar',  across: 240, along: 1500 },
      { part: 'pylon',   across: 80,  along: 1620 },
      { part: 'missile', across: 150, along: 1680 },
      { part: 'missile', across: 330, along: 1680 },
      { part: 'tank',    across: 300, along: 1820 },
      { part: 'tank',    across: 360, along: 1820 },
      { part: 'cargo',   across: 120, along: 1900, gives: 'P' },
      { part: 'cargo',   across: 180, along: 1900, gives: '1UP' },
      { part: 'dish',    across: 380, along: 1980 },
      { part: 'reactor', across: 240, along: 2200 },
    ],
  },

  // LEVEL 3: an enemy camp on the ground.
  camp: {
    length: 640,
    parts: [
      { part: 'turret',  across: 100, along: 100 },
      { part: 'turret',  across: 380, along: 100 },
      { part: 'missile', across: 240, along: 200 },
      { part: 'tank',    across: 160, along: 320 },
      { part: 'tank',    across: 220, along: 320 },
      { part: 'hangar',  across: 340, along: 360 },
      { part: 'cargo',   across: 120, along: 460, gives: 'P' },
      { part: 'turret',  across: 240, along: 520 },
      { part: 'dish',    across: 380, along: 560 },
    ],
  },

  // LEVEL 3: the enemy's biggest fort.
  citadel: {
    length: 2600,
    parts: [
      { part: 'turret',  across: 90,  along: 100 },
      { part: 'turret',  across: 240, along: 100 },
      { part: 'turret',  across: 390, along: 100 },
      { part: 'missile', across: 160, along: 240 },
      { part: 'missile', across: 320, along: 240 },
      { part: 'hangar',  across: 240, along: 400 },
      { part: 'tank',    across: 100, along: 520 },
      { part: 'tank',    across: 160, along: 520 },
      { part: 'tank',    across: 320, along: 520 },
      { part: 'tank',    across: 380, along: 520 },
      { part: 'pylon',   across: 240, along: 640 },
      { part: 'turret',  across: 140, along: 700 },
      { part: 'turret',  across: 340, along: 700 },
      { part: 'cargo',   across: 240, along: 800, gives: 'B' },
      { part: 'hangar',  across: 120, along: 940 },
      { part: 'hangar',  across: 360, along: 1040 },
      { part: 'missile', across: 240, along: 1160 },
      { part: 'dish',    across: 90,  along: 1240 },
      { part: 'dish',    across: 390, along: 1240 },
      { part: 'turret',  across: 180, along: 1380 },
      { part: 'turret',  across: 300, along: 1380 },
      { part: 'cargo',   across: 240, along: 1460, gives: 'S' },
      { part: 'tank',    across: 200, along: 1600 },
      { part: 'tank',    across: 260, along: 1600 },
      { part: 'pylon',   across: 400, along: 1700 },
      { part: 'missile', across: 120, along: 1780 },
      { part: 'missile', across: 360, along: 1780 },
      { part: 'turret',  across: 240, along: 1900 },
      { part: 'cargo',   across: 140, along: 2040, gives: '1UP' },
      { part: 'cargo',   across: 340, along: 2040, gives: 'P' },
      { part: 'reactor', across: 240, along: 2340 },
    ],
  },
};
