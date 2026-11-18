/* Messung n3 - Level 7: leere Bildzeilen der Kulisse an drei Stellen der Strasse.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level7-ort.js
   Vorher (alter Himmel/Streifen): Spiellauf-Mittel 51 %; nachher siehe Ausgabe. */
const path=require('path'), N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level7.html'), E=c=>L.api.ev(c);
L.taste('Space',true); L.taste('Space',false);
for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
E('S.modus!=="spiel"&&starteLevel()'); E('S.karte=null; KAPITEL.aktiv=false');
for(const x of [60,400,700]){
  E(`S.x=${x};S.tiefe=.45;S.kamX=Math.max(0,Math.min(LEVEL_B-W,${x}-W/2))`); E('draw(1/60)');
  console.log('x='+x+': leere Bildzeilen '+N.leereProzent(L.cv).toFixed(1)+' %');
}
