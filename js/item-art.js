/* ===========================================================
   ITEM ART - what every bit of junk looks like

   Hendrix: data/items.js says an item's look, like 'skate'.
   This file is where 'skate' is drawn. Same rules as the
   furniture in js/props.js: start at the floor on the left
   edge, x goes right, y goes UP as it goes more minus.

   Every item fits in a square about 16 wide and 16 tall, so
   it can lie on a shelf in the house AND sit in a slot in your
   bag. The bag just draws it bigger.

   colour is the main colour, from data/items.js. If an item
   does not say one, each drawing has its own.
   =========================================================== */

/* The same pens as js/props.js, so junk and furniture match. */
const NS = 'http://www.w3.org/2000/svg';
const THICK = 'p-ink';
const THIN = 'p-fine';
function add(g, tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  g.append(node);
  return node;
}
function paint(colour) {
  if (!colour || colour === 'none') return 'none';
  return `var(--${colour})`;
}
const box = (g, x, y, w, h, c, cls = THICK, round = 1.5) =>
  add(g, 'rect', { x, y, width: w, height: h, rx: round, fill: paint(c), class: cls });
const shape = (g, d, c, cls = THICK) => add(g, 'path', { d, fill: paint(c), class: cls });
const ball = (g, x, y, r, c, cls = THICK) => add(g, 'circle', { cx: x, cy: y, r, fill: paint(c), class: cls });
const line = (g, x1, y1, x2, y2, cls = THIN) => add(g, 'line', { x1, y1, x2, y2, class: cls });
const shadow = (g, d) => add(g, 'path', { d, class: 'p-shadow' });
const shine = (g, d) => add(g, 'path', { d, class: 'p-shine' });

