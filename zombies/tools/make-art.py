# Writes the first version of every picture in art/. Each picture is a
# plain SVG with CSS colour names (var(--zombie) and friends) so changing
# css/tokens.css repaints them. Run once; after that, edit the SVGs by hand.
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.join(HERE, '..', 'art')
os.makedirs(ART, exist_ok=True)

INK = 'stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'

def person(skin, shirt, hat='', extra='', eyes='normal', legs='var(--cloth-2)'):
    # a 40 wide, 44 tall blocky person. head 0..18, body 18..34, legs 34..44
    if eyes == 'zombie':
        eye = f'<rect x="12" y="7" width="6" height="6" fill="var(--zombie-eye)" {INK}/><rect x="23" y="6" width="5" height="7" fill="var(--zombie-eye)" {INK}/><circle cx="15" cy="10" r="1.5" fill="var(--ink)"/><circle cx="26" cy="9" r="1.5" fill="var(--ink)"/><path d="M13 15 h12" {INK} fill="none"/>'
    else:
        eye = f'<circle cx="15" cy="10" r="2" fill="var(--ink)"/><circle cx="25" cy="10" r="2" fill="var(--ink)"/><path d="M15 14 q5 3 10 0" {INK} fill="none"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44">
<g class="stars"><text x="20" y="4" font-size="9" text-anchor="middle" fill="var(--button)">&#9733; &#9733; &#9733;</text></g>
<g class="body">
<rect x="10" y="34" width="8" height="10" rx="2" fill="{legs}" {INK}/>
<rect x="22" y="34" width="8" height="10" rx="2" fill="{legs}" {INK}/>
<rect x="8" y="18" width="24" height="17" rx="4" fill="{shirt}" {INK}/>
<rect x="2" y="20" width="7" height="12" rx="3" fill="{skin}" {INK}/>
<rect x="31" y="20" width="7" height="12" rx="3" fill="{skin}" {INK}/>
<rect x="7" y="1" width="26" height="18" rx="5" fill="{skin}" {INK}/>
{eye}
{hat}
{extra}
</g></svg>'''

Z = 'var(--zombie)'
S = 'var(--skin)'

art = {}
art['hero'] = person(S, 'var(--cloth)', hat=f'<rect x="6" y="0" width="28" height="7" rx="3" fill="var(--hair)" {INK}/>', extra=f'<rect x="34" y="16" width="4" height="16" rx="2" fill="var(--wood)" {INK}/>')
art['farmer'] = person(S, 'var(--carrot-leaf)', hat=f'<rect x="3" y="2" width="34" height="5" rx="2" fill="var(--straw)" {INK}/><rect x="10" y="-2" width="20" height="6" rx="2" fill="var(--straw)" {INK}/>')
art['builder'] = person(S, 'var(--carrot)', hat=f'<rect x="7" y="-1" width="26" height="7" rx="3" fill="var(--button)" {INK}/>')
art['brewer'] = person(S, 'var(--potion)', hat=f'<rect x="7" y="-1" width="26" height="6" rx="3" fill="var(--cloth-2)" {INK}/>')
art['lookout'] = person(S, 'var(--stone)', extra=f'<circle cx="34" cy="12" r="5" fill="var(--potion)" {INK}/>')
art['giantfriend'] = person(S, 'var(--mud)', hat=f'<rect x="5" y="-1" width="30" height="7" rx="3" fill="var(--fur)" {INK}/>')

art['bob'] = person(Z, 'var(--zombie-dark)', eyes='zombie', legs='var(--mud)', extra=f'<rect x="31" y="14" width="7" height="6" rx="2" fill="{Z}" {INK}/>')
art['hopper'] = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44">
<g class="stars"><text x="20" y="4" font-size="9" text-anchor="middle" fill="var(--button)">&#9733; &#9733;</text></g>
<g class="body">
<rect x="12" y="30" width="6" height="12" rx="2" fill="var(--mud)" {INK}/><rect x="22" y="30" width="6" height="12" rx="2" fill="var(--mud)" {INK}/>
<rect x="10" y="18" width="20" height="13" rx="4" fill="var(--zombie-dark)" {INK}/>
<rect x="8" y="4" width="24" height="15" rx="5" fill="{Z}" {INK}/>
<rect x="13" y="8" width="5" height="5" fill="var(--zombie-eye)" {INK}/><rect x="22" y="8" width="5" height="5" fill="var(--zombie-eye)" {INK}/>
<circle cx="16" cy="11" r="1.3" fill="var(--ink)"/><circle cx="24" cy="10" r="1.3" fill="var(--ink)"/>
<path d="M14 16 q6 4 12 0" {INK} fill="none"/>
</g></svg>'''
art['digger'] = person(Z, 'var(--mud)', eyes='zombie', legs='var(--mud)', hat=f'<rect x="6" y="-1" width="28" height="7" rx="3" fill="var(--stone)" {INK}/>', extra=f'<rect x="33" y="10" width="5" height="22" rx="2" fill="var(--wood)" {INK}/><rect x="31" y="30" width="9" height="6" rx="1" fill="var(--stone)" {INK}/>')
art['snot'] = person(Z, 'var(--zombie-dark)', eyes='zombie', legs='var(--mud)', extra=f'<path d="M17 15 q1 6 -2 9" stroke="var(--snot-dark)" stroke-width="3" fill="none"/><rect x="30" y="22" width="10" height="11" rx="2" fill="var(--stone)" {INK}/><ellipse cx="35" cy="22" rx="5" ry="3" fill="var(--snot)" {INK}/>')
art['gasbag'] = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44">
<g class="stars"><text x="20" y="4" font-size="9" text-anchor="middle" fill="var(--button)">&#9733; &#9733; &#9733;</text></g>
<g class="body">
<rect x="9" y="36" width="8" height="8" rx="2" fill="var(--mud)" {INK}/><rect x="23" y="36" width="8" height="8" rx="2" fill="var(--mud)" {INK}/>
<ellipse cx="20" cy="26" rx="18" ry="13" fill="var(--zombie-dark)" {INK}/>
<rect x="9" y="2" width="22" height="16" rx="5" fill="{Z}" {INK}/>
<rect x="13" y="7" width="5" height="5" fill="var(--zombie-eye)" {INK}/><rect x="22" y="7" width="5" height="5" fill="var(--zombie-eye)" {INK}/>
<circle cx="16" cy="10" r="1.3" fill="var(--ink)"/><circle cx="25" cy="9" r="1.3" fill="var(--ink)"/>
<ellipse cx="20" cy="15" rx="3" ry="1.5" fill="var(--ink)"/>
<circle cx="37" cy="33" r="4" fill="var(--gas)"/><circle cx="39" cy="27" r="3" fill="var(--gas)"/>
</g></svg>'''
art['werewolf'] = person('var(--fur)', 'var(--fur)', eyes='normal', legs='var(--undies)', hat=f'<path d="M9 2 l3 -6 l4 6 z M24 2 l3 -6 l4 6 z" fill="var(--fur)" {INK}/>', extra=f'<path d="M14 15 l3 3 l3 -3 l3 3 l3 -3" {INK} fill="var(--zombie-eye)"/>')
art['giant'] = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100">
<g class="stars"><text x="40" y="6" font-size="16" text-anchor="middle" fill="var(--button)">&#9733; &#9733; &#9733;</text></g>
<g class="body">
<rect x="18" y="76" width="18" height="24" rx="4" fill="var(--mud)" {INK}/><rect x="44" y="76" width="18" height="24" rx="4" fill="var(--mud)" {INK}/>
<rect x="12" y="38" width="56" height="40" rx="8" fill="var(--zombie-dark)" {INK}/>
<rect x="0" y="42" width="13" height="30" rx="5" fill="{Z}" {INK}/><rect x="67" y="42" width="13" height="30" rx="5" fill="{Z}" {INK}/>
<rect x="14" y="4" width="52" height="36" rx="9" fill="{Z}" {INK}/>
<rect x="24" y="14" width="10" height="10" fill="var(--zombie-eye)" {INK}/><rect x="44" y="12" width="9" height="12" fill="var(--zombie-eye)" {INK}/>
<circle cx="29" cy="19" r="2.5" fill="var(--ink)"/><circle cx="49" cy="18" r="2.5" fill="var(--ink)"/>
<path d="M26 30 h26" {INK} fill="none"/>
</g></svg>'''

