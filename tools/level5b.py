# -*- coding: utf-8 -*-
"""Level 5, Teil 2: das Verhalten.

Gespraechsausgaenge, Marvin, die Ecke, die kleine Schlaegerei, das neue
update() und das Ende, das je nach Nacht anders erzaehlt wird.
"""
import io

p = 'level5.html'
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


LOGIK = r"""
/* ==========================================================================
   WAS IN REICHWEITE IST
   Eine Stelle, die alle fragen: die Aktion, die Knopf-Aufschrift am Handy
   und das blinkende E. Sonst steht auf dem Knopf etwas anderes, als er tut.
   ========================================================================== */
function naechstesZiel(){
  const r=reichweiteAktuell();
  let bestes=null, d0=1e9;
  const pruefe=(obj,art,tiefeOk)=>{
    if(!tiefeOk) return;
    const d=Math.abs(obj.x-S.x);
    if(d<r&&d<d0){ bestes={art,obj}; d0=d; }
  };
  for(const z of ZIELE){
    if(z.stand!=='offen') continue;
    pruefe(z,'reden',Math.abs(z.t-S.tiefe)<=TUNE.redeTiefe);
  }
  pruefe(BARTHEKE,'bar',S.tiefe<=TUNE.barTiefe);
  pruefe(WASCHBECKEN,'wasser',S.tiefe<=TUNE.barTiefe);
  pruefe(AUSGANG,'tuer',true);
  return bestes;
}

/* ==========================================================================
   GESPRAECHE UND IHRE FOLGEN
   Die Baeume setzen Zuneigung und Flags. Was danach im Club passiert,
   steht hier an einer Stelle.
   ========================================================================== */
function redeMit(z){
  /* Der Pegel lebt in diesem Level in S.pegel, die Bedingungen der Baeume
     lesen ihn aus dem Speicher. Vorher abgleichen, sonst gilt der Wert vom
     Levelstart - und "betrunken" waere nie freigeschaltet. */
  speicherePegel(S.pegel);
  S.vx=0; S.vt=0;
  starteGespraech(BAUM_FUER[z.id],'start',e=>gespraechEnde(z,e));
}
function gespraechEnde(z,e){
  S.pegel=ladePegel();        // Shots aus dem Gespraech zaehlen
  const m=S.marvin;
  if(e==='@tanz'){ starteMinigame('tanz',z); return; }
  if(e==='@ja'){
    if(m.ziel===z) m.wut=true;
    starteEcke(z); return;
  }
  if(e==='@nummer'){
    z.stand='nummer'; S.erfolge++;
    wirke({ruf:4, flag:'schreibt_'+z.id});
    if(m.ziel===z) m.wut=true;
    S.confidenceT=TUNE.confidenceDauer;
    meldung('NUMMER VON '+z.name,2); SFX.erledigt(); return;
  }
  if(e==='@nett'){
    z.stand='nett'; wirke({ruf:2});
    meldung('FREUNDLICH AUSEINANDER',1.6); return;
  }
  if(e==='@nein'){
    /* Eine Abfuhr bleibt nicht unter vier Augen. Der Ruf sinkt - und mit
       ihm die Antworten, die bei den anderen noch gehen. */
    z.stand='nein'; S.abfuhren++;
    wirke({ruf:TUNE.abfuhrRuf, mut:-4});
    S.geknicktT=TUNE.geknicktDauer; S.confidenceT=0;
    meldung(S.abfuhren>1?'DAS SPRICHT SICH RUM':'AUA. ABFUHR',1.8); SFX.aua(); return;
  }
  /* Neutral beendet: man darf nochmal hin. */
}

/* ==========================================================================
   DIE ECKE
   Erzaehlt statt gezeigt. Das Bild wird dunkel, die Zeilen kommen einzeln,
   man tippt weiter. Danach ist der Abend ein anderer.
   ========================================================================== */
function starteEcke(z){
  S.modus='ecke'; S.ecke={ z, i:0, t:0 }; S.vx=0;
}
function eckeWeiter(){
  const e=S.ecke; if(!e) return;
  if(e.t<0.35) return;              // kein versehentliches Durchtippen
  e.i++; e.t=0;
  if(e.i>=ECKE[e.z.id].length) eckeVorbei();
}
function eckeTakt(dt){
  const e=S.ecke; if(!e) return;
  e.t+=dt;
  if(e.t>3.4) eckeWeiter();
  aktionPuffer.length=0;
}
function eckeVorbei(){
  const z=S.ecke.z;
  S.ecke=null; S.modus='spiel';
  z.stand='ja'; S.erfolge++;
  wirke({ruf:8, mut:6, flag:'clubJa_'+z.id, mag:[z.name,15]});
  setzeFlag('schreibt_'+z.id);
  /* Kira faehrt mit dem Taxi - danach ist sie weg. */
  if(z.id==='kira') z.weg=true;
  S.confidenceT=TUNE.confidenceDauer; S.geknicktT=0;
  meldung('DER ABEND IST EIN ANDERER',2.4); SFX.sieg();
}

/* ==========================================================================
   MARVIN
   Geht dieselben Leute an wie du. Steht er lange genug ungestoert bei
   jemandem, mit dem du noch nicht geredet hast, ist sie fuer heute weg.
   Er zoegert, solange du daneben stehst - Konkurrenz sieht man.
   Nimmst du ihm eine weg, auf die er zuging, wird er sauer und stellt dich.
   ========================================================================== */
function marvinTakt(dt){
  const m=S.marvin;
  if(m.fertig) return;
  if(!m.da){
    if(S.zeit<TUNE.marvinKommtNach) return;
    m.da=true; m.x=30; m.t=0.5; setzeFlag('marvinKennt');
    meldung('MARVIN IST DA',1.8);
  }
  /* Wut: er kommt direkt auf dich zu. */
  if(m.wut){
    const dx=S.x-m.x;
    m.blick=Math.sign(dx)||1;
    m.x+=m.blick*TUNE.marvinTempo*1.8*dt;
    m.t+=(S.tiefe-m.t)*Math.min(1,2*dt);
    if(Math.abs(dx)<TUNE.marvinStellt&&S.modus==='spiel') marvinStellt();
    return;
  }
  if(m.pause>0){ m.pause-=dt; return; }
  if(!m.ziel||m.ziel.stand!=='offen'){
    const frei=ZIELE.filter(z=>z.stand==='offen'&&Math.abs(z.x-S.x)>40);
    frei.sort((a,b)=>Math.abs(a.x-m.x)-Math.abs(b.x-m.x));
    m.ziel=frei[0]||null; m.beiT=0;
  }
  if(!m.ziel) return;
  const zx=m.ziel.x+11, dx=zx-m.x;
  if(Math.abs(dx)>3){
    m.blick=Math.sign(dx); m.x+=m.blick*TUNE.marvinTempo*dt;
    m.t+=(m.ziel.t+0.06-m.t)*Math.min(1,2*dt);
    return;
  }
  m.blick=-1;
  if(Math.abs(S.x-m.ziel.x)<34){ m.beiT=Math.max(0,m.beiT-dt); return; }
  m.beiT+=dt;
  if(m.beiT>=TUNE.marvinNimmt){
    m.ziel.stand='weg'; m.hat.push(m.ziel.id);
    meldung(m.ziel.name+' IST JETZT MIT MARVIN UNTERWEGS',2.4); SFX.aua();
    m.ziel=null; m.pause=TUNE.marvinPause;
  }
}
function marvinStellt(){
  const m=S.marvin; m.wut=false;
  S.vx=0; S.vt=0;
  starteGespraech(MARVIN_BAUM,'start',e=>{
    if(e==='@kampf') starteKloppe();
    else { m.fertig=true; meldung(flag('marvinRueckzug')?'ER ZIEHT AB':'ER LACHT DICH AUS',1.8); }
  });
}

/* ==========================================================================
   DIE KLEINE SCHLAEGEREI
   Der Vorgeschmack aufs Finale. Im Stroboskop sieht man das Ausholen oft
   nicht - Blocken und Ausweichen in die Tiefe werden wichtiger als Kontern.
   Gewinnen ist nicht noetig: danach fliegen beide raus.
   ========================================================================== */
function starteKloppe(){
  S.modus='kloppe'; S.kloppeStand='kampf';
  S.ich=kaempfer({ x:S.x, t:S.tiefe, blick:1, hp:TUNE.kloppeLeben, maxHp:TUNE.kloppeLeben });
  const mv=gegner('schlaeger', S.x+26, S.tiefe);
  mv.hp=mv.maxHp=TUNE.marvinHp; mv.marvin=true;
  S.gegner=[ mv, gegner('flitzer', S.x-30, Math.min(1,S.tiefe+0.25)) ];
  S.marvin.fertig=true;
  zeigeHinweis('E SCHLAEGT - UMSCHALT BLOCKT - LEERTASTE WEICHT AUS',4);
  SFX.aua();
}
function kloppeVorbei(gewonnen){
  S.kloppeStand=gewonnen?'gewonnen':'verloren';
  wirke(gewonnen?{mut:8,ruf:6,flag:'clubKloppeGewonnen'}:{ruf:-4,flag:'clubKloppeVerloren'});
  S.ich=null; S.gegner=[];
  starteCutscene('rausschmiss');
}
function kloppe(dt){
  kampfStopTakt(dt);
  const z=kampfZeitFaktor(); if(z===0) return;
  const d=dt*z, ich=S.ich;
  kaempferTakt(ich,d);
  const richtung=(rechtsAn?1:0)-(linksAn?1:0);
  const rt=(runterAn?1:0)-(hochAn?1:0);
  if(ich.zustand==='frei'||ich.zustand==='block'){
    if(richtung){ ich.x+=richtung*TUNE.gehTempo*0.62*d; ich.blick=richtung; }
    if(rt) bewegeTiefe(ich,rt,d,TIEFE.tempo*0.8,16);
  }
  ich.x=Math.max(14,Math.min(LEVEL_B-14,ich.x));
  S.x=ich.x; S.tiefe=ich.t;
  if(S.rolleGedrueckt){ S.rolleGedrueckt=false; rolle(ich, rt||(ich.t<0.5?1:-1)); }
  blocke(ich, !!S.blockAn && aktionPuffer.length===0);
  while(aktionPuffer.length){
    aktionPuffer.shift();
    let gekontert=false;
    for(const g of S.gegner){ if(g.hp<=0) continue;
      if(konterVersuch(ich,g,{reichweite:TUNE.kloppeReich})){ gekontert=true; SFX.hit(); break; } }
    if(!gekontert) schlage(ich);
  }
  if(ich.zustand==='schlag'){
    for(const g of S.gegner){ if(g.hp<=0) continue;
      const was=spielerTrifft(ich,g,{reichweite:TUNE.kloppeReich,schaden:1});
      if(was==='treffer'||was==='konter'||was==='gardebruch'){ SFX.hit(); break; } }
  }
  for(const g of S.gegner){ if(g.hp<=0) continue;
    gegnerTakt(g,d,ich);
    if(g.zustand==='schlag'){
      const was=loeseTreffer(g,ich,{reichweite:g.reichweite,schaden:1});
      if(was==='treffer'){ S.ruettel=7; S.blitz=.3; SFX.aua(); }
    }
  }
  if(S.gegner.every(g=>g.hp<=0)) kloppeVorbei(true);
  else if(ich.hp<=0) kloppeVorbei(false);
  kamera(dt);
}

/* ==========================================================================
   WAS DIE KNOEPFE AM HANDY GERADE TUN
   ========================================================================== */
function mobilKontext(){
  if(S.modus==='titel')    return {aktion:'START',  zwei:null};
  if(S.modus==='intro'||S.modus==='cutscene'||S.modus==='ecke') return {aktion:'WEITER', zwei:null};
  if(S.modus==='ende')     return {aktion:S.gewonnen?'WEITER':'NOCHMAL', zwei:null};
  if(S.modus==='pause')    return {aktion:null, zwei:null};
  if(S.modus==='mini')     return {aktion:'JETZT', zwei:null};
  if(S.modus==='kloppe')   return {aktion:'SCHLAG', zwei:'ROLLE', block:true};
  const z=naechstesZiel();
  const txt=!z?null:z.art==='reden'?'REDEN':z.art==='bar'?'AUF EX':z.art==='wasser'?'WASSER':'RAUS';
  return {aktion:txt, zwei:null};
}
"""

