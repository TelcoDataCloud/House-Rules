/* ===========================================================
   FOLK: what the villagers say and do

   Hendrix: every villager used to be a zombie. They remember.
   Tap one in the day and they say one of these. Add your own
   lines, any you like, and the game will pick them at random.
   =========================================================== */

// Tap a villager in the day and they say one of these
export const CHAT = [
  'I used to be a zombie. I miss eating shoes.',
  'Is there snot on my face? Be honest.',
  'I once ate a whole sock. It was blue.',
  'My left arm still wanders off at night.',
  'Brains? No thanks. I am a carrot person now.',
  'I had a dream I was a potato.',
  'Do you smell that? Oh. It was me.',
  'When I was a zombie my name was Grrrr.',
  'I am not scared of zombies. I am scared of spiders.',
  'Can I have a hat? Everyone looks better in a hat.',
  'The pond ate my boot.',
  'I high fived a zombie once. He kept my hand.',
  'Sometimes I still groan. Just for fun.',
  'My favourite colour is snot green.',
];

// What they shout at night
export const PANIC = ['HELP!', 'AAAH!', 'NOT MY HAT!', 'MUMMY!', 'GET OFF!'];
export const RESCUED = ['MY HERO!', 'YOU SAVED ME!', 'WOOHOO!', 'BEST HERO EVER!'];

// Hats you can buy a villager with odd socks. Costs are in socks.
export const HATS = [
  { id: 'partyhat',  name: 'Party hat',  socks: 1 },
  { id: 'moustache', name: 'Moustache',  socks: 2 },
  { id: 'tophat',    name: 'Top hat',    socks: 3 },
  { id: 'crown',     name: 'Crown',      socks: 5 },
];

// Each morning one villager may ask for something.
// Do it and they get happy and do one extra trip of work.
//   ask    what they say
//   needs  'hat': give them any hat
//          'highfive': give them a high five
//          a thing from data/traps.js: build one near their box
export const REQUESTS = [
  { ask: 'Can I have a hat? Please?', needs: 'hat' },
  { ask: 'I need a high five. A big one.', needs: 'highfive' },
  { ask: 'It is dark by my box. A torch please?', needs: 'torch' },
  { ask: 'I want carrots right next to me.', needs: 'farm' },
  { ask: 'Build me a fence. I like fences.', needs: 'fence' },
];
export const REQUEST_CHANCE = 0.7;   // how likely a request is each morning

// Silly things that happen in the day, now and then
export const GOOFS = [
  { line: 'fell in the pond', art: 'puddle' },
  { line: 'is chasing a butterfly', art: null },
  { line: 'sneezed on a carrot', art: 'carrot' },
  { line: 'is doing a happy dance', art: null },
  { line: 'tripped over nothing', art: null },
  { line: 'found an odd sock', art: 'sock', gives: 'socks' },
];

// The pyjama army: once a night, every villager runs out with a pillow
export const PILLOW = {
  seconds: 4,      // how long they chase
  reach: 1.6,      // squares around each villager that get bopped
  stun: 4,         // seconds the bopped zombies see stars
  from: 2,         // the first night it can be used
};

// Brave villagers who are not in a cottage throw socks at zombies
export const SOCK_THROW = { every: 3.5, reach: 3.5, stun: 1.5 };
