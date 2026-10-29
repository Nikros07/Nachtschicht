/* Prueft nacht/dialog.js: Standardantwort (vorgewaehlt, Zeitablauf) in der VOLLEN Antwortliste,
   und Proben-Antworten (probe:{ruf:N} / probe:{mut:N}).
   Ohne Browser. Aus dem Projektordner starten:  node test/dialog.test.js */
const fs=require('fs'), vm=require('vm');

const ktx={Math,console,Object,JSON,String,Array};
let gerufen=[];
const WERT={ruf:0,mut:0};          // Stand der Werte fuer die Proben-Pruefung
let piepe=[], erfolge=[];
Object.assign(ktx,{
  wirke:()=>{},
  bedingungErfuellt:w=>{
    if(!w) return true;
    if('ruf' in w) return WERT.ruf>=w.ruf;
    if('mut' in w) return WERT.mut>=w.mut;
    return w.ok!==false;
  },
  textW:s=>String(s).length*4,
  IS_TOUCH:false,
  window:{},
  piep:(...a)=>{ piepe.push(a); },
  ERFOLG:{ gib:n=>{ erfolge.push(n); } },
});
vm.createContext(ktx);
vm.runInContext(fs.readFileSync('nacht/dialog.js','utf8'),ktx);
const c=ktx;
const GESPR=()=>vm.runInContext('GESPR',ktx);

let ok=0,fail=0;
const pruefe=(name,bed,info)=>{ if(bed){ok++;console.log('  OK   '+name);} else {fail++;console.log('  FEHL '+name+(info?'   -> '+info:''));} };

const baum=(standard,extraWahl)=>({
  start:{wer:'A',text:'x',
    wahl:[
      {txt:'a',wenn:{ok:false},geh:'@a'},
      {txt:'b',wenn:{ok:false},geh:'@b'},
      {txt:'c',geh:'@c'},
      {txt:'d',geh:'@d'},
    ],zeit:2,standard:standard},
  '@a':null,'@b':null,'@c':null,'@d':null,
});

console.log('\n--- Standardantwort ---');
{
  const b=baum(2);
  // Erste Pruefung: nach dem Start sind nur 2 Antworten sichtbar, vorgewaehlt ist 'c' (Index 0 der sichtbaren Liste)
  c.starteGespraech(b,'start',n=>gerufen.push(n));
  pruefe('nur sichtbare Antworten gezaehlt', GESPR().wahlen.length===2, String(GESPR().wahlen.length));
  pruefe('standard 2 -> vorgewaehlt ist c', GESPR().gewaehlt===0, String(GESPR().gewaehlt));
  c.gespraechWaehle(0);
  pruefe('Auswahl bleibt bei der sichtbaren Liste', GESPR().gewaehlt>=0&&GESPR().gewaehlt<2);
}
{
  gerufen=[];
  const b=baum(3);
  c.starteGespraech(b,'start',n=>gerufen.push(n));
  pruefe('standard 3 -> vorgewaehlt ist d', GESPR().gewaehlt===1, String(GESPR().gewaehlt));
  c.gespraechTakt(3);
  pruefe('Zeitablauf geht nach @d', gerufen[0]==='@d', JSON.stringify(gerufen));
}
{
  gerufen=[];
  const b=baum(0);
  c.starteGespraech(b,'start',n=>gerufen.push(n));
  pruefe('standard zeigt auf unsichtbare Antwort -> erste sichtbare vorgewaehlt', GESPR().gewaehlt===0, String(GESPR().gewaehlt));
  c.gespraechTakt(3);
  pruefe('Zeitablauf nimmt c', gerufen[0]==='@c', JSON.stringify(gerufen));
}
{
  gerufen=[];
  const b=baum(undefined);
  c.starteGespraech(b,'start',n=>gerufen.push(n));
  pruefe('ohne standard -> vorgewaehlt 0', GESPR().gewaehlt===0, String(GESPR().gewaehlt));
}

/* Baum mit Proben: [0] Probe ruf 60 -> @ja, [1] frei -> @nein, [2] Probe mut 40 -> @mut */
const probenBaum=(standard)=>({
  start:{wer:'A',text:'x',
    wahl:[
      {txt:'Kenn mich doch.', probe:{ruf:60}, geh:'@ja'},
      {txt:'Egal.', geh:'@nein'},
      {txt:'Ich bleib.', probe:{mut:40}, geh:'@mut'},
    ], zeit:2, standard:standard},
  '@ja':null,'@nein':null,'@mut':null,
});
const ruecksetzen=()=>{ gerufen=[]; piepe=[]; erfolge=[]; };

