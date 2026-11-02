/* ===========================================================
   CANVAS: where the game is drawn

   The whole play area is one <canvas>. Every frame we wipe it
   and draw everything again, bottom to top: the bases, the
   ships, the shots, your ship, the bangs.

   The pictures are still the SVG files in the art folder. When
   the game starts, each one is turned into a picture (a bitmap)
   once, and kept. Drawing a bitmap is very fast, so the game can
   have lots of smoke and sparks and still run smoothly.

   Each picture also gets a few spare copies, made once:
     white   for the flash when you hit something
     shadow  a soft dark copy, drawn under flying things
     dark    for broken wrecks and switched-off turrets
     red     to make a boss glow red when it is angry
   =========================================================== */

import { W, H } from './state.js';

export const DPR = Math.min(2, window.devicePixelRatio || 1);
let canvas = null;
export let ctx = null;

export function setupCanvas() {
  canvas = document.getElementById('play');
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx = canvas.getContext('2d');
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

export function clear() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
}

// ---------- turning SVG text into bitmaps ----------

const texts = {};          // the SVG text of each picture, by name
const bitmaps = new Map(); // finished bitmaps, by key
const waiting = new Map(); // bitmaps still being made

export function setText(name, text) {
  texts[name] = text;
}
export function getText(name) {
  return texts[name] || '';
}

