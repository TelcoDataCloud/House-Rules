# Snot Moon

The third game. Zombies come every night; you cure them, and every cured
zombie joins your village and goes to work. Lives at `/zombies/`.

- Spec: `claude/ZOMBIE_BRIEF.md` in the Claude project.
- `data/` is Hendrix's folder: traps, zombies, villagers, nights, lines,
  difficulty, milestones. Plain lists, no logic.
- `art/` has one SVG per thing. `tools/make-art.py` wrote the first
  versions; edit the SVGs by hand after that.
- No build step. `python3 -m http.server 8000` in the repo, then open
  `localhost:8000/zombies/`.
- Testing: `?fast=4` runs the night four times faster, `?mode=hard`
  picks Hard. `ZOMBIES.state` in the console shows everything.

Playwright note: the sandbox's headless Chromium crashes if an SVG file is
parsed with `DOMParser` and `importNode`d into the page. `js/art.js` uses
`insertAdjacentHTML` instead. Block the Google Fonts request in headless
runs or the page load hangs.
