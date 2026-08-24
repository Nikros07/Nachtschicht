/* ============================================================================
   NACHTSCHICHT - DIE ENGINE

   Alles, was in jedem Level gleich ist: der Font, der Bild-Cache, die
   Zeichenhelfer, der Ton, die Leinwand und die Eingabe.

   Bis Level 2 lag das alles zweimal im Repo - einmal in index.html, einmal
   in level2.html. Ab dem dritten Level waere es dreimal dagewesen. Also
   liegt es jetzt einmal hier.

   Zwei Regeln fuer alles, was hier steht:

   1. Kein Level-Wissen. Diese Datei kennt keine Lehrer, keine Wohnung und
      keinen Pegel. Was ein Level braucht, steht im Level.
   2. Ueberschreibbar. P und KEY sind Objekte, keine Konstanten-Wuesten.
      Ein Level darf per Object.assign eigene Farben nachlegen.

   Geladen wird die Datei als normales <script src> VOR dem Level-Skript.
   Alles hier oben liegt damit im selben globalen Namensraum wie das Level.
   ========================================================================== */

/* ==========================================================================
   PALETTE
   Die Grundfarben der Nacht. Ein Level, das anders aussieht, legt in
   seinem eigenen Skript nach:  Object.assign(P,{ boden:'#...' });
   ========================================================================== */
const P = {
  ink:'#07060d', weiss:'#f2f0ff', dim:'#8d86a8', dunkel:'#484263',
  neon:'#ff3d8b', neon2:'#42d9ff', gold:'#ffd447', rot:'#ff4d4d', gruen:'#48e08a',
  wand:'#1d2033', wandHell:'#2a2e46', boden:'#141726', bodenKante:'#3a3f5c',
  licht:'#cfe3ff', tuer:'#5a4632', tuerHell:'#7a6244',
};

/* ==========================================================================
   3x5 BITMAP-FONT
   Eine Browser-Schrift wuerde bei 320x180 verschmieren. Also malen wir
   die Buchstaben selbst - drei Pixel breit, fuenf hoch.
   ========================================================================== */
const F = {
 A:'010,101,111,101,101', B:'110,101,110,101,110', C:'011,100,100,100,011',
 D:'110,101,101,101,110', E:'111,100,110,100,111', F:'111,100,110,100,100',
 G:'011,100,101,101,011', H:'101,101,111,101,101', I:'111,010,010,010,111',
 J:'001,001,001,101,010', K:'101,110,100,110,101', L:'100,100,100,100,111',
 M:'101,111,111,101,101', N:'101,111,101,101,101', O:'010,101,101,101,010',
 P:'110,101,110,100,100', Q:'010,101,101,110,011', R:'110,101,110,101,101',
 S:'011,100,010,001,110', T:'111,010,010,010,010', U:'101,101,101,101,111',
 V:'101,101,101,101,010', W:'101,101,111,111,101', X:'101,101,010,101,101',
 Y:'101,101,010,010,010', Z:'111,001,010,100,111',
 0:'111,101,101,101,111', 1:'010,110,010,010,111', 2:'111,001,111,100,111',
 3:'111,001,111,001,111', 4:'101,101,111,001,001', 5:'111,100,111,001,111',
 6:'111,100,111,101,111', 7:'111,001,001,001,001', 8:'111,101,111,101,111',
 9:'111,101,111,001,111',
 ' ':'000,000,000,000,000', '.':'000,000,000,000,010', ':':'000,010,000,010,000',
 '-':'000,000,111,000,000', '!':'010,010,010,000,010', '?':'110,001,010,000,010',
 '/':'001,001,010,100,100', '+':'000,010,111,010,000', ',':'000,000,000,010,100',
 '<':'001,010,100,010,001', '>':'100,010,001,010,100', '*':'101,010,111,010,101',
};
const GLYPH={}; for(const k in F) GLYPH[k]=F[k].split(',');

