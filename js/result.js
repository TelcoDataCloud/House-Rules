/* ===========================================================
   RESULT - how did the night go?

   js/night.js leaves a note in state.night when the last burglar
   is gone (or arrested). This file reads it and works out:

     - which ending you got
     - what they took, and what you saved
     - your grade, S, A, B or C

   THE GRADE
   Points, added up:
       every bit of loot still in the house   10
       every burglar arrested                 15
       every burglar who ran off               5
       every trap that went off                3
       every trap he really hated              2 more
   S is 85 or more, A is 65, B is 45, and anything less is a C.
   Change the numbers in POINTS and GRADES below if it feels too
   easy or too hard.
   =========================================================== */

import { state, setPhase, resetGame } from './state.js';
import { LOOT } from '../data/burglars.js';
import { drawBurglar } from './burglar-art.js';
import { addMess } from './fx.js';
import { listOf } from './night.js';
import { sfx } from './audio.js';

const POINTS = { loot: 10, arrest: 15, ran: 5, trap: 3, hated: 2 };
const GRADES = [['S', 85], ['A', 65], ['B', 45], ['C', 0]];

const NS = 'http://www.w3.org/2000/svg';
const ui = {};

function make(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (parent) parent.append(node);
  return node;
}

/* Work everything out from the note night.js left. */
export function score(night) {
  const taken = night.burglars.filter((b) => b.status === 'escaped').flatMap((b) => b.carrying);
  const saved = LOOT.length - taken.length;
  const arrests = night.burglars.filter((b) => b.status === 'arrested').length;
  const ran = night.burglars.filter((b) => b.status === 'fled').length;
  const fired = night.fired.length;
  const hated = night.fired.filter((f) => f.times === 2).length;
  const points = saved * POINTS.loot + arrests * POINTS.arrest + ran * POINTS.ran
    + fired * POINTS.trap + hated * POINTS.hated;
  const grade = GRADES.find(([, min]) => points >= min)[0];

  let title;
  let line;
  if (arrests && !taken.length) {
    title = 'BUSTED!';
    line = 'The police took them away. That is the best ending there is.';
  } else if (!taken.length) {
    title = 'YOU WIN!';
    line = 'They ran off into the night with nothing. They will not be back.';
  } else if (arrests || ran) {
    title = 'NEARLY!';
    line = `One of them is sorted, but ${listOf(taken)} went out of the door.`;
  } else {
    title = 'THEY GOT AWAY';
    line = `They took ${taken[0]}. Rebuild. Rig harder.`;
  }

  /* one tip, the most useful one */
  let tip = 'Different traps for different burglars. See if you can get an S.';
  const shrugged = night.fired.filter((f) => f.times < 1).length;
  const close = night.burglars.find((b) => b.status === 'escaped' && b.nerveLeft < b.nerve);
  if (!fired) tip = 'None of your traps went off. Watch where they walk, then put traps there.';
  else if (close) tip = `${close.name} was rattled but still got away. One more trap on his way would have done it.`;
  else if (night.unfired) tip = `${night.unfired === 1 ? 'One of your traps' : `${night.unfired} of your traps`} never went off. Watch where they walk.`;
  else if (shrugged) tip = 'Some of your traps hardly bothered them. Watch who yells loudest at what.';
  else if (!arrests && !night.police) tip = 'LOUD traps wake the neighbours. Enough noise and the police come.';

  return { taken, saved, arrests, ran, fired, hated, points, grade, title, line, tip };
}

function statusWords(b) {
  if (b.status === 'arrested') return 'Arrested';
  if (b.status === 'fled') return 'Ran off with nothing';
  if (b.carrying.length) return `Got away with ${listOf(b.carrying)}`;
  return 'Got away with nothing';
}

/* A picture of a burglar, still wearing whatever you threw at him. */
function portrait(b) {
  const fig = document.createElement('figure');
  fig.className = `result-burglar is-${b.status}`;
  const svg = make('svg', { viewBox: '-34 -100 68 104', 'aria-hidden': 'true' });
  const body = make('g', {}, svg);
  drawBurglar(body, b.look);
  b.mess.forEach((mess, i) => addMess(body, b.look, mess, i + 3));
  if (b.status === 'arrested') {
    make('rect', { x: -30, y: -96, width: 60, height: 96, class: 'result-bars-back' }, svg);
    [-20, -10, 0, 10, 20].forEach((x) => make('line', { x1: x, y1: -96, x2: x, y2: 0, class: 'result-bars' }, svg));
  }
  const cap = document.createElement('figcaption');
  const name = document.createElement('strong');
  name.textContent = b.name;
  cap.append(name, document.createTextNode(` ${statusWords(b)}`));
  fig.append(svg, cap);
  return fig;
}

export function setupResult(els) {
  Object.assign(ui, els);
  ui.again.addEventListener('click', () => {
    sfx.start();
    const level = state.difficulty;
    resetGame();
    state.difficulty = level;
    setPhase('scavenge');
  });
  ui.title.addEventListener('click', () => {
    sfx.back();
    resetGame();
  });
}

export function showResult() {
  const night = state.night;
  if (!night) return;
  const r = score(night);
  ui.panel.hidden = false;
  ui.panel.dataset.ending = r.taken.length ? 'lose' : 'win';
  ui.heading.textContent = r.title;
  ui.line.textContent = r.line;
  ui.grade.textContent = r.grade;
  ui.grade.setAttribute('aria-label', `Your grade: ${r.grade}`);
  ui.grade.dataset.grade = r.grade;
  ui.tip.textContent = r.tip;

  ui.stats.innerHTML = '';
  [
    ['Loot saved', `${r.saved} of ${LOOT.length}`],
    ['Traps that went off', String(r.fired)],
    ['Traps they hated', String(r.hated)],
    ['Arrests', String(r.arrests)],
    ['Points', String(r.points)]
  ].forEach(([k, v]) => {
    const pair = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    pair.append(dt, dd);
    ui.stats.append(pair);
  });

  ui.burglars.innerHTML = '';
  night.burglars.forEach((b) => ui.burglars.append(portrait(b)));

  if (r.taken.length) sfx.lose(); else sfx.win();
}

export function hideResult() {
  if (ui.panel) ui.panel.hidden = true;
}
