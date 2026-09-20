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
import { drawItem } from './item-art.js';
import { state } from './state.js';

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

  /* The glow round a hiding place when you point at it. It fattens
     the shape a little, paints that in the spot colour, softens
     it, then puts the real drawing back on top. */
  /* Two of them: yellow for a new place, grey once you have looked. */
  [['spot-glow', 'spot-flood'], ['spot-glow-done', 'spot-flood-done']].forEach(([id, flood]) => {
    const glowFilter = make('filter', { id, x: '-25%', y: '-25%', width: '150%', height: '150%' });
    glowFilter.append(
      make('feMorphology', { in: 'SourceAlpha', operator: 'dilate', radius: 2.2, result: 'fat' }),
      make('feFlood', { class: flood, result: 'colour' }),
      make('feComposite', { in: 'colour', in2: 'fat', operator: 'in', result: 'ring' }),
      make('feGaussianBlur', { in: 'ring', stdDeviation: 1.6, result: 'soft' })
    );
    const merge = make('feMerge');
    merge.append(make('feMergeNode', { in: 'soft' }), make('feMergeNode', { in: 'ring' }), make('feMergeNode', { in: 'SourceGraphic' }));
    glowFilter.append(merge);
    defs.append(glowFilter);
  });

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

   A staircase seen from the side is three things: the steps (the
   zig-zag you walk on, with a carpet runner), the stringer (the
   long sloping board holding the steps up) and the banister (a
   handrail on spindles, with a thick post at each end). The main
   stairs also have a cupboard underneath, like real ones do.

   A ladder is two rails with rungs between them. */
