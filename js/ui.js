/* ===========================================================
   UI - the bits of the title screen you can click

   Three jobs in this file:
     1. Build the three difficulty buttons from data/difficulty.js
     2. Build the milestone strip from data/milestones.js
     3. Run the two little toggles in the top right corner

   Notice that this file never says "easy" or "M4" anywhere. It
   reads the lists out of data/ and draws whatever it finds. That
   is the whole trick: Hendrix edits data/, the game changes, and
   nobody has to touch js/.
   =========================================================== */

import { DIFFICULTY } from '../data/difficulty.js';
import { MILESTONES } from '../data/milestones.js';
import { state } from './state.js';
import { sfx } from './audio.js';

/* --- DIFFICULTY PICKER -------------------------------------- */

export function buildDifficulty(container) {
  container.innerHTML = '';

  DIFFICULTY.forEach((level) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'diff-btn';
    btn.dataset.id = level.id;
    btn.setAttribute('aria-pressed', String(level.id === state.difficulty));

    const name = document.createElement('span');
    name.className = 'diff-name';
    name.textContent = level.name;

    const time = document.createElement('span');
    time.className = 'diff-time';
    time.textContent = level.seconds + ' seconds';

    const note = document.createElement('span');
    note.className = 'diff-note';
    note.textContent = level.note;

    btn.append(name, time, note);
    btn.addEventListener('click', () => {
      state.difficulty = level.id;
      sfx.select();
      refreshDifficulty(container);
    });

    container.append(btn);
  });
}

function refreshDifficulty(container) {
  container.querySelectorAll('.diff-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.id === state.difficulty));
  });
}

/* --- MILESTONE STRIP ----------------------------------------
   Hendrix's progress bar. A dot goes green when a milestone is
   really finished, and not one second before.
   ------------------------------------------------------------ */

export function buildMilestones(list) {
  list.innerHTML = '';

  MILESTONES.forEach((m) => {
    const li = document.createElement('li');
    li.className = 'milestone' + (m.done ? ' is-done' : '');

    const dot = document.createElement('span');
    dot.className = 'dot';

    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = m.code;

    const name = document.createElement('span');
    name.textContent = m.name;

    li.append(dot, code, name);
    li.title = m.code + ' ' + m.name + (m.done ? ' (done)' : ' (not built yet)');
    list.append(li);
  });

  const done = MILESTONES.filter((m) => m.done).length;
  list.setAttribute('aria-label',
    'Build progress: ' + done + ' of ' + MILESTONES.length + ' milestones done');
}

/* --- THE TWO TOGGLES ---------------------------------------- */

export function setupToggles(themeBtn, soundBtn) {
  applyTheme(themeBtn);
  applySound(soundBtn);

  themeBtn.addEventListener('click', () => {
    state.theme = state.theme === 'night' ? 'day' : 'night';
    applyTheme(themeBtn);
    sfx.toggle();
  });

  soundBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;
    applySound(soundBtn);
    if (state.soundOn) sfx.toggle();
  });
}

function applyTheme(btn) {
  document.documentElement.dataset.theme = state.theme;
  const goingTo = state.theme === 'night' ? 'day' : 'night';
  btn.textContent = state.theme === 'night' ? '☀️' : '\u{1F319}';
  btn.setAttribute('aria-label', 'Switch to ' + goingTo + ' theme');
}

function applySound(btn) {
  btn.textContent = state.soundOn ? '\u{1F50A}' : '\u{1F507}';
  btn.setAttribute('aria-label', state.soundOn ? 'Turn sound off' : 'Turn sound on');
  btn.setAttribute('aria-pressed', String(state.soundOn));
}
