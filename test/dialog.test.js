/* Prueft nacht/dialog.js: Standardantwort (vorgewaehlt, Zeitablauf) in der VOLLEN Antwortliste.
   Ohne Browser. Aus dem Projektordner starten:  node test/dialog.test.js */
const fs=require('fs'), vm=require('vm');

const ktx={Math,console,Object,JSON,String,Array};
let gerufen=[];
Object.assign(ktx,{
  wirke:()=>{},
  bedingungErfuellt:w=>!w||w.ok!==false,
  textW:s=>String(s).length*4,
  IS_TOUCH:false,
  window:{},
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

console.log('\n============================');
console.log(ok+' bestanden, '+fail+' fehlgeschlagen');
process.exit(fail?1:0);
