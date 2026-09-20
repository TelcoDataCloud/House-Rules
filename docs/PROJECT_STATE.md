# PROJECT STATE — House Rules

Last updated: 24 August 2026

---

## Where we are

**M0 — Hello, House: built and verified.**

The title screen has: a hand-drawn night scene as inline SVG (house, chimney,
tree, Sid on the left with a "Lights are on." speech bubble, Bruno on the
right with his sack, Hendrix smirking in the attic window), three difficulty
buttons built from `data/difficulty.js`, a Start the night button, the M0-M10
build-progress strip built from `data/milestones.js` with M0 lit green, a
day/night theme toggle and a sound toggle.

Phases that are not built yet route to one honest placeholder screen naming
the milestone that will build them. The phase machine is real from day one.

**Verified headless (Chromium via Playwright), both themes screenshotted and
looked at:**
- Console clean, no page errors
- Difficulty picker builds 3 buttons from data, Easy preselected
- Strip builds 11 entries from data, 1 marked done
- Start the night routes to the placeholder and reports the chosen difficulty
- Back to the title calls `resetGame()`; difficulty returns to easy, theme and
  sound survive on purpose
- No horizontal scroll at 390px wide

**Two bugs found and fixed during verification:**
1. **A CSS `transform` on an SVG `<g>` overrides its `transform` attribute.**
   Both burglars collapsed onto the origin and stacked on top of each other.
   Fix: outer `<g>` positions with the attribute, inner `<g>` carries the
   animation class. This pattern is needed for most of M8.
2. Programmatically focusing the `<h1>` on first paint drew a focus ring
   round the title. `showScreen()` now takes `moveFocus` and skips it on boot.

---

## History worth knowing

M0 was originally built in a Claude Cowork session. Cowork's sandbox cannot
push to GitHub: its git proxy only injects credentials for repos registered
as session sources, and Cowork exposes no UI to register one. Reads worked,
writes 403'd. A PAT does not help; the proxy refuses before any credential is
considered. That is why the project moved to Claude Code.

The Cowork sandbox was also ephemeral, and M0 had to be rebuilt from scratch
once when a session's working tree vanished. Push early.

---

## Blocked

**Render service not created yet.** `create_static_site` returns
`branch main does not exist` against an empty repo, so code lands first and
the service second. Settings are decided and ready to apply: workspace
`tea-d805ojt7vvec73dtvr30`, name `house-rules`, no build command, publish
path `.`, auto-deploy on. Asa has standing approval for creating this one
service.

---

## On Asa's queue

1. Confirm `main` is up on GitHub
2. Say the word and the Render static site gets created
3. Revoke the old GitHub PAT that was pasted into the retired Cowork project
   instructions (github.com/settings/tokens). It is not needed here.
4. Get Hendrix to name the game (his M0 turn, still owing)

---

## Next

- **M1 — The House.** Two-storey cross-section, rooms outlined, anchor points
  that highlight on hover. Nothing interactive yet.
- Hendrix's turn for M1: change `--wall` in `css/tokens.css`. The token is
  already there and already commented for him, in both themes.
- Hendrix's turn still owing for M0: name the game. "House Rules" is a
  working title only. It appears twice in `index.html`: the `<h1>` and the
  `<title>` tag.

---

## Decisions made

- Tone pitched at 10 to 12, *Home Alone* proper. Comic pain in, real harm out.
- Four phases per night: scavenge (timed), workshop, rig, night.
- Difficulty sets the scavenge clock only. Easy 200s, medium 150s, hard 100s.
- Traps can be upgraded once: trap + one more item. Upgrading consumes the
  base trap. Upgraded traps usually gain a second category.
- Two asymmetric burglars: Sid weak to loud and startle, Bruno weak to sticky
  and messy and half deaf.
- Loud traps fill a "neighbours noticed" meter; fill it and the police arrest
  anyone still inside.
