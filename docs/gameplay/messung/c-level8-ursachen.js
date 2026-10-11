/* Messung C - Level 8: Woran verliert ein guter Konter-Spieler den Endkampf?
   Aus der Projektwurzel: node docs/gameplay/messung/c-level8-ursachen.js
   30 Zufallsstaende je Variante, Konter-Bot aus c-level8.js (Reaktion 0,05 s).
   Zaehlt die Schadensquellen ueber die Meldungen (VOLL DRAUF, UMGERANNT, VON HINTEN, FLASCHE)
   und wie oft der Anfuehrer pro Phase angreift. Varianten: normal, mit mutigerKopf (4 Leben),
   ohne Crew (keiner geht dazwischen). Nichts hier aendert Spieldateien. */
const H=require('./c-hilfe.js');
const fs=require('fs');
const BOT=(()=>{ const src=fs.readFileSync(__dirname+'/c-level8.js','utf8');
  const a=src.indexOf('window.__bot=function'); return src.slice(a,src.indexOf('};`);',a)+2); })();

function kampf(seed,opt){
  const L=H.lade('level8.html'); const E=c=>L.api.ev(c);
  for(let i=0;i<seed*7;i++) L.rng();
  const crew=opt.ohneCrew?'[]':'["MORITZ","MAX FERDI","JONAS","DENNIS","SEMIH","LEA"]';
  E(`localStorage.setItem(CREW_KEY,'${crew}'); setzeFlag('marvinKennt'); setzeFlag('taxiTipp'); ${opt.mutig?"setzeFlag('mutigerKopf');":''} neuesSpiel();`);
  E(BOT); E('starteGrossenKampf();');
  const an={}; const halte=(k,c,s)=>{ if(!!an[k]!==!!s){ L.taste(c,!!s); an[k]=!!s; } };
  const quellen={}; let vorM='', vorMT=0, t=0;
  const proPhase={1:0,2:0,3:0}; let vorZ='';
  while(E('S.modus')==='kampf'&&t<240){
    const o=JSON.parse(E(`JSON.stringify(__bot('konter',0.05))`));
    halte('l','KeyA',o.l); halte('r','KeyD',o.r); halte('u','KeyW',o.u); halte('d','KeyS',o.d); halte('b','ShiftLeft',o.b);
    if(o.e){ L.taste('KeyE',true); L.taste('KeyE',false); }
    if(o.roll){ L.taste('Space',true); L.taste('Space',false); }
    E('update(1/60)'); t+=1/60;
    const z=JSON.parse(E(`JSON.stringify({m:S.meldung,mt:S.meldungT,gz:S.gegner.zustand,ph:phase8()})`));
    if(z.mt>0&&(z.m!==vorM||z.mt>vorMT+0.05)) quellen[z.m]=(quellen[z.m]||0)+1;
    if(z.gz==='ausholen'&&vorZ!=='ausholen') proPhase[z.ph]++;
    vorM=z.m; vorMT=z.mt; vorZ=z.gz;
  }
  for(const [k,c] of [['l','KeyA'],['r','KeyD'],['u','KeyW'],['d','KeyS'],['b','ShiftLeft']]) halte(k,c,false);
  return { sieg:!!E("flag('fightGewonnen')"), dauer:t, quellen, proPhase };
}
for(const [name,opt] of [['normal (3 Leben, Crew)',{}],['mutigerKopf (4 Leben)',{mutig:true}],['ohne Crew',{ohneCrew:true}]]){
  const r=[]; for(let s=0;s<30;s++) r.push(kampf(s,opt));
  const sum={}; for(const x of r) for(const k in x.quellen) sum[k]=(sum[k]||0)+x.quellen[k];
  const ph={1:0,2:0,3:0}; for(const x of r) for(const k in x.proPhase) ph[k]+=x.proPhase[k];
  const schaden=['VOLL DRAUF','UMGERANNT','VON HINTEN','FLASCHE'].map(k=>k+' '+(sum[k]||0)).join(', ');
  console.log(JSON.stringify({ variante:name, siege:r.filter(x=>x.sieg).length+'/30',
    dauerMittel:+(r.reduce((a,b)=>a+b.dauer,0)/r.length).toFixed(1),
    schadenQuellen:schaden, konter:(sum.SITZT||0)+(sum.KONTER||0)+(sum.BAM||0), crewHilfe:Object.keys(sum).filter(k=>/DAZWISCHEN/.test(k)).reduce((a,k)=>a+sum[k],0),
    angriffeAnfuehrerJePhase:ph, alleMeldungen:sum }));
}