ersetze("""/* ==========================================================================
   AKTUALISIEREN
   ========================================================================== */""",
        LOGIK + """
/* ==========================================================================
   AKTUALISIEREN
   ========================================================================== */""")

# --------------------------------------------------- Minispiel: Tanzen ----
ersetze("""  zeigeHinweis(art==='ex'?'E BEIM AUF-EX TREFFEN':'E IM FENSTER TREFFEN',3);""",
        """  zeigeHinweis(art==='ex'?'E BEIM AUF-EX TREFFEN':'IM TAKT: E IM FENSTER TREFFEN',3);""")

alt = s[s.index("  /* Ansprechen */\n  if(erfolgreich){"):s.index("  S.mini=null; S.modus='spiel';\n}", s.index("  /* Ansprechen */"))]
s = s.replace(alt, """  /* Tanzen - danach geht das Gespraech weiter, je nachdem wie es lief. */
  const z=m.ziel;
  S.mini=null; S.modus='spiel';
  if(erfolgreich){ SFX.erledigt(); S.confidenceT=TUNE.confidenceDauer; }
  else SFX.aua();
  speicherePegel(S.pegel);
  starteGespraech(BAUM_FUER[z.id], erfolgreich?'tanzGut':'tanzSchlecht', e=>gespraechEnde(z,e));
  return;
""")

