/* Inventur fuer docs/gameplay/recherche-vorbilder.md
   Start aus der Projektwurzel:  node docs/gameplay/messung/vorbilder-inventur.js
   Misst je Level: welche Verben die Lektion lehrt (Pflicht/optional), wie viele
   Notenreihen die Musik hat und in welchem Tempo, wie viele Spielzustaende
   (S.modus) der Quelltext kennt, ob es Bestzeit/Rang gibt.
   Liest LEKTIONEN ueber tools/nachttest.js aus der geladenen Seite, den Rest
   statisch aus dem Quelltext. Aendert nichts. */
const fs=require('fs'), path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html'];

let lek=null;
try{ const L=N.lade('index.html','?lektion=0'); lek=L.api.ev('LEKTIONEN'); }catch(e){ console.log('LEKTIONEN nicht ladbar:',e.message); }

const zeilen=[];
for(const s of SEITEN){
  const q=fs.readFileSync(s,'utf8');
  const l=lek&&lek[s];
  const schritte=l?(l.schritte||l.tasten||[]):[];
  const wort=x=>x.was.split(/[ ,]/)[0];
  const pflicht=schritte.filter(x=>!x.opt).map(wort);
  const optional=schritte.filter(x=>x.opt).map(wort);
  // Musik: Notenreihen direkt vor function musik(), Tempo aus 60/<bpm>
  const iM=q.indexOf('function musik');
  const um=iM>0?q.slice(Math.max(0,iM-900),iM+900):'';
  const reihen=(um.match(/const [A-Z_]+=\[[0-9., ]+\]/g)||[]).map(r=>r.split('=')[0].replace('const ','')+'('+r.split(',').length+')');
  let bpm=(um.match(/60\/\(?([0-9]+)/g)||[]).map(x=>x.replace(/60\/\(?/,''));
  const bpmVar=um.match(/bpm *= *[a-z]+\?([0-9]+):([0-9]+)/);   // Level 1: jagd?126:74
  if(bpmVar) bpm=[bpmVar[2],bpmVar[1]];
  const modi=new Set((q.match(/modus *=== *'([a-z_]+)'/g)||[]).map(x=>x.split("'")[1]));
  const melodie=/MELODIE|AKKORD|LEAD/.test(um);
  zeilen.push({s,pflicht,optional,reihen,bpm,modi:[...modi].length,
    bestzeit:/BEST_KEY|bestzeit/.test(q), rang:/RANG|rang\(/.test(q), melodie});
}
for(const z of zeilen){
  console.log(z.s.padEnd(12),
    'Verben Pflicht:',(z.pflicht.join('/')||'-').padEnd(34),
    'optional:',(z.optional.join('/')||'-').padEnd(30),
    'Musik:',z.reihen.join(' ')||'-','@',z.bpm.join('/')||'?','bpm',
    'Melodie:',z.melodie?'ja':'nein',
    '| Modi:',z.modi,'| Bestzeit:',z.bestzeit?'ja':'nein','| Rang:',z.rang?'ja':'nein');
}
