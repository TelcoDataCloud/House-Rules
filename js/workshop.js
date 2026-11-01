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

   BLUEPRINTS
   Every trap you build comes with a quick maths question
   (data/blueprints.js). Right answer: a PERFECT build, with a gold
   star, that scares a burglar one more than usual. Wrong: it still
   works. Under it is Peek at the code, which shows you the exact
   line in data/recipes.js that made the trap.

   GOING BACK OUT
   If the scavenge clock still has time on it, Back out searching
   takes you back to the house to find more junk.

   This file never says "Flour Bomb". It only reads the lists.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS } from '../data/items.js';
import { TRAPS, UPGRADES, NOPE, CAT_PICTURES } from '../data/recipes.js';
import { HINT_LINES, MISSING_LINES, MAXED_LINES, NOTHING_LINES } from '../data/hints.js';
import { itemPicture } from './item-art.js';
import { heroPicture } from './hero-art.js';
import { sfx } from './audio.js';
import { speak, hush } from './voice.js';
import { BLUEPRINTS, NUMBERS, TRIES, SPELLING } from '../data/blueprints.js';
import { workOut, between, pick as pickFrom } from './puzzle-maths.js';

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
  /* things you have already got come first, and they light up in
     your junk so you can see them */
  const got = ideas.filter((idea) => idea.have);
  const pool = got.length ? got : ideas;
  let words = '';
  let idea = null;
  for (let tries = 0; tries < 6; tries += 1) {
    idea = pickOne(pool);
    words = fill(pickOne(idea.have ? HINT_LINES : MISSING_LINES), nameOf(thing.id), riddleOf(idea.other));
    if (words !== lastHint) break;
  }
  lastHint = words;
  if (idea && idea.have) glowPartner(idea.other);
  return words;
}

