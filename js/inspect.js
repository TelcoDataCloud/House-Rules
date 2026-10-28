/* ===========================================================
   INSPECT - tap anything and see the code behind it

   Press the magnifying glass in the top right. Now tap anything
   in the game: a sofa, a burglar, a trap spot, a bit of junk in
   your bag, a lock. Instead of doing its normal job, it tells you
   WHICH FILE makes it and WHICH LINE, shows you the line, and
   gives you one thing to try changing.

   How it finds the line: it downloads the data file (the same
   file the game is running) and looks for the thing's id in it,
   the way you would with Ctrl+F. So if you change a file, the
   line numbers change too, and this still finds them.

   Press the magnifying glass again to go back to playing.
   =========================================================== */

import { state } from './state.js';
import { sfx } from './audio.js';

const ui = {};
const files = {};         // each file's text, once we have downloaded it
let on = false;

async function text(path) {
  if (!files[path]) {
    const res = await fetch(path, { cache: 'no-store' });
    files[path] = res.ok ? await res.text() : '';
  }
  return files[path];
}

/* Find the first line with every one of these bits of text in it,
   starting at line `from`. Hands back the line number (from 1). */
function findLine(lines, bits, from = 0) {
  for (let i = from; i < lines.length; i += 1) {
    if (bits.every((b) => lines[i].includes(b))) return i + 1;
  }
  return 0;
}

const LOCKS = {
  safe: 'SAFE', shed: 'SHED', piano: 'PIANO', fuse: 'FUSE', keypad: 'KEYPAD', telly: 'TELLY',
  mirror: 'MIRROR', morse: 'MORSE', books: 'BOOKS', hoover: 'HOOVER', bugs: 'BUGS'
};

/* What did you tap? Hands back { what, file, find, after, tip }.
   find is the text to look for; after (if there is one) is a line
   to find first, so a sofa is found inside the right room. */
function whatIs(target) {
  const el = (sel) => target.closest(sel);
  let n;
  if ((n = el('[data-burglar]'))) {
    return { what: `A burglar: ${n.dataset.burglar}`, file: 'data/burglars.js', find: [`id: '${n.dataset.burglar}'`],
      tip: 'Change name, speed or nerve a few lines below. Or add your own line to mutters.' };
  }
  if ((n = el('.hero'))) {
    return { what: 'You!', file: 'data/hero.js', find: ['walkSpeed'], tip: 'Change walkSpeed. Bigger is faster.' };
  }
  if ((n = el('.anchor[data-anchor]'))) {
    return { what: 'A trap spot', file: 'data/rooms.js', find: [`id: '${n.dataset.anchor}'`],
      tip: 'Change x and y to move this spot. mount says what kind of trap fits.' };
  }
  if ((n = el('.loose-item[data-item]')) || (n = el('[data-item]'))) {
    return { what: 'A bit of junk', file: 'data/items.js', find: [`id: '${n.dataset.item}'`],
      tip: 'Change its name, or the riddle you say about it at the workbench.' };
  }
  if ((n = el('.prop[data-prop]'))) {
    const room = el('.room');
    return { what: `Furniture: ${n.dataset.prop}`, file: 'data/rooms.js',
      after: room ? [`id: '${room.dataset.room}'`] : null, find: [`kind: '${n.dataset.prop}'`],
      also: { file: 'js/props.js', find: [`  ${n.dataset.prop}(g`] },
      tip: 'Change x to slide it along the room. The drawing itself is in js/props.js.' };
  }
  if ((n = el('[data-spot]'))) {
    const room = el('.room') || n;
    return { what: 'A hiding place', file: 'data/rooms.js', after: [`id: '${room.dataset.room}'`], find: ['search:'],
      tip: 'search is what you say when you look. holds says what can hide in it.' };
  }
  if ((n = el('.ws-card[data-id], .rig-card[data-id]'))) {
    const trap = n.classList.contains('rig-card') || n.dataset.kind === 'trap';
    return trap
      ? { what: 'A trap', file: 'data/recipes.js', find: [`id: '${n.dataset.id}'`], tip: 'Change nerve to make it scarier, or word for what pops up.' }
      : { what: 'A bit of junk', file: 'data/items.js', find: [`id: '${n.dataset.id}'`], tip: 'Change its name, or its riddle.' };
  }
  if ((n = el('.night-gadget[data-gadget]'))) {
    return { what: 'A gadget', file: 'data/gadgets.js', find: [`id: '${n.dataset.gadget}'`], tip: 'Change nerve or word. Or copy it and make a new gadget.' };
  }
  if ((n = el('#puzzle'))) {
    const lock = n.dataset.lock;
    return { what: 'A lock', file: 'data/puzzles.js', find: [`export const ${LOCKS[lock] || 'SAFE'}`],
      tip: 'This is how the puzzle is set up. Try changing one number, then try the lock again.' };
  }
  if ((n = el('#difficulty .diff-btn'))) {
    return { what: 'A difficulty', file: 'data/difficulty.js', find: [`id: '${n.dataset.id}'`], tip: 'Change seconds. That is how long you get.' };
  }
  if ((n = el('#puzzle-level .diff-btn'))) {
    return { what: 'A puzzle level', file: 'data/puzzles.js', find: [`id: '${n.dataset.id}'`], tip: 'Every lock has its own easy, tricky and brainbuster further down.' };
  }
  if ((n = el('#play-mode .diff-btn'))) {
    return { what: 'A week of nights', file: 'data/nights.js', find: ["name: 'Monday'"], tip: 'Change how many burglars come each night.' };
  }
  if ((n = el('.milestone'))) {
    return { what: 'The progress strip', file: 'data/milestones.js', find: ['export const MILESTONES'], tip: 'Every step it took to build this game.' };
  }
  if ((n = el('.room[data-room]'))) {
    return { what: `A room: ${n.dataset.room}`, file: 'data/rooms.js', find: [`id: '${n.dataset.room}'`],
      tip: 'x, y, w and h are where it is and how big. Change w to make it wider.' };
  }
  return null;
}

