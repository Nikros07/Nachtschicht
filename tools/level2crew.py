# -*- coding: utf-8 -*-
"""Level 2: die Entscheidung, wen man mitnimmt.

Bisher kamen automatisch alle mit - die Aufgabe war, sie fertig zu machen,
und danach passierte es einfach. Jetzt ist es eine Wahl mit echten Folgen
in beide Richtungen:

  grosse Gruppe  -> im grossen Fight (Level 8) hilft mehr Crew,
                    aber der Tuersteher (Level 4) laesst euch schwerer rein
  kleine Gruppe  -> unauffaellig an der Tuer, dafuer allein im Kampf

Damit ist die Entscheidung nicht "mehr ist besser", sondern ein Tausch.
"""
import io

p = 'level2.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


GESPRAECH = r"""
/* ==========================================================================
   WER KOMMT MIT
   Die Entscheidung des Levels. Sie setzt die Crew fuer die ganze restliche
   Nacht und ein Flag, an dem Level 4 und Level 8 haengen.
   ========================================================================== */
const MITNEHMEN = {
  start:{ wer:'MAX FERDI', text:'Also. Wer kommt jetzt eigentlich mit?',
    wahl:[
      { txt:'Alle. Wir sind eine gruppe.',        geh:'alle' },
      { txt:'Nur wir zwei. Der rest ist zu drauf.', geh:'klein' },
      { txt:'Moritz und der schlaefer. Der am telefon bleibt.', geh:'mittel' },
    ], zeit:10, standard:0 },

  alle:{ wer:'MAX FERDI', text:'Vier mann. Der tuersteher wird uns lieben.',
    tu:{flag:'gruppeGross', crew:'MORITZ', mut:6, mag:['MORITZ',6]},
    geh:'ende' },

  klein:{ wer:'MAX FERDI', text:'Auch gut. Kleiner faellt weniger auf.',
    tu:{flag:'gruppeKlein', crew:'MORITZ', ruf:-3, mag:['MORITZ',-4]},
    geh:'ende' },

  mittel:{ wer:'MAX FERDI', text:'Passt. Der telefoniert eh bis morgen frueh.',
    tu:{crew:'MORITZ', mag:['MORITZ',3]},
    geh:'ende' },

  ende:null,
};

/* Wer in der Gruppe landet, haengt an der Wahl. MORITZ kommt immer mit -
   er ist der Grund, warum man ueberhaupt hier war. */
function fuehreCrewZusammen(){
  speichereCrew('MAX FERDI');
  speichereCrew('MORITZ');
  if(flag('gruppeGross')){
    speichereCrew('DER SCHLAEFER');
    speichereCrew('DER TELEFONIERER');
  } else if(!flag('gruppeKlein')){
    speichereCrew('DER SCHLAEFER');
  }
}
"""

s = ersetze(s, 'function starteCutscene(){', GESPRAECH + '\nfunction starteCutscene(){')

# Nach dem Kampf zuerst die Entscheidung, dann die Cutscene
s = ersetze(s,
    "function starteCutscene(){ S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0;\n"
    "  S.gegner=null; SFX.sieg(); }",

    "function starteCutscene(){\n"
    "  /* Erst die Entscheidung, dann die Cutscene. Vorher kamen automatisch\n"
    "     alle mit - das war keine Wahl, das war eine Ansage. */\n"
    "  S.gegner=null; SFX.sieg();\n"
    "  starteGespraech(MITNEHMEN,'start',()=>{\n"
    "    fuehreCrewZusammen();\n"
    "    S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0;\n"
    "  });\n"
    "}")

# Gespraech in Update und Zeichnen und Eingabe
s = ersetze(s,
    "  if(S.modus==='intro'){ intro(dt); return; }",
    "  if(S.modus==='intro'){ intro(dt); return; }\n"
    "  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }")

s = ersetze(s, "  bildschirme();\n}", "  zeichneGespraech();\n  bildschirme();\n}")

s = ersetze(s, "function druckAktion(){",
    "function druckAktion(){\n"
    "  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){ ensureAudio(); gespraechBestaetigen(); return; }")

s = ersetze(s,
    "  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }",
    "  if(gespraechAktiv()){\n"
    "    if(['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); gespraechWaehle(-1); return; }\n"
    "    if(['ArrowRight','KeyD','ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); gespraechWaehle(1); return; }\n"
    "  }\n"
    "  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }")

s = ersetze(s, "bind('tleft',['touchstart','mousedown'],()=>linksAn=true);",
    "bind('tleft',['touchstart','mousedown'],()=>{ if(gespraechAktiv()){ gespraechWaehle(-1); return; } linksAn=true; });")
s = ersetze(s, "bind('tright',['touchstart','mousedown'],()=>rechtsAn=true);",
    "bind('tright',['touchstart','mousedown'],()=>{ if(gespraechAktiv()){ gespraechWaehle(1); return; } rechtsAn=true; });")

# levelGeschafft soll die Crew nicht mehr allein setzen
s = ersetze(s,
    "function levelGeschafft(){\n  speichereCrew('MORITZ');",
    "function levelGeschafft(){\n"
    "  /* Die Crew steht schon aus der Entscheidung, siehe fuehreCrewZusammen. */\n"
    "  speichereCrew('MORITZ');")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 2: Entscheidung wer mitkommt eingebaut')
