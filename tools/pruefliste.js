/* Die ganze Pruefliste aus CLAUDE.md mit einem Befehl.
   node tools/pruefliste.js            alles (parallel, so viele wie Kerne)
   node tools/pruefliste.js --kurz     nachttest mit --kurz
   node tools/pruefliste.js --ohne-stempel   version.py --pruefen, sw.test und launchcheck weglassen
                                       (fuer Arbeit in einem Worktree, der noch nicht gestempelt ist)

   Warum: 22 Einzelbefehle von Hand vergisst man leicht (zwei Tests fehlten lange in der Liste).
   Die Liste PRUEFUNGEN ist die eine Quelle; CLAUDE.md verweist hierher.
   Ausgabe: je Pruefung eine Zeile (ok/FEHLER + letzte Zeile), bei Fehlern die letzten 15 Zeilen.
   Exit 1, wenn irgendetwas rot ist. Vorher immer erst python tools/version.py. */
'use strict';
const {spawn}=require('child_process'), os=require('os'), path=require('path'), fs=require('fs');
const argv=process.argv.slice(2);
const KURZ=argv.includes('--kurz'), OHNE_STEMPEL=argv.includes('--ohne-stempel');
const WURZEL=path.resolve(__dirname,'..');
const PY=process.platform==='win32'?'python':'python3';

/* [Name, Befehl, Argumente, braucht frische Stempel?] */
const PRUEFUNGEN=[
  ['pruefe',     'node',['tools/pruefe.js']],
  ['nachttest',  'node',['tools/nachttest.js'].concat(KURZ?['--kurz']:[])],
  ['flagcheck',  'node',['tools/flagcheck.js']],
  ...fs.readdirSync(path.join(WURZEL,'test')).filter(f=>f.endsWith('.test.js')).sort()
     .map(f=>[f.replace('.test.js',''),'node',['test/'+f],f==='sw.test.js']),
  ['version',    PY,['tools/version.py','--pruefen'],true],
  ['launchcheck','node',['tools/launchcheck.js'],true],
].filter(p=>!(OHNE_STEMPEL&&p[3]));

const plaetze=Math.max(1,(os.cpus()||[]).length||1);
const t0=Date.now(), erg=[];
let naechste=0, laufend=0;
function starte(){
  while(laufend<plaetze&&naechste<PRUEFUNGEN.length){
    const i=naechste++, [name,cmd,args]=PRUEFUNGEN[i], ts=Date.now(); laufend++;
    let out='';
    const k=spawn(cmd,args,{cwd:WURZEL});
    k.stdout.on('data',d=>out+=d); k.stderr.on('data',d=>out+=d);
    k.on('error',e=>{ out+=String(e); });
    k.on('close',code=>{ laufend--; erg[i]={name,code,out,sek:(Date.now()-ts)/1000};
      if(erg.filter(Boolean).length===PRUEFUNGEN.length) schluss(); else starte(); });
  }
}
function schluss(){
  let rot=0;
  erg.forEach(e=>{
    const zeilen=e.out.trim().split('\n'), letzte=(zeilen[zeilen.length-1]||'').trim().slice(0,90);
    if(e.code===0) console.log('ok      '+e.name.padEnd(12)+(e.sek.toFixed(1)+' s').padStart(7)+'  '+letzte);
    else { rot++; console.log('FEHLER  '+e.name.padEnd(12)+(e.sek.toFixed(1)+' s').padStart(7)+'  (Exit '+e.code+')');
      zeilen.slice(-15).forEach(z=>console.log('        | '+z)); }
  });
  console.log('\n'+(rot?rot+' von '+erg.length+' Pruefungen rot':'alle '+erg.length+' Pruefungen gruen')
    +'  ('+((Date.now()-t0)/1000).toFixed(1)+' s'+(OHNE_STEMPEL?', ohne Stempelpruefungen':'')+')');
  process.exit(rot?1:0);
}
starte();
