/* ============================================================================
   NACHTSCHICHT - der gemeinsame Kern

   Alles, was jedes Level braucht und was in keinem Level anders sein darf:
   Bitmap-Font, Bild-Cache, Sprite-Helfer, Ton-Grundlagen, der Bildschirm
   selbst - und der Spielstand.

   Das stand vorher in jeder Level-Datei komplett drin. Bei zwei Dateien ging
   das noch, ab Level 3 waere jede Aenderung dreimal zu machen gewesen, und
   die Kopien waren schon auseinandergelaufen.

   Wichtig: das hier ist ein ganz normales <script>, kein Modul. Was hier oben
   mit const/let steht, sieht die Level-Datei danach direkt - genau so, als
   stuende es weiter oben in derselben Datei. Deshalb darf ein Level nichts
   davon noch einmal deklarieren.

   Was im Level bleibt: die Regler (TUNE), die Welt, der Zustand, die Musik,
   die Geraeusche und alles Gezeichnete.
   ========================================================================== */

/* ==========================================================================
   PALETTE
   Grundfarben fuer alle Level. Ein Level darf einzelne ueberschreiben:
     Object.assign(P,{ boden:'#20182a' });
   ========================================================================== */
const P = {
  ink:'#07060d', wand:'#1d2033', wandHell:'#2a2e46', boden:'#141726', bodenKante:'#3a3f5c',
  weiss:'#f2f0ff', dim:'#8d86a8', dunkel:'#484263',
  neon:'#ff3d8b', neon2:'#42d9ff', gold:'#ffd447', rot:'#ff4d4d', gruen:'#48e08a',
  licht:'#cfe3ff', tuer:'#5a4632', tuerHell:'#7a6244',
};

/* ==========================================================================
   3x5 BITMAP-FONT
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

/* Farbschluessel der Sprites. Ein Level darf eigene Buchstaben dazulegen:
     Object.assign(KEY,{ H:'#1d150e' });
   Aber nur dazulegen - vorhandene Buchstaben bedeuten ueberall dasselbe. */
const KEY = {
  k:'#07060d', s:'#e8b088', h:'#2a1c14', t:'#3ad1a0', p:'#2b2b48', w:'#f2f0ff',
  g:'#ffd447', n:'#ff3d8b', c:'#42d9ff', r:'#ff4d4d', d:'#484263', b:'#6b4a2a',
  o:'#a8681f', e:'#20182e', l:'#ffe08a', v:'#c8324a', m:'#7a2d3d', a:'#1a1626',
  z:'#5a4632', u:'#8c94ad', q:'#2e3350', j:'#3d2f22',
};

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

/* ==========================================================================
   DER SPIELER
   Kopf, Rumpf und Gangbilder sind in jedem Level dieselben. Der Rest der
   Sprites gehoert dem Level:  const SPR={ ...SPIELER, lehrer:[...] };
   ========================================================================== */
const KOPF=['..hhh..','.hsssh.','.sssss.','..sss..'];
const geh = beine => [...KOPF,'..ttt..',...beine];
const SPIELER = {
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

/* ==========================================================================
   TON
   Nur die Grundlagen. Welche Geraeusche und welche Musik daraus werden,
   entscheidet das Level.
   ========================================================================== */
let AC=null, muted=false;
/* Das Level darf hier eine Funktion hinlegen, die laeuft, sobald es zum
   ersten Mal Ton gibt - zum Beispiel um die Musik-Uhr zu stellen. */
let tonBereit=null;
function ensureAudio(){ if(AC) return AC;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); if(tonBereit) tonBereit(); }
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

/* ==========================================================================
   KLEINKRAM
   ========================================================================== */
const pick = a => a[Math.floor(Math.random()*a.length)];
const klemm = (v,min,max) => v<min?min:(v>max?max:v);
const el = id => document.getElementById(id);
/* Bindet eine Touch-Taste. Fehlt die Taste im HTML, passiert nichts -
   nicht jedes Level hat jede Taste. */
