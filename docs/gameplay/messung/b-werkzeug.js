/* Messkoffer fuer die Monotonie-Messung B (Level 4, 5, 6).
   Reine Messung, aendert keine Spieldatei. Aufruf ueber die b-level*.js.

   Was es kann:
   - eine Seite ueber tools/nachttest.js laden (ohne Browser), Zufall je Lauf neu saeen
   - Tasten druecken/halten wie ein Spieler (keydown/keyup ueber die echten Handler)
   - in jedem Bild (1/60 s) einen Schnappschuss nehmen und daraus Ereignisse
     mit Zeitstempel ableiten: Modus-Wechsel, Meldungen, Hinweise, Gespraechs-
     knoten (Entscheidung oder nur Text), Plauschzeilen, Kapitel- und Polaroid-Karten
   - Leere messen: laengste Strecke ohne neue Herausforderung/Entscheidung,
     laengste Strecke ohne irgendeine neue Information, Zuschau-Anteil
   - Gespraeche wie ein Erstspieler fuehren: Lesezeit nach Textlaenge, dann waehlen
*/
'use strict';
const path=require('path');
const WURZEL=path.resolve(__dirname,'..','..','..');
process.chdir(WURZEL);
const N=require(path.join(WURZEL,'tools','nachttest.js'));
const DT=1/60;

