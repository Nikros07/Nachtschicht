/* Messung C - Level 8: Endkampf ueber 30 Zufallsstaende je Taktik.
   Aus der Projektwurzel: node docs/gameplay/messung/c-level8-kampf.js
   Zaehlt: Dauer, Ergebnis, Angriffsarten (schwung/jab/ramme/wurf), Phase-3-Zeit, Handlanger-Angriffe.
   Nutzt den Kampf-Bot aus c-level8.js (gleiche Logik, hier ohne Wettlauf/Finale). */
const H=require('./c-hilfe.js');
function kampf(seed,taktik,reaktion){
  const L=H.lade('level8.html'); const E=c=>L.api.ev(c);
  for(let i=0;i<seed*7;i++) L.rng();
  E(`localStorage.setItem(CREW_KEY,'["MORITZ","MAX FERDI","JONAS","DENNIS","SEMIH","LEA"]'); setzeFlag('marvinKennt'); setzeFlag('taxiTipp'); neuesSpiel();`);
  const src=require('fs').readFileSync(__dirname+'/c-level8.js','utf8');
  const bot=src.slice(src.indexOf('window.__bot=function'),src.indexOf('};`);',src.indexOf('window.__bot=function'))+2);
  E(bot);
  E(`starteGrossenKampf();`);
  const an={}; const halte=(k,c,s)=>{ if(!!an[k]!==!!s){ L.taste(c,!!s); an[k]=!!s; } };
  const arten={schwung:0,jab:0,ramme:0,wurf:0}; let vorZ='', t=0, phase3=0, handl=0, vorH='';
  let eingesteckt=0, hp0=E('S.spielerK.hp');
  while(E('S.modus')==='kampf'&&t<240){
    const o=JSON.parse(E(`JSON.stringify(__bot('${taktik}',${reaktion}))`));
    halte('l','KeyA',o.l); halte('r','KeyD',o.r); halte('u','KeyW',o.u); halte('d','KeyS',o.d); halte('b','ShiftLeft',o.b);
    if(o.e){ L.taste('KeyE',true); L.taste('KeyE',false); }
    if(o.roll){ L.taste('Space',true); L.taste('Space',false); }
    E('update(1/60)'); t+=1/60;
    const z=JSON.parse(E(`JSON.stringify({gz:S.gegner.zustand,ga:S.gegner.art,ph:phase8(),hl:S.handlanger.map(h=>h.zustand).join(','),hp:S.spielerK.hp})`));
    if(z.gz==='ausholen'&&vorZ!=='ausholen') arten[z.ga]=(arten[z.ga]||0)+1;
    if(z.ph===3) phase3+=1/60;
    const hn=z.hl.split(','), ho=vorH.split(',');
    hn.forEach((h,i)=>{ if(h==='ausholen'&&ho[i]!=='ausholen') handl++; });
    vorZ=z.gz; vorH=z.hl;
  }
  for(const [k,c] of [['l','KeyA'],['r','KeyD'],['u','KeyW'],['d','KeyS'],['b','ShiftLeft']]) halte(k,c,false);
  return {dauer:+t.toFixed(1), sieg:E("flag('fightGewonnen')"), arten, phase3S:+phase3.toFixed(1), handlangerAngriffe:handl};
}
for(const [taktik,reaktion] of [['konter',0.05],['konter',0.15],['blocker',0],['haemmern',0],['nichts',0]]){
  const r=[]; for(let s=0;s<30;s++) r.push(kampf(s,taktik,reaktion));
  const mittel=f=>+(r.reduce((a,b)=>a+f(b),0)/r.length).toFixed(2);
  const summe=k=>r.reduce((a,b)=>a+(b.arten[k]||0),0);
  console.log(JSON.stringify({taktik,reaktion,laeufe:r.length,siege:r.filter(x=>x.sieg).length,
    dauerMittel:mittel(x=>x.dauer), dauerMin:Math.min(...r.map(x=>x.dauer)), dauerMax:Math.max(...r.map(x=>x.dauer)),
    angriffe:{schwung:summe('schwung'),jab:summe('jab'),ramme:summe('ramme'),wurf:summe('wurf')},
    kaempfeMitRamme:r.filter(x=>x.arten.ramme).length, kaempfeMitWurf:r.filter(x=>x.arten.wurf).length,
    phase3Mittel:mittel(x=>x.phase3S), handlangerAngriffeMittel:mittel(x=>x.handlangerAngriffe)}));
}
