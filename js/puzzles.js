/* ===========================================================
   PUZZLES - the safe, the shed padlock, the piano lid and the
   fuse box

   Four things in the house are locked (data/rooms.js says which,
   with lock: 'safe' and so on). Try to open one and a little
   puzzle pops up over the house. The clock keeps running while
   you think, so be quick.

       safe   three numbers. Dad hid a note with the code on it,
              written as sums. Find the note, do the sums.
       shed   a padlock with letters on it. Read the riddle on the
              tag and spell the answer.
       piano  music on the stand, in colours. Play it.
       fuse   the cellar lights are out. Flip on fuses that add up
              to the number on the label, then pull the big switch.

   Every night gets a new code, word, tune and fuse number
   (newPuzzles below), kept in state.puzzles. data/puzzles.js has
   the riddles, the colours, the fuses and how long things are.
   =========================================================== */

import { state } from './state.js';
import { SAFE, SHED, PIANO, FUSE } from '../data/puzzles.js';
import { sfx } from './audio.js';

const ui = {};
let current = null;          // { lock, onSolved } while a puzzle is open
let solvedTimer = null;

function shuffle(list) {
  const deck = [...list];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
const roll = (n) => Math.floor(Math.random() * n);

/* --- TONIGHT'S ANSWERS -------------------------------------- */

export function newPuzzles() {
  /* the safe: three numbers, each written as a little sum */
  const code = Array.from({ length: SAFE.digits }, () => roll(10));
  const sums = code.map((d) => {
    const a = roll(d + 1);
    return `${a} + ${d - a}`;
  });

  /* the shed: one riddle, its letters jumbled (never the right
     way round already) */
  const pick = SHED.riddles[roll(SHED.riddles.length)];
  let letters = shuffle(pick.word.split(''));
  for (let i = 0; i < 10 && letters.join('') === pick.word; i += 1) letters = shuffle(letters);

  /* the piano: a few colours in a row, never the same one twice
     in a row */
  const tune = [];
  while (tune.length < PIANO.tuneLength) {
    const k = roll(PIANO.keys.length);
    if (k !== tune[tune.length - 1]) tune.push(k);
  }

  state.puzzles = {
    safe: { code, sums },
    shed: { riddle: pick.riddle, word: pick.word, letters },
    piano: { tune: tune.map((k) => PIANO.keys[k]) },
    fuse: { target: FUSE.targets[roll(FUSE.targets.length)] }
  };
  state.unlocked = [];
  state.notes = [];
}

export function isLocked(lock) {
  return Boolean(lock) && !state.unlocked.includes(lock);
}

export function lockName(lock) {
  return { safe: SAFE.name, shed: SHED.name, piano: PIANO.name, fuse: FUSE.name }[lock] || 'Lock';
}

/* What Dad's note says, once you have found it. */
export function noteText() {
  if (!state.puzzles) return '';
  return `${SAFE.noteSays} ${state.puzzles.safe.sums.join(', then ')}.`;
}

/* --- THE BOX THAT POPS UP ----------------------------------- */

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

function solved() {
  if (!current) return;
  const { lock, onSolved } = current;
  if (!state.unlocked.includes(lock)) state.unlocked.push(lock);
  sfx.unlock();
  say(lock === 'fuse' ? 'CLUNK! The lights are on!' : 'CLICK! It is open!', 'is-good');
  ui.dialog.classList.add('is-solved');
  ui.body.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  if (onSolved) onSolved(lock);
  clearTimeout(solvedTimer);
  solvedTimer = setTimeout(closePuzzle, 1000);
}

/* The safe: three dials, up and down. */
function buildSafe() {
  const p = state.puzzles.safe;
  const found = state.notes.includes('safe');
  ui.clue.textContent = found
    ? `Dad's note says: "${noteText()}"`
    : 'Locked. Dad can never remember codes, so he writes them down. Find his note. It is somewhere downstairs.';
  ui.clue.classList.toggle('is-note', found);
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
    say(found ? 'Nope. Check your sums.' : 'Nope. You need the code. Find the note!', 'is-bad');
  });
  ui.body.append(dials, go);
}

