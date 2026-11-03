# -*- coding: utf-8 -*-
"""runner.html auf die gemeinsame Engine.

runner.html ist das Bonus-Level (Arcade-Runner mit Bossen). Es trug als
einziges noch eine komplette eigene Kopie von Font, Sprite-Cache, Audio,
Canvas und Vollbild mit sich - und hatte damit auch keine Handy-Fassung.

Umgestellt wird so, dass sich am Spiel NICHTS aendert:
- die doppelten Engine-Teile fliegen raus, die gemeinsamen kommen per
  Script-Tag (kern, bild, ton, stand, mobil)
- runner.html ist fuer genau 320 Pixel Breite gebaut. Die Engine laesst W
  auf breiten Schirmen wachsen. Deshalb setzt fit() hier W nach jedem
  Resize wieder auf 320 - es laeuft als letztes und gewinnt.
- die eigenen Klangfunktionen (tone, slide, beep, noise) bleiben, sie
  benutzen AC und ensureAudio aus ton.js.
"""
import io, re

p = 'runner.html'
s = io.open(p, encoding='utf-8').read()


def schneide(von, bis):
    """Entfernt alles ab 'von' bis ausschliesslich 'bis'."""
    global s
    i = s.index(von); j = s.index(bis, i)
    s = s[:i] + s[j:]


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


ver = re.search(r'nacht/kern\.js\?v=([0-9]+)', io.open('level7.html', encoding='utf-8').read()).group(1)
tags = ''.join('<script src="nacht/%s.js?v=%s"></script>\n' % (m, ver) for m in ['kern', 'bild', 'ton', 'stand', 'mobil'])
ersetze('<script>\n/* ============================================================================\n   NACHTSCHICHT  v0.3',
        tags + '<script>\n/* ============================================================================\n   NACHTSCHICHT  v0.3')

ersetze("const pick = a => a[Math.floor(Math.random()*a.length)];\n", "")
schneide("const F = {", "function textShadow(")
schneide("const _ids=new WeakMap();", "const HEAD=")
ersetze("""let AC=null, muted=false;
function ensureAudio(){ if(AC) return AC;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); MUS.next=AC.currentTime+.05; }
  catch(e){ AC=null; } return AC; }
""", "")
ersetze("const MUS={step:0,next:0};\n", "")
ersetze("""const cv=document.getElementById('c'), ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const W=320,H=180,GROUND=152;""",
"""/* Canvas, W und H kommen aus nacht/kern.js. */
const GROUND=152;""")
schneide("/* Touch-Geraet? maxTouchPoints ist verlaesslicher als pointer:coarse.", "function isFs(){")
ersetze("""function fit(){
  const pad = (isFs()||IS_TOUCH) ? 0 : 46;""",
"""function fit(){
  /* Dieses Level ist fuer genau 320 Pixel gebaut. Die Engine laesst W auf
     breiten Schirmen wachsen - hier wird es danach zurueckgesetzt. fit()
     ist als letzter Resize-Handler registriert und gewinnt. */
  W=320; if(cv.width!==320){ cv.width=320; ctx.imageSmoothingEnabled=false; }
  const pad = (isFs()||IS_TOUCH) ? 0 : 46;""")
schneide("/* ---- Vollbild ---- */\nfunction toggleFullscreen(){", "const SKEY=")
ersetze("const keys={};\n", "")
ersetze("const el=id=>document.getElementById(id);\n", "")
s = s.replace("toggleFullscreen()", "vollbild()")

io.open(p, 'w', encoding='utf-8').write(s)
print('runner.html: gemeinsame Engine')
