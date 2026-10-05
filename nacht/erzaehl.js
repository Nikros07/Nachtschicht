/* ============================================================================
   NACHTSCHICHT - ENGINE: erzaehl
   Was die Nacht erzaehlt, ohne dass das Spiel dafuer anhalten muss:
   STIMMEN (Farbe/Ton je Sprecher), zeichneKarte (Text mit |), KAPITELKARTE
   (Uhrzeit/Ort zu Levelbeginn), PLAUSCH (Untertitel beim Gehen), MOMENTE
   (Polaroids) und die drei Haken, die jedes Level ruft:

     neuesSpiel():        PLAUSCH.lade(PLAUSCH_ZEILEN); kapitelZeigen(N);
     update(dt):          if(erzaehlTakt(dt)) return;      // erste Zeile
     draw():              erzaehlZeichne();                // letzte Zeile
     Aktionstaste/Tippen: if(erzaehlTaste()) return;       // erste Zeile
     mobilKontext():      const k=erzaehlKontext(); if(k) return k;

   Daten kommen aus texte.js. Fehlt die Datei oder ein Eintrag, passiert
   nichts. Pflichtinformation gehoert nie in den Plausch (nicht garantiert).
   Klassisches Script, kein ES-Modul. Nur Canvas-Text: Grossbuchstaben.
   Braucht (mit typeof geschuetzt): nacht.js, bild.js, ton.js, komfort.js.
   ========================================================================== */

const ERZAEHL={
  PLAUSCH_ABSTAND:14,       // Sekunden zwischen zwei Ambient-Zeilen
  PLAUSCH_HOEHE:11,
  PLAUSCH_BALKEN:.55,       // Alpha des Balkens
  PLAUSCH_BASIS:2.4, PLAUSCH_JE_ZEICHEN:.07, PLAUSCH_BLENDE:.2,
  PLAUSCH_QUEUE:2,          // so viele Ausloeser-Zeilen warten hoechstens
  KAPITEL_DAUER:3.5, KAPITEL_FREI:.6, KAPITEL_BLENDE:.25, KAPITEL_ALPHA:.94,
  BISHER_ANZAHL:2,
  MOMENT_DAUER:3.0, MOMENT_FREI:.8, MOMENT_GESAMT:8,
  STANDARD_FARBE:'#42d9ff', STANDARD_TON:247,
};

/* ------------------------------------------------------------ STIMMEN --- */
const STIMMEN={
  'MORITZ':{farbe:'#ffb34d',ton:262}, 'JONAS':{farbe:'#9be37a',ton:330},
  'DENNIS':{farbe:'#4da6ff',ton:196}, 'SEMIH':{farbe:'#c58bff',ton:294},
  'LEA':{farbe:'#ff9ecb',ton:392},     'MAX FERDI':{farbe:'#42d9ff',ton:349},
  'TOBI':{farbe:'#7fe0d0',ton:311},    'MIA':{farbe:'#ffd447',ton:440},
  'SOPHIE':{farbe:'#ff8a3d',ton:415},  'KIRA':{farbe:'#b0b8ff',ton:370},
  'MARVIN':{farbe:'#ff5a5a',ton:175},  'MAMA':{farbe:'#f2f0ff',ton:330},
};
const _stimme=wer=>STIMMEN[String(wer==null?'':wer).trim().toUpperCase()]||null;
function stimmeFarbe(wer){ const s=_stimme(wer); return s?s.farbe:ERZAEHL.STANDARD_FARBE; }
function stimmePiep(wer){
  try{
    if(typeof piep!=='function'||(typeof muted!=='undefined'&&muted)) return;
    const s=_stimme(wer); piep(s?s.ton:ERZAEHL.STANDARD_TON,.04,'square',.015);
  }catch(e){}
}

/* -------------------------------------------------------------- KARTE --- */
/* '|' ist fester Umbruch, lange Zeilen brechen selbst. Rueckgabe: Hoehe. */
function zeichneKarte(txt,y,col,s=1){
  const abstand=6*s+2; let n=0;
  try{
    for(const teil of String(txt==null?'':txt).split('|')){
      const zl=(typeof umbrich==='function')?umbrich(teil,W-24,s):[teil];
      for(const z of (zl.length?zl:[''])){ textC(z,y+n*abstand,col,s); n++; }
    }
  }catch(e){}
  return n*abstand;
}

