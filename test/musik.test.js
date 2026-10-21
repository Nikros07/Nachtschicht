/* Prueft nacht/musik.js (Sequencer, Abschnitt E1) ohne Browser. Ein AudioContext
   als Attrappe, die Zeit schiebt der Test selbst vor. Eigener kleiner Testsong,
   nicht nacht/songs.js.
   node test/musik.test.js */
const fs=require('fs'), vm=require('vm'), path=require('path');

let zeit=0;                 // Audio-Uhr der Attrappe (AC.currentTime)
const knotenAlle=[];        // Oszillatoren und Quellen: {hz, an (Start), aus (Stopp)}
const aufrufe=[];           // Automationen aller Knoten: {typ, name, fn, v, t}
let oszAnz=0;               // erzeugte Oszillatoren + Quellen (Notenkosten)
const intervalAufrufe=[];   // setInterval-Aufrufe aus musik.js

function knoten(typ){
  const n={typ:typ, hz:-1, an:-1, aus:-1, wave:null};
  const par=(name)=>({ value:0,
    setValueAtTime(v,t){ aufrufe.push({typ,name,fn:'set',v,t}); if(name==='freq'&&n.hz<0) n.hz=v; return this; },
    linearRampToValueAtTime(v,t){ aufrufe.push({typ,name,fn:'lin',v,t}); return this; },
    exponentialRampToValueAtTime(v,t){ aufrufe.push({typ,name,fn:'exp',v,t}); return this; },
    setTargetAtTime(v,t){ aufrufe.push({typ,name,fn:'target',v,t}); return this; },
    cancelScheduledValues(t){ aufrufe.push({typ,name,fn:'cancel',t}); return this; },
  });
  n.frequency=par('freq'); n.gain=par('gain'); n.Q=par('Q');
  n.connect=()=>{};
  n.setPeriodicWave=(w)=>{ n.wave=w; };
  n.start=(t)=>{ n.an=t; if(typ==='osc'||typ==='src') knotenAlle.push(n); };
  n.stop=(t)=>{ n.aus=t; };
  n.type='';
  return n;
}

const AC={
  get currentTime(){ return zeit; },
  sampleRate:8000,
  destination:{ziel:true},
  createOscillator(){ oszAnz++; return knoten('osc'); },
  createBufferSource(){ oszAnz++; return knoten('src'); },
  createGain(){ return knoten('gain'); },
  createBiquadFilter(){ return knoten('filter'); },
  createBuffer(c,l,r){ return {getChannelData(){ return new Float32Array(l); }}; },
  createPeriodicWave(re,im){ return {re:re, im:im}; },
};

const k={ AC:AC, muted:false, SONGS:{},
  setInterval:(f,ms)=>{ intervalAufrufe.push([f,ms]); },
  console:console, Math:Math, Float32Array:Float32Array, Object:Object, Number:Number, isFinite:isFinite };
vm.createContext(k);
vm.runInContext(fs.readFileSync(path.join(__dirname,'..','nacht','musik.js'),'utf8'),k);
const E=c=>vm.runInContext(c,k);
const M=E('MUSIK');
const TAKT=M.takt;

// Testsongs: bpm 120 -> Sechzehntel 0,125 s, Takt 2 s, Achtel 0,25 s
k.SONGS={
  bass:{bpm:120, swing:0, abschnitte:{A:{akkorde:['Am','Am','Am','Am'], bass:'puls'}},
    folge:['A'], ebenen:[['bass']]},
  zwei:{bpm:120, swing:0, abschnitte:{
      A:{akkorde:['Am','Am','Am','Am'], bass:'puls', drums:'club'},
      B:{akkorde:['F','F','F','F'], bass:'puls', drums:'club'}},
    folge:['A','A','B','B'], ebenen:[['bass'],['bass','drums']]},
  loop:{bpm:120, swing:0, abschnitte:{
      A:{akkorde:['Am','Am','Am','Am'], bass:'puls'},
      X:{akkorde:['F','F','F','F'], bass:'puls'}},
    folge:['A'], ebenen:[['bass']]},
  lead:{bpm:120, swing:0, abschnitte:{
      A:{akkorde:['Am','Am','Am','Am'], lead:['A4 - - . C#5 - - . . . . . . . . . .']}},
    folge:['A'], ebenen:[['lead']]},
  dicht:{bpm:200, swing:0.2, abschnitte:{
      A:{akkorde:['Am','F','C','G'], bass:'achtel', drums:'sprint', arp:'auf',
         lead:['C5 - D5 - E5 - F5 - G5 - A5 - B5 - C6 -']}},
    folge:['A'], ebenen:[['bass','drums','arp','lead']]},
};