async function show(found) {
  const lines = (await text(found.file)).split('\n');
  const from = found.after ? findLine(lines, found.after) : 0;
  const at = findLine(lines, found.find, from) || from;
  ui.what.textContent = found.what;
  ui.where.textContent = at ? `${found.file}, line ${at}` : found.file;
  ui.code.textContent = at
    ? lines.slice(Math.max(0, at - 1), at + 2).map((l, i) => `${String(at + i).padStart(4)}  ${l}`).join('\n')
    : '(could not find it)';
  ui.tip.textContent = found.tip;
  ui.also.textContent = '';
  if (found.also) {
    const more = (await text(found.also.file)).split('\n');
    const line = findLine(more, found.also.find);
    if (line) ui.also.textContent = `The drawing: ${found.also.file}, line ${line}.`;
  }
  ui.card.hidden = false;
}

function onClick(event) {
  if (!on) return;
  if (event.target.closest('#inspect-card, #inspect-toggle')) return;
  const found = whatIs(event.target);
  event.preventDefault();
  event.stopPropagation();
  if (!found) {
    ui.what.textContent = 'Nothing here';
    ui.where.textContent = '';
    ui.code.textContent = '';
    ui.tip.textContent = 'Try tapping furniture, a burglar, a trap spot, a lock or a bit of junk.';
    ui.also.textContent = '';
    ui.card.hidden = false;
    return;
  }
  sfx.tick();
  show(found);
}

function setOn(value) {
  on = value;
  document.body.classList.toggle('is-inspecting', on);
  ui.toggle.setAttribute('aria-pressed', String(on));
  ui.banner.hidden = !on;
  if (!on) ui.card.hidden = true;
  sfx.toggle();
}

export function setupInspect(els) {
  Object.assign(ui, els);
  ui.toggle.addEventListener('click', () => setOn(!on));
  ui.close.addEventListener('click', () => { ui.card.hidden = true; });
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', (event) => {
    if (on && event.key === 'Escape') setOn(false);
  });
}

/* For the console: HOUSE.inspect(true) */
export function inspecting(value) {
  if (typeof value === 'boolean') setOn(value);
  return on && state;
}
