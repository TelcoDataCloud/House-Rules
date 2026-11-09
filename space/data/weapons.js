/* ===========================================================
   WEAPONS: your guns and your helpers

   Hendrix: your ship has ONE main gun at a time. There are four:

     Blaster   the gun you start with. Hits hardest in the
               middle. Side guns are weaker, so aim head on!
     Laser     thin and hard. Goes right through enemies.
     Beam      a beam that never stops. Weak at first, then it
               grows. At level 3 it splits, but the middle beam
               is always the strongest.
     Railgun   one big slow shot, straight ahead only. Goes
               through everything in a line. It never splits.

   When the power bar is full, press M (or 0). Three cards come
   up. One might make your gun stronger (up to level 6). One might
   swap you to a different gun. Swapping KEEPS your level.

   Helpers sit beside your main gun: homing missiles (weak, they
   always hit), drones (little ships that shoot with you), a
   bigger engine and a stronger shield.

   damage  how hard one shot hits. 1 is normal.
   rate    shots every second
   x       moves a shot left (minus) or right
   angle   tips it: 0 is straight up, -12 leans left, 12 right
   =========================================================== */

// How many power tokens fill the bar on level 1.
export const POWER_BAR = 6;

// The bar gets this much longer on every level after that.
export const POWER_GROW = 1;

// How many extra full bars you can save up.
export const BANK = 3;

// The highest level for a main gun.
export const MAX_LEVEL = 6;

// The gun you start with.
export const START_GUN = 'blaster';

export const GUNS = {
  blaster: {
    name: 'Blaster', short: 'BL', colour: 'cyan',
    levels: [
      { say: 'Blaster', rate: 4, shots: [
        { x: 0, angle: 0, damage: 1 },
      ] },
      { say: 'Twin blaster', rate: 5, shots: [
        { x: -5, angle: 0, damage: 1 },
        { x: 5, angle: 0, damage: 1 },
      ] },
      { say: 'Wing guns', rate: 5.5, shots: [
        { x: -5, angle: 0, damage: 1.1 },
        { x: 5, angle: 0, damage: 1.1 },
        { x: -14, angle: -8, damage: 0.4 },
        { x: 14, angle: 8, damage: 0.4 },
      ] },
      { say: 'Wingtip guns', rate: 6, shots: [
        { x: -5, angle: 0, damage: 1.3 },
        { x: 5, angle: 0, damage: 1.3 },
        { x: -14, angle: -8, damage: 0.4 },
        { x: 14, angle: 8, damage: 0.4 },
        { x: -25, angle: -18, damage: 0.25 },
        { x: 25, angle: 18, damage: 0.25 },
      ] },
      { say: 'Heavy blaster', rate: 6.5, shots: [
        { x: -6, angle: 0, damage: 1.5 },
        { x: 0, angle: 0, damage: 1.5 },
        { x: 6, angle: 0, damage: 1.5 },
        { x: -14, angle: -8, damage: 0.45 },
        { x: 14, angle: 8, damage: 0.45 },
        { x: -25, angle: -18, damage: 0.3 },
        { x: 25, angle: 18, damage: 0.3 },
      ] },
      { say: 'Gold storm', rate: 7, shots: [
        { x: -6, angle: 0, damage: 1.8 },
        { x: 0, angle: 0, damage: 1.8 },
        { x: 6, angle: 0, damage: 1.8 },
        { x: -14, angle: -6, damage: 0.5 },
        { x: 14, angle: 6, damage: 0.5 },
        { x: -20, angle: -14, damage: 0.35 },
        { x: 20, angle: 14, damage: 0.35 },
        { x: -25, angle: -24, damage: 0.3 },
        { x: 25, angle: 24, damage: 0.3 },
      ] },
    ],
  },

  // through: how many enemies it goes right through.
  laser: {
    name: 'Laser', short: 'LA', colour: 'green',
    levels: [
      { say: 'Green laser', look: 'green', rate: 4, through: 1, shots: [{ x: 0, angle: 0, damage: 1.2 }] },
      { say: 'Hot laser', look: 'green', rate: 5, through: 2, shots: [{ x: 0, angle: 0, damage: 1.4 }] },
      { say: 'Red twin laser', look: 'red', rate: 5, through: 2, shots: [{ x: -4, angle: 0, damage: 1.3 }, { x: 4, angle: 0, damage: 1.3 }] },
      { say: 'Purple twin laser', look: 'purple', rate: 5.5, through: 3, shots: [{ x: -4, angle: 0, damage: 1.5 }, { x: 4, angle: 0, damage: 1.5 }] },
      { say: 'Triple laser', look: 'purple', rate: 6, through: 3, shots: [{ x: -6, angle: 0, damage: 1.5 }, { x: 0, angle: 0, damage: 1.7 }, { x: 6, angle: 0, damage: 1.5 }] },
      { say: 'Gold lance', look: 'gold', rate: 6.5, through: 5, shots: [{ x: -6, angle: 0, damage: 1.7 }, { x: 0, angle: 0, damage: 2 }, { x: 6, angle: 0, damage: 1.7 }] },
    ],
  },

  // power: hits every second. width: how wide the middle beam is.
  // split: weaker side beams that fan out (angle and power).
  beam: {
    name: 'Beam', short: 'BM', colour: 'pink',
    levels: [
      { say: 'Beam', width: 8, power: 3.5 },
      { say: 'Strong beam', width: 11, power: 6 },
      { say: 'Beam splitter', width: 13, power: 8.5, split: { angle: 22, power: 1.5 } },
      { say: 'Mega beam', width: 16, power: 11, split: { angle: 22, power: 2.5 } },
      { say: 'Hyper beam', width: 19, power: 13.5, split: { angle: 20, power: 3 } },
      { say: 'Star beam', width: 22, power: 16, split: { angle: 18, power: 3.5 } },
    ],
  },

  // every: seconds between shots. pierce: how many things in a
  // straight line it can go through.
  rail: {
    name: 'Railgun', short: 'RG', colour: 'yellow',
    levels: [
      { say: 'Railgun', every: 1.0, damage: 6, pierce: 3 },
      { say: 'Fast railgun', every: 0.85, damage: 8, pierce: 3 },
      { say: 'Heavy railgun', every: 0.75, damage: 11, pierce: 4 },
      { say: 'Super railgun', every: 0.65, damage: 14, pierce: 4 },
      { say: 'Twin railgun', every: 0.6, damage: 16, twin: true, pierce: 5 },
      { say: 'Mega railgun', every: 0.5, damage: 19, twin: true, pierce: 5 },
    ],
  },
};

