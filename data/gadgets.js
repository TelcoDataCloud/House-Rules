/* ===========================================================
   GADGETS - buttons you press DURING the night

   Hendrix: up in the attic you have three gadgets wired into the
   house. Each one works once a night, so pick your moment.

       name    what the button says
       line    what it does, in a few words
       who     who it gets:
                 'everyone'  every burglar in the house
                 'room'      everybody in the room you are watching
                             (follow someone, or tap a room first)
                 'trap'      sets off the nearest trap to the
                             burglar you are following, right now
       cat     what kind of scare it is (like a trap)
       nerve   how much nerve it knocks off (like a trap)
       word    the big comic word

   Want a fourth gadget? Copy one and change it. 'everyone' and
   'room' work with any cat and nerve you like.
   =========================================================== */

export const GADGETS = [
  { id: 'bark', name: 'Dog bark', who: 'everyone', cat: ['STARTLE', 'LOUD'], nerve: 2, word: 'WOOF WOOF!',
    line: 'Plays a recording of a very big dog, all over the house.' },
  { id: 'lights', name: 'Lights out', who: 'room', cat: ['STARTLE'], nerve: 3, word: 'BLACKOUT!',
    line: 'Flicks the lights off in the room you are watching.' },
  { id: 'spring', name: 'Spring a trap', who: 'trap', cat: [], nerve: 0, word: '',
    line: 'Sets off the nearest trap to whoever you are following.' }
];

/* How many times you can use each gadget in one night. */
export const GADGET_USES = 1;
