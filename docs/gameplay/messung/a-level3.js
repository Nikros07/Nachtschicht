/* Messung A - Level 3 (level3.html): Sprint zur Haltestelle, dann der Bus.
   node docs/gameplay/messung/a-level3.js            Zusammenfassung
   node docs/gameplay/messung/a-level3.js --lauf 0   ein Lauf mit Protokoll
        (--nurrechts | --vorsichtig | --redner) (--nichtspringen) (--kampf | --zahlen)

   Sprint:  springer (Leertaste vor jedem Hindernis) | nichtspringen (nur rechts halten)
   Bus:     nurrechts (rechts halten, nie verstecken, nie reden)
            vorsichtig (versteckt sich, wenn ein Kontrolleur herschaut und nah ist)
            redner (redet mit jedem: Automat kaufen, den Lauten aufstacheln, Frau ehrlich, Jonas einladen)
   Die Drei: warten (Zeit laeuft ab) | kampf ("Dann macht doch was.") | zahlen
   Kloppe:   Konter-Bot (kontert im Fenster, blockt davor, schlaegt sonst) */
const H=require('./a-helfer.js');
const {ladeLevel,takt,Rekorder,luecken,tonAuswertung,Verben,runde,median,mittel}=H;
const argv=process.argv.slice(2);
const EINZEL=argv.includes('--lauf')?parseInt(argv[argv.indexOf('--lauf')+1],10):null;

const EXTRA=`({ getroffen:S.hindernisse.filter(h=>h.getroffen).length, inSicht:S.hindernisse.filter(h=>h.x>S.kamX&&h.x<S.kamX+W).length,
  naechstesH:(S.hindernisse.find(h=>h.x+4>S.x)||{x:-1}).x,
  verdacht:S.verdacht, alarm:S.kontrolleure.filter(k=>k.alarm>0).length, versteckt:S.versteckt, ruckel:S.ruckelT>0,
  waggon:S.x<TUNE.waggonGrenzen[0]?1:S.x<TUNE.waggonGrenzen[1]?2:3, ticket:S.ticket, kloppe:S.kloppeStand,
  gAus:(S.gegner||[]).filter(g=>g.hp>0&&g.zustand==='ausholen').length, gHp:(S.gegner||[]).reduce((p,g)=>p+Math.max(0,g.hp),0),
  ichHp:S.ich?S.ich.hp:null, sprintRest:TUNE.sprintSekunden-S.sprintZeit, ablenk:S.ablenkT>0 })`;