function sizeOf(text) {
  const m = text.match(/viewBox="\s*([-\d.]+)[\s,]+([-\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  return m ? [Number(m[3]), Number(m[4])] : [100, 100];
}

function blank(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

// Make one bitmap from SVG text. scale is pixels per viewBox unit.
async function rasterise(text, scale) {
  const [vw, vh] = sizeOf(text);
  const w = Math.min(2400, vw * scale);
  const h = Math.min(2400, vh * scale);
  // Give the SVG an exact pixel size so it is drawn sharp.
  const sized = text.replace(/<svg\b([^>]*)>/, (all, attrs) => {
    const clean = attrs.replace(/\s(width|height)="[^"]*"/g, '');
    return `<svg${clean} width="${w}" height="${h}" preserveAspectRatio="none">`;
  });
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = blank(w, h);
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// A copy of a bitmap, coloured in one flat colour (keeps the shape).
function silhouette(src, colour, blur = 0) {
  const pad = blur * 2;
  const c = blank(src.width + pad * 2, src.height + pad * 2);
  const g = c.getContext('2d');
  g.drawImage(src, pad, pad);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = colour;
  g.fillRect(0, 0, c.width, c.height);
  if (!blur) return c;
  const out = blank(c.width, c.height);
  const o = out.getContext('2d');
  o.filter = `blur(${blur}px)`;
  o.drawImage(c, 0, 0);
  out.pad = pad;
  return out;
}

// A copy with a dark coat painted over it (for wrecks).
function darkened(src, amount) {
  const c = blank(src.width, src.height);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = `rgba(10, 8, 12, ${amount})`;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

// Turn an SVG red, the way the red Hauler is, by wrapping the
// whole picture in an SVG colour filter (works in every browser).
function tinted(text, tint) {
  if (tint !== 'red') return text;
  const filter = '<filter id="tint-red-f"><feColorMatrix type="hueRotate" values="-85"/><feColorMatrix type="saturate" values="1.5"/></filter>';
  return text
    .replace(/<svg\b[^>]*>/, (open) => `${open}<defs>${filter}</defs><g filter="url(#tint-red-f)">`)
    .replace(/<\/svg>\s*$/, '</g></svg>');
}

// Ask for a picture. Returns { img, white, shadow, dark, red } when
// ready, or null while it is still being made (then try next frame).
// key lets the ship and capsules have their own versions.
export function art(name, { tint = '', key = '', text = null, scale = 0 } = {}) {
  const id = `${name}|${tint}|${key}`;
  const have = bitmaps.get(id);
  if (have) return have;
  if (!waiting.has(id)) {
    const src = tinted(text || texts[name] || '', tint);
    if (!src) return null;
    const s = scale || DPR * 2;
    waiting.set(id, rasterise(src, s).then((img) => {
      const set = {
        img,
        white: silhouette(img, '#ffffff'),
        shadow: silhouette(img, 'rgba(0, 0, 0, 1)', 3 * s),
        dark: darkened(img, 0.62),
        red: silhouette(img, '#ff3b3b'),
        pink: silhouette(img, '#ff3fa4'),
      };
      bitmaps.set(id, set);
      waiting.delete(id);
      return set;
    }).catch((e) => { console.warn(`Could not draw ${name}`, e); waiting.delete(id); }));
  }
  return null;
}

// Make a picture now and wait for it (used at the start).
export async function warm(name, opts = {}) {
  art(name, opts);
  const id = `${name}|${opts.tint || ''}|${opts.key || ''}`;
  if (waiting.has(id)) await waiting.get(id);
}

// ---------- drawing ----------

// Draw a picture with its middle at x, y, w by h pixels.
//   rot     turn it (radians, clockwise)
//   alpha   see-through (0 to 1)
//   look    'img' (normal), 'white', 'dark', 'red', 'pink'
//   shadow  draw a soft shadow this far below/right: [dx, dy, alpha]
//   ox, oy  where it turns around, from its middle (pixels)
export function sprite(set, x, y, w, h, opts = {}) {
  if (!set) return;
  const { rot = 0, alpha = 1, look = 'img', shadow = null, ox = 0, oy = 0, flipX = false } = opts;
  ctx.save();
  ctx.translate(x + ox, y + oy);
  if (rot) ctx.rotate(rot);
  if (flipX) ctx.scale(-1, 1);
  if (shadow && set.shadow) {
    const [dx, dy, sa] = shadow;
    const sh = set.shadow;
    const pad = (sh.pad || 0) * (w / set.img.width);
    ctx.globalAlpha = alpha * sa;
    ctx.drawImage(sh, -w / 2 - ox - pad + dx, -h / 2 - oy - pad + dy, w + pad * 2, h + pad * 2);
  }
  ctx.globalAlpha = alpha;
  if (look === 'white') {
    // A hit: the picture, with a bright white flash over it.
    ctx.drawImage(set.img, -w / 2 - ox, -h / 2 - oy, w, h);
    ctx.globalAlpha = alpha * 0.75;
    ctx.drawImage(set.white, -w / 2 - ox, -h / 2 - oy, w, h);
  } else {
    ctx.drawImage(set[look] || set.img, -w / 2 - ox, -h / 2 - oy, w, h);
  }
  ctx.restore();
}

// Draw a glow over a picture (for angry bosses, awake eyes).
export function glowOver(set, x, y, w, h, look, alpha) {
  if (!set || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(set[look], x - w / 2, y - h / 2, w, h);
  ctx.restore();
}

// A soft round glow (for fireballs, orbs, engine flames).
export function radial(x, y, r, stops, alpha = 1, mode = 'source-over') {
  if (r <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [at, col] of stops) g.addColorStop(at, col);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// A small picture drawn once with canvas code (bullets and so on),
// kept and reused. draw(g, w, h) paints it.
const made = new Map();
export function made2d(key, w, h, draw) {
  let c = made.get(key);
  if (!c) {
    c = blank(w * DPR * 2, h * DPR * 2);
    const g = c.getContext('2d');
    g.scale(DPR * 2, DPR * 2);
    draw(g, w, h);
    made.set(key, c);
  }
  return c;
}

// Big blocks of text with a dark outline (floating scores).
export function outlinedText(text, x, y, size, colour, alpha = 1, scale = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.font = `800 ${size}px Nunito, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size / 5);
  ctx.strokeStyle = '#05070f';
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = colour;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

// Turn a plate (a whole base) SVG string into a bitmap, async.
export function bitmapFromSvg(text, scale = DPR) {
  return rasterise(text, scale);
}
