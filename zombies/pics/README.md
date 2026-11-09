# pics: the painted pictures

Each pics-N.json holds a few paintings, written as text so GitHub can
take them. The game reads packs.json to know which packs to load, then
swaps each painting in for the drawing with the same name in art/.

- Characters (bob.webp replaces art/bob.svg) and the title picture.
- Fence pieces (pics-55 to 58): fence-h, wall-h and stonewall-h are the
  straight-on pieces for fences that run left and right. fence-v,
  wall-v and stonewall-v are the long columns for fences that run up
  and down. grid.js uses them when fences join up.

To add paintings: tools/pack-pics.py (read the top of that file).
