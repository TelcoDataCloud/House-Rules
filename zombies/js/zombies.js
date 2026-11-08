/* ===========================================================
   ZOMBIES: they come in from the woods and shamble at you

   Every zombie wants something (a bed, the carrots, anyone).
   Each frame it takes a small step toward it. Walls stop it,
   fences hold it for a while, torches push it away, and when
   it steps onto a trap, js/traps.js takes over. Curing a zombie
   turns it into a villager who walks home.
   =========================================================== */

import { state, TILE, COLS, ROWS, CENTRE } from './state.js';
import { ZOMBIES } from '../data/zombies.js';
import { DIFFICULTY } from '../data/difficulty.js';
import { NIGHTS, GIANT_FROM, MOON, KING_EVERY } from '../data/nights.js';
import { LINES } from '../data/lines.js';
import { el, blocked, thingAt, EDGE, isPond, eastBank, BRIDGES } from './grid.js';
// The stream splits the map. Anyone on the wrong bank walks to the
// bridge that is least out of their way, then across it.
export function viaBridge(from, goal) {
  const goalEast = eastBank(goal.x, goal.y);
  // on a bridge (or just at either end): walk off the side the goal is on
  for (const b of BRIDGES) {
    const onIt = Math.abs(from.y - b.y) < 1.1 && from.x > b.west - 0.4 && from.x < b.east + 0.4;
    if (!onIt) continue;
    const end = goalEast ? b.east : b.west;
    if (Math.abs(from.x - end) < 0.4) return goal;
    return { ...goal, x: end, y: b.y };
  }
  if (eastBank(from.x, from.y) === goalEast) return goal;
  let best = BRIDGES[0], bd = 1e9;
  BRIDGES.forEach((b) => { const d = Math.abs(from.y - b.y) + Math.abs(goal.y - b.y); if (d < bd) { bd = d; best = b; } });
  return { ...goal, x: goalEast ? best.west : best.east, y: best.y };
}
import { stepOn } from './traps.js';
import { burst, snotScreen, cloud } from './fx.js';
import { blip, say } from './voice.js';
import { addVillager, removeVillager, draw as drawVillager } from './villagers.js';
import { JOBS } from '../data/villagers.js';
import { TRICKS, flickBogey, puddleAt, updateDropped, updateFlattened } from './gross.js';
import { updateHard } from './hard.js';

let nextId = 1;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// What is coming tonight, so the lookout can say it
export function tonight() {
  const diff = DIFFICULTY[state.mode];
  const plan = NIGHTS[Math.min(state.night - 1, NIGHTS.length - 1)];
  const count = diff.hordeStart + diff.hordeGrow * (state.night - 1);
  // Easy meets one new zombie a night: everyone met so far can come
  const pool = [...diff.mix];
  if (diff.meet) Object.entries(diff.meet).forEach(([n, k]) => { if (Number(n) <= state.night) pool.push(k); });
  const kinds = [];
  for (let i = 0; i < count; i++) kinds.push(pick(pool));
  plan.extra.forEach((k) => kinds.push(k));
  // anyone carried off last night comes back tonight, as a zombie
  state.taken.forEach((t) => kinds.push(t.kind || 'bob'));
  const moon = moonTonight();
  if (moon) moon.extra.forEach((k) => kinds.push(k));
  if (moon && moon.maybe && Math.random() < (moon.chance || 0.5)) moon.maybe.forEach((k) => kinds.push(k));
  // for testing: ?horde=bogey,eyeball picks tonight's zombies by hand
  if (window.ZOMBIES.horde) return { kinds: window.ZOMBIES.horde, side: plan.side, moon };
  if (state.night >= GIANT_FROM[state.mode] && (state.night - GIANT_FROM[state.mode]) % 2 === 0) kinds.push('giant');
  if (state.night % KING_EVERY === 0) kinds.push('pumpkinking');
  return { kinds, side: plan.side, moon };
}

export function moonTonight() {
  if (!DIFFICULTY[state.mode].moon) return null;
  if (state.moonDay === 4) return MOON.full;
  if (state.moonDay === 0) return MOON.new;
  return null;
}

