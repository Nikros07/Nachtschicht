# -*- coding: utf-8 -*-
"""Tiefe nur noch dort, wo sie etwas bringt.

Die dritte Achse war am Ende in allen acht Leveln drin. In den ruhigen
Leveln ist sie aber nur ein zusaetzlicher Knopf ohne Gewinn: in der
Wohnung, im Traumflur und im Spaeti gibt es niemanden, an dem man
vorbeimuss, und keinen Kampf, in dem man ausweicht.

  MIT Tiefe:   Level 1 (an den Lehrern vorbei), Level 3 (Sitzreihe statt
               Gang), Level 4 und 8 (Ausweichen im Kampf), Level 5 (durch
               die Menge im Club)
  OHNE Tiefe:  Level 2, 6, 7

Ausgebaut wird nichts. Jedes dieser Level bekommt einen Schalter
TIEFE_AN=false, und der macht drei Dinge:
  - das Tiefenband wird flach (hinten = vorne = BODEN), damit bodenY()
    ueberall denselben Wert liefert und keine Figur mehr versetzt steht
  - die Eingabe hoch/runter bewegt nichts mehr
  - Reichweiten fragen die Tiefe nicht mehr ab

Die Tiefe der Objekte bleibt als ZEICHENREIHENFOLGE erhalten - wer eine
kleinere Tiefe hat, wird zuerst gemalt und steht hinten. Das kostet nichts
und sieht besser aus als eine starre Reihenfolge.
"""
import io

SCHALTER = """
/* ==========================================================================
   KEINE TIEFE IN DIESEM LEVEL
   Hier gibt es niemanden, an dem man vorbeimuss, und keinen Kampf, in dem
   man ausweicht - die dritte Achse waere nur ein Knopf mehr. Die Zahlen im
   TUNE-Block bleiben stehen: sie regeln jetzt nur noch, wer beim Zeichnen
   vor wem steht.
   ========================================================================== */
const TIEFE_AN=false;
"""


def patch(datei, paare):
    s = io.open(datei, encoding='utf-8').read()
    for alt, neu in paare:
        assert s.count(alt) == 1, (datei, alt[:70], s.count(alt))
        s = s.replace(alt, neu)
    io.open(datei, 'w', encoding='utf-8').write(s)
    print(datei, 'ok')


# ------------------------------------------------------------------ Level 2 --
patch('level2.html', [
    ("setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);",
     SCHALTER +
     "setzeTiefenband(TIEFE_AN?TUNE.tiefeHinten:BODEN,TIEFE_AN?TUNE.tiefeVorne:BODEN,TUNE.tiefeWelt);"),
    ("    const rt=(runterAn?1:0)-(hochAn?1:0);\n    const zielVt=rt*TUNE.tiefeTempo;",
     "    const rt=TIEFE_AN?((runterAn?1:0)-(hochAn?1:0)):0;\n    const zielVt=rt*TUNE.tiefeTempo;"),
    ("      if(Math.abs((l.t||0.5)-S.tiefe)>0.3) continue;",
     "      if(TIEFE_AN&&Math.abs((l.t||0.5)-S.tiefe)>0.3) continue;"),
    ("        const nah=Math.abs(l.x-S.x)<TUNE.reichweite\n"
     "                 &&Math.abs((l.t||0.5)-S.tiefe)<=0.3\n"
     "                 &&S.modus==='spiel'&&!S.reden;",
     "        const nah=Math.abs(l.x-S.x)<TUNE.reichweite\n"
     "                 &&(!TIEFE_AN||Math.abs((l.t||0.5)-S.tiefe)<=0.3)\n"
     "                 &&S.modus==='spiel'&&!S.reden;"),
])

# ------------------------------------------------------------------ Level 6 --
patch('level6.html', [
    ("setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);",
     SCHALTER +
     "setzeTiefenband(TIEFE_AN?TUNE.tiefeHinten:BODEN,TIEFE_AN?TUNE.tiefeVorne:BODEN,TUNE.tiefeWelt);"),
    ("  const rt=(runterAn?1:0)-(hochAn?1:0);\n  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);",
     "  const rt=TIEFE_AN?((runterAn?1:0)-(hochAn?1:0)):0;\n  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);"),
    ("    if(Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;",
     "    if(TIEFE_AN&&Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;"),
])

# ------------------------------------------------------------------ Level 7 --
patch('level7.html', [
    ("setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);",
     SCHALTER +
     "setzeTiefenband(TIEFE_AN?TUNE.tiefeHinten:BODEN,TIEFE_AN?TUNE.tiefeVorne:BODEN,TUNE.tiefeWelt);"),
    ("  const rt=(runterAn?1:0)-(hochAn?1:0);\n  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);",
     "  const rt=TIEFE_AN?((runterAn?1:0)-(hochAn?1:0)):0;\n  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);"),
    ("    if(Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;",
     "    if(TIEFE_AN&&Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;"),
])