let ok=0, fehl=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fehl++; console.log('  FEHL '+n+(i!==undefined?'   -> '+i:'')); } };
const nahe=(a,b,tol)=>Math.abs(a-b)<(tol===undefined?1e-6:tol);
const hzNah=(a,b)=>Math.abs(a-b)<0.8;
const sd=0.125, takt2=2;   // Sechzehntel und Takt bei 120 bpm

// Schiebt die Audio-Uhr in 25-ms-Schritten vor und ruft den Planer wie das Spiel.
function laufe(sek){
  const ende=zeit+sek;
  while(zeit<ende-1e-9){ zeit=Math.min(ende, zeit+0.025); TAKT(); }
}
// Frischer Start: Planer aus, Uhr auf 0, alte Knoten und Automationen vergessen.
function neuStart(){ M.stop(); zeit=0; knotenAlle.length=0; aufrufe.length=0; }
const ersteOhne=(hz)=>knotenAlle.find(n=>hzNah(n.hz,hz));

console.log('\n--- AUFBAU UND STIL-TABELLEN ---');
pruefe('setInterval: takt alle 25 ms', intervalAufrufe.length===1 && intervalAufrufe[0][1]===25 && intervalAufrufe[0][0]===M.takt);
pruefe('Bass-Stile je 16 Zeichen', E('Object.values(MUSIK_STIL_BASS).every(s=>s.p.length===16)'));
pruefe('Schlagzeug-Stile je 16 Zeichen (k, s, h)', E("Object.values(MUSIK_STIL_DRUMS).every(s=>s.k.length===16&&s.s.length===16&&s.h.length===16)"));
pruefe('Arpeggio-Stile je 16 Zeichen', E('Object.values(MUSIK_STIL_ARP).every(s=>s.p.length===16)'));
pruefe('Stinger haben 3-6 Toene', E('Object.values(MUSIK_STINGER).every(s=>s.noten.length>=3&&s.noten.length<=6)'));

console.log('\n--- OHNE AUDIO: KEINE AUSNAHME ---');
k.AC=null;
let werf=null;
try{
  M.spiele('zwei'); M.takt(); M.spannung(1); M.abschnitt('B'); M.tempo(150);
  M.stinger('fund'); M.daempfen(true); M.takt(); M.spiele('gibtsnicht'); M.takt();
  M.stop(); M.takt();
}catch(e){ werf=e; }
pruefe('ohne AC: alle Aufrufe ohne Ausnahme', werf===null, werf&&werf.message);
pruefe('ohne AC: schlag() ist null', M.schlag()===null);
k.AC=AC;

console.log('\n--- NOTENSTAU ---');
neuStart();
M.spiele('bass'); laufe(1.0);
zeit+=5;                                    // 5 s Stillstand, kein takt()
const v0=oszAnz;
TAKT();
const neu=oszAnz-v0;
pruefe('Notenstau: ein takt() nach 5 s plant hoechstens 2 Knoten', neu<=2, neu);
pruefe('Notenstau: neue Noten liegen in der Gegenwart, nicht in der Vergangenheit',
  knotenAlle.slice(knotenAlle.length-neu).every(n=>n.an>=zeit-1e-9));

