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

import { ROOMS, ANCHORS, MOUNTS } from '../data/rooms.js';

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
   The roof, the outside walls, the grass and the stairs. These
   are the bits that hold still no matter what is in rooms.js.
   ------------------------------------------------------------ */

function drawShell(svg) {
  const shell = make('g');

  /* sky behind everything */
  shell.append(make('rect', { x: 0, y: 0, width: 900, height: 640, fill: 'var(--house-sky)' }));

  /* grass */
  shell.append(make('path', {
    d: 'M0 548 L900 548 L900 640 L0 640 Z',
    fill: 'var(--ground)', class: 'ink'
  }));

  /* chimney first, so the roof lands on top of it */
  shell.append(make('path', {
    d: 'M596 74 L636 74 L638 176 L594 176 Z',
    fill: 'var(--chimney)', class: 'ink'
  }));

  /* roof */
  shell.append(make('path', {
    d: 'M48 170 L380 44 L712 170 Z',
    fill: 'var(--roof)', class: 'ink'
  }));

  /* the outside walls, cut open at the front */
  shell.append(make('path', {
    d: 'M60 168 L700 168 L700 548 L60 548 Z',
    fill: 'var(--wall)', class: 'ink'
  }));

  /* the floor between upstairs and downstairs */
  shell.append(make('path', {
    d: 'M60 352 L700 352 L700 364 L60 364 Z',
    fill: 'var(--wall-shadow)', class: 'ink-thin'
  }));

  svg.append(shell);
}

/* The staircase, drawn as real steps so it reads instantly.
   It climbs through the foyer and arrives on the landing. */
function drawStairs(svg) {
  const stairs = make('g', { class: 'ink' });
  const steps = 7;
  const left = 120;
  const right = 228;
  const bottom = 540;
  const top = 372;
  const stepW = (right - left) / steps;
  const stepH = (bottom - top) / steps;

  for (let i = 0; i < steps; i += 1) {
    stairs.append(make('rect', {
      x: left + i * stepW,
      y: bottom - (i + 1) * stepH,
      width: stepW,
      height: stepH,
      fill: 'var(--stairs)'
    }));
  }
  svg.append(stairs);
}

/* --- THE ROOMS ----------------------------------------------- */

function drawRooms(svg) {
  const layer = make('g');

  ROOMS.forEach((room) => {
    const g = make('g', { class: 'room', 'data-room': room.id });

    g.append(make('rect', {
      x: room.x, y: room.y, width: room.w, height: room.h,
      rx: 6,
      fill: room.floor === 'outside' ? 'var(--room-outside)' : 'var(--room-floor)',
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

  const svg = make('svg', {
    viewBox: '0 0 900 640',
    role: 'img',
    'aria-label':
      'A cut open view of the house. Attic at the top, then the landing, hallway, ' +
      'bedroom and bathroom, then the foyer, lounge and kitchen, with a shed outside. ' +
      'Nine glowing spots show where traps can go.'
  });

  drawShell(svg);
  drawRooms(svg);
  drawStairs(svg);
  drawAnchors(svg, caption);

  container.append(svg);
  if (legend) buildLegend(legend);
}
