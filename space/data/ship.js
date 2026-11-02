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
  speed: 380,        // how fast it flies
  lives: 3,          // ships you start with
  bombs: 3,          // bombs you start with (press space)
  maxLives: 5,       // the most ships you can have. Extra ones become points.
  maxBombs: 5,       // the most bombs you can carry. Extra ones become points.
  fireRate: 4,       // shots every second. Try 30!
  shotSpeed: 720,    // how fast your shots fly
  hitSize: 9,        // the bit of the ship that gets hit. Small is easier.
};
