/* ===========================================================
   HOW HARD

   Hendrix: the three buttons on the title screen.
     shield       start with a shield?
     shieldBack   seconds until a popped shield grows back.
                  null means it never grows back on its own.
     bulletSpeed  1 is normal. 2 is twice as fast.
     tough        1 is normal. 2 means enemies take twice the shots.
   =========================================================== */

export const DIFFICULTY = {
  easy:   { name: 'Easy',   shield: true,  shieldBack: 15,   bulletSpeed: 1.0, tough: 1 },
  medium: { name: 'Medium', shield: false, shieldBack: null, bulletSpeed: 1.2, tough: 1 },
  hard:   { name: 'Hard',   shield: false, shieldBack: null, bulletSpeed: 1.4, tough: 1.5 },
};
