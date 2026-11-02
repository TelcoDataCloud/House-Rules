/* ===========================================================
   LOOP: the heartbeat of the game

   About 60 times a second the game does the same list:
     1. read what you pressed
     2. read the next lines of the level (data/waves.js)
     3. move everything
     4. check what touched what
     5. draw everything where it now is
   =========================================================== */

import { state, level, hardness } from './state.js';
import { takeActions } from './input.js';
import { updateShip, drawShip, hitShip, useBomb, canPick, rollChoices } from './ship.js';
import { spawnWave, updateEnemies, drawEnemies } from './enemies.js';
import { spawnBase, updateBases, drawBases } from './bases.js';
import { spawnBoss, updateBosses, drawBosses } from './bosses.js';
import { updateBullets, drawShots, drawFoes, sweep } from './bullets.js';
import { updatePickups, drawPickups } from './pickups.js';
import { clear } from './canvas.js';
import { touching, targets } from './collide.js';
import { drawHud } from './hud.js';
import { openPick, pickByNumber, showOver, showWin, show } from './screens.js';
import { SHIP, STAR } from '../data/ship.js';
import { drop } from './pickups.js';
import { MINE_BLAST } from '../data/foeshots.js';
import { sound } from './audio.js';
import * as fx from './fx.js';
import { drawWorld } from './world.js';
import { levelClear, gameWon } from './flow.js';


function readLevel() {
  const waves = level().waves;
  while (state.waveIndex < waves.length && waves[state.waveIndex].at <= state.time) {
    const line = waves[state.waveIndex++];
    if (line.say) { fx.banner(line.say); if (line.say === 'WARNING') sound.warn(); }
    if (line.what) spawnWave(line);
    if (line.base) spawnBase(line.base);
    if (line.boss) spawnBoss(line.boss);
  }
}

function runLater() {
  for (let i = state.later.length - 1; i >= 0; i--) {
    const job = state.later[i];
    if (job.at <= state.time) { state.later.splice(i, 1); job.fn(); }
  }
}

// A mine goes BOOM. Anything close gets hit, you included.
function blowMine(b) {
  b.dead = true;
  b.blow = false;
  fx.boom(b.x, b.y, MINE_BLAST * 2, 12, '#ff3b3b');
  fx.mineRing(b.x, b.y, MINE_BLAST);
  sound.boom();
  const s = state.ship;
  if (s.dead <= 0 && Math.hypot(s.x - b.x, s.y - b.y) < MINE_BLAST + SHIP.hitSize) hitShip();
}

function collisions() {
  for (const b of state.foes) if (b.blow) blowMine(b);
  const list = targets();
  for (const shot of [...state.shots, ...state.missiles]) {
    if (shot.dead) continue;
    for (const t of list) {
      if (t.hp > 0 && touching(shot, t) && !(shot.hitSet && shot.hitSet.has(t))) {
        fx.spark(shot.x, shot.y);
        t.onHit(shot.damage);
        // Strong lasers keep going into the next enemy.
        if (shot.through > 0) {
          shot.through--;
          shot.hitSet = shot.hitSet || new Set();
          shot.hitSet.add(t);
        } else {
          shot.dead = true;
        }
        break;
      }
    }
    // Shoot an orb out of the air. (Lasers have hp 0, so they never count.)
    if (shot.dead) continue;
    for (const b of state.foes) {
      if (b.hp > 0 && !b.dead && b.y > 0 && touching(shot, b, 4)) {
        b.hp -= shot.damage;
        fx.spark(b.x, b.y);
        if (b.hp <= 0) {
          b.dead = true;
          if (b.move === 'mine' || b.colour === 'rocket' || b.colour === 'plasma') fx.boom(b.x, b.y, 40, 6, '#ffd23f');
          else fx.pop(b.x, b.y, b.colour);
          fx.award(b.points, b.x, b.y - 10);
          sound.ping();
        }
        if (shot.through > 0) shot.through--; else shot.dead = true;
        break;
      }
    }
  }

  const s = state.ship;
  if (s.dead > 0) return;
  const me = { x: s.x, y: s.y, r: SHIP.hitSize };
  for (const b of state.foes) {
    if (b.blow) continue;
    if (touching(b, me)) { b.dead = true; if (b.move === 'mine') blowMine(b); hitShip(); }
  }
  for (const e of state.enemies) {
    // Things on the ground can't crash into you: you fly over them.
    if (!e.dead && !e.spec.ground && e.wait <= 0 && touching(e, me, -e.r * 0.4)) { hitShip(); e.onHit(3); }
  }
}

