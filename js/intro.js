/* ===========================================================
   INTRO - the bit before the night starts

   A few pictures, one after another, like a comic strip. Press
   Next to move on, or Skip to get straight into the house.

   Watch it properly the first time. Sid and Bruno both give
   something away about what they cannot stand.

   The words are in BEATS below. Each beat can show Sid, show
   Bruno, and make one of them do something (a class in
   css/intro.css).
   =========================================================== */

import { setPhase } from './state.js';
import { BURGLARS } from '../data/burglars.js';
import { drawBurglar } from './burglar-art.js';
import { sfx } from './audio.js';

const NS = 'http://www.w3.org/2000/svg';

const BEATS = [
  { words: 'It is nearly midnight. Mum and Dad are out. It is just you.' },
  { words: 'Two burglars have been watching this house all week.', show: ['sid', 'bruno'] },
  { who: 'sid', words: 'Did that step just CREAK? I hate creaks. And bangs. And surprises.', show: ['sid', 'bruno'], act: 'sid-jump', sound: 'yelp' },
  { who: 'bruno', words: 'Ugh. Is that JAM on my boot? I hate sticky.', show: ['sid', 'bruno'], act: 'bruno-wipe', sound: 'stick' },
  { words: 'The best junk is locked up: in the safe, the piano and the shed. Crack the puzzles to get it.' },
  { words: 'They come in at midnight. Raid the house for junk, bolt it into traps, and rig every door.', show: ['sid', 'bruno'], last: true }
];

const ui = {};
let at = 0;
const actors = {};

function make(tag, attrs = {}, parent = null) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  if (parent) parent.append(node);
  return node;
}

/* The front of the house at night, with the two of them outside. */
function buildStage(svg) {
  svg.innerHTML = '';
  make('rect', { x: 0, y: 0, width: 600, height: 260, class: 'intro-sky' }, svg);
  make('circle', { cx: 70, cy: 52, r: 22, class: 'intro-moon night-only' }, svg);
  [[150, 30], [240, 70], [300, 24], [36, 120], [210, 130]].forEach(([x, y]) =>
    make('circle', { cx: x, cy: y, r: 2, class: 'intro-star night-only' }, svg));
  make('rect', { x: 0, y: 214, width: 600, height: 46, class: 'intro-ground' }, svg);
  /* the house, the door and the mat */
  make('rect', { x: 360, y: 70, width: 240, height: 146, class: 'intro-wall ink' }, svg);
  make('path', { d: 'M340 74 L480 10 L620 74 Z', class: 'intro-roof ink' }, svg);
  make('rect', { x: 400, y: 110, width: 50, height: 44, class: 'intro-window ink-thin' }, svg);
  make('rect', { x: 500, y: 130, width: 52, height: 86, rx: 3, class: 'intro-door ink' }, svg);
  make('circle', { cx: 542, cy: 176, r: 3.5, class: 'intro-knob' }, svg);
  make('rect', { x: 286, y: 212, width: 70, height: 6, rx: 2, class: 'intro-mat ink-thin' }, svg);

  BURGLARS.forEach((data, i) => {
    const pos = make('g', { class: 'intro-pos', transform: `translate(${i === 0 ? 170 : 320} 214) scale(1.5)` }, svg);
    const act = make('g', { class: `intro-actor intro-${data.look}` }, pos);
    drawBurglar(act, data.look);
    if (data.look === 'bruno') {
      make('ellipse', { cx: 9, cy: -1, rx: 5, ry: 1.6, class: 'intro-jam' }, act);
    }
    actors[data.id] = pos;
  });
  /* a little creak mark by Sid's foot */
  make('text', { x: 196, y: 206, class: 'intro-creak', 'text-anchor': 'middle' }, svg).textContent = 'creak';
}

function show() {
  const beat = BEATS[at];
  ui.svg.dataset.beat = String(at);
  Object.entries(actors).forEach(([id, node]) => {
    node.classList.toggle('is-on', (beat.show || []).includes(id));
  });
  ui.svg.classList.remove('sid-jump', 'bruno-wipe');
  void ui.svg.getBBox();
  if (beat.act) ui.svg.classList.add(beat.act);
  if (beat.sound && sfx[beat.sound]) sfx[beat.sound]();
  const who = BURGLARS.find((b) => b.id === beat.who);
  ui.words.textContent = who ? `${who.name}: "${beat.words}"` : beat.words;
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
