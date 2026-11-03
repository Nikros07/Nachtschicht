/* Messung N3: Pausemenue NEU STARTEN und ZUM MENUE im (headless) Level 2.
   node docs/gameplay/messung/n3-pause.js     (aus dem Projektordner starten)
   Esc > NEU STARTEN > JA, NEU STARTEN fuehrt zu S.modus 'titel'; Esc > ZUM MENUE
   setzt location.href auf index.html. Echtes Laden der Seite bleibt im Browser ungeprueft. */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
let fehl=0;
const pruefe=(n,b,i)=>{ console.log((b?'  OK   ':'  FEHL ')+n+(b?'':'   -> '+i)); if(!b) fehl++; };

function frisch(){
  const L=N.lade('level2.html','?lektion=0'), E=c=>L.api.ev(c);
  /* Im Browser feuert der Capture-Hoerer der Pause vor allen anderen; die Attrappe ruft in
     Anmeldereihenfolge. Also den Pausen-Hoerer (erkennbar am Quelltext) nach vorn. */
  const hk=L.handler.keydown, i=hk.findIndex(f=>String(f).includes('PAUSE_TUNE.SPERRE'));
  if(i>0) hk.unshift(hk.splice(i,1)[0]);
  E('starteLevel()');
  for(let i=0;i<900&&E('kapitelAktiv()');i++) E('update(1/60)');   // Kapitelkarte laeuft von selbst ab
  for(let i=0;i<30;i++) E('update(1/60)');
  return {L,E,bild:(n=1)=>{ for(let i=0;i<n;i++) E('update(1/60)'); },
    tipp:c=>{ L.taste(c,true); L.taste(c,false); }};
}
/* waehlt den Eintrag mit dieser id per Pfeil runter + Enter */
function waehle(w,id){
  w.L.zeit.jetzt+=1000;                       // Eingabesperre nach dem Oeffnen ablaufen lassen
  const ids=w.E('PAUSE.eintraege(PAUSE.modus()).map(e=>e.id)');
  const i=ids.indexOf(id);
  for(let k=0;k<i;k++) w.tipp('ArrowDown');
  w.tipp('Enter');
}

{ const w=frisch();
  pruefe('vorher: Spielmodus, nicht Titel', w.E('S.modus')!=='titel', w.E('S.modus'));
  w.tipp('Escape');
  pruefe('Esc oeffnet die Pause', w.E('PAUSE.aktiv()')===true);
  waehle(w,'neu');
  pruefe('NEU STARTEN fragt nach', w.E('PAUSE.modus()')==='neuSicher', w.E('PAUSE.modus()'));
  waehle(w,'neuJa'); w.bild(3);
  pruefe('JA: Pause zu', w.E('PAUSE.aktiv()')===false);
  pruefe("JA: S.modus ist 'titel'", w.E('S.modus')==='titel', w.E('S.modus'));
}
{ const w=frisch();
  w.tipp('Escape'); waehle(w,'neu'); waehle(w,'abbrechen');
  pruefe('ABBRECHEN: zurueck ins Hauptmenue, Spiel laeuft weiter', w.E('PAUSE.modus()')==='haupt'&&w.E('S.modus')!=='titel');
}
{ const w=frisch(), vor=w.E('location.href');
  w.tipp('Escape'); waehle(w,'menue');
  const nach=w.E('location.href');
  console.log('  location.href: '+vor+'  ->  '+nach);
  pruefe('ZUM MENUE setzt location.href auf index.html', nach==='index.html', nach);
}
console.log(fehl?fehl+' FEHL':'alles ok'); if(fehl) process.exit(1);
