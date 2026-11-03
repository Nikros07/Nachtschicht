# -*- coding: utf-8 -*-
"""Level 1 bekommt Story: das eingezogene Handy und ein echtes Gespraech.

Zwei Sachen:

1. DAS HANDY. Es wurde dir abgenommen und liegt im Lehrerzimmer. Optional -
   man kann ohne rausgehen. Aber ohne Handy gibt es die ganze restliche
   Nacht keine Nachrichten von den Jungs, und das merkt man in jedem
   folgenden Level. Ein zweites Ziel, das nicht im Weg steht.

2. DER HAUSMEISTER laesst sich ansprechen. Bisher gab es genau einen Weg an
   seinen Schluessel: ablenken und klauen. Jetzt kann man es auch versuchen,
   indem man mit ihm redet - mit Antworten, die an Mut, Ruf und Crew haengen.
   Das ist der erste Einsatz von dialog.js in einem echten Level.
"""
import io

p = 'index.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Engine: Gespraeche und Werte ----------
s = ersetze(s, '<script src="nacht/welt.js"></script>',
    '<script src="nacht/welt.js"></script>\n'
    '<script src="nacht/nacht.js"></script>\n'
    '<script src="nacht/dialog.js"></script>')

# ---------- TUNE ----------
s = ersetze(s, "  tuerTiefe:     0.42,   // so weit hinten muss man fuer Tuer und Spind",
    "  tuerTiefe:     0.42,   // so weit hinten muss man fuer Tuer und Spind\n"
    "\n"
    "  /* (5c) DAS HANDY - liegt eingezogen im Lehrerzimmer. Freiwillig, aber\n"
    "     ohne das bleibt die restliche Nacht stumm. */\n"
    "  handyRaum:  'LEHRERZIMMER',\n"
    "  handyMoebel:      1,   // welches Moebel im Raum (0-basiert)")

# ---------- Zustand ----------
s = ersetze(s, "  S.tiefe=0.18; S.vt=0;",
    "  S.tiefe=0.18; S.vt=0;\n"
    "  S.handyGeholt=false;\n"
    "  S.handyRaumNr=RAEUME.findIndex(r=>r.name===TUNE.handyRaum);")

# ---------- Fund: das Handy ----------
s = ersetze(s,
    "      if(S.raum===S.schluesselRaum && S.suchZiel===S.schluesselMoebel && !S.hatSchluessel){",

    "      if(S.raum===S.handyRaumNr && S.suchZiel===TUNE.handyMoebel && !S.handyGeholt){\n"
    "        /* Dein eingezogenes Handy. Rein optional - aber ohne das bleibt\n"
    "           die restliche Nacht ohne Nachrichten, siehe setzeFlag unten. */\n"
    "        S.handyGeholt=true; SFX.fund(); S.blitz=1;\n"
    "        setzeFlag('handyZurueck');\n"
    "        aendereWert('ruf',5);\n"
    "        meldung('DEIN HANDY - EINGEZOGEN UND WIEDER DA',2.6);\n"
    "        zeigeHinweis('JETZT SCHREIBEN DIR DIE JUNGS WIEDER',3);\n"
    "      } else if(S.raum===S.schluesselRaum && S.suchZiel===S.schluesselMoebel && !S.hatSchluessel){")

