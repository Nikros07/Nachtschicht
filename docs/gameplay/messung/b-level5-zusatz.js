/* Messung B - Level 5 (Club), Zusatzmessungen.
   node docs/gameplay/messung/b-level5-zusatz.js

   A  Club-Uhr, Marvin, Ambiente, Stroboskop und Eingaben je Sekunde fuer die
      Spielstile aus b-level5.js (Erstspieler, 6 Seeds)
   B  Die kleine Schlaegerei direkt gestartet: fuenf Bots (profi, mittel,
      anfaenger, haemmern, nichtstun), je 20 Seeds
   C  Auf-Ex bis zum Blackout: wie viele Schluecke, gibt es eine Warnung?
   D  Tanz-Minispiel direkt gestartet: Dauer und Ausgang je Treffgenauigkeit
   Aendert keine Spieldatei. */
'use strict';
const W=require('./b-werkzeug.js');
const B5=require('./b-level5.js');

const aus={};

/* ---------- A: Uhr, Marvin, Ambiente, Stroboskop, Eingaben ---------- */
{
  const SNAP2=B5.SNAP+`, minute:S.minute`;
  const tab={};
  for(const stil of ['zielstrebig','erkunder','tanz','zufall','minimal','troedler']){
    const liste=[];
    for(let seed=1;seed<=6;seed++){
      const z={flaecheT:0,dunkelPhasen:0,warDunkel:false,spielT:0,eingaben:0,richtungsWechsel:0,letzteRichtung:0,ambient:0,anger:0};
      const extra=(v,j,ev,t)=>{
        B5.extra(v,j,ev,t);
        if(j.m==='spiel'&&!j.g&&!j.kap&&!j.mom){   /* freies Spiel: kein Gespraech, keine Karte */
          z.spielT+=W.DT;
          if(j.ort==='TANZFLAECHE'){ z.flaecheT+=W.DT;
            const d=j.dunkel>0.45; if(d&&!z.warDunkel) z.dunkelPhasen++; z.warDunkel=d; }
          else z.warDunkel=false;
          const r=Math.sign(j.x-v.x); if(r&&r!==z.letzteRichtung){ z.richtungsWechsel++; z.letzteRichtung=r; }
        }
        if(j.melT>v.melT+1e-6&&/^(DER DJ|DIE BASS|LICHT GEHT|EIN GLAS|DURCHSAGE|DIE MENGE|NEBEL|JEMAND RUFT|SEMIH: KENN)/.test(j.mel)) z.ambient++;
        if(j.stolp>v.stolp+0.5) z.anger++;
      };
      const r=W.lauf('level5.html',B5.bot(stil,{seed}),{seed,snapExtra:SNAP2,ereignisExtra:extra,maxSek:900});
      const eSpiel=r.ev.filter(e=>e.typ==='X'&&/^E am Ziel/.test(e.txt)).length;
      liste.push({seed,gesamt:r.t,uhr:r.E('S.zeit'),minute:r.E('S.minute'),marvinDa:r.E('S.marvin.da'),marvinHat:r.E('S.marvin.hat.length'),
        ambient:z.ambient,flaecheT:z.flaecheT,dunkelPhasen:z.dunkelPhasen,anger:z.anger,spielT:z.spielT,
        eingabenProSek:(eSpiel+z.richtungsWechsel)/Math.max(1e-9,z.spielT),
        kloppe:r.E('S.kloppeStand')});
    }
    const m=k=>+(liste.reduce((a,x)=>a+(+x[k]),0)/liste.length).toFixed(2);
    const fmtUhr=min=>{ const h=Math.floor(min/60)%24, mm=Math.floor(min%60); return h+':'+String(mm).padStart(2,'0'); };
    tab[stil]={gesamtSek:m('gesamt'),clubUhrSek:m('uhr'),uhrAnteilProzent:+(m('uhr')/600*100).toFixed(1),
      uhrzeitAmEnde:fmtUhr(m('minute')),marvinGesehen:liste.filter(x=>x.marvinDa).length+'/'+liste.length,
      marvinNimmt:m('marvinHat'),ambientMeldungen:m('ambient'),zeitAufTanzflaeche:m('flaecheT'),dunkelPhasen:m('dunkelPhasen'),
      angerannt:m('anger'),freiesSpielSek:m('spielT'),eingabenProSekImFreienSpiel:m('eingabenProSek'),
      schlaegerei:[...new Set(liste.map(x=>x.kloppe))].join('/')};
  }
  aus.A_uhrMarvinAmbiente=tab;
}

