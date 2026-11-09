/* ===========================================================
   ENEMY SHOTS

   Hendrix: these are the shots that get fired AT you. Each kind
   moves in its own way. Learn them!

     pink    a pink energy dart. Slow. Shoot it down (1 hit).
     green   a green ion shot from the base guns. Shoot it (2 hits).
     red     a laser. Fast. You CAN'T shoot it. Dodge!
     bullet  little red tracers in quick bursts. Can't be shot.
     rocket  starts slow, then speeds up. Leaves smoke.
             Shoot it before it gets fast (2 hits).
     plasma  a big ball of violet plasma with rings of energy round
             it. Very slow, very tough (6 hits).
     bolt    a crackling lightning bolt. Fast. You CAN'T shoot it.
     mine    a spiky floating mine. If you get close it blinks,
             then BOOM. Shoot it from far away (2 hits), or keep
             your distance.

   The bosses' LAST STAND shots:
     flak    a shell that slows down and BURSTS into shards.
             Shoot it before it pops (2 hits).
     shard   a bit of a flak shell. Small and quick.
     ice     an icicle. It shatters into frost (3 hits).
     frost   a little bit of ice.
     slag    a glob of melted rock. It falls, then splashes
             into embers (3 hits).
     ember   a falling spark of fire.

     canShoot   true if your shots can knock it out
     hits       how many of your shots it takes
     points     what you score for knocking it out
     size       how big it is drawn [wide, tall]
     hitSize    how close it has to get to hit you
     move       'straight', 'speedup' (rockets), 'mine',
                'burst' (slows down, then bursts), 'lob' (falls,
                then bursts) or 'fall' (drops faster and faster)
     fuse       for burst and lob: seconds before it bursts
     into       what it bursts into, and how many (count)
   =========================================================== */

export const FOE_SHOTS = {
  pink:   { canShoot: true,  hits: 1, points: 10, size: [12, 30], hitSize: 6,  move: 'straight' },
  green:  { canShoot: true,  hits: 2, points: 20, size: [16, 30], hitSize: 7,  move: 'straight' },
  red:    { canShoot: false, hits: 0, points: 0,  size: [8, 30],  hitSize: 5,  move: 'straight' },
  bullet: { canShoot: false, hits: 0, points: 0,  size: [6, 16],  hitSize: 4,  move: 'straight' },
  rocket: { canShoot: true,  hits: 2, points: 30, size: [12, 30], hitSize: 6,  move: 'speedup' },
  plasma: { canShoot: true,  hits: 6, points: 60, size: [34, 34], hitSize: 12, move: 'straight' },
  mine:   { canShoot: true,  hits: 2, points: 40, size: [28, 28], hitSize: 9,  move: 'mine' },
  bolt:   { canShoot: false, hits: 0, points: 0,  size: [14, 34], hitSize: 5,  move: 'straight' },

  flak:   { canShoot: true,  hits: 2, points: 30, size: [22, 22], hitSize: 8,  move: 'burst', fuse: 1.0, into: 'shard', count: 8 },
  shard:  { canShoot: false, hits: 0, points: 0,  size: [8, 16],  hitSize: 4,  move: 'straight' },
  ice:    { canShoot: true,  hits: 3, points: 40, size: [16, 36], hitSize: 7,  move: 'burst', fuse: 1.2, into: 'frost', count: 5 },
  frost:  { canShoot: false, hits: 0, points: 0,  size: [10, 18], hitSize: 4,  move: 'straight' },
  slag:   { canShoot: true,  hits: 3, points: 40, size: [28, 28], hitSize: 10, move: 'lob', fuse: 1.3, into: 'ember', count: 6 },
  ember:  { canShoot: false, hits: 0, points: 0,  size: [12, 12], hitSize: 4,  move: 'fall' },
};

// A rocket speeds up from this much of its speed to this much.
export const ROCKET_START = 0.35;
export const ROCKET_TOP = 1.7;

// A mine wakes up when you come this close, blinks for this long,
// then blows up. Anything this close to the bang gets hit.
export const MINE_WAKE = 85;
export const MINE_FUSE = 0.7;
export const MINE_BLAST = 62;
