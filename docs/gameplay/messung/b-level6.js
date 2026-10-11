/* Messung B - Level 6 (Afterhour / Traum-Schule).
   node docs/gameplay/messung/b-level6.js          Zusammenfassung
   node docs/gameplay/messung/b-level6.js --log    Ereignisprotokoll je Spielstil (Seed 1)

   Spielstile (Erstspieler: liest alles):
     direkt      Spind -> Labortisch -> Buecher -> Lea
     gruendlich  redet mit jedem Echo, nimmt das Polaroid, probiert beide Tueren, ruht auf dem Sofa
     verpeilt    laesst den Labortisch aus, laeuft in die Schleife, kehrt nach zwei Runden um
     springer    wie direkt, springt aber dauernd (misst, ob Springen irgendwo wirkt)
     nichtstun   bleibt stehen (Erschoepfung, Wegknicken) */
'use strict';
const W=require('./b-werkzeug.js');
const LOG=process.argv.includes('--log');

const SNAP=`x:S.x, kond:S.kondition, pegel:S.pegel, zeit:S.zeit, st:S.t, ruht:!!S.ruht, sucht:S.suchT>0,
  erl:Object.keys(S.erledigt).join(','), dur:Object.keys(S.durchsucht).join(','), ger:Object.keys(S.geredetMit).join(','),
  schleifen:S.schleifen, weg:S.weggeknickt, amBoden:S.amBoden, ort:ortBei(S.x).name+'@'+ortBei(S.x).von`;

function extra(v,j,ev,t){
  if(j.erl!==v.erl) ev.push({t,typ:'I',txt:'ERINNERUNG GEFUNDEN ('+j.erl+')'});
  if(j.schleifen>v.schleifen) ev.push({t,typ:'H',txt:'SCHLEIFE: zurueck in Raum 101 (#'+j.schleifen+')'});
  if(j.weg>v.weg) ev.push({t,typ:'H',txt:'WEGGEKNICKT (#'+j.weg+')'});
  if(j.ort!==v.ort&&j.m==='spiel'&&Math.abs(j.x-v.x)<40) ev.push({t,typ:'I',txt:'ORT '+j.ort.split('@')[0]});
  if(Math.abs(j.x-v.x)>40&&j.m==='spiel') ev.push({t,typ:'H',txt:'VERSETZT '+Math.round(v.x)+' > '+Math.round(j.x)});
  if(Math.floor(j.kond/10)!==Math.floor(v.kond/10)&&j.kond<v.kond&&j.kond<35) ev.push({t,typ:'I',txt:'WACH '+Math.round(j.kond)});
}

const PLAENE={
  direkt:[200,430,960,1560],
  springer:[200,430,960,1560],
  gruendlich:[40,180,200,270,430,600,612,790,960,1000,1056,'zurueck-nach-1056',1170,1340,1420,1560],
  verpeilt:[200,'schleife','schleife',430,960,1560],
  nichtstun:[],
};

function bot(stil,{seed=1}={}){
  const r=W.zufall(seed*31337+3);
  const z={lesen:true};
  const plan=[...PLAENE[stil]];
  let ziel=null, wartenBis=0, gedrueckt=0, sofaBis=0;
  const politik=w=>{ /* ehrlich/freundlich: meiste Zuneigung, sonst die erste */
    let b=0, bw=-1e9; w.forEach((x,i)=>{ const s=(x.tu&&x.tu.mag?x.tu.mag[1]:0)+(x.tu&&x.tu.flag?3:0)+(x.geh==='@ende'?-5:0); if(s>bw){bw=s;b=i;} }); return b; };
  return (st,ctl)=>{
    if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
    if(W.kartenBot(st,ctl,z,false)) return;
    if(st.m==='ende') return 'fertig';
    if(W.gespraechBot(st,ctl,z,politik)){ ctl.halte('KeyD',false); ctl.halte('KeyA',false); return; }
    if(st.m!=='spiel'){ ctl.halte('KeyD',false); ctl.halte('KeyA',false); return; }
    if(stil==='nichtstun') return;
    if(st.ruht){ if(ctl.t>sofaBis) { ctl.tippe('KeyD'); ctl.verb('Aufstehen'); } return; }
    if(st.sucht) return;
    if(stil==='springer'&&r()<0.03){ ctl.tippe('Space'); ctl.verb('Springen','ohne Wirkung'); }
    if(ziel===null){
      if(!plan.length) return;
      ziel=plan[0]; gedrueckt=0;
      if(ziel==='schleife'){ ziel={schleife:true,start:st.weg,schl:st.schleifen}; }
      if(ziel==='zurueck-nach-1056'){ ziel=1056; plan[0]=1056; }
    }
    if(ziel&&ziel.schleife){
      /* einfach nach rechts laufen, bis die Schleife zuschnappt */
      ctl.halte('KeyD',true); ctl.halte('KeyA',false);
      if(st.schleifen>ziel.schl){ plan.shift(); ziel=null; ctl.halte('KeyD',false); }
      return;
    }
    const dx=ziel-st.x;
    if(Math.abs(dx)>3){ ctl.halte('KeyD',dx>0); ctl.halte('KeyA',dx<0); if(!z.lauf){ ctl.verb('Laufen'); z.lauf=true; } return; }
    ctl.halte('KeyD',false); ctl.halte('KeyA',false); z.lauf=false;
    if(ctl.t<wartenBis) return;
    /* Sofa: ausruhen, wenn gruendlich und muede */
    ctl.tippe('KeyE'); gedrueckt++;
    ctl.verb('E',String(ziel));
    wartenBis=ctl.t+0.9;
    if([70,790,1340].includes(ziel)) sofaBis=ctl.t+(stil==='gruendlich'?3:0);
    plan.shift(); ziel=null;
  };
}

