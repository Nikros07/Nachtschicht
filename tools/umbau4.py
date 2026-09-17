# -*- coding: utf-8 -*-
"""Level 4 auf das neue Kampfsystem umbauen.

Einmalig benutztes Umbau-Skript. Liegt im Repo, damit nachvollziehbar
bleibt, was genau am Level geaendert wurde.
"""
import io

p = 'level4.html'
s = io.open(p, encoding='utf-8').read()


def fn_ende(src, i):
    d = 0
    started = False
    for j in range(i, len(src)):
        c = src[j]
        if c == '{':
            d += 1
            started = True
        elif c == '}':
            d -= 1
            if started and d == 0:
                return j + 1
    raise SystemExit('Klammer nicht gefunden')


def ersetze_fn(src, sig, neu):
    i = src.index(sig)
    return src[:i] + neu + src[fn_ende(src, i):]


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- 1. CSS: Knoepfe fuer Bewegung, Block, Rolle ----------
s = ersetze(s,
    "  #thit  { right:6%; bottom:10%; width:22%; aspect-ratio:1; }",
    "  #thit  { right:3%;  bottom:8%;  width:17%; aspect-ratio:1; }\n"
    "  #tblock{ right:22%; bottom:8%;  width:17%; aspect-ratio:1; font-size:8px; }\n"
    "  #trolle{ right:12%; bottom:34%; width:15%; aspect-ratio:1; font-size:8px; }\n"
    "  #tleft { left:3%;   bottom:8%;  width:17%; aspect-ratio:1; }\n"
    "  #tright{ left:22%;  bottom:8%;  width:17%; aspect-ratio:1; }\n"
    "  #tup   { left:12%;  bottom:34%; width:15%; aspect-ratio:1; }\n"
    "  #tdown { left:32%;  bottom:34%; width:15%; aspect-ratio:1; }")

# ---------- 2. HTML: Knoepfe + Engine-Scripts ----------
s = ersetze(s,
    '      <div class="btn" id="thit">E</div>',
    '      <div class="btn" id="tleft">&#9664;</div><div class="btn" id="tright">&#9654;</div>\n'
    '      <div class="btn" id="tup">&#9650;</div><div class="btn" id="tdown">&#9660;</div>\n'
    '      <div class="btn" id="thit">E</div><div class="btn" id="tblock">BLOCK</div>\n'
    '      <div class="btn" id="trolle">ROLLE</div>')

s = ersetze(s,
    '<script src="nacht/stand.js"></script>',
    '<script src="nacht/stand.js"></script>\n'
    '<script src="nacht/welt.js"></script>\n'
    '<script src="nacht/kampf.js"></script>')

# ---------- 3. TUNE erweitern ----------
s = ersetze(s,
    "  /* (4) TEMPO STEIGT MIT JEDEM TREFFER LEICHT AN */\n"
    "  musikBeschleunigung: 0.05,\n"
    "};",
    "  /* (4) TEMPO STEIGT MIT JEDEM TREFFER LEICHT AN */\n"
    "  musikBeschleunigung: 0.05,\n"
    "\n"
    "  /* (5) BEWEGUNG - du stehst nicht mehr fest, vor dem Club ist Platz.\n"
    "     Die Tiefe ist hier kein Schmuck: der Rammstoss laesst sich NUR durch\n"
    "     Ausweichen loesen, blocken hilft dagegen nicht. */\n"
    "  gehTempo:        74,\n"
    "  arenaLinks:      20,\n"
    "  arenaRechtsRand: 28,   // Abstand zum rechten Bildrand\n"
    "  tiefeHinten:    124,   // Boden-Y der hintersten Laufebene\n"
    "  tiefeVorne:     154,\n"
    "\n"
    "  /* (6) DER RAMMSTOSS - unblockbar, kommt ab Phase 2 */\n"
    "  rammeWindup:    0.80,\n"
    "  rammeSchlag:    0.30,\n"
    "  rammeAb:           2,  // ab dieser Phase\n"
    "  rammeTempo:      150,  // er setzt nach, wenn er rammt\n"
    "\n"
    "  /* (7) PHASEN - er wird ungemuetlicher, je naeher er am Boden ist */\n"
    "  phase2Ab:         0.66,  // Anteil Rest-Leben\n"
    "  phase3Ab:         0.33,\n"
    "  phasePauseKuerzer: 0.22, // pro Phase weniger Verschnaufen\n"
    "  phaseWindupKuerzer:0.12, // pro Phase kuerzere Vorwarnung\n"
    "};")

