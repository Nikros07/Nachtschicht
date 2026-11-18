/* Gewinn-Bot Level 2 (level2.html, Moritz): Jacke und Ausweis suchen (Ort ist im Zustand
   lesbar: S.jackeBei/S.ausweisBei), Energydrink aus dem Kuehlschrank fuer Finn, Ausweis zu
   Moritz, dann an der Tuer ganz links den Kampf: nur im goldenen Fenster kontern. Wer kommt
   mit: Standardantwort. Cutscene: E halten. */
'use strict';
module.exports={ seite:'level2.html', laufe(k){
  const {E}=k;
  if(!k.titel()) throw new Error('Spiel startet nicht');
  const dingX=art=>E(`DINGE.find(d=>d.art==='${art}').x+6`);
  const personX=id=>E(`LEUTE.find(l=>l.id==='${id}').x`);
  /* Reihenfolge der Ziele; jedes endet mit Bedingung 'fertig' */
  const ziele=[
    {x:()=>dingX(E('S.jackeBei')), fertig:()=>E('S.inventar.jacke')},
    {x:()=>dingX(E('S.ausweisBei')), fertig:()=>E('S.inventar.ausweis')||E('S.erledigt.ausweis')},
    {x:()=>dingX('kuehl'), fertig:()=>E('S.inventar.dose')||E('S.erledigt.schlaefer')},
    {x:()=>personX('schlaefer'), fertig:()=>E('S.erledigt.schlaefer')},
    {x:()=>personX('moritz'), fertig:()=>E('S.erledigt.ausweis')},
  ];
  let wartet=0;
  for(let i=0;i<60*170;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(m==='kampf'){
      k.halte();
      const g=E('S.gegner');
      if(g.zustand==='wind'&&!g.verpasst&&g.t>=E('windupJetzt()*(1-TUNE.konterFenster)')+0.02) k.tipp('KeyE');
      k.takt(1); continue;
    }
    if(E('S.reden')||E('S.suchT')>0||E('gespraechAktiv()')){ k.halte(); if(E('S.reden')||E('gespraechAktiv()')) k.tipp('KeyE'); k.takt(1); continue; }
    if(m!=='spiel'){ k.halte(); k.tipp('Space'); k.takt(1); continue; }
    const z=ziele.find(z=>!z.fertig());
    if(z){ if(k.gehe(z.x(),4)){ if(wartet--<=0){ k.tipp('KeyE'); wartet=30; } } }
    else if(k.gehe(30,6)){ if(wartet--<=0){ k.tipp('KeyE'); wartet=30; } }   // Tuer ganz links (S.x<60)
    k.takt(1);
  }
}};
