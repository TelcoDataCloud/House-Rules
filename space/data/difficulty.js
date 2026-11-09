/* ===========================================================
   HOW HARD

   Hendrix: the three buttons on the title screen.
     shield       start with a shield?
     shieldBack   seconds until a popped shield grows back.
                  null means it never grows back on its own.
     bulletSpeed  1 is normal. 2 is twice as fast.
     tough        1 is normal. 2 means enemies take twice the shots.
     cannonWarn   seconds the red line shows before a boss's big laser fires
     lastStand    true if a boss gets its LAST STAND phase
     shooters     which small enemies are allowed to shoot
     shootMore    1 is normal. 2 means they shoot twice as often.
     aim          true means some shots come straight at you!
     extraShips   false means crates never have a 1UP in them
                  (the reactor still gives one)
     starWait     the least seconds between two star power capsules
     loseGun      which level you start losing a gun level when
                  a ship is hit (1 means always, 99 means never)
     patternWait  how long an angry boss waits between its patterns
                  (and its LAST STAND attacks). 2 means twice as long.
     patternShots how many shots in each pattern. 0.5 means half.
     helpers      true if helper capsules drop in boss fights
                  (see HELP below for which level each starts on)
   =========================================================== */

export const DIFFICULTY = {
  easy: {
    name: 'Easy', cannonWarn: 1.7, lastStand: false, shield: true, shieldBack: 10, bulletSpeed: 1.0, tough: 0.75, loseGun: 3, starWait: 15, helpers: true, patternWait: 1.8, patternShots: 0.6,
    shooters: ['weaver', 'saucer', 'tank', 'spider', 'firedrone'], shootMore: 1, aim: false, extraShips: true,
  },
  medium: {
    name: 'Medium', cannonWarn: 1.25, lastStand: true, shield: false, shieldBack: null, bulletSpeed: 1.2, tough: 1, loseGun: 1, starWait: 22, helpers: false, patternWait: 1.4, patternShots: 0.75,
    shooters: ['weaver', 'diver', 'dart', 'saucer', 'tank', 'spider', 'firedrone'], shootMore: 1.2, aim: false, extraShips: true,
  },
  hard: {
    name: 'Hard', cannonWarn: 0.95, lastStand: true, shield: false, shieldBack: null, bulletSpeed: 1.45, tough: 1.5, loseGun: 1, starWait: 40, helpers: false, patternWait: 0.9, patternShots: 1,
    shooters: ['weaver', 'diver', 'dart', 'saucer', 'tank', 'spider', 'firedrone'], shootMore: 1.8, aim: true, extraShips: false,
  },
};

// HELPERS for the harder boss fights (on Easy).
// When a boss arrives you get a free shield and a bomb. Then, while
// you fight it, a helper capsule drops every so often:
//   POW   OVERDRIVE: your gun is 2 levels stronger for a while
//   SLOW  TIME WARP: every enemy shot flies at half speed
//   WING  WINGMEN: two ships fly beside you and shoot
export const HELP = {
  every: 22,        // seconds between helper capsules in a boss fight
  boost: 12,        // seconds of OVERDRIVE
  warp: 6,          // seconds of TIME WARP
  wing: 20,         // seconds of WINGMEN
  kit: ['S', 'B'],  // what drops when a boss arrives
  // Which level each one starts on.
  from: { kit: 2, POW: 2, SLOW: 3, WING: 3 },
};
