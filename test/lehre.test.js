/* Prueft die Taste L auf dem Titelbild: die Lektion kommt wieder. Ohne Browser.
   Aus dem Projektordner starten:  node test/lehre.test.js */
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
let ok=0,fail=0;
const pruefe=(name,bed)=>{ if(bed){ok++;console.log('  OK   '+name);} else {fail++;console.log('  FEHL '+name);} };

const seite='level4.html';
const L=N.lade(seite,'');
const ev=c=>L.api.ev(c);
const key='nachtschicht.lektion.'+seite;

pruefe('Level hat eine Lektion', !!ev('LEHRE.L'));
/* Lektion gilt als gesehen */
ev('localStorage.setItem("'+key+'","1")');
ev('S.modus="intro"');
pruefe('gesehen: Lektion startet nicht', ev('LEHRE.pruefe()')===false);

/* L ausserhalb des Titels: nichts */
ev('S.modus="kampf"'); L.taste('KeyL',true); L.taste('KeyL',false);
ev('S.modus="intro"');
pruefe('L ausserhalb des Titels tut nichts', ev('LEHRE.pruefe()')===false);

/* L im Titel: Lektion kommt beim Start */
ev('LEHRE.fertig=false');
ev('S.modus="titel"'); L.taste('KeyL',true); L.taste('KeyL',false);
pruefe('L im Titel: Lektion noch nicht aktiv', ev('LEHRE.aktiv')===false);
ev('S.modus="intro"');
pruefe('L im Titel: Lektion kommt wieder', ev('LEHRE.pruefe()')===true && ev('LEHRE.aktiv')===true);

/* Nach dem Beenden bleibt sie gesehen (kein Dauerzwang) */
ev('LEHRE.beenden()');
ev('LEHRE.fertig=false; S.modus="intro"');
pruefe('danach wieder gesehen', ev('LEHRE.pruefe()')===false);

console.log('\n'+ok+' ok, '+fail+' Fehler'); process.exit(fail?1:0);