export function spawnHorde(plan) {
  state.zombies = [];
  document.querySelectorAll('#mobs .zombie').forEach((e) => e.remove());
  plan.kinds.forEach((kind, i) => {
    const z = makeZombie(kind, plan.side, i);
    state.zombies.push(z);
  });
}

function edgeSpot(side) {
  const s = side === 'all' ? pick(['north', 'south', 'east', 'west']) : side;
  const r = Math.random();
  if (s === 'north') return { x: 2 + r * (COLS - 4), y: 0.5 };
  if (s === 'south') return { x: 2 + r * (COLS - 4), y: ROWS - 0.5 };
  if (s === 'west') return { x: 0.5, y: 2 + r * (ROWS - 4) };
  return { x: COLS - 0.5, y: 2 + r * (ROWS - 4) };
}

export function makeZombie(kind, side, i, at) {
  const data = ZOMBIES[kind] || ZOMBIES.bob;
  const spot = at || edgeSpot(side);
  const moon = moonTonight();
  const z = {
    id: nextId++, kind, data, x: spot.x, y: spot.y, lastX: spot.x, lastY: spot.y,
    speed: data.speed * (moon ? moon.speed : 1) * (0.85 + Math.random() * 0.3),
    cure: data.cure, hp: data.cure,
    dizzy: 0, stuck: 0, blind: 0, spinT: 0, flying: 0, eatT: 0, throwT: 3 + Math.random() * 5,
    grabT: 0, scaredT: 0, holdT: 0, wait: i * 0.8,
    circle: null, pit: null, leaving: false, carrying: null, climbed: null, slowOn: 0,
    jumps: !!data.jumps, digs: !!data.digs, big: !!data.big,
    el: null,
  };
  z.el = el('g', { class: 'mob zombie walking zombie-' + kind });
  const body = el('g', { class: 'body' });
  const s = data.size || 1;
  const w = z.big ? 80 : 48 * s, h = z.big ? 100 : 52 * s;
  body.appendChild(el('use', { href: '#art-' + data.art, width: w, height: h, x: z.big ? -20 : -4 - (w - 48) / 2, y: z.big ? -56 : -8 - (h - 52) }));
  z.el.appendChild(body);
  const stars = el('g', { class: 'stars' });
  const t = el('text', { x: 20, y: 2, 'font-size': 10, 'text-anchor': 'middle', fill: 'var(--button)' });
  t.textContent = '★ ★ ★';
  stars.appendChild(t);
  z.el.appendChild(stars);
  const bubble = el('text', { class: 'bubble', x: 20, y: -6, 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 800, fill: 'var(--ink)' });
  z.el.appendChild(bubble);
  z.bubble = bubble;
  z.bubbleT = 2 + Math.random() * 6;
  document.getElementById('mobs').appendChild(z.el);
  drawZ(z);
  return z;
}

export function drawZ(z) {
  z.el.setAttribute('transform', `translate(${z.x * TILE - 20} ${z.y * TILE - 36})`);
  z.el.classList.toggle('dizzy', z.dizzy > 0);
  z.el.classList.toggle('stuck', z.stuck > 0 || !!z.pit);
  z.el.classList.toggle('walking', z.dizzy <= 0 && z.stuck <= 0 && !z.pit);
}

// Where does this zombie want to go right now?
function target(z) {
  const hero = state.hero;
  // scarecrow nearby? crowd round it
  if (!z.crowdDone) {
    for (const t of state.things.values()) {
      if (t.does === 'bait' && Math.hypot(t.col + 0.5 - z.x, t.row + 0.5 - z.y) <= (t.data.reach || 4)) {
        return { x: t.col + 0.5, y: t.row + 1.2, bait: t };
      }
    }
  }
  const wants = z.data.wants || 'bed';
  if (wants === 'anyone' && hero.down <= 0 && Math.hypot(hero.x - z.x, hero.y - z.y) < 6) return { x: hero.x, y: hero.y };
  if (wants === 'farm' || (wants === 'anyone' && Math.random() < 0.5)) {
    const f = nearestThing(z, 'farm');
    if (f) return { x: f.col + 0.5, y: f.row + 0.5 };
  }
  let best = null, bd = 1e9;
  state.villagers.forEach((v) => {
    if (v.taken || v.pumpkin > 0) return;
    // Hard: anyone sleeping by the well with no bed is the easy pick
    const d = Math.hypot(v.x - z.x, v.y - z.y) - (DIFFICULTY[state.mode].bedlessHalfTrips && !v.bed ? 6 : 0);
    if (d < bd) { bd = d; best = v; }
  });
  if (best) return { x: best.x, y: best.y };
  return { x: CENTRE.x, y: CENTRE.y };
}

