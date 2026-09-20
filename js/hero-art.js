/* ===========================================================
   HERO ART - how Hendrix is drawn

   Hendrix: this is you. A kid in stripy pyjamas and slippers,
   out of bed when you should be asleep, with messy hair and a
   slight smirk. Stand him at x 0, y 0 and he is drawn upwards
   from his feet, facing right.

   Kids are drawn with a BIG head and a small body. That is the
   trick that makes a cartoon look young. Try making the head
   radius (the 11 on the head circle) smaller and watch him turn
   into a grown up.

   The pyjama stripes are a pattern made from two colours in
   css/tokens.css: --pj-a and --pj-b. The parts that swing when
   you walk (legs, arms) have their own class names, so
   css/hero.css can move them.
   =========================================================== */

const NS = 'http://www.w3.org/2000/svg';

function add(g, tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  g.append(node);
  return node;
}

/* The pyjama stripes, as a pattern you can paint with. js/hero.js
   makes one called pat-pyjamas next to Hendrix in the house; the
   workshop portrait makes its own copy with a different name. */
export function pyjamaPattern(defs, id) {
  const pat = add(defs, 'pattern', { id, width: 6, height: 6, patternUnits: 'userSpaceOnUse' });
  add(pat, 'rect', { width: 6, height: 6, fill: 'var(--pj-a)' });
  add(pat, 'rect', { x: 0, width: 2.2, height: 6, fill: 'var(--pj-b)' });
}

/* Draws Hendrix into g. Everything is inside, so move g to move him.
   pj says which pyjama pattern to use. */
