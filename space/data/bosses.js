/* ===========================================================
   BOSSES

   Hendrix: the big ones. Change the hits to make them
   tougher or easier.
   =========================================================== */

// The mini boss. A big fat cargo ship.
export const HAULER = {
  name: 'THE HAULER',
  engineHits: 10,    // shots for each engine
  bodyHits: 20,      // shots for the body, once the engines are off
  stay: 24,          // seconds before it gives up and flies away
  fireEvery: 1.6,    // seconds between shots from its side guns
  points: 2000,
  drops: ['P', 'P', 'P', 'B'],
};

// The boss at the end. A space station with a big pink eye.
export const CORE = {
  name: 'THE CORE',
  turretHits: 8,     // shots for each of its four turrets
  eyeHits: 30,       // shots for the eye, once the turrets are gone
  turretEvery: 2.4,  // seconds between turret shots
  ringEvery: 3,      // seconds between rings of bullets from the eye
  turretPoints: 500,
  points: 5000,
};
