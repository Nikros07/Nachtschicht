/* Messung B - Level 4 (Die Schlange / Tuersteher).
   node docs/gameplay/messung/b-level4.js            Zusammenfassung
   node docs/gameplay/messung/b-level4.js --log      dazu das Ereignisprotokoll eines Erstspieler-Laufs

   Bots:
     profi     kontert im Fenster (+50 ms), setzt nach, rollt vor dem Rammstoss
     mittel    Reaktion streut (Fenster +80 ms, sigma 110 ms), erkennt die Ramme zu 75 %
     anfaenger drueckt E, sobald er das "!" sieht (~300 ms), blockt die Ramme statt zu rollen
   Erstspieler = liest alles, ueberspringt nichts. Wiederholer = haelt E in Intro/Cutscene. */
'use strict';
const W=require('./b-werkzeug.js');
const LOG=process.argv.includes('--log');

const SNAP=`b:S.boss?{x:S.boss.x,t:S.boss.t,z:S.boss.zustand,zT:S.boss.zT,d:S.boss.ausholenDauer||0,fa:S.boss.fensterAnteil||0,
  art:S.boss.art||'',hp:S.boss.hp,max:S.boss.maxHp,anl:!!S.boss.anlauf,bt:S.boss.betaeubt||0,ph:bossPhase(S.boss)}:null,
  s:S.spieler?{x:S.spieler.x,t:S.spieler.t,z:S.spieler.zustand,aus:S.spieler.ausdauer,hp:S.spieler.hp,bl:S.spieler.blick}:null,
  er:S.erholungT, tr:S.treffer, hv:S.herzVerlust`;

const ZUST={};   // Sekunden je Zustand des Tuerstehers im Kampf (alle Laeufe einer Variante)
function extra(v,j,ev,t){
  if(j.m==='kampf'&&j.b){ const k=j.b.anl?'anlauf':j.b.z; ZUST[k]=(ZUST[k]||0)+1/60; }
  if(j.b&&j.b.z==='ausholen'&&(!v.b||v.b.z!=='ausholen')) ev.push({t,typ:'H',txt:'ANGRIFF '+j.b.art.toUpperCase()+' (Ausholen '+j.b.d.toFixed(2)+' s, Fenster '+(j.b.d*j.b.fa).toFixed(2)+' s, Phase '+j.b.ph+')'});
  if(j.b&&v.b&&j.b.hp<v.b.hp) ev.push({t,typ:'I',txt:'TUERSTEHER '+v.b.hp+' > '+j.b.hp});
  if(j.b&&v.b&&j.b.ph!==v.b.ph) ev.push({t,typ:'H',txt:'PHASE '+j.b.ph});
  if(j.s&&v.s&&Math.ceil(j.s.hp)<Math.ceil(v.s.hp)) ev.push({t,typ:'I',txt:'DU VERLIERST EIN HERZ ('+Math.ceil(j.s.hp)+')'});
}