function nearestThing(z, does) {
  let best = null, bd = 1e9;
  for (const t of state.things.values()) {
    if (t.does !== does) continue;
    const d = Math.hypot(t.col + 0.5 - z.x, t.row + 0.5 - z.y);
    if (d < bd) { bd = d; best = t; }
  }
  return best;
}

export function updateZombies(dt) {
  state.villagers.forEach((v) => { if (v.pumpkin > 0) { v.pumpkin -= dt; if (v.pumpkin <= 0 && v.hat) v.hat.style.display = 'none'; } });
  updateDropped(dt);
  updateFlattened(dt);
  updateHard(dt);
  const diff = DIFFICULTY[state.mode];
  const moon = moonTonight();
  const torchPower = moon ? moon.torch : 1;
  for (const z of [...state.zombies]) {
    z.lastX = z.x; z.lastY = z.y;
    if (z.wait > 0) { z.wait -= dt; continue; }
    if (z.pit) { drawZ(z); continue; }
    mutter(z, dt);

    if (z.flying > 0) {
      z.x += z.flyX * dt / 0.6; z.y += z.flyY * dt / 0.6; z.flying -= dt;
      z.x = Math.max(0.5, Math.min(COLS - 0.5, z.x)); z.y = Math.max(0.5, Math.min(ROWS - 0.5, z.y));
      drawZ(z); continue;
    }
    if (z.dizzy > 0) { z.dizzy -= dt; drawZ(z); continue; }
    if (z.stuck > 0) { z.stuck -= dt; drawZ(z); continue; }
    if (z.eatT > 0) z.eatT -= dt;
    if (z.scaredT > 0) z.scaredT -= dt;
    if (z.grabT > 0) z.grabT -= dt;

    // walking round the brains all night
    if (z.circle) {
      z.angle += dt * 1.2;
      z.x = z.circle.col + 0.5 + Math.cos(z.angle) * 1.1;
      z.y = z.circle.row + 0.5 + Math.sin(z.angle) * 0.9;
      drawZ(z); continue;
    }

    if (z.data.trick && TRICKS[z.data.trick]) TRICKS[z.data.trick](z, dt);

    let goal;
    if (z.leaving) goal = nearestEdge(z);
    else if (z.goal) goal = z.goal;
    else if (z.blind > 0) { z.blind -= dt; goal = { x: z.x + Math.cos(z.id + state.time * 2) * 3, y: z.y + Math.sin(z.id * 2 + state.time * 2) * 3 }; }
    else goal = target(z);

    if (!goal.bait) goal = viaBridge(z, goal);
    let dx = goal.x - z.x, dy = goal.y - z.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist; dy /= dist;

    // crowding the scarecrow
    if (goal.bait && dist < 0.8) {
      z.baitT = (z.baitT || 0) + dt;
      if (z.baitT > (goal.bait.data.seconds || 20)) z.crowdDone = true;
      drawZ(z); continue;
    }

    // torches push them away
    if (z.blind <= 0 && !z.leaving) {
      for (const t of state.things.values()) {
        if (t.does !== 'scare') continue;
        const tx = t.col + 0.5 - z.x, ty = t.row + 0.5 - z.y;
        const d = Math.hypot(tx, ty);
        const reach = (t.data.reach || 2) * torchPower * (z.data.quiet ? 2 : 1);
        if (d < reach && d > 0.01) { const push = (z.data.quiet ? 3 : 1.6) * (1 - d / reach); dx -= tx / d * push; dy -= ty / d * push; if (z.data.quiet && d < 1.5 && Math.random() < dt) burst(z.x, z.y - 0.6, 'hsss'); }
      }
      const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    }
    if (z.spinT > 0) { z.spinT -= dt; dx = -dx; dy = -dy; }

    // wading through the pond: slow, and the odd splash
    if (isPond(Math.floor(z.x), Math.floor(z.y))) { z.slowOn = 0.35; if (Math.random() < dt * 0.5) burst(z.x, z.y - 0.6, 'sploosh'); }
    let speed = z.speed * (z.slowOn ? z.slowOn : 1) * (z.carrying ? 0.7 : 1) * (z.hopping ? 0.45 : 1);
    z.slowOn = 0;
    const step = speed * dt;
    const nx = z.x + dx * step, ny = z.y + dy * step;

    // walls and fences
    const c = Math.floor(nx), r = Math.floor(ny);
    const there = thingAt(c, r);
    if (blocked(c, r, z) && !(c === Math.floor(z.x) && r === Math.floor(z.y))) {
      if (there && there.does === 'hold') {
        if (z.data.rider && !z.riderOff) {
          z.riderOff = true; z.jumps = true; z.dizzy = 2;
          const rider = makeZombie('bob', 'north', 0, { x: z.x - 0.6, y: z.y + 0.3 });
          rider.dizzy = 3; rider.wait = 0;
          state.zombies.push(rider);
          burst(z.x, z.y - 0.8, 'WHOA');
          blip('boing');
          drawZ(z); continue;
        }
        z.holdT += dt;
        if (z.holdT > (there.data.seconds || 8)) { z.climbed = there; z.holdT = 0; burst(z.x, z.y - 0.5, 'hup'); }
        else if (Math.random() < dt * 0.3) burst(z.x, z.y - 0.5, 'grr');
        drawZ(z); continue;
      }
      // slide along the wall
      if (!blocked(Math.floor(nx), Math.floor(z.y), z)) z.x = nx;
      else if (!blocked(Math.floor(z.x), Math.floor(ny), z)) z.y = ny;
      else { const s = Math.sign(dx || 1); if (!blocked(Math.floor(z.x), Math.floor(z.y - s * step * 2), z)) z.y -= s * step * 2; else z.x -= dx * step; }
    } else {
      z.x = nx; z.y = ny;
      if (c !== Math.floor(z.lastX) || r !== Math.floor(z.lastY) || (there && (there.does === 'slow' || there.does === 'farm' || there.does === 'bed'))) stepOn(z, there);
    }

    // the gross throws
    if (z.data.throws) {
      z.throwT -= dt;
      if (z.throwT <= 0) {
        z.throwT = 9 + Math.random() * 4;
        if (z.data.throws === 'snot' && Math.hypot(state.hero.x - z.x, state.hero.y - z.y) < 5) { snotScreen(); burst(z.x, z.y - 0.5, 'SPLORT'); blip('splat'); }
        if (z.data.throws === 'bogey' && Math.hypot(state.hero.x - z.x, state.hero.y - z.y) < 5) flickBogey(z);
        if (z.data.throws === 'pumpkin') {
          const near = state.villagers.filter((v) => !v.taken && !(v.pumpkin > 0) && Math.hypot(v.x - z.x, v.y - z.y) < 7);
          if (near.length) {
            const v = pick(near);
            v.pumpkin = 20;
            if (!v.hat) { v.hat = el('use', { href: '#art-pumpkin', width: 26, height: 26, x: 7, y: -14 }); v.el.appendChild(v.hat); }
            v.hat.style.display = '';
            burst(v.x, v.y - 1, 'HAT!');
            blip('splat');
          }
        }
        if (z.data.throws === 'gas') { cloud(z.x, z.y, 2, 4); state.gasAt = { x: z.x, y: z.y, t: 4 }; burst(z.x, z.y - 0.5, 'PARP'); blip('groan'); }
      }
    }

    // sliding in a puddle
    const pud = puddleAt(z.x, z.y);
    if (pud && z.slidT !== pud) { z.slidT = pud; z.dizzy = 2; z.flying = 0.4; z.flyX = dx * 2.5; z.flyY = dy * 2.5; burst(z.x, z.y - 0.6, 'WHOOPS'); blip('boing'); }

    // grabbing the hero
    const hd = Math.hypot(state.hero.x - z.x, state.hero.y - z.y);
    if (hd < 0.9 && z.grabT <= 0 && state.hero.down <= 0 && !(state.hero.blink > 0) && !z.data.harmless && !z.armOff) {
      z.grabT = 1.5;
      hurtHero();
    }

    // carrying someone off
    if (z.carrying) { z.carrying.x = z.x + 0.5; z.carrying.y = z.y - 0.3; drawVillager(z.carrying); }
    if (z.leaving && (z.x < 0.3 || z.y < 0.3 || z.x > COLS - 0.3 || z.y > ROWS - 0.3)) {
      if (z.carrying) { state.taken.push({ job: z.carrying.job, kind: 'bob', name: z.carrying.name }); say(LINES.taken.replace('{name}', z.carrying.name), true); removeVillager(z.carrying); }
      remove(z);
      continue;
    }
    drawZ(z);
  }
}

