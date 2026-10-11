/* Messung B - Musik aus dem Code lesen.
   node docs/gameplay/messung/b-musik.js
   Liest je Seite die Funktion musik(): Notenfolge (16er-Array), Tempo (60/BPM/4),
   Zahl der Stimmen (ton()/rauschen-Aufrufe), verschiedene Tonhoehen und die
   Laenge einer Schleife in Sekunden. Spielt nichts ab. */
'use strict';
const fs=require('fs'), path=require('path');
const WURZEL=path.resolve(__dirname,'..','..','..');
const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html'];
const zeilen=[];
for(const s of SEITEN){
  const h=fs.readFileSync(path.join(WURZEL,s),'utf8');
  const i=h.indexOf('function musik('); if(i<0){ zeilen.push([s,'keine musik()']); continue; }
  /* Funktionskoerper per Klammerzaehlung */
  let j=h.indexOf('{',i), tiefe=0, k=j;
  for(;k<h.length;k++){ if(h[k]==='{') tiefe++; else if(h[k]==='}'){ tiefe--; if(tiefe===0) break; } }
  const koerper=h.slice(j,k+1);
  const bpm=[...koerper.matchAll(/60\/(\d+)\/4/g)].map(m=>+m[1]);
  /* Arrays, die im Koerper benutzt werden */
  const namen=[...new Set([...koerper.matchAll(/\b([A-Z][A-Z_0-9]{2,})\s*\[/g)].map(m=>m[1]))].filter(n=>!/^(TUNE|S|MUS)$/.test(n));
  const folgen={};
  for(const n of namen){ const m=h.match(new RegExp('const '+n+'\\s*=\\s*\\[([^\\]]*)\\]')); if(m) folgen[n]=m[1].split(',').map(x=>+x.trim()).filter(x=>!isNaN(x)); }
  const stimmen=(koerper.match(/\bton\(/g)||[]).length+(koerper.match(/rauschen\w*\(/g)||[]).length;
  const laengen=Object.values(folgen).map(a=>a.length);
  const schritte=laengen.length?Math.max(...laengen):0;
  const tonhoehen=new Set(Object.values(folgen).flat().filter(x=>x>0)).size;
  const sek=bpm.length?(60/bpm[0]/4)*schritte:null;
  zeilen.push([s, bpm.join('/')||'?', Object.entries(folgen).map(([n,a])=>n+'['+a.length+']').join(' ')||'-', stimmen, tonhoehen, sek?sek.toFixed(2)+' s':'?']);
}
console.log('Seite         BPM     Folgen                      Stimmen  Tonhoehen  Schleife');
for(const z of zeilen) console.log(z.map((x,i)=>String(x).padEnd([14,8,28,9,11,10][i]||10)).join(''));