function bot(art,{lesen=true,skip=false,seed=1,dreht=false}={}){
  const r=W.zufall(seed*7919+13);
  const z={lesen,dreht};
  let letzteZ=null, plan=null, pending=null, stunId=-1, angriffN=0, blockBis=-1;
  return (st,ctl)=>{
    if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
    if(W.kartenBot(st,ctl,z,skip)) return;
    if(st.m==='ende') return 'fertig';
    if(W.gespraechBot(st,ctl,z,()=>0)) return;
    if(st.m==='intro'||st.m==='cutscene'){ if(skip) ctl.halte('KeyE',true); return; }
    if(skip) ctl.halte('KeyE',false);
    if(st.m!=='kampf'||!st.b||!st.s) return;
    const b=st.b, s=st.s;
    /* Wirkung des letzten Drucks einordnen */
    if(pending){
      let w='ohne Wirkung';
      if(st.tr>pending.tr) w=pending.stun?'Nachsetzen trifft':'KONTER';
      else if(st.er>0&&pending.er<=0) w='DANEBEN (0,6 s Sperre)';
      else if(s.z==='ausholen') w='Schlag (gedeckt/Luft)';
      else if(st.mel==='AUSSER PUSTE') w='keine Puste';
      ctl.verb('E',w); pending=null;
    }
    /* Ausrichten und rangehen */
    const dx=b.x-s.x;
    const dreht=art==='profi'&&z.dreht ? Math.abs(dx)>0.01 : Math.abs(dx)>2;
    if(dreht&&Math.sign(dx)!==s.bl&&s.z==='frei'){ ctl.tippe(dx>0?'KeyD':'KeyA'); ctl.verb('Laufen','drehen'); return; }
    const gehe=Math.abs(dx)>15&&b.z!=='ausholen'&&s.z==='frei'&&!b.anl;
    ctl.halte('KeyD',gehe&&dx>0); ctl.halte('KeyA',gehe&&dx<0);
    if(gehe&&!z.lief){ ctl.verb('Laufen','ranlaufen'); } z.lief=gehe;
    /* Blocken (nur Anfaenger bei der Ramme) */
    ctl.halte('ShiftLeft',ctl.t<blockBis);
    /* Neuer Angriff: Plan machen */
    if(b.z==='ausholen'&&letzteZ!=='ausholen'){
      angriffN++;
      const fenster=b.d*(1-b.fa);
      if(art==='profi') plan=b.art==='ramme'?{roll:b.d-0.14}:{e:fenster+0.05};
      else if(art==='mittel'){
        if(b.art==='ramme') plan=r()<0.75?{roll:Math.max(0.2,b.d-W.normal(r,0.18,0.1))}:{e:Math.max(0.2,W.normal(r,0.35,0.1))};
        else plan={e:Math.max(0.18,fenster+W.normal(r,0.08,0.11))};
      } else {
        if(b.art==='ramme'){ plan={}; blockBis=ctl.t+b.d+0.35; ctl.verb('Blocken (Shift)','gegen Ramme - hilft nicht'); }
        else plan={e:Math.max(0.15,W.normal(r,0.30,0.08))};
      }
    }
    letzteZ=b.z;
    if(b.z==='ausholen'&&plan){
      if(plan.e!==undefined&&b.zT>=plan.e){ pending={tr:st.tr,er:st.er,stun:false}; ctl.tippe('KeyE'); plan.e=undefined; }
      if(plan.roll!==undefined&&b.zT>=plan.roll){ ctl.tippe('Space'); ctl.verb('Rolle (Leertaste)','vor Ramme'); plan.roll=undefined; }
      return;
    }
    /* Nachsetzen, wenn er betaeubt ist oder ins Leere geschlagen hat */
    const willNach = art==='profi' ? true : art==='mittel' ? r()<0.02 : false;   // mittel: ab und zu, pro Bild gewuerfelt
    if((b.z==='getroffen'&&b.bt>0.25||b.z==='erholung')&&s.z==='frei'&&s.aus>=18&&st.er<=0&&stunId!==angriffN&&willNach){
      stunId=angriffN; pending={tr:st.tr,er:st.er,stun:true}; ctl.tippe('KeyE');
    }
  };
}

function kampfStat(r){
  const ev=r.ev;
  const k0=(ev.find(e=>e.typ==='M'&&e.txt.endsWith('> kampf'))||{}).t;
  const k1=(ev.find(e=>e.typ==='M'&&e.t>k0&&/kampf > (cutscene|ende)/.test(e.txt))||{}).t;
  const angr=ev.filter(e=>e.typ==='H'&&e.txt.startsWith('ANGRIFF'));
  const iv=angr.slice(1).map((e,i)=>e.t-angr[i].t);
  const mw=iv.reduce((a,b)=>a+b,0)/Math.max(1,iv.length);
  const sd=Math.sqrt(iv.reduce((a,b)=>a+(b-mw)**2,0)/Math.max(1,iv.length));
  const arten={}; for(const a of angr){ const k=a.txt.split(' ')[1]; arten[k]=(arten[k]||0)+1; }
  return { kampfSek:k0&&k1?+(k1-k0).toFixed(1):null, angriffe:angr.length, arten,
    abstandMittel:+mw.toFixed(2), abstandStreuung:+sd.toFixed(2), cv:+(sd/Math.max(1e-9,mw)).toFixed(2),
    herzenVerloren:ev.filter(e=>e.txt.startsWith('DU VERLIERST')).length,
    gewonnen:r.E('S.gewonnen') };
}

