/* Prueft nacht/pause.js (Pausemenue am Rechner) ohne Browser.
   Aus dem Projektordner starten:  node test/pause.test.js */
const fs=require('fs'), vm=require('vm');
const quelle=fs.readFileSync('nacht/pause.js','utf8');
const ERLAUBT=/^[A-Z0-9 .:\-!?\/+,<>*%()'"]*$/;

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };
const wirftNicht=f=>{ try{ f(); return true; }catch(e){ return false; } };

/* Eine frische Welt: Engine-Globale als Attrappen. Optionen: dok:false (kein document),
   fenster:false (kein window). */
function welt(o){
  o=o||{};
  let zeit=0, neu=0, audio=0;
  const hand={}, blur=[], musik=[], piepe=[], gez=[], sichtbar=[];
  const kx={ Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
    Event:function(t){ this.type=t; },
    performance:{now:()=>zeit}, setTimeout(){} };
  kx.KOMFORT={ werte:{flackerschutz:false,wackeln:true,roehre:true},
    hole(k){ return this.werte[k]; },
    umschalten(k){ this.werte[k]=!this.werte[k]; return this.werte[k]; } };
  kx.MUSIK={ daempfen(an){ musik.push(an); } };
  kx.GERAET={ beiSichtbar(f){ sichtbar.push(f); } };
  kx.S={modus:'spiel'};
  kx.MENUE={ an:false, aktiv(){ return this.an; }, galerieOffen(){ return false; } };
  kx.kapitel=false;
  kx.kapitelAktiv=()=>!!kx.kapitel;
  kx.neuesSpiel=()=>{ neu++; };
  kx.ensureAudio=()=>{ audio++; };
  kx.piep=(f)=>{ piepe.push(f); };
  kx.cv={ getBoundingClientRect:()=>({left:0,top:0,width:320,height:180}) };
  kx.W=320; kx.H=180;
  kx.ctx=new Proxy({},{get:(t,k)=>k in t?t[k]:()=>{}, set:(t,k,v)=>{ t[k]=v; return true; }});
  kx.text=(s)=>{ gez.push(String(s)); };
  kx.textC=(s)=>{ gez.push(String(s)); };
  kx.textGlowC=(s)=>{ gez.push(String(s)); };
  kx.textW=(s)=>String(s).length*4;
  kx.location={href:''};
  if(o.dok!==false){ kx.document={}; kx.addEventListener=(t,f)=>{ (hand[t]=hand[t]||[]).push(f); }; }
  if(o.fenster!==false){ kx.window={ dispatchEvent(e){ blur.push(e.type); },
    MOBIL:{an:false}, HANDY:{offen:false}, LEHRE:{aktiv:false} }; }
  vm.createContext(kx);
  vm.runInContext('let muted=false;',kx);     // wie ton.js: globale Variable (let)
  vm.runInContext(quelle,kx);
  return {
    kx, hand, blur, musik, piepe, gez, sichtbar,
    E:c=>vm.runInContext(c,kx),
    neu:()=>neu, audio:()=>audio,
    muted:()=>vm.runInContext('muted',kx),
    setzeZeit:z=>{ zeit=z; },
  };
}

/* Tastendruck an alle Keydown-Hoerer; gibt das Ereignis zurueck (verhindert, gestoppt). */
function taste(w,code,extra){
  const e=Object.assign({code:code,repeat:false,ctrlKey:false,metaKey:false,altKey:false,
    verhindert:false,gestoppt:false,
    preventDefault(){ e.verhindert=true; }, stopImmediatePropagation(){ e.gestoppt=true; }},extra||{});
  (w.hand.keydown||[]).forEach(f=>f(e));
  return e;
}
/* Zeigerereignis (pointerdown/pointermove) an die angemeldeten Hoerer. */
function zeiger(w,typ,x,y,extra){
  const e=Object.assign({pointerType:'mouse',buttons:0,pointerId:1,clientX:x,clientY:y,verhindert:false,gestoppt:false,
    preventDefault(){ e.verhindert=true; }, stopPropagation(){ e.gestoppt=true; }, stopImmediatePropagation(){}},extra||{});
  (w.hand[typ]||[]).forEach(f=>f(e));
  return e;
}

