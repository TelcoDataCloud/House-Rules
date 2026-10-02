/* ===========================================================
   INTRO - the bit before the night starts

   Three pictures, like a comic strip. Press Next to move on, or
   Skip to get straight into the house.

     1. Midnight. A van pulls up. Two burglars creep up the path.
     2. At the front door, each of them gives something away
        about what he cannot stand. Listen carefully.
     3. Up in the attic window: you. You are home, and you have a
        plan.

   The whole picture is drawn once (buildStage). Each beat just
   puts a word on the stage (data-beat="0", "1" or "2") and
   css/intro.css moves things about to match. So to change what
   happens in a beat, look in css/intro.css. To change the words,
   look in BEATS below.
   =========================================================== */

import { setPhase } from './state.js';
import { BURGLARS } from '../data/burglars.js';
import { ITEMS } from '../data/items.js';
import { drawBurglar } from './burglar-art.js';
import { drawHero, pyjamaPattern } from './hero-art.js';
import { drawItem } from './item-art.js';
import { sfx } from './audio.js';

const NS = 'http://www.w3.org/2000/svg';

const BEATS = [
  { words: 'Midnight. Mum and Dad are out. Two burglars think the house is empty.', sound: 'creak' },
  { words: 'Listen carefully. They each hate something different.', sound: 'yelp' },
  { words: 'The house is not empty. You are home. Raid it for junk, crack the locks, build traps and rig every door.', sound: 'craft', last: true }
];

const ui = {};
let at = 0;

function make(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (parent) parent.append(node);
  return node;
}

/* A speech bubble: a rounded box, a little tail pointing down at
   whoever is talking, and up to two lines of words. */
function bubble(parent, x, y, w, lines, tailX, cls) {
  const g = make('g', { class: `intro-bubble ${cls}` }, parent);
  const h = lines.length * 15 + 12;
  make('rect', { x, y, width: w, height: h, rx: 9, class: 'intro-bubble-back' }, g);
  make('path', { d: `M${tailX - 6} ${y + h - 1} L${tailX} ${y + h + 12} L${tailX + 6} ${y + h - 1} Z`, class: 'intro-bubble-back' }, g);
  make('rect', { x: tailX - 5, y: y + h - 3, width: 10, height: 3, class: 'intro-bubble-hide' }, g);
  lines.forEach((line, i) => {
    make('text', { x: x + w / 2, y: y + 19 + i * 15, 'text-anchor': 'middle', class: 'intro-bubble-text' }, g).textContent = line;
  });
  return g;
}

/* --- THE PICTURE --------------------------------------------- */