/* ------------------------------------------------- Hilfen fuer Alpha --- */
function _mitAlpha(a,fn){
  const alt=ctx.globalAlpha; ctx.globalAlpha=Math.max(0,Math.min(1,a));
  try{ fn(); } finally { ctx.globalAlpha=alt; }
}
/* Ein- und Ausblenden: 0..1 aus Zeit t, Gesamtdauer d, Blende b */
const _blende=(t,d,b)=>Math.max(0,Math.min(1,t/b,(d-t)/b));

/* ------------------------------------------------------ KAPITELKARTE --- */
const KAPITEL={ aktiv:false, t:0, n:0, d:0, k:null, zeilen:[], gelaufen:false };

/* Die ersten zwei passenden BISHER-Zeilen (nach Gewicht), ohne Praefix. */
function kapitelBisher(n){
  const alle=(typeof TEXTE_BISHER!=='undefined'&&Array.isArray(TEXTE_BISHER))?TEXTE_BISHER:[];
  return alle
    .map((e,i)=>({e,i}))
    .filter(o=>o.e&&o.e.txt&&(o.e.ab||0)<=n&&bedingungErfuellt(o.e.wenn))
    .sort((a,b)=>((b.e.g||0)-(a.e.g||0))||(a.i-b.i))
    .slice(0,ERZAEHL.BISHER_ANZAHL).map(o=>o.e.txt);
}

function kapitelZeigen(n){
  if(KAPITEL.gelaufen) return;           // Wiederholungsversuch ohne Neuladen
  KAPITEL.gelaufen=true;
  try{
    const k=(typeof TEXTE_KAPITEL!=='undefined')?TEXTE_KAPITEL[n]:null;
    if(!k) return;
    const b=n>1?kapitelBisher(n):[];
    KAPITEL.zeilen=b.map((t,i)=>i===0?'BISHER: '+t:t);
    KAPITEL.k=k; KAPITEL.n=n; KAPITEL.t=0; KAPITEL.d=ERZAEHL.KAPITEL_DAUER; KAPITEL.aktiv=true;
  }catch(e){ KAPITEL.aktiv=false; }
}
const kapitelAktiv=()=>KAPITEL.aktiv;

function _kapitelZeichne(){
  const a=_blende(KAPITEL.t,KAPITEL.d,ERZAEHL.KAPITEL_BLENDE), k=KAPITEL.k||{};
  _mitAlpha(a*ERZAEHL.KAPITEL_ALPHA,()=>{ ctx.fillStyle='#08060f'; ctx.fillRect(0,0,W,H); });
  _mitAlpha(a,()=>{
    if(k.zeit) textC(k.zeit,48,'#ffd447',3);
    if(k.ort) textC(k.ort,76,'#f2f0ff',2);
    if(k.zeile) textC(k.zeile,100,'#8d86a8',1);
    KAPITEL.zeilen.forEach((z,i)=>textC(z,128+i*10,'#4a4363',1));
    textC(IS_TOUCH?'TIPPEN':'E / TIPPEN',H-12,'#4a4363',1);
  });
}

/* ------------------------------------------------------------- MOMENTE --- */
const _momente=()=>{ if(!NACHT.momenteBest) NACHT.momenteBest=[]; return NACHT.momenteBest; };
const MOMENT_KARTE={ aktiv:false, t:0, n:0, d:0 };
const _uhr=()=>(typeof performance!=='undefined'?performance.now():Date.now())/1000;

