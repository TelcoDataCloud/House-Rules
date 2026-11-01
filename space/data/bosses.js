/* ===========================================================
   BOSSES

   Hendrix: the big ones. Change the hits to make them
   tougher or easier.

   There are two kinds:
     'hauler'  a big ship with two engines. Shoot the engines
               off, then the body.
     'core'    a big station with turrets round it and an eye in
               the middle. Shoot the turrets, then the eye.

   Every boss has PHASES. Knock off its engines or turrets and it
   gets ANGRY: it powers up, moves faster and brings out its big
   cannon. The cannon shows a red line first (that is where it
   will fire), then a huge laser comes down the line. Move!
   A core boss gets one more phase when its eye is nearly done:
   LAST STAND, with even more firing and helper ships.

   stay          seconds before it gives up and flies away
   cannonEvery   seconds between big cannon shots
   cannonWidth   how wide the big laser is
   =========================================================== */

export const BOSSES = {

  // Level 1 mini boss.
  hauler: {
    kind: 'hauler', name: 'THE HAULER',
    engineHits: 30, bodyHits: 70,
    stay: 30,            // seconds before it gives up and flies away (until it is angry)
    fireEvery: 1.6,      // seconds between shots from its side guns
    cannonEvery: 4.5, cannonWidth: 40,
    points: 2000, drops: ['P', 'P', 'P', 'B'],
  },

  // Level 2 mini boss: a red one, tougher and quicker.
  hauler2: {
    kind: 'hauler', name: 'HAULER MK 2', tint: 'red',
    engineHits: 42, bodyHits: 95, stay: 32, fireEvery: 1.1,
    cannonEvery: 4, cannonWidth: 44,
    points: 3000, drops: ['P', 'P', 'P', 'P', 'B'],
  },

  // Level 3 mini boss: TWO of them at once!
  twins: {
    kind: 'hauler', name: 'TWIN HAULERS', twins: true, tint: 'red',
    engineHits: 36, bodyHits: 80, stay: 36, fireEvery: 1.2,
    cannonEvery: 5.5, cannonWidth: 40,
    points: 3000, drops: ['P', 'P', 'P', 'B'],
  },

  // Level 1 boss.
  core: {
    kind: 'core', name: 'THE CORE', art: 'core', size: [320, 220],
    turrets: [[-118, -14], [118, -14], [-50, 62], [50, 62]],
    eye: [0, -20],       // where the eye sits
    turretHits: 28, eyeHits: 120, stay: 80,
    cannonEvery: 4.5, cannonWidth: 46,
    turretEvery: 2.4,    // seconds between each turret's shots
    turretShot: 'green', // 'green' orbs you can shoot down, or 'red' lasers you can't
    ringEvery: 3,        // seconds between rings of bullets from the eye
    ring: 8,             // bullets in each ring
    turretPoints: 500, points: 5000,
  },

  // Level 2 boss.
  fortress: {
    kind: 'core', name: 'SKY FORTRESS', art: 'fortress', size: [380, 230],
    turrets: [[-150, -10], [150, -10], [-90, 60], [90, 60], [-30, 84], [30, 84]],
    eye: [0, -15],
    turretHits: 36, eyeHits: 170, stay: 85,
    cannonEvery: 4, cannonWidth: 50,
    turretEvery: 2.1, turretShot: 'red', ringEvery: 2.6, ring: 10,
    turretPoints: 700, points: 8000,
  },

  // Level 3 boss. The big one.
  overlord: {
    kind: 'core', name: 'THE OVERLORD', art: 'overlord', size: [400, 250],
    turrets: [[-160, -30], [160, -30], [-120, 50], [120, 50], [-50, 90], [50, 90]],
    eye: [0, -15],
    turretHits: 42, eyeHits: 200, stay: 90,
    cannonEvery: 3.5, cannonWidth: 56,
    turretEvery: 1.8, turretShot: 'red', ringEvery: 2.3, ring: 12, double: true,
    turretPoints: 900, points: 12000,
  },
};
