/* ===========================================================
   ART: loads the pictures

   Every picture is its own file in the art folder. At the start
   we read each file once. Then:
     - the game turns it into a bitmap for the canvas (js/canvas.js)
     - a copy goes in the hidden sprite sheet in index.html, for
       the little pictures on the menus and the HUD (lives, cards)

   Want a better Dart? Draw a new art/dart.svg. Nothing else
   needs to change.
   =========================================================== */

import { setText, warm } from './canvas.js';

const SVG = 'http://www.w3.org/2000/svg';
const texts = {};       // the words inside each picture file, by name

export async function loadArt(names) {
  const sheet = document.getElementById('sprites');
  const defs = sheet.querySelector('defs');
  const unique = [...new Set(names)];

  await Promise.all(unique.map(async (name) => {
    const res = await fetch(`art/${name}.svg`);
    if (!res.ok) { console.warn(`No picture called art/${name}.svg`); return; }
    const text = await res.text();
    texts[name] = text;
    setText(name, text);
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const svg = doc.documentElement;
    const symbol = document.createElementNS(SVG, 'symbol');
    symbol.id = `art-${name}`;
    symbol.setAttribute('viewBox', svg.getAttribute('viewBox'));
    for (const child of [...svg.children]) {
      // Upgrade parts are left out of the copy, so the small ships
      // (like the lives in the corner) are always the plain ship.
      if (child.classList && child.classList.contains('up')) continue;
      // Glow colours go in the shared defs, once each.
      if (child.tagName === 'defs') {
        for (const def of [...child.children]) {
          if (def.id && !document.getElementById(def.id)) defs.appendChild(document.importNode(def, true));
        }
        continue;
      }
      symbol.appendChild(document.importNode(child, true));
    }
    sheet.appendChild(symbol);
    // Make its bitmap now, so nothing pops in during the game.
    await warm(name);
  }));
}

// The whole picture file as words.
export function rawArt(name) {
  return texts[name] || '';
}
