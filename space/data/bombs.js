/* ===========================================================
   BOMBS: press Space (or click) when it gets busy

   Hendrix: you carry ONE kind of bomb. Every bomb you hold is
   that kind. A card can swap you to a new kind, or make yours
   stronger (up to level 3). Every bomb wipes out the enemy
   shots on the screen, so it always gets you out of trouble.

     High Explosive  a big bang right in front of you
     Cluster         splits into little bombs that find enemies
     Plasma          a wall of fire that rolls up the screen
     Laser           a giant laser straight up, for two seconds
     Nuke            hits everything on the whole screen

   damage  how hard it hits
   size    how big the bang is

   Bombs can't finish a boss on their own. A boss only takes a
   little bit (BOSS_SHARE) from each bomb.
   =========================================================== */

export const START_BOMB = 'he';

// The most of one boss part a single bomb can take away. 0.1 is a tenth.
export const BOSS_SHARE = 0.1;

export const BOMBS = {
  he: {
    name: 'High Explosive', short: 'HE', colour: 'orange',
    levels: [
      { say: 'Big bang', damage: 6, size: 170 },
      { say: 'Bigger bang', damage: 9, size: 210 },
      { say: 'Huge bang', damage: 13, size: 260 },
    ],
  },
  cluster: {
    name: 'Cluster', short: 'CL', colour: 'yellow',
    levels: [
      { say: '5 little bombs', bomblets: 5, damage: 6, size: 80 },
      { say: '7 little bombs', bomblets: 7, damage: 7, size: 90 },
      { say: '10 little bombs', bomblets: 10, damage: 8, size: 100 },
    ],
  },
  plasma: {
    name: 'Plasma', short: 'PL', colour: 'cyan',
    levels: [
      { say: 'Plasma wave', damage: 5 },
      { say: 'Hot plasma', damage: 8 },
      { say: 'Mega plasma', damage: 11 },
    ],
  },
  laser: {
    name: 'Laser bomb', short: 'LB', colour: 'red',
    levels: [
      { say: 'Giant laser', damage: 12, size: 80 },
      { say: 'Wider laser', damage: 16, size: 110 },
      { say: 'Mega laser', damage: 22, size: 140 },
    ],
  },
  nuke: {
    name: 'Nuke', short: 'NK', colour: 'green',
    levels: [
      { say: 'Nuke', damage: 8 },
      { say: 'Big nuke', damage: 12 },
      { say: 'Mega nuke', damage: 16 },
    ],
  },
};
