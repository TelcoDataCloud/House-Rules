/* ===========================================================
   WORKSHOP - phase 2: bolt things together

   Your bag from the scavenge is laid out on the bench. Put two
   things in the two slots (tap them, or drag them) and the game
   looks them up in data/recipes.js.

     Found it  -> you built a trap. The things are used up, the
                  trap goes on your shelf, and the notebook
                  remembers it.
     Not found -> a puff of smoke, a comment from you, and both
                  things go back in the bag. Nothing is lost.

   STAND INS
   Some things can do another thing's job (worksAs in
   data/items.js). String works as rope, tape works as string. So
   Paint Tin + String makes The Pendulum, same as Paint Tin + Rope.

   THE THIRD BOX
   If the two things make a trap that CAN be upgraded, it does not
   bolt straight away. A third box opens on the bench. Put one more
   thing in it to build the upgrade in one go, or press Build it
   as it is. (A trap already on your shelf can still go back on the
   bench with one more thing, too.)

   HINTS
   Put ONE thing on the bench and you (Hendrix, top left) drop a
   hint about what it goes with. Never the answer, always a
   riddle. The riddles are in data/items.js and data/recipes.js,
   and the sentences they go in are in data/hints.js. Stuck? Any
   ideas? asks for a hint about the whole bag. The game reads
   every line out loud (js/voice.js).

   This file never says "Flour Bomb". It only reads the lists.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS } from '../data/items.js';
import { TRAPS, UPGRADES, NOPE } from '../data/recipes.js';
import { HINT_LINES, MISSING_LINES, MAXED_LINES, NOTHING_LINES } from '../data/hints.js';
import { itemPicture } from './item-art.js';
import { heroPicture } from './hero-art.js';
import { sfx } from './audio.js';
import { speak, hush } from './voice.js';

const ALL = [...TRAPS, ...UPGRADES];
const ui = {};
const bench = [null, null, null];   // the three boxes: { kind, id, index }. The third only opens for an upgrade.
let waiting = null;                 // a trap the first two boxes make, waiting to see if you add a third thing
let busy = false;                   // true for a moment while it bolts together
let fails = 0;                      // wrong guesses in a row, for a free hint
let lastHint = '';                  // so the same hint does not come twice in a row
let talking = null;                 // the timer that stops the mouth moving

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

/* Can this item do the job of that one? Itself, or a stand in. */
function canBe(itemId, needId) {
  if (itemId === needId) return true;
  const item = findItem(itemId);
  return Boolean(item && (item.worksAs || []).includes(needId));
}

/* What can stand in for this thing? ['string', 'duct-tape'] for rope. */
function standIns(needId) {
  return ITEMS.filter((item) => (item.worksAs || []).includes(needId)).map((item) => item.id);
}

/* Does this thing fill this need? A trap has to be exactly the
   right trap. An item can be the thing or a stand in. exact
   switches stand ins off. */
function fills(thing, needId, exact) {
  if (thing.kind === 'trap') return thing.id === needId;
  if (findTrap(needId)) return false;
  return exact ? thing.id === needId : canBe(thing.id, needId);
}

function fitsPair(recipe, a, b, exact) {
  const [n0, n1] = recipe.needs;
  return (fills(a, n0, exact) && fills(b, n1, exact)) || (fills(b, n0, exact) && fills(a, n1, exact));
}

/* Which recipe do these two make? The real thing wins over a
   stand in, so Bucket + Paint Tin is always the Overhead Special. */
function recipeFor(a, b) {
  if (a.kind === 'trap' && b.kind === 'trap') return null;
  return ALL.find((r) => fitsPair(r, a, b, true)) || ALL.find((r) => fitsPair(r, a, b, false)) || null;
}

function upgradesOf(trapId) {
  return UPGRADES.filter((up) => up.needs[0] === trapId);
}

/* --- HINTS -------------------------------------------------- */

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function riddleOf(id) {
  const thing = findItem(id) || findTrap(id);
  return thing && thing.riddle ? thing.riddle : 'something else from the house';
}

/* '{this} goes with {that}.' with the blanks filled in, and a
   capital letter at the start. */
