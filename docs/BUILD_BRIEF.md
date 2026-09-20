# BUILD BRIEF — "TRAP HOUSE"

**A browser game built by Asa & Hendrix.**
Version 1 spec. Deploys to Render as a static site.

---

## 0. What this document is

This is aimed squarely at a sharp 10-12 year old who has seen *Home Alone*
and wants the version where the burglars actually **yell**.

It is also written as a **teaching document**. The build is split into ten
milestones. Each one ends with something visible on screen and a small, safe
change Hendrix makes himself. He should never wait more than one session to
see his own work running at a real web address.

---

## 1. The pitch

You are the only one home. Two burglars have been watching the house all week
and tonight they are coming in.

You have until midnight to **raid your own house for junk**, **bolt that junk
together into traps**, and **rig every door, stair and hallway**. Then you
hide in the attic, watch the security monitors, and find out whether a paint
tin on a rope is a match for a grown man.

Break their nerve and they run. Make enough noise and the police get there
first.

---

## 2. Tone — the important part

**Reference point:** *Home Alone*, *Wallace & Gromit*, *Looney Tunes*.
Slapstick with real consequences, played entirely for laughs.

**In:**
- Burglars yelping, swearing in cartoon symbols (`#@!%`), hopping on one
  foot, faces covered in paint
- Genuine tension — the burglars are competent, persistent, and getting
  closer to the loot every turn
- Impact: pratfalls down stairs, faceplants, a bucket landing on a head with
  a *CLONG*
- Comic-pain feedback: stars circling a head, a throbbing red thumb, eyes as
  spirals
