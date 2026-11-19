/* Messung n3 - Level 1: leere Bildzeilen je Raum (Kulisse der elf Raeume).
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level1-raum.js
   Vorher (Wand einfarbig, 16-px-Moebel, leerer Boden): Mittel 52.7 %, schlechtester 66.1 % (Hausmeister);
   Nachher: Mittel 13.2 %, schlechtester 26.1 % (Lehrerzimmer). Ziel: jeder Raum unter 50 %.  Leer = Zeile mit hoechstens 5 Farbkanten. */
const path=require('path'), N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('index.html'), E=c=>L.api.ev(c);
L.taste('Space',true); L.taste('Space',false);
for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
E('S.modus!=="spiel"&&starteLevel()'); E('S.karte=null; KAPITEL.aktiv=false');
const n=E('RAEUME.length'); let summe=0, max=0;
for(let i=0;i<n;i++){
  E(`S.modus='raum'; S.raum=${i}; S.raumX=110; S.blende=0; S.nahesMoebel=-1; S.anTuerRaus=false`); E('draw(1/60)');
  const p=N.leereProzent(L.cv); summe+=p; max=Math.max(max,p);
  console.log(String(i).padStart(2)+' '+E(`RAEUME[${i}].name`).padEnd(13)+' leere Bildzeilen '+p.toFixed(1)+' %');
}
console.log('Mittel '+(summe/n).toFixed(1)+' %, schlechtester '+max.toFixed(1)+' %'+(max<50?'  -> unter 50 %':'  -> ZU LEER'));