const bind=(id,evs,fn)=>{ const n=el(id); if(!n) return;
  evs.forEach(ev=>n.addEventListener(ev,e=>{e.preventDefault();fn();},{passive:false})); };

/* ==========================================================================
   DER SPIELSTAND
   Ein Schluessel fuer alles: wer dabei ist, welche Level offen sind,
   welche geschafft, welche Bestzeit steht.

   Vorher lagen Crew und Bestzeiten in drei losen localStorage-Eintraegen,
   und welches Level offen ist, wusste ueberhaupt niemand.
   ========================================================================== */
const STAND_KEY='nachtschicht.stand';

/* Die alten Eintraege einsammeln, damit niemand seinen Fortschritt verliert. */
function alterStand(){
  const s={ crew:[], offen:[1], geschafft:[], best:{} };
  try{ const c=JSON.parse(localStorage.getItem('nachtschicht.crew')); if(Array.isArray(c)) s.crew=c; }catch(e){}
  for(const nr of [1,2]){
    const v=parseFloat(localStorage.getItem('nachtschicht.bestzeit'+nr));
    if(isFinite(v)){ s.best[nr]=v; s.geschafft.push(nr); s.offen.push(nr+1); }
  }
  /* Max Ferdi gibt es nur, wenn Level 1 durch ist - auch ohne Bestzeit. */
  if(s.crew.includes('MAX FERDI')&&!s.geschafft.includes(1)){ s.geschafft.push(1); s.offen.push(2); }
  return s;
}
function ladeStand(){
  let s=null;
  try{ s=JSON.parse(localStorage.getItem(STAND_KEY)); }catch(e){}
  if(!s||typeof s!=='object') s=alterStand();
  return {
    crew:      Array.isArray(s.crew)?s.crew:[],
    offen:     Array.isArray(s.offen)&&s.offen.length?s.offen:[1],
    geschafft: Array.isArray(s.geschafft)?s.geschafft:[],
    best:      (s.best&&typeof s.best==='object')?s.best:{},
  };
}
function sichereStand(s){ try{ localStorage.setItem(STAND_KEY,JSON.stringify(s)); }catch(e){} }

const STAND = {
  crew(){ return ladeStand().crew; },
  /* Ein Junge kommt dazu. Doppelt geht nicht. */
  crewDazu(name){ const s=ladeStand();
    if(!s.crew.includes(name)){ s.crew.push(name); sichereStand(s); } },
  best(nr){ const v=parseFloat(ladeStand().best[nr]); return isFinite(v)?v:null; },
  /* Gibt true zurueck, wenn es eine neue Bestzeit war. */
  bestSetzen(nr,zeit){ const s=ladeStand(); const alt=parseFloat(s.best[nr]);
    if(isFinite(alt)&&alt<=zeit) return false;
    s.best[nr]=zeit; sichereStand(s); return true; },
  offen(nr){ return ladeStand().offen.includes(nr); },
  geschafft(nr){ return ladeStand().geschafft.includes(nr); },
  /* Level durch: merken und das naechste aufmachen. */
  durch(nr){ const s=ladeStand();
    if(!s.geschafft.includes(nr)) s.geschafft.push(nr);
    if(!s.offen.includes(nr+1)) s.offen.push(nr+1);
    sichereStand(s); },
  /* Nur fuer den Notfall - loescht alles. */
  loeschen(){ try{ localStorage.removeItem(STAND_KEY); }catch(e){} },
};

/* ==========================================================================
   DIE LEVEL
   Ein neues Level braucht hier eine Zeile - und sonst nichts, damit es in
   der Leiste auftaucht und der Uebergang davor es findet.
   ========================================================================== */
const LEVELS=[
  { nr:1, datei:'index.html',  kurz:'DIE SCHULE',   lang:'LEVEL 1 - DIE SCHULE' },
  { nr:2, datei:'level2.html', kurz:'BEI MORITZ',   lang:'LEVEL 2 - VORGLUEHEN' },
  { nr:3, datei:'level3.html', kurz:'NACHTBUS',     lang:'LEVEL 3 - DER NACHTBUS' },
];
const levelInfo = nr => LEVELS.find(l=>l.nr===nr)||null;
const naechstesLevel = nr => levelInfo(nr+1);
function zumLevel(nr){ const l=levelInfo(nr); if(l) location.href=l.datei; }