const MOMENT={
  hat:n=>flag('moment'+n),
  anzahl(){ let c=0; for(let i=1;i<=ERZAEHL.MOMENT_GESAMT;i++) if(flag('moment'+i)) c++; return c; },
  fund(n){
    if(this.hat(n)) return false;
    setzeFlag('moment'+n);
    const b=_momente(); if(!b.includes(n)){ b.push(n); speichereStand(); }
    try{
      if(typeof TEXTE_MOMENTE!=='undefined'&&TEXTE_MOMENTE[n]){
        MOMENT_KARTE.aktiv=true; MOMENT_KARTE.t=0; MOMENT_KARTE.n=n; MOMENT_KARTE.d=ERZAEHL.MOMENT_DAUER;
      }
      if(typeof piep==='function'){ piep(880,.06,'sine',.04); piep(1175,.08,'sine',.04); }
    }catch(e){}
    return true;
  },
  /* Der Fund auf der Karte: 9x8, weisser Rahmen, dunkle Mitte, eine Ecke blinkt (1 Hz). */
  zeichneFund(x,y,n){
    if(this.hat(n)) return;
    x=Math.round(x); y=Math.round(y);
    ctx.fillStyle='#f2f0ff'; ctx.fillRect(x,y,9,8);
    ctx.fillStyle='#1d1830'; ctx.fillRect(x+1,y+1,7,5);
    if(Math.floor(_uhr()*FX.hz(1)*2)%2===0){ ctx.fillStyle='#ffd447'; ctx.fillRect(x+7,y+1,1,1); }
  },
};

function _momentZeichne(){
  const t=(typeof TEXTE_MOMENTE!=='undefined')?TEXTE_MOMENTE[MOMENT_KARTE.n]:null; if(!t) return;
  const a=_blende(MOMENT_KARTE.t,MOMENT_KARTE.d,.25);
  const w=132, h=74, x=Math.round((W-w)/2), y=Math.round((H-h)/2);
  _mitAlpha(a*.7,()=>{ ctx.fillStyle='#08060f'; ctx.fillRect(0,0,W,H); });
  _mitAlpha(a,()=>{
    ctx.fillStyle='#f2f0ff'; ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#08060f'; ctx.fillRect(x,y,w,11);
    text('MOMENT '+MOMENT_KARTE.n+' VON '+ERZAEHL.MOMENT_GESAMT,x+4,y+3,'#ffd447');
    const g=ctx.createLinearGradient(0,y+14,0,y+52);
    g.addColorStop(0,'#2a2246'); g.addColorStop(1,'#1d1830');
    ctx.fillStyle=g; ctx.fillRect(x+10,y+14,112,38);
    const mitte=(s,yy)=>text(s,Math.round(x+(w-textW(s))/2),yy,'#08060f');
    if(t.l1) mitte(t.l1,y+56);
    if(t.l2) mitte(t.l2,y+65);
  });
}

