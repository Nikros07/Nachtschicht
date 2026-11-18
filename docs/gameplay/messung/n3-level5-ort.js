/* Messung n3 - Level 5: leere Bildzeilen der Club-Kulisse je Bereich.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level5-ort.js
   Vorher (pastellige Wandflaechen, Spiellauf-Mittel laut Nachttest): 42 %; nachher siehe Ausgabe.
   Der Flackerschutz-Pfad (FX.ruhig = Standbild) ist nur im Browser pruefbar, siehe Screenshots. */
const path=require('path'), N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level5.html','?lektion=0'), E=c=>L.api.ev(c);
L.taste('Space',true); L.taste('Space',false);
for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
E('S.modus!=="spiel"&&starteLevel&&starteLevel()'); E('S.karte=null; KAPITEL.aktiv=false');
const bereiche={EINGANG:90,TANZFLAECHE:400,BAR:740,RAUCHERECKE:960,KLOS:1130,HINTERAUSGANG:1300};
let summe=0, n=0;
for(const [name,x] of Object.entries(bereiche)){
  E(`S.x=${x};S.tiefe=.45;S.kamX=Math.max(0,Math.min(LEVEL_B-W,${x}-W/2));S.dunkel=0`); E('draw(1/60)');
  const p=N.leereProzent(L.cv); summe+=p; n++;
  console.log(name.padEnd(14)+' x='+String(x).padStart(4)+': leere Bildzeilen '+p.toFixed(1)+' %');
}
console.log('Mittel: '+(summe/n).toFixed(1)+' %');
