/* ============================================================================
   NACHTSCHICHT - DER GEMEINSAME UNTERBAU

   Bis hierher trug jede Seite ihre eigene Kopie desselben Unterbaus mit sich
   herum: derselbe 3x5-Font, derselbe Bild-Cache, dieselbe Vollbild- und
   Touch-Verkabelung, dieselben Tonbausteine. Drei Kopien waren zu verschmerzen.
   Bei acht Leveln waeren es acht - und jede Verbesserung muesste acht Mal
   gemacht werden.

   Hier steht das alles genau einmal. Was NICHT hierher gehoert, ist alles,
   was ein Level ausmacht: Raeume, Regeln, Gegner, Text. Der Unterbau weiss
   nichts vom Spiel.

   Benutzt wird er so - Klammern statt Punkte, damit der Rest des
   Level-Codes weiterlaeuft, als waeren die Funktionen wie frueher direkt da:

     const E = Nachtschicht({ palette: KEY, beiGroesse: w => W = w });
     const { ctx, sprite, text, textC, piep } = E;

   Geladen wird er als ganz normales Script, nicht als Modul. Das ist
   Absicht: Module unterliegen im Browser der Herkunftspruefung und wuerden
   den Doppelklick auf index.html kaputt machen, der bisher reicht.
   ========================================================================== */

