/* ===========================================================
   FX - the slapstick

   When a trap goes off, this file makes it look good. Every
   payoff has the same beat, like a cartoon:

       trigger  ->  CHAOS  ->  the big word  ->  he reacts  ->
       he picks himself up and carries on (or runs)

   Which payoff a trap gets is its fx in data/recipes.js:
   slip, swing, drop, cloud, pour, stick, tangle, noise or flash.
   Its mess (flour, feathers, paint, honey, glitter, water) is
   what he is covered in afterwards, and it STAYS on him for the
   rest of the night. Its word is the big comic word.

   On top of the payoff, every hit gets the extras a cartoon would
   use: the house shakes, dust flies, sweat drops ping off his head,
   a little cloud of #@!% floats up, and afterwards he wobbles
   about dizzy for a moment before he walks straight again.

   All the moving is CSS animation in css/fx.css. This file just
   puts the shapes in place, adds the right class, and tidies up.
   If somebody has asked their computer for less motion, nothing
   flies about: the word, the mess and the stars still appear.
   =========================================================== */

import { PICTURE, ROOMS } from '../data/rooms.js';
import { ITEMS } from '../data/items.js';
import { TRAPS, UPGRADES } from '../data/recipes.js';
import { BODY } from './burglar-art.js';
import { drawItem } from './item-art.js';
import { sfx } from './audio.js';

const NS = 'http://www.w3.org/2000/svg';

function make(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (parent) parent.append(node);
  return node;
}

