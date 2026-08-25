/* ============================================================================
   NACHTSCHICHT - GEMEINSAMER UNTERBAU

   Alles, was jedes Level gleich braucht, steht hier genau einmal:
   Bildschirm, Schrift, Bild-Cache, Toene, Spielstand und die Levelleiste.

   Vorher lag der Block in jeder Level-Datei noch einmal drin. Bei zwei Leveln
   ging das gerade so. Bei acht waere jede Aenderung an der Schrift acht
   Aenderungen gewesen - also liegt er jetzt hier.

   Eine Level-Datei bindet die Datei ein und legt danach nur noch drauf:
     <link rel="stylesheet" href="nachtschicht.css">
     <script src="nachtschicht.js"></script>
     <script> Object.assign(P,{...}); Object.assign(SPR,{...}); ... </script>

   Bewusst eine klassische Datei und kein Modul: so laeuft das Spiel auch
   noch per Doppelklick vom Dateisystem, ohne Server.
   ========================================================================== */

/* ==========================================================================
   FARBEN
   Der gemeinsame Grundstock. Jedes Level darf ueberschreiben, was bei ihm
   anders aussieht - mit Object.assign(P,{...}).
   ========================================================================== */
const P = {
  ink:'#07060d', weiss:'#f2f0ff', dim:'#8d86a8', dunkel:'#484263',
  neon:'#ff3d8b', neon2:'#42d9ff', gold:'#ffd447', rot:'#ff4d4d', gruen:'#48e08a',
  boden:'#141726', bodenKante:'#3a3f5c',
};

/* ==========================================================================
   3x5 BITMAP-FONT
   Eigene Schrift statt Browser-Schrift: nur so sitzt jeder Buchstabe auf
   ganzen Pixeln, egal wie stark das Bild hochskaliert wird.
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
   Das ist der Grund, warum ein Bild 1,2 ms statt 4,8 ms braucht: kein Sprite
   und kein Buchstabe wird zweimal Pixel fuer Pixel gemalt.
   ========================================================================== */
const _ids=new WeakMap(); let _nid=0;
const _spr=new Map(), _out=new Map(), _txt=new Map(), _gly=new Map(), _grd=new Map();
const rowsId=r=>{ let i=_ids.get(r); if(i===undefined){ i=++_nid; _ids.set(r,i);} return i; };
function leinwand(w,h){ const c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h));
  const x=c.getContext('2d'); x.imageSmoothingEnabled=false; return [c,x]; }
function verlauf(key,w,h,mal){ let c=_grd.get(key);
  if(!c){ const [cc,xx]=leinwand(w,h); mal(xx); c=cc; _grd.set(key,c); } return c; }

/* Buchstabe im Sprite -> Farbe. Gemeinsamer Grundstock, Level ergaenzen ihn. */
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

const pick = a => a[Math.floor(Math.random()*a.length)];

/* ==========================================================================
   SPRITES, DIE JEDES LEVEL BRAUCHT
   Der Spieler und die paar Moebel, die ueberall vorkommen. Alles Level-eigene
   kommt per Object.assign(SPR,{...}) dazu.
   ========================================================================== */
const KOPF=['..hhh..','.hsssh.','.sssss.','..sss..'];
const geh = beine => [...KOPF,'..ttt..',...beine];

const SPR = {
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

  /* Moebel, die in mehr als einem Level stehen */
  tisch: ['zzzzzzzz','z......z','dd....dd','d......d','d......d','d......d'],
  regal: ['zzzzzzz','zbbbbbz','zzzzzzz','zbbbbbz','zzzzzzz','zbbbbbz','zzzzzzz','ddddddd'],
  /* Tuerblatt muss gefuellt sein - sonst sieht man durch die Tuer die Wand */
  tuer:  ['zzzzzzzz','zjjjjjjz','zjjjjjjz','zjjjjjjz','zjjjjjjz','zjjjjgjz','zjjjjjjz','zjjjjjjz',
          'zjjjjjjz','zjjjjjjz','zjjjjjjz','zzzzzzzz'],
};