// Helpers. A few steps each. They work with any main gun.
export const HELPERS = {
  // Homing missiles always hit, so they are weak on purpose.
  homing: {
    name: 'Homing', short: 'H', colour: 'pink',
    steps: [
      { say: 'Two missiles', missiles: 2, damage: 0.4, every: 1.3 },
      { say: 'Four missiles', missiles: 4, damage: 0.4, every: 1.2 },
      { say: 'Big missiles', missiles: 4, damage: 0.6, every: 1.0 },
    ],
  },

  // Little helper ships that fly beside you.
  drones: {
    name: 'Drones', short: 'D', colour: 'cyan',
    steps: [
      { say: 'One drone', drones: 1, every: 0.5, damage: 0.5 },
      { say: 'Two drones', drones: 2, every: 0.5, damage: 0.5 },
      { say: 'Fast drones', drones: 2, every: 0.3, damage: 0.5 },
    ],
  },

  // A bigger engine: your ship flies faster. (It starts at the
  // speed in data/ship.js.)
  engine: {
    name: 'Engine', short: 'E', colour: 'cyan',
    steps: [
      { say: 'Faster engine', speed: 350 },
      { say: 'Turbo engine', speed: 410 },
      { say: 'Hyper engine', speed: 470 },
    ],
  },

  // A stronger shield. It takes more hits before it breaks
  // (see SHIELD in data/ship.js). Two steps: level 2, then level 3.
  shields: {
    name: 'Shield', short: 'S', colour: 'cyan',
    steps: [
      { say: 'Strong shield', level: 2 },
      { say: 'Mega shield', level: 3 },
    ],
  },
};

// Cards you can pick again and again. They do one thing, once.
export const EXTRAS = {
  shield: { name: 'Shield', say: 'Shield on', colour: 'cyan' },     // puts your shield back, full
  bombpack: { name: 'Bombs', say: '+2 bombs', colour: 'yellow' },
  points: { name: 'Points', say: '+3000 points', colour: 'yellow' },
};
