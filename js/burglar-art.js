/* ===========================================================
   BURGLAR ART - how Sid and Bruno are drawn

   Same idea as js/hero-art.js: stand him at x 0, y 0 and he is
   drawn upwards from his feet, facing right.

   Sid is tall and thin with a stripy jumper and worried eyes.
   Bruno is short, wide and bored. Both wear a beanie and the eye
   mask, because they are burglars in a cartoon.

   Each one carries a sack over his shoulder. js/night.js makes
   the sack fatter every time he takes something, so you can see
   how badly your night is going.

   Their colours are in css/tokens.css: --burglar-a is Sid's
   jumper, --burglar-b is Bruno's, --burglar-mask is the black.
   The legs and arms have class names so css/night.css can swing
   them when they walk.
   =========================================================== */

const NS = 'http://www.w3.org/2000/svg';

function add(g, tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  g.append(node);
  return node;
}

/* A limb that swings from the top: an outer group puts it in
   place, the inner one (with the class) swings. */
function limb(g, cls) {
  return add(g, 'g', { class: `b-limb ${cls}` });
}

/* The sack, over the back shoulder. The part that grows is its
   own group, so js/night.js can make it fatter. */
function sack(g, x, y) {
  const at = add(g, 'g', { transform: `translate(${x} ${y})` });
  const grow = add(at, 'g', { class: 'b-sack' });
  add(grow, 'path', { d: 'M0 0 Q-13 1 -14 11 Q-14 21 -6 22 Q2 21 2 11 Z', fill: 'var(--sack)', class: 'p-ink' });
  add(grow, 'path', { d: 'M-1 0 Q-3 -3 1 -4', fill: 'none', class: 'p-fine' });
  return grow;
}

