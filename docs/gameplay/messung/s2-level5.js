/* Pruefstand Stufe 2, Level 5 (Club): Tanzen im Takt, Club-Ereignisse, Rang.
   Ohne Browser, ohne Ton (AC ist eine Attrappe, MUSIK.schlag() liefert null,
   deshalb laeuft die eigene Takt-Uhr mit TUNE.tanzBpm).

   node docs/gameplay/messung/s2-level5.js     (aus der Projektwurzel)

   (a) das neue Element wirkt: Tanzen auf den Schlag, daneben, Combo, ON FIRE
   (b) die Club-Ereignisse wirken: LICHT, NEBEL, DJ, SHOT - je Zustand vorher/nachher
   (c) WERTUNG.abschluss liefert bei einem Levelende genau einen Rang (zwei Faelle) */
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));

const DT=1/60;
const L=N.lade('level5.html','?lektion=0');
const E=c=>L.api.ev(c);
const schritt=(n=1)=>{ for(let i=0;i<n;i++){ L.api.ev('update('+DT+')'); L.api.ev('draw('+DT+')'); } };
const taste=(code)=>{ L.taste(code,true); schritt(1); L.taste(code,false); };
const PER='(60/TUNE.tanzBpm)';
/* Bis kurz vor den Schlag (ph = 0) oder kurz vor die Mitte zwischen zwei Schlaegen laufen. */
const aufSchlag=()=>{ for(let i=0;i<400;i++){
  const ph=E('((S.t%'+PER+')+'+PER+')%'+PER);
  if(ph<=DT/2||+E(PER)-ph<=DT/2) return; schritt(1); } };
const aufMitte=()=>{ for(let i=0;i<400;i++){
  const ph=E('((S.t%'+PER+')+'+PER+')%'+PER);
  if(Math.abs(ph-(+E(PER))/2)<=DT/2) return; schritt(1); } };
const zust=()=>E('({combo:S.tanzCombo,beste:S.tanzBeste,pose:+S.tanzPoseT.toFixed(2),ruf:wert("ruf"),'
  +'modus:S.modus,art:naechstesZiel()&&naechstesZiel().art})');

let fehler=0;
const pruefe=(name,ok)=>{ console.log((ok?'  OK     ':'  FEHLT  ')+name); if(!ok) fehler++; };

/* ---- Start: Spiel auf der Tanzflaeche (x 300 liegt in TANZFLAECHE) ---- */
E("neuesSpiel(); S.modus='spiel'; S.x=300; S.tiefe=0.5; S.kamX=Math.max(0,S.x-W/2); S.marvin.fertig=true; S.trikotGesehen=true;");
schritt(2);
console.log('=== (a) TANZEN IM TAKT');
const v0=zust();
console.log('  vorher            ', JSON.stringify(v0));
pruefe('auf der Tanzflaeche ist TANZEN das naechste Ziel (art tanzen)', v0.art==='tanzen');

aufSchlag(); taste('KeyE');
const v1=zust();
console.log('  Treffer auf dem Schlag', JSON.stringify(v1));
pruefe('Treffer auf dem Schlag: Combo 1', v1.combo===1);
pruefe('Tanzpose aktiv nach Treffer', v1.pose>0);

for(let i=0;i<7;i++){ schritt(Math.round(0.5/DT)); aufSchlag(); taste('KeyE'); }
const v2=zust();
console.log('  nach 8 Treffern   ', JSON.stringify(v2));
pruefe('8 Treffer in Folge: Combo 8 und bester Wert 8', v2.combo===8&&v2.beste===8);
pruefe('ON FIRE: Ruf um 3 gestiegen', Math.round(v2.ruf-v1.ruf)>=3-0.001);

schritt(Math.round(0.5/DT)); aufMitte(); taste('KeyE');
const v3=zust();
console.log('  daneben (Mitte)   ', JSON.stringify(v3));
pruefe('daneben: Combo 0, bester Wert bleibt 8', v3.combo===0&&v3.beste===8);

