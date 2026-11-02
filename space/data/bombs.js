/* ===========================================================
   BOMBS: press Space (or click) when it gets busy

   Hendrix: you carry ONE kind of bomb. Every bomb you hold is
   that kind. A card can swap you to a new kind, or make yours
   stronger (up to level 3). Every bomb wipes out the enemy
   shots on the screen, so it always gets you out of trouble.

   The rule: the BIGGER the area a bomb covers, the LESS it hurts
   each enemy. So each bomb is best at something different.

     High Explosive  one big bang in front of you. Hardest in the
                     middle, half as hard at the edge.
     Cluster         little bombs that each find an enemy.
                     Best against groups.
     Red Lightning   jumps from enemy to enemy. A bit weaker after
                     every jump. Best when enemies are spread out.
     Laser           a giant laser straight up for 2 seconds.
                     The strongest, but only in one line.
     Nuke            the whole screen, but the least on each enemy,
                     and they keep burning for a bit. Rare!

   damage   how hard it hits (per second for the Laser)
   size     how wide the bang or the laser is
   jumps    (Lightning) how many enemies it can reach
   burn     (Nuke) extra hurt every second, for 3 seconds
   rare     how often its card turns up. 1 is normal, 0.3 is rare.

   Bombs can't finish a boss on their own. A boss only takes a
   little bit (BOSS_SHARE) from each bomb.
   =========================================================== */

export const START_BOMB = 'he';

// The most of one boss part a single bomb can take away. 0.1 is a tenth.
export const BOSS_SHARE = 0.1;

export const BOMBS = {
  he: {
    name: 'High Explosive', short: 'HE', colour: 'orange', area: 'Big bang',
    levels: [
      { say: 'Big bang', damage: 10, size: 170 },
      { say: 'Bigger bang', damage: 14, size: 210 },
      { say: 'Huge bang', damage: 18, size: 260 },
    ],
  },
  cluster: {
    name: 'Cluster', short: 'CL', colour: 'yellow', area: 'Finds enemies',
    levels: [
      { say: '5 little bombs', bomblets: 5, damage: 6, size: 80 },
      { say: '7 little bombs', bomblets: 7, damage: 7, size: 90 },
      { say: '10 little bombs', bomblets: 10, damage: 8, size: 100 },
    ],
  },
  lightning: {
    name: 'Red Lightning', short: 'LT', colour: 'red', area: 'Jumps',
    levels: [
      { say: 'Jumps 6 times', jumps: 6, damage: 9 },
      { say: 'Jumps 9 times', jumps: 9, damage: 12 },
      { say: 'Jumps 12 times', jumps: 12, damage: 15 },
    ],
  },
  laser: {
    name: 'Laser bomb', short: 'LB', colour: 'red', area: 'One line',
    levels: [
      { say: 'Giant laser', damage: 12, size: 80 },
      { say: 'Wider laser', damage: 16, size: 110 },
      { say: 'Mega laser', damage: 22, size: 140 },
    ],
  },
  nuke: {
    name: 'Nuke', short: 'NK', colour: 'green', area: 'Whole screen', rare: 0.35,
    levels: [
      { say: 'Nuke', damage: 8, burn: 2 },
      { say: 'Big nuke', damage: 12, burn: 2 },
      { say: 'Mega nuke', damage: 16, burn: 3 },
    ],
  },
};

// How much weaker the lightning gets on each jump. 0.85 keeps 85%.
export const LIGHTNING_FADE = 0.85;
