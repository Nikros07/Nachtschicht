/* Messung Bedienfeld-Layout (nacht/mobil.js): reine Zahlen, kein Browser.
   node docs/gameplay/messung/n3-mobil-layout.js   (aus dem Projektordner)
   Liest rechneAnordnung()/rechneGespraech() aus dem Block RECHNUNG der aktuellen Datei und
   die alte platziere() aus git (Stand VOR n3, Commit 1b9cc71) fuer den Vorher/Nachher-Vergleich.
   Annahmen: Bild skaliert wie anpassen() (Viertelstufen, W=320 H=180 -> hier aus MOBIL-Skala
   unten), Sicherheitsraender 0, Bedienfeld = ganzer Schirm. IM BROWSER UNGEPRUEFT. */
'use strict';
const fs=require('fs'), cp=require('child_process');
const neu=fs.readFileSync('nacht/mobil.js','utf8');
const m=neu.match(/\/\* >>> RECHNUNG[\s\S]*?<<< RECHNUNG \*\//);
const KNOPF_MAX_QUER=+neu.match(/const KNOPF_MAX_QUER=(\d+)/)[1], LEISTE_MIN=+neu.match(/const LEISTE_MIN=(\d+)/)[1];
const NEU=new Function('KNOPF_MAX_QUER','LEISTE_TASTE','LEISTE_LUECKE',m[0]+';return {rechneAnordnung,rechneGespraech};')(KNOPF_MAX_QUER,+neu.match(/LEISTE_TASTE=(\d+)/)[1],+neu.match(/LEISTE_LUECKE=(\d+)/)[1]);

/* Alter Stand: platziere() aus git mit Attrappen. */
const alt=cp.execSync('git show 1b9cc71:nacht/mobil.js',{encoding:'utf8'});
const fa=alt.slice(alt.indexOf('function platziere(){'),alt.indexOf('/* Schwierigkeits-Knoepfe'));
function ALT(p){
  const erg={}; const mk=n=>({style:{},n});
  const els={'mb-aktion':mk('aktion'),'mb-zwei':mk('zwei'),'mb-block':mk('block'),'mb-x1':mk('x1'),'mb-x2':mk('x2')};
  const f=new Function('p','KNOPF_MAX_QUER','GROESSEN','deck','el','getComputedStyle','window','einst','html','cv','stick','stickId','stickHeim','wahlAn','out','bAktion','bZwei','bBlock','bX',
   'let mitte,stickGr,stickHeimPos;function setze(e,x,y,d){out[e.n||"stick"]={x:x,y:y,d:d};}\n'+fa+'\nplatziere();out.heim=stickHeimPos;out.stickGr=stickGr;');
  const st=mk('stick'); st.n='stick';
  f(p,KNOPF_MAX_QUER,{klein:.85,mittel:1,gross:1.2},{getBoundingClientRect:()=>({width:p.dw,height:p.dh,top:0})},
    id=>els[id]||{},()=>({paddingBottom:0,paddingLeft:0,paddingRight:0}),{MOBIL:{hoch:!p.quer}},{groesse:'mittel',hand:p.links?'links':'rechts'},
    {classList:{contains:()=>p.leiste}},{getBoundingClientRect:()=>({bottom:p.leisteOben})},st,null,()=>{},false,erg,els['mb-aktion'],els['mb-zwei'],els['mb-block'],[els['mb-x1'],els['mb-x2']]);
  return erg;
}
/* Bild wie anpassen(): quer Viertelstufen-Skalierung; hier einfach min(w/320,h/180) auf 1/4 abgerundet,
   hochkant Breite/320. Nur zur Bestimmung der Leiste; die Messung selbst gibt die Eingaben aus. */
function bild(w,h){ const W=320,H=180; if(h>w) return {h:Math.round(H*w/W)};
  const s=Math.floor(Math.min(w/W,h/H)*4)/4; return {h:Math.round(H*s)}; }
const G=[['iPhone hoch',375,812],['iPhone quer',812,375],['kleines Handy quer',667,375],['iPad Air quer',1180,820],['iPad mini quer',1133,744]];
const rd=o=>{ const r={}; for(const k of ['aktion','zwei','block','x1','x2']) if(o[k]) r[k]=[Math.round(o[k].x),Math.round(o[k].y),Math.round(o[k].d)]; return r; };
const rechteck=(n,e)=>{ const d=e.d||0; return n+' x '+Math.round(e.x-d/2)+'..'+Math.round(e.x+d/2)+' y '+Math.round(e.y-d/2)+'..'+Math.round(e.y+d/2); };
let fehler=0;
for(const [n,w,h] of G){
  const quer=w>h, bh=bild(w,h).h, leiste=quer&&h-bh>=LEISTE_MIN;
  const p={dw:w,dh:h,sU:0,sL:0,sR:0,quer,sk:1,leiste,leisteOben:bh,links:false};
  const a=ALT(Object.assign({},p)), b=NEU.rechneAnordnung(p);
  const ra=rd(a), rb=rd(b), gleich=JSON.stringify(ra)===JSON.stringify(rb);
  console.log('\n'+n+' '+w+'x'+h+' Bildhoehe '+bh+' Leiste '+(leiste?'ja':'nein')+'  -> '+(gleich?'UNVERAENDERT':'GEAENDERT'));
  if(!leiste&&!gleich){ fehler++; console.log(' !! Telefon hat sich veraendert'); }
  if(!gleich||leiste){
    for(const k of ['x1','x2']){ console.log(' vorher '+rechteck(k,a[k])); console.log(' nachher '+rechteck(k,b[k])); }
    if(leiste){
      const E=['aktion','zwei','block','x1','x2'].map(k=>[k,b[k]]);
      for(const [k,e] of E){ if(e.y-e.d/2<bh-0.5){ fehler++; console.log(' !! '+k+' ragt ins Bild'); } }
      const x1=b.x1,x2=b.x2;
      for(let i=0;i<E.length;i++) for(let j=i+1;j<E.length;j++){ const [ka,A]=E[i],[kb,B]=E[j];
        const dist=Math.hypot(A.x-B.x,A.y-B.y); if(dist<(A.d+B.d)/2){ fehler++; console.log(' !! Ueberlappung '+ka+'/'+kb+' Abstand '+dist.toFixed(1)); } }
      const mn=b.menue, mg=b.menueGr;
      if(!mn){ fehler++; console.log(' !! MENUE nicht in der Leiste'); } else {
        const mr={x:mn.x,y:mn.y}; console.log(' MENUE x '+Math.round(mn.x-mg.w/2)+'..'+Math.round(mn.x+mg.w/2)+' y '+Math.round(mn.y-mg.h/2)+'..'+Math.round(mn.y+mg.h/2));
        if(mn.y-mg.h/2<bh-0.5){ fehler++; console.log(' !! MENUE ragt ins Bild'); }
        const sg=b.stickGr; const sOb=b.heim.x, sR=sOb+sg/2;
        for(const [k,e] of [...E,['stick',{x:b.heim.x,y:b.heim.y,d:sg}]]){ if(Math.abs(mn.x-e.x)<(mg.w+e.d)/2&&Math.abs(mn.y-e.y)<(mg.h+e.d)/2){ fehler++; console.log(' !! MENUE ueberlappt '+k); } }
      }
      const rest=Math.max(...E.map(([k,e])=>w-(e.x-e.d/2)))  ; const links=Math.min(...E.map(([k,e])=>e.x-e.d/2));
      console.log(' Abstand linkster Knopf zum rechten Rand: '+Math.round(rest)+' px (Soll ca. 300, Grenze 320)');
      if(rest>320){ fehler++; console.log(' !! zu weit links'); }
    }
  }
}
/* Gespraechsleiste: 4 lange Antworten, Text 70 Zeichen, 2 Zeilen Frage. */
console.log('\nGESPRAECH quer, 4 Antworten a 70 Zeichen');
for(const [w,h] of [[667,375],[812,375],[844,390]]){
  for(const zmax of [40,70,90]){
    const g=NEU.rechneGespraech({vw:w,vh:h,n:4,zmax,wasZeilen:2,safeU:0});
    console.log(w+'x'+h+' '+zmax+'Z: Spalten '+g.spalten+' Antwort '+g.optHoehe+' px Leiste '+g.hoehe+' von max '+g.maxHoehe+' ('+Math.round(100*g.maxHoehe/h)+' %) passt '+g.passt);
    if(zmax<=70&&(!g.passt||g.optHoehe<44)){ fehler++; console.log(' !! passt nicht'); }
  }
}
const vorher=NEU.rechneGespraech({vw:667,vh:375,n:4,zmax:70,wasZeilen:2,safeU:0});
console.log('VORHER (CSS: 45 %, 3 Spalten) braucht bei 667x375: '+(function(){const g=NEU.rechneGespraech({vw:667,vh:375,n:3,zmax:70,wasZeilen:2});return '3 Spalten, 4 Antworten=2 Reihen, Leiste '+Math.ceil(6+6+10+5+32.4+5+2*(Math.max(44,Math.ceil(Math.ceil(70/Math.floor((((647-12)/3)-22)/7.2))*16.2+18)))+6)+' px > '+Math.round(0.45*375)+' px'; })());
console.log(fehler?('\nFEHLER: '+fehler):'\nALLES OK (rechnerisch)');
process.exit(fehler?1:0);
