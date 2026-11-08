# Renders art/map.svg stretched over the grid (36 by 24 squares of 40px)
# and prints which squares look like water (~), rock (#) or wood and dirt
# (B). tools/make-land.py turns that into the LAND picture in data/map.js.
# Run from the zombies folder after changing the map:
#   python3 tools/read-map.py
import asyncio, os
from playwright.async_api import async_playwright
from PIL import Image
COLS, ROWS, T = 36, 24, 40
svg = open('art/map.svg').read()
inner = svg[svg.index('>', svg.index('<svg')) + 1: svg.rindex('</svg>')]
html = f'<body style="margin:0"><svg width="{COLS*T}" height="{ROWS*T}" viewBox="0 0 1024 688" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">{inner}</svg></body>'
open('/tmp/read-map.html', 'w').write(html)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': COLS * T, 'height': ROWS * T})
        await pg.goto('file:///tmp/read-map.html'); await pg.wait_for_timeout(800)
        await pg.screenshot(path='/tmp/read-map.png'); await b.close()
asyncio.run(main())
im = Image.open('/tmp/read-map.png').convert('RGB')
def kind(c, r):
    n = w = rk = wd = 0
    for dx in range(4, T, 5):
        for dy in range(4, T, 5):
            R, G, B = im.getpixel((c * T + dx, r * T + dy)); n += 1
            if B > 170 and B > R + 60 and B > G: w += 1
            elif abs(R - G) < 22 and abs(G - B) < 22 and 90 < R < 225: rk += 1
            elif R > 200 and 120 < G < 190 and B < 120: wd += 1
    if w >= n * 0.22: return '~'
    if wd >= n * 0.5: return 'B'
    if rk >= n * 0.35: return '#'
    return '.'
print('\n'.join(''.join(kind(c, r) for c in range(COLS)) for r in range(ROWS)))
