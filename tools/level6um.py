# -*- coding: utf-8 -*-
"""Level 6: die Afterhour wird ein Traum mit Regeln.

Vorher: ein Flur, drei Moebel, drei Saetze, Lea am Ende - eine Minute.

Jetzt:
- ERSCHOEPFUNG ist der Gegner. Die Kondition faellt dauernd, schneller mit
  Pegel. Auf Sofas ruht man sich aus. Bei null knickt man weg und wacht
  am letzten Sofa wieder auf. Der Wert geht an Level 7 und 8 weiter.
- TRAUMLOGIK mit festen Regeln: der Raum 101 wiederholt sich, bis man
  weiss, was im Chemieraum passiert ist. Eine Tuer, die "RAUS" verspricht,
  fuehrt an den Anfang zurueck.
- DIE NACHT ALS ECHO. Moritz, das Maedchen aus dem Club (oder die, die nein
  gesagt hat), Marvin. Jeder fragt etwas, und die Antworten zaehlen fuer
  das Ende. Wer keinen Erfolg im Club hatte, trifft ein anderes Echo.
- Lea verraet am Ende, wo man wirklich ist.
- Tiefe wie ueberall: Moebel und Tueren an der Rueckwand.
"""
import io, re

p = 'level6.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


def funktion(name, neu):
    global s
    start = s.index('\nfunction ' + name + '(') + 1
    ende = s.index('\n}\n', start) + 3
    s = s[:start] + neu.strip('\n') + '\n' + s[ende:]


# ---------------------------------------------------------------- Engine ----
s, n = re.subn(r'(<script src="nacht/stand\.js\?v=([0-9]+)"></script>)',
               lambda m: m.group(1) + ''.join(
                   '\n<script src="nacht/%s.js?v=%s"></script>' % (x, m.group(2))
                   for x in ('welt', 'nacht', 'dialog')), s)
assert n == 1

# ------------------------------------------------------------------ TUNE ----
ersetze("""  /* (5) SUCHEN UND REDEN */
  reichweite:      15,
  suchDauer:        0.6,""",
"""  /* (5) SUCHEN UND REDEN */
  reichweite:      15,
  suchDauer:        0.6,
  redeTiefe:       0.32,

  /* (6) TIEFE */
  tiefeHinten:    120,
  tiefeVorne:     152,
  tiefeWelt:       46,
  tiefeTempo:     1.0,

  /* (7) ERSCHOEPFUNG - der eigentliche Gegner in diesem Level.
     Gemessen am Weg: 1600 Pixel bei ~90 px/s sind 18 Sekunden reines
     Laufen, dazu die Schleife im Raum 101 und die Wege zurueck. Mit diesen
     Werten reicht eine volle Kondition knapp fuer eine Strecke - wer
     troedelt oder voll ist, braucht die Sofas. */
  konditionAbbau:   1.0,   // pro Sekunde, immer
  konditionPegel:   1.4,   // pro Sekunde zusaetzlich bei Pegel 100
  konditionRennen:  0.5,   // zusaetzlich bei vollem Tempo
  sofaErholung:    24,     // pro Sekunde auf dem Sofa
  aufwachenMit:    45,     // Kondition nach dem Wegknicken
  schwereAb:       30,     // darunter wird man langsamer und das Bild zieht zu""")

# ---------------------------------------------------------------- Sprites ----
ersetze("""  tafel: ['zzzzzzzzzz','zjjjjjjjjz','zj.w..w.jz','zjjjjjjjjz','zzzzzzzzzz'],""",
"""  tafel: ['zzzzzzzzzz','zjjjjjjjjz','zj.w..w.jz','zjjjjjjjjz','zzzzzzzzzz'],
  sofa:  ['.bbbbbbbbbb.','bddddddddddb','bddddddddddb','bbbbbbbbbbbb','b..........b'],
  wand:  ['zz','zz','zz','zz','zz','zz','zz','zz','zz','zz','zz','zz','zz','zz'],""")