console.log('\n--- LADEN OHNE BROWSER ---');
pruefe('ohne document und window: laedt ohne Wurf', wirftNicht(()=>welt({dok:false,fenster:false})));
{
  const w=welt({dok:false,fenster:false});
  pruefe('ohne Browser: PAUSE da, keine Listener', w.E('typeof PAUSE')==='object'&&Object.keys(w.hand).length===0);
  pruefe('ohne Browser: eintraege liefert Liste', w.E("PAUSE.eintraege('haupt').length")===5);
}
{
  const w=welt();
  pruefe('mit document: Tasten- und Mauslistener angemeldet', !!w.hand.keydown&&!!w.hand.pointerdown&&!!w.hand.pointermove);
  pruefe('Tastenlistener nur fuer keydown (keyup nicht abgefangen)', w.hand.keyup===undefined);
}

console.log('\n--- EINTRAEGE ---');
let w=welt();
const ids=m=>w.E("PAUSE.eintraege('"+m+"').map(e=>e.id).join()");
const wert=id=>w.E("PAUSE.eintraege('einst').find(e=>e.id==='"+id+"').wert");
pruefe('haupt: weiter, WAS JETZT?, neu, einst, menue', ids('haupt')==='weiter,hilfe,neu,einst,menue', ids('haupt'));
pruefe('einst: Eintraege in der richtigen Reihe', ids('einst')==='flacker,wackeln,roehre,ton,schwer,tipps,tippsNeu,zurueck', ids('einst'));
pruefe('einst enthaelt SCHWIERIGKEIT, TIPPS, TIPPS NEU ZEIGEN', ids('einst').includes('schwer')&&ids('einst').includes('tipps')&&ids('einst').includes('tippsNeu'));
pruefe('einst: SCHWIERIGKEIT zeigt NORMAL ohne stand.js', wert('schwer')==='NORMAL', wert('schwer'));
pruefe('einst: TIPPS zeigt AN ohne hilfe.js', wert('tipps')==='AN');
pruefe('neuSicher: abbrechen, neuJa', ids('neuSicher')==='abbrechen,neuJa', ids('neuSicher'));
pruefe('einst: FLACKERSCHUTZ AUS, WACKELN und ROEHREN AN (KOMFORT)', wert('flacker')==='AUS'&&wert('wackeln')==='AN'&&wert('roehre')==='AN');
pruefe('einst: TON AN bei ungedaempftem Ton', wert('ton')==='AN');
w.E('KOMFORT.werte.flackerschutz=true');
pruefe('einst: FLACKERSCHUTZ folgt KOMFORT (AN)', wert('flacker')==='AN');
w.E('muted=true');
pruefe('einst: TON AUS bei muted', wert('ton')==='AUS');
w.E('muted=false');

{
  const w2=welt({dok:false,fenster:false});
  w2.E('delete KOMFORT');
  pruefe('ohne KOMFORT: Werte AUS', w2.E("PAUSE.eintraege('einst').find(e=>e.id==='roehre').wert")==='AUS');
}

console.log('\n--- ZEICHEN: NUR ERLAUBTE ZEICHEN ---');
{
  const alle=Array.from(w.E("['haupt','einst','neuSicher'].map(m=>PAUSE.eintraege(m)).reduce((a,l)=>a.concat(l),[])"))
    .reduce((a,e)=>a.concat([e.txt],e.wert!==undefined?[e.wert]:[]),[]);
  const schlecht=alle.filter(s=>!ERLAUBT.test(s));
  pruefe('alle txt und wert aus den Listen erlaubt', schlecht.length===0, schlecht.join(' | '));
  const w3=welt();
  w3.E('PAUSE.auf()'); w3.E('PAUSE.zeichne()');
  w3.E("PAUSE.aktiviere('einst')"); w3.E('PAUSE.zeichne()');
  w3.E("PAUSE.aktiviere('zurueck')"); w3.E("PAUSE.aktiviere('neu')"); w3.E('PAUSE.zeichne()');
  const gezZeichnet=w3.gez.filter(s=>!ERLAUBT.test(s));
  pruefe('gezeichnete Texte in allen Modi erlaubt', gezZeichnet.length===0, gezZeichnet.join(' | '));
}

