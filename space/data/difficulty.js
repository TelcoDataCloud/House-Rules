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
   =========================================================== */

export const DIFFICULTY = {
  easy: {
    name: 'Easy', cannonWarn: 1.7, lastStand: false, shield: true, shieldBack: 10, bulletSpeed: 1.0, tough: 0.75,
    shooters: ['weaver', 'saucer'], shootMore: 1, aim: false, extraShips: true,
  },
  medium: {
    name: 'Medium', cannonWarn: 1.25, lastStand: true, shield: false, shieldBack: null, bulletSpeed: 1.2, tough: 1,
    shooters: ['weaver', 'diver', 'dart', 'saucer'], shootMore: 1.2, aim: false, extraShips: true,
  },
  hard: {
    name: 'Hard', cannonWarn: 0.95, lastStand: true, shield: false, shieldBack: null, bulletSpeed: 1.45, tough: 1.5,
    shooters: ['weaver', 'diver', 'dart', 'saucer'], shootMore: 1.8, aim: true, extraShips: false,
  },
};
