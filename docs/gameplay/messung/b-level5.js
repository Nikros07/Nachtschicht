/* Messung B - Level 5 (Club).
   node docs/gameplay/messung/b-level5.js          Zusammenfassung aller Spielstile
   node docs/gameplay/messung/b-level5.js --log    dazu das Ereignisprotokoll je Stil (Seed 1)

   Spielstile (alle als Erstspieler: lesen, nichts ueberspringen):
     zielstrebig  Mia -> Sophie -> Kira -> Ausgang, antwortet "gut" (meiste Zuneigung, Nummer/raus)
     erkunder     dazu Garderobe, Polaroid, Bar (Auf-Ex), Raucher, Waschbecken, Lieferant
     minimal      einmal Auf-Ex an der Bar (schaltet den Ausgang frei), dann raus
     zufall       wie zielstrebig, aber zufaellige Antworten
     nichtstun    steht am Eingang, bis um eins das Licht angeht
   Minispiel: "mittel" trifft mit Zeitfehler sigma 70 ms, "profi" mittig. */
'use strict';
const W=require('./b-werkzeug.js');
const LOG=process.argv.includes('--log');

const SNAP=`x:S.x, pegel:S.pegel, st:S.t, zeit:S.zeit, erf:S.erfolge, abf:S.abfuhren, stolp:S.stolpernT, dunkel:S.dunkel,
  conf:S.confidenceT, knick:S.geknicktT, warAktiv:S.warAktiv,
  mini:S.mini?{art:S.mini.art,r:S.mini.runden,f:S.mini.fehler,mitte:S.mini.mitte,t0:S.mini.t0}:null,
  mv:{da:S.marvin.da,x:S.marvin.x,wut:S.marvin.wut,fertig:S.marvin.fertig,ziel:S.marvin.ziel?S.marvin.ziel.id:null,hat:S.marvin.hat.length},
  ziele:ZIELE.map(z=>z.stand).join(','), ecke:S.ecke?{i:S.ecke.i,t:S.ecke.t,id:S.ecke.z.id}:null,
  ich:S.ich?{x:S.ich.x,t:S.ich.t,z:S.ich.zustand,hp:S.ich.hp,aus:S.ich.ausdauer,bl:S.ich.blick}:null,
  geg:S.gegner.map(g=>({x:g.x,t:g.t,z:g.zustand,zT:g.zT,d:g.ausholenDauer,hp:g.hp})),
  ort:ortBei(S.x).name`;

function extra(v,j,ev,t){
  if(j.mini&&!v.mini) ev.push({t,typ:'H',txt:'MINISPIEL '+j.mini.art.toUpperCase()});
  if(j.mini&&v.mini&&j.mini.r>v.mini.r) ev.push({t,typ:'I',txt:'MINI treffer '+j.mini.r});
  if(j.mini&&v.mini&&j.mini.f>v.mini.f) ev.push({t,typ:'I',txt:'MINI fehler '+j.mini.f});
  if(j.ziele!==v.ziele) ev.push({t,typ:'I',txt:'ZIELE '+v.ziele+' > '+j.ziele});
  if(j.mv.da&&!v.mv.da) ev.push({t,typ:'H',txt:'MARVIN TAUCHT AUF'});
  if(j.mv.wut&&!v.mv.wut) ev.push({t,typ:'H',txt:'MARVIN IST SAUER'});
  if(j.stolp>v.stolp+0.5) ev.push({t,typ:'H',txt:'ANGERANNT im Dunkeln'});
  if(j.m==='kloppe'&&v.m!=='kloppe') ev.push({t,typ:'H',txt:'SCHLAEGEREI BEGINNT'});
  if(j.m==='kloppe') j.geg.forEach((g,i)=>{ const a=v.geg[i]; if(g.z==='ausholen'&&a&&a.z!=='ausholen') ev.push({t,typ:'H',txt:'GEGNER '+i+' HOLT AUS'}); });
  if(j.ort!==v.ort&&j.m==='spiel') ev.push({t,typ:'I',txt:'ORT '+j.ort});
  if(j.ecke&&(!v.ecke||j.ecke.i!==v.ecke.i)) ev.push({t,typ:'I',txt:'ECKE '+j.ecke.id+' Zeile '+j.ecke.i});
}