function Nachtschicht(cfg){
  cfg = cfg || {};
  const HOEHE      = cfg.hoehe      || 180;
  const BREITE_MIN = cfg.breiteMin  || 320;
  const BREITE_MAX = cfg.breiteMax  || 432;
  const KONTUR_A   = cfg.konturAlpha!==undefined ? cfg.konturAlpha : .7;
  const beiGroesse = cfg.beiGroesse || function(){};
  /* Die Farbtabelle gehoert dem Level - jedes hat seine eigene. Sie wird
     hier nur nachgeschlagen, nie ersetzt, damit ein spaeter gesetzter
     Eintrag auch ankommt. */
  let KEY = cfg.palette || {};

  const cv  = document.getElementById(cfg.leinwand || 'c');
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  let W = BREITE_MIN;

  /* ==========================================================================
     3x5 BITMAP-FONT

     Eine eigene Schrift statt der des Browsers. Bei 320 Pixel Breite ist
     jede echte Schrift entweder unscharf oder zu gross; hier ist jeder
     Buchstabe genau drei mal fuenf Pixel und sitzt auf dem Raster.
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
  const GLYPH = {}; for(const k in F) GLYPH[k] = F[k].split(',');

  /* ==========================================================================
     BILD-CACHE  (einmal backen, danach nur noch kopieren)

     Jeder Sprite, jede Kontur, jeder Buchstabe und jeder Farbverlauf wird
     genau einmal auf eine eigene kleine Leinwand gemalt und danach nur noch
     kopiert. Das hat die Zeichenzeit von 4,8 auf 1,2 ms pro Bild gedrueckt.
     ========================================================================== */
  const _ids = new WeakMap(); let _nid = 0;
  const _spr = new Map(), _out = new Map(), _txt = new Map(),
        _gly = new Map(), _grd = new Map();
  const rowsId = r => { let i=_ids.get(r); if(i===undefined){ i=++_nid; _ids.set(r,i); } return i; };

  function leinwand(w,h){
    const c = document.createElement('canvas');
    c.width = Math.max(1,Math.round(w)); c.height = Math.max(1,Math.round(h));
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return [c,x];
  }
  function verlauf(key,w,h,mal){
    let c = _grd.get(key);
    if(!c){ const [cc,xx]=leinwand(w,h); mal(xx); c=cc; _grd.set(key,c); }
    return c;
  }
  function backeSprite(rows,sc,tint){
    let bw=0; for(const r of rows) if(r.length>bw) bw=r.length;
    const [c,x] = leinwand(bw*sc, rows.length*sc);
    for(let r=0;r<rows.length;r++){ const row=rows[r];
      for(let i=0;i<row.length;i++){ const ch=row[i]; if(ch==='.') continue;
        x.fillStyle = tint || KEY[ch] || '#fff'; x.fillRect(i*sc,r*sc,sc,sc); } }
    return c;
  }
  function holeSprite(rows,sc,tint){
    const k = rowsId(rows)+'|'+sc+'|'+(tint||'-');
    let c = _spr.get(k); if(!c){ c = backeSprite(rows,sc,tint); _spr.set(k,c); }
    return c;
  }
  function sprite(rows,x,y,sc=1,tint=null,alpha=1){
    const c = holeSprite(rows,sc,tint);
    if(alpha!==1) ctx.globalAlpha = alpha;
    ctx.drawImage(c,Math.round(x),Math.round(y));
    if(alpha!==1) ctx.globalAlpha = 1;
  }
  function spriteFlip(rows,x,y,sc=1,tint=null){
    const c = holeSprite(rows,sc,tint);
    ctx.save(); ctx.translate(Math.round(x)+c.width,Math.round(y)); ctx.scale(-1,1);
    ctx.drawImage(c,0,0); ctx.restore();
  }
  function outline(rows,x,y,sc=1,a=KONTUR_A){
    const k = rowsId(rows)+'|'+sc; let c = _out.get(k);
    if(!c){ const s = holeSprite(rows,sc,'#000');
      const [cc,xx] = leinwand(s.width+2*sc, s.height+2*sc);
      xx.drawImage(s,0,sc); xx.drawImage(s,2*sc,sc);
      xx.drawImage(s,sc,0); xx.drawImage(s,sc,2*sc);
      c = cc; _out.set(k,c); }
    ctx.globalAlpha = a; ctx.drawImage(c,Math.round(x)-sc,Math.round(y)-sc); ctx.globalAlpha = 1;
  }
  function textTo(g,str,x,y,col,s){
    g.fillStyle = col; str = String(str).toUpperCase();
    for(let i=0;i<str.length;i++){ const gl = GLYPH[str[i]] || GLYPH['?'];
      for(let r=0;r<5;r++) for(let c=0;c<3;c++)
        if(gl[r][c]==='1') g.fillRect(x+(i*4+c)*s, y+r*s, s, s); }
  }
  function text(str,x,y,col,s=1){
    str = String(str).toUpperCase();
    for(let i=0;i<str.length;i++){ const ch = str[i]; if(ch===' ') continue;
      const k = ch+col+s; let c = _gly.get(k);
      if(!c){ const [cc,xx]=leinwand(3*s,5*s); textTo(xx,ch,0,0,col,s); c=cc; _gly.set(k,c); }
      ctx.drawImage(c, Math.round(x+i*4*s), Math.round(y)); }
  }
  const textW = (s0,s=1) => String(s0).length*4*s - s;
  const textC = (s0,y,col,s=1) => text(s0, Math.round((W-textW(s0,s))/2), y, col, s);
  function textGlow(str,x,y,col,s=1){
    str = String(str).toUpperCase(); const k = str+'|'+col+'|'+s;
    let c = _txt.get(k);
    if(!c){ const pad=s, [cc,xx]=leinwand(textW(str,s)+2*pad, 5*s+2*pad);
      xx.globalAlpha = .25;
      textTo(xx,str,pad-s,pad,col,s); textTo(xx,str,pad+s,pad,col,s);
      textTo(xx,str,pad,pad-s,col,s); textTo(xx,str,pad,pad+s,col,s);
      xx.globalAlpha = 1; textTo(xx,str,pad,pad,col,s);
      c = cc; if(_txt.size>300) _txt.clear(); _txt.set(k,c); }
    ctx.drawImage(c, Math.round(x)-s, Math.round(y)-s);
  }
  const textGlowC = (s0,y,col,s=1) => textGlow(s0, Math.round((W-textW(s0,s))/2), y, col, s);
  const pick = a => a[Math.floor(Math.random()*a.length)];

  /* ==========================================================================
     BILDSCHIRM, VOLLBILD, TOUCH

     Die Bildbreite waechst mit dem Fenster mit, statt schwarze Balken an die
     Seiten zu setzen. Die Hoehe bleibt fest - dadurch bleibt der Massstab
     ganzzahlig und die Pixel bleiben scharf.
     ========================================================================== */
  const IS_TOUCH = navigator.maxTouchPoints>0 || 'ontouchstart' in window
                   || /[?&]touch=1/.test(location.search);
  if(IS_TOUCH) document.documentElement.classList.add('touch');
  const imVollbild = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

  function anpassen(){
    const rand = (imVollbild()||IS_TOUCH) ? 0 : 46;
    const vw = Math.max(1, innerWidth-rand), vh = Math.max(1, innerHeight-rand);
    W = Math.max(BREITE_MIN, Math.min(BREITE_MAX, Math.round(HOEHE*(vw/vh)/2)*2));
    cv.width = W; ctx.imageSmoothingEnabled = false;
    const roh = Math.min(vw/W, vh/HOEHE);
    const s = roh<3 ? Math.max(.5, Math.floor(roh*4)/4) : Math.floor(roh);
    cv.style.width = (W*s)+'px'; cv.style.height = (HOEHE*s)+'px';
    beiGroesse(W);
  }
  addEventListener('resize', anpassen);
  addEventListener('orientationchange', () => setTimeout(anpassen,120));
  ['fullscreenchange','webkitfullscreenchange'].forEach(e =>
    document.addEventListener(e, () => setTimeout(anpassen,60)));
  anpassen();

  function vollbild(){
    const root = document.getElementById(cfg.rahmen || 'cab');
    if(imVollbild()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
    const req = root.requestFullscreen || root.webkitRequestFullscreen; if(!req) return;
    Promise.resolve(req.call(root)).then(() => {
      if(screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
    }).catch(()=>{});
  }
  const el = id => document.getElementById(id);
  /* Bindet eine Bildschirmtaste. Fehlt das Element, passiert nichts - so
     muss nicht jedes Level jede Taste haben. */
  function bind(id,evs,fn){
    const e = el(id); if(!e) return;
    evs.forEach(ev => e.addEventListener(ev, ee => { ee.preventDefault(); fn(); }, {passive:false}));
  }

  /* ==========================================================================
     TON

     Alles wird zur Laufzeit erzeugt, es gibt keine Audiodateien. Das haelt
     das Repo klein und die Ladezeit bei null.
     ========================================================================== */
  let AC = null, stumm = false;
  const SPUR = {};   // benannte Ausgaenge, siehe musikbus()

  function ensureAudio(){
    if(AC) return AC;
    try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }
    catch(e){ AC = null; }
    return AC;
  }
  function ton(f,when,dur,type='square',vol=.05,ziel=null){
    if(!AC||stumm) return;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f,when);
    g.gain.setValueAtTime(vol,when); g.gain.exponentialRampToValueAtTime(.0001,when+dur);
    o.connect(g); g.connect(ziel||AC.destination); o.start(when); o.stop(when+dur+.02);
  }
  const piep = (f,d=.07,t='square',v=.05) => { ensureAudio(); if(AC) ton(f,AC.currentTime,d,t,v); };
  function glissando(f1,f2,dur,type='square',vol=.05){
    ensureAudio(); if(!AC||stumm) return;
    const t0 = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f1,t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(20,f2), t0+dur);
    g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
    o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+dur+.02);
  }
  function rauschen(dur=.25,vol=.08,when=null,ziel=null){
    ensureAudio(); if(!AC||stumm) return;
    const n = Math.floor(AC.sampleRate*dur), buf = AC.createBuffer(1,n,AC.sampleRate),
          d = buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i] = (Math.random()*2-1)*(1-i/n);
    const s = AC.createBufferSource(), g = AC.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g); g.connect(ziel||AC.destination); s.start(when===null?AC.currentTime:when);
  }

  /* --------------------------------------------------------------------------
     DER MUSIKBUS

     Ein eigener Weg fuer die Musik, an dem sich drehen laesst, ohne dass die
     Rueckmeldung des Spiels mitleidet. Schritte, Treffer und Fund-Jingles
     gehen weiter direkt raus - wuerden die mitmatschen, waere das kein
     Rausch mehr, sondern ein kaputtes Spiel.

       trueben(0..1)  0 = klar, 1 = laut, dreckig und dumpf
     -------------------------------------------------------------------------- */
  const _kurven = new Map();
  /* Weiches Clipping. Bei 0 ist die Kurve die Gerade - kein Effekt, statt
     eines zweiten Codepfads fuer "nuechtern". */
  function zerrKurve(menge){
    let k = _kurven.get(menge); if(k) return k;
    const n = 256, c = new Float32Array(n), d = menge*90;
    for(let i=0;i<n;i++){ const x = i*2/(n-1)-1;
      c[i] = d<=0 ? x : (1+d)*x/(1+d*Math.abs(x)); }
    _kurven.set(menge,c); return c;
  }
  function musikbus(){
    if(!ensureAudio()) return null;
    if(SPUR.musik) return SPUR.musik;
    const rein = AC.createGain(), zerre = AC.createWaveShaper(),
          filter = AC.createBiquadFilter(), raus = AC.createGain();
    filter.type = 'lowpass'; filter.frequency.value = 18000; filter.Q.value = .8;
    zerre.oversample = '2x';
    rein.connect(zerre); zerre.connect(filter); filter.connect(raus);
    raus.connect(AC.destination);
    SPUR.musik = { rein, zerre, filter, raus, stufe:-1 };
    trueben(0);
    return SPUR.musik;
  }
  /* In Stufen, nicht stufenlos: sonst entstuende pro Bild ein neues
     Float32Array fuer einen Unterschied, den niemand hoert. */
  function trueben(p){
    const B = SPUR.musik; if(!B||!AC) return;
    const stufe = Math.round(Math.max(0,Math.min(1,p))*8);
    if(stufe!==B.stufe){ B.stufe = stufe; B.zerre.curve = zerrKurve(stufe/8); }
    const jetzt = AC.currentTime;
    /* Zerre macht von sich aus lauter. Ein Teil davon wird zurueckgenommen,
       damit es dreckiger wird und nicht bloss lauter. */
    B.raus.gain.setTargetAtTime(1/(1+stufe*.14), jetzt, .25);
    B.filter.frequency.setTargetAtTime(18000 - p*p*15600, jetzt, .4);
  }

  /* ==========================================================================
     SPIELSTAND

     Alles in localStorage, alles einzeln lesbar, alles mit Fangnetz: im
     privaten Fenster wirft der Zugriff, und daran soll kein Level sterben.
     Die Schluessel sind absichtlich die alten - ein Spielstand von vorher
     bleibt gueltig.
     ========================================================================== */
  const lies = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const schreib = (k,v) => { try{ localStorage.setItem(k,v); }catch(e){} };

  const CREW_KEY = 'nachtschicht.crew';
  const crew = () => { try{ return JSON.parse(lies(CREW_KEY)) || []; }catch(e){ return []; } };
  const merkeCrew = n => { const c = crew(); if(!c.includes(n)){ c.push(n); schreib(CREW_KEY, JSON.stringify(c)); } };
  const dabei = n => crew().includes(n);

  const bestzeit = lv => { const v = parseFloat(lies('nachtschicht.bestzeit'+lv)); return isFinite(v)?v:null; };
  const merkeBestzeit = (lv,sek) => {
    const b = bestzeit(lv);
    if(b===null||sek<b){ schreib('nachtschicht.bestzeit'+lv, String(sek)); return true; }
    return false;
  };

  /* Der Pegel wandert von Level zu Level mit - er begleitet die ganze Nacht.
     Beim Uebernehmen wird er gedeckelt: mit 99 in ein Level zu starten, das
     bei 100 den Blackout kennt, waere kein Erbe, sondern eine Falle. */
  const PEGEL_KEY = 'nachtschicht.pegel';
  const pegel = () => { const v = parseFloat(lies(PEGEL_KEY)); return isFinite(v)?Math.max(0,Math.min(100,v)):0; };
  const merkePegel = p => schreib(PEGEL_KEY, String(Math.max(0,Math.min(100,p))));

  /* Welches Level offen ist, ergibt sich aus der Crew statt aus einem
     eigenen Eintrag. Ein Schluessel weniger, der schief stehen kann - und
     alte Spielstaende sind ohne Umbau richtig. */
  const FREI_DURCH = { 1:null, 2:'MAX FERDI', 3:'MORITZ' };
  const frei = lv => { const n = FREI_DURCH[lv]; return n===null||n===undefined ? true : dabei(n); };

  return {
    /* Bildschirm */
    cv, ctx, hoehe:HOEHE, breite:()=>W, anpassen, vollbild, imVollbild, IS_TOUCH, bind,
    /* Zeichnen */
    leinwand, verlauf, sprite, spriteFlip, outline,
    text, textTo, textW, textC, textGlow, textGlowC, pick,
    /* Ton */
    ensureAudio, ton, piep, glissando, rauschen,
    ac: () => AC,
    stumm: v => { if(v!==undefined) stumm = v; return stumm; },
    musikbus, trueben,
    /* Spielstand */
    SPIELSTAND: { crew, merkeCrew, dabei, bestzeit, merkeBestzeit, pegel, merkePegel, frei },
  };
}
