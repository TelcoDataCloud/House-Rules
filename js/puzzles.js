/* ===========================================================
   PUZZLES - the box that pops up when you try a lock

   Ten things in the house are locked (data/rooms.js says which,
   with lock: 'safe' and so on). Try to open one and this box pops
   up over the house with that lock's puzzle in it.

       safe    Dad's note has the code, written as sums
       shed    a riddle, and jumbled letters to spell the answer
       piano   music on the stand, in colours. Play it.
       fuse    flip on fuses that add up to the label
       keypad  clues on a sticky note. Only one code fits them all.
       telly   a number pattern. What comes next?
       mirror  a question written back to front in the steam
       morse   the key safe beeps a word in dots and dashes
       books   pull the books out smallest to biggest
       hoover  write a program to drive the robot hoover home

   The first four are in this file. The next five are in
   js/puzzles-more.js and the hoover has its own file, js/hoover.js.
   Tonight's answers are made up by js/puzzle-maths.js.

   THE CLOCK
   On Easy and Medium the scavenge clock STOPS while this box is
   open, so you can think. On Hard it runs at half speed.
   data/difficulty.js says which (puzzleClock).

   HINTS
   The Hint button tells you a bit of the answer and costs you
   seconds off the clock. data/puzzles.js says how many seconds.
   =========================================================== */

import { state } from './state.js';
import { SAFE, PIANO, HINTS } from '../data/puzzles.js';
import { ROOMS } from '../data/rooms.js';
import { sfx } from './audio.js';
import { hidingPlaces } from './house.js';
import { makeAll } from './puzzle-maths.js';
import { MORE } from './puzzles-more.js';
import { buildHoover, checkMaps } from './hoover.js';

const ui = {};
let current = null;          // { lock, onSolved, helper, hints } while a puzzle is open
const timers = [];           // anything waiting to happen inside the box
let onTime = () => {};       // js/scavenge.js listens, so its clock shows hints too

/* --- TONIGHT'S ANSWERS -------------------------------------- */

export function newPuzzles() {
  state.puzzles = makeAll(state.puzzleLevel);
  state.unlocked = [];
  state.notes = [];
  state.hintsUsed = {};
}

const NAMES = {
  safe: SAFE.name, shed: 'Shed padlock', piano: PIANO.name, fuse: 'Fuse box',
  keypad: 'Garage keypad', telly: 'TV cabinet', mirror: 'Bathroom cabinet',
  morse: 'Key safe', books: 'Bookshelf', hoover: 'Cupboard under the stairs'
};

export function isLocked(lock) {
  return Boolean(lock) && !state.unlocked.includes(lock);
}

export function lockName(lock) {
  return NAMES[lock] || 'Lock';
}

/* What Dad's note says, once you have found it. */
export function noteText() {
  if (!state.puzzles) return '';
  return `${SAFE.noteSays} ${state.puzzles.safe.sums.join(', then ')}.`;
}

/* --- THE KIT -------------------------------------------------
   Little tools every puzzle uses, so each puzzle can just get on
   with being a puzzle.
   ------------------------------------------------------------ */

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(cls, text, label, onClick) {
  const b = el('button', `btn ${cls}`, text);
  b.type = 'button';
  if (label) b.setAttribute('aria-label', label);
  b.addEventListener('click', onClick);
  return b;
}

function say(words, mood = '') {
  ui.say.textContent = words;
  ui.say.className = `pz-say ${mood}`;
}

function shake() {
  ui.body.classList.remove('is-wrong');
  void ui.body.offsetWidth;            // restart the shake if it is already going
  ui.body.classList.add('is-wrong');
}

function clue(words, note = false) {
  ui.clue.textContent = words;
  ui.clue.classList.toggle('is-note', note);
}

function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

function calm() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* A number pad, like on a phone. Type a number, press Enter.
   The workbench uses it too, for the blueprint questions. */
export function numberPad(longest, onEnter) {
  const wrap = el('div', 'pz-pad-wrap');
  const show = el('output', 'pz-pad-show', '');
  show.setAttribute('aria-live', 'polite');
  let typed = '';
  const draw = () => {
    show.textContent = typed || ' ';
    show.setAttribute('aria-label', typed ? `You typed ${typed.split('').join(' ')}` : 'Nothing typed yet');
  };
  const pad = el('div', 'pz-pad');
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].forEach((k) => {
    if (k === 'del') {
      pad.append(button('pz-key-del', '⌫', 'Delete', () => { typed = typed.slice(0, -1); sfx.tick(); draw(); }));
    } else if (k === 'ok') {
      pad.append(button('pz-key-ok', 'OK', 'Enter', () => {
        if (!typed) return;
        const result = onEnter(typed);
        if (result === false) { typed = ''; draw(); }
      }));
    } else {
      pad.append(button('pz-key-num', k, null, () => {
        if (typed.length >= longest) return;
        typed += k;
        sfx.tick();
        draw();
      }));
    }
  });
  draw();
  wrap.append(show, pad);
  /* type on the keyboard too */
  wrap.addEventListener('keydown', (event) => {
    if (/^[0-9]$/.test(event.key) && typed.length < longest) { typed += event.key; sfx.tick(); draw(); }
    if (event.key === 'Backspace') { typed = typed.slice(0, -1); draw(); }
  });
  return { node: wrap, clear: () => { typed = ''; draw(); } };
}