function fill(line, thisName, that) {
  const words = line.replace('{this}', thisName).replace('{that}', that);
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* Is there something in your bag (or on your shelf) that could
   fill this need? Things already on the bench do not count. */
function have(needId) {
  if (findTrap(needId)) return state.traps.some((t, i) => t === needId && !onBench('trap', i));
  return state.inventory.some((t, i) => canBe(t, needId) && !onBench('item', i));
}

/* Everything this thing could be bolted to, best ideas first:
   things you have and have not built yet, then things you have,
   then things you would need to go and find. */
function partnersOf(thing) {
  const ideas = [];
  ALL.forEach((r) => {
    r.needs.forEach((need, i) => {
      if (thing.kind === 'trap' && (i !== 0 || !UPGRADES.includes(r))) return;
      if (!fills(thing, need, false)) return;
      const other = r.needs[1 - i];
      if (ideas.some((idea) => idea.other === other)) return;
      ideas.push({ recipe: r, other, have: have(other), known: state.notebook.includes(r.id) });
    });
  });
  const score = (idea) => (idea.have ? 0 : 2) + (idea.known ? 1 : 0);
  ideas.sort((a, b) => score(a) - score(b));
  return ideas.filter((idea) => score(idea) === score(ideas[0] || idea));
}

function hintFor(thing) {
  const ideas = partnersOf(thing);
  if (!ideas.length) {
    return fill(pickOne(thing.kind === 'trap' ? MAXED_LINES : NOTHING_LINES), nameOf(thing.id), '');
  }
  let words = '';
  for (let tries = 0; tries < 6; tries += 1) {
    const idea = pickOne(ideas);
    words = fill(pickOne(idea.have ? HINT_LINES : MISSING_LINES), nameOf(thing.id), riddleOf(idea.other));
    if (words !== lastHint) break;
  }
  lastHint = words;
  return words;
}

/* Any ideas? Look through the whole bag for two things that go
   together, and drop a hint about one of them. */
function bagHint() {
  if (waiting) return hintFor({ kind: 'trap', id: waiting.id, index: -1 });
  const mine = [
    ...state.inventory.map((id, index) => ({ kind: 'item', id, index })),
    ...state.traps.map((id, index) => ({ kind: 'trap', id, index }))
  ].filter((thing) => !onBench(thing.kind, thing.index));
  const good = mine.filter((thing) => partnersOf(thing).some((idea) => idea.have));
  const fresh = good.filter((thing) => partnersOf(thing).some((idea) => idea.have && !idea.known));
  const pool = fresh.length ? fresh : good;
  if (!pool.length) return pickOne(NOTHING_LINES);
  return hintFor(pickOne(pool));
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
  /* No traps? You can still go down. It will just be a long night. */
  ui.toRig.hidden = false;
  ui.toRig.textContent = state.traps.length || Object.keys(state.rigged).length
    ? 'Take the traps downstairs'
    : 'Go downstairs with no traps';
}

function empty(words) {
  const li = document.createElement('li');
  li.className = 'ws-empty';
  li.textContent = words;
  return li;
}

/* --- THE BENCH ----------------------------------------------- */

function drawBench() {
  const slots = [ui.slotA, ui.slotB, ui.slotC];
  slots.forEach((slot, i) => {
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
      hint.textContent = i === 2 ? 'Upgrade? Add one more' : 'Put something here';
      slot.append(hint);
      slot.setAttribute('aria-label', i === 2 ? 'Upgrade box. Add a third thing to upgrade the trap.' : 'Empty box on the bench');
    }
  });
  /* the third box only opens when the first two make a trap that
     can be upgraded */
  const third = Boolean(waiting);
  ui.slotC.hidden = !third;
  ui.plusC.hidden = !third;
  ui.buildNow.hidden = !third;
  ui.bench.classList.toggle('has-third', third);
  if (third) ui.buildNow.textContent = `Build ${waiting.name} as it is`;
}

function place(thing, slotIndex) {
  if (busy) return;
  if (onBench(thing.kind, thing.index)) return;
  if (slotIndex === undefined) slotIndex = waiting ? 2 : bench.slice(0, 2).indexOf(null);
  if (slotIndex < 0 || bench[slotIndex]) return;
  if (slotIndex === 2 && !waiting) return;
  bench[slotIndex] = thing;
  sfx.tick();
  drawBench();
  drawLists();
  if (slotIndex === 2) {
    busy = true;
    setTimeout(boltThird, 450);
  } else if (bench[0] && bench[1]) {
    busy = true;
    setTimeout(boltPair, 450);
  } else {
    /* one thing on the bench: drop a hint about what it goes with */
    say(hintFor(thing));
  }
}

function takeOff(slotIndex) {
  if (busy || !bench[slotIndex]) return;
  bench[slotIndex] = null;
  /* take one of the first two off and the third box closes */
  if (slotIndex < 2 && waiting) {
    bench[2] = null;
    waiting = null;
  }
  drawBench();
  drawLists();
}

/* --- BOLTING IT TOGETHER ------------------------------------- */

/* On a small screen the bench can be off the top of the screen
   while you pick your junk. When something happens on it, bring
   it back into view. */