function lauf(saat,sprintP,busP,dreiP,{protokoll=false}={}){
  const {L,E}=ladeLevel('level3.html',{saat});
  const R=new Rekorder(E,EXTRA);
  let gesehenH=new Set();
  R.extraVergleich=(x,a,s)=>{
    if(s.modus==='sprint'){
      if(x.naechstesH>0&&!gesehenH.has(x.naechstesH)&&x.naechstesH-E('S.kamX')<E('W')){ gesehenH.add(x.naechstesH); R.log('sprint','Hindernis kommt ins Bild','herausforderung'); }
      if(x.getroffen>a.getroffen) R.log('sprint','gestolpert','quittung');
    }
    if(x.alarm>a.alarm) R.log('bus','Kontrolleur alarmiert','herausforderung');
    if(x.verdacht>=70&&a.verdacht<70) R.log('bus','Verdacht ueber 70','herausforderung');
    if(x.versteckt&&!a.versteckt) R.log('bus','versteckt','quittung');
    if(x.ruckel&&!a.ruckel) R.log('bus','Bus ruckelt','quittung');
    if(x.waggon!==a.waggon&&s.modus==='spiel') R.log('ort','Waggon '+x.waggon,'quittung');
    if(x.ablenk&&!a.ablenk) R.log('bus','Ablenkung laeuft','info');
    if(x.gAus>a.gAus) R.log('kloppe','Gegner holt aus','herausforderung');
    if(x.gHp<a.gHp) R.log('kloppe','Treffer am Gegner (Rest-HP '+x.gHp+')','info');
    if(x.ichHp!=null&&a.ichHp!=null&&x.ichHp<a.ichHp) R.log('kloppe','Treffer eingesteckt','herausforderung');
  };
  const V=new Verben();
  const fp=()=>JSON.stringify(E('[S.modus,S.meldung,S.meldungT>0,S.versteckt,GESPR?GESPR.name:null,S.vy<0,S.ich?S.ich.zustand+S.ich.t.toFixed(2):null,(S.gegner||[]).map(g=>g.hp+g.zustand).join()]'));
  const offen=[], halte={};
  const druecke=(code,verb)=>{ const f=fp(); L.taste(code,true); halte[code]=2; if(verb) offen.push({verb,t:R.uhr,fp:f}); };
  let ged={l:false,r:false,h:false,u:false,b:false};
  const setze=(l,r,h=false,u=false,b=false)=>{ if(l!==ged.l||r!==ged.r||h!==ged.h||u!==ged.u||b!==ged.b){
    E(`linksAn=${l}; rechtsAn=${r}; hochAn=${h}; runterAn=${u}; S.blockAn=${b}`); ged={l,r,h,u,b}; } };

  R.schritt(); druecke('Space','start');
  let leseT=0, wahlT=0, letzte=-9, t0={}, ende=null, versteckT=0, schlagT=0;
  const geredet=new Set();
  for(let i=0;i<60*400;i++){
    for(const c of Object.keys(halte)){ if(--halte[c]<=0){ L.taste(c,false); delete halte[c]; } }
    if(ged.l||ged.r) V.halte('laufen',H.DT); if(ged.b) V.halte('blocken',H.DT);
    takt(E);
    const {s,x}=R.schritt();
    for(let k=offen.length-1;k>=0;k--){ const o=offen[k]; if(R.uhr-o.t>=3/60){ V.druck(o.verb,o.t,fp()!==o.fp); offen.splice(k,1); } }
    for(const m of ['sprint','spiel','kloppe','cutscene']) if(s.modus===m&&t0[m]==null) t0[m]=R.uhr;
    if(s.modus!=='sprint'&&t0.sprint!=null&&t0.sprintEnde==null) t0.sprintEnde=R.uhr;
    if(s.modus==='spiel'&&t0.kloppe!=null&&t0.kloppeEnde==null) t0.kloppeEnde=R.uhr;
    if(s.modus==='ende'){ ende=E('({gewonnen:S.gewonnen,zeit:S.zeit,faenger:S.faenger,hp:S.hp,sprintZeit:S.sprintZeit,busZeit:S.busZeit,kloppe:S.kloppeStand,geld:NACHT.werte.geld})'); break; }
    if(s.kapitel||s.moment||s.modus==='intro'||s.modus==='cutscene'){ setze(false,false); continue; }

    if(s.gespr){
      setze(false,false);
      if(s.gesprWahlen.length){
        wahlT+=H.DT;
        const w=s.gesprWahlen; let ziel=null;
        if(s.gesprWer==='DER MIT DER KAPPE'){
          if(dreiP==='kampf') ziel=w.findIndex(t=>/Dann macht doch was|Hab nichts dabei/.test(t));
          else if(dreiP==='zahlen') ziel=w.findIndex(t=>/^Alles gut|^Hier\./.test(t));
          else ziel=null;   // warten
        } else if(busP==='redner'){
          ziel=w.findIndex(t=>/^Kaufen|kontrolleure suchen|Hab ich auch nicht|Wir gehen feiern|Club\. Der grosse|Ich auch\.|Weiss noch nicht/.test(t));
          if(ziel<0) ziel=0;
        } else ziel=w.findIndex(t=>/Zu teuer|Lass mal|Lieber nicht|Fahre nur heim|Wird schon/.test(t));
        if(ziel!=null&&ziel>=0&&wahlT>2.5){
          const cur=E('GESPR.gewaehlt');
          if(cur!==ziel){ E(`gespraechWaehle(${ziel>cur?1:-1})`); V.druck('gespraech-auswahl',R.uhr,true); }
          else { druecke('KeyE','gespraech-waehlen'); wahlT=0; }
        }
      } else { leseT+=H.DT; if(leseT>0.6+s.gesprText.length/16){ druecke('KeyE','gespraech-weiter'); leseT=0; } }
      continue;
    } else { leseT=0; wahlT=0; }

    if(s.modus==='sprint'){
      setze(false,true);
      if(sprintP==='springer'){
        const st=E('({x:S.x,vx:S.vx,boden:S.amBoden,h:(S.hindernisse.find(h=>!h.getroffen&&h.x+4>S.x)||{x:1e9}).x+4})');
        const d=st.h-st.x;
        if(st.boden&&d>0&&d<Math.max(26,st.vx*0.26)&&R.uhr-letzte>0.3){ letzte=R.uhr; druecke('Space','springen'); }
      }
      continue;
    }

    if(s.modus==='kloppe'){
      const st=E(`({ich:{x:S.ich.x,t:S.ich.t,z:S.ich.zustand,a:S.ich.ausdauer,blick:S.ich.blick},
        g:S.gegner.filter(g=>g.hp>0).map(g=>({x:g.x,t:g.t,z:g.zustand,fen:imKonterfenster(g),reich:g.reichweite}))})`);
      const ich=st.ich;
      const nahe=st.g.map(g=>({...g,d:Math.abs(g.x-ich.x),dt:g.t-ich.t})).sort((a,b)=>a.d-b.d);
      const n=nahe[0]; if(!n){ setze(false,false); continue; }
      const imFenster=nahe.find(g=>g.z==='ausholen'&&g.fen&&g.d<17&&Math.abs(g.dt)<0.22);
      const droht=nahe.find(g=>g.z==='ausholen'&&!g.fen&&g.d<20&&Math.abs(g.dt)<0.25);
      if(imFenster&&ich.z==='frei'){ setze(false,false); druecke('KeyE','kontern'); continue; }
      if(droht){ setze(false,false,false,false,true); continue; }
      const richt=Math.sign(n.x-ich.x)||1;
      const hoch=n.dt<-0.08, runter=n.dt>0.08;
      if(n.d>13) setze(richt<0,richt>0,hoch,runter,false);
      else { setze(false,false,hoch,runter,false); schlagT+=H.DT;
        if(ich.z==='frei'&&ich.a>40&&schlagT>0.6){ schlagT=0; druecke('KeyE','schlagen'); } }
      continue;
    }

    if(s.modus!=='spiel'){ setze(false,false); continue; }
    /* --- Bus --- */
    const st=E(`({x:S.x,versteckt:S.versteckt,verdacht:S.verdacht,
      k:S.kontrolleure.map(k=>({x:k.x,blick:k.blick,alarm:k.alarm})),
      f:FAHRGAESTE.map(f=>({id:f.id,x:f.x})), v:VERSTECKE.map(v=>v.x), foto:!MOMENT.hat(3)})`);
    if(busP==='redner'){
      const f=st.f.find(f=>!geredet.has(f.id)&&f.id!=='notbremse'&&Math.abs(f.x-st.x)<60&&f.x>=st.x-5);
      if(f){
        const d=f.x-st.x;
        if(Math.abs(d)<4){ setze(false,false); if(R.uhr-letzte>0.4){ letzte=R.uhr; geredet.add(f.id); druecke('KeyE',f.id==='automat'?'ticket':'reden'); } continue; }
        setze(d<0,d>0); continue;
      }
    }
    if(st.versteckt){
      setze(false,false); versteckT+=H.DT;
      const gefahr=st.k.some(k=>{ const d=st.x-k.x; return Math.abs(d)<75&&Math.sign(d)===k.blick; });
      if((!gefahr&&versteckT>0.6)||versteckT>12){ druecke('KeyE','auftauchen'); versteckT=0; }
      continue;
    } else versteckT=0;
    if(busP==='vorsichtig'||busP==='redner'){
      /* Kontrolleur vor mir, schaut her, nah -> naechstes Versteck */
      const vorne=st.k.filter(k=>{ const d=k.x-st.x; return d>0&&d<70&&k.blick<0; });
      if(vorne.length&&st.verdacht<100){
        const v=st.v.filter(vx=>vx<=st.x+30).sort((a,b)=>Math.abs(a-st.x)-Math.abs(b-st.x))[0];
        if(v!=null&&Math.abs(v-st.x)<26){ setze(false,false); if(R.uhr-letzte>0.25){ letzte=R.uhr; druecke('KeyE','verstecken'); } continue; }
        if(v!=null&&Math.abs(v-st.x)<80){ setze(v<st.x,v>st.x); continue; }
      }
    }
    setze(false,true);
  }
  const ev=R.ev;
  const sprintL=t0.sprint!=null?luecken(ev,{von:t0.sprint,bis:t0.sprintEnde||R.uhr,top:1}):[];
  const busL=t0.spiel!=null?luecken(ev,{von:t0.spiel,bis:t0.cutscene||R.uhr}):[];
  return { saat,sprintP,busP,dreiP, ende, gesamt:R.uhr,
    sprintDauer:t0.sprint!=null&&t0.sprintEnde!=null?t0.sprintEnde-t0.sprint:null,
    busDauer:t0.spiel!=null?(t0.cutscene||R.uhr)-t0.spiel:null,
    kloppeDauer:t0.kloppe!=null?(t0.kloppeEnde||R.uhr)-t0.kloppe:null,
    abspann:t0.cutscene!=null?R.uhr-t0.cutscene:null, vorSpiel:t0.sprint,
    sprintL, busL, verben:V.zusammen(), ton:tonAuswertung(E,{von:t0.sprint||0}),
    evZahl:Object.fromEntries(['info','quittung','herausforderung','entscheidung','fx'].map(k=>[k,ev.filter(e=>e.klasse===k).length])),
    stolpern:E('S.hindernisse.filter(h=>h.getroffen).length'), erwischt:3-E('S.hp'), ev:protokoll?ev:null };
}

