# -*- coding: utf-8 -*-
"""Level 1: die offenen Punkte aus WEITER.md.

- LEHRER-ROUTINEN. Die Lehrer liefen nur Patrouille. Jetzt geht jeder
  regelmaessig zu einem festen Ort seiner Etage: Kaffeeautomat (EG),
  Kopierer (1. Stock), Klo (2. Stock). Dort schaut er weg - am Klo ist er
  ganz verschwunden. Das sind lesbare, planbare Zeitfenster statt Zufall.
- DER KELLER. Ein neuer Raum im Erdgeschoss mit dem Sicherungskasten. Wer
  die Sicherung rausdreht, macht den Flur dunkel: die Lehrer sehen nur
  noch halb so weit - ausser man hat selbst die Lampe an.
- SPIND MIT ZAHLENCODE. Max Ferdis Spind im 2. Stock, drei Ziffern. Der
  Code steht auf einem Zettel irgendwo in den Raeumen. Falsche Codes machen
  Laerm. Drin: Geld, das spaeter im Club und am Spaeti zaehlt.
- DER DIREKTOR AM AUSGANG. Wer erwischt wurde, wird an der Tuer erwartet.
  Ein Gespraech statt der festen Cutscene.
"""
import io

p = 'index.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


# ------------------------------------------------------------------ TUNE ----
ersetze("  leben:            3,", """  leben:            3,

  /* (9) LEHRER-ROUTINEN - regelmaessig zu einem festen Ort. Dort schauen
     sie weg. Das Fenster ist planbar: man sieht, wohin er geht. */
  routinePauseMin: 14,     // Sekunden Patrouille zwischen zwei Routinen
  routinePauseMax: 26,

  /* (10) KELLER - Sicherung raus, Flur dunkel */
  stromAusDauer:   22,
  stromAusSicht:  0.5,     // so weit sehen Lehrer im Dunkeln noch

  /* (11) SPIND MIT CODE */
  codeGeld:        12,     // Euro - zaehlt im Club und am Spaeti
  codeLaerm:      0.7,     // Anteil der Laermweite bei falschem Code""")

# --------------------------------------------------------------- Sprites ----
ersetze("  kiste:  ['oooooo','o....o','o.oo.o','o....o','oooooo'],",
"""  kiste:  ['oooooo','o....o','o.oo.o','o....o','oooooo'],
  /* Routine-Orte im Flur */
  kaffee:   ['qqqqqq','qllllq','qlkklq','qqqqqq','q.uu.q','q.uu.q','qqqqqq','qqqqqq','qqqqqq','dddddd'],
  kopierer: ['uuuuuuuu','uwwwwwwu','uuuuuuuu','u.cc...u','uuuuuuuu','u......u','u......u','dddddddd'],
  klotuer:  ['zzzzzzzz','zjjjjjjz','zjjccjjz','zjjccjjz','zjjjjjjz','zjjjjgjz','zjjjjjjz','zjjjjjjz',
             'zjjjjjjz','zjjjjjjz','zjjjjjjz','zzzzzzzz'],
  codespind:['rrrrrr','r....r','r.gg.r','r.gg.r','rrrrrr','r....r','r....r','r....r','rrrrrr','dddddd'],
  sicherung:['dddddd','duuuud','dugrud','duuuud','dugrud','duuuud','dddddd'],""")

# -------------------------------------------------------------- Welt ----
ersetze("""  { e:0, x:470, name:'SEKRETARIAT',  stil:'buero',       moebel:['tisch','regal','pflanze'] },""",
"""  { e:0, x:470, name:'SEKRETARIAT',  stil:'buero',       moebel:['tisch','regal','pflanze'] },
  { e:0, x:604, name:'KELLER',       stil:'keller',      moebel:['kiste','sicherung','regal'] },""")
ersetze("""  lehrer:     { wand:'#292233', kante:'#3d3350', boden:'#201a26', fenster:2,
                licht:'rgba(255,205,150,.12)', deko:'pinnwand',schild:'#e0708f' },""",
"""  lehrer:     { wand:'#292233', kante:'#3d3350', boden:'#201a26', fenster:2,
                licht:'rgba(255,205,150,.12)', deko:'pinnwand',schild:'#e0708f' },
  keller:     { wand:'#141214', kante:'#221e20', boden:'#0e0c0e', fenster:0,
                licht:'rgba(255,120,60,.06)',  deko:'rohre',   schild:'#8a6a4a' },""")