function showBench() {
  const top = ui.bench.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight - 120) {
    ui.panel.querySelector('.ws-top').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}

/* You say something: the words go in your speech bubble, your
   face moves, and the computer reads it out. */
function say(words) {
  ui.say.textContent = words;
  ui.face.classList.add('is-talking');
  clearTimeout(talking);
  const stop = () => { clearTimeout(talking); ui.face.classList.remove('is-talking'); };
  talking = setTimeout(stop, 600 + words.length * 70);
  speak(words, stop);
}

function boltPair() {
  const [a, b] = bench;
  const recipe = recipeFor(a, b);
  if (!recipe) { fail(); return; }

  /* two items that make a trap with an upgrade: open the third box */
  if (a.kind === 'item' && b.kind === 'item' && upgradesOf(recipe.id).length) {
    waiting = recipe;
    busy = false;
    sfx.select();
    drawBench();
    showBench();
    say(`That makes ${recipe.name}! ${hintFor({ kind: 'trap', id: recipe.id, index: -1 })}`);
    return;
  }
  build(recipe, [a, b]);
}

function boltThird() {
  const extra = bench[2];
  const up = extra.kind === 'item' &&
    (upgradesOf(waiting.id).find((u) => u.needs[1] === extra.id) ||
     upgradesOf(waiting.id).find((u) => canBe(extra.id, u.needs[1])));
  if (up) {
    if (!state.notebook.includes(waiting.id)) state.notebook.push(waiting.id);
    build(up, [bench[0], bench[1], extra]);
    return;
  }
  sfx.nope();
  shake();
  say(`${pickOne(NOPE)} Try a different third thing, or build it as it is.`);
  setTimeout(() => {
    bench[2] = null;
    busy = false;
    drawBench();
    drawLists();
  }, 700);
}

/* Use the things up, put the trap on the shelf, write it in the
   notebook. */
function build(recipe, things) {
  /* take the highest numbered one out first so the others do not shift */
  [...things].sort((x, y) => y.index - x.index).forEach((thing) => {
    const list = thing.kind === 'trap' ? state.traps : state.inventory;
    list.splice(thing.index, 1);
  });
  state.traps.push(recipe.id);

  fails = 0;
  const isNew = !state.notebook.includes(recipe.id);
  if (isNew) state.notebook.push(recipe.id);
  sfx.craft();
  say(`${recipe.name}! ${recipe.line}`);
  showResult(recipe, isNew);
  showBench();

  bench.fill(null);
  waiting = null;
  busy = false;
  drawBench();
  drawLists();
  drawNotebook();
}

function shake() {
  ui.bench.classList.remove('is-smoking');
  void ui.bench.offsetWidth;          // restart the puff if it is already going
  ui.bench.classList.add('is-smoking');
}

function fail() {
  sfx.nope();
  fails += 1;
  /* two wrong in a row and you give yourself a clue */
  const clue = fails >= 2 ? ` Wait. ${hintFor(bench[0])}` : '';
  if (clue) fails = 0;
  say(pickOne(NOPE) + clue);
  shake();
  setTimeout(() => {
    ui.bench.classList.remove('is-smoking');
    bench.fill(null);
    waiting = null;
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
   built show their name and what went in (and what can stand in).
   The rest are ??? and a clue. Upgrades hang off the trap they are
   made from.
   ------------------------------------------------------------ */

function needName(id) {
  const subs = standIns(id);
  return subs.length ? `${nameOf(id)} (or ${subs.map(nameOf).join(' or ')})` : nameOf(id);
}

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
    how.textContent = trap.needs.map(needName).join(' + ');
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
    const ups = upgradesOf(trap.id);
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
  [ui.slotA, ui.slotB, ui.slotC].forEach((slot, i) => {
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
  ui.buildNow.addEventListener('click', () => {
    if (!waiting || busy) return;
    build(waiting, [bench[0], bench[1]]);
  });
  ui.toRig.addEventListener('click', () => setPhase('rig'));
  ui.ideas.addEventListener('click', () => { sfx.tick(); say(bagHint()); });
}

export function showWorkshop() {
  bench.fill(null);
  waiting = null;
  busy = false;
  fails = 0;
  lastHint = '';
  ui.panel.hidden = false;
  ui.result.innerHTML = '';
  say(state.inventory.length
    ? 'Right. Put something on the bench and I will have a think.'
    : 'My bag is empty. Not much to build with. It is going to be a long night.');
  drawBench();
  drawLists();
  drawNotebook();
}

export function hideWorkshop() {
  ui.panel.hidden = true;
  hush();
  clearTimeout(talking);
  if (ui.face) ui.face.classList.remove('is-talking');
  bench.fill(null);
  waiting = null;
  busy = false;
}