if(EINZEL!==null){
  const sp=argv.includes('--nichtspringen')?'nichtspringen':'springer';
  const bp=argv.includes('--vorsichtig')?'vorsichtig':argv.includes('--redner')?'redner':'nurrechts';
  const dp=argv.includes('--kampf')?'kampf':argv.includes('--zahlen')?'zahlen':'warten';
  const r=lauf(EINZEL,sp,bp,dp,{protokoll:true});
  for(const e of r.ev) console.log(e.t.toFixed(1).padStart(6)+'  '+e.klasse.padEnd(16)+e.typ.padEnd(10)+e.txt);
  delete r.ev; console.log(JSON.stringify(r,null,1)); return;
}

const alle=[];
for(const sp of ['springer','nichtspringen']) for(const bp of ['nurrechts','vorsichtig','redner']) for(const dp of ['warten','kampf','zahlen']) for(let saat=0;saat<8;saat++){
  try{ alle.push(lauf(saat,sp,bp,dp)); }catch(e){ console.log('Ausnahme',sp,bp,dp,saat,e.message.split('\n')[0]); }
}
const G={}; for(const r of alle){ const k=r.sprintP+' / '+r.busP+' / '+r.dreiP; (G[k]=G[k]||[]).push(r); }
console.log('Gruppe'.padEnd(36)+'n  gew Sprint(med) Stolpern Bus(med) Kloppe(med) erwischt Gesamt(med) LeereBus med/max  KloppeStand');
for(const [k,rs] of Object.entries(G)){
  const gw=rs.filter(r=>r.ende&&r.ende.gewonnen); const lb=rs.map(r=>r.busL[0]?r.busL[0].dauer:0);
  const ks={}; for(const r of rs){ const q=r.ende?r.ende.kloppe:'-'; ks[q]=(ks[q]||0)+1; }
  console.log(k.padEnd(36)+String(rs.length).padEnd(3)+String(gw.length).padEnd(4)+String(runde(median(rs.map(r=>r.sprintDauer||0)))).padEnd(12)
    +String(runde(mittel(rs.map(r=>r.stolpern)))).padEnd(9)+String(runde(median(rs.map(r=>r.busDauer||0)))).padEnd(9)
    +String(runde(median(rs.filter(r=>r.kloppeDauer!=null).map(r=>r.kloppeDauer))||0)).padEnd(12)+String(runde(mittel(rs.map(r=>r.erwischt)),2)).padEnd(9)
    +String(runde(median(gw.map(r=>r.gesamt))||0)).padEnd(12)+(runde(median(lb))+' / '+runde(Math.max(...lb))).padEnd(18)+JSON.stringify(ks));
}
const gr={}; for(const r of alle){ const k=r.ende?(r.ende.gewonnen?'gewonnen':r.ende.faenger):'kein Ende'; gr[k]=(gr[k]||0)+1; }
console.log('\nEnden:',JSON.stringify(gr));
const sz=alle.filter(r=>r.ende&&r.ende.sprintZeit).map(r=>r.ende.sprintZeit);
console.log('Sprint: gebrauchte Zeit min/med/max '+[Math.min(...sz),median(sz),Math.max(...sz)].map(v=>runde(v)).join(' / ')+' s von '+34+' s Limit');
const vg={}, hg={};
for(const r of alle){ for(const [k,v] of Object.entries(r.verben.druecke)){ vg[k]=vg[k]||{n:0,w:0}; vg[k].n+=v.n; vg[k].w+=v.mitWirkung; } for(const [k,v] of Object.entries(r.verben.halten)) hg[k]=(hg[k]||0)+v; }
console.log('\nVerben (Summe ueber '+alle.length+' Laeufe):');
for(const [k,v] of Object.entries(vg).sort((a,b)=>b[1].n-a[1].n)) console.log('  '+k.padEnd(20)+String(v.n).padEnd(6)+String(v.w).padEnd(6)+'je Lauf '+runde(v.n/alle.length));
console.log('Gehalten: '+JSON.stringify(Object.fromEntries(Object.entries(hg).map(([k,v])=>[k,runde(v)]))));
const t0=alle[0].ton;
console.log('\nMusik: Tonvorrat '+JSON.stringify(t0.tonvorrat)+' Stimmen '+JSON.stringify(t0.stimmen)+' Periode '+t0.periodeNoten+'  SFX/min (Median) '+runde(median(alle.map(r=>r.ton.sfxProMin))));
console.log('Ereignisse je Lauf (Mittel): '+JSON.stringify(Object.fromEntries(['info','quittung','herausforderung','entscheidung','fx'].map(k=>[k,runde(mittel(alle.map(r=>r.evZahl[k])))]))));
const ll=[]; for(const r of alle) for(const l of r.busL) ll.push({...l,g:r.sprintP+'/'+r.busP+'/'+r.dreiP,s:r.saat});
ll.sort((a,b)=>b.dauer-a.dauer);
console.log('\nLaengste Leeren im Bus:'); ll.slice(0,6).forEach(l=>console.log('  '+l.dauer+' s ('+l.g+' '+l.s+')  '+l.vorher.slice(0,50)+'  ->  '+l.nachher.slice(0,50)));
const sl=[]; for(const r of alle) for(const l of r.sprintL) sl.push(l.dauer);
console.log('Laengste Leere im Sprint (Median ueber Laeufe): '+runde(median(sl))+' s');
