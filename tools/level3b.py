# -*- coding: utf-8 -*-
"""Level 3, zweiter Teil: die Gespraeche, die Tiefe in der Bewegung, der
Sichtkegel der Kontrolleure und das Zeichnen nach Tiefe.

Der erste Teil hat nur Platz geschaffen. Hier kommt das Verhalten rein.
"""
import io

p = 'level3.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu):
    global s
    assert alt in s, 'nicht gefunden: ' + alt[:80]
    s = s.replace(alt, neu, 1)


# ====================================================== GESPRAECHSBAEUME ====
BAEUME = r"""
/* ==========================================================================
   DIE GESPRAECHE IM BUS
   Drei Fahrgaeste, drei verschiedene Arten, an den Kontrolleuren
   vorbeizukommen - keiner davon ist noetig, jeder ist ein anderer Preis.

   Schrift: der 3x5-Font kann keine Umlaute. ae/oe/ue/ss ausschreiben.
   ========================================================================== */

/* DER LAUTE. Wer ihn anstachelt, bekommt das groesste Zeitfenster im Level
   und zahlt mit Ruf - man schickt jemanden vor, der es nicht mitbekommt. */
const BETRUNKENER = {
  start:{ wer:'DER LAUTE', text:'Eyyy. Setz dich. Ich erzaehl dir was.',
    wahl:[
      { txt:'Die kontrolleure suchen dich.',  geh:'aufgestachelt' },
      { txt:'Lass mal, ich muss weiter.',     geh:'abgewimmelt' },
      { txt:'Hast du einen fahrschein?',      geh:'schein' },
      { txt:'Erzaehl.',                       wenn:{mut:40}, geh:'geschichte' },
    ], zeit:9, standard:1 },

  aufgestachelt:{ wer:'DER LAUTE', text:'MICH? MICH SUCHEN SIE? DIE SOLLEN MAL HERKOMMEN!',
    tu:{ruf:-6, flag:'busSzene'}, geh:'ende' },

  abgewimmelt:{ wer:'DER LAUTE', text:'Alle muessen immer weiter. Keiner hat zeit.', geh:'ende' },

  schein:{ wer:'DER LAUTE', text:'Fahrschein. Guter witz. Nimm, ich brauch den nicht mehr.',
    tu:{nimm:'ALTER FAHRSCHEIN', mag:['DER LAUTE',5]}, geh:'ende' },

  geschichte:{ wer:'DER LAUTE', text:'Ich war auch mal wie du. Nur schneller.',
    tu:{mut:4}, geh:'ende' },

  ende:null,
};

/* DIE FRAU. Kostet nichts ausser Zeit und sagt dir, wo die Kontrolleure
   stehen - das ist die vorsichtige Loesung fuer Leute, die nicht pokern. */
const FRAU = {
  start:{ wer:'DIE FRAU', text:'Sie sehen aus, als haetten Sie keinen fahrschein.',
    wahl:[
      { txt:'Hab ich auch nicht.',            geh:'ehrlich' },
      { txt:'Doch, klar hab ich einen.',      geh:'gelogen' },
      { txt:'Schoener hund.',                 geh:'hund' },
    ], zeit:8, standard:0 },

  ehrlich:{ wer:'DIE FRAU', text:'Dachte ich mir. Zwei sind im mittleren wagen, einer ganz hinten.',
    tu:{flag:'busTipp', ruf:3}, geh:'ende' },

  gelogen:{ wer:'DIE FRAU', text:'Natuerlich. Dann zeigen Sie ihn doch gleich vor.',
    tu:{ruf:-2}, geh:'ende' },

  hund:{ wer:'DIE FRAU', text:'Der heisst Rocky. Und ja, er faehrt auch schwarz.',
    tu:{mag:['DIE FRAU',8], flag:'busTipp'}, geh:'ende' },

  ende:null,
};

/* JONAS. Der Zuwachs fuer die Crew. Er kommt nur mit, wenn ihm die Nacht
   gross genug klingt - deshalb haengt der beste Weg am Mut. */
const JONAS_GESPRAECH = {
  start:{ wer:'JONAS', text:'Alter. Was machst du denn hier?',
    wahl:[
      { txt:'Wir gehen feiern. Kommst du mit?', geh:'einladen' },
      { txt:'Fahre nur heim.',                  geh:'abgesagt' },
      { txt:'Weg da, kontrolle.',               geh:'gewarnt' },
    ], zeit:8, standard:1 },

  einladen:{ wer:'JONAS', text:'Wo denn hin? Wenn du sagst zu dir nach hause, steig ich aus.',
    wahl:[
      { txt:'Club. Der grosse.',        wenn:{mut:35}, geh:'dabei' },
      { txt:'Weiss noch nicht genau.',  geh:'unsicher' },
    ], zeit:7, standard:1 },

  dabei:{ wer:'JONAS', text:'Na endlich. Ich hab seit drei wochen nichts gemacht.',
    tu:{crew:'JONAS', mut:5, mag:['JONAS',10], flag:'jonasDabei'}, geh:'ende' },

  unsicher:{ wer:'JONAS', text:'Sag bescheid, wenn ihr es wisst. Ich sitz hier.',
    geh:'ende' },

  abgesagt:{ wer:'JONAS', text:'Schade. Gruess die anderen.', tu:{mag:['JONAS',-3]}, geh:'ende' },

  gewarnt:{ wer:'JONAS', text:'Kontrolle? Ich hab ein ticket, du nicht. Viel spass.',
    tu:{mag:['JONAS',-2]}, geh:'ende' },

  ende:null,
};

/* DER AUTOMAT. Kein Gespraech, ein Kaufvorgang - aber derselbe Baum, damit
   die Entscheidung genauso aussieht wie jede andere. */
const AUTOMAT = {
  start:{ wer:'AUTOMAT', text:'EINZELFAHRT ' + TUNE.ticketPreis + ' EURO. BITTE BETRAG EINWERFEN.',
    wahl:[
      { txt:'Kaufen.',                wenn:{geld:TUNE.ticketPreis}, geh:'gekauft' },
      { txt:'Zu teuer. Weiter.',      geh:'ende' },
      { txt:'Draufhauen.',            wenn:{mut:55}, geh:'geschlagen' },
    ], zeit:0 },

  gekauft:{ wer:'AUTOMAT', text:'FAHRSCHEIN ENTNEHMEN. GUTE FAHRT.',
    tu:{geld:-TUNE.ticketPreis, flag:'busTicket', nimm:'FAHRSCHEIN', ruf:2}, geh:'ende' },

  geschlagen:{ wer:'AUTOMAT', text:'STOERUNG. BITTE PERSONAL VERSTAENDIGEN.',
    tu:{ruf:-5, flag:'automatKaputt'}, geh:'ende' },

  ende:null,
};

/* DIE NOTBREMSE. Der Notausgang aus jeder Lage - und der teuerste. */
const NOTBREMSE = {
  start:{ wer:'NOTBREMSE', text:'MISSBRAUCH WIRD BESTRAFT.',
    wahl:[
      { txt:'Ziehen.',     geh:'gezogen' },
      { txt:'Lieber nicht.', geh:'ende' },
    ], zeit:0 },

  gezogen:{ wer:'', text:'Der bus steht. Alle drei rennen nach vorn.',
    tu:{ruf:TUNE.notbremsRuf, flag:'notbremse'}, geh:'ende' },

  ende:null,
};

/* Wer welchen Baum hat. Getrennt von den Baeumen, damit die Baeume reine
   Daten bleiben. */
const BAUM_FUER={ betrunkener:BETRUNKENER, frau:FRAU, jonas:JONAS_GESPRAECH,
                  automat:AUTOMAT, notbremse:NOTBREMSE };

/* Der naechste Fahrgast in Reichweite - Abstand zaehlt in BEIDEN Achsen,
   sonst redet man quer durch den halben Bus mit jemandem. */
function naherFahrgast(){
  let bester=null, d0=1e9;
  for(const f of FAHRGAESTE){
    if(Math.abs(f.t-S.tiefe)>0.3) continue;
    const d=Math.abs(f.x-S.x);
    if(d<TUNE.redeReichweite&&d<d0){ bester=f; d0=d; }
  }
  return bester;
}

/* Was nach einem Gespraech passiert. Die Baeume selbst setzen nur Flags -
   die Folgen im Level stehen hier, an einer Stelle. */
function gespraechFolgen(f){
  S.geredet[f.id]=true;
  if(f.id==='betrunkener'&&flag('busSzene')){
    /* Alle lassen alles stehen und gehen zu ihm. Das ist das Fenster. */
    S.ablenkT=TUNE.ablenkDauer;
    S.kontrolleure.forEach(k=>{ k.zielX=f.x; });
    meldung('ER MACHT EINE SZENE - JETZT',2.2);
  }
  if(f.id==='notbremse'&&flag('notbremse')){
    S.ablenkT=TUNE.notbremsAblenk;
    S.kontrolleure.forEach(k=>{ k.zielX=TUNE.einstiegX+20; });
    S.ruettel=10; SFX.ruckel();
    meldung('DER BUS STEHT',2.2);
  }
  if(f.id==='automat'&&flag('busTicket')){
    S.ticket=true;
    meldung('FAHRSCHEIN - JETZT KANN DIR KEINER',2.4);
  }
  if(f.id==='jonas'&&flag('jonasDabei')) meldung('JONAS KOMMT MIT',2);
  if(f.id==='frau'&&flag('busTipp')) zeigeHinweis('ZWEI IM MITTLEREN WAGEN, EINER GANZ HINTEN',3.5);
}
"""

