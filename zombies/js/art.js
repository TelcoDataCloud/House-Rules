/* ===========================================================
   ART: loads every picture from the art folder

   Each file in art/ becomes a <symbol id="art-NAME"> inside the
   hidden sprite sheet on the page. Anything on screen is then
   <use href="#art-NAME">. Right click a zombie, Inspect, and
   the href tells you which file to open.
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

// A small inline picture for buttons and counters
export function icon(name, size = 30) {
  return `<svg width="${size}" height="${size}" aria-hidden="true"><use href="#art-${name}"></use></svg>`;
}
