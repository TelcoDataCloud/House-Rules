/* ===========================================================
   MORE PUZZLES - the keypad, the telly, the mirror, the key safe
   and the bookshelf

   Same idea as the four in js/puzzles.js. Each one is a function
   that gets k (the kit: buttons, a number pad, say, shake,
   solved) and p (tonight's answer for that lock), draws the
   puzzle, and hands back a hint(n) for the Hint button.
   =========================================================== */

import { sfx } from './audio.js';
import { MORSE_CODE } from './puzzle-maths.js';

/* --- THE GARAGE KEYPAD: clues on a sticky note -------------- */

function buildKeypad(k, p) {
  k.clue(`Dad's sticky note on the garage door. No number is used twice. Every clue is true:`, true);
  const note = k.el('ol', 'pz-clues');
  p.clues.forEach((c) => note.append(k.el('li', '', c)));
  const pad = k.numberPad(p.code.length, (typed) => {
    if (typed === p.code.join('')) { k.solved(); return true; }
    sfx.nope();
    k.shake();
    k.say(typed.length < p.code.length
      ? `The code has ${p.code.length} numbers.`
      : `${typed}? BZZT. Check every clue.`, 'is-bad');
    return false;
  });
  k.body.append(note, pad.node);
  return {
    hint(n) { return `The ${['first', 'second', 'third', 'fourth'][n - 1]} number is ${p.code[n - 1]}.`; }
  };
}

/* --- THE TV CABINET: what comes next? ----------------------- */

function buildTelly(k, p) {
  k.clue('The TV cabinet has a parental lock. The telly shows a pattern. Type the number that comes next.');
  const screen = k.el('div', 'pz-screen');
  screen.setAttribute('aria-label', `The pattern: ${p.shown.join(', ')}, then what?`);
  p.shown.forEach((n) => screen.append(k.el('span', 'pz-screen-num', String(n))));
  screen.append(k.el('span', 'pz-screen-num is-what', '?'));
  const pad = k.numberPad(4, (typed) => {
    if (Number(typed) === p.answer) { k.solved(); return true; }
    sfx.nope();
    k.shake();
    k.say(`${typed}? The telly says NO.`, 'is-bad');
    return false;
  });
  k.body.append(screen, pad.node);
  const gaps = p.shown.slice(1).map((n, i) => n - p.shown[i]);
  return {
    hint(n) {
      if (n === 1) {
        const ratio = p.shown.slice(1).every((x, i) => x === p.shown[i] * 2) ? ' Look: each one is double the one before.' : '';
        return `Look at the gaps: ${gaps.map((g) => (g >= 0 ? `+${g}` : `${g}`)).join(', ')}.${ratio}`;
      }
      const lo = Math.floor(p.answer / 10) * 10;
      return `The answer is between ${lo} and ${lo + 10}.`;
    }
  };
}

/* --- THE BATHROOM MIRROR: read it back to front -------------- */

function buildMirror(k, p) {
  k.clue(p.upsideDown
    ? 'Somebody wrote a question in the steam on the mirror. Back to front AND upside down. Read it, work it out, type the answer.'
    : 'Somebody wrote a question in the steam on the mirror, back to front. Read it, work it out, type the answer.');
  const glass = k.el('div', 'pz-mirror');
  const words = k.el('p', `pz-mirror-words${p.upsideDown ? ' is-upside-down' : ''}`, p.ask);
  glass.setAttribute('role', 'img');
  glass.setAttribute('aria-label', `Steamy writing on the mirror. It says: ${p.ask}`);
  words.setAttribute('aria-hidden', 'true');
  glass.append(words);
  const pad = k.numberPad(4, (typed) => {
    if (Number(typed) === p.answer) { k.solved(); return true; }
    sfx.nope();
    k.shake();
    k.say(`${typed}? The cabinet stays shut.`, 'is-bad');
    return false;
  });
  k.body.append(glass, pad.node);
  return {
    hint(n) {
      if (n === 1) return `The right way round it says: ${p.ask}`;
      const lo = Math.floor(p.answer / 10) * 10;
      return `The answer is between ${lo} and ${lo + 10}.`;
    }
  };
}

/* --- THE KEY SAFE: Morse code ------------------------------- */

/* Play some Morse out loud. A dot is short, a dash is long. */
function beep(word, k) {
  let at = 0;
  word.split('').forEach((letter) => {
    MORSE_CODE[letter].split('').forEach((mark) => {
      const long = mark === '-';
      k.later(() => sfx.beep(long ? 330 : 110), at);
      at += (long ? 330 : 110) + 110;
    });
    at += 330;
  });
}

