/* ===========================================================
   NIGHT: the zombies come, you run about, then the sun comes up

   The night is a loop: every frame, move the zombies, move the
   hero, move the sun across the bar. When the clock runs out
   (or there is nobody left to cure) it is dawn: everyone left
   goes home and the result screen comes up.
   =========================================================== */

import { state } from './state.js';
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

let raf = 0;
let last = 0;
let onDawn = null;
let dawnTimer = 0;

export function startNight(whenDone) {
  onDawn = whenDone;
  state.phase = 'night';
  state.time = 0;
  state.taken = [];
  state.curedTonight = 0;
  state.gasAt = null;
  document.getElementById('stage').classList.add('is-night');
  document.getElementById('help').innerHTML = '<kbd>WASD</kbd> run. <kbd>Space</kbd> whack. <kbd>E</kbd> potion. Press and drag from the catapult to aim.';
  sendToBed();
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
  const dt = Math.min(0.05, (now - last) / 1000) * (window.ZOMBIES.fast || 1);
  last = now;
  const diff = DIFFICULTY[state.mode];
  if (state.phase === 'night') {
    state.time += dt;
    updateZombies(dt);
    hero.update(dt);
    catapult.update(dt);
    if (state.gasAt) state.gasAt.t -= dt;
    walkHome(dt);
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
    const dx = 12 - v.x, dy = 9 - v.y, d = Math.hypot(dx, dy);
    if (d < 0.3) { v.walkHome = false; v.el.classList.remove('walking'); return; }
    v.el.classList.add('walking');
    v.x += dx / d * 2.5 * dt; v.y += dy / d * 2.5 * dt;
    drawVillager(v);
  });
}

function dawn() {
  state.phase = 'dawn';
  document.getElementById('stage').classList.remove('is-night');
  catapult.cancelAim();
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

export function stopNight() {
  cancelAnimationFrame(raf);
  clearZombies();
}

// mouse and touch during the night
export function nightDown(ev) {
  const p = pointToTile(ev);
  const t = thingAt(p.col, p.row);
  if (t && t.does === 'catapult') {
    if (!t.crewMember || !state.villagers.includes(t.crewMember)) { banner('needs a villager', 1200); return; }
    catapult.startAim(t);
    return;
  }
  // throw potion at a zombie you click, if close, else run there
  if (state.potion > 0 && state.zombies.some((z) => Math.hypot(z.x - p.x, z.y - p.y) < 1 && Math.hypot(z.x - state.hero.x, z.y - state.hero.y) < 3.5)) {
    hero.throwPotion(p);
    drawCounts();
    return;
  }
  if (state.zombies.some((z) => Math.hypot(z.x - p.x, z.y - p.y) < 1 && Math.hypot(z.x - state.hero.x, z.y - state.hero.y) < 1.4)) {
    hero.whack();
    return;
  }
  hero.runTo(p.x, p.y);
}

export function nightMove(ev) { if (catapult.isAiming()) catapult.moveAim(pointToTile(ev)); }
export function nightUp() { if (catapult.isAiming()) { catapult.fire(); drawCounts(); } }

export function checkWin() { return state.villagers.length >= WIN_AT; }
