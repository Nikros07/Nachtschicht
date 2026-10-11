/* Messung: Ton 2 Minuten aus (Taste M), dann wieder an - wie viele Knoten plant
   musik() im ersten Bild danach? Start: node docs/gameplay/messung/audio-stumm.js */
const N=require('../../../tools/nachttest.js');
const zeilen=[];
for(const seite of ['level2.html','level5.html','level8.html']){
  const L=N.lade(seite,'?lektion=0'); const E=c=>{ try{ return L.api.ev(c); }catch(e){ return 'FEHLER '+e.message; } };
  const uhr={t:1}; let knoten=0;
  const zaehl=()=>({connect(){},start(){ knoten++; },stop(){},type:'',buffer:null,
    frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}}});
  globalThis.__AC={ get currentTime(){ return uhr.t; }, sampleRate:8000, destination:{},
    createOscillator:zaehl, createBufferSource:zaehl,
    createGain:()=>({connect(){},gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}}}),
    createBuffer:(k,n)=>({getChannelData:()=>new Float32Array(n)}) };
  E('AC=__AC; MUS.next=AC.currentTime+.05');
  L.taste('Space',true); L.taste('Space',false);
  for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); uhr.t+=1/60; }
  for(let i=0;i<5;i++){ L.taste('KeyE',true); L.taste('KeyE',false); E('update(1/60)'); uhr.t+=1/60; }
  E('muted=true');
  for(let i=0;i<120*60;i++){ E('update(1/60)'); uhr.t+=1/60; }
  knoten=0; E('muted=false'); E('update(1/60)');
  zeilen.push(`${seite}: nach 120 s stumm plant das erste Bild ${knoten} Knoten auf einmal`);
}
console.log(zeilen.join('\n'));