export function lessMotion() {
  return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/* A dice that always rolls the same numbers for the same seed, so
   a burglar's mess looks the same on the result screen as it did
   in the house. */
function dice(seed) {
  let n = seed * 9301 + 49297;
  return () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
}

/* Remove something after a while. */
function later(ms, fn) {
  return setTimeout(fn, ms);
}

/* --- THE MESS ------------------------------------------------
   Drawn INSIDE the burglar, so it walks about with him.
   ------------------------------------------------------------ */

export function addMess(body, look, mess, seed = 1) {
  if (!mess) return;
  /* two messes at once, like custard AND feathers */
  if (Array.isArray(mess)) {
    mess.forEach((one, i) => addMess(body, look, one, seed * 7 + i));
    return;
  }
  const shape = BODY[look] || BODY.sid;
  const roll = dice(seed);
  const g = make('g', { class: `coat coat-${mess}` }, body);
  const [hx, hy] = shape.head;
  const w = shape.half;
  const anywhere = () => [(roll() * 2 - 1) * w, shape.top + 6 + roll() * (-shape.top - 12)];
  const onHead = () => [hx + (roll() * 2 - 1) * 8, hy - 6 + roll() * 10];

  if (mess === 'flour') {
    make('path', { d: `M${hx - 10} ${hy - 4} Q${hx} ${hy - 18} ${hx + 11} ${hy - 4} Q${hx + 4} ${hy - 7} ${hx} ${hy - 3} Q${hx - 5} ${hy - 7} ${hx - 10} ${hy - 4} Z`, class: 'mess-fill' }, g);
    for (let i = 0; i < 16; i += 1) {
      const [x, y] = anywhere();
      make('circle', { cx: x, cy: y, r: 1.6 + roll() * 2.6, class: 'mess-fill' }, g);
    }
  } else if (mess === 'feathers') {
    for (let i = 0; i < 12; i += 1) {
      const [x, y] = i < 4 ? onHead() : anywhere();
      make('ellipse', { cx: 0, cy: 0, rx: 4, ry: 1.6, class: 'mess-fill feather', transform: `translate(${x} ${y}) rotate(${Math.round(roll() * 180)})` }, g);
    }
  } else if (mess === 'paint') {
    for (let i = 0; i < 5; i += 1) {
      const [x, y] = i < 3 ? onHead() : anywhere();
      const r = 2.5 + roll() * 3;
      make('path', { d: `M${x - r} ${y} Q${x - r} ${y - r} ${x} ${y - r} Q${x + r * 1.3} ${y - r} ${x + r} ${y} Q${x + r} ${y + r * 1.4} ${x} ${y + r} Q${x - r * 1.2} ${y + r} ${x - r} ${y} Z`, class: 'mess-fill' }, g);
    }
    make('path', { d: `M${hx - 3} ${hy} L${hx - 3} ${hy + 9} M${hx + 4} ${hy + 1} L${hx + 4} ${hy + 7}`, class: 'mess-drip' }, g);
  } else if (mess === 'paper') {
    /* wrapped like a mummy: strips of loo roll round and round */
    for (let i = 0; i < 6; i += 1) {
      const y = shape.top + 10 + i * ((-shape.top - 16) / 6) + roll() * 4;
      make('path', { d: `M${-w - 2} ${y} Q0 ${y + 5 + roll() * 3} ${w + 2} ${y - 2} L${w + 2} ${y + 2.5} Q0 ${y + 9} ${-w - 2} ${y + 3.5} Z`, class: 'mess-fill' }, g);
    }
    make('path', { d: `M${w} ${shape.top + 30} Q${w + 8} ${shape.top + 40} ${w + 4} ${shape.top + 52}`, class: 'mess-tail' }, g);
  } else if (mess === 'honey' || mess === 'water' || mess === 'custard') {
    make('path', { d: `M${hx - 10} ${hy - 6} Q${hx} ${hy - 16} ${hx + 11} ${hy - 6} L${hx + 11} ${hy - 2} Q${hx + 8} ${hy + 4} ${hx + 6} ${hy - 2} Q${hx + 2} ${hy + 8} ${hx - 2} ${hy - 1} Q${hx - 6} ${hy + 6} ${hx - 8} ${hy - 2} Z`, class: 'mess-fill' }, g);
    for (let i = 0; i < 7; i += 1) {
      const [x, y] = anywhere();
      const long = 3 + roll() * 6;
      make('path', { d: `M${x} ${y} L${x} ${y + long}`, class: 'mess-drip' }, g);
      make('circle', { cx: x, cy: y + long, r: 1.4, class: 'mess-fill' }, g);
    }
  } else if (mess === 'glitter') {
    for (let i = 0; i < 20; i += 1) {
      const [x, y] = i < 6 ? onHead() : anywhere();
      const s = 1 + roll() * 1.4;
      make('path', { d: `M${x} ${y - s * 2} L${x + s * 0.5} ${y - s * 0.5} L${x + s * 2} ${y} L${x + s * 0.5} ${y + s * 0.5} L${x} ${y + s * 2} L${x - s * 0.5} ${y + s * 0.5} L${x - s * 2} ${y} L${x - s * 0.5} ${y - s * 0.5} Z`, class: `glitter glitter-${i % 3}` }, g);
    }
  }
}

/* A trap's mess can be one thing or two. These pick one. */
function firstMess(trap, fallback) { return [].concat(trap.mess || fallback)[0]; }
function lastMess(trap, fallback) { const all = [].concat(trap.mess || fallback); return all[all.length - 1]; }

/* --- THE PIECES ---------------------------------------------- */

/* The big comic word, in a jagged burst. */
function word(layer, x, y, text) {
  const w = text.length * 13 + 36;
  const left = Math.max(w / 2 + 4, Math.min(PICTURE.w - w / 2 - 4, x));
  const at = make('g', { transform: `translate(${left} ${Math.max(28, y)})` }, layer);
  const pop = make('g', { class: 'fx-word' }, at);
  const pts = [];
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const r = i % 2 ? 0.72 : 1;
    pts.push(`${(Math.cos(a) * (w / 2) * r).toFixed(1)},${(Math.sin(a) * 24 * r).toFixed(1)}`);
  }
  make('polygon', { points: pts.join(' '), class: 'fx-word-back' }, pop);
  const t = make('text', { x: 0, y: 7, 'text-anchor': 'middle', class: 'fx-word-text' }, pop);
  t.textContent = text;
  return at;
}

/* Stars going round his head. */
function stars(layer, x, y, ms) {
  const at = make('g', { transform: `translate(${x} ${y})` }, layer);
  const spin = make('g', { class: 'fx-stars' }, at);
  [0, 120, 240].forEach((deg) => {
    const a = (deg * Math.PI) / 180;
    const sx = Math.cos(a) * 11;
    const sy = Math.sin(a) * 4;
    make('path', { d: `M${sx} ${sy - 3.5} L${sx + 1} ${sy - 1} L${sx + 3.5} ${sy} L${sx + 1} ${sy + 1} L${sx} ${sy + 3.5} L${sx - 1} ${sy + 1} L${sx - 3.5} ${sy} L${sx - 1} ${sy - 1} Z`, class: 'fx-star' }, spin);
  });
  later(ms, () => at.remove());
  return at;
}

function roomAround(x, y) {
  return ROOMS.find((r) => x >= r.x - 4 && x <= r.x + r.w + 4 && y - 6 >= r.y && y - 6 <= r.y + r.h);
}

