/* Winziges Pruefwerkzeug. Kein Framework, keine Installation - das Spiel
   hat auch keine, und dabei soll es bleiben. */
let offen=null, fehler=0, gesamt=0;

function gruppe(name){ offen=name; console.log('\n'+name); }
function pruefe(txt,ok,zusatz){
  gesamt++;
  if(!ok) fehler++;
  console.log('  '+(ok?'ok  ':'FEHL')+'  '+txt+(zusatz?'   ('+zusatz+')':''));
}
function bilanz(){
  console.log('\n'+(fehler?fehler+' von '+gesamt+' Pruefungen fehlgeschlagen'
                          :'alle '+gesamt+' Pruefungen gruen'));
  return fehler;
}
module.exports={ gruppe, pruefe, bilanz };