# things, 40x40
def thing(inner): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">{inner}</svg>'
art['wall'] = thing(f'<rect x="2" y="4" width="36" height="34" rx="3" fill="var(--wood)" {INK}/><path d="M2 15 h36 M2 26 h36 M14 4 v11 M26 15 v11 M14 26 v12" {INK} fill="none"/>')
art['fence'] = thing(f'<rect x="6" y="6" width="5" height="32" rx="2" fill="var(--wood)" {INK}/><rect x="29" y="6" width="5" height="32" rx="2" fill="var(--wood)" {INK}/><rect x="2" y="13" width="36" height="5" fill="var(--wood-dark)" {INK}/><rect x="2" y="26" width="36" height="5" fill="var(--wood-dark)" {INK}/>')
art['torch'] = thing(f'<rect x="17" y="16" width="6" height="22" rx="2" fill="var(--wood)" {INK}/><path d="M20 2 q8 6 4 14 q-4 4 -8 0 q-4 -8 4 -14z" fill="var(--carrot)" {INK}/><path d="M20 7 q3 3 1 7 q-2 1 -3 0 q-1 -4 2 -7z" fill="var(--button)"/>')
art['mud'] = thing(f'<ellipse cx="20" cy="22" rx="17" ry="11" fill="var(--mud)" {INK}/><circle cx="14" cy="20" r="2" fill="var(--dirt)"/><circle cx="25" cy="25" r="2.5" fill="var(--dirt)"/>')
art['pit'] = thing(f'<ellipse cx="20" cy="22" rx="17" ry="11" fill="var(--ink)"/><ellipse cx="20" cy="20" rx="17" ry="11" fill="var(--dirt)" {INK}/><path d="M8 18 l6 -3 l5 4 l6 -4 l6 3" stroke="var(--carrot-leaf)" stroke-width="3" fill="none"/>')
art['brains'] = thing(f'<rect x="18" y="6" width="4" height="32" rx="2" fill="var(--wood)" {INK}/><path d="M20 6 h12" {INK} fill="none"/><path d="M32 6 v8" stroke="var(--ink)" stroke-width="1.5"/><ellipse cx="32" cy="19" rx="6" ry="5" fill="var(--undies)" {INK}/><path d="M28 17 q2 -3 4 0 q2 -3 4 0" stroke="var(--ink)" stroke-width="1.5" fill="none"/>')
art['tramp'] = thing(f'<ellipse cx="20" cy="22" rx="17" ry="12" fill="var(--cloth-2)" {INK}/><ellipse cx="20" cy="22" rx="10" ry="7" fill="none" {INK}/><path d="M5 30 v6 M35 30 v6" {INK}/>')
art['spin'] = thing(f'<rect x="4" y="4" width="32" height="34" rx="4" fill="var(--wood-dark)" {INK}/><rect x="8" y="8" width="11" height="26" fill="var(--wood)" {INK}/><rect x="21" y="8" width="11" height="26" fill="var(--wood)" {INK}/><path d="M10 20 q10 -8 20 0" stroke="var(--button)" stroke-width="3" fill="none"/>')
art['drop'] = thing(f'<rect x="4" y="2" width="32" height="5" rx="2" fill="var(--wood)" {INK}/><path d="M20 7 v6" {INK}/><ellipse cx="20" cy="22" rx="12" ry="10" fill="var(--pumpkin)" {INK}/><path d="M20 12 v20 M13 14 q0 16 0 16 M27 14 q0 16 0 16" stroke="var(--ink)" stroke-width="1.5" fill="none"/><rect x="18" y="8" width="4" height="5" fill="var(--carrot-leaf)" {INK}/>')
art['honey'] = thing(f'<ellipse cx="20" cy="24" rx="17" ry="11" fill="var(--honey)" {INK}/><rect x="14" y="4" width="12" height="14" rx="3" fill="var(--button)" {INK}/><rect x="12" y="2" width="16" height="5" rx="2" fill="var(--wood)" {INK}/>')
art['scare'] = thing(f'<rect x="18" y="12" width="4" height="26" fill="var(--wood)" {INK}/><rect x="6" y="18" width="28" height="4" fill="var(--wood)" {INK}/><rect x="10" y="14" width="20" height="14" rx="3" fill="var(--cloth)" {INK}/><circle cx="20" cy="9" r="7" fill="var(--straw)" {INK}/><circle cx="18" cy="8" r="1.2" fill="var(--ink)"/><circle cx="23" cy="8" r="1.2" fill="var(--ink)"/>')
art['log'] = thing(f'<rect x="3" y="12" width="34" height="18" rx="9" fill="var(--wood-dark)" {INK}/><ellipse cx="9" cy="21" rx="6" ry="8" fill="var(--straw)" {INK}/><circle cx="9" cy="21" r="2.5" fill="none" {INK}/>')
art['bed'] = thing(f'<rect x="4" y="8" width="32" height="26" rx="3" fill="var(--wood)" {INK}/><rect x="7" y="14" width="26" height="17" fill="var(--cloth-2)" {INK}/><rect x="8" y="10" width="10" height="6" rx="2" fill="var(--panel)" {INK}/>')
art['farm'] = thing(f'<rect x="2" y="2" width="36" height="36" rx="3" fill="var(--dirt)" stroke="var(--wood-dark)" stroke-width="2"/>' + ''.join(f'<path d="M{x} 30 l-3 -9 h6z" fill="var(--carrot)" {INK}/><path d="M{x} 21 l-3 -5 M{x} 21 l3 -5" stroke="var(--carrot-leaf)" stroke-width="2.5"/>' for x in (10, 20, 30)))
art['brewery'] = thing(f'<rect x="4" y="12" width="32" height="26" rx="3" fill="var(--stone)" {INK}/><path d="M2 14 l18 -11 l18 11z" fill="var(--cloth)" {INK}/><rect x="12" y="20" width="16" height="14" rx="5" fill="var(--potion)" {INK}/><circle cx="17" cy="25" r="2" fill="var(--panel)"/><circle cx="23" cy="29" r="1.5" fill="var(--panel)"/>')
art['well'] = thing(f'<ellipse cx="20" cy="30" rx="14" ry="7" fill="var(--stone)" {INK}/><ellipse cx="20" cy="27" rx="8" ry="4" fill="var(--water)" {INK}/><rect x="8" y="10" width="3" height="18" fill="var(--wood)" {INK}/><rect x="29" y="10" width="3" height="18" fill="var(--wood)" {INK}/><path d="M4 11 l16 -8 l16 8z" fill="var(--wood-dark)" {INK}/>')
art['catapult'] = thing(f'<rect x="4" y="28" width="32" height="8" rx="2" fill="var(--wood-dark)" {INK}/><path d="M10 28 l14 -20" stroke="var(--wood)" stroke-width="5" stroke-linecap="round"/><path d="M10 28 l14 -20" {INK} fill="none"/><circle cx="26" cy="7" r="5" fill="var(--stone)" {INK}/><path d="M14 28 l4 -10 M26 28 l-8 -10" {INK}/>')
art['bell'] = thing(f'<rect x="8" y="14" width="24" height="24" rx="2" fill="var(--stone)" {INK}/><path d="M6 14 l14 -10 l14 10z" fill="var(--wood-dark)" {INK}/><path d="M14 30 q0 -12 6 -12 q6 0 6 12z" fill="var(--button)" {INK}/><circle cx="20" cy="31" r="2" fill="var(--ink)"/>')
art['garlic'] = thing(f'<ellipse cx="20" cy="26" rx="13" ry="10" fill="var(--panel)" {INK}/><path d="M12 24 q8 -14 16 0" fill="var(--panel)" {INK}/><path d="M20 10 v6" {INK}/><path d="M20 10 q-3 -6 0 -8 q3 2 0 8" fill="var(--carrot-leaf)" {INK}/>')
art['pumpkin'] = thing(f'<ellipse cx="20" cy="22" rx="14" ry="12" fill="var(--pumpkin)" {INK}/><path d="M20 10 v24 M12 12 q-1 10 0 20 M28 12 q1 10 0 20" stroke="var(--ink)" stroke-width="1.5" fill="none"/><rect x="18" y="4" width="4" height="7" fill="var(--carrot-leaf)" {INK}/>')
art['bucket'] = thing(f'<path d="M8 12 h24 l-3 24 h-18z" fill="var(--stone)" {INK}/><ellipse cx="20" cy="12" rx="12" ry="4" fill="var(--potion)" {INK}/><path d="M8 12 q12 -14 24 0" fill="none" {INK}/>')
art['carrot'] = thing(f'<path d="M20 36 l-9 -22 h18z" fill="var(--carrot)" {INK}/><path d="M20 14 l-6 -8 M20 14 l6 -8 M20 14 v-9" stroke="var(--carrot-leaf)" stroke-width="3" stroke-linecap="round"/>')
art['plank'] = thing(f'<rect x="4" y="14" width="32" height="12" rx="2" fill="var(--wood)" {INK}/><path d="M12 14 v12 M24 14 v12" stroke="var(--wood-dark)" stroke-width="2"/>')
art['heart'] = thing(f'<path d="M20 36 l-14 -14 q-5 -9 4 -13 q6 -2 10 5 q4 -7 10 -5 q9 4 4 13z" fill="currentColor" {INK}/>')
art['villager'] = thing(f'<rect x="10" y="4" width="20" height="16" rx="4" fill="var(--skin)" {INK}/><circle cx="16" cy="11" r="1.8" fill="var(--ink)"/><circle cx="24" cy="11" r="1.8" fill="var(--ink)"/><path d="M15 15 q5 3 10 0" {INK} fill="none"/><rect x="8" y="21" width="24" height="15" rx="4" fill="var(--carrot-leaf)" {INK}/>')
art['zombieicon'] = thing(f'<rect x="10" y="4" width="20" height="16" rx="4" fill="var(--zombie)" {INK}/><rect x="13" y="8" width="5" height="5" fill="var(--zombie-eye)" {INK}/><rect x="22" y="8" width="5" height="5" fill="var(--zombie-eye)" {INK}/><circle cx="16" cy="11" r="1.2" fill="var(--ink)"/><circle cx="25" cy="10" r="1.2" fill="var(--ink)"/><rect x="8" y="21" width="24" height="15" rx="4" fill="var(--zombie-dark)" {INK}/>')
art['tree'] = thing(f'<rect x="17" y="24" width="6" height="14" fill="var(--wood-dark)" {INK}/><circle cx="20" cy="16" r="13" fill="var(--woods-dark)" {INK}/><circle cx="14" cy="18" r="6" fill="var(--woods)"/>')

for name, svg in art.items():
    with open(os.path.join(ART, name + '.svg'), 'w') as f:
        f.write(svg + '\n')
print('wrote', len(art), 'pictures')
