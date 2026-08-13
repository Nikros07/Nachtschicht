/* ============================================================================
   LEVELTEST - LEVEL 3, DER NACHTBUS

   Der Bus laeuft von allein weiter, egal was der Spieler macht. Deshalb
   laesst sich hier etwas testen, was in den anderen Leveln nicht geht:
   ganze Fahrten mit verschiedenen Spielweisen, von Nichtstun bis
   Fahrschein kaufen.

       node werkzeug/leveltest3.js
   ========================================================================== */
const { lade, levelPfad } = require('./pruefstand');
const { ev } = lade(levelPfad(3));
const DT=1/60;

let fehler=0;
const pruefe=(name,ok,extra='')=>{
  console.log((ok?'  ok   ':'  FEHL ')+name+(extra?'   '+extra:''));
  if(!ok) fehler++;
};

/* --- Ein Durchlauf mit einer Strategie ---------------------------------- */
function fahrt(strategie,maxSek=220,crew=[]){
  ev(`localStorage.setItem('nachtschicht.crew',${JSON.stringify(JSON.stringify(crew))})`);
  ev('localStorage.removeItem("nachtschicht.pegel")');
  ev('neuesSpiel(); S.modus="spiel"; linksAn=rechtsAn=haltAn=false;');
  let t=0, gestuerzt=0, lagVorher=0;
  while(t<maxSek){
    const m=ev('S.modus');
    if(m==='ende'||m==='cutscene') break;
    const z=ev(`({x:S.x,phase:S.phase,warnung:S.warnung,tuerAuf:S.tuerAuf,halt:S.halt,
      muenzen:S.muenzen,fahrschein:S.fahrschein,liegt:S.liegt,haelt:S.haelt,
      draussen:S.draussen,suchT:S.suchT,automatT:S.automatT,reden:!!S.reden,hp:S.hp,
      offen:SITZE.filter(x=>!S.durchsucht[x]&&!S.leute.some(l=>l.sitzt&&Math.abs(l.x-x)<6)),
      ks:S.kontrolleure.map(k=>k.x)})`);
    if(z.liegt>0&&lagVorher<=0) gestuerzt++;
    lagVorher=z.liegt;
    strategie(z);
    ev(`update(${DT}); draw(${DT})`);
    t+=DT;
  }
  return { modus:ev('S.modus'), hp:ev('S.hp'), halt:ev('S.halt'),
           fahrschein:ev('S.fahrschein'), faenger:ev('S.faenger'),
           gestuerzt, zeit:t };
}
/* Werkzeuge fuer die Bots */
const geheZu=(z,ziel,toleranz=4)=>{
  const d=ziel-z.x;
  ev(`linksAn=${d<-toleranz}; rechtsAn=${d>toleranz};`);
  return Math.abs(d)<=toleranz;
};
const stehen=()=>ev('linksAn=false; rechtsAn=false;');
const druecke=()=>ev('aktionPuffer.push(S.t)');
const naechsteStangeAn=x=>ev('STANGEN').reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
const STANGEN=ev('STANGEN'), AUTOMAT=ev('AUTOMAT_X'), NAEHE=ev('TUNE.stangenNaehe');

/* --- 1. Nichtstun darf nicht reichen ------------------------------------ */
console.log('Der Bus faehrt auch ohne dich');
const faul=fahrt(()=>{});
/* Der Bus wartet am CLUB, bis jemand aussteigt - wer nichts tut, gewinnt
   also nie, egal wie lange er sitzen bleibt. */
pruefe('Nichtstun gewinnt nie',faul.modus!=='cutscene',
  'modus '+faul.modus+', Haltestelle '+faul.halt);
pruefe('und kostet mindestens zwei Herzen',faul.hp<=1,'hp '+faul.hp);
pruefe('und man faellt dabei staendig hin',faul.gestuerzt>=3,faul.gestuerzt+' Stuerze');

/* --- 2. Nur festhalten: kein Sturz, aber die Kontrolle kriegt dich ------ */
console.log('Nur festhalten');
const klammer=fahrt(z=>{
  const st=naechsteStangeAn(z.x);
  if(geheZu(z,st,NAEHE-3)) ev('haltAn=true'); else ev('haltAn=false');
});
pruefe('kein einziger Sturz',klammer.gestuerzt===0,klammer.gestuerzt+' Stuerze');
pruefe('reicht trotzdem nicht',klammer.modus==='ende'&&klammer.hp<=0,
  'Haltestelle '+klammer.halt);

/* --- 3. Fahrschein kaufen: soll sauber durchkommen ---------------------- */
console.log('Fahrschein kaufen');
function kaeufer(z){
  /* Ruck geht immer vor - ohne Stange liegst du und kannst gar nichts. */
  const ruck=z.phase==='anfahren'||z.phase==='bremsen'||z.warnung
             ||(z.phase==='halt'&&!z.tuerAuf);
  if(ruck){
    const st=naechsteStangeAn(z.x);
    if(geheZu(z,st,NAEHE-4)) ev('haltAn=true'); else ev('haltAn=false');
    return;
  }
  ev('haltAn=false');
  if(z.liegt>0||z.suchT>0||z.automatT>0||z.reden){ stehen(); return; }
  if(z.halt>=5){ /* Endstation: raus */
    const t=ev('TUEREN').reduce((a,b)=>Math.abs(b.x-z.x)<Math.abs(a.x-z.x)?a=b:a);
    if(geheZu(z,t.x,NAEHE-4)) druecke();
    return;
  }
  if(z.fahrschein){ stehen(); return; }
  if(z.muenzen>=3){ if(geheZu(z,AUTOMAT,NAEHE-4)) druecke(); return; }
  if(z.offen.length){
    const ziel=z.offen.reduce((a,b)=>Math.abs(b-z.x)<Math.abs(a-z.x)?b:a);
    if(geheZu(z,ziel,NAEHE-4)) druecke();
    return;
  }
  stehen();
}
const gekauft=fahrt(kaeufer);
pruefe('kommt an',gekauft.modus==='cutscene'||gekauft.modus==='ende'&&gekauft.hp>0,
  'modus '+gekauft.modus+', Haltestelle '+gekauft.halt+', hp '+gekauft.hp);
