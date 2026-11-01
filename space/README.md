# Star Base

The second game. A space shooter like 1942 and 1943: the Comet fires by
itself, you dodge, you shoot moon bases for prizes, and you beat the
bosses. Built by Asa and Hendrix, 1 November 2026.

Play it at <https://house-rules-18l4.onrender.com/space/>

## How to play

| | Keys | Mouse | Tablet |
|---|---|---|---|
| Fly | Arrow keys | Move the mouse | Drag a finger |
| Bomb | Space | Click | B button |
| Power up | M or numpad 0 | Right click | M button |
| Pause | P | P | |

## Where things live

- `data/` is Hendrix's folder. The level, the enemies, the bases, the
  bosses, the weapons and the ship are all plain lists and numbers.
  Change one, save, refresh.
- `art/` has one picture per thing. Draw a better `dart.svg` and every
  Dart in the game changes. Nothing else needs touching.
- `css/tokens.css` has every colour on the page, in both themes.
- `js/` is the engine. Each file starts with a note saying what it does.

For testing: `?god` means nothing can hit you, `?fast=4` runs four times
as fast. Type `STAR_BASE.state` in the browser console to look inside.

## Done (S0 to S7)

Title with Keys or Mouse and Easy, Medium or Hard. Level 1, Moonfall:
four minutes, nine waves, a small outpost, the Hauler mini boss, a big
star base with a reactor, the Core boss with two stages, a graded win
screen. Three upgrade tracks (Spread, Homing, Rapid). Bomb, shield,
1UP. Easy starts with a shield that grows back 15 s after it pops.
Light theme, sound with a mute, reduced motion, touch buttons.

## Playtest fixes (1 Nov, after a Chrome playtest)

New enemy art (cockpits, wings, engine glow), white hit flash, bigger
explosions with smoke and coloured debris, lasers and pulsing enemy orbs,
missile trails. Boss deaths: long explosion, shake, slow motion, BOSS
DOWN!. Bosses tell you what to shoot; the Core's eye glows only when it
can be hurt and stays fully on screen. Brighter bases with orange rings on
everything you can shoot. Small enemies shoot slow orbs (data/difficulty.js
says which); Hard aims some shots and crates give no extra ships. A
"SPACE = BOMB!" hint when it gets busy. Ship stays inside the box with the
mouse. Help switches for Mouse. Stars for "Built so far". Solid end panels,
one YOU WIN! title, Level 2 coming soon. The game reads short lines out
loud (the sound button turns it off).

**High score:** the best score is saved in the browser (js/best.js). This
is the one thing the game remembers, by Asa's choice. Nothing else is saved.

## New ship and upgrades (1 Nov)

The Comet is a winged fighter now, and every upgrade adds a part you can
see: nose guns, wing guns, wingtip guns, missile pods, a beam lens, bomb
racks, bigger engines, coloured laser stripes, and drones flying beside
you. Seven upgrades, three steps each (data/weapons.js): Spread, Laser
(green, red, purple; the strong ones go through enemies), Beam, Homing,
Rapid, Drones and Bomb bay. Shield and Bombs are one-off cards. Three
cards come up at random. Spare power is saved: up to 3 extra full bars
(BANK in data/weapons.js), shown as x2, x3 on the bar.

All the art got shading: metal, glass, nav lights, shadows under flying
ships, textured moon rock, a far planet, glowing explosions.

## Levels 2 and 3 (1 Nov)

Three levels now, each harder than the last (data/level1.js, level2.js,
level3.js): **Moonfall** in space, **Into the Clouds** in a sunset sky with
bases on cloud islands, and **Planet Fall** over red planet ground. A short
film plays between levels: flying into the planet and burning through the
atmosphere, then diving under the clouds to the ground (js/cutscene.js;
Enter or Skip skips it). New enemies: Saucer (zigzags, fires lasers) and
Gunship (big, fires a fan of lasers). New bosses: Hauler Mk 2, Twin
Haulers, Sky Fortress, The Overlord. Out of ships? Try the level again
with the ship you started it with.

Enemies take more hits, and more of them come late in each level. Every
upgrade has its own sound. Drones fire amber shots. The ship is 20%
smaller.

**Shooting shots:** round orbs (pink, green) can be shot out of the air.
Red lasers can't, so dodge them (data/foeshots.js).

**Boss deaths:** glowing cracks spread over the boss, bangs go off along
them, then it splits along the cracks and the pieces tumble away smoking
(js/breakup.js).

For testing: `?level=2` starts on level 2.

## Next

S10: level 4.