/* Antwort-Politik "gut": Zuneigung + Ziel (raus > Nummer > Tanz), Abfuhr meiden. */
function gut(wahl){
  let best=0, bw=-1e9;
  wahl.forEach((w,i)=>{
    const g=w.geh||'', tu=w.tu||{};
    let s=(tu.mag?tu.mag[1]:0);
    if(g==='ja') s+=100; if(g==='nummerJa'||g==='@nummer') s+=80; if(g==='nummer') s+=30; if(g==='@tanz') s+=12;
    if(g==='kampf') s+=20; if(g==='ruf') s+=5;
    if(g==='@nein'||g==='besoffen'||g==='laut') s-=100; if(g==='@nett') s-=20; if(g==='@ende') s-=10;
    if(s>bw){ bw=s; best=i; }
  });
  return best;
}

const ORTE={ mia:330, sophie:720, kira:960, bar:690, garderobe:70, foto:112, raucher1:900, raucher2:1010,
  wasser:1120, lieferant:1250, ausgang:1350 };
const PLAENE={
  zielstrebig:['mia','sophie','kira','ausgang'],
  zufall:['mia','sophie','kira','ausgang'],
  erkunder:['garderobe','foto','mia','bar','sophie','raucher1','kira','raucher2','wasser','lieferant','ausgang'],
  minimal:['bar','ausgang'],
  tanz:['mia','sophie','kira','ausgang'],
  trinker:['bar'],
  gereizt:['mia','sophie','kira','ausgang'],
  troedler:['mia','sophie','kira','ausgang'],
  stellen:['mia','sophie','kira','ausgang'],
  nichtstun:[],
};

function bot(stil,{seed=1,mini='mittel'}={}){
  const r=W.zufall(seed*104729+7);
  const z={lesen:true};
  const plan=[...PLAENE[stil]];
  let ziel=null, wartenBis=0, miniPlan=null, eckeT=0, zielSeit=0, drueckeVersuche=0;
  const tanzPolitik=w=>{ const i=w.findIndex(x=>x.geh==='@tanz'); return i>=0?i:gut(w); };
  const politik=stil==='zufall'?(w=>Math.floor(r()*w.length)):stil==='tanz'?tanzPolitik:gut;
  return (st,ctl)=>{
    if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
    if(W.kartenBot(st,ctl,z,false)) return;
    if(st.m==='ende') return 'fertig';
    if(W.gespraechBot(st,ctl,z,politik)) { ctl.halte('KeyD',false); ctl.halte('KeyA',false); return; }
    if(st.m==='intro'||st.m==='cutscene') { ctl.halte('KeyD',false); ctl.halte('KeyA',false); return; }
    if(st.m==='ecke'){
      if(st.ecke&&st.ecke.t>2.2){ ctl.tippe('KeyE'); ctl.verb('Ecke weiter (E)'); }
      return;
    }
    if(st.m==='mini'){
      ctl.halte('KeyD',false); ctl.halte('KeyA',false);
      const m=st.mini;
      if(!miniPlan||miniPlan.t0!==m.t0||miniPlan.mitte!==m.mitte){
        const fenster=ctl.E('aktuellesFenster()'), tempo=ctl.E('aktuellesTempo()'), breite=ctl.E('TUNE.minigameBreite');
        /* erster Durchgang des Markers durch die Mitte (Dreieckswelle) */
        const tMitte=m.mitte/tempo;
        const fehler=mini==='profi'?0:W.normal(r,0,0.07);
        miniPlan={t0:m.t0,mitte:m.mitte,druck:m.t0+Math.max(0.12,tMitte+fehler),fenster,breite};
      }
      if(st.st+W.DT>=miniPlan.druck&&!miniPlan.weg){
        miniPlan.weg=true; const vr=m.r, vf=m.f;
        ctl.tippe('KeyE'); z.miniDruck={vr,vf};
      }
      return;
    }
    if(z.miniDruck&&st.m!=='mini'){ z.miniDruck=null; }
    if(st.m==='kloppe'){ return kloppeBot(st,ctl,r,z); }
    if(st.m!=='spiel') return;
    if(stil==='nichtstun') return;
    /* troedler: erst 30 s Laufzeit am Eingang hin und her (die Club-Uhr laeuft nur beim Gehen) */
    if(stil==='stellen'&&st.mv.wut){ ctl.halte('KeyD',false); ctl.halte('KeyA',false); return; }   // wartet, bis Marvin da ist
    if((stil==='troedler'||stil==='stellen')&&st.zeit<30){ const nach=(Math.floor(st.zeit/2.5)%2===0); ctl.halte('KeyD',nach); ctl.halte('KeyA',!nach); return; }
    /* naechstes Ziel */
    if(!ziel){
      while(plan.length){
        const k=plan[0];
        if(['mia','sophie','kira'].includes(k)){
          const idx=['mia','sophie','kira'].indexOf(k);
          if(st.ziele.split(',')[idx]!=='offen'){ plan.shift(); continue; }
        }
        break;
      }
      if(!plan.length) return;
      ziel=plan[0]; zielSeit=ctl.t; drueckeVersuche=0;
    }
    const zx=ORTE[ziel], dx=zx-st.x;
    if(Math.abs(dx)>3){
      ctl.halte('KeyD',dx>0); ctl.halte('KeyA',dx<0);
      if(!z.laeuft){ ctl.verb('Laufen'); z.laeuft=true; }
      return;
    }
    ctl.halte('KeyD',false); ctl.halte('KeyA',false); z.laeuft=false;
    if(ctl.t<wartenBis) return;
    if(['mia','sophie','kira'].includes(ziel)&&st.ziele.split(',')[['mia','sophie','kira'].indexOf(ziel)]!=='offen'){ plan.shift(); ziel=null; return; }
    if(ziel==='bar'&&stil==='trinker'&&st.pegel<200){ plan.push('bar'); }
    /* E druecken - was passiert, sieht man am naechsten Bild */
    const vorher={ziele:st.ziele,mel:st.mel,m:st.m};
    ctl.tippe('KeyE'); drueckeVersuche++;
    ctl.verb('E am Ziel',ziel);
    wartenBis=ctl.t+0.6;
    /* Personen: fertig, sobald ihr Stand nicht mehr offen ist; Dinge: nach einem Druck */
    if(!['mia','sophie','kira'].includes(ziel)||drueckeVersuche>=4){ plan.shift(); ziel=null; }
  };
}

