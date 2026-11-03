# -*- coding: utf-8 -*-
"""Level 2: Tiefe in der Wohnung und die Entscheidung, wen man mitnimmt.

Die Wohnung war ein Gang: alle standen auf einer Linie, man lief daran
entlang. Mit Tiefe wird sie ein Raum, durch den man sich bewegt.

Wichtiger noch: am Ende steht eine echte Entscheidung. Bisher kamen
automatisch alle mit. Jetzt waehlt man - und das hat Folgen, die bis zum
Ende der Nacht tragen: eine grosse Gruppe faellt dem Tuersteher auf
(Level 4), eine kleine hat im grossen Fight weniger Unterstuetzung
(Level 8).
"""
import io

p = 'level2.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Engine ----------
s = ersetze(s, '<script src="nacht/stand.js"></script>',
    '<script src="nacht/stand.js"></script>\n'
    '<script src="nacht/welt.js"></script>\n'
    '<script src="nacht/nacht.js"></script>\n'
    '<script src="nacht/dialog.js"></script>')

# ---------- TUNE ----------
s = ersetze(s, "  /* (5) REDEN UND SUCHEN */",
    "  /* (4b) TIEFE - die Wohnung ist ein Raum, kein Gang */\n"
    "  tiefeHinten:   128,\n"
    "  tiefeVorne:    150,\n"
    "  tiefeTempo:    1.0,\n"
    "  tiefeWelt:      52,\n"
    "\n"
    "  /* (5) REDEN UND SUCHEN */")

# ---------- Zustand ----------
s = ersetze(s,
    "    x:40, y:BODEN, vx:0, vy:0, amBoden:true, letzterBoden:0, blick:1, gehPhase:0, schritte:0,",
    "    x:40, y:BODEN, vx:0, vy:0, amBoden:true, letzterBoden:0, blick:1, gehPhase:0, schritte:0,\n"
    "    tiefe:0.5, vt:0, mitnehmen:null,")

s = ersetze(s, "neuesSpiel();\n",
    "neuesSpiel();\nsetzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);\n"
    "/* Die Leute verteilen sich in der Tiefe, sonst steht die Wohnung wieder\n"
    "   auf einer Linie. */\n"
    "LEUTE.forEach((l,i)=>{ l.t=[0.25,0.62,0.8,0.4][i%4]; });\n")

# ---------- Eingabe: hoch und runter gab es hier noch gar nicht ----------
s = ersetze(s,
    "let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false;",
    "let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false;\n"
    "let hochAn=false, runterAn=false;")

s = ersetze(s,
    "  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }",
    "  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); runterAn=true; }")

s = ersetze(s,
    "  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;",
    "  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;")

s = ersetze(s,
    '      <div class="btn" id="tjump">SPR</div><div class="btn" id="thit">E</div>',
    '      <div class="btn" id="tup">&#9650;</div><div class="btn" id="tdown">&#9660;</div>\n'
    '      <div class="btn" id="tjump">SPR</div><div class="btn" id="thit">E</div>')

s = ersetze(s,
    "  #tjump  { right:22%;bottom:8%; width:17%; aspect-ratio:1; }",
    "  #tjump  { right:22%;bottom:8%; width:17%; aspect-ratio:1; }\n"
    "  #tup    { left:12%; bottom:34%; width:15%; aspect-ratio:1; }\n"
    "  #tdown  { left:32%; bottom:34%; width:15%; aspect-ratio:1; }")

s = ersetze(s,
    "bind('tright',['touchend','mouseup','touchcancel'],()=>rechtsAn=false);",
    "bind('tright',['touchend','mouseup','touchcancel'],()=>rechtsAn=false);\n"
    "bind('tup',['touchstart','mousedown'],()=>hochAn=true);\n"
    "bind('tup',['touchend','mouseup','touchcancel'],()=>hochAn=false);\n"
    "bind('tdown',['touchstart','mousedown'],()=>runterAn=true);\n"
    "bind('tdown',['touchend','mouseup','touchcancel'],()=>runterAn=false);")

s = ersetze(s,
    "addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=false; });",
    "addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=hochAn=runterAn=false; });")

# ---------- Bewegung in die Tiefe ----------
s = ersetze(s,
    "  S.x+=S.vx*dt;",
    "  /* Tiefe. Ausgeschrieben statt bewegeTiefe(S,...), weil S.t hier die\n"
    "     Spielzeit ist - der Engine-Aufruf wuerde sie ueberschreiben. */\n"
    "  {\n"
    "    const rt=(runterAn?1:0)-(hochAn?1:0);\n"
    "    const zielVt=rt*TUNE.tiefeTempo;\n"
    "    S.vt += (zielVt-S.vt)*Math.min(1,14*dt);\n"
    "    S.tiefe = Math.max(0,Math.min(1,S.tiefe+S.vt*dt));\n"
    "  }\n"
    "  S.x+=S.vx*dt;")

# ---------- Reichweite beruecksichtigt die Tiefe ----------
s = ersetze(s,
    "    for(const l of LEUTE){ const d=Math.abs(l.x-S.x);",
    "    for(const l of LEUTE){\n"
    "      /* Wer in einer anderen Tiefe steht, ist nicht in Reichweite -\n"
    "         man muss zu den Leuten hin, nicht nur an ihnen vorbei. */\n"
    "      if(Math.abs((l.t||0.5)-S.tiefe)>0.3) continue;\n"
    "      const d=Math.abs(l.x-S.x);")

