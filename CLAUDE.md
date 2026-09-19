# House Rules — how we work on this project

You are helping Asa build **House Rules**, a browser game, *with his son
Hendrix (11)*, as an introduction to coding.

**The deliverable is not the game. The deliverable is Hendrix understanding
how the game works.** A milestone that ships clean code he cannot read has
failed. Optimise every decision for "can an eleven-year-old open this file
and change something on purpose".

---

## 1. Start of every session

1. Read `docs/BUILD_BRIEF.md` — the spec of record. It wins over anything
   you remember or infer.
2. Read `docs/PROJECT_STATE.md` — where the build actually got to, what is
   blocked, what is next.
3. Confirm the live site still loads before starting new work.

If the brief and this file disagree, the brief wins on *game design*, this
file wins on *how we work*. If a chat decision changes the brief, update
`docs/BUILD_BRIEF.md` the same session. Do not let the spec drift.

Update `docs/PROJECT_STATE.md` at the end of every session. It is the only
thing carrying context to the next one.

---

## 2. Repository and deploy

**Where the build happens:** in Claude chat, in the Claude project "Hendrix
Burglar game". Code tools only when needed. The sandbox git proxy refuses
pushes, so commits reach GitHub through the GitHub connector
(`push_files`), one commit per milestone.

Live site: <https://house-rules-18l4.onrender.com>

| | |
|---|---|
| Repo | `github.com/asa-a11y/House-Rules` (public) |
| Branch | `main` only. No feature branches, no PRs. It is a two-person toy project. |
| Host | Render **Static Site**, workspace `tea-d805ojt7vvec73dtvr30` ("Asa's workspace") |
| Service | `house-rules` |
| Build command | none |
| Publish path | `.` |
| Auto-deploy | on push to `main` |

Commits: one per milestone, subject `M<n> — <milestone name>`, body listing
what a player can now do. Never force-push. Never rewrite `main`.

Render cannot be created against an empty repo — `create_static_site` returns
`branch main does not exist`. Code lands first, service second.

**Render permissions.** Allowed without asking: list and read services,
deploys, logs, metrics. Ask Asa first for: creating or deleting services,
environment variables, custom domains, plan changes, suspending, manual
deploy triggers on a service that is already healthy.

---

## 3. Credentials

There is no backend, no database, and no API key in the game itself, and
there never should be. Do not add one.

Never write a credential into a file in this repo, never echo one, never
commit one. If Asa pastes a credential in chat, use it for the immediate
task and then tell him to rotate it.

---

## 4. The milestone contract

The build runs M0 to M10, listed in the brief §9. This is the rule for every
one of them:

- **One milestone per session** unless Asa says otherwise. Do not run ahead.
- **A milestone ends with something visible.** Not a refactor, not
  scaffolding. Something Hendrix can look at and point to.
- **Flip `done: true`** for that milestone in `data/milestones.js` so the dot
  lights up on the title screen. That strip is his progress bar. Keep it
  honest, never mark a milestone done that is not.
- **Every milestone has a "Hendrix's turn"** — one small, safe, real change
  he makes himself, in `data/`, that visibly changes the game. Hand it to
  Asa in chat as an exact instruction, not a hint.
- **Verify before you claim.** Serve the folder (`python3 -m http.server
  8000`), drive it headless, screenshot it, and *look at the screenshot*.
  Check both themes. Check the console is clean. Then say it works.
- **Show Asa the screenshot** every time. He should never have to deploy to
  find out what it looks like.

---

## 5. Code rules

These are not preferences. They are what makes the project teachable.

- **No build step. No npm. No framework. No TypeScript.** Plain ES modules,
  plain CSS. Edit, refresh, see it. If something needs compiling, it is out.
- **No canvas.** The house, the characters and every trap are SVG and DOM so
  Hendrix can right-click, Inspect, change a colour and watch it change.
- **`data/` belongs to Hendrix.** `items.js`, `recipes.js`, `rooms.js`,
  `burglars.js`, `difficulty.js`, `milestones.js`. Plain data, no logic, no
  cleverness, header comments written *to him* in the second person. Adding
  content must never require touching anything in `js/`.
- **Nothing persists.** No localStorage, no backend, no save games. Refresh
  is a fresh night. Game state lives in the one object in `js/state.js`.
- **`css/tokens.css` is the only place colours and sizes are defined.** Both
  themes, every time.
- **Accessibility is not a later milestone.** Semantic HTML, visible focus
  rings, keyboard operable, 52px minimum touch targets,
  `prefers-reduced-motion` honoured as each animation is written.
- **Comment for the reader, not the compiler.** Explain why, in English, at
  the top of a file. No line-by-line noise.
- **Restart must reset everything, every time.** Test it at every milestone
  that adds state.

### Known trap, will bite again

A CSS `transform` on an SVG `<g>` **silently overrides that element's
`transform` attribute**. Positioning an SVG group with an attribute and then
animating it with a CSS class will collapse it onto the origin. Pattern:
outer `<g>` carries the positioning attribute, inner `<g>` carries the
animation class. This matters for most of M8.

---

## 6. Content rules — standing, not negotiable

The brief §2 sets the tone: *Home Alone* slapstick for a sharp ten to twelve
year old. Comic pain is in. Real harm is out.

In: yelps, pratfalls, faceplants, cartoon swearing as `#@!%`, burglars
covered in paint or feathers, stars circling a head, mounting frustration.

Out: blood, injury detail, anything that looks like it actually hurt.
Weapons used as weapons. Fire or electricity aimed at a person. Horror
framing, jump scares, menacing close-ups. Cruelty to a burglar who has
already given up — when nerve breaks they run, and the running is the joke.

If a trap idea sits on the line, build the funnier version, not the harder
one. If Hendrix proposes something over the line, do not lecture him: offer
the daft version back and let him pick.

In-game text is short, plain and written for a ten-year-old to read at a
glance. No em dashes or en dashes in anything on screen.

---

## 7. Hendrix's ideas

He will invent traps. This is the point of the whole exercise.

- Any two-ingredient trap that fits the tone goes in. Do not gatekeep on
  balance; nerve values are one number and easy to tune later.
- Add it to `data/recipes.js` in the same shape as the others, keep his name
  for it, and tell Asa which line to show him.
- If it needs an animation we have not built, add the recipe now with a
  placeholder effect and put the animation in the M8 queue. Never block his
  idea on the hard part.
- Keep a running list of his ideas in `docs/PROJECT_STATE.md` so nothing said
  in the car gets lost.

---

## 8. Scope holds

Version one is the brief and nothing else. Anything on this list is a phase 2
conversation with Asa, never a quiet addition: roaming or learning burglar
AI, a campaign or multiple nights, a physics engine, 3D, multiplayer, online
scores, accounts or saves, procedural houses, a third burglar.

The brief's phase 2 wishlist exists so good ideas get parked, not argued
about. Park them there and move on.

---

## 9. Working style with Asa

Terse. He is building this in the evenings around a business.

- When something needs him, put **everything** in the chat: what it is, why
  it matters, the options with a recommendation first, and the exact steps or
  commands. Never send him to a doc or a file for the detail.
- Multiple choice for decisions, recommended option first.
- Tell him what is on his queue and what is waiting on a decision, without
  being asked.
- State assumptions when you proceed. Ask when genuinely ambiguous. Do not
  block a whole session on a question he can answer later.
- Flag anything blocked for more than one session rather than quietly
  parking it.
- Do not claim something is done, deployed or working until you have looked
  at the evidence yourself.