# ------------------------------------------------------------------ Welt ----
alt = s[s.index('const LEVEL_B=900;'):s.index("const LEA_FERTIG=")]
alt = s[s.index('const LEVEL_B=900;'):s.index('\n', s.index("const LEA_FERTIG=")) + 1]
s = s.replace(alt, r"""const LEVEL_B=1600;
const ORTE=[
  { von:0,    bis:140,  name:'FLUR',        wand:'#241c30', boden:'#170f20' },
  { von:140,  bis:340,  name:'RAUM 101',    wand:'#2c2440', boden:'#1c1730' },
  { von:340,  bis:520,  name:'CHEMIE',      wand:'#1d3028', boden:'#12201a' },
  { von:520,  bis:700,  name:'RAUM 101',    wand:'#332a4a', boden:'#221c38', wiederholt:true },
  { von:700,  bis:880,  name:'TURNHALLE',   wand:'#2a2030', boden:'#1d1624' },
  { von:880,  bis:1080, name:'BIBLIOTHEK',  wand:'#302038', boden:'#1f1526' },
  { von:1080, bis:1260, name:'KELLER',      wand:'#120e16', boden:'#0c0910' },
  { von:1260, bis:1440, name:'EINE KUECHE', wand:'#2e2a22', boden:'#201c16' },
  { von:1440, bis:1600, name:'FLUR',        wand:'#241c30', boden:'#170f20' },
];
const ortBei=x=>ORTE.find(o=>x>=o.von&&x<o.bis)||ORTE[0];
const GLITCH_NAMEN=['RAUM ???','????','FALSCH.','DAS HIER NICHT.'];
const raumName=o=>Math.sin(S.t*3+o.von)>0.985?pick(GLITCH_NAMEN):o.name;

/* Erinnerungen zum Finden - feste Plaetze, keine Zufallssuche. Ein
   surreales Level, das ZUSAETZLICH random ist, waere nicht mehr lesbar. */
const DINGE=[
  { x:200, t:0.10, art:'spind',      moebel:'spind' },
  { x:430, t:0.14, art:'labortisch', moebel:'tisch' },
  { x:960, t:0.08, art:'buecher',    moebel:'regal' },
];
const ERINNERUNGEN={
  spind:      'DU UND MORITZ. ZU SPAET WIE IMMER.',
  labortisch: 'DER FEUERALARM. DU WARST DAS.',
  buecher:    'HIER HAST DU MAL GESCHLAFEN. IM UNTERRICHT.',
};
const AUFGABEN=[
  { id:'spind',      text:'ERINNERUNG: RAUM 101' },
  { id:'labortisch', text:'ERINNERUNG: CHEMIE' },
  { id:'buecher',    text:'ERINNERUNG: BIBLIOTHEK' },
];
const alleErinnerungen=()=>AUFGABEN.every(a=>S.erledigt[a.id]);

/* Sofas: der einzige Ort, an dem die Erschoepfung zurueckgeht - und der
   Punkt, an dem man nach dem Wegknicken aufwacht. */
const SOFAS=[ { x:70, t:0.16 }, { x:790, t:0.12 }, { x:1340, t:0.18 } ];

/* TRAUMLOGIK. Eine Regel, die man lernen kann: am Ende des zweiten
   Raum 101 steht eine Wand. Wer weitergeht, steht wieder am Anfang
   desselben Raums - bis man weiss, was im Chemieraum passiert ist. */
const SCHLEIFE={ x:698, zurueck:540, braucht:'labortisch' };

/* Tueren an der Rueckwand. Eine davon luegt. */
const TUEREN=[
  { x:1056, t:0.05, name:'RAUS', ziel:100,  luegt:true },
  { x:1420, t:0.05, name:'FLUR', ziel:1470, luegt:false },
];

/* Echos - Figuren aus Level 1, haengengeblieben. Atmosphaere. */
const ECHOS=[
  { id:'hausmeister', x:40,   t:0.55, name:'ECHO: HAUSMEISTER', tint:'#6b8a5d',
    zeilen:['HAST DU MEINEN SCHLUESSEL GESEHEN.','HAST DU MEINEN SCHLUESSEL GESEHEN.'] },
  { id:'lehrer',      x:180,  t:0.60, name:'ECHO: LEHRER',      tint:'#5d6b8a',
    zeilen:['SETZEN.','SETZEN.','SETZEN.'] },
  { id:'direktor',    x:600,  t:0.50, name:'ECHO: DIREKTOR',    tint:'#8a5d6b',
    zeilen:['ICH KOMME GLEICH VORBEI.','ICH KOMME GLEICH VORBEI.'] },
];

/* Die Nacht als Echo. Wer auftaucht und was er fragt, haengt an dem, was
   heute passiert ist - die Flags aus Level 2 bis 5. Die Antworten gehen
   ins Ende der Nacht ein. */
const NACHTECHOS=[
  { id:'moritz', x:270,  t:0.45, name:'MORITZ', tint:'#7fd1b0' },
  { id:'sie',    x:1000, t:0.50, name:'',       tint:'#ff9fc8' },
  { id:'marvin', x:1170, t:0.40, name:'',       tint:'#9a8ab8' },
];
const LEA={ x:1560, t:0.40, name:'LEA' };
""")

