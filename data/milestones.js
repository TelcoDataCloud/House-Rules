/* ===========================================================
   MILESTONES - the build progress strip on the title screen

   Hendrix: this is the list of steps it took to build the
   game. Every time we finish one, we change its done from
   false to true and a dot lights up green on the title screen.

   Do not switch one to true before we have actually built it.
   The strip is only useful if it tells the truth.
   =========================================================== */

export const MILESTONES = [
  { code: 'M0',  name: 'Hello, House',  done: true  },
  { code: 'M1',  name: 'The House',     done: true  },
  { code: 'M2',  name: 'The Hero',      done: true  },
  { code: 'M3',  name: 'Collectables',  done: true  },
  { code: 'M4',  name: 'The Workshop',  done: true  },
  { code: 'M5',  name: 'Rigging',       done: true  },
  { code: 'M6',  name: 'The Burglars',  done: true  },
  { code: 'M7',  name: 'Traps Fire',    done: true  },
  { code: 'M8',  name: 'Slapstick',     done: true  },
  { code: 'M9',  name: 'Consequences',  done: true  },
  { code: 'M10', name: 'Polish',        done: true  },
  /* The game was finished at M10. Then we kept going. */
  { code: 'M11', name: 'Locks and Hints', done: true },
  { code: 'M12', name: 'Lights Out',    done: true }
];
