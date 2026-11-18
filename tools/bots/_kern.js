/* Gemeinsamer Kern der Gewinn-Bots (tools/bots/). Siehe README.md.
   Ein Bot ist ein Modul mit:
     seite   'level3.html'
     laufe(k)  spielt das Level bis zum Sieg; k ist das Kern-Objekt von start().
   start() liefert den Taster: Tasten halten/loslassen, Bilder takten, Gespraeche wegdruecken.
   Bots lesen Zustand (S, TUNE, Konstanten) und druecken Tasten (L.taste); gesetzt wird nur,
   wo ein Level es sonst unmoeglich macht - jeweils im Bot begruendet. */
'use strict';
const M=require('../messhilfe.js');

function start(seite,opt){
  opt=opt||{};
  const {L,E}=M.starteLevel(seite,{lektion:0});
  const rang=M.rangAbfangen(L);
  const gehalten=new Set();
  const k={ L, E, rang, bilder:0, seite };
  k.takt=(n=1)=>{ for(let i=0;i<n;i++){ E('update(1/60)'); k.bilder++; } };
  /* genau diese Tasten halten, alle anderen loslassen */
  k.halte=(...codes)=>{
    const soll=new Set(codes.flat().filter(Boolean));
    for(const c of [...gehalten]) if(!soll.has(c)){ L.taste(c,false); gehalten.delete(c); }
    for(const c of soll) if(!gehalten.has(c)){ L.taste(c,true); gehalten.add(c); }
  };
  k.los=()=>k.halte();
  k.haelt=c=>gehalten.has(c);
  /* Taste fuer GENAU ein Bild halten (Tasten, die erst im update() gelesen werden, z.B. Treppe):
     im ersten Aufruf runter, im naechsten hoch. */
  k.einBild=(code)=>{ if(gehalten.has(code)) k.halte(); else k.halte(code); };
  /* kurzer Druck (Taste runter, ein Bild, Taste hoch); gehaltene Tasten bleiben */
  k.tipp=(code)=>{ const war=gehalten.has(code); if(war) L.taste(code,false);
    L.taste(code,true); L.taste(code,false); if(war) L.taste(code,true); };
  /* Wartet bis bed() wahr ist, hoechstens sek Spielsekunden; gibt true, wenn bed erfuellt */
  k.bis=(bed,sek,schritt)=>{ for(let i=0;i<sek*60;i++){ if(bed()) return true;
    if(schritt) schritt(i); k.takt(1); } return !!bed(); };
  /* Gehe waagerecht zu x (S.x); true, wenn die Strecke bis auf tol geschafft ist (dann loslassen).
     links/rechts: die Tasten des Levels, Standard Pfeile. */
  k.gehe=(x,tol=3,extra)=>{
    const sx=E('S.x');
    if(Math.abs(sx-x)<=tol){ k.halte(extra); return true; }
    k.halte(sx<x?'ArrowRight':'ArrowLeft',extra); return false;
  };
  /* Wie gehe, dazu die Tiefe S.tiefe auf t (ArrowUp = nach hinten = kleiner, ArrowDown = nach vorn). */
  k.gehe2=(x,t,tol=3,tolT=0.05)=>{
    const sx=E('S.x'), st=E('S.tiefe'), codes=[];
    if(Math.abs(sx-x)>tol) codes.push(sx<x?'ArrowRight':'ArrowLeft');
    if(t!==null&&t!==undefined&&Math.abs(st-t)>tolT&&E('tiefeAn()')) codes.push(st<t?'ArrowDown':'ArrowUp');
    k.halte(codes); return codes.length===0;
  };
  k.spiel=()=>E('S.zeit');
  k.titel=(ziel=['spiel'],maxBilder=3000)=>{     // Titel, Kapitelkarte, Intro mit Leertaste durchklicken, bis S.modus in ziel ist
    for(let i=0;i<maxBilder;i++){
      const m=E('S.modus'); if(ziel.includes(m)) return true;
      if(m==='intro') E('S.szeneT+=99');
      k.tipp('Space'); k.takt(1);
    }
    return ziel.includes(E('S.modus'));
  };
  /* Gespraech: ohne politik die Standardantwort (E tippen, bis es vorbei ist). Mit politik(texte,knoten)
     -> Index der Antwort wird dorthin gewaehlt (Pfeiltasten wie ein Spieler), dann E. true, wenn eines lief. */
  k.gespraech=(politik)=>{
    if(!E('gespraechAktiv()')) return false;
    if(politik){
      const w=E('GESPR.wahlen.map(w=>w.txt)');
      if(w.length){
        const ziel=politik(w,E('GESPR.knoten.text||""')), jetzt=E('GESPR.gewaehlt');
        if(ziel!==undefined&&ziel!==jetzt&&ziel>=0&&ziel<w.length){ k.tipp(ziel>jetzt?'ArrowRight':'ArrowLeft'); return true; }
      }
    }
    k.tipp('KeyE'); return true;
  };
  return k;
}

