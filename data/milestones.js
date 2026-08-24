/* ===========================================================
   MILESTONES - the build progress strip on the title screen

   Hendrix: this is the list of ten steps it takes to finish the
   game. Every time we finish one, we change its done from
   false to true and a dot lights up green on the title screen.

   Do not switch one to true before we have actually built it.
   The strip is only useful if it tells the truth.
   =========================================================== */

export const MILESTONES = [
  { code: 'M0',  name: 'Hello, House',  done: true  },
  { code: 'M1',  name: 'The House',     done: false },
  { code: 'M2',  name: 'The Hero',      done: false },
  { code: 'M3',  name: 'Collectables',  done: false },
  { code: 'M4',  name: 'The Workshop',  done: false },
  { code: 'M5',  name: 'Rigging',       done: false },
  { code: 'M6',  name: 'The Burglars',  done: false },
  { code: 'M7',  name: 'Traps Fire',    done: false },
  { code: 'M8',  name: 'Slapstick',     done: false },
  { code: 'M9',  name: 'Consequences',  done: false },
  { code: 'M10', name: 'Polish',        done: false }
];
