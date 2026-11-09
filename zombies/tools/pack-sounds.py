"""Packs a folder of .mp3 sounds into zombies/sounds/, as text files
the game loads (GitHub uploads here only take text, so the sounds
travel inside text files).

    python3 tools/pack-sounds.py /path/to/folder/of/mp3s

Name each file like the sound it plays, with a number for each
version: bonk-1.mp3, bonk-2.mp3. The game picks one at random.
A file named music-... goes in the music packs, which load after
the sound effects so the game starts quicker.

Recording your own: save it as, say, groan-1.mp3, put it in the
folder with the others and run this again. A recorded sound with
the same name replaces the Kenney one.
"""
import base64, json, pathlib, re, sys

src = pathlib.Path(sys.argv[1])
out = pathlib.Path(__file__).resolve().parent.parent / 'sounds'
out.mkdir(exist_ok=True)
for old in out.glob('*.json'):
    old.unlink()

def split(text, size=76_000):
    # cut into parts, never in the middle of a !q190! marker
    parts = []
    while text:
        cut = min(size, len(text))
        if text.count('!', 0, cut) % 2: cut = text.rindex('!', 0, cut)
        parts.append(text[:cut]); text = text[cut:]
    return parts

# Long runs of one letter (the silent bits of an mp3) are written short:
# a run of 190 q's becomes !q190! and the game puts them back. That keeps
# the packs smaller and easy to copy exactly.
def squash(text):
    return re.sub(r'([A-Za-z0-9+/=])\1{7,}', lambda m: f'!{m.group(1)}{len(m.group(0))}!', text)

def pack(files, prefix):
    packs, cur, size = [], {}, 0
    for f in files:
        text = squash(base64.b64encode(f.read_bytes()).decode())
        # a long sound (music) is cut into parts: name~0, name~1...
        parts = split(text)
        for n, part in enumerate(parts):
            key = f.stem if len(parts) == 1 else f'{f.stem}~{n}'
            if size and size + len(part) > 80_000:
                packs.append(cur); cur, size = {}, 0
            cur[key] = part; size += len(part)
    if cur: packs.append(cur)
    names = []
    for i, p in enumerate(packs, 1):
        name = f'{prefix}-{i}.json'
        (out / name).write_text(json.dumps(p, separators=(',', ':')))
        names.append(name)
    return names

files = sorted(src.glob('*.mp3'))
sfx = pack([f for f in files if not f.stem.startswith('music-')], 'sfx')
music = pack([f for f in files if f.stem.startswith('music-')], 'music')
(out / 'packs.json').write_text(json.dumps({'sfx': sfx, 'music': music}))
print(f'{len(files)} sounds: {len(sfx)} sound packs, {len(music)} music packs')
