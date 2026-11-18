/* Messung n3 - Level 6: leere Bildzeilen der Kulisse in jedem Raum.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level6-ort.js
   Vorher (flache Waende): Spiellauf-Mittel 45 %; nachher siehe Ausgabe. */
const path=require('path'), N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level6.html'), E=c=>L.api.ev(c);
L.taste('Space',true); L.taste('Space',false);
for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
E('S.modus!=="spiel"&&starteLevel()'); E('S.karte=null; KAPITEL.aktiv=false');
let sum=0,n=0;
for(const x of [60,250,430,620,780,960,1170,1350]){
  E(`S.x=${x};S.tiefe=.45;S.kamX=Math.max(0,Math.min(LEVEL_B-W,${x}-W/2))`); E('draw(1/60)');
  const p=N.leereProzent(L.cv); sum+=p; n++;
  console.log('x='+x+': leere Bildzeilen '+p.toFixed(1)+' %');
}
console.log('Mittel '+(sum/n).toFixed(1)+' %');
