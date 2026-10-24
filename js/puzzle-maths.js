/* ===========================================================
   PUZZLE MATHS - making up tonight's answers

   Every night, before you set off, this file makes up a fresh
   answer for every lock in the house: a safe code with sums, a
   jumbled word, a tune, a fuse number, a keypad code with clues,
   a number pattern, a mirror question, a Morse word, a shelf of
   books and a map for the robot hoover.

   It reads data/puzzles.js to know how hard to make them, and
   puts the answers in state.puzzles. js/puzzles.js shows them.

   A trick used a lot in here: to make a sum whose answer is 7,
   pick the answer FIRST, then build the sum backwards. Pick
   7 x 8 = 56, and 56 take 7 is 49, so the sum is 7 x 8 - 49.
   =========================================================== */

import {
  SAFE, SHED, PIANO, FUSE, KEYPAD, TELLY, MIRROR, MORSE, BOOKS, HOOVER
} from '../data/puzzles.js';

/* --- LITTLE HELPERS ----------------------------------------- */

export const roll = (n) => Math.floor(Math.random() * n);
export const between = (lo, hi) => lo + roll(hi - lo + 1);
export const pick = (list) => list[roll(list.length)];
export function shuffle(list) {
  const deck = [...list];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = roll(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/* The times sign. Kids write x, so we do too. */
const X = '×';

/* --- SUMS ---------------------------------------------------- */

/* A sum that comes out to n. kind says what sort (see the safe in
   data/puzzles.js). Hands back the words, like '7 x 8 - 49'. */
export function sumFor(n, kind) {
  for (let tries = 0; tries < 200; tries += 1) {
    if (kind === 'plain') return String(n);
    if (kind === 'add') {
      const a = roll(n + 1);
      return `${a} + ${n - a}`;
    }
    if (kind === 'take') {
      const b = between(n < 10 ? 11 : 5, 45);
      return `${n + b} - ${b}`;
    }
    if (kind === 'times') {
      for (let a = 12; a >= 2; a -= 1) {
        if (n % a === 0 && n / a >= 2 && n / a <= 12 && Math.random() < 0.6) return `${a} ${X} ${n / a}`;
      }
      continue;
    }
    if (kind === 'times-take') {
      const a = between(3, 12);
      const b = between(3, 12);
      if (a * b > n) return `${a} ${X} ${b} - ${a * b - n}`;
      continue;
    }
    if (kind === 'square-take') {
      const a = between(4, 12);
      if (a * a > n) return `${a} ${X} ${a} - ${a * a - n}`;
      continue;
    }
    if (kind === 'two-times') {
      const a = between(5, 12);
      const b = between(5, 12);
      const rest = a * b - n;
      const pairs = [];
      for (let c = 2; c <= 12; c += 1) {
        if (rest % c === 0 && rest / c >= 2 && rest / c <= 12) pairs.push([c, rest / c]);
      }
      if (pairs.length) {
        const [c, d] = pick(pairs);
        return `${a} ${X} ${b} - ${c} ${X} ${d}`;
      }
      continue;
    }
  }
  const a = roll(n + 1);
  return `${a} + ${n - a}`;
}

/* Work out a sum written in words like '7 x 8 - 49'. Times first,
   then plus and take, left to right, the way you do it at school. */
export function workOut(words) {
  const parts = words.replace(/×/g, '*').split(/\s*([+-])\s*/);
  const times = (bit) => bit.split('*').reduce((acc, x) => acc * Number(x), 1);
  let total = times(parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    total = parts[i] === '+' ? total + times(parts[i + 1]) : total - times(parts[i + 1]);
  }
  return total;
}

/* --- THE SAFE ------------------------------------------------ */

function makeSafe(level) {
  const rules = SAFE.levels[level];
  const code = Array.from({ length: rules.digits }, () => roll(10));
  const sums = code.map((d) => sumFor(d, pick(rules.kinds)));
  return { code, sums };
}

/* --- THE SHED ------------------------------------------------ */

function makeShed(level) {
  const rules = SHED.levels[level];
  const fits = SHED.riddles.filter((r) => r.word.length >= rules.shortest && r.word.length <= rules.longest);
  const chosen = pick(fits.length ? fits : SHED.riddles);
  const spare = [];
  const abc = 'ABCDEFGHIJKLMNOPRSTUVWY';
  while (spare.length < rules.spare) {
    const letter = abc[roll(abc.length)];
    if (!chosen.word.includes(letter) && !spare.includes(letter)) spare.push(letter);
  }
  let letters = shuffle([...chosen.word.split(''), ...spare]);
  for (let i = 0; i < 10 && letters.join('').startsWith(chosen.word); i += 1) letters = shuffle(letters);
  return { riddle: chosen.riddle, word: chosen.word, letters, spare };
}

/* --- THE PIANO ----------------------------------------------- */

function makePiano(level) {
  const rules = PIANO.levels[level];
  const tune = [];
  while (tune.length < rules.notes) {
    const k = roll(PIANO.keys.length);
    if (k !== tune[tune.length - 1]) tune.push(k);
  }
  return { tune: tune.map((k) => PIANO.keys[k]), peek: rules.peek };
}

/* --- THE FUSE BOX -------------------------------------------- */

function makeFuse(level) {
  const rules = FUSE.levels[level];
  const chosen = shuffle(rules.fuses).slice(0, rules.pick);
  return { fuses: rules.fuses, target: chosen.reduce((a, b) => a + b, 0), answer: chosen.sort((a, b) => b - a) };
}

/* --- THE GARAGE KEYPAD ---------------------------------------
   Make a code, write every true clue we can about it, then hand
   out clues one at a time until only one code in the world fits
   all of them. That way the clues are always enough, and never
   more than you need.
   ------------------------------------------------------------ */

const PLACES = ['first', 'second', 'third', 'fourth'];

function allCodes(digits) {
  const out = [];
  const grow = (sofar) => {
    if (sofar.length === digits) { out.push(sofar); return; }
    for (let d = 0; d <= 9; d += 1) if (!sofar.includes(d)) grow([...sofar, d]);
  };
  grow([]);
  return out;
}

function cluesAbout(code, kinds) {
  const n = code.length;
  const clues = [];
  const say = (text, test) => clues.push({ text, test });
  const name = (i) => (i === n - 1 ? 'last' : PLACES[i]);
  for (let i = 0; i < n; i += 1) {
    const d = code[i];
    if (kinds.includes('is')) {
      const a = roll(d + 1);
      say(`The ${name(i)} number is ${a} + ${d - a}.`, (c) => c[i] === d);
    }
    if (kinds.includes('odd')) {
      say(`The ${name(i)} number is ${d % 2 ? 'odd' : 'even'}.`, (c) => c[i] % 2 === d % 2);
    }
    for (let j = 0; j < n; j += 1) {
      if (i === j) continue;
      const e = code[j];
      if (kinds.includes('plus') && d > e) {
        say(`The ${name(i)} number is the ${name(j)} number plus ${d - e}.`, (c) => c[i] === c[j] + (d - e));
      }
      if (kinds.includes('double') && d === e * 2 && e > 0) {
        say(`The ${name(i)} number is double the ${name(j)}.`, (c) => c[i] === c[j] * 2);
      }
      if (kinds.includes('double') && d === e * 3 && e > 0) {
        say(`The ${name(i)} number is three times the ${name(j)}.`, (c) => c[i] === c[j] * 3);
      }
      if (kinds.includes('bigger') && d > e && j > i) {
        say(`The ${name(i)} number is bigger than the ${name(j)}.`, (c) => c[i] > c[j]);
      }
      if (kinds.includes('times') && j > i && d * e > 0) {
        say(`The ${name(i)} and ${name(j)} numbers times together make ${d * e}.`, (c) => c[i] * c[j] === d * e);
      }
      if (kinds.includes('apart') && j > i && Math.abs(d - e) >= 2) {
        say(`The ${name(i)} and ${name(j)} numbers are ${Math.abs(d - e)} apart.`, (c) => Math.abs(c[i] - c[j]) === Math.abs(d - e));
      }
    }
  }
  if (kinds.includes('total')) {
    const sum = code.reduce((a, b) => a + b, 0);
    say(`All the numbers add up to ${sum}.`, (c) => c.reduce((a, b) => a + b, 0) === sum);
  }
  return shuffle(clues);
}

function makeKeypad(level) {
  const rules = KEYPAD.levels[level];
  const codes = allCodes(rules.digits);
  for (let tries = 0; tries < 60; tries += 1) {
    const code = pick(codes);
    let left = codes;
    const used = [];
    cluesAbout(code, rules.clues).forEach((clue) => {
      if (left.length === 1) return;
      const fewer = left.filter(clue.test);
      if (fewer.length < left.length) { used.push(clue.text); left = fewer; }
    });
    if (left.length === 1 && used.length <= rules.digits + 2) return { code, clues: used };
  }
  /* If we really cannot, give the plain answer as clues. */
  const code = pick(codes);
  return { code, clues: code.map((d, i) => `The ${PLACES[i]} number is ${d}.`) };
}

/* --- THE TV PATTERN ------------------------------------------ */

const PATTERNS = {
  up: () => { const s = between(2, 30); const k = between(2, 9); return (i) => s + k * i; },
  down: () => { const k = between(3, 9); const s = between(k * 6 + 5, 99); return (i) => s - k * i; },
  doubles: () => { const s = between(2, 7); return (i) => s * 2 ** i; },
  growing: () => { const s = between(1, 10); const k = between(1, 3); return (i) => s + k * i + (i * (i - 1)) / 2; },
  squares: () => { const s = between(1, 6); return (i) => (s + i) * (s + i); },
  times3: () => { const s = between(1, 3); return (i) => s * 3 ** i; },
  zigzag: () => {
    const s = between(10, 30); const up = between(4, 9); const down = between(1, up - 1);
    return (i) => s + Math.ceil(i / 2) * up - Math.floor(i / 2) * down;
  },
  twoback: () => {
    const a = between(1, 4); const b = between(a, 7); const list = [a, b];
    while (list.length < 8) list.push(list[list.length - 1] + list[list.length - 2]);
    return (i) => list[i];
  },
  'double-up': () => { const s = between(1, 4); return (i) => (s + 1) * 2 ** i - 1; }
};

function makeTelly(level) {
  const kind = pick(TELLY.levels[level].kinds);
  const term = PATTERNS[kind]();
  const shown = [0, 1, 2, 3, 4].map(term);
  return { kind, shown, answer: term(5) };
}

/* --- THE MIRROR ---------------------------------------------- */

function makeMirror(level) {
  const rules = MIRROR.levels[level];
  for (let tries = 0; tries < 50; tries += 1) {
    const q = pick(rules.questions);
    const n = {};
    ['a', 'b', 'c'].forEach((k) => { if (q[k]) n[k] = between(q[k][0], q[k][1]); });
    const fill = (words) => words.replace(/\b([abc])\b/g, (m, k) => String(n[k]));
    const sum = fill(q.answer);
    const answer = workOut(sum);
    if (answer >= 0) return { ask: `${fill(q.ask)}?`, answer, upsideDown: rules.upsideDown };
  }
  return { ask: 'WHAT IS 2 + 2?', answer: 4, upsideDown: false };
}

/* --- MORSE CODE ---------------------------------------------- */

export const MORSE_CODE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..',
  J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..'
};

function makeMorse(level) {
  const rules = MORSE.levels[level];
  const word = pick(rules.words);
  const need = [...new Set(word.split(''))];
  const others = shuffle(Object.keys(MORSE_CODE).filter((l) => !need.includes(l)));
  const chart = [...need, ...others].slice(0, Math.max(rules.chart, need.length)).sort();
  return { word, chart };
}

/* --- THE BOOKS ----------------------------------------------- */

function bookFor(kind) {
  if (kind === 'plain') { const v = between(3, 99); return { v, say: String(v) }; }
  if (kind === 'add') { const a = between(10, 60); const b = between(5, 39); return { v: a + b, say: `${a} + ${b}` }; }
  if (kind === 'take') { const a = between(40, 99); const b = between(5, 39); return { v: a - b, say: `${a} - ${b}` }; }
  if (kind === 'times') { const a = between(2, 12); const b = between(2, 12); return { v: a * b, say: `${a} ${X} ${b}` }; }
  if (kind === 'times-take') {
    const a = between(4, 12); const b = between(4, 12); const c = between(2, 19);
    return { v: a * b - c, say: `${a} ${X} ${b} - ${c}` };
  }
  const a = between(5, 12); const c = between(2, 20);
  return { v: a * a - c, say: `${a} ${X} ${a} - ${c}` };
}

function makeBooks(level) {
  const rules = BOOKS.levels[level];
  const books = [];
  while (books.length < rules.books) {
    const b = bookFor(pick(rules.kinds));
    if (b.v > 0 && !books.some((x) => x.v === b.v)) books.push(b);
  }
  return { books: shuffle(books) };
}

/* --- THE ROBOT HOOVER ---------------------------------------- */

function makeHoover(level) {
  const rules = HOOVER.levels[level];
  const chosen = pick(rules.maps);
  return { map: chosen.map, most: chosen.most, best: chosen.best, repeat: rules.repeat };
}

/* --- ALL OF THEM AT ONCE ------------------------------------- */

export function makeAll(level) {
  return {
    level,
    safe: makeSafe(level),
    shed: makeShed(level),
    piano: makePiano(level),
    fuse: makeFuse(level),
    keypad: makeKeypad(level),
    telly: makeTelly(level),
    mirror: makeMirror(level),
    morse: makeMorse(level),
    books: makeBooks(level),
    hoover: makeHoover(level)
  };
}
