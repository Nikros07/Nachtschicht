/* Messung A - Level 1 (index.html): ein Bot spielt die Schule.
   node docs/gameplay/messung/a-level1.js            Zusammenfassung ueber viele Laeufe
   node docs/gameplay/messung/a-level1.js --lauf 3   ein Lauf mit vollstaendiger Ereignisliste

   Profile:
     vorsichtig  schleicht bei nahen Lehrern, versteckt sich im Spind, sucht Raum fuer Raum
     renner      ignoriert die Lehrer, laeuft direkt zum naechsten Ziel
   Hausmeister-Spielart (50 % der Runden), Unterprofil:
     reden       hingehen und ansprechen (Gespraech laufen lassen)
     werfen      R werfen, dann klauen
     springen    neben ihm springen (Landen macht Laerm) und sofort klauen
   Der Bot kennt nur, was der Spieler kennt: Zettel-Hinweise, Raeume. */
const H=require('./a-helfer.js');
const {ladeLevel,takt,Rekorder,luecken,tonAuswertung,Verben,drueck,runde,median,mittel}=H;

const argv=process.argv.slice(2);
const EINZEL=argv.includes('--lauf')?parseInt(argv[argv.indexOf('--lauf')+1],10):null;

const EXTRA=`({ etage:S.etage, raum:S.raum, imSpind:S.imSpind, key:S.hatSchluessel, stufe:S.hinweisStufe,
  chat:S.chat.length, jagt:S.lehrerJagt, entdeckt:S.entdeckt.size, durchsucht:S.durchsucht.size,
  suchT:S.suchT, code:!!S.codeOffen, akku:S.akku, lampe:S.lampe, erwischt:S.erwischtZahl,
  gesehen:S.lehrer.filter(L=>L.gesehenPiep).length, jagdN:S.lehrer.filter(L=>L.jagd>0).length,
  stromAus:S.stromAus>0, dunkel:S.dunkelT>0, handy:S.handyGeholt, minute:S.minute })`;

