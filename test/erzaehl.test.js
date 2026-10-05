/* Prueft nacht/erzaehl.js (Kapitelauswahl, Plausch, Momente) und nichtHat. Ohne Browser.
   node test/erzaehl.test.js */
const fs=require('fs'), vm=require('vm');
const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };
const pieps=[]; let blockiert=false;
const ctxStub=new Proxy({},{ get:(t,k)=>k in t?t[k]:(k==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}),
  set:(t,k,v)=>{ t[k]=v; return true; } });
const k={ Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
  localStorage:speicher(), W:320, H:180, IS_TOUCH:false, ctx:ctxStub, muted:false,
  performance:{now:()=>0}, window:{HANDY:{offen:false}},
  piep:(...a)=>pieps.push(a), text(){}, textC(){}, textW:s=>String(s).length*4, umbrich:t=>[t],
  gespraechAktiv:()=>blockiert, setTimeout(){}, };
k.window.MOBIL=null;
vm.createContext(k);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),k);
lade('nacht/stand.js'); lade('nacht/nacht.js');
vm.runInContext('const FX={hz:f=>f,blitz:a=>a,ruhig:()=>false};',k);
lade('nacht/texte.js'); lade('nacht/erzaehl.js');
const E=c=>vm.runInContext(c,k);

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };

console.log('\n--- STIMMEN ---');
pruefe('Farbe Moritz', E("stimmeFarbe('MORITZ')")==='#ffb34d');
pruefe('Farbe getrimmt und gross', E("stimmeFarbe('  max ferdi ')")==='#42d9ff'&&E("stimmeFarbe('lea')")==='#ff9ecb');
pruefe('Unbekannt: Standardfarbe', E("stimmeFarbe('NIEMAND')")==='#42d9ff'&&E("stimmeFarbe(undefined)")==='#42d9ff');
pieps.length=0; E("stimmePiep('MORITZ')");
pruefe('Piep mit Ton 262', pieps.length===1&&pieps[0][0]===262);
pieps.length=0; k.muted=true; E("stimmePiep('MORITZ')"); k.muted=false;
pruefe('muted: still', pieps.length===0);

console.log('\n--- KAPITEL: BISHER-Auswahl ---');
E(`NACHT.flags={}; NACHT.inventar={};
TEXTE_KAPITEL[1]={zeit:'20:00',ort:'A',zeile:'Z'}; TEXTE_KAPITEL[3]={zeit:'22:00',ort:'B',zeile:'Z'};
TEXTE_BISHER.push({ab:2,g:5,txt:'ZWEI'},{ab:3,g:9,txt:'DREI'},{ab:3,g:7,wenn:{flag:'x'},txt:'MIT FLAG'},
  {ab:6,g:99,txt:'ZU SPAET'},{ab:3,g:1,txt:'NIEDRIG'});`);
pruefe('Level 1: nichts', E('kapitelBisher(1).length')===0);
pruefe('Level 3 ohne Flag: DREI, ZWEI', JSON.stringify(E('kapitelBisher(3)'))==='["DREI","ZWEI"]', JSON.stringify(E('kapitelBisher(3)')));
E("setzeFlag('x')");
pruefe('mit Flag: DREI, MIT FLAG (Gewicht, max. zwei)', JSON.stringify(E('kapitelBisher(3)'))==='["DREI","MIT FLAG"]');
pruefe('ab>n wird nie gewaehlt', !E('kapitelBisher(3)').includes('ZU SPAET'));
E('kapitelZeigen(3)');
pruefe('Karte aktiv', E('kapitelAktiv()')===true);
pruefe('Praefix BISHER nur vor Zeile 1', E('KAPITEL.zeilen')[0]==='BISHER: DREI'&&E('KAPITEL.zeilen')[1]==='MIT FLAG');
pruefe('erzaehlTakt meldet true waehrend der Karte', E('erzaehlTakt(0.3)')===true);
pruefe('Tippen vor 0,6 s zaehlt nicht als Ende', E('erzaehlTaste()')===true&&E('KAPITEL.t')<3);
E('erzaehlTakt(0.4)'); E('erzaehlTaste()');
pruefe('Tippen nach 0,6 s beendet (Ausblenden)', E('KAPITEL.t')>=3.25);
E('erzaehlTakt(1)');
pruefe('Karte nach Ablauf aus', E('kapitelAktiv()')===false&&E('erzaehlTakt(0.1)')===false);
E('KAPITEL.zeilen=[]; kapitelZeigen(3)');
pruefe('zweiter Aufruf tut nichts', E('kapitelAktiv()')===false);
pruefe('Kontext ohne Karte: null', E('erzaehlKontext()')===null);

