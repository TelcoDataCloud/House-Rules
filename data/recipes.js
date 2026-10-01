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
               out): flour, feathers, paint, honey, glitter, water
       word    the big comic word that pops up, like CLONG!

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
    fx: 'slip', word: 'WHOOPS!',
    line: 'Feet go out sideways, arms windmill, down he goes.' },
  { id: 'pendulum', name: 'The Pendulum', needs: ['paint-tin', 'rope'],
    cat: ['STARTLE'], nerve: 3, mount: 'OVERHEAD',
    fx: 'swing', mess: 'paint', word: 'CLONG!',
    line: 'A paint tin swings out of the dark. CLONG.' },
  { id: 'rattlesnake-line', name: 'Rattlesnake Line', needs: ['string', 'tin-cans'],
    cat: ['LOUD'], nerve: 2, mount: 'DOORWAY',
    fx: 'noise', word: 'CLATTER!',
    line: 'A tripline drags a chain of cans across the floor.' },
  { id: 'chicken-blizzard', name: 'Chicken Blizzard', needs: ['hair-dryer', 'pillow'],
    cat: ['MESSY'], nerve: 2, mount: 'DOORWAY',
    fx: 'cloud', mess: 'feathers', word: 'FWUMP!',
    line: 'A feather storm. He comes out looking like a chicken.' },
  { id: 'ghost-bomb', name: 'Ghost Bomb', needs: ['hair-dryer', 'flour'],
    cat: ['MESSY'], nerve: 2, mount: 'OVERHEAD',
    fx: 'cloud', mess: 'flour', word: 'POOF!',
    line: 'White out. Coughing. Two eyes blinking in a cloud.' },
  { id: 'full-poultry', name: 'Full Poultry', needs: ['honey', 'pillow'],
    cat: ['STICKY'], nerve: 3, mount: 'OVERHEAD',
    fx: 'pour', mess: 'honey', word: 'SPLOT!',
    line: 'Honey, then feathers. He knows what he looks like.' },
  { id: 'the-web', name: 'The Web', needs: ['duct-tape', 'string'],
    cat: ['TANGLE'], nerve: 2, mount: 'DOORWAY',
    fx: 'tangle', word: 'STUCK!',
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
    fx: 'slip', word: 'RATTLE!',
    line: 'A whole bucket of marbles down the stairs.' },
  { id: 'doorbell', name: 'The Doorbell', needs: ['bell', 'string'],
    cat: ['LOUD'], nerve: 1, mount: 'DOORWAY',
    fx: 'noise', word: 'DING DONG!',
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
    fx: 'cloud', mess: 'flour', word: 'POOF!',
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
    line: 'He will be finding this in his hair for years.' }
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
    line: 'Cans, flashing lights, chaos. The neighbours noticed.' }
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
