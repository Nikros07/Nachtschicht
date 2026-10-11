/* Messung A - die Kloppe in Level 3 isoliert: wie lange dauert sie, kann man verlieren?
   node docs/gameplay/messung/a-kloppe.js
   Taktiken: konter (drueckt nur im Konterfenster), hammer (E alle 0,3 s), nichts (steht nur da),
   mensch (Reaktion 0,15-0,45 s nach Ausholbeginn, sonst hammern alle 0,8 s) */
const H=require('./a-helfer.js');
const {ladeLevel,takt,runde,median}=H;
function kloppe(taktik,saat){
  const {L,E}=ladeLevel('level3.html',{saat});
  H.drueck(L,'Space'); E('KAPITEL.aktiv=false; starteBus(); S.x=TUNE.kloppeX-4; S.kloppeStand="geredet"; starteKloppe()');
  let t=0, letzte=-9, reakt={}; const rng=L.rng;
  for(let i=0;i<60*120;i++){
    takt(E); t+=1/60;
    if(E('S.modus')!=='kloppe') break;
    const st=E('({ich:{x:S.ich.x,t:S.ich.t,z:S.ich.zustand},g:S.gegner.filter(g=>g.hp>0).map((g,j)=>({j,x:g.x,t:g.t,z:g.zustand,zT:g.zT,fen:imKonterfenster(g)}))})');
    const n=st.g.map(g=>({...g,d:Math.abs(g.x-st.ich.x)})).sort((a,b)=>a.d-b.d)[0];
    if(!n) continue;
    const richt=Math.sign(n.x-st.ich.x)||1;
    E(`rechtsAn=${n.d>13&&richt>0}; linksAn=${n.d>13&&richt<0}; hochAn=${n.t-st.ich.t<-0.08}; runterAn=${n.t-st.ich.t>0.08}`);
    if(taktik==='konter'){ if(st.g.some(g=>g.z==='ausholen'&&g.fen&&Math.abs(g.x-st.ich.x)<17)&&st.ich.z==='frei') H.drueck(L,'KeyE'); }
    else if(taktik==='hammer'){ if(t-letzte>0.3){ letzte=t; H.drueck(L,'KeyE'); } }
    else if(taktik==='mensch'){
      for(const g of st.g){ if(g.z==='ausholen'&&reakt[g.j]==null) reakt[g.j]=t+0.15+rng()*0.30; if(g.z!=='ausholen') reakt[g.j]=null; }
      const fällig=st.g.find(g=>reakt[g.j]!=null&&t>=reakt[g.j]);
      if(fällig){ reakt[fällig.j]=1e9; H.drueck(L,'KeyE'); }
      else if(n.d<=14&&t-letzte>0.8){ letzte=t; H.drueck(L,'KeyE'); }
    }
  }
  return {taktik,dauer:t,stand:E('S.kloppeStand'),ichHp:E('S.ich?S.ich.hp:null'),geld:E('NACHT.werte.geld'),modus:E('S.modus')};
}
for(const tk of ['konter','mensch','hammer','nichts']){
  const r=[]; for(let s=0;s<10;s++) r.push(kloppe(tk,s));
  const st={}; r.forEach(x=>st[x.stand]=(st[x.stand]||0)+1);
  console.log(tk.padEnd(8)+'Dauer min/med/max '+[Math.min(...r.map(x=>x.dauer)),median(r.map(x=>x.dauer)),Math.max(...r.map(x=>x.dauer))].map(v=>runde(v)).join(' / ')+' s  Ausgang '+JSON.stringify(st)+'  Geld danach '+r[0].geld+' (vorher 15)  Modus danach '+r[0].modus);
}
