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

## Weapons, bombs and boss phases (1 Nov)

**One main gun at a time** (data/weapons.js): Blaster (centre hits
hardest, side guns weaker), Laser (goes through enemies), Beam (weak at
first, splits at level 3 with weaker side beams), Railgun (straight ahead
only, big hit, never splits). Level 1 to 4; a SWAP card changes gun and
keeps your level. Helpers: Homing missiles (weak, they always hit) and
Drones.

**Bombs** (data/bombs.js, js/bombs.js): High Explosive, Cluster, Plasma,
Laser and Nuke. You carry one kind, level 1 to 3. Every bomb clears the
enemy shots; a boss only takes a little from each bomb (BOSS_SHARE).

**Boss phases:** knock off the shell and the boss powers up, goes red,
moves faster and brings out its cannon: a red line shows where it will
fire, then a big laser comes down it. Core bosses get LAST STAND on
Medium and Hard. Bosses are much tougher.

**New art:** every enemy ship and boss redrawn in a darker, sharper
warship style; new shots, missiles, plasma orbs and lasers.

## Levels 4 and 5, the ending (1 Nov)

**Level 4, Robot Base** (data/level4.js): robot tanks drive on the ground
and aim their turrets at you; spider robots walk and drop mines. The
Crusher (a giant robot tank) is the mini boss; GOLIATH, a walking robot,
is the boss. **Level 5, Magma Core** (data/level5.js): lava rivers, fire
drones that fire rockets, the Inferno mini boss, and OMEGA, the final
boss: shoot its guns and its legs off and it takes off and FLIES. Then
the ending film: the volcano blows, you escape to space, fireworks.

**Enemy shots** (data/foeshots.js): orbs, lasers, bullet bursts, rockets
that speed up, big slow plasma balls, and mines that blow up when you get
close. Some can be shot down, some can't.

**Also:** guns go to level 6, the Nuke is one big mushroom cloud, guns that
sit still are much tougher, power ups are glowing capsules, a new sleeker
ship, realistic base buildings, and painted backdrops for every world
(art/bg-*.svg).


## Canvas, real sounds, harder later levels (2 Nov)

From Asa's change list after a playtest.

- **Canvas:** the play area is now one `<canvas>` (js/canvas.js). The art is
  still one SVG per thing in `art/`, turned into bitmaps when the game
  loads. Effects are pooled particles (js/fx.js). Steady 60 fps.
- **Sounds:** recorded CC0 sounds by Kenney (`sounds/`), 2 or 3 versions
  each, a random small pitch change, panned left and right, and small
  sounds go quieter while big ones play. The synth is the fallback.
- **Bombs:** Red Lightning replaces Plasma. Damage matches the area: the
  bigger the area, the less each enemy takes. The Nuke flies out to where
  the enemies are (or the boss), then a white-out, a shockwave, and a
  mushroom cloud rising from that spot, and everything burns for 3 s.
  It is the rarest bomb card.
- **Harder from level 3:** enemies and bosses get tougher as your gun
  gets stronger (`powerScale` in each level file). The power bar is longer
  each level. Ships and bombs are capped at 5 (extras become points).
  Losing a ship costs a gun level (Easy: from level 3, never below 2). On
  Easy the shield grows back fast on levels 1 and 2, slower on 3 and 4, not
  on 5. The railgun only goes through 3 to 5 things.
- **Enemy shots:** dark outlines and hot colours only (pink, red, violet).
  The angry Hauler fires plasma balls.
- **Screen:** banners in the top third, weapons as pictures at the top
  right, the help panel hides during play so the game is bigger, no
  pointless cards, and an Auto power-up option on the title screen.

## Boss weapons, star power, new shots (2 Nov, evening)

- **Every boss has its own weapons** (`guns`, `ringShot`, `cannon` in
  data/bosses.js). Big attacks: a laser, a lightning strike, a stream of
  plasma, or a fan of missiles, each with its own warning colour (red,
  white-violet, violet, orange). Omega takes turns with all four.
- **Star power:** when lots of shots crowd your ship, a gold star capsule
  drops in front of you. Grab it and nothing can hurt you for 5 seconds
  (STAR in data/ship.js).
- **Red Lightning** is now a ball of red lightning that flies up and
  explodes, with arcs zapping every enemy inside it.
- **Enemy shots** are sci-fi now: energy darts, ion shots with rings,
  plasma torpedoes with spinning rings, lightning bolts.

## Wrecks, smoke and boss weapon hardware (2 Nov, night)

- **Things blow up properly** (js/damage.js): base guns, missile pods, fuel
  tanks, crates and the rest explode with debris (missile pods cook off),
  then leave a scorched crater with a burnt wreck that keeps smoking and
  burning until it scrolls away.
- **Bosses get wrecked as you fight:** every gun or engine you shoot off
  leaves a burning hole pouring out fire, smoke and sparks. More smoke at
  one third damage, fire and black smoke at two thirds, little explosions
  near the end, and heavy smoke in LAST STAND.
- **Each big attack has its own hardware** (js/rig.js, art/weapon-*.svg):
  a laser turret rises out of the boss's back and swings to aim; missile
  wings slide out of its sides; two tesla coils rise and arc together
  before the lightning strikes; armour doors slide open to show a glowing
  plasma core. Omega brings out all four.

## Every boss its own, shields, engines, Easy helpers (9 Nov)

- **Every boss is different** (data/bosses.js): its own colours (`hue`),
  its own roar (`voice`), its own pattern once it is angry (`phase2`), its
  own LAST STAND attack (`lastStand`, Medium and Hard) and its own way of
  going down (`death`). The Hauler Mk 2 is bigger, the Twin Haulers are
  smaller and ice blue.

  | Boss | Angry pattern | Last stand | Goes down |
  |---|---|---|---|
  | The Hauler | sweep | flak shells | spins |
  | Hauler Mk 2 | aimed bursts | flamethrowers | chain reaction |
  | Twin Haulers | cross | icicles | shatters like ice |
  | The Core | spiral | sweeping eye laser | implodes |
  | Sky Fortress | walls with a gap | chain lightning orbs | zapped apart |
  | The Overlord | mines | black hole | sucked into a black hole |
  | The Crusher | rocket rain | slag globs | crushed flat |
  | Goliath | helper ships | shockwaves | topples over |
  | Inferno | wavy stream | walls of fire | melts |
  | Omega | storm (all) | all of them in turn | a blinding nova |

  The patterns and last stands are in `js/attacks.js`. New shots for
  them: flak, shard, ice, frost, slag, ember (data/foeshots.js).
- **Shield levels** (data/ship.js SHIELD): level 1 takes 3 hits' worth,
  level 2 takes 6, level 3 takes 10. Each kind of shot takes off a
  different amount; the shield cracks and goes yellow then red. A boss's
  big cannon breaks any shield but a full level 3. A **Shield** card
  levels it up.
- **Engine** card: the Comet starts slower (290) and the card takes it to
  350, 410, then 470.
- **Easy helpers in boss fights** (data/difficulty.js HELP): from level 2
  a free shield and bomb when a boss arrives and POW capsules; from level 3
  SLOW and WING too. A capsule drops every 22 seconds of the
  fight: POW (gun 2 levels stronger for 12 s), SLOW (enemy shots half
  speed for 6 s), WING (two wingmen for 20 s). Angry bosses also fire
  their patterns less often, with fewer shots, on Easy.
- New sounds: fire (LEGIT Audio Fire Staff) and ice (Ice Shatters), both
  CC0, in `sounds/pack-7.json` to `pack-9.json`.
- The best score is the one thing saved (CLAUDE.md has the exception).
