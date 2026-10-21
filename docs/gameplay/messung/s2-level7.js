/* Messung s2 - Level 7 (Spaeti): Pfandwurf, Einkaufsliste, Rang.
   Aus dem Projektstamm: node docs/gameplay/messung/s2-level7.js
   Laeuft im Attrappen-Browser von tools/nachttest.js (kein Ton, keine Pixel).
   Teil a: das neue Element wirkt (Zustand vorher/nachher bei Treffer, Fehlwurf, Abklingzeit).
   Teil b: WERTUNG.abschluss liefert bei einem Levelende einen Rang (zwei Szenarien). */
const path=require('path');
process.chdir(path.join(__dirname,'..','..','..'));
const N=require(path.join(process.cwd(),'tools','nachttest.js'));

const frisch=()=>{
  const L=N.lade('level7.html','?lektion=0');
  L.api.ev('starte()'); L.api.ev('KAPITEL.aktiv=false'); L.api.ev('starteLevel()');
  L.api.ev('S.x=PFANDWURF.x; S.tiefe=PFANDWURF.t; S.kamX=Math.max(0,Math.min(LEVEL_B-W,S.x-W/2));');
  return L;
};
const zustand=(L)=>L.api.ev('JSON.stringify({modus:S.modus,geld:Number(wert("geld")).toFixed(2),'+
  'wuerfe:S.wuerfe,treffer:S.treffer,combo:S.combo,runde:S.wurfRunde,pause:Math.ceil(S.wurfPauseT),'+
  'wurf:S.wurf?S.wurf.phase:null,ziel:naechstesZiel()?naechstesZiel().art:null,'+
  'liste:LISTE.map(a=>a.id+(a.fertig()?"+":"-")).join(" ")})');

/* Ein Wurf: E halten, bis die Kraft in der Zone liegt (treffen) oder sofort loslassen (daneben).
   Gibt true/false zurueck: ob der Wurf zum Treffer gedacht war. */
const wirf=(L,treffen)=>{
  L.taste('KeyE',true); L.api.ev('update(1/60)');
  for(let i=0;i<400;i++){
    const k=L.api.ev('S.wurf&&S.wurf.phase==="laden"?S.wurf.kraft:-1');
    if(k<0) break;
    if(treffen){ if(k>=0.52&&k<=0.68){ break; } }
    else if(i>=1){ break; }
    L.api.ev('update(1/60)');
  }
  L.taste('KeyE',false);
  for(let i=0;i<200&&L.api.ev('!!S.wurf');i++) L.api.ev('update(1/60)');
};

console.log('== a) Pfandwurf wirkt');
let L=frisch();
console.log('vorher       ', zustand(L));
wirf(L,true);
console.log('nach Treffer ', zustand(L));
wirf(L,false);
console.log('nach Fehlwurf', zustand(L));
L.api.ev('S.wurfRunde=S.wurfRunde');
let n=0; while(n<6){ n++; if(L.api.ev('!!S.wurfPauseT')) break; wirf(L,n%2===0); }
console.log('Runde voll   ', zustand(L));
L.taste('KeyE',true); L.api.ev('update(1/60)'); L.taste('KeyE',false);
console.log('E in Pause   ', zustand(L), '(Wurf darf nicht starten)');
for(let i=0;i<6*60+5;i++) L.api.ev('update(1/60)');
console.log('nach 6 s     ', zustand(L));
L.api.ev('setzeFlag("spaetiWasser",true); setzeFlag("spaetiSnack",true)');
L.api.ev('S.pfandAb=true; S.bankFrag={JONAS:true}');
L.api.ev('update(1/60)');
console.log('Liste erledigt', zustand(L), '| Striche:', L.api.ev('JSON.stringify(S.striche)'));

console.log('== b) Rang bei Levelende');
const szenario=(name,setz)=>{
  const M=frisch();
  M.api.ev(setz);
  M.api.ev('levelGeschafft()');
  const punkte=M.api.ev('rangRechnen().punkte');
  const zeilen=M.api.ev('JSON.stringify(rangRechnen().zeilen)');
  console.log(name.padEnd(12), 'Punkte', punkte, '| Bestrang 7:', M.api.ev('WERTUNG.best(7)'), '|', zeilen);
};
szenario('voll',
  'setzeFlag("spaetiWasser",true); setzeFlag("spaetiSnack",true); S.pfandAb=true; S.bankFrag={A:true};'+
  'S.wuerfe=5; S.treffer=4; S.gespr={a:1,b:1,c:1,d:1,e:1,f:1}; S.zeit=170;');
szenario('leer',
  'S.wuerfe=0; S.treffer=0; S.gespr={a:1}; S.zeit=400;');
szenario('mittel',
  'setzeFlag("spaetiWasser",true); setzeFlag("spaetiSnack",true); S.wuerfe=5; S.treffer=2; S.gespr={a:1,b:1,c:1}; S.zeit=260;');
console.log('MUSIK vorhanden:', L.api.ev('typeof MUSIK'), '| Song:', L.api.ev('typeof MUSIK!=="undefined"?JSON.stringify(MUSIK.aktuell()):"-"'),
  '(ohne Ton kann MUSIK keinen Song spielen)');