/* Ohne Ton: Die Takt-Uhr muss weiterlaufen und der Punkt zeichnen. */
const uhr=E('MUSIK.schlag()');
pruefe('ohne Ton: MUSIK.schlag() ist null, eigene Uhr greift', uhr===null);

console.log('=== (b) CLUB-EREIGNISSE WIRKEN');
/* Licht aus: stark abgedunkelt, weich ein- und ausgeblendet. */
E("S.x=300; S.tiefe=0.5; ereignisWirkung('LICHT GEHT KURZ AUS UND WIEDER AN');");
const lichtWerte=[];
for(const sek of [0.2,1.0,3.8,4.6]){
  while(+E('S.ef.licht.alt')<sek-1e-9 && +E('S.ef.licht.rest')>0) schritt(1);
  lichtWerte.push({sek, staerke:+(+E("efStaerke('licht')").toFixed(2)), dunkel:+(+E('S.dunkel').toFixed(2))});
}
console.log('  LICHT (Staerke, Dunkel):', JSON.stringify(lichtWerte));
pruefe('LICHT AUS: nach dem Einblenden stark abgedunkelt (>= 0,8)', lichtWerte[1].dunkel>=0.8);
pruefe('LICHT AUS: nach 4 s wieder hell', lichtWerte[3].staerke===0);
pruefe('LICHT AUS: Einblenden weich (bei 0,2 s noch nicht voll)', lichtWerte[0].staerke<1);

/* Nebel: halbe Sicht, Schleier nur ausserhalb eines Kreises. */
E("ereignisWirkung('NEBELMASCHINE LAEUFT AN');");
schritt(60);
const nebel=+E("efStaerke('nebel')");
console.log('  NEBEL nach 1 s, Staerke', nebel.toFixed(2), '| Radius', E('TUNE.nebelRadius'));
pruefe('NEBEL: voll wirksam nach 1 s', nebel>=0.99);

/* DJ: eigener Abschnitt fuer 16 s, dann zurueck auf die Tanzflaeche (drop). */
E("ereignisWirkung('DER DJ WECHSELT DEN TRACK');");
schritt(2);
const dj1=E('musikMerk.abschnitt');
schritt(Math.round(17/DT));
const dj2=E('musikMerk.abschnitt');
console.log('  DJ: Abschnitt 2 s nach Start:', dj1, '| 17 s spaeter:', dj2);
pruefe('DJ: Abschnitt "dj" waehrend des Ereignisses', dj1==='dj');
pruefe('DJ: nach 16 s zurueck auf "drop" (Tanzflaeche)', dj2==='drop');

/* SHOT: Theke gratis, kein Auf-Ex-Spiel. */
E("S.x=686; S.tiefe=0.2; S.pegel=20; ereignisWirkung('JEMAND RUFT NACH EINEM SHOT');");
schritt(2);
const shotVor=E('S.pegel'), artShot=E('naechstesZiel()&&naechstesZiel().art');
taste('KeyE'); schritt(1);
const shotNach=E('S.pegel'), modusShot=E('S.modus');
console.log('  SHOT: Ziel', artShot, '| Pegel', shotVor.toFixed(1), '->', shotNach.toFixed(1), '| Modus', modusShot);
pruefe('SHOT: Ziel an der Theke, Pegel steigt, kein Minispiel', artShot==='bar'&&shotNach>shotVor+10&&modusShot==='spiel');

