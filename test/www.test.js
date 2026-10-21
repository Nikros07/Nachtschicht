/* Prueft tools/www.py (baut den Ordner www/ fuer die App-Huellen) in einem frischen Temp-Ordner:
     kommt die Kopie vollstaendig und ohne Entwickler-Dateien zustande, klappt ein zweiter Lauf,
     und bleibt ein fremder Ordner unangetastet?

   Aufruf:  node test/www.test.js        (aus dem Projektordner oder von ueberall)
   Das echte Projekt und ein echter Ordner www/ werden nie angefasst. Braucht Python;
   fehlt es, schlaegt der erste Fall fehl (ohne Python gibt es nichts zu pruefen). */
'use strict';
const fs=require('fs'), os=require('os'), path=require('path'), cp=require('child_process');

const WURZEL=path.resolve(__dirname,'..');

let ok=0, fail=0;
const pruefe=(name,bed,info)=>{ if(bed){ ok++; console.log('  OK   '+name); } else { fail++; console.log('  FEHL '+name+(info?'   -> '+info:'')); } };
const letzte=out=>(out||'').trim().split('\n').slice(-3).join(' | ');

function python(){
  for(const py of ['python','python3','py']){ const r=cp.spawnSync(py,['--version'],{encoding:'utf8'}); if(r.status===0) return py; }
  return null;
}
function alleDateien(dir,praefix){
  let liste=[];
  for(const n of fs.readdirSync(dir)){
    const voll=path.join(dir,n), rel=praefix?praefix+'/'+n:n;
    if(fs.statSync(voll).isDirectory()) liste=liste.concat(alleDateien(voll,rel));
    else liste.push(rel);
  }
  return liste;
}

console.log('\n--- www.py ---');
const PY=python();
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'nacht-www-'));
try{
  if(!PY){
    pruefe('Python gefunden (tools/www.py braucht es)',false,'python, python3 und py antworten nicht');
  } else {
    const lauf=ziel=>{
      const r=cp.spawnSync(PY,['tools/www.py','--trotzdem','--leise','--ziel',ziel],{cwd:WURZEL,encoding:'utf8'});
      return {code:r.status,out:(r.stdout||'')+(r.stderr||'')};
    };
    const ziel=path.join(tmp,'www');

    const r1=lauf(ziel);
    pruefe('erster Lauf: Exit-Code 0',r1.code===0,'Exit '+r1.code+': '+letzte(r1.out));
    const da=f=>fs.existsSync(path.join(ziel,f));
    for(const f of ['index.html','nacht/kern.js','sw.js','manifest.webmanifest'])
      pruefe('liegt im Ziel: '+f,da(f));
    const dateien=fs.existsSync(ziel)?alleDateien(ziel):[];
    const verboten=dateien.filter(f=>/\.(md|py)$/i.test(f));
    pruefe('keine .md- oder .py-Datei im Ziel',dateien.length>0&&verboten.length===0,verboten.join(' | ')||'Ziel leer');
    for(const o of ['docs','test','tools','routinen'])
      pruefe('kein Ordner '+o+'/ im Ziel',!da(o));
    pruefe('Markierungsdatei .aus-tools-www liegt im Ziel',da('.aus-tools-www'));

    const r2=lauf(ziel);
    pruefe('zweiter Lauf auf dasselbe Ziel: Exit-Code 0',r2.code===0,'Exit '+r2.code+': '+letzte(r2.out));

    const fremd=path.join(tmp,'fremd');
    fs.mkdirSync(fremd);
    fs.writeFileSync(path.join(fremd,'meins.txt'),'nicht anfassen\n');
    const r3=lauf(fremd);
    pruefe('fremder Ordner: Abbruch mit Exit-Code ungleich 0',r3.code!==0,'Exit '+r3.code+': '+letzte(r3.out));
    pruefe('fremder Ordner: meins.txt bleibt erhalten',
      fs.existsSync(path.join(fremd,'meins.txt'))&&fs.readFileSync(path.join(fremd,'meins.txt'),'utf8')==='nicht anfassen\n');
    pruefe('fremder Ordner: keine Markierung hineingeschrieben',!fs.existsSync(path.join(fremd,'.aus-tools-www')));
  }
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}

console.log('\n============================');
console.log(ok+' bestanden, '+fail+' fehlgeschlagen');
process.exit(fail?1:0);
