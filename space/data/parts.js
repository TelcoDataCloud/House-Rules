/* ===========================================================
   STAR BASE PARTS

   Hendrix: these are the things built on the moon.
   You can shoot every one of them (except the landing pad).
     art     the picture in the art folder
     size    how big it is drawn: [wide, tall]
     hits    how many shots it takes. 0 means you cannot hit it.
             Guns that sit still are built tough: they take a lot.
     points  what you score
     drops   what falls out when it breaks:
             'P' power, 'B' bomb, 'S' shield, '1UP' extra life
     fireEvery  seconds between shots (only the ones that shoot)
   =========================================================== */

export const PARTS = {
  pad:     { art: 'pad',         size: [120, 80],  hits: 0,  points: 0 },
  turret:  { art: 'turret',      size: [60, 64],   hits: 16, points: 300, fireEvery: 2 },
  missile: { art: 'missile-pod', size: [68, 64],   hits: 22, points: 400, fireEvery: 4 },
  tank:    { art: 'fuel-tank',   size: [56, 60],   hits: 2,  points: 150 },
  hangar:  { art: 'hangar',      size: [120, 80],  hits: 24, points: 500, drops: 'P' },
  dish:    { art: 'dish',        size: [60, 64],   hits: 12, points: 300, drops: 'P' },
  cargo:   { art: 'cargo',       size: [56, 56],   hits: 2,  points: 50,  drops: 'P' },
  pylon:   { art: 'pylon',       size: [60, 76],   hits: 14, points: 300 },
  reactor: { art: 'reactor',     size: [150, 140], hits: 70, points: 2500, drops: '1UP' },
};

// A fuel tank's bang reaches this far, and how hard it hits.
export const TANK_BLAST = 80;
export const TANK_DAMAGE = 12;

// A pylon powers turrets this close to it.
export const PYLON_REACH = 170;