ersetze("""/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""",
        BAEUME + """
/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""")


# ========================================================= BEWEGUNG/TIEFE ====
ersetze("""  /* Bewegung aus dem Versteck bricht es automatisch ab */
  if(S.versteckt&&(linksAn||rechtsAn)) verlasseVersteck();""",
"""  if(S.ablenkT>0){
    S.ablenkT-=dt;
    if(S.ablenkT<=0) S.kontrolleure.forEach(k=>{ k.zielX=null; });
  }

  /* Bewegung aus dem Versteck bricht es automatisch ab */
  if(S.versteckt&&(linksAn||rechtsAn||hochAn||runterAn)) verlasseVersteck();

  /* Tiefe. Ausgeschrieben statt bewegeTiefe(S,...): die Engine-Funktion
     schreibt auf obj.t - und S.t ist hier die Spielzeit. Der Aufruf wuerde
     jeden Frame die Uhr ueberschreiben, ohne dass etwas abstuerzt. */
  if(!S.versteckt){
    const rt=(runterAn?1:0)-(hochAn?1:0);
    S.vt += (rt*TUNE.tiefeTempo-S.vt)*Math.min(1,14*dt);
    S.tiefe = Math.max(0,Math.min(1,S.tiefe+S.vt*dt));
  } else S.vt=0;""")

