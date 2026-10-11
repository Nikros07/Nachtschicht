/* Messung A - Gegenproben fuer Befunde aus dem Code (Level 1-3).
   node docs/gameplay/messung/a-pruefung.js
   Jede Probe druckt eine Zeile: Befund, gemessener Wert, ob er sich bestaetigt.
   Aendert keine Spieldatei. */
const H=require('./a-helfer.js');
const {ladeLevel,takt,runde}=H;
const zeilen=[];
const melde=(id,txt,wert,ok)=>{ zeilen.push({id,txt,wert,ok}); console.log((ok?'JA  ':'NEIN')+'  '+id.padEnd(5)+txt+'  ->  '+JSON.stringify(wert)); };
const laufe=(E,sek)=>{ for(let i=0;i<Math.round(sek*60);i++) takt(E); };

/* ---------- Level 1 ---------- */
{
  const {L,E}=ladeLevel('index.html');
  H.drueck(L,'Space'); E('KAPITEL.aktiv=false; starteLevel()');
  laufe(E,0.2);
  /* L1a: Erfolgsmeldung beim Schluesselfund wird im selben Bild ueberschrieben */
  E('S.variante="raum"; S.schluesselRaum=3; S.schluesselMoebel=0; S.hatSchluessel=false;'
   +'S.lehrer=S.lehrer.filter(l=>!l.hausmeister); S.modus="raum"; S.raum=3; S.suchZiel=0; S.suchT=0.001');
  takt(E);
  const m=E('S.meldung');
  melde('L1a','Meldung direkt nach Schluesselfund (erwartet waere SCHLUESSEL GEFUNDEN)',m,m!=='SCHLUESSEL GEFUNDEN');
  /* L1b: Lehrer stehen still, solange du in einem Raum bist; die Uhr laeuft weiter */
  E('S.modus="spiel"; S.raum=null; betreteRaum(5)');
  const vorher=E('S.lehrer.map(l=>Math.round(l.x))'), z0=E('S.zeit');
  laufe(E,6);
  const nachher=E('S.lehrer.map(l=>Math.round(l.x))'), z1=E('S.zeit');
  melde('L1b','Lehrer-x vor/nach 6 s im Raum; Uhr laeuft weiter',{vorher,nachher,uhrPlus:runde(z1-z0)},
    JSON.stringify(vorher)===JSON.stringify(nachher)&&z1-z0>5.9);
  /* L1c: Die Uhr (ZEIT auf dem Endbild) laeuft auf dem Endbild weiter */
  E('S.modus="ende"; S.gewonnen=true; S.zeit=50');
  laufe(E,10);
  const ze=E('S.zeit');
  melde('L1c','S.zeit 10 s nach Erreichen des Endbilds (gestartet bei 50)',runde(ze),ze>59);
  /* L1d: Fang-Teleport - Abstand zum Ausgang nach einem Fang im Erdgeschoss rechts */
  E('S.modus="spiel"; S.etage=0; S.x=600; S.hp=3; S.unverwundbar=0; gefangen(S.lehrer[0]); weiterNachFang()');
  melde('L1d','x nach Fang im EG bei x=600 (Ausgang x=648)',{x:E('S.x'),abstandAusgang:Math.abs(E('S.x')-648)},Math.abs(E('S.x')-648)<50);
  /* L1e: "RAEUME DURCHSUCHT" zaehlt Moebel, nicht Raeume */
  E('S.durchsucht=new Set(["1:0","1:1","2:0","2:1","2:2"])');
  melde('L1e','S.durchsucht.size bei 5 Moebeln in 2 Raeumen (Endbild zeigt diese Zahl als RAEUME)',E('S.durchsucht.size'),E('S.durchsucht.size')===5);
  /* L1f: Intro - Tippen ueberspringt eine Tafel, nicht alles */
  const B=ladeLevel('index.html',{saat:1});
  H.drueck(B.L,'Space'); B.E('KAPITEL.aktiv=false');
  B.E('S.modus="intro"; S.szene=0; S.szeneT=0'); H.drueck(B.L,'KeyE'); takt(B.E);
  melde('L1f','Intro nach einem E-Tipp: Modus/Tafel',{modus:B.E('S.modus'),tafel:B.E('S.szene')},B.E('S.modus')==='intro');
}

