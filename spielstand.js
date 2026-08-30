/* ============================================================================
   NACHTSCHICHT - SPIELSTAND, LEVELLISTE, CREW

   Alles, was eine Runde ueberlebt, steht hier - und nur hier:
     - welche Level frei sind
     - wer aus der Crew dabei ist und was er kann
     - welche Bestzeiten stehen

   Bis jetzt lag das doppelt in index.html und level2.html. Bei acht Leveln
   waere das acht Mal derselbe Code gewesen, und beim ersten Tippfehler haette
   ein Level einen anderen Spielstand gelesen als das naechste.

   Die Levelliste unten ist die einzige Stelle, an der ein neues Level
   angemeldet wird. Levelleiste, Freischaltung und Uebergaenge lesen alle
   von dort.

   Eingebunden wird die Datei VOR dem Spiel-Script:
     <script src="spielstand.js"></script>

   Absichtlich ohne Umlaute, wie der Rest vom Code.
   ========================================================================== */
(function(){
'use strict';

/* ==========================================================================
   (1) DIE LEVELLISTE
   datei:null heisst "gibt es noch nicht" - die Leiste zeigt es als BALD.
   ========================================================================== */
const LEVEL = [
  { nr:1, name:'DIE SCHULE',   unter:'EINGESPERRT',           datei:'index.html'  },
  { nr:2, name:'BEI MORITZ',   unter:'VORGLUEHEN',            datei:'level2.html' },
  { nr:3, name:'NACHTBUS',     unter:'FAHRENDER UNTERGRUND',  datei:null },
  { nr:4, name:'DIE SCHLANGE', unter:'DER TUERSTEHER',        datei:null },
  { nr:5, name:'CLUB',         unter:'STROBOSKOP',            datei:null },
  { nr:6, name:'AFTERHOUR',    unter:'ES WIRD SELTSAM',       datei:null },
  { nr:7, name:'SPAETI',       unter:'RUHEPAUSE',             datei:null },
  { nr:8, name:'HEIMWEG',      unter:'DIE SONNE',             datei:null },
];
const levelVon = nr => LEVEL.find(l=>l.nr===nr) || null;
const spielbar = nr => { const l=levelVon(nr); return !!(l&&l.datei); };

/* ==========================================================================
   (2) DIE JUNGS
   Jedes Level bringt einen aus der Crew, jeder gibt eine Faehigkeit.
   Die Werte hier sind die Wahrheit - kein Level rechnet mehr selbst.
     tempo   Faktor auf das Gehtempo
     charme  hilft spaeter im Club-Minispiel
   ========================================================================== */
const JUNGS = [
  { name:'MAX FERDI', level:1, was:'+15% TEMPO',           tempo:1.15 },
  { name:'MORITZ',    level:2, was:'BESSER BEI DEN CHAYAS', charme:1  },
];
const jungeVon = name => JUNGS.find(j=>j.name===name) || null;

/* ==========================================================================
   (3) SPEICHER
   localStorage kann fehlen (privates Fenster, file:// in manchen Browsern).
   Dann laeuft alles weiter, es ueberlebt nur den Tab-Wechsel nicht.
   ========================================================================== */
const KEY = 'nachtschicht.spielstand';
const ALT = { crew:'nachtschicht.crew', best:['nachtschicht.bestzeit1','nachtschicht.bestzeit2'] };

const lies = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
const schreib = (k,v) => { try{ localStorage.setItem(k,v); return true; }catch(e){ return false; } };

const leer = () => ({ v:1, frei:1, crew:[], best:{} });

/* Fremde Daten sind nie zu trauen: ein von Hand verbogener Eintrag darf
   das Spiel nicht kippen. Alles, was nicht passt, faellt raus. */
function pruefe(roh){
  const s = leer();
  if(!roh || typeof roh!=='object') return s;
  if(Array.isArray(roh.crew))
    s.crew = roh.crew.filter(n=>typeof n==='string' && n.length && n.length<40)
                     .filter((n,i,a)=>a.indexOf(n)===i);
  const f = Math.floor(Number(roh.frei));
  if(isFinite(f)) s.frei = Math.max(1, Math.min(LEVEL.length, f));
  if(roh.best && typeof roh.best==='object'){
    LEVEL.forEach(l=>{
      const t = Number(roh.best[l.nr]);
      if(isFinite(t) && t>0) s.best[l.nr] = t;
    });
  }
  return s;
}

/* Alter Spielstand aus der Zeit vor dieser Datei. Wer Level 1 geschafft
   hatte, hatte MAX FERDI dabei - der darf seine Freischaltung behalten. */
function ausAltemStand(){
  const s = leer();
  let etwasDa = false;
  try{
    const c = JSON.parse(lies(ALT.crew)||'null');
    if(Array.isArray(c)){ s.crew = c.filter(n=>typeof n==='string'); etwasDa = etwasDa || !!c.length; }
  }catch(e){}
  ALT.best.forEach((k,i)=>{
    const t = parseFloat(lies(k));
    if(isFinite(t) && t>0){ s.best[i+1] = t; etwasDa = true; }
  });
  /* Aus dem, was da ist, zurueckrechnen, wie weit jemand war. */
  LEVEL.forEach(l=>{
    const junge = JUNGS.find(j=>j.level===l.nr);
    const geschafft = s.best[l.nr]!==undefined || (junge && s.crew.includes(junge.name));
    if(geschafft) s.frei = Math.max(s.frei, Math.min(LEVEL.length, l.nr+1));
  });
  return etwasDa ? s : null;
}

let stand = null;
function laden(){
  if(stand) return stand;
  let roh = null;
  try{ roh = JSON.parse(lies(KEY)||'null'); }catch(e){ roh = null; }
  if(roh){ stand = pruefe(roh); }
  else { stand = ausAltemStand() || leer(); if(stand) sichern(); }
  return stand;
}
function sichern(){ if(stand) schreib(KEY, JSON.stringify(stand)); }

/* ==========================================================================
   (4) WAS DAS SPIEL FRAGT
   ========================================================================== */
const crew   = () => laden().crew.slice();
const dabei  = name => laden().crew.includes(name);
const frei   = nr => nr<=1 || laden().frei>=nr;

function crewDazu(name){
  const s = laden();
  if(!s.crew.includes(name)){ s.crew.push(name); sichern(); }
}
function schalteFrei(nr){
  const s = laden();
  const ziel = Math.max(1, Math.min(LEVEL.length, Math.floor(nr)));
  if(ziel>s.frei){ s.frei = ziel; sichern(); }
}
const bestzeit = nr => { const t=laden().best[nr]; return isFinite(t)?t:null; };

/* Ein Level ist geschafft: Junge dazu, naechstes Level auf, Bestzeit pruefen.
   Gibt zurueck, ob die Zeit eine neue Bestzeit war - das Endbild zeigt es an.
   Zweimal aufrufen schadet nichts, der Ruecksprung meldet dann nur false. */
function geschafft(nr, zeit){
  const s = laden();
  const junge = JUNGS.find(j=>j.level===nr);
  if(junge) crewDazu(junge.name);
  schalteFrei(nr+1);
  let neueBest = false;
  if(isFinite(zeit) && zeit>0){
    const alt = s.best[nr];
    if(alt===undefined || zeit<alt){ s.best[nr] = zeit; neueBest = true; }
  }
  sichern();
  return neueBest;
}

/* Faehigkeiten der Crew, zusammengerechnet. Tempo multipliziert sich,
   damit zwei Sportler nicht in dieselbe Zahl fallen. */
function tempoBonus(){
  return crew().reduce((f,n)=>{ const j=jungeVon(n); return j&&j.tempo ? f*j.tempo : f; }, 1);
}
function charme(){
  return crew().reduce((f,n)=>{ const j=jungeVon(n); return j&&j.charme ? f+j.charme : f; }, 0);
}

/* Das naechste Level, das es wirklich gibt. Null, wenn hier Schluss ist. */
function naechstes(nr){
  for(let i=nr+1;i<=LEVEL.length;i++) if(spielbar(i)) return levelVon(i);
  return null;
}

function zuruecksetzen(){
  stand = leer();
  sichern();
  try{ localStorage.removeItem(ALT.crew); ALT.best.forEach(k=>localStorage.removeItem(k)); }catch(e){}
}

/* ==========================================================================
   (5) UEBERGANG ZWISCHEN DEN LEVELN
   Vorher sprang die Seite hart um. Jetzt blendet sie ab, nennt das naechste
   Level beim Namen und blendet drueben wieder auf.
   ========================================================================== */
const ABBLENDEN = 620;   // ms bis der Sprung kommt
const AUFBLENDEN = 520;  // ms, bis drueben wieder alles zu sehen ist
const ANKUNFT = 'nachtschicht.ankunft';

const sparsam = () => { try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };

function stil(){
  if(document.getElementById('ss-stil')) return;
  const s = document.createElement('style');
  s.id = 'ss-stil';
  s.textContent = `
  /* Acht Level passen nur mit Umbruch nebeneinander. Lange Namen wie
     "DIE SCHLANGE" brauchen zwei Zeilen - deshalb mittig statt oben. */
  #levelbar { flex-wrap:wrap; align-items:stretch; }
  /* max-width, damit ein einzelnes Level in der zweiten Zeile nicht
     ueber die ganze Breite zieht. */
  #levelbar a, #levelbar span.stufe { flex:1 1 92px; max-width:180px;
    display:flex; align-items:center; justify-content:center; }
  #levelbar span.stufe { text-align:center; font:700 9px/1.3 monospace; letter-spacing:1px;
    padding:7px 4px; border-radius:5px; color:#4a4363;
    background:rgba(255,255,255,.02); border:1px dashed #241d3c; cursor:default; }
  #levelbar span.stufe.zu { color:#6a6188; border-style:solid; border-color:#2a2246; }
  #levelbar button.ssreset { flex:0 0 auto; font:700 9px/1 monospace; letter-spacing:1px;
    padding:7px 8px; border-radius:5px; cursor:pointer;
    color:#4a4363; background:rgba(255,255,255,.02); border:1px solid #241d3c; }
  #levelbar button.ssreset:hover { color:#ff3d8b; border-color:#ff3d8b; }
  html.touch #levelbar span.stufe, html.touch #levelbar button.ssreset { padding:11px 4px; font-size:11px; }
  #ss-blende { position:fixed; inset:0; z-index:200; background:#04030a; opacity:0;
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px;
    pointer-events:none; transition:opacity ${ABBLENDEN}ms ease; }
  #ss-blende.an { opacity:1; pointer-events:auto; }
  #ss-blende b { font:700 15px/1 monospace; letter-spacing:6px; color:#ff3d8b;
    text-shadow:0 0 10px #ff3d8b88; }
  #ss-blende i { font:700 9px/1 monospace; letter-spacing:3px; color:#8d86a8; font-style:normal; }
  #ss-blende u { font:700 8px/1 monospace; letter-spacing:4px; color:#4a4363;
    text-decoration:none; }
  @media (prefers-reduced-motion: reduce){ #ss-blende { transition:none; } }`;
  document.head.appendChild(s);
}

function blende(text){
  stil();
  let d = document.getElementById('ss-blende');
  if(!d){ d = document.createElement('div'); d.id='ss-blende'; document.body.appendChild(d); }
  d.innerHTML = '';
  if(text){
    const u = document.createElement('u'); u.textContent = text.oben;
    const b = document.createElement('b'); b.textContent = text.name;
    const i = document.createElement('i'); i.textContent = text.unter;
    d.appendChild(u); d.appendChild(b); d.appendChild(i);
  }
  return d;
}

/* Der eigentliche Wechsel. Gibt false zurueck, wenn es das Level nicht gibt -
   dann bleibt der Aufrufer, wo er ist. */
let laeuft = false;
function wechsel(nr){
  const l = levelVon(nr);
  if(!l || !l.datei || !frei(nr)) return false;
  if(laeuft) return true;
  laeuft = true;
  try{ sessionStorage.setItem(ANKUNFT, String(nr)); }catch(e){}
  if(sparsam()){ location.href = l.datei; return true; }
  const d = blende({ oben:'LEVEL '+l.nr, name:l.name, unter:l.unter });
  requestAnimationFrame(()=>d.classList.add('an'));
  setTimeout(()=>{ location.href = l.datei; }, ABBLENDEN);
  return true;
}

/* Auf der anderen Seite: nur aufblenden, wenn wir wirklich aus einem
   Uebergang kommen. Ein normaler Seitenaufruf soll nicht erst schwarz sein. */
function ankunft(){
  /* Die Datei haengt am Ende vom body - falls sie doch mal weiter oben
     landet, warten wir, statt an document.body zu scheitern. Erst danach
     die Marke abraeumen, sonst ist sie beim zweiten Anlauf schon weg. */
  if(!document.body){ addEventListener('DOMContentLoaded', ankunft, {once:true}); return; }
  let kam = null;
  try{ kam = sessionStorage.getItem(ANKUNFT); sessionStorage.removeItem(ANKUNFT); }catch(e){}
  if(!kam || sparsam()) return;
  const d = blende(null);
  d.classList.add('an');
  d.style.transition = 'opacity '+AUFBLENDEN+'ms ease';
  requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.remove('an')));
  setTimeout(()=>{ if(d.parentNode) d.parentNode.removeChild(d); }, AUFBLENDEN+80);
}

