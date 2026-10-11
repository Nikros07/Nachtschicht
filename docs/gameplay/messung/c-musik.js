/* Messung C - Musik in Level 7 und 8 (falscher AudioContext, zaehlt geplante Toene).
   Aus der Projektwurzel: node docs/gameplay/messung/c-musik.js
   1) Welche Toene/Stimmen laufen je Modus (spiel, kampf, finale, cutscene)?
   2) Notenstau: wie viele Toene werden in EINEM Bild geplant, nachdem musik() eine Weile
      nicht lief (Kapitelkarte 3,5 s, Pause 5 s, Polaroid-Karte im Finale)? */
const H=require('./c-hilfe.js');
function falscherAC(uhr,log){
  return { get currentTime(){ return uhr.t; }, sampleRate:8000, destination:{}, state:'running',
    createOscillator(){ const o={type:'sine',f:0,frequency:{setValueAtTime(v){o.f=v;},exponentialRampToValueAtTime(){}},
      connect(){}, start(w){ log.push({typ:o.type,f:Math.round(o.f),w,jetzt:uhr.t,bild:uhr.bild}); }, stop(){} }; return o; },
    createGain(){ return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}; },
    createBuffer(k,n){ return {getChannelData:()=>new Float32Array(n)}; },
    createBufferSource(){ return {buffer:null,connect(){},start(){}}; } };
}
function messe(seite,vorbereitung,schritte){
  const L=H.lade(seite); const E=c=>L.api.ev(c);
  const uhr={t:1,bild:0}, log=[]; globalThis.__AC=falscherAC(uhr,log);
  E(vorbereitung);
  E('AC=__AC; muted=false; MUS.next=AC.currentTime+.05; MUS.step=0;');
  const takt=n=>{ for(let i=0;i<n;i++){ E('update(1/60)'); uhr.t+=1/60; uhr.bild++; } };
  const aus={};
  for(const [name,fn,sek] of schritte){
    log.length=0; fn(E,L); const b0=uhr.bild; takt(Math.round(sek*60));
    const proBild={}; for(const n of log) proBild[n.bild]=(proBild[n.bild]||0)+1;
    const stau=Math.max(0,...Object.values(proBild));
    const musik=log.filter(n=>n.w>n.jetzt-5);
    const tonh=[...new Set(musik.map(n=>n.f))].sort((a,b)=>a-b);
    aus[name]={modus:E('S.modus'), toene:log.length, proSek:+(log.length/sek).toFixed(1), tonhoehen:tonh.slice(0,12),
      typen:[...new Set(log.map(n=>n.typ))], groessterStauInEinemBild:stau,
      inVergangenheitGeplant:log.filter(n=>n.w<n.jetzt-0.05).length};
  }
  return aus;
}
const r={};
r.level7=messe('level7.html',"setzeWert('geld',15); neuesSpiel();",[
  ['titel->intro mit Kapitelkarte (3,5 s)',(E,L)=>{ L.taste('Space',true); L.taste('Space',false); },6],
  ['spiel 20 s',(E)=>{ E("S.modus='spiel'; KAPITEL.aktiv=false;"); },20],
  ['pause 5 s',(E)=>{ E("S.modus='pause'"); },5],
  ['nach Pause 1 s',(E)=>{ E("S.modus='spiel'"); },1],
]);
r.level8=messe('level8.html',"localStorage.setItem(CREW_KEY,'[\"MORITZ\",\"MAX FERDI\"]'); setzeFlag('marvinKennt'); neuesSpiel();",[
  ['titel->intro mit Kapitelkarte',(E,L)=>{ L.taste('Space',true); L.taste('Space',false); },6],
  ['kampf 8 s',(E)=>{ E("KAPITEL.aktiv=false; GESPR=null; starteGrossenKampf();"); },8],
  ['wettlauf 10 s (Licht ~20)',(E)=>{ E("S.modus='spiel'; S.licht=20;"); },10],
  ['wettlauf 5 s (Licht ~85)',(E)=>{ E("S.licht=85;"); },5],
  ['finale 10 s',(E)=>{ E("S.modus='spiel'; S.licht=60; starteFinale();"); },10],
  ['Polaroid-Karte 3 s',(E)=>{ E("MOMENT.fund(8)"); },3],
  ['nach Polaroid 1 s',(E)=>{},1],
  ['abspann 20 s',(E)=>{ E("GESPR=null; S.modus='finale'; starteCutscene();"); },20],
]);
r.level8pause=messe('level8.html',"localStorage.setItem(CREW_KEY,'[\"MORITZ\",\"MAX FERDI\"]'); neuesSpiel();",[
  ['wettlauf 3 s',(E)=>{ E("KAPITEL.aktiv=false; S.modus='spiel'; S.licht=30;"); },3],
  ['pause 5 s',(E)=>{ E("S.modus='pause'"); },5],
  ['nach Pause 1 s',(E)=>{ E("S.modus='spiel'"); },1],
]);
console.log(JSON.stringify(r,null,1));
