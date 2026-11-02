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

   WEAPONS. Every boss has its own. Mix and match!
   guns     what its small guns fire:
              'bullet' quick bursts   'rocket' rockets that speed up
              'plasma' big slow balls 'bolt'   lightning bolts
              'red'    lasers         'pink'   energy darts
              'green'  ion shots
   ringShot what the eye fires in a ring (core bosses), same list
   cannon   its big attack when it is angry. After the warning line:
              'laser'      a huge laser down the line
              'lightning'  a lightning strike down the line
              'plasma'     a stream of plasma balls along the line
              'missiles'   a fan of rockets around the line
              'all'        a different one each time (Omega!)

   stay          seconds before it gives up and flies away
   legs          walking bosses: the leg picture, where the legs are,
                 how far they step, and hits if they can be shot off
   flies         true if it takes off and flies when its shell is gone
   escort        the helper ships it calls in for its last stand
   cannonEvery   seconds between big cannon shots
   cannonWidth   how wide the big laser is
   =========================================================== */

export const BOSSES = {

  // Level 1 mini boss.
  hauler: {
    guns: 'bullet', cannon: 'missiles',
    kind: 'hauler', name: 'THE HAULER',
    engineHits: 22, bodyHits: 50,
    stay: 30,            // seconds before it gives up and flies away (until it is angry)
    fireEvery: 1.6,      // seconds between shots from its side guns
    cannonEvery: 4.5, cannonWidth: 40,
    points: 2000, drops: ['P', 'P', 'P', 'B'],
  },

  // Level 2 mini boss: a red one, tougher and quicker.
  hauler2: {
    guns: 'plasma', cannon: 'laser',
    kind: 'hauler', name: 'HAULER MK 2', tint: 'red',
    engineHits: 42, bodyHits: 95, stay: 32, fireEvery: 1.1,
    cannonEvery: 4, cannonWidth: 44,
    points: 3000, drops: ['P', 'P', 'P', 'P', 'B'],
  },

  // Level 3 mini boss: TWO of them at once!
  twins: {
    guns: 'bolt', cannon: 'lightning',
    kind: 'hauler', name: 'TWIN HAULERS', twins: true, tint: 'red',
    engineHits: 36, bodyHits: 80, stay: 36, fireEvery: 1.2,
    cannonEvery: 5.5, cannonWidth: 40,
    points: 3000, drops: ['P', 'P', 'P', 'B'],
  },

  // Level 1 boss.
  core: {
    guns: 'bullet', ringShot: 'pink', cannon: 'laser',
    kind: 'core', name: 'THE CORE', art: 'core', size: [320, 220],
    turrets: [[-118, -14], [118, -14], [-50, 62], [50, 62]],
    eye: [0, -20],       // where the eye sits
    turretHits: 28, eyeHits: 120, stay: 80,
    cannonEvery: 4.5, cannonWidth: 46,
    turretEvery: 2.4,    // seconds between each turret's shots
    // 'green' orbs you can shoot down, or 'red' lasers you can't
    ringEvery: 3,        // seconds between rings of bullets from the eye
    ring: 8,             // bullets in each ring
    turretPoints: 500, points: 5000,
  },

  // Level 2 boss.
  fortress: {
    guns: 'red', ringShot: 'bolt', cannon: 'lightning',
    kind: 'core', name: 'SKY FORTRESS', art: 'fortress', size: [380, 230],
    turrets: [[-150, -10], [150, -10], [-90, 60], [90, 60], [-30, 84], [30, 84]],
    eye: [0, -15],
    turretHits: 36, eyeHits: 170, stay: 85,
    cannonEvery: 4, cannonWidth: 50,
    turretEvery: 2.1, ringEvery: 2.6, ring: 10,
    turretPoints: 700, points: 8000,
  },

  // Level 3 boss. The big one.
  overlord: {
    guns: 'rocket', ringShot: 'plasma', cannon: 'plasma',
    kind: 'core', name: 'THE OVERLORD', art: 'overlord', size: [400, 250],
    turrets: [[-160, -30], [160, -30], [-120, 50], [120, 50], [-50, 90], [50, 90]],
    eye: [0, -15],
    turretHits: 42, eyeHits: 200, stay: 90,
    cannonEvery: 3.5, cannonWidth: 56,
    turretEvery: 1.8, ringEvery: 2.3, ring: 12, double: true,
    turretPoints: 900, points: 12000,
  },

  // Level 4 mini boss: a giant robot tank. Shoot its two side guns, then its core.
  crusher: {
    guns: 'rocket', cannon: 'missiles',
    kind: 'hauler', name: 'THE CRUSHER', art: 'crusher', size: [230, 150],
    engineArt: 'crusher-gun', engineSize: [44, 64], engineAt: [62, 6],
    engineHits: 50, bodyHits: 110, stay: 38, fireEvery: 1.2,
    cannonEvery: 4, cannonWidth: 46,
    points: 4000, drops: ['P', 'P', 'P', 'P', 'B'],
  },

  // Level 4 boss: a walking robot. Its legs stomp as it walks.
  goliath: {
    guns: 'rocket', ringShot: 'bolt', cannon: 'lightning',
    kind: 'core', name: 'GOLIATH', art: 'goliath', size: [300, 200],
    turrets: [[-110, -10], [110, -10], [-60, 55], [60, 55]],
    eye: [0, -20],
    legs: { art: 'mech-leg', size: [70, 120], at: [[-100, 88], [100, 88]], stride: 18 },
    turretHits: 48, eyeHits: 230, stay: 90,
    turretEvery: 1.6, ringEvery: 2.3, ring: 12, double: true,
    cannonEvery: 3.6, cannonWidth: 54, escort: 'spider',
    turretPoints: 1000, points: 15000,
  },

  // Level 5 mini boss: a ship made for flying through lava.
  inferno: {
    guns: 'plasma', cannon: 'plasma',
    kind: 'hauler', name: 'INFERNO', art: 'inferno', size: [240, 130],
    engineHits: 55, bodyHits: 120, stay: 40, fireEvery: 1.0,
    cannonEvery: 3.6, cannonWidth: 48,
    points: 5000, drops: ['P', 'P', 'P', 'P', 'B', 'S'],
  },

  // THE FINAL BOSS. It walks. Shoot its guns AND its legs off...
  // then it takes off and FLIES.
  omega: {
    guns: 'rocket', ringShot: 'bolt', cannon: 'all',
    kind: 'core', name: 'OMEGA', art: 'omega', size: [420, 260],
    turrets: [[-170, -20], [170, -20], [-110, 60], [110, 60], [-45, 95], [45, 95]],
    eye: [0, -25],
    legs: { art: 'omega-leg', size: [90, 160], at: [[-128, 130], [128, 130]], stride: 18, hits: 70 },
    flies: true,
    turretHits: 50, eyeHits: 320, stay: 140,
    turretEvery: 1.5, ringEvery: 2.1, ring: 14, double: true,
    cannonEvery: 3.2, cannonWidth: 60, escort: 'firedrone',
    turretPoints: 1200, points: 30000,
  },
};