/* ==========================================================================
   BILD-CACHE  (einmal backen, danach nur noch kopieren)
   Hat die Zeichenzeit von 4,8 ms auf 1,2 ms pro Bild gedrueckt.
   ========================================================================== */
const _ids=new WeakMap(); let _nid=0;
const _spr=new Map(), _out=new Map(), _txt=new Map(), _gly=new Map(), _grd=new Map();
const rowsId=r=>{ let i=_ids.get(r); if(i===undefined){ i=++_nid; _ids.set(r,i);} return i; };
function leinwand(w,h){ const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h));
  const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return [c,x]; }
function verlauf(key,w,h,mal){ let c=_grd.get(key);
  if(!c){ const [cc,xx]=leinwand(w,h); mal(xx); c=cc; _grd.set(key,c); } return c; }

/* Der Zeichenschluessel: ein Buchstabe im Sprite = eine Farbe.
   Ein Level darf eigene Buchstaben nachlegen - siehe Object.assign in
   level2.html fuer Moritz' Trikot. */
const KEY={ k:'#07060d', s:'#e8b088', h:'#2a1c14', t:'#3ad1a0', p:'#2b2b48', w:'#f2f0ff',
      g:'#ffd447', n:'#ff3d8b', c:'#42d9ff', r:'#ff4d4d', d:'#484263', b:'#6b4a2a',
      o:'#a8681f', e:'#20182e', l:'#ffe08a', v:'#c8324a', m:'#7a2d3d', a:'#1a1626',
      z:'#5a4632', u:'#8c94ad', q:'#2e3350', j:'#3d2f22',
      /* Moritz: dunkle Haare, weiss-blaues Trikot. Steht hier und nicht im
         Level, weil er ab Level 2 in jedem Level vorkommt. */
      H:'#1d150e', T:'#eef2ff', B:'#2f6fd0' };

function backeSprite(rows,sc,tint){
  let bw=0; for(const r of rows) if(r.length>bw) bw=r.length;
  const [c,x]=leinwand(bw*sc,rows.length*sc);
  for(let r=0;r<rows.length;r++){ const row=rows[r];
    for(let i=0;i<row.length;i++){ const ch=row[i]; if(ch==='.') continue;
      x.fillStyle=tint||KEY[ch]||'#fff'; x.fillRect(i*sc,r*sc,sc,sc); } }
  return c;
}
function holeSprite(rows,sc,tint){ const k=rowsId(rows)+'|'+sc+'|'+(tint||'-');
  let c=_spr.get(k); if(!c){ c=backeSprite(rows,sc,tint); _spr.set(k,c);} return c; }
function sprite(rows,x,y,sc=1,tint=null,alpha=1){
  const c=holeSprite(rows,sc,tint);
  if(alpha!==1) ctx.globalAlpha=alpha;
  ctx.drawImage(c,Math.round(x),Math.round(y));
  if(alpha!==1) ctx.globalAlpha=1;
}
function spriteFlip(rows,x,y,sc=1,tint=null){
  const c=holeSprite(rows,sc,tint);
  ctx.save(); ctx.translate(Math.round(x)+c.width,Math.round(y)); ctx.scale(-1,1);
  ctx.drawImage(c,0,0); ctx.restore();
}
function outline(rows,x,y,sc=1,a=.75){
  const k=rowsId(rows)+'|'+sc; let c=_out.get(k);
  if(!c){ const s=holeSprite(rows,sc,'#000'); const [cc,xx]=leinwand(s.width+2*sc,s.height+2*sc);
    xx.drawImage(s,0,sc); xx.drawImage(s,2*sc,sc); xx.drawImage(s,sc,0); xx.drawImage(s,sc,2*sc);
    c=cc; _out.set(k,c); }
  ctx.globalAlpha=a; ctx.drawImage(c,Math.round(x)-sc,Math.round(y)-sc); ctx.globalAlpha=1;
}
function textTo(g,str,x,y,col,s){
  g.fillStyle=col; str=String(str).toUpperCase();
  for(let i=0;i<str.length;i++){ const gl=GLYPH[str[i]]||GLYPH['?'];
    for(let r=0;r<5;r++) for(let c=0;c<3;c++)
      if(gl[r][c]==='1') g.fillRect(x+(i*4+c)*s,y+r*s,s,s); } }