# ------------------------------------------------------------- update ----
funktion('update', r"""
function update(dt){
  S.t+=dt; musik();
  S.ruettel=Math.max(0,S.ruettel-dt*16);
  S.blitz=Math.max(0,S.blitz-dt*2.2);
  if(S.hinweisT>0) S.hinweisT-=dt;
  if(S.meldungT>0) S.meldungT-=dt;
  if(S.modus==='pause'||S.modus==='titel') return;
  if(S.modus==='intro'){ intro(dt); return; }
  /* Waehrend eines Gespraechs steht der Club - auch die Uhr und Marvin. */
  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }
  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt); return; }
  if(S.modus==='ende'){ return; }
  if(S.modus==='ecke'){ eckeTakt(dt); return; }

  S.zeit+=dt;
  const spanne=TUNE.endMinute-TUNE.startMinute;
  S.minute=TUNE.startMinute+Math.min(spanne,S.zeit/TUNE.levelSekunden*spanne);
  /* Um eins geht das Licht an. Keine Niederlage mehr - die Nacht geht
     weiter, nur mit dem, was man bis dahin geschafft hat. */
  if(S.minute>=TUNE.endMinute&&S.modus==='spiel'){ starteCutscene('licht'); return; }

  /* Stroboskop nur auf der Tanzflaeche */
  if(ortBei(S.x).strobe){ const st=stroboskop(); S.dunkel=st.dunkel; S.flacker=st.flacker; }
  else { S.dunkel=Math.max(0,S.dunkel-dt*3); S.flacker=0; }

  if(pruefeBlackout()) return;
  if(S.pegel>0) S.pegel=Math.max(0,S.pegel-TUNE.pegelAbbau*dt);
  S.confidenceT=Math.max(0,S.confidenceT-dt);
  S.geknicktT=Math.max(0,S.geknicktT-dt);
  if(S.stolpernT>0) S.stolpernT=Math.max(0,S.stolpernT-dt);
  if(S.wasserT>0) S.wasserT-=dt;

  if(S.modus==='kloppe'){ kloppe(dt); return; }
  if(S.modus==='mini'){
    while(aktionPuffer.length){ aktionPuffer.shift(); pruefeMinigame(); }
    kamera(dt); return;
  }

  /* Anrempeln im Dunkeln - jetzt in der Flaeche: man kann auch hinter der
     Menge vorbei. */
  if(S.dunkel>TUNE.strobeGefahrAb&&S.stolpernT<=0&&S.confidenceT<=0){
    for(const tz of TANZER){
      if(Math.abs(tz.x-S.x)<8&&Math.abs(tz.t-S.tiefe)<0.14){
        S.stolpernT=TUNE.stolpernDauer; S.vx=0; S.vt=0; S.ruettel=4;
        SFX.stolper(); meldung('ANGERANNT',1.2); break; } }
  }

  /* Bewegung. Tiefe ausgeschrieben statt bewegeTiefe(S,...): S.t ist die
     Spielzeit, siehe WEITER.md. */
  if(S.stolpernT<=0){
    const richtung=(rechtsAn?1:0)-(linksAn?1:0);
    if(richtung) S.blick=richtung;
    const hoechst=TUNE.gehTempo*tempoMultiplikator();
    if(richtung){
      S.vx+=richtung*TUNE.beschleunigung*dt;
      if(Math.abs(S.vx)>hoechst) S.vx=hoechst*Math.sign(S.vx);
    } else {
      const brems=TUNE.bremsung*dt;
      S.vx=Math.abs(S.vx)<=brems?0:S.vx-Math.sign(S.vx)*brems;
    }
    const rt=(runterAn?1:0)-(hochAn?1:0);
    S.vt+=(rt*TUNE.tiefeTempo*tempoMultiplikator()-S.vt)*Math.min(1,14*dt);
  } else S.vt=0;
  S.x+=S.vx*dt;
  S.x=Math.max(14,Math.min(LEVEL_B-14,S.x));
  S.tiefe=Math.max(0,Math.min(1,S.tiefe+S.vt*dt));

  if(tempo2D(S.vx,S.vt)>12){
    S.gehPhase+=tempo2D(S.vx,S.vt)*dt*.09;
    const n=Math.floor(S.gehPhase);
    if(n!==S.schritte){ S.schritte=n; if(n%2===0) SFX.schritt(); }
  }

  marvinTakt(dt);
  if(gespraechAktiv()) return;      // Marvin hat dich gerade gestellt

  while(aktionPuffer.length){
    aktionPuffer.shift();
    const z=naechstesZiel();
    if(!z){ meldung('HIER IST NICHTS',0.8); SFX.nichts(); continue; }
    if(z.art==='reden'){ redeMit(z.obj); return; }
    if(z.art==='bar'){ starteMinigame('ex',z.obj); return; }
    if(z.art==='wasser'){
      if(S.wasserT>0){ meldung('GERADE ERST',0.9); SFX.nichts(); continue; }
      S.pegel=Math.max(0,S.pegel+TUNE.wasserPegel); S.wasserT=TUNE.wasserPause;
      meldung('KALTES WASSER INS GESICHT',1.6); SFX.schluck(); continue;
    }
    if(z.art==='tuer'){ starteCutscene('hinten'); return; }
  }
  kamera(dt);
}""")