/* Echter Ereignis-Haken: ambientTakt zieht ein Ereignis und wirkt es. */
E("S.x=300; S.tiefe=0.5; S.ambientT=0; S.ef.licht.rest=0; S.ef.nebel.rest=0; S.ef.dj.rest=0; S.ef.shot.rest=0;");
let zog=null;
for(let i=0;i<5 && !zog;i++){ schritt(1); const a=E('S.ambientLetzter'); if(a){ zog=a; } }
const wirktNun=E("Object.keys(S.ef).filter(k=>S.ef[k].rest>0)");
console.log('  zufaelliges Ereignis:', zog, '-> wirkt:', JSON.stringify(wirktNun));
pruefe('Ambient-Haken: gezogenes Ereignis wirkt, wenn es ein Wirkungs-Ereignis ist', !zog||!E('TUNE.ereignisArt[S.ambientLetzter]')||wirktNun.length>0);

console.log('=== (c) RANG (WERTUNG.abschluss)');
/* Wrapper zaehlt die Aufrufe und merkt die Argumente. */
E("window.__abs=[]; window.__rang=null; (()=>{ const a=WERTUNG.abschluss; WERTUNG.abschluss=(...x)=>{ window.__abs.push(x); window.__rang=a(...x); return window.__rang; }; })();");

/* Fall 1: gutes Spiel. Zwei Ja, eine Nummer, 8er-Tanz-Combo, Ruf hoch, schnell. */
E("neuesSpiel(); S.marvin.fertig=true; S.trikotGesehen=true; S.modus='spiel'; S.x=300; S.tiefe=0.5; ZIELE[0].stand='ja'; ZIELE[1].stand='ja'; ZIELE[2].stand='nummer';"
 +"S.tanzBeste=8; S.zeit=140; aendereWert('ruf', 90-wert('ruf'));");
E("starteCutscene('hinten')");
L.taste('KeyE',true);
for(let i=0;i<400 && E('S.modus')!=='ende';i++) schritt(1);
L.taste('KeyE',false);
const gut=E('window.__abs.length');
const argGut=E('JSON.stringify(window.__abs[0])');
const bestGut=E('window.__rang&&window.__rang.rang');
console.log('  gutes Spiel: Aufrufe', gut, '| Rang', bestGut, '| Argumente', argGut.slice(0,400));
pruefe('gutes Spiel: genau ein Aufruf und ein Rang', gut===1&&!!bestGut);
E("levelGeschafft()");
pruefe('zweiter levelGeschafft-Aufruf schreibt keinen zweiten Rang', E('window.__abs.length')===1);

/* Fall 2: schwaches Spiel. Niemand, keine Combo, viel Zeit. */
E("neuesSpiel(); S.marvin.fertig=true; S.trikotGesehen=true; window.__abs.length=0; S.modus='spiel'; S.x=300; S.tiefe=0.5; S.tanzBeste=0; S.zeit=500; aendereWert('ruf', -wert('ruf'));");
E("starteCutscene('hinten')");
L.taste('KeyE',true);
for(let i=0;i<400 && E('S.modus')!=='ende';i++) schritt(1);
L.taste('KeyE',false);
const schlecht=E('JSON.stringify(window.__abs[0]&&window.__abs[0][1])');
console.log('  schwaches Spiel: Aufrufe', E('window.__abs.length'), '| Punkte', schlecht, '| Rang', E('window.__rang&&window.__rang.rang'));
pruefe('schwaches Spiel: genau ein Aufruf, Rang C', E('window.__abs.length')===1&&E('window.__rang.rang')==='C');

/* Fall 3: Scheitern. Der Blackout gibt keinen Rang (Kein Rang ist durchgefallen). */
E("neuesSpiel(); S.marvin.fertig=true; S.trikotGesehen=true; window.__abs.length=0; S.modus='spiel'; S.x=300; S.tiefe=0.5; S.pegel=100;");
schritt(3);
pruefe('Scheitern (Blackout): Modus ende, gewonnen false, kein Rang', E('S.modus')==='ende'&&E('S.gewonnen')===false&&E('window.__abs.length')===0);

console.log(fehler?('\nFEHLER: '+fehler+' Pruefung(en) nicht erfuellt'):'\nalle Pruefungen erfuellt');
process.exitCode=fehler?1:0;
