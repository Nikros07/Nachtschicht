/* Prueft das Startmenue aus nacht/menue.js ohne Browser: Fortschritt, Weiter-Auswahl,
   Eintraege je Zustand, Navigation.   node test/menue.test.js */
const fs=require('fs'), vm=require('vm');
const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };
const k={ Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
  localStorage:speicher(), W:320, H:180, IS_TOUCH:false, window:{}, setTimeout(){}, matchMedia:undefined };
vm.createContext(k);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),k);
lade('nacht/komfort.js'); lade('nacht/stand.js'); lade('nacht/nacht.js'); lade('nacht/texte.js'); lade('nacht/epilog.js'); lade('nacht/menue.js');
const E=c=>vm.runInContext(c,k);

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };
const ids=m=>E("MENUE.eintraege('"+m+"').map(e=>e.id)").join(',');
const frisch=()=>E("nachtZuruecksetzen(); localStorage.clear?0:0; for(let n=1;n<=8;n++) localStorage.removeItem(bestKey(n)); IS_TOUCH=false;");

console.log('\n--- Fortschritt ---');
frisch();
let f=E('MENUE.fortschritt()');
pruefe('frisch: Kapitel 1, kein WEITER, nur Level 1 frei', f.kapitel===1&&f.weiter===null&&f.erreicht===1);
E('NACHT.kapitel=3'); f=E('MENUE.fortschritt()');
pruefe('Kapitel 3: WEITER = Level 3, Ort aus den Kapiteltexten', f.weiter&&f.weiter.level===3&&f.weiter.ort==='DER LETZTE BUS'&&f.erreicht===3);
pruefe('WEITER geht ueber die Karte, solange der Umweg offen ist', f.weiter.seite==='karte.html?nach=2');
E("setzeFlag('umweg_2')"); f=E('MENUE.fortschritt()');
pruefe('Umweg erledigt: direkt level3.html', f.weiter.seite==='level3.html');
E('NACHT.kapitel=99'); f=E('MENUE.fortschritt()');
pruefe('Kapitel ueber 8 wird auf 8 begrenzt', f.kapitel===8&&f.weiter.level===8);
E('NACHT.kapitel="kaputt"'); f=E('MENUE.fortschritt()');
pruefe('kaputtes Kapitel: wie frisch', f.kapitel===1&&f.weiter===null);
frisch(); E("speichereBestN(4,100)"); f=E('MENUE.fortschritt()');
pruefe('Bestzeit Level 4: Auswahl bis Level 5, aber KEIN WEITER (Rekorde ueberleben die Nacht)', f.erreicht===5&&f.weiter===null);
E('NACHT.kapitel=7'); E('speichereBestN(2,50)'); f=E('MENUE.fortschritt()');
pruefe('Auswahl = Maximum aus Kapitel und Bestzeiten', f.erreicht===7);
pruefe('Seiten: Level 1 mit ?level=1, sonst levelN.html', E('MENUE.seiteVon(1)')==='index.html?level=1'&&E('MENUE.seiteVon(5)')==='level5.html');

