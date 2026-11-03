# -*- coding: utf-8 -*-
"""Die leere Mitte im Hochformat bekommt eine Aufgabe.

Das Bild ist 16:9 und kann hochkant nur so hoch werden wie der Schirm breit
ist - darunter bleiben rund 350 Pixel uebrig. Statt sie schwarz zu lassen,
steht dort jetzt das, was auf dem kleinen Bild am schlechtesten zu lesen
ist: der aktuelle Hinweis und die Werte der Nacht.

Quer bleibt die Flaeche aus - dort liegt das Bedienfeld ueber dem Bild.
"""
import io

p = 'nacht/mobil.js'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu):
    global s
    assert s.count(alt) == 1, alt[:70]
    s = s.replace(alt, neu)


# ------------------------------------------------------------------ CSS ----
ersetze("""/* ---- Die kleine Leiste ----""",
"""/* ---- Die Tafel in der Mitte ----
   Hochkant bleibt unter dem Bild Platz, den kein Spielinhalt braucht.
   Dort steht gross, was auf dem kleinen Bild klein ist. */
#minfo { position:absolute; left:0; right:0; top:8px; padding:0 14px;
  text-align:center; pointer-events:none; z-index:1; }
#minfo .titel { font:700 11px/1.3 monospace; letter-spacing:3px; color:#4a4363; }
#minfo .hinweis { margin-top:10px; font:700 14px/1.45 monospace; color:#ffd447;
  min-height:42px; text-wrap:balance; }
#minfo .werte { margin-top:12px; display:flex; flex-wrap:wrap; gap:6px 10px;
  justify-content:center; font:700 10px/1 monospace; letter-spacing:1px; color:#4a4363; }
#minfo .werte b { color:#8d86a8; font-weight:700; }
#minfo .crew { margin-top:9px; font:400 10px/1.4 monospace; color:#42d9ff99; }
html.touch.mobil-quer #minfo { display:none; }

/* ---- Die kleine Leiste ----""")

# ------------------------------------------------------------------ DOM ----
ersetze("  '<div id=\"mzone\"></div>',",
        "  '<div id=\"minfo\"><div class=\"titel\"></div><div class=\"hinweis\"></div>',\n"
        "  '  <div class=\"werte\"></div><div class=\"crew\"></div></div>',\n"
        "  '<div id=\"mzone\"></div>',")

# ----------------------------------------------------------------- Logik ---
ersetze("""/* --------------------------------------------------------------------------
   KONTEXT""",
"""/* --------------------------------------------------------------------------
   DIE TAFEL
   Spiegelt Hinweis und Werte gross unter das Bild. Sie liest nur, was da
   ist - fehlt nacht.js, bleibt die Werte-Zeile eben leer.
   -------------------------------------------------------------------------- */
const info=document.getElementById('minfo');
let infoStand='';
function infoPflege(){
  if(window.MOBIL.hoch===false) return;
  const titel=(document.title||'').replace(/^NACHTSCHICHT\\s*-?\\s*/,'')||'NACHTSCHICHT';
  let hinweis='';
  if(typeof S!=='undefined'&&S){
    if(S.hinweisT>0&&S.hinweis) hinweis=S.hinweis;
    else if(S.meldungT>0&&S.meldung) hinweis=S.meldung;
  }
  let werte='';
  if(typeof wert==='function'){
    const w=[['MUT','mut'],['RUF','ruf'],['GELD','geld'],['WACH','kondition']];
    werte=w.map(function(e){ return '<span>'+e[0]+' <b>'+Math.round(wert(e[1]))+'</b></span>'; }).join('');
    if(typeof ladePegel==='function')
      werte+='<span>PEGEL <b>'+Math.round(ladePegel())+'</b></span>';
  }
  let crew='';
  if(typeof ladeCrew==='function'){ const c=ladeCrew(); if(c.length) crew='DABEI: '+c.join(', '); }
  const kennung=titel+'|'+hinweis+'|'+werte+'|'+crew;
  if(kennung===infoStand) return;
  infoStand=kennung;
  info.querySelector('.titel').textContent=titel;
  info.querySelector('.hinweis').textContent=hinweis;
  info.querySelector('.werte').innerHTML=werte;
  info.querySelector('.crew').textContent=crew;
}

/* --------------------------------------------------------------------------
   KONTEXT""")

ersetze("setInterval(function(){ talkPflege(); kontextPflege(); },90);",
        "setInterval(function(){ talkPflege(); kontextPflege(); infoPflege(); },90);")

io.open(p, 'w', encoding='utf-8').write(s)
print('Tafel eingebaut')
