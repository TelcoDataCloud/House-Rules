/* ===========================================================
   WEAPONS: the three upgrades

   Hendrix: when the power bar is full, press M (or 0) and you
   pick one of these. Each one has three steps.

   SPREAD shots: x moves a shot left (minus) or right.
   angle tips it. 0 is straight up. -12 leans left, 12 leans right.
   Want SEVEN shots? Copy a line in the last step and change the angle.
   =========================================================== */

// How many power tokens fill the bar.
export const POWER_BAR = 6;

// Your shots before any Spread upgrade.
export const START_SHOTS = [
  { x: 0, angle: 0 },
];

export const WEAPONS = {
  spread: {
    name: 'Spread',
    colour: 'cyan',
    steps: [
      { say: 'Twin shot', shots: [
        { x: -7, angle: 0 },
        { x: 7, angle: 0 },
      ] },
      { say: 'Triple fan', shots: [
        { x: 0, angle: 0 },
        { x: -6, angle: -12 },
        { x: 6, angle: 12 },
      ] },
      { say: 'Five way', shots: [
        { x: 0, angle: 0 },
        { x: -6, angle: -12 },
        { x: 6, angle: 12 },
        { x: -10, angle: -24 },
        { x: 10, angle: 24 },
      ] },
    ],
  },

  homing: {
    name: 'Homing',
    colour: 'pink',
    steps: [
      { say: 'One missile', missiles: 1, damage: 1, every: 0.8 },
      { say: 'Two missiles', missiles: 2, damage: 1, every: 0.8 },
      { say: 'Big missiles', missiles: 2, damage: 2, every: 0.7 },
    ],
  },

  rapid: {
    name: 'Rapid',
    colour: 'yellow',
    steps: [
      { say: 'Faster', extra: 2 },              // 2 more shots a second
      { say: 'Even faster', extra: 5 },
      { say: 'Gold shots', extra: 8, gold: true },
    ],
  },
};
