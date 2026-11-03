/* n3 - Level 4: Rang-Grenzen und Tempo kalibrieren (TUNE.rang, tempoBasis/tempoJeTreffer).
   node docs/gameplay/messung/n3-level4-rang.js [laeufe=5]
   Bots (fester Seed 1..n): profi (kontert im Fenster +20..80 ms, rollt vor der Ramme, setzt nach),
   anfaenger (traege: Druck 0.35 s +-0.1 nach Ausholbeginn = oft daneben, blockt die Ramme, kein Nachsetzen),
   mittel. Je Bot mit "skip" (haelt E in Intro/Cutscene = Wiederholer) und ohne (Erstspieler liest).
   Liest den Rang aus dem WERTUNG.abschluss-Aufruf des Levels (abgefangen) und die Tempo-Werte. */
'use strict';
const W=require('./b-werkzeug.js');
const N=+process.argv[2]||5;
const SNAP=`b:S.boss?{x:S.boss.x,z:S.boss.zustand,zT:S.boss.zT,d:S.boss.ausholenDauer||0,fa:S.boss.fensterAnteil||0,
  art:S.boss.art||'',anl:!!S.boss.anlauf,bt:S.boss.betaeubt||0}:null,
  s:S.spieler?{x:S.spieler.x,z:S.spieler.zustand,aus:S.spieler.ausdauer,bl:S.spieler.blick}:null,
  er:S.erholungT, tr:S.treffer, hv:S.herzVerlust`;
/* Umgebungsvariablen zum Durchprobieren, ohne die Seite zu aendern:
   RANG='{"konter":{"gut":0.65},"combo":{"gut":4}}' ueberschreibt TUNE.rang.*; LAHM_MU/LAHM_SIGMA/LAHM_BLOCK steuern den Anfaenger "lahm". */
const RANG=process.env.RANG||'{}';
const LMU=+(process.env.LAHM_MU||0.22), LSG=+(process.env.LAHM_SIGMA||0.22), LBL=+(process.env.LAHM_BLOCK||0.8);
const VORHER=`(()=>{ const o=${RANG}; for(const k in o) Object.assign(TUNE.rang[k],o[k]); })();window.__w=null; (()=>{ const f=WERTUNG.abschluss; WERTUNG.abschluss=function(l,p,z){ window.__w={l,p,z}; return f.apply(this,arguments); }; })();`;

