/* ===========================================================
   WEAPONS: the upgrades

   Hendrix: when the power bar is full, press M (or 0). Three
   cards come up, picked at random from this list. Every upgrade
   has three steps, and each step adds something you can SEE on
   the ship (look in art/comet.svg for the bits).

   Got more power than you can use? It is saved up: you can hold
   up to BANK extra full bars and spend them later.

   SPREAD shots: x moves a shot left (minus) or right.
   angle tips it: 0 is straight up, -12 leans left, 12 right.
   =========================================================== */

// How many power tokens fill the bar.
export const POWER_BAR = 6;

// How many extra full bars you can save up.
export const BANK = 3;

// Your shots before any Spread upgrade.
export const START_SHOTS = [
  { x: 0, angle: 0 },
];

export const WEAPONS = {
  spread: {
    name: 'Spread', short: 'S', colour: 'cyan',
    steps: [
      { say: 'Twin guns', shots: [
        { x: -6, angle: 0 },
        { x: 6, angle: 0 },
      ] },
      { say: 'Wing guns', shots: [
        { x: -6, angle: 0 },
        { x: 6, angle: 0 },
        { x: -18, angle: -8 },
        { x: 18, angle: 8 },
      ] },
      { say: 'Wingtip guns', shots: [
        { x: -6, angle: 0 },
        { x: 6, angle: 0 },
        { x: -18, angle: -8 },
        { x: 18, angle: 8 },
        { x: -31, angle: -18 },
        { x: 31, angle: 18 },
      ] },
    ],
  },

  // Laser colour. Stronger lasers hit harder and some go
  // right through one enemy and into the next.
  laser: {
    name: 'Laser', short: 'L', colour: 'green',
    steps: [
      { say: 'Green laser', laser: 'green', damage: 1, through: 1 },
      { say: 'Red laser', laser: 'red', damage: 2, through: 1 },
      { say: 'Purple laser', laser: 'purple', damage: 2, through: 3 },
    ],
  },

  // A beam that shoots out of the nose and never stops.
  beam: {
    name: 'Beam', short: 'B', colour: 'pink',
    steps: [
      { say: 'Beam', width: 10, power: 4 },
      { say: 'Wide beam', width: 18, power: 7 },
      { say: 'Mega beam', width: 28, power: 11 },
    ],
  },

  homing: {
    name: 'Homing', short: 'H', colour: 'pink',
    steps: [
      { say: 'Two missiles', missiles: 2, damage: 1, every: 0.9 },
      { say: 'Four missiles', missiles: 4, damage: 1, every: 0.9 },
      { say: 'Big missiles', missiles: 4, damage: 2, every: 0.8 },
    ],
  },

  rapid: {
    name: 'Rapid', short: 'R', colour: 'yellow',
    steps: [
      { say: 'Faster', extra: 2 },              // 2 more shots a second
      { say: 'Even faster', extra: 5 },
      { say: 'Gold shots', extra: 8, gold: true },
    ],
  },

  // Little helper ships that fly beside you.
  drones: {
    name: 'Drones', short: 'D', colour: 'cyan',
    steps: [
      { say: 'One drone', drones: 1, every: 0.4 },
      { say: 'Two drones', drones: 2, every: 0.4 },
      { say: 'Drone lasers', drones: 2, every: 0.22 },
    ],
  },

  bay: {
    name: 'Bomb bay', short: 'X', colour: 'yellow',
    steps: [
      { say: '+2 bigger bombs', add: 2, damage: 5 },
      { say: 'Shield bombs', add: 2, damage: 5, shield: true },
      { say: 'Mega bombs', add: 3, damage: 9, shield: true },
    ],
  },
};

// Cards you can pick again and again. They do one thing, once.
export const EXTRAS = {
  shield: { name: 'Shield', say: 'Shield on', colour: 'cyan' },
  bombpack: { name: 'Bombs', say: '+2 bombs', colour: 'yellow' },
};
