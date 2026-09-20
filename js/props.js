/* ===========================================================
   PROPS - every piece of furniture in the house

   Hendrix: each thing in this file is one small drawing. A bed,
   a fridge, a piano. The rooms in data/rooms.js say which ones
   they want and where, and this file knows how to draw them.

   HOW A DRAWING WORKS
   Every drawing starts at the spot where it touches the floor, on
   its left edge. That spot is x 0, y 0. Going RIGHT makes x bigger.
   Going UP makes y more MINUS, so the top of a wardrobe 100 tall
   is at y -100. It is upside down from how you would guess, and
   it is the same in every drawing program in the world.

   The shapes:
     box(g, x, y, width, height, colour)
     shape(g, 'M0 0 L10 -10 ...', colour)     a path, like a join the dots
     ball(g, x, y, size, colour)              a circle
     line(g, x1, y1, x2, y2)
     shadow(g, 'M...')                        a see-through dark patch
   Colours are names from css/tokens.css, like 'wood' or 'fabric-a'.

   To add a new piece of furniture, copy one of these, give it a
   new name, change the numbers, and then use that name in
   data/rooms.js. Start with the plant. It is the easiest.
   =========================================================== */

const NS = 'http://www.w3.org/2000/svg';

function add(g, tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
  g.append(node);
  return node;
}

/* 'wood' becomes var(--wood). 'none' and url(...) stay as they are. */
function paint(colour) {
  if (!colour || colour === 'none' || colour.startsWith('url(')) return colour || 'none';
  return `var(--${colour})`;
}

const THICK = 'p-ink';
const THIN = 'p-fine';

function box(g, x, y, w, h, colour, cls = THICK, round = 1.5) {
  return add(g, 'rect', { x, y, width: w, height: h, rx: round, fill: paint(colour), class: cls });
}
function shape(g, d, colour, cls = THICK) {
  return add(g, 'path', { d, fill: paint(colour), class: cls });
}
function ball(g, x, y, r, colour, cls = THICK) {
  return add(g, 'circle', { cx: x, cy: y, r, fill: paint(colour), class: cls });
}
function line(g, x1, y1, x2, y2, cls = THIN) {
  return add(g, 'line', { x1, y1, x2, y2, class: cls });
}
function shadow(g, d) {
  return add(g, 'path', { d, class: 'p-shadow' });
}
function shine(g, d) {
  return add(g, 'path', { d, class: 'p-shine' });
}
function glow(g, x, y, rx, ry, colour = 'lamp-glow') {
  return add(g, 'ellipse', { cx: x, cy: y, rx, ry, fill: paint(colour), class: 'p-glow' });
}

/* ------------------------------------------------------------
   THE DRAWINGS
   Each one gets g (where to draw) and o (any extra settings from
   rooms.js, like colour: 'fabric-c').
   ------------------------------------------------------------ */