/* Gemeinsamer Lauf: ruft schritt(k) je Bild, bis ende(k) wahr ist oder die Zeit um ist.
   Ergebnis fuer die Zeile von nachttest --bots. */
function spiele(bot,opt){
  opt=opt||{};
  const t0=Date.now();
  const k=start(bot.seite,opt);
  let fehler=null;
  try{ bot.laufe(k); }catch(e){ fehler=e; }
  const E=k.E, a=k.rang();
  const erg={
    seite:bot.seite, fehler,
    modus:E('S.modus'), gewonnen:E('S.gewonnen')===true&&E('S.modus')==='ende',
    zeit:E('typeof S.zeit==="number"?S.zeit:S.t'),
    punkte:a?a.args[1]:null, rang:a&&a.ergebnis?a.ergebnis.rang:null,
    faenger:E('S.faenger||""'), bilder:k.bilder, echtzeit:(Date.now()-t0)/1000,
  };
  return erg;
}

/* Kloppe (nacht/kampf.js): die Gegner holen aus (zustand 'ausholen'), E im goldenen Fenster kontert.
   Ein Bild Kampf-Entscheidung fuer S.ich gegen S.gegner (wie kloppeBot in docs/gameplay/messung/b-level5.js,
   nur ohne Zufall): auf Tiefe und Hoehe des naechsten Gegners gehen, zu ihm drehen und laufen,
   beim Ausholen im letzten Drittel (0.34) + 0.06 s kontern, sonst bei Ruhe schlagen.
   state: 'ich'/'gegner'-Ausdruecke; gemerkt = Objekt, das der Bot behaelt. */
function kloppeSchritt(k,gemerkt,opt){
  opt=opt||{};
  const E=k.E, ichA=opt.ich||'S.ich', gegA=opt.gegner||'S.gegner';
  const ich=E(`({x:${ichA}.x,t:${ichA}.t,z:${ichA}.zustand,aus:${ichA}.ausdauer,bl:${ichA}.blick})`);
  const leb=E(`${gegA}.map((g,i)=>({i,x:g.x,t:g.t,z:g.zustand,zT:g.zT,d:g.ausholenDauer,hp:g.hp,fa:g.fensterAnteil})).filter(g=>g.hp>0)`);
  if(!leb.length){ k.halte(); return; }
  leb.sort((a,b)=>Math.abs(a.x-ich.x)-Math.abs(b.x-ich.x));
  const g=leb[0], dx=g.x-ich.x, dt=g.t-ich.t;
  const angreifer=leb.find(x=>x.z==='ausholen');
  const tast=[];
  if(dt>0.12&&ich.z==='frei') tast.push('KeyS'); else if(dt<-0.12&&ich.z==='frei') tast.push('KeyW');
  if(Math.abs(dx)>2&&Math.sign(dx)!==ich.bl&&ich.z==='frei'){ k.halte(); k.tipp(dx>0?'KeyD':'KeyA'); return; }
  if(Math.abs(dx)>14&&ich.z==='frei') tast.push(dx>0?'KeyD':'KeyA');
  k.halte(tast);
  if(angreifer){
    const fa=opt.fenster||0.34, schluessel=angreifer.i+'_'+angreifer.d+'_'+Math.round(k.bilder/30);
    if(angreifer.zT>=angreifer.d*(1-fa)+0.06&&!gemerkt[schluessel]){ gemerkt[schluessel]=1; k.tipp('KeyE'); }
  } else if(Math.abs(dx)<=15&&ich.z==='frei'&&ich.aus>=30&&k.bilder%12===0) k.tipp('KeyE');
}

module.exports={start,spiele,kloppeSchritt};
