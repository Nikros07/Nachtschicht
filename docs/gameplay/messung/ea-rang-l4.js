/* Entwurf A - Messung: Rang und PERFEKT-Fenster am Tuersteher (Level 4) kalibrieren.
   node docs/gameplay/messung/ea-rang-l4.js

   Reine Messung, aendert keine Spieldatei. Nutzt den Messkoffer b-werkzeug.js und einen
   Bot nach dem Vorbild von b-level4.js (profi / mittel / anfaenger, dort beschrieben).
   Schreibt je Lauf mit:
     - reine Kampfzeit (Modus kampf), Herzverlust, Konter, Nachsetzen
     - fuer jeden Konter-Druck: wie weit nach Fensterbeginn er kam (ms)
   und rechnet daraus:
     - welcher Anteil der Konter in ein PERFEKT-Band von 60/80/100/120 ms ab Fensterbeginn faellt
     - eine Punktzahl nach dem Rang-Vorschlag aus entwurf-a.md und die Rangverteilung je Bot */
'use strict';
const W=require('./b-werkzeug.js');

const SNAP=`b:S.boss?{z:S.boss.zustand,zT:S.boss.zT,d:S.boss.ausholenDauer||0,fa:S.boss.fensterAnteil||0,
  art:S.boss.art||'',hp:S.boss.hp,max:S.boss.maxHp,anl:!!S.boss.anlauf,bt:S.boss.betaeubt||0,x:S.boss.x}:null,
  s:S.spieler?{x:S.spieler.x,z:S.spieler.zustand,aus:S.spieler.ausdauer,hp:S.spieler.hp,bl:S.spieler.blick}:null,
  er:S.erholungT, tr:S.treffer, hv:S.herzVerlust`;

function bot(art,seed,log){
  const r=W.zufall(seed*7919+13);
  const z={lesen:false};
  let letzteZ=null, plan=null, pending=null, stunId=-1, angriffN=0, blockBis=-1;
  return (st,ctl)=>{
    if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
    if(W.kartenBot(st,ctl,z,true)) return;
    if(st.m==='ende') return 'fertig';
    if(W.gespraechBot(st,ctl,z,()=>0)) return;
    if(st.m==='intro'||st.m==='cutscene'){ ctl.halte('KeyE',true); return; }
    ctl.halte('KeyE',false);
    if(st.m!=='kampf'||!st.b||!st.s) return;
    const b=st.b, s=st.s;
    if(pending){
      /* Nachsetzen trifft erst, wenn der eigene Schlag landet - bis 0,6 s warten */
      if(st.tr>pending.tr){ log.push({art:pending.stun?'nach':'konter',off:pending.off}); pending=null; }
      else if(st.er>0&&pending.er<=0){ log.push({art:'daneben',off:pending.off}); pending=null; }
      else if(ctl.t-pending.t>0.6) pending=null;
    }
    const dx=b.x-s.x;
    if(Math.abs(dx)>2&&Math.sign(dx)!==s.bl&&s.z==='frei'){ ctl.tippe(dx>0?'KeyD':'KeyA'); return; }
    const gehe=Math.abs(dx)>15&&b.z!=='ausholen'&&s.z==='frei'&&!b.anl;
    ctl.halte('KeyD',gehe&&dx>0); ctl.halte('KeyA',gehe&&dx<0);
    ctl.halte('ShiftLeft',ctl.t<blockBis);
    if(b.z==='ausholen'&&letzteZ!=='ausholen'){
      angriffN++;
      const fenster=b.d*(1-b.fa);
      if(art==='profi') plan=b.art==='ramme'?{roll:b.d-0.14}:{e:fenster+Math.max(0.02,W.normal(r,0.05,0.03))};
      else if(art==='mittel'){
        if(b.art==='ramme') plan=r()<0.75?{roll:Math.max(0.2,b.d-W.normal(r,0.18,0.1))}:{e:Math.max(0.2,W.normal(r,0.35,0.1))};
        else plan={e:Math.max(0.18,fenster+W.normal(r,0.08,0.11))};
      } else {
        if(b.art==='ramme'){ plan={}; blockBis=ctl.t+b.d+0.35; }
        else plan={e:Math.max(0.15,W.normal(r,0.30,0.08))};
      }
    }
    letzteZ=b.z;
    if(b.z==='ausholen'&&plan){
      if(plan.e!==undefined&&b.zT>=plan.e){
        pending={tr:st.tr,er:st.er,stun:false,off:(b.zT-b.d*(1-b.fa))*1000,t:ctl.t}; ctl.tippe('KeyE'); plan.e=undefined; }
      if(plan.roll!==undefined&&b.zT>=plan.roll){ ctl.tippe('Space'); plan.roll=undefined; }
      return;
    }
    const willNach = art==='profi' ? true : art==='mittel' ? r()<0.02 : false;
    if((b.z==='getroffen'&&b.bt>0.25||b.z==='erholung')&&s.z==='frei'&&s.aus>=18&&st.er<=0&&stunId!==angriffN&&willNach){
      stunId=angriffN; pending={tr:st.tr,er:st.er,stun:true,off:null,t:ctl.t}; ctl.tippe('KeyE');
    }
  };
}

