/* ===========================================================
   SCAVENGE - phase 1: raid your own house before the clock
   runs out

   At the start of every night this file:
     1. picks which rare things turn up tonight
     2. locks the safe, the piano, the shed and the cellar lights,
        with new puzzles (js/puzzles.js), and puts something rare
        behind each lock
     3. hides Dad's note with the safe code somewhere
     4. leaves a few common things lying about in plain sight
     5. hides everything else, each thing in the rooms it belongs
        in (foundIn in data/items.js) and in a place that suits it
        (kind and holds): flour in a cupboard, never the fridge.
        Things usually turn up in their own rooms, but anywhere
        that makes sense can happen, so no two nights are the same
     6. starts the clock

   Every night is shuffled differently, so you cannot learn
   exactly where things are. You CAN learn which rooms are worth it.

   YOUR BAG
   It holds CARRY_LIMIT things. Tap something in your bag to drop
   it on the floor where you are standing (you can pick it up
   again). Find something with a full bag and it spills out onto
   the floor, so you can swap.

   PAUSE
   The clock stops while you go to the workbench. Build a few
   traps, see what you still need, then go back out with the time
   you had left. Your bag, the junk you left lying about and the
   locks you opened are all still there. Only when the clock hits
   zero is the scavenge really over.

   The rules (how many, how big your bag is, where things go) all
   live in data/items.js. The clock lives in data/difficulty.js.
   This file just follows them.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS, CARRY_LIMIT, OUT_IN_THE_OPEN, RARE_EACH_NIGHT, RARE_HIDEOUTS } from '../data/items.js';
import { ROOMS } from '../data/rooms.js';
import { WEEK } from '../data/nights.js';
import { SAFE } from '../data/puzzles.js';
import { FOUND_LINES, EMPTY_LINES } from '../data/hints.js';
import { DIFFICULTY } from '../data/difficulty.js';
import {
  placeLooseItem, setLookHandler, hidingPlaces, putDown, spillFrom, setLockGate, refreshLocks, searchLocked, setClosedRooms
} from './house.js';
import { itemPicture } from './item-art.js';
import { sfx } from './audio.js';
import { startHero, stopWalking, hideHero, setGate, heroSpot, walkTo } from './hero.js';
import {
  newPuzzles, isLocked, openPuzzle, closePuzzle, noteText, puzzleOpen,
  showTime as showPuzzleTime, showClockMode, setPuzzleTimeListener
} from './puzzles.js';

let clock = null;
const ui = {};

function findItem(id) {
  return ITEMS.find((item) => item.id === id);
}

/* Shuffle a list like a deck of cards, and hand back a new one. */
function shuffle(list) {
  const deck = [...list];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

/* Which room is locked with this lock? */
function lockedRoom(roomId) {
  const room = ROOMS.find((r) => r.id === roomId);
  return room && room.lock && isLocked(room.lock) ? room.lock : null;
}

/* --- SETTING THE HOUSE UP ------------------------------------ */

/* With a clock, the house is smaller: Monday's rooms, plus the
   ones each night after opens (data/nights.js). No clock gets the
   whole house. Hands back the rooms that are SHUT tonight. */
function shutTonight() {
  if (state.untimed) return [];
  const night = state.week ? state.week.night : 0;
  const open = WEEK.slice(0, night + 1).flatMap((n) => n.opens || []);
  if (!open.length) return [];
  return ROOMS.map((r) => r.id).filter((id) => !open.includes(id));
}
const isOpen = (roomId) => !(state.closed || []).includes(roomId);

function scatter() {
  /* copies: 2 in data/items.js means there are two of it in the
     house, because it goes in loads of traps */
  const common = shuffle(ITEMS.filter((item) => !item.rare)
    .flatMap((item) => Array.from({ length: Math.max(1, item.copies || 1) }, () => item)));
  const rare = shuffle(ITEMS.filter((item) => item.rare)).slice(0, RARE_EACH_NIGHT);
  const homes = (item) => item.foundIn || [];
  /* Does this thing belong in this hiding place? A place with no
     holds list takes anything. */
  const fits = (spot, item) => !spot.holds || spot.holds.includes(item.kind);
  /* A good free place for a thing. It always has to be the right
     sort of place (no flour in the fridge). Its own rooms are
     twice as likely as anywhere else, but anywhere that makes sense
     can happen, so the house is different every night. */
  const bestFor = (item, from) => {
    const sensible = from.filter((s) => fits(s, item));
    if (sensible.length) {
      const pool = [...sensible, ...sensible.filter((s) => homes(item).includes(s.room))];
      return pick(pool);
    }
    return from.find((s) => homes(item).includes(s.room)) || from[0];
  };

  let free = shuffle(hidingPlaces().filter((s) => isOpen(s.room)));
  const take = (spot, item) => {
    state.hidden[spot.id] = item.id;
    free = free.filter((s) => s !== spot);
  };

  /* Something rare behind every lock on a hiding place (the safe,
     the piano). */
  free.filter((s) => s.lock).forEach((spot) => {
    /* the right sort of thing for that place: no leaf blower in
       the bathroom cabinet */
    const at = Math.max(0, rare.findIndex((item) => fits(spot, item)));
    const [item] = rare.splice(at, 1);
    if (item) take(spot, item);
  });

  /* And one in every locked room (the shed, the dark cellar). */
  ROOMS.filter((room) => room.lock && isOpen(room.id)).forEach((room) => {
    const inside = free.filter((s) => s.room === room.id);
    const item = inside.length ? rare.shift() : null;
    if (item) take(bestFor(item, inside), item);
  });

  /* Dad's note with the safe code, in one of his rooms. It can
     share a hiding place with a bit of junk. */
  const noteSpots = free.filter((s) => SAFE.noteRooms.includes(s.room));
  state.noteSpot = noteSpots.length ? noteSpots[0].id : null;

  /* The rest of the rare things: in their own rooms if there is
     space, then the awkward places, then anywhere. */
  rare.forEach((item) => {
    const awkward = free.filter((s) => RARE_HIDEOUTS.includes(s.room) || RARE_HIDEOUTS.includes(s.id));
    const spot = awkward.length ? bestFor(item, awkward) : bestFor(item, free);
    if (spot) take(spot, item);
  });

  /* A few common things left lying about, in their own rooms if
     there is a free place to leave them. Never in a locked room. */
  let places = shuffle(ROOMS.filter((room) => !room.lock && isOpen(room.id)).flatMap((room) =>
    (room.inTheOpen || []).map((place) => ({ room: room.id, place }))));
  const lying = common.slice(0, Math.min(OUT_IN_THE_OPEN, places.length));
  lying.forEach((item) => {
    const spot = (Math.random() < 0.5 && places.find((p) => homes(item).includes(p.room))) || places[0];
    places = places.filter((p) => p !== spot);
    placeLooseItem(spot.room, spot.place, item);
    state.lying.push(item.id);
  });

  /* Everything else hides in its own rooms if it can. */
  common.slice(lying.length).forEach((item) => {
    const spot = bestFor(item, free);
    if (spot) take(spot, item);
  });
}

/* --- LOOKING AND PICKING UP ----------------------------------
   house.js calls this whenever you click a hiding place or a
   bit of junk. It answers with what to say, and whether you got
   anything.
   ------------------------------------------------------------ */

function look(spot) {
  if (!state.scavenging) {
    return { blocked: true, message: 'Time is up. No more grabbing.' };
  }
  const full = state.inventory.length >= CARRY_LIMIT;

  if (spot.kind === 'loose') {
    const item = findItem(spot.node.dataset.item);
    if (full) {
      sfx.full();
      flashBag();
      return { blocked: true, message: `Your bag is full. Tap something in your bag to drop it, then grab this.` };
    }
    take(item);
    const at = state.lying.indexOf(item.id);       // just this one, there might be two
    if (at >= 0) state.lying.splice(at, 1);
    return { item, message: `${pick(FOUND_LINES)} ${item.name}.` };
  }

  /* Dad's note? */
  let note = '';
  if (spot.id === state.noteSpot && !state.notes.includes('safe')) {
    state.notes.push('safe');
    showNotes();
    sfx.rare();
    note = ` A note from Dad! "${noteText()}"`;
  }

  const itemId = state.hidden[spot.id];
  if (!itemId) {
    if (!note) sfx.rummage();
    return { message: `${spot.name}.${note || ` ${pick(EMPTY_LINES)}`}` };
  }
  const item = findItem(itemId);
  delete state.hidden[spot.id];
  if (full) {
    /* it falls out on the floor, so you can swap */
    sfx.full();
    flashBag();
    spillFrom(spot.id, item);
    state.lying.push(item.id);
    return { message: `${spot.name}: ${item.name}! Your bag is full, so it is on the floor. Drop something to make room.${note}` };
  }
  take(item);
  return {
    item,
    message: (item.rare
      ? `${spot.name}: ${item.name}! That is a rare one.`
      : `${spot.name}: ${item.name}! ${pick(FOUND_LINES)}`) + note
  };
}

function take(item) {
  state.inventory.push(item.id);
  if (item.rare) sfx.rare(); else sfx.pickup();
  drawBag(true);
}

/* Tap something in your bag and it goes on the floor where you
   are standing. */
function drop(index) {
  if (!state.scavenging) return;
  const item = findItem(state.inventory[index]);
  if (!item) return;
  state.inventory.splice(index, 1);
  putDown(state.heroRoom, heroSpot().x, item);
  state.lying.push(item.id);
  sfx.putDown();
  drawBag();
  const slot = ui.bag.children[Math.min(index, state.inventory.length)];
  const button = slot && slot.querySelector('button');
  if (button) button.focus({ preventScroll: true });
  else ui.done.focus({ preventScroll: true });
}

/* --- THE BAG ------------------------------------------------- */

function drawBag(bounce = false) {
  ui.bag.innerHTML = '';
  /* what you have got, and one empty space for the next thing */
  const show = Math.min(CARRY_LIMIT, state.inventory.length + 1);
  for (let i = 0; i < show; i += 1) {
    const slot = document.createElement('li');
    slot.className = 'bag-slot';
    const item = findItem(state.inventory[i]);
    if (item) {
      slot.classList.add('is-full');
      if (item.rare) slot.classList.add('is-rare');
      if (bounce && i === state.inventory.length - 1) slot.classList.add('is-new');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bag-drop';
      btn.dataset.item = item.id;
      btn.title = `Drop the ${item.name} here`;
      btn.setAttribute('aria-label', `${item.name}. Tap to drop it here.`);
      btn.append(itemPicture(item));
      const label = document.createElement('span');
      label.className = 'bag-name';
      label.textContent = item.name;
      btn.append(label);
      btn.addEventListener('click', () => drop(i));
      slot.append(btn);
    } else {
      slot.setAttribute('aria-label', 'Empty');
    }
    ui.bag.append(slot);
  }
  ui.count.textContent = `${state.inventory.length} of ${CARRY_LIMIT}`;
  ui.bag.classList.toggle('is-full', state.inventory.length >= CARRY_LIMIT);
}

/* A wobble on the bag so you look at it. */
function flashBag() {
  ui.bag.classList.remove('is-shouting');
  void ui.bag.offsetWidth;
  ui.bag.classList.add('is-shouting');
}

/* The notes you have found, under your bag. */
function showNotes() {
  ui.notes.hidden = !state.notes.length;
  ui.notes.textContent = state.notes.includes('safe') ? `Dad's note: "${noteText()}"` : '';
}

/* --- THE LOCKS ----------------------------------------------- */

/* A locked room (the shed, the dark cellar) opens and you walk
   straight in. */
function unlocked(lock) {
  refreshLocks();
  const room = ROOMS.find((r) => r.lock === lock);
  if (room) { walkTo(room.id); return; }
  /* a cupboard or a safe: grab what is inside straight away, once
     the puzzle box has closed */
  setTimeout(() => { if (state.scavenging) searchLocked(lock); }, 1300);
}

const gate = {
  isLocked,
  onLocked: (lock) => {
    if (!state.scavenging) return;
    showClockMode(clockMode());
    openPuzzle(lock, unlocked);
  }
};

/* --- THE CLOCK ----------------------------------------------- */

function showTime() {
  const t = Math.max(0, state.timeLeft);
  ui.time.textContent = state.untimed ? 'No clock' : `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  ui.clock.classList.toggle('is-untimed', state.untimed);
  ui.clock.classList.toggle('is-urgent', !state.untimed && t <= 10);
  /* the time sits over the house too, so it never scrolls away */
  const mini = document.getElementById('hud-clock');
  if (mini) {
    mini.hidden = state.untimed || state.phase !== 'scavenge';
    mini.textContent = ui.time.textContent;
    mini.classList.toggle('is-urgent', t <= 10);
  }
  showPuzzleTime();
}

/* What the clock does while a puzzle is open (data/difficulty.js). */
function clockMode() {
  const level = DIFFICULTY.find((d) => d.id === state.difficulty);
  return (level && level.puzzleClock) || 'run';
}

let halfTick = false;
function tick() {
  if (puzzleOpen()) {
    const mode = clockMode();
    if (mode === 'stop') return;
    if (mode === 'slow') {
      halfTick = !halfTick;
      if (halfTick) return;
    }
  }
  /* Easy: walking does not use up your time */
  const level = DIFFICULTY.find((d) => d.id === state.difficulty);
  if (state.walking && level && level.walkClock === 'stop') return;
  state.timeLeft -= 1;
  showTime();
  if (state.timeLeft <= 10 && state.timeLeft > 0) sfx.tick();
  if (state.timeLeft <= 0) finish('time');
}

function finish(why) {
  if (!state.scavenging) return;
  state.scavenging = false;
  clearInterval(clock);
  clock = null;
  closePuzzle();
  stopWalking();
  if (why === 'time') sfx.timeUp();
  const n = state.inventory.length;
  ui.endText.textContent = (why === 'time' ? 'Time is up! ' : 'Done! ') +
    (n === 0 ? 'You did not grab a thing.' : `You grabbed ${n} ${n === 1 ? 'thing' : 'things'}.`);
  ui.end.hidden = false;
  ui.done.hidden = true;
  ui.bag.querySelectorAll('button').forEach((b) => { b.disabled = true; });
  ui.toWorkshop.focus({ preventScroll: true });
}

/* Stop the clock and go to the workbench. You can come back. */
function pause() {
  if (!state.scavenging) return;
  sfx.select();
  stopNight();
  setPhase('workshop');
}

/* --- START AND STOP ------------------------------------------ */

export function setupScavenge(els) {
  Object.assign(ui, els);
  setLookHandler(look);
  setLockGate(gate);
  setGate({
    closed: (roomId) => (state.closed || []).includes(roomId),
    blocked: (roomId) => Boolean(lockedRoom(roomId)),
    onBlocked: (roomId) => gate.onLocked(lockedRoom(roomId))
  });
  ui.done.addEventListener('click', pause);
  /* a hint costs time, so show the new time straight away */
  setPuzzleTimeListener(() => {
    showTime();
    if (!state.untimed && state.timeLeft <= 0) finish('time');
  });
  ui.toWorkshop.addEventListener('click', () => setPhase('workshop'));
}

/* The scavenge starts, or carries on if you paused it to go to
   the workbench and still have time left. */
export function startNight() {
  stopNight();
  if (state.scavengeBegun && (state.untimed || state.timeLeft > 0)) { carryOn(); return; }
  const level = DIFFICULTY.find((d) => d.id === state.difficulty) || DIFFICULTY[0];
  state.inventory = [];
  state.hidden = {};
  state.lying = [];
  state.timeLeft = level.seconds;
  state.untimed = !level.seconds;
  state.closed = shutTonight();
  setClosedRooms(state.closed);
  state.scavenging = true;
  state.scavengeBegun = true;
  newPuzzles();
  refreshLocks();
  scatter();
  ui.bar.hidden = false;
  ui.clock.hidden = false;
  ui.done.hidden = false;
  ui.end.hidden = true;
  drawBag();
  showNotes();
  showTime();
  startHero();
  if (!state.untimed) clock = setInterval(tick, 1000);
}

/* Back out of the workshop: same junk, same locks, same bag, and
   the clock carries on from where it stopped. */
function carryOn() {
  state.scavenging = true;
  setClosedRooms(state.closed || []);
  refreshLocks();
  ui.bar.hidden = false;
  ui.clock.hidden = false;
  ui.done.hidden = false;
  ui.end.hidden = true;
  drawBag();
  showNotes();
  showTime();
  startHero(state.heroRoom || undefined);
  if (!state.untimed) clock = setInterval(tick, 1000);
}

export function stopNight() {
  clearInterval(clock);
  clock = null;
  state.scavenging = false;
  closePuzzle();
}

export function hideScavenge() {
  stopNight();
  hideHero();
  ui.bar.hidden = true;
  ui.end.hidden = true;
}