/* Baut die Leiste unter dem Bildschirm. Das aktive Level steht als
   data-level am Kasten, damit die Leiste schon fertig ist, bevor der
   Bildschirm ausgemessen wird. */
function levelleiste(){
  const box=el('levelbar'); if(!box) return 0;
  const aktiv=parseInt(box.dataset.level,10)||1;
  box.textContent='';
  for(const l of LEVELS){
    const a=document.createElement('a');
    a.href=l.datei;
    const fertig=STAND.geschafft(l.nr);
    a.textContent=l.nr+' · '+l.kurz+(fertig?' ✓':'');
    if(l.nr===aktiv) a.className='aktiv';
    else if(fertig)  a.className='fertig';
    /* Noch nie erreicht: blass, aber trotzdem anklickbar. Wer das Spiel
       zum ersten Mal sieht, soll sehen, dass da noch was kommt. */
    else if(!STAND.offen(l.nr)) a.className='neu';
    box.appendChild(a);
  }
  const b=el('base');
  if(b&&b.firstElementChild){ const i=levelInfo(aktiv); if(i) b.firstElementChild.textContent=i.lang; }
  return aktiv;
}

/* Die Levelwahl unten auf dem Titelbild - eine Zeile, ein Eintrag pro Level.
   Wird es eng, bleiben nur die Zahlen stehen. Geschaffte Level sind gruen,
   das eigene ist blass. */
function zeichneLevelwahl(y,aktiv){
  const luecke=6;
  let teile=LEVELS.map(l=>l.nr+' '+l.kurz);
  const breite=()=>teile.reduce((s,t)=>s+textW(t)+luecke,-luecke);
  if(breite()>W-8) teile=LEVELS.map(l=>String(l.nr));
  let x=Math.round((W-breite())/2);
  LEVELS.forEach((l,i)=>{
    text(teile[i],x,y,l.nr===aktiv?P.dunkel:(STAND.geschafft(l.nr)?P.gruen:P.neon2));
    x+=textW(teile[i])+luecke;
  });
}

/* ==========================================================================
   DER BILDSCHIRM
   ========================================================================== */
const cv=el('c'), ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
let W=320; const H=180;

const IS_TOUCH = navigator.maxTouchPoints>0 || 'ontouchstart' in window || /[?&]touch=1/.test(location.search);
if(IS_TOUCH) document.documentElement.classList.add('touch');
const imVollbild=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);

function anpassen(){
  const rand=(imVollbild()||IS_TOUCH)?0:46;
  const vw=innerWidth-rand, vh=innerHeight-rand;
  /* Breite waechst mit dem Bildschirm mit, damit auf langen Handys keine
     schwarzen Balken bleiben. Die Hoehe bleibt fest, damit die Pixel stimmen. */
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

function vollbild(){
  const root=el('cab');
  if(imVollbild()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
  const req=root.requestFullscreen||root.webkitRequestFullscreen; if(!req) return;
  Promise.resolve(req.call(root)).then(()=>{
    if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
  }).catch(()=>{});
}
if(el('fs')) el('fs').addEventListener('click',e=>{e.preventDefault();vollbild();});

/* Ton und Vollbild gehoeren dem Gehaeuse, nicht dem Level. */
addEventListener('keydown',e=>{
  if(e.repeat) return;
  if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); }
  if(e.code==='KeyF'){ e.preventDefault(); vollbild(); }
});
if(IS_TOUCH) addEventListener('touchstart',function einmal(){ vollbild(); removeEventListener('touchstart',einmal); },{once:true});

/* Das aktive Level steht am levelbar - Leiste bauen, dann ausmessen. */
const AKTIVES_LEVEL = levelleiste();
anpassen();
