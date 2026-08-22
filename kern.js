/* ============================================================================
   NACHTSCHICHT - DER KERN

   Alles, was in jedem Level gleich ist: die Schrift, der Bild-Cache, das
   Zeichnen von Sprites und Text, die Toene, das Aufsetzen der Leinwand und
   das Vollbild.

   Vorher stand dieser Block in jeder Level-Datei noch einmal - dreimal fast
   Zeile fuer Zeile dasselbe. Die Level-INHALTE aehneln sich kaum (Schule,
   Wohnung, Bus haben nichts gemeinsam), aber ihr Unterbau eben schon.

   Wie nacht.js bewusst ein klassisches Script und kein Modul: so laeuft das
   Spiel weiter per Doppelklick ueber file://.

   Ein Level bindet die Datei vor seinem eigenen Script ein und ruft einmal
   kernStart auf:

     kernStart({ farben:{ k:'#000', s:'#e8b088', ... }, kontur:.7 });

   Danach stehen ctx, W, H, sprite(), text(), ton() und der Rest bereit.
   Alles, was ein Level fuer sich braucht - eigene Sprites, eigene Klaenge,
   eigene Regler - bleibt im Level.
   ========================================================================== */

/* ==========================================================================
   3x5 BITMAP-FONT
   Nur Grossbuchstaben, Ziffern und eine Handvoll Zeichen. Alles andere wird
   als ? gezeichnet - Umlaute gibt es im Spiel deshalb als AE, OE, UE.
   ========================================================================== */
var F = {
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
var GLYPH={}; for(var _fk in F) GLYPH[_fk]=F[_fk].split(',');

/* ==========================================================================
   BILD-CACHE  (einmal backen, danach nur noch kopieren)
   Das ist der Grund, warum ein Bild 1,2 statt 4,8 ms braucht: Sprites,
   Konturen, Buchstaben und Verlaeufe werden einmal auf eine kleine Leinwand
   gemalt und danach nur noch kopiert.
   ========================================================================== */
var _ids=new WeakMap(), _nid=0;
var _spr=new Map(), _out=new Map(), _txt=new Map(), _gly=new Map(), _grd=new Map();
var rowsId=function(r){ var i=_ids.get(r); if(i===undefined){ i=++_nid; _ids.set(r,i);} return i; };
function leinwand(w,h){ var c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h));
  var x=c.getContext('2d'); x.imageSmoothingEnabled=false; return [c,x]; }
function verlauf(key,w,h,mal){ var c=_grd.get(key);
  if(!c){ var l=leinwand(w,h); mal(l[1]); c=l[0]; _grd.set(key,c); } return c; }

/* Die Farbtafel der Sprites. Jedes Level bringt seine eigene mit, weil in
   jedem andere Leute vorkommen. */
var KEY={};
/* Wie dunkel die Kontur um eine Figur liegt. Level 1 zieht sie einen Tick
   staerker als die anderen. */
var KONTUR=0.7;

function backeSprite(rows,sc,tint){
  var bw=0, r, i;
  for(r=0;r<rows.length;r++) if(rows[r].length>bw) bw=rows[r].length;
  var l=leinwand(bw*sc,rows.length*sc), c=l[0], x=l[1];
  for(r=0;r<rows.length;r++){ var row=rows[r];
    for(i=0;i<row.length;i++){ var ch=row[i]; if(ch==='.') continue;
      x.fillStyle=tint||KEY[ch]||'#fff'; x.fillRect(i*sc,r*sc,sc,sc); } }
  return c;
}
function holeSprite(rows,sc,tint){ var k=rowsId(rows)+'|'+sc+'|'+(tint||'-');
  var c=_spr.get(k); if(!c){ c=backeSprite(rows,sc,tint); _spr.set(k,c);} return c; }