function buildStage(svg) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 640 320');
  const defs = make('defs', {}, svg);
  const sky = make('linearGradient', { id: 'intro-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  make('stop', { offset: '0%', 'stop-color': 'var(--sky-top)' }, sky);
  make('stop', { offset: '100%', 'stop-color': 'var(--sky-bottom)' }, sky);
  const glow = make('radialGradient', { id: 'intro-glow' }, defs);
  make('stop', { offset: '0%', 'stop-color': 'var(--lamp-glow)', 'stop-opacity': 0.9 }, glow);
  make('stop', { offset: '100%', 'stop-color': 'var(--lamp-glow)', 'stop-opacity': 0 }, glow);
  const bricks = make('pattern', { id: 'intro-bricks', width: 22, height: 12, patternUnits: 'userSpaceOnUse' }, defs);
  make('rect', { width: 22, height: 12, fill: 'var(--wall)' }, bricks);
  make('path', { d: 'M0 0.5 H22 M0 6.5 H22 M5 0 V6 M16 6 V12', class: 'intro-mortar' }, bricks);
  const tiles = make('pattern', { id: 'intro-tiles', width: 18, height: 10, patternUnits: 'userSpaceOnUse' }, defs);
  make('rect', { width: 18, height: 10, fill: 'var(--roof)' }, tiles);
  make('path', { d: 'M0 10 Q4.5 3 9 10 Q13.5 3 18 10', class: 'intro-tile-line' }, tiles);
  pyjamaPattern(defs, 'pat-pyjamas-intro');
  const attic = make('clipPath', { id: 'intro-attic' }, defs);
  make('circle', { cx: 430, cy: 92, r: 17 }, attic);

  /* sky, stars, moon, clouds */
  make('rect', { width: 640, height: 320, fill: 'url(#intro-sky)' }, svg);
  const night = make('g', { class: 'night-only' }, svg);
  [[40, 30], [120, 60], [210, 22], [300, 48], [560, 70], [610, 30], [500, 18], [90, 110]].forEach(([x, y], i) =>
    make('circle', { cx: x, cy: y, r: i % 3 ? 1.6 : 2.4, class: `intro-star ${i % 2 ? 'twinkle' : 'twinkle-b'}` }, night));
  make('circle', { cx: 580, cy: 62, r: 46, fill: 'url(#intro-glow)', opacity: 0.5 }, night);
  make('circle', { cx: 580, cy: 62, r: 24, class: 'intro-moon' }, night);
  make('circle', { cx: 572, cy: 56, r: 5, class: 'intro-crater' }, night);
  make('circle', { cx: 588, cy: 70, r: 3.5, class: 'intro-crater' }, night);
  const clouds = make('g', { class: 'intro-clouds' }, svg);
  make('path', { d: 'M60 80 Q66 64 84 68 Q94 54 112 64 Q130 60 132 76 Q140 86 124 88 L68 88 Q52 88 60 80 Z', class: 'intro-cloud' }, clouds);
  make('path', { d: 'M470 40 Q476 28 490 31 Q498 20 512 28 Q526 26 527 38 Q534 46 520 47 L476 47 Q462 47 470 40 Z', class: 'intro-cloud' }, clouds);

  /* the rest of the street, far away */
  make('path', { d: 'M0 250 L0 205 L30 205 L45 188 L60 205 L95 205 L95 196 L120 178 L145 196 L145 215 L190 215 L205 200 L220 215 L240 215 L240 250 Z M580 250 L580 210 L600 192 L620 210 L640 210 L640 250 Z', class: 'intro-far' }, svg);
  [[12, 218], [70, 216], [108, 205], [128, 224], [196, 224], [596, 222], [622, 226]].forEach(([x, y]) =>
    make('rect', { x, y, width: 7, height: 7, class: 'intro-far-window' }, svg));

  /* the garden, the pavement and the road */
  make('rect', { x: 0, y: 248, width: 640, height: 44, class: 'intro-ground' }, svg);
  make('rect', { x: 0, y: 290, width: 640, height: 10, class: 'intro-pavement' }, svg);
  make('rect', { x: 0, y: 300, width: 640, height: 20, class: 'intro-road' }, svg);
  for (let x = 10; x < 640; x += 60) make('rect', { x, y: 309, width: 30, height: 3, class: 'intro-road-line' }, svg);
  make('path', { d: 'M412 270 L448 270 L470 292 L392 292 Z', class: 'intro-path' }, svg);

  /* the house */
  const house = make('g', { class: 'intro-house' }, svg);
  make('rect', { x: 518, y: 30, width: 26, height: 70, fill: 'url(#intro-bricks)', class: 'ink-thin' }, house);
  make('rect', { x: 514, y: 26, width: 34, height: 8, class: 'intro-chimney-top ink-thin' }, house);
  make('path', { d: 'M300 120 L560 120 L560 270 L300 270 Z', fill: 'url(#intro-bricks)', class: 'ink' }, house);
  make('path', { d: 'M280 124 L430 40 L580 124 Z', fill: 'url(#intro-tiles)', class: 'ink' }, house);
  make('path', { d: 'M278 120 L582 120 L582 128 L278 128 Z', class: 'intro-fascia ink-thin' }, house);
  [[325, 142], [485, 142], [325, 205], [485, 205]].forEach(([x, y]) => {
    make('rect', { x, y, width: 50, height: 40, rx: 3, class: 'intro-window-dark ink-thin' }, house);
    make('path', { d: `M${x + 25} ${y} L${x + 25} ${y + 40} M${x} ${y + 20} L${x + 50} ${y + 20}`, class: 'intro-bars' }, house);
    make('rect', { x: x - 4, y: y + 40, width: 58, height: 5, class: 'intro-sill ink-thin' }, house);
  });
  make('rect', { x: 408, y: 196, width: 44, height: 74, rx: 4, class: 'intro-door ink' }, house);
  make('circle', { cx: 444, cy: 236, r: 3.2, class: 'intro-knob' }, house);
  make('rect', { x: 418, y: 206, width: 24, height: 14, rx: 2, class: 'intro-door-glass ink-thin' }, house);
  make('ellipse', { cx: 466, cy: 196, rx: 26, ry: 22, fill: 'url(#intro-glow)', class: 'intro-porch-glow' }, house);
  make('rect', { x: 461, y: 188, width: 10, height: 13, rx: 2, class: 'intro-porch-light ink-thin' }, house);
  make('rect', { x: 396, y: 266, width: 68, height: 6, rx: 2, class: 'intro-step ink-thin' }, house);
  make('text', { x: 430, y: 186, 'text-anchor': 'middle', class: 'intro-number' }, house).textContent = '12';

  /* the attic window, with you in it */
  const win = make('g', { class: 'intro-attic' }, house);
  make('circle', { cx: 430, cy: 92, r: 17, class: 'intro-attic-glass' }, win);
  const peep = make('g', { 'clip-path': 'url(#intro-attic)' }, win);
  const at0 = make('g', { transform: 'translate(430 124) scale(1.15)' }, peep);
  const pop = make('g', { class: 'intro-hendrix' }, at0);
  drawHero(pop, 'url(#pat-pyjamas-intro)');
  make('circle', { cx: 430, cy: 92, r: 17, class: 'intro-attic-rim' }, win);

  /* hedges and the fence along the front */
  make('path', { d: 'M286 270 Q300 246 322 252 Q340 240 356 256 Q372 252 380 270 Z', class: 'intro-hedge ink-thin' }, svg);
  make('path', { d: 'M480 270 Q490 250 510 254 Q528 242 546 256 Q566 250 572 270 Z', class: 'intro-hedge ink-thin' }, svg);
  const fence = make('g', { class: 'intro-fence' }, svg);
  [[0, 380], [480, 640]].forEach(([from, to]) => {
    make('rect', { x: from, y: 270, width: to - from, height: 4, class: 'intro-fence-rail ink-thin' }, fence);
    make('rect', { x: from, y: 280, width: to - from, height: 4, class: 'intro-fence-rail ink-thin' }, fence);
    for (let x = from + 4; x < to - 4; x += 16) {
      make('path', { d: `M${x} 290 L${x} 266 L${x + 4} 261 L${x + 8} 266 L${x + 8} 290 Z`, class: 'intro-fence-post ink-thin' }, fence);
    }
  });

  /* the street lamp */
  make('ellipse', { cx: 250, cy: 236, rx: 46, ry: 60, fill: 'url(#intro-glow)', class: 'intro-lamp-glow' }, svg);
  make('rect', { x: 247, y: 186, width: 6, height: 110, class: 'intro-lamp-post ink-thin' }, svg);
  make('path', { d: 'M236 186 L264 186 L258 172 L242 172 Z', class: 'intro-lamp-head ink-thin' }, svg);

  /* the van they came in. It is definitely not a getaway van. */
  const van = make('g', { class: 'intro-van' }, svg);
  make('path', { d: 'M24 300 L24 250 Q24 242 32 242 L128 242 Q136 242 142 252 L160 274 Q166 278 166 286 L166 300 Z', class: 'intro-van-body ink' }, van);
  make('path', { d: 'M132 250 L152 274 L132 274 Z', class: 'intro-van-glass ink-thin' }, van);
  make('rect', { x: 24, y: 276, width: 142, height: 7, class: 'intro-van-stripe' }, van);
  make('text', { x: 78, y: 266, 'text-anchor': 'middle', class: 'intro-van-words' }, van).textContent = 'NOT A GETAWAY VAN';
  [52, 136].forEach((x) => {
    make('circle', { cx: x, cy: 302, r: 11, class: 'intro-wheel' }, van);
    make('circle', { cx: x, cy: 302, r: 4, class: 'intro-hub' }, van);
  });

  /* Sid and Bruno. The outer group says where they stand at the
     door; the inner one is what css/intro.css slides about. */
  BURGLARS.forEach((data, i) => {
    const pos = make('g', { transform: `translate(${i === 0 ? 384 : 476} 272) scale(1.05)` }, svg);
    const move = make('g', { class: `intro-walk intro-walk-${data.look}` }, pos);
    const act = make('g', { class: `intro-actor intro-${data.look}` }, move);
    drawBurglar(act, data.look);
    if (data.look === 'bruno') make('ellipse', { cx: 9, cy: -1, rx: 6, ry: 2, class: 'intro-jam' }, act);
  });
  make('text', { x: 360, y: 240, 'text-anchor': 'middle', class: 'intro-creak' }, svg).textContent = 'CREAK';

  /* what they say at the door (beat 2) */
  bubble(svg, 214, 112, 160, ['Was that a CREAK?', 'I hate surprises!'], 368, 'intro-say-sid');
  bubble(svg, 488, 140, 150, ['Jam on my boot?!', 'I hate STICKY.'], 500, 'intro-say-bruno');

  /* your plan, in a thought bubble (beat 3) */
  const think = make('g', { class: 'intro-think' }, svg);
  make('circle', { cx: 404, cy: 74, r: 4, class: 'intro-bubble-back' }, think);
  make('circle', { cx: 390, cy: 60, r: 6, class: 'intro-bubble-back' }, think);
  make('ellipse', { cx: 330, cy: 40, rx: 78, ry: 30, class: 'intro-bubble-back' }, think);
  ['banana', 'bucket', 'rope', 'bell', 'flour'].forEach((id, i) => {
    const item = ITEMS.find((it) => it.id === id) || { look: 'parcel' };
    const g = make('g', { transform: `translate(${274 + i * 24} 52) scale(1.25)` }, think);
    drawItem(item, g);
  });
  make('text', { x: 330, y: 24, 'text-anchor': 'middle', class: 'intro-think-words' }, think).textContent = 'I have a plan.';
}

/* --- MOVING THROUGH THE BEATS -------------------------------- */

function show() {
  const beat = BEATS[at];
  ui.svg.dataset.beat = String(at);
  if (beat.sound && sfx[beat.sound]) sfx[beat.sound]();
  ui.words.textContent = beat.words;
  ui.next.textContent = beat.last ? 'Raid the house' : 'Next';
  ui.count.textContent = `${at + 1} of ${BEATS.length}`;
}

function go() {
  sfx.start();
  setPhase('scavenge');
}

export function setupIntro(els) {
  Object.assign(ui, els);
  buildStage(ui.svg);
  ui.next.addEventListener('click', () => {
    if (BEATS[at].last) { go(); return; }
    at += 1;
    sfx.tick();
    show();
  });
  ui.skip.addEventListener('click', go);
}

export function startIntro() {
  at = 0;
  show();
}
