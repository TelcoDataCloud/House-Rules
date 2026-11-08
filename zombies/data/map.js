/* ===========================================================
   MAP: the land under the village

   Hendrix: the picture is art/map.svg. This file is a little
   drawing of the same land, one letter per square, 24 across
   and 16 down, so the game knows where zombies can walk.

     .  grass, anyone can walk and you can build
     ~  water: nobody can walk here
     =  the bridge: the only way over the stream
     #  rocks: nobody can walk here, a mine goes next to them
     o  the pond: zombies wade in slowly and splash
     :  the dirt track from the woods

   Change a letter, refresh, and that square changes. Try
   making a second bridge.
   =========================================================== */

export const LAND = [
  '...........::...........',
  '...........::.......~...',
  '...oo......::.......~...',
  '..oooo.....::.......~~..',
  '.oooo......::.......~...',
  '...........::......~~...',
  '...........::......~....',
  '..................===...',
  '..#...............===...',
  '..##...............~~...',
  '.#####............~~....',
  '.###.#............~~....',
  '.#####..#.........~~....',
  '.#########.........~....',
  '....#.............~~....',
  '..................~.....',
];

// Turn the drawing into lists of [column, row]
function squares(letter) {
  const out = [];
  LAND.forEach((line, row) => [...line].forEach((ch, col) => { if (ch === letter) out.push([col, row]); }));
  return out;
}

export const WATER = squares('~');
export const BRIDGE = squares('=');
export const ROCKS = squares('#');
export const POND = squares('o');
export const TRACK = squares(':');
