/* Der Nachttest: spielt jede Seite ohne Browser durch.
   node tools/nachttest.js            alles
   node tools/nachttest.js level5     nur Seiten, deren Name das enthaelt
   node tools/nachttest.js --kurz     nur 20 statt 60 Sekunden Spiel, 60 statt 300 Nichtstun

   Warum es das gibt: die Nachtroutine laeuft in der Cloud, und dort gibt es
   keinen Browser. Engine und Level-Script werden hier in einer Funktion
   zusammengesetzt, die Browser-Dinge (document, Canvas, Speicher) sind
   Attrappen. Es wird nicht gezeichnet, aber update() und draw() laufen
   wirklich - Ausnahmen, Softlocks und NaN fallen auf.

   Was NICHT geht: Pixel messen (leere Bildzeilen), Ton, echtes Layout.
   Das steht im Bericht als "nicht geprueft", nicht als gruen.

   Harte Fehler (Exit 1): Ausnahme, NaN in der Position, toter Gespraechs-
   verweis, Zeichen ausserhalb der Schrift, Konter-Test von Level 2. */
const fs=require('fs');
const argv=process.argv.slice(2);
const KURZ=argv.includes('--kurz');
const filter=argv.filter(a=>!a.startsWith('--'));
const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html',
  'level6.html','level7.html','level8.html','karte.html'];   // runner.html hat eine eigene Schleife
const SPIEL_SEK=KURZ?20:60, NICHTS_SEK=KURZ?60:300;

/* ---- Attrappen ------------------------------------------------------- */
function stumm(){
  const f=function(){ return stumm(); };
  return new Proxy(f,{
    get(t,k){ if(k===Symbol.toPrimitive) return ()=>0; if(k==='then') return undefined;
      if(k==='length') return 0; return stumm(); },
    set(){ return true; }, apply(){ return stumm(); },
  });
}
function leinwand(){
  const ctx=new Proxy({},{
    get(t,k){
      if(k==='getImageData') return (x,y,w,h)=>({data:new Uint8ClampedArray(Math.max(4,w*h*4)),width:w,height:h});
      if(k==='measureText') return ()=>({width:0});
      if(k==='canvas') return cv;
      return t[k]!==undefined?t[k]:stumm();
    },
    set(t,k,v){ t[k]=v; return true; },
  });
  const cv={ width:320, height:180, style:{}, getContext:()=>ctx,
    getBoundingClientRect:()=>({left:0,top:0,width:320,height:180}),
    addEventListener(){}, removeEventListener(){}, classList:stumm() };
  return cv;
}
function speicher(){ const m=new Map(); return {
  getItem:k=>m.has(k)?m.get(k):null, setItem:(k,v)=>m.set(k,String(v)),
  removeItem:k=>m.delete(k), clear:()=>m.clear() }; }
function zufall(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }

/* ---- Eine Seite laden --------------------------------------------------- */
function lade(seite){
  const h=fs.readFileSync(seite,'utf8');
  const module=[...h.matchAll(/<script src="nacht\/([a-z]+)\.js/g)].map(m=>m[1])
    .filter(n=>n!=='mobil');                       // reine Oberflaeche
  const m=h.match(/<script>([\s\S]*?)<\/script>/);
  if(!m) throw new Error('kein Level-Script');
  const quelle=module.map(n=>fs.readFileSync('nacht/'+n+'.js','utf8')).join('\n')+'\n'+m[1];

  const handler={keydown:[],keyup:[],andere:[]};
  const reg=(art,fn)=>{ (handler[art]||handler.andere).push(fn); };
  const cv=leinwand();
  const doc=new Proxy({},{ get(t,k){
    if(k==='getElementById') return id=>id==='c'?cv:stumm();
    if(k==='createElement') return tag=>tag==='canvas'?leinwand():stumm();
    if(k==='addEventListener') return reg;
    if(k==='documentElement'||k==='body') return stumm();
    if(k==='fullscreenElement'||k==='webkitFullscreenElement') return null;
    if(k==='title') return seite;
    return t[k]!==undefined?t[k]:stumm(); }, set(t,k,v){ t[k]=v; return true; } });
  const win={ addEventListener:reg, removeEventListener(){}, innerWidth:800, innerHeight:450,
    HANDY:null, MOBIL:null };
  const nav={ maxTouchPoints:0, userAgent:'node', wakeLock:undefined };
  const ort={ search:'', pathname:'/'+seite, href:'http://localhost/'+seite };
  const zeit={ jetzt:0 };
  const perf={ now:()=>zeit.jetzt };
  const rng=zufall(12345);
  const MathX=Object.create(Math); MathX.random=rng;

  const fn=new Function('document','window','navigator','localStorage','location','screen',
    'performance','requestAnimationFrame','setTimeout','setInterval','clearTimeout','clearInterval',
    'innerWidth','innerHeight','addEventListener','removeEventListener','AudioContext','Math',
    /* with(window): im Browser ist jede window-Eigenschaft ein globaler Name -
       die Engine liest HANDY und MOBIL ohne window. davor. */
    'with(window){\n'+quelle+'\n;return {ev:c=>eval(c)};\n}');
  const api=fn(doc,win,nav,speicher(),ort,{width:800,height:450},perf,()=>0,()=>0,()=>0,()=>0,()=>0,
    800,450,reg,()=>{},undefined,MathX);
  const taste=(code,runter)=>{
    const e={code,key:code,repeat:false,_stop:false,
      preventDefault(){},stopPropagation(){},stopImmediatePropagation(){ this._stop=true; }};
    for(const fnh of handler[runter?'keydown':'keyup']){ fnh(e); if(e._stop) break; }
  };
  return {api,taste,zeit,rng,handler};
}

/* ---- Gespraechsbaeume pruefen ---------------------------------------------- */
function baeume(L,seite){
  const h=fs.readFileSync(seite,'utf8'), m=h.match(/<script>([\s\S]*?)<\/script>/)[1];
  const glyph=new Set(L.api.ev('Object.keys(GLYPH)'));
  const fehler=[]; let zahl=0, knoten=0;
  for(const n of new Set([...m.matchAll(/^const ([A-Z][A-Z_0-9]+)\s*=\s*\{/gm)].map(x=>x[1]))){
    let b; try{ b=L.api.ev(n); }catch(e){ continue; }
    if(!b||typeof b!=='object'||Array.isArray(b)||!('start' in b)) continue;
    /* Ein Baum besteht nur aus Knoten (Objekte mit text/wahl/geh) oder null -
       sonst ist es eine andere Tabelle, die zufaellig 'start' heisst. */
    const knotenOk=v=>v===null||(typeof v==='object'&&!Array.isArray(v)&&('text' in v||'wahl' in v||'geh' in v));
    if(!Object.values(b).every(knotenOk)) continue;
    zahl++;
    const gesehen=new Set(), rand=['start'];
    const pt=(t,wo)=>{ if(typeof t!=='string') return;
      for(const c of t.toUpperCase()) if(!glyph.has(c)) fehler.push(n+'.'+wo+': Zeichen "'+c+'" fehlt in der Schrift'); };
    for(const k of Object.keys(b)){ const o=b[k]; knoten++; if(!o) continue;
      pt(o.text,k); pt(o.wer,k);
      for(const w of o.wahl||[]){ pt(w.txt,k);
        if(w.geh&&!(w.geh in b)&&!w.geh.startsWith('@')) fehler.push(n+'.'+k+': geh "'+w.geh+'" existiert nicht'); }
      if(o.geh&&!(o.geh in b)&&!o.geh.startsWith('@')) fehler.push(n+'.'+k+': geh "'+o.geh+'" existiert nicht'); }
    while(rand.length){ const k=rand.pop(); if(gesehen.has(k)||!(k in b)||!b[k]) continue; gesehen.add(k);
      if(b[k].geh) rand.push(b[k].geh); for(const w of b[k].wahl||[]) if(w.geh) rand.push(w.geh); }
    const tot=Object.keys(b).filter(k=>b[k]&&!gesehen.has(k));
    /* tanzGut/tanzSchlecht werden von aussen betreten - das ist gewollt. */
    const fremd=tot.filter(k=>!/^(tanzGut|tanzSchlecht)$/.test(k));
    if(fremd.length) fehler.push(n+': unerreichbar ab start: '+fremd.join(', '));
  }
  return {zahl,knoten,fehler};
}

/* ---- Den ersten Kampf von Level 2 gegenpruefen ------------------------------- */
function konterLevel2(){
  const L=lade('level2.html'), E=c=>L.api.ev(c);
  const ergebnis={};
  for(const taktik of ['richtig','dauernd','zu_frueh']){
    E(`S.hp=TUNE.leben; S.modus='kampf'; S.x=400;
       S.gegner={x:330,t:0,zustand:'komm',hp:3,getroffen:0,verpasst:false}; aktionPuffer.length=0;`);
    let i=0, aus=null;
    while(i<60*40&&!aus){
      const g=E('S.gegner');
      if(taktik==='dauernd') E('aktionPuffer.push(S.t)');
      else if(taktik==='zu_frueh'&&g.zustand==='komm') E('aktionPuffer.push(S.t)');
      else if(taktik==='richtig'&&g.zustand==='wind'&&
              g.t>=E('TUNE.gegnerWindup*(1-TUNE.konterFenster)')+0.02) E('aktionPuffer.push(S.t)');
      E('kampf(1/60); S.t+=1/60');
      i++;
      if(E('S.gegner.hp')<=0) aus='gewinnt';
      if(E('S.hp')<=0||E('S.modus')!=='kampf') aus='verliert';
    }
    ergebnis[taktik]=aus||'offen';
  }
  const ok=ergebnis.richtig==='gewinnt'&&ergebnis.dauernd==='verliert'&&ergebnis.zu_frueh==='verliert';
  return {ok,ergebnis};
}

/* ---- Lauf ----------------------------------------------------------------- */
let hart=0;
const zeile=(s,t)=>console.log(s.padEnd(14)+t);
const meld=(s,t)=>{ hart++; console.log(s.padEnd(14)+'FEHLER  '+t); };

for(const seite of SEITEN){
  if(filter.length&&!filter.some(f=>seite.includes(f))) continue;
  let L;
  try{ L=lade(seite); }catch(e){ meld(seite,'Laden: '+String(e.message).split('\n')[0]); continue; }
  const E=c=>L.api.ev(c);
  const hat=n=>E('typeof '+n)==='function';
  if(!hat('update')||!hat('draw')){ zeile(seite,'ohne update/draw - nur geladen'); continue; }
  const bericht=[];

  /* 1) Baeume */
  try{ const b=baeume(L,seite);
    if(b.fehler.length){ b.fehler.slice(0,6).forEach(f=>meld(seite,'Baum: '+f)); }
    if(b.zahl) bericht.push(b.zahl+' Baeume/'+b.knoten+' Knoten');
  }catch(e){ meld(seite,'Baumpruefung: '+e.message); }

  /* 2) Spielen: Titel -> Intro -> 60 s mit zufaelligen Tasten */
  try{
    L.taste('Space',true); L.taste('Space',false);
    for(let i=0;i<4000&&E('S.modus')==='intro';i++){ E('S.szeneT+=99'); E('update(1/60)'); }
    const tasten=['KeyA','KeyD','KeyD','KeyE','Space','ShiftLeft','KeyW','KeyS','KeyR','KeyQ'];
    let gedrueckt=null;
    const modi=new Set([E('S.modus')]);
    for(let i=0;i<SPIEL_SEK*60;i++){
      if(i%20===0){ if(gedrueckt) L.taste(gedrueckt,false);
        gedrueckt=tasten[Math.floor(L.rng()*tasten.length)]; L.taste(gedrueckt,true); }
      E('update(1/60)'); if(i%6===0) E('draw(1/60)');
      modi.add(E('S.modus'));
      const x=E('S.x'); if(typeof x==='number'&&!isFinite(x)){ meld(seite,'S.x ist '+x+' nach '+(i/60).toFixed(1)+' s'); break; }
    }
    if(gedrueckt) L.taste(gedrueckt,false);
    bericht.push(SPIEL_SEK+' s gespielt, Modi: '+[...modi].join('/'));
  }catch(e){
    meld(seite,'Spiellauf: '+String(e.message)+'  ('+String(e.stack).split('\n').slice(1,3).join(' | ').replace(/\s+/g,' ').slice(0,160)+')');
  }

  /* 3) Nichtstun: frische Seite, nach dem Intro nichts druecken */
  try{
    const N=lade(seite), EN=c=>N.api.ev(c);
    N.taste('Space',true); N.taste('Space',false);
    for(let i=0;i<4000&&EN('S.modus')==='intro';i++){ EN('S.szeneT+=99'); EN('update(1/60)'); }
    const ereig=[]; let lm=EN('S.meldung')||'', lmod=EN('S.modus');
    for(let i=0;i<NICHTS_SEK*60;i++){ EN('update(1/60)');
      const me=EN('S.meldung'), mo=EN('S.modus');
      if(mo!==lmod){ ereig.push(Math.round(i/60)+'s '+lmod+'>'+mo); lmod=mo; }
      if(me&&me!==lm&&EN('S.meldungT')>0){ lm=me; ereig.push(Math.round(i/60)+'s '+me); } }
    const letzte=ereig.length?parseInt(ereig[ereig.length-1],10):0;
    bericht.push('Nichtstun '+NICHTS_SEK+' s: '+ereig.length+' Ereignisse, letztes bei '+letzte+' s'
      +(ereig.length&&ereig.length<=6?' ['+ereig.join('; ')+']':''));
  }catch(e){ meld(seite,'Nichtstun-Lauf: '+e.message); }

  zeile(seite,bericht.join(' | '));
}

/* ---- Konter-Test, nur wenn Level 2 mitlaeuft ------------------------------------ */
if(!filter.length||filter.some(f=>'level2.html'.includes(f))){
  try{ const k=konterLevel2();
    if(k.ok) zeile('Konter L2','richtig gewinnt, Dauerdruecken und zu fruehes Druecken verlieren');
    else meld('Konter L2','erwartet richtig=gewinnt, dauernd=verliert, zu_frueh=verliert - war '+JSON.stringify(k.ergebnis));
  }catch(e){ meld('Konter L2',e.message); }
}

console.log('\n'+(hart?hart+' harte Fehler':'alles gruen')+'  (nicht geprueft: Pixel, Ton, Layout, runner.html)');
process.exit(hart?1:0);