function sprite(rows,x,y,sc,tint,alpha){
  sc=sc===undefined?1:sc; tint=tint===undefined?null:tint; alpha=alpha===undefined?1:alpha;
  var c=holeSprite(rows,sc,tint);
  if(alpha!==1) ctx.globalAlpha=alpha;
  ctx.drawImage(c,Math.round(x),Math.round(y));
  if(alpha!==1) ctx.globalAlpha=1;
}
function spriteFlip(rows,x,y,sc,tint){
  sc=sc===undefined?1:sc; tint=tint===undefined?null:tint;
  var c=holeSprite(rows,sc,tint);
  ctx.save(); ctx.translate(Math.round(x)+c.width,Math.round(y)); ctx.scale(-1,1);
  ctx.drawImage(c,0,0); ctx.restore();
}
function outline(rows,x,y,sc,a){
  sc=sc===undefined?1:sc; a=a===undefined?KONTUR:a;
  var k=rowsId(rows)+'|'+sc, c=_out.get(k);
  if(!c){ var s=holeSprite(rows,sc,'#000'), l=leinwand(s.width+2*sc,s.height+2*sc);
    var xx=l[1];
    xx.drawImage(s,0,sc); xx.drawImage(s,2*sc,sc); xx.drawImage(s,sc,0); xx.drawImage(s,sc,2*sc);
    c=l[0]; _out.set(k,c); }
  ctx.globalAlpha=a; ctx.drawImage(c,Math.round(x)-sc,Math.round(y)-sc); ctx.globalAlpha=1;
}
function textTo(g,str,x,y,col,s){
  g.fillStyle=col; str=String(str).toUpperCase();
  for(var i=0;i<str.length;i++){ var gl=GLYPH[str[i]]||GLYPH['?'];
    for(var r=0;r<5;r++) for(var c=0;c<3;c++)
      if(gl[r][c]==='1') g.fillRect(x+(i*4+c)*s,y+r*s,s,s); } }
function text(str,x,y,col,s){
  s=s===undefined?1:s;
  str=String(str).toUpperCase();
  for(var i=0;i<str.length;i++){ var ch=str[i]; if(ch===' ') continue;
    var k=ch+col+s, c=_gly.get(k);
    if(!c){ var l=leinwand(3*s,5*s); textTo(l[1],ch,0,0,col,s); c=l[0]; _gly.set(k,c); }
    ctx.drawImage(c,Math.round(x+i*4*s),Math.round(y)); } }
var textW=function(s0,s){ s=s===undefined?1:s; return String(s0).length*4*s-s; };
var textC=function(s0,y,col,s){ s=s===undefined?1:s;
  return text(s0,Math.round((W-textW(s0,s))/2),y,col,s); };
function textGlow(str,x,y,col,s){
  s=s===undefined?1:s;
  str=String(str).toUpperCase(); var k=str+'|'+col+'|'+s;
  var c=_txt.get(k);
  if(!c){ var pad=s, l=leinwand(textW(str,s)+2*pad,5*s+2*pad), xx=l[1];
    xx.globalAlpha=.25;
    textTo(xx,str,pad-s,pad,col,s); textTo(xx,str,pad+s,pad,col,s);
    textTo(xx,str,pad,pad-s,col,s); textTo(xx,str,pad,pad+s,col,s);
    xx.globalAlpha=1; textTo(xx,str,pad,pad,col,s);
    c=l[0]; if(_txt.size>300) _txt.clear(); _txt.set(k,c); }
  ctx.drawImage(c,Math.round(x)-s,Math.round(y)-s); }
var textGlowC=function(s0,y,col,s){ s=s===undefined?1:s;
  return textGlow(s0,Math.round((W-textW(s0,s))/2),y,col,s); };
var pick=function(a){ return a[Math.floor(Math.random()*a.length)]; };

/* ==========================================================================
   AUDIO
   Kein Sample, keine Datei: alles sind ein paar Oszillatoren und Rauschen.
   MUS.next merkt sich, bis wohin die Musik schon eingeplant ist - das legt
   jedes Level selbst fest, hier steht nur der Anschluss.
   ========================================================================== */
var AC=null, muted=false;
var MUS={step:0,next:0};
function ensureAudio(){ if(AC) return AC;
  try{ AC=new (window.AudioContext||window.webkitAudioContext)(); MUS.next=AC.currentTime+.05; }
  catch(e){ AC=null; } return AC; }