function nearestEdge(z) {
  const opts = [{ x: z.x, y: -1 }, { x: z.x, y: ROWS + 1 }, { x: -1, y: z.y }, { x: COLS + 1, y: z.y }];
  return opts.reduce((a, b) => Math.hypot(a.x - z.x, a.y - z.y) < Math.hypot(b.x - z.x, b.y - z.y) ? a : b);
}

function mutter(z, dt) {
  if (z.data.quiet) return;
  z.bubbleT -= dt;
  if (z.bubbleT <= 0) {
    z.bubbleT = 6 + Math.random() * 8;
    z.bubble.textContent = pick(z.data.line || ['uhhh']);
    setTimeout(() => { z.bubble.textContent = ''; }, 2500);
  }
}

export function hurtHero() {
  const h = state.hero;
  const diff = DIFFICULTY[state.mode];
  if (h.hearts <= 0) return;
  h.hearts--;
  burst(h.x, h.y - 0.6, 'OW');
  blip('bonk');
  if (h.hearts <= 0) {
    if (diff.heroDowns) { h.down = 10; say(LINES.heroDown, true); }
    else { h.hearts = 2; h.blink = 2; burst(h.x, h.y - 1, LINES.gotUp); say(LINES.gotUp, true); }
  }
  h.lastHurt = state.time;
}