- Fixed burglar routes in v1. Roaming AI is phase 2.
- Vanilla ES modules, no build step, SVG and CSS rather than canvas.
- `data/` is Hendrix's folder and never needs `js/` touched to add content.
- Themes are named `night` (default) and `day`, set as `data-theme` on
  `<html>`. Night is the default because the game is about a night.
- Unbuilt phases route to one honest placeholder rather than being disabled.
- `window.HOUSE` is exposed in the console on purpose so Hendrix can poke at
  the live game state.

---

## Hendrix's trap ideas

*(nothing captured yet - add them here as he says them, even half-formed)*

| Idea | Ingredients | Status |
|---|---|---|
| **Glue Bomb** (19 Sep): the swinging flour bomb, then a water bomb straight after, so the flour turns to glue | Flour Bomb + Water Balloon (a new item he adds in M3). Swings overhead like the Swinging Flour Bomb. STICKY and MESSY, which is exactly Bruno's weakness. | **Agreed 19 Sep.** In the brief's upgrade table. Water Balloon goes in at M3 (his item), Glue Bomb at M4. |

---

## Session 3 — 24 Aug 2026, deployed

- `main` pushed from the Claude chat sandbox with the write-scoped PAT.
  History intact: `40f2dcf`, `1f01b6c`.
- Render static site created: service `srv-da61f9gu01pc738sdqe0`, live at
  **https://house-rules-18l4.onrender.com** — no build command, publish
  path `.`, auto-deploy on.
- Verified live in headless Chromium: both themes screenshotted and
  checked, console clean.
- Gotcha for the log: Render's CDN (Cloudflare) cached 404s for ~5 minutes
  (`s-maxage=300`) on assets requested during the first seconds of the
  first deploy. It clears itself. Do not chase phantom 404s right after a
  deploy; wait five minutes and retest.
- PAT hygiene: token is scoped to this one repo, Contents read/write only.
  Asa accepted it living in the project instructions. If it ever leaks
  wider, revoke at github.com/settings/tokens.

**Open:** Hendrix names the game (M0 turn). Then M1 — The House.

---

## M1 — The House. Done 24 Aug 2026.

Live and verified at https://house-rules-18l4.onrender.com (press Start
the night to see it). Commit `674ba72`.

What landed:
- `data/rooms.js` — nine rooms as plain x/y/w/h rectangles, nine anchors
  with a mount type each, and the MOUNTS list whose wording drives the
  caption on screen. Hendrix's file.
- `js/house.js` — draws the house from that list. It does not contain a
  single room name, which is the lesson.
- `css/house.css` — appearance only. All colour from tokens.css.
- New tokens both themes: `--house-sky`, `--room-floor`, `--room-outside`,
  `--room-line`, `--room-label`, `--stairs`, `--anchor-idle`, and one
  colour per mount type.

Verified headless on the live URL: 9 rooms, 9 anchors, 4 legend items,
both themes, keyboard tab and Enter operate the anchors, console clean,
no horizontal scroll at 390px, restart clears the caption and the lit
anchor.

Bedroom and bathroom deliberately have no anchors. That is the M5 turn
for Hendrix (add an anchor to a room that does not have one).

**Design note:** mockups are being produced separately in Cowork and will
be saved to project files. The house was built so that applying them is
mostly a tokens.css swap plus shape tweaks in house.js, not a rewrite.
Nothing in `data/rooms.js` should need to change for a restyle.

**Open:** Hendrix names the game (M0 turn) and picks the wall colour (M1
turn). Then M2 — The Hero.

---

## Session 4 — 19 Sep 2026, M1 rebuilt to the new house

**Where we build: here, in Claude chat.** Not Claude Code, not a separate
Cowork lane. Code tools only when needed. Writes to GitHub go through the
GitHub connector, because the sandbox git proxy still refuses pushes.

**Art direction settled** (done 24 Aug, recorded now): eight sheets at
<https://claude.ai/code/artifact/733c6456-904e-475f-a473-bdd32d77b0b0>, summary in
the Claude project at `claude/ART_DIRECTION.md`. It changed the spec; see
brief section 7a.

