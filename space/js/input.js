/* ===========================================================
   INPUT: keys, mouse and fingers

   Everything you press ends up in one place, the `input` object.
   Holding a key (arrows) is remembered as true or false.
   Pressing a button once (bomb, power up, pause) is put on a
   list of actions for the game loop to pick up.
   =========================================================== */

import { state, W, H } from './state.js';

export const input = {
  left: false, right: false, up: false, down: false,
  pointer: null,       // where the mouse or finger is, in game dots
  dragging: false,
  actions: [],
};

const HOLD = {
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
};

export function takeActions() {
  const list = input.actions;
  input.actions = [];
  return list;
}

function act(name) { input.actions.push(name); }

function toField(field, e) {
  const box = field.getBoundingClientRect();
  return {
    x: ((e.clientX - box.left) / box.width) * W,
    y: ((e.clientY - box.top) / box.height) * H,
  };
}

export function setupInput(field) {
  window.addEventListener('keydown', (e) => {
    const playing = state.mode === 'play';
    const dir = HOLD[e.code];
    if (dir && state.mode !== 'pick') {
      input[dir] = true;
      if (playing) e.preventDefault();
    }
    if (e.repeat) return;
    if (e.code === 'Space' && playing) { e.preventDefault(); act('bomb'); }
    if (e.code === 'KeyM' || e.code === 'Numpad0' || (e.key === '0' && e.location === 3)) act('upgrade');
    if (e.code === 'KeyP' || e.code === 'Escape') act('pause');
    const digit = { Digit1: 1, Digit2: 2, Digit3: 3, Numpad1: 1, Numpad2: 2, Numpad3: 3 }[e.code];
    if (digit) act(`pick${digit}`);
  });

  window.addEventListener('keyup', (e) => {
    const dir = HOLD[e.code];
    if (dir) input[dir] = false;
  });

  // Let go of everything if the window loses focus, or the ship keeps flying.
  window.addEventListener('blur', () => {
    input.left = input.right = input.up = input.down = false;
    input.dragging = false;
    if (state.mode === 'play') act('pause');
  });

  field.addEventListener('pointermove', (e) => {
    input.pointer = toField(field, e);
  });

  field.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return;
    input.pointer = toField(field, e);
    if (e.pointerType === 'touch') {
      state.touch = true;
      input.dragging = true;
      document.getElementById('touch-buttons').hidden = false;
      return;
    }
    if (state.mode === 'play' && state.controls === 'mouse' && e.button === 0) act('bomb');
  });

  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') input.dragging = false;
  });

  field.addEventListener('contextmenu', (e) => {
    if (state.mode === 'play' || state.mode === 'pick') { e.preventDefault(); act('upgrade'); }
  });

  document.getElementById('touch-bomb').addEventListener('pointerdown', (e) => { e.preventDefault(); act('bomb'); });
  document.getElementById('touch-power').addEventListener('pointerdown', (e) => { e.preventDefault(); act('upgrade'); });
}
