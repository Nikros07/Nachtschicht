/* Messung C - Level 8: Wie gross ist das Sprungfenster je Hindernis?
   Aus der Projektwurzel: node docs/gameplay/messung/c-level8-sprung.js
   Fuer jedes Hindernis und jeden Absprung-Abstand d (Pixel bis zur Hindernismitte) wird
   einmal angelaufen (volles Tempo, Sprungtaste 14 Bilder gehalten) und geprueft, ob es trifft.
   Ergebnis: Bereich der Absprung-Abstaende ohne Treffer, umgerechnet in Millisekunden. */
const H=require('./c-hilfe.js');
const ergebnis=[];
for(const maxFerdi of [false,true]){
  const L=H.lade('level8.html'); const E=c=>L.api.ev(c);
  E(`localStorage.setItem(CREW_KEY,${JSON.stringify(JSON.stringify(maxFerdi?['MORITZ','MAX FERDI']:['MORITZ']))}); neuesSpiel();`);
  const tempo=E('TUNE.gehTempo*tempoBonus()');
  const n=E('HINDERNISSE.length');
  for(let i=0;i<n;i++){
    const art=E(`HINDERNISSE[${i}].art`);
    const frei=[];
    for(let d=0;d<=60;d+=1){
      E(`S.modus='spiel'; S.hinTreffer={}; S.licht=0; S.pegel=0; S.abb.plan=[]; S.abb.fenster=null; S.abb.steht=0;
         S.x=HINDERNISSE[${i}].x-120; S.vx=${tempo}; S.y=BODEN; S.vy=0; S.amBoden=true;`);
      L.taste('KeyD',true);
      let gesprungen=false, f=0;
      while(f<600){
        const o=JSON.parse(E(`JSON.stringify((()=>{const o=HINDERNISSE[${i}];
          const effX=o.art==='jogger'?o.x+Math.sin(S.t*TUNE.joggerTempo+${i})*TUNE.joggerAmplitude:o.x;
          return {d:effX-S.x, x:S.x, ox:o.x, boden:S.amBoden};})())`));
        if(!gesprungen&&o.d<=d){ L.taste('Space',true); gesprungen=true; var halt=14; }
        if(gesprungen&&halt!==undefined){ halt--; if(halt===0) L.taste('Space',false); }
        E('update(1/60)'); f++;
        if(o.x>o.ox+40) break;
      }
      L.taste('KeyD',false); L.taste('Space',false);
      if(!E(`!!S.hinTreffer[${i}]`)) frei.push(d);
    }
    const von=frei.length?Math.min(...frei):null, bis=frei.length?Math.max(...frei):null;
    ergebnis.push({maxFerdi, tempo:Math.round(tempo), i, art, freiVon:von, freiBis:bis,
      fensterPx:frei.length, fensterMs:Math.round(frei.length/tempo*1000), luecken:frei.length&&frei.length!==bis-von+1});
  }
}
for(const e of ergebnis) console.log(JSON.stringify(e));
