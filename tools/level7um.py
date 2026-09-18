# -*- coding: utf-8 -*-
"""Level 7: der Spaeti zieht Bilanz.

Vorher: Wasser nehmen, Snack nehmen, an der Kasse E, Crew anreden - fertig.
Nichts davon kostete etwas, nichts hing an der Nacht davor.

Jetzt:
- GELD ZAEHLT. Wasser 2, Snack 3 Euro - aus dem, was die Nacht uebrig
  gelassen hat (Ticket im Bus, Drinks im Club, zehn Euro Schutzgeld).
- PFANDSAMMELN als Minispiel, wenn man pleite ist. Die Flaschen liegen in
  der Flaeche, und Heinz, der alte Pfandsammler, will dieselben. Man kann
  mit ihm um die Wette laufen - oder ihm die Flaschen lassen.
- DIE NACHTMENSCHEN. Herr Oezdemir hinter der Kasse, ein Taxifahrer mit
  einem Tipp fuer den Heimweg, Nele, die heult (das Handy aus Level 1
  hilft), Tobi, den seine Freunde vergessen haben - er kann mitkommen und
  steht dann im Finale neben dir.
- WER VERGESSEN WURDE, IST WEG. Crew mit schlechter Beziehung sitzt nicht
  mehr auf der Bank.
- DIE ENTSCHEIDUNG: heim, weiterziehen oder auf den Sonnenaufgang warten.
  Level 8 erzaehlt das Ende danach.
"""
import io, re

p = 'level7.html'
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


def loesche(name):
    global s
    start = s.index('\nfunction ' + name + '(') + 1
    ende = s.index('\n}\n', start) + 3
    s = s[:start] + s[ende:]


s, n = re.subn(r'(<script src="nacht/stand\.js\?v=([0-9]+)"></script>)',
               lambda m: m.group(1) + ''.join(
                   '\n<script src="nacht/%s.js?v=%s"></script>' % (x, m.group(2))
                   for x in ('welt', 'nacht', 'dialog')), s)
assert n == 1

# ------------------------------------------------------------------ TUNE ----
ersetze("""  /* (6) DER AUSGANG - die Ecke Richtung Heimweg */
  ausgangX:       430,""",
"""  /* (6) DER AUSGANG - die Ecke Richtung Heimweg */
  ausgangX:       850,

  /* (7) TIEFE */
  tiefeHinten:   120,
  tiefeVorne:    152,
  tiefeWelt:      46,
  tiefeTempo:    1.0,
  redeTiefe:     0.32,

  /* (8) GELD UND PFAND
     Gemessen an den Wegen davor: ohne Ticket, Drinks und Schutzgeld kommt
     man mit 15 Euro an und kauft beides. Wer im Bus bezahlt und im Club
     Runden geschmissen hat, steht mit 0 bis 4 Euro da und muss sammeln. */
  preisWasser:     2,
  preisSnack:      3,
  pfandWert:     0.5,   // pro Flasche
  heinzTempo:     20,   // der alte Pfandsammler - etwas langsamer als du
  heinzGreift:   0.8,   // so lange braucht er zum Aufheben
  snackKondition: 15,   // Essen macht wach""")

# -------------------------------------------------------------- Sprites ----
ersetze("""  /* Sachen zum Einpacken */""",
"""  /* Die Nachtmenschen */
  taxifahrer:['..hhh..','.hsssh.','.sssss.','..sss..','..yyy..','.yyyyy.','k.yyy.k','..yyy..',
              '..ppp..','..p.p..','..p.p..','.pp.pp.','.kk..kk'],
  nele:['..hhh..','.hhhhh.','.hsssh.','.hsssh.','..sss..','..mmm..','.mmmmm.','s.mmm.s','..mmm..',
        '.mmmmm.','..s.s..','..s.s..','.kk.kk.'],
  tobi:['..hhh..','.hsssh.','.sssss.','..sss..','..ooo..','.ooooo.','k.ooo.k','..ooo..',
        '..ppp..','..p.p..','..p.p..','.pp.pp.','.kk..kk'],
  heinz:['..www..','.wsssw.','.sssss.','..sss..','..ddd..','.ddddd.','k.ddd.k','..ddd..',
         '..ddd..','..p.p..','..p.p..','.pp.pp.','.kk..kk'],
  wagen:['u.....u','uuuuuuu','u.g.g.u','uuuuuuu','.k...k.'],
  bank: ['zzzzzzzzzzzzzz','dddddddddddddd','.d..........d.','.d..........d.'],
  taxi: ['....yyyyyy......','...y.u..u.y.....','yyyyyyyyyyyyyyyy','yykyyyyyyyyyykyy','..kk........kk..'],
  pfand:['.g.','.g.','ggg','ggg'],

  /* Sachen zum Einpacken */""")

