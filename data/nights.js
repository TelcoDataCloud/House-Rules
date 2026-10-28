/* ===========================================================
   NIGHTS - a whole week of burglars

   Hendrix: pick "A week" on the title screen and you play five
   nights in a row, Monday to Friday. Every night gets harder.

       name      what the night is called
       burglars  how many come that night (picked at random from
                 the five in data/burglars.js)
       nerve     how brave they are. 1 is normal. 1.5 means half
                 as brave again, so your traps need to work harder.
       note      what the title says before the night starts

   Traps you did not use come with you to the next night, and so
   does your recipe notebook. Your bag starts empty every night.

   Want a longer week? Add Saturday and Sunday. Want it easier?
   Make the numbers smaller.
   =========================================================== */

export const WEEK = [
  { name: 'Monday',    burglars: 2, nerve: 1,    note: 'A quiet one. Probably.' },
  { name: 'Tuesday',   burglars: 2, nerve: 1.15, note: 'They talked about you down the pub.' },
  { name: 'Wednesday', burglars: 3, nerve: 1.15, note: 'Three of them. They brought a friend.' },
  { name: 'Thursday',  burglars: 3, nerve: 1.3,  note: 'They are getting braver.' },
  { name: 'Friday',    burglars: 4, nerve: 1.4,  note: 'Friday night. Everybody is coming.' }
];

/* How the week is graded: the grade you get most of. Get an S on
   Friday and you get a gold star on the week too. */