console.log('\n--- SPIELE IDEMPOTENT, SONGWECHSEL AN DER TAKTGRENZE ---');
neuStart();
M.spiele('bass'); laufe(1.0);
const n0=knotenAlle.length;
for(let i=0;i<200;i++) M.spiele('bass');
laufe(3.0);
const onsets=knotenAlle.slice(n0).map(n=>n.an).sort((a,b)=>a-b);
let doppelt=false, abweichung=0;
for(let i=1;i<onsets.length;i++){
  const d=onsets[i]-onsets[i-1];
  if(d<1e-9) doppelt=true;
  abweichung=Math.max(abweichung, Math.abs(d-2*sd));   // bass 'puls': Achtel = 0,25 s
}
pruefe('spiele() gleicher Song: keine doppelten Noten, gleichmaessiger Puls', !doppelt && abweichung<1e-6 && M.aktuell().song==='bass', abweichung);

neuStart();
M.spiele('bass'); laufe(1.0);
M.spiele('zwei');
pruefe('Songwechsel: wartet auf die Taktgrenze', M.aktuell().song==='bass');
laufe(2.5);
pruefe('Songwechsel: danach zwei', M.aktuell().song==='zwei');

console.log('\n--- SPANNUNG UND ABSCHNITT NUR AN DER TAKTGRENZE ---');
neuStart();
M.spiele('zwei'); M.spannung(0); laufe(0.7);
const tCall=zeit;
M.spannung(1);
pruefe('spannung: mitten im Takt noch Ebene 0', M.aktuell().ebene===0);
laufe(2.5);
const T0=ersteOhne(110).an;                 // erste Bassnote = Taktbeginn
const kicks=knotenAlle.filter(n=>hzNah(n.hz,150)&&n.an>=tCall).map(n=>n.an).sort((a,b)=>a-b);
const naechsteGrenze=T0+takt2*Math.ceil((tCall-T0)/takt2+1e-9);
pruefe('spannung: erster Schlag genau auf der naechsten Taktgrenze',
  kicks.length>0 && nahe(kicks[0],naechsteGrenze), kicks[0]+' vs '+naechsteGrenze);
pruefe('spannung: danach Ebene 1', M.aktuell().ebene===1);

neuStart();
M.spiele('zwei'); laufe(1.0);
const tC=zeit;
M.abschnitt('B');
laufe(2.5);
const Tb=T0+takt2;
const bass=knotenAlle.filter(n=>n.an>=tC-1e-9&&n.typ==='osc').sort((a,b)=>a.an-b.an);
const vorB=bass.filter(n=>n.an<Tb-1e-9), nachB=bass.filter(n=>n.an>=Tb-1e-9);
pruefe('abschnitt: bis zur Taktgrenze noch A (Am = 110 Hz)', vorB.length>0 && vorB.every(n=>hzNah(n.hz,110)));
pruefe('abschnitt: ab der Taktgrenze B (F = 87 Hz)', nachB.length>0 && hzNah(nachB[0].hz,87.3) && nahe(nachB[0].an,Tb));

neuStart();
M.abschnitt('B');                             // vor dem Songstart gewuenscht
M.spiele('zwei'); laufe(0.5);
pruefe('abschnitt vor Songstart: greift schon im ersten Takt', M.aktuell().abschnitt==='B');

console.log('\n--- ABSCHNITT ALS SCHLEIFE, BIS NULL ---');
neuStart();
M.spiele('loop'); laufe(1.0);
M.abschnitt('X');
laufe(10);
pruefe('abschnitt X nicht in der Folge: bleibt in der Schleife', M.aktuell().abschnitt==='X');
M.abschnitt(null);
laufe(9);
pruefe('abschnitt(null): danach zurueck in die Folge (A)', M.aktuell().abschnitt==='A');

console.log('\n--- TEMPO UND SCHLAG ---');
neuStart();
M.spiele('bass'); laufe(1.3);
const s=M.schlag();
pruefe('schlag: Sechzehntel 9 bei 1,3 s (Takt 0)', s!==null && s.schritt===9 && s.takt===0, s&&JSON.stringify(s));
pruefe('schlag: 120 bpm, Viertel 0,5 s, seit+bis = Viertel',
  s!==null && nahe(s.bpm,120) && nahe(s.seitSchlag,0.225) && nahe(s.bisSchlag,0.275) && nahe(s.bisSchlag+s.seitSchlag,0.5));