function lauf(saat,profil,hmProfil,{protokoll=false}={}){
  const {L,E}=ladeLevel('index.html',{saat});
  const R=new Rekorder(E,EXTRA);
  /* levelspezifische Ereignisse */
  R.extraVergleich=(x,a)=>{
    if(x.etage!==a.etage) R.log('ort','Etage '+(x.etage+1),'quittung');
    if(x.raum!==a.raum&&x.raum!=null) R.log('ort','Raum '+E('RAEUME['+x.raum+'].name'),'quittung');
    if(x.key&&!a.key) R.log('fund','SCHLUESSEL','info');
    if(x.stufe>a.stufe) R.log('fund','Hinweisstufe '+x.stufe,'info');
    if(x.chat>a.chat||(x.chat===3&&false)) R.log('handy','Chatnachricht','info');
    if(x.gesehen>a.gesehen) R.log('gefahr','Lehrer bemerkt dich (Piep)','herausforderung');
    if(x.jagdN>a.jagdN) R.log('gefahr','Jagd beginnt','herausforderung');
    if(x.imSpind>=0&&a.imSpind<0) R.log('aktion','Spind rein','quittung');
    if(x.stromAus&&!a.stromAus) R.log('welt','Strom aus (Sicherung)','info');
    if(x.handy&&!a.handy) R.log('fund','Handy zurueck','info');
  };
  const V=new Verben();
  const halte={};               // code -> Bilder bis zum Loslassen
  const druecke=(code,verb)=>{ const f=verb?fp():null; L.taste(code,true); halte[code]=2; if(verb) offen.push({verb,t:R.uhr,fp:f}); };
  const fp=()=>JSON.stringify(E('[S.modus,S.meldung,S.meldungT>0,S.raum,S.imSpind,S.etage,S.suchT>0,GESPR?GESPR.name:null,S.codeOffen,S.wurf!=null,S.lampe,S.hatSchluessel,S.codeEingabe.join("")]'));
  const offen=[];               // Druecke, deren Wirkung noch geprueft wird
  let gedrueckt={links:false,rechts:false,schleich:false};
  const setze=(links,rechts,schleich)=>{
    if(links!==gedrueckt.links||rechts!==gedrueckt.rechts||schleich!==gedrueckt.schleich){
      E(`linksAn=${links}; rechtsAn=${rechts}; schleichAn=${schleich}`);
      gedrueckt={links,rechts,schleich};
    }
  };

  /* Start: Leertaste auf dem Titelbild, Rekorder laeuft schon */
  R.schritt();
  druecke('Space','start');
  let leseT=0, wahlT=0, fangT=0, versteckT=0, codeSchritte=null, letzteAktion=-9, wurfVersucht=false;
  let startSpiel=null, zeitSchluessel=null, ende=null, cutsceneStart=null, cutsceneEnde=null;
  let suchen=0, suchenLeer=0, sicherungGezogen=false;
  const MAX=60*400;
  for(let i=0;i<MAX;i++){
    /* gehaltene Tasten loslassen */
    for(const c of Object.keys(halte)){ if(--halte[c]<=0){ L.taste(c,false); delete halte[c]; } }
    if(gedrueckt.links||gedrueckt.rechts) V.halte(gedrueckt.schleich?'schleichen':'laufen',H.DT);
    takt(E);
    const {s,x}=R.schritt();
    /* Wirkung der letzten Druecke pruefen (nach 3 Bildern) */
    for(let k=offen.length-1;k>=0;k--){ const o=offen[k]; if(R.uhr-o.t>=3/60){ V.druck(o.verb,o.t,fp()!==o.fp); offen.splice(k,1); } }

    if(s.modus==='spiel'&&startSpiel===null) startSpiel=R.uhr;
    if(s.modus==='cutscene'&&cutsceneStart===null) cutsceneStart=R.uhr;
    if(s.modus==='ende'){ ende=E('({gewonnen:S.gewonnen,zeit:S.zeit,faenger:S.faenger,hp:S.hp})'); if(cutsceneStart!==null) cutsceneEnde=R.uhr; break; }
    if(x.key&&zeitSchluessel===null) zeitSchluessel=R.uhr;
    if(x.stromAus) sicherungGezogen=true;
    if(s.kapitel||s.moment||s.modus==='intro'||s.modus==='cutscene'){ setze(false,false,false); continue; }

    /* Gespraech: lesen, dann bestaetigen; bei Wahl Profil entscheiden lassen */
    if(s.gespr){
      setze(false,false,false);
      if(s.gesprWahlen.length){
        wahlT+=H.DT;
        /* Reden-Profil: bewusst NICHTS waehlen - die Standardwahl laeuft ab */
        if(hmProfil==='reden'||profil==='renner'){ /* warten */ }
        else if(wahlT>2.5){ druecke('KeyE','gespraech-waehlen'); wahlT=0; }
      } else {
        leseT+=H.DT;
        if(leseT>0.6+s.gesprText.length/16){ druecke('KeyE','gespraech-weiter'); leseT=0; }
      }
      continue;
    } else { leseT=0; wahlT=0; }

    if(s.modus==='gefangen'){ setze(false,false,false); fangT+=H.DT; if(fangT>1.2){ druecke('Space','weiter-nach-fang'); fangT=0; } continue; }

    /* Codeschloss: Ziffern einstellen, dann E */
    if(x.code){
      setze(false,false,false);
      if(!codeSchritte){
        const code=E('S.code'), ein=E('S.codeEingabe'), st=E('S.codeStelle');
        codeSchritte=[]; let stelle=st;
        for(let p=0;p<3;p++){ while(stelle!==p){ codeSchritte.push('KeyD'); stelle=(stelle+1)%3; }
          let d=ein[p]; while(d!==code[p]){ codeSchritte.push('KeyW'); d=(d+1)%10; } }
        codeSchritte.push('KeyE');
      }
      if(i%6===0&&codeSchritte.length){ const c=codeSchritte.shift(); drueck(L,c); V.druck(c==='KeyE'?'code-probieren':'code-ziffer',R.uhr,true); }
      continue;
    } else codeSchritte=null;

    if(s.modus==='raum'){
      /* im Raum: alles durchsuchen, was noch nicht durchsucht ist (ausser der Schluessel ist schon da) */
      const raum=x.raum;
      const pl=E(`moebelPlaetze(RAEUME[${raum}]).map((p,i)=>({x:p.x+8,i,typ:p.typ,leer:S.durchsucht.has(${raum}+':'+i)}))`);
      /* Sicherungskasten wird nie als durchsucht markiert (S.durchsucht.delete) - der Bot merkt ihn sich selbst */
      for(const p of pl) if(p.typ==='sicherung'&&sicherungGezogen) p.leer=true;
      const rx=E('S.raumX');
      if(x.suchT>0){ setze(false,false,false); continue; }
      const offenM=x.key?[]:pl.filter(p=>!p.leer);
      let zielX=offenM.length?offenM.sort((a,b)=>Math.abs(a.x-rx)-Math.abs(b.x-rx))[0].x:40;
      if(Math.abs(zielX-rx)<4||(zielX===40&&rx<=44)){
        setze(false,false,false);
        if(R.uhr-letzteAktion>0.25){
          letzteAktion=R.uhr;
          if(zielX===40){ druecke('KeyE','raum-verlassen'); }
          else { suchen++; const vorher=E('S.durchsucht.size'); druecke('KeyE','durchsuchen');
            /* Ergebnis nach der Suchdauer bewerten */ }
        }
      } else setze(zielX<rx,zielX>rx,false);
      continue;
    }

    if(s.modus!=='spiel') { setze(false,false,false); continue; }

    /* --- Korridor --- */
    const ich=E('({x:S.x,etage:S.etage,amBoden:S.amBoden,blick:S.blick,spindAb:S.spindAbkuehlung,wurfAb:S.wurfAbkuehlung,variante:S.variante,codeBekannt:S.codeBekannt,codeOffen:flag("ferdiSpindOffen")})');
    const lehrer=E('S.lehrer.map(L=>({e:L.e,x:L.x,v:L.v,jagd:L.jagd,weg:!!L.weg,abg:(L.abgelenkt>0||L.suchtX!=null),chef:!!L.chef,hm:!!L.hausmeister,hs:!!L.hatSchluessel}))');

    /* Im Spind: warten, bis keiner mehr in der Naehe herschaut */
    if(x.imSpind>=0){
      setze(false,false,false); versteckT+=H.DT;
      const gefahr=lehrer.some(l=>l.e===ich.etage&&!l.weg&&Math.abs(l.x-ich.x)<110&&(Math.sign(l.v)||1)===Math.sign(ich.x-l.x));
      const nahe=lehrer.some(l=>l.e===ich.etage&&!l.weg&&Math.abs(l.x-ich.x)<40);
      if((!gefahr&&!nahe&&versteckT>1.0)||versteckT>14){ druecke('KeyE','spind-raus'); versteckT=0; }
      continue;
    } else versteckT=0;

    /* Ziel bestimmen */
    let ziel=null, zielArt='';
    if(x.key){ ziel={e:0,x:648}; zielArt='ausgang'; }
    else if(ich.variante==='hausmeister'){
      const hm=lehrer.find(l=>l.hm&&l.hs);
      ziel={e:hm.e,x:hm.x}; zielArt='hausmeister';
    } else {
      /* Raum waehlen: Hinweisstufe 2 -> der Raum, 1 -> die Etage, sonst naechster unentdeckter */
      const raeume=E(`RAEUME.map((r,i)=>({i,e:r.e,x:r.x,name:r.name,entdeckt:S.entdeckt.has(i),voll:moebelPlaetze(r).every((p,j)=>S.durchsucht.has(i+':'+j)||(p.typ==='sicherung'&&${sicherungGezogen}))}))`);
      let kand=raeume.filter(r=>!r.voll);
      if(x.stufe>=2){ const zr=E('S.schluesselRaum'); kand=kand.filter(r=>r.i===zr); }
      else if(x.stufe>=1){ const ze=E('zielEtage()'); const k2=kand.filter(r=>r.e===ze); if(k2.length) kand=k2; }
      const kosten=r=>r.e===ich.etage?Math.abs(r.x-ich.x):Math.min(Math.abs(ich.x-30)+Math.abs(r.x-30),Math.abs(ich.x-706)+Math.abs(r.x-706))+200*Math.abs(r.e-ich.etage);
      kand.sort((a,b)=>kosten(a)-kosten(b));
      if(kand.length){ ziel={e:kand[0].e,x:kand[0].x}; zielArt='raum'; }
    }
    /* Neugier: Code bekannt und auf dem Weg -> Ferdis Spind */
    if(profil==='vorsichtig'&&ich.codeBekannt&&!ich.codeOffen&&ich.etage===2&&!x.key){ ziel={e:2,x:303}; zielArt='codespind'; }
    if(!ziel){ setze(false,false,false); continue; }

    /* Gefahr erkennen (nur vorsichtig) */
    let schleich=false, flucht=null;
    if(profil==='vorsichtig'){
      for(const l of lehrer){
        if(l.e!==ich.etage||l.weg) continue;
        const d=ich.x-l.x, blickt=(Math.sign(l.v)||1)===Math.sign(d);
        const weite=(l.chef?116:82)*(l.abg?0.35:1);
        if(l.jagd>0||(blickt&&Math.abs(d)<weite*1.35)) {
          if(l.hm&&zielArt==='hausmeister'&&l.abg) continue;   // abgelenkt: hingehen
          schleich=true;
          if(l.jagd>0||Math.abs(d)<weite*1.05) flucht=l;
        } else if(Math.abs(d)<60) schleich=true;
      }
    }
    if(flucht&&ich.spindAb<=0){
      /* naechsten Spind auf meiner Etage suchen, der nicht hinter dem Lehrer liegt */
      const sp=E(`SPINDE.filter(s=>s.e===${ich.etage}).map(s=>s.x)`)
        .filter(sx=>Math.sign(sx-flucht.x)===Math.sign(ich.x-flucht.x)||Math.abs(sx-ich.x)<10)
        .sort((a,b)=>Math.abs(a-ich.x)-Math.abs(b-ich.x))[0];
      if(sp!=null&&Math.abs(sp-ich.x)<70){
        if(Math.abs(sp-ich.x)<6){ setze(false,false,false); if(R.uhr-letzteAktion>0.2){ letzteAktion=R.uhr; druecke('KeyE','spind-rein'); } continue; }
        setze(sp<ich.x,sp>ich.x,false); continue;
      }
      /* sonst: weg vom Lehrer, leise */
      const weg=Math.sign(ich.x-flucht.x)||1;
      if((weg<0&&ich.x<20)||(weg>0&&ich.x>740)){ setze(false,false,true); }
      else setze(weg<0,weg>0,true);
      continue;
    }

    /* Etage wechseln */
    if(ziel.e!==ich.etage){
      const tr=(Math.abs(ich.x-30)+Math.abs(ziel.x-30)<=Math.abs(ich.x-706)+Math.abs(ziel.x-706))?30:706;
      if(Math.abs(ich.x-tr)<8&&ich.amBoden){
        setze(false,false,false);
        if(R.uhr-letzteAktion>0.3){ letzteAktion=R.uhr; druecke(ziel.e>ich.etage?'KeyW':'KeyS','treppe'); }
      } else setze(tr<ich.x,tr>ich.x,schleich);
      continue;
    }

    /* Hausmeister: je nach Unterprofil */
    if(zielArt==='hausmeister'){
      const hm=lehrer.find(l=>l.hm&&l.hs), d=hm.x-ich.x;
      if(hmProfil==='werfen'&&!hm.abg&&Math.abs(d)>40&&Math.abs(d)<150&&ich.wurfAb<=0&&!wurfVersucht){
        /* hinter ihn werfen, damit er wegschaut */
        const richtung=Math.sign(d); if(ich.blick!==richtung){ setze(richtung<0,richtung>0,false); continue; }
        setze(false,false,false); druecke('KeyR','werfen'); wurfVersucht=true; continue;
      }
      if(hm.abg) wurfVersucht=false;
      if(Math.abs(d)<10){
        setze(false,false,false);
        if(hmProfil==='springen'&&!hm.abg&&R.uhr-letzteAktion>0.6){ letzteAktion=R.uhr; druecke('Space','springen'); continue; }
        if(R.uhr-letzteAktion>0.3){ letzteAktion=R.uhr; druecke('KeyE',hm.abg?'klauen':'ansprechen'); }
        continue;
      }
      setze(d<0,d>0,schleich&&hmProfil!=='reden'); continue;
    }

    const d=ziel.x-ich.x;
    if(Math.abs(d)<5){
      setze(false,false,false);
      if(R.uhr-letzteAktion>0.3){ letzteAktion=R.uhr;
        druecke('KeyE',zielArt==='ausgang'?'ausgang':zielArt==='codespind'?'code-oeffnen':'tuer-rein'); }
      continue;
    }
    setze(d<0,d>0,schleich);
  }
  /* Auswertung */
  const ev=R.ev;
  const sucheErg=ev.filter(e=>e.typ==='meldung'&&/^(NICHTS DRIN|ZETTEL|NOTIZ|AKKU|ENERGYDRINK|SCHLUESSEL|DEIN HANDY|SICHERUNG|SCHON)/.test(e.txt));
  const leer=ev.filter(e=>e.typ==='meldung'&&e.txt==='NICHTS DRIN').length;
  const tonA=tonAuswertung(E,{von:startSpiel||0});
  return { saat,profil,hmProfil, variante:E('S.variante'), ende, startSpiel,
    gesamt:R.uhr, spielzeit:ende?ende.zeit:null, zeitSchluessel:zeitSchluessel!=null&&startSpiel!=null?zeitSchluessel-startSpiel:null,
    cutscene:cutsceneStart!=null&&cutsceneEnde!=null?cutsceneEnde-cutsceneStart:null,
    erwischt:E('S.erwischtZahl'), suchenGesamt:E('S.durchsucht.size'), nichtsDrin:leer,
    raeume:E('S.entdeckt.size'),
    luecken:luecken(ev,{von:startSpiel||0,bis:cutsceneStart||R.uhr}),
    lueckenAlles:luecken(ev,{klassen:['info','entscheidung','herausforderung','quittung','fx'],von:startSpiel||0,bis:cutsceneStart||R.uhr}),
    verben:V.zusammen(), ton:tonA, ev:protokoll?ev:null,
    evZahl:{info:ev.filter(e=>e.klasse==='info').length,quittung:ev.filter(e=>e.klasse==='quittung').length,
      herausforderung:ev.filter(e=>e.klasse==='herausforderung').length,entscheidung:ev.filter(e=>e.klasse==='entscheidung').length,fx:ev.filter(e=>e.klasse==='fx').length} };
}