/* --- THE PAYOFFS ---------------------------------------------
   Each one gets: the trap, the burglar (b), where his head is
   (hx, hy), the fx layer, and the anchor spot. It hands back
   how long it takes in milliseconds, and when the big hit lands.
   ------------------------------------------------------------ */

const PAYOFFS = {
  slip({ b, layer }) {
    b.fxg.classList.add('fx-slip');
    sfx.whistle();
    const skid = make('path', { d: `M${b.x - 18} ${b.y - 1} L${b.x + 22} ${b.y - 1} M${b.x - 10} ${b.y + 2} L${b.x + 16} ${b.y + 2}`, class: 'fx-skid' }, layer);
    later(3400, () => skid.remove());
    return { total: 3400, impact: 1000, starsAt: 1300, shake: true, dust: true, sweat: true };
  },

  swing({ b, layer, hx, hy, trap }) {
    const pivot = make('g', { transform: `translate(${hx} ${hy - 62})` }, layer);
    const arm = make('g', { class: 'fx-swinger', style: `--from: ${b.facing > 0 ? 80 : -80}deg` }, pivot);
    make('line', { x1: 0, y1: 0, x2: 0, y2: 52, class: 'fx-rope' }, arm);
    /* whatever the trap is made of swings on the end: the paint
       tin, the sack of flour, the rubber chicken */
    const swung = make('g', { transform: 'translate(-12 70) scale(1.5)' }, arm);
    drawItem(swungThing(trap), swung);
    later(800, () => b.fxg.classList.add('fx-knock'));
    later(3000, () => pivot.remove());
    return { total: 3000, impact: 800, starsAt: 1000, shake: true, dizzy: true };
  },

  drop({ b }) {
    /* the bucket goes INSIDE him, so it stays on his head while he
       staggers about blind */
    const [x, y] = (BODY[b.data.look] || BODY.sid).head;
    const at = make('g', { class: 'fx-on-him', transform: `translate(${x} ${y - 3})` }, b.fxg);
    const fall = make('g', { class: 'fx-dropper' }, at);
    make('path', { d: 'M-11 -10 L11 -10 L9 4 L-9 4 Z', class: 'fx-bucket' }, fall);
    make('path', { d: 'M-12 -10 L12 -10', class: 'fx-bucket-rim' }, fall);
    b.fxg.classList.add('fx-blind');
    later(3400, () => at.remove());
    return { total: 3400, impact: 600, starsAt: 800, shake: true, dust: true, dizzy: true };
  },

  cloud({ b, layer, trap }) {
    const at = make('g', { transform: `translate(${b.x} ${b.y - 40})` }, layer);
    const roll = dice(Math.round(b.x));
    for (let i = 0; i < 14; i += 1) {
      const x = (roll() * 2 - 1) * 30;
      const y = (roll() * 2 - 1) * 34;
      const kind = i % 2 ? lastMess(trap, 'flour') : firstMess(trap, 'flour');
      const puff = kind === 'feathers'
        ? make('ellipse', { cx: x, cy: y, rx: 6, ry: 2.4, transform: `rotate(${Math.round(roll() * 180)} ${x} ${y})` }, at)
        : make('circle', { cx: x, cy: y, r: 7 + roll() * 9 }, at);
      puff.setAttribute('class', `fx-puff mess-${kind}`);
      puff.style.animationDelay = `${Math.round(roll() * 350)}ms`;
    }
    b.fxg.classList.add('fx-shake');
    later(2800, () => at.remove());
    return { total: 2800, impact: 300, sweat: true };
  },

  pour({ b, layer, hx, hy, anchor, trap }) {
    const top = Math.min(hy - 50, anchor.y);
    const at = make('g', {}, layer);
    const stream = make('rect', { x: hx - 5, y: top, width: 10, height: hy - top, rx: 4, class: `fx-stream mess-${firstMess(trap, 'water')}` }, at);
    stream.style.transformOrigin = `${hx}px ${top}px`;
    for (let i = 0; i < 5; i += 1) {
      const d = make('circle', { cx: hx + (i - 2) * 6, cy: hy - 2, r: 2.4, class: `fx-splash mess-${firstMess(trap, 'water')}` }, at);
      d.style.animationDelay = `${500 + i * 60}ms`;
    }
    b.fxg.classList.add('fx-squash');
    later(3000, () => at.remove());
    return { total: 3000, impact: 600, dizzy: true };
  },

  stick({ b, layer, trap }) {
    const puddle = make('ellipse', { cx: b.x, cy: b.y, rx: 24, ry: 4, class: `fx-puddle mess-${firstMess(trap, 'honey')}` }, layer);
    b.fxg.classList.add('fx-wobble');
    later(3200, () => puddle.remove());
    later(400, () => sfx.boing());
    later(1500, () => sfx.boing());
    return { total: 3200, impact: 300, sweat: true };
  },

  tangle({ b, layer }) {
    const at = make('g', {}, layer);
    const lines = [[-58, -40], [-46, -20], [-30, -54], [-14, -6], [-66, -28]];
    lines.forEach(([y1, y2], i) => {
      const p = make('path', { d: `M${b.x - 26} ${b.y + y1} Q${b.x} ${b.y + (y1 + y2) / 2 - 6} ${b.x + 26} ${b.y + y2}`, class: 'fx-tape' }, at);
      p.style.animationDelay = `${i * 70}ms`;
    });
    b.fxg.classList.add('fx-wiggle');
    later(3000, () => at.remove());
    return { total: 3000, impact: 300, sweat: true };
  },

  noise({ b, layer, anchor }) {
    const at = make('g', { transform: `translate(${anchor.x} ${anchor.y})` }, layer);
    [0, 1, 2].forEach((i) => {
      const ring = make('circle', { cx: 0, cy: 0, r: 14, class: 'fx-ring' }, at);
      ring.style.animationDelay = `${i * 220}ms`;
    });
    b.fxg.classList.add('fx-jump');
    later(2800, () => at.remove());
    return { total: 2800, impact: 200, shake: true, sweat: true, dust: true };
  },

  flash({ b, layer }) {
    const room = roomAround(b.x, b.y);
    const at = make('g', {}, layer);
    if (room) make('rect', { x: room.x, y: room.y, width: room.w, height: room.h, class: 'fx-strobe' }, at);
    b.fxg.classList.add('fx-spin');
    later(2600, () => at.remove());
    return { total: 2600, impact: 200, starsAt: 1500, dizzy: true };
  }
};