function bot(art,seed,skip){
  const r=W.zufall(seed*7919+13), z={lesen:!skip};
  let letzteZ=null, plan=null, blockBis=-1, stunId=-1, angriffN=0;
  return (st,ctl)=>{
    if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
    if(W.kartenBot(st,ctl,z,skip)) return;
    if(st.m==='ende') return 'fertig';
    if(W.gespraechBot(st,ctl,z,()=>0)) return;
    if(st.m==='intro'||st.m==='cutscene'){ if(skip) ctl.halte('KeyE',true); return; }
    if(skip) ctl.halte('KeyE',false);
    if(st.m!=='kampf'||!st.b||!st.s) return;
    const b=st.b, s=st.s, dx=b.x-s.x;
    if(Math.abs(dx)>2&&Math.sign(dx)!==s.bl&&s.z==='frei'){ ctl.tippe(dx>0?'KeyD':'KeyA'); return; }
    const gehe=Math.abs(dx)>15&&b.z!=='ausholen'&&s.z==='frei'&&!b.anl;
    ctl.halte('KeyD',gehe&&dx>0); ctl.halte('KeyA',gehe&&dx<0);
    ctl.halte('ShiftLeft',ctl.t<blockBis);
    if(b.z==='ausholen'&&letzteZ!=='ausholen'){
      angriffN++; const fenster=b.d*(1-b.fa);
      if(art==='lahm'){   // Anfaenger, der gewinnt: Druck im Mittel LAHM_MU s nach Fensterbeginn (sigma LAHM_SIGMA), blockt die Ramme zu LAHM_BLOCK, rollt sonst spaet
        if(b.art==='ramme'){ if(r()<LBL){ plan={}; blockBis=ctl.t+b.d+0.35; } else plan={roll:Math.max(0.2,b.d-W.normal(r,0.12,0.08))}; }
        else plan={e:Math.max(0.15,fenster+W.normal(r,LMU,LSG))};
      } else if(art==='profi'||art==='rein') plan=b.art==='ramme'?{roll:b.d-0.14}:{e:fenster+Math.max(0.02,W.normal(r,0.05,0.03))};  // rein = wie profi, aber ohne Nachsetzen
      else if(art==='mittel'){
        if(b.art==='ramme') plan=r()<0.75?{roll:Math.max(0.2,b.d-W.normal(r,0.18,0.1))}:{e:Math.max(0.2,W.normal(r,0.35,0.1))};
        else plan={e:Math.max(0.18,fenster+W.normal(r,0.08,0.11))};
      } else {
        if(b.art==='ramme'){ plan={}; blockBis=ctl.t+b.d+0.35; }
        else plan={e:Math.max(0.15,W.normal(r,0.35,0.1))};
      }
    }
    letzteZ=b.z;
    if(b.z==='ausholen'&&plan){
      if(plan.e!==undefined&&b.zT>=plan.e){ ctl.tippe('KeyE'); plan.e=undefined; }
      if(plan.roll!==undefined&&b.zT>=plan.roll){ ctl.tippe('Space'); plan.roll=undefined; }
      return;
    }
    const nach=art==='profi'?true:art==='mittel'?r()<0.02:false;
    if((b.z==='getroffen'&&b.bt>0.25||b.z==='erholung')&&s.z==='frei'&&s.aus>=18&&st.er<=0&&stunId!==angriffN&&nach){
      stunId=angriffN; ctl.tippe('KeyE'); }
  };
}
const aus={};
for(const art of ['profi','rein','mittel','lahm','anfaenger']) for(const skip of [false,true]){
  const name=art+(skip?'-skip':'-erst'), l=[];
  for(let seed=1;seed<=N;seed++){
    let kampf=0;
    const extra=(v,j)=>{ if(j.m==='kampf') kampf+=1/60; };
    const r=W.lauf('level4.html',bot(art,seed,skip),{seed,vorher:VORHER,snapExtra:SNAP,ereignisExtra:extra,maxSek:500});
    const g=r.E('S.gewonnen');
    const w=r.E('window.__w');
    const o=r.E(`({k:S.konter,v:S.versuche,hv:S.herzVerlust,c:S.maxCombo,z:S.zeit,tempo:S.musikTempo})`);
    l.push({seed,gew:!!g,rang:w?rangVon(w.p):'-',p:w?w.p:null,zeilen:w?w.z.map(x=>x.name[0]+x.pkt).join(' '):'',quote:o.v?+(o.k/o.v).toFixed(2):0,herz:o.hv,combo:o.c,zeit:+o.z.toFixed(0),kampf:+kampf.toFixed(0),tempo:o.tempo});
  }
  aus[name]=l;
}
function rangVon(p){ return p>=90?'S':p>=75?'A':p>=55?'B':'C'; }
for(const [n,l] of Object.entries(aus)){
  const s=l.filter(x=>x.gew), m=k=>s.length?+(s.reduce((a,x)=>a+x[k],0)/s.length).toFixed(2):'-';
  const rv={S:0,A:0,B:0,C:0}; s.forEach(x=>rv[x.rang]++);
  console.log(n.padEnd(15),'siege',s.length+'/'+l.length,'Raenge',JSON.stringify(rv),'Punkte~',m('p'),'Quote~',m('quote'),'Herzen~',m('herz'),'Combo~',m('combo'),'Zeit~',m('zeit'),'Kampf~',m('kampf'));
  if(process.argv.includes('--v')) for(const x of l) console.log('   ',JSON.stringify(x));
}
