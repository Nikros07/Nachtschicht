/* Messung n3 - Level 8: Rang-Grenzen (TUNE.rang). Aus der Projektwurzel:
     node docs/gameplay/messung/n3-level8-rang.js
   Wettlauf-Bot: haelt KeyD, springt vor jedem der HINDERNISSE, ruft auf Wunsch jeden Abschied
   (aktionPuffer). Der Kampf wird nicht gespielt (Frieden bzw. gewonnen/verloren gesetzt).
   Ziel: Start-Licht 0 + alle Abschiede -> mindestens A; Start-Licht 40, keine Abschiede -> hoechstens B. */
const N=require('../../../tools/nachttest.js');

function lauf(startLicht,abschiede,kampf,springen=true){
  const L=N.lade('level8.html','?lektion=0'); const E=s=>L.api.ev(s);
  E(`localStorage.setItem(CREW_KEY,'["MORITZ","MAX FERDI","JONAS","DENNIS","SEMIH","LEA"]'); neuesSpiel();`);
  E(`KAPITEL.aktiv=false; S.modus='spiel'; S.licht=${startLicht}; S.zeit=0;`);
  E(`window._z=null; const alt=WERTUNG.abschluss; WERTUNG.abschluss=function(l,p,z){ window._z=[p,z]; const r=alt.call(WERTUNG,l,p,z); window._r=r&&r.rang; return r; };`);
  /* Kampfausgang: endeKampf() liest die Flags - hier ueber Flag setzen (frieden) */
  if(kampf==='frieden') E(`setzeFlag('fightFrieden');`);
  if(kampf==='gewonnen') E(`setzeFlag('fightGewonnen');`);
  L.taste('KeyD',true);
  const gesp=new Set(); let t=0, halt=0;
  while(E('S.modus')==='spiel'&&t<400){
    if(abschiede&&E('!!(S.abb&&S.abb.fenster)')) E('aktionPuffer.push(S.t)');
    if(springen){
      const o=JSON.parse(E(`JSON.stringify((()=>{ for(let i=0;i<HINDERNISSE.length;i++){ if(S.hinTreffer[i]) continue;
        const o=HINDERNISSE[i]; const effX=o.art==='jogger'?o.x+Math.sin(S.t*TUNE.joggerTempo+i)*TUNE.joggerAmplitude:o.x;
        const d=effX-S.x; if(d>-15&&d<40) return {i,d,boden:S.amBoden}; } return null; })())`));
      if(o&&!gesp.has(o.i)&&o.d<=24&&o.boden){ L.taste('Space',true); gesp.add(o.i); halt=14; }
      if(halt>0){ halt--; if(!halt) L.taste('Space',false); }
    }
    E('update(1/60)'); t+=1/60;
  }
  L.taste('KeyD',false);
  const m=E('S.modus');
  if(m!=='finale'){ return {startLicht,abschiede,kampf,ergebnis:m+' (nicht angekommen)'}; }
  E('rangAbschluss8()');
  const z=JSON.parse(E('JSON.stringify(window._z)'));
  const rang=E('window._r');
  return {startLicht,abschiede,kampf,licht:Math.round(E('S.licht')),zeit:Math.round(E('S.zeit')),tschuess:E('S.tschuessZahl')+'/'+E('S.abb.plan.length'),
    punkte:z[0],zeilen:z[1].map(r=>r.name+' '+r.pkt).join(', '),rang};
}
const reihe=[[0,true,'frieden'],[0,true,'gewonnen'],[0,true,'verloren'],[0,false,'frieden'],[40,false,'frieden'],[40,false,'gewonnen'],[40,false,'verloren'],[40,true,'frieden'],[20,true,'gewonnen']];
for(const r of reihe) console.log(JSON.stringify(lauf(...r)));

/* Auswertung (Stand der Messung, TUNE.rang unveraendert): Licht 0 + 4/4 Abschiede + Frieden/gewonnen
   = 82 Punkte = A; Licht 40 ohne Abschiede + Frieden = 51 = C (hoechstens B erfuellt). */