export const PROPS = {

  /* --- BEDROOMS --------------------------------------------- */

  bed(g, o) {
    const duvet = o.colour || 'fabric-b';
    box(g, 0, -56, 10, 56, 'wood-dark');                // headboard
    box(g, 86, -34, 10, 34, 'wood-dark');               // footboard
    box(g, 6, -24, 82, 12, 'wood');                     // frame
    box(g, 9, -12, 5, 12, 'wood-dark', THIN);
    box(g, 80, -12, 5, 12, 'wood-dark', THIN);
    box(g, 10, -34, 76, 11, 'porcelain', THICK, 4);     // mattress
    box(g, 12, -45, 24, 12, 'porcelain', THICK, 6);     // pillow
    shape(g, 'M32 -37 Q36 -43 50 -41 L84 -37 Q89 -30 87 -22 L30 -22 Q27 -31 32 -37 Z', duvet);
    shape(g, 'M34 -35 Q44 -31 58 -34', 'none', THIN);
    shadow(g, 'M30 -27 L87 -27 L87 -22 L30 -22 Z');
    shine(g, 'M2 -53 L5 -53 L5 -4 L2 -4 Z');
  },

  wardrobe(g) {
    box(g, -2, -104, 50, 7, 'wood-dark');
    box(g, 0, -98, 46, 94, 'wood');
    box(g, 5, -92, 15, 38, 'none', THIN, 1);
    box(g, 26, -92, 15, 38, 'none', THIN, 1);
    box(g, 5, -48, 15, 38, 'none', THIN, 1);
    box(g, 26, -48, 15, 38, 'none', THIN, 1);
    line(g, 23, -97, 23, -5);
    ball(g, 19, -52, 2.2, 'metal', THIN);
    ball(g, 27, -52, 2.2, 'metal', THIN);
    box(g, 3, -5, 7, 5, 'wood-dark', THIN);
    box(g, 36, -5, 7, 5, 'wood-dark', THIN);
    shadow(g, 'M38 -98 L46 -98 L46 -4 L38 -4 Z');
  },

  drawers(g) {
    glow(g, 22, -66, 22, 18);
    box(g, 0, -46, 44, 46, 'wood');
    [0, 1, 2].forEach((i) => {
      box(g, 4, -42 + i * 14, 36, 11, 'wood-light', THIN, 1);
      ball(g, 22, -36.5 + i * 14, 2, 'metal', THIN);
    });
    shadow(g, 'M38 -46 L44 -46 L44 0 L38 0 Z');
    shape(g, 'M16 -46 L28 -46 L26 -50 L18 -50 Z', 'wood-dark', THIN);   // lamp base
    line(g, 22, -50, 22, -62);
    shape(g, 'M12 -62 L32 -62 L27 -75 L17 -75 Z', 'lamp-shade');
  },

  /* Hendrix's workbench, with his tools on a pegboard above it
     and a sack of flour underneath. You know what that is for. */
  workbench(g) {
    box(g, 2, -106, 52, 42, 'cardboard');
    [-98, -88, -78, -70].forEach((y) => [8, 16, 24, 32, 40, 48].forEach((x) =>
      add(g, 'circle', { cx: x, cy: y, r: 1, class: 'p-dot' })));
    box(g, 8, -96, 4, 22, 'wood-light', THIN, 1);        // hammer
    box(g, 4, -100, 12, 6, 'metal', THIN, 1);
    box(g, 24, -96, 4, 20, 'metal', THIN, 1);            // spanner
    ball(g, 26, -98, 5, 'metal', THIN);
    ball(g, 26, -98, 2, 'cardboard', 'none');
    shape(g, 'M36 -96 L50 -96 L50 -84 L36 -78 Z', 'metal', THIN);   // saw
    box(g, 32, -98, 7, 8, 'fabric-a', THIN, 1);
    box(g, 0, -40, 56, 7, 'wood-light');                 // top
    box(g, 3, -33, 6, 33, 'wood-dark');
    box(g, 47, -33, 6, 33, 'wood-dark');
    box(g, 3, -13, 50, 4, 'wood', THIN, 1);
    box(g, 40, -48, 12, 8, 'metal', THIN, 1);            // vice
    box(g, 8, -53, 10, 13, 'glass', THIN, 2);            // jar of screws
    shape(g, 'M22 -40 L34 -42 L36 -40 Z', 'porcelain', THIN);        // plans
    shape(g, 'M15 0 Q11 -20 20 -24 L32 -24 Q41 -20 37 0 Z', 'sack');  // flour
    shape(g, 'M22 -24 Q26 -30 30 -24', 'none', THIN);
    shadow(g, 'M0 -34 L56 -34 L56 -33 L0 -33 Z');
  },

  bookshelf(g) {
    box(g, 0, -92, 48, 92, 'wood-dark');
    box(g, 4, -88, 40, 84, 'wood', 'none');
    shadow(g, 'M4 -88 L44 -88 L44 -4 L4 -4 Z');
    const colours = ['fabric-a', 'fabric-b', 'fabric-c', 'paint-yellow', 'cardboard', 'metal'];
    const widths = [5, 6, 4, 7, 5, 6, 5];
    const heights = [20, 23, 18, 24, 19, 21, 22];
    [-62, -34, -4].forEach((base, row) => {
      let x = 6;
      widths.forEach((w, i) => {
        if (x + w > 42) return;
        const h = heights[(i + row) % heights.length];
        box(g, x, base - h, w, h, colours[(i + row * 2) % colours.length], THIN, 0.5);
        x += w + 0.5;
      });
      if (base !== -4) box(g, 4, base, 40, 3, 'wood-dark', 'none', 0);
    });
  },

  boxes(g) {
    const one = (x, y, w, h) => {
      box(g, x, y - h, w, h, 'cardboard');
      box(g, x + w / 2 - 2.5, y - h, 5, h * 0.45, 'paint-yellow', 'none', 0);
      shadow(g, `M${x + w - 6} ${y - h} L${x + w} ${y - h} L${x + w} ${y} L${x + w - 6} ${y} Z`);
      line(g, x + 6, y - 10, x + 16, y - 10);
    };
    one(0, 0, 34, 28);
    one(32, 0, 30, 24);
    one(10, -28, 28, 22);
  },

  /* --- BATHROOM --------------------------------------------- */

  bath(g) {
    box(g, -2, -68, 88, 32, 'url(#pat-wall-tiles)', THIN, 0);
    shape(g, 'M0 -36 L84 -36 L80 -10 Q78 -5 70 -5 L14 -5 Q6 -5 4 -10 Z', 'porcelain');
    shadow(g, 'M6 -14 L78 -14 L77 -9 Q74 -6 68 -6 L16 -6 Q9 -6 7 -9 Z');
    box(g, -2, -39, 88, 5, 'porcelain', THICK, 2);
    ball(g, 12, -3, 3, 'metal', THIN);
    ball(g, 72, -3, 3, 'metal', THIN);
    box(g, 76, -52, 4, 13, 'metal', THIN, 1);
    shape(g, 'M76 -52 L68 -52 L68 -48', 'none', THIN);
    ball(g, 18, -42, 4, 'porcelain', THIN);              // bubbles
    ball(g, 26, -44, 5, 'porcelain', THIN);
    ball(g, 34, -41, 3.5, 'porcelain', THIN);
    ball(g, 56, -43, 4, 'paint-yellow', THIN);           // rubber duck
    ball(g, 60, -48, 2.8, 'paint-yellow', THIN);
    shape(g, 'M62.5 -48 L66 -47 L62.5 -46 Z', 'fabric-a', 'none');
  },

  toilet(g) {
    box(g, 14, -52, 16, 22, 'porcelain', THICK, 2);
    box(g, 19, -56, 6, 4, 'metal', THIN, 1);
    shape(g, 'M4 -30 L30 -30 L28 -19 Q24 -13 18 -13 L21 0 L9 0 L12 -13 Q6 -17 4 -30 Z', 'porcelain');
    box(g, 2, -33, 28, 4, 'porcelain', THICK, 2);
    shadow(g, 'M12 -13 L18 -13 L21 0 L9 0 Z');
  },

  sink(g) {
    box(g, 4, -100, 24, 30, 'glass', THICK, 3);
    shine(g, 'M8 -96 L15 -96 L8 -84 Z');
    shape(g, 'M0 -46 L32 -46 Q30 -34 16 -34 Q2 -34 0 -46 Z', 'porcelain');
    shape(g, 'M12 -34 L20 -34 L22 0 L10 0 Z', 'porcelain');
    shape(g, 'M14 -46 L14 -52 L22 -52', 'none', THIN);
  },

  /* --- LOUNGE and DINING ------------------------------------ */

  sofa(g, o) {
    const cloth = o.colour || 'fabric-a';
    box(g, 6, -44, 76, 22, cloth, THICK, 6);
    box(g, 6, -26, 76, 16, cloth, THICK, 4);
    line(g, 32, -26, 32, -12);
    line(g, 56, -26, 56, -12);
    box(g, 0, -34, 12, 26, cloth, THICK, 5);
    box(g, 76, -34, 12, 26, cloth, THICK, 5);
    box(g, 60, -42, 16, 14, 'paint-yellow', THIN, 4);
    shadow(g, 'M6 -14 L82 -14 L82 -10 L6 -10 Z');
    box(g, 4, -8, 5, 8, 'wood-dark', THIN, 1);
    box(g, 79, -8, 5, 8, 'wood-dark', THIN, 1);
  },

  armchair(g, o) {
    const cloth = o.colour || 'fabric-b';
    box(g, 4, -44, 30, 22, cloth, THICK, 6);
    box(g, 4, -26, 30, 16, cloth, THICK, 4);
    box(g, 0, -32, 9, 24, cloth, THICK, 4);
    box(g, 29, -32, 9, 24, cloth, THICK, 4);
    shadow(g, 'M4 -14 L34 -14 L34 -10 L4 -10 Z');
    box(g, 3, -8, 4, 8, 'wood-dark', THIN, 1);
    box(g, 31, -8, 4, 8, 'wood-dark', THIN, 1);
  },

  /* The telly. Bruno walks straight to this. */
  tv(g) {
    glow(g, 28, -46, 34, 26, 'screen');
    box(g, 0, -22, 56, 22, 'wood-dark');
    line(g, 28, -20, 28, -3);
    ball(g, 24, -11, 1.6, 'metal', THIN);
    ball(g, 32, -11, 1.6, 'metal', THIN);
    box(g, 24, -28, 8, 6, 'worktop', THIN, 1);
    box(g, 3, -64, 50, 36, 'worktop', THICK, 3);
    box(g, 7, -60, 42, 28, 'screen', 'none', 1);
    shine(g, 'M9 -58 L22 -58 L9 -41 Z');
  },

  /* The piano. Hendrix says this is the best hiding place in the
     house, and he is right. Something glints under the lid. */
  piano(g) {
    box(g, 0, -60, 66, 60, 'wood-dark', THICK, 2);
    box(g, -2, -66, 70, 7, 'wood-dark');
    box(g, 6, -56, 54, 14, 'wood', THIN, 2);
    shape(g, 'M24 -59 L42 -59 L40 -74 L26 -74 Z', 'porcelain', THIN);
    line(g, 29, -70, 37, -70);
    line(g, 29, -66, 37, -66);
    box(g, -4, -41, 74, 8, 'porcelain', THICK, 1);
    for (let k = 0; k < 9; k += 1) {
      if (k % 3 !== 2) add(g, 'rect', { x: 3 + k * 7.6, y: -41, width: 3.2, height: 5, class: 'p-ink-fill' });
    }
    box(g, 4, -33, 58, 27, 'wood', THIN, 1);
    box(g, -2, -33, 6, 33, 'wood-dark');
    box(g, 62, -33, 6, 33, 'wood-dark');
    ball(g, 28, -3, 2, 'metal', THIN);
    ball(g, 38, -3, 2, 'metal', THIN);
    shadow(g, 'M58 -60 L66 -60 L66 -41 L58 -41 Z');
    add(g, 'path', { d: 'M56 -78 L58 -72 L64 -70 L58 -68 L56 -62 L54 -68 L48 -70 L54 -72 Z', fill: paint('paint-yellow'), class: 'p-fine p-twinkle' });
  },

  lamp(g) {
    glow(g, 10, -62, 26, 32);
    shape(g, 'M1 0 Q10 -6 19 0 Z', 'worktop', THIN);
    line(g, 10, -3, 10, -58, THICK);
    shape(g, 'M0 -58 L20 -58 L16 -75 L4 -75 Z', 'lamp-shade');
  },

  rug(g, o) {
    add(g, 'ellipse', { cx: 42, cy: -2, rx: 42, ry: 5, fill: paint(o.colour || 'fabric-a'), class: THIN });
    add(g, 'ellipse', { cx: 42, cy: -2, rx: 30, ry: 3, fill: 'none', class: 'p-fine p-stitch' });
  },

  table(g) {
    const chair = (x, backX) => {
      box(g, backX, -56, 5, 56, 'wood-dark', THIN, 1);
      box(g, x, -27, 22, 5, 'wood', THIN, 1);
      box(g, x + (backX > x ? 1 : 18), -22, 3, 22, 'wood-dark', THIN, 0);
    };
    chair(0, 0);
    chair(74, 91);
    shape(g, 'M12 -37 L84 -37 L82 -21 Q48 -17 14 -21 Z', 'porcelain');
    box(g, 20, -21, 5, 21, 'wood-dark', THIN, 1);
    box(g, 71, -21, 5, 21, 'wood-dark', THIN, 1);
    shape(g, 'M36 -37 Q48 -29 60 -37 Z', 'metal', THIN);        // fruit bowl
    ball(g, 43, -39, 4, 'fabric-a', THIN);
    ball(g, 51, -40, 4, 'paint-yellow', THIN);
    shadow(g, 'M14 -24 Q48 -20 82 -24 L82 -21 Q48 -17 14 -21 Z');
  },

  /* The dresser. The cash tin is in the drawer. */
  dresser(g) {
    box(g, 0, -86, 28, 86, 'wood');
    box(g, 3, -82, 22, 38, 'wood-dark', 'none', 0);
    [-72, -54].forEach((y) => [8, 14, 20].forEach((x) => ball(g, x, y, 4, 'porcelain', THIN)));
    box(g, 3, -44, 22, 2, 'wood-dark', 'none', 0);
    box(g, 3, -40, 22, 10, 'wood-light', THIN, 1);
    ball(g, 14, -35, 1.6, 'metal', THIN);
    box(g, 3, -28, 22, 24, 'none', THIN, 1);
    shadow(g, 'M23 -86 L28 -86 L28 0 L23 0 Z');
  },

  /* --- KITCHEN and UTILITY ---------------------------------- */

  counter(g) {
    box(g, 0, -40, 82, 40, 'units');
    box(g, 3, -34, 24, 28, 'none', THIN, 1);
    box(g, 29, -34, 24, 28, 'none', THIN, 1);
    line(g, 23, -30, 23, -22);
    line(g, 33, -30, 33, -22);
    box(g, 55, -34, 24, 28, 'worktop', THIN, 1);             // oven
    box(g, 59, -26, 16, 14, 'lamp-glow', THIN, 1);
    line(g, 58, -31, 76, -31);
    box(g, -2, -45, 86, 6, 'worktop');                       // worktop
    box(g, 58, -53, 17, 8, 'metal', THIN, 1);                // pan
    line(g, 75, -51, 84, -51);
    shape(g, 'M8 -45 L8 -56 Q14 -61 20 -56 L20 -45 Z', 'fabric-a', THIN);   // kettle
    shape(g, 'M20 -53 L25 -56', 'none', THIN);
    shadow(g, 'M0 -6 L82 -6 L82 0 L0 0 Z');
  },

  fridge(g) {
    box(g, 0, -84, 34, 84, 'porcelain', THICK, 4);
    line(g, 2, -56, 32, -56);
    box(g, 27, -80, 3, 18, 'metal', THIN, 1);
    box(g, 27, -50, 3, 24, 'metal', THIN, 1);
    box(g, 5, -78, 12, 9, 'paint-yellow', THIN, 1);          // a drawing on the fridge
    shape(g, 'M8 -71 L11 -76 L14 -71', 'none', THIN);
    ball(g, 12, -44, 2.2, 'fabric-a', 'none');
    box(g, 5, -38, 13, 11, 'paint-blue', THIN, 1);
    shadow(g, 'M28 -82 L34 -82 L34 -2 L28 -2 Z');
  },

  washer(g) {
    box(g, 0, -40, 34, 40, 'porcelain', THICK, 3);
    line(g, 2, -32, 32, -32);
    ball(g, 6, -36, 1.5, 'fabric-a', 'none');
    ball(g, 11, -36, 1.5, 'fabric-c', 'none');
    ball(g, 17, -16, 11, 'metal');
    ball(g, 17, -16, 8, 'glass', THIN);
    shape(g, 'M12 -16 Q17 -22 22 -16 Q17 -10 12 -16', 'none', THIN);
  },

  boiler(g) {
    add(g, 'path', { d: 'M8 -74 L8 -2 M22 -74 L22 -2', class: 'p-pipe' });
    box(g, 0, -118, 30, 44, 'porcelain', THICK, 3);
    box(g, 8, -108, 14, 7, 'screen', THIN, 1);
    ball(g, 15, -88, 3, 'fabric-a', THIN);
  },

  bucket(g) {
    shape(g, 'M0 -18 L20 -18 L17 0 L3 0 Z', 'metal');
    shape(g, 'M1 -18 Q10 -30 19 -18', 'none', THIN);
    shadow(g, 'M14 -18 L20 -18 L17 0 L12 0 Z');
  },

  freezer(g) {
    box(g, 0, -38, 60, 38, 'porcelain', THICK, 3);
    line(g, 2, -30, 58, -30);
    box(g, 26, -34, 10, 3, 'metal', THIN, 1);
    shape(g, 'M8 -22 L12 -18 M16 -24 L20 -20 M44 -20 L48 -16', 'none', 'p-frost');
    shadow(g, 'M54 -38 L60 -38 L60 0 L54 0 Z');
  },

  /* --- PORCH and HALL --------------------------------------- */

  coats(g) {
    box(g, 0, -110, 34, 4, 'wood');
    shape(g, 'M4 -106 L14 -106 L16 -62 L2 -62 Z', 'fabric-a');
    shape(g, 'M18 -106 L30 -106 L32 -68 L16 -68 Z', 'fabric-b');
    shape(g, 'M4 0 L4 -22 L12 -22 L12 -6 L17 -6 L17 0 Z', 'leaf');     // wellies
    shape(g, 'M19 0 L19 -22 L27 -22 L27 -6 L32 -6 L32 0 Z', 'leaf');
  },

  /* --- ON THE WALLS ----------------------------------------- */

  picture(g) {
    box(g, 0, -106, 30, 24, 'wood-light');
    box(g, 4, -102, 22, 16, 'glass', 'none', 0);
    shape(g, 'M4 -86 Q12 -96 18 -90 Q22 -94 26 -88 L26 -86 Z', 'leaf', 'none');
    ball(g, 20, -98, 2.5, 'paint-yellow', 'none');
  },

  window(g, o) {
    const curtains = o.colour || 'fabric-a';
    box(g, 0, -118, 42, 40, 'porcelain');
    box(g, 4, -114, 34, 32, 'night-glass', 'none', 0);
    add(g, 'circle', { cx: 30, cy: -106, r: 3.5, fill: paint('moon'), class: 'night-only' });
    line(g, 21, -114, 21, -82);
    line(g, 4, -98, 38, -98);
    box(g, -4, -81, 50, 4, 'porcelain', THIN, 1);
    line(g, -8, -122, 50, -122, THICK);
    shape(g, 'M-6 -122 Q0 -100 -4 -79 L3 -79 Q6 -100 2 -122 Z', curtains, THIN);
    shape(g, 'M44 -122 Q42 -100 39 -79 L46 -79 Q50 -100 48 -122 Z', curtains, THIN);
  },

  radiator(g) {
    box(g, 0, -30, 38, 22, 'porcelain', THICK, 3);
    [7, 13, 19, 25, 31].forEach((x) => line(g, x, -27, x, -11));
    line(g, 4, -8, 4, 0);
    line(g, 34, -8, 34, 0);
  },

  clock(g) {
    ball(g, 10, -112, 9, 'porcelain');
    line(g, 10, -112, 10, -118);
    line(g, 10, -112, 14, -110);
  },

  porthole(g) {
    ball(g, 13, -30, 13, 'wood-light');
    ball(g, 13, -30, 9, 'night-glass', THIN);
    line(g, 13, -39, 13, -21);
    line(g, 4, -30, 22, -30);
  },

  pegboard(g) {
    box(g, 0, -88, 60, 32, 'cardboard');
    [-82, -72, -62].forEach((y) => [6, 14, 22, 30, 38, 46, 54].forEach((x) =>
      add(g, 'circle', { cx: x, cy: y, r: 1, class: 'p-dot' })));
    box(g, 6, -84, 4, 22, 'wood-light', THIN, 1);
    box(g, 2, -86, 12, 5, 'metal', THIN, 1);
    shape(g, 'M20 -84 L32 -84 L32 -74 L20 -70 Z', 'metal', THIN);
    box(g, 38, -84, 3, 18, 'metal', THIN, 1);
    box(g, 37, -86, 5, 6, 'fabric-a', THIN, 1);
    ball(g, 52, -76, 6, 'none', THIN);                       // coil of rope
    ball(g, 52, -76, 3, 'none', THIN);
  },

  /* --- ATTIC, CELLAR, GARAGE, SHED -------------------------- */

  /* The bank of security monitors. This is where you watch the
     night happen from. */
  monitors(g) {
    glow(g, 52, -44, 60, 22, 'screen');
    box(g, 0, -30, 104, 5, 'wood-dark');
    box(g, 4, -25, 4, 25, 'wood-dark', THIN, 1);
    box(g, 96, -25, 4, 25, 'wood-dark', THIN, 1);
    [6, 38, 70].forEach((x, i) => {
      box(g, x, -56, 30, 22, 'worktop', THICK, 2);
      box(g, x + 3, -53, 24, 16, 'screen', 'none', 1);
      box(g, x + 13, -34, 4, 4, 'worktop', THIN, 0);
      line(g, x + 3, -42, x + 27, -42);
      if (i === 1) {
        ball(g, x + 12, -48, 2.2, 'burglar-mask', 'none');       // somebody on camera
        box(g, x + 10, -46, 4.5, 6, 'burglar-mask', 'none', 1);
      }
    });
  },

  shelves(g) {
    box(g, 0, -80, 3, 80, 'metal', THIN, 0);
    box(g, 49, -80, 3, 80, 'metal', THIN, 0);
    [-78, -52, -26].forEach((y) => box(g, 0, y, 52, 3, 'metal', THIN, 0));
    box(g, 6, -92, 18, 14, 'cardboard', THIN, 1);            // on top
    box(g, 5, -65, 12, 13, 'metal', THIN, 1);                // paint tin
    box(g, 5, -61, 12, 4, 'fabric-a', 'none', 0);
    ball(g, 30, -60, 7, 'sack', THIN);                       // rope
    ball(g, 30, -60, 3, 'none', THIN);
    box(g, 40, -63, 7, 11, 'glass', THIN, 2);                // jar
    shape(g, 'M5 -44 L19 -44 L17 -26 L7 -26 Z', 'metal', THIN);   // bucket
    box(g, 26, -38, 8, 12, 'fabric-b', THIN, 1);             // tins
    box(g, 36, -36, 8, 10, 'paint-yellow', THIN, 1);
  },

  car(g) {
    shape(g, 'M4 -12 Q2 -26 16 -28 L30 -30 L42 -46 L74 -46 L88 -30 Q100 -28 98 -12 Z', 'car');
    shape(g, 'M34 -30 L44 -42 L56 -42 L56 -30 Z', 'glass', THIN);
    shape(g, 'M60 -30 L60 -42 L72 -42 L82 -30 Z', 'glass', THIN);
    box(g, 0, -17, 6, 5, 'metal', THIN, 1);
    box(g, 94, -17, 6, 5, 'metal', THIN, 1);
    ball(g, 93, -22, 3, 'lamp-glow', THIN);
    shadow(g, 'M6 -16 L96 -16 L98 -12 L4 -12 Z');
    [24, 78].forEach((x) => {
      add(g, 'circle', { cx: x, cy: -10, r: 10, class: 'p-ink-fill' });
      ball(g, x, -10, 4, 'metal', THIN);
    });
  },

  lawnmower(g) {
    line(g, 24, -18, 38, -46, THICK);
    line(g, 34, -46, 42, -46, THICK);
    shape(g, 'M2 -8 L4 -18 Q12 -24 26 -22 L28 -8 Z', 'fabric-a');
    ball(g, 7, -6, 5, 'worktop', THIN);
    ball(g, 24, -6, 5, 'worktop', THIN);
  },

  plant(g) {
    shape(g, 'M11 -14 Q1 -30 5 -42 Q12 -30 11 -14 Z', 'leaf', THIN);
    shape(g, 'M11 -14 Q21 -28 19 -40 Q10 -28 11 -14 Z', 'leaf', THIN);
    shape(g, 'M11 -14 Q9 -36 13 -46 Q17 -32 11 -14 Z', 'leaf', THIN);
    shape(g, 'M2 -14 L20 -14 L17 0 L5 0 Z', 'pot');
  },

  /* ============================================================
     CLOSE UP THINGS
     These are small. You only see them when you zoom into a room,
     because from the whole house they would be a few dots. Rooms
     ask for them in their closeUp list in data/rooms.js.
     Things on a wall are drawn at their own height, like the
     picture above, so they do not need a lift.
     ============================================================ */

  trunk(g) {
    box(g, 0, -22, 40, 22, 'wood');
    shape(g, 'M0 -22 Q20 -31 40 -22 Z', 'wood-dark');
    box(g, 8, -26, 4, 26, 'metal', THIN, 0.5);
    box(g, 28, -26, 4, 26, 'metal', THIN, 0.5);
    box(g, 17, -18, 6, 6, 'paint-yellow', THIN, 1);
    shadow(g, 'M34 -22 L40 -22 L40 0 L34 0 Z');
  },

  suitcase(g, o) {
    shape(g, 'M14 -14 Q14 -19 18 -19 L22 -19 Q26 -19 26 -14', 'none', THIN);   // handle
    box(g, 0, -14, 40, 14, o.colour || 'fabric-b', THICK, 3);
    box(g, 9, -14, 3, 14, 'wood-dark', 'none', 0);
    box(g, 28, -14, 3, 14, 'wood-dark', 'none', 0);
    ball(g, 20, -7, 3.5, 'paint-yellow', THIN);                            // sticker
    shadow(g, 'M34 -14 L40 -14 L40 0 L34 0 Z');
  },

  /* A mirror cabinet, high on the bathroom wall */
  cabinet(g) {
    box(g, 0, -124, 30, 32, 'porcelain');
    box(g, 3, -121, 24, 26, 'glass', THIN, 1);
    shine(g, 'M6 -119 L13 -119 L6 -107 Z');
    ball(g, 25, -108, 1.4, 'metal', THIN);
    box(g, -2, -92, 34, 3, 'porcelain', THIN, 1);
    box(g, 4, -98, 4, 6, 'fabric-b', THIN, 1);          // toothbrush pot
  },

  towel(g, o) {
    line(g, 0, -92, 30, -92, THICK);
    shape(g, 'M4 -92 L26 -92 L25 -66 L5 -66 Z', o.colour || 'fabric-a', THIN);
    line(g, 6, -71, 24, -71);
  },

  /* The airing cupboard. Warm, full of towels, and nobody ever
     checks it. */
  airing(g) {
    box(g, 0, -104, 34, 104, 'porcelain');
    [-96, -91, -86, -81].forEach((y) => line(g, 5, y, 29, y));
    box(g, 4, -70, 26, 62, 'none', THIN, 1);
    ball(g, 28, -48, 1.8, 'metal', THIN);
    shadow(g, 'M29 -104 L34 -104 L34 0 L29 0 Z');
  },

  /* Hendrix's shelf: a trophy, some books, a rocket */
  trophyshelf(g) {
    box(g, 0, -96, 40, 3, 'wood-dark', THIN, 0.5);
    shape(g, 'M3 -93 L9 -93 L3 -87 Z', 'wood-dark', THIN);
    shape(g, 'M31 -93 L37 -93 L37 -87 Z', 'wood-dark', THIN);
    shape(g, 'M4 -108 L12 -108 Q12 -101 8 -100 L8 -98 L10 -96 L6 -96 L8 -98 L8 -100 Q4 -101 4 -108 Z', 'paint-yellow', THIN);
    box(g, 16, -108, 4, 12, 'fabric-a', THIN, 0.5);
    box(g, 20.5, -106, 4, 10, 'fabric-b', THIN, 0.5);
    box(g, 25, -109, 3.5, 13, 'fabric-c', THIN, 0.5);
    shape(g, 'M33 -96 L33 -104 Q35 -110 37 -104 L37 -96 Z', 'porcelain', THIN);  // rocket
    shape(g, 'M33 -99 L31 -96 L33 -96 Z', 'fabric-a', 'none');
    shape(g, 'M37 -99 L39 -96 L37 -96 Z', 'fabric-a', 'none');
  },

  football(g) {
    ball(g, 7, -7, 7, 'porcelain');
    shape(g, 'M5 -9 L7 -11 L9.5 -9.5 L8.5 -6.5 L5.5 -6.5 Z', 'ink', 'none');
    shine(g, 'M3 -11 Q4 -13 6 -13 Z');
  },

  hatbox(g) {
    box(g, 0, -14, 26, 14, 'paint-pink', THICK, 2);
    box(g, -1, -16, 28, 4, 'paint-pink', THIN, 2);
    box(g, 11, -16, 4, 16, 'fabric-a', 'none', 0);
  },

  slippers(g) {
    shape(g, 'M0 0 Q0 -5 5 -5 L14 -4 Q16 -2 14 0 Z', 'fabric-b', THIN);
    shape(g, 'M10 0 Q10 -5 15 -5 L24 -4 Q26 -2 24 0 Z', 'fabric-b', THIN);
  },

  teddy(g) {
    ball(g, 9, -7, 7, 'cardboard');
    ball(g, 9, -18, 6, 'cardboard');
    ball(g, 4, -23, 2.5, 'cardboard', THIN);
    ball(g, 14, -23, 2.5, 'cardboard', THIN);
    ball(g, 9, -16, 2.2, 'paint-yellow', 'none');
    add(g, 'circle', { cx: 7, cy: -19.5, r: 0.9, class: 'p-ink-fill' });
    add(g, 'circle', { cx: 11, cy: -19.5, r: 0.9, class: 'p-ink-fill' });
  },

  umbrellas(g) {
    shape(g, 'M3 -34 Q3 -40 8 -40', 'none', THICK);
    shape(g, 'M8 -30 Q8 -38 13 -38', 'none', THICK);
    box(g, 0, -22, 14, 22, 'metal', THICK, 2);
    line(g, 1, -16, 13, -16);
  },

  mat(g) {
    box(g, 0, -3, 30, 3, 'cardboard', THIN, 1);
  },

  books(g) {
    box(g, 0, -5, 22, 5, 'fabric-b', THIN, 0.5);
    box(g, 2, -9, 18, 4, 'fabric-a', THIN, 0.5);
    box(g, 1, -13, 20, 4, 'paint-yellow', THIN, 0.5);
  },

  vase(g) {
    shape(g, 'M5 0 Q-2 -12 5 -20 L5 -24 L15 -24 L15 -20 Q22 -12 15 0 Z', 'fabric-b');
    shape(g, 'M5 -12 Q10 -9 15 -12', 'none', THIN);
    shine(g, 'M6 -17 Q4 -11 6 -5 L8 -5 Q6 -11 8 -17 Z');
  },

  teapot(g) {
    shape(g, 'M2 0 Q0 -12 10 -12 Q20 -12 18 0 Z', 'porcelain');
    shape(g, 'M18 -8 Q23 -9 24 -14', 'none', THIN);
    shape(g, 'M2 -9 Q-3 -8 0 -3', 'none', THIN);
    ball(g, 10, -13, 1.6, 'fabric-a', THIN);
  },

  /* A kitchen cupboard up on the wall */
  wallcupboard(g) {
    box(g, 0, -122, 34, 30, 'units');
    line(g, 17, -120, 17, -94);
    line(g, 13, -110, 13, -104);
    line(g, 21, -110, 21, -104);
    shadow(g, 'M0 -94 L34 -94 L34 -92 L0 -92 Z');
  },

  cereal(g) {
    box(g, 0, -18, 12, 18, 'paint-yellow', THIN, 1);
    ball(g, 6, -10, 3, 'fabric-a', 'none');
    box(g, 13, -14, 10, 14, 'fabric-b', THIN, 1);
  },

  /* The utility shelf, full of bottles you should not drink */
  bottleshelf(g) {
    box(g, 0, -84, 34, 3, 'wood-dark', THIN, 0.5);
    box(g, 3, -98, 6, 14, 'fabric-b', THIN, 2);
    box(g, 5, -101, 2, 3, 'porcelain', THIN, 0);
    box(g, 12, -96, 7, 12, 'fabric-c', THIN, 2);
    box(g, 22, -99, 8, 15, 'paint-yellow', THIN, 2);
    box(g, 24, -102, 4, 3, 'fabric-a', THIN, 0);
  },

  toolbox(g) {
    shape(g, 'M10 -14 L10 -19 L22 -19 L22 -14', 'none', THICK);
    box(g, 0, -14, 32, 14, 'fabric-a', THICK, 1.5);
    line(g, 1, -9, 31, -9);
    box(g, 14, -11, 4, 4, 'metal', THIN, 0.5);
  },

  tins(g) {
    box(g, 0, -11, 11, 11, 'metal', THIN, 1);
    box(g, 0, -8, 11, 3, 'fabric-b', 'none', 0);
    box(g, 12, -9, 10, 9, 'metal', THIN, 1);
    box(g, 12, -6, 10, 3, 'paint-yellow', 'none', 0);
    box(g, 5, -21, 11, 10, 'metal', THIN, 1);
    box(g, 5, -17, 11, 3, 'fabric-a', 'none', 0);
  },

  /* A garden hose wound on a reel, on the garage wall */
  hosereel(g) {
    box(g, 6, -66, 4, 24, 'wood-dark', THIN, 0.5);
    ball(g, 8, -52, 9, 'leaf');
    ball(g, 8, -52, 6, 'none', THIN);
    ball(g, 8, -52, 2.5, 'metal', THIN);
    shape(g, 'M14 -46 Q18 -30 10 -24', 'none', 'p-fine');
  },

  flowerpots(g) {
    shape(g, 'M0 -10 L14 -10 L12 0 L2 0 Z', 'pot');
    shape(g, 'M1 -18 L13 -18 L11.5 -10 L2.5 -10 Z', 'pot');
    shape(g, 'M2 -25 L12 -25 L10.5 -18 L3.5 -18 Z', 'pot');
  },

  keys(g) {
    box(g, 0, -92, 18, 5, 'wood', THIN, 1);
    line(g, 5, -87, 5, -80);
    ball(g, 5, -78, 2.5, 'metal', THIN);
    line(g, 12, -87, 12, -82);
    ball(g, 12, -80, 2.5, 'paint-yellow', THIN);
    box(g, 10.5, -77, 3, 5, 'fabric-a', THIN, 1);
  },

  /* Letters on the doormat */
  post(g) {
    shape(g, 'M0 0 L10 -3 L12 0 Z', 'porcelain', THIN);
    shape(g, 'M3 0 L13 -2 L14 0 Z', 'paint-yellow', THIN);
  },

  /* A plug socket, low on the wall. Nothing hides in it. */
  socket(g) {
    box(g, 0, -20, 10, 8, 'porcelain', THIN, 1);
    line(g, 3, -17, 3, -15);
    line(g, 7, -17, 7, -15);
  }
};

/* Draw one prop. If rooms.js asks for something that is not in
   the list above, say so in the console instead of breaking. */
export function drawProp(kind, g, options = {}) {
  const draw = PROPS[kind];
  if (!draw) {
    console.warn(`There is no drawing called "${kind}" in js/props.js`);
    return;
  }
  draw(g, options);
}
