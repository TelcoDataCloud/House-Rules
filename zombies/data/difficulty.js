/* ===========================================================
   DIFFICULTY: Easy and Hard

   Hendrix: this is the one file that makes Easy easy and Hard
   hard. Change a number, refresh, play. Nothing greys out, both
   modes have every trap.

   nightSeconds   how long the night lasts
   hordeStart     zombies on night 1
   hordeGrow      more zombies each night
   takeVillagers  can zombies carry a sleeping villager off?
   trapsBreak     do traps wear out?
   heroDowns      can the hero get knocked down?
   heartsRegrow   seconds until a lost heart comes back (0 = never)
   aimAssist      catapult shots snap to the nearest zombie
   moon           does the moon cycle happen?
   mix            which zombies can come (names from data/zombies.js)
   =========================================================== */

export const DIFFICULTY = {
  easy: {
    name: 'Easy',
    note: 'Small hordes. Nobody gets taken.',
    nightSeconds: 90,
    hordeStart: 6,
    hordeGrow: 2,
    takeVillagers: false,
    trapsBreak: false,
    heroDowns: false,
    heartsRegrow: 15,
    aimAssist: true,
    moon: false,
    potionCostCarrots: 3,
    mix: ['bob', 'bob', 'bob', 'hopper', 'digger'],
  },
  hard: {
    name: 'Hard',
    note: 'Big hordes. They take villagers. The moon matters.',
    nightSeconds: 120,
    hordeStart: 8,
    hordeGrow: 3,
    takeVillagers: true,
    trapsBreak: true,
    heroDowns: true,
    heartsRegrow: 0,
    aimAssist: false,
    moon: true,
    potionCostCarrots: 4,
    mix: ['bob', 'bob', 'hopper', 'hopper', 'digger', 'snot', 'gasbag'],
  },
};
