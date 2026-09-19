/* ===========================================================
   HOUSE - draws the cut-open house

   The house is a dollhouse view: the front wall has been taken
   off so you can see every room at once.

   The important idea in this file is that it does NOT know the
   name of a single room. It reads data/rooms.js and draws
   whatever is in the list. Add a room to that file and it
   appears here. Move a room and it moves here. That is why the
   data folder belongs to Hendrix and this folder does not.

   Everything is SVG, so right click any wall, choose Inspect,
   and the browser will show you the exact line that drew it.
   =========================================================== */

import { PICTURE, ROOMS, STAIRS, ANCHORS, MOUNTS } from '../data/rooms.js';
import { drawProp } from './props.js';

const NS = 'http://www.w3.org/2000/svg';

/* A tiny helper so the drawing code below stays readable.
   make('rect', { x: 10, y: 10 }) gives you an SVG rectangle. */
function make(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  return node;
}

function findRoom(id) {
  return ROOMS.find((room) => room.id === id);
}

/* --- PATTERNS AND GLOWS ---------------------------------------
   Bricks, roof tiles, floorboards and tiles are drawn once here as
   a repeating pattern, then used like a paint colour. Their
   colours still come from tokens.css.
   ------------------------------------------------------------ */

function pattern(defs, id, w, h, parts) {
  const p = make('pattern', { id, width: w, height: h, patternUnits: 'userSpaceOnUse' });
  parts.forEach(([tag, attrs]) => p.append(make(tag, attrs)));
  defs.append(p);
}

function gradient(defs, id, kind, stops, extra = {}) {
  const tag = kind === 'radial' ? 'radialGradient' : 'linearGradient';
  const g = make(tag, { id, ...extra });
  stops.forEach(([offset, colour, opacity]) =>
    g.append(make('stop', { offset, 'stop-color': colour, 'stop-opacity': opacity })));
  defs.append(g);
}

