# -*- coding: utf-8 -*-
"""Level 3: aus dem Gang wird ein Bus.

Vorher war der Bus ein Strich: laufen, an einem Sitz E druecken, warten bis
der Kontrolleur weg ist, weiter. Drei Kontrolleure, fuenf Verstecke, ein
Verdachtsbalken. Das traegt zwei Minuten.

Was dazukommt - und warum:

TIEFE. Der Bus hat jetzt eine Sitzreihe hinten und einen Gang vorne. Die
Kontrolleure laufen im Gang und sehen in einem Kegel nach vorn. Wer sich in
die Sitzreihe druckt, kommt an ihnen vorbei, ohne sich zu verstecken. Damit
ist Ausweichen eine Bewegung statt eines Knopfdrucks.

DREI WAGGONS statt einem. Sie sehen unterschiedlich aus und haben
unterschiedliche Bewohner. Durch die Uebergaenge sieht man den naechsten
schon, bevor man drin ist.

FAHRGAESTE, mit denen man reden kann. Jeder hat einen eigenen kleinen Baum
und jeder loest etwas aus:

  - DER BETRUNKENE macht eine Szene, wenn man ihn anstachelt. Alle
    Kontrolleure lassen alles stehen und gehen hin. Das ist das grosse
    Zeitfenster - aber es kostet Ruf, weil man jemanden vorschickt.
  - DIE FRAU MIT DEM HUND verraet, wo der naechste Kontrolleur steht.
    Umsonst, kostet nur Zeit.
  - JONAS sitzt hinten und kommt mit, wenn man ihn ueberzeugt. Er ist der
    Grund, warum in diesem Level ueberhaupt jemand dazukommt.

DER TICKETAUTOMAT. Wer genug Geld hat, kauft sich frei - Kontrolleure sind
dann kein Thema mehr. Dafuer fehlt das Geld spaeter an der Tuer und an der
Bar. Das ist absichtlich ein Tausch und keine Abkuerzung.

DIE NOTBREMSE. Der Notausgang aus jeder Lage: der Bus haelt, alle
Kontrolleure rennen nach vorn. Kostet ordentlich Ruf und haelt die Nacht
auf - man kommt spaeter an, und das merkt Level 4.
"""
import io

p = 'level3.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu):
    global s
    assert alt in s, 'nicht gefunden: ' + alt[:80]
    s = s.replace(alt, neu, 1)


# ---------------------------------------------------------------- Engine ----
ersetze('<script src="nacht/stand.js"></script>',
        '<script src="nacht/stand.js"></script>\n'
        '<script src="nacht/welt.js"></script>\n'
        '<script src="nacht/nacht.js"></script>\n'
        '<script src="nacht/dialog.js"></script>')

# ------------------------------------------------------------------ TUNE ----
ersetze("""  /* (5) DAS RUCKELN - der Bus faehrt nicht immer ruhig */""",
"""  /* (4b) TIEFE - der Bus ist ein Raum, kein Gang.
     Die Kontrolleure laufen im Gang (gangTiefe) und sehen nach vorn. Wer
     sich in die Sitzreihe druckt (sitzTiefe), kommt an ihnen vorbei -
     vorausgesetzt, der Kegel greift seitlich nicht ueber das ganze Band.
     Dafuer sorgt TIEFE.kegelMax in welt.js. */
  tiefeHinten:   116,    // Boden-Y der Sitzreihe
  tiefeVorne:    148,    // Boden-Y der Gangkante
  tiefeWelt:      46,    // wie tief das Band in Weltmass ist
  tiefeTempo:    1.05,
  kegelOeffnung: 0.42,
  sitzTiefe:     0.26,   // so weit hinten muss man sein, um durchzukommen
  gangTiefe:     0.72,   // dort patrouillieren die Kontrolleure

  /* (4c) DREI WAGGONS. Die Grenzen sind die Durchgaenge. */
  waggonGrenzen: [252, 496],

  /* (4d) REDEN, KAUFEN, BREMSEN */
  redeReichweite:  16,
  ticketPreis:      9,   // Euro - das Geld fehlt danach an der Tuer
  ablenkDauer:      8,   // so lange bindet eine Szene die Kontrolleure
  notbremsRuf:    -14,   // was die Notbremse kostet
  notbremsAblenk:  14,   // dafuer laufen alle nach vorn

  /* (5) DAS RUCKELN - der Bus faehrt nicht immer ruhig */""")

