/* ===========================================================
   LEVELS: the order you play them in

   Hendrix: each level lives in its own file. To make a level 4,
   copy level3.js to level4.js, change it, then add it here.
   =========================================================== */

import { LEVEL as LEVEL1 } from './level1.js';
import { LEVEL as LEVEL2 } from './level2.js';
import { LEVEL as LEVEL3 } from './level3.js';

export const LEVELS = [LEVEL1, LEVEL2, LEVEL3];