/* ==========================================================================
   AUDIO
   Nur die Grundbausteine. Welche Geraeusche und welche Musik daraus werden,
   entscheidet jedes Level fuer sich (SFX und musik()).
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

/* ==========================================================================
   BILDSCHIRM
   320x180 innen. Die Breite waechst auf langen Handys mit, damit keine
   schwarzen Balken bleiben - die Hoehe bleibt fest, sonst stimmen die Pixel
   nicht mehr.
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
{ const fs=document.getElementById('fs');
  if(fs) fs.addEventListener('click',e=>{e.preventDefault();vollbild();}); }

/* ==========================================================================
   DIE LEVEL
   Das Verzeichnis der Nacht. Ein neues Level ist eine Zeile hier - danach
   taucht es in der Leiste auf, ist per Zifferntaste erreichbar, wird vom
   Vorgaenger freigeschaltet und bekommt seinen Platz im Spielstand.
   `nr` ist der Schluessel im Spielstand und darf sich nie mehr aendern.
   ========================================================================== */
const LEVELS = [
  { nr:1, datei:'index.html',  kurz:'DIE SCHULE',   uhr:'16:40', crew:'MAX FERDI' },
  { nr:2, datei:'level2.html', kurz:'BEI MORITZ',   uhr:'21:10', crew:'MORITZ'    },
];

/* ==========================================================================
   DIE JUNGS
   Jedes Level bringt einen aus der Crew, jeder gibt eine Faehigkeit. Die
   Faehigkeiten stehen hier und nicht im Level, damit sie ueberall wirken -
   Max Ferdi macht dich in Level 5 genauso schnell wie in Level 2.
   ========================================================================== */
const CREW = {
  'MAX FERDI': { level:1, was:'+15% TEMPO',            tempo:1.15 },
  'MORITZ':    { level:2, was:'BESSER BEI DEN CHAYAS', chayas:true },
};
/* Tempo multipliziert sich, falls spaeter mehrere Laeufer dazukommen. */
const tempoBonus   = () => ladeCrew().reduce((f,n)=>f*((CREW[n]&&CREW[n].tempo)||1),1);
const hatFaehigkeit = k => ladeCrew().some(n=>CREW[n]&&CREW[n][k]===true);

/* ==========================================================================
   SPIELSTAND
   Ein einziger Eintrag statt frueher drei. Form:
     { crew:['MAX FERDI'], levels:{ '1':{ ge:true, best:98.4 } } }
   `ge` heisst geschafft, `best` ist die Bestzeit in Sekunden.
   ========================================================================== */
const STAND_KEY='nachtschicht.stand';
let _stand=null;

/* Die alten Einzel-Schluessel von vor dem Umbau. Wer schon gespielt hat,
   soll seine Crew und seine Bestzeiten behalten. */
function _uebernehmeAlt(st){
  try{
    const alteCrew=JSON.parse(localStorage.getItem('nachtschicht.crew')||'[]');
    if(Array.isArray(alteCrew)) for(const n of alteCrew) if(!st.crew.includes(n)) st.crew.push(n);
  }catch(e){}
  for(const l of LEVELS){
    const v=parseFloat(localStorage.getItem('nachtschicht.bestzeit'+l.nr));
    /* Eine alte Bestzeit gab es nur, wenn das Level durchgespielt war. */
    if(isFinite(v)) st.levels[l.nr]={ ge:true, best:v };
  }
  return st;
}

function ladeStand(){
  if(_stand) return _stand;
  let st=null;
  try{ st=JSON.parse(localStorage.getItem(STAND_KEY)); }catch(e){}
  if(!st||typeof st!=='object'){ st=_uebernehmeAlt({crew:[],levels:{}}); schreibeStand(st); }
  if(!Array.isArray(st.crew)) st.crew=[];
  if(!st.levels||typeof st.levels!=='object') st.levels={};
  _stand=st; return _stand;
}
function schreibeStand(st){
  _stand=st||_stand;
  try{ localStorage.setItem(STAND_KEY,JSON.stringify(_stand)); }catch(e){}
}

