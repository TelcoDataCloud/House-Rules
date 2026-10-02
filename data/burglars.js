/* ===========================================================
   BURGLARS - who is coming tonight, the way they go, and what
   they say

   Hendrix: these two are yours. Change their names, change what
   they say, change where they go. The game reads this list and
   does whatever it says.

   HOW A BURGLAR WORKS

       name        what the game calls him
       look        which drawing to use (in js/burglar-art.js).
                   'sid' is tall and thin, 'bruno' is big and wide.
       speed       how fast he walks. Hendrix walks at 160.
       comesIn     which side of the picture he walks in from:
                   'left' (the front door) or 'right' (round the
                   back, past the shed)
       waitsFirst  how many seconds he waits before he sets off
       pause       how many seconds he stops in each room

   HIS ROUTE
   A list of stops, in order. Each stop is a room (the id from
   data/rooms.js) and the thing he says when he gets there. He
   finds his own way between stops, stairs and all. If a room
   has loot in it, he takes it. When he runs out of stops, he
   walks back out the way he came in.

       { room: 'kitchen', says: ['Smells of toast.', 'Is that jam?'] },

   says can be one line, or a list of lines in [ ]. With a list,
   he picks one at random every night, so he never says quite the
   same thing twice. Keep each line short. It has to fit in a
   speech bubble. Every other line below works the same way:
   one, or a list.

   grabs is what he says when he picks something up.
   tooLate is what he says if the other one got there first
   and took the loot.
   leaving is what he says on the way out.
   mutters is what he mumbles to himself while he walks about.

   Try this: change Sid's name to something worse. Then rewrite
   one of the things he says. Save, refresh, let them in.

   WHAT MAKES THEM TICK

       nerve       how brave he is. Every trap knocks some off.
                   When it gets to nothing, he runs for it and
                   drops everything he is carrying.
       weakTo      kinds of trap he HATES. They hurt his nerve
                   twice as much.
       shrugsOff   kinds of trap he barely notices. Half as much.

   The kinds are the cat of each trap in data/recipes.js:
   LOUD, SLIPPERY, STICKY, MESSY, STARTLE, TANGLE.

   WHAT HE SHOUTS
       ouch        when a trap gets him (one is picked at random)
       hates       when it is a trap he is weak to
       meh         when it is a trap he shrugs off
       panic       when his nerve goes and he runs
       caught      when the police get him

   Cartoon swearing is #@!% and nothing worse. Keep it funny.
   =========================================================== */

