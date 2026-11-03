/* Messung n3 - Rang-Grenzen Level 1, 2 und 6 per Vollspiel (Zufallslauf).
   node docs/gameplay/messung/n3-rang-126.js [Seeds=8]
   Je Seite (index.html = Level 1, level2.html, level6.html) laeuft je Seed ein Zufallslauf:
   zufaellige Tasten (1-2 gleichzeitig, fester Seed), Titel mit Space verlassen, Intro ueberspringen,
   bei Verlust Aktionstaste (KeyE) fuer Neustart. Ende bei Levelsieg oder nach 600 s Spielzeit.
   Gemeldet wird der Rang, den WERTUNG.abschluss bekommt. Irgendein S -> Exit 1.
   Vorlage: n3-level3-rang.js; Helfer in tools/messhilfe.js. Ohne Browser. */
'use strict';
const M=require('../../../tools/messhilfe.js');
const seeds=parseInt(process.argv[2]||'8',10);
const tab={}; let sRang=0, ziel=0, laeufe=0;
console.log('Seite           Seed  Ende          Punkte  Rang  Neustarts  Spielzeit');
for(const seite of ['index.html','level2.html','level6.html']){
  for(let seed=1;seed<=seeds;seed++){
    laeufe++;
    const {L,E,takte}=M.starteLevel(seite,{lektion:0});
    const tasten=M.zufallsTasten(L,seed*7919+3), rang=M.rangAbfangen(L);
    for(let i=0;i<seed*5;i++) L.rng();   // Spiel-Zufall je Seed verschieben
    let ausnahme=null, neustarts=0, spielzeit=0, ende='Zeit';
    try{
      M.titelUndIntro(L);
      for(let i=0;i<60*60*600;i++){
        tasten.schritt(i); takte(1);
        if(E('S.modus')==='ende'){
          if(E('S.gewonnen')){ ende='Sieg'; break; }
          neustarts++; L.taste('KeyE',true); L.taste('KeyE',false);
        }
        spielzeit=i/60;
        if(spielzeit>=600) break;
      }
    }catch(e){ ausnahme=String(e.stack||e).split('\n').slice(0,2).join(' | '); ende='Ausnahme'; }
    const w=rang(), r=w&&w.ergebnis&&w.ergebnis.rang, name=r||'-';
    tab[seite+' '+name]=(tab[seite+' '+name]||0)+1;
    if(name==='S') sRang++;
    if(E('S.gewonnen')) ziel++;
    console.log(`${seite.padEnd(15)} ${String(seed).padStart(4)}  ${ende.padEnd(12)}  ${String(w?w.args[1]:'-').padStart(6)}  ${name.padStart(4)}  ${String(neustarts).padStart(9)}  ${spielzeit.toFixed(0).padStart(4)} s${ausnahme?'  AUSNAHME '+ausnahme:''}`);
  }
}
console.log('Verteilung:',JSON.stringify(tab));
console.log(`Ziel erreicht: ${ziel} von ${laeufe} Laeufen`+(ziel===0?' (KEIN Lauf ins Ziel)':''));
console.log(sRang?'FEHL: Zufallslauf mit S':'OK: kein S');
process.exit(sRang?1:0);
