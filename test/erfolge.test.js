/* Prueft nacht/erfolge.js (Erfolge: gib, hat, alle, anzahl, Speicher, Popup, Zeichen).
   Ohne Browser. Aus dem Projektordner starten:  node test/erfolge.test.js */
const fs=require('fs'), vm=require('vm');
const quelle=fs.readFileSync('nacht/erfolge.js','utf8');

const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };
const wirft=()=>{ const f=()=>{ throw new Error('kaputt'); }; return {getItem:f,setItem:f,removeItem:f}; };

// Frische Instanz von erfolge.js in einer eigenen Umgebung. Was nicht uebergeben wird, fehlt (typeof undefined).
function baue(o){
  o=o||{};
  const k={ Math,console,Object,JSON,Array,String,Number,Set,Map,window:{},
    localStorage:o.localStorage, W:o.W, SAFT:o.SAFT, MUSIK:o.MUSIK };
  if(o.localStorage===undefined) delete k.localStorage;
  if(o.W===undefined) delete k.W;
  if(o.SAFT===undefined) delete k.SAFT;
  if(o.MUSIK===undefined) delete k.MUSIK;
  vm.createContext(k);
  vm.runInContext(quelle,k);
  return { E:c=>vm.runInContext(c,k), k:k, erf:k.window.ERFOLG };
}

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };
const wirftNicht=f=>{ try{ f(); return true; }catch(e){ return false; } };

console.log('\n--- GIB: NEU, ZWEIMAL, UNBEKANNT ---');
{
  const b=baue({localStorage:speicher()}), e=b.erf;
  pruefe('gib neuer Erfolg: true', e.gib('legende')===true);
  pruefe('gib zweimal: false', e.gib('legende')===false);
  pruefe('gib unbekannte ID: false', e.gib('gibts_nicht')===false);
  pruefe('gib ohne ID: false, kein Wurf', wirftNicht(()=>e.gib())&&e.gib()===false&&e.gib(7)===false);
  pruefe('window.ERFOLG wird gesetzt', typeof b.k.window.ERFOLG==='object'&&typeof e.gib==='function');
}

console.log('\n--- HAT, ANZAHL, ALLE ---');
{
  const b=baue({localStorage:speicher()}), e=b.erf;
  pruefe('hat vor gib: false', e.hat('probe_ruf')===false);
  e.gib('probe_ruf');
  pruefe('hat nach gib: true', e.hat('probe_ruf')===true);
  pruefe('hat unbekannt: false', e.hat('gibts_nicht')===false);
  const z=e.anzahl();
  pruefe('anzahl: 1 von 14', z.hat===1&&z.gesamt===14, JSON.stringify(z));
  const a=e.alle();
  pruefe('alle: 14 Eintraege in Listenreihenfolge', a.length===14&&a[0].id==='legende'&&a[13].id==='nacht_durch');
  pruefe('alle: hat-Flag je Eintrag', a[1].hat===true&&a[0].hat===false);
  pruefe('alle: Felder id, titel, text, hat', a[0].titel==='LEGENDE'&&a[0].text==='RUF 85 ERREICHT');
  a[0].hat=true; a.pop();
  pruefe('alle liefert eine Kopie (Aenderung wirkt nicht)', e.alle().length===14&&e.hat('legende')===false);
}

console.log('\n--- SPEICHER BLEIBT ---');
{
  const sp=speicher();
  baue({localStorage:sp}).erf.gib('rang_s');
  pruefe('Schluessel nachtschicht.erfolge als JSON-Liste', sp.getItem('nachtschicht.erfolge')==='["rang_s"]', sp.getItem('nachtschicht.erfolge'));
  const neu=baue({localStorage:sp}).erf;
  pruefe('neue Instanz, gleicher Speicher: hat bleibt', neu.hat('rang_s')===true);
  pruefe('neue Instanz: gib derselben ID ist false', neu.gib('rang_s')===false);
  sp.setItem('nachtschicht.erfolge','kaputt{');
  pruefe('kaputter Speicherwert: leer, kein Wurf', wirftNicht(()=>baue({localStorage:sp}))&&baue({localStorage:sp}).erf.anzahl().hat===0);
  sp.setItem('nachtschicht.erfolge','["gibts_nicht","legende"]');
  pruefe('unbekannte IDs im Speicher werden ignoriert', baue({localStorage:sp}).erf.anzahl().hat===1);
}