function kit() {
  return {
    el, button, say, shake, clue, later, numberPad, solved,
    body: ui.body, calm: calm(), level: state.puzzleLevel
  };
}

function solved() {
  if (!current) return;
  const { lock, onSolved } = current;
  if (!state.unlocked.includes(lock)) state.unlocked.push(lock);
  sfx.unlock();
  const words = { fuse: 'CLUNK! The lights are on!', keypad: 'BEEP BEEP! The garage door rolls up!', hoover: 'Docked! The cupboard pops open!' };
  say(words[lock] || 'CLICK! It is open!', 'is-good');
  ui.dialog.classList.add('is-solved');
  ui.body.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  ui.hint.disabled = true;
  if (onSolved) onSolved(lock);
  later(closePuzzle, 1200);
}

/* --- THE SAFE: three or four dials -------------------------- */

function noteSpotWords() {
  const spot = hidingPlaces().find((s) => s.id === state.noteSpot);
  const room = spot && ROOMS.find((r) => r.id === spot.room);
  return { room: room ? room.name : 'house', spot: spot ? spot.name : 'somewhere' };
}

function buildSafe(k, p) {
  const found = () => state.notes.includes('safe');
  clue(found()
    ? `Dad's note says: "${noteText()}"`
    : 'Locked. Dad can never remember codes, so he writes them down. Find his note. It is somewhere downstairs.', found());
  const dials = el('div', 'pz-dials');
  const value = p.code.map(() => 0);
  value.forEach((_, i) => {
    const dial = el('div', 'pz-dial');
    const out = el('output', 'pz-digit', '0');
    out.setAttribute('aria-label', `Number ${i + 1}`);
    const turn = (by) => () => {
      value[i] = (value[i] + by + 10) % 10;
      out.textContent = String(value[i]);
      sfx.tick();
    };
    dial.append(
      button('pz-turn', '▲', `Number ${i + 1} up`, turn(1)),
      out,
      button('pz-turn', '▼', `Number ${i + 1} down`, turn(-1))
    );
    dials.append(dial);
  });
  const go = button('btn-big pz-go', 'Open it', null, () => {
    if (value.every((v, i) => v === p.code[i])) { solved(); return; }
    sfx.nope();
    shake();
    const right = value.filter((v, i) => v === p.code[i]).length;
    say(found() ? `Nope. ${right} of ${p.code.length} numbers are right. Check your sums.` : 'Nope. You need the code. Find the note!', 'is-bad');
  });
  ui.body.append(dials, go);
  return {
    hint(n) {
      if (!found()) {
        const where = noteSpotWords();
        return n === 1 ? `Dad's note is somewhere in the ${where.room}.` : `Dad's note is in: ${where.spot}.`;
      }
      return `Number ${n} is ${p.code[n - 1]}. ${p.sums[n - 1]} = ${p.code[n - 1]}.`;
    }
  };
}

/* --- THE SHED: jumbled letters, tap them in order ----------- */

