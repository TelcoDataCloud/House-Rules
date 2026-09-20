/* ===========================================================
   SCAVENGE - phase 1: raid your own house before the clock
   runs out

   At the start of every night this file:
     1. picks which rare things turn up tonight
     2. leaves a few common things lying about in plain sight
     3. hides everything else in the hiding places
     4. starts the clock

   Every night is shuffled differently, so you cannot learn
   where things are. You CAN learn which rooms are worth it.

   The rules (how many, how big your bag is, where rare things
   go) all live in data/items.js. The clock lives in
   data/difficulty.js. This file just follows them.
   =========================================================== */

import { state, setPhase } from './state.js';
import { ITEMS, CARRY_LIMIT, OUT_IN_THE_OPEN, RARE_EACH_NIGHT, RARE_HIDEOUTS } from '../data/items.js';
import { ROOMS } from '../data/rooms.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { placeLooseItem, setLookHandler, hidingPlaces } from './house.js';
import { itemPicture } from './item-art.js';
import { sfx } from './audio.js';
import { startHero, stopWalking, hideHero } from './hero.js';

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

/* --- SETTING THE HOUSE UP ------------------------------------ */

function scatter() {
  const common = shuffle(ITEMS.filter((item) => !item.rare));
  const rare = shuffle(ITEMS.filter((item) => item.rare)).slice(0, RARE_EACH_NIGHT);

  /* A few common things left lying about. */
  const places = shuffle(ROOMS.flatMap((room) =>
    (room.inTheOpen || []).map((place) => ({ room: room.id, place }))));
  const lying = common.slice(0, Math.min(OUT_IN_THE_OPEN, places.length));
  lying.forEach((item, i) => {
    placeLooseItem(places[i].room, places[i].place, item);
    state.lying.push(item.id);
  });

  /* Rare things first, into the awkward places. */
  let free = shuffle(hidingPlaces());
  rare.forEach((item) => {
    const spot = free.find((s) => RARE_HIDEOUTS.includes(s.room) || RARE_HIDEOUTS.includes(s.id));
    if (!spot) return;
    state.hidden[spot.id] = item.id;
    free = free.filter((s) => s !== spot);
  });

  /* Everything else goes wherever is left. */
  common.slice(lying.length).forEach((item, i) => {
    if (free[i]) state.hidden[free[i].id] = item.id;
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
      return { blocked: true, message: `Your bag is full. You can only carry ${CARRY_LIMIT} things.` };
    }
    take(item);
    state.lying = state.lying.filter((id) => id !== item.id);
    return { item, message: `Got it: ${item.name}!` };
  }

  const itemId = state.hidden[spot.id];
  if (!itemId) {
    sfx.rummage();
    return { message: `${spot.name}. Nothing in here.` };
  }
  const item = findItem(itemId);
  if (full) {
    sfx.full();
    return { blocked: true, message: `There is something in here, but your bag is full.` };
  }
  delete state.hidden[spot.id];
  take(item);
  return {
    item,
    message: item.rare
      ? `${spot.name}: ${item.name}! That is a rare one.`
      : `${spot.name}: ${item.name}!`
  };
}

function take(item) {
  state.inventory.push(item.id);
  if (item.rare) sfx.rare(); else sfx.pickup();
  drawBag(true);
}

/* --- THE BAG ------------------------------------------------- */

function drawBag(bounce = false) {
  ui.bag.innerHTML = '';
  for (let i = 0; i < CARRY_LIMIT; i += 1) {
    const slot = document.createElement('li');
    slot.className = 'bag-slot';
    const item = findItem(state.inventory[i]);
    if (item) {
      slot.classList.add('is-full');
      if (item.rare) slot.classList.add('is-rare');
      if (bounce && i === state.inventory.length - 1) slot.classList.add('is-new');
      slot.append(itemPicture(item));
      const label = document.createElement('span');
      label.className = 'bag-name';
      label.textContent = item.name;
      slot.append(label);
    } else {
      slot.setAttribute('aria-label', 'Empty');
    }
    ui.bag.append(slot);
  }
  ui.count.textContent = `${state.inventory.length} of ${CARRY_LIMIT}`;
}

/* --- THE CLOCK ----------------------------------------------- */

function showTime() {
  const t = Math.max(0, state.timeLeft);
  ui.time.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  ui.clock.classList.toggle('is-urgent', t <= 10);
}

function tick() {
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
  stopWalking();
  if (why === 'time') sfx.timeUp();
  const n = state.inventory.length;
  ui.endText.textContent = (why === 'time' ? 'Time is up! ' : 'Done! ') +
    (n === 0 ? 'You did not grab a thing.' : `You grabbed ${n} ${n === 1 ? 'thing' : 'things'}.`);
  ui.end.hidden = false;
  ui.done.hidden = true;
  ui.toWorkshop.focus({ preventScroll: true });
}

/* --- START AND STOP ------------------------------------------ */

export function setupScavenge(els) {
  Object.assign(ui, els);
  setLookHandler(look);
  ui.done.addEventListener('click', () => finish('done'));
  ui.toWorkshop.addEventListener('click', () => setPhase('workshop'));
}

export function startNight() {
  stopNight();
  const level = DIFFICULTY.find((d) => d.id === state.difficulty);
  state.inventory = [];
  state.hidden = {};
  state.lying = [];
  state.timeLeft = level.seconds;
  state.scavenging = true;
  scatter();
  ui.bar.hidden = false;
  ui.clock.hidden = false;
  ui.done.hidden = false;
  ui.end.hidden = true;
  drawBag();
  showTime();
  startHero();
  clock = setInterval(tick, 1000);
}

export function stopNight() {
  clearInterval(clock);
  clock = null;
  state.scavenging = false;
}

export function hideScavenge() {
  stopNight();
  hideHero();
  ui.bar.hidden = true;
  ui.end.hidden = true;
}
