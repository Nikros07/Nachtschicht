/* Prueft alle Level gegen die Engine: Syntax und doppelte Deklarationen.
   Laeuft ohne Browser.   node tools/pruefe.js  */
const fs=require('fs');
/* Welche Engine-Teile die Seite laedt - in IHRER Reihenfolge, direkt aus
   den Script-Tags. Frueher stand die Liste hier fest, und eine neu
   eingehaengte Datei wurde stillschweigend nie geprueft. */
const module_fuer=h=>[...h.matchAll(/<script src="nacht\/([a-z]+)\.js/g)].map(m=>m[1]);
/* Die eine gueltige Ladereihenfolge (ARCHITEKTUR.md verweist hierher). Jede Seite darf Dateien
   weglassen, aber keine vertauschen: eine Datei darf nur benutzen, was vor ihr geladen ist.
   Abweichung = Fehler; bewusste Ausnahmen stehen in AUSNAHMEN mit Grund. */
const REIHENFOLGE=['kern','geraet','bild','hud','ton','komfort','musik','songs','saft','stand','welt',
  'nacht','dialog','kampf','eingabe','lehre','mobil','handy','texte','erzaehl','hilfe','erfolge',
  'epilog','wertung','menue','pause'];
const AUSNAHMEN={
  /* Bonus-Level: laedt menue vor hilfe. Seit Langem so und gruen; menue.js greift nur zur Laufzeit
     auf HILFE zu (typeof-Pruefung). Vor einer Aenderung im Browser pruefen. */
  'runner.html':['menue>hilfe','menue>erfolge'],
  /* Level 4 und 8 laden kampf direkt nach welt. Harmlos: kampf.js benutzt weder nacht.js noch dialog.js
     (grep, 03.11.2026). Vereinheitlichen nur zusammen mit einem Browser-Durchlauf. */
  'level4.html':['kampf>nacht','kampf>dialog'],
  'level8.html':['kampf>nacht','kampf>dialog'],
};
function reihenfolgeFehler(f,mods){
  const aus=[];
  for(let i=0;i<mods.length;i++) for(let j=i+1;j<mods.length;j++){
    const a=REIHENFOLGE.indexOf(mods[i]), b=REIHENFOLGE.indexOf(mods[j]);
    if(a<0){ if(j===i+1) aus.push(mods[i]+' fehlt in REIHENFOLGE'); continue; }
    if(b>=0&&a>b&&!(AUSNAHMEN[f]||[]).includes(mods[i]+'>'+mods[j])) aus.push(mods[i]+' vor '+mods[j]);
  }
  return [...new Set(aus)];
}
let fehler=0;
for(const f of ['index.html','level2.html','level3.html','level4.html',
                'level5.html','level6.html','level7.html','level8.html','karte.html','runner.html']){
  const h=fs.readFileSync(f,'utf8');
  const m=h.match(/<script>([\s\S]*?)<\/script>/);
  if(!m){ console.log(f.padEnd(13)+'KEIN Level-Script'); fehler++; continue; }
  const rf=reihenfolgeFehler(f,module_fuer(h));
  if(rf.length){ console.log(f.padEnd(13)+'FEHLER Reihenfolge: '+rf.join(', ')); fehler++; }
  const eng=module_fuer(h).map(n=>fs.readFileSync('nacht/'+n+'.js','utf8')).join('\n');
  try{ new Function(eng+'\n'+m[1]); console.log(f.padEnd(13)+'OK   ('+module_fuer(h).join(' ')+')'); }
  catch(e){ console.log(f.padEnd(13)+'FEHLER: '+e.message); fehler++; }
}
process.exit(fehler?1:0);