const ALL_CLASSES = ['fx-slip', 'fx-knock', 'fx-squash', 'fx-blind', 'fx-shake', 'fx-wobble', 'fx-wiggle', 'fx-jump', 'fx-spin', 'fx-dizzy', 'fx-windup'];

/* --- THE EXTRAS -----------------------------------------------
   Little things every cartoon does when somebody gets got.
   ------------------------------------------------------------ */

/* What a trap is made of, all the way down. */
function ingredients(trap) {
  const all = [...TRAPS, ...UPGRADES];
  return trap.needs.flatMap((id) => {
    const inner = all.find((t) => t.id === id);
    return inner ? ingredients(inner) : [id];
  });
}

/* The thing on the end of the rope: not the rope, the other bit. */
function swungThing(trap) {
  const hangers = ['rope', 'string', 'duct-tape', 'hair-dryer'];
  const id = ingredients(trap).find((one) => !hangers.includes(one)) || 'paint-tin';
  return ITEMS.find((item) => item.id === id) || { look: 'tin' };
}

/* The whole house gives a jolt, like the camera got knocked. */
function shakeHouse() {
  const scene = document.querySelector('.house-scene');
  if (!scene) return;
  scene.classList.remove('is-shaking');
  void scene.offsetWidth;
  scene.classList.add('is-shaking');
  later(500, () => scene.classList.remove('is-shaking'));
}

/* A puff of dust where he lands. */
function dust(layer, x, y) {
  const at = make('g', { transform: `translate(${x} ${y})` }, layer);
  [-16, -6, 6, 16].forEach((dx, i) => {
    const puff = make('circle', { cx: dx, cy: -3, r: 5 + (i % 2) * 2, class: 'fx-dust' }, at);
    puff.style.setProperty('--dx', `${dx * 1.4}px`);
  });
  later(900, () => at.remove());
}

/* Sweat drops ping off his head. */
function sweat(layer, x, y) {
  const at = make('g', { transform: `translate(${x} ${y})` }, layer);
  [[-1, -14], [1, -16], [-0.4, -20], [0.6, -12]].forEach(([dir, up], i) => {
    const drop = make('path', { d: 'M0 -3 Q2.4 0 0 2 Q-2.4 0 0 -3 Z', class: 'fx-sweat' }, at);
    drop.style.setProperty('--dx', `${dir * 18}px`);
    drop.style.setProperty('--dy', `${up}px`);
    drop.style.animationDelay = `${i * 60}ms`;
  });
  later(1000, () => at.remove());
}

