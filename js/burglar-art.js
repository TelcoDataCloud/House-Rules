/* ===========================================================
   BURGLAR ART - how Sid and Bruno are drawn

   Same idea as js/hero-art.js: stand him at x 0, y 0 and he is
   drawn upwards from his feet, facing right.

   Sid is tall and thin with a stripy jumper and worried eyes.
   Bruno is short, wide and bored. Both wear a beanie and the eye
   mask, because they are burglars in a cartoon.

   Since M17 there are three more:
   Twiggy is tiny and fast, in a hoodie with the hood up.
   Dolores is very posh: a headscarf, pearls, and a long coat.
   Big Norm is enormous, slow, and wears a flat cap.

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

/* Two legs and two arms that swing, the same for everybody. */
function legs(g, x1, x2, top, w, h, shoe) {
  const back = limb(g, 'b-leg b-leg-back');
  add(back, 'rect', { x: x1, y: top, width: w, height: h, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
  add(back, 'path', { d: `M${x1 - 2} 0 L${x1 - 2} -3 Q${x1 - 2} -5 ${x1 + 0.5} -5 L${x1 + w + shoe} -5 Q${x1 + w + shoe + 3} -4.5 ${x1 + w + shoe + 3} -1.5 L${x1 + w + shoe + 3} 0 Z`, fill: 'var(--ink-soft)', class: 'p-ink' });
  return () => {
    const front = limb(g, 'b-leg b-leg-front');
    add(front, 'rect', { x: x2, y: top, width: w, height: h, rx: 2, fill: 'var(--burglar-mask)', class: 'p-ink' });
    add(front, 'path', { d: `M${x2 - 2} 0 L${x2 - 2} -3 Q${x2 - 2} -5 ${x2 + 0.5} -5 L${x2 + w + shoe} -5 Q${x2 + w + shoe + 3} -4.5 ${x2 + w + shoe + 3} -1.5 L${x2 + w + shoe + 3} 0 Z`, fill: 'var(--ink-soft)', class: 'p-ink' });
  };
}
function arm(g, cls, x, top, w, h, colour) {
  const a = limb(g, `b-arm ${cls}`);
  add(a, 'rect', { x, y: top, width: w, height: h, rx: w / 2, fill: colour, class: 'p-ink' });
  add(a, 'circle', { cx: x + w / 2, cy: top + h, r: w * 0.6, fill: 'var(--skin)', class: 'p-fine' });
}
/* the eye mask and two eyes, looking right */
function eyes(g, x, y, r = 2.2) {
  add(g, 'rect', { x: x - 6, y: y - 3, width: 18, height: 5.5, rx: 2, fill: 'var(--burglar-mask)' });
  add(g, 'circle', { cx: x, cy: y, r, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: x + 5, cy: y, r, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: x + 0.6, cy: y - 0.2, r: 0.95, class: 'p-ink-fill' });
  add(g, 'circle', { cx: x + 5.6, cy: y - 0.2, r: 0.95, class: 'p-ink-fill' });
}

/* Twiggy: small, quick, hood up, never stops fidgeting. */
function twiggy(g) {
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 9, ry: 1.8, class: 'p-shadow' });
  const bag = sack(g, -5, -44);
  arm(g, 'b-arm-back', -2, -44, 4.5, 18, 'var(--burglar-c)');
  const front = legs(g, -4.5, -0.5, -24, 4.5, 21, 2);
  add(g, 'path', { d: 'M-7 -22 Q-8 -36 -6 -44 Q-4 -47 0 -47 Q5 -47 6.5 -44 Q8 -36 7 -22 Z', fill: 'var(--burglar-c)', class: 'p-ink' });
  add(g, 'path', { d: 'M-4 -30 L5 -30', fill: 'none', class: 'p-fine' });          // hoodie pocket
  front();
  /* head in a hood */
  add(g, 'circle', { cx: 1, cy: -55, r: 9.5, fill: 'var(--burglar-c)', class: 'p-ink' });
  add(g, 'circle', { cx: 2.5, cy: -54, r: 6.8, fill: 'var(--skin)', class: 'p-fine' });
  eyes(g, 2, -55, 2);
  add(g, 'path', { d: 'M3 -50.5 Q5 -49 7 -50.5', fill: 'none', class: 'p-fine' });
  add(g, 'path', { d: 'M-4 -64 Q1 -66 6 -63', fill: 'none', class: 'p-fine' });     // hood string
  arm(g, 'b-arm-front', -0.5, -44, 4.5, 18, 'var(--burglar-c)');
  return bag;
}

