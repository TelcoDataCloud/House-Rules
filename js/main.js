/* ===========================================================
   MAIN - starts the game and decides which screen you see

   The game is one HTML page with a few <section class="screen">
   blocks inside it: the title, the intro, and the screen where
   the night happens. Only one of them has the class "is-active"
   at a time, and that is the one you can see.

   A night goes: title -> intro -> scavenge -> workshop -> rig ->
   night -> result. Each phase has its own file in js/ and its
   own panel in index.html. This file switches them on and off.
   =========================================================== */

import { state, setPhase, resetGame } from './state.js';
import { buildDifficulty, buildMilestones, setupToggles } from './ui.js';
import { buildHouse, setHouseMode, resetHouse } from './house.js';
import { sfx } from './audio.js';
import { setupScavenge, startNight, hideScavenge } from './scavenge.js';
import { setupWorkshop, showWorkshop, hideWorkshop } from './workshop.js';
import { setupRig, showRig, hideRig, drawRigged } from './rig.js';
import { setupNight, startBreakIn, stopBreakIn } from './night.js';
import { setupLoot } from './loot.js';
import { setupResult, showResult, hideResult } from './result.js';
import { setupIntro, startIntro } from './intro.js';
import { setupPuzzles } from './puzzles.js';
import { DIFFICULTY } from '../data/difficulty.js';

/* What each phase is called on screen, what you do in it, and a
   tip. */
const PHASE_INFO = {
  scavenge: {
    title: 'Scavenge',
    line: 'Raid your own house for junk before the clock runs out. Tap a room to walk there. Things hide where they belong: flour in the kitchen cupboards, rope on the tool wall. Pause any time to build traps, then come back for more.',
    milestone: 'Four things are locked: the safe, the piano, the shed and the cellar lights (the fuse box is in the utility room). Solve the puzzle and the best junk is yours.'
  },
  workshop: {
    title: 'Workshop',
    line: 'Bolt two bits of junk together and see what you get. Put one thing on the bench and listen for a clue. Still time on the clock? Go back out for more.',
    milestone: 'If two things make a trap that can be upgraded, a third box opens. Add one more thing to upgrade it.'
  },
  rig: {
    title: 'Rig',
    line: 'Put a trap on every door, stair and hallway.',
    milestone: 'A trap only fits the right kind of spot. Tap a room to zoom in for a closer look.'
  },
  night: {
    title: 'Night',
    line: 'Hide in the attic and watch it all go wrong for them.',
    milestone: 'Watch who yells loudest at what. Sid and Bruno do not hate the same things.'
  },
  result: {
    title: 'Result',
    line: 'Did they get the telly?',
    milestone: 'Play again and beat your grade. Your recipe notebook comes with you.'
  }
};

function el(id) {
  return document.getElementById(id);
}

/* Show one screen and hide the rest. */
function showScreen(name, moveFocus = true) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('is-active', screen.dataset.screen === name);
  });
  /* Send keyboard focus to the top of the new screen so people
     using a keyboard or a screen reader do not get left behind. */
  const active = document.querySelector('.screen.is-active');
  if (active && moveFocus) {
    /* the first heading you can actually see */
    const heading = [...active.querySelectorAll('h1, h2, .phase-name')].find((h) => h.offsetParent !== null);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }
  window.scrollTo(0, 0);
}

/* The three phases that actually happen inside the house. The
   workshop is at a bench and the result screen is afterwards, so
   neither of those needs the floor plan. */
const PHASES_WITH_HOUSE = ['scavenge', 'rig', 'night'];

function renderPhaseScreen(phase) {
  const info = PHASE_INFO[phase];
  if (!info) return;
  const level = DIFFICULTY.find((d) => d.id === state.difficulty);

  el('house-wrap').hidden = !PHASES_WITH_HOUSE.includes(phase);
  /* at night the house shrinks a little so it all fits on screen
     with the meters under it */
  el('house-wrap').classList.toggle('is-night', phase === 'night');
  document.querySelector('.phase-card').hidden = phase === 'result';
  /* Rigging shows the trap spots, the night shows your traps, and
     the scavenge is a hunt. */
  setHouseMode(phase === 'rig' || phase === 'night' ? phase : 'search');

  el('phase-name').textContent = info.title;
  el('phase-line').textContent = info.line;
  el('phase-milestone').textContent = info.milestone;
  el('phase-difficulty').textContent =
    'Difficulty: ' + level.name + ', ' + level.seconds + ' seconds to scavenge.';
}