/* A little cloud of cartoon swearing floats up off his head. */
const GRAWLIX = ['#@!%', '%&!#', '@#$!', '#!*%'];
function grawlix(layer, x, y) {
  const at = make('g', { transform: `translate(${x} ${y})` }, layer);
  const up = make('g', { class: 'fx-grawlix' }, at);
  make('path', { d: 'M-22 0 Q-26 -10 -16 -13 Q-12 -22 0 -19 Q10 -24 16 -15 Q26 -13 22 -3 Q24 6 12 6 L-14 6 Q-26 6 -22 0 Z', class: 'fx-grawlix-back' }, up);
  const t = make('text', { x: 0, y: -2, 'text-anchor': 'middle', class: 'fx-grawlix-text' }, up);
  t.textContent = GRAWLIX[Math.floor(Math.random() * GRAWLIX.length)];
  later(1600, () => at.remove());
}

/* Panic! His legs spin on the spot before he shoots off, like
   every cartoon ever. js/night.js calls this. */
export function windUp(b, layer) {
  ALL_CLASSES.forEach((c) => b.fxg.classList.remove(c));
  void b.fxg.getBBox();
  if (lessMotion()) return 300;
  b.fxg.classList.add('fx-windup');
  sfx.zoom();
  const behind = b.x - b.facing * 14;
  later(500, () => dust(layer, behind, b.y));
  later(800, () => b.fxg.classList.remove('fx-windup'));
  return 800;
}

/* Play a trap's payoff on burglar b. Hands back how long it takes
   (in milliseconds) and calls onImpact when the big hit lands. */
export function playFx({ trap, b, layer, anchor, onImpact }) {
  const shape = BODY[b.data.look] || BODY.sid;
  const hx = b.x + shape.head[0] * b.facing;
  const hy = b.y + shape.head[1];
  const payoff = PAYOFFS[trap.fx] || PAYOFFS.noise;
  ALL_CLASSES.forEach((c) => b.fxg.classList.remove(c));
  void b.fxg.getBBox();                       // so the same animation can play again
  const still = lessMotion();
  const extra = payoff({ trap, b, layer, anchor, hx, hy });
  const { total, impact, starsAt } = extra;
  if (sfx[trap.fx]) sfx[trap.fx]();
  const hit = still ? 0 : impact;
  later(hit, () => {
    /* the word goes beside his head, so it does not cover what he says */
    const side = hx > PICTURE.w - 160 ? -1 : 1;
    const w = word(layer, hx + side * 74, hy + 30, trap.word || 'BONK!');
    later(1500, () => w.remove());
    if (trap.mess) addMess(b.body, b.data.look, trap.mess, b.messCount += 1);
    if (!still) {
      if (extra.shake) shakeHouse();
      if (extra.dust) dust(layer, b.x, b.y);
      if (extra.sweat) sweat(layer, hx, hy - 6);
      if (extra.dust || extra.shake) sfx.thud();
    }
    later(still ? 0 : 450, () => grawlix(layer, hx - side * 4, hy - 26));
    if (onImpact) onImpact();
  });
  if (starsAt !== undefined) later(still ? 0 : starsAt, () => stars(layer, hx, hy - 12, 1600));
  const length = still ? 1300 : total;
  later(length, () => {
    ALL_CLASSES.forEach((c) => b.fxg.classList.remove(c));
    /* still seeing stars: he wobbles about for a bit as he walks */
    if (extra.dizzy && !still) {
      void b.fxg.getBBox();
      b.fxg.classList.add('fx-dizzy');
      later(1800, () => b.fxg.classList.remove('fx-dizzy'));
    }
  });
  return length;
}

/* Police lights flashing over the whole house. */
export function policeLights(layer, ms) {
  const at = make('g', { class: 'fx-police' }, layer);
  make('rect', { x: 0, y: 0, width: PICTURE.w, height: PICTURE.h, class: 'fx-police-red' }, at);
  make('rect', { x: 0, y: 0, width: PICTURE.w, height: PICTURE.h, class: 'fx-police-blue' }, at);
  later(ms, () => at.remove());
}

/* A little sign over somebody's head, like BUSTED. */
export function sign(layer, x, y, text, ms) {
  const at = word(layer, x, y, text);
  at.classList.add('fx-sign');
  later(ms, () => at.remove());
}
