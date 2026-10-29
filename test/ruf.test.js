/* Prueft Ruf-Stufen (rufStufe), Popups bei wirke() fuer Ruf und Mut und den Stufenwechsel.
   Ohne Browser. Aus dem Projektordner starten:  node test/ruf.test.js */
const fs=require('fs'), vm=require('vm');

const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };
const wirftNicht=f=>{ try{ f(); return true; }catch(e){ return false; } };

// Attrappen: SAFT.popup sammelt Texte, ERFOLG.gib sammelt Erfolgs-IDs.
let pops=[], gibs=[];
const saftStub={popup:(t,x,y,f)=>pops.push({t,x,y,f})};
const erfolgStub={gib:id=>gibs.push(id)};

// Frische vm-Umgebung mit stand.js (Crew/Pegel-Helfer) und nacht.js.
const kx={Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
  localStorage:speicher(), W:320, H:180, IS_TOUCH:false, window:{},
  setTimeout(){}, matchMedia:undefined, performance:{now:()=>0},
  SAFT:saftStub, ERFOLG:erfolgStub};
vm.createContext(kx);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),kx);
const E=c=>vm.runInContext(c,kx);
['nacht/stand.js','nacht/nacht.js'].forEach(lade);

const setze=(k,v)=>E('setzeWert('+JSON.stringify(k)+','+v+')');
const wirke=w=>E('wirke('+JSON.stringify(w)+')');
const frisch=()=>{ pops=[]; gibs=[]; };
const txte=()=>pops.map(p=>p.t);

console.log('\n--- RUF-STUFEN (rufStufe) ---');
const stufen=[[0,'UNBEKANNT'],[24,'UNBEKANNT'],[25,'DABEI'],[44,'DABEI'],[45,'BEKANNT'],[64,'BEKANNT'],
  [65,'GEFEIERT'],[84,'GEFEIERT'],[85,'LEGENDE'],[100,'LEGENDE']];
stufen.forEach(([r,n])=>{
  const got=E('rufStufe('+r+').name');
  pruefe('rufStufe('+r+') -> '+n, got===n, got);
});
setze('ruf',70);
pruefe('rufStufe() ohne Argument liest den Ruf (70 -> GEFEIERT)', E('rufStufe().name')==='GEFEIERT');

console.log('\n--- POPUP BEI WIRKUNG ---');
setze('ruf',50); setze('mut',30); frisch();
wirke({ruf:10});
pruefe('wirke({ruf:+10}) -> Popup "+10 RUF"', txte().includes('+10 RUF'), txte().join('|'));
pruefe('Popup-Farbe Ruf plus', pops[0]&&pops[0].f==='#5fe08a', pops[0]&&pops[0].f);
frisch();
wirke({mut:-5});
pruefe('wirke({mut:-5}) -> Popup "-5 MUT"', txte().includes('-5 MUT'), txte().join('|'));
pruefe('Popup-Farbe Mut minus', pops[0]&&pops[0].f==='#ff9e6b', pops[0]&&pops[0].f);
frisch();
wirke({ruf:0});
pruefe('wirke({ruf:0}) -> kein Popup', pops.length===0, txte().join('|'));
frisch();
wirke({mut:0});
pruefe('wirke({mut:0}) -> kein Popup', pops.length===0, txte().join('|'));

console.log('\n--- STUFENWECHSEL ---');
setze('ruf',40); frisch();
wirke({ruf:10});
pruefe('Stufenwechsel 40->50 zeigt "RUF: BEKANNT!"', txte().includes('RUF: BEKANNT!'), txte().join('|'));
pruefe('Stufenwechsel nach oben: Farbe gold', pops.some(p=>p.t==='RUF: BEKANNT!'&&p.f==='#ffd447'));
frisch();
setze('ruf',50); frisch();
wirke({ruf:-10});
pruefe('Stufenwechsel nach unten zeigt "RUF: DABEI" ohne Ausrufezeichen', txte().includes('RUF: DABEI'), txte().join('|'));
pruefe('Stufenwechsel nach unten: Farbe rot', pops.some(p=>p.t==='RUF: DABEI'&&p.f==='#ff4d4d'));
frisch();
setze('ruf',80); frisch();
wirke({ruf:10});
pruefe('Wechsel auf LEGENDE gibt Erfolg "legende"', gibs.join()==='legende', gibs.join());
pruefe('Wechsel auf LEGENDE zeigt "RUF: LEGENDE!"', txte().includes('RUF: LEGENDE!'), txte().join('|'));

console.log('\n--- OHNE SAFT: KEINE AUSNAHME ---');
const merkSaft=kx.SAFT;
delete kx.SAFT;
setze('ruf',40);
pruefe('ohne SAFT: wirke({ruf:+10}) wirft nicht und aendert den Ruf', wirftNicht(()=>wirke({ruf:10}))&&E('wert("ruf")')===50);
pruefe('ohne SAFT: wirke({mut:-5}) wirft nicht', wirftNicht(()=>wirke({mut:-5})));
kx.SAFT=merkSaft;

console.log('\n'+ok+' ok, '+fail+' fehl');
if(fail) process.exit(1);
