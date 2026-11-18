/* Messung: leere Bildzeilen im Endkampf von Level 8, je Arena (Software-Canvas, Naeherung).
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level8-kulisse.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level8.html'); const E=c=>L.api.ev(c);
E(`neuesSpiel(); starteGrossenKampf();`);
for(let a=0;a<3;a++){
  if(a) E(`wechsleArena(${a})`);
  let sum=0,n=0;
  for(let i=0;i<120;i++){ E('update(1/60)'); if(i%10===0){ E('draw(1/60)'); sum+=N.leereProzent(L.cv); n++; } }
  console.log('Arena '+a+' '+E('ARENEN[S.arena].name')+': leere Bildzeilen '+Math.round(sum/n)+' %');
}
