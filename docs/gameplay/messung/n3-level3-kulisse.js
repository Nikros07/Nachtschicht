/* Misst leere Bildzeilen im Sprint von Level 3 (Kulisse). Aufruf: node docs/gameplay/messung/n3-level3-kulisse.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level3.html','?lektion=0');
L.api.ev('starteSprint()');
let sum=0,n=0;
for(let i=0;i<600;i++){ L.api.ev('update(1/60)');
  if(i%20===0){ L.api.ev('draw(1/60)'); sum+=N.leereProzent(L.cv); n++; } }
console.log('Sprint: leere Bildzeilen '+Math.round(sum/n)+' % ('+n+' Bilder)');