function zufall(seed){ let s=(seed>>>0)||1; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
function normal(r,mu,sigma){ const u=Math.max(1e-9,r()), v=r(); return mu+sigma*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

/* Eine Seite laden. vorher: JS, das VOR dem Start im Level ausgefuehrt wird
   (Speicherstand, Pegel, Crew, Flags setzen). */
function oeffne(seite,{seed=1,vorher='',snapExtra=''}={}){
  const L=N.lade(seite,'?lektion=0');
  const E=c=>L.api.ev(c);
  E(`Math.random=(function(){let s=${(seed*2654435761)>>>0||7}; return function(){s=(s*1664525+1013904223)>>>0; return s/4294967296;};})()`);
  if(vorher) E(vorher);
  E(`window.__snap=function(){
    const g=(typeof GESPR!=='undefined'&&GESPR)?GESPR:null;
    return { m:S.modus, mel:S.meldung||'', melT:S.meldungT||0, hin:S.hinweis||'', hinT:S.hinweisT||0,
      g: g&&g.knoten ? (g.name+'|'+(g.knoten.wer||'')+'|'+(g.knoten.text||'')) : null,
      gw: g ? g.wahlen.length : 0,
      pl: PLAUSCH.jetzt ? ((PLAUSCH.jetzt.wer||'')+': '+PLAUSCH.jetzt.text) : null,
      kap: !!KAPITEL.aktiv, mom: !!MOMENT_KARTE.aktiv, momN: MOMENT_KARTE.n,
      sz: S.szene, szT: S.szeneT ${snapExtra?','+snapExtra:''} };
  }`);
  return {L,E};
}

/* Der Lauf. bot(st,ctl) wird jedes Bild VOR update() gerufen. */
function lauf(seite,bot,{seed=1,vorher='',snapExtra='',maxSek=900,stopp=null,ereignisExtra=null}={}){
  const {L,E}=oeffne(seite,{seed,vorher,snapExtra});
  const ev=[];                   // {t,typ,txt}  typ: H Herausforderung, E Entscheidung, I Information, M Modus, P Plausch, X Eingabe
  const gedrueckt=new Set();
  const losLassen=[];            // Tasten, die naechstes Bild losgelassen werden
  const verben={};               // name -> {n, wirkung:{...}}
  let t=0;
  const ctl={
    get t(){ return t; }, E, L,
    tippe(code){ if(gedrueckt.has(code)) return; L.taste(code,true); gedrueckt.add(code); losLassen.push(code); },
    halte(code,an){ if(an&&!gedrueckt.has(code)){ L.taste(code,true); gedrueckt.add(code); }
      if(!an&&gedrueckt.has(code)){ L.taste(code,false); gedrueckt.delete(code); } },
    alleLos(){ for(const c of [...gedrueckt]){ L.taste(c,false); gedrueckt.delete(c); } },
    verb(name,wirkung){ const v=verben[name]||(verben[name]={n:0,wirkung:{}}); v.n++;
      if(wirkung) v.wirkung[wirkung]=(v.wirkung[wirkung]||0)+1; ev.push({t,typ:'X',txt:name+(wirkung?' -> '+wirkung:'')}); },
    merke(typ,txt){ ev.push({t,typ,txt}); },
  };
  let vor=E('__snap()');
  const passivZeit={};           // Modus -> Sekunden, in denen der Spieler nur zuschaut
  let passiv=0, spielzeit=0;
  for(let i=0;i<maxSek*60;i++){
    /* Tasten aus dem letzten Bild loslassen */
    while(losLassen.length){ const c=losLassen.shift(); if(gedrueckt.has(c)){ L.taste(c,false); gedrueckt.delete(c); } }
    const st=vor;
    const r=bot(st,ctl);
    if(r==='fertig') break;
    E('update('+DT+')');
    t+=DT;
    const jetzt=E('__snap()');
    /* Ereignisse aus dem Unterschied */
    if(jetzt.m!==vor.m) ev.push({t,typ:'M',txt:vor.m+' > '+jetzt.m});
    if(jetzt.melT>vor.melT+1e-6||(jetzt.mel!==vor.mel&&jetzt.melT>0)) ev.push({t,typ:'I',txt:'MELDUNG '+jetzt.mel});
    if(jetzt.hinT>vor.hinT+1e-6||(jetzt.hin!==vor.hin&&jetzt.hinT>0)) ev.push({t,typ:'I',txt:'HINWEIS '+jetzt.hin});
    if(jetzt.g&&jetzt.g!==vor.g) ev.push({t,typ:jetzt.gw>=2?'E':'I',txt:(jetzt.gw>=2?'WAHL('+jetzt.gw+') ':'TEXT ')+jetzt.g.split('|').slice(1).join(': ')});
    if(jetzt.pl&&jetzt.pl!==vor.pl) ev.push({t,typ:'P',txt:'PLAUSCH '+jetzt.pl});
    if(jetzt.kap&&!vor.kap) ev.push({t,typ:'I',txt:'KAPITELKARTE'});
    if(jetzt.mom&&!vor.mom) ev.push({t,typ:'I',txt:'POLAROID '+jetzt.momN});
    if((jetzt.m==='intro'||jetzt.m==='cutscene')&&jetzt.sz!==vor.sz) ev.push({t,typ:'I',txt:jetzt.m.toUpperCase()+'-SZENE '+jetzt.sz});
    if(ereignisExtra) ereignisExtra(vor,jetzt,ev,t,E);
    /* Zuschauen: Karten, Intro, Cutscene, Text ohne Wahl, Wartebilder */
    const zuschau = jetzt.kap||jetzt.mom||/^(intro|cutscene|schlange|ecke|schwarz)$/.test(jetzt.m)||(jetzt.g&&jetzt.gw<2);
    if(jetzt.m!=='titel'&&jetzt.m!=='ende'){ spielzeit+=DT; if(zuschau){ passiv+=DT; const k=jetzt.kap?'kapitelkarte':jetzt.mom?'polaroid':(jetzt.g&&jetzt.gw<2)?'gespraech-text':jetzt.m; passivZeit[k]=(passivZeit[k]||0)+DT; } }
    vor=jetzt;
    if(stopp&&stopp(jetzt,t,E)) break;
  }
  ctl.alleLos();
  return {ev,verben,t,spielzeit,passiv,passivZeit,E,L,ende:vor};
}

/* Laengste Luecke zwischen Ereignissen bestimmter Typen im Zeitraum [von,bis]. */
function leere(ev,typen,von,bis){
  const z=ev.filter(e=>typen.includes(e.typ)&&e.t>=von&&e.t<=bis).map(e=>e.t);
  const p=[von,...z,bis]; let best={dauer:0,von,bis:von};
  for(let i=1;i<p.length;i++){ const d=p[i]-p[i-1]; if(d>best.dauer) best={dauer:d,von:p[i-1],bis:p[i]}; }
  best.dazwischen=ev.filter(e=>e.t>best.von&&e.t<best.bis&&!typen.includes(e.typ)).map(e=>fmt(e.t)+' '+e.txt);
  return best;
}
const fmt=t=>t.toFixed(1)+'s';

/* Gespraech wie ein Erstspieler: Lesezeit, dann waehlen.
   politik(wahlen,knoten) -> Index. Liefert true, solange ein Gespraech laeuft. */
function gespraechBot(st,ctl,zustand,politik){
  if(!st.g){ zustand.gKnoten=null; return false; }
  if(st.g!==zustand.gKnoten){
    zustand.gKnoten=st.g;
    const k=ctl.E('({text:GESPR.knoten.text||"",wahl:GESPR.wahlen.map(w=>({txt:w.txt,geh:w.geh,tu:w.tu||{}})),wer:GESPR.knoten.wer||"",zeit:GESPR.zeitGesamt||0})');
    const zeichen=k.text.length+k.wahl.reduce((a,w)=>a+w.txt.length,0);
    zustand.gBereit=ctl.t+(zustand.lesen?0.9+0.045*zeichen:0.25);
    zustand.gWahl=k.wahl.length?politik(k.wahl,k):0;
    zustand.gSchritte=zustand.gWahl;
    zustand.gInfo=k;
  }
  if(ctl.t<zustand.gBereit) return true;
  if(zustand.gSchritte>0){ ctl.tippe('KeyS'); zustand.gSchritte--; zustand.gBereit=ctl.t+0.12; return true; }
  ctl.tippe('KeyE');
  if(zustand.gInfo&&zustand.gInfo.wahl.length) ctl.verb('Antwort waehlen',zustand.gInfo.wahl[zustand.gWahl]?zustand.gInfo.wahl[zustand.gWahl].txt.slice(0,28):'');
  else ctl.verb('Text weiter (E)');
  zustand.gBereit=ctl.t+0.3;
  return true;
}

/* Karten (Kapitel/Polaroid) wie ein Erstspieler: auslaufen lassen. Intro und
   Cutscenes ebenso. skip=true druckt sie weg (Wiederholer). */
function kartenBot(st,ctl,zustand,skip){
  if(st.kap||st.mom){ if(skip&&ctl.t>(zustand.kartT||0)){ ctl.tippe('KeyE'); zustand.kartT=ctl.t+0.7; } return true; }
  return false;
}

function bericht(titel,r,{von=0,bis=null}={}){
  bis=bis===null?r.t:bis;
  const he=leere(r.ev,['H','E'],von,bis);
  const alle=leere(r.ev,['H','E','I','P'],von,bis);
  const ohneP=leere(r.ev,['H','E','I'],von,bis);
  const nurH=leere(r.ev,['H'],von,bis);
  return { titel, dauer:+(bis-von).toFixed(1),
    leereHE:{dauer:+he.dauer.toFixed(1),von:+he.von.toFixed(1),bis:+he.bis.toFixed(1),dazwischen:he.dazwischen.slice(0,14)},
    leereH:{dauer:+nurH.dauer.toFixed(1),von:+nurH.von.toFixed(1),bis:+nurH.bis.toFixed(1)},
    leereInfo:{dauer:+alle.dauer.toFixed(1),von:+alle.von.toFixed(1),bis:+alle.bis.toFixed(1)},
    leereOhnePlausch:{dauer:+ohneP.dauer.toFixed(1),von:+ohneP.von.toFixed(1),bis:+ohneP.bis.toFixed(1)},
    zuschauAnteil:+(r.passiv/Math.max(1e-9,r.spielzeit)*100).toFixed(1),
    zuschau:Object.fromEntries(Object.entries(r.passivZeit).map(([k,v])=>[k,+v.toFixed(1)])),
    anzahl:Object.fromEntries(['H','E','I','P','M','X'].map(k=>[k,r.ev.filter(e=>e.typ===k&&e.t>=von&&e.t<=bis).length])),
  };
}

function protokoll(ev,filter){ return ev.filter(e=>!filter||filter(e)).map(e=>fmt(e.t).padStart(7)+'  '+e.typ+'  '+e.txt); }

module.exports={N,DT,zufall,normal,oeffne,lauf,leere,fmt,gespraechBot,kartenBot,bericht,protokoll,WURZEL};