function sid(g) {
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 11, ry: 2, class: 'p-shadow' });

  const bag = sack(g, -6, -58);

  const armBack = limb(g, 'b-arm b-arm-back');
  add(armBack, 'rect', { x: -2.5, y: -58, width: 5, height: 24, rx: 2.5, fill: 'var(--burglar-a)', class: 'p-ink' });
  add(armBack, 'circle', { cx: 0, cy: -34, r: 3, fill: 'var(--skin)', class: 'p-fine' });

  const legBack = limb(g, 'b-leg b-leg-back');
  add(legBack, 'rect', { x: -5, y: -32, width: 5.5, height: 29, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(legBack, 'path', { d: 'M-7 0 L-7 -3 Q-7 -5 -4.5 -5 L1 -5 Q4.5 -4.5 4.5 -1.5 L4.5 0 Z', fill: 'var(--ink-soft)', class: 'p-ink' });

  /* the stripy jumper */
  add(g, 'path', { d: 'M-8 -30 Q-10 -46 -8 -56 Q-6 -61 0 -61 Q7 -61 8 -56 Q10 -46 8 -30 Z', fill: 'var(--burglar-a)', class: 'p-ink' });
  add(g, 'path', { d: 'M-9 -50 L9 -50 M-9.3 -42 L9.3 -42 M-8.8 -34 L8.8 -34', fill: 'none', class: 'b-stripe' });

  const legFront = limb(g, 'b-leg b-leg-front');
  add(legFront, 'rect', { x: -1, y: -32, width: 5.5, height: 29, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(legFront, 'path', { d: 'M-3 0 L-3 -3 Q-3 -5 -0.5 -5 L5 -5 Q8.5 -4.5 8.5 -1.5 L8.5 0 Z', fill: 'var(--ink-soft)', class: 'p-ink' });

  /* a long neck and a small worried head */
  add(g, 'rect', { x: -1.5, y: -64, width: 4, height: 5, fill: 'var(--skin)', class: 'p-fine' });
  add(g, 'circle', { cx: 1, cy: -70, r: 9, fill: 'var(--skin)', class: 'p-ink' });
  add(g, 'path', { d: 'M-8.5 -71 Q-8 -81 1 -81 Q10 -81 10.5 -71 Z', fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(g, 'rect', { x: -9.5, y: -73.5, width: 21, height: 3.5, rx: 1.5, fill: 'var(--burglar-mask)', class: 'p-fine' });
  add(g, 'rect', { x: -8.2, y: -71.5, width: 19, height: 5, rx: 2, fill: 'var(--burglar-mask)' });
  /* wide worried eyes, looking about */
  add(g, 'circle', { cx: 4, cy: -69, r: 2.4, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 8.6, cy: -69, r: 2.2, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 4.6, cy: -69.4, r: 1, class: 'p-ink-fill' });
  add(g, 'circle', { cx: 9.2, cy: -69.4, r: 1, class: 'p-ink-fill' });
  /* a pointy nose, and a mouth that has made a mistake */
  add(g, 'path', { d: 'M9.6 -67 L13.5 -64.2 L9.8 -63.4', fill: 'var(--skin)', class: 'p-fine' });
  add(g, 'path', { d: 'M3.6 -61.6 Q5 -62.8 6.4 -61.8 Q7.6 -61 8.6 -62', fill: 'none', class: 'p-fine' });

  const armFront = limb(g, 'b-arm b-arm-front');
  add(armFront, 'rect', { x: -1, y: -58, width: 5, height: 24, rx: 2.5, fill: 'var(--burglar-a)', class: 'p-ink' });
  add(armFront, 'circle', { cx: 1.5, cy: -34, r: 3, fill: 'var(--skin)', class: 'p-fine' });

  return bag;
}

function bruno(g) {
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 17, ry: 2.4, class: 'p-shadow' });

  const bag = sack(g, -12, -54);

  const armBack = limb(g, 'b-arm b-arm-back');
  add(armBack, 'rect', { x: -4, y: -52, width: 8, height: 24, rx: 4, fill: 'var(--burglar-b)', class: 'p-ink' });
  add(armBack, 'circle', { cx: 0, cy: -28, r: 4, fill: 'var(--skin)', class: 'p-fine' });

  const legBack = limb(g, 'b-leg b-leg-back');
  add(legBack, 'rect', { x: -10, y: -25, width: 9, height: 21, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(legBack, 'path', { d: 'M-12 0 L-12 -3 Q-12 -5 -9 -5 L-1 -5 Q3 -4.5 3 -1.5 L3 0 Z', fill: 'var(--ink-soft)', class: 'p-ink' });

  /* the enormous body */
  add(g, 'path', { d: 'M-15 -22 Q-19 -40 -15 -52 Q-12 -58 0 -58 Q12 -58 15 -52 Q19 -40 15 -22 Q0 -18 -15 -22 Z', fill: 'var(--burglar-b)', class: 'p-ink' });
  add(g, 'path', { d: 'M-3 -56 L-3 -22', fill: 'none', class: 'p-fine' });

  const legFront = limb(g, 'b-leg b-leg-front');
  add(legFront, 'rect', { x: 1, y: -25, width: 9, height: 21, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(legFront, 'path', { d: 'M-1 0 L-1 -3 Q-1 -5 2 -5 L10 -5 Q14 -4.5 14 -1.5 L14 0 Z', fill: 'var(--ink-soft)', class: 'p-ink' });

  /* a square head, straight on to the shoulders */
  add(g, 'rect', { x: -9, y: -77, width: 20, height: 21, rx: 5, fill: 'var(--skin)', class: 'p-ink' });
  add(g, 'path', { d: 'M-10 -70 Q-9 -85 1 -85 Q11 -85 12 -70 Z', fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(g, 'rect', { x: -11, y: -72.5, width: 24, height: 4, rx: 1.5, fill: 'var(--burglar-mask)', class: 'p-fine' });
  add(g, 'rect', { x: -9, y: -70.5, width: 20, height: 6, rx: 2, fill: 'var(--burglar-mask)' });
  /* bored eyes, half shut */
  add(g, 'circle', { cx: 3.4, cy: -67.4, r: 2.4, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 8.4, cy: -67.4, r: 2.4, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 3.8, cy: -66.8, r: 1, class: 'p-ink-fill' });
  add(g, 'circle', { cx: 8.8, cy: -66.8, r: 1, class: 'p-ink-fill' });
  add(g, 'path', { d: 'M1 -67.4 A2.4 2.4 0 0 1 5.8 -67.4 Z M6 -67.4 A2.4 2.4 0 0 1 10.8 -67.4 Z', fill: 'var(--burglar-mask)' });
  /* a big nose, stubble, and a flat mouth */
  add(g, 'ellipse', { cx: 11.5, cy: -63.2, rx: 2.4, ry: 1.9, fill: 'var(--skin)', class: 'p-fine' });
  add(g, 'path', { d: 'M3 -59.4 L9.5 -59.4', fill: 'none', class: 'p-fine' });
  [[-5, -60], [-3, -58.6], [0, -58], [11, -58.4], [-6, -62.5]].forEach(([x, y]) =>
    add(g, 'circle', { cx: x, cy: y, r: 0.4, class: 'p-ink-fill' }));

  const armFront = limb(g, 'b-arm b-arm-front');
  add(armFront, 'rect', { x: 2, y: -52, width: 8, height: 24, rx: 4, fill: 'var(--burglar-b)', class: 'p-ink' });
  add(armFront, 'circle', { cx: 6, cy: -28, r: 4, fill: 'var(--skin)', class: 'p-fine' });

  return bag;
}

const LOOKS = { sid, bruno };

/* Draw a burglar into g. Hands back his sack, so it can grow. */
export function drawBurglar(g, look) {
  return (LOOKS[look] || LOOKS.sid)(g);
}

/* How tall each one is, so a speech bubble sits over his head. */
export const HEIGHT = { sid: 82, bruno: 86 };

/* Where things are on each of them, for js/fx.js: the middle of
   his head, how wide he is from the middle, and the top of his
   hat. A bucket lands on head, flour covers the rest. */
export const BODY = {
  sid:   { head: [1, -70], half: 10, top: -82 },
  bruno: { head: [1, -67], half: 16, top: -86 }
};