console.log('\n--- PLAUSCH ---');
const lade2=z=>{ E('KAPITEL.aktiv=false; MOMENT_KARTE.aktiv=false; PLAUSCH.lade('+JSON.stringify(z)+')'); };
const tick=(sek,l)=>{ for(let i=0;i<sek*10;i++) E('PLAUSCH.takt(0.1,'+(l!==false)+')'); };
lade2([{id:'a',wer:'MORITZ',text:'ERSTE.',nach:20,prio:1},{id:'b',wer:'JONAS',text:'ZWEITE.',nach:0,prio:5},
  {id:'c',wer:'',text:'*ES KLINGELT*',ausloeser:'tel'},{id:'d',wer:'LEA',text:'NUR MIT FLAG.',wenn:{flag:'gibtsnicht'}}]);
tick(13.5); pruefe('vor 14 s nichts', E('PLAUSCH.jetzt')===null);
tick(1); pruefe('nach 14 s hoechste Prio (JONAS)', E('PLAUSCH.jetzt')&&E('PLAUSCH.jetzt.wer')==='JONAS');
pruefe('Zeile spielt nur einmal', E('PLAUSCH.gespielt.b')===true);
const dauer=E('PLAUSCH.jetzt.dauer'); pruefe('Dauer 2,4+0,07*Laenge', Math.abs(dauer-(2.4+0.07*('JONAS: ZWEITE.'.length)))<1e-9, dauer);
tick(4); pruefe('Zeile verschwindet', E('PLAUSCH.jetzt')===null);
tick(10); pruefe('"nach:20" noch nicht, Ausloeser-Zeile nie ambient', E('PLAUSCH.jetzt')===null);
tick(6); pruefe('nach 20 s: ERSTE', E('PLAUSCH.jetzt')&&E('PLAUSCH.jetzt.wer')==='MORITZ');
tick(60); pruefe('bedingte Zeile (Flag fehlt) und Ausloeser nie von selbst', E('PLAUSCH.gespielt.d')!==true&&E('PLAUSCH.gespielt.c')!==true);
E("PLAUSCH.ausloeser('tel')");
pruefe('Ausloeser spielt sofort, ohne WER', E('PLAUSCH.jetzt&&PLAUSCH.jetzt.text')==='*ES KLINGELT*'&&E('PLAUSCH.jetzt.wer')==='');
E("PLAUSCH.ausloeser('tel')");
pruefe('Ausloeser nur einmal', E('PLAUSCH.warte.length')===0);
lade2([1,2,3,4].map(i=>({id:'q'+i,wer:'X',text:'T'+i,ausloeser:'z'})));
E("PLAUSCH.ausloeser('z')");
pruefe('Warteschlange hoechstens 2 (+1 laufende)', E('PLAUSCH.warte.length')<=2&&E('PLAUSCH.jetzt')!==null);
lade2([{id:'k',wer:'X',text:'KAMPF.'}]); tick(30,false);
pruefe('laeuft=false: Uhr steht, nichts', E('PLAUSCH.t')===0&&E('PLAUSCH.jetzt')===null);
lade2([{id:'g',wer:'X',text:'GESPRAECH.'}]); blockiert=true; tick(30);
pruefe('nie waehrend Gespraech', E('PLAUSCH.jetzt')===null); blockiert=false;
k.window.HANDY.offen=true; tick(20); pruefe('nie bei offenem Handy', E('PLAUSCH.jetzt')===null); k.window.HANDY.offen=false;
E("PLAUSCH.sag('MAMA','SOFORT.')");
pruefe('sag: sofort', E('PLAUSCH.jetzt.text')==='SOFORT.');
pruefe('zeichne laeuft ohne Fehler', (()=>{ try{ E('PLAUSCH.zeichne(); erzaehlZeichne()'); return true; }catch(e){ return false; } })());
E('PLAUSCH.lade(undefined)'); pruefe('lade(undefined) setzt zurueck', E('PLAUSCH.zeilen.length')===0&&E('PLAUSCH.jetzt')===null);

