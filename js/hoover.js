/* ===========================================================
   THE ROBOT HOOVER - a puzzle where you write a real program

   The hoover has jammed the cupboard under the stairs. You write
   it a list of instructions, press Run, and it does EXACTLY what
   you said. Not what you meant. What you said. That is what
   every computer in the world is like.

   The instructions:
       forward 3    drive 3 squares the way it is facing
       left         turn left (it does not move)
       right        turn right
       repeat 3     do everything up to 'end' 3 times
       end          the end of the bit to repeat

   This file has three parts:
     1. READING a program, like 'forward 3, right, forward 2'
     2. RUNNING it on a map, square by square, to see where the
        hoover ends up (and what it bumps into)
     3. THE BOX you build the program in

   The maps live in data/puzzles.js. Draw your own.
   =========================================================== */

import { HOOVER } from '../data/puzzles.js';
import { sfx } from './audio.js';

/* --- 1. READING A PROGRAM ----------------------------------- */

/* 'forward 3, right' becomes [{ op: 'forward', n: 3 }, { op: 'right' }] */
export function readProgram(text) {
  return text.split(',').map((bit) => bit.trim()).filter(Boolean).map((bit) => {
    const [op, n] = bit.split(/\s+/);
    return n ? { op, n: Number(n) } : { op };
  });
}

/* And back the other way, for showing on screen. */
export function lineWords(line) {
  if (line.op === 'repeat') return `repeat ${line.n}`;
  return line.n ? `${line.op} ${line.n}` : line.op;
}

/* --- 2. RUNNING IT ------------------------------------------ */

const BLOCKERS = { '#': 'the wall', b: 'the cat bowl', s: 'some shoes', l: 'a bit of Lego' };
/* Which way is which. Facing right is 0. Turning right adds one. */
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function find(map, letter) {
  for (let y = 0; y < map.length; y += 1) {
    const x = map[y].indexOf(letter);
    if (x >= 0) return { x, y };
  }
  return null;
}

/* Run a program on a map. Hands back every step the hoover took,
   and how it ended:
       home    it reached the charger
       bonk    it bumped into something (bumped says what)
       short   the program finished and it was not home yet */
export function runProgram(map, lines) {
  const start = find(map, 'H');
  const goal = find(map, 'C');
  const bot = { x: start.x, y: start.y, dir: 0 };
  const steps = [];
  let ending = null;
  let bumped = null;
  let count = 0;

  const go = (from, to) => {
    for (let i = from; i < to && !ending; i += 1) {
      const line = lines[i];
      if (line.op === 'repeat') {
        /* find the matching end */
        let depth = 0;
        let close = to;
        for (let j = i + 1; j < to; j += 1) {
          if (lines[j].op === 'repeat') depth += 1;
          if (lines[j].op === 'end') {
            if (depth === 0) { close = j; break; }
            depth -= 1;
          }
        }
        for (let r = 0; r < line.n && !ending; r += 1) go(i + 1, close);
        i = close;
      } else if (line.op === 'left' || line.op === 'right') {
        bot.dir = (bot.dir + (line.op === 'right' ? 1 : 3)) % 4;
        steps.push({ ...bot, line: i });
      } else if (line.op === 'forward') {
        for (let k = 0; k < line.n && !ending; k += 1) {
          const [dx, dy] = DIRS[bot.dir];
          const row = map[bot.y + dy] || '';
          const cell = row[bot.x + dx];
          if (cell === undefined || BLOCKERS[cell]) {
            ending = 'bonk';
            bumped = BLOCKERS[cell] || 'the wall';
            steps.push({ ...bot, bump: true, line: i });
            return;
          }
          bot.x += dx;
          bot.y += dy;
          steps.push({ ...bot, line: i });
          if (bot.x === goal.x && bot.y === goal.y) { ending = 'home'; return; }
          count += 1;
          if (count > 400) { ending = 'short'; return; }
        }
      }
    }
  };
  go(0, lines.length);
  return { steps, ending: ending || 'short', bumped, start };
}

/* How many lines a program has (every line counts, end too). */
export const lineCount = (lines) => lines.length;

/* Check every map in data/puzzles.js really can be done with its
   best program. If one cannot, say so in the console, so whoever
   drew it knows. */
export function checkMaps() {
  const problems = [];
  Object.entries(HOOVER.levels).forEach(([level, rules]) => {
    rules.maps.forEach((m, i) => {
      const lines = readProgram(m.best);
      const run = runProgram(m.map, lines);
      if (run.ending !== 'home') problems.push(`${level} map ${i + 1}: best does not get home (${run.ending}${run.bumped ? `, hit ${run.bumped}` : ''})`);
      if (m.most && lines.length > m.most) problems.push(`${level} map ${i + 1}: best has ${lines.length} lines but most is ${m.most}`);
    });
  });
  problems.forEach((p) => console.warn(`Robot hoover map problem: ${p}`));
  return problems;
}

