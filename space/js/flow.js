/* ===========================================================
   FLOW: from the title, through the levels, to the end

   Play            start a new game at level 1
   Level clear     the level's big boss is down: play the film,
                   then start the next level with your ship as it is
   Try again       out of ships: start this level again, with the
                   ship you had when the level began
   =========================================================== */

import { state, newGame, startLevel, retryLevel, level } from './state.js';
import { LEVELS } from '../data/levels.js';
import { clearLayers } from './art.js';
import { makeShip } from './ship.js';
import { resetHud } from './hud.js';
import { clearFx } from './fx.js';
import { show, showTitleBest } from './screens.js';
import { applyWorld } from './world.js';
import { playCut } from './cutscene.js';
import { wakeAudio } from './audio.js';

function beginLevel() {
  clearFx();
  resetHud();
  makeShip();
  applyWorld(level().world);
  show(null);
  document.getElementById('field').focus();
}

export function playGame(startAt = 0) {
  wakeAudio();
  clearLayers();
  newGame(Math.max(0, Math.min(LEVELS.length - 1, startAt)));
  beginLevel();
}

export function retry() {
  wakeAudio();
  clearLayers();
  retryLevel();
  beginLevel();
}

export function levelClear() {
  const next = LEVELS[state.levelIndex + 1];
  state.mode = 'cut';
  clearLayers();
  show('cut');
  const lines = [`LEVEL ${state.levelIndex + 1} CLEAR!`, ...next.intro.lines];
  playCut(next.intro, lines, () => {
    state.levelIndex++;
    startLevel();
    beginLevel();
  });
}

export function toMenu() {
  clearLayers();
  clearFx();
  state.mode = 'title';
  applyWorld('space');
  showTitleBest();
  show('title');
}
