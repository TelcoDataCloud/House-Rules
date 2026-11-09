# Sounds

Free sounds, all Creative Commons Zero (CC0), which means anyone may use
them for anything:

- **Kenney** (www.kenney.nl), *Sci-Fi Sounds* and *Impact Sounds*: lasers,
  explosions, hits, shields, debris.
- From OpenGameArt.org: *Chunky Explosion* (bigboom),
  *Rocket Launch* (launch), *Electricity Sound Effects* (spark),
  *Mech Stomp Step Sound* (stomp), *LEGIT Audio Fire Staff* (fire, roar),
  *Ice Shatters* (ice).

The sounds are packed into a few text files (`pack-1.json`... listed in
`packs.json`), which the game loads.
Each sound has 2 or 3 versions (`pop-1`, `pop-2`...). The game picks one at
random every time, so things never sound exactly the same.

Want a different bang? Put `.mp3` files in this folder named like the ones
in the list (for example `pop-1.mp3`), then run
`python3 tools/pack-sounds.py` to pack them.
