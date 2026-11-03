# -*- coding: utf-8 -*-
"""Level 5: der Club wird das Herzstueck.

Vorher: drei Leute auf einer Linie, ein Timing-Balken fuers Ansprechen,
zwei Treffer und die Tuer geht auf. Wer den Balken konnte, konnte jeden
ansprechen - wer man war und was man sagte, spielte keine Rolle.

Jetzt:
- Fuenf Bereiche mit Tiefe. Stroboskop nur auf der Tanzflaeche - zum Reden
  geht man woandershin, und das ist Absicht.
- Ansprechen ist ein Gespraech mit Entscheidungsbaum (tools/level5_baeume.js).
  Drei Persoenlichkeiten, die auf verschiedene Dinge reagieren. Pegel, Mut,
  Ruf, Geld, Crew und die Level davor schalten Antworten frei.
- Der Timing-Balken bleibt - als Tanzen, wenn das Gespraech dorthin fuehrt.
- Laeuft es gut: die Ecke. Erzaehlt, nicht gezeigt.
- Eine Abfuhr spricht sich rum: Ruf sinkt, und damit die naechsten Chancen.
- Marvin, der Rivale, geht dieselben Leute an. Wer troedelt, verliert sie.
- Die kleine Schlaegerei im Stroboskop, danach der Rausschmiss.
- Keine Niederlage durch die Uhr mehr: um eins geht das Licht an, und die
  Nacht geht weiter - nur mit dem, was man bis dahin geschafft hat.
"""
import io, re

p = 'level5.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


def funktion(name, neu):
    """Ersetzt eine Funktion vom 'function name(' bis zur schliessenden
    Klammer in Spalte 0."""
    global s
    start = s.index('\nfunction ' + name + '(') + 1
    ende = s.index('\n}\n', start) + 3
    s = s[:start] + neu.strip('\n') + '\n' + s[ende:]


# ---------------------------------------------------------------- Engine ----
s, n = re.subn(r'(<script src="nacht/stand\.js\?v=([0-9]+)"></script>)',
               lambda m: m.group(1) + ''.join(
                   '\n<script src="nacht/%s.js?v=%s"></script>' % (x, m.group(2))
                   for x in ('welt', 'nacht', 'dialog', 'kampf')), s)
assert n == 1

# ------------------------------------------------------------------ TUNE ----
ersetze("""  startMinute:   22*60,
  endMinute:     22*60+45,
  levelSekunden: 170,""",
"""  startMinute:   22*60+30,
  endMinute:     25*60,     // um eins geht das Licht an
  levelSekunden: 600,       // Gespraeche halten die Uhr an - das ist reine Laufzeit""")

ersetze("""  /* (11) ZIEL */
  erfolgeZumSieg:    2,   // von 3 moeglichen""",
"""  /* (11) TIEFE - der Club ist ein Raum. Die Bar steht an der Rueckwand. */
  tiefeHinten:   122,
  tiefeVorne:    154,
  tiefeWelt:      48,
  tiefeTempo:    1.0,
  redeTiefe:     0.30,  // so genau muss man vor jemandem stehen
  barTiefe:      0.35,  // an die Bar kommt nur, wer hinten steht

  /* (12) MARVIN - der Rivale. Er geht dieselben Leute an. Steht er lang
     genug bei jemandem, mit dem du noch nicht geredet hast, ist sie weg. */
  marvinKommtNach:  25,   // Sekunden bis er auftaucht
  marvinTempo:      21,
  marvinNimmt:     9.0,   // so lange muss er ungestoert bei ihr stehen
  marvinPause:     5.0,
  marvinStellt:     22,   // so nah, dann stellt er dich

  /* (13) KLOS - kaltes Wasser drueckt den Pegel */
  wasserPegel:     -18,
  wasserPause:      25,

  /* (14) DIE KLEINE SCHLAEGEREI */
  kloppeLeben:       5,
  kloppeReich:      17,
  marvinHp:          5,

  /* (15) ABFUHR - spricht sich rum */
  abfuhrRuf:        -6,""")

# ---------------------------------------------------------------- Sprites ----
ersetze("""  /* Tanzende Menge - nur Deko, aber im Dunkeln ein Hindernis */""",
"""  lena:[...KOPF,'..ggg..','.ggggg.','.ggggg.','..g.g..'],
  /* Marvin: dunkle Jacke, Goldkette. Am Ende der Nacht steht er wieder da. */
  marvin:[...KOPF,'..qgq..','.qqqqq.','k.qqq.k','..qqq..','..ppp..','..p.p..','.pp.pp.','.kk..kk'],
  handlanger:[...KOPF,'..qqq..','.qqqqq.','k.qqq.k','..ppp..','..p.p..','.pp.pp.','.kk..kk'],
  waschbecken:['uuuuuu','.uuuu.','..uu..','..uu..','..uu..'],

  /* Tanzende Menge - nur Deko, aber im Dunkeln ein Hindernis */""")

