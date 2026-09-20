/* ===========================================================
   WORKSHOP - phase 2: bolt two things together

   Your bag from the scavenge is laid out on the bench. Put two
   things in the two slots (tap them, or drag them) and the game
   looks them up in data/recipes.js.

     Found it  -> you built a trap. Both things are used up, the
                  trap goes on your shelf, and the notebook
                  remembers it.
     Not found -> a puff of smoke, a comment from you, and both
                  things go back in the bag. Nothing is lost.

   A trap on your shelf can go back on the bench with one more
   thing. If that makes an upgrade, the old trap is used up.

   This file never says "Flour Bomb". It only reads the lists.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS } from '../data/items.js';
import { TRAPS, UPGRADES, NOPE } from '../data/recipes.js';
import { itemPicture } from './item-art.js';
import { heroPicture } from './hero-art.js';
import { sfx } from './audio.js';

const ALL = [...TRAPS, ...UPGRADES];
const ui = {};
const bench = [null, null];     // what is in the two slots: { kind, id }
let busy = false;               // true for a moment while it bolts together

/* --- LOOKING THINGS UP --------------------------------------- */

function findItem(id) { return ITEMS.find((item) => item.id === id); }
function findTrap(id) { return ALL.find((trap) => trap.id === id); }

/* A readable name for any id, even one that is not in the lists
   yet (like your water balloon before you add it). */
function nameOf(id) {
  const thing = findItem(id) || findTrap(id);
  if (thing) return thing.name;
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* Every item that went into a trap, all the way down. A Swinging
   Flour Bomb is a sack, some flour and a rope. */
function itemsIn(trapId) {
  const trap = findTrap(trapId);
  if (!trap) return [trapId];
  return trap.needs.flatMap((id) => (findTrap(id) ? itemsIn(id) : [id]));
}

/* Same two things, in any order? */
function samePair(needs, a, b) {
  return (needs[0] === a && needs[1] === b) || (needs[0] === b && needs[1] === a);
}

/* --- LITTLE PICTURES ----------------------------------------- */

function pictureOf(kind, id) {
  const box = document.createElement('span');
  box.className = 'ws-pic';
  const ids = kind === 'trap' ? itemsIn(id) : [id];
  ids.forEach((itemId) => box.append(itemPicture(findItem(itemId) || { look: 'parcel' })));
  if (ids.length > 1) box.classList.add('is-combo');
  return box;
}

function chips(trap) {
  const row = document.createElement('span');
  row.className = 'cat-chips';
  trap.cat.forEach((cat) => {
    const chip = document.createElement('span');
    chip.className = 'cat-chip';
    chip.dataset.cat = cat;
    chip.textContent = cat;
    row.append(chip);
  });
  return row;
}

/* --- THE CARDS ------------------------------------------------ */

function card(kind, id, index) {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ws-card';
  btn.dataset.kind = kind;
  btn.dataset.id = id;
  btn.dataset.index = index;
  btn.draggable = true;
  btn.append(pictureOf(kind, id));
  const name = document.createElement('span');
  name.className = 'ws-card-name';
  name.textContent = nameOf(id);
  btn.append(name);
  if (kind === 'trap' && findTrap(id)) btn.append(chips(findTrap(id)));
  btn.setAttribute('aria-label', `Put ${nameOf(id)} on the bench`);
  btn.addEventListener('click', () => place({ kind, id, index }));
  btn.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ kind, id, index }));
  });
  li.append(btn);
  return li;
}

/* Is this exact thing already sitting on the bench? */
function onBench(kind, index) {
  return bench.some((thing) => thing && thing.kind === kind && thing.index === index);
}

function drawLists() {
  ui.items.innerHTML = '';
  state.inventory.forEach((id, i) => { if (!onBench('item', i)) ui.items.append(card('item', id, i)); });
  if (!ui.items.children.length) ui.items.append(empty(state.inventory.length ? 'All on the bench.' : 'Nothing left in your bag.'));

  ui.traps.innerHTML = '';
  state.traps.forEach((id, i) => { if (!onBench('trap', i)) ui.traps.append(card('trap', id, i)); });
  if (!ui.traps.children.length) ui.traps.append(empty('No traps yet. Bolt something together.'));
  ui.toRig.hidden = state.traps.length === 0;
}

function empty(words) {
  const li = document.createElement('li');
  li.className = 'ws-empty';
  li.textContent = words;
  return li;
}

/* --- THE BENCH ----------------------------------------------- */

function drawBench() {
  [ui.slotA, ui.slotB].forEach((slot, i) => {
    slot.innerHTML = '';
    const thing = bench[i];
    slot.classList.toggle('is-full', Boolean(thing));
    if (thing) {
      slot.append(pictureOf(thing.kind, thing.id));
      const name = document.createElement('span');
      name.className = 'ws-card-name';
      name.textContent = nameOf(thing.id);
      slot.append(name);
      slot.setAttribute('aria-label', `${nameOf(thing.id)}. Tap to take it off the bench.`);
    } else {
      const hint = document.createElement('span');
      hint.className = 'ws-slot-hint';
      hint.textContent = 'Put something here';
      slot.append(hint);
      slot.setAttribute('aria-label', 'Empty slot on the bench');
    }
  });
}

function place(thing, slotIndex = bench.indexOf(null)) {
  if (busy || slotIndex < 0) return;
  if (onBench(thing.kind, thing.index)) return;
  bench[slotIndex] = thing;
  sfx.tick();
  drawBench();
  drawLists();
  if (bench[0] && bench[1]) {
    busy = true;
    setTimeout(bolt, 450);
  }
}

