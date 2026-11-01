/* ===========================================================
   BEST: the high score, kept in this browser

   This is the ONE thing the game remembers after you close it
   (Asa said yes, 1 Nov 2026). It lives in this browser only.
   Nothing goes to the internet. If the browser will not let us
   save, the game still works; it just forgets.
   =========================================================== */

const KEY = 'star-base-best';

export function loadBest() {
  try { return Number(localStorage.getItem(KEY)) || 0; } catch { return 0; }
}

export function saveBest(score) {
  try { localStorage.setItem(KEY, String(score)); } catch { /* can't save here, that's fine */ }
}
