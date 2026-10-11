/* Messung A - Level 2 (level2.html): ein Bot spielt den Abend bei Moritz.
   node docs/gameplay/messung/a-level2.js            Zusammenfassung
   node docs/gameplay/messung/a-level2.js --lauf 0   ein Lauf mit Ereignisprotokoll (--kenner, --klein, --mittel)

   Profile:
     erstspieler  laeuft einmal von links nach rechts und fasst alles an (Leute, Moebel,
                  Kuehlschrank, einmal trinken), erledigt danach den Rest
     kenner       weiss, was gebraucht wird, und geht den kuerzesten Weg
   Wahl am Anfang (MITNEHMEN): alle | klein | mittel | warten (Zeit laeuft ab)
   Kampf: konter-mensch (Reaktionszeit 0,40-0,80 s ab Ausholbeginn, ein Versuch) */
const H=require('./a-helfer.js');
const {ladeLevel,takt,Rekorder,luecken,tonAuswertung,Verben,runde,median,mittel}=H;

const argv=process.argv.slice(2);
const EINZEL=argv.includes('--lauf')?parseInt(argv[argv.indexOf('--lauf')+1],10):null;

const EXTRA=`({ erledigt:Object.keys(S.erledigt).filter(k=>S.erledigt[k]).join(','), inv:Object.keys(S.inventar).filter(k=>S.inventar[k]).join(','),
  pegel:S.pegel, reden:S.reden?S.reden.name:null, zeile:S.redeZeile, zeilenTxt:S.reden?(S.reden._zeilen[S.redeZeile]||''):'',
  gz:S.gegner?S.gegner.zustand:null, ghp:S.gegner?S.gegner.hp:null, suchT:S.suchT, minute:S.minute })`;