/* ==========================================================================
   (6) DIE LEVELLEISTE UNTER DEM BILDSCHIRM
   Wird aus der Liste oben gebaut, nicht von Hand gepflegt. Gesperrte Level
   sind sichtbar, aber nicht anklickbar - man soll sehen, was noch kommt.
   ========================================================================== */
function baueLeiste(aktuell){
  stil();
  const bar = document.getElementById('levelbar');
  if(!bar) return;
  bar.innerHTML = '';
  LEVEL.forEach(l=>{
    /* Trennpunkt und Pfeil als Escape, damit die Datei reines ASCII bleibt
       und keine Encoding-Frage offen laesst. */
    const beschriftung = l.nr+' \u00b7 '+l.name;
    if(!l.datei){
      const s = document.createElement('span');
      s.className = 'stufe';
      s.textContent = beschriftung;
      s.title = 'Gibt es noch nicht';
      bar.appendChild(s);
      return;
    }
    if(!frei(l.nr)){
      const s = document.createElement('span');
      s.className = 'stufe zu';
      s.textContent = beschriftung;
      s.title = 'Erst Level '+(l.nr-1)+' schaffen';
      bar.appendChild(s);
      return;
    }
    const a = document.createElement('a');
    a.href = l.datei;
    a.textContent = beschriftung;
    if(l.nr===aktuell) a.className = 'aktiv';
    else a.addEventListener('click', e=>{ e.preventDefault(); wechsel(l.nr); });
    bar.appendChild(a);
  });
  const r = document.createElement('button');
  r.className = 'ssreset';
  r.type = 'button';
  r.textContent = '\u21ba';
  r.title = 'Spielstand loeschen - Crew und Freischaltungen weg';
  r.addEventListener('click', ()=>{
    if(!confirm('Spielstand loeschen? Crew, Bestzeiten und freigeschaltete Level sind dann weg.')) return;
    zuruecksetzen();
    baueLeiste(aktuell);
  });
  bar.appendChild(r);
}

/* ==========================================================================
   (7) NACH DRAUSSEN
   ========================================================================== */
window.Spielstand = {
  LEVEL, JUNGS,
  level:levelVon, spielbar, naechstes,
  crew, dabei, crewDazu,
  frei, schalteFrei, geschafft, bestzeit,
  tempoBonus, charme,
  zuruecksetzen, wechsel, baueLeiste,
};

ankunft();

})();