function kloppeBot(st,ctl,r,z){
  const ich=st.ich; if(!ich) return;
  const leb=st.geg.map((g,i)=>({...g,i})).filter(g=>g.hp>0);
  if(!leb.length) return;
  leb.sort((a,b)=>Math.abs(a.x-ich.x)-Math.abs(b.x-ich.x));
  const g=leb[0], dx=g.x-ich.x, dt=g.t-ich.t;
  const angreifer=leb.find(x=>x.z==='ausholen');
  ctl.halte('KeyS',dt>0.12&&ich.z==='frei'); ctl.halte('KeyW',dt<-0.12&&ich.z==='frei');
  if(Math.abs(dx)>2&&Math.sign(dx)!==ich.bl&&ich.z==='frei'){ ctl.tippe(dx>0?'KeyD':'KeyA'); return; }
  const gehe=Math.abs(dx)>14&&ich.z==='frei';
  ctl.halte('KeyD',gehe&&dx>0); ctl.halte('KeyA',gehe&&dx<0);
  if(angreifer&&angreifer.zT>=angreifer.d*(1-0.34)+W.normal(r,0.06,0.08)&&!z['k'+angreifer.i+'_'+angreifer.d+'_'+Math.round(st.st*2)]){
    z['k'+angreifer.i+'_'+angreifer.d+'_'+Math.round(st.st*2)]=1; ctl.tippe('KeyE'); ctl.verb('Kloppe: E','Konterversuch'); return;
  }
  if(!angreifer&&Math.abs(dx)<=15&&ich.z==='frei'&&ich.aus>=30&&r()<0.08){ ctl.tippe('KeyE'); ctl.verb('Kloppe: E','Schlag'); }
}

function lauf(stil,seed,opts={}){
  return W.lauf('level5.html',bot(stil,{seed,...opts}),{seed,snapExtra:SNAP,ereignisExtra:extra,maxSek:stil==='nichtstun'?720:900,
    vorher:opts.vorher||''});
}

