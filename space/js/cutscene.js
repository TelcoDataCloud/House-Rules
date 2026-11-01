/* ===========================================================
   CUT SCENE: the little film between levels

   Two films, both made of boxes and CSS animations (look in
   css/game.css under CUT SCENES):
     'atmosphere'  fly at the planet, it gets huge, the ship glows
                   hot as it hits the air, then clouds rush past
     'dive'        dive down through the clouds until the red
                   ground comes up underneath
     'factory'     fly low over the planet towards a city of robots
     'crater'      dive into the mouth of the volcano
     'finale'      the ending: the volcano blows up and you escape
                   up through the sky into space

   The words come from the level's intro in data/level2.js and
   data/level3.js, one after another, and are read out loud.
   Press Enter, Space or Skip to jump straight to the level.
   =========================================================== */

import { say } from './voice.js';
import { sound } from './audio.js';

const LENGTH = 9;            // seconds
const $ = (id) => document.getElementById(id);

let timers = [];
let finish = null;

function clearTimers() {
  timers.forEach((t) => clearTimeout(t));
  timers = [];
}

function done() {
  if (!finish) return;
  const next = finish;
  finish = null;
  clearTimers();
  window.removeEventListener('keydown', onKey, true);
  $('screen-cut').hidden = true;
  $('cut-stage').className = 'cut-stage';
  next();
}

function onKey(e) {
  if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    done();
  }
}

export function playCut(intro, lines, onDone) {
  finish = onDone;
  const stage = $('cut-stage');
  const words = $('cut-words');
  stage.className = 'cut-stage';
  void stage.offsetWidth;                      // restart the animations
  stage.classList.add(`cut-${intro.scene}`, 'play');
  $('screen-cut').hidden = false;
  $('cut-skip').focus();

  // Each line gets an equal share of the film.
  const length = intro.length || LENGTH;
  stage.style.setProperty('--film', `${length}s`);
  const gap = (length - 0.5) / lines.length;
  lines.forEach((line, i) => {
    timers.push(setTimeout(() => {
      words.textContent = line;
      words.className = 'cut-words';
      void words.offsetWidth;
      words.classList.add('show');
      say(line);
      if (i === 1) sound.whoosh();
      if (intro.scene === 'finale' && (i === 1 || i === 2)) sound.bomb();
      if (intro.scene === 'finale' && i === 4) sound.win();
    }, (0.3 + i * gap) * 1000));
  });
  timers.push(setTimeout(done, length * 1000));
  window.addEventListener('keydown', onKey, true);
}

export function setupCut() {
  $('cut-skip').addEventListener('click', done);
}
