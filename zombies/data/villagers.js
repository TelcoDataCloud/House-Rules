/* ===========================================================
   VILLAGERS: the jobs

   Hendrix: a cured zombie walks into the village and gets a
   job. Each job makes something every morning. The village
   starts with the ones in START.

   makes      what the job makes each morning ('carrots', 'planks',
              'potion' or nothing)
   amount     how many
   needs      a thing the job needs to work (from data/traps.js)
   =========================================================== */

export const JOBS = {
  farmer:  { name: 'Farmer',  art: 'farmer',  makes: 'carrots', amount: 2 },
  builder: { name: 'Builder', art: 'builder', makes: 'planks',  amount: 3 },
  brewer:  { name: 'Brewer',  art: 'brewer',  makes: 'potion',  amount: 1, needs: 'brewery' },
  lookout: { name: 'Lookout', art: 'lookout', makes: null },
  crew:    { name: 'Crew',    art: 'builder', makes: null },
  giant:   { name: 'Giant',   art: 'giantfriend', makes: 'planks', amount: 6 },
};

// Who lives here on night 1
export const START = ['farmer', 'farmer', 'builder', 'brewer'];

// What you start the game holding
export const POCKETS = { planks: 10, carrots: 6, potion: 2 };

// How many villagers you need to win the first level
export const WIN_AT = 12;

// Zombies can never carry off the last few. The village always goes on.
export const KEEP_AT_LEAST = 2;