function buildShed(k, p) {
  clue(`The tag on the padlock says: "${p.riddle}"${p.spare.length ? ` (Watch out: ${p.spare.length === 1 ? 'one letter is' : 'two letters are'} not needed.)` : ''}`);
  const slots = el('div', 'pz-slots');
  const tiles = el('div', 'pz-tiles');
  const picked = [];                       // which tile is in each slot, in order

  const draw = () => {
    slots.innerHTML = '';
    p.word.split('').forEach((_, i) => {
      const tile = picked[i];
      const slot = button('pz-slot', tile !== undefined ? p.letters[tile] : '',
        tile !== undefined ? `Letter ${i + 1}: ${p.letters[tile]}. Tap to take it back.` : `Letter ${i + 1}: empty`,
        () => {
          if (tile === undefined) return;
          picked.splice(i);                // take this one and everything after it back
          sfx.tick();
          draw();
        });
      slots.append(slot);
    });
    tiles.innerHTML = '';
    p.letters.forEach((letter, t) => {
      const used = picked.includes(t);
      const b = button('pz-tile', letter, `Letter ${letter}`, () => {
        if (used || picked.length >= p.word.length) return;
        picked.push(t);
        sfx.tick();
        draw();
        if (picked.length === p.word.length) check();
      });
      b.disabled = used;
      tiles.append(b);
    });
  };

  const check = () => {
    const spelled = picked.map((t) => p.letters[t]).join('');
    if (spelled === p.word) { solved(); return; }
    sfx.nope();
    shake();
    say(`${spelled}? No. Try again.`, 'is-bad');
    later(() => { picked.length = 0; draw(); }, 700);
  };

  draw();
  ui.body.append(slots, tiles);
  return {
    hint(n) {
      if (n === 1) return `It starts with ${p.word[0]}. It has ${p.word.length} letters.`;
      return p.spare.length
        ? `It ends with ${p.word[p.word.length - 1]}. You do not need: ${p.spare.join(' and ')}.`
        : `It ends with ${p.word[p.word.length - 1]}.`;
    }
  };
}

/* --- THE PIANO: play the colours in order ------------------- */

function buildPiano(k, p) {
  clue(p.peek
    ? `There is music on the stand, but the window is open. It will blow away in ${p.peek} seconds. Remember it, then play it.`
    : 'The lid is locked. There is music on the stand. Play the colours in order.');
  const music = el('ol', 'pz-music');
  music.setAttribute('aria-label', `The music: ${p.tune.join(', ')}`);
  const notes = p.tune.map((colour) => {
    const n = el('li', `pz-note key-${colour}`);
    n.setAttribute('aria-hidden', 'true');
    music.append(n);
    return n;
  });
  let at = 0;
  const mark = () => notes.forEach((n, i) => n.classList.toggle('is-played', i < at));
  const blowAway = () => {
    music.classList.add('is-gone');
    music.setAttribute('aria-label', 'The music blew away. Play it from memory.');
    say('Whoosh! The music blew away.');
  };
  const showFor = (seconds) => {
    music.classList.remove('is-gone');
    music.setAttribute('aria-label', `The music: ${p.tune.join(', ')}`);
    later(blowAway, seconds * 1000);
  };
  if (p.peek) showFor(p.peek);
  const keys = el('div', 'pz-keys');
  PIANO.keys.forEach((colour, n) => {
    keys.append(button(`pz-key key-${colour}`, '', `${colour} key`, () => {
      sfx.note(n);
      if (colour === p.tune[at]) {
        at += 1;
        mark();
        if (at === p.tune.length) later(solved, 250);
      } else {
        at = 0;
        mark();
        later(() => sfx.nope(), 120);
        shake();
        say('Plonk. Wrong note. Start again.', 'is-bad');
      }
    }));
  });
  ui.body.append(music, keys);
  return {
    hint(n) {
      if (p.peek && n === 1) { showFor(3); return 'The music is back for 3 seconds. Quick!'; }
      const from = at < p.tune.length ? at : 0;
      const bit = p.tune.slice(from, from + n);
      return `From note ${from + 1}, play: ${bit.join(', ')}.`;
    }
  };
}

/* --- THE FUSE BOX: flip fuses that add up to the label ------ */

function buildFuse(k, p) {
  clue(`The cellar lights are out. The label on the fuse box says: NEEDS ${p.target}. Flip on fuses that add up to ${p.target}, then pull the big switch.`, true);
  const on = p.fuses.map(() => false);
  const row = el('div', 'pz-fuses');
  const total = el('p', 'pz-total', 'On: 0');
  const sum = () => p.fuses.reduce((s, n, i) => s + (on[i] ? n : 0), 0);
  p.fuses.forEach((n, i) => {
    const b = button('pz-fuse', String(n), `Fuse ${n}: off`, () => {
      on[i] = !on[i];
      b.classList.toggle('is-on', on[i]);
      b.setAttribute('aria-pressed', String(on[i]));
      b.setAttribute('aria-label', `Fuse ${n}: ${on[i] ? 'on' : 'off'}`);
      sfx.tick();
      say('');
      total.textContent = k.level === 'brainbuster' ? 'Add it up yourself!' : `On: ${sum()}`;
    });
    b.setAttribute('aria-pressed', 'false');
    row.append(b);
  });
  if (k.level === 'brainbuster') total.textContent = 'Add it up yourself!';
  const pull = button('btn-big pz-go', 'Pull the big switch', null, () => {
    const got = sum();
    if (got === p.target) { solved(); return; }
    sfx.nope();
    shake();
    say(got > p.target ? `POP! That was ${got}. Too much!` : `Fzzt. That was ${got}. Not enough.`, 'is-bad');
  });
  ui.body.append(row, total, pull);
  return {
    hint(n) {
      if (n === 1) return `Fuse ${p.answer[0]} is one of them.${k.level === 'brainbuster' ? ' In binary, start with the biggest fuse that is not too big.' : ''}`;
      if (p.answer.length === 2) return `The other one is fuse ${p.answer[1]}.`;
      return `Fuse ${p.answer[1]} is one too. ${p.target} - ${p.answer[0]} - ${p.answer[1]} = ${p.target - p.answer[0] - p.answer[1]}. What makes that?`;
    }
  };
}