function drawStairs(svg) {
  STAIRS.forEach((flight) => {
    const g = make('g', { class: 'stairs', 'data-stairs': flight.id });
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

    const w = (right - left) / steps;          // how deep each step is
    const h = (bottom - top) / steps;          // how tall each step is
    const slope = (bottom - top) / (right - left);
    const board = 16;                          // how thick the stringer is
    const underTop = top + board;              // underside of the stairs, top end
    const underFoot = right - (bottom - underTop) / slope;   // where the underside meets the floor

    /* the cupboard under the stairs */
    if (flight.cupboard) {
      path(g, `M${underFoot} ${bottom} L${right} ${underTop} L${right} ${bottom} Z`, 'var(--partition)', 'ink-thin');
      path(g, `M${underFoot} ${bottom} L${right} ${underTop} L${right} ${underTop + 10} L${underFoot + 10} ${bottom} Z`, 'var(--ink)', 'p-shadow');
      const doorW = 30;
      const doorX = right - doorW - 8;
      const doorTop = bottom - 64;
      const door = make('g');
      const body = make('g', { class: 'prop-body' });
      box(body, doorX, doorTop, doorW, 64, 'var(--door)', 'ink-thin', { rx: 2 });
      body.append(make('circle', { cx: doorX + doorW - 7, cy: bottom - 30, r: 2.2, fill: 'var(--metal)', class: 'ink-thin' }));
      door.append(body);
      if (flight.search && flight.room) makeSpot(door, flight.room, flight.search);
      g.append(door);
    }

    /* the steps: a zig-zag up the front, closed off along the slope */
    let zig = `M${left} ${bottom}`;
    for (let i = 0; i < steps; i += 1) {
      const y = bottom - (i + 1) * h;
      zig += ` L${left + i * w} ${y} L${left + (i + 1) * w} ${y}`;
    }
    path(g, `${zig} Z`, 'var(--wood-light)', 'ink-thin');
    g.append(make('path', { d: zig, class: 'stair-runner' }));

    /* the stringer, the long board the steps sit on */
    path(g, `M${left} ${bottom} L${right} ${top} L${right} ${underTop} L${underFoot} ${bottom} Z`, 'var(--wood-dark)', 'ink-thin');

    if (flight.handrail === false) { svg.append(g); return; }

    /* the banister: spindles up from each step to a sloping rail */
    const railUp = 36;
    const railAt = (x) => bottom - (x - left) * slope - h / 2 - railUp;
    for (let i = 0; i < steps; i += 1) {
      const x = left + (i + 0.5) * w;
      g.append(make('line', { x1: x, y1: bottom - (i + 1) * h, x2: x, y2: railAt(x), class: 'stair-spindle' }));
    }
    g.append(make('line', { x1: left + 2, y1: railAt(left + 2), x2: right - 2, y2: railAt(right - 2), class: 'stair-handrail' }));
    box(g, left - 3, railAt(left) - 6, 9, bottom - railAt(left) + 6, 'var(--wood-dark)', 'ink-thin', { rx: 2 });
    box(g, right - 6, railAt(right) - 6, 9, top - railAt(right) + 6, 'var(--wood-dark)', 'ink-thin', { rx: 2 });
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

function drawGlow(g, room) {
  const x = room.x + room.w * 0.72;
  g.append(make('ellipse', {
    cx: x, cy: room.y + room.h * 0.45, rx: Math.min(room.w * 0.55, 90), ry: room.h * 0.55,
    fill: 'url(#grad-lamp)', class: 'room-glow'
  }));
}

function drawLamp(g, room) {
  const x = room.x + room.w * 0.72;
  const y = room.y;
  const bare = room.floor !== 'upstairs' && room.floor !== 'ground';
  const drop = bare ? 14 : 20;
  g.append(make('line', { x1: x, y1: y, x2: x, y2: y + drop, class: 'ink-thin' }));
  if (bare) {
    g.append(make('circle', { cx: x, cy: y + drop + 4, r: 4.5, fill: 'var(--lamp-glow)', class: 'ink-thin' }));
  } else {
    path(g, `M${x - 11} ${y + drop + 10} L${x + 11} ${y + drop + 10} L${x + 6} ${y + drop} L${x - 6} ${y + drop} Z`, 'var(--lamp-shade)', 'ink-thin');
  }
}

/* Put one prop in its place. The outer group moves it to the
   right spot in the room. The inner one (prop-body) is the drawing
   itself, and that is the part that glows and wiggles when it is a
   hiding place. Two groups, for the same reason as the anchors. */
function placeThing(layer, room, thing, floorY) {
  const at = make('g', {
    class: 'prop', 'data-prop': thing.kind,
    transform: `translate(${room.x + thing.x} ${floorY - (thing.lift || 0)})`
  });
  const body = make('g', { class: 'prop-body' });
  drawProp(thing.kind, body, thing);
  at.append(body);
  if (thing.search) makeSpot(at, room.id, thing.search);
  layer.append(at);
}

function drawRooms(svg) {
  const layer = make('g');
  const defs = svg.querySelector('defs');

  ROOMS.forEach((room) => {
    const clipId = `clip-${room.id}`;
    const clip = make('clipPath', { id: clipId });
    clip.append(make('rect', { x: room.x, y: room.y, width: room.w, height: room.h, rx: 4 }));
    defs.append(clip);

    const g = make('g', {
      class: 'room', 'data-room': room.id,
      tabindex: '0', role: 'button', 'aria-label': `Look inside the ${room.name}`
    });
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

    /* light from the lamp, then the furniture, then the lamp
       itself so it hangs in front of whatever is on the wall */
    drawGlow(inside, room);
    (room.props || []).forEach((prop) => placeThing(inside, room, prop, floorY));

    /* the small stuff, which only shows once you zoom in */
    const closeUp = make('g', { class: 'close-up' });
    (room.closeUp || []).forEach((thing) => placeThing(closeUp, room, thing, floorY));
    inside.append(closeUp);

    /* junk left lying about goes in here, each night (js/scavenge.js) */
    const loose = make('g', { class: 'loose-items' });
    inside.append(loose);
    looseLayers[room.id] = { g: loose, room, floorY };

    drawLamp(inside, room);

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

    /* The outer group puts the spot in place. This inner group is
       what shrinks when you zoom into a room, so the spot stays a
       sensible size on screen. (Two groups, because a CSS transform
       would wipe out the position if they were the same one.) */
    const body = make('g', { class: 'anchor-body' });
    /* a big invisible circle so it is easy to hit with a finger */
    body.append(make('circle', { r: 28, fill: 'transparent', class: 'anchor-hit' }));
    /* a dark halo so the spot stands out against the furniture */
    body.append(make('circle', { r: 16, class: 'anchor-halo' }));
    /* the ring that spins and glows */
    body.append(make('circle', { r: 20, class: 'anchor-ring' }));
    /* the solid dot in the middle */
    body.append(make('circle', { r: 9, class: 'anchor-dot' }));
    g.append(body);

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

/* --- HIDING PLACES -------------------------------------------
   Anything in data/rooms.js with a search is a hiding place. There
   are no dots on them. You have to hunt: zoom into a room, move
   the pointer around, and the things you can look in light up.
   Click one (or Tab to it and press Enter) and you rummage.

   Which ones you have already searched is kept in state.searched,
   so restarting the game forgets them all.

   Junk left lying about in the open works the same way, except
   clicking it picks it straight up.
   ------------------------------------------------------------ */

const spots = [];
const looseLayers = {};

function slug(words) {
  return words.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* kind is 'hide' for a hiding place, or 'loose' for a bit of junk
   lying in the open. Both glow when you point at them. */
function makeSpot(g, roomId, name, kind = 'hide', id = `${roomId}-${slug(name)}`) {
  const spot = { id, room: roomId, name, node: g, kind };
  g.classList.add('spot');
  if (kind === 'loose') g.classList.add('loose-item');
  g.setAttribute('data-room', roomId);
  g.setAttribute('data-spot', id);
  g.setAttribute('role', 'button');
  g.setAttribute('tabindex', '-1');
  g.setAttribute('aria-label', kind === 'loose' ? `Pick up: ${name}` : `Search: ${name}`);
  spots.push(spot);

  const point = () => {
    if (!g.classList.contains('is-here')) return;
    if (kind === 'loose') view.hud.note.textContent = `${name}, just lying there.`;
    else view.hud.note.textContent = state.searched.includes(id)
      ? `${name}. You already looked here.`
      : name;
  };
  /* Moving off puts the room's note back, unless you just searched
     it, in which case the answer stays up so you can read it. */
  const leave = () => {
    const room = findRoom(roomId);
    if (room && g.classList.contains('is-here') && !view.answered) {
      view.hud.note.textContent = room.note || '';
    }
  };
  const look = (event) => {
    if (!g.classList.contains('is-here')) return;
    event.stopPropagation();
    search(spot);
  };

  g.addEventListener('mouseenter', () => { view.answered = false; point(); });
  g.addEventListener('focus', () => { view.answered = false; point(); });
  g.addEventListener('mouseleave', leave);
  g.addEventListener('blur', leave);
  g.addEventListener('click', look);
  g.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); look(event); }
  });
}

/* Look in a hiding place, or pick up something lying about.
   js/scavenge.js decides what is there (view.onLook). This part
   only does the wiggle, the pop and the words. */
function search(spot) {
  const g = spot.node;
  const answer = view.onLook
    ? view.onLook(spot)
    : { message: `${spot.name}. Nothing in here.` };
  view.answered = true;
  view.hud.note.textContent = answer.message;
  if (answer.blocked) return;             // bag full, time up: nothing happens

  if (spot.kind === 'loose') {
    spots.splice(spots.indexOf(spot), 1);
    g.remove();
    return;
  }

  g.classList.remove('is-rummaging');
  void g.getBBox();                       // restart the wiggle if you click twice
  g.classList.add('is-rummaging');
  setTimeout(() => g.classList.remove('is-rummaging'), 650);
  if (!state.searched.includes(spot.id)) state.searched.push(spot.id);
  g.classList.add('is-searched');
  if (answer.item) popItem(g, answer.item);
  countSpots(spot.room);
}

/* Something jumps out of the hiding place, grows, and floats up
   into your bag. */
function popItem(g, item) {
  const body = g.querySelector('.prop-body');
  const b = body.getBBox();
  const at = make('g', { class: 'item-pop-at', transform: `translate(${b.x + b.width / 2 - 8} ${b.y + Math.min(b.height, 18)})` });
  const pop = make('g', { class: 'item-pop' });
  drawItem(item, pop);
  at.append(pop);
  g.append(at);
  setTimeout(() => at.remove(), 1100);
}

/* Leave a bit of junk lying in a room, in one of its inTheOpen
   places from data/rooms.js. */
export function placeLooseItem(roomId, place, item) {
  const layer = looseLayers[roomId];
  if (!layer) return;
  const at = make('g', {
    transform: `translate(${layer.room.x + place.x} ${layer.floorY - (place.lift || 0)})`
  });
  const body = make('g', { class: 'prop-body' });
  body.append(make('ellipse', { cx: 8, cy: 0, rx: 8, ry: 1.6, class: 'p-shadow' }));
  drawItem(item, body);
  at.append(body);
  makeSpot(at, roomId, item.name, 'loose', `${roomId}-loose-${item.id}`);
  at.dataset.item = item.id;
  layer.g.append(at);
  const open = view.svg && view.svg.querySelector('.room.is-open');
  wakeSpots(open ? open.dataset.room : null);
}

/* Every hiding place in the house, so js/scavenge.js can choose
   where to hide things. */
export function hidingPlaces() {
  return spots.filter((spot) => spot.kind === 'hide').map((spot) => ({ id: spot.id, room: spot.room, name: spot.name }));
}

/* Who decides what is in a hiding place. js/scavenge.js sets this. */
export function setLookHandler(fn) {
  view.onLook = fn;
}

/* The line under the house: how many hiding places this room has,
   and how many you have looked in. */
function countSpots(roomId) {
  if (!view.caption) return;
  if (view.mode !== 'search') return;
  if (!roomId) {
    view.caption.textContent = 'Tap a room to go in and hunt for junk.';
    return;
  }
  const here = spots.filter((spot) => spot.room === roomId && spot.kind === 'hide');
  const done = here.filter((spot) => state.searched.includes(spot.id)).length;
  view.caption.textContent = here.length === 0
    ? 'Nowhere to hide anything in here.'
    : `Searched ${done} of ${here.length} hiding places in here.`;
}

/* Only the hiding places in the room you are in can be pointed at
   or tabbed to. */
function wakeSpots(roomId) {
  const on = view.mode === 'search' ? roomId : null;
  spots.forEach((spot) => {
    const here = spot.room === on;
    spot.node.classList.toggle('is-here', here);
    spot.node.setAttribute('tabindex', here ? '0' : '-1');
  });
  countSpots(on);
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

/* --- THE CAMERA ----------------------------------------------
   Tap a room and the view glides in until that room fills the
   screen. Tap "Whole house", or press Escape, to glide back out.
   With a room open, the arrow keys move you to the room next door,
   upstairs or downstairs. In M2 the hero will drive this: wherever
   Hendrix walks, the camera follows.

   How it works: an SVG has a viewBox, which is the part of the
   picture it shows. Showing the whole house means a viewBox the
   size of the whole picture. Zooming in just means a smaller
   viewBox around one room. Nothing is redrawn, which is why it is
   smooth.
   ------------------------------------------------------------ */

const FLOOR_ORDER = ['attic', 'upstairs', 'ground', 'cellar'];
const view = { svg: null, box: null, hud: null, onRoom: null, caption: null, mode: 'search', onLook: null, answered: false };

/* Grow a box until it has the same shape as the picture, so the
   room is not squashed, then keep it inside the picture. */
function fitBox(x, y, w, h) {
  const aspect = PICTURE.w / PICTURE.h;
  if (w / h > aspect) { const nh = w / aspect; y -= (nh - h) / 2; h = nh; }
  else { const nw = h * aspect; x -= (nw - w) / 2; w = nw; }
  x = Math.max(0, Math.min(x, PICTURE.w - w));
  y = Math.max(0, Math.min(y, PICTURE.h - h));
  return { x, y, w, h };
}

function roomBox(room) {
  const pad = Math.max(room.w, room.h) * 0.12;
  return fitBox(room.x - pad, room.y - pad, room.w + pad * 2, room.h + pad * 2);
}

const WHOLE = () => ({ x: 0, y: 0, w: PICTURE.w, h: PICTURE.h });

/* Outlines and spots are sized for the whole house. Zoomed in,
   they would be enormous, so they are thinned and shrunk to suit. */
function applyScale(box) {
  const svg = view.svg;
  const width = svg.getBoundingClientRect().width;
  const closer = PICTURE.w / box.w;
  const zoom = (width || PICTURE.w) / box.w;       // screen pixels per picture step
  /* never let a spot's tap area drop under 54 pixels across */
  const finger = width ? 27 / (28 * zoom) : 0;
  svg.style.setProperty('--line', String(Math.min(1, 1 / Math.sqrt(closer))));
  svg.style.setProperty('--anchor-scale', String(Math.min(1, Math.max(1.25 / Math.sqrt(closer), finger))));
}

function setBox(box) {
  view.box = box;
  view.svg.setAttribute('viewBox', `${box.x} ${box.y} ${box.w} ${box.h}`);
  applyScale(box);
}

function glideTo(target) {
  const from = view.box || WHOLE();
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { setBox(target); return; }
  const start = performance.now();
  const time = 520;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const t = Math.min(1, (now - start) / time);
    const k = ease(t);
    setBox({
      x: from.x + (target.x - from.x) * k,
      y: from.y + (target.y - from.y) * k,
      w: from.w + (target.w - from.w) * k,
      h: from.h + (target.h - from.h) * k
    });
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function showHud(room) {
  const { name, note, out } = view.hud;
  if (room) {
    name.textContent = room.name;
    note.textContent = room.note || '';
    out.hidden = false;
  } else {
    name.textContent = 'The whole house';
    note.textContent = 'Tap a room to look inside.';
    out.hidden = true;
  }
}

export function zoomToRoom(id) {
  const room = findRoom(id);
  if (!room || !view.svg) return;
  if (view.box) applyScale(view.box);
  view.svg.classList.add('is-zoomed');
  view.svg.querySelectorAll('.room').forEach((r) => {
    const open = r.dataset.room === id;
    r.classList.toggle('is-open', open);
    /* once you are inside, the room is not a button any more, the
       things in it are */
    r.setAttribute('role', open ? 'group' : 'button');
    r.setAttribute('tabindex', open ? '-1' : '0');
    r.setAttribute('aria-label', open ? room.name : `Look inside the ${findRoom(r.dataset.room).name}`);
  });
  glideTo(roomBox(room));
  view.answered = false;
  showHud(room);
  wakeSpots(id);
  if (view.onRoom) view.onRoom(id);
}

export function showWholeHouse(animate = true) {
  if (!view.svg) return;
  view.svg.classList.remove('is-zoomed');
  view.svg.querySelectorAll('.room').forEach((r) => {
    r.classList.remove('is-open');
    r.setAttribute('role', 'button');
    r.setAttribute('tabindex', '0');
    r.setAttribute('aria-label', `Look inside the ${findRoom(r.dataset.room).name}`);
  });
  if (animate) glideTo(WHOLE()); else setBox(WHOLE());
  showHud(null);
  wakeSpots(null);
  if (view.onRoom) view.onRoom(null);
}

/* SEARCH or RIG. Searching hides the trap spots so you hunt for
   junk with nothing giving it away. Rigging shows the trap spots
   and switches the hiding places off. */
export function setHouseMode(mode) {
  if (!view.svg) return;
  view.mode = mode;
  view.svg.dataset.mode = mode;
  if (view.legend) view.legend.hidden = mode !== 'rig';
  if (view.caption) {
    view.caption.textContent = mode === 'rig'
      ? 'Point at a glowing spot, or press Tab, to see what goes there.'
      : '';
  }
  const open = view.svg.querySelector('.room.is-open');
  wakeSpots(open ? open.dataset.room : null);
}

/* Restart: forget every search, clear away any junk left lying
   about, and go back to the whole house. */
export function resetHouse() {
  for (let i = spots.length - 1; i >= 0; i -= 1) {
    if (spots[i].kind === 'loose') { spots[i].node.remove(); spots.splice(i, 1); }
  }
  spots.forEach((spot) => spot.node.classList.remove('is-searched', 'is-rummaging'));
  document.querySelectorAll('.anchor.is-live').forEach((a) => a.classList.remove('is-live'));
  showWholeHouse(false);
}

/* Which room is next door? Left and right stay on the same floor.
   Up and down pick the room above or below that overlaps most.
   The garage and shed count as the ground floor. */
function neighbour(id, dir) {
  const here = findRoom(id);
  const level = (r) => (r.floor === 'outside' ? 'ground' : r.floor);
  if (dir === 'left' || dir === 'right') {
    const row = ROOMS.filter((r) => level(r) === level(here)).sort((a, b) => a.x - b.x);
    const i = row.indexOf(here) + (dir === 'right' ? 1 : -1);
    return row[i] || null;
  }
  const f = FLOOR_ORDER.indexOf(level(here)) + (dir === 'down' ? 1 : -1);
  const floor = FLOOR_ORDER[f];
  if (!floor) return null;
  const overlap = (r) => Math.min(r.x + r.w, here.x + here.w) - Math.max(r.x, here.x);
  const centre = (r) => Math.abs((r.x + r.w / 2) - (here.x + here.w / 2));
  const row = ROOMS.filter((r) => level(r) === floor);
  row.sort((a, b) => (overlap(b) - overlap(a)) || (centre(a) - centre(b)));
  return row[0] || null;
}

function wireCamera(svg) {
  svg.querySelectorAll('.room').forEach((g) => {
    const open = () => zoomToRoom(g.dataset.room);
    g.addEventListener('click', open);
    g.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });

  const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  svg.addEventListener('keydown', (event) => {
    const open = svg.querySelector('.room.is-open');
    if (event.key === 'Escape' && open) { event.preventDefault(); showWholeHouse(); return; }
    if (!open || !keys[event.key]) return;
    const next = neighbour(open.dataset.room, keys[event.key]);
    event.preventDefault();
    if (next) {
      zoomToRoom(next.id);
      const g = svg.querySelector(`.room[data-room="${next.id}"]`);
      if (g) g.focus({ preventScroll: true });
    }
  });

  window.addEventListener('resize', () => { if (view.box) applyScale(view.box); });
}

/* --- PUT IT ALL TOGETHER ------------------------------------- */

export function buildHouse(container, caption, legend, hud, onRoom) {
  container.innerHTML = '';

  const rooms = ROOMS.map((room) => room.name).join(', ');
  const svg = make('svg', {
    viewBox: `0 0 ${PICTURE.w} ${PICTURE.h}`,
    role: 'group',
    'aria-label':
      `A cut open view of the house. The rooms are: ${rooms}.`
  });

  drawDefs(svg);
  drawShell(svg);
  drawRooms(svg);
  drawStairs(svg);
  drawAnchors(svg, caption);

  container.append(svg);
  if (legend) buildLegend(legend);

  view.svg = svg;
  view.hud = hud;
  view.caption = caption;
  view.legend = legend;
  view.onRoom = onRoom || null;
  wireCamera(svg);
  if (hud) hud.out.addEventListener('click', () => showWholeHouse());
  setHouseMode('search');
  showWholeHouse(false);
}