ersetze("""const LEHRER_START = [""",
"""/* Wohin die Lehrer ihrer Routine nach gehen - einer pro Etage. */
const ROUTINEN = [
  { e:0, x:250, was:'KAFFEE',   spr:'kaffee',   dauer:6.5 },
  { e:1, x:560, was:'KOPIERT',  spr:'kopierer', dauer:7.5 },
  { e:2, x:660, was:'AUF KLO',  spr:'klotuer',  dauer:8.0, weg:true },
];
/* Max Ferdis Spind - verschlossen, drei Ziffern. */
const CODESPIND = { e:2, x:300 };

const LEHRER_START = [""")

# ------------------------------------------------------------- Zustand ----
ersetze("""  S.tiefe=0.18; S.vt=0;
  S.handyGeholt=false;""",
"""  S.tiefe=0.18; S.vt=0;
  /* Routinen zeitversetzt, damit nicht alle gleichzeitig Kaffee holen */
  S.lehrer.forEach((L,i)=>{ L.routineT=TUNE.routinePauseMin*0.5+i*5; L.routine=null; });
  S.stromAus=0; S.erwischtZahl=0;
  S.code=[0,1,2].map(()=>Math.floor(Math.random()*10));
  S.codeBekannt=false; S.codeOffen=false; S.codeEingabe=[0,0,0]; S.codeStelle=0;
  S.direktorGesprochen=false;
  S.handyGeholt=false;""")
# eine der Notizen wird der Codezettel
ersetze("""    art:['akku','akku','energie','notiz','notiz'][i], gefunden:false }));""",
        """    art:['akku','akku','energie','code','notiz'][i], gefunden:false }));""")

# ------------------------------------------------------------- Funde ----
ersetze("""        else if(fund.art==='energie'){ S.boost=8; meldung('ENERGYDRINK - SCHNELLER',1.8); }""",
"""        else if(fund.art==='energie'){ S.boost=8; meldung('ENERGYDRINK - SCHNELLER',1.8); }
        else if(fund.art==='code'){ S.codeBekannt=true;
          meldung('ZETTEL: FERDIS SPIND, 2. STOCK - '+S.code.join(' '),3.4); }""")
# Sicherungskasten
ersetze("""      } else if(zettel){""",
"""      } else if(RAEUME[S.raum].moebel[S.suchZiel]==='sicherung'){
        /* Der Sicherungskasten: der Flur wird dunkel. Die Lehrer sehen
           dann nur noch halb so weit - mit Lampe an bist du trotzdem ein
           Leuchtturm. */
        S.stromAus=TUNE.stromAusDauer; SFX.alarm(); S.blitz=.2;
        S.durchsucht.delete(S.raum+':'+S.suchZiel);
        meldung('SICHERUNG RAUS - DER FLUR IST DUNKEL',2.6);
      } else if(zettel){""")

# ---------------------------------------------------------- Routinen ----
ersetze("""    } else if(L.pause>0){
      /* Stehenbleiben und sich umschauen.""",
"""    } else if(L.routine){
      /* Routine: hingehen, dort stehen und wegschauen. Am Klo ist er ganz
         weg - das ist das groesste Fenster im Level. */
      const r=L.routine, d=r.x-L.x;
      if(!r.da){
        if(Math.abs(d)>3){ L.v=Math.sign(d); L.x+=L.v*tempo*1.1*dt; }
        else { r.da=true; r.rest=r.dauer; L.v=-(Math.sign(S.x-L.x)||1)*0.001; }
      } else {
        r.rest-=dt; L.abgelenkt=Math.max(L.abgelenkt||0,0.2);
        if(r.rest<=0){ L.routine=null; L.weg=false; L.v=Math.random()<.5?1:-1;
          L.routineT=TUNE.routinePauseMin+Math.random()*(TUNE.routinePauseMax-TUNE.routinePauseMin); }
        else if(r.weg) L.weg=true;
      }
    } else if(L.pause>0){
      /* Stehenbleiben und sich umschauen.""")
ersetze("""    } else {
      if(L.abgelenkt>0) L.abgelenkt-=dt;
      L.x+=L.v*tempo*dt;""",
"""    } else {
      if(L.abgelenkt>0) L.abgelenkt-=dt;
      /* Zeit fuer die Routine? Nur normale Lehrer - Direktor und Hausmeister
         haben andere Sorgen. */
      if(!L.chef&&!L.hausmeister&&(L.routineT-=dt)<=0){
        const ziel=ROUTINEN.find(r=>r.e===L.e);
        if(ziel){ L.routine={...ziel, da:false, rest:0}; continue; }
      }
      L.x+=L.v*tempo*dt;""")
