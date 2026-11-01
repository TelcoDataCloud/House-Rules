/* ===========================================================
   ART: loads the pictures and puts things on the screen

   Every picture is its own file in the art folder. At the start
   we read each file once and keep it in the hidden sprite sheet
   in index.html. Then every Dart on screen just says "draw the
   dart picture here", so a hundred Darts cost hardly anything.

   Want a better Dart? Draw a new art/dart.svg. Nothing else
   needs to change.
   =========================================================== */

const SVG = 'http://www.w3.org/2000/svg';

export async function loadArt(names) {
  const sheet = document.getElementById('sprites');
  const defs = sheet.querySelector('defs');
  const unique = [...new Set(names)];

  await Promise.all(unique.map(async (name) => {
    const res = await fetch(`art/${name}.svg`);
    if (!res.ok) { console.warn(`No picture called art/${name}.svg`); return; }
    const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
    const svg = doc.documentElement;
    const symbol = document.createElementNS(SVG, 'symbol');
    symbol.id = `art-${name}`;
    symbol.setAttribute('viewBox', svg.getAttribute('viewBox'));
    for (const child of [...svg.children]) {
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
  }));
}

// Make a thing on screen showing a picture. w and h are its size.
export function sprite(name, w, h, extra = '') {
  const div = document.createElement('div');
  div.className = `thing ${extra}`.trim();
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.dataset.art = name;      // right-click, Inspect: you can see which picture it is
  div.innerHTML = `<svg aria-hidden="true"><use href="#art-${name}" width="100%" height="100%"/></svg>`;
  return div;
}

// Move a thing so its middle is at x, y.
export function put(el, x, y, w, h) {
  el.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px)`;
}

export function layer(name) {
  return document.getElementById(`layer-${name}`);
}
