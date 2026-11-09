/* ===========================================================
   NIGHT: the zombies come, you run about, then the sun comes up

   The night is a loop: every frame, move the zombies, move the
   hero, move the sun across the bar. When the clock runs out
   (or there is nobody left to cure) it is dawn: everyone left
   goes home and the result screen comes up.
   =========================================================== */

import { state, CENTRE } from './state.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { LINES } from '../data/lines.js';
import { WIN_AT } from '../data/villagers.js';
import { pointToTile, thingAt } from './grid.js';
import { drawCounts, drawDay, drawSun, banner } from './hud.js';
import { sendToBed, draw as drawVillager } from './villagers.js';
import { spawnHorde, updateZombies, sendHome, clearZombies } from './zombies.js';
import * as hero from './hero.js';
import * as catapult from './catapult.js';
import { icon } from './art.js';
import { say, blip } from './voice.js';
import { getPlan } from './day.js';
import { ringBell } from './hard.js';
import { updateCombat, clearCombat, holdDown, holdUp, swing } from './combat.js';
import { startFolkNight, updateFolkNight, endFolkNight, pyjamaArmy } from './folk.js';
import { setDrums } from './voice.js';

let raf = 0;
let last = 0;
let paused = false;
let onDawn = null;
let dawnTimer = 0;

export function startNight(whenDone) {
  onDawn = whenDone;
  state.phase = 'night';
  state.time = 0;
  state.taken = [];
  state.curedTonight = 0;
  state.joined = [];
  state.socksTonight = 0;
  clearCombat();
  state.gasAt = null;
  state.brokeTonight = 0;
  document.getElementById('stage').classList.add('is-night');
  const hasCatapult = [...state.things.values()].some((t) => t.does === 'catapult');
  const hasBell = [...state.things.values()].some((t) => t.does === 'bell');
  document.getElementById('help').innerHTML = 'Tap to run. <b>WHACK</b> stuns. <b>POTION</b> cures.'
    + (hasCatapult ? ' Press and drag from the catapult to aim.' : '') + (hasBell ? ' <kbd>B</kbd> rings the bell.' : '');
  paused = false;
  sendToBed();
  startFolkNight();
  hero.makeHero();
  spawnHorde(getPlan());
  ammoBar();
  drawDay();
  drawCounts();
  banner(LINES.nightTitle.replace('{n}', state.night));
  say('night falls');
  blip('groan');
  last = performance.now();
  dawnTimer = 0;
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(tick);
}