function drawDefs(svg) {
  const defs = make('defs');
  const line = (d, colour, width, opacity = 1) =>
    ['path', { d, fill: 'none', stroke: colour, 'stroke-width': width, 'stroke-opacity': opacity }];

  pattern(defs, 'pat-bricks', 26, 14, [
    ['rect', { width: 26, height: 14, fill: 'var(--wall)' }],
    line('M0 0.5 H26 M0 7.5 H26 M6 0 V7 M19 7 V14', 'var(--mortar)', 1.4)
  ]);
  pattern(defs, 'pat-roof', 22, 12, [
    ['rect', { width: 22, height: 12, fill: 'var(--roof)' }],
    line('M0 12 Q5.5 3 11 12 Q16.5 3 22 12', 'var(--ink)', 1.6, 0.4)
  ]);
  pattern(defs, 'pat-planks', 14, 40, [
    ['rect', { width: 14, height: 40, fill: 'var(--wood)' }],
    line('M0.5 0 V40', 'var(--ink)', 1.4, 0.45),
    ['circle', { cx: 7, cy: 6, r: 0.9, fill: 'var(--ink)', 'fill-opacity': 0.4 }]
  ]);
  pattern(defs, 'pat-stone', 36, 20, [
    ['rect', { width: 36, height: 20, fill: 'var(--room-cellar)' }],
    line('M0 0.5 H36 M0 10.5 H36 M12 0 V10 M30 10 V20', 'var(--ink)', 1.3, 0.22)
  ]);
  pattern(defs, 'pat-stripes', 14, 10, [
    line('M3 0 V10', 'var(--ink)', 4, 0.05)
  ]);
  pattern(defs, 'pat-wall-tiles', 12, 12, [
    ['rect', { width: 12, height: 12, fill: 'var(--wall-tile)', stroke: 'var(--grout)', 'stroke-width': 1.2 }]
  ]);
  pattern(defs, 'pat-floor-wood', 34, 12, [
    ['rect', { width: 34, height: 12, fill: 'var(--floor-wood)' }],
    line('M0 6 H34 M10 0 V6 M26 6 V12', 'var(--ink)', 1.1, 0.3)
  ]);
  pattern(defs, 'pat-floor-tile', 14, 12, [
    ['rect', { width: 14, height: 12, fill: 'var(--floor-tile)', stroke: 'var(--ink)', 'stroke-opacity': 0.18, 'stroke-width': 1 }]
  ]);
  pattern(defs, 'pat-floor-carpet', 8, 8, [
    ['rect', { width: 8, height: 8, fill: 'var(--floor-carpet)' }],
    ['circle', { cx: 2, cy: 2, r: 0.8, fill: 'var(--ink)', 'fill-opacity': 0.12 }]
  ]);
  pattern(defs, 'pat-floor-concrete', 20, 12, [
    ['rect', { width: 20, height: 12, fill: 'var(--floor-concrete)' }],
    ['circle', { cx: 5, cy: 4, r: 0.9, fill: 'var(--ink)', 'fill-opacity': 0.2 }],
    ['circle', { cx: 15, cy: 9, r: 0.7, fill: 'var(--ink)', 'fill-opacity': 0.2 }]
  ]);

  gradient(defs, 'grad-sky', 'linear',
    [['0%', 'var(--sky-top)', 1], ['100%', 'var(--sky-bottom)', 1]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  gradient(defs, 'grad-ceiling', 'linear',
    [['0%', 'var(--ink)', 0.38], ['100%', 'var(--ink)', 0]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  gradient(defs, 'grad-lamp', 'radial',
    [['0%', 'var(--lamp-glow)', 0.95], ['100%', 'var(--lamp-glow)', 0]]);

  svg.append(defs);
}

/* --- THE SHELL ----------------------------------------------
   The sky, the garden, the brick walls, the roof and the beams
   between floors. None of these have numbers of their own. They
   measure the rooms in data/rooms.js and wrap themselves around
   whatever they find, so moving a room moves the walls.
   ------------------------------------------------------------ */

/* The top, bottom, left and right edge of every room on a floor. */
function measure(floor) {
  const rooms = ROOMS.filter((room) => room.floor === floor);
  if (rooms.length === 0) return null;
  return {
    top: Math.min(...rooms.map((r) => r.y)),
    bottom: Math.max(...rooms.map((r) => r.y + r.h)),
    left: Math.min(...rooms.map((r) => r.x)),
    right: Math.max(...rooms.map((r) => r.x + r.w))
  };
}

function box(parent, x, y, w, h, fill, cls = 'ink', extra = {}) {
  const node = make('rect', { x, y, width: w, height: h, fill, class: cls, ...extra });
  parent.append(node);
  return node;
}
function path(parent, d, fill, cls = 'ink') {
  const node = make('path', { d, fill, class: cls });
  parent.append(node);
  return node;
}

function drawSky(shell, W, H) {
  box(shell, 0, 0, W, H, 'url(#grad-sky)', '');
  const night = make('g', { class: 'night-only' });
  night.append(make('circle', { cx: W - 90, cy: 70, r: 32, fill: 'var(--moon)', class: 'ink-thin' }));
  night.append(make('circle', { cx: W - 100, cy: 62, r: 6, fill: 'var(--sky-top)', opacity: 0.25 }));
  [[70, 60], [150, 110], [880, 150], [960, 210], [40, 190], [720, 40]].forEach(([x, y], i) =>
    night.append(make('circle', { cx: x, cy: y, r: i % 2 ? 2 : 2.8, fill: 'var(--star)', class: i % 2 ? 'twinkle' : 'twinkle-b' })));
  shell.append(night);
  const day = make('g', { class: 'day-only' });
  day.append(make('circle', { cx: W - 90, cy: 70, r: 30, fill: 'var(--lamp-shade)', class: 'ink-thin' }));
  shell.append(day);
}

function drawGround(shell, W, H, grass) {
  path(shell, `M0 ${grass} L${W} ${grass} L${W} ${H} L0 ${H} Z`, 'var(--earth)');
  [[60, 640], [180, 700], [330, 612], [420, 690], [880, 620], [960, 690], [980, 600], [120, 600]]
    .forEach(([x, y], i) => shell.append(make('ellipse', {
      cx: x, cy: y, rx: 7 + (i % 3) * 3, ry: 4 + (i % 2) * 2, fill: 'var(--ink)', 'fill-opacity': 0.18
    })));
  box(shell, 0, grass - 2, W, 14, 'var(--ground)', '');
  let tufts = '';
  for (let x = 6; x < W; x += 23) tufts += `M${x} ${grass} l3 -7 l3 7 l3 -5 l2 5 `;
  path(shell, tufts, 'var(--ground)', 'ink-thin');
}

function drawShell(svg) {
  const shell = make('g');
  const W = PICTURE.w;
  const H = PICTURE.h;

  const up = measure('upstairs');
  const down = measure('ground');
  const attic = measure('attic');

  /* The outside walls are a proper thickness of brick. */
  const brick = 12;
  const wallLeft = Math.min(up.left, down.left) - brick;
  const wallRight = Math.max(up.right, down.right) + brick;
  const wallTop = up.top - brick;
  const grass = down.bottom;

  drawSky(shell, W, H);
  drawGround(shell, W, H, grass);

  /* A bush by the front door, and the porch light. */
  path(shell, `M${wallLeft - 44} ${grass} Q${wallLeft - 50} ${grass - 30} ${wallLeft - 30} ${grass - 34} Q${wallLeft - 14} ${grass - 40} ${wallLeft - 6} ${grass - 22} Q${wallLeft} ${grass - 8} ${wallLeft - 4} ${grass} Z`, 'var(--hedge)');
  shell.append(make('ellipse', { cx: wallLeft - 4, cy: grass - 88, rx: 26, ry: 30, fill: 'url(#grad-lamp)', class: 'room-glow' }));
  box(shell, wallLeft - 10, grass - 96, 8, 12, 'var(--lamp-shade)', 'ink-thin', { rx: 2 });

  /* The roof sits on top of the walls, tall enough for the attic.
     The chimney goes on first so the roof covers its bottom. */
  const roofLeft = wallLeft - 26;
  const roofRight = wallRight + 26;
  const roofBase = wallTop + 2;
  const peakX = (roofLeft + roofRight) / 2;
  const peakY = (attic ? attic.top : roofBase) - 90;
  const chimX = peakX + (roofRight - peakX) * 0.45;
  path(shell, `M${chimX} ${peakY + 20} L${chimX + 42} ${peakY + 20} L${chimX + 42} ${roofBase - 40} L${chimX} ${roofBase - 40} Z`, 'url(#pat-bricks)');
  box(shell, chimX - 5, peakY + 12, 52, 10, 'var(--wall-shadow)');
  box(shell, chimX + 8, peakY - 2, 12, 15, 'var(--pot)', 'ink-thin', { rx: 2 });
  box(shell, chimX + 24, peakY + 1, 11, 12, 'var(--pot)', 'ink-thin', { rx: 2 });
  path(shell, `M${roofLeft} ${roofBase} L${peakX} ${peakY} L${roofRight} ${roofBase} Z`, 'url(#pat-roof)');
  path(shell, `M${roofLeft} ${roofBase} L${peakX} ${peakY} L${peakX} ${roofBase} Z`, 'var(--ink)', 'p-shadow');
  box(shell, roofLeft - 4, roofBase - 4, roofRight - roofLeft + 8, 8, 'var(--wood-dark)');
  box(shell, roofLeft, roofBase + 4, roofRight - roofLeft, 5, 'var(--metal)', 'ink-thin', { rx: 2 });

  /* The house: thin walls inside, thick red brick round the edge. */
  box(shell, wallLeft, wallTop, wallRight - wallLeft, grass - wallTop, 'var(--partition)');
  box(shell, wallLeft, wallTop, brick, grass - wallTop, 'url(#pat-bricks)');
  box(shell, wallRight - brick, wallTop, brick, grass - wallTop, 'url(#pat-bricks)');
  box(shell, wallLeft, wallTop, wallRight - wallLeft, brick, 'url(#pat-bricks)');

  /* The beams between upstairs and downstairs, ends showing. */
  const beamTop = up.bottom;
  const beamH = down.top - up.bottom;
  box(shell, wallLeft + brick, beamTop, wallRight - wallLeft - brick * 2, beamH, 'var(--joist)', 'ink-thin');
  for (let x = wallLeft + brick + 10; x < wallRight - brick - 6; x += 26) {
    box(shell, x, beamTop + 2, 6, beamH - 4, 'var(--wood-light)', '', { opacity: 0.55 });
  }

  /* Every building outside gets walls and its own roof. */
  ROOMS.filter((room) => room.floor === 'outside').forEach((room) => {
    const walls = room.walls === 'planks' ? 'url(#pat-planks)' : 'url(#pat-bricks)';
    box(shell, room.x - 8, room.y - 6, room.w + 16, room.h + 6, walls);
    path(shell, `M${room.x - 18} ${room.y - 4} L${room.x + room.w / 2} ${room.y - 42} L${room.x + room.w + 18} ${room.y - 4} Z`, 'url(#pat-roof)');
    box(shell, room.x - 20, room.y - 7, room.w + 40, 6, 'var(--wood-dark)');
  });

  /* The cellar is dug out of the earth, so it gets a stone rim. */
  const cellar = measure('cellar');
  if (cellar) {
    box(shell, cellar.left - 8, cellar.top - 8, cellar.right - cellar.left + 16, cellar.bottom - cellar.top + 16, 'url(#pat-stone)');
  }

  svg.append(shell);
}

/* The ways between floors, read from STAIRS in data/rooms.js.
   Steps get a carpet runner, a handrail and spindles. A ladder
   is two rails with rungs between them. */
function drawStairs(svg) {
  STAIRS.forEach((flight) => {
    const g = make('g', { 'data-stairs': flight.id });
    const { left, right, bottom, top, steps } = flight;

    if (flight.kind === 'ladder') {
      g.append(make('line', { x1: left, y1: top, x2: left, y2: bottom, class: 'stair-rail' }));
      g.append(make('line', { x1: right, y1: top, x2: right, y2: bottom, class: 'stair-rail' }));
      const gap = (bottom - top) / (steps + 1);
      for (let i = 1; i <= steps; i += 1) {
        g.append(make('line', { x1: left, y1: top + i * gap, x2: right, y2: top + i * gap, class: 'stair-rung' }));
      }
      svg.append(g);
      return;
    }

    const stepW = (right - left) / steps;
    const stepH = (bottom - top) / steps;
    const railUp = 34;
    for (let i = 0; i < steps; i += 1) {
      const x = left + i * stepW;
      const y = bottom - (i + 1) * stepH;
      box(g, x, y, stepW, (i + 1) * stepH, 'var(--wood)', 'ink-thin');
      box(g, x, y, stepW, 4, 'var(--fabric-a)', '');
      if (flight.handrail !== false) {
        g.append(make('line', { x1: x + stepW / 2, y1: y, x2: x + stepW / 2, y2: y - railUp, class: 'stair-spindle' }));
      }
    }
    if (flight.handrail === false) { svg.append(g); return; }
    g.append(make('line', {
      x1: left + stepW / 2 - 4, y1: bottom - stepH - railUp,
      x2: right - stepW / 2 + 4, y2: top - railUp, class: 'stair-handrail'
    }));
    box(g, left - 3, bottom - stepH - railUp - 6, 8, stepH + railUp + 6, 'var(--wood-dark)', 'ink-thin', { rx: 2 });
    svg.append(g);
  });
}

/* --- THE ROOMS -----------------------------------------------
   Each room gets: a back wall in its paint, a floor, a skirting
   board, a shadow under the ceiling, a lamp, its furniture from
   js/props.js, and a name tag. Everything inside a room is
   clipped to the room, so nothing can poke through a wall.
   ------------------------------------------------------------ */

const FLOOR_DEPTH = 12;

function wallFill(room) {
  if (room.walls === 'planks') return 'url(#pat-planks)';
  if (room.floor === 'cellar') return 'url(#pat-stone)';
  if (room.floor === 'outside') return 'var(--room-outside)';
  return `var(--paint-${room.paint || 'white'})`;
}

function flooring(room) {
  if (room.floor === 'cellar' || room.floor === 'outside') return 'concrete';
  return room.flooring || 'wood';
}

function drawLamp(g, room) {
  const x = room.x + room.w * 0.72;
  const y = room.y;
  const bare = room.floor !== 'upstairs' && room.floor !== 'ground';
  g.append(make('ellipse', {
    cx: x, cy: y + room.h * 0.45, rx: Math.min(room.w * 0.55, 90), ry: room.h * 0.55,
    fill: 'url(#grad-lamp)', class: 'room-glow'
  }));
  const drop = bare ? 14 : 20;
  g.append(make('line', { x1: x, y1: y, x2: x, y2: y + drop, class: 'ink-thin' }));
  if (bare) {
    g.append(make('circle', { cx: x, cy: y + drop + 4, r: 4.5, fill: 'var(--lamp-glow)', class: 'ink-thin' }));
  } else {
    path(g, `M${x - 11} ${y + drop + 10} L${x + 11} ${y + drop + 10} L${x + 6} ${y + drop} L${x - 6} ${y + drop} Z`, 'var(--lamp-shade)', 'ink-thin');
  }
}

function drawRooms(svg) {
  const layer = make('g');
  const defs = svg.querySelector('defs');

  ROOMS.forEach((room) => {
    const clipId = `clip-${room.id}`;
    const clip = make('clipPath', { id: clipId });
    clip.append(make('rect', { x: room.x, y: room.y, width: room.w, height: room.h, rx: 4 }));
    defs.append(clip);

    const g = make('g', { class: 'room', 'data-room': room.id });
    const inside = make('g', { 'clip-path': `url(#${clipId})` });
    const floorY = room.y + room.h - FLOOR_DEPTH;
    const indoor = room.floor === 'upstairs' || room.floor === 'ground';
    const floorType = flooring(room);

    /* the back wall, and a pattern on it */
    box(inside, room.x, room.y, room.w, room.h, wallFill(room), '');
    if (indoor && floorType === 'tile') {
      box(inside, room.x, floorY - 44, room.w, 44, 'url(#pat-wall-tiles)', '');
    } else if (indoor) {
      box(inside, room.x, room.y, room.w, room.h, 'url(#pat-stripes)', '');
    }
    if (room.floor === 'attic') {
      for (let x = room.x + 30; x < room.x + room.w; x += 70) {
        box(inside, x, room.y, 8, room.h, 'var(--wood-dark)', 'ink-thin');
      }
    }

    /* floor and skirting board */
    box(inside, room.x, floorY, room.w, FLOOR_DEPTH, `url(#pat-floor-${floorType})`, 'ink-thin');
    if (indoor) box(inside, room.x, floorY - 5, room.w, 5, 'var(--porcelain)', 'ink-thin');

    /* light from the lamp, then the furniture */
    drawLamp(inside, room);
    (room.props || []).forEach((prop) => {
      const p = make('g', {
        class: 'prop', 'data-prop': prop.kind,
        transform: `translate(${room.x + prop.x} ${floorY - (prop.lift || 0)})`
      });
      drawProp(prop.kind, p, prop);
      inside.append(p);
    });

    /* shadow under the ceiling, so the room has depth */
    box(inside, room.x, room.y, room.w, 22, 'url(#grad-ceiling)', '');
    g.append(inside);

    /* the outline, and the name tag */
    g.append(make('rect', {
      x: room.x, y: room.y, width: room.w, height: room.h, rx: 4,
      fill: 'none', class: 'ink-thin room-box'
    }));
    const tag = make('g', { class: 'room-tag' });
    const label = make('text', { x: room.x + 10, y: room.y + 17, class: 'room-name' });
    label.textContent = room.name;
    const tagW = room.name.length * 8.4 + 14;
    tag.append(make('rect', { x: room.x + 4, y: room.y + 5, width: tagW, height: 17, rx: 8.5, class: 'room-tag-bg' }));
    tag.append(label);
    g.append(tag);

    layer.append(g);
  });

  svg.append(layer);
}

/* --- THE ANCHOR POINTS ---------------------------------------
   A glowing spot where a trap will go in M5. Right now it does
   nothing except light up and tell you what it is, which is
   exactly what M1 is supposed to do.

   Each one is a button. That means you can click it OR tab to
   it with the keyboard, which matters for anyone who cannot use
   a mouse.
   ------------------------------------------------------------ */

function drawAnchors(svg, caption) {
  const layer = make('g', { class: 'anchors' });

  ANCHORS.forEach((anchor) => {
    const mount = MOUNTS[anchor.mount];
    const room = findRoom(anchor.room);
    const roomName = room ? room.name : anchor.room;

    const g = make('g', {
      class: 'anchor',
      'data-mount': anchor.mount,
      transform: `translate(${anchor.x} ${anchor.y})`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${anchor.name}, in the ${roomName}. ${mount.name} trap spot.`
    });

    /* a big invisible circle so it is easy to hit with a finger */
    g.append(make('circle', { r: 28, fill: 'transparent', class: 'anchor-hit' }));
    /* a dark halo so the spot stands out against the furniture */
    g.append(make('circle', { r: 16, class: 'anchor-halo' }));
    /* the ring that spins and glows */
    g.append(make('circle', { r: 20, class: 'anchor-ring' }));
    /* the solid dot in the middle */
    g.append(make('circle', { r: 9, class: 'anchor-dot' }));

    const say = () => {
      caption.textContent = `${anchor.name}. ${mount.line}`;
      layer.querySelectorAll('.anchor').forEach((a) => a.classList.remove('is-live'));
      g.classList.add('is-live');
    };
    const hush = () => {
      g.classList.remove('is-live');
    };

    g.addEventListener('mouseenter', say);
    g.addEventListener('mouseleave', hush);
    g.addEventListener('focus', say);
    g.addEventListener('blur', hush);
    g.addEventListener('click', say);
    g.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        say();
      }
    });

    layer.append(g);
  });

  svg.append(layer);
}

/* --- THE LEGEND ----------------------------------------------
   Four little swatches saying what the colours mean. Built from
   the same MOUNTS list the anchors use, so it can never drift
   out of date.
   ------------------------------------------------------------ */

function buildLegend(list) {
  list.innerHTML = '';
  Object.entries(MOUNTS).forEach(([key, mount]) => {
    const li = document.createElement('li');
    li.className = 'legend-item';
    li.dataset.mount = key;

    const swatch = document.createElement('span');
    swatch.className = 'legend-dot';

    const name = document.createElement('span');
    name.textContent = mount.name;

    li.append(swatch, name);
    li.title = mount.line;
    list.append(li);
  });
}

/* --- PUT IT ALL TOGETHER ------------------------------------- */

export function buildHouse(container, caption, legend) {
  container.innerHTML = '';

  const rooms = ROOMS.map((room) => room.name).join(', ');
  const svg = make('svg', {
    viewBox: `0 0 ${PICTURE.w} ${PICTURE.h}`,
    role: 'img',
    'aria-label':
      `A cut open view of the house. The rooms are: ${rooms}. ` +
      `${ANCHORS.length} glowing spots show where traps can go.`
  });

  drawDefs(svg);
  drawShell(svg);
  drawRooms(svg);
  drawStairs(svg);
  drawAnchors(svg, caption);

  container.append(svg);
  if (legend) buildLegend(legend);
}
