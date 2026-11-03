/* n3 - Level 4: Wirkung der Phasen-Zeitlupe SAFT.zeitlupe(TUNE.zeitlupeFaktor,TUNE.zeitlupeSek).
   node docs/gameplay/messung/n3-level4-zeitlupe.js
   Misst im Kampf: bis die Zeitlupe vorbei ist, vergeht wie viel echte Zeit (Bilder x 1/60)
   und wie viel Spielzeit (S.t), und mit welchem Faktor laeuft update() dabei. */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level4.html','?lektion=0');
const E=c=>L.api.ev(c);
E(`starteKampf(); S.boss.pauseT=99; S.boss.zustand='frei';`);
for(let i=0;i<5;i++) E('update(1/60)');
console.log('TUNE',E('JSON.stringify({f:TUNE.zeitlupeFaktor,s:TUNE.zeitlupeSek})'));
/* So wie nacht/kern.js: update(SAFT.takt(dt)). */
const t0=E('S.t'); E('phaseWechsel(2)');
let echt=0, kurz=null;
for(let i=0;i<300;i++){
  const a=E('S.t'); E('update(SAFT.takt(1/60))'); const d=E('S.t')-a; echt+=1/60;
  if(kurz===null&&d>1/60*0.99){ kurz=echt-1/60; break; }
}
const sp=E('S.t')-t0-1/60;
console.log('echte Zeit der Zeitlupe:',kurz.toFixed(2),'s  Spielzeit darin:',sp.toFixed(2),'s  Mittel-Faktor:',(sp/kurz).toFixed(2));
/* Gegenprobe: 1.5 s echte Zeit ab Phasenwechsel (Ansagedauer) */
E('phaseWechsel(3)'); const u0=E('S.t'); for(let i=0;i<90;i++) E('update(SAFT.takt(1/60))');
console.log('Spielzeit in 1.5 s echter Zeit ab Phasenwechsel:',(E('S.t')-u0).toFixed(2),'s');
