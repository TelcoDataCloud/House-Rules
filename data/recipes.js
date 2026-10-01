/* ===========================================================
   RECIPES - what you can bolt together at the workbench

   Hendrix: this is the trap book. Every trap is two things
   bolted together. The order does not matter: Sack + Flour is
   the same as Flour + Sack.

   HOW A TRAP WORKS
       id      a short name the game uses. Small letters, dashes.
       name    what it is called on screen
       needs   the two things it is made from. Use the ids from
               data/items.js, like 'sack' and 'flour'.
       cat     what kind of trap it is. One or two of:
               LOUD  SLIPPERY  STICKY  MESSY  STARTLE  TANGLE
               Some burglars hate some kinds more than others.
               Play and watch who yells loudest.
       nerve   how much it scares a burglar. 1 is a bit, 5 is a lot.
       mount   where it can go in the house: FLOOR, DOORWAY,
               OVERHEAD or STAIRS (see data/rooms.js)
       line    what happens, in a few words

   WHAT IT LOOKS LIKE WHEN IT GOES OFF
       fx      the payoff. One of:
                 slip    feet go out, flat on his back
                 swing   something swings down on a rope, CLONG
                 drop    something falls on his head and stays there
                 cloud   a big puff of something all over him
                 pour    something pours on him from above
                 stick   his boots get stuck and he wobbles
                 tangle  he walks into a web of string or tape
                 noise   a huge racket, he jumps out of his skin
                 flash   flashing lights, he spins round dizzy
       mess    what he is covered in afterwards (you can leave it
               out): flour, feathers, paint, honey, glitter, water,
               custard, paper. Two at once works too:
               mess: ['custard', 'feathers']
       word    the big comic word that pops up, like CLONG!

   HINTS
       riddle  only for traps that can be upgraded. It is how you
               describe the trap at the workbench when you drop a
               hint, without saying its name.

   UPGRADES
   An upgrade is a trap you have ALREADY built, plus one more
   thing. So its needs are a trap id and an item id, like
   ['flour-bomb', 'rope']. You can only upgrade once. Upgrading
   uses up the trap, so you get one great trap instead of two
   okay ones.

   YOUR TURN (M4)
   Your Glue Bomb is not in the book yet. It is an upgrade:
   a Flour Bomb, plus your Water Balloon. Copy this into the
   UPGRADES list, at the end, before the ] :

   { id: 'glue-bomb', name: 'Glue Bomb', needs: ['flour-bomb', 'water-balloon'],
     cat: ['STICKY', 'MESSY'], nerve: 5, mount: 'OVERHEAD',
     fx: 'pour', mess: 'flour', word: 'GLOOP!',
     line: 'Flour first, then water. Now it is glue.' },

   It only works once your Water Balloon is in data/items.js
   (your M3 turn). Then find a sack, some flour and a balloon in
   one night, and build it.
   =========================================================== */