/* Make the thing the hint is about glow in your junk for a bit. */
function glowPartner(needId) {
  setTimeout(() => {
    const card = [...document.querySelectorAll('#ws-items .ws-card, #ws-traps .ws-card')]
      .find((c) => c.dataset.id === needId || (!findTrap(needId) && canBe(c.dataset.id, needId)));
    if (!card) return;
    card.classList.add('is-hinted');
    setTimeout(() => card.classList.remove('is-hinted'), 4000);
  }, 50);
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

/* Is the trap at this place on your shelf one of your PERFECT
   builds? state.perfect counts them for each kind of trap, and the
   first ones on the shelf get the stars. */
export function isPerfectAt(index) {
  const id = state.traps[index];
  const before = state.traps.slice(0, index).filter((x) => x === id).length;
  return before < (state.perfect[id] || 0);
}

/* Never more perfect ones than you actually have. */
function keepPerfectHonest(id) {
  const have = state.traps.filter((x) => x === id).length;
  if ((state.perfect[id] || 0) > have) state.perfect[id] = have;
}

function chips(trap) {
  const row = document.createElement('span');
  row.className = 'cat-chips';
  trap.cat.forEach((cat) => {
    const chip = document.createElement('span');
    chip.className = 'cat-chip';
    chip.dataset.cat = cat;
    chip.textContent = `${CAT_PICTURES[cat] || ''} ${cat}`;
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
  const perfect = kind === 'trap' && isPerfectAt(index);
  if (perfect) {
    btn.classList.add('is-perfect');
    btn.append(Object.assign(document.createElement('span'), { className: 'ws-star', textContent: 'Perfect' }));
  }
  btn.setAttribute('aria-label', `Put ${nameOf(id)}${perfect ? ', a perfect build,' : ''} on the bench`);
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

/* Does this thing go with anything else you have got? */
function hasPartner(thing) {
  return partnersOf(thing).some((idea) => idea.have);
}

function drawLists() {
  const searchMore = state.scavengeBegun && (state.untimed || state.timeLeft > 0);
  ui.items.innerHTML = '';
  let canBuild = false;
  state.inventory.forEach((id, i) => {
    /* on the bench? leave a gap so nothing slides under your finger */
    if (onBench('item', i)) { ui.items.append(gap()); return; }
    const li = card('item', id, i);
    /* Nothing to mix it with? A yellow box if you can still go and
       find something for it, a red one if you cannot. */
    const btn = li.querySelector('.ws-card');
    if (hasPartner({ kind: 'item', id, index: i })) {
      canBuild = true;
    } else {
      btn.classList.add(searchMore ? 'is-lonely' : 'is-stuck');
      btn.title = searchMore ? 'Nothing to mix this with yet. Go back out and look!' : 'Nothing to mix this with tonight.';
      btn.setAttribute('aria-label', `${btn.getAttribute('aria-label')}. ${btn.title}`);
    }
    ui.items.append(li);
  });
  if (!ui.items.querySelector('.ws-card')) ui.items.append(empty(state.inventory.length ? 'All on the bench.' : 'Nothing left in your bag.'));

  ui.traps.innerHTML = '';
  state.traps.forEach((id, i) => ui.traps.append(onBench('trap', i) ? gap() : card('trap', id, i)));
  if (!ui.traps.querySelector('.ws-card')) ui.traps.append(empty('No traps yet. Bolt something together.'));
  /* Time left on the scavenge clock? You can go back out for more. */
  const t = state.scavengeBegun ? state.timeLeft : 0;
  ui.backOut.hidden = !(state.scavengeBegun && (state.untimed || t > 0));
  ui.backOut.textContent = state.untimed ? 'Back out searching' : `Back out searching (${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')} left)`;
  /* Green means "do this next": go back out while there are still
     traps to make, then downstairs once you have made them all. */
  const doneBuilding = !canBuild && state.traps.length > 0;
  ui.backOut.classList.toggle('is-next', !ui.backOut.hidden && !doneBuilding);
  ui.toRig.classList.toggle('is-next', doneBuilding || ui.backOut.hidden);
  /* No traps? You can still go down. It will just be a long night. */
  ui.toRig.hidden = false;
  ui.toRig.textContent = state.traps.length || Object.keys(state.rigged).length
    ? 'Take the traps downstairs'
    : 'Go downstairs with no traps';
}

function gap() {
  const li = document.createElement('li');
  li.className = 'ws-gap';
  li.setAttribute('aria-hidden', 'true');
  return li;
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

/* The trap's line, but if you used a stand in (custard for honey)
   it says custard, not honey. */
function lineFor(recipe, things) {
  let line = recipe.line;
  things.filter((thing) => thing.kind !== 'trap' && !recipe.needs.includes(thing.id)).forEach((thing) => {
    const need = recipe.needs.find((n) => canBe(thing.id, n));
    const was = need && findItem(need);
    const now = findItem(thing.id);
    if (!was || !now) return;
    const from = was.name.split(' ').pop();
    const to = now.name.split(' ').pop();
    line = line.replace(new RegExp(`\\b${from}\\b`, 'gi'), (m) => (m[0] === m[0].toUpperCase() ? to : to.toLowerCase()));
  });
  return line;
}

/* Use the things up, put the trap on the shelf, write it in the
   notebook. */
function build(recipe, things) {
  /* take the highest numbered one out first so the others do not shift */
  [...things].sort((x, y) => y.index - x.index).forEach((thing) => {
    const list = thing.kind === 'trap' ? state.traps : state.inventory;
    list.splice(thing.index, 1);
  });
  things.filter((thing) => thing.kind === 'trap').forEach((thing) => keepPerfectHonest(thing.id));
  state.traps.push(recipe.id);

  fails = 0;
  const isNew = !state.notebook.includes(recipe.id);
  if (isNew) state.notebook.push(recipe.id);
  sfx.craft();
  const line = lineFor(recipe, things);
  say(`${recipe.name}! ${line}`);
  showResult(recipe, isNew, things.some((thing) => thing.kind === 'trap') || things.length === 3, line);
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

/* --- THE BLUEPRINT QUESTION ---------------------------------- */

function blueprintFor(trap, isUpgrade) {
  const all = isUpgrade ? BLUEPRINTS.UPGRADE : (BLUEPRINTS[trap.cat[0]] || BLUEPRINTS.UPGRADE);
  const range = NUMBERS[state.puzzleLevel] || NUMBERS.easy;
  /* Easy: adding only. Tricky: one step. Brainbuster: anything. */
  const ok = (q) => (state.puzzleLevel === 'easy' ? !q.answer.includes('*')
    : state.puzzleLevel === 'tricky' ? !q.answer.includes('c') : true);
  const list = all.filter(ok).length ? all.filter(ok) : all;
  for (let tries = 0; tries < 40; tries += 1) {
    const q = pickFrom(list);
    const n = {};
    ['a', 'b', 'c'].forEach((k) => { n[k] = between(range[k][0], range[k][1]); });
    const fill = (words) => words.replace(/\b([abc])\b/g, (m, k) => String(n[k]));
    const answer = workOut(fill(q.answer));
    if (answer >= 0) return { ask: fill(q.ask), sum: `${fill(q.answer).replace(/\*/g, '×')} = ?`, answer };
  }
  return { ask: 'What is 2 + 2?', sum: '2 + 2 = ?', answer: 4 };
}

/* A word to spell for this trap: one of its own things if there
   is a short enough word for it, or else any word that fits. */
function spellingFor(trap) {
  const longest = state.puzzleLevel === 'easy' ? 3 : state.puzzleLevel === 'tricky' ? 4 : 9;
  const fits = SPELLING.filter((s) => s.word.length <= longest);
  const mine = fits.filter((s) => itemsIn(trap.id).includes(s.item));
  return pickFrom(mine.length ? mine : fits);
}

function spellBox(trap) {
  const s = spellingFor(trap);
  const box = document.createElement('div');
  box.className = 'ws-blueprint';
  const head = document.createElement('p');
  head.className = 'ws-blueprint-head';
  head.textContent = 'Blueprint! Spell it right for a PERFECT trap.';
  const pic = pictureOf('item', s.item);
  pic.classList.add('ws-spell-pic');
  const said = document.createElement('p');
  said.className = 'ws-blueprint-said';
  said.setAttribute('aria-live', 'polite');
  const slots = document.createElement('div');
  slots.className = 'pz-slots';
  const tiles = document.createElement('div');
  tiles.className = 'pz-tiles';
  let letters = s.word.split('');
  for (let i = 0; i < 10 && letters.join('') === s.word; i += 1) letters = [...letters].sort(() => Math.random() - 0.5);
  const picked = [];
  let left = TRIES;
  const read = document.createElement('button');
  read.type = 'button';
  read.className = 'btn btn-quiet ws-blueprint-read';
  read.textContent = '\u{1F50A} Say it';
  read.addEventListener('click', () => speak(s.word.toLowerCase()));
  const finish = () => box.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  const draw = () => {
    slots.innerHTML = '';
    s.word.split('').forEach((_, i) => {
      const slot = document.createElement('span');
      slot.className = 'pz-slot pz-slot-show';
      slot.textContent = picked[i] !== undefined ? letters[picked[i]] : '';
      slots.append(slot);
    });
    tiles.innerHTML = '';
    letters.forEach((letter, t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn pz-tile';
      b.textContent = letter;
      b.setAttribute('aria-label', `Letter ${letter}`);
      b.disabled = picked.includes(t);
      b.addEventListener('click', () => {
        if (picked.includes(t) || picked.length >= s.word.length) return;
        picked.push(t);
        sfx.tick();
        draw();
        if (picked.length === s.word.length) check();
      });
      tiles.append(b);
    });
  };
  const check = () => {
    const spelled = picked.map((t) => letters[t]).join('');
    if (spelled === s.word) {
      state.perfect[trap.id] = (state.perfect[trap.id] || 0) + 1;
      keepPerfectHonest(trap.id);
      sfx.rare();
      box.classList.add('is-done', 'is-perfect');
      said.textContent = `${s.word}! PERFECT BUILD!`;
      finish();
      drawLists();
      return;
    }
    left -= 1;
    sfx.nope();
    if (left <= 0) {
      box.classList.add('is-done');
      said.textContent = `It spells ${s.word}. A bit wonky, but it still works.`;
      finish();
      return;
    }
    said.textContent = `${spelled}? Not quite. Try again.`;
    setTimeout(() => { picked.length = 0; draw(); }, 700);
  };
  draw();
  box.append(head, pic, read, slots, tiles, said);
  return box;
}

function blueprintBox(trap, isUpgrade) {
  /* half the time, spell a word instead of a sum */
  if (Math.random() < 0.5) return spellBox(trap);
  const q = blueprintFor(trap, isUpgrade);
  /* (a maths blueprint from here down) */
  const box = document.createElement('div');
  box.className = 'ws-blueprint';
  const head = document.createElement('p');
  head.className = 'ws-blueprint-head';
  head.textContent = 'Blueprint! Get it right for a PERFECT trap.';
  const ask = document.createElement('p');
  ask.className = 'ws-blueprint-ask';
  ask.textContent = q.ask;
  const sum = document.createElement('p');
  sum.className = 'ws-blueprint-sum';
  sum.textContent = q.sum;
  const read = document.createElement('button');
  read.type = 'button';
  read.className = 'btn btn-quiet ws-blueprint-read';
  read.textContent = '\u{1F50A} Read it to me';
  read.addEventListener('click', () => speak(q.ask.replace(/ - /g, ' take away ')));
  const said = document.createElement('p');
  said.className = 'ws-blueprint-said';
  said.setAttribute('aria-live', 'polite');
  let left = TRIES;
  /* a small box to type the answer in. On a phone it brings up
     the number keyboard. */
  const row = document.createElement('form');
  row.className = 'ws-blueprint-row';
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.pattern = '[0-9]*';
  input.maxLength = 4;
  input.className = 'ws-blueprint-input';
  input.setAttribute('aria-label', `Your answer: ${q.ask}`);
  input.autocomplete = 'off';
  const ok = document.createElement('button');
  ok.type = 'submit';
  ok.className = 'btn ws-blueprint-ok';
  ok.textContent = 'OK';
  row.append(input, ok);
  const finish = () => box.querySelectorAll('button, input').forEach((b) => { b.disabled = true; });
  const answer = (typed) => {
    if (Number(typed) === q.answer) {
      state.perfect[trap.id] = (state.perfect[trap.id] || 0) + 1;
      keepPerfectHonest(trap.id);
      sfx.rare();
      box.classList.add('is-done', 'is-perfect');
      said.textContent = `${q.answer}. PERFECT BUILD! It scares them one more.`;
      finish();
      drawLists();
      return;
    }
    left -= 1;
    sfx.nope();
    if (left <= 0) {
      box.classList.add('is-done');
      said.textContent = `It was ${q.answer}. A bit wonky, but it still works.`;
      finish();
      return;
    }
    said.textContent = `${typed}? Not quite. One more go.`;
    input.value = '';
    input.focus();
  };
  row.addEventListener('submit', (event) => {
    event.preventDefault();
    const typed = input.value.replace(/\D/g, '');
    if (typed) answer(typed);
  });
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'btn btn-quiet ws-blueprint-skip';
  skip.textContent = 'Skip it';
  skip.addEventListener('click', () => {
    box.classList.add('is-done');
    said.textContent = 'Skipped. It still works.';
    finish();
  });
  row.append(skip);
  box.append(head, ask, sum, read, row, said);
  return box;
}

/* Peek at the code: the exact line in data/recipes.js. */
function codeOf(trap) {
  const list = (xs) => `[${[].concat(xs).map((x) => `'${x}'`).join(', ')}]`;
  const bits = [
    `{ id: '${trap.id}', name: '${trap.name}', needs: ${list(trap.needs)},`,
    `  cat: ${list(trap.cat)}, nerve: ${trap.nerve}, mount: '${trap.mount}',`,
    `  fx: '${trap.fx}',${trap.mess ? ` mess: ${Array.isArray(trap.mess) ? list(trap.mess) : `'${trap.mess}'`},` : ''} word: '${trap.word}' }`
  ];
  return bits.join('\n');
}

function peekBox(trap) {
  const box = document.createElement('details');
  box.className = 'ws-peek';
  const summary = document.createElement('summary');
  summary.textContent = 'Peek at the code';
  const where = document.createElement('p');
  where.textContent = `This trap is these lines in data/recipes.js${UPGRADES.includes(trap) ? ' (in UPGRADES)' : ''}. Change nerve and it gets scarier. Change word and it says something else.`;
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  code.textContent = codeOf(trap);
  pre.append(code);
  box.append(summary, where, pre);
  return box;
}

function showResult(trap, isNew, isUpgrade = false, said = trap.line) {
  ui.result.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'ws-made';
  const title = document.createElement('p');
  title.className = 'ws-made-title';
  title.textContent = (isNew ? 'New trap: ' : 'Built: ') + trap.name;
  const line = document.createElement('p');
  line.className = 'ws-made-line';
  line.textContent = said;
  const where = document.createElement('p');
  where.className = 'ws-made-where';
  where.textContent = `Goes on: ${trap.mount.toLowerCase()}. Scare: ${'★'.repeat(trap.nerve)}`;
  box.append(pictureOf('trap', trap.id), title, chips(trap), line, where);
  ui.result.append(box, blueprintBox(trap, isUpgrade));
  ui.extra.innerHTML = '';
  ui.extra.append(peekBox(trap));
  ui.extra.hidden = false;
  /* it pops up over the bench, so your junk stays at the top */
  if (ui.made && !ui.made.open) {
    if (ui.made.showModal) ui.made.showModal(); else ui.made.setAttribute('open', '');
    const first = ui.made.querySelector('input, button');
    if (first) first.focus();
  }
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
  if (ui.madeClose) ui.madeClose.addEventListener('click', closeMade);
  ui.backOut.addEventListener('click', () => { sfx.start(); setPhase('scavenge'); });
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
  ui.extra.innerHTML = '';
  ui.extra.hidden = true;
  closeMade();
  const timeLeft = state.scavengeBegun && (state.untimed || state.timeLeft > 0);
  say(state.inventory.length
    ? 'Right. Put something on the bench and I will have a think.'
    : timeLeft
      ? 'My bag is empty. Better go back out and grab some junk.'
      : 'My bag is empty. Not much to build with. It is going to be a long night.');
  drawBench();
  drawLists();
  drawNotebook();
}

function closeMade() {
  if (ui.made && ui.made.open) {
    if (ui.made.close) ui.made.close(); else ui.made.removeAttribute('open');
  }
}

export function hideWorkshop() {
  closeMade();
  ui.panel.hidden = true;
  hush();
  clearTimeout(talking);
  if (ui.face) ui.face.classList.remove('is-talking');
  bench.fill(null);
  waiting = null;
  busy = false;
}