function text(str,x,y,col,s=1){
  str=String(str).toUpperCase();
  for(let i=0;i<str.length;i++){ const ch=str[i]; if(ch===' ') continue;
    const k=ch+col+s; let c=_gly.get(k);
    if(!c){ const [cc,xx]=leinwand(3*s,5*s); textTo(xx,ch,0,0,col,s); c=cc; _gly.set(k,c); }
    ctx.drawImage(c,Math.round(x+i*4*s),Math.round(y)); } }
const textW=(s0,s=1)=>String(s0).length*4*s-s;
const textC=(s0,y,col,s=1)=>text(s0,Math.round((W-textW(s0,s))/2),y,col,s);
function textGlow(str,x,y,col,s=1){
  str=String(str).toUpperCase(); const k=str+'|'+col+'|'+s;
  let c=_txt.get(k);
  if(!c){ const pad=s,[cc,xx]=leinwand(textW(str,s)+2*pad,5*s+2*pad);
    xx.globalAlpha=.25;
    textTo(xx,str,pad-s,pad,col,s); textTo(xx,str,pad+s,pad,col,s);
    textTo(xx,str,pad,pad-s,col,s); textTo(xx,str,pad,pad+s,col,s);
    xx.globalAlpha=1; textTo(xx,str,pad,pad,col,s);
    c=cc; if(_txt.size>300) _txt.clear(); _txt.set(k,c); }
  ctx.drawImage(c,Math.round(x)-s,Math.round(y)-s); }
const textGlowC=(s0,y,col,s=1)=>textGlow(s0,Math.round((W-textW(s0,s))/2),y,col,s);

/* Ein Kopf ist ein Kopf, in jedem Level. Steht hier, weil spaeter die
   Gesichter der Jungs genau diesen Block ersetzen sollen. */
const KOPF=['..hhh..','.hsssh.','.sssss.','..sss..'];
/* Kopf plus Hals plus Beine - so entsteht eine Spielerhaltung. */
const geh = beine => [...KOPF,'..ttt..',...beine];

/* DU. In jedem Level derselbe Mensch, also auch dasselbe Sprite.
   Ein Level, das eine eigene Haltung braucht - ducken, packen, kontern -
   legt sie sich selbst dazu. */
const HELD = {
  steh: geh(['.tttttt','k.ttt.k','..ttt..','..ppp..','..p.p..','..p.p..','.pp.pp.','.kk..kk']),
  geh:[
    geh(['.tttttt','k.ttt.k','..ttt..','..ppp..','..p.p..','..p.p..','.pp.pp.','.kk..kk']),
    geh(['tttttt.','k.ttt.k','..ttt..','..ppp..','..ppp..','..pp.p.','..pp..p','.kk..kk']),
    geh(['.tttttt','k.ttt.k','..ttt..','..ppp..','..p.p..','.p...p.','.p...p.','kk...kk']),
    geh(['tttttt.','k.ttt.k','..ttt..','..ppp..','..ppp..','.p.pp..','p..pp..','.kk.kk.']),
  ],
  sprung: [...KOPF,'k.ttt.k','.tttttt','..ttt..','..ttt..','..ppp..','.pp.pp.','.p...p.','kk...kk'],
  fall:   [...KOPF,'..ttt..','ktttttk','..ttt..','..ppp..','..p.p..','.pp.pp.','.p...p.','.k...k.'],
  suchen: [...KOPF,'..ttt..','.ttttts','k.ttt.s','..ttt..','..ppp..','..p.p..','.pp.pp.','.kk..kk'],
};

