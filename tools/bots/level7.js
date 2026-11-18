/* Gewinn-Bot Level 7 (level7.html, Spaeti): Das Startgeld (15 EURO) reicht fuer Wasser (2) und
   Snack (3) - also kein Pfand und kein Wurf noetig. Zur Kasse (Herr Oezdemir, Tiefe 0.12), im
   Gespraech Wasser und Snack waehlen (Antwort nach Text, per Pfeiltasten), dann zur Ecke ganz
   rechts, E: Anlaufkarte, Endfrage mit Standardantwort (Heim), Cutscene mit gehaltenem E. */
'use strict';
module.exports={ seite:'level7.html', laufe(k){
  const {E}=k;
  if(!k.titel(['spiel'])) throw new Error('Spiel startet nicht');
  const kasse=E('({x:OEZDEMIR.x,t:OEZDEMIR.t})'), ecke=E('TUNE.ausgangX');
  const kassenWahl=(w)=>{
    let i=w.findIndex(t=>/^Ein Wasser/.test(t)); if(i>=0) return i;
    i=w.findIndex(t=>/^Und was zu essen/.test(t)); if(i>=0) return i;
    i=w.findIndex(t=>/^Das wars/.test(t)); return i>=0?i:undefined;
  };
  let wartet=0;
  for(let i=0;i<60*600;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(E('S.karte')){ k.halte(); k.takt(1); continue; }
    if(k.gespraech(kassenWahl)){ k.halte(); k.takt(1); continue; }
    if(m!=='spiel'||E('S.wurf')){ k.halte(); k.takt(1); continue; }
    const fertig=E('alleFertig()');
    const da=fertig?k.gehe2(ecke,null,6):k.gehe2(kasse.x,kasse.t,3);
    if(da&&wartet--<=0){ k.tipp('KeyE'); wartet=40; }
    k.takt(1);
  }
}};