# --------------------------------------------------------------- Sprites ----
ersetze("""  /* Einrichtung im Bus */""",
"""  /* Fahrgaeste - drei Silhouetten, damit man sie auseinanderhaelt */
  sitzend:  ['..hhh..','.hsssh.','.sssss.','..ggg..','.ggggg.','..p.p..','..k.k..'],
  breit:    ['..hhh..','.hsssh.','.sssss.','.vvvvv.','vvvvvvv','.vv.vv.','.kk.kk.'],
  schmal:   ['..hhh..','.hsssh.','.sssss.','..ccc..','.ccccc.','..p.p..','..k.k..'],
  automat:  ['dddddd','duuuud','duuuud','dggggd','dddddd','d....d','dddddd'],
  bremse:   ['.rrrr.','rrrrrr','.r..r.','.r..r.','.dddd.'],

  /* Einrichtung im Bus */""")

# --------------------------------------------- Fahrgaeste, Dinge, Baeume ----
ersetze("""/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""",
r"""/* ==========================================================================
   WER SONST NOCH IM BUS SITZT
   Jeder Eintrag ist ein Ort im Raum (x und Tiefe) plus ein Gespraechsbaum.
   Die Baeume stehen weiter unten - hier steht nur, wer wo sitzt.
   ========================================================================== */
const FAHRGAESTE=[
  { id:'automat',     name:'AUTOMAT',   x:  86, t:0.14, spr:'automat', ding:true },
  { id:'betrunkener', name:'DER LAUTE', x: 196, t:0.30, spr:'breit'   },
  { id:'frau',        name:'DIE FRAU',  x: 332, t:0.24, spr:'sitzend' },
  { id:'notbremse',   name:'NOTBREMSE', x: 428, t:0.10, spr:'bremse', ding:true },
  { id:'jonas',       name:'JONAS',     x: 588, t:0.28, spr:'schmal'  },
];

/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""")

# ------------------------------------------------------------ Zustand ----
ersetze("""    busZeit:0, verdacht:0, versteckt:null, hp:TUNE.leben, unverwundbarT:0, warnGespielt:false,""",
"""    tiefe:TUNE.gangTiefe, vt:0,
    ablenkT:0, ticket:flag('busTicket'), geredet:{}, verrat:0,
    busZeit:0, verdacht:0, versteckt:null, hp:TUNE.leben, unverwundbarT:0, warnGespielt:false,""")

ersetze("""neuesSpiel();

/* ==========================================================================
   EINGABE""",
"""neuesSpiel();
setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);

/* ==========================================================================
   EINGABE""")

# ---------------------------------------------- Kontrolleure mit Tiefe ----
ersetze("""  return [
    { x:150, minX:70,  maxX:230, blick:1,  pauseT:0 },
    { x:375, minX:290, maxX:460, blick:-1, pauseT:0 },
    { x:590, minX:520, maxX:660, blick:1,  pauseT:0 },
  ];""",
"""  /* Jeder haelt seinen Waggon. Die Tiefe streut leicht, damit nicht alle
     auf derselben Linie stehen und dieselbe Luecke lassen. */
  return [
    { x:150, minX:70,  maxX:230, blick:1,  pauseT:0, t:0.70, heim:150 },
    { x:375, minX:290, maxX:460, blick:-1, pauseT:0, t:0.76, heim:375 },
    { x:590, minX:520, maxX:660, blick:1,  pauseT:0, t:0.66, heim:590 },
  ];""")

# ---------------------------------------------------------- Eingabe ----
ersetze("""let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false;""",
"""let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false;
let hochAn=false, runterAn=false;""")

ersetze("""  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }
  if(e.code==='Space'){ e.preventDefault(); druckSprung(); }""",
"""  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }
  if(['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }
  if(['ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); runterAn=true; }
  if(e.code==='Space'){ e.preventDefault(); druckSprung(); }""")

ersetze("""  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
  if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;""",
"""  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;
  if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;""")

ersetze("""addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=false; });""",
"""addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=hochAn=runterAn=false; });""")

# Gespraechssteuerung auf der Tastatur
ersetze("""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }""",
"""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(gespraechAktiv()){
    if(['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); gespraechWaehle(-1); return; }
    if(['ArrowRight','KeyD','ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); gespraechWaehle(1); return; }
  }
  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }""")

ersetze("""function druckAktion(){
  ensureAudio();""",
"""function druckAktion(){
  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){ ensureAudio(); gespraechBestaetigen(); return; }
  ensureAudio();""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 3: Grundgeruest fuer Tiefe und Fahrgaeste eingebaut')
