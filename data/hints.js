/* ===========================================================
   HINTS - what you say at the workbench

   Hendrix: at the workbench, YOU talk. Put one thing on the
   bench and you drop a hint about what it goes with. You never
   just say the answer. You say a riddle, like

       "Marbles... I bet they would love something slippy that
        lives next to the cooker."

   The riddles themselves live with the things: riddle in
   data/items.js, and riddle on some traps in data/recipes.js.
   This file has the sentences they go into.

   HOW A HINT LINE WORKS
       {this}  becomes the name of the thing on the bench
       {that}  becomes the riddle for what it goes with

   One line is picked at random each time. Add your own. Keep
   them short, because the game reads them out loud.
   =========================================================== */

/* When the thing it goes with is in your bag right now. */
export const HINT_LINES = [
  '{this}... I bet it would love {that}.',
  'Ooh, {this}. Now, where did I put {that}?',
  '{this} and {that}. Just saying.',
  'Psst. {this} goes with {that}.',
  'Hmm. {this}. Think: {that}.',
  'I reckon {this} wants {that}. Have a look in the bag.'
];

/* When the thing it goes with is NOT in your bag. Something to
   look for next time. */
export const MISSING_LINES = [
  'If I had {that}, {this} would be AMAZING. Next time.',
  '{this} needs {that}. I have not got one. Yet.',
  'Rats. {this} goes with {that}, and I left it in the house.',
  '{this} wants {that}. Is there time to go back out and look?'
];

/* When a trap is on the bench and it cannot be upgraded. */
export const MAXED_LINES = [
  '{this} is as good as it gets. Go and set it!',
  'Nothing makes {this} any better. It is perfect.'
];

/* When you press Any ideas? and nothing in your bag goes together. */
export const NOTHING_LINES = [
  'Hmm. Nothing in here goes together. We need more junk.',
  'I have got nothing. That is a lot of random stuff.'
];

/* How you sound. The game reads every line out loud with the
   computer's own voice, made higher so it sounds like a kid.
       pitch  0.1 is a giant, 1 is normal, 2 is a chipmunk
       rate   how fast. 1 is normal.
   Turn the sound off (the speaker button, top right) and it
   goes quiet. */
export const VOICE = {
  pitch: 1.7,
  rate: 1.05
};

/* ===========================================================
   WHAT YOU SAY WHILE YOU SEARCH
   One of these is picked at random every time you find
   something, or find nothing. Add your own.
   =========================================================== */

/* When you find something. */
export const FOUND_LINES = [
  'Got it!', 'Yes!', 'Ooh.', 'Mine now.', 'Perfect.', 'That will do nicely.',
  'Score!', 'Into the bag.', 'Oh, hello.', 'I can use that.'
];

/* When a hiding place is empty. */
export const EMPTY_LINES = [
  'Nothing in here.', 'Just fluff.', 'Empty. Rats.', 'Only dust.',
  'One sock. Not useful.', 'A spider. Hello, spider. Bye.', 'Nope.',
  'Old crisps. Gross.', 'Nothing but a button.'
];