# ------------------------------------------------------------ Cutscene ----
ersetze("""const SZENEN=[
  { d:1.0, txt:'' },
  { d:2.2, txt:'DU HAST GENUG LEUTE KENNENGELERNT' },
  { d:2.2, txt:'DRAUSSEN WARTET SCHON DIE NAECHSTE RUNDE' },
  { d:2.4, txt:'AN DER TUER STEHT SEMIH' },
  { d:2.4, txt:'SEMIH KENNT JEDEN HIER' },
  { d:2.0, txt:'MIT IHM KOMMST DU UEBERALL REIN' },
  { d:2.4, txt:'LEVEL 5 GESCHAFFT' },
];
function starteCutscene(){ S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; SFX.sieg(); }""",
"""/* Semih kommt nur mit, wenn die Nacht im Club etwas hergegeben hat. Er
   kennt jeden - und er haengt sich nicht an jemanden, der leer ausgeht. */
const semihKommt=()=>S.erfolge>=1||flag('clubKloppeGewonnen')||wert('ruf')>=60;

/* Wie der Club endet, haengt davon ab, wie man rauskommt. */
function starteCutscene(grund){
  const z=[{ d:0.8, txt:'' }];
  if(grund==='rausschmiss') z.push(
    { d:2.4, txt:'DIE TUERSTEHER SIND SCHNELLER ALS GEDACHT.' },
    { d:2.4, txt:'ZWEI GREIFEN DICH. ZWEI GREIFEN MARVIN.' },
    { d:2.4, txt:flag('clubKloppeGewonnen')?'ER BLUTET. DU NICHT.':'DEINE LIPPE BLUTET.' },
    { d:2.4, txt:'UND DANN STEHST DU DRAUSSEN.' });
  else if(grund==='licht') z.push(
    { d:2.4, txt:'UM EINS GEHT DAS LICHT AN.' },
    { d:2.6, txt:'ALLE SEHEN PLOETZLICH SO AUS, WIE SIE SIND.' },
    { d:2.2, txt:'RAUS HIER.' });
  else z.push(
    { d:2.4, txt:'DU GEHST HINTEN RAUS.' },
    { d:2.2, txt:'DIE LUFT IST KALT UND TUT GUT.' });
  if(semihKommt()) z.push(
    { d:2.4, txt:'AN DER TUER STEHT SEMIH.' },
    { d:2.4, txt:'SEMIH KENNT JEDEN. AUCH DIE AFTERHOUR.' });
  else z.push(
    { d:2.6, txt:'KEINER WARTET AUF DICH. ALSO WEITER.' });
  z.push({ d:2.4, txt:'LEVEL 5 GESCHAFFT' });
  S.szenen=z;
  S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; SFX.sieg();
}""")
ersetze("SZENEN[S.szene]", "S.szenen[S.szene]", 2)
ersetze("S.szene>=SZENEN.length", "S.szene>=S.szenen.length")

ersetze("""function levelGeschafft(){
  speichereCrew('SEMIH');""",
"""function levelGeschafft(){
  if(semihKommt()) speichereCrew('SEMIH');
  setzeKapitel(6);""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 5 Teil 2: Verhalten')