/* --- 3. THE BOX ---------------------------------------------- */

const OBSTACLE_ART = {
  b: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 24 Q20 40 34 24 Z" fill="var(--key-red)" stroke="var(--ink)" stroke-width="3"/><rect x="5" y="21" width="30" height="4" rx="2" fill="var(--porcelain)" stroke="var(--ink)" stroke-width="2"/></svg>',
  s: '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 30 L6 18 Q6 14 11 14 L15 14 L15 22 L24 25 L24 30 Z" fill="var(--fabric-a)" stroke="var(--ink)" stroke-width="2.5"/><path d="M18 34 L18 24 Q18 20 23 20 L27 20 L27 27 L35 29 L35 34 Z" fill="var(--hedge)" stroke="var(--ink)" stroke-width="2.5"/></svg>',
  l: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="8" y="18" width="24" height="14" rx="2" fill="var(--key-yellow)" stroke="var(--ink)" stroke-width="2.5"/><rect x="11" y="13" width="7" height="6" rx="1" fill="var(--key-yellow)" stroke="var(--ink)" stroke-width="2"/><rect x="22" y="13" width="7" height="6" rx="1" fill="var(--key-yellow)" stroke="var(--ink)" stroke-width="2"/></svg>',
  C: '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="12" y="6" width="16" height="28" rx="3" fill="var(--metal)" stroke="var(--ink)" stroke-width="2.5"/><path d="M21 11 L16 21 L21 21 L18 29 L25 18 L20 18 L23 11 Z" fill="var(--key-yellow)" stroke="var(--ink)" stroke-width="1.5"/></svg>'
};
const BOT_ART = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="var(--units)" stroke="var(--ink)" stroke-width="3"/><circle cx="20" cy="20" r="6" fill="var(--screen)" stroke="var(--ink)" stroke-width="2"/><path d="M29 20 L37 20 M33 16 L37 20 L33 24" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* The floor, as a grid of squares, with the hoover on it. The bug
   hunt on Dad's computer uses this too. */
export function drawFloor(el, map) {
  const floor = el('div', 'hv-floor');
  floor.style.setProperty('--cols', map[0].length);
  floor.style.setProperty('--rows', map.length);
  floor.setAttribute('role', 'img');
  floor.setAttribute('aria-label', `The floor, ${map[0].length} squares across and ${map.length} down. ${map.map((row) => row.replace(/#/g, 'wall ').replace(/\./g, 'floor ').replace(/H/g, 'hoover ').replace(/C/g, 'charger ').replace(/b/g, 'bowl ').replace(/s/g, 'shoes ').replace(/l/g, 'lego ')).join('. ')}`);
  map.forEach((row) => row.split('').forEach((cell) => {
    const sq = el('div', `hv-cell${cell === '#' ? ' is-wall' : ''}`);
    if (OBSTACLE_ART[cell]) sq.innerHTML = OBSTACLE_ART[cell];
    floor.append(sq);
  }));
  const bot = el('div', 'hv-bot');
  bot.innerHTML = BOT_ART;
  floor.append(bot);
  const start = find(map, 'H');
  const place = (x, y, dir, bump = false) => {
    bot.style.setProperty('--x', x);
    bot.style.setProperty('--y', y);
    bot.style.setProperty('--turn', `${dir * 90}deg`);
    bot.classList.toggle('is-bump', bump);
  };
  place(start.x, start.y, 0);
  return { floor, place, start };
}

/* Play a run on the floor, one step at a time, then call done. */
export function playRun(kit, drawn, result, onLine, done) {
  let i = 0;
  const next = () => {
    const step = result.steps[i];
    if (onLine) onLine(step ? step.line : -1);
    if (!step) { done(); return; }
    drawn.place(step.x, step.y, step.dir, step.bump);
    if (!step.bump) sfx.tick();
    i += 1;
    kit.later(next, kit.calm ? 60 : 260);
  };
  next();
}

