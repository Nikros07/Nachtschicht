/* Messhilfe: gemeinsame Helfer fuer Messskripte (ohne Browser, Ausfuehrung ueber tools/nachttest.js).
   Ersetzt die Bausteine, die fast jedes Skript in docs/gameplay/messung/ neu baute:
   Seite laden, Bild/Takte, Aufruf-Mitschreiber, Rang abfangen, Titel+Intro, Zufallstasten.

   Beispiel (Zufallslauf, endet bei Sieg oder nach 600 s):
     const M=require('../../../tools/messhilfe.js');
     const {L,E,takte}=M.starteLevel('level3.html',{lektion:0});
     const rang=M.rangAbfangen(L);
     M.titelUndIntro(L);                       // nur wenn der Lauf vom Titel startet
     const tasten=M.zufallsTasten(L,42,{tasten:['ArrowLeft','ArrowRight','KeyE']});
     for(let i=0;i<36000;i++){ tasten.schritt(i); takte(1); if(E('S.modus')==='ende'&&E('S.gewonnen')) break; }
     console.log(rang());                      // {args:[...],ergebnis:{...}} des letzten WERTUNG.abschluss
     const treffer=M.schreibMit(L,'SAFT.treffer');   // lebende Liste {args}; treffer.length

   Hinweis: wechselt das Arbeitsverzeichnis in die Projektwurzel (nachttest.lade liest relativ). */
'use strict';
const path=require('path');
const WURZEL=path.resolve(__dirname,'..');
process.chdir(WURZEL);
const N=require('./nachttest.js');

const ZUFALLSTASTEN=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyE'];

/* Seite laden. opt.abfrage: ganze Query ('?lektion=0&...'); opt.lektion: Kurzform '?lektion=N'.
   Liefert {L, E, taste, takte, bild}: L=Ladeobjekt von nachttest, E=Auswertung im Spiel,
   takte(n) = n mal update(1/60), bild(n) = n mal update+draw. */
function starteLevel(seite,opt){
  opt=opt||{};
  const abfrage=opt.abfrage||('?lektion='+(opt.lektion===undefined?0:opt.lektion));
  const L=N.lade(seite,abfrage), E=c=>L.api.ev(c);
  const takte=(n=1)=>{ for(let i=0;i<n;i++) E('update(1/60)'); };
  const bild=(n=1)=>{ for(let i=0;i<n;i++){ E('update(1/60)'); E('draw(1/60)'); } };
  return {L,E,taste:L.taste,takte,bild};
}

/* Umhuellt eine Funktion im Spiel (z.B. 'SAFT.treffer') und schreibt jeden Aufruf mit.
   Liefert die lebende Liste [{args,ergebnis}, ...]. Doppelter Aufruf umhuellt nicht doppelt. */
function schreibMit(L,name){
  const E=c=>L.api.ev(c), id=JSON.stringify(name);
  E(`(()=>{ const w=window.__mh||(window.__mh={}); if(w[${id}]) return;
    const teile=${id}.split('.'), fn=teile.pop(), obj=teile.reduce((o,k)=>o[k],window);
    const f=obj[fn], liste=w[${id}]=[];
    obj[fn]=function(...a){ const r=f.apply(this,a); liste.push({args:a,ergebnis:r}); return r; }; })()`);
  return E(`window.__mh[${id}]`);
}

/* Faengt WERTUNG.abschluss ab. Liefert eine Funktion, die den letzten Aufruf
   ({args,ergebnis}) oder null gibt; .alle ist die ganze Liste. */
function rangAbfangen(L){
  const liste=schreibMit(L,'WERTUNG.abschluss');
  const f=()=>liste.length?liste[liste.length-1]:null;
  f.alle=liste; return f;
}

/* Titel verlassen, Intro ueberspringen: Space, bis das Spiel laeuft (hoechstens maxBilder). */
function titelUndIntro(L,maxBilder=300){
  const E=c=>L.api.ev(c);
  for(let i=0;i<maxBilder && !['spiel','pause'].includes(E('S.modus'));i++){
    L.taste('Space',true); L.taste('Space',false);
    E('update(1/60)');
    if(E('S.modus')==='intro') E('S.szeneT+=99');
  }
  return E('S.modus');
}

/* Zufallstasten mit festem Seed (wie die Rang-Laeufe): alle 6-35 Bilder wechseln 1-2 Tasten.
   opt.tasten: Auswahl; opt.wechsel:[min,spanne] (Bilder). Liefert {schritt(i), los(), r}. */
function zufallsTasten(L,seed,opt){
  opt=opt||{};
  const tasten=opt.tasten||ZUFALLSTASTEN, [wmin,wspanne]=opt.wechsel||[6,30];
  const r=N.zufall(seed), gehalten=new Set(); let wechsel=0;
  const los=()=>{ for(const c of gehalten) L.taste(c,false); gehalten.clear(); };
  const schritt=i=>{
    if(i<wechsel) return;
    los();
    const n=1+Math.floor(r()*2);
    for(let k=0;k<n;k++){ const c=tasten[Math.floor(r()*tasten.length)]; if(!gehalten.has(c)){ gehalten.add(c); L.taste(c,true); } }
    wechsel=i+wmin+Math.floor(r()*wspanne);
  };
  return {schritt,los,r};
}

module.exports={starteLevel,schreibMit,rangAbfangen,titelUndIntro,zufallsTasten,ZUFALLSTASTEN,zufall:N.zufall};