/* ---------- B: Schlaegerei direkt ---------- */
{
  /* Lauf mit Mitschnitt der eigenen Lebenspunkte (nach dem Kampf ist S.ich weg) */
  function lauf2(art,seed){
    let minHp=5, angriffe=0;
    const SN=B5.SNAP;
    const r=W.zufall(seed*7919+11); const z={}; let naechster=0; const reakt={};
    const ext=(v,j)=>{ if(j.m==='kloppe'&&j.ich){ if(j.ich.hp<minHp) minHp=j.ich.hp;
      j.geg.forEach((g,i)=>{ const a=v.geg[i]; if(g.z==='ausholen'&&a&&a.z!=='ausholen') angriffe++; }); } };
    const ich0=(st,ctl,g)=>{ const ich=st.ich; if(g&&Math.abs(g.x-ich.x)>2&&Math.sign(g.x-ich.x)!==ich.bl&&ich.z==='frei') ctl.tippe(g.x>ich.x?'KeyD':'KeyA'); };
    const bot=(st,ctl)=>{
      if(st.m!=='kloppe') return st.st>1?'fertig':undefined;
      const ich=st.ich; if(!ich) return;
      const leb=st.geg.map((g,i)=>({...g,i})).filter(g=>g.hp>0).sort((a,b)=>Math.abs(a.x-ich.x)-Math.abs(b.x-ich.x));
      if(!leb.length) return;
      if(art==='nichtstun') return;
      if(art==='mittel') return B5.kloppeBot(st,ctl,r,z);
      if(art==='profi'){
        const g=leb[0], dt=g.t-ich.t;
        ctl.halte('KeyS',dt>0.12&&ich.z==='frei'); ctl.halte('KeyW',dt<-0.12&&ich.z==='frei');
        ich0(st,ctl,g);
        const an=leb.find(x=>x.z==='ausholen');
        if(an&&an.zT>=an.d*(1-0.34)+0.04&&!z['p'+an.i+'_'+Math.round(st.st*2)]){ z['p'+an.i+'_'+Math.round(st.st*2)]=1; ctl.tippe('KeyE'); }
        return;
      }
      if(art==='anfaenger'){
        for(const g of leb){ const k='a'+g.i;
          if(g.z==='ausholen'){ if(!reakt[k]) reakt[k]=st.st+Math.max(0.15,W.normal(r,0.3,0.08));
            if(reakt[k]>0&&st.st>=reakt[k]){ ctl.tippe('KeyE'); reakt[k]=-1; } }
          else reakt[k]=0; }
        ich0(st,ctl,leb[0]); return;
      }
      if(art==='haemmern'){ if(st.st>=naechster){ ctl.tippe('KeyE'); naechster=st.st+0.15; } ich0(st,ctl,leb[0]); }
    };
    const res=W.lauf('level5.html',bot,{seed,snapExtra:SN,ereignisExtra:ext,maxSek:120,
      vorher:"starte(); S.modus='spiel'; S.x=420; starteKloppe();",stopp:(j)=>j.m!=='kloppe'});
    return {dauer:res.t,stand:res.E('S.kloppeStand'),hpWeg:5-minHp,angriffe};
  }
  const tab={};
  for(const art of ['profi','mittel','anfaenger','haemmern','nichtstun']){
    const l=[]; for(let s=1;s<=20;s++) l.push(lauf2(art,s));
    const m=k=>+(l.reduce((a,x)=>a+x[k],0)/l.length).toFixed(2);
    tab[art]={laeufe:l.length,siege:l.filter(x=>x.stand==='gewonnen').length,dauerSek:m('dauer'),
      dauerMin:+Math.min(...l.map(x=>x.dauer)).toFixed(2),dauerMax:+Math.max(...l.map(x=>x.dauer)).toFixed(2),
      herzenWeg:m('hpWeg'),gegnerAngriffe:m('angriffe')};
  }
  aus.B_schlaegerei=tab;
}

