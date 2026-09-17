# -*- coding: utf-8 -*-
"""Zwei Fehler aus dem Spieltest von Level 4 beheben.

1. Der Boss griff unabhaengig von der Entfernung an und schlug ins Leere.
2. Der Konter wurde erst geprueft, wenn der eigene Schlag aktiv wurde -
   dadurch frass die eigene Ausholzeit das Konterfenster auf.
"""
import io


def fn_ende(src, i):
    d = 0
    st = False
    for j in range(i, len(src)):
        c = src[j]
        if c == '{':
            d += 1
            st = True
        elif c == '}':
            d -= 1
            if st and d == 0:
                return j + 1
    raise SystemExit('Klammer nicht gefunden')


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Engine: Konter beim Druecken pruefen ----------
p = 'nacht/kampf.js'
s = io.open(p, encoding='utf-8').read()
s = ersetze(s,
    "/* Der Spieler schlaegt zu. Trifft er den Gegner im Ausholen, ist es ein\n"
    "   Konter - das ist der Kern des ganzen Kampfsystems. */",

    "/* Konterversuch im Moment des DRUECKENS.\n"
    "\n"
    "   Warum nicht erst, wenn der eigene Schlag aktiv wird: der Spieler hat\n"
    "   selbst eine Ausholzeit. Bei einem kurzen Gegner-Jab ist das Fenster\n"
    "   keine 200 ms lang - zieht man davon die eigene Ausholzeit ab, bleiben\n"
    "   ein paar Millisekunden uebrig. Im Spieltest war der Konter dadurch\n"
    "   praktisch unmoeglich. Also zaehlt der Tastendruck, nicht der Treffer.\n"
    "\n"
    "   Liefert true, wenn gekontert wurde. */\n"
    "function konterVersuch(s, g, opt){\n"
    "  opt = opt || {};\n"
    "  if(opt.unblockbar) return false;      // manche Angriffe kontert man nicht\n"
    "  if(s.zustand !== 'frei') return false;\n"
    "  if(!imKonterfenster(g, opt.konterAnteil)) return false;\n"
    "  if(!trifftRaeumlich(s, g, opt.reichweite || KAMPF.reichweite)) return false;\n"
    "  if(!hatAusdauer(s, KAMPF.ausdauerSchlag)) return false;\n"
    "  verbrauche(s, KAMPF.ausdauerSchlag);\n"
    "  g.hp -= (opt.schaden || KAMPF.konterSchaden);\n"
    "  g.zustand = 'getroffen';\n"
    "  g.betaeubt = KAMPF.konterBetaeubung;\n"
    "  g.unverwundbar = 0.1;\n"
    "  /* Der Schlag wird trotzdem gezeigt, trifft aber nicht noch einmal. */\n"
    "  s.zustand = 'schlag'; s.zT = 0; s.trefferGesetzt = true;\n"
    "  kampfStop = KAMPF.hitStop * 1.6;\n"
    "  return true;\n"
    "}\n"
    "\n"
    "/* Der Spieler schlaegt zu. Trifft er den Gegner im Ausholen, ist es ein\n"
    "   Konter - das ist der Kern des ganzen Kampfsystems. */")
io.open(p, 'w', encoding='utf-8').write(s)
print('kampf.js: konterVersuch ergaenzt')

# ---------- Level 4 ----------
p = 'level4.html'
s = io.open(p, encoding='utf-8').read()

# (1) Boss greift nur an, wenn er wirklich dran ist
s = ersetze(s,
    "  b.pauseT-=dt;\n"
    "  if(b.pauseT>0){\n"
    "    /* Er geht auf dich zu und zieht in deine Tiefe - wegrennen allein\n"
    "       loest das Problem nicht. */\n"
    "    const dx=ziel.x-b.x;\n"
    "    if(Math.abs(dx)>b.reichweite*0.75) b.x+=Math.sign(dx)*42*dt;\n"
    "    const dtf=(ziel.t||0)-(b.t||0);\n"
    "    if(Math.abs(dtf)>0.05) bewegeTiefe(b,Math.sign(dtf),dt,TIEFE.tempo*0.6,9);\n"
    "    return;\n"
    "  }\n"
    "  starteAngriff(b,naechsteArt(b));",

    "  b.pauseT-=dt;\n"
    "  /* Er schlaegt erst zu, wenn er auch hinkommt. Im ersten Spieltest hat\n"
    "     er aus 65 Pixeln Entfernung ausgeholt und ins Leere geschlagen -\n"
    "     seine Reichweite sind 19. Deshalb ist Naehe jetzt Bedingung. */\n"
    "  const dx=ziel.x-b.x;\n"
    "  const dtf=(ziel.t||0)-(b.t||0);\n"
    "  const zuWeit=Math.abs(dx)>b.reichweite*0.8||Math.abs(dtf)>KAMPF.tiefeToleranz*0.8;\n"
    "  if(b.pauseT>0||zuWeit){\n"
    "    /* Er geht auf dich zu und zieht in deine Tiefe - wegrennen allein\n"
    "       loest das Problem nicht. */\n"
    "    if(Math.abs(dx)>b.reichweite*0.75) b.x+=Math.sign(dx)*46*dt;\n"
    "    if(Math.abs(dtf)>0.05) bewegeTiefe(b,Math.sign(dtf),dt,TIEFE.tempo*0.6,9);\n"
    "    return;\n"
    "  }\n"
    "  starteAngriff(b,naechsteArt(b));")

