/* n3 - Dramaturgie: Passivzeit je Level (Intro- und Abspann-Tafeln) und Taktung der Nacht.
   Summiert die Dauer d der Tafeln in INTRO (vor dem Level) und SZENEN (Abspann), soweit vorhanden,
   dazu Kapitelkarte 3,5 s. Spielzeit (Erstspieler) steht in docs/gameplay/messung-*.md.
   node docs/gameplay/messung/n3-dramaturgie.js */
const path=require('path'); const N=require(path.resolve('tools/nachttest.js'));
const sek=a=>Array.isArray(a)?a.reduce((x,s)=>x+(+s.d||0),0):0;
let ges=0;
for(const s of ['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html']){
  const L=N.lade(s,'?lektion=0');
  const g=e=>{ try{ return +L.api.ev(`typeof ${e}!=='undefined'?(${e}).reduce((x,t)=>x+(+t.d||0),0):-1`); }catch(x){ return -1; } };
  const a=g('INTRO'), b=g('SZENEN'), nT=(()=>{ try{ return +L.api.ev('typeof SZENEN!=="undefined"?SZENEN.length:-1'); }catch(x){ return -1; } })();
  console.log(s.padEnd(12),'Intro',a<0?'-':a.toFixed(1)+' s','| Abspann (SZENEN)',b<0?'-':b.toFixed(1)+' s ('+nT+' Tafeln)');
}
