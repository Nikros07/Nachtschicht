/* n3 - Engine: was passiert, wenn localStorage.getItem wirft (blockierter Speicher)?
   Pro Seite: laden, dann getItem durch Wurf ersetzen, 120 Bilder update+draw, Ausnahmen zaehlen,
   danach Spielstart versuchen (startGame/starteLevel).
   node docs/gameplay/messung/n3-speicherfehler.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
for(const s of ['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html','karte.html']){
  let aus=0, erste='';
  try{
    const L=N.lade(s,'?lektion=0');
    for(let i=0;i<30;i++) L.api.ev('update(1/60);draw(1/60)');
    L.api.ev(`localStorage.getItem=()=>{ throw new Error('SecurityError'); }`);
    for(let i=0;i<120;i++){ try{ L.api.ev('update(1/60);draw(1/60)'); }catch(e){ aus++; if(!erste) erste=(e.stack||e.message).split('\n').slice(0,2).join(' | ').slice(0,110); } }
  }catch(e){ erste='LADEN: '+e.message.slice(0,80); aus=-1; }
  console.log(s.padEnd(12),'Ausnahmen in 120 Bildern:',aus,erste);
}
