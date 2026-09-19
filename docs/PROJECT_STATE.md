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
| | | |

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

**Next:** M2 — The Hero, once 3 and 4 are answered.
