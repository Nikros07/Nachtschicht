/* Messung: Was spielt die Musik wirklich? (Recherche Spielgefuehl/Audio)
   Start aus der Projektwurzel:  node docs/gameplay/messung/audio-musik.js
   Haengt einen falschen AudioContext in jede Seite, spielt 30 s mit
   "nach rechts laufen" und zaehlt jeden geplanten Ton: Stimmen, Tonhoehen,
   Schleifenlaenge. Danach: Handy 5 s offen -> wie viele Toene kommen auf
   einmal nach (Notenstau)? Aendert nichts am Spiel. */
const N=require('../../../tools/nachttest.js');

function falscherAC(uhr,log){
  const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}});
  return {
    get currentTime(){ return uhr.t; }, sampleRate:8000, destination:{}, state:'running',
    createOscillator(){ const o={type:'sine',f:0,frequency:{setValueAtTime(v){o.f=v;},exponentialRampToValueAtTime(){}},
      connect(){}, start(w){ log.push({art:'osz',typ:o.type,f:Math.round(o.f),w,jetzt:uhr.t,vol:o._g?o._g.v:0}); }, stop(){} };
      return o; },
    createGain(){ const g={v:0,gain:{value:0,setValueAtTime(v){g.v=v;},exponentialRampToValueAtTime(){}},
      connect(z){ } }; return g; },
    createBuffer(k,n){ return {getChannelData:()=>new Float32Array(n)}; },
    createBufferSource(){ return {buffer:null,connect(){},start(w){ log.push({art:'rauschen',w:w===undefined?uhr.t:w,jetzt:uhr.t}); }}; },
  };
}

const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html'];
const SEK=30;
const zeilen=[];
for(const seite of SEITEN){
  let L; try{ L=N.lade(seite,'?lektion=0'); }catch(e){ zeilen.push(seite+': Ladefehler '+e.message); continue; }
  const E=c=>{ try{ return L.api.ev(c); }catch(e){ return 'FEHLER '+e.message; } };
  const uhr={t:1}, log=[];
  globalThis.__AC=falscherAC(uhr,log);
  E('AC=__AC; muted=false; MUS.next=AC.currentTime+.05');
  L.taste('Space',true); L.taste('Space',false);
  for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); uhr.t+=1/60; }
  /* Kapitelkarte wegklicken, falls eine laeuft */
  for(let i=0;i<5;i++){ L.taste('KeyE',true); L.taste('KeyE',false); E('update(1/60)'); uhr.t+=1/60; }
  log.length=0;
  L.taste('KeyD',true);
  const modi=new Set();
  for(let i=0;i<SEK*60;i++){ E('update(1/60)'); uhr.t+=1/60; modi.add(E('S.modus')); }
  L.taste('KeyD',false);
  /* Toene mit gleicher Startzeit wie ein Musikschritt = Musik. Wir trennen grob:
     Musik ist alles, was ueber MUS geplant wurde (w > jetzt+0.001 oder Rauschen mit w). */
  const musik=log.filter(n=>n.w>n.jetzt+0.0005);
  const osz=musik.filter(n=>n.art==='osz');
  const tonhoehen=new Set(osz.map(n=>n.f));
  const typen=new Set(osz.map(n=>n.typ));
  /* Schleifenlaenge: kleinste Periode p (in Toenen der tiefsten Stimme), in der sich die Folge wiederholt */
  const folge=osz.filter(n=>n.typ==='square'||n.typ==='sine').map(n=>n.f);
  let periode='-';
  for(let p=1;p<=Math.min(64,folge.length/2);p++){
    let ok=true; for(let i=p;i<Math.min(folge.length,p*6);i++) if(folge[i]!==folge[i-p]){ ok=false; break; }
    if(ok){ periode=p; break; }
  }
  let schleifeSek='-';
  if(periode!=='-'&&osz.length>periode){ const sq=osz.filter(n=>n.typ==='square'||n.typ==='sine');
    schleifeSek=((sq[periode*4].w-sq[0].w)/4).toFixed(2); }
  const proSek=(musik.length/SEK).toFixed(1);
  const sfx=log.filter(n=>!(n.w>n.jetzt+0.0005)).length;
  zeilen.push(`${seite.padEnd(12)} Modi ${[...modi].join('/').padEnd(14)} Musiktoene/s ${proSek.padStart(5)}  Tonhoehen ${String(tonhoehen.size).padStart(2)}  Wellenformen ${[...typen].join('+')||'-'}  Schleife ~${schleifeSek} s  Wiederholungen in 30 s: ${schleifeSek==='-'?'-':Math.round(SEK/parseFloat(schleifeSek))}  SFX-Toene ${sfx}`);

  /* Notenstau: Handy 5 s offen (update ruht, die Uhr laeuft weiter), dann ein Bild */
  log.length=0;
  for(let i=0;i<300;i++){ uhr.t+=1/60; }        // update() laeuft nicht (wie bei HANDY.offen)
  E('update(1/60)'); uhr.t+=1/60;
  const zuSpaet=log.filter(n=>n.w<n.jetzt-0.001);
  const rauschZuSpaet=zuSpaet.filter(n=>n.art==='rauschen').length;
  zeilen.push(`${''.padEnd(12)} nach 5 s Stillstand: ${log.length} Knoten in EINEM Bild, ${zuSpaet.length} mit Startzeit in der Vergangenheit, davon ${rauschZuSpaet} Rauschimpulse ohne Huellkurve (starten alle zugleich)`);
}
console.log(zeilen.join('\n'));