# ----------------------------------------------------------------- Welt ----
alt = s[s.index('const LEVEL_B=460;'):s.index("""/* ==========================================================================
   ZUSTAND""")]
s = s.replace(alt, r"""const LEVEL_B=900;
const ORTE=[
  { von:0,   bis:300, name:'STRASSE',          wand:'#141c2c', boden:'#101422' },
  { von:300, bis:520, name:'IM SPAETI',        wand:'#2a2336', boden:'#1d1727', drinnen:true },
  { von:520, bis:720, name:'BANK VORM LADEN',  wand:'#141c2c', boden:'#101422' },
  { von:720, bis:900, name:'ECKE',             wand:'#1a2034', boden:'#121626' },
];

/* Regale an der Rueckwand - dort steht, was man kaufen kann. Einpacken
   geht nicht mehr einfach so: bezahlt wird an der Kasse. */
const DINGE=[
  { x:350, t:0.06, art:'wasser', moebel:'kuehl' },
  { x:410, t:0.06, art:'snack',  moebel:'regal' },
];
const KASSE={ x:486, t:0.22 };

/* Die Nachtmenschen. Feste Plaetze in der Flaeche. */
const NACHTMENSCHEN=[
  { id:'taxi',  x:120, t:0.30, name:'TAXIFAHRER',   spr:'taxifahrer' },
  { id:'nele',  x:240, t:0.78, name:'NELE',         spr:'nele' },
  { id:'tobi',  x:650, t:0.20, name:'TOBI',         spr:'tobi' },
];
const OEZDEMIR={ id:'oezdemir', x:500, t:0.12, name:'HERR OEZDEMIR', spr:'verkaeufer' };

/* Pfand. Liegt in der Flaeche verteilt - man muss auch in die Tiefe. */
const PFAND_PLAETZE=[
  [30,0.8],[64,0.2],[96,0.62],[150,0.9],[182,0.4],[214,0.12],[268,0.55],
  [540,0.85],[574,0.45],[610,0.95],[690,0.62],[742,0.3],[790,0.88],[836,0.5],
];

/* Die Crew auf der Bank. Wer schlecht behandelt wurde, ist nicht mehr da -
   die Beziehung aus Level 2 bis 6 entscheidet. */
function baueCrew(){
  const alle=ladeCrew().filter(n=>n!=='TOBI');
  const da=[], weg=[];
  for(const n of alle) (beziehung(n)<=-5?weg:da).push(n);
  const sprite={ 'MAX FERDI':'max', 'MORITZ':'moritz' };
  return { weg, da: da.map((name,i)=>({
    id:'crew'+i, name, x:560+i*18, t:0.10+(i%2)*0.08, spr:sprite[name]||'steh', tint:sprite[name]?null:P.neon2 })) };
}

/* ==========================================================================
   DIE GESPRAECHE
   ========================================================================== */
function kassenWahl(){
  return [
    { txt:'Ein Wasser, bitte.  2 EURO', wenn:{geld:TUNE.preisWasser, nichtFlag:'spaetiWasser'},
      tu:{geld:-TUNE.preisWasser, nimm:'WASSER', flag:'spaetiWasser'}, geh:'mehr' },
    { txt:'Und was zu essen.  3 EURO',  wenn:{geld:TUNE.preisSnack, nichtFlag:'spaetiSnack'},
      tu:{geld:-TUNE.preisSnack, nimm:'SNACK', flag:'spaetiSnack'}, geh:'@snack' },
    { txt:'Pfand abgeben.',              wenn:{hat:'PFAND'}, geh:'@pfand' },
    { txt:'Wie lange haben Sie schon offen?', wenn:{nichtFlag:'oezdemirGeschichte'}, geh:'geschichte' },
    { txt:'Das wars.',                   geh:'@ende' },
  ];
}
const OEZDEMIR_BAUM = {
  start:{ wer:'HERR OEZDEMIR', text:'Na. Harte Nacht gehabt?', wahl:kassenWahl(), zeit:0 },
  mehr:{ wer:'HERR OEZDEMIR', text:'Noch was?', wahl:kassenWahl(), zeit:0 },
  geschichte:{ wer:'HERR OEZDEMIR', text:'Zweiundzwanzig Jahre. Jede Nacht. Ich hab mehr Leute heimgehen sehen als jeder Taxifahrer.',
    wahl:[
      { txt:'Und wie viele sind gut angekommen?', geh:'witz' },
      { txt:'Warum machen Sie das?',               geh:'tochter' },
    ], zeit:0 },
  witz:{ wer:'HERR OEZDEMIR', text:'Alle, die bei mir Wasser gekauft haben.', tu:{flag:'oezdemirGeschichte', ruf:2}, geh:'mehr' },
  tochter:{ wer:'HERR OEZDEMIR', text:'Meine Tochter hat hier Hausaufgaben gemacht. Jetzt ist sie Aerztin. Der Laden bleibt offen.',
    tu:{flag:'oezdemirGeschichte', mut:3}, geh:'mehr' },
};

const TAXI_BAUM = {
  start:{ wer:'TAXIFAHRER', text:'Ich hab Feierabend, falls du fragen willst.',
    wahl:[
      { txt:'Lange Nacht?',    geh:'lang' },
      { txt:'Nee, nur gucken.', geh:'@ende' },
    ], zeit:0 },
  lang:{ wer:'TAXIFAHRER', text:'Dreissig Jahre Nachtschicht. Ich seh alles.',
    wahl:[
      { txt:'Was siehst du heute?',   geh:'tipp' },
      { txt:'Klingt anstrengend.',     geh:'@ende', tu:{ruf:1} },
    ], zeit:0 },
  /* Der Tipp traegt ins Finale: Level 8 liest taxiTipp. */
  tipp:{ wer:'TAXIFAHRER', text:'An der Kreuzung steht eine Truppe. Einer mit Kette. Der schlaegt immer zuerst, wenn du zurueckweichst. Bleib stehen und block.',
    tu:{flag:'taxiTipp'}, geh:'@ende' },
};

const NELE_BAUM = {
  start:{ wer:'NELE', text:'...',
    wahl:[
      { txt:'Alles okay?',  geh:'erzaehlt' },
      { txt:'(weitergehen)', geh:'@ende' },
    ], zeit:0 },
  erzaehlt:{ wer:'NELE', text:'Meine Freundinnen sind weg. Und mein Handy ist tot.',
    wahl:[
      { txt:'Nimm meins. Ruf sie an.',     wenn:{flag:'handyZurueck'}, geh:'telefon' },
      { txt:'Hier, trink erstmal was.',    wenn:{hat:'WASSER'}, geh:'wasser', tu:{gib:'WASSER'} },
      { txt:'Soll ich mit dir warten?',    geh:'warten' },
      { txt:'Das wird schon.',             geh:'@ende' },
    ], zeit:0 },
  telefon:{ wer:'NELE', text:'Die sind nur zwei Strassen weiter. Danke. Wirklich.',
    tu:{flag:'neleGeholfen', ruf:8}, geh:'@gut' },
  wasser:{ wer:'NELE', text:'Danke. ...Ich glaub, ich lauf einfach heim. Ist nicht weit.',
    tu:{flag:'neleGeholfen', ruf:6}, geh:'@wasserWeg' },
  warten:{ wer:'NELE', text:'Nein, geht schon. Aber danke, dass du fragst.',
    tu:{ruf:3}, geh:'@ende' },
};

const TOBI_BAUM = {
  start:{ wer:'TOBI', text:'Die sind ohne mich weiter. Einfach so.',
    wahl:[
      { txt:'Komm mit uns.',  wenn:{mut:30}, geh:'mit' },
      { txt:'Ruf sie an.',    geh:'anrufen' },
      { txt:'Pech.',          geh:'@ende', tu:{mut:-2} },
    ], zeit:0 },
  anrufen:{ wer:'TOBI', text:'Hab ich. Geht keiner ran.',
    wahl:[
      { txt:'Dann komm mit uns.', wenn:{mut:30}, geh:'mit' },
      { txt:'Tut mir leid.',      geh:'@ende' },
    ], zeit:0 },
  /* Tobi geht in die Crew - und crewHilfeTakt in Level 8 laesst die Crew
     im grossen Fight dazwischengehen. Freundlichkeit hier ist Hilfe dort. */
  mit:{ wer:'TOBI', text:'Echt jetzt? ...Okay. Danke, Mann.', tu:{crew:'TOBI', flag:'tobiDabei', mag:['TOBI',20]}, geh:'@tobi' },
};

const HEINZ_BAUM = {
  start:{ wer:'HEINZ', text:'Das sind meine Flaschen, junger Mann.',
    wahl:[
      { txt:'Nimm sie. Du brauchst sie mehr.', geh:'danke', tu:{ruf:6, flag:'heinzGeholfen'} },
      { txt:'Wer zuerst kommt.',               geh:'@ende' },
      { txt:'Hau ab, Alter.', wenn:{mut:45},   geh:'@ende', tu:{ruf:-8} },
    ], zeit:0 },
  danke:{ wer:'HEINZ', text:'Anstaendig. Gibt nicht mehr viele. Pass auf dich auf, da an der Kreuzung.', geh:'@heinz' },
};

/* Die Entscheidung am Ende. */
const ENDE_BAUM = {
  start:{ wer:'DIE CREW', text:'Und jetzt?',
    wahl:[
      { txt:'Heim. Ich kann nicht mehr.',                         geh:'@heim' },
      { txt:'Weiterziehen. Die Nacht ist noch nicht vorbei.',    wenn:{kondition:50}, geh:'@weiter' },
      { txt:'Wir warten auf den Sonnenaufgang. Oben an der Bruecke.', geh:'@sonne' },
      { txt:'Moment, ich bin noch nicht fertig.',                geh:'@ende' },
    ], zeit:0 },
};

""")

