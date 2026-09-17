const fs=require('fs'),vm=require('vm');
const ktx={Math,console,Object,JSON};
vm.createContext(ktx);
vm.runInContext(fs.readFileSync('nacht/welt.js','utf8')+'\n'+fs.readFileSync('nacht/kampf.js','utf8'),ktx);
vm.runInContext('globalThis.KAMPF=KAMPF; globalThis.TIEFE=TIEFE; globalThis.kaempfer=kaempfer; globalThis.verbrauche=verbrauche;',ktx);
const c=ktx;

let ok=0,fail=0;
const pruefe=(name,bed,info)=>{ if(bed){ok++;console.log('  OK   '+name);} else {fail++;console.log('  FEHL '+name+(info?'   -> '+info:''));} };
const takt=(k,n,dt)=>{ for(let i=0;i<n;i++) c.kaempferTakt(k,dt||1/60); };
const bisSchlag=(k)=>{ c.schlage(k); for(let i=0;i<200&&k.zustand!=='schlag';i++) c.kaempferTakt(k,1/60); };

console.log('\n--- Konterfenster (letzte 34% des Ausholens) ---');
{
  const g=c.gegner('schlaeger',20,0.5);        // ausholen 0.52s
  c.schlage(g);
  takt(g,10);                                   // ~0.167s = 32% -> zu frueh
  pruefe('frueh im Ausholen ist KEIN Konter', !c.imKonterfenster(g), 'zT='+g.zT.toFixed(3));
  takt(g,18);                                   // ~0.467s = 90% -> Fenster
  pruefe('spaet im Ausholen IST Konter', c.imKonterfenster(g), 'zT='+g.zT.toFixed(3));
}
{
  const s=c.kaempfer({x:10,t:0.5,blick:1}), g=c.gegner('schlaeger',20,0.5);
  c.schlage(g); takt(g,26);                     // im Fenster
  c.schlage(s); takt(s,12);                     // Spieler im Zustand 'schlag'
  const hp=g.hp, r=c.spielerTrifft(s,g);
  pruefe('Konter macht mehr Schaden als ein Schlag', r==='konter'&&hp-g.hp===c.KAMPF.konterSchaden, r+' schaden='+(hp-g.hp));
  pruefe('Konter betaeubt den Gegner', g.betaeubt>0);
}

console.log('\n--- Ausdauer ---');
{
  const s=c.kaempfer({});
  let n=0; while(c.schlage(s)) { n++; s.zustand='frei'; s.betaeubt=0; if(n>20) break; }
  pruefe('Schlagen ist begrenzt (kein Haemmern)', n===Math.floor(c.KAMPF.ausdauerMax/c.KAMPF.ausdauerSchlag), n+' Schlaege');
  pruefe('leer ist leer', !c.schlage(s));
  s.zustand='frei'; s.ausdauerPause=0; takt(s,120);          // 2s Erholung
  pruefe('Ausdauer kommt im Nichtstun zurueck', s.ausdauer>50, s.ausdauer.toFixed(0));
}
{
  const s=c.kaempfer({}); c.verbrauche(s,30); const vor=s.ausdauer;
  s.zustand='frei'; takt(s,20);                 // 0.33s < ausdauerPause 0.7s
  pruefe('direkt nach Verbrauch kommt nichts zurueck', s.ausdauer===vor, s.ausdauer.toFixed(1)+' vs '+vor.toFixed(1));
}

console.log('\n--- Blocken ---');
{
  const a=c.kaempfer({x:0,t:0.5,blick:1}), z=c.kaempfer({x:10,t:0.5,hp:10});
  c.blocke(z,true);
  bisSchlag(a);                     // in 'schlag'
  const hp=z.hp, aus=z.ausdauer;
  const r=c.loeseTreffer(a,z,{schaden:2});
  pruefe('Block laesst nur einen Teil durch', r==='block'&&Math.abs((hp-z.hp)-2*c.KAMPF.blockSchadenAnteil)<1e-6, r+' schaden='+(hp-z.hp));
  pruefe('Blocken kostet Ausdauer', z.ausdauer<aus);
}
{
  const a=c.kaempfer({x:0,t:0.5,blick:1}), z=c.kaempfer({x:10,t:0.5,hp:10,ausdauer:5});
  c.blocke(z,true); bisSchlag(a);
  const r=c.loeseTreffer(a,z,{schaden:1});
  pruefe('leere Ausdauer bricht die Garde', r==='gardebruch'&&z.betaeubt>0, r);
}
{
  const a=c.kaempfer({x:0,t:0.5,blick:1}), z=c.kaempfer({x:10,t:0.5,hp:10});
  c.blocke(z,true); bisSchlag(a);
  const hp=z.hp, r=c.loeseTreffer(a,z,{schaden:2,unblockbar:true});
  pruefe('unblockbar geht durch den Block', r==='treffer'&&hp-z.hp===2, r+' schaden='+(hp-z.hp));
}

