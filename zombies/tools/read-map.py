# Renders art/map.svg onto the 24 by 16 grid and prints which squares look
# like water (W), rock (R) or wood (B). Used to draw the LAND picture in
# data/map.js so the game's walls match the painting. Run from the zombies
# folder after changing the map: python3 tools/read-map.py
import asyncio, os
from playwright.async_api import async_playwright
from PIL import Image
svg = open('/tmp/hr/zombies/art/map.svg').read()
html = '<body style="margin:0"><svg width="960" height="640" viewBox="0 0 1024 688" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' + svg[svg.index('>', svg.index('<svg'))+1: svg.rindex('</svg>')] + '</svg></body>'
open('mapgrid.html','w').write(html)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 960, 'height': 640})
        await pg.goto('file://' + os.path.abspath('mapgrid.html')); await pg.wait_for_timeout(600)
        await pg.screenshot(path='mapgrid.png'); await b.close()
asyncio.run(main())
im = Image.open('mapgrid.png').convert('RGB')
def kind(c, r):
    counts = {'water':0,'rock':0,'wood':0,'grass':0,'dirt':0}
    for dx in range(6, 40, 6):
        for dy in range(6, 40, 6):
            R,G,B = im.getpixel((c*40+dx, r*40+dy))
            if B > 170 and B > R + 60 and B > G: counts['water'] += 1
            elif abs(R-G) < 25 and abs(G-B) < 25 and 90 < R < 220: counts['rock'] += 1
            elif R > 150 and G > 100 and B < 110 and R > G: counts['wood'] += 1
            else: counts['grass'] += 1
    n = sum(counts.values())
    if counts['water'] >= n * 0.22: return 'W'
    if counts['wood'] >= n * 0.5: return 'B'
    if counts['rock'] >= n * 0.35: return 'R'
    return '.'
rows = []
for r in range(16):
    rows.append(''.join(kind(c, r) for c in range(24)))
print('\n'.join(rows))