module.exports={bot,SNAP,extra,PLAENE};
if(require.main===module){
const zusammen={};
for(const [stil,n,vorher] of [['direkt',4,''],['gruendlich',4,''],['verpeilt',4,''],['springer',3,''],
    ['direkt-pegel80',4,"localStorage.setItem(PEGEL_KEY,'80');"],['direkt-kondition35',4,"setzeWert('kondition',35); localStorage.setItem(PEGEL_KEY,'80');"],
    ['nichtstun',1,'']]){
  const art=stil.split('-')[0];
  const liste=[];
  for(let seed=1;seed<=n;seed++){
    const r=W.lauf('level6.html',bot(art,{seed}),{seed,vorher,snapExtra:SNAP,ereignisExtra:extra,maxSek:art==='nichtstun'?300:900});
    const b=W.bericht(stil,r);
    const ev=r.ev;
    const verben={}; for(const [k,v] of Object.entries(r.verben)) verben[k]=Object.keys(v.wirkung).length?v.wirkung:v.n;
    liste.push({seed,gesamtSek:+r.t.toFixed(1),spielUhr:+r.E('S.zeit').toFixed(1),gewonnen:r.E('S.gewonnen'),
      weggeknickt:r.E('S.weggeknickt'),schleifen:r.E('S.schleifen'),kondEnde:Math.round(r.E('S.kondition')),pegelEnde:Math.round(r.E('S.pegel')),
      entscheidungen:ev.filter(e=>e.typ==='E').length,textknoten:ev.filter(e=>e.typ==='I'&&e.txt.startsWith('TEXT')).length,
      leereHE:b.leereHE,leereH:b.leereH.dauer,leereOhnePlausch:b.leereOhnePlausch.dauer,zuschau:b.zuschauAnteil,zuschauTeile:b.zuschau,verben});
    if(LOG&&seed===1){ console.log('\n==== PROTOKOLL '+stil+' (Seed 1) ===='); console.log(W.protokoll(ev,e=>!(e.typ==='X'&&/^(Laufen|Text weiter)/.test(e.txt))).join('\n')); }
  }
  const m=k=>+(liste.reduce((a,x)=>a+(typeof x[k]==='number'?x[k]:0),0)/liste.length).toFixed(1);
  zusammen[stil]={laeufe:n,gesamtSek:m('gesamtSek'),spielUhr:m('spielUhr'),siege:liste.filter(x=>x.gewonnen).length,
    weggeknickt:m('weggeknickt'),schleifen:m('schleifen'),kondEnde:m('kondEnde'),pegelEnde:m('pegelEnde'),
    entscheidungen:m('entscheidungen'),textknoten:m('textknoten'),zuschau:m('zuschau'),
    leereHEmax:Math.max(...liste.map(x=>x.leereHE.dauer)),leereHmittel:+(liste.reduce((a,x)=>a+x.leereH,0)/liste.length).toFixed(1),beispiel:{leereHE:liste[0].leereHE,zuschauTeile:liste[0].zuschauTeile,verben:liste[0].verben}};
}
console.log(JSON.stringify(zusammen,null,1));
}