# ------------------------------------------------------------------ Welt ----
alt_welt = s[s.index('const LEVEL_B=880;'):s.index('const AUSGANG={ x:830 };') + len('const AUSGANG={ x:830 };')]
s = s.replace(alt_welt, """const LEVEL_B=1400;
/* Fuenf Bereiche. Das Stroboskop laeuft nur auf der Tanzflaeche - wer reden
   will, geht an die Bar oder raus zu den Rauchern. */
const ORTE=[
  { von:0,    bis:170,  name:'EINGANG',       wand:'#241a30', boden:'#1a1322', strobe:false },
  { von:170,  bis:620,  name:'TANZFLAECHE',   wand:'#2c1c38', boden:'#20142a', strobe:true  },
  { von:620,  bis:860,  name:'BAR',           wand:'#26303a', boden:'#1a222a', strobe:false },
  { von:860,  bis:1060, name:'RAUCHERECKE',   wand:'#1c2426', boden:'#141a1c', strobe:false },
  { von:1060, bis:1200, name:'KLOS',          wand:'#20262e', boden:'#181c22', strobe:false },
  { von:1200, bis:1400, name:'HINTERAUSGANG', wand:'#141a2c', boden:'#101624', strobe:false },
];
const ortBei=x=>ORTE.find(o=>x>=o.von&&x<o.bis)||ORTE[0];

/* Die drei Leute. Jede steht in einem anderen Bereich - man muss durch den
   ganzen Club. stand: offen | ja | nummer | nett | nein | weg (Marvin) */
const ZIELE=[
  { id:'mia',    x:330, t:0.42, name:'MIA',    spr:'girlA' },
  { id:'sophie', x:720, t:0.24, name:'SOPHIE', spr:'girlB' },
  { id:'kira',   x:960, t:0.58, name:'KIRA',   spr:'girlC' },
];
const LENA={ x:346, t:0.50 };
/* Tanzende Menge - Deko, aber im Dunkeln ein Hindernis. Jetzt ueber die
   ganze Tiefe verteilt: man muss um sie herum. */
const TANZER=[190,215,250,280,300,370,395,420,455,490,520,560,590]
  .map((x,i)=>({x, t:[0.3,0.7,0.5,0.85,0.2,0.6,0.35,0.8,0.5,0.25,0.65,0.45,0.75][i], seed:i*1.37}));
const BARTHEKE={ x:690, t:0.06 };
const WASCHBECKEN={ x:1120, t:0.10 };
const AUSGANG={ x:1350, t:0.30 };""")

# ---------------------------------------------------------- Gespraeche ----
baeume = io.open('tools/level5_baeume.js', encoding='utf-8').read()
ersetze("""/* ==========================================================================
   SPEICHERSTAND
   ========================================================================== */""",
        baeume + """
/* ==========================================================================
   SPEICHERSTAND
   ========================================================================== */""")

# -------------------------------------------------------------- Zustand ----
funktion('neuesSpiel', r"""
function neuesSpiel(){
  if(typeof GESPR!=='undefined') GESPR=null;
  S={
    modus:'titel', t:0, zeit:0,
    x:40, y:BODEN, vx:0, blick:1, gehPhase:0, schritte:0,
    tiefe:0.6, vt:0,
    kamX:0,
    pegel:parseFloat(localStorage.getItem(PEGEL_KEY))||0,
    minute:TUNE.startMinute,
    erfolge:0, abfuhren:0, wasserT:0,
    confidenceT:0, geknicktT:0, stolpernT:0,
    dunkel:0, flacker:0,
    mini:null, ecke:null,
    marvin:{ da:false, x:30, t:0.5, blick:1, ziel:null, beiT:0, pause:0, wut:false, fertig:false, hat:[] },
    kloppeStand:'offen', ich:null, gegner:[], blockAn:false, rolleGedrueckt:false,
    meldung:'', meldungT:0, hinweis:'', hinweisT:0,
    ruettel:0, blitz:0,
    szene:0, szeneT:0, skipT:0, szenen:[],
    gewonnen:false, faenger:'', neueBestzeit:false,
  };
  for(const z of ZIELE){ z.stand='offen'; z.weg=false; }
  S.kamX=Math.max(0,Math.min(LEVEL_B-W,S.x-W/2));
}
/* Was nur fuer DIESEN Clubbesuch gilt, muss beim Neustart zurueck - sonst
   bringt ein zweiter Versuch die Zuneigung aus dem ersten schon mit. */
function clubZuruecksetzen(){
  ['clubJa_mia','clubJa_sophie','clubJa_kira','schreibt_mia','schreibt_sophie','schreibt_kira',
   'lenaVersorgt','clubGekniffen','marvinRueckzug','clubKloppeGewonnen','clubKloppeVerloren']
    .forEach(f=>setzeFlag(f,false));
  for(const n of ['MIA','SOPHIE','KIRA','LENA']) aendereBeziehung(n,-beziehung(n));
}""")

