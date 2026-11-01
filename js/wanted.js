/* ===========================================================
   WANTED - who is coming tonight, and what each one hates

   A strip of little wanted posters that stays on screen while you
   search, build, rig and watch. Each burglar has his face, his name,
   the pictures of the traps he HATES, and the pictures of the ones
   he does not care about (crossed out).

   The pictures come from CAT_PICTURES in data/recipes.js, the same
   ones on your trap cards, so you can match picture to picture.
   What each burglar hates is weakTo in data/burglars.js.
   =========================================================== */

import { CAT_PICTURES } from '../data/recipes.js';
import { tonight } from './crew.js';
import { drawBurglar } from './burglar-art.js';

const NS = 'http://www.w3.org/2000/svg';

const WORDS = {
  LOUD: 'loud', SLIPPERY: 'slippery', STICKY: 'sticky',
  MESSY: 'messy', STARTLE: 'scary', TANGLE: 'tangly'
};

function pictures(cats, className) {
  const row = document.createElement('span');
  row.className = className;
  cats.forEach((cat) => {
    const pic = document.createElement('span');
    pic.className = 'wanted-pic';
    pic.dataset.cat = cat;
    pic.textContent = CAT_PICTURES[cat] || '?';
    pic.title = WORDS[cat] || cat;
    row.append(pic);
  });
  return row;
}

function face(look) {
  const svg = document.createElementNS(NS, 'svg');
  /* just the head and shoulders */
  svg.setAttribute('viewBox', '-26 -100 52 52');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'wanted-face');
  const g = document.createElementNS(NS, 'g');
  drawBurglar(g, look);
  svg.append(g);
  return svg;
}

/* Fill the strip with tonight's crew. */
export function drawWanted(box) {
  box.innerHTML = '';
  const title = document.createElement('p');
  title.className = 'wanted-title';
  title.textContent = 'Tonight:';
  box.append(title);
  tonight().forEach((b) => {
    const card = document.createElement('div');
    card.className = 'wanted-card';
    const hates = b.weakTo || [];
    const meh = b.shrugsOff || [];
    card.setAttribute('aria-label', `${b.name} hates ${hates.map((c) => WORDS[c]).join(' and ')} traps.`
      + (meh.length ? ` ${b.name} does not care about ${meh.map((c) => WORDS[c]).join(' or ')} traps.` : ''));
    card.setAttribute('role', 'img');
    const name = document.createElement('strong');
    name.className = 'wanted-name';
    name.textContent = b.name;
    const hate = document.createElement('span');
    hate.className = 'wanted-row';
    hate.append(Object.assign(document.createElement('span'), { className: 'wanted-word', textContent: 'Hates' }),
      pictures(hates, 'wanted-hates'));
    card.append(face(b.look), name, hate);
    if (meh.length) card.append(pictures(meh, 'wanted-meh'));
    box.append(card);
  });
  /* burglars are all different heights, so frame each one's head
     once they are on the page and can be measured */
  requestAnimationFrame(() => box.querySelectorAll('.wanted-face').forEach((svg) => {
    try {
      const b = svg.firstChild.getBBox();
      if (!b.width) return;
      const size = Math.max(b.width * 0.75, b.height * 0.42);
      svg.setAttribute('viewBox', `${b.x + b.width / 2 - size / 2} ${b.y - 2} ${size} ${size}`);
    } catch (e) { /* not drawn yet: keep the guess */ }
  }));
}