function lauf(saat,profil,wahl,{protokoll=false}={}){
  const {L,E}=ladeLevel('level2.html',{saat});
  const R=new Rekorder(E,EXTRA);
  R.extraVergleich=(x,a)=>{
    if(x.erledigt!==a.erledigt) R.log('aufgabe','erledigt: '+x.erledigt,'info');
    if(x.inv!==a.inv&&x.inv.length>a.inv.length) R.log('fund','Inventar: '+x.inv,'info');
    for(const g of [35,55,70]) if(x.pegel>=g&&a.pegel<g) R.log('pegel','Pegel ueber '+g,'info');
    if(x.reden&&(x.reden!==a.reden||x.zeile!==a.zeile)) R.log('reden',x.reden+': '+x.zeilenTxt,x.zeile===0&&x.reden!==a.reden?'info':'info');
    if(x.gz==='wind'&&a.gz!=='wind') R.log('kampf','Gegner holt aus','herausforderung');
    if(x.gz==='getroffen'&&a.gz!=='getroffen') R.log('kampf','Konter sitzt (Gegner-HP '+x.ghp+')','info');
  };
  const V=new Verben();
  const fp=()=>JSON.stringify(E('[S.modus,S.meldung,S.meldungT>0,S.reden?S.reden.name+S.redeZeile:null,S.suchT>0,GESPR?GESPR.name:null,S.pegel|0,JSON.stringify(S.inventar),JSON.stringify(S.erledigt),S.gegner?S.gegner.hp+S.gegner.zustand:null]'));
  const offen=[];
  const halte={};
  const druecke=(code,verb)=>{ const f=fp(); L.taste(code,true); halte[code]=2; if(verb) offen.push({verb,t:R.uhr,fp:f}); };
  let ged={l:false,r:false};
  const setze=(l,r)=>{ if(l!==ged.l||r!==ged.r){ E(`linksAn=${l}; rechtsAn=${r}`); ged={l,r}; } };

  R.schritt(); druecke('Space','start');
  let leseT=0, redeT=0, wahlT=0, letzte=-9, startSpiel=null, kampfStart=null, kampfEnde=null, cutStart=null, ende=null;
  const besucht=new Set(); let getrunkenErkunden=false;
  let windSeit=null, windZiel=null, windGedrueckt=false, kampfVersuche=0, kampfTreffer=0;
  const rng=L.rng;
  const anteil={reden:0,suchen:0,laufen:0,tuerWarten:0,stehen:0}; let ersteTuer=null;
  for(let i=0;i<60*400;i++){
    for(const c of Object.keys(halte)){ if(--halte[c]<=0){ L.taste(c,false); delete halte[c]; } }
    if(ged.l||ged.r) V.halte('laufen',H.DT);
    takt(E);
    const {s,x}=R.schritt();
    for(let k=offen.length-1;k>=0;k--){ const o=offen[k]; if(R.uhr-o.t>=3/60){ V.druck(o.verb,o.t,fp()!==o.fp); offen.splice(k,1); } }
    if(s.modus==='spiel'&&startSpiel===null) startSpiel=R.uhr;
    if(s.modus==='kampf'&&kampfStart===null) kampfStart=R.uhr;
    if(s.modus==='cutscene'&&cutStart===null){ cutStart=R.uhr; kampfEnde=R.uhr; }
    if(s.modus==='ende'){ ende=E('({gewonnen:S.gewonnen,zeit:S.zeit,faenger:S.faenger,hp:S.hp,pegel:S.pegel})'); break; }
    if(s.kapitel||s.moment||s.modus==='intro'||s.modus==='cutscene'){ setze(false,false); continue; }

    if(s.gespr){
      setze(false,false);
      if(s.gesprWahlen.length){
        wahlT+=H.DT;
        if(s.gespr==='start'&&s.gesprWer==='MAX FERDI'){
          /* MITNEHMEN: Wahl nach 3 s Bedenkzeit, oder bewusst warten */
          if(wahl!=='warten'&&wahlT>3){
            const idx={alle:0,klein:1,mittel:2}[wahl];
            const cur=E('GESPR.gewaehlt');
            if(cur!==idx){ E(`gespraechWaehle(${idx>cur?1:-1})`); V.druck('gespraech-auswahl',R.uhr,true); }
            else { druecke('KeyE','gespraech-waehlen'); wahlT=0; }
          }
        } else if(wahlT>2.5){ druecke('KeyE','gespraech-waehlen'); wahlT=0; }   // Kartons: erste Wahl ("Was ist da drin?")
      } else { leseT+=H.DT; if(leseT>0.6+s.gesprText.length/16){ druecke('KeyE','gespraech-weiter'); leseT=0; } }
      continue;
    } else { leseT=0; wahlT=0; }

    if(s.modus==='kampf'){
      setze(false,false);
      const g=E('S.gegner?{z:S.gegner.zustand,t:S.gegner.t}:null');
      if(g&&g.z==='wind'){
        if(windSeit===null){ windSeit=R.uhr; windZiel=0.40+rng()*0.40; windGedrueckt=false; }
        if(!windGedrueckt&&R.uhr-windSeit>=windZiel){ windGedrueckt=true; kampfVersuche++; druecke('KeyE','kontern'); }
      } else windSeit=null;
      continue;
    }
    if(s.modus!=='spiel') { setze(false,false); continue; }
    /* Zeitanteile in der freien Spielphase */
    if(x.reden||s.gespr) anteil.reden+=H.DT; else if(x.suchT>0) anteil.suchen+=H.DT;
    else if(ersteTuer!==null) anteil.tuerWarten+=H.DT; else if(ged.l||ged.r) anteil.laufen+=H.DT; else anteil.stehen+=H.DT;

    /* Zeilen-Gespraech (S.reden): lesen, dann E */
    if(x.reden){ setze(false,false); redeT+=H.DT; if(redeT>0.5+x.zeilenTxt.length/16){ druecke('KeyE','reden-weiter'); redeT=0; } continue; } else redeT=0;
    if(x.suchT>0){ setze(false,false); continue; }

    const st=E(`({x:S.x,pegel:S.pegel,inv:{...S.inventar},erl:{...S.erledigt},durch:{...S.durchsucht},aufg:aktiveAufgaben().map(a=>a.id),alle:alleFertig(),kartons:S.kartons,moment:MOMENT.hat(2)})`);
    const offenA=st.aufg.filter(a=>!st.erl[a]);
    /* Ziele */
    const DING={box:186,tisch:336,kuehl:436,getraenk:506,spuele:551,bett:646,pinnwand:676,schrank:706,regal:756,kartons:776,spiegel:826,sofa:256};
    const LEUTE={max:150,schlaefer:256,moritz:606,telefon:920};
    let ziel=null, verb='';
    if(profil==='erstspieler'){
      /* Erkunden: alles einmal anfassen, von links nach rechts */
      const liste=[['p','max'],['d','box'],['p','schlaefer'],['d','tisch'],['d','kuehl'],['d','getraenk'],['d','spuele'],['p','moritz'],['d','bett'],['d','pinnwand'],['d','schrank'],['d','regal'],['d','kartons'],['d','spiegel'],['p','telefon']];
      for(const [art,id] of liste){ if(!besucht.has(id)){ ziel={x:art==='p'?LEUTE[id]:DING[id],id,art}; break; } }
    }
    if(!ziel){
      /* Erledigen */
      const suchbar=['box','tisch','spuele','bett','schrank','regal'].filter(d=>!st.durch[d]);
      const kand=[];
      if(st.inv.ausweis&&!st.erl.ausweis) kand.push({x:LEUTE.moritz,id:'moritz',art:'p'});
      if(offenA.includes('schlaefer')){
        if(st.inv.dose) kand.push({x:LEUTE.schlaefer,id:'schlaefer',art:'p'});
        else kand.push({x:DING.kuehl,id:'kuehl',art:'d'});
      }
      if((!st.inv.jacke&&!st.erl.jacke)||(!st.inv.ausweis&&!st.erl.ausweis)) for(const d of suchbar) kand.push({x:DING[d],id:d,art:'d'});
      if(offenA.includes('telefon')){
        if(st.pegel<40) kand.push({x:DING.getraenk,id:'getraenk',art:'d'});
        else kand.push({x:LEUTE.telefon,id:'telefon',art:'p'});
      }
      if(!kand.length&&st.alle) ziel={x:40,id:'tuer',art:'t'};
      else if(kand.length){ kand.sort((a,b)=>Math.abs(a.x-st.x)-Math.abs(b.x-st.x)); ziel=kand[0]; }
      /* David braucht Pegel: trinken hat Vorrang, wenn er das Letzte ist */
      if(offenA.length===1&&offenA[0]==='telefon') ziel=st.pegel<40?{x:DING.getraenk,id:'getraenk',art:'d'}:{x:LEUTE.telefon,id:'telefon',art:'p'};
    }
    if(!ziel){ setze(false,false); continue; }
    const d=ziel.x-st.x;
    if(Math.abs(d)<3){
      setze(false,false);
      if(R.uhr-letzte>0.35){ letzte=R.uhr;
        const vb=ziel.art==='p'?'reden':ziel.art==='t'?'tuer-raus':ziel.id==='getraenk'?'trinken':ziel.id==='kuehl'?'nehmen':
          ['pinnwand'].includes(ziel.id)?'foto':ziel.id==='kartons'?'kartons':ziel.id==='spiegel'?'spiegel':'durchsuchen';
        druecke('KeyE',vb); if(vb==='tuer-raus'&&ersteTuer===null) ersteTuer=R.uhr;
        if(profil==='erstspieler'&&!besucht.has(ziel.id)){ besucht.add(ziel.id); }
      }
      continue;
    }
    setze(d<0,d>0);
  }
  const ev=R.ev;
  return { saat,profil,wahl, ende, gesamt:R.uhr, startSpiel, spielzeit:ende?ende.zeit:null,
    kampf:kampfStart!=null&&kampfEnde!=null?kampfEnde-kampfStart:null, kampfVersuche,
    vorKampf:kampfStart!=null&&startSpiel!=null?kampfStart-startSpiel:null,
    abspann:cutStart!=null?R.uhr-cutStart:null, anteil, tuerWarten:ersteTuer!=null&&kampfStart!=null?kampfStart-ersteTuer:null,
    luecken:luecken(ev,{von:startSpiel||0,bis:kampfStart||cutStart||R.uhr}),
    lueckenKampf:kampfStart!=null?luecken(ev,{von:kampfStart,bis:kampfEnde||R.uhr,top:1}):null,
    verben:V.zusammen(), ton:tonAuswertung(E,{von:startSpiel||0}), ev:protokoll?ev:null,
    evZahl:Object.fromEntries(['info','quittung','herausforderung','entscheidung','fx'].map(k=>[k,ev.filter(e=>e.klasse===k).length])) };
}