function buildMorse(k, p) {
  k.clue('The key safe by the door beeps a word in Morse code. A dot is a short beep, a dash is a long one. Find each group in the chart and tap that letter.');
  const tape = k.el('div', 'pz-morse');
  tape.setAttribute('aria-label', `The beeps: ${p.word.split('').map((l) => MORSE_CODE[l].replace(/\./g, 'dot ').replace(/-/g, 'dash ').trim()).join(', then ')}`);
  p.word.split('').forEach((letter) => {
    const group = k.el('span', 'pz-morse-group');
    group.setAttribute('aria-hidden', 'true');
    MORSE_CODE[letter].split('').forEach((mark) => group.append(k.el('span', mark === '-' ? 'pz-dash' : 'pz-dot')));
    tape.append(group);
  });
  const play = k.button('btn-quiet pz-play', 'Play the beeps', null, () => beep(p.word, k));

  const typed = [];
  const slots = k.el('div', 'pz-slots');
  const drawSlots = () => {
    slots.innerHTML = '';
    p.word.split('').forEach((_, i) => {
      const s = k.el('span', 'pz-slot pz-slot-show', typed[i] || '');
      slots.append(s);
    });
    slots.setAttribute('aria-label', `So far: ${typed.join(' ') || 'nothing'}`);
  };
  const chart = k.el('div', 'pz-chart');
  p.chart.forEach((letter) => {
    const b = k.button('pz-chart-key', '', `Letter ${letter}, ${MORSE_CODE[letter].replace(/\./g, 'dot ').replace(/-/g, 'dash ').trim()}`, () => {
      if (typed.length >= p.word.length) return;
      typed.push(letter);
      sfx.tick();
      drawSlots();
      if (typed.length === p.word.length) {
        if (typed.join('') === p.word) { k.solved(); return; }
        sfx.nope();
        k.shake();
        k.say(`${typed.join('')}? The key safe beeps crossly.`, 'is-bad');
        k.later(() => { typed.length = 0; drawSlots(); }, 800);
      }
    });
    b.append(k.el('span', 'pz-chart-letter', letter));
    const code = k.el('span', 'pz-chart-code');
    MORSE_CODE[letter].split('').forEach((mark) => code.append(k.el('span', mark === '-' ? 'pz-dash' : 'pz-dot')));
    b.append(code);
    chart.append(b);
  });
  const undo = k.button('btn-quiet', 'Take back a letter', null, () => { typed.pop(); drawSlots(); });
  drawSlots();
  const row = k.el('div', 'pz-row');
  row.append(play, undo);
  k.body.append(tape, slots, chart, row);
  return {
    hint(n) { return `Letter ${n} is ${p.word[n - 1]}.`; }
  };
}

/* --- THE BOOKSHELF: smallest to biggest --------------------- */

function buildBooks(k, p) {
  k.clue('The bookshelf has a secret drawer. Pull the books out from the SMALLEST number to the BIGGEST. Work out the sums first.');
  const sorted = [...p.books].sort((a, b) => a.v - b.v);
  let next = 0;
  const shelf = k.el('div', 'pz-shelf');
  const colours = ['fabric-a', 'fabric-b', 'fabric-c', 'paint-yellow', 'key-green', 'key-pink', 'key-blue'];
  p.books.forEach((book, i) => {
    const b = k.button(`pz-book book-${colours[i % colours.length]}`, book.say, `Book: ${book.say}`, () => {
      if (b.classList.contains('is-out')) return;
      if (book.v === sorted[next].v) {
        next += 1;
        b.classList.add('is-out');
        b.disabled = true;
        sfx.tick();
        k.say(`${book.say} is ${book.v}. Good.`);
        if (next === sorted.length) k.later(k.solved, 300);
        return;
      }
      sfx.nope();
      k.shake();
      k.say(`${book.say} is ${book.v}. That is not the smallest one left. All the books slide back in!`, 'is-bad');
      next = 0;
      shelf.querySelectorAll('.pz-book').forEach((x) => { x.classList.remove('is-out'); x.disabled = false; });
    });
    shelf.append(b);
  });
  k.body.append(shelf);
  return {
    hint(n) {
      const from = next < sorted.length ? next : 0;
      const bit = sorted.slice(from, from + n);
      return `Pull out next: ${bit.map((b) => `${b.say} (that is ${b.v})`).join(', then ')}.`;
    }
  };
}

export const MORE = {
  keypad: buildKeypad,
  telly: buildTelly,
  mirror: buildMirror,
  morse: buildMorse,
  books: buildBooks
};
