/* Nacht 3, Level 5: Kloppe-Treffer-Pfad. Fuehrt Auftakt -> starteKloppe -> kloppe() -> kloppeVorbei
   bis zum Ende, zaehlt SAFT.treffer und SAFT.schaden (Wrapper wie in s2-level4.js).
   node docs/gameplay/messung/n3-level5-kloppe.js   (aus der Projektwurzel; Exit 1 bei Fehler) */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level5.html','?lektion=0');
const E=c=>L.api.ev(c);
let fehler=0;
const pruefe=(n,ok)=>{ console.log((ok?'  OK     ':'  FEHLT  ')+n); if(!ok) fehler++; };
function lauf(seed){
  let r=seed; const zuf=()=>(r=(r*1664525+1013904223)>>>0)/4294967296;
  E(`neuesSpiel(); window.__n={treffer:0,schaden:0}; if(!window.__w){ window.__w=1;
    for(const k of ['treffer','schaden']){ const f=SAFT[k]; SAFT[k]=function(...a){ __n[k]++; return f.apply(this,a); }; } }
    S.x=300; S.kamX=Math.max(0,S.x-W/2); S.marvin.fertig=false; starteAuftakt();`);
  let n=0, sawKloppe=false;
  for(; n<60*120; n++){
    E('update(1/60)'); E('draw(1/60)');
    const m=E('S.modus');
    if(m==='kloppe'){ sawKloppe=true;
      /* Bot: auf den naechsten Gegner zugehen, schlagen; Gegner treffen mich auch (kein Block). */
      const d=E('(()=>{const g=S.gegner.find(g=>g.hp>0); return g?g.x-S.ich.x:0;})()');
      L.taste('ArrowRight',d>14); L.taste('ArrowLeft',d<-14);
      if(n%(8+Math.floor(zuf()*6))===0){ L.taste('KeyE',true); E('update(1/60)'); L.taste('KeyE',false); }
    }
    if(sawKloppe&&m!=='kloppe') break;
  }
  L.taste('ArrowRight',false); L.taste('ArrowLeft',false);
  return { sawKloppe, n, stand:E('S.kloppeStand'), modus:E('S.modus'), n_:E('__n'), nan:E('Number.isNaN(S.x)||Number.isNaN(S.tiefe)') };
}
let tr=0, sc=0;
for(const seed of [1,2,3]){
  let a; try{ a=lauf(seed); }catch(e){ console.log('  Ausnahme',e&&e.stack||e); fehler++; continue; }
  console.log('  Seed',seed,JSON.stringify(a)); tr+=a.n_.treffer; sc+=a.n_.schaden;
  pruefe('Seed '+seed+': Kloppe lief bis zum Ende ('+a.stand+')', a.sawKloppe&&(a.stand==='gewonnen'||a.stand==='verloren')&&!a.nan);
}
pruefe('mindestens ein SAFT.treffer ('+tr+')', tr>=1);
pruefe('mindestens ein SAFT.schaden ('+sc+')', sc>=1);
console.log(fehler?'FEHLER '+fehler:'ALLES OK'); process.exit(fehler?1:0);
