/* ===========================================================
   YOUR SHIP

   Hendrix: this is the Comet, your ship, and the name of the game.
   Change a number, save the file, refresh the page.
   Then fly and see what you changed!
   =========================================================== */

// The name on the title screen.
export const GAME_NAME = 'Star Base';

export const SHIP = {
  art: 'comet',      // the picture of the ship: art/comet.svg
  size: 64,          // how big the ship is drawn
  speed: 290,        // how fast it flies at first. The Engine card makes it faster.
  lives: 3,          // ships you start with
  bombs: 3,          // bombs you start with (press space)
  maxLives: 5,       // the most ships you can have. Extra ones become points.
  maxBombs: 5,       // the most bombs you can carry. Extra ones become points.
  fireRate: 4,       // shots every second. Try 30!
  shotSpeed: 720,    // how fast your shots fly
  hitSize: 9,        // the bit of the ship that gets hit. Small is easier.
};

// STAR POWER. When it gets really busy round your ship, a gold star
// capsule drops in front of you. Grab it and NOTHING can hurt you
// for a few seconds. You can even crash into enemies!
export const STAR = {
  seconds: 5,        // how long it lasts. Try 10!
  danger: 6,         // how many enemy shots close to you counts as busy
};

// YOUR SHIELD. It can take a few hits before it breaks. The Shield
// card makes it stronger: level 1, then 2, then 3.
//   hp     how many hits it can take, at level 1, 2 and 3
//   hurt   how much each kind of enemy shot takes off it
//          crash is bumping into an enemy ship
// A boss's big cannon breaks any shield, except a FULL level 3 one.
export const SHIELD = {
  hp: [3, 6, 10],
  hurt: { pink: 1, bullet: 1, green: 2, red: 3, bolt: 3, rocket: 4, plasma: 6, mine: 6, crash: 4, flak: 1, shard: 1, ice: 2, ember: 1, slag: 4, fire: 2 },
};
