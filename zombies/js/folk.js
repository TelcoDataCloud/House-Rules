/* ===========================================================
   FOLK: villagers being people

   By day: tap one to chat, give a high five, buy them a hat with
   odd socks, or rename them. Each morning one of them may ask for
   something; do it and they cheer and work an extra trip. Now and
   then someone falls in the pond.

   At night: sleepers snore. A zombie munching on a villager makes
   them flail and scream; whack that zombie and they shout MY HERO. Villagers with no cottage throw socks at
   any zombie that comes close. And once a night the PYJAMA ARMY
   button sends everyone out with pillows.

   All the words, hats and numbers are in data/folk.js.
   =========================================================== */

import { state, TILE } from './state.js';
import { CHAT, PANIC, RESCUED, HATS, REQUESTS, REQUEST_CHANCE, GOOFS, PILLOW, SOCK_THROW } from '../data/folk.js';
import { el } from './grid.js';
import { burst } from './fx.js';
import { blip, say, playMusic, voiceFor } from './voice.js';
import { draw as drawVillager } from './villagers.js';
import { banner, drawCounts, helpSay } from './hud.js';

const pick = (list) => list[Math.floor(Math.random() * list.length)];

// ---------- hats ----------
// Where each hat sits on the villager picture
const HAT_SPOT = {
  partyhat: { x: 8, y: -22, w: 26, h: 26 },
  tophat: { x: 7, y: -24, w: 28, h: 28 },
  crown: { x: 6, y: -20, w: 28, h: 24 },
  moustache: { x: 11, y: 6, w: 20, h: 12 },
};

export function drawWear(v) {
  if (v.wearEl) { v.wearEl.remove(); v.wearEl = null; }
  if (!v.wear) return;
  const s = HAT_SPOT[v.wear] || HAT_SPOT.partyhat;
  v.wearEl = el('use', { href: '#art-' + v.wear, x: s.x, y: s.y, width: s.w, height: s.h, class: 'wear' });
  v.el.querySelector('.body').appendChild(v.wearEl);
}

export function hatsFor() { return HATS; }

export function buyHat(v, id) {
  const hat = HATS.find((h) => h.id === id);
  if (!hat) return false;
  if ((state.socks || 0) < hat.socks) { helpSay(`The ${hat.name.toLowerCase()} costs ${hat.socks} odd socks. Whack zombies to find them.`); blip('nope', { volume: 0.5 }); return false; }
  state.socks -= hat.socks;
  v.wear = id;
  drawWear(v);
  burst(v.x, v.y - 1.2, 'LOOKING GOOD');
  blip('upgrade');
  happy(v);
  if (v.request && v.request.needs === 'hat') done(v);
  drawCounts();
  return true;
}

// ---------- chat, high fives, names ----------
export function chatLine(v) {
  return v.request ? v.request.ask : pick(CHAT);
}

export function highFive(v) {
  burst(v.x, v.y - 1.2, 'HIGH FIVE!');
  say(pick(['Yeah!', 'Woo!', 'Nice one!', 'Up top!']), true, voiceFor(v.name));
  blip('tap', { rate: 1.3 });
  blip('cheer', { volume: 0.4 });
  happy(v);
  if (v.request && v.request.needs === 'highfive') done(v);
}

