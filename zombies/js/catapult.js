/* ===========================================================
   CATAPULT: pull back, aim, let go

   Press and hold on the catapult, drag to where you want the
   shot to land, let go. A dotted arc shows the flight and a
   circle shows where it lands. Easy snaps the landing to the
   nearest zombie. Hard adds a bit of wind. Pumpkin blinds,
   potion cures (and costs a bucket).

   Autofire: a crewed catapult also lobs a pumpkin by itself at
   the nearest zombie in range, every "auto" seconds (data/traps.js),
   slower than aiming it yourself. Pumpkins only: it never spends
   your potion.
   =========================================================== */

import { state, TILE, COLS, ROWS } from './state.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { el } from './grid.js';
import { potionAt, pumpkinAt } from './traps.js';
import { cure } from './zombies.js';
import { burst } from './fx.js';
import { blip } from './voice.js';

export const RANGE = 10;      // squares
export const RELOAD = 2.5;    // seconds
const aim = { on: false, from: null, to: null, wind: 0 };
let reload = 0;
export let ammo = 'pumpkin';

export function setAmmo(kind) { ammo = kind; }

export function startAim(thing) {
  if (reload > 0) { burst(thing.col + 0.5, thing.row, 'loading'); return false; }
  aim.on = true;
  aim.from = thing;
  aim.to = { x: thing.col + 0.5, y: thing.row + 0.5 };
  aim.wind = DIFFICULTY[state.mode].aimAssist ? 0 : (Math.random() - 0.5) * 2;
  document.getElementById('stage').classList.add('aiming');
  return true;
}

export function moveAim(p) {
  if (!aim.on) return;
  const fx = aim.from.col + 0.5, fy = aim.from.row + 0.5;
  let dx = p.x - fx, dy = p.y - fy;
  const d = Math.hypot(dx, dy);
  if (d > RANGE) { dx *= RANGE / d; dy *= RANGE / d; }
  let tx = fx + dx, ty = fy + dy;
  if (DIFFICULTY[state.mode].aimAssist) {
    let best = null, bd = 2.5;
    state.zombies.forEach((z) => { const dd = Math.hypot(z.x - tx, z.y - ty); if (dd < bd) { bd = dd; best = z; } });
    if (best) { tx = best.x; ty = best.y; }
  }
  aim.to = { x: tx, y: ty };
  drawAim();
}

function drawAim() {
  const g = document.getElementById('aim');
  g.innerHTML = '';
  if (!aim.on) return;
  const fx = aim.from.col + 0.5, fy = aim.from.row + 0.5;
  const tx = aim.to.x + aim.wind, ty = aim.to.y;
  const mx = (fx + tx) / 2, my = Math.min(fy, ty) - 3;
  g.appendChild(el('path', { class: 'arc', d: `M${fx * TILE} ${fy * TILE} Q${mx * TILE} ${my * TILE} ${tx * TILE} ${ty * TILE}` }));
  const r = DIFFICULTY[state.mode].aimAssist ? 1.6 : 1.1;
  g.appendChild(el('circle', { class: 'landing', cx: tx * TILE, cy: ty * TILE, r: r * TILE }));
  if (aim.wind) {
    const w = el('text', { x: fx * TILE, y: (fy - 1.2) * TILE, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: 'var(--panel)' });
    w.textContent = (aim.wind > 0 ? 'wind >' : '< wind');
    g.appendChild(w);
  }
}

export function fire() {
  if (!aim.on) return;
  aim.on = false;
  document.getElementById('stage').classList.remove('aiming');
  document.getElementById('aim').innerHTML = '';
  const from = aim.from, to = { x: aim.to.x + aim.wind, y: aim.to.y };
  if (ammo === 'potion') {
    if (state.potion <= 0) { burst(from.col + 0.5, from.row, 'no potion'); return; }
    state.potion--;
  }
  reload = RELOAD;
  launch(from, to, ammo);
}

// Fling something from a catapult to a spot, along an arc
function launch(from, to, kind) {
  blip('thud');
  blip('whoosh', { volume: 0.7 });
  burst(from.col + 0.5, from.row, 'TWANG');
  const ammo = kind;
  // the shot flies along the same arc
  const shot = el('use', { class: 'shot', href: '#art-' + (ammo === 'potion' ? 'bucket' : 'pumpkin'), width: 30, height: 30 });
  document.getElementById('fx').appendChild(shot);
  const fx = from.col + 0.5, fy = from.row + 0.5;
  const mx = (fx + to.x) / 2, my = Math.min(fy, to.y) - 3;
  const start = performance.now();
  const dur = 900;
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const x = (1 - t) * (1 - t) * fx + 2 * (1 - t) * t * mx + t * t * to.x;
    const y = (1 - t) * (1 - t) * fy + 2 * (1 - t) * t * my + t * t * to.y;
    shot.setAttribute('x', x * TILE - 15); shot.setAttribute('y', y * TILE - 15);
    if (t < 1 && state.phase === 'night') requestAnimationFrame(step);
    else {
      shot.remove();
      if (state.phase !== 'night') return;
      if (ammo === 'potion') {
        const hit = potionAt(to.x, to.y, 1.3);
        hit.forEach((z) => cure(z));
        if (!hit.length) burst(to.x, to.y, 'miss');
      } else {
        pumpkinAt(to.x, to.y, 1.1);
      }
    }
  }
  requestAnimationFrame(step);
}

export function cancelAim() {
  aim.on = false;
  document.getElementById('stage').classList.remove('aiming');
  document.getElementById('aim').innerHTML = '';
}

export function update(dt) { if (reload > 0) reload -= dt; }
export function isAiming() { return aim.on; }

// Every frame: crewed catapults fire pumpkins by themselves, slowly
export function autoFire(dt) {
  for (const t of state.things.values()) {
    if (t.does !== 'catapult' || t.broken) continue;
    if (!t.crewMember || !state.villagers.includes(t.crewMember)) continue;
    if (aim.on && aim.from === t) continue;          // you are aiming it yourself
    t.autoT = (t.autoT ?? 2) - dt;
    if (t.autoT > 0) continue;
    const cx = t.col + 0.5, cy = t.row + 0.5;
    let best = null, bd = RANGE;
    state.zombies.forEach((z) => {
      if (z.pit || z.leaving || z.blind > 0) return;
      const d = Math.hypot(z.x - cx, z.y - cy);
      if (d < bd) { bd = d; best = z; }
    });
    if (!best) { t.autoT = 0.5; continue; }
    t.autoT = t.data.auto || 5;
    launch(t, { x: best.x + (Math.random() - 0.5) * 0.6, y: best.y + (Math.random() - 0.5) * 0.6 }, 'pumpkin');
  }
}