/* The shed: jumbled letters, tap them in order. */
function buildShed() {
  const p = state.puzzles.shed;
  ui.clue.textContent = `The tag on the padlock says: "${p.riddle}"`;
  ui.clue.classList.remove('is-note');
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
    setTimeout(() => { picked.length = 0; draw(); }, 700);
  };

  draw();
  ui.body.append(slots, tiles);
}

/* The piano: play the colours in order. */
function buildPiano() {
  const p = state.puzzles.piano;
  ui.clue.textContent = 'The lid is locked. There is music on the stand. Play the colours in order.';
  ui.clue.classList.remove('is-note');
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
  const keys = el('div', 'pz-keys');
  PIANO.keys.forEach((colour, k) => {
    keys.append(button(`pz-key key-${colour}`, '', `${colour} key`, () => {
      sfx.note(k);
      if (colour === p.tune[at]) {
        at += 1;
        mark();
        if (at === p.tune.length) setTimeout(solved, 250);
      } else {
        at = 0;
        mark();
        setTimeout(() => sfx.nope(), 120);
        shake();
        say('Plonk. Wrong note. Start again.', 'is-bad');
      }
    }));
  });
  ui.body.append(music, keys);
}

/* The fuse box: flip fuses on until they add up to the label,
   then pull the big switch. Any fuses that add up will do. */
function buildFuse() {
  const p = state.puzzles.fuse;
  ui.clue.textContent = `The cellar lights are out. The label on the fuse box says: NEEDS ${p.target}. Flip on fuses that add up to ${p.target}, then pull the big switch.`;
  ui.clue.classList.add('is-note');
  const on = FUSE.fuses.map(() => false);
  const row = el('div', 'pz-fuses');
  FUSE.fuses.forEach((n, i) => {
    const b = button('pz-fuse', String(n), `Fuse ${n}: off`, () => {
      on[i] = !on[i];
      b.classList.toggle('is-on', on[i]);
      b.setAttribute('aria-pressed', String(on[i]));
      b.setAttribute('aria-label', `Fuse ${n}: ${on[i] ? 'on' : 'off'}`);
      sfx.tick();
      say('');
    });
    b.setAttribute('aria-pressed', 'false');
    row.append(b);
  });
  const pull = button('btn-big pz-go', 'Pull the big switch', null, () => {
    const total = FUSE.fuses.reduce((sum, n, i) => sum + (on[i] ? n : 0), 0);
    if (total === p.target) { solved(); return; }
    sfx.nope();
    shake();
    say(total > p.target
      ? `POP! That was ${total}. Too much!`
      : `Fzzt. That was ${total}. Not enough.`, 'is-bad');
  });
  ui.body.append(row, pull);
}

const BUILDERS = { safe: buildSafe, shed: buildShed, piano: buildPiano, fuse: buildFuse };

/* Open the puzzle for a lock. onSolved is called once it opens. */
export function openPuzzle(lock, onSolved) {
  if (!BUILDERS[lock] || !state.puzzles) return;
  if (!isLocked(lock)) { if (onSolved) onSolved(lock); return; }
  current = { lock, onSolved };
  ui.dialog.dataset.lock = lock;
  ui.dialog.classList.remove('is-solved');
  ui.title.textContent = lockName(lock);
  ui.body.innerHTML = '';
  ui.body.classList.remove('is-wrong');
  say('');
  BUILDERS[lock]();
  showTime();
  if (!ui.dialog.open) {
    if (ui.dialog.showModal) ui.dialog.showModal(); else ui.dialog.setAttribute('open', '');
  }
  const first = ui.body.querySelector('button:not([disabled])');
  if (first) first.focus();
}

export function closePuzzle() {
  clearTimeout(solvedTimer);
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

export function setupPuzzles(els) {
  Object.assign(ui, els);
  ui.leave.addEventListener('click', () => { sfx.back(); closePuzzle(); });
  /* Escape closes it too (the browser does that for a dialog);
     this makes sure we forget it was open. */
  ui.dialog.addEventListener('close', () => { current = null; clearTimeout(solvedTimer); });
}