/* ---------- C: Auf-Ex bis zum Blackout ---------- */
{
  const tab={};
  for(const start of [0,30,60]){
    const {L,E}=W.oeffne('level5.html',{seed:3,vorher:`localStorage.setItem(PEGEL_KEY,'${start}');`});
    E("starte(); S.modus='spiel'; S.x=690; S.tiefe=0.2;");
    const meld=new Set(); let ex=0, t=0, schluck=[];
    for(let i=0;i<60*120&&E('S.modus')!=='ende';i++){
      const m=E('S.modus');
      if(m==='spiel'){ L.taste('KeyE',true); L.taste('KeyE',false); ex++; schluck.push(Math.round(E('S.pegel'))); }
      if(m==='mini'){ /* trifft immer: warten bis der Marker in der Mitte ist */
        const ok=E('(function(){const mm=S.mini;const p=markerPos(S.t-mm.t0,aktuellesTempo(),TUNE.minigameBreite);return Math.abs(p-mm.mitte)<=aktuellesFenster()/2-1;})()');
        if(ok){ L.taste('KeyE',true); L.taste('KeyE',false); }
      }
      E('update(1/60)'); t+=1/60;
      const mm=E('S.meldungT>0?S.meldung:""'); if(mm) meld.add(mm);
    }
    tab['startPegel'+start]={aufEx:ex,pegelVorJedemSchluck:schluck,sekunden:+t.toFixed(1),ende:E('S.faenger'),meldungen:[...meld]};
  }
  aus.C_aufExBlackout=tab;
}

/* ---------- D: Tanz-Minispiel ---------- */
{
  const tab={};
  for(const [name,sigma] of [['profi',0],['mittel',0.07],['wackelig',0.12],['anfaenger',0.18]]){
    const l=[];
    for(let seed=1;seed<=20;seed++){
      const {L,E}=W.oeffne('level5.html',{seed});
      const r=W.zufall(seed*31+5);
      E("starte(); S.modus='spiel'; S.x=330; starteMinigame('tanz',ZIELE[0]);");
      let t=0, plan=null;
      for(let i=0;i<60*60&&E('S.modus')==='mini';i++){
        const m=E('({t0:S.mini.t0,mitte:S.mini.mitte,st:S.t,tempo:aktuellesTempo()})');
        if(!plan||plan.t0!==m.t0){ plan={t0:m.t0,druck:m.t0+Math.max(0.12,m.mitte/m.tempo+W.normal(r,0,sigma)),weg:false}; }
        if(!plan.weg&&m.st+1/60>=plan.druck){ plan.weg=true; L.taste('KeyE',true); L.taste('KeyE',false); }
        E('update(1/60)'); t+=1/60;
      }
      const knoten=E('GESPR&&GESPR.knoten?GESPR.knoten.text:""');
      l.push({dauer:t,gut:/kannst|JA!/.test(knoten)||E('S.confidenceT>0')});
    }
    tab[name]={laeufe:l.length,erfolg:l.filter(x=>x.gut).length,dauerSek:+(l.reduce((a,x)=>a+x.dauer,0)/l.length).toFixed(2)};
  }
  aus.D_tanzMinispiel=tab;
}

console.log(JSON.stringify(aus,null,1));
