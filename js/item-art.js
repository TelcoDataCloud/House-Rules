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
  banana(g, c) {
    shape(g, 'M1 -11 Q1 -1 9 -1 Q15 -1 16 -6 Q13 -4.5 9 -5 Q4 -6 4.5 -12 Z', c || 'lamp-shade', THIN);
    shape(g, 'M4.5 -12 L4 -14.5 L2 -14 L1 -11 Z', 'wood-dark', THIN);
    shape(g, 'M3 -8 Q5 -3.5 11 -3', 'none', THIN);
    ball(g, 16, -6, 0.9, 'wood-dark', 'none');
  },
  cushion(g, c) {
    add(g, 'ellipse', { cx: 8, cy: -5, rx: 8, ry: 4.5, fill: paint(c || 'paint-pink'), class: THICK });
    shape(g, 'M14 -3 L18 -1 L17 1 L13 -1 Z', c || 'paint-pink', THIN);
    shape(g, 'M3 -6 Q8 -9 13 -6', 'none', THIN);
    shine(g, 'M4 -7 Q6 -8.5 8 -8.5 L8 -7.5 Q6 -7.5 4.5 -6.5 Z');
  },
  custard(g, c) {
    box(g, 2, -14, 12, 14, 'metal', THICK, 1);
    box(g, 2, -11, 12, 7, c || 'lamp-shade', 'none', 0);
    shape(g, 'M5 -9 Q8 -12 11 -9 Q8 -6 5 -9 Z', 'porcelain', 'none');
    shape(g, 'M2 -14 Q4 -10 6 -14 Z', c || 'lamp-shade', 'none');
  },
  alarm(g, c) {
    ball(g, 8, -7, 6.5, c || 'fabric-a');
    ball(g, 8, -7, 4.6, 'porcelain', THIN);
    line(g, 8, -7, 8, -10);
    line(g, 8, -7, 10.5, -6);
    ball(g, 3, -13, 2.4, 'paint-yellow', THIN);
    ball(g, 13, -13, 2.4, 'paint-yellow', THIN);
    line(g, 4, -1, 2.5, 1, THIN);
    line(g, 12, -1, 13.5, 1, THIN);
  },
  chicken(g, c) {
    add(g, 'ellipse', { cx: 7, cy: -6, rx: 6.5, ry: 4.5, fill: paint(c || 'lamp-shade'), class: THIN });
    shape(g, 'M10 -8 L12 -14 Q12 -17 14 -17 Q16 -17 16 -15 L14 -8 Z', c || 'lamp-shade', THIN);
    shape(g, 'M16 -16 L18.5 -15 L16 -14 Z', 'fabric-a', THIN);
    shape(g, 'M13 -17 Q13.5 -19.5 15 -17.5 Z', 'fabric-a', THIN);
    ball(g, 14.4, -15.4, 0.7, 'wood-dark', 'none');
    shape(g, 'M1 -7 L-1 -10 L2 -8 Z', c || 'lamp-shade', THIN);
    line(g, 5, -2, 4, 0);
    line(g, 9, -2, 10, 0);
  },
  loo(g, c) {
    box(g, 2, -14, 12, 14, c || 'porcelain', THICK, 3);
    add(g, 'ellipse', { cx: 8, cy: -14, rx: 6, ry: 1.8, fill: paint('porcelain'), class: THIN });
    add(g, 'ellipse', { cx: 8, cy: -14, rx: 2, ry: 0.8, fill: paint('wood-light'), class: THIN });
    shape(g, 'M14 -8 Q17 -5 16 0 L13 0', c || 'porcelain', THIN);
  },
  /* --- ADDED IN M14 ------------------------------------------ */
  soap(g, c) {
    box(g, 1, -7, 14, 7, c || 'key-pink', THICK, 3);
    shine(g, 'M3 -6 L8 -6 L7 -5 L3 -5 Z');
    ball(g, 4, -10, 2, 'porcelain', THIN);
    ball(g, 9, -12, 2.6, 'porcelain', THIN);
    ball(g, 13, -9, 1.6, 'porcelain', THIN);
  },
  eggs(g, c) {
    box(g, 0, -6, 16, 6, c || 'cardboard', THICK, 1);
    [3, 8, 13].forEach((x) => add(g, 'ellipse', { cx: x, cy: -8, rx: 2.4, ry: 3, fill: paint('porcelain'), class: THIN }));
    line(g, 5.5, -6, 5.5, 0);
    line(g, 10.5, -6, 10.5, 0);
  },
  mustard(g, c) {
    shape(g, 'M4 0 L4 -10 Q4 -12 8 -12 Q12 -12 12 -10 L12 0 Z', c || 'mess-mustard');
    shape(g, 'M6.5 -12 L9.5 -12 L8.6 -17 L7.4 -17 Z', 'fabric-a', THIN);
    box(g, 5, -8, 6, 4, 'porcelain', 'none', 0.5);
  },
  bubblewrap(g, c) {
    box(g, 0, -12, 16, 12, c || 'glass', THICK, 1);
    [-9, -4].forEach((y) => [3, 8, 13].forEach((x) => ball(g, x, y, 1.8, 'porcelain', THIN)));
  },
  glue(g, c) {
    box(g, 3, -11, 10, 11, c || 'porcelain', THICK, 2);
    box(g, 4, -14, 8, 3, 'fabric-a', THIN, 1);
    box(g, 5, -8, 6, 4, 'paint-yellow', 'none', 0.5);
    shape(g, 'M11 -11 Q14 -9 13 -6', 'none', THIN);
  },
  horn(g, c) {
    box(g, 1, -12, 5, 12, c || 'fabric-a', THICK, 1.5);
    shape(g, 'M6 -10 L15 -14 L15 -2 L6 -6 Z', 'paint-yellow');
    box(g, 1, -14, 5, 2.5, 'ink', 'none', 0.5);
  },
  skateboard(g, c) {
    shape(g, 'M0 -6 Q0 -8 2 -8 L14 -8 Q16 -8 16 -6 L15 -5 L1 -5 Z', c || 'fabric-b');
    ball(g, 4, -2.5, 2.2, 'ink', 'none');
    ball(g, 12, -2.5, 2.2, 'ink', 'none');
    line(g, 4, -5, 4, -3);
    line(g, 12, -5, 12, -3);
  },
  ice(g, c) {
    shape(g, 'M2 0 Q0 -8 4 -12 L12 -12 Q16 -8 14 0 Z', c || 'glass');
    box(g, 4, -8, 4, 4, 'porcelain', THIN, 0.5);
    box(g, 8, -5, 4, 4, 'porcelain', THIN, 0.5);
    box(g, 6, -12, 4, 4, 'porcelain', THIN, 0.5);
    box(g, 3, -14, 10, 2.5, 'key-blue', THIN, 1);
  },
  bubbles(g, c) {
    box(g, 1, -9, 12, 9, c || 'key-blue', THICK, 2);
    ball(g, 7, -4.5, 2.5, 'ink', 'none');
    ball(g, 13, -12, 3, 'glass', THIN);
    ball(g, 9, -15, 2, 'glass', THIN);
    ball(g, 15, -16, 1.4, 'glass', THIN);
  },
  blower(g, c) {
    box(g, 0, -11, 9, 9, c || 'key-green', THICK, 3);
    box(g, 8, -9, 8, 4, 'metal', THICK, 1);
    box(g, 2, -14, 5, 3, 'ink', 'none', 1);
    line(g, 16, -7, 16, -7);
    shape(g, 'M2 -2 L4 0 L7 0 L8 -2', 'none', THIN);
  },
  slime(g, c) {
    box(g, 2, -9, 12, 9, c || 'porcelain', THICK, 2);
    shape(g, 'M2 -9 Q5 -15 8 -11 Q11 -16 14 -9 L14 -6 Q12 -3 11 -6 Q8 -2 6 -6 Q4 -4 2 -6 Z', 'mess-slime');
  },
  magnet(g, c) {
    shape(g, 'M2 -2 L2 -9 Q2 -16 8 -16 Q14 -16 14 -9 L14 -2 L10 -2 L10 -9 Q10 -12 8 -12 Q6 -12 6 -9 L6 -2 Z', c || 'key-red');
    box(g, 2, -3, 4, 3, 'metal', THIN, 0.5);
    box(g, 10, -3, 4, 3, 'metal', THIN, 0.5);
  },
  rccar(g, c) {
    shape(g, 'M0 -4 L1 -8 L5 -8 L7 -11 L12 -11 L14 -8 L16 -7 L16 -4 Z', c || 'key-red');
    ball(g, 4, -3, 2.4, 'ink', 'none');
    ball(g, 12, -3, 2.4, 'ink', 'none');
    line(g, 13, -11, 15, -16);
    ball(g, 15, -16, 1, 'ink', 'none');
  },
  fog(g, c) {
    box(g, 0, -8, 11, 8, c || 'metal', THICK, 1.5);
    box(g, 10, -6, 3, 3, 'ink', 'none', 0.5);
    ball(g, 3, -4, 1.2, 'key-red', 'none');
    ball(g, 15, -8, 3, 'smoke', THIN);
    ball(g, 13, -12, 3.4, 'smoke', THIN);
    ball(g, 9, -14, 2.4, 'smoke', THIN);
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