export function wireNightButtons() {
  // press and hold WHACK to charge a spin; a quick press is a normal whack
  const wb = document.getElementById('btn-whack');
  wb.addEventListener('pointerdown', (e) => { e.preventDefault(); if (state.phase === 'night') holdDown(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => wb.addEventListener(ev, () => { if (state.phase === 'night') holdUp(); }));
  wb.addEventListener('keydown', (e) => { if (e.key === 'Enter') swing(false); });
  document.getElementById('btn-pillow').addEventListener('click', (e) => { e.currentTarget.blur(); pyjamaArmy(); });
  document.getElementById('btn-potion').addEventListener('click', (e) => { e.currentTarget.blur(); if (state.phase === 'night') { hero.throwPotion(); drawCounts(); } });
}

// At night the build bar turns into the ammo picker
function ammoBar() {
  const bar = document.getElementById('bar');
  const has = [...state.things.values()].some((t) => t.does === 'catapult');
  bar.hidden = !has;
  if (!has) return;
  bar.innerHTML = '';
  ['pumpkin', 'potion'].forEach((kind) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'thing'; b.dataset.ammo = kind;
    b.setAttribute('aria-pressed', catapult.ammo === kind ? 'true' : 'false');
    b.innerHTML = `${icon(kind === 'potion' ? 'bucket' : 'pumpkin', 44)}<span>${kind === 'potion' ? 'Potion shot' : 'Pumpkin shot'}</span>`;
    b.addEventListener('click', () => {
      catapult.setAmmo(kind);
      document.querySelectorAll('#bar .thing').forEach((x) => x.setAttribute('aria-pressed', x.dataset.ammo === kind ? 'true' : 'false'));
    });
    bar.appendChild(b);
  });
}

function tick(now) {
  if (paused) { last = now; raf = requestAnimationFrame(tick); return; }
  let dt = Math.min(0.05, (now - last) / 1000) * (window.ZOMBIES.fast || 1);
  last = now;
  // hit stop: the world freezes for a blink when a whack lands
  if (state.hitStop > 0) { state.hitStop -= dt / (window.ZOMBIES.fast || 1); raf = requestAnimationFrame(tick); return; }
  const diff = DIFFICULTY[state.mode];
  if (state.phase === 'night') {
    state.time += dt;
    updateZombies(dt);
    hero.update(dt);
    updateCombat(dt);
    catapult.update(dt);
    catapult.autoFire(dt);
    if (state.gasAt) state.gasAt.t -= dt;
    walkHome(dt);
    updateFolkNight(dt);
    // the drums get louder the more zombies are up and about
    if (Math.floor(state.time) !== Math.floor(state.time - dt)) setDrums(state.zombies.filter((z) => !z.pit && !z.leaving && !(z.wait > 0)).length / 10);
    drawSun(state.time / diff.nightSeconds);
    if (Math.floor(state.time * 2) !== Math.floor((state.time - dt) * 2)) drawCounts();
    const anyLeft = state.zombies.some((z) => !z.pit && !z.leaving);
    if (state.time >= diff.nightSeconds || !anyLeft) dawn();
  } else if (state.phase === 'dawn') {
    updateZombies(dt);
    walkHome(dt);
    dawnTimer += dt;
    if (dawnTimer > 5) { finish(); return; }
  }
  raf = requestAnimationFrame(tick);
}

// Cured villagers walk to the middle of the village
function walkHome(dt) {
  state.villagers.forEach((v) => {
    if (!v.walkHome) return;
    const home = v.home || CENTRE;
    const dx = home.x - v.x, dy = home.y - v.y, d = Math.hypot(dx, dy);
    if (d < 0.3) { v.walkHome = false; v.el.classList.remove('walking'); return; }
    v.el.classList.add('walking');
    v.x += dx / d * 2.5 * dt; v.y += dy / d * 2.5 * dt;
    drawVillager(v);
  });
}

function dawn() {
  state.phase = 'dawn';
  (state.dropped || []).forEach((d) => { d.t = Math.min(d.t, 2); });
  document.getElementById('stage').classList.remove('is-night');
  catapult.cancelAim();
  endFolkNight();
  sendHome();
  banner('DAWN');
  say(LINES.dawn);
  blip('yawn');
}

function finish() {
  cancelAnimationFrame(raf);
  // zombies still walking off vanish now, pits keep theirs
  state.zombies.filter((z) => !z.pit).forEach((z) => z.el.remove());
  state.zombies = state.zombies.filter((z) => z.pit);
  document.getElementById('down-timer').hidden = true;
  if (onDawn) onDawn();
}

export function pauseNight(on) {
  paused = on;
  document.getElementById('screen-pause').hidden = !on;
  if (on && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function isPaused() { return paused; }

export function stopNight() {
  paused = false;
  clearCombat();
  endFolkNight();
  document.getElementById('screen-pause').hidden = true;
  cancelAnimationFrame(raf);
  clearZombies();
}

// mouse and touch during the night
// Finger or mouse goes down: on the catapult it starts an aim and the
// camera hands every move to us until the finger lifts ('hold').
export function nightDown(ev) {
  const p = pointToTile(ev);
  const t = thingAt(p.col, p.row);
  if (t && t.does === 'catapult') {
    if (!t.crewMember || !state.villagers.includes(t.crewMember)) { banner('needs a villager', 1200); return; }
    if (catapult.startAim(t)) return 'hold';
  }
  return undefined;
}

// A real tap (no drag): ring a bell, whack a zombie in reach, run
// toward a zombie out of reach, or run to the square. Never potion.
export function nightTap(ev) {
  const p = pointToTile(ev);
  const t = thingAt(p.col, p.row);
  if (t && t.does === 'bell') { ringBell(t); return; }
  const z = state.zombies.find((o) => !o.pit && Math.hypot(o.x - p.x, o.y - p.y) < 1);
  if (z) {
    if (Math.hypot(z.x - state.hero.x, z.y - state.hero.y) < 1.6) hero.whack();
    else hero.runTo(z.x, z.y);
    return;
  }
  hero.runTo(p.x, p.y);
}

export function nightMove(ev) { if (catapult.isAiming()) catapult.moveAim(pointToTile(ev)); }
export function nightUp() { if (catapult.isAiming()) { catapult.fire(); drawCounts(); } }

export function checkWin() { return state.villagers.length >= WIN_AT; }