/* Rang-Vorschlag (entwurf-a.md, Abschnitt Wertung, Level 4):
   SAUBER  40 P  - 40 je verlorenes Herz anteilig: 40,20,5,0 fuer 0,1,2,3+ Herzen
   TEMPO   25 P  - reine Kampfzeit: <=11 s voll, linear bis 0 bei 24 s
   KONTER  20 P  - Anteil Konter an allen Angriffen (ohne Ramme), voll ab 70 %
   STIL    15 P  - beste Serie (ohne Treffer) 5 P je Glied ab 2, max 15; PERFEKT +3 je, max 15
   S >= 88, A >= 72, B >= 50, sonst C (C ist jeder Sieg). */
/* Variante V2 (in entwurf-a.md uebernommen): SAUBER 30, TEMPO 20, KONTER 20, PERFEKT 20, SERIE 10. */
function punkte(x,perfektMs,v){
  if(v===1){
    const sauber=[40,20,5,0][Math.min(3,x.herz)];
    const tempo=Math.round(25*Math.max(0,Math.min(1,(24-x.kampf)/(24-11))));
    const konter=Math.round(20*Math.min(1,x.konterQuote/0.7));
    const perfekt=x.offs.filter(o=>o>=0&&o<=perfektMs).length;
    const stil=Math.min(15,Math.max(0,(x.serie-1)*5)+perfekt*3);
    return {summe:sauber+tempo+konter+stil};
  }
  const sauber=[30,15,5,0][Math.min(3,x.herz)];
  const tempo=Math.round(20*Math.max(0,Math.min(1,(22-x.kampf)/(22-9))));
  const konter=Math.round(20*Math.min(1,x.konterQuote/0.7));
  const perfekt=Math.round(20*Math.min(1,x.offs.filter(o=>o>=0&&o<=perfektMs).length/Math.max(1,x.angriffe)/0.6));
  const serie=Math.min(10,Math.max(0,(x.serie-1)*4));
  return {summe:sauber+tempo+konter+perfekt+serie};
}
const rang=p=>p>=88?'S':p>=72?'A':p>=50?'B':'C';

const ergebnis={};
for(const [art,n] of [['profi',16],['mittel',30],['anfaenger',10]]){
  const laeufe=[];
  for(let seed=1;seed<=n;seed++){
    const log=[];
    let kampf=0, angriffe=0, letzteZ=null;
    const extra=(v,j)=>{ if(j.m==='kampf') kampf+=1/60;
      if(j.b&&j.b.z==='ausholen'&&(!v.b||v.b.z!=='ausholen')&&j.b.art!=='ramme') angriffe++; };
    const r=W.lauf('level4.html',bot(art,seed,log),{seed,snapExtra:SNAP,ereignisExtra:extra,maxSek:400});
    const gew=r.E('S.gewonnen'), herz=r.E('S.herzVerlust');
    /* Serie = Konter/Nachsetzen in Folge ohne eigenen Herzverlust - aus der Reihenfolge rekonstruiert */
    const hv=r.ev.filter(e=>/DU VERLIERST|VOLL ERWISCHT|AUTSCH|UMGERANNT|DURCH DIE DECKUNG/.test(e.txt)).length;
    let serie=0, best=0; for(const e of log){ if(e.art==='konter'||e.art==='nach'){ serie++; best=Math.max(best,serie);} else serie=0; }
    const offs=log.filter(e=>e.art==='konter').map(e=>e.off);
    laeufe.push({gew,herz,kampf:+kampf.toFixed(1),konter:offs.length,nach:log.filter(e=>e.art==='nach').length,
      daneben:log.filter(e=>e.art==='daneben').length,angriffe,konterQuote:angriffe?offs.length/angriffe:0,serie:best,offs,hv});
  }
  const siege=laeufe.filter(x=>x.gew);
  const alleOffs=laeufe.flatMap(x=>x.offs);
  const band={}; for(const ms of [60,70,80,100,120]) band[ms+' ms']=alleOffs.length?Math.round(100*alleOffs.filter(o=>o>=0&&o<=ms).length/alleOffs.length)+' %':'-';
  const raenge={S:0,A:0,B:0,C:0}; const pk=[]; const raenge2={S:0,A:0,B:0,C:0}; const pk2=[];
  for(const x of siege){ const p=punkte(x,90,1); pk.push(p.summe); raenge[rang(p.summe)]++;
    const q=punkte(x,70,2); pk2.push(q.summe); raenge2[rang(q.summe)]++; }
  const m=k=>siege.length?+(siege.reduce((a,x)=>a+x[k],0)/siege.length).toFixed(2):null;
  ergebnis[art]={laeufe:n,siege:siege.length,kampfSekMittel:m('kampf'),herzMittel:m('herz'),konterMittel:m('konter'),
    nachsetzenMittel:m('nach'),bestSerieMittel:m('serie'),
    konterOffsetMs:alleOffs.length?{min:Math.round(Math.min(...alleOffs)),median:Math.round(alleOffs.slice().sort((a,b)=>a-b)[alleOffs.length>>1]),max:Math.round(Math.max(...alleOffs))}:null,
    perfektAnteilJeBand:band, punkteV1:pk.sort((a,b)=>a-b).join(' '), raengeV1:raenge, punkteV2:pk2.sort((a,b)=>a-b).join(' '), raengeV2:raenge2};
}
console.log(JSON.stringify(ergebnis,null,1));