/* ------------------------------------------------------------- PLAUSCH --- */
const PLAUSCH={
  y:null,                      // null = Standard (unten, am Handy oben)
  sperre:false,                // ein Level darf den Plausch anhalten
  zeilen:[], gespielt:{}, t:0, abstand:0, warte:[], jetzt:null,

  lade(zeilen){
    this.zeilen=Array.isArray(zeilen)?zeilen:[]; this.gespielt={}; this.t=0;
    this.abstand=0; this.warte=[]; this.jetzt=null;
  },
  _blockiert(){
    try{
      if(typeof gespraechAktiv==='function'&&gespraechAktiv()) return true;
      if(window.HANDY&&window.HANDY.offen) return true;
    }catch(e){}
    return KAPITEL.aktiv||MOMENT_KARTE.aktiv||this.sperre;
  },
  _zeigen(z){
    const wer=z.wer||'', text=String(z.text||'');
    this.jetzt={wer,text,t:0,
      dauer:ERZAEHL.PLAUSCH_BASIS+ERZAEHL.PLAUSCH_JE_ZEICHEN*((wer?wer.length+2:0)+text.length)};
    this.abstand=0;
    if(wer) stimmePiep(wer);
  },
  _passt(z){
    return !!z&&!!z.text&&!this.gespielt[z.id]&&this.t>=(z.nach||0)&&bedingungErfuellt(z.wenn);
  },
  /* laeuft=false: nicht reden (z. B. im Kampf) - die Uhr steht dann auch. */
  takt(dt,laeuft=true){
    if(!laeuft||this._blockiert()) return;
    this.t+=dt;
    if(this.jetzt){
      this.jetzt.t+=dt;
      if(this.jetzt.t>=this.jetzt.dauer) this.jetzt=null; else return;
    }
    if(this.warte.length){ this._zeigen(this.warte.shift()); return; }
    this.abstand+=dt;
    if(this.abstand<ERZAEHL.PLAUSCH_ABSTAND) return;
    let best=null;
    for(const z of this.zeilen){
      if(z.ausloeser||!this._passt(z)) continue;
      if(!best||(z.prio||0)>(best.prio||0)) best=z;
    }
    if(best){ this.gespielt[best.id]=true; this._zeigen(best); }
  },
  ausloeser(id){
    const k=this.zeilen.filter(z=>z.ausloeser===id&&this._passt(z))
      .sort((a,b)=>(b.prio||0)-(a.prio||0));
    for(const z of k){
      if(this.warte.length>=ERZAEHL.PLAUSCH_QUEUE) break;
      this.gespielt[z.id]=true; this.warte.push(z);
    }
    if(!this.jetzt&&!this._blockiert()&&this.warte.length) this._zeigen(this.warte.shift());
  },
  sag(wer,text){ this._zeigen({wer:wer,text:text}); },
  zeichne(){
    const j=this.jetzt; if(!j||this._blockiert()) return;
    const y=this.y!=null?this.y:(IS_TOUCH?22:H-18);
    const a=_blende(j.t,j.dauer,ERZAEHL.PLAUSCH_BLENDE);
    const kopf=j.wer?j.wer+': ':'', gesamt=kopf+j.text;
    const x=Math.round((W-textW(gesamt))/2), ty=y+Math.round((ERZAEHL.PLAUSCH_HOEHE-5)/2);
    _mitAlpha(a*ERZAEHL.PLAUSCH_BALKEN,()=>{ ctx.fillStyle='#000000'; ctx.fillRect(0,y,W,ERZAEHL.PLAUSCH_HOEHE); });
    _mitAlpha(a,()=>{
      if(kopf) text(kopf,x,ty,stimmeFarbe(j.wer));
      text(j.text,x+kopf.length*4,ty,'#f2f0ff');
    });
  },
};

/* -------------------------------------------------------------- HAKEN --- */
function _plauschLaeuft(){
  try{
    if(PLAUSCH.sperre) return false;
    if(typeof S==='undefined'||!S) return true;
    return !/^(titel|intro|ende|pause|kampf|kloppe|cutscene|gefangen|schwarz)$/.test(S.modus||'');
  }catch(e){ return true; }
}

/* true, solange eine Karte aktiv ist - das Level rechnet dann nichts. */
function erzaehlTakt(dt){
  try{
    if(KAPITEL.aktiv){ KAPITEL.t+=dt; if(KAPITEL.t>=KAPITEL.d) KAPITEL.aktiv=false; }
    else if(MOMENT_KARTE.aktiv){ MOMENT_KARTE.t+=dt; if(MOMENT_KARTE.t>=MOMENT_KARTE.d) MOMENT_KARTE.aktiv=false; }
    const karte=KAPITEL.aktiv||MOMENT_KARTE.aktiv;
    if(!karte) PLAUSCH.takt(dt,_plauschLaeuft());
    return karte;
  }catch(e){ return false; }
}

function erzaehlZeichne(){
  try{
    if(KAPITEL.aktiv) _kapitelZeichne();
    else if(MOMENT_KARTE.aktiv) _momentZeichne();
    PLAUSCH.zeichne();
  }catch(e){}
}

/* true, wenn eine Karte die Taste verbraucht hat. */
function erzaehlTaste(){
  if(KAPITEL.aktiv){
    if(KAPITEL.t>=ERZAEHL.KAPITEL_FREI) KAPITEL.t=Math.max(KAPITEL.t,KAPITEL.d-ERZAEHL.KAPITEL_BLENDE);
    return true;
  }
  if(MOMENT_KARTE.aktiv){
    if(MOMENT_KARTE.t>=ERZAEHL.MOMENT_FREI) MOMENT_KARTE.t=Math.max(MOMENT_KARTE.t,MOMENT_KARTE.d-.25);
    return true;
  }
  return false;
}

function erzaehlKontext(){
  return (KAPITEL.aktiv||MOMENT_KARTE.aktiv)?{aktion:'WEITER',zwei:null,block:false,extras:null}:null;
}
