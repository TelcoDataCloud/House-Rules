/* ===========================================================
   HOW HARD

   Hendrix: the three buttons on the title screen.
     shield       start with a shield?
     shieldBack   seconds until a popped shield grows back.
                  null means it never grows back on its own.
     bulletSpeed  1 is normal. 2 is twice as fast.
     tough        1 is normal. 2 means enemies take twice the shots.
     shooters     which small enemies are allowed to shoot
     shootMore    1 is normal. 2 means they shoot twice as often.
     aim          true means some shots come straight at you!
     extraShips   false means crates never have a 1UP in them
                  (the reactor still gives one)
   =========================================================== */

export const DIFFICULTY = {
  easy: {
    name: 'Easy', shield: true, shieldBack: 15, bulletSpeed: 1.0, tough: 1,
    shooters: ['weaver', 'saucer'], shootMore: 1, aim: false, extraShips: true,
  },
  medium: {
    name: 'Medium', shield: false, shieldBack: null, bulletSpeed: 1.2, tough: 1,
    shooters: ['weaver', 'diver', 'dart', 'saucer'], shootMore: 1.2, aim: false, extraShips: true,
  },
  hard: {
    name: 'Hard', shield: false, shieldBack: null, bulletSpeed: 1.45, tough: 1.5,
    shooters: ['weaver', 'diver', 'dart', 'saucer'], shootMore: 1.8, aim: true, extraShips: false,
  },
};