/* Dolores: very posh, very rude, a headscarf and pearls. */
function dolores(g) {
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 12, ry: 2, class: 'p-shadow' });
  const bag = sack(g, -8, -54);
  arm(g, 'b-arm-back', -2.5, -54, 5, 22, 'var(--burglar-d)');
  const front = legs(g, -5, -0.5, -20, 4.5, 17, 1);
  /* a long coat, flared at the bottom */
  add(g, 'path', { d: 'M-8 -56 Q-12 -40 -13 -18 L13 -18 Q12 -40 8 -56 Q4 -59 0 -59 Q-4 -59 -8 -56 Z', fill: 'var(--burglar-d)', class: 'p-ink' });
  add(g, 'path', { d: 'M0 -58 L0 -18', fill: 'none', class: 'p-fine' });
  [-50, -42, -34].forEach((y) => add(g, 'circle', { cx: 2.5, cy: y, r: 1, fill: 'var(--lamp-shade)', class: 'p-fine' }));
  front();
  /* pearls, a neck, a head, a headscarf tied under the chin */
  [-5, -2.5, 0, 2.5, 5].forEach((x, i) => add(g, 'circle', { cx: x, cy: -58.5 + Math.abs(i - 2) * -0.6, r: 1.3, fill: 'var(--pearl)', class: 'p-fine' }));
  add(g, 'circle', { cx: 1, cy: -68, r: 8.5, fill: 'var(--skin)', class: 'p-ink' });
  add(g, 'path', { d: 'M-8.5 -66 Q-9 -79 1 -79 Q11 -79 10.5 -66 L8 -63 L8 -69 Q1 -76 -6 -69 L-6 -62 Z', fill: 'var(--fabric-a)', class: 'p-ink' });
  eyes(g, 3, -68, 2.1);
  add(g, 'path', { d: 'M9.5 -66 L12 -64 L9.5 -63', fill: 'var(--skin)', class: 'p-fine' });   // a nose in the air
  add(g, 'path', { d: 'M3.5 -62.5 L7.5 -62.8', fill: 'none', class: 'p-fine' });
  arm(g, 'b-arm-front', 0, -54, 5, 22, 'var(--burglar-d)');
  return bag;
}

/* Big Norm: huge, slow, flat cap, does not scare easily. */
function norm(g) {
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 19, ry: 2.6, class: 'p-shadow' });
  const bag = sack(g, -14, -64);
  arm(g, 'b-arm-back', -4.5, -64, 9, 30, 'var(--burglar-e)');
  const front = legs(g, -12, 2, -32, 10, 28, 3);
  add(g, 'path', { d: 'M-17 -30 Q-21 -50 -17 -64 Q-13 -70 0 -70 Q13 -70 17 -64 Q21 -50 17 -30 Q0 -26 -17 -30 Z', fill: 'var(--burglar-e)', class: 'p-ink' });
  add(g, 'path', { d: 'M-8 -68 L-8 -44 L8 -44 L8 -68', fill: 'none', class: 'p-fine' });   // dungarees bib
  front();
  add(g, 'rect', { x: -10, y: -92, width: 22, height: 23, rx: 6, fill: 'var(--skin)', class: 'p-ink' });
  add(g, 'path', { d: 'M-11 -88 Q-10 -98 2 -98 Q13 -98 13 -90 L20 -88 Q20 -85 13 -86 L-11 -86 Z', fill: 'var(--wood-dark)', class: 'p-ink' });  // flat cap
  eyes(g, 3, -81, 2.4);
  add(g, 'ellipse', { cx: 12.5, cy: -77, rx: 2.6, ry: 2, fill: 'var(--skin)', class: 'p-fine' });
  add(g, 'path', { d: 'M1 -72.5 Q6 -71 10 -72.5', fill: 'none', class: 'p-fine' });
  add(g, 'path', { d: 'M-2 -75 Q5 -73 11 -75', fill: 'var(--hair)', class: 'p-fine' });           // a moustache
  arm(g, 'b-arm-front', 3, -64, 9, 30, 'var(--burglar-e)');
  return bag;
}

const LOOKS = { sid, bruno, twiggy, dolores, norm };

/* Draw a burglar into g. Hands back his sack, so it can grow. */
export function drawBurglar(g, look) {
  return (LOOKS[look] || LOOKS.sid)(g);
}

/* How tall each one is, so a speech bubble sits over his head. */
export const HEIGHT = { sid: 82, bruno: 86, twiggy: 66, dolores: 80, norm: 99 };

/* Where things are on each of them, for js/fx.js: the middle of
   his head, how wide he is from the middle, and the top of his
   hat. A bucket lands on head, flour covers the rest. */
export const BODY = {
  sid:     { head: [1, -70], half: 10, top: -82 },
  bruno:   { head: [1, -67], half: 16, top: -86 },
  twiggy:  { head: [2, -55], half: 8,  top: -66 },
  dolores: { head: [1, -68], half: 12, top: -80 },
  norm:    { head: [1, -81], half: 18, top: -99 }
};