console.log('\n--- Proben-Antworten ---');
{
  ruecksetzen(); WERT.ruf=50; WERT.mut=0;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  pruefe('Probe ruf:60 bei Ruf 50 gesperrt', GESPR().gesperrt[0]===true, JSON.stringify(GESPR().gesperrt));
  pruefe('Probe ist trotzdem sichtbar (3 Antworten)', GESPR().wahlen.length===3, String(GESPR().wahlen.length));
  pruefe('Text gesperrt: [RUF 60] ...', c.gespraechWahlText(0)==='[RUF 60] Kenn mich doch.', c.gespraechWahlText(0));
  pruefe('freie Antwort ohne Probe: Text unveraendert', c.gespraechWahlText(1)==='Egal.', c.gespraechWahlText(1));
  pruefe('Mut-Probe bei Mut 0 gesperrt', GESPR().gesperrt[2]===true);
  pruefe('Mut-Text gesperrt: [MUT 40] ...', c.gespraechWahlText(2)==='[MUT 40] Ich bleib.', c.gespraechWahlText(2));
}
{
  ruecksetzen(); WERT.ruf=70; WERT.mut=0;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  pruefe('Probe ruf:60 bei Ruf 70 frei', GESPR().gesperrt[0]===false, JSON.stringify(GESPR().gesperrt));
  pruefe('Text frei: [RUF] ...', c.gespraechWahlText(0)==='[RUF] Kenn mich doch.', c.gespraechWahlText(0));
}
{
  ruecksetzen(); WERT.ruf=50; WERT.mut=0;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  c.gespraechWaehle(-1);
  pruefe('gespraechWaehle rueckwaerts ueberspringt gesperrte Proben 0 und 2', GESPR().gewaehlt===1, String(GESPR().gewaehlt));
  c.gespraechWaehle(1);
  pruefe('gespraechWaehle vorwaerts ueberspringt gesperrte Proben 2 und 0', GESPR().gewaehlt===1, String(GESPR().gewaehlt));
}
{
  ruecksetzen(); WERT.ruf=50; WERT.mut=0;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  vm.runInContext('GESPR.gewaehlt=0',ktx);
  c.gespraechBestaetigen();
  pruefe('Bestaetigen auf gesperrter Antwort: Knoten bleibt', GESPR().name==='start', String(GESPR().name));
  pruefe('Bestaetigen auf gesperrter Antwort: kein Weiterlaufen', gerufen.length===0, JSON.stringify(gerufen));
  pruefe('Bestaetigen auf gesperrter Antwort: piep gerufen', piepe.length===1, String(piepe.length));
  pruefe('Bestaetigen auf gesperrter Antwort: kein Erfolg', erfolge.length===0, JSON.stringify(erfolge));
}
{
  ruecksetzen(); WERT.ruf=70; WERT.mut=0;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  vm.runInContext('GESPR.gewaehlt=0',ktx);
  c.gespraechBestaetigen();
  pruefe('bestandene Probe: geht zu @ja', gerufen[0]==='@ja', JSON.stringify(gerufen));
  pruefe('bestandene Probe ruf: Erfolg probe_ruf', erfolge[0]==='probe_ruf', JSON.stringify(erfolge));
}
{
  ruecksetzen(); WERT.ruf=0; WERT.mut=50;
  c.starteGespraech(probenBaum(1),'start',n=>gerufen.push(n));
  vm.runInContext('GESPR.gewaehlt=2',ktx);
  c.gespraechBestaetigen();
  pruefe('bestandene Mut-Probe: geht zu @mut', gerufen[0]==='@mut', JSON.stringify(gerufen));
  pruefe('bestandene Mut-Probe: Erfolg probe_mut', erfolge[0]==='probe_mut', JSON.stringify(erfolge));
}
{
  ruecksetzen(); WERT.ruf=70; WERT.mut=0;
  c.starteGespraech(probenBaum(0),'start',n=>gerufen.push(n));
  pruefe('Standardantwort Probe frei -> bleibt vorgewaehlt', GESPR().gewaehlt===0, String(GESPR().gewaehlt));
}
{
  ruecksetzen(); WERT.ruf=50; WERT.mut=0;
  c.starteGespraech(probenBaum(0),'start',n=>gerufen.push(n));
  pruefe('Standardantwort ist nie gesperrt: Standard springt auf freie Antwort', GESPR().gesperrt[GESPR().standardIdx]===false, String(GESPR().standardIdx));
  pruefe('Standard-Index zeigt auf Egal (1)', GESPR().standardIdx===1 && GESPR().gewaehlt===1, String(GESPR().standardIdx));
  c.gespraechTakt(3);
  pruefe('Zeitablauf nimmt die freie Standardantwort', gerufen[0]==='@nein', JSON.stringify(gerufen));
}
{
  ruecksetzen(); WERT.ruf=0; WERT.mut=0;
  const b={start:{wer:'A',text:'x',wahl:[
    {txt:'Probe eins.', probe:{ruf:60}, geh:'@ja'},
    {txt:'Probe zwei.', probe:{mut:40}, geh:'@mut'},
  ]},'@ja':null,'@mut':null};
  c.starteGespraech(b,'start',n=>gerufen.push(n));
  pruefe('alle gesperrt -> alle frei', GESPR().gesperrt.every(x=>x===false), JSON.stringify(GESPR().gesperrt));
  vm.runInContext('GESPR.gewaehlt=0',ktx);
  c.gespraechBestaetigen();
  pruefe('alle frei, aber Probe nicht bestanden: kein Erfolg', erfolge.length===0, JSON.stringify(erfolge));
  pruefe('alle frei: Antwort ist waehlbar und fuehrt weiter', gerufen[0]==='@ja', JSON.stringify(gerufen));
}

console.log('\n============================');
console.log(ok+' bestanden, '+fail+' fehlgeschlagen');
process.exit(fail?1:0);
