/* ============================================================================
   LEVELTEST - LEVEL 2

   Zufallseingaben, Kollisionsregeln, Statisten, Musikbus, Verstecke.
   Faengt genau die Sorte Fehler, die man beim Spielen erst nach zwanzig
   Runden trifft.

       node werkzeug/leveltest.js
   ========================================================================== */
const { lade, levelPfad } = require('./pruefstand');
const { ev } = lade(levelPfad(2));
const DT=1/60;

let fehler=0;
const pruefe=(name,ok,extra='')=>{
  console.log((ok?'  ok   ':'  FEHL ')+name+(extra?'   '+extra:''));
  if(!ok) fehler++;
};

/* --- Zufallseingaben: nichts darf werfen, nichts darf NaN werden --- */
console.log('Zufallseingaben');
let absturz=null;
for(let runde=0;runde<30&&!absturz;runde++){
  ev('neuesSpiel(); S.modus="spiel";');
  for(let t=0;t<60;t+=DT){
    if(Math.random()<.06) ev('linksAn=!linksAn');
    if(Math.random()<.06) ev('rechtsAn=!rechtsAn');
    if(Math.random()<.04) ev('sprungPuffer.push(S.t)');
    if(Math.random()<.10) ev('aktionPuffer.push(S.t)');
    try { ev(`update(${DT}); draw(${DT})`); }
    catch(e){ absturz=e; break; }
    const s=ev('({x:S.x,y:S.y,pegel:S.pegel,kam:S.kamX,modus:S.modus})');
    if(![s.x,s.y,s.pegel,s.kam].every(isFinite)){
      absturz=new Error('NaN: '+JSON.stringify(s)); break; }
    if(s.modus==='ende') break;
  }
}
pruefe('30 x 60 s ohne Absturz und ohne NaN',!absturz,absturz?String(absturz.message):'');

/* --- Statisten --- */
console.log('Statisten');
ev('neuesSpiel(); S.modus="spiel";');
let mehrfach=false, jeGeredet=false;
for(let t=0;t<120;t+=DT){
  ev(`update(${DT}); draw(${DT})`);
  const offen=ev('S.stat.filter(z=>z.blaseT>0).length');
  if(offen>1) mehrfach=true;
  if(offen>0) jeGeredet=true;
}
pruefe('reden von selbst',jeGeredet);
pruefe('immer nur einer auf einmal',!mehrfach);

const imWeg=ev(`(()=>{ const w=[];
  for(const s of STATISTEN){
    for(const d of DINGE) if(Math.abs((d.x+6)-s.x)<TUNE.reichweite) w.push(s.x+'/'+d.art);
    for(const l of LEUTE)  if(Math.abs(l.x-s.x)<TUNE.reichweite)   w.push(s.x+'/'+l.id);
  } return w; })()`);
pruefe('stehen keinem Moebel und keiner Person im Weg',imWeg.length===0,imWeg.join(' '));

ev('neuesSpiel(); S.modus="spiel"; S.x=STATISTEN[1].x; aktionPuffer.push(0);');
ev(`update(${DT})`);
pruefe('E vor einem Statisten gibt einen Spruch',ev('S.stat[1].blaseT>0'),ev('S.stat[1].blase'));

ev('neuesSpiel(); S.modus="spiel"; S.x=LEUTE[1].x; aktionPuffer.push(0);');
ev(`update(${DT})`);
pruefe('Leute mit Aufgabe haben Vorrang',ev('!!S.reden'));

const hoehen=ev('STAT_SPR.map(s=>s.tanzt.map(f=>f.length)).flat()');
pruefe('alle Tanzbilder gleich hoch',new Set(hoehen).size===1,'Hoehen '+[...new Set(hoehen)].join(','));

/* --- Der Kracher: jedes Muster muss erreichbar sein --- */
console.log('Kampf');
const alle=ev('Object.keys(MUSTER)');
const inFolge=ev('[...new Set(MUSTER_FOLGE.flat())]');
pruefe('jedes Muster kommt auch vor',alle.every(m=>inFolge.includes(m)),
  alle.filter(m=>!inFolge.includes(m)).join(',')||'-');
pruefe('Folge deckt alle Treffer ab',ev('MUSTER_FOLGE.length')<=ev('TUNE.gegnerTreffer'));
pruefe('Finte schlaegt nie selbst zu',ev('!!MUSTER.finte.finte && !!MUSTER.finte.nach'));
/* Kuerzestes Konterfenster - darunter wird es Raten statt Timing */
const kuerzest=ev(`Math.min(...Object.values(MUSTER).filter(m=>!m.finte)
  .map(m=>TUNE.gegnerWindup*m.wind*TUNE.gegnerTempoMin*TUNE.konterFenster))`);
pruefe('kuerzestes Konterfenster ueber 0,25 s',kuerzest>0.25,kuerzest.toFixed(3)+'s');

/* --- Musikbus --- */
console.log('Musik');
const stufen=[0,20,45,70,95].map(p=>
  ev(`Math.min(TUNE.zerrStufen-1,Math.floor((${p}/100)*TUNE.zerrStufen))`));
pruefe('Verzerrung steigt mit dem Pegel',
  stufen.every((v,i)=>i===0||v>=stufen[i-1])&&stufen[0]===0,stufen.join(','));
const gerade=ev('Array.from(zerrKurve(0))');
pruefe('Stufe 0 ist die Gerade',Math.abs(gerade[0]+1)<1e-6&&Math.abs(gerade[gerade.length-1]-1)<.01);
const satt=ev('(()=>{const c=zerrKurve(TUNE.zerrStufen-1); return c[Math.floor(c.length*.75)];})()');
pruefe('hoechste Stufe saettigt hoerbar',satt>.85,'x=0,5 wird '+satt.toFixed(3));

/* --- Durchspielbarkeit --- */
console.log('Durchspielbarkeit');
let getrennt=true; const orte=new Set();
for(let i=0;i<300;i++){ ev('neuesSpiel()');
  const j=ev('S.jackeBei'), a=ev('S.ausweisBei');
  orte.add(j); orte.add(a); if(j===a) getrennt=false; }
pruefe('Jacke und Ausweis nie am selben Ort',getrennt);
pruefe('Verstecke wechseln',orte.size>=4,[...orte].join(','));

console.log('');
console.log(fehler? fehler+' FEHLER' : 'alles gruen');
process.exit(fehler?1:0);