# ---------- Zeichnen mit Tiefe ----------
s = ersetze(s,
    "  /* Leute */\n"
    "  for(const l of LEUTE){\n"
    "    const rows=SPR[l.spr]||SPR.steh;\n"
    "    const y=l.liegt?BODEN-8:BODEN-rows.length;\n"
    "    outline(rows,l.x-3,y,1,.55);\n"
    "    sprite(rows,l.x-3,y);\n"
    "    const erledigt = l.id==='max' || S.erledigt[l.id==='moritz'?'ausweis':l.id];\n"
    "    text(l.name,l.x+3-textW(l.name)/2,y-16,erledigt?P.gruen:P.dim);\n"
    "    if(erledigt) text('OK',l.x+3-textW('OK')/2,y-9,P.gruen);\n"
    "    else {\n"
    "      const nah=Math.abs(l.x-S.x)<TUNE.reichweite&&S.modus==='spiel'&&!S.reden;\n"
    "      if(nah&&Math.floor(S.t*4)%2===0) text('E',l.x+2,y-9,P.gold);\n"
    "    }\n"
    "  }",

    "  /* Leute und Spieler nach Tiefe sortiert - wer weiter hinten steht,\n"
    "     wird zuerst gezeichnet und damit verdeckt. */\n"
    "  const inTiefe=[];\n"
    "  for(const l of LEUTE){\n"
    "    inTiefe.push({t:l.t||0.5, mal:()=>{\n"
    "      const rows=SPR[l.spr]||SPR.steh;\n"
    "      const fuss=bodenY(l.t||0.5);\n"
    "      const y=l.liegt?fuss-8:fuss-rows.length;\n"
    "      ctx.globalAlpha=.24; ctx.fillStyle='#000';\n"
    "      ctx.fillRect(Math.round(l.x-3),Math.round(fuss),7,1); ctx.globalAlpha=1;\n"
    "      outline(rows,l.x-3,y,1,.55);\n"
    "      sprite(rows,l.x-3,y);\n"
    "      const erledigt = l.id==='max' || S.erledigt[l.id==='moritz'?'ausweis':l.id];\n"
    "      text(l.name,l.x+3-textW(l.name)/2,y-16,erledigt?P.gruen:P.dim);\n"
    "      if(erledigt) text('OK',l.x+3-textW('OK')/2,y-9,P.gruen);\n"
    "      else {\n"
    "        const nah=Math.abs(l.x-S.x)<TUNE.reichweite\n"
    "                 &&Math.abs((l.t||0.5)-S.tiefe)<=0.3\n"
    "                 &&S.modus==='spiel'&&!S.reden;\n"
    "        if(nah&&Math.floor(S.t*4)%2===0) text('E',l.x+2,y-9,P.gold);\n"
    "      }\n"
    "    }});\n"
    "  }")

# Spieler in dieselbe Liste, dann sortiert zeichnen
s = ersetze(s,
    "  /* Spieler */\n"
    "  let rows;\n"
    "  if(S.suchT>0) rows=SPR.suchen;\n"
    "  else if(S.modus==='kampf'&&S.gegner&&S.gegner.zustand==='getroffen') rows=SPR.konter;\n"
    "  else if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;\n"
    "  else if(Math.abs(S.vx)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];\n"
    "  else rows=SPR.steh;\n"
    "  outline(rows,S.x-3,S.y-rows.length,1,.6);\n"
    "  if(S.blick<0) spriteFlip(rows,S.x-3,S.y-rows.length); else sprite(rows,S.x-3,S.y-rows.length);\n"
    "  ctx.globalAlpha=.28; ctx.fillStyle='#000';\n"
    "  ctx.fillRect(Math.round(S.x-3),BODEN,7,1); ctx.globalAlpha=1;",

    "  /* Spieler - kommt in dieselbe Liste, damit die Tiefe stimmt */\n"
    "  inTiefe.push({t:S.tiefe, mal:()=>{\n"
    "    let rows;\n"
    "    if(S.suchT>0) rows=SPR.suchen;\n"
    "    else if(S.modus==='kampf'&&S.gegner&&S.gegner.zustand==='getroffen') rows=SPR.konter;\n"
    "    else if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;\n"
    "    else if(Math.abs(S.vx)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];\n"
    "    else rows=SPR.steh;\n"
    "    /* S.y traegt die Sprunghoehe, die Tiefe verschiebt zusaetzlich. */\n"
    "    const versatz=BODEN-bodenY(S.tiefe);\n"
    "    const y=S.y-versatz-rows.length;\n"
    "    ctx.globalAlpha=.28; ctx.fillStyle='#000';\n"
    "    ctx.fillRect(Math.round(S.x-3),Math.round(bodenY(S.tiefe)),7,1); ctx.globalAlpha=1;\n"
    "    outline(rows,S.x-3,y,1,.6);\n"
    "    if(S.blick<0) spriteFlip(rows,S.x-3,y); else sprite(rows,S.x-3,y);\n"
    "  }});\n"
    "  zeichneNachTiefe(inTiefe);")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 2: Tiefe eingebaut')
