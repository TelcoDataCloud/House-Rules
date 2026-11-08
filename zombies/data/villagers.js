/* ===========================================================
   VILLAGERS: the jobs

   Hendrix: a cured zombie walks into the village and gets a
   job. Each job makes something every morning. The village
   starts with the ones in START.

   makes      what the job makes each morning ('carrots', 'planks',
              'potion' or nothing)
   amount     how many
   needs      a thing the job needs to work (from data/traps.js)
   cheap      potion from half the carrots (the cow's milk)
   free       potion from no carrots at all (the pig's truffle)
   (what each job makes per trip, and where, is in js/work.js)
   =========================================================== */

export const JOBS = {
  farmer:  { name: 'Farmer',  art: 'farmer',  makes: 'carrots', amount: 2, does: 'They will grow carrots.' },
  builder: { name: 'Builder', art: 'builder', makes: 'planks',  amount: 3, does: 'They will chop wood.' },
  brewer:  { name: 'Brewer',  art: 'brewer',  makes: 'potion',  amount: 1, needs: 'brewery', does: 'They will cook potion.' },
  miner:   { name: 'Miner',   art: 'miner',   makes: 'stone',   amount: 2, needs: 'mine', does: 'They will dig stone.' },
  lookout: { name: 'Lookout', art: 'lookout', makes: null },
  crew:    { name: 'Crew',    art: 'builder', makes: null },
  nightshift: { name: 'Night shift', art: 'vampire', makes: 'planks', amount: 2 },
  // cured animals live in the village too
  cow:     { name: 'Cow',     art: 'cowfriend',     makes: 'potion',  amount: 1, cheap: true },
  chicken: { name: 'Chicken', art: 'chickenfriend', makes: 'carrots', amount: 1 },
  sheep:   { name: 'Sheep',   art: 'sheepfriend',   makes: 'planks',  amount: 1 },
  pig:     { name: 'Pig',     art: 'pigfriend',     makes: 'potion',  amount: 1, free: true },
  pumpkinfarmer: { name: 'Pumpkin farmer', art: 'pumpkinfarmer', makes: 'carrots', amount: 4 },
  giant:   { name: 'Giant',   art: 'giantfriend', makes: 'planks', amount: 6 },
};

// Who lives here on night 1
export const START = ['farmer', 'farmer', 'builder', 'brewer'];

// What you start the game holding
// Enough planks to fence and pit a first night before anyone has worked
export const POCKETS = { planks: 24, carrots: 6, potion: 2, stone: 0 };

// How many villagers you need to win the first level
export const WIN_AT = 12;

// Villagers get a name from this list, in order, then round again.
export const NAMES = ['Pip', 'Mo', 'Dot', 'Bex', 'Fin', 'Lou', 'Kit', 'Jem', 'Taz', 'Wren', 'Ned', 'Sol'];

// Zombies can never carry off the last few. The village always goes on.
export const KEEP_AT_LEAST = 2;