# ------------------------------------------------------------ Gespraeche ----
BAEUME = r"""
/* ==========================================================================
   DIE GESPRAECHE IM TRAUM
   ========================================================================== */
/* Ein Baum aus einfachen Zeilen - fuer die alten Echos, die immer nur
   denselben Satz sagen. */
function zeilenBaum(wer,zeilen){
  const b={};
  zeilen.forEach((z,i)=>{ b['z'+i]={ wer, text:z, geh:i+1<zeilen.length?'z'+(i+1):'@ende' }; });
  b.start=b.z0; return b;
}

const MORITZ_ECHO = {
  start:{ wer:'MORITZ', text:'Hast du mich heute eigentlich gefragt, ob ich mitwill? Oder einfach entschieden?',
    wahl:[
      { txt:'Ich hab alle mitgenommen. Das war fuer dich.', wenn:{flag:'gruppeGross'}, geh:'gut', tu:{mag:['MORITZ',6]} },
      { txt:'Ich wollte nur mit dir los. Nicht mit allen.', wenn:{flag:'gruppeKlein'}, geh:'gut', tu:{mag:['MORITZ',6]} },
      { txt:'Ehrlich? Ich hab nicht drueber nachgedacht.',  geh:'ehrlich' },
      { txt:'Du warst doch dabei. Was willst du.',          geh:'kalt', tu:{mag:['MORITZ',-6]} },
    ], zeit:10, standard:2 },
  gut:{ wer:'MORITZ', text:'Okay. Dann ist ja gut. Ich pass auf dich auf, wenn du gleich umkippst.',
    tu:{flag:'traumMoritz'}, geh:'@kraft' },
  ehrlich:{ wer:'MORITZ', text:'Wenigstens ehrlich. Das warst du schon immer.',
    tu:{flag:'traumMoritz', mag:['MORITZ',2]}, geh:'@kraft' },
  kalt:{ wer:'MORITZ', text:'Alles klar.', geh:'@ende' },
};

/* Sie - die aus dem Club. Welche es ist, steht im Speicherstand. */
function sieEcho(){
  const ja=['mia','sophie','kira'].find(n=>flag('clubJa_'+n)||flag('schreibt_'+n));
  if(ja){
    const name=ja.toUpperCase();
    return { name, baum:{
      start:{ wer:name, text:'Schreibst du mir morgen? Oder war das nur heute Nacht?',
        wahl:[
          { txt:'Ich schreib dir. Versprochen.',          geh:'ja',   tu:{flag:'versprochen_'+ja, mag:[name,6]} },
          { txt:'Mal sehen.',                              geh:'mal' },
          { txt:'Ich weiss nicht mal, ob ich mich erinnere.', geh:'nein', tu:{mut:-3} },
        ], zeit:10, standard:1 },
      ja:{ wer:name, text:'Dann halt dich dran.', geh:'@kraft' },
      mal:{ wer:name, text:'Mal sehen. Klar.', geh:'@ende' },
      nein:{ wer:name, text:'Dann erinner dich wenigstens daran.', geh:'@ende' },
    }};
  }
  const abfuhr=['mia','sophie','kira'].some(n=>beziehung(n.toUpperCase())<0);
  if(abfuhr) return { name:'DIE, DIE NEIN GESAGT HAT', baum:{
    start:{ wer:'SIE', text:'Du hast dich nicht getraut. Und dann zu sehr.',
      wahl:[
        { txt:'Ja. War nicht mein Abend.',       geh:'ok', tu:{mut:5, flag:'traumEinsicht'} },
        { txt:'Du hast mich nicht verstanden.',  geh:'@ende' },
      ], zeit:9, standard:1 },
    ok:{ wer:'SIE', text:'Naechstes Mal. Ehrlich gemeint.', geh:'@kraft' },
  }};
  return { name:'NIEMAND', baum:{
    start:{ wer:'NIEMAND', text:'Du hast mit keinem geredet. Wolltest du ueberhaupt?',
      wahl:[
        { txt:'Naechstes Mal.',           geh:'ok', tu:{mut:3} },
        { txt:'Ich war mit den Jungs da.', geh:'@ende' },
      ], zeit:9, standard:1 },
    ok:{ wer:'NIEMAND', text:'Das sagen alle.', geh:'@ende' },
  }};
}

/* Marvin - oder, wenn man ihn nie gesehen hat, nur ein Schatten. Hier
   entscheidet sich, mit welchem Kopf man ins Finale geht. */
function marvinEcho(){
  if(!flag('marvinKennt')) return { name:'EIN SCHATTEN', baum:{
    start:{ wer:'SCHATTEN', text:'Ich warte am Ende der Nacht auf dich.', geh:'@ende' } }};
  return { name:'MARVIN', baum:{
    start:{ wer:'MARVIN', text:'Du hast Angst vor mir. Ich seh das.',
      wahl:[
        { txt:'Ja. Und?',                 geh:'zugegeben', tu:{mut:6, flag:'angstZugegeben'} },
        { txt:'Nein.',     wenn:{mut:50}, geh:'hart',      tu:{mut:3} },
        { txt:'Lass mich in Ruhe.',       geh:'@ende',     tu:{mut:-4} },
      ], zeit:9, standard:2 },
    zugegeben:{ wer:'MARVIN', text:'...Dann bist du ehrlicher als ich.', geh:'@kraft' },
    hart:{ wer:'MARVIN', text:'Wir werden sehen.', geh:'@ende' },
  }};
}

/* Lea sagt am Ende, wo man wirklich ist. */
const LEA_BAUM = {
  start:{ wer:'LEA', text:'Hey. Schau mich an.', geh:'zwei' },
  zwei:{ wer:'LEA', text:'Das hier ist nicht echt. Aber du bist es.',
    wahl:[
      { txt:'Wo bin ich eigentlich?',       geh:'wo' },
      { txt:'Bring mich einfach raus.',      geh:'raus' },
    ], zeit:0 },
  wo:{ wer:'LEA', text:'Auf der Afterhour. Du bist vor einer Stunde auf dem Sofa weggeknickt.', geh:'raus' },
  raus:{ wer:'LEA', text:'Komm. Wir holen uns was am Spaeti.', geh:'@fertig' },
};
const LEA_NOCH_NICHT = {
  start:{ wer:'LEA', text:'Du siehst noch ganz verwaschen aus. Hol dir erst deine Erinnerungen.', geh:'@ende' },
};

/* Nach einem Traumgespraech, das gut ausgeht, bekommt man Kraft zurueck -
   das ist der Grund, mit den Echos ueberhaupt zu reden. */
function traumEnde(e){
  if(e==='@kraft'){
    S.kondition=Math.min(100,S.kondition+30);
    meldung('DU FUEHLST DICH WACHER',1.8); SFX.erledigt();
  }
  if(e==='@fertig') starteCutscene();
}
"""
ersetze("""/* ==========================================================================
   ZUSTAND
   ========================================================================== */""",
        BAEUME + """
/* ==========================================================================
   ZUSTAND
   ========================================================================== */""")

