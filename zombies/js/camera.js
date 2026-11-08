/* ===========================================================
   CAMERA: zoom and pan the village

   The village is one SVG. Zooming is changing its viewBox:
   a smaller box shows less of the map, bigger. Pinch with two
   fingers, drag with one finger or the mouse to pan, double
   tap a square to zoom toward it, or use the + and - buttons.
   Min zoom shows the whole map, max is about 3x. On a phone
   the day starts zoomed in on the middle of the village.
   =========================================================== */

import { COLS, ROWS, TILE } from './state.js';

const W = COLS * TILE, H = ROWS * TILE;
const MAX = 3;
const cam = { x: 0, y: 0, scale: 1 };   // top left and zoom of the viewBox
let svg = null;
let onTap = null;        // called with the pointer event for a real tap
let onDrag = null;       // called while a drag that is NOT a pan is in progress (catapult aim)
let aimingMode = false;  // when the night is aiming the catapult, drags are not pans

const pointers = new Map();
let down = null;         // { x, y, t, moved }
let lastTap = 0;
let lastTapAt = null;   // where the last tap was, so only two taps in the same place zoom
let pinchStart = null;

export function setupCamera(tapHandler) {
  svg = document.getElementById('village');
  onTap = tapHandler;
  svg.addEventListener('pointerdown', onDown);
  svg.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
  svg.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
  document.getElementById('zoom-in').addEventListener('click', () => zoomAt(1.4));
  document.getElementById('zoom-out').addEventListener('click', () => zoomAt(1 / 1.4));
  document.getElementById('zoom-fit').addEventListener('click', () => fit());
  fit();
}

export function setAiming(on) { aimingMode = on; }

export function fit() { cam.scale = 1; cam.x = 0; cam.y = 0; apply(); }

// A phone starts on the middle of the village
export function startView() {
  if (window.innerWidth < 700) { cam.scale = 2; cam.x = W / 2 - W / 4; cam.y = H / 2 - H / 4; apply(); }
  else fit();
}

function apply() {
  cam.scale = Math.max(1, Math.min(MAX, cam.scale));
  const vw = W / cam.scale, vh = H / cam.scale;
  cam.x = Math.max(0, Math.min(W - vw, cam.x));
  cam.y = Math.max(0, Math.min(H - vh, cam.y));
  svg.setAttribute('viewBox', `${cam.x} ${cam.y} ${vw} ${vh}`);
}

// Zoom keeping the point under the pointer still
export function zoomAt(factor, cx, cy) {
  const r = svg.getBoundingClientRect();
  const px = cx === undefined ? 0.5 : (cx - r.left) / r.width;
  const py = cy === undefined ? 0.5 : (cy - r.top) / r.height;
  const vw = W / cam.scale, vh = H / cam.scale;
  const wx = cam.x + px * vw, wy = cam.y + py * vh;
  cam.scale *= factor;
  cam.scale = Math.max(1, Math.min(MAX, cam.scale));
  const nvw = W / cam.scale, nvh = H / cam.scale;
  cam.x = wx - px * nvw; cam.y = wy - py * nvh;
  apply();
}

function unitsPerPixel() { return (W / cam.scale) / svg.getBoundingClientRect().width; }

function onDown(e) {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), scale: cam.scale, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    down = null;
    return;
  }
  down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, ev: e };
  if (aimingMode || (onTap && onTap(e, 'down') === 'hold')) { down.hold = true; }
}

function onMove(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinchStart && pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const target = pinchStart.scale * (d / pinchStart.d);
    zoomAt(target / cam.scale, pinchStart.cx, pinchStart.cy);
    return;
  }
  if (!down) return;
  if (down.hold) { if (onTap) onTap(e, 'move'); return; }
  const dx = e.clientX - down.x, dy = e.clientY - down.y;
  if (!down.moved && Math.hypot(dx, dy) > 8) down.moved = true;
  if (down.moved) {
    const u = unitsPerPixel();
    cam.x -= (e.clientX - (down.lx ?? down.x)) * u;
    cam.y -= (e.clientY - (down.ly ?? down.y)) * u;
    apply();
  }
  down.lx = e.clientX; down.ly = e.clientY;
}

function onUp(e) {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchStart = null;
  if (!down) return;
  const d = down; down = null;
  if (d.hold) { if (onTap) onTap(e, 'up'); return; }
  if (d.moved) return;
  const now = performance.now();
  const samePlace = lastTapAt && Math.hypot(e.clientX - lastTapAt.x, e.clientY - lastTapAt.y) < 24;
  if (now - lastTap < 320 && samePlace) { lastTap = 0; lastTapAt = null; zoomAt(cam.scale < MAX ? 1.8 : 1 / MAX, e.clientX, e.clientY); return; }
  lastTap = now; lastTapAt = { x: e.clientX, y: e.clientY };
  if (onTap) onTap(d.ev, 'tap');
}