console.log('\n--- DARF AUF ---');
const darf=(mut)=>{ const x=welt(); mut(x); return x.E('PAUSE.darfAuf()'); };
pruefe('Spiel laeuft: darfAuf true', darf(()=>{})===true);
pruefe('ohne S: false', darf(x=>x.E('S=null'))===false);
pruefe("S.modus 'titel': false", darf(x=>x.E("S.modus='titel'"))===false);
pruefe("S.modus 'spiel': true", darf(x=>x.E("S.modus='spiel'"))===true);
pruefe('Handy-Modus (MOBIL.an): false', darf(x=>x.E('window.MOBIL.an=true'))===false);
pruefe('HANDY offen: false', darf(x=>x.E('window.HANDY.offen=true'))===false);
pruefe('MENUE.aktiv() true: false', darf(x=>x.E('MENUE.an=true'))===false);
pruefe('Lektion laeuft (LEHRE.aktiv): false', darf(x=>x.E('window.LEHRE.aktiv=true'))===false);
pruefe('Kapitelkarte (kapitelAktiv): false', darf(x=>x.E('kapitel=true'))===false);

console.log('\n--- AUF, ZU UND AKTIVIEREN ---');
w=welt();
pruefe('auf() oeffnet die Pause', w.E('PAUSE.auf()')===true&&w.E('PAUSE.aktiv()')===true);
pruefe('auf(): MUSIK gedaempft, Blur gesendet', w.musik.join()==='true'&&w.blur.join()==='blur');
pruefe("Modus 'haupt' nach dem Oeffnen", w.E('PAUSE.modus()')==='haupt');
w.E("PAUSE.aktiviere('weiter')");
pruefe('WEITER schliesst, MUSIK wieder an', w.E('PAUSE.aktiv()')===false&&w.musik[w.musik.length-1]===false);

w=welt(); w.E('PAUSE.auf()');
w.E("PAUSE.aktiviere('flacker')");
pruefe('flacker schaltet KOMFORT um', w.E('KOMFORT.werte.flackerschutz')===true);
w.E("PAUSE.aktiviere('ton')");
pruefe('ton kippt muted', w.muted()===true);
w.E("PAUSE.aktiviere('ton')");
pruefe('ton kippt muted zurueck', w.muted()===false&&w.audio()===1);
w.E("PAUSE.aktiviere('einst')");
pruefe("einst oeffnet 'einst'", w.E('PAUSE.modus()')==='einst');
w.E("PAUSE.aktiviere('zurueck')");
pruefe("zurueck geht nach 'haupt'", w.E('PAUSE.modus()')==='haupt');
w.E("PAUSE.aktiviere('neu')");
pruefe("neu -> Modus 'neuSicher'", w.E('PAUSE.modus()')==='neuSicher');
w.E("PAUSE.aktiviere('neuJa')");
pruefe('neuJa: neuesSpiel genau einmal, Pause zu', w.neu()===1&&w.E('PAUSE.aktiv()')===false);

w=welt(); w.E('PAUSE.auf()');
w.E("PAUSE.aktiviere('menue')");
pruefe("menue setzt location.href auf 'index.html'", w.kx.location.href==='index.html');

w=welt(); w.E('PAUSE.auf()');
let hilfeOk=true;
try{ w.E("PAUSE.aktiviere('hilfe')"); }catch(err){ hilfeOk=false; }
pruefe('WAS JETZT? schliesst die Pause und wirft ohne hilfe.js nicht', hilfeOk&&w.E('PAUSE.aktiv()')===false&&w.E('PAUSE.kaputt()')===false);

console.log('\n--- TASTEN ---');
w=welt();
let e=taste(w,'Escape');
pruefe('Esc oeffnet: Ereignis verhindert und gestoppt, Pause offen', e.verhindert&&e.gestoppt&&w.E('PAUSE.aktiv()')===true);
w=welt();
e=taste(w,'Escape',{repeat:true});
pruefe('Esc mit Wiederholung oeffnet nicht', !e.verhindert&&w.E('PAUSE.aktiv()')===false);
w=welt(); w.E('window.LEHRE.aktiv=true');
e=taste(w,'Escape');
pruefe('Lektion laeuft: Esc oeffnet nicht, Taste geht durch', !e.verhindert&&w.E('PAUSE.aktiv()')===false);
w=welt();
e=taste(w,'Enter');
pruefe('ohne Pause: Enter unberuehrt', !e.verhindert);