console.log('\n--- Ausweichrolle in die Tiefe ---');
{
  const z=c.kaempfer({x:10,t:0.5});
  const vorT=z.t; c.rolle(z,1); takt(z,25);
  pruefe('Rolle bewegt in die Tiefe', z.t>vorT+0.1, vorT.toFixed(2)+' -> '+z.t.toFixed(2));
  pruefe('Rolle endet wieder im Zustand frei', z.zustand==='frei', z.zustand);
}
{
  const a=c.kaempfer({x:0,t:0.5,blick:1}), z=c.kaempfer({x:10,t:0.5,hp:5});
  c.rolle(z,1); c.kaempferTakt(z,1/60);         // unverwundbar aktiv
  bisSchlag(a);
  const hp=z.hp, r=c.loeseTreffer(a,z,{schaden:2});
  pruefe('Rolle macht unverwundbar', r==='daneben'&&z.hp===hp, r);
}

console.log('\n--- Tiefe entscheidet ueber Treffer ---');
{
  const a=c.kaempfer({x:0,t:0.5,blick:1});
  bisSchlag(a);
  const weit=c.kaempfer({x:10,t:0.95,hp:5});
  pruefe('anderer Ebene = kein Treffer', c.loeseTreffer(a,weit,{schaden:1})===null);
  a.trefferGesetzt=false;
  const gleich=c.kaempfer({x:10,t:0.52,hp:5});
  pruefe('gleiche Ebene = Treffer', c.loeseTreffer(a,gleich,{schaden:1})==='treffer');
}

console.log('\n--- Fehlschlag wird bestraft ---');
{
  const a=c.kaempfer({}); c.schlage(a);
  takt(a,Math.ceil(c.KAMPF.ausholen*60)+Math.ceil(c.KAMPF.schlagDauer*60)+2);
  pruefe('Luftschlag -> lange Erholung', a.zustand==='erholung'&&a.aktErholung===c.KAMPF.fehlErholung, a.zustand+' '+a.aktErholung);
}
{
  const a=c.kaempfer({x:0,t:0.5,blick:1}), z=c.kaempfer({x:10,t:0.5,hp:5});
  bisSchlag(a);
  c.loeseTreffer(a,z,{schaden:1});
  takt(a,Math.ceil(c.KAMPF.schlagDauer*60)+1);
  pruefe('Treffer -> kurze Erholung', a.aktErholung===c.KAMPF.erholung, String(a.aktErholung));
}

console.log('\n--- Gegner-KI ---');
{
  const s=c.kaempfer({x:200,t:0.5}), g=c.gegner('schlaeger',20,0.1);
  let geschlagen=false, naeher=false;
  const startAbstand=Math.abs(s.x-g.x);
  for(let i=0;i<600;i++){ c.gegnerTakt(g,1/60,s); if(g.zustand==='ausholen') geschlagen=true; }
  naeher=Math.abs(s.x-g.x)<startAbstand;
  pruefe('Gegner laeuft heran', naeher, 'abstand '+Math.abs(s.x-g.x).toFixed(0));
  pruefe('Gegner gleicht die Tiefe an', Math.abs(g.t-s.t)<0.1, 'dt='+Math.abs(g.t-s.t).toFixed(3));
  pruefe('Gegner greift an', geschlagen);
}

console.log('\n============================');
console.log(ok+' bestanden, '+fail+' fehlgeschlagen');
process.exit(fail?1:0);
