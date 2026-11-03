/* Messung n3 - Rang-Grenzen Level 1, 2 und 6 per Vollspiel (Zufallslauf).
   node docs/gameplay/messung/n3-rang-126.js [Seeds=8]
   Je Seite (index.html = Level 1, level2.html, level6.html) laeuft je Seed ein Zufallslauf:
   zufaellige Tasten (1-2 gleichzeitig, fester Seed), Titel mit Space verlassen, Intro ueberspringen,
   bei Verlust Aktionstaste (KeyE) fuer Neustart. Ende bei Levelsieg oder nach 600 s Spielzeit.
   Gemeldet wird der Rang, den WERTUNG.abschluss bekommt. Irgendein S -> Exit 1.
   Vorlage: n3-level3-rang.js. Ohne Browser (tools/nachttest.js). */
'use strict';
const path=require('path');
const N=require(path.resolve(__dirname,'../../../tools/nachttest.js'));
process.chdir(path.resolve(__dirname,'../../..'));
const seeds=parseInt(process.argv[2]||'8',10);
const SEITEN=['index.html','level2.html','level6.html'];
const TASTEN=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyE'];
const tab={}; let sRang=0, ziel=0, laeufe=0;
console.log('Seite           Seed  Ende          Punkte  Rang  Neustarts  Spielzeit');
for(const seite of SEITEN){
  for(let seed=1;seed<=seeds;seed++){
    laeufe++;
    const L=N.lade(seite,'?lektion=0'), E=c=>L.api.ev(c), r=N.zufall(seed*7919+3);
    for(let i=0;i<seed*5;i++) L.rng();   // Spiel-Zufall je Seed verschieben
    E('window.__rang=null; (()=>{ const f=WERTUNG.abschluss; WERTUNG.abschluss=function(...a){ const rr=f.apply(this,a); window.__rang={pkt:a[1],rang:rr&&rr.rang}; return rr; }; })()');
    let ausnahme=null, neustarts=0, spielzeit=0, ende='Zeit';
    const gehalten=new Set(); let wechsel=0;
    try{
      /* Titel und Intro ueberspringen: Space, bis das Spiel laeuft */
      for(let i=0;i<300 && !['spiel','pause'].includes(E('S.modus'));i++){
        L.taste('Space',true); L.taste('Space',false);
        E('update(1/60)');
        if(E('S.modus')==='intro') E('S.szeneT+=99');
      }
      const frames=60*60*600;
      for(let i=0;i<frames;i++){
        if(i>=wechsel){
          for(const c of gehalten) L.taste(c,false); gehalten.clear();
          const n=1+Math.floor(r()*2);
          for(let k=0;k<n;k++){ const c=TASTEN[Math.floor(r()*TASTEN.length)]; if(!gehalten.has(c)){ gehalten.add(c); L.taste(c,true); } }
          wechsel=i+6+Math.floor(r()*30);
        }
        E('update(1/60)');
        const m=E('S.modus');
        if(m==='ende'){
          if(E('S.gewonnen')){ ende='Sieg'; break; }
          neustarts++; L.taste('KeyE',true); L.taste('KeyE',false);
        }
        spielzeit=i/60;
        if(spielzeit>=600) break;
      }
    }catch(e){ ausnahme=String(e.stack||e).split('\n').slice(0,2).join(' | '); ende='Ausnahme'; }
    const w=E('window.__rang'), gew=E('S.gewonnen');
    const rang=w&&w.rang?w.rang:'-';
    tab[seite+' '+rang]=(tab[seite+' '+rang]||0)+1;
    if(rang==='S') sRang++;
    if(gew) ziel++;
    console.log(`${seite.padEnd(15)} ${String(seed).padStart(4)}  ${ende.padEnd(12)}  ${String(w?w.pkt:'-').padStart(6)}  ${String(rang).padStart(4)}  ${String(neustarts).padStart(9)}  ${spielzeit.toFixed(0).padStart(4)} s${ausnahme?'  AUSNAHME '+ausnahme:''}`);
  }
}
console.log('Verteilung:',JSON.stringify(tab));
console.log(`Ziel erreicht: ${ziel} von ${laeufe} Laeufen`+(ziel===0?' (KEIN Lauf ins Ziel)':''));
console.log(sRang?'FEHL: Zufallslauf mit S':'OK: kein S');
process.exit(sRang?1:0);