function takeOff(slotIndex) {
  if (busy || !bench[slotIndex]) return;
  bench[slotIndex] = null;
  drawBench();
  drawLists();
}

/* --- BOLTING IT TOGETHER ------------------------------------- */

function say(words) {
  ui.say.textContent = words;
}

function bolt() {
  const [a, b] = bench;
  const recipe = ALL.find((r) => samePair(r.needs, a.id, b.id));

  /* An upgrade needs one trap and one item. Two traps is never it. */
  if (!recipe || (a.kind === 'trap' && b.kind === 'trap')) {
    fail();
    return;
  }

  /* Use up both things. Take the higher numbered one out first so
     the other one's number does not shift. */
  [a, b].sort((x, y) => y.index - x.index).forEach((thing) => {
    const list = thing.kind === 'trap' ? state.traps : state.inventory;
    list.splice(thing.index, 1);
  });
  state.traps.push(recipe.id);

  const isNew = !state.notebook.includes(recipe.id);
  if (isNew) state.notebook.push(recipe.id);
  sfx.craft();
  say(`${recipe.name}! ${recipe.line}`);
  showResult(recipe, isNew);

  bench[0] = null; bench[1] = null;
  busy = false;
  drawBench();
  drawLists();
  drawNotebook();
}

function fail() {
  sfx.nope();
  say(NOPE[Math.floor(Math.random() * NOPE.length)]);
  ui.bench.classList.remove('is-smoking');
  void ui.bench.offsetWidth;          // restart the puff if it is already going
  ui.bench.classList.add('is-smoking');
  setTimeout(() => {
    ui.bench.classList.remove('is-smoking');
    bench[0] = null; bench[1] = null;
    busy = false;
    drawBench();
    drawLists();
  }, 700);
}

function showResult(trap, isNew) {
  ui.result.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'ws-made';
  const title = document.createElement('p');
  title.className = 'ws-made-title';
  title.textContent = (isNew ? 'New trap: ' : 'Built: ') + trap.name;
  const line = document.createElement('p');
  line.className = 'ws-made-line';
  line.textContent = trap.line;
  const where = document.createElement('p');
  where.className = 'ws-made-where';
  where.textContent = `Goes on: ${trap.mount.toLowerCase()}. Scare: ${'★'.repeat(trap.nerve)}`;
  box.append(pictureOf('trap', trap.id), title, chips(trap), line, where);
  ui.result.append(box);
}

/* --- THE NOTEBOOK ---------------------------------------------
   Every trap in data/recipes.js, in order. The ones you have
   built show their name and what went in. The rest are ??? and
   a clue. Upgrades hang off the trap they are made from.
   ------------------------------------------------------------ */

function notebookEntry(trap, isUpgrade) {
  const li = document.createElement('li');
  const known = state.notebook.includes(trap.id);
  li.className = 'nb-entry' + (known ? ' is-known' : '') + (isUpgrade ? ' is-upgrade' : '');
  const name = document.createElement('span');
  name.className = 'nb-name';
  const how = document.createElement('span');
  how.className = 'nb-how';
  if (known) {
    name.textContent = trap.name;
    how.textContent = trap.needs.map(nameOf).join(' + ');
  } else {
    name.textContent = '???';
    /* an upgrade only names its trap once you have built that trap */
    const base = trap.needs[0];
    how.textContent = isUpgrade
      ? `${state.notebook.includes(base) ? nameOf(base) : '???'} + one more thing`
      : 'Two things. Keep trying.';
  }
  li.append(name, how);
  if (known) li.append(chips(trap));
  return li;
}

function drawNotebook() {
  ui.notebook.innerHTML = '';
  TRAPS.forEach((trap) => {
    const li = notebookEntry(trap, false);
    const ups = UPGRADES.filter((up) => up.needs.includes(trap.id));
    if (ups.length) {
      const sub = document.createElement('ul');
      sub.className = 'nb-upgrades';
      ups.forEach((up) => sub.append(notebookEntry(up, true)));
      li.append(sub);
    }
    ui.notebook.append(li);
  });
  const found = ALL.filter((trap) => state.notebook.includes(trap.id)).length;
  ui.found.textContent = `Found ${found} of ${ALL.length}.`;
}

/* --- START AND STOP ------------------------------------------ */

export function setupWorkshop(els) {
  Object.assign(ui, els);
  ui.face.append(heroPicture());
  [ui.slotA, ui.slotB].forEach((slot, i) => {
    slot.addEventListener('click', () => takeOff(i));
    slot.addEventListener('dragover', (event) => { event.preventDefault(); slot.classList.add('is-over'); });
    slot.addEventListener('dragleave', () => slot.classList.remove('is-over'));
    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      slot.classList.remove('is-over');
      try {
        const thing = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (bench[i]) takeOff(i);
        place(thing, i);
      } catch (e) { /* something that was not one of our cards */ }
    });
  });
  ui.toRig.addEventListener('click', () => setPhase('rig'));
}

export function showWorkshop() {
  bench[0] = null; bench[1] = null;
  busy = false;
  ui.panel.hidden = false;
  ui.result.innerHTML = '';
  say(state.inventory.length
    ? 'Right. Two things on the bench. Let\'s see what we can make.'
    : 'Your bag is empty. Not much to build with. Go back and try again.');
  drawBench();
  drawLists();
  drawNotebook();
}

export function hideWorkshop() {
  ui.panel.hidden = true;
  bench[0] = null; bench[1] = null;
  busy = false;
}