// The cure. Returns true if someone was cured.
export function cure(z) {
  z.hp -= 1;
  if (z.hp > 0) { burst(z.x, z.y - 0.6, 'fizz'); z.dizzy = 2; return false; }
  const job = z.data.becomes || 'farmer';
  if (z.carrying) { z.carrying.taken = false; z.carrying = null; }
  if (z.pit) z.pit.held = z.pit.held.filter((o) => o !== z);
  remove(z);
  const v = addVillager(job, z.x, z.y);
  v.el.classList.add('cured');
  v.walkHome = true;
  state.curedTonight++;
  state.joined = state.joined || [];
  state.joined.push({ name: v.name, job });
  burst(z.x, z.y - 0.8, 'POP!');
  blip('pop');
  setTimeout(() => blip('cheer'), 180);
  const jobName = (JOBS[job] || { name: job }).name.toLowerCase();
  const line = LINES.joined.replace('{name}', v.name).replace('{job}', jobName).replace('{does}', (JOBS[job] || {}).does || '');
  say(line, true);
  import('./hud.js').then((m) => m.helpSay(line));
  return true;
}

export function remove(z) {
  z.el.remove();
  state.zombies = state.zombies.filter((o) => o !== z);
}

// Dawn: everyone left goes home, pits keep theirs
export function sendHome() {
  state.zombies.forEach((z) => {
    if (z.pit) return;
    z.leaving = true; z.circle = null; z.stuck = 0; z.dizzy = 0; z.blind = 0; z.flying = 0;
    z.bubble.textContent = 'ooh, sun';
    if (z.carrying && !DIFFICULTY[state.mode].takeVillagers) { z.carrying.taken = false; z.carrying = null; }
  });
}

export function clearZombies() {
  (state.dropped || []).forEach((d) => d.el.remove());
  state.dropped = [];
  state.zombies.forEach((z) => z.el.remove());
  state.zombies = [];
}