M.tempo(180);
laufe(1.0);
pruefe('tempo: nach der Taktgrenze 180 bpm', M.schlag()!==null && nahe(M.schlag().bpm,180));
M.stop();
pruefe('schlag ohne Song: null', M.schlag()===null);

console.log('\n--- MUTED, STOP, STINGER, DAEMPFEN ---');
neuStart();
M.spiele('bass'); laufe(0.5);
k.muted=true;
const vM=oszAnz;
laufe(2);
pruefe('muted: keine Noten', oszAnz===vM);
pruefe('muted: Zeit rueckt trotzdem weiter (schlag liefert Werte)', M.schlag()!==null && M.schlag().schritt>=0);
M.stinger('alarm');
pruefe('muted: Stinger spielt nichts', oszAnz===vM);
k.muted=false;
laufe(1);
pruefe('ungemutet: wieder Noten', oszAnz>vM);

M.stop();
const vS=oszAnz;
laufe(1);
pruefe('stop(): aktuell song null, keine Noten mehr', M.aktuell().song===null && oszAnz===vS);

neuStart();
M.spiele('bass'); laufe(1.0);
const vSt=oszAnz, aVor=aufrufe.length;
M.stinger('fund');
const stNoten=knotenAlle.slice(knotenAlle.length-(oszAnz-vSt));
pruefe('stinger fund: vier Toene (C5 E5 G5 C6)', oszAnz-vSt===4 && stNoten.map(n=>Math.round(n.hz)).join()==='523,659,784,1047',
  stNoten.map(n=>Math.round(n.hz)).join());
pruefe('stinger: auf die naechste Achtel (Raster 0,25 s), nicht in der Vergangenheit',
  stNoten.length>0 && stNoten[0].an>=zeit-1e-9 && nahe(((stNoten[0].an-T0)/0.25),Math.round((stNoten[0].an-T0)/0.25)));
const duck=aufrufe.slice(aVor).find(a=>a.typ==='gain'&&a.name==='gain'&&a.fn==='set'&&nahe(a.v,0.4));
pruefe('stinger: Musik wird auf 40 % geduckt, zum Start des Stingers', !!duck && stNoten.length>0 && nahe(duck.t,stNoten[0].an));

const aD=aufrufe.length;
M.daempfen(true);
pruefe('daempfen an: Tiefpass 900 Hz', aufrufe.slice(aD).some(a=>a.name==='freq'&&a.fn==='target'&&nahe(a.v,900)));
M.daempfen(false);
pruefe('daempfen aus: Tiefpass wieder 20000 Hz', aufrufe.slice(aD).some(a=>a.name==='freq'&&a.fn==='target'&&nahe(a.v,20000)));

console.log('\n--- LEAD, SWING, KLANGBUDGET ---');
neuStart();
M.spiele('lead'); laufe(1.0);
const leads=knotenAlle.filter(n=>hzNah(n.hz,440)||hzNah(n.hz,554.37)).sort((a,b)=>a.an-b.an);
pruefe('Lead: A4 (440 Hz) am Taktbeginn, C#5 (554 Hz) nach vier Sechzehnteln',
  leads.length>=2 && hzNah(leads[0].hz,440) && nahe(leads[0].an,T0) && hzNah(leads[1].hz,554.37) && nahe(leads[1].an,T0+4*sd),
  leads.map(n=>Math.round(n.hz)+'@'+n.an.toFixed(3)).join(' '));

neuStart();
M.spiele('dicht'); laufe(20);
const ereignisse=[];
knotenAlle.forEach(n=>{ ereignisse.push([n.an,1]); ereignisse.push([n.aus>n.an?n.aus:n.an,-1]); });
ereignisse.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
let cur=0, maxG=0;
for(const e of ereignisse){ cur+=e[1]; if(cur>maxG) maxG=cur; }
pruefe('Klangbudget: nie mehr als 32 Knoten gleichzeitig (dichter Song, 20 s)', maxG<=32, maxG);
pruefe('dichter Song spielt tatsaechlich (viele Knoten)', knotenAlle.length>300, knotenAlle.length);
M.stop();

console.log('\n'+ok+' ok, '+fehl+' fehl');
process.exit(fehl?1:0);