module.exports={bot,kloppeBot,lauf,SNAP,extra,gut,ORTE,PLAENE};
if(require.main===module){
const zusammen={};
const VORHER={ gereizt:"setzeFlag('marvinGereizt');" };
for(const stil of ['zielstrebig','erkunder','minimal','zufall','tanz','gereizt','troedler','stellen','trinker','nichtstun']){
  const n=stil==='nichtstun'?2:6;
  const liste=[];
  for(let seed=1;seed<=n;seed++){
    const r=lauf(stil,seed,{vorher:VORHER[stil]||''});
    const b=W.bericht(stil,r);
    const ev=r.ev;
    const tSpiel=(ev.find(e=>e.typ==='M'&&e.txt==='intro > spiel')||{t:0}).t;
    const tEnde=(ev.find(e=>e.typ==='M'&&/> cutscene/.test(e.txt)&&!/MARVIN/.test(e.txt)&&e.t>tSpiel&&r.E('S.gewonnen'))||{t:r.t}).t;
    const ende={gewonnen:r.E('S.gewonnen'),faenger:r.E('S.faenger'),erfolge:r.E('S.erfolge'),abfuhren:r.E('S.abfuhren'),
      ziele:r.E("ZIELE.map(z=>z.id+':'+z.stand).join(' ')"),kloppe:r.E('S.kloppeStand'),spielUhr:+r.E('S.zeit').toFixed(1),
      pegel:Math.round(r.E('S.pegel')),marvinHat:r.E('S.marvin.hat.join(",")')};
    const angerannt=ev.filter(e=>e.txt.startsWith('ANGERANNT')).length;
    const mini=ev.filter(e=>e.txt.startsWith('MINISPIEL')).length;
    const miniTreffer=ev.filter(e=>e.txt.startsWith('MINI treffer')).length, miniFehler=ev.filter(e=>e.txt.startsWith('MINI fehler')).length;
    const tanzErgebnis=ev.filter(e=>/(MIA|SOPHIE|KIRA): (Okay\. Du kannst|JA! So muss|Das war\.\.\. mutig|Okay, tanzen ist nicht)/.test(e.txt)).map(e=>/kannst|JA!/.test(e.txt)?'gut':'schlecht').join('+')||'-';
    const ambient=ev.filter(e=>e.typ==='I'&&/MELDUNG (DER DJ|DIE BASS|LICHT GEHT|EIN GLAS|DURCHSAGE|DIE MENGE|NEBEL|JEMAND RUFT|SEMIH: KENN)/.test(e.txt)).length;
    const gespraechE=ev.filter(e=>e.typ==='E').length, gespraechText=ev.filter(e=>e.typ==='I'&&e.txt.startsWith('TEXT')).length;
    const verben={}; for(const [k,v] of Object.entries(r.verben)) verben[k]=Object.keys(v.wirkung).length?v.wirkung:v.n;
    liste.push({seed,gesamtSek:+r.t.toFixed(1),...ende,angerannt,minispiele:mini,miniTreffer,miniFehler,tanzErgebnis,ambient,entscheidungen:gespraechE,textknoten:gespraechText,
      leereHE:b.leereHE,leereH:b.leereH.dauer,leereOhnePlausch:b.leereOhnePlausch.dauer,zuschau:b.zuschauAnteil,zuschauTeile:b.zuschau,verben,anzahl:b.anzahl});
    if(LOG&&seed===1){ console.log('\n==== PROTOKOLL '+stil+' (Seed 1) ===='); console.log(W.protokoll(ev,e=>e.typ!=='X'||!e.txt.startsWith('Laufen')).join('\n')); }
  }
  const m=k=>+(liste.reduce((a,x)=>a+(typeof x[k]==='number'?x[k]:0),0)/liste.length).toFixed(1);
  zusammen[stil]={laeufe:n,gesamtSek:m('gesamtSek'),spielUhr:m('spielUhr'),leereHEmax:Math.max(...liste.map(x=>x.leereHE.dauer)),leereHmittel:+(liste.reduce((a,x)=>a+x.leereH,0)/liste.length).toFixed(1),
    leereHEmittel:+(liste.reduce((a,x)=>a+x.leereHE.dauer,0)/n).toFixed(1),zuschau:m('zuschau'),entscheidungen:m('entscheidungen'),
    textknoten:m('textknoten'),minispiele:m('minispiele'),
    miniTreffer:+(liste.reduce((a,x)=>a+x.miniTreffer,0)/n).toFixed(1),miniFehler:+(liste.reduce((a,x)=>a+x.miniFehler,0)/n).toFixed(1),
    tanzErfolg:liste.map(x=>x.tanzErgebnis).join(' '),angerannt:m('angerannt'),ambient:m('ambient'),erfolge:m('erfolge'),
    kloppe:liste.map(x=>x.kloppe).join(' '),faenger:[...new Set(liste.map(x=>x.faenger))].join(' | '),
    beispiel:liste[0]};
}
console.log(JSON.stringify(zusammen,null,1));
}