function boot() {
  buildDifficulty(el('difficulty'));
  buildMilestones(el('milestones'));
  setupToggles(el('theme-toggle'), el('sound-toggle'));
  buildHouse(el('house'), el('house-caption'), el('legend'),
    { name: el('room-hud-name'), note: el('room-hud-note'), out: el('zoom-out') },
    (room) => { state.room = room; });
  setupLoot();

  setupPuzzles({
    dialog: el('puzzle'), title: el('puzzle-title'), time: el('puzzle-time'), clue: el('puzzle-clue'),
    body: el('puzzle-body'), say: el('puzzle-say'), leave: el('puzzle-leave')
  });

  setupScavenge({
    bar: el('scavenge-bar'), clock: el('clock'), time: el('clock-time'), notes: el('notes'),
    bag: el('bag'), count: el('bag-count'), done: el('done-btn'),
    end: el('scavenge-end'), endText: el('scavenge-end-text'), toWorkshop: el('to-workshop')
  });

  setupWorkshop({
    panel: el('workshop'), face: el('ws-face'), say: el('ws-say'), bench: el('ws-bench'),
    slotA: el('ws-slot-a'), slotB: el('ws-slot-b'), slotC: el('ws-slot-c'), plusC: el('ws-plus-c'),
    buildNow: el('ws-build-now'), result: el('ws-result'),
    items: el('ws-items'), traps: el('ws-traps'), toRig: el('to-rig'),
    notebook: el('notebook'), found: el('ws-found'), ideas: el('ws-ideas'), backOut: el('ws-back-out')
  });

  setupRig({
    panel: el('rig'), tray: el('rig-tray'), say: el('rig-say'), count: el('rig-count'),
    back: el('rig-back'), letIn: el('let-in')
  });

  setupNight({
    panel: el('night'), cams: el('night-cams'), log: el('night-log'), haul: el('night-haul'),
    fast: el('night-fast'), zoom: el('night-zoom'), meters: el('night-meters')
  });

  setupResult({
    panel: el('result'), heading: el('result-title'), line: el('result-line'),
    grade: el('result-grade'), stats: el('result-stats'), tip: el('result-tip'),
    burglars: el('result-burglars'), traps: el('result-traps'),
    again: el('result-again'), title: el('result-title-btn')
  });

  setupIntro({
    svg: el('intro-stage'), words: el('intro-words'), next: el('intro-next'),
    skip: el('intro-skip'), count: el('intro-count')
  });

  el('start-btn').addEventListener('click', () => {
    sfx.start();
    setPhase('intro');
  });

  el('back-btn').addEventListener('click', () => {
    sfx.back();
    resetGame();
  });

  /* One place decides what a phase change looks like. */
  document.addEventListener('phasechange', (event) => {
    const phase = event.detail;
    if (phase === 'title') {
      /* Forget every search and zoom out, so restart really
         does leave nothing behind. */
      hideScavenge();
      hideWorkshop();
      hideRig();
      stopBreakIn();
      hideResult();
      resetHouse();
      setHouseMode('search');
      showScreen('title');
    } else if (phase === 'intro') {
      showScreen('intro');
      startIntro();
    } else {
      renderPhaseScreen(phase);
      /* switch everything off, then switch on what this phase needs */
      hideScavenge();
      hideWorkshop();
      hideRig();
      stopBreakIn();
      hideResult();
      if (phase === 'scavenge') startNight();
      else if (phase === 'workshop') showWorkshop();
      else if (phase === 'rig') showRig();
      else if (phase === 'night') { drawRigged(); startBreakIn(); }
      else if (phase === 'result') showResult();
      showScreen('phase');
    }
  });

  showScreen('title', false);

  /* A door into the game from the browser console, so you can
     poke at it while it runs. Try: HOUSE.state */
  window.HOUSE = { state, setPhase, resetGame };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
