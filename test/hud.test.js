/* Prueft die gemeinsamen Hilfen in nacht/hud.js (meldung, zeigeHinweis, pauseTasteSpiel) ohne Browser.
   Aus dem Projektordner starten:  node test/hud.test.js */
const fs=require('fs'), vm=require('vm');
let ok=0, fail=0;
const pruefe=(n,b)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n); } };
const quelle=fs.readFileSync('nacht/hud.js','utf8');
function welt(mitS){
  const kx={console,Math}; if(mitS) kx.S={modus:'spiel'};
  vm.createContext(kx); vm.runInContext(quelle+'\n;this.f={meldung,zeigeHinweis,pauseTasteSpiel};',kx);
  return kx;
}
let w=welt(true);
w.f.meldung('HALLO'); pruefe('meldung: Text und Standarddauer 1.5', w.S.meldung==='HALLO'&&w.S.meldungT===1.5);
w.f.meldung('X',3); pruefe('meldung: eigene Dauer', w.S.meldungT===3);
w.f.zeigeHinweis('TIPP'); pruefe('zeigeHinweis: Text und Standarddauer 2', w.S.hinweis==='TIPP'&&w.S.hinweisT===2);
w.f.zeigeHinweis('T',4.5); pruefe('zeigeHinweis: eigene Dauer', w.S.hinweisT===4.5);
w.f.pauseTasteSpiel(); pruefe('pause: spiel -> pause', w.S.modus==='pause');
w.f.pauseTasteSpiel(); pruefe('pause: pause -> spiel', w.S.modus==='spiel');
w.S.modus='kampf'; w.f.pauseTasteSpiel(); pruefe('pause: fremder Modus bleibt', w.S.modus==='kampf');
w=welt(false);
pruefe('ohne S: meldung wirft nicht', (()=>{ try{ w.f.meldung('a'); w.f.zeigeHinweis('b'); w.f.pauseTasteSpiel(); return true; }catch(e){ return false; } })());
console.log(fail?'\n'+fail+' FEHLER':'\nalle '+ok+' gruen'); process.exit(fail?1:0);
