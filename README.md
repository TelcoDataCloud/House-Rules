# House Rules

A browser game built by Asa and Hendrix.

Two burglars are coming tonight. You have until midnight to raid your own
house for junk, bolt that junk into traps, rig every door and stair, then
hide in the attic and watch.

## How to run it

The game uses ES modules, and browsers refuse to load those from a file on
disk. So it needs a tiny web server. You already have one.

Open a terminal in this folder and run:

    python3 -m http.server 8000

Then open <http://localhost:8000> in your browser.

To stop the server, press Ctrl and C.

## What is in here

    index.html            the whole page, and the drawing of the house
    css/tokens.css        every colour and size in the game
    css/layout.css        where things sit and how big they are
    js/main.js            starts the game, switches screens
    js/state.js           the one object holding the whole game
    js/ui.js              the buttons on the title screen
    js/audio.js           little beeps, made by the browser, no sound files
    data/difficulty.js    easy, medium and hard
    data/milestones.js    the build progress strip

## Hendrix, read this bit

The `data/` folder is yours. Everything in it is a plain list of facts about
the game with no clever code in it. You can change anything in there, save
the file, refresh the page, and the game changes. You never have to touch
anything in `js/` to add new stuff.

`css/tokens.css` is the paint box. Every colour in the game is named in
there once, and everything else just says "use that one". Change it in one
place, it changes everywhere.

Two things to try right now:

1. Open `index.html`, find the line that says `House Rules`, and change it
   to whatever the game should actually be called.
2. Open `data/difficulty.js` and change hard from 100 seconds to 20. Save.
   Refresh. Have a look at what it says now.

## Rules of the project

- No build step, no npm, no framework. Edit a file, refresh, see it.
- No canvas. Everything is SVG and HTML, so you can right click any part
  of the game, choose Inspect, and find the line that draws it.
- Nothing is saved. Every refresh is a fresh night, on purpose.