console.log('\n--- SPEICHER WIRFT: KEINE AUSNAHME ---');
{
  const b=baue({localStorage:wirft()}), e=b.erf;
  let r=null;
  pruefe('Speicher wirft: gib wirft nicht und gibt true', wirftNicht(()=>{ r=e.gib('legende'); })&&r===true);
  pruefe('Speicher wirft: Sitzung merkt es trotzdem', e.hat('legende')===true);
  pruefe('Speicher wirft: alle und anzahl gehen', wirftNicht(()=>{ e.alle(); e.anzahl(); }));
  pruefe('Speicher wirft: reset wirft nicht', wirftNicht(()=>e.reset()));
  const ohne=baue({}).erf;
  pruefe('ohne localStorage gar nicht vorhanden: gib geht', ohne.gib('legende')===true&&ohne.hat('legende')===true);
}

console.log('\n--- POPUP UND STINGER ---');
{
  const popups=[], stinger=[];
  const SAFT={popup:(t,x,y,f)=>popups.push([t,x,y,f])};
  const MUSIK={stinger:n=>stinger.push(n)};
  const e=baue({localStorage:speicher(), W:320, SAFT, MUSIK}).erf;
  e.gib('rang_s');
  pruefe('Popup-Attrappe bekommt ERFOLG: TITEL', popups.length===1&&popups[0][0]==='ERFOLG: GLATTE S', JSON.stringify(popups));
  pruefe('Popup mittig (W/2), Hoehe 62, Gold', popups[0][1]===160&&popups[0][2]===62&&popups[0][3]==='#ffd447', JSON.stringify(popups[0]));
  pruefe('Stinger fund ausgeloest', stinger.join()==='fund', stinger.join());
  e.gib('rang_s');
  pruefe('zweites gib: kein weiteres Popup, kein weiterer Stinger', popups.length===1&&stinger.length===1);
  const e2=baue({localStorage:speicher(), SAFT:{popup:()=>{ throw new Error('x'); }}, MUSIK:{stinger:()=>{ throw new Error('y'); }}}).erf;
  pruefe('Popup und Stinger werfen: gib trotzdem true, kein Wurf', wirftNicht(()=>e2.gib('legende'))&&e2.hat('legende'));
  const e3=baue({localStorage:speicher()}).erf;
  pruefe('ohne SAFT und MUSIK: gib geht', wirftNicht(()=>e3.gib('probe_mut'))&&e3.hat('probe_mut'));
  const e4=baue({localStorage:speicher(), W:undefined, SAFT:{popup:(t,x)=>popups.push([t,x])}}).erf;
  popups.length=0;
  e4.gib('l1_unsichtbar');
  pruefe('ohne W: Popup-X ist 160', popups[0][1]===160, JSON.stringify(popups));
}

console.log('\n--- RESET ---');
{
  const sp=speicher();
  const e=baue({localStorage:sp}).erf;
  e.gib('alles_s'); e.gib('nacht_durch');
  e.reset();
  pruefe('reset: nichts mehr da', e.anzahl().hat===0&&e.hat('alles_s')===false);
  pruefe('reset: Speicher geleert', sp.getItem('nachtschicht.erfolge')===null);
  pruefe('reset: danach wieder gib moeglich', e.gib('alles_s')===true);
}

console.log('\n--- TITEL UND TEXTE ---');
{
  const e=baue({localStorage:speicher()}), E=e.E;
  const erlaubt=/^[A-Z0-9 .:\-!?\/+,<>*%()'"]*$/;
  const liste=E('ERFOLGE');
  pruefe('ERFOLGE hat 14 Eintraege', Array.isArray(liste)&&liste.length===14, String(liste&&liste.length));
  pruefe('IDs einzigartig', new Set(liste.map(x=>x.id)).size===liste.length);
  pruefe('Titel hoechstens 20 Zeichen', liste.every(x=>x.titel.length<=20), liste.filter(x=>x.titel.length>20).map(x=>x.titel).join('|'));
  pruefe('Texte hoechstens 40 Zeichen', liste.every(x=>x.text.length<=40), liste.filter(x=>x.text.length>40).map(x=>x.text).join('|'));
  pruefe('Titel nur Canvas-Zeichen', liste.every(x=>erlaubt.test(x.titel)), liste.filter(x=>!erlaubt.test(x.titel)).map(x=>x.titel).join('|'));
  pruefe('Texte nur Canvas-Zeichen', liste.every(x=>erlaubt.test(x.text)), liste.filter(x=>!erlaubt.test(x.text)).map(x=>x.text).join('|'));
  pruefe('Titel und Texte nicht leer', liste.every(x=>x.titel.length>0&&x.text.length>0));
  pruefe('ERFOLG.liste zeigt auf dieselbe Liste', E('ERFOLG.liste.length')===14);
}

console.log('\n'+ok+' ok, '+fail+' fehl');
process.exit(fail?1:0);
