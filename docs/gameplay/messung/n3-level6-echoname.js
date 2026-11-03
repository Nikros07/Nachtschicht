/* Messung n3 - Level 6: echoName(e) liest e.name (Fallback sie/marvin dynamisch). Vorher/nachher-Namen.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level6-echoname.js */
const path=require('path'); process.chdir(path.join(__dirname,'..','..','..'));
const N=require(path.join(process.cwd(),'tools','nachttest.js'));
const L=N.lade('level6.html','?lektion=0');
L.api.ev('starte()'); L.api.ev('KAPITEL.aktiv=false'); L.api.ev('starteLevel()');
console.log(L.api.ev('JSON.stringify(NACHTECHOS.map(echoName))'));
