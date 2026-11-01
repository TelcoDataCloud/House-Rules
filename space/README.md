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

## Next

S8: level 2, where aimed shots arrive on every level.
