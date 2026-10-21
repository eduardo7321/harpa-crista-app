DEFS='''<defs>
<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DC92"/><stop offset=".5" stop-color="#D6A640"/><stop offset="1" stop-color="#9E7020"/></linearGradient>
<linearGradient id="goldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9E7020"/><stop offset=".5" stop-color="#F6DC92"/><stop offset="1" stop-color="#9E7020"/></linearGradient>
<radialGradient id="black" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#3A3330"/><stop offset="1" stop-color="#0E0B0A"/></radialGradient>
<radialGradient id="navy" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#2E4A86"/><stop offset="1" stop-color="#0F1A36"/></radialGradient>
<radialGradient id="wine" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#8E2A2A"/><stop offset="1" stop-color="#3A0C0C"/></radialGradient>
<linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C8202A"/><stop offset="1" stop-color="#8A1018"/></linearGradient>
</defs>'''
CLEF='<text x="{x}" y="{y}" font-family="Noto Music" font-size="{s}" text-anchor="middle" fill="url(#gold)">&#x1D11E;</text>'
def staff(y0,gap=3.2,x1=14,x2=86):
    return ''.join(f'<line x1="{x1}" y1="{y0+i*gap:.1f}" x2="{x2}" y2="{y0+i*gap:.1f}" stroke="url(#goldH)" stroke-width=".7"/>' for i in range(5))
def note(x,y):
    return f'<ellipse cx="{x}" cy="{y}" rx="2.6" ry="1.9" transform="rotate(-20 {x} {y})" fill="url(#gold)"/><line x1="{x+2.3}" y1="{y-.5}" x2="{x+2.3}" y2="{y-11}" stroke="url(#gold)" stroke-width=".9"/>'
def frame():
    if ROUND: return ('<circle cx="50" cy="50" r="44" fill="none" stroke="url(#gold)" stroke-width="1.6"/><circle cx="50" cy="50" r="40.5" fill="none" stroke="url(#gold)" stroke-width=".6"/>')
    return ('<rect x="7" y="7" width="86" height="86" rx="6" fill="none" stroke="url(#gold)" stroke-width="1.6"/>'
            '<rect x="10.5" y="10.5" width="79" height="79" rx="4" fill="none" stroke="url(#gold)" stroke-width=".6"/>')
def ribbon(): return '<path d="M70 93 L70 100 L78 100 L78 93 Z" fill="url(#ribbon)"/><path d="M70 0 L70 0" />'
def title(y,txt,size):
    return f'<text x="50" y="{y}" font-family="Noto Serif" font-weight="bold" font-size="{size}" letter-spacing="1.2" text-anchor="middle" fill="url(#gold)">{txt}</text>'
def svg(bg,body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">{DEFS}<rect width="100" height="100" fill="{bg}"/>{body}</svg>'
import sys
ROUND=len(sys.argv)>1
# A: cover, clef on staff with notes, no text
A=svg('url(#black)', frame()+staff(52)+CLEF.format(x=31,y=70,s=30)+note(52,62.4)+note(62,57.6)+note(72,54.4)+'<path d="M72 89.5 L72 100 L76 97 L80 100 L80 89.5 Z" fill="url(#ribbon)"/>')
# B: cover with title + clef staff
B=svg('url(#black)', frame()+title(31,'HARPA',13)+title(82,'CRISTÃ',13)+staff(51,2.8,20,80)+CLEF.format(x=35,y=64.5,s=21)+note(52,59.4)+note(61,56.6)+note(70,53.8))
# C: navy, big centered clef inside frame + ribbon
C=svg('url(#navy)', frame()+CLEF.format(x=50,y=72,s=35)+'<path d="M72 89.5 L72 100 L76 97 L80 100 L80 89.5 Z" fill="url(#ribbon)"/>')
# D: wine version of B
D=svg('url(#wine)', frame()+title(31,'HARPA',13)+title(82,'CRISTÃ',13)+staff(51,2.8,20,80)+CLEF.format(x=35,y=64.5,s=21)+note(52,59.4)+note(61,56.6)+note(70,53.8))
for k,v in zip('abcd',[A,B,C,D]): open(f'v_{k}{"r" if ROUND else ""}.svg','w').write(v)
