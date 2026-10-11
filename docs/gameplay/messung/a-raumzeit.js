/* Messung A - Level 1: welcher Anteil der Spielphase liegt in Raeumen?
   In S.modus 'raum' laeuft lehrerLogik() nicht (update() kehrt vorher zurueck),
   die Lehrer stehen also still - Raumzeit ist gefahrlose Zeit.
   node docs/gameplay/messung/a-raumzeit.js
   Nutzt den Bot aus a-level1.js (--lauf N, Profil vorsichtig) und wertet dessen Protokoll aus. */
const {execFileSync}=require('child_process');
const zeilen=[];
for(let saat=0;saat<16;saat++){
  const out=execFileSync(process.execPath,['docs/gameplay/messung/a-level1.js','--lauf',String(saat)],{encoding:'utf8'});
  let st=null,en=null,rein=null,raum=0,variante=/"variante": "hausmeister"/.test(out)?'hausmeister':'raum';
  for(const l of out.split('\n')){
    const m=l.match(/^\s*([\d.]+)\s+modus\s+modus\s+(\S+) > (\S+)/); if(!m) continue;
    const t=+m[1];
    if(m[2]==='intro'&&m[3]==='spiel') st=t;
    if(m[3]==='raum') rein=t;
    if(m[2]==='raum'&&rein!=null){ raum+=t-rein; rein=null; }
    if((m[3]==='cutscene'||m[3]==='ende')&&en==null) en=t;
  }
  if(st==null||en==null) continue;
  zeilen.push({saat,variante,raum:+raum.toFixed(1),spiel:+(en-st).toFixed(1),anteil:Math.round(100*raum/(en-st))});
}
for(const z of zeilen) console.log('saat '+String(z.saat).padStart(2)+'  '+z.variante.padEnd(12)+'Raumzeit '+String(z.raum).padStart(5)+' s von '+String(z.spiel).padStart(5)+' s  = '+z.anteil+' %');
const r=zeilen.filter(z=>z.variante==='raum').map(z=>z.anteil).sort((a,b)=>a-b);
if(r.length) console.log('\nRaum-Spielart: Anteil Raumzeit min/median/max = '+r[0]+' / '+r[r.length>>1]+' / '+r[r.length-1]+' %  ('+r.length+' Laeufe)');