# (2) Konter beim Druecken, nicht beim Treffen
s = ersetze(s,
    "  /* ---- Zuschlagen ---- */\n"
    "  while(aktionPuffer.length){\n"
    "    aktionPuffer.shift();\n"
    "    if(S.erholungT>0) continue;\n"
    "    if(!schlage(s)){\n"
    "      if(s.ausdauer<KAMPF.ausdauerSchlag) meldung('AUSSER PUSTE',0.9);\n"
    "    }\n"
    "  }",

    "  /* ---- Zuschlagen ----\n"
    "     Der Konter wird im Moment des Druckens geprueft. Siehe konterVersuch()\n"
    "     in kampf.js - sonst frisst die eigene Ausholzeit das Fenster auf. */\n"
    "  while(aktionPuffer.length){\n"
    "    aktionPuffer.shift();\n"
    "    if(S.erholungT>0) continue;\n"
    "    if(s.ausdauer<KAMPF.ausdauerSchlag){ meldung('AUSSER PUSTE',0.9); continue; }\n"
    "    if(konterVersuch(s,b,{konterAnteil:b.fensterAnteil,schaden:1,\n"
    "                          unblockbar:b.unblockbarJetzt})){\n"
    "      S.treffer++; S.ruettel=5; S.blitz=.5; SFX.klatsch();\n"
    "      meldung(pick(['SITZT','KONTER','GEHT AUFS AUGE']),1.1);\n"
    "      continue;\n"
    "    }\n"
    "    /* Kein Konter. In Reichweite zaehlt es als verfrueht - das ist die\n"
    "       Strafe fuers blinde Draufdruecken. Sonst ein normaler Schlag, der\n"
    "       nur den erwischt, der sich gerade erholt. */\n"
    "    if(trifftRaeumlich(s,b,KAMPF.reichweite)&&b.zustand==='ausholen') fehlschlag();\n"
    "    else schlage(s);\n"
    "  }")

# (3) Treffer-Aufloesung: normaler Schlag trifft nur den, der sich erholt
s = ersetze(s,
    "  if(s.zustand==='schlag'&&!s.trefferGesetzt){\n"
    "    const r=spielerTrifft(s,b,{konterAnteil:b.fensterAnteil});\n"
    "    if(r==='konter'){\n"
    "      S.treffer++; S.ruettel=5; S.blitz=.5; SFX.klatsch();\n"
    "      meldung(pick(['SITZT','KONTER','GEHT AUFS AUGE']),1.1);\n"
    "    } else if(r==='treffer'){\n"
    "      S.treffer++; S.ruettel=3; SFX.klatsch(); meldung('TREFFER',0.9);\n"
    "    } else if(r==='block'||r==='gardebruch'){\n"
    "      meldung(r==='gardebruch'?'DECKUNG WEG':'ER BLOCKT',0.9);\n"
    "    } else if(r===null&&s.zT>0.02){\n"
    "      /* ins Leere geschlagen - die lange Erholung kommt aus kaempferTakt */\n"
    "    }\n"
    "  }",

    "  /* Ein normaler Schlag landet nur, wenn er sich gerade erholt oder\n"
    "     betaeubt ist - sonst deckt er. Das haelt den Konter als Hauptweg. */\n"
    "  if(s.zustand==='schlag'&&!s.trefferGesetzt){\n"
    "    const offen=b.zustand==='erholung'||b.zustand==='getroffen';\n"
    "    const r=loeseTreffer(s,b,{schaden:offen?1:0.001});\n"
    "    if(r==='treffer'&&offen){\n"
    "      S.treffer++; S.ruettel=3; SFX.klatsch(); meldung('NACHGESETZT',0.9);\n"
    "    } else if(r==='block'||r==='gardebruch'){\n"
    "      meldung(r==='gardebruch'?'DECKUNG WEG':'ER BLOCKT',0.9);\n"
    "    } else if(r==='treffer'){\n"
    "      meldung('ER STECKT DAS WEG',0.8);\n"
    "    }\n"
    "  }")

io.open(p, 'w', encoding='utf-8').write(s)
print('level4.html: Reichweiten-Bedingung und Konter-beim-Druecken eingebaut')