# ---------- 4. Zustand: Spieler und Boss als Kaempfer ----------
s = ersetze_fn(s, 'function neuesSpiel(){',
    "function neuesSpiel(){\n"
    "  const bonus=dennisKampfBonus();\n"
    "  setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne);\n"
    "  S={\n"
    "    modus:'titel', t:0, zeit:0,\n"
    "    maxHp:TUNE.leben+bonus.leben, hp:TUNE.leben+bonus.leben, fensterMult:bonus.fenster,\n"
    "    pegelStart:parseFloat(localStorage.getItem(PEGEL_KEY))||0,\n"
    "    treffer:0, erholungT:0,\n"
    "    ruettel:0, blitz:0,\n"
    "    meldung:'', meldungT:0, hinweis:'', hinweisT:0,\n"
    "    szene:0, szeneT:0, skipT:0,\n"
    "    boss:null, gewonnen:false, faenger:'', neueBestzeit:false,\n"
    "    spieler:null, blockAn:false,\n"
    "  };\n"
    "  S.spieler=kaempfer({ x:96, t:0.5, blick:1, hp:S.maxHp, maxHp:S.maxHp });\n"
    "}")

# ---------- 5. Eingabe: Bewegung, Block, Rolle ----------
s = ersetze(s,
    "addEventListener('keydown',e=>{\n"
    "  if(keys[e.code]) return; keys[e.code]=true;\n"
    "  if(['KeyE','Enter','Space'].includes(e.code)){ e.preventDefault(); aktionGehalten=true; druckAktion(); }\n"
    "  if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); }\n"
    "  if(e.code==='KeyF'){ e.preventDefault(); vollbild(); }\n"
    "  if(e.code==='KeyP'&&(S.modus==='kampf'||S.modus==='pause')) S.modus=S.modus==='kampf'?'pause':'kampf';\n"
    "});\n"
    "addEventListener('keyup',e=>{ keys[e.code]=false;\n"
    "  if(['KeyE','Enter','Space'].includes(e.code)) aktionGehalten=false; });\n"
    "addEventListener('blur',()=>{ aktionGehalten=false; });",

    "let linksAn=false, rechtsAn=false, hochAn=false, runterAn=false, rolleGedrueckt=false;\n"
    "\n"
    "addEventListener('keydown',e=>{\n"
    "  if(keys[e.code]) return; keys[e.code]=true;\n"
    "  if(['KeyE','Enter'].includes(e.code)){ e.preventDefault(); aktionGehalten=true; druckAktion(); }\n"
    "  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }\n"
    "  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); runterAn=true; }\n"
    "  if(['ShiftLeft','ShiftRight'].includes(e.code)){ e.preventDefault(); S.blockAn=true; }\n"
    "  if(e.code==='Space'){ e.preventDefault(); rolleGedrueckt=true; }\n"
    "  if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); }\n"
    "  if(e.code==='KeyF'){ e.preventDefault(); vollbild(); }\n"
    "  if(e.code==='KeyP'&&(S.modus==='kampf'||S.modus==='pause')) S.modus=S.modus==='kampf'?'pause':'kampf';\n"
    "});\n"
    "addEventListener('keyup',e=>{ keys[e.code]=false;\n"
    "  if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;\n"
    "  if(['ArrowLeft','KeyA'].includes(e.code)) linksAn=false;\n"
    "  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;\n"
    "  if(['ShiftLeft','ShiftRight'].includes(e.code)) S.blockAn=false; });\n"
    "addEventListener('blur',()=>{ aktionGehalten=false;\n"
    "  linksAn=rechtsAn=hochAn=runterAn=false; if(S) S.blockAn=false; });")

s = ersetze(s,
    "bind('thit',['touchstart','mousedown'],()=>{ aktionGehalten=true; druckAktion(); });\n"
    "bind('thit',['touchend','mouseup','touchcancel'],()=>aktionGehalten=false);",

    "bind('thit',['touchstart','mousedown'],()=>{ aktionGehalten=true; druckAktion(); });\n"
    "bind('thit',['touchend','mouseup','touchcancel'],()=>aktionGehalten=false);\n"
    "bind('tleft',['touchstart','mousedown'],()=>linksAn=true);\n"
    "bind('tleft',['touchend','mouseup','touchcancel'],()=>linksAn=false);\n"
    "bind('tright',['touchstart','mousedown'],()=>rechtsAn=true);\n"
    "bind('tright',['touchend','mouseup','touchcancel'],()=>rechtsAn=false);\n"
    "bind('tup',['touchstart','mousedown'],()=>hochAn=true);\n"
    "bind('tup',['touchend','mouseup','touchcancel'],()=>hochAn=false);\n"
    "bind('tdown',['touchstart','mousedown'],()=>runterAn=true);\n"
    "bind('tdown',['touchend','mouseup','touchcancel'],()=>runterAn=false);\n"
    "bind('tblock',['touchstart','mousedown'],()=>{ S.blockAn=true; });\n"
    "bind('tblock',['touchend','mouseup','touchcancel'],()=>{ S.blockAn=false; });\n"
    "bind('trolle',['touchstart','mousedown'],()=>{ rolleGedrueckt=true; });")

io.open(p, 'w', encoding='utf-8').write(s)
print('Teil 1 fertig: CSS, HTML, TUNE, Zustand, Eingabe')