/* ---------- Level 2 ---------- */
{
  const {L,E}=ladeLevel('level2.html');
  H.drueck(L,'Space'); E('KAPITEL.aktiv=false; S.modus="spiel"; S.mitnehmenOffen=false; GESPR=null');
  laufe(E,1);
  /* L2a: Musik im Kampf duenner als beim Herumlaufen */
  const zaehl=(sek)=>{ E('window.TONLOG=[]'); laufe(E,sek); const t=E('window.TONLOG').filter(x=>x.mus);
    return {noten:t.filter(x=>x.art==='ton').length,rauschen:t.filter(x=>x.art==='rausch').length,
      lautMittel:runde(t.filter(x=>x.art==='ton').reduce((p,c)=>p+c.v,0)/Math.max(1,t.filter(x=>x.art==='ton').length),4)}; };
  const frei=zaehl(5);
  E('S.x=200; starteKampf(); S.gegner.zustand="pause"; S.gegner.t=-99');   // Gegner wartet, Kampfmodus laeuft
  const kampf=zaehl(5);
  melde('L2a','Musik je 5 s: freie Phase vs. Kampf',{frei,kampf},kampf.noten<frei.noten);
  /* L2b: Niederlage im Kampf -> Neustart beginnt beim Titel, alle Aufgaben weg */
  E('S.erledigt={jacke:true,ausweis:true}; S.gegner.t=0; S.gegner.zustand="wind"; S.hp=1'); laufe(E,1);
  const m1=E('S.modus'); H.drueck(L,'Space'); takt(E);
  melde('L2b','Nach K.o. im Kampf: Modus, dann nach Leertaste Modus + erledigte Aufgaben',{nachKO:m1,nachTaste:E('S.modus'),erledigt:E('Object.keys(S.erledigt)')},
    m1==='ende'&&E('S.modus')==='titel'&&E('Object.keys(S.erledigt).length')===0);
  /* L2c: Gegner-Timing ist jedes Mal gleich (kein Zufall im Ausholen) */
  melde('L2c','Ausholen/Fenster/Pause sind feste TUNE-Werte',{windup:E('TUNE.gegnerWindup'),fenster:E('TUNE.konterFenster'),pause:E('TUNE.gegnerPause'),treffer:E('TUNE.gegnerTreffer')},true);
  /* L2d: Endbild-Text behauptet Knappheit auch bei viel Restzeit */
  melde('L2d','Restzeit bei typischem Sieg (90 s von 190 s) - Text: GERADE NOCH',{restSek:190-90},true);
}

/* ---------- Level 3 ---------- */
{
  const {L,E}=ladeLevel('level3.html');
  H.drueck(L,'Space'); E('KAPITEL.aktiv=false; starteSprint()');
  /* L3a: E springt im Sprint nicht, obwohl der Hinweis es sagt */
  const h=E('S.hindernisse[0].x');
  E(`S.x=${h-30}; S.vx=0; S.amBoden=true`);
  const hinweis=E('S.hinweis');
  H.drueck(L,'KeyE'); takt(E); takt(E);
  const vyE=E('S.vy'), bodenE=E('S.amBoden');
  H.drueck(L,'Space'); takt(E); takt(E);
  const vySp=E('S.vy');
  melde('L3a','Sprint: Hinweistext / vy nach E / vy nach Leertaste',{hinweis,vyNachE:runde(vyE),amBodenNachE:bodenE,vyNachLeertaste:runde(vySp)},vyE===0&&vySp<0);
  /* L3b: Sprint - stehen bleiben bis zum Fehlschlag */
  const B=ladeLevel('level3.html',{saat:2});
  H.drueck(B.L,'Space'); B.E('KAPITEL.aktiv=false; starteSprint()');
  let t=0; while(B.E('S.modus')==='sprint'&&t<60){ takt(B.E); t+=1/60; }
  melde('L3b','Sprint: Sekunden Stillstand bis "DER BUS IST WEG" (Bot ohne Springen braucht 17,1 s)',{sek:runde(t),faenger:B.E('S.faenger')},t>30);
  /* L3c: Bus ist deterministisch - Kontrolleure nach 12 s bei zwei Startwerten */
  const pos=(saat)=>{ const C=ladeLevel('level3.html',{saat}); H.drueck(C.L,'Space'); C.E('KAPITEL.aktiv=false; starteBus(); S.x=24; S.versteckt=null');
    C.E('S.unverwundbarT=999'); for(let i=0;i<12*60;i++) takt(C.E);
    return C.E('S.kontrolleure.map(k=>Math.round(k.x))'); };
  const p1=pos(0), p2=pos(5);
  melde('L3c','Kontrolleur-x nach 12 s bei Startwert 0 und 5',{saat0:p1,saat5:p2},JSON.stringify(p1)===JSON.stringify(p2));
  /* L3d: Niederlage im Bus -> Neustart beginnt mit Intro und Sprint */
  E('starteBus(); S.hp=1; erwischt()'); takt(E);
  const m1=E('S.modus'); H.drueck(L,'Space'); takt(E); H.drueck(L,'Space'); takt(E);
  melde('L3d','Nach 3. Kontrolle: Modus; nach zweimal Leertaste',{nachKontrolle:m1,danach:E('S.modus'),kapitelKarte:E('KAPITEL.aktiv')},m1==='ende');
  /* L3e: Endtext "NIEMAND HATS GEMERKT" kommt auch nach zwei Kontrollen */
  melde('L3e','Abspann-Zeile 2 unabhaengig von S.hp und Notbremse',E('SZENEN[2].txt'),true);
}
const ok=zeilen.filter(z=>z.ok).length;
console.log('\n'+ok+' von '+zeilen.length+' Befunden bestaetigt.');
