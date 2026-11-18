/* Gewinn-Bot Level 5 (level5.html, Club): kuerzester ehrlicher Weg wie der Stil "minimal" in
   docs/gameplay/messung/b-level5.js: an der Bar einmal AUF EX (Minispiel: E, wenn der Strich im
   Gruenen ist - gelesen aus markerPos/aktuellesFenster), das schaltet den Ausgang frei, dann zum
   Ausgang ganz rechts und E. Gespraeche: Standardantwort; Ecke: E; schlaegt Marvin zu, wird die
   Kloppe bis zum Ende gespielt (auch verloren endet sie in der Cutscene 'rausschmiss'). */
'use strict';
const K=require('./_kern.js');
module.exports={ seite:'level5.html', laufe(k){
  const {E}=k;
  if(!k.titel(['spiel'])) throw new Error('Spiel startet nicht');
  const BAR=E('BARTHEKE.x'), AUS=E('AUSGANG.x');
  const gemerkt={};
  let wartet=0;
  for(let i=0;i<60*700;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(E('gespraechAktiv()')){ k.halte(); k.tipp('KeyE'); k.takt(1); continue; }
    if(m==='ecke'){ k.halte(); if(E('S.ecke.t')>2.2) k.tipp('KeyE'); k.takt(1); continue; }
    if(m==='mini'){
      k.halte();
      /* Zeitpunkt im naechsten update() ist S.t+1/60: E, wenn der Strich dann im Fenster liegt */
      const treffer=E(`(()=>{ const mi=S.mini, f=aktuellesFenster(); const p=markerPos(S.t+1/60-mi.t0,aktuellesTempo(),TUNE.minigameBreite);
        return Math.abs(p-mi.mitte)<=f/2*0.6; })()`);
      if(treffer) k.tipp('KeyE');
      k.takt(1); continue;
    }
    if(m==='kloppe'){ K.kloppeSchritt(k,gemerkt); k.takt(1); continue; }
    if(m!=='spiel'){ k.halte(); k.takt(1); continue; }
    const ziel=E('S.warAktiv')?AUS:BAR;
    if(k.gehe(ziel,3)){ if(wartet--<=0){ k.tipp('KeyE'); wartet=40; } }
    k.takt(1);
  }
}};