export function buildHoover(kit, p) {
  const { el, button, say, shake, solved } = kit;
  const map = p.map;
  const lines = [];
  let running = false;

  kit.clue(`The robot hoover has jammed the cupboard door. Write it a program to drive home to its charger. It starts facing right.${p.most ? ` Your program can be ${p.most} lines long at most.` : ''}`);

  const { floor, place, start } = drawFloor(el, map);

  /* the program you are writing */
  const code = el('ol', 'hv-code');
  code.setAttribute('aria-label', 'Your program');
  const count = el('p', 'hv-count');

  const draw = () => {
    code.innerHTML = '';
    let depth = 0;
    lines.forEach((line, i) => {
      if (line.op === 'end') depth = Math.max(0, depth - 1);
      const li = el('li', 'hv-line');
      li.style.setProperty('--indent', depth);
      const words = el('span', 'hv-words', line.op);
      li.append(words);
      if (line.n !== undefined) {
        li.append(button('hv-num', String(line.n), `${line.op} ${line.n}. Tap to change the number.`, () => {
          if (running) return;
          line.n = line.n >= (line.op === 'repeat' ? 9 : 6) ? 1 : line.n + 1;
          sfx.tick();
          draw();
          const again = code.children[i] && code.children[i].querySelector('.hv-num');
          if (again) again.focus();
        }));
      }
      li.append(button('hv-del', '×', `Remove line ${i + 1}, ${lineWords(line)}`, () => {
        if (running) return;
        lines.splice(i, 1);
        sfx.back();
        draw();
      }));
      if (line.op === 'repeat') depth += 1;
      code.append(li);
    });
    if (!lines.length) code.append(el('li', 'hv-empty', 'Empty. Tap the buttons below to add lines.'));
    count.textContent = p.most ? `${lines.length} of ${p.most} lines` : `${lines.length} lines`;
    count.classList.toggle('is-over', Boolean(p.most) && lines.length > p.most);
  };

  const add = (line) => {
    if (running) return;
    lines.push(line);
    sfx.tick();
    say('');
    draw();
  };

  const palette = el('div', 'hv-palette');
  palette.append(
    button('hv-add', 'forward', 'Add a line: forward', () => add({ op: 'forward', n: 1 })),
    button('hv-add', 'left', 'Add a line: turn left', () => add({ op: 'left' })),
    button('hv-add', 'right', 'Add a line: turn right', () => add({ op: 'right' }))
  );
  if (p.repeat) {
    palette.append(
      button('hv-add hv-add-loop', 'repeat', 'Add a line: repeat', () => add({ op: 'repeat', n: 2 })),
      button('hv-add hv-add-loop', 'end', 'Add a line: end of the repeat', () => add({ op: 'end' }))
    );
  }

  const run = button('btn-big pz-go', 'Run', null, () => {
    if (running) return;
    if (!lines.length) { say('Your program is empty. Add some lines.', 'is-bad'); return; }
    if (p.most && lines.length > p.most) {
      sfx.nope();
      shake();
      say(`Too long! ${lines.length} lines. You can have ${p.most}. Try repeat.`, 'is-bad');
      return;
    }
    const result = runProgram(map, lines);
    running = true;
    floor.classList.add('is-running');
    say('Beep boop...');
    let i = 0;
    const next = () => {
      const step = result.steps[i];
      code.querySelectorAll('.hv-line').forEach((li, n) => li.classList.toggle('is-now', step && n === step.line));
      if (!step) { finish(); return; }
      place(step.x, step.y, step.dir, step.bump);
      if (!step.bump) sfx.tick();
      i += 1;
      kit.later(next, kit.calm ? 60 : 260);
    };
    const finish = () => {
      running = false;
      floor.classList.remove('is-running');
      if (result.ending === 'home') {
        say('Docked! The cupboard door pops open.', 'is-good');
        solved();
        return;
      }
      sfx.nope();
      shake();
      say(result.ending === 'bonk'
        ? `BONK! It drove into ${result.bumped}. Fix your program.`
        : 'It stopped, but it is not home yet. Add more lines.', 'is-bad');
      kit.later(() => place(start.x, start.y, 0), 1100);
    };
    next();
  });
  const clear = button('btn-quiet hv-clear', 'Clear', 'Clear the whole program', () => {
    if (running) return;
    lines.length = 0;
    place(start.x, start.y, 0);
    say('');
    draw();
  });
  const go = el('div', 'hv-go');
  go.append(clear, run);

  const left = el('div', 'hv-left');
  left.append(floor);
  const right = el('div', 'hv-right');
  right.append(code, count, palette, go);
  const both = el('div', 'hv-both');
  both.append(left, right);
  kit.body.append(both);
  draw();

  /* Hints show the start of a program that works. */
  const best = readProgram(p.best);
  return {
    hint(n) {
      const part = best.slice(0, n === 1 ? 2 : Math.ceil(best.length / 2) + 1).map(lineWords);
      return `A program that works starts: ${part.join(', ')} ...`;
    }
  };
}
