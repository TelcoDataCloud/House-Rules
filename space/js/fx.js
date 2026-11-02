/* ===========================================================
   FX: the bangs, sparks, floating scores and big words

   Every effect is a little "particle": a thing with a place, a
   speed, and a life in seconds. Each frame they move, get older,
   and are drawn on the canvas. When their life is used up they
   are put back in a box to be used again (so the game never has
   to make thousands of new ones).

   Every kill gets the same beats: white flash, fireball with
   bits flying out, a puff of smoke, and the score floating up.
   =========================================================== */

import { state } from './state.js';
import { ctx, radial, outlinedText } from './canvas.js';
import { say } from './voice.js';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

const live = [];
const spare = [];

// Make a particle. kind says how it is drawn (see DRAW below).
export function add(kind, x, y, life, props = {}) {
  const p = spare.pop() || {};
  for (const k of Object.keys(p)) delete p[k];
  Object.assign(p, { kind, x, y, vx: 0, vy: 0, t: 0, life, size: 10, rot: 0, vr: 0, alpha: 1, layer: 1 }, props);
  live.push(p);
  return p;
}

export function updateFx(dt) {
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i];
    p.t += dt;
    if (p.t >= p.life) {
      live[i] = live[live.length - 1];
      live.pop();
      spare.push(p);
      continue;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.gravity) p.vy += p.gravity * dt;
    if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
    p.rot += p.vr * dt;
    if (p.tick) p.tick(p, dt);
  }
}

// layer 0 is drawn under the ships (scorch, ground smoke), 1 on top.
export function drawFx(layer = 1) {
  for (const p of live) {
    if ((p.layer ?? 1) !== layer) continue;
    const k = p.t / p.life;
    (p.draw || DRAW[p.kind])(p, k);
  }
}

export function clearFx() {
  while (live.length) spare.push(live.pop());
  const el = document.getElementById('banner');
  el.className = 'banner';
  el.textContent = '';
}

const easeOut = (k) => 1 - (1 - k) * (1 - k);