if(EINZEL!==null){
  const profil=argv.includes('--renner')?'renner':'vorsichtig';
  const hmP=argv.includes('--werfen')?'werfen':argv.includes('--springen')?'springen':'reden';
  const r=lauf(EINZEL,profil,hmP,{protokoll:true});
  for(const e of r.ev) console.log(e.t.toFixed(1).padStart(6)+'  '+e.klasse.padEnd(15)+e.typ.padEnd(10)+e.txt);
  delete r.ev; console.log(JSON.stringify(r,null,1));
  return;
}

/* Viele Laeufe */
const ergebnisse=[];
for(const profil of ['vorsichtig','renner']){
  for(const hmP of ['reden','werfen','springen']){
    for(let saat=0;saat<16;saat++){
      try{ ergebnisse.push(lauf(saat,profil,hmP)); }
      catch(e){ console.log('Ausnahme',profil,hmP,saat,e.message.split('\n')[0]); }
    }
  }
}
/* Raum-Spielart haengt nicht am hmProfil - doppelte Raum-Laeufe nur einmal zaehlen */
const sicht=ergebnisse.filter(r=>r.variante==='hausmeister'||r.hmProfil==='reden');
const gruppe=(f)=>{ const g={}; for(const r of sicht){ const k=f(r); (g[k]=g[k]||[]).push(r); } return g; };
const G=gruppe(r=>r.profil+' / '+(r.variante==='raum'?'raum':'hausmeister-'+r.hmProfil));
console.log('Gruppe'.padEnd(34)+'n  gewonnen  Spielzeit(med) Schluessel(med) erwischt(mit) Durchsucht(mit) NICHTS-DRIN(mit) laengsteLeere(med/max) Rang1-Luecke-Beispiel');
for(const [k,rs] of Object.entries(G)){
  const gw=rs.filter(r=>r.ende&&r.ende.gewonnen);
  const lz=rs.map(r=>r.luecken[0]?r.luecken[0].dauer:0);
  console.log(k.padEnd(34)+String(rs.length).padEnd(3)+String(gw.length).padEnd(10)
    +String(runde(median(gw.map(r=>r.spielzeit))||0)).padEnd(15)
    +String(runde(median(rs.filter(r=>r.zeitSchluessel!=null).map(r=>r.zeitSchluessel))||0)).padEnd(16)
    +String(runde(mittel(rs.map(r=>r.erwischt)),2)).padEnd(14)
    +String(runde(mittel(rs.map(r=>r.suchenGesamt)),1)).padEnd(16)
    +String(runde(mittel(rs.map(r=>r.nichtsDrin)),1)).padEnd(17)
    +(runde(median(lz))+' / '+runde(Math.max(...lz))).padEnd(23)
    +(rs[0].luecken[0]?JSON.stringify(rs[0].luecken[0]):''));
}
/* Verteilung je Gruppe: Spielzeit (S.zeit), Gesamtzeit inkl. Karte/Intro/Gespraeche/Abspann */
console.log('\nVerteilung (nur gewonnene Laeufe): Spielzeit min/med/max | Gesamt mit Intro+Abspann min/med/max | Abspann med');
for(const [k,rs] of Object.entries(G)){
  const gw=rs.filter(r=>r.ende&&r.ende.gewonnen); if(!gw.length) continue;
  const sz=gw.map(r=>r.spielzeit), gs=gw.map(r=>r.gesamt);
  console.log('  '+k.padEnd(34)+[Math.min(...sz),median(sz),Math.max(...sz)].map(v=>runde(v)).join(' / ').padEnd(22)+' | '
    +[Math.min(...gs),median(gs),Math.max(...gs)].map(v=>runde(v)).join(' / ').padEnd(22)+' | '+runde(median(gw.map(r=>r.cutscene||0))));
}
const raumL=sicht.filter(r=>r.variante==='raum');
console.log('Raum-Spielart: Durchsuchungen je Lauf '+runde(mittel(raumL.map(r=>r.suchenGesamt)))+', davon NICHTS DRIN '+runde(mittel(raumL.map(r=>r.nichtsDrin)))
  +' ('+runde(100*mittel(raumL.map(r=>r.nichtsDrin))/mittel(raumL.map(r=>r.suchenGesamt)))+' %), Raeume betreten '+runde(mittel(raumL.map(r=>r.raeume))));