# Sichtkegel in der Flaeche statt auf der Linie
ersetze("""  if(!S.versteckt&&S.unverwundbarT<=0){
    let gesehen=false;
    for(const k of S.kontrolleure){
      const frontDist=(S.x-k.x)*k.blick;
      if(frontDist>0&&frontDist<TUNE.sichtWeite){ gesehen=true; break; }
    }""",
"""  if(!S.versteckt&&S.unverwundbarT<=0&&!S.ticket){
    /* Sichtkegel in der Flaeche: wer weit genug in der Sitzreihe ist,
       liegt seitlich ausserhalb und kommt vorbei. Genau davon lebt die
       Tiefe - ohne die Kappung in welt.js waere der Kegel am Ende so
       breit wie der Bus und Ausweichen braechte nichts. */
    let gesehen=false;
    for(const k of S.kontrolleure){
      if(imSichtkegel({x:k.x,t:k.t,blick:k.blick},{x:S.x,t:S.tiefe},
                      TUNE.sichtWeite,TUNE.kegelOeffnung)){ gesehen=true; break; }
    }""")

# Patrouille: Ziel anlaufen, wenn abgelenkt
ersetze("""  for(const k of S.kontrolleure){
    if(k.pauseT>0){ k.pauseT-=dt; continue; }
    k.x+=k.blick*TUNE.kontrolleurTempo*dt;
    if(k.x>=k.maxX){ k.x=k.maxX; k.blick=-1; k.pauseT=TUNE.patrouillePause; }
    else if(k.x<=k.minX){ k.x=k.minX; k.blick=1; k.pauseT=TUNE.patrouillePause; }
  }""",
"""  for(const k of S.kontrolleure){
    /* Abgelenkt: sie verlassen ihre Zone und gehen zum Laerm. Solange sie
       unterwegs sind, schauen sie dorthin und nicht auf dich. */
    if(k.zielX!=null){
      const d=k.zielX-k.x;
      if(Math.abs(d)>3){ k.blick=Math.sign(d); k.x+=k.blick*TUNE.kontrolleurTempo*1.6*dt; }
      continue;
    }
    /* Zurueck auf Posten, nachdem die Ablenkung vorbei ist */
    if(Math.abs(k.x-k.heim)>60){
      const d=k.heim-k.x; k.blick=Math.sign(d);
      k.x+=k.blick*TUNE.kontrolleurTempo*1.2*dt; continue;
    }
    if(k.pauseT>0){ k.pauseT-=dt; continue; }
    k.x+=k.blick*TUNE.kontrolleurTempo*dt;
    if(k.x>=k.maxX){ k.x=k.maxX; k.blick=-1; k.pauseT=TUNE.patrouillePause; }
    else if(k.x<=k.minX){ k.x=k.minX; k.blick=1; k.pauseT=TUNE.patrouillePause; }
  }""")