# Sicht: Klo = weg, Strom aus = halbe Sicht
ersetze("""    const abgelenkt = L.abgelenkt>0 || L.suchtX!=null;
    const reichweite = weite*(S.schleicht?TUNE.schleichSicht:1)
                     *(S.lampe?TUNE.lampeSichtBonus:1)*(abgelenkt?0.35:1);""",
"""    const abgelenkt = L.abgelenkt>0 || L.suchtX!=null;
    const dunkel = S.stromAus>0 && !S.lampe;
    const reichweite = L.weg ? 0 :
                       weite*(S.schleicht?TUNE.schleichSicht:1)
                     *(S.lampe?TUNE.lampeSichtBonus:1)*(abgelenkt?0.35:1)
                     *(dunkel?TUNE.stromAusSicht:1);""")
# Jagd bricht Routine ab
ersetze("""    if(L.jagd>0){
      jagt=true; L.jagd-=dt;""",
"""    if(L.jagd>0){
      if(L.routine){ L.routine=null; L.weg=false; }
      jagt=true; L.jagd-=dt;""")

# ------------------------------------------------------- Strom-Uhr ----
ersetze("""  if(S.spindAbkuehlung>0) S.spindAbkuehlung=Math.max(0,S.spindAbkuehlung-dt);""",
"""  if(S.spindAbkuehlung>0) S.spindAbkuehlung=Math.max(0,S.spindAbkuehlung-dt);
  if(S.stromAus>0){ S.stromAus-=dt; if(S.stromAus<=0) meldung('DAS LICHT IST WIEDER AN',1.6); }""")

