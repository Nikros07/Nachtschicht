/* Prueft alle Level gegen die Engine: Syntax und doppelte Deklarationen.
   Laeuft ohne Browser.   node tools/pruefe.js  */
const fs=require('fs');
const module_fuer=h=>['kern','bild','ton','stand']
  .concat(h.includes('nacht/welt.js')?['welt']:[])
  .concat(h.includes('nacht/kampf.js')?['kampf']:[])
  .concat(h.includes('nacht/nacht.js')?['nacht']:[])
  .concat(h.includes('nacht/dialog.js')?['dialog']:[])
  .concat(h.includes('nacht/mobil.js')?['mobil']:[]);
let fehler=0;
for(const f of ['index.html','level2.html','level3.html','level4.html',
                'level5.html','level6.html','level7.html','level8.html']){
  const h=fs.readFileSync(f,'utf8');
  const m=h.match(/<script>([\s\S]*?)<\/script>/);
  if(!m){ console.log(f.padEnd(13)+'KEIN Level-Script'); fehler++; continue; }
  const eng=module_fuer(h).map(n=>fs.readFileSync('nacht/'+n+'.js','utf8')).join('\n');
  try{ new Function(eng+'\n'+m[1]); console.log(f.padEnd(13)+'OK   ('+module_fuer(h).join(' ')+')'); }
  catch(e){ console.log(f.padEnd(13)+'FEHLER: '+e.message); fehler++; }
}
process.exit(fehler?1:0);
