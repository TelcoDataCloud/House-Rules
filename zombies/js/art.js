/* ===========================================================
   ART: loads every picture from the art folder

   Each file in art/ becomes a <symbol id="art-NAME"> inside the
   hidden sprite sheet on the page. Anything on screen is then
   <use href="#art-NAME">. Right click a zombie, Inspect, and
   the href tells you which file to open.

   Characters also have painted pictures (pics/), which replace
   the drawings once they load: see loadPictures below.
   =========================================================== */

const NAMES = [
  'hero', 'farmer', 'builder', 'brewer', 'lookout', 'giantfriend',
  'bob', 'hopper', 'digger', 'snot', 'gasbag', 'werewolf', 'giant',
  'wall', 'fence', 'torch', 'mud', 'pit', 'brains', 'tramp', 'spin', 'drop',
  'honey', 'scare', 'log', 'bed', 'farm', 'brewery', 'well', 'catapult', 'bell',
  'garlic', 'pumpkin', 'bucket', 'carrot', 'plank', 'heart', 'villager',
  'zombieicon', 'tree', 'grass', 'woods',
  'bogey', 'eyeball', 'eye', 'loosebits', 'arm', 'vomit', 'puddle', 'burplord', 'bogeyblob',
  'vampire', 'silver', 'ice', 'mirror', 'dawn', 'sprinkler', 'net',
  'cow', 'chicken', 'sheep', 'pig', 'horse', 'goldfish', 'pumpkinking',
  'cowfriend', 'chickenfriend', 'sheepfriend', 'pigfriend', 'pumpkinfarmer',
  'map', 'cottage', 'boulders', 'mine', 'stonewall', 'stone', 'miner',
  'spoon', 'pan', 'rubberchicken', 'mallet', 'sock',
  'whoopee', 'banana', 'pepper', 'disco', 'tophat', 'crown', 'partyhat', 'moustache', 'pillow',
];

export async function loadArt() {
  const sheet = document.getElementById('sprites');
  await Promise.all(NAMES.map(async (name) => {
    try {
      const text = await (await fetch(`art/${name}.svg`)).text();
      // take the viewBox off the file's <svg> tag, and keep everything inside it
      const viewBox = (text.match(/viewBox="([^"]+)"/) || [0, '0 0 40 40'])[1];
      const inner = text.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
      sheet.insertAdjacentHTML('beforeend', `<symbol id="art-${name}" viewBox="${viewBox}">${inner}</symbol>`);
    } catch (e) {
      console.warn('No picture for', name);
    }
  }));
}

// ---------- the painted pictures ----------
// Some art has a painted version (in the style of the concept art),
// packed into pics/ by tools/pack-pics.py. When it arrives it takes
// over that symbol, so every <use href="#art-bob"> shows the painting.
// Anything without a painting keeps its drawing. title is the title
// screen picture.
export async function loadPictures() {
  let list = [];
  try { list = await (await fetch('pics/packs.json')).json(); } catch (e) { return; }
  const raw = {};
  await Promise.all(list.map(async (f) => {
    try { Object.assign(raw, await (await fetch('pics/' + f)).json()); } catch (e) { /* that pack is missing: those keep their drawings */ }
  }));
  const names = [...new Set(Object.keys(raw).map((k) => k.replace(/~\d+$/, '')))];
  names.forEach((name) => {
    const parts = Object.keys(raw).filter((k) => k === name || k.startsWith(name + '~')).sort((a, b) => (+a.split('~')[1] || 0) - (+b.split('~')[1] || 0));
    // !q12! in a pack means twelve q's in a row (see tools/pack-pics.py)
    const b64 = parts.map((k) => raw[k]).join('').replace(/!(.)(\d+)!/g, (m, ch, n) => ch.repeat(Number(n)));
    const url = 'data:image/webp;base64,' + b64;
    if (name === 'title') { const t = document.getElementById('title-pic'); if (t) { t.src = url; t.hidden = false; document.getElementById('title-drawing')?.setAttribute('hidden', ''); } return; }
    const sym = document.getElementById('art-' + name);
    if (!sym) return;
    sym.setAttribute('viewBox', '0 0 1024 1024');
    sym.innerHTML = `<image href="${url}" x="0" y="0" width="1024" height="1024"/>`;
  });
}

// A small inline picture for buttons and counters
export function icon(name, size = 30) {
  return `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#art-${name}"></use></svg>`;
}