- Burglars muttering rude-but-clean dialogue in speech bubbles ("I hate this
  house.")

**Out:**
- Blood, injury detail, anything that looks like it actually hurt
- Weapons used as weapons — no knives, no fire, no electricity through a
  person
- Horror framing: no jump scares, no darkness-as-threat, no menacing
  close-ups of faces
- Cruelty toward the burglars once they are already beaten. When their nerve
  breaks they **run away**, and that is the joke — humiliation, not
  punishment.

**Rule of thumb:** if it would get a PG rating and a laugh, it's in. If it
would make you wince, it's out.

---

## 3. The loop

One **night** = four phases. A full night runs 6-10 minutes.

### Phase 1 — SCAVENGE *(timed, length set by difficulty)*
Hendrix controls the hero and moves around the house cross-section. The
camera zooms into whichever room he is in, so that room fills the screen and
every cupboard and drawer is big enough to search; the whole house is the
map he zooms back out to. Zoomed in, the room shows more than the whole
house can: small things, and more places to look. Items are hidden in rooms,
cupboards, drawers and the shed. There are no markers: hiding places light
up when he points at them, so finding them is the hunt. He grabs what he
can before the clock runs out. Carry limit: **8 items**.

The timer is the whole tension of this phase. On Hard he will not get
everything, and that is the point — it makes the crafting phase a real
decision.

### Phase 2 — WORKSHOP *(untimed)*
Drag two things onto the workbench. Valid pairs snap together into a **trap**
with a name, a preview and a one-line description. Invalid pairs produce a
small puff of smoke and a dry comment from the hero ("...that's just a wet
sock.") — never a scolding.

**Traps can be upgraded.** The workbench accepts a finished trap as an
ingredient, so a trap plus one more item makes a better trap. Sack + Flour
makes a **Flour Bomb**; feed that Flour Bomb back in with a Rope and you get
a **Swinging Flour Bomb** that hangs over a doorway and hits twice as hard.

Two rules keep this from spiralling:
- **One upgrade step only.** A trap can be upgraded once, so nothing takes
  more than three things total. That is the whole depth of the crafting tree
  in v1.
- **Upgrading consumes the trap.** You end up with one great trap instead of
  two decent ones. That is a real decision, especially on Hard when the
  scavenge clock left you short.

Discovered traps go into the **Recipe Notebook**, which persists for the
whole session so he builds up knowledge across attempts. The notebook shows
upgrade paths as a little branch off the base trap, with unknown upgrades as
silhouettes — that's the thing that will keep him experimenting.

### Phase 3 — RIG *(untimed)*
The house shows **24 anchor points**, one trap each. They are listed in
full in §7a. Every anchor is a real place in the house: a door frame, a
staircase, a ceiling, a stretch of floor.

Rigging works the same way: pick a room, the camera zooms in, and the anchor
points in it are big and easy to hit. Zoom back out to see the whole plan.

Traps have a **mount type**: `FLOOR`, `DOORWAY`, `OVERHEAD`, `STAIRS`.
Anchors only accept matching types. A swinging paint tin needs something to
hang from; marbles need a floor. This is the tactical layer and it is easy to
explain out loud.

Big obvious **"LET THEM IN"** button once at least one trap is rigged.

### Phase 4 — NIGHT *(watch and react)*
The two burglars break in and follow fixed routes through the house, room by
room, on a visible tick. The hero watches from the attic on a bank of
security monitors — a nice frame for the whole screen and a reason he isn't
running around getting caught.

At each anchor:
- **No trap** → they move on. If the room holds loot, they take it.
- **Trap** → the route pauses, the trap animation plays, nerve drops, the
  burglar reacts, and then either continues or **breaks and runs for the
  exit**.

### Resolution
- **Both burglars flee with nothing** → WIN
- **Police arrive while a burglar is still inside** → ARREST → BEST ENDING
- **Burglars leave with the loot** → LOSS, and the loss screen is funny, not
  sad. ("They took the telly. Rebuild. Rig harder.")

---

## 4. The systems

### Difficulty
Picked on the title screen before each night. It sets the scavenge clock and
nothing else in v1 — one dial, easy to explain, easy to tune.

| | Scavenge time |
|---|---|
| **Easy** | 200 seconds |
| **Medium** | 150 seconds |
| **Hard** | 100 seconds |

Default to **Easy** for a first play. Show the setting on the title screen as
three big buttons, not a dropdown, and keep the chosen level visible during
the night so the end-of-night grade means something.

Later, if it needs more range, difficulty is the natural place to hang other
dials — burglar nerve, how many rare items spawn, how fast the routes tick.
Keep it to the clock for now.

### Nerve
Each burglar has a **Nerve** meter. Traps reduce it. At zero, they turn and
run.

### The burglars — asymmetric on purpose
Two characters, deliberately weak to different things, so a player who only
builds one kind of trap will lose.

| | **Sid "Fingers" Cobb** | **Bruno Malloy** |
|---|---|---|
| Build | Wiry, twitchy, fast | Enormous, slow, thick-skinned |
| Nerve | 8 | 14 |
| Route | Upstairs first — jewellery, cash | Ground floor — TV, games console |
| Weak to | **LOUD**, **STARTLE** (x2) | **STICKY**, **MESSY** (x2) |
| Shrugs off | Mess — he's filthy anyway (x0.5) | Noise — half deaf (x0.5) |
| Personality | Nervous, superstitious, blames Bruno | Calm, grumbling, unbothered until he isn't |

Do not surface these numbers to the player. Surface them as **character**:
Sid flinches at a creaking floorboard in the intro cutscene; Bruno wipes his
boots on the doormat and grimaces at a bit of jam. Hendrix should figure out
the weaknesses by playing, not by reading a stat sheet.

### Trap categories
`LOUD` · `SLIPPERY` · `STICKY` · `MESSY` · `STARTLE` · `TANGLE`

Nerve damage = `trap.nerve × burglar.resistance[trap.category]`.

### The Police Meter — "NEIGHBOURS NOTICED"
Every `LOUD` trap adds to a bar at the top of the screen. Fill it and
**sirens**. Any burglar still inside gets arrested; anyone already out the
door escapes.

This makes noisy traps strategically valuable even against half-deaf Bruno,
and it wires the systems together so choices actually trade off against each
other.

### Loot
Six loot items sit around the house (TV, console, laptop, jewellery box, cash
tin, guitar). Each burglar grabs what they pass. Loot carried out = lost.
Loot dropped when a burglar panics = saved. **Nice beat:** a fleeing burglar
drops everything.

### Score
End-of-night grade **S / A / B / C** from loot saved, arrests, traps that
actually fired, and nerve damage per trap (efficiency). Kids will replay for
an S.

---

## 5. Items — 16 base + 4 rare

Found around the house. Big, chunky, instantly recognisable icons.

**Common (always spawn):** Bucket · Marbles · Cooking Oil · Feather Pillow ·
String · **Rope** · **Sack** · Duct Tape · Tin Cans · Bag of Flour · Toy Car ·
Hair Dryer · Bell · Paint Tin · Jar of Honey · Roller Skate

String and Rope are deliberately different tools: **String** is for
trip-lines and tangles, **Rope** is for hanging things overhead. Most
upgrades that move a trap up to the ceiling want Rope.

**Rare (one or two per night, hidden in awkward places):** Christmas Lights ·
Garden Hose · Blender · Glitter Cannon

The rare items exist to make the scavenge phase worth exploring properly and
to give the recipe notebook something to chase.

**Hendrix's item:** **Water Balloon**, common. He adds it himself in M3, and
it unlocks his Glue Bomb in M4.

---

## 6. Recipes — 19 base + 8 upgrades

### Base traps — two items each
Order never matters (normalise by sorting ingredient IDs).

| Ingredients | Trap | Cat. | Nerve | Payoff |
|---|---|---|---|---|
| Cooking Oil + Marbles | **Ballbearing Boulevard** | SLIPPERY | 3 | Feet go out sideways, arms windmill, full comedy descent |
| Paint Tin + Rope | **The Pendulum** | STARTLE | 3 | Tin swings out of the dark and connects. *CLONG.* Face-print in paint. |
| String + Tin Cans | **Rattlesnake Line** | LOUD | 2 | Tripline drags a chain of cans across floorboards. Deafening. |
| Hair Dryer + Feather Pillow | **Chicken Blizzard** | MESSY | 2 | Feather storm. Burglar exits looking like poultry. |
| Hair Dryer + Flour | **Ghost Bomb** | MESSY | 2 | White-out. Coughing. Two eyes blinking in a cloud. |
| Honey + Feather Pillow | **Full Poultry** | STICKY | 3 | Honey then feathers. He knows exactly what he looks like. |
| Duct Tape + String | **The Web** | TANGLE | 2 | Doorway laced with tape. Sticks fast, peels off slowly. |
| Bucket + Paint Tin | **Overhead Special** | STARTLE | 3 | Bucket drops, wears it as a hat, walks into the door frame |
| Toy Car + Cooking Oil | **Skate Express** | SLIPPERY | 2 | Steps on the car, rides it across the room, hits the wall |
| Marbles + Bucket | **Marble Avalanche** | SLIPPERY | 3 | Whole bucket of marbles down the stairs |
| Bell + String | **The Doorbell** | LOUD | 1 | Simple, cheap, loud. Great early trap. |
| Honey + Marbles | **Sticky Situation** | STICKY | 2 | Boots glued down, marbles stuck to the soles, walks like a duck |
| Christmas Lights + Duct Tape | **Disco Inferno** | STARTLE | 3 | Blinding strobe in a dark hallway. Total disorientation. |
| Sack + Flour | **Flour Bomb** | MESSY | 2 | Sack splits on contact. Instant snowman. |
| Blender + Honey | **Honey Fountain** | STICKY | 3 | Lid off, full speed. Redecorates the room and the burglar. |
| Roller Skate + Cooking Oil | **Wheels of Misfortune** | SLIPPERY | 3 | The classic. Straight down the stairs. |
| Garden Hose + Bucket | **Indoor Rain** | MESSY | 2 | Soaked head to foot, squelches for the rest of the night |
| Tin Cans + Hair Dryer | **Tin Tornado** | LOUD | 2 | Cans clatter around the room like a washing machine full of spanners |
| Glitter Cannon + Duct Tape | **Forever Glitter** | STICKY | 3 | He will be finding this in his hair in 2029 |

### Upgrades — a trap plus one more item

The second ingredient is a finished trap rather than an item. Upgraded traps
hit harder and usually pick up a second category, which is how you beat a
burglar who shrugs off your favourite trick.

| Ingredients | Trap | Cat. | Nerve | Payoff |
|---|---|---|---|---|
| Flour Bomb + Rope | **Swinging Flour Bomb** | MESSY · STARTLE | 4 | Hangs over the doorway. Swings in from nowhere. Mount changes to `OVERHEAD`. |
| The Web + Honey | **Flypaper** | TANGLE · STICKY | 4 | Stuck to the tape, and now the tape is stuck to him |
| Ballbearing Boulevard + Tin Cans | **Avalanche Alarm** | SLIPPERY · LOUD | 4 | Goes down *and* wakes the street on the way |
| The Pendulum + Bell | **Bellringer** | STARTLE · LOUD | 5 | *CLONG* — and the bell doesn't stop for eight seconds |
| Ghost Bomb + Glitter Cannon | **Poltergeist** | MESSY · STARTLE | 5 | White cloud, then it sparkles. Sid genuinely believes the house is haunted. |
| Marble Avalanche + Cooking Oil | **Greased Avalanche** | SLIPPERY | 5 | No grip, no marbles-free floor, no dignity |
| Rattlesnake Line + Christmas Lights | **Rave Snare** | LOUD · STARTLE | 4 | Cans, strobe, chaos. Neighbours definitely noticed. |
| Flour Bomb + Water Balloon | **Glue Bomb** *(Hendrix's)* | STICKY · MESSY | 5 | Flour first, water straight after, and now it is glue. Hangs overhead and swings like the Swinging Flour Bomb. Bruno's worst nightmare. |

When a trap has two categories, nerve damage uses whichever the burglar is
**weaker** to. That is the point of upgrading — a two-category trap always
lands on somebody.

Combinations that *nearly* work should still be fun to try. Aim for roughly a
40% hit rate on plausible-looking pairs, and make upgrade attempts a bit more
forgiving than base ones — discovering an upgrade should feel like a reward
for having built the base trap.

---

## 7. Look and feel

**Style:** hand-drawn cartoon, chunky black outlines, warm interior colours,
slightly wonky lines. Think a comic book, not a UI kit.

**The house:** cross-section, dollhouse view — you can see every room at
once. Four levels plus two outbuildings, thirteen rooms in total, laid out
in §7a.

**Characters:** simple, expressive, big silhouettes. Sid tall and thin. Bruno
square and wide. The hero **is Hendrix**: small, determined, permanent slight
smirk, dressed head to foot in **camouflage** for the night.

**Rendering:** inline **SVG + DOM + CSS animations**. Deliberately *not*
canvas — because Hendrix can right-click any part of the game, hit Inspect,
change a colour, and watch it change. That inspectability is worth more than
the performance he'll never need.

**Screens:** Title → Intro (burglars casing the house) → Scavenge → Workshop
→ Rig → Night → Result. One page, one HTML entry point.

**Accessibility:** semantic HTML, visible focus states, keyboard playable,
`prefers-reduced-motion` shortens animations to their final frame with a
caption. Light and dark theme toggle; dark mode is *night-time cosy*, not
horror.

**Sound:** optional but strongly wanted — the *CLONG*, the yelp, the marble
skitter. Small self-generated WebAudio blips rather than downloaded files, so
there's nothing to host and nothing to license. Visible mute toggle. The game
must be complete with sound off.

---

## 7a. The house — rooms and anchors

Settled 24 August 2026 from the art direction pack. This replaces the
six-room house the brief originally described. It is bigger on purpose: the
scavenge clock only creates a real decision if the house is too big to
search in the time you have.

### Levels and rooms

| Level | Rooms |
|---|---|
| Attic | attic (the hero's hideout, and where the security monitors are) |
| Upstairs | bathroom, landing, Hendrix's room, Mum and Dad's, box room |
| Ground | porch, hall, lounge, dining room, kitchen, utility |
| Cellar | cellar |
| Outside | garage, shed |

Thirteen rooms plus the garage and the shed, so fifteen places to be.

Three ways between levels, and all three are riggable: the **main staircase**
(hall to landing), the **cellar steps** (utility to cellar), and the **loft
hatch** (landing to attic).

### Scavenge: 49 hiding places

Items hide *in* things, not on the floor. Under the bed, down the back of the
sofa, behind the boiler, in the airing cupboard, in the chest freezer, on the
shed shelves. About three per room, weighted toward the awkward ones. With
21 items and 49 places, most places are empty, which is the point: the
clock runs out before he has checked them all. No dots while searching; a
hiding place glows when the pointer is on it and goes grey once checked.

The four rare items always spawn somewhere annoying: the cellar, the box
room, the shed, the garage, or **inside the piano** in the lounge, which is
Hendrix's own pick for the best hiding spot in the house. Getting one costs
you a chunk of the clock.

**Colours:** the outside of the house is red. Rooms are white unless they
are painted; Hendrix's room is light green. Paint is a word on each room in
`data/rooms.js` that points at a colour in `css/tokens.css`.

### Rig: the 24 anchor points

Grouped by mount type. Mount type is what decides whether a trap fits.

- **DOORWAY** (11) — front door, back door, lounge door, dining door,
  kitchen door, kitchen window, utility door, bathroom door, his bedroom
  door, their room door, box room door
- **OVERHEAD** (6) — porch ceiling, hall ceiling, lounge ceiling, bathroom
  ceiling, upstairs hall, loft hatch
- **FLOOR** (4) — landing floor, dining floor, kitchen floor, cellar floor
- **STAIRS** (3) — bottom of stairs, top of stairs, cellar steps

The positions live in `data/rooms.js`. Hendrix's room, Mum and Dad's and
the box room only have a door anchor; adding one inside is his M5 turn.

### Why the routes work

Sid goes up: hall, stairs, landing, bedrooms, box room. Bruno stays down:
hall, lounge, dining room, kitchen. They only share the hall and the bottom
of the stairs. Cover one route properly and the other man walks straight to
the telly, which is the tactical point of the whole rig phase.

### Art direction

The visual reference for all of the above is the art direction pack, eight
sheets covering the cast and their expressions, the house inside and out,
the items, the workbench and the trap payoffs. The canvas is at
<https://claude.ai/code/artifact/733c6456-904e-475f-a473-bdd32d77b0b0>
and the written summary is `claude/ART_DIRECTION.md` in the Claude project.

---

## 8. Architecture — and why

**A small modular project, no build step, with a data folder that belongs to
Hendrix.**

Plain ES modules in the browser. No npm, no bundler, no compile step, nothing
to break between sessions. Edit a file, refresh, see the change. That
immediacy is the single most important property for teaching.

```
index.html
css/
  tokens.css        design system: colours, spacing, type
  layout.css        screens and panels
  house.css         the house, rooms, characters
  animations.css    every trap payoff, as CSS keyframes
js/
  main.js           boot + phase machine
  state.js          the one object holding the whole game
  house.js          draws the house, rooms, anchors
  hero.js           movement + carrying
  scavenge.js       phase 1
  workshop.js       phase 2 - combining
  rig.js            phase 3 - placement
  night.js          phase 4 - burglar routes, ticks
  fx.js             animation sequencer
  ui.js             meters, notebook, buttons
  audio.js          WebAudio blips
data/               <-- HENDRIX'S FOLDER
  items.js          the 18 items
  recipes.js        base recipes + upgrades
  rooms.js          the house layout + anchors
  burglars.js       stats, routes, personality
  difficulty.js     easy / medium / hard settings
  milestones.js     the build progress strip
```

Every file in `data/` opens with a plain-English header explaining exactly
how to add a new entry, written *to him*. Adding a trap should be
copy-a-block-and-change-the-words. Game logic never needs touching to add
content — that separation is the actual lesson.

**Deployment:** Render **Static Site**, connected to the GitHub repo. Build
command: *(blank)*. Publish directory: `.`. Auto-deploy on push.

**Local play while building:** ES modules need a server, so
`python3 -m http.server 8000` in the project folder, then `localhost:8000`.
One command, worth teaching him on day one.

---

## 9. Milestones

Ten checkpoints. Each one ends with something on screen and something for
Hendrix to change.

**M0 — Hello, House.** Repo, title screen with the three difficulty buttons,
live on Render. *He sees his game at a real URL on day one.*
→ *Hendrix's turn:* name the game and type it into the title.

**M1 — The House.** The full cross-section renders. Rooms outlined. Anchor
points glow when you hover them. Nothing else works.
→ *His turn:* change the wall colour in `tokens.css`.

**M2 — The Hero.** A character on screen. Arrow keys or click-to-move between
rooms. He can walk around an empty house.
→ *His turn:* change the hero's walk speed. Then set it to 50 and laugh.

**M3 — Collectables.** Items spawn in rooms. Walk over one to pick it up.
Inventory bar fills. Scavenge timer counts down, using the difficulty picked
on the title screen.
→ *His turn:* add a new item to `data/items.js`, then change the Hard timer
in `data/difficulty.js` and see if he can still beat it.

**M4 — The Workshop.** Drag two items together. Valid → trap discovered,
notebook entry unlocked. Invalid → puff of smoke and a wisecrack. Then
upgrades: feed a finished trap back in with a third item.
→ *His turn:* invent a base recipe from his own item, then invent an upgrade
for it. Both are copy-a-block-and-change-the-words in `data/recipes.js`.

**M5 — Rigging.** Place discovered traps at anchors. Mount-type rules
enforced. Remove and replace freely.
→ *His turn:* add an anchor point to a room that doesn't have one.

**M6 — The Burglars.** They break in and walk their routes. Traps don't fire
yet — you just watch them move through the house and feel the dread.
→ *His turn:* rename a burglar and rewrite one of his lines.

**M7 — Traps Fire.** Collision detection, nerve damage, meters drop,
placeholder effects. **The game is now playable end to end.**
→ *His turn:* tune a trap's nerve value and see if it's overpowered.

**M8 — Slapstick.** The real payoff animations. One authored sequence per
trap, 3-5 seconds, with the beat: *approach → trigger → chaos → reaction →
recover*. This is the milestone that makes it a game people want to play.
→ *His turn:* design a payoff for a trap he invented. Describe it; we animate
it together.

**M9 — Consequences.** Fleeing, dropped loot, the Neighbours Noticed meter,
sirens, arrests, win/lose screens, S-C grading.
→ *His turn:* decide how hard the police meter should be to fill.

**M10 — Polish.** Sound, dark mode, reduced motion, tablet layout, title art,
intro cutscene. Ship it and send the link to his friends.

---

## 10. Explicitly out of scope for v1

Roaming or learning burglar AI · multiple nights or campaign progression ·
physics engine · 3D · multiplayer or online scores · accounts, backend,
database · save games or localStorage · procedural houses · more than two
burglars.

**Phase 2 wishlist, for when v1 ships:** roaming burglars with simple
decision rules; the hero moveable during the night phase with a risk of being
spotted; escalating nights where burglars bring counters to your favourite
traps; a trap editor.

---

## 11. Done means

- A stranger understands what to do within ten seconds of the title screen
- All 27 recipes work, base and upgrade, each with its own animation
- The two burglars need genuinely different traps to beat
- A night runs 6-10 minutes and can be won *or* lost, at all three difficulty
  settings
- Restart resets everything cleanly, every time
- Works on desktop and tablet, keyboard and touch
- It looks like something a person drew on purpose
- **Hendrix can add a working trap to the game without help**

That last one is the real acceptance criterion.
