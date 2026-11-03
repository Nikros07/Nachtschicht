# -*- coding: utf-8 -*-
"""Die Handy-Fassung wird groesser, greifbarer und ruhiger.

Gemessen auf einem 375x812-Schirm, vorher:
  - das Bild war 320x180 gross: 22 Prozent der Hoehe, und 55 Pixel Breite
    blieben schwarz
  - zwischen der Knopfleiste und den Knoepfen lagen 380 Pixel tote Flaeche
  - der Stick sass fest unten links, egal wie man das Geraet haelt
  - nichts beruecksichtigte Kamera-Kerbe und Home-Balken

Was sich aendert:
  1. Hochkant nutzt das Bild die volle Breite (lage()).
  2. Der Stick ist frei: er erscheint dort, wo der Daumen die linke
     Haelfte beruehrt. Damit gibt es keine tote Flaeche mehr.
  3. Groessere Knoepfe mit Druckgefuehl (Skalierung plus kurzer Vibration).
  4. Die Leiste wandert nach ganz unten, weg vom besten Platz.
  5. Sichere Raender (env(safe-area-inset-*)), kein Gummiband-Scrollen.
  6. Der Bildschirm schlaeft beim Spielen nicht mehr ein (Wake Lock).
"""
import io

p = 'nacht/mobil.js'
s = io.open(p, encoding='utf-8').read()