# ---------------------------------------------------------------- Zustand --
funktion('neuesSpiel', r"""
function neuesSpiel(){
  if(typeof GESPR!=='undefined') GESPR=null;
  const crew=baueCrew();
  S={
    modus:'titel', t:0, zeit:0,
    x:40, y:BODEN, vx:0, vy:0, amBoden:true, letzterBoden:0, blick:1, gehPhase:0, schritte:0,
    tiefe:0.5, vt:0,
    kamX:0,
    pegel: ladeStartPegel(), minute:TUNE.startMinute,
    crew:crew.da, crewWeg:crew.weg, geredet:{},
    pfand:PFAND_PLAETZE.map(([x,t])=>({x,t,weg:false})),
    heinz:{ x:20, t:0.5, blick:1, ziel:null, greifT:0, friedlich:false },
    nele:{ weg:false },
    meldung:'', meldungT:0, hinweis:'', hinweisT:0,
    ruettel:0, blitz:0,
    szene:0, szeneT:0, skipT:0, szenen:[],
    gewonnen:false, faenger:'',
  };
  S.kamX=Math.max(0,Math.min(LEVEL_B-W,S.x-W/2));
}
/* Was nur fuer diesen Besuch gilt, muss beim Neustart zurueck. */
function spaetiZuruecksetzen(){
  ['spaetiWasser','spaetiSnack','oezdemirGeschichte','taxiTipp','neleGeholfen',
   'heinzGeholfen','endeHeim','endeWeiter','endeSonne'].forEach(f=>setzeFlag(f,false));
  while(hatDing('PFAND')) gibDing('PFAND');
  while(hatDing('WASSER')) gibDing('WASSER');
  while(hatDing('SNACK')) gibDing('SNACK');
}""")
ersetze("neuesSpiel();\n\n/* ==========================================================================\n   EINGABE",
        "neuesSpiel();\nsetzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);\n\n"
        "/* ==========================================================================\n   EINGABE")

# ---------------------------------------------------------------- Eingabe --
ersetze("let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false;",
        "let linksAn=false, rechtsAn=false, sprungAn=false, aktionGehalten=false, hochAn=false, runterAn=false;")
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

ersetze("""function starteLevel(){ S.modus='spiel'; zeigeHinweis('BESORG WAS FUER DIE TRUPPE',3);""",
"""function starteLevel(){ S.modus='spiel'; spaetiZuruecksetzen();
  zeigeHinweis('WASSER UND WAS ZU ESSEN. GELD: '+wert('geld')+' EURO',3.5);
  if(S.crewWeg.length) setTimeout(()=>meldung(S.crewWeg.join(', ')+' IST SCHON HEIM',2.6),3800);""")
ersetze("const alleFertig=()=>AUFGABEN.every(a=>S.erledigt[a.id]);",
        "const alleFertig=()=>flag('spaetiWasser')&&flag('spaetiSnack');")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 7 Teil 1')