export const TRAPS = [
  { id: 'ballbearing-boulevard', name: 'Ballbearing Boulevard', needs: ['cooking-oil', 'marbles'],
    cat: ['SLIPPERY'], nerve: 3, mount: 'FLOOR',
    fx: 'slip', word: 'WHOOPS!', riddle: 'the trap made of rolly glass and slippy oil',
    line: 'Feet go out sideways, arms windmill, down he goes.' },
  { id: 'pendulum', name: 'The Pendulum', needs: ['paint-tin', 'rope'],
    cat: ['STARTLE'], nerve: 3, mount: 'OVERHEAD',
    fx: 'swing', mess: 'paint', word: 'CLONG!', riddle: 'the trap that swings a tin of paint',
    line: 'A paint tin swings out of the dark. CLONG.' },
  { id: 'rattlesnake-line', name: 'Rattlesnake Line', needs: ['string', 'tin-cans'],
    cat: ['LOUD'], nerve: 2, mount: 'DOORWAY',
    fx: 'noise', word: 'CLATTER!', riddle: 'the rattly trap on a string',
    line: 'A tripline drags a chain of cans across the floor.' },
  { id: 'chicken-blizzard', name: 'Chicken Blizzard', needs: ['hair-dryer', 'pillow'],
    cat: ['MESSY'], nerve: 2, mount: 'DOORWAY',
    fx: 'cloud', mess: 'feathers', word: 'FWUMP!',
    line: 'A feather storm. He comes out looking like a chicken.' },
  { id: 'ghost-bomb', name: 'Ghost Bomb', needs: ['hair-dryer', 'flour'],
    cat: ['MESSY'], nerve: 2, mount: 'OVERHEAD',
    fx: 'cloud', mess: 'flour', word: 'POOF!', riddle: 'the trap that blows a big white cloud',
    line: 'White out. Coughing. Two eyes blinking in a cloud.' },
  { id: 'full-poultry', name: 'Full Poultry', needs: ['honey', 'pillow'],
    cat: ['STICKY'], nerve: 3, mount: 'OVERHEAD',
    fx: 'pour', mess: 'honey', word: 'SPLOT!',
    line: 'Honey, then feathers. He knows what he looks like.' },
  { id: 'the-web', name: 'The Web', needs: ['duct-tape', 'string'],
    cat: ['TANGLE'], nerve: 2, mount: 'DOORWAY',
    fx: 'tangle', word: 'STUCK!', riddle: 'the trap like a giant spider made',
    line: 'A doorway laced with tape. Easy to walk into.' },
  { id: 'overhead-special', name: 'Overhead Special', needs: ['bucket', 'paint-tin'],
    cat: ['STARTLE'], nerve: 3, mount: 'OVERHEAD',
    fx: 'drop', mess: 'paint', word: 'CLANG!',
    line: 'The bucket drops. He wears it as a hat.' },
  { id: 'skate-express', name: 'Skate Express', needs: ['toy-car', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 2, mount: 'FLOOR',
    fx: 'slip', word: 'WHEEE!',
    line: 'He steps on the car and rides it into the wall.' },
  { id: 'marble-avalanche', name: 'Marble Avalanche', needs: ['marbles', 'bucket'],
    cat: ['SLIPPERY'], nerve: 3, mount: 'STAIRS',
    fx: 'slip', word: 'RATTLE!', riddle: 'the bucket of rolly things on the stairs',
    line: 'A whole bucket of marbles down the stairs.' },
  { id: 'doorbell', name: 'The Doorbell', needs: ['bell', 'string'],
    cat: ['LOUD'], nerve: 1, mount: 'DOORWAY',
    fx: 'noise', word: 'DING DONG!', riddle: 'the trap that rings when you walk through it',
    line: 'Cheap, simple, very loud.' },
  { id: 'sticky-situation', name: 'Sticky Situation', needs: ['honey', 'marbles'],
    cat: ['STICKY'], nerve: 2, mount: 'FLOOR',
    fx: 'stick', mess: 'honey', word: 'SQUELCH!',
    line: 'Boots glued down. He walks like a duck.' },
  { id: 'disco-inferno', name: 'Disco Inferno', needs: ['lights', 'duct-tape'],
    cat: ['STARTLE'], nerve: 3, mount: 'DOORWAY',
    fx: 'flash', word: 'DISCO!',
    line: 'Flashing lights in a dark hall. Which way is up?' },
  { id: 'flour-bomb', name: 'Flour Bomb', needs: ['sack', 'flour'],
    cat: ['MESSY'], nerve: 2, mount: 'DOORWAY',
    fx: 'cloud', mess: 'flour', word: 'POOF!', riddle: 'the trap that turns people into snowmen',
    line: 'The sack splits. Instant snowman.' },
  { id: 'honey-fountain', name: 'Honey Fountain', needs: ['blender', 'honey'],
    cat: ['STICKY'], nerve: 3, mount: 'FLOOR',
    fx: 'pour', mess: 'honey', word: 'SPLURT!',
    line: 'Lid off, full speed. Honey everywhere.' },
  { id: 'wheels-of-misfortune', name: 'Wheels of Misfortune', needs: ['roller-skate', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 3, mount: 'STAIRS',
    fx: 'slip', word: 'WHEEE!',
    line: 'The classic. Straight down the stairs.' },
  { id: 'indoor-rain', name: 'Indoor Rain', needs: ['garden-hose', 'bucket'],
    cat: ['MESSY'], nerve: 2, mount: 'OVERHEAD',
    fx: 'pour', mess: 'water', word: 'SPLOOSH!',
    line: 'Soaked head to foot. Squelch, squelch, squelch.' },
  { id: 'tin-tornado', name: 'Tin Tornado', needs: ['tin-cans', 'hair-dryer'],
    cat: ['LOUD'], nerve: 2, mount: 'FLOOR',
    fx: 'noise', word: 'CLATTER!',
    line: 'Cans clatter round the room like a washing machine.' },
  { id: 'forever-glitter', name: 'Forever Glitter', needs: ['glitter-cannon', 'duct-tape'],
    cat: ['STICKY'], nerve: 3, mount: 'DOORWAY',
    fx: 'cloud', mess: 'glitter', word: 'SPARKLE!',
    line: 'He will be finding this in his hair for years.' },
  { id: 'banana-rama', name: 'Banana Rama', needs: ['banana', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 3, mount: 'FLOOR',
    fx: 'slip', word: 'SKIDOOSH!', riddle: 'the slippy fruit trap',
    line: 'A greasy banana skin. The oldest trick there is.' },
  { id: 'rude-awakening', name: 'Rude Awakening', needs: ['whoopee', 'duct-tape'],
    cat: ['STARTLE'], nerve: 2, mount: 'FLOOR',
    fx: 'noise', word: 'PFFFRRT!', riddle: 'the trap that makes a rude noise',
    line: 'Taped to the floor. He steps on it. Everybody hears.' },
  { id: 'custard-shower', name: 'Custard Shower', needs: ['custard', 'bucket'],
    cat: ['MESSY'], nerve: 3, mount: 'OVERHEAD',
    fx: 'pour', mess: 'custard', word: 'SPLODGE!', riddle: 'the gloopy yellow bucket trap',
    line: 'A bucket of custard. Right on his head.' },
  { id: 'wake-up-call', name: 'Wake Up Call', needs: ['alarm-clock', 'tin-cans'],
    cat: ['LOUD'], nerve: 3, mount: 'DOORWAY',
    fx: 'noise', word: 'BRRRING!',
    line: 'An alarm clock in a tin. It goes off right in his ear.' },
  { id: 'chicken-swing', name: 'Chicken Swing', needs: ['rubber-chicken', 'rope'],
    cat: ['STARTLE'], nerve: 3, mount: 'OVERHEAD',
    fx: 'swing', word: 'BAWK!', riddle: 'the squeaky bird on a rope',
    line: 'A rubber chicken swings out of the dark. SQUEAK.' },
  { id: 'mummy-maker', name: 'Mummy Maker', needs: ['loo-roll', 'string'],
    cat: ['TANGLE'], nerve: 2, mount: 'DOORWAY',
    fx: 'tangle', mess: 'paper', word: 'WRAPPED!', riddle: 'the paper trap from the bathroom',
    line: 'Loo roll across the door. He comes out a mummy.' },
  { id: 'banana-boarder', name: 'Banana Boarder', needs: ['banana', 'roller-skate'],
    cat: ['SLIPPERY'], nerve: 3, mount: 'STAIRS',
    fx: 'slip', word: 'WHEEEE!', riddle: 'the fruit on wheels trap',
    line: 'One foot on a skate, one on a banana. See you at the bottom.' },
  { id: 'flying-chicken', name: 'Flying Chicken', needs: ['rubber-chicken', 'hair-dryer'],
    cat: ['STARTLE'], nerve: 3, mount: 'DOORWAY',
    fx: 'swing', word: 'BAWK BAWK!',
    line: 'The hair dryer blows a rubber chicken right at him. Squeak.' },
  { id: 'pillow-fight', name: 'Pillow Fight', needs: ['pillow', 'flour'],
    cat: ['MESSY'], nerve: 2, mount: 'OVERHEAD',
    fx: 'cloud', mess: ['flour', 'feathers'], word: 'FLUMP!',
    line: 'A pillow stuffed with flour drops on him and bursts.' },
  { id: 'maraca-mayhem', name: 'Maraca Mayhem', needs: ['tin-cans', 'marbles'],
    cat: ['LOUD'], nerve: 2, mount: 'DOORWAY',
    fx: 'noise', word: 'SHAKA SHAKA!',
    line: 'Cans full of marbles, rattling like a mad band.' },
  { id: 'custard-cannon', name: 'Custard Cannon', needs: ['blender', 'custard'],
    cat: ['MESSY'], nerve: 4, mount: 'FLOOR',
    fx: 'pour', mess: 'custard', word: 'SPLURT!',
    line: 'Blender on full, lid off. A custard volcano.' },
  { id: 'slip-and-slide', name: 'Slip and Slide', needs: ['garden-hose', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 4, mount: 'STAIRS',
    fx: 'slip', mess: 'water', word: 'WHOOOSH!',
    line: 'Water and oil down the stairs. A water park, but rude.' },
  { id: 'glitter-blizzard', name: 'Glitter Blizzard', needs: ['glitter-cannon', 'hair-dryer'],
    cat: ['MESSY'], nerve: 3, mount: 'DOORWAY',
    fx: 'cloud', mess: 'glitter', word: 'TWINKLE!',
    line: 'A hot wind full of glitter. He sparkles like a disco ball.' }
];

export const UPGRADES = [
  { id: 'swinging-flour-bomb', name: 'Swinging Flour Bomb', needs: ['flour-bomb', 'rope'],
    cat: ['MESSY', 'STARTLE'], nerve: 4, mount: 'OVERHEAD',
    fx: 'swing', mess: 'flour', word: 'FWUMP!',
    line: 'It swings in from nowhere. Snowman again.' },
  { id: 'flypaper', name: 'Flypaper', needs: ['the-web', 'honey'],
    cat: ['TANGLE', 'STICKY'], nerve: 4, mount: 'DOORWAY',
    fx: 'tangle', mess: 'honey', word: 'STUCK!',
    line: 'Stuck to the tape, and the tape is stuck to him.' },
  { id: 'avalanche-alarm', name: 'Avalanche Alarm', needs: ['ballbearing-boulevard', 'tin-cans'],
    cat: ['SLIPPERY', 'LOUD'], nerve: 4, mount: 'FLOOR',
    fx: 'slip', word: 'CRASH!',
    line: 'He goes down, and wakes the whole street doing it.' },
  { id: 'bellringer', name: 'Bellringer', needs: ['pendulum', 'bell'],
    cat: ['STARTLE', 'LOUD'], nerve: 5, mount: 'OVERHEAD',
    fx: 'swing', mess: 'paint', word: 'CLONG DING!',
    line: 'CLONG. And the bell will not stop.' },
  { id: 'poltergeist', name: 'Poltergeist', needs: ['ghost-bomb', 'glitter-cannon'],
    cat: ['MESSY', 'STARTLE'], nerve: 5, mount: 'OVERHEAD',
    fx: 'cloud', mess: 'glitter', word: 'WOOOO!',
    line: 'A white cloud that sparkles. Sid thinks it is a ghost.' },
  { id: 'greased-avalanche', name: 'Greased Avalanche', needs: ['marble-avalanche', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 5, mount: 'STAIRS',
    fx: 'slip', word: 'WHOOSH!',
    line: 'No grip. No hope. No dignity.' },
  { id: 'rave-snare', name: 'Rave Snare', needs: ['rattlesnake-line', 'lights'],
    cat: ['LOUD', 'STARTLE'], nerve: 4, mount: 'DOORWAY',
    fx: 'flash', word: 'CLATTER!',
    line: 'Cans, flashing lights, chaos. The neighbours noticed.' },
  { id: 'banana-split', name: 'Banana Split', needs: ['banana-rama', 'custard'],
    cat: ['SLIPPERY', 'MESSY'], nerve: 5, mount: 'FLOOR',
    fx: 'slip', mess: 'custard', word: 'SPLURGE!',
    line: 'Banana, oil AND custard. He does not stand a chance.' },
  { id: 'custard-chicken', name: 'Custard Chicken', needs: ['custard-shower', 'pillow'],
    cat: ['MESSY', 'STICKY'], nerve: 5, mount: 'OVERHEAD',
    fx: 'pour', mess: ['custard', 'feathers'], word: 'BAWK SPLAT!',
    line: 'Custard first, then feathers. He is a giant chick.' },
  { id: 'burglar-alarm', name: 'Burglar Alarm', needs: ['doorbell', 'alarm-clock'],
    cat: ['LOUD', 'STARTLE'], nerve: 4, mount: 'DOORWAY',
    fx: 'noise', word: 'DING BRRRING!',
    line: 'A bell AND an alarm clock. The whole street sits up in bed.' },
  { id: 'sticky-mummy', name: 'Sticky Mummy', needs: ['mummy-maker', 'honey'],
    cat: ['TANGLE', 'STICKY'], nerve: 4, mount: 'DOORWAY',
    fx: 'tangle', mess: ['paper', 'honey'], word: 'SQUELCH!',
    line: 'Loo roll dipped in honey. He is wrapped AND stuck.' },
  { id: 'chicken-run', name: 'Chicken Run', needs: ['chicken-swing', 'pillow'],
    cat: ['STARTLE', 'MESSY'], nerve: 5, mount: 'OVERHEAD',
    fx: 'swing', mess: 'feathers', word: 'BAWK FWUMP!',
    line: 'A rubber chicken AND a burst pillow. Feathers for days.' },
  { id: 'puff-cushion', name: 'Puff Cushion', needs: ['rude-awakening', 'flour'],
    cat: ['STARTLE', 'MESSY'], nerve: 4, mount: 'FLOOR',
    fx: 'cloud', mess: 'flour', word: 'PFFT POOF!',
    line: 'He steps on it. PFFT. Then POOF. Flour everywhere.' },
  { id: 'banana-bobsleigh', name: 'Banana Bobsleigh', needs: ['banana-boarder', 'cooking-oil'],
    cat: ['SLIPPERY'], nerve: 5, mount: 'STAIRS',
    fx: 'slip', word: 'WHEEEEEEE!',
    line: 'An oily banana on a skate. He does a lap of the house.' }
];

/* What you say when two things do not go together. One is picked
   at random. Add your own. Keep them short. */
export const NOPE = [
  'That is just a wet sock.',
  'Nope. That is two things next to each other.',
  'Even Bruno would not fall for that.',
  'That is not a trap. That is a mess.',
  'Hmm. No.',
  'Mum would call that tidying up.',
  'Close. Not really. No.'
];
