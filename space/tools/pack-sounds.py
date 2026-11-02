"""Pack every .mp3 in the sounds folder into sounds/pack-1.json,
pack-2.json... (each about 80 KB) and a list of them, packs.json.

The game loads those. (GitHub uploads here only take text, so the
sounds travel inside text files.) Run it after you add or change
a sound:

    python3 tools/pack-sounds.py
"""
import base64, json, pathlib

here = pathlib.Path(__file__).resolve().parent.parent / 'sounds'
for old in here.glob('pack*.json'):
    old.unlink()
packs, pack, size = [], {}, 0
for f in sorted(here.glob('*.mp3')):
    text = base64.b64encode(f.read_bytes()).decode()
    if size and size + len(text) > 80_000:
        packs.append(pack)
        pack, size = {}, 0
    pack[f.stem] = text
    size += len(text)
if pack:
    packs.append(pack)
names = []
for i, p in enumerate(packs, 1):
    name = f'pack-{i}.json'
    (here / name).write_text(json.dumps(p, separators=(',', ':')))
    names.append(name)
(here / 'packs.json').write_text(json.dumps(names))
print(f'Packed {sum(len(p) for p in packs)} sounds into {len(names)} files')