CSS = r"""const stil=document.createElement('style');
stil.textContent=`
/* Die alte Knopfleiste, der Vollbild-Ausstieg und die Dreh-Aufforderung
   sind abgeloest - falls eine Seite sie noch mitbringt, bleiben sie aus. */
html.touch #touch, html.touch #rotate, html.touch #texit,
html.touch #levelbar, html.touch #fs { display:none !important; }

/* html UND body sind im Level als Flex-Box zentriert. Bleibt html dabei,
   wird body nur so breit wie sein Inhalt - und das ganze Bedienfeld sitzt
   in einer 320 Pixel breiten Spalte statt auf dem Schirm.
   overscroll-behavior verhindert das Gummiband beim Wischen. */
html.touch, html.touch body { height:100%; overflow:hidden; display:block;
  overscroll-behavior:none; -webkit-touch-callout:none; }
html.touch #cab { display:flex; flex-direction:column; width:100%; height:100%;
  padding:0; background:#05040c; }
@supports (height:100dvh){ html.touch #cab { height:100dvh; } }

/* Hochkant: Bild oben, Bedienfeld darunter. Das Bild bekommt die volle
   Breite (siehe lage()), oben bleibt Platz fuer die Kamera-Kerbe. */
html.touch #screen { flex:0 0 auto; align-self:center;
  margin-top:calc(env(safe-area-inset-top,0px) + 8px); }
#mdeck { position:relative; flex:1 1 auto; min-height:0;
  touch-action:none; user-select:none; -webkit-user-select:none; }

/* Quer liegt das Bedienfeld ueber dem Bild - sonst bliebe vom Bild nichts. */
html.touch.mobil-quer #cab { display:block; position:relative; }
html.touch.mobil-quer #screen { position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; margin:0; }
html.touch.mobil-quer #mdeck { position:absolute; inset:0; }
html.touch.mobil-quer .mtaste { opacity:.6; }
html.touch.mobil-quer .mtaste:active { opacity:1; }

/* ---- Der Stick ----
   Er steht nicht mehr fest: wo der Daumen die linke Haelfte beruehrt, dort
   erscheint er. Ein fester Kreis ist auf einem 812 Pixel hohen Schirm
   entweder zu weit unten oder zu weit oben - je nachdem, wie man haelt. */
#mzone { position:absolute; left:0; top:0; width:52%; height:100%; }
html.touch.mobil-quer #mzone { width:45%; }
#mstick { position:absolute; width:46vw; max-width:220px; aspect-ratio:1;
  margin-left:-23vw; margin-top:-23vw; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.07),rgba(255,255,255,.02) 70%);
  border:2px solid rgba(255,255,255,.14); opacity:.45; transition:opacity .15s; }
@media (min-width:520px){ #mstick { margin-left:-110px; margin-top:-110px; } }
#mstick.zieht { opacity:1; }
#mknopf { position:absolute; left:50%; top:50%; width:40%; aspect-ratio:1;
  margin:-20% 0 0 -20%; border-radius:50%;
  background:rgba(255,61,139,.32); border:2px solid #ff3d8b;
  transition:background .12s; }
#mstick.zieht #mknopf { background:rgba(255,61,139,.6); }
#mstick .mring { position:absolute; inset:24%; border-radius:50%;
  border:1px dashed rgba(255,255,255,.12); }

/* ---- Die Knoepfe rechts ----
   Gross, weit unten, mit Abstand zum Rand: so liegt der rechte Daumen ohne
   Umgreifen darauf, und unter dem Home-Balken sitzt nichts. */
.mtaste { position:absolute; border-radius:50%;
  background:rgba(255,255,255,.07); border:2px solid rgba(255,255,255,.18);
  color:#cfc8e6; font:700 12px/1.1 monospace; letter-spacing:1px;
  display:flex; align-items:center; justify-content:center; text-align:center;
  padding:4px; transition:transform .06s, background .06s; }
.mtaste:active { background:rgba(255,61,139,.34); border-color:#ff3d8b; color:#fff;
  transform:scale(.94); }
.mtaste.aus { display:none; }
#mb-aktion { right:5%;  bottom:calc(env(safe-area-inset-bottom,0px) + 9%);
  width:34vw; max-width:170px; aspect-ratio:1;
  border-color:#ffd447; color:#ffd447; font-size:14px; }
#mb-aktion:active { background:rgba(255,212,71,.34); border-color:#ffd447; color:#fff; }
#mb-zwei { right:42%; bottom:calc(env(safe-area-inset-bottom,0px) + 13%);
  width:24vw; max-width:118px; aspect-ratio:1; }
#mb-block { right:6%; bottom:calc(env(safe-area-inset-bottom,0px) + 40%);
  width:24vw; max-width:118px; aspect-ratio:1;
  border-color:#42d9ff; color:#42d9ff; }
#mb-block:active { background:rgba(66,217,255,.30); border-color:#42d9ff; color:#fff; }
/* Zusatzknoepfe: was nur dieses Level kann. */
.mx { position:absolute; right:8%; width:21vw; max-width:100px; aspect-ratio:1;
  font-size:11px; }
#mb-x1 { bottom:calc(env(safe-area-inset-bottom,0px) + 40%); }
#mb-x2 { right:38%; bottom:calc(env(safe-area-inset-bottom,0px) + 44%); }

/* ---- Die kleine Leiste ----
   Sie sass direkt unter dem Bild und nahm den besten Platz weg. Jetzt ist
   sie eine schmale Zeile ganz unten, weit weg von den Daumen. */
#mbar { position:absolute; left:0; right:0; bottom:0; display:flex; gap:5px;
  padding:5px 8px calc(env(safe-area-inset-bottom,0px) + 5px); z-index:3; }
#mbar button, #mbar a { flex:1; text-decoration:none; text-align:center;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12);
  border-radius:6px; color:#8d86a8; font:700 9px/1 monospace; letter-spacing:1px;
  padding:7px 2px; }
html.touch.mobil-quer #mbar { width:auto; left:auto; right:8px; top:8px; bottom:auto;
  padding:0; opacity:.55; }
html.touch.mobil-quer #mbar button, html.touch.mobil-quer #mbar a { padding:6px 8px; }

/* Gespraech: die Antworten sind hier Flaechen, keine Liste zum Blaettern. */
#mtalk { position:absolute; inset:0; display:none; flex-direction:column;
  gap:7px; padding:10px 10px calc(env(safe-area-inset-bottom,0px) + 12px);
  background:#05040c; z-index:4; }
#mtalk.an { display:flex; }
#mtalk .wer { font:700 10px/1 monospace; letter-spacing:2px; color:#42d9ff; }
#mtalk .was { font:400 13px/1.45 monospace; color:#f2f0ff; flex:0 0 auto; }
#mtalk .liste { flex:1; display:flex; flex-direction:column; gap:8px;
  justify-content:flex-end; overflow:hidden; }
#mtalk .opt { background:rgba(255,255,255,.05); border:1px solid #2a2246;
  border-left:3px solid #ff3d8b; border-radius:8px; color:#cfc8e6;
  font:400 13px/1.35 monospace; padding:13px 11px; text-align:left; }
#mtalk .opt:active { background:rgba(255,61,139,.26); color:#fff; }
#mtalk .weiter { background:rgba(255,212,71,.10); border:1px solid #ffd447;
  border-radius:8px; color:#ffd447; font:700 12px/1 monospace; letter-spacing:2px;
  padding:16px; }
#mtalk .uhr { height:3px; background:#ff3d8b; border-radius:2px; align-self:flex-start; }

/* Levelmenue - baut sich aus der Leiste, die am Rechner unter dem Bild steht. */
#mmenu { position:absolute; inset:0; display:none; flex-direction:column; gap:6px;
  padding:10px; background:#05040c; overflow:auto; z-index:5; }
#mmenu.an { display:flex; }
#mmenu a { text-decoration:none; text-align:left; color:#cfc8e6;
  background:rgba(255,255,255,.05); border:1px solid #2a2246; border-radius:6px;
  font:700 12px/1 monospace; letter-spacing:1px; padding:14px 12px; }
#mmenu a.aktiv { color:#ff3d8b; border-color:#ff3d8b; }
#mmenu .zu { background:rgba(255,212,71,.10); border:1px solid #ffd447; color:#ffd447;
  border-radius:6px; font:700 11px/1 monospace; letter-spacing:2px; padding:14px; }
`;
"""

i = s.index("const stil=document.createElement('style');")
j = s.index("document.head.appendChild(stil);")
s = s[:i] + CSS + s[j:]