w=welt(); taste(w,'Escape');
w.setzeZeit(0);
const e1=taste(w,'Enter');
pruefe('Enter in der Sperre (0.15 s): tut nichts', w.E('PAUSE.modus()')==='haupt'&&w.E('PAUSE.aktiv()')===true&&e1.verhindert);
w.setzeZeit(500);
taste(w,'ArrowDown');
taste(w,'ArrowDown');
taste(w,'Enter');
pruefe('Pfeil runter x2 + Enter: NEU STARTEN -> neuSicher', w.E('PAUSE.modus()')==='neuSicher');
taste(w,'Escape');
pruefe('Esc in der Rueckfrage: zurueck nach haupt, offen', w.E('PAUSE.modus()')==='haupt'&&w.E('PAUSE.aktiv()')===true);
taste(w,'KeyP');
pruefe('P schliesst die Pause', w.E('PAUSE.aktiv()')===false);

w=welt(); taste(w,'Escape');
const f5=taste(w,'F5'), strg=taste(w,'KeyA',{ctrlKey:true}), mt=taste(w,'KeyM');
pruefe('F5, Strg+A, M gehen durch', !f5.verhindert&&!strg.verhindert&&!mt.verhindert&&w.E('PAUSE.aktiv()')===true);

console.log('\n--- FEHLER: DAS MENUE GIBT SICH AUF ---');
w=welt(); w.E('KOMFORT.umschalten=()=>{ throw new Error("kaputt"); }');
w.E('PAUSE.auf()');
w.E("PAUSE.aktiviere('flacker')");
pruefe('Fehler: aktiv false, kaputt true', w.E('PAUSE.aktiv()')===false&&w.E('PAUSE.kaputt()')===true);
pruefe('Fehler: MUSIK wieder an', w.musik[w.musik.length-1]===false);
e=taste(w,'Escape');
pruefe('nach dem Fehler oeffnet Esc nicht mehr', !e.verhindert&&w.E('PAUSE.aktiv()')===false&&w.E('PAUSE.darfAuf()')===false);

console.log('\n--- ZEICHNEN UND MAUS ---');
w=welt();
w.E('PAUSE.zeichne()');
pruefe('zeichne ohne Pause: nichts gezeichnet', w.gez.length===0);
w.E('PAUSE.auf()'); w.gez.length=0;
w.E('PAUSE.zeichne()');
pruefe('Titel PAUSE, ZUM MENUE und Tastenzeile da', w.gez.includes('PAUSE')&&w.gez.includes('ZUM MENUE')&&w.gez.some(s=>s.indexOf('PFEILE')===0), w.gez.join('|'));

w=welt(); w.E('PAUSE.auf()'); w.E('PAUSE.zeichne()');
zeiger(w,'pointerdown',160,82);            // Zeile 3: NEU STARTEN (nach WAS JETZT?)
pruefe('Klick auf NEU STARTEN: Rueckfrage', w.E('PAUSE.modus()')==='neuSicher');

w=welt(); w.E('PAUSE.auf()'); w.setzeZeit(500); w.E('PAUSE.zeichne()');
zeiger(w,'pointermove',160,96);            // Zeile 4: EINSTELLUNGEN
taste(w,'Enter');
pruefe('Ueberfahren waehlt EINSTELLUNGEN, Enter oeffnet sie', w.E('PAUSE.modus()')==='einst');

console.log('\n--- APP ZURUECKGEHOLT (GERAET.beiSichtbar) ---');
w=welt();
pruefe('pause.js meldet sich bei GERAET.beiSichtbar an', w.sichtbar.length===1);
w.sichtbar[0]();
pruefe('Tab zurueck mitten im Level: Pause geht auf', w.E('PAUSE.aktiv()')===true);

w=welt(); w.E('window.MOBIL.an=true');
w.sichtbar[0]();
pruefe('Tab zurueck am Handy (MOBIL.an): Pause bleibt zu', w.E('PAUSE.aktiv()')===false);

{
  const w4=welt({fenster:false});
  pruefe('ohne window: beiSichtbar meldet sich trotzdem an, ruft ohne Wurf', w4.sichtbar.length===1&&wirftNicht(()=>w4.sichtbar[0]()));
}

console.log('\n'+ok+' ok, '+fail+' fehl');
if(fail) process.exit(1);