export const BURGLARS = [
  {
    id: 'sid',
    name: 'Sid',
    look: 'sid',
    speed: 100,
    comesIn: 'right',
    waitsFirst: 0,
    pause: 1.6,
    nerve: 8,
    weakTo: ['LOUD', 'STARTLE'],
    shrugsOff: ['MESSY'],
    route: [
      { room: 'utility',  says: ['Back door. Nobody locks the back door.', 'In we go. Quiet as a mouse.', 'Smells of washing powder. And fear. Mine.'] },
      { room: 'landing',  says: ['Did that stair just creak at me?', 'Upstairs. Where the good stuff lives.', 'Why is there a plant looking at me?'] },
      { room: 'big-room', says: ['Jewellery box. Come to Sid.', 'Ooh, sparkly.', 'A safe! Nah. Too much like hard work.'] },
      { room: 'my-room',  says: ['A kid lives here. Kids set traps.', 'Is that a WORKBENCH? Why does a kid need a workbench?', 'Nice laptop. Bit sticky.'] },
      { room: 'box-room', says: ['Ooh. A guitar.', 'Boxes. Loads of boxes. Why?', 'I could be a rock star with this.'] },
      { room: 'dining',   says: ['Cash tin. Where it always is.', 'Who keeps cash in a dresser? Thank you, whoever.', 'Teapot. Not worth it.'] }
    ],
    grabs: ['Mine now.', 'Into the sack.', 'Lovely. Ta very much.', 'Sid wins again.'],
    tooLate: ['Bruno! That was mine!', 'Empty?! BRUNO!', 'He always gets here first.'],
    leaving: ['Easy. Too easy. I hate it when it is easy.', 'Right. Out. Before something happens.', 'Not a single trap. Weird.'],
    mutters: ['Tiptoe, tiptoe.', 'Was that a noise?', 'Nobody is home. Nobody is home.', 'I should have stayed in bed.', 'Why is it so QUIET?', 'Hum de dum. Just burgling.', 'Bruno said this would be easy.'],
    ouch: ['#@!%!', 'OW! My everything!', 'Who DOES that?', 'Not the face!', 'Who put THAT there?!', 'That is NOT fair!', 'My MUM would not like this!', 'Ow ow ow ow OW.'],
    hates: ['AAAARGH! My nerves!', 'I nearly jumped out of my socks!', 'Too LOUD! Too LOUD!', 'My heart! My poor little heart!', 'MUMMY!'],
    meh: ['Pfft. I have been dirtier.', 'Is that it?', 'Mess? I live in mess.'],
    panic: ['That is IT. This house is haunted! I am OUT!', 'NOPE. Bye. Forever.', 'The house is ALIVE! Run!'],
    caught: ['It was Bruno\'s idea!', 'I was just looking!', 'Can I at least keep the sack?']
  },
  {
    id: 'bruno',
    name: 'Bruno',
    look: 'bruno',
    speed: 70,
    comesIn: 'left',
    waitsFirst: 3,
    pause: 2.2,
    nerve: 14,
    weakTo: ['STICKY', 'MESSY'],
    shrugsOff: ['LOUD'],
    route: [
      { room: 'porch',    says: ['Wipe your feet, Bruno.', 'Nice wellies. Not my size.', 'Front door. Bold. I like bold.'] },
      { room: 'hall',     says: ['Quiet house. I like a quiet house.', 'Nice clock. Too heavy.', 'Right then. Telly first.'] },
      { room: 'lounge',   says: ['Big telly. Bigger than mine.', 'A piano. Nobody burgles a piano.', 'Ooh, a games console.'] },
      { room: 'dining',   says: ['Anything in the drawer?', 'Fancy plates. Not my style.', 'Somebody had pudding in here.'] },
      { room: 'kitchen',  says: ['Is that jam? That is jam.', 'I could murder a sandwich.', 'Nobody saw me check the fridge.'] },
      { room: 'cellar',   says: ['Nothing down here but spiders.', 'Dark. Damp. Like my flat.', 'Who keeps a freezer in a cellar?'] }
    ],
    grabs: ['That can come with me.', 'Heavy. Worth it.', 'In you go.', 'Lovely jubbly.'],
    tooLate: ['Sid had it. Course he did.', 'Gone. Sid, you little weasel.', 'Empty. Typical.'],
    leaving: ['Right. Home. Kettle on.', 'Job done. Biscuits.', 'That was a nice quiet night.'],
    mutters: ['Slow and steady.', 'My knees hate stairs.', 'Is it biscuit time yet?', 'Big house. Big telly. Big Bruno.', 'Hmm hmm hmm.', 'Sid better not drop anything.', 'I am not scared of kids.'],
    ouch: ['Oof.', '#@!%!', 'That was rude.', 'Right. Now I am cross.', 'Oh, come ON.', 'Why is it always me?', 'My best boots!', 'Hnnnngh.'],
    hates: ['EURGH! It is all over me!', 'NOT my good jumper!', 'Sticky! STICKY!', 'It is in my EARS!', 'I need a BATH!'],
    meh: ['What? Did somebody say something?', 'Huh. Noisy house.', 'Was that a bell? Never mind.'],
    panic: ['Nope. Nope nope nope. I am going home.', 'I want my mum!', 'This is not worth a telly!'],
    caught: ['I only came for the telly.', 'Is there a biscuit at the station?', 'Sid made me do it.']
  }
];

/* ===========================================================
   LOOT - the good stuff they came for

   Each one sits in a room. x is how far in from the room's left
   wall and lift moves it up off the floor, same as a prop in
   data/rooms.js. look is the drawing (in js/loot-art.js).

   A burglar takes whatever loot is in a room he STOPS in. Walking
   through a room is not enough. So if you move the laptop to a
   room that is not on anyone's route, nobody takes it. That is
   also a way to find out where they go.
   =========================================================== */

export const LOOT = [
  { id: 'telly',     name: 'the telly',          room: 'lounge',   look: 'telly',     x: 72,  lift: 28 },
  { id: 'console',   name: 'the games console',  room: 'lounge',   look: 'console',   x: 42,  lift: 0 },
  { id: 'laptop',    name: 'the laptop',         room: 'my-room',  look: 'laptop',    x: 52,  lift: 38 },
  { id: 'jewellery', name: 'the jewellery box',  room: 'big-room', look: 'jewellery', x: 118, lift: 36 },
  { id: 'cash',      name: 'the cash tin',       room: 'dining',   look: 'cashtin',   x: 99,  lift: 44 },
  { id: 'guitar',    name: 'the guitar',         room: 'box-room', look: 'guitar',    x: 60,  lift: 0 }
];
