"""Packs the painted pictures (.webp) into pics/, as text files the
game loads (GitHub uploads here only take text, so pictures travel
inside text files, like the sounds).

    python3 tools/pack-pics.py /path/to/folder/of/webp

Name each picture after the art it replaces: bob.webp replaces
art/bob.svg in the game. Anything without a picture keeps its
drawing from art/. title.webp is the title screen picture.

To make a picture from a Higgsfield PNG (transparent background):
    python3 tools/pack-pics.py --make in.png out.webp [size]
"""
import base64, json, pathlib, re, sys

def squash(text):
    return re.sub(r'([A-Za-z0-9+/=])\1{7,}', lambda m: f'!{m.group(1)}{len(m.group(0))}!', text)

def split(text, size):
    parts = []
    while text:
        cut = min(size, len(text))
        if text.count('!', 0, cut) % 2: cut = text.rindex('!', 0, cut)
        parts.append(text[:cut]); text = text[cut:]
    return parts

def make(src, out, size=192):
    from PIL import Image
    im = Image.open(src).convert('RGBA')
    box = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    im = im.crop(box)
    w, h = im.size
    s = max(w, h)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    sq.paste(im, ((s - w) // 2, s - h))   # stand on the bottom edge, like the drawings
    sq.resize((size, size), Image.LANCZOS).save(out, 'WEBP', quality=80, method=6)

if sys.argv[1] == '--make':
    make(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 192)
    sys.exit()

src = pathlib.Path(sys.argv[1])
out = pathlib.Path(__file__).resolve().parent.parent / 'pics'
out.mkdir(exist_ok=True)
for old in out.glob('*.json'):
    old.unlink()
packs, cur, used, SIZE = [], {}, 0, 16_000
for f in sorted(src.glob('*.webp')):
    text = squash(base64.b64encode(f.read_bytes()).decode())
    parts = split(text, SIZE - 1_000)
    for n, part in enumerate(parts):
        key = f.stem if len(parts) == 1 else f'{f.stem}~{n}'
        if used and used + len(part) > SIZE:
            packs.append(cur); cur, used = {}, 0
        cur[key] = part; used += len(part)
if cur: packs.append(cur)
names = []
for i, p in enumerate(packs, 1):
    (out / f'pics-{i}.json').write_text(json.dumps(p, separators=(',', ':')))
    names.append(f'pics-{i}.json')
(out / 'packs.json').write_text(json.dumps(names))
print(f'{len(list(src.glob("*.webp")))} pictures in {len(names)} packs')