export function rename(v, name) {
  const clean = String(name || '').replace(/[^A-Za-z0-9 '-]/g, '').trim().slice(0, 10);
  if (!clean) return false;
  v.name = clean;
  burst(v.x, v.y - 1.2, `I am ${clean}!`);
  return true;
}

function happy(v) {
  v.el.classList.remove('happy');
  void v.el.getBoundingClientRect();
  v.el.classList.add('happy');
  setTimeout(() => v.el.classList.remove('happy'), 1600);
}

// ---------- requests ----------
export function morningRequests() {
  state.villagers.forEach((v) => { v.request = null; drawAsk(v); });
  const who = state.villagers.filter((v) => v.job !== 'crew');
  if (!who.length || Math.random() > REQUEST_CHANCE) return;
  const v = pick(who);
  const options = REQUESTS.filter((r) => !(r.needs === 'hat' && v.wear));
  v.request = pick(options);
  drawAsk(v);
}

function drawAsk(v) {
  v.el.querySelector('.ask')?.remove();
  if (!v.request) return;
  const g = el('g', { class: 'ask' });
  g.appendChild(el('circle', { cx: 32, cy: -14, r: 9 }));
  const t = el('text', { x: 32, y: -9, 'text-anchor': 'middle' });
  t.textContent = '!';
  g.appendChild(t);
  v.el.appendChild(g);
}

// Something was built: does it answer anyone's request?
export function builtNear(thing) {
  state.villagers.forEach((v) => {
    if (!v.request || v.request.needs !== thing.kind || !v.home) return;
    if (Math.hypot(thing.col + 0.5 - v.home.x, thing.row + 0.5 - v.home.y) <= 2.6) done(v);
  });
}

function done(v) {
  v.request = null;
  drawAsk(v);
  burst(v.x, v.y - 1.4, 'YAY! THANK YOU!');
  say('Yay! Thank you!', false, voiceFor(v.name));
  blip('joined');
  happy(v);
  // an extra trip of work (potion makers give a sock instead, potion stays rare)
  if (['brewer', 'cow', 'pig'].includes(v.job)) { state.socks = (state.socks || 0) + 1; burst(v.x, v.y - 0.6, '+1 sock'); }
  else { v.trips = (v.trips || 0) + 1; state.tripsTotal = (state.tripsTotal || 0) + 1; burst(v.x, v.y - 0.6, '+1 trip'); }
  helpSay(`<b>${v.name}</b> is happy.`);
  drawCounts();
}

// ---------- the day's goof ----------
let goofAt = 0, goofed = false, dayClock = 0;
export function startFolkDay() { dayClock = 0; goofed = false; goofAt = 12 + Math.random() * 25; }

export function updateFolkDay(dt) {
  dayClock += dt;
  if (goofed || dayClock < goofAt) return;
  const idle = state.villagers.filter((v) => !v.task && v.job !== 'crew');
  if (!idle.length) return;
  goofed = true;
  const v = pick(idle);
  const g = pick(GOOFS);
  burst(v.x, v.y - 1.3, `${v.name} ${g.line}`);
  blip({ 'fell in the pond': 'splat', 'sneezed on a carrot': 'sneeze', 'tripped over nothing': 'slip', 'found an odd sock': 'coin' }[g.line] || 'boing');
  v.el.classList.add('goof');
  setTimeout(() => v.el.classList.remove('goof'), 1800);
  if (g.gives) { state[g.gives] = (state[g.gives] || 0) + 1; drawCounts(); }
}

// ---------- night ----------
let snoreT = 3, throwT = {};

export function startFolkNight() {
  snoreT = 3; throwT = {};
  state.pillowUsed = false;
  state.discoUntil = 0;
  state.villagers.forEach((v) => { v.panic = null; v.pillow = null; v.bedSpot = { x: v.x, y: v.y }; v.el.classList.remove('panic', 'pyjamas'); });
  drawPillowButton();
}

// A zombie started munching on this villager's head
export function panic(v, z) {
  if (!v || v.panic || v.taken) return;
  v.panic = { z, yell: 0 };
  v.el.classList.add('panic');
  const yell = pick(PANIC);
  burst(v.x, v.y - 1.2, yell);
  say(yell, false, voiceFor(v.name));
  blip('squeak');
}

// The hero whacked z: if z was after someone, they are saved
export function rescue(z) {
  if (!z.munch) return;
  const v = z.munch.v;
  if (!state.villagers.includes(v)) return;
  endPanic(v);
  burst(v.x, v.y - 1.4, pick(RESCUED));
  say(pick(RESCUED), true, voiceFor(v.name));
  blip('cheer');
  state.socks = (state.socks || 0) + 1;
  state.socksTonight = (state.socksTonight || 0) + 1;
  burst(v.x, v.y - 0.8, '+1 sock');
  state.villagers.filter((o) => o !== v && !o.taken && Math.hypot(o.x - v.x, o.y - v.y) < 6).slice(0, 3)
    .forEach((o, i) => setTimeout(() => burst(o.x, o.y - 1, pick(['YAY', 'HOORAY', 'WOO'])), 200 + i * 150));
  drawCounts();
}

function endPanic(v) {
  v.panic = null;
  v.el.classList.remove('panic');
}

export function updateFolkNight(dt) {
  // the disco ends: back to the night tune
  if (state.discoUntil && state.time > state.discoUntil) { state.discoUntil = 0; playMusic('night'); }

  state.villagers.forEach((v) => {
    if (v.taken) { if (v.panic) { v.panic = null; v.el.classList.remove('panic'); } return; }
    // being munched: flailing and screaming
    if (v.panic) {
      const z = v.panic.z;
      if (!state.zombies.includes(z) || !z.munch || z.munch.v !== v) { endPanic(v); return; }
      v.panic.yell -= dt;
      if (v.panic.yell <= 0) { v.panic.yell = 1.4; burst(v.x, v.y - 1.2, pick(PANIC)); }
      return;
    }
    if (v.pillow) { pillowStep(v, dt); return; }
    // no cottage: throw socks at anything close
    if (!v.bed) {
      throwT[v.id] = (throwT[v.id] ?? Math.random() * SOCK_THROW.every) - dt;
      if (throwT[v.id] > 0) return;
      throwT[v.id] = SOCK_THROW.every + Math.random();
      const z = nearestZombie(v, SOCK_THROW.reach);
      if (z) throwSock(v, z);
    }
  });

  // snoring
  snoreT -= dt;
  if (snoreT <= 0) {
    snoreT = 4 + Math.random() * 4;
    const asleep = state.villagers.filter((v) => v.bed && !v.panic && !v.pillow && !v.taken);
    if (asleep.length) {
      const v = pick(asleep);
      burst(v.x + 0.3, v.y - 1, pick(['Zzz', 'zzZZ', 'snrrk', 'Zzz mum']));
      if (Math.hypot(state.hero.x - v.x, state.hero.y - v.y) < 5) blip('snore');
    }
  }
}

function nearestZombie(v, reach) {
  let best = null, bd = reach;
  state.zombies.forEach((z) => {
    if (z.pit || z.leaving) return;
    const d = Math.hypot(z.x - v.x, z.y - v.y);
    if (d < bd) { bd = d; best = z; }
  });
  return best;
}

// A sock flies from the villager to the zombie, then BONK
function throwSock(v, z) {
  const s = el('use', { href: '#art-sock', width: 20, height: 20, class: 'thrown' });
  document.getElementById('fx').appendChild(s);
  const from = { x: v.x, y: v.y - 0.6 }, to = { x: z.x, y: z.y - 0.6 };
  const start = performance.now(), ms = 400;
  const fly = (now) => {
    const k = Math.min(1, (now - start) / ms);
    const x = from.x + (to.x - from.x) * k, y = from.y + (to.y - from.y) * k - Math.sin(k * Math.PI) * 0.8;
    s.setAttribute('x', x * TILE - 10); s.setAttribute('y', y * TILE - 10);
    if (k < 1) requestAnimationFrame(fly);
    else {
      s.remove();
      if (!state.zombies.includes(z) || z.pit) return;
      z.dizzy = Math.max(z.dizzy, SOCK_THROW.stun);
      burst(z.x, z.y - 0.7, pick(['BONK', 'EW SOCK', 'STINKY']));
      blip('tap');
    }
  };
  requestAnimationFrame(fly);
  burst(v.x, v.y - 1.1, 'take THAT');
}

// ---------- the pyjama army ----------
function drawPillowButton() {
  const b = document.getElementById('btn-pillow');
  if (!b) return;
  const ready = state.night >= PILLOW.from && state.villagers.some((v) => !v.taken);
  b.hidden = !ready;
  b.disabled = false;
  b.classList.remove('used');
}

export function pyjamaArmy() {
  if (state.phase !== 'night' || state.pillowUsed) { if (state.pillowUsed) banner('Everyone is too sleepy. Tomorrow!', 1500); return; }
  const army = state.villagers.filter((v) => !v.taken);
  if (!army.length) return;
  state.pillowUsed = true;
  const b = document.getElementById('btn-pillow');
  if (b) { b.disabled = true; b.classList.add('used'); }
  banner('PILLOW FIGHT!', 1800);
  say('pillow fight', true);
  blip('super');
  army.forEach((v) => {
    if (v.panic) endPanic(v);
    v.pillow = { t: PILLOW.seconds, bop: 0, home: v.bedSpot || { x: v.x, y: v.y }, back: false };
    v.el.classList.add('pyjamas');
    if (!v.el.querySelector('.pillow')) v.el.appendChild(el('use', { href: '#art-pillow', class: 'pillow', x: 18, y: -4, width: 24, height: 24 }));
  });
}

function pillowStep(v, dt) {
  const p = v.pillow;
  p.t -= dt;
  let goal;
  if (p.t > 0) {
    const z = nearestZombie(v, 9);
    goal = z ? { x: z.x, y: z.y } : p.home;
    p.bop -= dt;
    if (p.bop <= 0) {
      p.bop = 0.5;
      state.zombies.forEach((o) => {
        if (o.pit || o.leaving || Math.hypot(o.x - v.x, o.y - v.y) > PILLOW.reach) return;
        o.dizzy = Math.max(o.dizzy, PILLOW.stun);
        o.bedSince = 0;
        if (o.carrying) { o.carrying.taken = false; o.carrying = null; o.leaving = false; }
        const dx = o.x - v.x, dy = o.y - v.y, d = Math.hypot(dx, dy) || 1;
        o.flyX = dx / d * 1.5; o.flyY = dy / d * 1.5; o.flying = 0.3;
        burst(o.x, o.y - 0.7, pick(['BOP', 'FWUMP', 'FLUMP']));
        feathers(o.x, o.y);
        blip('cloth', { rate: 1.2 });
      });
    }
  } else {
    goal = p.home; p.back = true;
  }
  const dx = goal.x - v.x, dy = goal.y - v.y, d = Math.hypot(dx, dy);
  if (p.back && d < 0.2) {
    v.pillow = null; v.x = p.home.x; v.y = p.home.y;
    v.el.classList.remove('pyjamas');
    v.el.querySelector('.pillow')?.remove();
    drawVillager(v);
    return;
  }
  if (d > 0.5 || p.back) { const s = Math.min(d, 3.4 * dt); v.x += dx / d * s; v.y += dy / d * s; }
  v.el.classList.add('walking');
  drawVillager(v);
}

function feathers(x, y) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 4; i++) {
    const f = el('ellipse', { class: 'feather', cx: x * TILE + (Math.random() - 0.5) * 24, cy: (y - 0.6) * TILE + (Math.random() - 0.5) * 16, rx: 5, ry: 2.5 });
    f.style.setProperty('--dx', `${(Math.random() - 0.5) * 40}px`);
    document.getElementById('fx').appendChild(f);
    setTimeout(() => f.remove(), 1200);
  }
}

// Dawn: everyone back to normal
export function endFolkNight() {
  state.villagers.forEach((v) => {
    v.panic = null; v.pillow = null;
    v.el.classList.remove('panic', 'pyjamas', 'walking');
    v.el.querySelector('.pillow')?.remove();
  });
  const b = document.getElementById('btn-pillow');
  if (b) b.hidden = true;
}