pruefe('hat einen Fahrschein geloest',gekauft.fahrschein);
pruefe('ohne Herzverlust',gekauft.hp===3,'hp '+gekauft.hp);

/* --- 4. Genug Muenzen muessen ueberhaupt auffindbar sein ---------------- */
console.log('Muenzen');
let genug=true, ohne=true;
for(let i=0;i<200;i++){
  ev('localStorage.setItem("nachtschicht.crew",\'["MAX FERDI","MORITZ"]\'); neuesSpiel();');
  if(ev('S.muenzenBei.length')+1<ev('TUNE.muenzenNoetig')) genug=false;
  ev('localStorage.setItem("nachtschicht.crew",\'[]\'); neuesSpiel();');
  if(ev('S.muenzenBei.length')<ev('TUNE.muenzenNoetig')) ohne=false;
}
pruefe('mit Crew reichen Sitze + Moritz',genug);
pruefe('ohne Crew liegt genug in den Sitzen',ohne);
const doppelt=ev('S.muenzenBei.length!==new Set(S.muenzenBei).size');
pruefe('keine Muenze doppelt',!doppelt);

/* --- 5. Der Tuer-Trick ------------------------------------------------- */
console.log('Tueren');
ev('neuesSpiel(); S.modus="spiel"; S.phase="halt"; S.phaseT=0; S.tuerAuf=true;'
  +'S.x=TUEREN[0].x; aktionPuffer.push(0);');
ev(`update(${DT})`);
pruefe('E an der offenen Tuer bringt dich raus',ev('S.draussen'));
ev('S.kontrolleure=[{x:TUEREN[0].x,richtung:1,wartet:0,prueft:0,zielId:null,hatDich:false,prueftDich:0,gehPhase:0}];');
for(let i=0;i<180;i++) ev(`update(${DT})`);
pruefe('draussen kommt die Kontrolle nicht an dich',ev('S.hp')===3&&ev('S.draussen'));
/* Und wer draussen bleibt, faehrt nicht mit */
ev('S.phase="halt"; S.phaseT=TUNE.haltDauer-0.01;');
for(let i=0;i<10;i++) ev(`update(${DT})`);
pruefe('wer draussen bleibt, verpasst den Bus',
  ev('S.modus')==='ende'&&!ev('S.gewonnen'),ev('S.faenger'));

/* --- 6. Zufallseingaben ------------------------------------------------ */
console.log('Zufallseingaben');
let absturz=null;
for(let r=0;r<20&&!absturz;r++){
  ev('neuesSpiel(); S.modus="spiel";');
  for(let t=0;t<120;t+=DT){
    if(Math.random()<.06) ev('linksAn=!linksAn');
    if(Math.random()<.06) ev('rechtsAn=!rechtsAn');
    if(Math.random()<.05) ev('haltAn=!haltAn');
    if(Math.random()<.04) ev('sprungPuffer.push(S.t)');
    if(Math.random()<.10) ev('aktionPuffer.push(S.t)');
    try { ev(`update(${DT}); draw(${DT})`); }
    catch(e){ absturz=e; break; }
    const s=ev('({x:S.x,y:S.y,vx:S.vx,pegel:S.pegel,kam:S.kamX,m:S.modus})');
    if(![s.x,s.y,s.vx,s.pegel,s.kam].every(isFinite)){
      absturz=new Error('NaN: '+JSON.stringify(s)); break; }
    if(s.m==='ende'||s.m==='cutscene') break;
  }
}
pruefe('20 x 120 s ohne Absturz und ohne NaN',!absturz,absturz?String(absturz.message):'');

/* --- 7. Aufbau des Busses --------------------------------------------- */
console.log('Aufbau');
/* Besetzte Sitze zaehlen nicht - dort gewinnt die Person, und genau so
   steht es auch in aktion(). */
const ziele=ev(`[].concat(TUEREN.map(t=>['tuer',t.x]),
  SITZE.filter(x=>!S.leute.some(l=>l.sitzt&&Math.abs(l.x-x)<6)).map(x=>['sitz',x]),
  [['automat',AUTOMAT_X]],S.leute.map(l=>['person',l.x]))`).sort((a,b)=>a[1]-b[1]);
let engste=1e9, paar='';
for(let i=1;i<ziele.length;i++){
  const d=ziele[i][1]-ziele[i-1][1];
  if(d<engste){ engste=d; paar=ziele[i-1].join(' ')+' / '+ziele[i].join(' '); }
}
pruefe('jedes E-Ziel ist einzeln erreichbar',engste>=NAEHE+4,
  'engster Abstand '+engste+' bei '+paar);
const luecke=Math.max(...STANGEN.map((s,i)=>i?s-STANGEN[i-1]:s));
pruefe('von jeder Stelle ist eine Stange erreichbar',
  luecke/2/ev('TUNE.gehTempo')<ev('TUNE.vorwarnung'),
  'groesste Luecke '+luecke+'px = '+(luecke/2/ev('TUNE.gehTempo')).toFixed(2)+'s');

console.log('');
console.log(fehler? fehler+' FEHLER' : 'alles gruen');
process.exit(fehler?1:0);