# ---------------------------------------------------------- Codespind ----
CODE = r"""
/* ==========================================================================
   MAX FERDIS SPIND - drei Ziffern
   Links/rechts waehlt die Stelle, hoch/runter die Ziffer, E probiert.
   Falsche Versuche machen Laerm - das ist der Preis fuers Raten.
   ========================================================================== */
const amCodespind=()=>S.etage===CODESPIND.e&&Math.abs(S.x-(CODESPIND.x+3))<12&&S.tiefe<=TUNE.tuerTiefe;
function codeOeffnen(){
  if(flag('ferdiSpindOffen')){ meldung('SCHON LEER',1); SFX.nichts(); return; }
  S.codeOffen=true; S.codeStelle=0; S.vx=0; S.vt=0;
  if(!S.codeBekannt) zeigeHinweis('DEN CODE HAST DU NOCH NICHT - RATEN MACHT LAERM',3);
}
function codeTaste(code){
  if(['ArrowLeft','KeyA'].includes(code)) S.codeStelle=(S.codeStelle+2)%3;
  else if(['ArrowRight','KeyD'].includes(code)) S.codeStelle=(S.codeStelle+1)%3;
  else if(['ArrowUp','KeyW'].includes(code)) S.codeEingabe[S.codeStelle]=(S.codeEingabe[S.codeStelle]+1)%10;
  else if(['ArrowDown','KeyS'].includes(code)) S.codeEingabe[S.codeStelle]=(S.codeEingabe[S.codeStelle]+9)%10;
  else if(['Escape','KeyQ'].includes(code)) S.codeOffen=false;
  else return false;
  piep(700+S.codeStelle*80,.02,'square',.02); return true;
}
function codeProbieren(){
  if(S.codeEingabe.join('')===S.code.join('')){
    S.codeOffen=false; setzeFlag('ferdiSpindOffen');
    aendereWert('geld',TUNE.codeGeld); SFX.fund(); S.blitz=.6;
    meldung('FERDIS SPIND: '+TUNE.codeGeld+' EURO UND EIN ZETTEL: DU SCHULDEST MIR NIX MEHR',3.2);
  } else {
    SFX.nichts(); S.ruettel=3;
    laerm(S.x,S.etage,TUNE.laermWeite*TUNE.codeLaerm);
    meldung('FALSCH - DAS KLAPPERT',1.4);
  }
}
function zeichneCode(){
  if(!S.codeOffen) return;
  ctx.fillStyle='#000000d8'; ctx.fillRect(W/2-60,H/2-30,120,56);
  ctx.fillStyle=P.neon||'#ff3d8b'; ctx.fillRect(W/2-60,H/2-30,120,1);
  textC('FERDIS SPIND',H/2-24,P.dim);
  for(let i=0;i<3;i++){
    const x=W/2-22+i*18, an=i===S.codeStelle;
    ctx.fillStyle=an?'#2a2440':'#15121f'; ctx.fillRect(x-4,H/2-12,14,16);
    text(String(S.codeEingabe[i]),x+1,H/2-7,an?P.gold:P.weiss);
    if(an&&Math.floor(S.t*3)%2===0){ text('+',x+2,H/2-18,P.dim); text('-',x+2,H/2+6,P.dim); }
  }
  textC(IS_TOUCH?'STICK: ZIFFER - KNOPF: PROBIEREN':'PFEILE: ZIFFER - E: PROBIEREN - Q: WEG',H/2+16,P.dunkel);
}

/* ==========================================================================
   DER DIREKTOR AM AUSGANG
   Wer heute erwischt wurde, wird an der Tuer erwartet.
   ========================================================================== */
const DIREKTOR_AUSGANG = {
  start:{ wer:'DIREKTOR', text:'Da ist ja unser Nachsitzer. Mit einem Schluessel, der nicht ihm gehoert.',
    wahl:[
      { txt:'Sie haben mich eingeschlossen.',     wenn:{mut:40}, geh:'versehen' },
      { txt:'Ich wollte nur nach Hause.',         geh:'hause' },
      { txt:'(Rennen.)',                          geh:'rennen' },
    ], zeit:8, standard:1 },
  versehen:{ wer:'DIREKTOR', text:'...Das war ein Versehen. Geh. Und kein Wort zu deinen Eltern.',
    tu:{mut:5, flag:'direktorVersehen'}, geh:'@raus' },
  hause:{ wer:'DIREKTOR', text:'Montag, sieben Uhr. Mein Buero. Und jetzt raus.',
    tu:{ruf:-2, flag:'direktorMontag'}, geh:'@raus' },
  rennen:{ wer:'DIREKTOR', text:'HEY! BLEIB STEHEN!', tu:{mut:3, ruf:-3, flag:'direktorGeflohen'}, geh:'@raus' },
};
"""
ersetze("""function gefangen(L){""", CODE + "\nfunction gefangen(L){")
ersetze("""  S.hp--; S.modus='gefangen'; S.szeneT=0; S.ruettel=6; SFX.gefangt();""",
        """  S.hp--; S.erwischtZahl++; S.modus='gefangen'; S.szeneT=0; S.ruettel=6; SFX.gefangt();""")

# Ausgang
ersetze("""    if(amAusgang(S.x)){
      if(S.hatSchluessel){ starteCutscene(); }""",
"""    if(amCodespind()){ codeOeffnen(); }
    else if(amAusgang(S.x)){
      if(S.hatSchluessel&&S.erwischtZahl>0&&!S.direktorGesprochen){
        S.direktorGesprochen=true;
        starteGespraech(DIREKTOR_AUSGANG,'start',()=>starteCutscene());
      }
      else if(S.hatSchluessel){ starteCutscene(); }""")

# Eingabe im Code-Fenster
ersetze("""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;""",
"""addEventListener('keydown',e=>{
  if(keys[e.code]) return; keys[e.code]=true;
  if(S.codeOffen){
    if(['KeyE','Enter','Space'].includes(e.code)){ e.preventDefault(); codeProbieren(); return; }
    if(codeTaste(e.code)){ e.preventDefault(); return; }
  }""")
# Waehrend das Codefenster offen ist, steht man still
ersetze("""  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }
  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt,true); return; }""",
"""  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }
  if(S.codeOffen){ aktionPuffer.length=0; lehrerLogik(dt); return; }
  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt,true); return; }""")

# Handy-Knoepfe
ersetze("""  if(amAusgang(S.x))          was=S.hatSchluessel?'RAUS':'ZU';""",
"""  if(S.codeOffen)            return {aktion:'PROBIEREN', zwei:null};
  if(amCodespind())          was=flag('ferdiSpindOffen')?'LEER':'CODE';
  else if(amAusgang(S.x))    was=S.hatSchluessel?'RAUS':'ZU';""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 1 Teil 1: Routinen, Keller, Codespind, Direktor')
