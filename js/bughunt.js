/* ===========================================================
   BUG HUNT - Dad's old computer, in the attic

   The computer will not start because there is a BUG: one line of
   code is wrong. Find it and fix it.

     1. Read the code. Tap the line you think is wrong.
     2. Three ways to fix it pop up. Pick the right one.
     3. If it was a hoover program, watch it run to prove it.

   This is called debugging, and it is most of what programmers
   do all day. The bugs come from js/puzzle-maths.js (makeBugs),
   and the data bugs are written in data/puzzles.js (BUGS), so you
   can add your own.
   =========================================================== */

import { sfx } from './audio.js';
import { readProgram, runProgram, drawFloor, playRun } from './hoover.js';

export function buildBugs(k, p) {
  k.clue(p.kind === 'program'
    ? "Dad's old computer runs the robot hoover. This program SHOULD drive it home, but it crashes. One line is wrong. Tap it."
    : "Dad's old computer will not start. One line of this code has a bug. Tap the line that is wrong.");

  let drawn = null;
  if (p.kind === 'program') {
    drawn = drawFloor(k.el, p.map);
    k.body.append(drawn.floor);
  }

  const code = k.el('ol', 'bug-code');
  code.setAttribute('aria-label', 'The code');
  const fixes = k.el('div', 'bug-fixes');
  fixes.hidden = true;
  let done = false;

  const lines = [...p.lines];
  const draw = () => {
    code.innerHTML = '';
    lines.forEach((words, i) => {
      const li = k.el('li', 'bug-line');
      const b = k.button('bug-pick', words, `Line ${i + 1}: ${words}`, () => pickLine(i));
      li.append(b);
      code.append(li);
    });
  };

  const pickLine = (i) => {
    if (done) return;
    if (i !== p.bug) {
      sfx.nope();
      k.shake();
      k.say(`Line ${i + 1} is fine. Look again.`, 'is-bad');
      return;
    }
    sfx.select();
    code.querySelectorAll('.bug-line').forEach((li, n) => li.classList.toggle('is-picked', n === i));
    k.say(`Yes! Line ${i + 1} has the bug. Now pick the fix.`, 'is-good');
    fixes.innerHTML = '';
    p.fixes.forEach((fix) => fixes.append(k.button('bug-fix', fix, `Fix: ${fix}`, () => tryFix(fix))));
    fixes.hidden = false;
    const first = fixes.querySelector('button');
    if (first) first.focus();
  };

  const tryFix = (fix) => {
    if (done) return;
    if (fix !== p.right) {
      sfx.nope();
      k.shake();
      k.say(p.kind === 'program' ? 'Still crashes. Try another fix.' : 'Still broken. Try another fix.', 'is-bad');
      return;
    }
    done = true;
    lines[p.bug] = fix;
    draw();
    code.querySelectorAll('.bug-line')[p.bug].classList.add('is-fixed');
    fixes.hidden = true;
    if (p.kind === 'program') {
      k.say('Fixed. Running it...');
      const result = runProgram(p.map, readProgram(lines.join(', ')));
      playRun(k, drawn, result, (n) => code.querySelectorAll('.bug-line').forEach((li, j) => li.classList.toggle('is-now', j === n)), () => {
        k.say(`${p.why} It works!`, 'is-good');
        k.solved();
      });
    } else {
      k.say(`Fixed! ${p.why}`, 'is-good');
      k.later(k.solved, 600);
    }
  };

  draw();
  k.body.append(code, fixes);
  return {
    hint(n) {
      if (n === 1) return `The bug is on line ${p.bug + 1}.`;
      return `It should say: ${p.right}`;
    }
  };
}