ersetze("neuesSpiel();\n\n/* ==========================================================================\n   EINGABE",
        "neuesSpiel();\nsetzeTiefenband(TUNE.tiefeHinten,TUNE.tiefeVorne,TUNE.tiefeWelt);\n\n"
        "/* ==========================================================================\n   EINGABE")

# ---------------------------------------------------------------- Eingabe --
ersetze("let linksAn=false, rechtsAn=false, aktionGehalten=false;",
        "let linksAn=false, rechtsAn=false, aktionGehalten=false, hochAn=false, runterAn=false;")

ersetze("""function druckAktion(){
  ensureAudio();""",
"""function druckAktion(){
  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){ ensureAudio(); gespraechBestaetigen(); return; }
  ensureAudio();
  if(S.modus==='ecke'){ eckeWeiter(); return; }""")

alt_keys = s[s.index("addEventListener('keydown',e=>{"):s.index("addEventListener('blur',()=>{ linksAn=rechtsAn=aktionGehalten=false; });") + len("addEventListener('blur',()=>{ linksAn=rechtsAn=aktionGehalten=false; });")]
s = s.replace(alt_keys, r"""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(gespraechAktiv()){
    if(['ArrowLeft','KeyA','ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); gespraechWaehle(-1); return; }
    if(['ArrowRight','KeyD','ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); gespraechWaehle(1); return; }
  }
  if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }
  if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }
  if(['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }
  if(['ArrowDown','KeyS'].includes(e.code)){ e.preventDefault(); runterAn=true; }
  if(['ShiftLeft','ShiftRight'].includes(e.code)){ e.preventDefault(); S.blockAn=true; }
  /* Im Kampf ist die Leertaste die Ausweichrolle, sonst wie E. */
  if(e.code==='Space'&&S.modus==='kloppe'){ e.preventDefault(); S.rolleGedrueckt=true; return; }
  if(['KeyE','Enter','Space'].includes(e.code)){ e.preventDefault(); aktionGehalten=true; druckAktion(); }
  if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); }
  if(e.code==='KeyF'){ e.preventDefault(); vollbild(); }
  if(S.modus==='titel'&&(e.code==='Digit1'||e.code==='Numpad1')){
    e.preventDefault(); location.href='index.html'; }
  if(e.code==='KeyP'&&(S.modus==='spiel'||S.modus==='pause')) S.modus=S.modus==='spiel'?'pause':'spiel';
});
addEventListener('keyup',e=>{ keys[e.code]=false;
  if(['ArrowLeft','KeyA'].includes(e.code)) linksAn=false;
  if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;
  if(['ShiftLeft','ShiftRight'].includes(e.code)) S.blockAn=false;
  if(['KeyE','Enter','Space'].includes(e.code)) aktionGehalten=false; });
addEventListener('blur',()=>{ linksAn=rechtsAn=aktionGehalten=hochAn=runterAn=false; if(S) S.blockAn=false; });""")

# ------------------------------------------------------------------ Intro --
ersetze("""  { d:2.4, txt:'22:00. DER CLUB.' },
  { d:2.4, txt:'DRINNEN IST ES LAUT UND DUNKEL.' },
  { d:2.6, txt:'DAS STROBOSKOP MACHT DIE SICHT KAPUTT.' },
  { d:2.6, txt:'SUCH DIR LEUTE ZUM ANSPRECHEN.' },
  { d:2.8, txt:'GENUG ERFOLGE, DANN GEHT ES RICHTUNG AFTERHOUR.' },""",
"""  { d:2.4, txt:'22:30. DER CLUB.' },
  { d:2.4, txt:'DRINNEN IST ES LAUT UND DUNKEL.' },
  { d:2.6, txt:'AUF DER TANZFLAECHE SIEHT MAN NICHTS.' },
  { d:2.6, txt:'AN DER BAR UND DRAUSSEN KANN MAN REDEN.' },
  { d:2.8, txt:'UM EINS GEHT DAS LICHT AN.' },""")

ersetze("""function starteLevel(){ S.modus='spiel'; zeigeHinweis('E ZUM ANSPRECHEN, TRINKEN, TUER',3);""",
        """function starteLevel(){ S.modus='spiel'; clubZuruecksetzen();
  zeigeHinweis('W UND S: NACH HINTEN UND VORNE - E ZUM REDEN',3.5);""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 5 Teil 1: Welt, Gespraeche, Eingabe')