const BUILDERS = {
  safe: buildSafe, shed: buildShed, piano: buildPiano, fuse: buildFuse,
  ...MORE,
  hoover: buildHoover
};

/* --- HINTS --------------------------------------------------- */

function drawHint() {
  const used = state.hintsUsed[current.lock] || 0;
  const left = HINTS.most - used;
  ui.hint.disabled = left <= 0 || !current.helper || state.unlocked.includes(current.lock);
  ui.hint.textContent = left > 0 ? `Hint (costs ${HINTS.cost} seconds)` : 'No hints left';
}

function useHint() {
  if (!current || !current.helper) return;
  const used = (state.hintsUsed[current.lock] || 0) + 1;
  if (used > HINTS.most) return;
  state.hintsUsed[current.lock] = used;
  state.timeLeft = Math.max(1, state.timeLeft - HINTS.cost);
  showTime();
  onTime();
  sfx.select();
  const line = el('li', 'pz-hint-line', current.helper.hint(used));
  ui.hints.append(line);
  ui.hints.hidden = false;
  drawHint();
}

/* --- OPEN AND CLOSE ------------------------------------------ */

/* Open the puzzle for a lock. onSolved is called once it opens. */
export function openPuzzle(lock, onSolved) {
  if (!BUILDERS[lock] || !state.puzzles) return;
  if (!isLocked(lock)) { if (onSolved) onSolved(lock); return; }
  timers.splice(0).forEach(clearTimeout);
  current = { lock, onSolved, helper: null };
  ui.dialog.dataset.lock = lock;
  ui.dialog.classList.remove('is-solved');
  ui.title.textContent = lockName(lock);
  ui.body.innerHTML = '';
  ui.body.classList.remove('is-wrong');
  ui.hints.innerHTML = '';
  ui.hints.hidden = true;
  say('');
  current.helper = BUILDERS[lock](kit(), state.puzzles[lock]) || null;
  /* hints you already paid for come back if you leave and return */
  const used = state.hintsUsed[lock] || 0;
  if (used && current.helper) {
    for (let n = 1; n <= used; n += 1) ui.hints.append(el('li', 'pz-hint-line', current.helper.hint(n)));
    ui.hints.hidden = false;
  }
  drawHint();
  showTime();
  if (!ui.dialog.open) {
    if (ui.dialog.showModal) ui.dialog.showModal(); else ui.dialog.setAttribute('open', '');
  }
  const first = ui.body.querySelector('button:not([disabled])');
  if (first) first.focus();
}

export function closePuzzle() {
  timers.splice(0).forEach(clearTimeout);
  current = null;
  if (ui.dialog && ui.dialog.open) {
    if (ui.dialog.close) ui.dialog.close(); else ui.dialog.removeAttribute('open');
  }
}

export function puzzleOpen() {
  return Boolean(current);
}

/* The clock in the corner of the box, so you know how long you
   have left. js/scavenge.js calls this every second. */
export function showTime() {
  if (!ui.time) return;
  const t = Math.max(0, state.timeLeft);
  ui.time.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/* Say what the clock is doing while the box is open. */
export function showClockMode(mode) {
  if (!ui.mode) return;
  ui.mode.textContent = { stop: 'Clock stopped while you think', slow: 'Clock at half speed', run: 'Clock running' }[mode] || '';
}

export function setPuzzleTimeListener(fn) { onTime = fn; }

export function setupPuzzles(els) {
  Object.assign(ui, els);
  ui.leave.addEventListener('click', () => { sfx.back(); closePuzzle(); });
  ui.hint.addEventListener('click', useHint);
  /* Escape closes it too (the browser does that for a dialog);
     this makes sure we forget it was open. */
  ui.dialog.addEventListener('close', () => {
    if (ui.dialog.open) return;          // already opened again for another lock
    current = null;
    timers.splice(0).forEach(clearTimeout);
  });
  checkMaps();
}