console.log('\n--- MOMENTE ---');
E("NACHT.flags={}; NACHT.momenteBest=[]; TEXTE_MOMENTE[2]={titel:'T',l1:'EINS',l2:'ZWEI'};");
pruefe('anzahl 0', E('MOMENT.anzahl()')===0&&E('MOMENT.hat(2)')===false);
pieps.length=0;
pruefe('fund(2) neu', E('MOMENT.fund(2)')===true);
pruefe('zwei Toene', pieps.length===2&&pieps[0][0]===880&&pieps[1][0]===1175);
pruefe('Flag moment2 und momenteBest', E("flag('moment2')")&&JSON.stringify(E('NACHT.momenteBest'))==='[2]');
pruefe('Momentkarte blockiert das Spiel', E('erzaehlTakt(0.1)')===true&&E('erzaehlKontext().aktion')==='WEITER');
pruefe('Taste vor 0,8 s: Karte bleibt', E('erzaehlTaste()')===true&&E('MOMENT_KARTE.t')<2);
E('erzaehlTakt(1)'); E('erzaehlTaste()');
pruefe('Taste nach 0,8 s: Ausblenden', E('MOMENT_KARTE.t')>=2.75);
E('erzaehlTakt(1)'); pruefe('Karte nach 3 s aus', E('MOMENT_KARTE.aktiv')===false);
pruefe('zweites fund(2) false, nichts doppelt', E('MOMENT.fund(2)')===false&&E('NACHT.momenteBest.length')===1);
E('MOMENT.fund(5)'); pruefe('fund ohne Text: zaehlt trotzdem, keine Karte', E('MOMENT.anzahl()')===2&&E('MOMENT_KARTE.aktiv')===false);
pruefe('zeichneFund ohne Fehler', (()=>{ try{ E('MOMENT.zeichneFund(10,10,3); MOMENT.zeichneFund(10,10,2)'); return true; }catch(e){ return false; } })());
E('nachtZuruecksetzen()');
pruefe('Neuanfang: Flags weg, momenteBest bleibt', E('MOMENT.anzahl()')===0&&JSON.stringify(E('NACHT.momenteBest'))==='[2,5]');
E('NACHT.knotenBest={A:2}; nachtZuruecksetzen()');
pruefe('Neuanfang bewahrt knotenBest', E('NACHT.knotenBest.A')===2);
pruefe('ladeStand fuellt auf', (()=>{ k.localStorage.setItem('nachtschicht.stand','{"kapitel":2}');
  const s=E('ladeStand()'); return Array.isArray(s.momenteBest)&&typeof s.knotenBest==='object'; })());

console.log('\n--- nichtHat / zeichneKarte ---');
E("NACHT.inventar={}");
pruefe('nichtHat ohne Ding: wahr', E("bedingungErfuellt({nichtHat:'SCHLUESSEL'})")===true);
E("nimmDing('SCHLUESSEL')");
pruefe('nichtHat mit Ding: falsch', E("bedingungErfuellt({nichtHat:'SCHLUESSEL'})")===false);
pruefe('hat/nichtHat kombinierbar', E("bedingungErfuellt({hat:'SCHLUESSEL',nichtHat:'X'})")===true);
pruefe('zeichneKarte: | bricht, Hoehe 8 je Zeile', E("zeichneKarte('A|B|C',10,'#fff')")===24&&E("zeichneKarte('A|B',10,'#fff',2)")===28);

console.log('\n'+ok+' ok, '+fail+' fehl');
process.exit(fail?1:0);
