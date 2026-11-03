/* n3 - Engine: wie oft liest ein Level pro Bild aus localStorage (JSON.parse inklusive)?
   Zaehlt getItem waehrend 300 Bildern update+draw im Spielmodus.
   node docs/gameplay/messung/n3-speicher.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
for(const s of ['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html','karte.html']){
  try{
    const L=N.lade(s,'?lektion=0');
    for(let i=0;i<30;i++) L.api.ev('update(1/60);draw(1/60)');
    L.api.ev(`(()=>{ const o=localStorage.getItem.bind(localStorage); window.__z={}; localStorage.getItem=k=>{ __z[k]=(__z[k]||0)+1; return o(k); }; })()`);
    for(let i=0;i<300;i++) L.api.ev('update(1/60);draw(1/60)');
    const z=JSON.parse(L.api.ev('JSON.stringify(window.__z)'));
    const sum=Object.values(z).reduce((a,b)=>a+b,0);
    console.log(s.padEnd(12),'getItem/Bild',(sum/300).toFixed(1),JSON.stringify(Object.fromEntries(Object.entries(z).map(([k,v])=>[k.replace('nachtschicht.',''),+(v/300).toFixed(1)]))));
  }catch(e){ console.log(s,'FEHLER',e.message.slice(0,80)); }
}
