/* Messung n3 - Level 3: Rang-Grenzen per Zufallslauf (zufaellige Tasten).
   node docs/gameplay/messung/n3-level3-rang.js [Seeds=12]
   Ein Lauf endet bei Levelsieg oder nach 10 Minuten Spielzeit (Verlieren: Aktion = Neustart).
   Gemeldet wird der Rang, den WERTUNG.abschluss bekommt; S darf nie vorkommen (sonst Exit 1). */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
const seeds=parseInt(process.argv[2]||'12',10);
const TASTEN=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyE'];
const tab={}; let sRang=0;
for(let seed=1;seed<=seeds;seed++){
  const L=N.lade('level3.html','?lektion=0'), E=c=>L.api.ev(c), r=N.zufall(seed*7919+3);
  for(let i=0;i<seed*5;i++) L.rng();   // Spiel-Zufall je Seed verschieben
  E('window.__rang=null; (()=>{ const f=WERTUNG.abschluss; WERTUNG.abschluss=function(...a){ const rr=f.apply(this,a); window.__rang={pkt:a[1],rang:rr&&rr.rang}; return rr; }; })()');
  const gehalten=new Set(); let wechsel=0, neustarts=0, spielzeit=0, ausnahme=null, vorModus='';
  const frames=60*60*12;
  try{
    for(let i=0;i<frames;i++){
      if(i>=wechsel){
        for(const c of gehalten) L.taste(c,false); gehalten.clear();
        const n=1+Math.floor(r()*2);
        for(let k=0;k<n;k++){ const c=TASTEN[Math.floor(r()*TASTEN.length)]; if(!gehalten.has(c)){ gehalten.add(c); L.taste(c,true); } }
        wechsel=i+6+Math.floor(r()*30);
      }
      E('update(1/60)');
      const m=E('S.modus');
      if(m==='ende'){ if(E('S.gewonnen')) break; neustarts++; L.taste('KeyE',true); L.taste('KeyE',false); }
      spielzeit=i/60; if(spielzeit>=600) break;
    }
  }catch(e){ ausnahme=String(e.stack||e).split('\n').slice(0,2).join(' | '); }
  const w=E('window.__rang'), gew=E('S.gewonnen');
  const rang=w?w.rang:'-'; tab[rang]=(tab[rang]||0)+1; if(rang==='S') sRang++;
  console.log(`seed ${seed}: ${gew?'GEWONNEN':'nicht geschafft'} nach ${spielzeit.toFixed(0)} s, Neustarts ${neustarts}, Punkte ${w?w.pkt:'-'}, Rang ${rang}${ausnahme?'  AUSNAHME '+ausnahme:''}`);
}
console.log('Verteilung:',JSON.stringify(tab),sRang?'FEHL: Zufallslauf mit S':'OK: kein S');
process.exit(sRang?1:0);