# ------------------------------------------------------------- Zustand ----
ersetze("""    x:30, y:BODEN, vx:0, vy:0, amBoden:true, letzterBoden:0, blick:1, gehPhase:0, schritte:0,""",
"""    x:30, y:BODEN, vx:0, vy:0, amBoden:true, letzterBoden:0, blick:1, gehPhase:0, schritte:0,
    tiefe:0.5, vt:0,
    kondition:Math.max(35,wert('kondition')), ruht:null, sofa:SOFAS[0],
    weggeknickt:0, schwarzT:0, geredetMit:{}, schleifen:0,""")
ersetze("""function neuesSpiel(){
  S={""", """function neuesSpiel(){
  if(typeof GESPR!=='undefined') GESPR=null;
  S={""")
ersetze("""neuesSpiel();

/* Zwei Hilfs-Canvas""", """neuesSpiel();
setzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);

/* Zwei Hilfs-Canvas""")

# ---------------------------------------------------------------- Eingabe --
ersetze("let linksAn=false", "let hochAn=false, runterAn=false;\nlet linksAn=false")
ersetze("""function druckAktion(){
  ensureAudio();""", """function druckAktion(){
  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){ ensureAudio(); gespraechBestaetigen(); return; }
  ensureAudio();""")
ersetze("""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }""",
"""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(gespraechAktiv()){
    if(['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); gespraechWaehle(-1); return; }
    if(['ArrowRight','KeyD','ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); gespraechWaehle(1); return; }
  }
  if(['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }
  if(['ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); runterAn=true; }
  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }""")
ersetze("""  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
  if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;""",
"""  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;
  if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;""")
ersetze("""addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=false; });""",
        """addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=hochAn=runterAn=false; });""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 6 Teil 1: Welt, Gespraeche, Eingabe')