export function drawHero(g, pj = 'url(#pat-pyjamas)') {
  const PJ = pj;
  /* shadow on the floor */
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 9, ry: 1.8, class: 'p-shadow' });

  /* back arm and back leg, drawn first so they sit behind */
  const armBack = add(g, 'g', { class: 'hero-arm hero-arm-back' });
  add(armBack, 'rect', { x: -2.2, y: -24, width: 4.4, height: 10, rx: 2.2, fill: PJ, class: 'p-ink' });
  add(armBack, 'circle', { cx: 0, cy: -13.5, r: 2.3, fill: 'var(--skin)', class: 'p-fine' });

  const legBack = add(g, 'g', { class: 'hero-leg hero-leg-back' });
  add(legBack, 'rect', { x: -4, y: -13, width: 5.5, height: 11, rx: 2, fill: PJ, class: 'p-ink' });
  add(legBack, 'path', { d: 'M-5 -2.6 Q-5 -4.2 -2.5 -4.2 L1.5 -4.2 Q5 -4 5.5 -1 L5.5 0 L-5 0 Z', fill: 'var(--slippers)', class: 'p-ink' });

  /* pyjama top: short and a bit baggy, with a collar and buttons */
  add(g, 'path', { d: 'M-6.5 -12 Q-7.5 -20 -6 -25 Q-5 -27 -2 -27 L2 -27 Q5 -27 6 -25 Q7.5 -20 6.5 -12 Q0 -10.5 -6.5 -12 Z', fill: PJ, class: 'p-ink' });
  add(g, 'path', { d: 'M-3 -27 L0 -23.5 L3 -27', fill: 'var(--pj-b)', class: 'p-fine' });
  add(g, 'circle', { cx: 1.5, cy: -20.5, r: 0.8, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 1.5, cy: -16.5, r: 0.8, fill: 'var(--porcelain)', class: 'p-fine' });

  /* front leg */
  const legFront = add(g, 'g', { class: 'hero-leg hero-leg-front' });
  add(legFront, 'rect', { x: -1.5, y: -13, width: 5.5, height: 11, rx: 2, fill: PJ, class: 'p-ink' });
  add(legFront, 'path', { d: 'M-2.5 -2.6 Q-2.5 -4.2 0 -4.2 L4 -4.2 Q7.5 -4 8 -1 L8 0 L-2.5 0 Z', fill: 'var(--slippers)', class: 'p-ink' });
  add(legFront, 'circle', { cx: 5.5, cy: -3.2, r: 1.1, fill: 'var(--porcelain)', class: 'p-fine' });    // pom pom

  /* the big head */
  add(g, 'circle', { cx: -9.8, cy: -36, r: 2.6, fill: 'var(--skin)', class: 'p-fine' });               // ear
  add(g, 'circle', { cx: 0, cy: -37, r: 11, fill: 'var(--skin)', class: 'p-ink' });
  /* messy hair, with a tuft sticking straight up from the pillow */
  add(g, 'path', {
    d: 'M-11 -37 Q-12 -46 -5 -48.5 Q-1 -52 3 -48.5 Q7 -50 9 -46 Q11.5 -43 10.5 -40 Q7 -43 3 -42.5 Q-1 -44 -4 -42 Q-6 -40 -8 -36 Q-10 -35 -11 -37 Z',
    fill: 'var(--hair)', class: 'p-ink'
  });
  add(g, 'path', { d: 'M-1 -49 Q-2 -54 1.5 -55.5 Q0.5 -52 2 -49.5', fill: 'var(--hair)', class: 'p-fine' });
  /* big eyes looking forward, with a shine in each */
  add(g, 'ellipse', { cx: 2.2, cy: -36.5, rx: 2.3, ry: 2.9, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'ellipse', { cx: 7.4, cy: -36.5, rx: 2.1, ry: 2.7, fill: 'var(--porcelain)', class: 'p-fine' });
  add(g, 'circle', { cx: 3.2, cy: -36.2, r: 1.3, class: 'p-ink-fill' });
  add(g, 'circle', { cx: 8.2, cy: -36.2, r: 1.2, class: 'p-ink-fill' });
  add(g, 'circle', { cx: 3.6, cy: -36.8, r: 0.45, fill: 'var(--porcelain)' });
  add(g, 'circle', { cx: 8.6, cy: -36.8, r: 0.45, fill: 'var(--porcelain)' });
  /* eyebrows up to something, a faint pink cheek, freckles */
  add(g, 'path', { d: 'M0.4 -40.8 Q2.2 -41.8 4 -40.9 M6 -40.6 Q7.6 -41.4 9.2 -40.3', fill: 'none', class: 'p-fine' });
  add(g, 'ellipse', { cx: 1.6, cy: -32.6, rx: 1.8, ry: 1, fill: 'var(--cheek)', opacity: 0.55 });
  [[0.6, -33.6], [2.2, -34], [3.4, -33.2]].forEach(([x, y]) => add(g, 'circle', { cx: x, cy: y, r: 0.35, class: 'p-ink-fill' }));
  /* the nose: a little button that sticks out past the face, with a
     nostril, drawn in skin colour so it is part of him */
  add(g, 'path', { d: 'M9 -34.8 Q12.8 -34.2 12.8 -31.8 Q12.6 -30.2 10.2 -30.4 Q8.8 -30.6 8.4 -31.6', fill: 'var(--skin)', class: 'p-fine' });
  add(g, 'path', { d: 'M10 -31.4 Q10.7 -30.9 11.2 -31.4', fill: 'none', class: 'p-fine' });
  /* and the smirk, pulled up at one side */
  add(g, 'path', { d: 'M4.4 -28.8 Q6.8 -27.8 9.4 -29.4', fill: 'none', class: 'p-fine' });

  /* front arm */
  const armFront = add(g, 'g', { class: 'hero-arm hero-arm-front' });
  add(armFront, 'rect', { x: -2.2, y: -24, width: 4.4, height: 10, rx: 2.2, fill: PJ, class: 'p-ink' });
  add(armFront, 'circle', { cx: 0, cy: -13.5, r: 2.3, fill: 'var(--skin)', class: 'p-fine' });
}

/* A little picture of Hendrix on his own, for the workshop. It
   brings its own pyjama pattern, with its own name, so it never
   depends on the house picture. */
export function heroPicture() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-16 -58 32 60');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('hero-picture');
  const defs = add(svg, 'defs', {});
  pyjamaPattern(defs, 'pat-pyjamas-picture');
  const g = add(svg, 'g', {});
  drawHero(g, 'url(#pat-pyjamas-picture)');
  return svg;
}