# Aktion: erst Fahrgast, dann Versteck
ersetze("""  while(aktionPuffer.length){
    aktionPuffer.shift();
    if(S.versteckt) verlasseVersteck();
    else {
      const spot=naheVersteck();
      if(spot){ S.versteckt=spot.id; SFX.verstecken(); meldung('VERSTECKT',1); }
      else { meldung('HIER NICHT',0.8); SFX.nichts(); }
    }
  }""",
"""  while(aktionPuffer.length){
    aktionPuffer.shift();
    if(S.versteckt){ verlasseVersteck(); continue; }
    /* Reden geht vor Verstecken: wer direkt vor jemandem steht, meint den. */
    const f=naherFahrgast();
    if(f){
      starteGespraech(BAUM_FUER[f.id],'start',()=>gespraechFolgen(f));
      continue;
    }
    const spot=naheVersteck();
    if(spot){ S.versteckt=spot.id; SFX.verstecken(); meldung('VERSTECKT',1); }
    else { meldung('HIER NICHT',0.8); SFX.nichts(); }
  }""")

# Verstecke brauchen jetzt auch die Tiefe
ersetze("""function naheVersteck(){
  let besten=null,d0=1e9;
  for(const v of VERSTECKE){ const d=Math.abs(v.x-S.x); if(d<TUNE.versteckReichweite&&d<d0){ besten=v; d0=d; } }
  return besten;
}""",
"""function naheVersteck(){
  let besten=null,d0=1e9;
  for(const v of VERSTECKE){
    /* Verstecke liegen alle in der Sitzreihe - wer im Gang steht, greift
       ins Leere. Damit ist auch das Verstecken eine Bewegung. */
    if(Math.abs((v.t!=null?v.t:TUNE.sitzTiefe)-S.tiefe)>0.3) continue;
    const d=Math.abs(v.x-S.x);
    if(d<TUNE.versteckReichweite&&d<d0){ besten=v; d0=d; }
  }
  return besten;
}""")

# Update: Gespraech haelt alles an
ersetze("""  if(S.modus==='intro'){ intro(dt); return; }
  if(S.modus==='sprint'){ sprint(dt); return; }""",
"""  if(S.modus==='intro'){ intro(dt); return; }
  /* Waehrend eines Gespraechs steht der Bus still - sonst laeuft dir ein
     Kontrolleur waehrend der Antwortauswahl in den Ruecken. */
  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }
  if(S.modus==='sprint'){ sprint(dt); return; }""")

ersetze("""  hud();
  if(S.blitz>0){""",
"""  hud();
  zeichneGespraech();
  if(S.blitz>0){""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 3: Gespraeche, Tiefe und Sichtkegel eingebaut')