if(EINZEL!==null){
  const profil=argv.includes('--kenner')?'kenner':'erstspieler';
  const wahl=argv.includes('--klein')?'klein':argv.includes('--mittel')?'mittel':argv.includes('--warten')?'warten':'alle';
  const r=lauf(EINZEL,profil,wahl,{protokoll:true});
  for(const e of r.ev) console.log(e.t.toFixed(1).padStart(6)+'  '+e.klasse.padEnd(16)+e.typ.padEnd(10)+e.txt);
  delete r.ev; console.log(JSON.stringify(r,null,1)); return;
}

const alle=[];
for(const profil of ['erstspieler','kenner']) for(const wahl of ['alle','klein','mittel','warten']) for(let saat=0;saat<12;saat++){
  try{ alle.push(lauf(saat,profil,wahl)); }catch(e){ console.log('Ausnahme',profil,wahl,saat,e.message.split('\n')[0]); }
}
console.log('Gruppe'.padEnd(26)+'n  gew  Spielzeit min/med/max   bis Kampf(med) Kampf(med) Gesamt(med) laengsteLeere med/max  Leere-Beispiel');
const G={}; for(const r of alle){ const k=r.profil+' / '+r.wahl; (G[k]=G[k]||[]).push(r); }
for(const [k,rs] of Object.entries(G)){
  const gw=rs.filter(r=>r.ende&&r.ende.gewonnen), sz=gw.map(r=>r.spielzeit), lz=rs.map(r=>r.luecken[0]?r.luecken[0].dauer:0);
  console.log(k.padEnd(26)+String(rs.length).padEnd(3)+String(gw.length).padEnd(5)
    +(sz.length?[Math.min(...sz),median(sz),Math.max(...sz)].map(v=>runde(v)).join(' / '):'-').padEnd(24)
    +String(runde(median(rs.map(r=>r.vorKampf||0)))).padEnd(15)+String(runde(median(rs.map(r=>r.kampf||0)))).padEnd(11)
    +String(runde(median(gw.map(r=>r.gesamt)))).padEnd(12)+(runde(median(lz))+' / '+runde(Math.max(...lz))).padEnd(21)
    +(rs[0].luecken[0]?rs[0].luecken[0].vorher.slice(0,40)+' -> '+rs[0].luecken[0].nachher.slice(0,40):''));
}
const A={reden:0,suchen:0,laufen:0,tuerWarten:0,stehen:0}; for(const r of alle) for(const k in A) A[k]+=r.anteil[k];
const summe=Object.values(A).reduce((p,c)=>p+c,0);
console.log('\nZeitanteile der freien Spielphase (alle Laeufe): '+Object.entries(A).map(([k,v])=>k+' '+runde(100*v/summe)+' %').join(', '));
console.log('An der Tuer warten bis zum Kampf (E gedrueckt, nichts passiert): Median '+runde(median(alle.filter(r=>r.tuerWarten!=null).map(r=>r.tuerWarten)))+' s, max '+runde(Math.max(...alle.filter(r=>r.tuerWarten!=null).map(r=>r.tuerWarten)))+' s');
const gr={}; for(const r of alle){ const k=r.ende?(r.ende.gewonnen?'gewonnen':r.ende.faenger):'kein Ende'; gr[k]=(gr[k]||0)+1; }
console.log('\nEnden:',JSON.stringify(gr));
console.log('Kampf: Versuche je Kampf (Median) '+median(alle.filter(r=>r.kampf).map(r=>r.kampfVersuche))+', Dauer min/med/max '+[Math.min(...alle.filter(r=>r.kampf).map(r=>r.kampf)),median(alle.filter(r=>r.kampf).map(r=>r.kampf)),Math.max(...alle.filter(r=>r.kampf).map(r=>r.kampf))].map(v=>runde(v)).join(' / ')+' s');
const vg={}, hg={};
for(const r of alle){ for(const [k,v] of Object.entries(r.verben.druecke)){ vg[k]=vg[k]||{n:0,w:0}; vg[k].n+=v.n; vg[k].w+=v.mitWirkung; } for(const [k,v] of Object.entries(r.verben.halten)) hg[k]=(hg[k]||0)+v; }
console.log('\nVerben (Summe ueber '+alle.length+' Laeufe):');
for(const [k,v] of Object.entries(vg).sort((a,b)=>b[1].n-a[1].n)) console.log('  '+k.padEnd(20)+String(v.n).padEnd(6)+String(v.w).padEnd(6)+'je Lauf '+runde(v.n/alle.length));
console.log('Gehalten: '+JSON.stringify(Object.fromEntries(Object.entries(hg).map(([k,v])=>[k,runde(v)]))));
const t0=alle[0].ton;
console.log('\nMusik: Tonvorrat '+JSON.stringify(t0.tonvorrat)+' Stimmen '+JSON.stringify(t0.stimmen)+' Periode '+t0.periodeNoten+' Noten  SFX/min (Median) '+runde(median(alle.map(r=>r.ton.sfxProMin)))+'  Arten '+JSON.stringify(t0.sfxArten.slice(0,8)));
console.log('Ereignisse je Lauf (Mittel): '+JSON.stringify(Object.fromEntries(['info','quittung','herausforderung','entscheidung','fx'].map(k=>[k,runde(mittel(alle.map(r=>r.evZahl[k])))]))));
const ll=[]; for(const r of alle) for(const l of r.luecken) ll.push({...l,g:r.profil+'/'+r.wahl,s:r.saat});
ll.sort((a,b)=>b.dauer-a.dauer);
console.log('\nLaengste Leeren (vor dem Kampf):'); ll.slice(0,6).forEach(l=>console.log('  '+l.dauer+' s ('+l.g+' '+l.s+')  '+l.vorher.slice(0,50)+'  ->  '+l.nachher.slice(0,50)));