/* Aus einer Liste eine Zeile ziehen. Wird ueberall gebraucht. */
const pick = a => a[Math.floor(Math.random()*a.length)];

/* ==========================================================================
   AUDIO
   Nur die Grundbausteine. Welche Geraeusche ein Level macht und wie seine
   Musik klingt, entscheidet das Level selbst.
   ========================================================================== */
let AC=null, muted=false;
const MUS={step:0,next:0};
function ensureAudio(){ if(AC) return AC;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); MUS.next=AC.currentTime+.05; }
  catch(e){ AC=null; } return AC; }
function ton(f,when,dur,type='square',vol=.05){
  if(!AC||muted) return; const o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,when);
  g.gain.setValueAtTime(vol,when); g.gain.exponentialRampToValueAtTime(.0001,when+dur);
  o.connect(g); g.connect(AC.destination); o.start(when); o.stop(when+dur+.02); }
const piep=(f,d=.07,t='square',v=.05)=>{ ensureAudio(); if(AC) ton(f,AC.currentTime,d,t,v); };
function glissando(f1,f2,dur,type='square',vol=.05){
  ensureAudio(); if(!AC||muted) return;
  const t0=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f1,t0); o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+dur);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+dur+.02); }
function rauschen(dur=.25,vol=.08){
  ensureAudio(); if(!AC||muted) return;
  const n=Math.floor(AC.sampleRate*dur), buf=AC.createBuffer(1,n,AC.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(), g=AC.createGain();
  s.buffer=buf; g.gain.value=vol; s.connect(g); g.connect(AC.destination); s.start(); }
/* Kurzes Rauschen auf einen festen Zeitpunkt - fuer Hi-Hats im Takt. */
function rauschenAuf(when,dauer=.02,vol=.012){
  if(!AC||muted) return;
  const n=Math.floor(AC.sampleRate*dauer), buf=AC.createBuffer(1,n,AC.sampleRate), d=buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  const s=AC.createBufferSource(), g=AC.createGain();
  s.buffer=buf; g.gain.value=vol; s.connect(g); g.connect(AC.destination); s.start(when); }

/* ==========================================================================
   LEINWAND
   320x180 innen. Die Breite waechst auf langen Handys mit, damit keine
   schwarzen Balken bleiben - die Hoehe nie, sonst stimmen die Pixel nicht.
   ========================================================================== */
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
let W=320; const H=180;

const IS_TOUCH = navigator.maxTouchPoints>0 || 'ontouchstart' in window || /[?&]touch=1/.test(location.search);
if(IS_TOUCH) document.documentElement.classList.add('touch');
const imVollbild=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);

function anpassen(){
  const rand=(imVollbild()||IS_TOUCH)?0:46;
  const vw=innerWidth-rand, vh=innerHeight-rand;
  W = Math.max(320, Math.min(432, Math.round(H*(vw/vh)/2)*2));
  cv.width=W;
  ctx.imageSmoothingEnabled=false;
  const roh=Math.min(vw/W,vh/H);
  const s = roh<3 ? Math.max(.5,Math.floor(roh*4)/4) : Math.floor(roh);
  cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px';
}
addEventListener('resize',anpassen);
addEventListener('orientationchange',()=>setTimeout(anpassen,120));
['fullscreenchange','webkitfullscreenchange'].forEach(e=>document.addEventListener(e,()=>setTimeout(anpassen,60)));
anpassen();