# ---------- Gespraech mit dem Hausmeister ----------
GESPRAECH = r"""
/* ==========================================================================
   REDEN STATT KLAUEN
   Der Hausmeister war bisher ein Hindernis mit genau einer Loesung: ablenken
   und zugreifen. Wer ihn anspricht, hat jetzt einen zweiten Weg - und der
   haengt daran, wie die Nacht bisher lief (Mut, Ruf, wer dabei ist).
   ========================================================================== */
const HAUSMEISTER_GESPRAECH = {
  start:{ wer:'HAUSMEISTER', text:'Was machst du hier? Schule ist seit zwei stunden aus.',
    wahl:[
      { txt:'Ich hab mein handy vergessen.',            geh:'handy' },
      { txt:'Ich bin beim nachsitzen eingepennt.',      geh:'ehrlich' },
      { txt:'Machen sie einfach die tuer auf.',         wenn:{mut:45}, geh:'frech' },
      { txt:'Max ferdi laesst gruessen.',               wenn:{crew:'MAX FERDI'}, geh:'ferdi' },
    ], zeit:9, standard:1 },

  handy:{ wer:'HAUSMEISTER', text:'Handys liegen im lehrerzimmer. Zweiter stock, und beeil dich.',
    tu:{ruf:2}, geh:'ende' },

  ehrlich:{ wer:'HAUSMEISTER', text:'Eingepennt. Beim nachsitzen. Das muss man erstmal schaffen.',
    wahl:[
      { txt:'War ne lange woche.',        geh:'mitleid', tu:{ruf:3} },
      { txt:'Passiert den besten.',       geh:'genervt', tu:{mut:3} },
    ], zeit:7, standard:0 },

  mitleid:{ wer:'HAUSMEISTER', text:'Kenn ich. Komm, ich lass dich raus - aber du hast mich nie gesehen.',
    tu:{flag:'hausmeisterHilft', ruf:6, mag:['HAUSMEISTER',10]}, geh:'schluessel' },

  genervt:{ wer:'HAUSMEISTER', text:'Bei den besten. Klar. Ich hab zu tun.',
    tu:{mag:['HAUSMEISTER',-5]}, geh:'ende' },

  frech:{ wer:'HAUSMEISTER', text:'Ich mach hier gar nichts auf. Verschwinde.',
    tu:{ruf:-4, mag:['HAUSMEISTER',-12]}, geh:'ende' },

  ferdi:{ wer:'HAUSMEISTER', text:'Der ferdi. Der ist heute schon durchs fenster raus. Ihr seid mir welche.',
    wahl:[
      { txt:'Dann lassen sie mich auch raus.', geh:'mitleid' },
      { txt:'Ich sag ihm schoene gruesse.',    geh:'ende', tu:{ruf:2} },
    ], zeit:7, standard:1 },

  schluessel:{ wer:'HAUSMEISTER', text:'Der zweitschluessel haengt am haken. Nimm ihn und tu ihn zurueck.',
    geh:'ende' },

  ende:null,
};

function starteHausmeisterGespraech(hm){
  S.redenMit=hm;
  starteGespraech(HAUSMEISTER_GESPRAECH,'start',()=>{
    S.redenMit=null;
    /* Wer ihn ueberzeugt hat, bekommt den Schluessel ohne Klauerei. */
    if(flag('hausmeisterHilft')&&hm.hatSchluessel){
      hm.hatSchluessel=false; S.hatSchluessel=true;
      SFX.fund(); S.blitz=1;
      meldung('ER GIBT DIR DEN SCHLUESSEL',2.4);
      zeigeHinweis('RAUS HIER - ERDGESCHOSS',3);
    }
  });
}
"""

s = ersetze(s, 'function gefangen(L){', GESPRAECH + '\nfunction gefangen(L){')

# Zustandsfeld
s = ersetze(s, "  S.handyGeholt=false;", "  S.handyGeholt=false; S.redenMit=null;")

# Hausmeister ansprechen statt nur klauen
s = ersetze(s,
    "    } else if(hm){\n"
    "      /* Nur wenn er abgelenkt ist, kommst du an den Schluessel. */\n"
    "      if(hm.suchtX!=null||hm.abgelenkt>0){",

    "    } else if(hm){\n"
    "      /* Zwei Wege: ablenken und zugreifen - oder ihn ansprechen.\n"
    "         Wer ihn anschaut, waehrend er hinschaut, redet eben. */\n"
    "      if(!(hm.suchtX!=null||hm.abgelenkt>0)){ starteHausmeisterGespraech(hm); }\n"
    "      else if(hm.suchtX!=null||hm.abgelenkt>0){")

# Gespraech in update und draw einhaengen
s = ersetze(s,
    "  if(S.modus==='intro'){ intro(dt); return; }",
    "  if(S.modus==='intro'){ intro(dt); return; }\n"
    "  /* Laeuft ein Gespraech, steht der Rest still - sonst laeuft dir ein\n"
    "     Lehrer waehrend der Antwortauswahl in den Ruecken. */\n"
    "  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }")

s = ersetze(s,
    "  if(S.modus==='intro'){ zeichneIntro(); return; }",
    "  if(S.modus==='intro'){ zeichneIntro(); return; }")

io.open(p, 'w', encoding='utf-8').write(s)
print('Handy als zweites Ziel und Hausmeister-Gespraech eingebaut')