// STAR POWER: when lots of enemy shots are close to the ship, a gold
// star capsule drops just in front of it (see data/ship.js).
function starRescue(dt) {
  state.starWait = (state.starWait ?? 8) - dt;
  const s = state.ship;
  if (state.starWait > 0 || s.dead > 0 || s.star > 0) return;
  let near = 0;
  for (const b of state.foes) if (Math.hypot(b.x - s.x, b.y - s.y) < 170 && b.y < s.y + 30) near++;
  for (const b of state.bosses) if (b.shot) near += 3;     // a boss cannon counts as busy
  if (near < STAR.danger) return;
  state.starWait = hardness().starWait;
  drop('STAR', Math.max(40, Math.min(440, s.x + (Math.random() - 0.5) * 80)), Math.max(60, s.y - 150));
}

// Lots of danger close by and bombs left over? Tell him about the bomb.
function bombHint(dt) {
  state.hintWait -= dt;
  const s = state.ship;
  if (state.hintWait > 0 || s.bombs <= 0 || s.dead > 0) return;
  let near = 0;
  for (const b of state.foes) if (Math.abs(b.x - s.x) < 200 && b.y > s.y - 300 && b.y < s.y + 40) near++;
  for (const e of state.enemies) if (!e.dead && e.wait <= 0 && Math.abs(e.x - s.x) < 200 && e.y > s.y - 300) near++;
  if (near >= 6) {
    state.hintWait = 25;
    const key = state.touch ? 'TAP B' : state.controls === 'mouse' ? 'CLICK' : 'SPACE';
    fx.banner(`${key} = BOMB!`);
    document.getElementById('hud-bombs').classList.add('nudge');
    setTimeout(() => document.getElementById('hud-bombs').classList.remove('nudge'), 2500);
  }
}

function actions() {
  for (const a of takeActions()) {
    if (state.mode === 'play') {
      if (a === 'bomb') useBomb();
      if (a === 'upgrade') {
        if (canPick()) { state.mode = 'pick'; sound.power(); openPick(rollChoices(), () => { state.mode = 'play'; $field().focus(); }); }
        else sound.nope();
      }
      if (a === 'pause') { state.mode = 'paused'; show('pause'); }
    } else if (state.mode === 'pick') {
      if (a.startsWith('pick')) pickByNumber(Number(a.slice(4)));
    } else if (state.mode === 'paused') {
      if (a === 'pause') { state.mode = 'play'; show(null); }
    }
  }
}

function $field() { return document.getElementById('field'); }

function step(dt) {
  state.time += dt;
  runLater();
  readLevel();
  updateShip(dt);
  updateBases(dt);
  updateEnemies(dt);
  updateBosses(dt);
  updateBullets(dt);
  collisions();
  bombHint(dt);
  starRescue(dt);
  updatePickups(dt);
  fx.updateFx(dt);
  sweep(state.shots);
  sweep(state.missiles);
  sweep(state.foes);

  if (state.ending) {
    state.endTimer -= dt;
    if (state.endTimer <= 0) {
      const end = state.ending;
      state.ending = null;
      state.mode = end;
      if (end === 'over') showOver();
      else if (end === 'clear') levelClear();
      else gameWon();
    }
  }
}

// Draw everything on the canvas, bottom to top.
function draw() {
  clear();
  drawBases();            // the bases on the ground
  drawEnemies(true);      // tanks and walkers on the ground
  fx.drawFx(0);           // smoke on the ground
  drawPickups();          // capsules
  drawEnemies(false);     // ships in the air
  drawBosses();           // bosses (and their big laser)
  drawShots();            // your shots and missiles
  drawShip();             // you, your drones, your beam
  drawFoes();             // enemy shots, on top so you can always see them
  fx.drawFx(1);           // bangs, sparks, scores
  drawHud();
}

let lastTime = 0;
export function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
  lastTime = now;
  drawWorld(dt, state.mode === 'play');

  actions();
  if (state.mode === 'play') {
    // Slow motion for a moment when a boss goes down.
    let scale = 1;
    if (state.slow > 0) { state.slow -= dt; scale = 0.3; }
    // In test mode the game can run several steps a frame, to play fast.
    const steps = state.fast || 1;
    for (let i = 0; i < steps; i++) step(dt * scale);
  } else if (state.mode === 'pick') {
    step(dt * 0.08);            // time almost stops while you choose
  }
  if (state.mode !== 'title' && state.mode !== 'cut') draw();
  requestAnimationFrame(frame);
}

