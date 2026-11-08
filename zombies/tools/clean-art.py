# Makes a Higgsfield SVG safe to live in a sprite sheet:
# - removes the white background rect
# - prefixes every id with the sprite name so two files never clash
# - drops width/height so the viewBox does the scaling
import re, sys, os, glob
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in sorted(glob.glob(src + '/*.svg')):
    name = os.path.basename(f)[:-4]
    s = open(f).read()
    s = re.sub(r'<\?xml[^>]*\?>\s*', '', s)
    s = re.sub(r'<svg([^>]*)\swidth="[^"]*"', r'<svg\1', s, count=1)
    s = re.sub(r'<svg([^>]*)\sheight="[^"]*"', r'<svg\1', s, count=1)
    # background: a full-size rect right after <svg> or after </defs>, white-ish
    s = re.sub(r'<rect[^>]*(?:width="100%"|width="1024")[^>]*(?:fill="(?:#fff|#ffffff|white|#FFF|#FFFFFF)")[^>]*/>', '', s, count=1)
    s = re.sub(r'<rect[^>]*fill="(?:#fff|#ffffff|white|#FFF|#FFFFFF)"[^>]*(?:width="100%"|width="1024")[^>]*/>', '', s, count=1)
    ids = set(re.findall(r'\sid="([^"]+)"', s))
    for i in ids:
        s = re.sub(r'\sid="' + re.escape(i) + '"', f' id="{name}-{i}"', s)
        s = s.replace(f'url(#{i})', f'url(#{name}-{i})').replace(f'href="#{i}"', f'href="#{name}-{i}"')
    s = f'<!-- {name}: drawn by GPT Image via Higgsfield, 8 Nov 2026. Edit the colours below. -->\n' + s.strip() + '\n'
    open(os.path.join(dst, name + '.svg'), 'w').write(s)
    if 'fill="#fff' in s[:900] or 'white' in s[:900]: print('check background:', name)
print('cleaned', len(glob.glob(dst + '/*.svg')))