// How each kind of particle is drawn. k goes from 0 (new) to 1 (gone).
const DRAW = {
  // A fireball: white middle, yellow, orange, then nothing.
  boom(p, k) {
    const r = (p.size / 2) * (0.2 + 1.2 * easeOut(k));
    const a = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    radial(p.x, p.y, r * 1.5, [[0, 'rgba(255,170,60,0.5)'], [1, 'rgba(255,170,60,0)']], a * 0.6, 'lighter');
    radial(p.x, p.y, r, [[0, '#ffffff'], [0.17, '#ffd23f'], [0.42, '#ff7a1a'], [0.75, 'rgba(255,59,26,0.6)'], [1, 'rgba(255,59,26,0)']], a, 'lighter');
  },
  smoke(p, k) {
    const r = (p.size / 2) * (0.4 + 0.9 * k);
    radial(p.x, p.y - 12 * k, r, [[0, `rgba(${p.tint || '70,64,72'},0.75)`], [0.6, `rgba(${p.tint || '70,64,72'},0.35)`], [1, `rgba(${p.tint || '70,64,72'},0)`]], 0.9 * (1 - k));
  },
  shock(p, k) {
    const r = (p.size / 2) * (0.2 + 1.3 * easeOut(k));
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = p.colour || '#ffffff';
    ctx.lineWidth = p.width || 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
  bit(p, k) {
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.colour;
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  },
  spark(p, k) {
    radial(p.x, p.y, 9, [[0, '#ffffff'], [0.4, 'rgba(255,240,180,0.9)'], [1, 'rgba(255,200,80,0)']], 1 - k, 'lighter');
  },
  trail(p, k) {
    radial(p.x, p.y, 6 * (1 - 0.8 * k), [[0, '#ffffff'], [0.4, p.colour || '#ff3fa4'], [1, 'rgba(255,63,164,0)']], 0.9 * (1 - k), 'lighter');
  },
  puffGrey(p, k) {
    radial(p.x, p.y, 6 + 6 * k, [[0, 'rgba(200,200,210,0.55)'], [1, 'rgba(200,200,210,0)']], 1 - k);
  },
  float(p, k) {
    const a = k < 0.15 ? k / 0.15 : k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4;
    const rise = k < 0.15 ? 18 * (k / 0.15) : 18 + 52 * ((k - 0.15) / 0.85);
    const s = k < 0.15 ? 0.6 + 0.5 * (k / 0.15) : 1.1 - 0.1 * Math.min(1, (k - 0.15) * 4);
    outlinedText(p.text, p.x, p.y - rise, p.big ? 28 : 19, p.colour || '#ffd23f', a, s);
  },
  ring(p, k) {
    const r = 20 * (0.2 + 27.8 * easeOut(k));
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.strokeStyle = '#ffd23f';
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 30;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },
  // The pilot in a bubble, waving, floating away.
  pilot(p, k) {
    const x = p.x + 30 * k;
    const y = p.y - 260 * k;
    ctx.save();
    ctx.globalAlpha = 1 - k * k;
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(56,240,255,0.15)';
    ctx.strokeStyle = '#38f0ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.arc(0, -3, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#38f0ff';
    ctx.fillRect(-6, 4, 12, 9);
    ctx.strokeStyle = '#38f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(12, -1 + Math.sin(p.t * 12) * 3); ctx.stroke();
    ctx.restore();
  },
  // The railgun: a white-hot line straight up, gone in a blink.
  rail(p, k) {
    const w = p.size * (1.6 - 1.4 * k);
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(p.x - w / 2, 0, p.x + w / 2, 0);
    g.addColorStop(0, 'rgba(255,210,63,0)');
    g.addColorStop(0.2, '#ffd23f');
    g.addColorStop(0.4, '#ffffff');
    g.addColorStop(0.6, '#ffffff');
    g.addColorStop(0.8, '#ffd23f');
    g.addColorStop(1, 'rgba(255,210,63,0)');
    ctx.fillStyle = g;
    ctx.fillRect(p.x - w / 2, -20, w, p.y + 20);
    ctx.restore();
  },
  // Text-free picture particles: a bitmap that moves and turns.
  picture(p, k) {
    ctx.save();
    ctx.globalAlpha = p.fade ? 1 - k : 1;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.drawImage(p.img, -p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  },
};

const BIT_COLOURS = ['#ffd23f', '#ff7a1a', '#ffffff'];

// A fireball, a shock ring, smoke, and bits flying out of it.
// colour is the colour of the ship that went bang.
export function boom(x, y, size = 60, bits = 8, colour = '#ff7a1a') {
  add('smoke', x, y, 0.9, { size: size * 1.3 });
  add('boom', x, y, 0.52, { size });
  add('shock', x, y, 0.42, { size });
  for (let i = 0; i < bits; i++) {
    const a = (i / bits) * Math.PI * 2 + Math.random() * 0.7;
    const d = size * (0.7 + Math.random() * 0.8);
    add('bit', x, y, 0.76, {
      size: 4 + Math.random() * 7,
      vx: Math.cos(a) * d / 0.76, vy: Math.sin(a) * d / 0.76, drag: 2.5,
      vr: 6, colour: i % 2 ? colour : BIT_COLOURS[i % 3],
    });
  }
}

export function spark(x, y) {
  add('spark', x, y, 0.16);
}

// A little pink puff behind a homing missile.
export function trail(x, y) {
  add('trail', x, y, 0.32);
}

// A grey puff of smoke behind an enemy rocket.
export function smokePuff(x, y) {
  add('puffGrey', x, y, 0.5);
}

// The edge of a mine's bang, so you can see how far it reached.
export function mineRing(x, y, r) {
  add('shock', x, y, 0.45, { size: r * 2 / 1.5, colour: 'rgba(255,90,60,0.9)', width: 3 });
}

// Words that float up and fade, above where something was.
export function floatText(x, y, text, big = false) {
  const half = text.length * (big ? 8 : 5.5);
  add('float', Math.max(half + 4, Math.min(476 - half, x)), y, 1.1, { text, big });
}

// Add points to the score and show them floating up.
export function award(points, x, y) {
  if (!points) return;
  state.score += points;
  floatText(x, y, `+${points}`, points >= 1000);
}

export function bombRing(x, y) {
  add('ring', x, y, 0.75);
  flash();
  shake();
}

export function flash() {
  if (calm.matches) return;
  const el = document.createElement('div');
  el.className = 'flash';
  document.getElementById('field').appendChild(el);
  setTimeout(() => el.remove(), 380);
}

export function shake(big = false) {
  if (calm.matches) return;
  const field = document.getElementById('field');
  field.classList.remove('shake', 'shake-big');
  void field.offsetWidth;            // restart the animation
  field.classList.add(big ? 'shake-big' : 'shake');
}

// The pilot floats off in a bubble, waving. Nobody gets hurt.
export function pilot(x, y) {
  add('pilot', x, y, 2.4);
}

// The railgun: a bright line straight up from the nose.
export function rail(x, y, level = 1) {
  add('rail', x, y, 0.26, { size: 4 + level * 2 });
  add('shock', x, y, 0.26, { size: 26 + level * 4, colour: '#ffd23f', width: 3 });
}

// An enemy orb shot out of the air: a small pop.
export function pop(x, y, colour = 'pink') {
  add('shock', x, y, 0.42, { size: 26, colour: colour === 'green' ? '#4dff7c' : '#ff3fa4', width: 3 });
  add('boom', x, y, 0.52, { size: 18 });
}

// A puff of smoke (and fire, if hot) behind a falling boss piece.
export function puff(x, y, hot = true) {
  add('smoke', x, y, 0.9, { size: 40 });
  if (hot) add('boom', x, y, 0.52, { size: 26 });
}

let bannerTimer = 0;
export function banner(text, kind = '') {
  const el = document.getElementById('banner');
  el.textContent = text;
  el.className = 'banner';
  void el.offsetWidth;
  el.classList.add('show');
  if (text === 'WARNING') el.classList.add('warn');
  if (kind) el.classList.add(kind);
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => { el.className = 'banner'; }, 4200);
  say(text);
}

// For tests: how many particles are alive.
export function fxCount() {
  return live.length;
}
