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

/* --- THE SHELL ----------------------------------------------
   The roof, the outside walls, the floors between storeys, the
   grass and the earth. None of these have numbers of their own.
   They measure the rooms in data/rooms.js and wrap themselves
   around whatever they find, so moving a room moves the walls.
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

function drawShell(svg) {
  const shell = make('g');
  const W = PICTURE.w;
  const H = PICTURE.h;

  const up = measure('upstairs');
  const down = measure('ground');
  const attic = measure('attic');

  /* The outside walls hug the upstairs and ground floor rooms. */
  const wallLeft = Math.min(up.left, down.left) - 4;
  const wallRight = Math.max(up.right, down.right) + 4;
  const wallTop = up.top - 10;
  const grass = down.bottom;

  /* sky behind everything */
  shell.append(make('rect', { x: 0, y: 0, width: W, height: H, fill: 'var(--house-sky)' }));

  /* the earth under the grass, where the cellar is dug */
  shell.append(make('path', {
    d: `M0 ${grass} L${W} ${grass} L${W} ${H} L0 ${H} Z`,
    fill: 'var(--earth)', class: 'ink'
  }));
  shell.append(make('path', {
    d: `M0 ${grass} L${W} ${grass} L${W} ${grass + 12} L0 ${grass + 12} Z`,
    fill: 'var(--ground)'
  }));

  /* The roof sits on top of the walls and is tall enough to hold
     the attic. The chimney goes on first so the roof covers its
     bottom. */
  const roofLeft = wallLeft - 22;
  const roofRight = wallRight + 22;
  const roofBase = wallTop + 2;
  const peakX = (roofLeft + roofRight) / 2;
  const peakY = (attic ? attic.top : roofBase) - 90;
  const chimX = peakX + (roofRight - peakX) * 0.45;
  shell.append(make('path', {
    d: `M${chimX} ${peakY + 24} L${chimX + 40} ${peakY + 24} L${chimX + 42} ${roofBase - 40} L${chimX - 2} ${roofBase - 40} Z`,
    fill: 'var(--chimney)', class: 'ink'
  }));
  shell.append(make('path', {
    d: `M${roofLeft} ${roofBase} L${peakX} ${peakY} L${roofRight} ${roofBase} Z`,
    fill: 'var(--roof)', class: 'ink'
  }));

  /* the outside walls, cut open at the front */
  shell.append(make('path', {
    d: `M${wallLeft} ${wallTop} L${wallRight} ${wallTop} L${wallRight} ${grass} L${wallLeft} ${grass} Z`,
    fill: 'var(--wall)', class: 'ink'
  }));

  /* the floor between upstairs and downstairs */
  shell.append(make('path', {
    d: `M${wallLeft} ${up.bottom + 2} L${wallRight} ${up.bottom + 2} L${wallRight} ${down.top - 2} L${wallLeft} ${down.top - 2} Z`,
    fill: 'var(--wall-shadow)', class: 'ink-thin'
  }));

  /* every outside building gets its own little roof */
  ROOMS.filter((room) => room.floor === 'outside').forEach((room) => {
    shell.append(make('path', {
      d: `M${room.x - 8} ${room.y - 6} L${room.x + room.w + 8} ${room.y - 6} L${room.x + room.w + 8} ${room.y + room.h} L${room.x - 8} ${room.y + room.h} Z`,
      fill: 'var(--wall-shadow)', class: 'ink'
    }));
    shell.append(make('path', {
      d: `M${room.x - 16} ${room.y - 4} L${room.x + room.w / 2} ${room.y - 40} L${room.x + room.w + 16} ${room.y - 4} Z`,
      fill: 'var(--roof)', class: 'ink'
    }));
  });

  svg.append(shell);
}

/* The ways between floors, read from STAIRS in data/rooms.js.
   Steps are drawn as real steps so they read instantly. A ladder
   is two rails with rungs between them. */
function drawStairs(svg) {
  STAIRS.forEach((flight) => {
    const g = make('g', { class: 'ink', 'data-stairs': flight.id });
    const { left, right, bottom, top, steps } = flight;

    if (flight.kind === 'ladder') {
      g.append(make('line', { x1: left, y1: top, x2: left, y2: bottom, stroke: 'var(--stairs)', 'stroke-width': 6 }));
      g.append(make('line', { x1: right, y1: top, x2: right, y2: bottom, stroke: 'var(--stairs)', 'stroke-width': 6 }));
      const gap = (bottom - top) / (steps + 1);
      for (let i = 1; i <= steps; i += 1) {
        g.append(make('line', { x1: left, y1: top + i * gap, x2: right, y2: top + i * gap, stroke: 'var(--stairs)', 'stroke-width': 4 }));
      }
    } else {
      const stepW = (right - left) / steps;
      const stepH = (bottom - top) / steps;
      for (let i = 0; i < steps; i += 1) {
        g.append(make('rect', {
          x: left + i * stepW,
          y: bottom - (i + 1) * stepH,
          width: stepW,
          height: (i + 1) * stepH,
          fill: 'var(--stairs)'
        }));
      }
    }
    svg.append(g);
  });
}

/* --- THE ROOMS ----------------------------------------------- */

function drawRooms(svg) {
  const layer = make('g');

  ROOMS.forEach((room) => {
    const g = make('g', { class: 'room', 'data-room': room.id });

    g.append(make('rect', {
      x: room.x, y: room.y, width: room.w, height: room.h,
      rx: 6,
      fill: room.floor === 'outside' ? 'var(--room-outside)'
        : room.floor === 'cellar' ? 'var(--room-cellar)'
        : 'var(--room-floor)',
      class: 'ink-thin room-box'
    }));

    /* floorboards, just enough to look drawn rather than printed */
    if (room.floor !== 'attic') {
      const boards = make('g', { class: 'boards' });
      for (let y = room.y + room.h - 12; y > room.y + 16; y -= 18) {
        boards.append(make('line', {
          x1: room.x + 8, y1: y, x2: room.x + room.w - 8, y2: y,
          stroke: 'var(--room-line)', 'stroke-width': 2
        }));
      }
      g.append(boards);
    }

    const label = make('text', {
      x: room.x + room.w / 2,
      y: room.y + 26,
      'text-anchor': 'middle',
      class: 'room-name'
    });
    label.textContent = room.name;
    g.append(label);

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

  drawShell(svg);
  drawRooms(svg);
  drawStairs(svg);
  drawAnchors(svg, caption);

  container.append(svg);
  if (legend) buildLegend(legend);
}
