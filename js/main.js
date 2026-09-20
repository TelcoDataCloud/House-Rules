/* ===========================================================
   MAIN - starts the game and decides which screen you see

   The game is one HTML page with several <section class="screen">
   blocks inside it. Only one of them has the class "is-active"
   at a time, and that is the one you can see. Switching screens
   is nothing more exciting than moving that class around.

   Right now only the title screen has anything in it. The other
   phases show a placeholder that says which milestone builds it.
   That is honest, and it means the phase machine is real from
   day one instead of being bolted on later.
   =========================================================== */

import { state, setPhase, resetGame } from './state.js';
import { buildDifficulty, buildMilestones, setupToggles } from './ui.js';
import { buildHouse, setHouseMode, resetHouse } from './house.js';
import { sfx } from './audio.js';
import { setupScavenge, startNight, showBagOnly, hideScavenge } from './scavenge.js';
import { DIFFICULTY } from '../data/difficulty.js';

/* What each phase is called on screen, and what it will do
   once we have built it. */
const PHASE_INFO = {
  scavenge: {
    title: 'Scavenge',
    line: 'Raid your own house for junk before the clock runs out. Some of it is lying about. Most of it is hidden.',
    milestone: 'M2 puts you in the house. For now, tap a room to go in.'
  },
  workshop: {
    title: 'Workshop',
    line: 'Bolt two bits of junk together and see what you get. Here is what you carried.',
    milestone: 'M4 builds this one.'
  },
  rig: {
    title: 'Rig',
    line: 'Put a trap on every door, stair and hallway.',
    milestone: 'M5 builds this one.'
  },
  night: {
    title: 'Night',
    line: 'Hide in the attic and watch it all go wrong for them.',
    milestone: 'M6 and M7 build this one.'
  },
  result: {
    title: 'Result',
    line: 'Did they get the telly?',
    milestone: 'M9 builds this one.'
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
    const heading = active.querySelector('h1, h2, .phase-name');
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
  /* Rigging shows the trap spots. Everything else is a hunt. */
  setHouseMode(phase === 'rig' ? 'rig' : 'search');

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

  setupScavenge({
    bar: el('scavenge-bar'), clock: el('clock'), time: el('clock-time'),
    bag: el('bag'), count: el('bag-count'), done: el('done-btn'),
    end: el('scavenge-end'), endText: el('scavenge-end-text'), toWorkshop: el('to-workshop')
  });

  el('start-btn').addEventListener('click', () => {
    sfx.start();
    setPhase('scavenge');
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
      resetHouse();
      setHouseMode('search');
      showScreen('title');
    } else {
      renderPhaseScreen(phase);
      showScreen('phase');
      /* the scavenge starts the clock; after it, the bag stays */
      if (phase === 'scavenge') startNight();
      else if (phase === 'workshop') showBagOnly();
      else hideScavenge();
    }
  });

  showScreen('title', false);

  /* A door into the game from the browser console, so you can
     poke at it while it runs. Try: HOUSE.state */
  window.HOUSE = { state, setPhase, resetGame };
  /* Want to see the trap spots before M5? Type: HOUSE.setPhase('rig') */
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
