/* Messung n3 - Level 2: leere Bildzeilen der Wohnung je Raum.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level2-ort.js
   Vorher (einfarbige Waende, Bilderrahmen): nachttest-Mittel 39 %; nachher siehe Ausgabe. */
const path=require('path'), N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level2.html','?lektion=0'), E=c=>L.api.ev(c);
L.taste('Space',true); L.taste('Space',false);
for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
E('S.modus!=="spiel"&&starteLevel()'); E('KAPITEL.aktiv=false; S.mitnehmenOffen=false; GESPR=null');
let summe=0, n=0;
for(const [name,x] of [['FLUR',70],['WOHNZIMMER',215],['WOHNZIMMER TV',335],['KUECHE',510],['MORITZ ZIMMER',690],['BAD',840],['BALKON',930]]){
  E(`S.x=${x};S.tiefe=.5;S.kamX=Math.max(0,Math.min(LEVEL_B-W,${x}-W/2))`); E('draw(1/60)');
  const p=N.leereProzent(L.cv); summe+=p; n++;
  console.log(name.padEnd(14)+' x='+x+': leere Bildzeilen '+p.toFixed(1)+' %');
}
console.log('Mittel: '+(summe/n).toFixed(1)+' %');