console.log('\n--- Eintraege je Zustand ---');
frisch();
pruefe('Haupt frisch: NEUE NACHT, EINSTELLUNGEN, ENDEN, UEBER', ids('haupt')==='neu,einst,enden,ueber');
E('NACHT.kapitel=3');
pruefe('Haupt mit Fortschritt: + WEITER, LEVEL WAEHLEN', ids('haupt')==='neu,weiter,level,einst,enden,ueber');
const w=E("MENUE.eintraege('haupt').find(e=>e.id==='weiter')");
pruefe('WEITER-Aufschrift zeigt Level und Ort', w.txt==='WEITER: LEVEL 3 - DER LETZTE BUS', w.txt);
pruefe('Vorwahl im Hauptmenue ist WEITER', E("MENUE.standardWahl(MENUE.eintraege('haupt'),'haupt')")===1);
frisch();
pruefe('Vorwahl ohne Fortschritt: NEUE NACHT', E("MENUE.standardWahl(MENUE.eintraege('haupt'),'haupt')")===0);
E('NACHT.kapitel=3');
pruefe('Levelauswahl: nur freigeschaltete + ZURUECK', ids('level')==='level1,level2,level3,zurueck');
pruefe('Levelauswahl-Texte', E("MENUE.eintraege('level')[1].txt")==='LEVEL 2 - BEI MORITZ');
pruefe('Rueckfrage: ABBRECHEN zuerst (vorgewaehlt)', ids('neuSicher')==='abbrechen,neuJa'&&E("MENUE.standardWahl(MENUE.eintraege('neuSicher'),'neuSicher')")===0);
pruefe('Einstellungen am Rechner: vier Werte + ZURUECK', ids('einst')==='flacker,wackeln,roehre,schwer,zurueck');
E('IS_TOUCH=true');
pruefe('Einstellungen am Handy: Hinweis auf das Handy-Menue (nicht waehlbar)', ids('einst')==='flacker,wackeln,roehre,schwer,handyInfo,zurueck'
  &&E("MENUE.eintraege('einst').find(e=>e.id==='handyInfo').typ")==='info');
E('IS_TOUCH=false');
pruefe('Einstellungs-Werte spiegeln KOMFORT', (()=>{
  E("KOMFORT.setze('flackerschutz',true); KOMFORT.setze('wackeln',false); KOMFORT.setze('roehre',true); setzeSchwierigkeit('hart');");
  const l=E("MENUE.eintraege('einst')");
  const r=l[0].wert==='AN'&&l[1].wert==='AUS'&&l[2].wert==='AN'&&l[3].wert==='HART';
  E("KOMFORT.setze('flackerschutz',false); KOMFORT.setze('wackeln',true); setzeSchwierigkeit('normal');"); return r; })());

console.log('\n--- Inhaltshinweis ---');
E("KOMFORT.setze('hinweis',false); KOMFORT.setze('flackerschutz',false);");
pruefe('erster Start: Zustand hinweis', E('MENUE.startModus()')==='hinweis');
pruefe('Hinweis: WEITER und FLACKERSCHUTZ AN', ids('hinweis')==='hinweisWeiter,hinweisRuhig');
E("KOMFORT.setze('flackerschutz',true);");
pruefe('Flackerschutz schon an: nur WEITER', ids('hinweis')==='hinweisWeiter');
E("KOMFORT.setze('hinweis',true); KOMFORT.setze('flackerschutz',false);");
pruefe('bestaetigt: Hauptmenue', E('MENUE.startModus()')==='haupt');

console.log('\n--- Navigation ---');
const M=E('MENUE');
const l=[{id:'a'},{id:'i',typ:'info'},{id:'b'},{id:'c'}];
pruefe('runter ueberspringt Info', M.naechste(l,0,1)===2);
pruefe('hoch ueberspringt Info', M.naechste(l,2,-1)===0);
pruefe('Umbruch am Ende und am Anfang', M.naechste(l,3,1)===0&&M.naechste(l,0,-1)===3);
pruefe('leere Liste: keine Ausnahme', M.naechste([],0,1)===0);

console.log('\n--- Fehlertoleranz ---');
pruefe('ohne DOM: keine Menue-Schleife (laufe fehlt), Galerie-Daten gehen weiter', typeof M.laufe==='undefined'&&typeof M.galerieDaten==='function');
pruefe('Texte nur mit erlaubten Zeichen', (()=>{
  const erlaubt=/^[A-Z0-9 .:\-!?\/+,<>*%()'"]*$/;
  const alle=[];
  for(const m of ['haupt','level','einst','hinweis','neuSicher']) for(const e of E("MENUE.eintraege('"+m+"')")) alle.push(e.txt,e.wert||'');
  return alle.every(t=>erlaubt.test(t)); })());

console.log('\n'+ok+' OK, '+fail+' Fehler');
process.exit(fail?1:0);