console.log('Laengste Spielzeit eines Siegs: '+runde(Math.max(...sicht.filter(r=>r.ende&&r.ende.gewonnen).map(r=>r.spielzeit)))+' s von 165 s Uhr');
/* Endgruende */
const gruende={}; for(const r of sicht){ const k=r.ende?(r.ende.gewonnen?'gewonnen':r.ende.faenger||'verloren'):'kein Ende'; gruende[k]=(gruende[k]||0)+1; }
console.log('\nEnden:',JSON.stringify(gruende));
/* Verben ueber alle */
const vg={}; const hg={};
for(const r of sicht){ for(const [k,v] of Object.entries(r.verben.druecke)){ vg[k]=vg[k]||{n:0,mitWirkung:0}; vg[k].n+=v.n; vg[k].mitWirkung+=v.mitWirkung; }
  for(const [k,v] of Object.entries(r.verben.halten)) hg[k]=(hg[k]||0)+v; }
console.log('\nVerben (Summe ueber '+sicht.length+' Laeufe, Druecke / davon mit Wirkung):');
for(const [k,v] of Object.entries(vg).sort((a,b)=>b[1].n-a[1].n)) console.log('  '+k.padEnd(22)+String(v.n).padEnd(6)+v.mitWirkung+'   je Lauf '+runde(v.n/sicht.length,1));
console.log('Gehalten (s, Summe): '+JSON.stringify(Object.fromEntries(Object.entries(hg).map(([k,v])=>[k,runde(v)]))));
/* Ton */
const t0=sicht[0].ton;
console.log('\nMusik (Lauf 1): Tonvorrat '+JSON.stringify(t0.tonvorrat)+' Stimmen '+JSON.stringify(t0.stimmen)+' Periode '+t0.periodeNoten+' Noten; SFX/min '+t0.sfxProMin+'  Arten '+JSON.stringify(t0.sfxArten));
console.log('SFX/min Median ueber Laeufe: '+runde(median(sicht.map(r=>r.ton.sfxProMin))));
console.log('Ereignisse je Klasse (Mittel je Lauf): '+JSON.stringify(Object.fromEntries(['info','quittung','herausforderung','entscheidung','fx'].map(k=>[k,runde(mittel(sicht.map(r=>r.evZahl[k])),1)]))));
/* Laengste Leeren - die drei laengsten ueber alle Laeufe */
const alle=[]; for(const r of sicht) for(const l of r.luecken) alle.push({...l,lauf:r.saat,gruppe:r.profil+'/'+r.variante});
alle.sort((a,b)=>b.dauer-a.dauer);
console.log('\nLaengste Strecken ohne neue Info/Entscheidung/Gefahr:');
alle.slice(0,6).forEach(l=>console.log('  '+l.dauer+' s  ('+l.gruppe+' saat '+l.lauf+')  nach: '+l.vorher+'  -> bis: '+l.nachher));
