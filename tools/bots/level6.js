/* Gewinn-Bot Level 6 (level6.html, Afterhour / Traum-Schule): der Plan "direkt" aus
   docs/gameplay/messung/b-level6.js - Spind (200), Labortisch (430), Buecher (960), dann LEA (1560).
   An jedem Ort E, bis die Aufgabe erledigt ist (Erinnerungen S.erledigt, dann Lea). Gespraeche:
   Standardantwort (E). Kondition: reicht sie nicht, kurz aufs naechste Sofa (E), sonst gilt der
   Wegknick-Ausgang (kein Game Over). Cutscene: E halten. */
'use strict';
module.exports={ seite:'level6.html', laufe(k){
  const {E}=k;
  if(!k.titel(['spiel'])) throw new Error('Spiel startet nicht');
  const sofas=E('SOFAS.map(s=>s.x)');
  const plan=[200,430,960,1560];
  let wartet=0, ziel=0, versuche=0;
  for(let i=0;i<60*600;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(E('gespraechAktiv()')){ k.halte(); k.tipp('KeyE'); k.takt(1); continue; }
    if(m!=='spiel'||E('S.suchT')>0){ k.halte(); k.takt(1); continue; }
    if(E('S.ruht')){                     // auf dem Sofa: liegen, bis ausgeruht (Spiel steht auf, wenn voll)
      k.halte(); k.takt(1); continue; }
    /* muede: zum naechsten Sofa vor dem Ziel */
    if(E('S.kondition')<25){
      const sx=E('S.x'), s=sofas.filter(x=>x<=sx+40).pop();
      if(s!==undefined&&k.gehe(s+8,4)){ if(wartet--<=0){ k.tipp('KeyE'); wartet=30; } }
      k.takt(1); continue;
    }
    if(ziel>=plan.length) ziel=plan.length-1;
    if(k.gehe(plan[ziel],3)){
      if(wartet--<=0){
        k.tipp('KeyE'); wartet=60; versuche++;
        if(versuche>=2&&ziel<plan.length-1){ ziel++; versuche=0; }   // Ort erledigt (2 Druecke reichen: suchen, ggf. reden)
      }
    }
    k.takt(1);
  }
}};