const ergebnisse={};
const VARIANTEN=[
  ['profi', 8, ''],
  ['profi-dreht', 8, ''],   // dreht sich auch bei weniger als 2 Pixel Abstand richtig herum
  ['mittel',20, ''],
  ['anfaenger',10, ''],
  ['mittel-pegel60',20, "localStorage.setItem(PEGEL_KEY,'60');"],
  ['mittel-gruppeGross',20, "setzeFlag('gruppeGross');"],
];
for(const [name,n,vorher] of VARIANTEN){
  const art=name.split('-')[0];
  const liste=[];
  for(let seed=1;seed<=n;seed++){
    const r=W.lauf('level4.html',bot(art,{seed,lesen:true,dreht:name==='profi-dreht'}),{seed,vorher,snapExtra:SNAP,ereignisExtra:extra,maxSek:400});
    const ks=kampfStat(r);
    const verbN={}; for(const [k,v] of Object.entries(r.verben)) verbN[k]=v.wirkung;
    liste.push({seed,...ks,gesamtSek:+r.t.toFixed(1),bericht:W.bericht('',r),verben:verbN});
  }
  const sieg=liste.filter(x=>x.gewonnen).length;
  const zs=Object.values(ZUST).reduce((a,b)=>a+b,0);
  const zustand=Object.fromEntries(Object.entries(ZUST).map(([k,v])=>[k,+(v/zs*100).toFixed(1)]));
  for(const k of Object.keys(ZUST)) delete ZUST[k];
  const mittel=k=>+(liste.reduce((a,x)=>a+(x[k]||0),0)/liste.length).toFixed(2);
  ergebnisse[name]={laeufe:n,siege:sieg,kampfSekMittel:mittel('kampfSek'),angriffeMittel:mittel('angriffe'),
    abstandMittel:mittel('abstandMittel'),cvMittel:mittel('cv'),herzenVerlorenMittel:mittel('herzenVerloren'),
    gesamtSekMittel:mittel('gesamtSek'),leereHEMittel:+(liste.reduce((a,x)=>a+x.bericht.leereHE.dauer,0)/liste.length).toFixed(1),
    leereHMittel:+(liste.reduce((a,x)=>a+x.bericht.leereH.dauer,0)/liste.length).toFixed(1),zuschauMittel:+(liste.reduce((a,x)=>a+x.bericht.zuschauAnteil,0)/liste.length).toFixed(1),
    tuersteherZustandProzent:zustand,
    eDruckeJeKampfSek:+(liste.reduce((a,x)=>a+Object.values(x.verben.E||{}).reduce((p,q)=>p+q,0),0)/Math.max(1,liste.reduce((a,x)=>a+(x.kampfSek||0),0))).toFixed(2),
    beispiel:LOG?liste[0]:{arten:liste[0].arten,verben:liste[0].verben,leereHE:liste[0].bericht.leereHE.dauer,zuschau:liste[0].bericht.zuschau}};
}
console.log(JSON.stringify(ergebnisse,null,1));

/* Wiederholungskosten: ein verlorener Kampf, danach E bis zum naechsten Kampfbeginn */
function wiederholung(skip){
  let phase=0, tTod=null, tNeu=null;
  const b1=bot('anfaenger',{seed:3,lesen:true});
  const z={lesen:true};
  const r=W.lauf('level4.html',(st,ctl)=>{
    if(phase===0){ const x=b1(st,ctl); if(st.m==='ende'){ phase=1; tTod=ctl.t; } return x==='fertig'&&st.m!=='ende'?undefined:undefined; }
    if(phase===1){
      if(st.m==='ende'){ if(ctl.t-tTod>1.5) ctl.tippe('KeyE'); return; }
      if(st.m==='titel'){ if(!z.t){ ctl.tippe('KeyE'); z.t=true; } return; }
      if(W.kartenBot(st,ctl,z,skip)) return;
      if(W.gespraechBot(st,ctl,z,()=>0)) return;
      if(st.m==='intro'){ if(skip) ctl.halte('KeyE',true); return; }
      ctl.halte('KeyE',false);
      if(st.m==='kampf'){ tNeu=ctl.t; return 'fertig'; }
    }
  },{seed:3,snapExtra:SNAP,ereignisExtra:extra,maxSek:500});
  return {verloren:tTod!==null, tTod:tTod&&+tTod.toFixed(1), tNeu:tNeu&&+tNeu.toFixed(1), wiederSek:tTod&&tNeu?+(tNeu-tTod).toFixed(1):null,
    zwischen:W.protokoll(r.ev,e=>e.t>tTod&&e.typ!=='X').slice(0,30)};
}
console.log('WIEDERHOLUNG Erstspieler-Tempo:',JSON.stringify(wiederholung(false),null,1));
console.log('WIEDERHOLUNG mit E halten:',JSON.stringify(wiederholung(true),null,1));

if(LOG){
  const r=W.lauf('level4.html',bot('mittel',{seed:2,lesen:true}),{seed:2,snapExtra:SNAP,ereignisExtra:extra,maxSek:400});
  console.log('\nPROTOKOLL (mittel, Erstspieler, Seed 2):');
  console.log(W.protokoll(r.ev).join('\n'));
  console.log(JSON.stringify(W.bericht('L4 mittel',r),null,1));
}