function vollbild(){
  const root=document.getElementById('cab');
  if(imVollbild()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
  const req=root.requestFullscreen||root.webkitRequestFullscreen; if(!req) return;
  Promise.resolve(req.call(root)).then(()=>{
    if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
  }).catch(()=>{});
}
const el=id=>document.getElementById(id);
if(el('fs')) el('fs').addEventListener('click',e=>{e.preventDefault();vollbild();});

/* ==========================================================================
   EINGABE

   Die Tasten, die jedes Level hat, liegen hier. Was ein Level extra
   braucht - Taschenlampe, Werfen, Schleichen - gibt es beim Aufruf mit:

     starteEingabe({
       sprung: druckSprung,          // Leertaste und die Sprungtaste
       aktion: druckAktion,          // E, Enter und die E-Taste
       hoch:   true,                 // W und Pfeil hoch (Treppen)
       schleichen: true,             // Shift
       tasten: { KeyQ:lampeSchalten } // alles Weitere
     });

   Die Pufferlisten sind absichtlich hier: Sprungpuffer und Coyote-Zeit
   sind Spielgefuehl, und das soll in jedem Level gleich sein.
   ========================================================================== */
const keys={};
let linksAn=false, rechtsAn=false, sprungAn=false, hochAn=false, schleichAn=false;
let aktionGehalten=false;
let sprungPuffer=[], aktionPuffer=[];

function starteEingabe({ sprung, aktion, tasten={}, hoch=false, schleichen=false }){
  addEventListener('keydown',e=>{
    if(keys[e.code]) return; keys[e.code]=true;
    if(['ArrowLeft','KeyA'].includes(e.code)){ e.preventDefault(); linksAn=true; }
    if(['ArrowRight','KeyD'].includes(e.code)){ e.preventDefault(); rechtsAn=true; }
    if(hoch&&['ArrowUp','KeyW'].includes(e.code)){ e.preventDefault(); hochAn=true; }
    if(e.code==='Space'){ e.preventDefault(); sprung(); }
    if(['KeyE','Enter'].includes(e.code)){ e.preventDefault(); aktionGehalten=true; aktion(); }
    if(schleichen&&['ShiftLeft','ShiftRight'].includes(e.code)){ e.preventDefault(); schleichAn=true; }
    if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); }
    if(e.code==='KeyF'){ e.preventDefault(); vollbild(); }
    const extra=tasten[e.code];
    if(extra){ e.preventDefault(); extra(e); }
  });
  addEventListener('keyup',e=>{ keys[e.code]=false;
    if(['ArrowLeft','KeyA'].includes(e.code)) linksAn=false;
    if(['ArrowRight','KeyD'].includes(e.code)) rechtsAn=false;
    if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
    if(['ShiftLeft','ShiftRight'].includes(e.code)) schleichAn=false;
    if(['KeyE','Enter'].includes(e.code)) aktionGehalten=false;
    if(e.code==='Space') sprungAn=false;
  });
  /* Fenster weg heisst: alle Tasten los. Sonst laeuft man nach dem
     Alt-Tab weiter gegen die Wand. */
  addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=hochAn=schleichAn=aktionGehalten=false; });

  /* Touch. Ein Level, das keine Treppen hat, laesst #tup einfach weg -
     bind() haelt fehlende Tasten aus. */
  const bind=(id,evs,fn)=>{ const n=el(id); if(!n) return;
    evs.forEach(ev=>n.addEventListener(ev,e=>{e.preventDefault();fn();},{passive:false})); };
  const AN=['touchstart','mousedown'], AUS=['touchend','mouseup','touchcancel'];
  bind('tleft', AN,()=>linksAn=true);   bind('tleft', AUS,()=>linksAn=false);
  bind('tright',AN,()=>rechtsAn=true);  bind('tright',AUS,()=>rechtsAn=false);
  bind('tup',   AN,()=>hochAn=true);    bind('tup',   AUS,()=>hochAn=false);
  bind('tjump', AN,sprung);             bind('tjump', AUS,()=>sprungAn=false);
  bind('thit',  AN,()=>{ aktionGehalten=true; aktion(); });
  bind('thit',  AUS,()=>aktionGehalten=false);
  bind('tsneak',AN,()=>schleichAn=true);bind('tsneak',AUS,()=>schleichAn=false);

  if(IS_TOUCH) addEventListener('touchstart',
    function einmal(){ vollbild(); removeEventListener('touchstart',einmal); },{once:true});
}
