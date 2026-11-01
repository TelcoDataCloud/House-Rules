/* ===========================================================
   ENEMY SHOTS

   Hendrix: these are the shots that get fired AT you.

   Round orbs (pink and green) can be shot out of the air.
   Red lasers can't. You have to dodge those!

     canShoot   true if your shots can knock it out
     hits       how many of your shots it takes
     points     what you score for knocking it out

   Try it: make green orbs take 5 hits, or let lasers be shot
   by changing canShoot to true.
   =========================================================== */

export const FOE_SHOTS = {
  pink:  { canShoot: true,  hits: 1, points: 10 },
  green: { canShoot: true,  hits: 2, points: 20 },
  red:   { canShoot: false, hits: 0, points: 0 },
};