**M1 rebuilt.** The first M1 used the old nine-room house. It now matches
the art pack:
- 13 rooms over four levels (attic, upstairs, ground, cellar) plus garage
  and shed, all in `data/rooms.js`
- 3 ways between floors in a new `STAIRS` list: main stairs, cellar steps,
  loft ladder
- 24 anchors: 11 doorway, 6 overhead, 4 floor, 3 stairs
- `js/house.js` no longer has any house numbers of its own. Walls, roof,
  floor slab, grass, earth and outbuilding roofs are all measured from the
  rooms, so moving a room in `data/rooms.js` moves the walls with it.
- New tokens: `--room-cellar`, `--earth`.

Verified headless: 15 rooms and 24 anchors drawn, both themes, keyboard
focus shows the caption, Back resets caption and lit anchor, no horizontal
scroll at 390px, console clean.

**Decisions waiting on Hendrix** (asked 19 Sep, answers pending):
1. The game's name (M0 turn)
2. The house colour (M1 turn, `--wall` in `css/tokens.css`)
3. Is the hero him, or a made-up kid?
4. What the hero wears for the night (feeds M2)
5. The best hiding spot in the house (becomes a rare-item search spot in M3)

Name options given to Hendrix: Trap House, Not In My House, Midnight
Junk, Sticky Fingers, Rig The House. His pick, or his own.

Pushed as `6eb6df7` through the GitHub connector. Note: the API now reports
the repo as `TelcoDataCloud/House-Rules`; `asa-a11y/House-Rules` still
resolves to it.

**Hendrix's answers, 19 Sep:**
1. Name: **Trap House**. He types it in himself on GitHub (M0 turn).
2. Outside of the house **red**. Rooms mostly white, some coloured, and
   **his room light green**. Done: `--wall` is red, rooms take a `paint`
   in `data/rooms.js`. Bathroom blue and kitchen yellow are placeholder
   picks, his to change.
3. The hero **is Hendrix**.
4. He wears **camouflage**.
5. Best search spot: **inside the piano**, in the lounge. It becomes a
   rare-item spot in M3.

**House art, 19 Sep.** Asa: the house looked too basic. Now furnished and
drawn properly, still cartoon:
- New `js/props.js`: 35 furniture drawings (bed, wardrobe, workbench, bath,
  piano, telly, fridge, car, security monitors and so on). Each starts at
  the floor on its left edge; colours are token names.
- Rooms in `data/rooms.js` list their props by kind and x, plus optional
  `colour` and `lift`. Rooms can also set `flooring` (wood, tile, carpet)
  and `walls: 'planks'`.
- `js/house.js` now draws brick outer walls, a tiled roof with fascia and
  gutter, a chimney with pots, beams between floors, a stone cellar, sky
  with moon or sun, grass and earth, a lamp and light pool in every room,
  wallpaper stripes or wall tiles, floors, skirting, a carpeted staircase
  with a banister, and a name tag on each room.
- New tokens for furniture, floors and building parts, both themes.

**Hendrix's M0 turn, half done:** he renamed the browser tab to Trap House
himself on GitHub (`8f66584`). The big title on the page still says House
Rules; that is the other half, same file, the `<h1 class="game-title">` line.

**Room camera and stairs, 19 Sep.** Asa: when Hendrix moves around it
should zoom in on one room at a time, for more detail when hunting and
rigging. And the stairs did not look right.
- Tap any room (or Tab to it and press Enter) and the view glides in until
  it fills the screen. A bar above the house shows the room's name and its
  note, with a Whole house button. Escape also zooms out. With a room open,
  the arrow keys move to the room next door, upstairs or downstairs. The
  garage and shed count as the ground floor.
- It works by animating the SVG viewBox, so nothing is redrawn. Outlines
  thin out and trap spots shrink as you zoom so they stay a sensible size;
  spots never get smaller than a 54px tap target.
- `state.room` holds the room the camera is on; restart returns to the
  whole house. `zoomToRoom(id)` and `showWholeHouse()` are exported from
  `js/house.js`, ready for M2 so the camera follows Hendrix.
