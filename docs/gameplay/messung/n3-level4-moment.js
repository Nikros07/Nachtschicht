/* n3 - Level 4: haelt die Polaroid-Karte (MOMENT.fund(4) in starteCutscene) die Cutscene an?
   node docs/gameplay/messung/n3-level4-moment.js
   Misst: wie lange S.szene/S.szeneT stehen, wenn der Tuersteher ohne Herzverlust faellt
   (Karte 3.0 s, nach 0.8 s mit E ueberspringbar), und zum Vergleich mit einem Herzverlust (keine Karte). */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
function lauf(herz,skipE){
  const L=N.lade('level4.html','?lektion=0'); const E=c=>L.api.ev(c);
  E(`try{localStorage.removeItem('nachtschicht.stand')}catch(e){}; starteKampf(); S.herzVerlust=${herz}; starteCutscene();`);
  let t=0, szene0=E('S.szene'), stehtBis=null, karteBis=null, kt=[];
  for(let i=0;i<60*20;i++){
    if(skipE&&Math.abs(t-1.0)<1e-6) { L.taste('KeyE',true); L.taste('KeyE',false); }
    E('update(SAFT.takt(1/60))'); t+=1/60;
    const k=E('MOMENT_KARTE.aktiv'), sT=E('S.szeneT');
    if(k) karteBis=t;
    if(stehtBis===null&&sT>0.05) stehtBis=t;          // Cutscene laeuft erstmals
  }
  return {karte:E('MOMENT_KARTE.n')>0&&karteBis!==null, karteSek:karteBis&&+karteBis.toFixed(2), cutsceneLaeuftAb:stehtBis&&+stehtBis.toFixed(2), szeneEnde:E('S.szene'), modus:E('S.modus')};
}
console.log('0 Herzen, keine Eingabe   :',JSON.stringify(lauf(0,false)));
console.log('0 Herzen, E nach 1.0 s    :',JSON.stringify(lauf(0,true)));
console.log('1 Herz verloren (keine Karte):',JSON.stringify(lauf(1,false)));