export const ITEM_ART = {
  bucket(g, c) {
    shape(g, 'M1 -12 L15 -12 L13 0 L3 0 Z', c || 'metal');
    shape(g, 'M2 -12 Q8 -20 14 -12', 'none', THIN);
    shadow(g, 'M11 -12 L15 -12 L13 0 L10 0 Z');
  },
  marbles(g, c) {
    shape(g, 'M2 0 Q-1 -8 4 -11 L12 -11 Q17 -8 14 0 Z', c || 'glass');
    ball(g, 6, -5, 2.2, 'fabric-a', THIN);
    ball(g, 10, -4, 2.2, 'fabric-b', THIN);
    ball(g, 8, -8, 2.2, 'paint-yellow', THIN);
    box(g, 3, -13, 10, 3, 'fabric-a', THIN, 1);
  },
  bottle(g, c) {
    shape(g, 'M4 0 L4 -9 Q4 -12 6.5 -13 L6.5 -16 L9.5 -16 L9.5 -13 Q12 -12 12 -9 L12 0 Z', c || 'paint-yellow');
    box(g, 6, -18, 4, 2.5, 'fabric-a', THIN, 0.5);
    box(g, 5, -8, 6, 4, 'porcelain', 'none', 0.5);
    shine(g, 'M5 -10 L6 -10 L6 -2 L5 -2 Z');
  },
  pillow(g, c) {
    shape(g, 'M0 -2 Q-1 -9 2 -11 Q8 -13 14 -11 Q17 -9 16 -2 Q8 1 0 -2 Z', c || 'porcelain');
    shape(g, 'M3 -6 Q8 -4 13 -6', 'none', THIN);
    shape(g, 'M14 -12 Q17 -16 15 -18 Q13 -15 14 -12 Z', 'porcelain', THIN);   // a feather escaping
  },
  string(g, c) {
    ball(g, 8, -6, 6, c || 'porcelain');
    shape(g, 'M3 -8 Q8 -3 13 -8 M3 -5 Q8 0 13 -5 M4 -10 Q8 -6 12 -11', 'none', THIN);
    shape(g, 'M13 -3 Q17 0 16 2', 'none', THIN);
  },
  rope(g, c) {
    add(g, 'ellipse', { cx: 8, cy: -5, rx: 8, ry: 5, fill: paint(c || 'sack'), class: THICK });
    add(g, 'ellipse', { cx: 8, cy: -5, rx: 5, ry: 3, fill: 'none', class: THIN });
    add(g, 'ellipse', { cx: 8, cy: -5, rx: 2, ry: 1.2, fill: paint('wood-dark'), class: THIN });
  },
  sack(g, c) {
    shape(g, 'M2 0 Q0 -9 5 -13 L11 -13 Q16 -9 14 0 Z', c || 'sack');
    shape(g, 'M5 -13 Q8 -17 11 -13', 'none', THIN);
    line(g, 5, -11, 11, -11);
  },
  tape(g, c) {
    add(g, 'ellipse', { cx: 8, cy: -7, rx: 7, ry: 7, fill: paint(c || 'metal'), class: THICK });
    add(g, 'circle', { cx: 8, cy: -7, r: 3.2, fill: paint('wood-light'), class: THIN });
    shape(g, 'M14 -5 L17 -1 L13 0 Z', c || 'metal', THIN);
  },
  cans(g, c) {
    box(g, 0, -10, 7, 10, c || 'metal', THIN, 1);
    box(g, 8, -8, 7, 8, c || 'metal', THIN, 1);
    box(g, 0, -7, 7, 3, 'fabric-a', 'none', 0);
    box(g, 8, -5, 7, 3, 'fabric-b', 'none', 0);
    line(g, 7, -9, 8, -9);
  },
  flour(g, c) {
    shape(g, 'M2 0 L2 -12 L4 -15 L12 -15 L14 -12 L14 0 Z', c || 'porcelain');
    box(g, 4, -9, 8, 5, 'fabric-b', THIN, 1);
    ball(g, 3, 1, 1.4, 'porcelain', 'none');
    ball(g, 13, 1, 1, 'porcelain', 'none');
  },
  toycar(g, c) {
    shape(g, 'M0 -3 L1 -7 L4 -8 L6 -12 L12 -12 L14 -8 L16 -7 L16 -3 Z', c || 'fabric-a');
    box(g, 7, -11, 4, 3, 'glass', 'none', 0.5);
    ball(g, 4, -2, 2.4, 'worktop', THIN);
    ball(g, 12, -2, 2.4, 'worktop', THIN);
  },
  hairdryer(g, c) {
    shape(g, 'M5 -8 L8 -8 L7 0 L4 0 Z', c || 'fabric-b', THICK);
    shape(g, 'M1 -15 L11 -15 Q15 -15 15 -11.5 Q15 -8 11 -8 L1 -8 Z', c || 'fabric-b');
    add(g, 'ellipse', { cx: 1, cy: -11.5, rx: 1.4, ry: 3.5, fill: paint('worktop'), class: THIN });
    ball(g, 5.5, -3, 1, 'paint-yellow', 'none');
  },
  bell(g, c) {
    shape(g, 'M2 -3 Q2 -13 8 -14 Q14 -13 14 -3 Z', c || 'paint-yellow');
    box(g, 1, -4, 14, 3, c || 'paint-yellow', THICK, 1);
    ball(g, 8, 0, 1.8, 'worktop', THIN);
    ball(g, 8, -15, 1.5, 'worktop', THIN);
    shine(g, 'M4.5 -5 Q4.5 -11 7 -12 L7 -5 Z');
  },
  tin(g, c) {
    box(g, 1, -13, 14, 13, 'metal', THICK, 1);
    box(g, 1, -9, 14, 5, c || 'fabric-a', 'none', 0);
    shape(g, 'M1 -13 Q3 -9 5 -13 Z', c || 'fabric-a', 'none');    // a drip
    shape(g, 'M3 -13 Q8 -20 13 -13', 'none', THIN);
  },
  jar(g, c) {
    box(g, 3, -16, 10, 3, 'fabric-a', THIN, 1);
    shape(g, 'M2 -13 L14 -13 L14 -2 Q14 0 12 0 L4 0 Q2 0 2 -2 Z', c || 'lamp-shade');
    box(g, 4, -9, 8, 4, 'porcelain', 'none', 0.5);
    shine(g, 'M3.5 -11 L5 -11 L5 -2 L3.5 -2 Z');
  },
  skate(g, c) {
    shape(g, 'M2 -3 L2 -14 L7 -14 L8 -8 Q14 -8 15 -5 L15 -3 Z', c || 'fabric-a');
    line(g, 3, -11, 7, -11);
    box(g, 1, -4, 15, 2, 'worktop', THIN, 1);
    ball(g, 4, -1, 1.8, 'paint-yellow', THIN);
    ball(g, 13, -1, 1.8, 'paint-yellow', THIN);
  },
  lights(g) {
    shape(g, 'M0 -4 Q4 -12 8 -6 Q12 0 16 -10', 'none', THIN);
    ball(g, 2, -6, 2, 'fabric-a', THIN);
    ball(g, 6, -9, 2, 'paint-yellow', THIN);
    ball(g, 10, -4, 2, 'fabric-c', THIN);
    ball(g, 14, -8, 2, 'fabric-b', THIN);
  },
  hose(g, c) {
    add(g, 'ellipse', { cx: 8, cy: -6, rx: 8, ry: 6, fill: 'none', class: 'p-hose' });
    add(g, 'ellipse', { cx: 8, cy: -6, rx: 4.5, ry: 3, fill: 'none', class: 'p-hose' });
    box(g, 14, -2, 3, 3, c || 'paint-yellow', THIN, 0.5);
  },
  blender(g, c) {
    box(g, 3, -5, 10, 5, c || 'fabric-b', THICK, 1);
    shape(g, 'M4 -5 L2 -16 L14 -16 L12 -5 Z', 'glass', THIN);
    box(g, 2, -18, 12, 2.5, 'worktop', THIN, 0.5);
    ball(g, 8, -2.5, 1, 'paint-yellow', 'none');
  },
  glitter(g, c) {
    shape(g, 'M2 -2 L12 -12 L15 -9 L5 1 Z', c || 'paint-pink');
    ball(g, 13.5, -10.5, 2.2, 'paint-yellow', THIN);
    [[15, -15], [11, -16], [16, -12]].forEach(([x, y]) => ball(g, x, y, 0.8, 'paint-yellow', 'none'));
  },
  balloon(g, c) {
    shape(g, 'M8 -2 Q1 -5 2 -11 Q4 -16 8 -16 Q12 -16 14 -11 Q15 -5 8 -2 Z', c || 'fabric-b');
    shape(g, 'M7 -2 L9 -2 L8 0 Z', c || 'fabric-b', THIN);
    shine(g, 'M5 -12 Q5 -14 7 -14.5 L6.5 -11 Z');
  },
  parcel(g, c) {
    box(g, 1, -12, 14, 12, c || 'cardboard');
    line(g, 8, -12, 8, 0);
    line(g, 1, -6, 15, -6);
  }
};

/* Draw one item. Unknown looks get a parcel instead of an error. */
export function drawItem(item, g) {
  const draw = ITEM_ART[item.look] || ITEM_ART.parcel;
  draw(g, item.colour);
}

/* A little picture of an item on its own, for the bag. */
export function itemPicture(item) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-3 -20 22 23');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('item-picture');
  const g = document.createElementNS(NS, 'g');
  drawItem(item, g);
  svg.append(g);
  return svg;
}