- The phone horizontal-scroll hack is gone; on a phone you tap a room.
- Stairs rebuilt: a proper zig-zag of steps with a carpet runner, a sloping
  stringer, a banister with spindles and a newel post at each end, and a
  cupboard under the stairs (a good M3 hiding spot). Stairs, cellar steps
  and loft ladder now start and finish exactly on the floors of the rooms.

**Hunting, 20 Sep.** Asa: zoomed in, a room should show more detail than
the whole-house view, with more places to look; and no dots while
searching, things should light up under the pointer so it is a hunt.
- 49 hiding places. Any prop in `data/rooms.js` with `search: '...'` is
  one; the stairs cupboard is one via `STAIRS` (`search`, `room`).
- New `closeUp` list per room: small things (teddy, vase, trophy shelf,
  hat box, keys, toolbox, bottles...) that fade in only when that room is
  open. 25 new drawings at the bottom of `js/props.js`.
- Scavenge is search mode: the anchor dots and legend are hidden. Pointing
  at a hiding place in the open room gives it a yellow glow, a small lift
  and a magnifying-glass cursor; the HUD names it. Click, tap or Enter
  rummages (wiggle plus a sound), marks it searched (grey glow from then
  on) and says there is nothing there yet, because M3 fills them. Under
  the house: "Searched 1 of 3 hiding places in here."
- Only the open room's hiding places can be pointed at or tabbed to. Once
  a room is open it stops being a button (role group) so its hiding places
  are not nested inside a button.
- Rig mode (phase `rig`) shows the anchors and legend and switches hiding
  places off. Before M5, see it with `HOUSE.setPhase('rig')` in the console.
- `state.searched` holds searched ids; restart clears them and the marks.
- Verified headless, desktop and phone, both themes, console clean.

## M3 — Collectables. Done 20 Sep 2026 (before M2, Asa's call)

Asa: some items should be visible in the rooms, easy to find; others in
cupboards and drawers. He chose to build M3 before M2.
- `data/items.js` (new, Hendrix's): 16 common + 4 rare items, each with a
  `look`, plus the dials `CARRY_LIMIT` 8, `OUT_IN_THE_OPEN` 6,
  `RARE_EACH_NIGHT` 2, `RARE_HIDEOUTS` (cellar, box room, shed, garage,
  the piano). Water Balloon is deliberately NOT in the list: adding it is
  his M3 turn, and the `balloon` look is ready for him.
- `data/rooms.js`: each room has `inTheOpen` places (27 in all).
- `js/item-art.js` (new): 22 item drawings, parcel fallback for unknown looks.
- `js/scavenge.js` (new): shuffles each night, leaves 6 in the open, hides
  rare ones in awkward places and the rest anywhere, runs the clock from
  `data/difficulty.js`, answers every click (found, nothing, bag full,
  time up). Finish early with I'm done; either way "Take it to the
  workbench" goes to the workshop placeholder, which shows the bag.
- `js/house.js`: loose junk is drawn in the room with a shadow and glows
  like a hiding place; picking it up removes it. Found things pop out of
  their hiding place. `setLookHandler`, `placeLooseItem`, `hidingPlaces`.
- The scavenge bar: clock (last 10 seconds go red and tick), 8 bag slots
  (rare ones get a pink ring), I'm done.
- State: `inventory`, `hidden`, `lying`, `timeLeft`, `scavenging`; restart
  clears all of them and the junk in the house.
- Fixed: the house stayed visible on the workshop screen (`.house-wrap`
  display overrode `hidden`).
- M3 dot is lit. M2 is not, so the strip shows M0, M1, M3.
- Push lesson, again: the M3 code went up in four commits and the live
  site was broken for about two minutes between them (main.js needed
  house.js and the new markup). Next time, every file that depends on
  another goes in ONE push_files call, however big.

**Hendrix's M3 turn:** add Water Balloon to `data/items.js`, then change
the Hard timer in `data/difficulty.js`.

**Next:** M2 — The Hero: Hendrix, in camouflage.