# ---------------------------------------------------------------- DOM ------
s = s.replace("  '<div id=\"mstick\"><div class=\"mring\"></div><div id=\"mknopf\"></div></div>',",
              "  '<div id=\"mzone\"></div>',\n"
              "  '<div id=\"mstick\"><div class=\"mring\"></div><div id=\"mknopf\"></div></div>',")
s = s.replace("const stick=document.getElementById('mstick');",
              "const stick=document.getElementById('mstick');\nconst zone=document.getElementById('mzone');")

# ------------------------------------------------------------- Stick -------
alt_stick = s[s.index("function stickAus(e){"):s.index("/* --------------------------------------------------------------------------\n   KNOEPFE")]
neu_stick = r"""function stickAus(e){
  const r=stick.getBoundingClientRect();
  let dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
  let dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
  const len=Math.hypot(dx,dy);
  if(len>1){ dx/=len; dy/=len; }
  stickSetzen(dx,dy,Math.min(1,len));
}

/* Der Stick geht dorthin, wo der Daumen aufsetzt. Sonst passt seine feste
   Stelle immer nur zu einer Handhaltung - und die halbe linke Flaeche ist
   tot. Geklemmt wird er so, dass er nicht halb aus dem Bild ragt. */
function stickAn(x,y){
  const z=zone.getBoundingClientRect(), b=stick.offsetWidth||140;
  const lx=Math.max(b*0.45,Math.min(z.width -b*0.45,x-z.left));
  const ly=Math.max(b*0.45,Math.min(z.height-b*0.45,y-z.top));
  stick.style.left=lx+'px'; stick.style.top=ly+'px';
  stick.classList.add('zieht');
}
/* Ruhestellung, wenn keiner ihn anfasst: unten links, gut sichtbar. */
function stickHeim(){
  const z=zone.getBoundingClientRect(), b=stick.offsetWidth||140;
  stick.style.left=Math.round(z.width*0.5)+'px';
  stick.style.top =Math.round(z.height-b*0.62)+'px';
}

/* Pointer statt Touch: derselbe Code bedient Finger, Stift und Maus - das
   ist nicht nur zum Testen gut, es gibt genug Geraete, die beides koennen.
   setPointerCapture haelt die Meldungen, wenn der Daumen ueber den Rand
   der Zone hinausrutscht. */
zone.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
  if(stickId!==null) return;
  stickId=e.pointerId;
  try{ zone.setPointerCapture(e.pointerId); }catch(err){}
  stickAn(e.clientX,e.clientY); stickAus(e);
});
zone.addEventListener('pointermove',function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickAus(e);
});
['pointerup','pointercancel'].forEach(function(ev){ zone.addEventListener(ev,function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickLos(); stickHeim();
}); });

"""
s = s.replace(alt_stick, neu_stick)

# Druckgefuehl auf den Knoepfen
s = s.replace("""function halte(elm,code){
  elm.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
    try{ elm.setPointerCapture(e.pointerId); }catch(err){}
    taste(code,true); });""",
"""function halte(elm,code){
  elm.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
    try{ elm.setPointerCapture(e.pointerId); }catch(err){}
    mobilVibriere(8);              // kurzer Tick, damit der Druck ankommt
    taste(code,true); });""")

# ------------------------------------------------------------- Lage --------
s = s.replace("""function lage(){
  const quer=innerWidth>innerHeight;
  document.documentElement.classList.toggle('mobil-quer',quer);
  window.MOBIL.hoch=!quer;
  anpassen();
}""",
"""function lage(){
  const quer=innerWidth>innerHeight;
  document.documentElement.classList.toggle('mobil-quer',quer);
  window.MOBIL.hoch=!quer;
  anpassen();
  /* Hochkant nutzt das Bild die volle Breite. anpassen() rechnet mit
     ganzen und viertel Stufen und landete auf einem 375er Schirm bei
     Faktor 1 - also 320 Pixel Bild und 55 Pixel schwarzem Rand. Hier
     zaehlt jeder Pixel mehr, deshalb die genaue Breite. */
  if(!quer){
    const s=innerWidth/W;
    cv.style.width=Math.round(W*s)+'px';
    cv.style.height=Math.round(H*s)+'px';
  }
  stickHeim();
}

/* Der Bildschirm soll beim Spielen nicht ausgehen. Geht nur nach einer
   Beruehrung und nur, wo der Browser es kann - sonst passiert nichts. */
let wachSchloss=null;
async function bildschirmWach(){
  try{
    if(!navigator.wakeLock||wachSchloss) return;
    wachSchloss=await navigator.wakeLock.request('screen');
    wachSchloss.addEventListener('release',function(){ wachSchloss=null; });
  }catch(e){}
}
document.addEventListener('visibilitychange',function(){
  if(!document.hidden) bildschirmWach();
});
addEventListener('pointerdown',bildschirmWach,{once:true});""")

io.open(p, 'w', encoding='utf-8').write(s)
print('mobil.js umgebaut')
