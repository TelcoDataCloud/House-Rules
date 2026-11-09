/* ===========================================================
   ICONS: the little pictures for every weapon and bomb

   Used on the upgrade cards (big) and in the corner of the
   screen during the game (small), so you can tell what you have
   without reading.
   =========================================================== */

const BOMB = (fill) => `<path d="M35 2 L44 10 L44 30 L35 36 L26 30 L26 10 Z" fill="${fill}" stroke="#05070f" stroke-width="2"/><rect x="31" y="0" width="8" height="5" fill="#2a2d40"/>`;
export const PICS = {
  blaster: '<rect x="33" y="2" width="4" height="22" rx="2" fill="#ffffff"/><rect x="25" y="6" width="3" height="16" rx="1.5" fill="#38f0ff"/><rect x="42" y="6" width="3" height="16" rx="1.5" fill="#38f0ff"/><rect x="12" y="14" width="2" height="10" rx="1" fill="#38f0ff" opacity="0.6" transform="rotate(-14 13 19)"/><rect x="56" y="14" width="2" height="10" rx="1" fill="#38f0ff" opacity="0.6" transform="rotate(14 57 19)"/>',
  laser: '<rect x="27" y="0" width="5" height="30" rx="2.5" fill="#4dff7c"/><rect x="38" y="0" width="5" height="30" rx="2.5" fill="#c07cff"/>',
  beam: '<path d="M35 30 L14 0 L20 0 Z M35 30 L56 0 L50 0 Z" fill="#ff3fa4" opacity="0.55"/><rect x="29" y="0" width="12" height="32" rx="6" fill="#ff3fa4"/><rect x="32" y="0" width="6" height="32" rx="3" fill="#ffffff"/>',
  rail: '<rect x="32" y="0" width="6" height="32" fill="#ffd23f"/><rect x="34" y="0" width="2" height="32" fill="#ffffff"/><ellipse cx="35" cy="30" rx="10" ry="3" fill="none" stroke="#ffd23f" stroke-width="2"/><ellipse cx="35" cy="20" rx="8" ry="2.5" fill="none" stroke="#ffd23f" stroke-width="1.5"/>',
  homing: '<path d="M22 32 C14 18 22 8 52 4" stroke="#ff3fa4" stroke-width="3" fill="none" stroke-dasharray="4 4"/><circle cx="52" cy="4" r="5" fill="#ff3fa4"/><path d="M48 32 C56 18 48 8 18 4" stroke="#ff3fa4" stroke-width="3" fill="none" stroke-dasharray="4 4"/>',
  drones: '<use href="#art-drone" x="2" y="14" width="18" height="20"/><use href="#art-drone" x="50" y="14" width="18" height="20"/>',
  engine: '<path d="M27 2 L43 2 L46 12 L24 12 Z" fill="#8a90a8" stroke="#05070f" stroke-width="1.5"/><path d="M26 13 Q35 40 44 13 Z" fill="#ffd23f"/><path d="M30 13 Q35 30 40 13 Z" fill="#ffffff"/>',
  shields: '<circle cx="35" cy="44" r="30" fill="none" stroke="#38f0ff" stroke-width="4"/><circle cx="35" cy="44" r="23" fill="none" stroke="#38f0ff" stroke-width="2.5"/><circle cx="35" cy="44" r="17" fill="none" stroke="#38f0ff" stroke-width="1.5"/>',
  shield: '<circle cx="35" cy="44" r="30" fill="none" stroke="#38f0ff" stroke-width="4"/>',
  points: '<text x="35" y="24" text-anchor="middle" font-size="18" font-weight="800" fill="#ffd23f" stroke="#05070f" stroke-width="1">+3000</text>',
  bombpack: '<circle cx="24" cy="18" r="10" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/><circle cx="46" cy="18" r="10" fill="#ffd23f" stroke="#3a2a00" stroke-width="2"/>',
  'bomb-he': BOMB('#ff7a1a'),
  'bomb-cluster': '<circle cx="35" cy="8" r="6" fill="#ffd23f" stroke="#05070f" stroke-width="2"/><circle cx="20" cy="18" r="6" fill="#ffd23f" stroke="#05070f" stroke-width="2"/><circle cx="50" cy="18" r="6" fill="#ffd23f" stroke="#05070f" stroke-width="2"/><circle cx="27" cy="30" r="5" fill="#ffd23f" stroke="#05070f" stroke-width="2"/><circle cx="43" cy="30" r="5" fill="#ffd23f" stroke="#05070f" stroke-width="2"/>',
  'bomb-lightning': '<path d="M38 0 L22 18 L33 18 L18 36 L48 13 L36 13 L46 0 Z" fill="#ff3b4a" stroke="#ffffff" stroke-width="1.5"/>',
  'bomb-laser': '<rect x="22" y="0" width="26" height="32" fill="#ff3b3b" opacity="0.7"/><rect x="30" y="0" width="10" height="32" fill="#ffffff"/>',
  'bomb-nuke': BOMB('#4dff7c') + '<circle cx="35" cy="19" r="5" fill="#05070f"/><path d="M35 19 L29 10 L41 10 Z M35 19 L27 25 L33 29 Z M35 19 L43 25 L37 29 Z" fill="#05070f"/>',
};


// A small icon for the corner of the screen. Only the top part of
// each picture (the shots), not the ship.
export function icon(key) {
  return `<svg viewBox="0 -2 70 38" class="hud-icon" aria-hidden="true">${PICS[key] || ''}</svg>`;
}