function ton(f,when,dur,type,vol){
  type=type||'square'; vol=vol===undefined?.05:vol;
  if(!AC||muted) return; var o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f,when);
  g.gain.setValueAtTime(vol,when); g.gain.exponentialRampToValueAtTime(.0001,when+dur);
  o.connect(g); g.connect(AC.destination); o.start(when); o.stop(when+dur+.02); }
var piep=function(f,d,t,v){ d=d===undefined?.07:d; t=t||'square'; v=v===undefined?.05:v;
  ensureAudio(); if(AC) ton(f,AC.currentTime,d,t,v); };
function glissando(f1,f2,dur,type,vol){
  type=type||'square'; vol=vol===undefined?.05:vol;
  ensureAudio(); if(!AC||muted) return;
  var t0=AC.currentTime, o=AC.createOscillator(), g=AC.createGain();
  o.type=type; o.frequency.setValueAtTime(f1,t0); o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+dur);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+dur+.02); }
function rauschen(dur,vol,when){
  dur=dur===undefined?.25:dur; vol=vol===undefined?.08:vol;
  ensureAudio(); if(!AC||muted) return;
  var n=Math.floor(AC.sampleRate*dur), buf=AC.createBuffer(1,n,AC.sampleRate), d=buf.getChannelData(0);
  for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
  var s=AC.createBufferSource(), g=AC.createGain();
  s.buffer=buf; g.gain.value=vol; s.connect(g); g.connect(AC.destination);
  s.start(when===undefined||when===null?AC.currentTime:when); }

/* ==========================================================================
   LEINWAND, VOLLBILD, HANDY
   320x180 innen. Die Breite waechst auf breiten Schirmen mit, damit auf
   langen Handys keine schwarzen Balken bleiben; die Hoehe bleibt fest,
   damit die Pixel stimmen.
   ========================================================================== */
var cv=null, ctx=null, W=320, H=180;
var BREITE_MIN=320, BREITE_MAX=432;
var IS_TOUCH=navigator.maxTouchPoints>0||'ontouchstart' in window||/[?&]touch=1/.test(location.search);
function imVollbild(){ return !!(document.fullscreenElement||document.webkitFullscreenElement); }
function anpassen(){
  if(!cv) return;
  var rand=(imVollbild()||IS_TOUCH)?0:46;
  var vw=innerWidth-rand, vh=innerHeight-rand;
  W=Math.max(BREITE_MIN,Math.min(BREITE_MAX,Math.round(H*(vw/vh)/2)*2));
  cv.width=W; ctx.imageSmoothingEnabled=false;
  var roh=Math.min(vw/W,vh/H);
  var s=roh<3?Math.max(.5,Math.floor(roh*4)/4):Math.floor(roh);
  cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px';
}
function vollbild(){
  var root=document.getElementById('cab');
  if(imVollbild()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
  var req=root.requestFullscreen||root.webkitRequestFullscreen; if(!req) return;
  Promise.resolve(req.call(root)).then(function(){
    if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){});
  }).catch(function(){});
}

/* Einmal pro Level aufrufen, bevor gezeichnet wird. */
function kernStart(opt){
  opt=opt||{};
  if(opt.farben) KEY=opt.farben;
  if(opt.kontur!==undefined) KONTUR=opt.kontur;
  if(opt.hoehe) H=opt.hoehe;
  if(opt.breiteMin) BREITE_MIN=opt.breiteMin;
  if(opt.breiteMax) BREITE_MAX=opt.breiteMax;
  cv=document.getElementById(opt.leinwand||'c');
  ctx=cv.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  if(IS_TOUCH) document.documentElement.classList.add('touch');
  addEventListener('resize',anpassen);
  addEventListener('orientationchange',function(){ setTimeout(anpassen,120); });
  ['fullscreenchange','webkitfullscreenchange'].forEach(function(e){
    document.addEventListener(e,function(){ setTimeout(anpassen,60); }); });
  anpassen();
  var fs=document.getElementById('fs');
  if(fs) fs.addEventListener('click',function(e){ e.preventDefault(); vollbild(); });
  return ctx;
}