const ladeCrew     = () => ladeStand().crew.slice();
const levelStand   = nr => ladeStand().levels[nr] || {};
const istGeschafft = nr => !!levelStand(nr).ge;
const bestzeit     = nr => { const v=levelStand(nr).best; return isFinite(v)?v:null; };
const levelInfo    = nr => LEVELS.find(l=>l.nr===nr) || null;
/* Level 1 ist immer offen, jedes weitere braucht seinen Vorgaenger. */
const istFrei      = nr => nr<=1 || istGeschafft(nr-1);

function speichereCrew(name){
  const st=ladeStand();
  if(!st.crew.includes(name)){ st.crew.push(name); schreibeStand(); }
}

/* Nach dem Sieg. Gibt true zurueck, wenn es eine neue Bestzeit war -
   damit das Level "NEUE BESTZEIT" einblenden kann. */
function merkeSieg(nr,zeit){
  const st=ladeStand();
  const e=st.levels[nr]||(st.levels[nr]={});
  e.ge=true;
  const neu = isFinite(zeit) && (!isFinite(e.best) || zeit<e.best);
  if(neu) e.best=zeit;
  const info=levelInfo(nr);
  if(info&&info.crew&&!st.crew.includes(info.crew)) st.crew.push(info.crew);
  schreibeStand();
  return neu;
}

/* ==========================================================================
   UEBERGAENGE
   Wo es nach einem gewonnenen Level hingeht. Frueher stand das Ziel als
   fester Dateiname im Level - Level 2 schickte einen zurueck auf Level 1.
   ========================================================================== */
const naechstesLevel = nr => levelInfo(nr+1);
function zumLevel(nr){
  const l=levelInfo(nr); if(!l) return false;
  location.href=l.datei; return true;
}
/* Nach dem Sieg weiter. Gibt es kein naechstes Level, bleibt man da -
   der Sieg-Bildschirm sagt dann, dass hier die Nacht vorerst endet. */
function weiterNachSieg(nr){
  const n=naechstesLevel(nr);
  if(n){ location.href=n.datei; return true; }
  return false;
}

/* ==========================================================================
   LEVELLEISTE
   Gebaut aus LEVELS, damit keine Level-Datei eine Liste der anderen fuehren
   muss. Was noch zu ist, steht trotzdem drin - man soll sehen, dass da noch
   was kommt.
   ========================================================================== */
function baueLevelleiste(aktiv){
  const bar=document.getElementById('levelbar'); if(!bar) return;
  bar.textContent='';
  for(const l of LEVELS){
    const frei=istFrei(l.nr), hier=l.nr===aktiv;
    /* Der Trennpunkt als \u-Escape: so bleibt die Datei reines ASCII und
       haengt nicht davon ab, mit welcher Kodierung sie ausgeliefert wird. */
    const beschriftung=l.nr+' \u00B7 '+l.kurz;
    if(!frei && !hier){
      const s=document.createElement('span');
      s.className='zu'; s.textContent=beschriftung;
      s.title='Erst '+(l.nr-1)+' schaffen';
      bar.appendChild(s);
    } else {
      const a=document.createElement('a');
      a.href=l.datei; a.textContent=beschriftung;
      if(hier) a.className='aktiv';
      bar.appendChild(a);
    }
  }
}

/* Zifferntasten springen ins Level - aber nur, solange nicht gespielt wird.
   Sonst reisst eine 3 mitten im Level das Spiel weg. Welcher Zustand als
   "nicht gespielt" gilt, entscheidet das Level ueber darfWechseln(). */
let darfWechseln = () => true;
addEventListener('keydown',e=>{
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey) return;
  const m=/^(?:Digit|Numpad)([1-9])$/.exec(e.code); if(!m) return;
  const nr=+m[1];
  if(!darfWechseln()) return;
  const l=levelInfo(nr); if(!l||!istFrei(nr)) return;
  e.preventDefault(); location.href=l.datei;
});

/* ==========================================================================
   START
   Die Level-Datei sagt am Ende einmal, welches Level sie ist.
   ========================================================================== */
function levelStart(nr){
  baueLevelleiste(nr);
  return levelInfo(nr);
}
