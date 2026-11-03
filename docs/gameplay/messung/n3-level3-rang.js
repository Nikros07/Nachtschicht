/* Messung n3 - Level 3: Rang-Grenzen per Zufallslauf (zufaellige Tasten).
   node docs/gameplay/messung/n3-level3-rang.js [Seeds=12]
   Ein Lauf endet bei Levelsieg oder nach 10 Minuten Spielzeit (Verlieren: Aktion = Neustart).
   Gemeldet wird der Rang, den WERTUNG.abschluss bekommt; S darf nie vorkommen (sonst Exit 1). */
'use strict';
const M=require('../../../tools/messhilfe.js');
const seeds=parseInt(process.argv[2]||'12',10);
const tab={}; let sRang=0;
for(let seed=1;seed<=seeds;seed++){
  const {L,E,takte}=M.starteLevel('level3.html',{lektion:0});
  const tasten=M.zufallsTasten(L,seed*7919+3), rang=M.rangAbfangen(L);
  for(let i=0;i<seed*5;i++) L.rng();   // Spiel-Zufall je Seed verschieben
  let neustarts=0, spielzeit=0, ausnahme=null;
  try{
    for(let i=0;i<60*60*12;i++){
      tasten.schritt(i); takte(1);
      if(E('S.modus')==='ende'){ if(E('S.gewonnen')) break; neustarts++; L.taste('KeyE',true); L.taste('KeyE',false); }
      spielzeit=i/60; if(spielzeit>=600) break;
    }
  }catch(e){ ausnahme=String(e.stack||e).split('\n').slice(0,2).join(' | '); }
  const w=rang(), gew=E('S.gewonnen'), r=w&&w.ergebnis&&w.ergebnis.rang;
  const name=r||'-'; tab[name]=(tab[name]||0)+1; if(name==='S') sRang++;
  console.log(`seed ${seed}: ${gew?'GEWONNEN':'nicht geschafft'} nach ${spielzeit.toFixed(0)} s, Neustarts ${neustarts}, Punkte ${w?w.args[1]:'-'}, Rang ${name}${ausnahme?'  AUSNAHME '+ausnahme:''}`);
}
console.log('Verteilung:',JSON.stringify(tab),sRang?'FEHL: Zufallslauf mit S':'OK: kein S');
process.exit(sRang?1:0);
