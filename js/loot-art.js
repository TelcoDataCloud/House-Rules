/* ===========================================================
   LOOT ART - what the good stuff looks like

   Hendrix: data/burglars.js says each bit of loot's look, like
   'guitar'. This file is where 'guitar' is drawn. Same rules as
   the furniture in js/props.js: start at the floor on the left
   edge, x goes right, y goes UP as it goes more minus.

   These are drawn at the same size as the furniture, because
   they ARE furniture until somebody walks off with them.
   =========================================================== */

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
const shine = (g, d) => add(g, 'path', { d, class: 'p-shine' });
const glow = (g, x, y, rx, ry, c) => add(g, 'ellipse', { cx: x, cy: y, rx, ry, fill: paint(c), class: 'p-glow' });

export const LOOT_ART = {
  /* The big old telly. It sits on the TV cabinet in the lounge. */
  telly(g) {
    glow(g, 28, -18, 34, 26, 'screen');
    box(g, 3, -36, 50, 36, 'worktop', THICK, 3);
    box(g, 7, -32, 42, 28, 'screen', 'none', 1);
    shine(g, 'M9 -30 L22 -30 L9 -13 Z');
  },

  /* A games console, with a controller plugged in. */
  console(g) {
    box(g, 0, -8, 24, 8, 'worktop', THICK, 2);
    line(g, 3, -4, 15, -4);
    ball(g, 20, -4, 1.2, 'mount-floor', 'none');
    shape(g, 'M24 -4 Q28 -2 30 -3', 'none', THIN);
    shape(g, 'M29 -1 Q28 -7 33 -7 L39 -7 Q44 -7 43 -1 Q42 1 39 0 L33 0 Q30 1 29 -1 Z', 'ink-soft', THIN);
    ball(g, 39, -4, 0.9, 'fabric-a', 'none');
  },

  /* A laptop, open, left on the bed. */
  laptop(g) {
    shape(g, 'M4 -3 L7 -18 L25 -18 L22 -3 Z', 'worktop');
    shape(g, 'M8 -5 L10 -16 L23 -16 L21 -5 Z', 'screen', 'none');
    shape(g, 'M0 0 L28 0 L26 -3 L2 -3 Z', 'metal', THIN);
  },

  /* A jewellery box, lid up, pearls hanging out. */
  jewellery(g) {
    box(g, 0, -10, 18, 10, 'fabric-b', THICK, 1.5);
    shape(g, 'M0 -10 L3 -19 L21 -19 L18 -10 Z', 'fabric-b', THIN);
    box(g, 7, -7, 4, 3, 'lamp-shade', THIN, 0.8);
    [[3, -11], [6, -12], [9, -12.5], [12, -12], [15, -11]].forEach(([x, y]) => ball(g, x, y, 1.3, 'porcelain', THIN));
    shape(g, 'M17 -9 Q22 -7 21 -2', 'none', THIN);
    ball(g, 21, -2, 1.3, 'porcelain', THIN);
  },

  /* The cash tin. Grey, locked, and not locked very well. */
  cashtin(g) {
    box(g, 0, -10, 20, 10, 'metal', THICK, 1.5);
    line(g, 0, -7, 20, -7);
    box(g, 8, -5, 4, 3, 'lamp-shade', THIN, 0.5);
    shape(g, 'M5 -10 Q10 -14 15 -10', 'none', THIN);
    shine(g, 'M2 -9 L5 -9 L5 -1 L2 -1 Z');
  },

  /* A guitar, leaning on the wall. */
  guitar(g) {
    const lean = add(g, 'g', { transform: 'rotate(-10 10 0)' });
    box(lean, 8, -56, 4, 32, 'wood-dark', THIN, 1);
    box(lean, 6.5, -62, 7, 8, 'wood-dark', THIN, 1.5);
    shape(lean, 'M10 -30 Q1 -30 2 -22 Q4 -17 1 -12 Q-2 -2 10 0 Q22 -2 19 -12 Q16 -17 18 -22 Q19 -30 10 -30 Z', 'pot');
    ball(lean, 10, -16, 3.2, 'ink-soft', THIN);
    box(lean, 6, -6, 8, 2.5, 'wood-dark', THIN, 0.5);
    line(lean, 9, -60, 9, -5);
    line(lean, 11, -60, 11, -5);
  }
};

/* Draw one bit of loot into g. */
export function drawLoot(loot, g) {
  const draw = LOOT_ART[loot.look] || LOOT_ART.cashtin;
  draw(g);
}
