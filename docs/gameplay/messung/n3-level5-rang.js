/* Nacht 3, Level 5: Rang-Schwellen per Vollspiel pruefen (TUNE.rang).
   node docs/gameplay/messung/n3-level5-rang.js   (aus der Projektwurzel; Exit 1 bei Fehler)
   Nutzt die Bots aus b-level5.js (Stile/Seeds), faengt WERTUNG.abschluss ab und listet Punkte
   je Zeile (FLIRT/TANZ/RUF/ZEIT), Summe und Rang. Fertig-Kriterium: nicht nur C und nicht nur S. */
'use strict';
const path=require('path');
const B=require('./b-level5.js');
const LAEUFE=[['zielstrebig',1],['zielstrebig',2],['erkunder',1],['zufall',1],['zufall',2],['tanz',1],['minimal',1],['gereizt',1]];
const VOR="window.__rang=null; if(typeof WERTUNG!=='undefined'){ const f=WERTUNG.abschluss; WERTUNG.abschluss=function(...a){ window.__rang={nr:a[0],pkt:a[1],zeilen:a[2]}; return f.apply(this,a); }; }";
const G={S:90,A:75,B:55};   // wie nacht/wertung.js grenzen
const rangVon=p=>p>=G.S?'S':p>=G.A?'A':p>=G.B?'B':'C';
const tab=[];
for(const [stil,seed] of LAEUFE){
  const r=B.lauf(stil,seed,{vorher:VOR});
  const g=r.E('window.__rang');
  const z=g?g.zeilen.map(x=>x.name+' '+x.wert+'='+x.pkt).join(' | '):'-';
  tab.push({stil,seed,pkt:g?g.pkt:null,zeit:+r.E('S.zeit').toFixed(0),zeilen:z,gewonnen:r.E('S.gewonnen')}); tab[tab.length-1].rang=g?rangVon(g.pkt):'-';
  console.log(stil+' '+seed+': '+(g?g.pkt:'kein Rang')+' | '+z+' | zeit '+tab[tab.length-1].zeit+' gewonnen '+tab[tab.length-1].gewonnen);
}
const raenge=[...new Set(tab.map(x=>x.rang))];
console.log('Raenge:',tab.map(x=>x.rang).join(' '));
const ok=tab.filter(x=>x.pkt!==null).length>=5&&raenge.length>=2&&!(raenge.length===1&&(raenge[0]==='C'||raenge[0]==='S'));
console.log(ok?'OK: Rangverteilung nicht einseitig':'FEHLER: nur '+raenge.join('/')+' oder zu wenige Raenge');
process.exit(ok?0:1);
