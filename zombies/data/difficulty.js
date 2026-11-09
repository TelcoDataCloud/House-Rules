/* ===========================================================
   DIFFICULTY: Easy and Hard

   Hendrix: this is the one file that makes Easy easy and Hard
   hard. Change a number, refresh, play. Hard has a few extra
   traps of its own (hard: true in data/traps.js); Easy unlocks
   its bar a few things a night.

   nightSeconds   how long the night lasts
   hordeStart     zombies on night 1
   hordeGrow      more zombies each night
   takeVillagers  can a zombie turn a villager into a zombie?
   takeFrom       the first night they are allowed to (night 1 is a warm up)
   munchSeconds   how long a zombie has to munch on a villager's head
                  before they turn. Whack him before the bar fills!
   trapsBreak     do traps wear out?
   heroDowns      can the hero get knocked down?
   heartsRegrow   seconds until a lost heart comes back (0 = never)
   aimAssist      catapult shots snap to the nearest zombie
   moon           does the moon cycle happen?
   mix            which zombies can come (names from data/zombies.js)
   meet           Easy: a new zombie joins the mix on these nights, one at a
                  time, so there is one new thing to learn each night
   trips          work trips each villager makes a day (then they rest)
   bedlessHalfTrips  Hard: a villager with no bed only does half their trips
   barUnlocks     Easy: new things appear on the build bar night by night
                  (the "from" numbers in data/traps.js)
   =========================================================== */

export const DIFFICULTY = {
  easy: {
    name: 'Easy',
    note: 'Small hordes. Slow munchers. Save your villagers!',
    nightSeconds: 90,
    hordeStart: 6,
    hordeGrow: 2,
    takeVillagers: true,
    takeFrom: 2,
    munchSeconds: 9,
    trapsBreak: false,
    heroDowns: false,
    heartsRegrow: 15,
    aimAssist: true,
    moon: false,
    potionCostCarrots: 3,
    trips: 3,
    mix: ['bob', 'bob', 'bob'],
    meet: { 2: 'hopper', 3: 'digger', 4: 'bogey', 5: 'eyeball', 6: 'loosebits', 7: 'vomit', 8: 'chicken', 9: 'cow', 10: 'pig', 11: 'sheep', 12: 'goldfish' },
    barUnlocks: true,
  },
  hard: {
    name: 'Hard',
    note: 'Big hordes. Fast munchers. The moon matters.',
    nightSeconds: 120,
    hordeStart: 8,
    hordeGrow: 3,
    takeVillagers: true,
    takeFrom: 2,
    munchSeconds: 4,
    trapsBreak: true,
    heroDowns: true,
    heartsRegrow: 0,
    aimAssist: false,
    moon: true,
    potionCostCarrots: 4,
    trips: 2,
    bedlessHalfTrips: true,
    mix: ['bob', 'bob', 'hopper', 'hopper', 'digger', 'snot', 'gasbag', 'bogey', 'eyeball', 'loosebits', 'vomit', 'chicken', 'pig', 'cow'],
    bellEvery: 20,
  },
};
