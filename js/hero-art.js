/* ===========================================================
   HERO ART - how Hendrix is drawn

   Hendrix: this is you. Small, determined, a slight smirk, and
   camouflage from head to foot. Stand him at x 0, y 0 and he is
   drawn upwards from his feet, facing right.

   The camouflage is a pattern called pat-camo, made in
   js/house.js out of four colours in css/tokens.css. The parts
   that swing when you walk (legs, arms) have their own class
   names, so css/hero.css can move them.
   =========================================================== */

const NS = 'http://www.w3.org/2000/svg';

function add(g, tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  g.append(node);
  return node;
}

/* Draws Hendrix into g. Everything is inside, so move g to move him.
   camo says which camouflage pattern to use. */
export function drawHero(g, camo = 'url(#pat-camo)') {
  const CAMO = camo;
  /* shadow on the floor */
  add(g, 'ellipse', { cx: 0, cy: 0, rx: 10, ry: 2, class: 'p-shadow' });

  /* back arm, back leg (drawn first so they are behind) */
  const armBack = add(g, 'g', { class: 'hero-arm hero-arm-back' });
  add(armBack, 'rect', { x: -2.5, y: -31, width: 5, height: 14, rx: 2.5, fill: CAMO, class: 'p-ink' });
  add(armBack, 'circle', { cx: 0, cy: -16.5, r: 2.4, fill: 'var(--skin)', class: 'p-fine' });

  const legBack = add(g, 'g', { class: 'hero-leg hero-leg-back' });
  add(legBack, 'rect', { x: -4, y: -17, width: 6, height: 15, rx: 2, fill: CAMO, class: 'p-ink' });
  add(legBack, 'path', { d: 'M-4.5 -3 L3.5 -3 Q6 -3 6 0 L-4.5 0 Z', fill: 'var(--boots)', class: 'p-ink' });

  /* body */
  add(g, 'path', { d: 'M-7 -17 L-7.5 -30 Q-7 -34 -2 -34 L2 -34 Q7 -34 7.5 -30 L7 -17 Z', fill: CAMO, class: 'p-ink' });
  add(g, 'path', { d: 'M-7 -20 L7 -20', class: 'p-fine' });                      // belt
  add(g, 'rect', { x: 1, y: -29, width: 4, height: 4, rx: 0.8, fill: 'var(--camo-b)', class: 'p-fine' });   // pocket

  /* front leg */
  const legFront = add(g, 'g', { class: 'hero-leg hero-leg-front' });
  add(legFront, 'rect', { x: -2, y: -17, width: 6, height: 15, rx: 2, fill: CAMO, class: 'p-ink' });
  add(legFront, 'path', { d: 'M-2.5 -3 L5.5 -3 Q8 -3 8 0 L-2.5 0 Z', fill: 'var(--boots)', class: 'p-ink' });

  /* head */
  add(g, 'circle', { cx: 0, cy: -41, r: 7.5, fill: 'var(--skin)', class: 'p-ink' });
  add(g, 'path', { d: 'M-7 -42 Q-8 -47 -4 -47', fill: 'none', stroke: 'var(--hair)', 'stroke-width': 2.5, 'stroke-linecap': 'round' });
  /* camo cap with the peak pointing forward */
  add(g, 'path', { d: 'M-7.8 -43 Q-7 -50.5 0.5 -50.5 Q7 -50 7.6 -43 Z', fill: CAMO, class: 'p-ink' });
  add(g, 'path', { d: 'M5 -44 L12 -43 Q11.5 -41.5 6 -42 Z', fill: 'var(--camo-b)', class: 'p-fine' });
  /* face: eyes looking forward, camo paint stripes, and the smirk */
  add(g, 'circle', { cx: 2.6, cy: -41, r: 1.1, class: 'p-ink-fill' });
  add(g, 'circle', { cx: 5.8, cy: -41, r: 1.1, class: 'p-ink-fill' });
  add(g, 'path', { d: 'M1 -38.6 L4.2 -38.6 M5 -38.6 L7 -38.6', stroke: 'var(--camo-b)', 'stroke-width': 1.3, 'stroke-linecap': 'round' });
  add(g, 'path', { d: 'M2.4 -36 Q4.8 -35 6.6 -37', fill: 'none', class: 'p-fine' });

  /* front arm */
  const armFront = add(g, 'g', { class: 'hero-arm hero-arm-front' });
  add(armFront, 'rect', { x: -2.5, y: -31, width: 5, height: 14, rx: 2.5, fill: CAMO, class: 'p-ink' });
  add(armFront, 'circle', { cx: 0, cy: -16.5, r: 2.4, fill: 'var(--skin)', class: 'p-fine' });
}

/* A little picture of Hendrix on his own, for the workshop. The
   camo pattern lives in the house picture, so this one brings its
   own copy, with its own name so the two never get mixed up. */
export function heroPicture() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '-16 -54 32 56');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('hero-picture');
  const defs = add(svg, 'defs', {});
  const pat = add(defs, 'pattern', { id: 'pat-camo-picture', width: 14, height: 14, patternUnits: 'userSpaceOnUse' });
  add(pat, 'rect', { width: 14, height: 14, fill: 'var(--camo-a)' });
  add(pat, 'path', { d: 'M1 2 Q4 0 6 3 Q5 6 2 5 Z M9 8 Q13 7 13 11 Q10 13 8 11 Z', fill: 'var(--camo-b)' });
  add(pat, 'path', { d: 'M8 1 Q11 1 11 4 Q9 5 7 3 Z M1 9 Q4 8 5 11 Q3 13 1 12 Z', fill: 'var(--camo-c)' });
  add(pat, 'path', { d: 'M5 6 Q7 6 7 8 Q6 9 5 8 Z M11 12 Q12 13 11 14 L10 13 Z', fill: 'var(--camo-d)' });
  const g = add(svg, 'g', {});
  drawHero(g, 'url(#pat-camo-picture)');
  return svg;
}
