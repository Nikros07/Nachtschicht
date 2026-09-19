/* ============================================================================
   NACHTSCHICHT - ENGINE: stand
   Speicherstand ueber die ganze Nacht: Crew, Pegel, Bestzeiten.

   Bewusst schlank gehalten - der grosse Speicherstand (Werte, Beziehungen,
   Inventar, Flags) kommt in Phase 1 dazu, siehe PLAN.md.
   ========================================================================== */

const CREW_KEY='nachtschicht.crew';
const ladeCrew=()=>{ try{ return JSON.parse(localStorage.getItem(CREW_KEY))||[]; }catch(e){ return []; } };
const speichereCrew=n=>{ const c=ladeCrew(); if(!c.includes(n)){ c.push(n);
  try{ localStorage.setItem(CREW_KEY,JSON.stringify(c)); }catch(e){} } };
/* Wer die Nacht verlaesst, verlaesst auch die Crew - Level 7 schickt Leute
   heim, die man vergessen hat, und Level 8 soll sie nicht mehr kaempfen
   lassen. */
const entferneCrew=n=>{ const c=ladeCrew().filter(x=>x!==n);
  try{ localStorage.setItem(CREW_KEY,JSON.stringify(c)); }catch(e){} };

/* Der Pegel ist levelübergreifend: jedes Level liest ihn als Startwert und
   schreibt seinen Endwert zurueck - auch unveraendert, damit die Kette haelt. */
const PEGEL_KEY='nachtschicht.pegel';
const ladePegel=()=>parseFloat(localStorage.getItem(PEGEL_KEY))||0;
const speicherePegel=p=>{ try{ localStorage.setItem(PEGEL_KEY,String(p)); }catch(e){} };

/* Bestzeit je Level, Nummer 1-8. */
const bestKey=n=>'nachtschicht.bestzeit'+n;
const ladeBestN=n=>{ const v=parseFloat(localStorage.getItem(bestKey(n))); return isFinite(v)?v:null; };
const speichereBestN=(n,t)=>{ try{ localStorage.setItem(bestKey(n),String(t)); }catch(e){} };

/* ---- Schwierigkeit ----
   Eigener Schluessel, NICHT im Nacht-Speicherstand: eine neue Nacht setzt
   Werte und Flags zurueck, die gewaehlte Schwierigkeit soll bleiben.

   Die Faktoren wirken an wenigen zentralen Stellen statt in jedem Level:
     gegner   - Uhr der Gegner im Kampf (kampf.js). Unter 1 holen sie
                langsamer aus, das Konterfenster wird laenger.
     verdacht - wie schnell Lehrer und Kontrolleure dich bemerken
     muede    - wie schnell die Erschoepfung in Level 6 zieht
     zeit     - Bedenkzeit in Gespraechen (dialog.js)
     leben    - zusaetzliche Treffer, die du im Kampf einstecken kannst */
const SCHWER_KEY='nachtschicht.schwierigkeit';
const SCHWIERIGKEITEN={
  locker:{ name:'LOCKER', gegner:0.80, verdacht:0.70, muede:0.70, zeit:1.50, leben:1 },
  normal:{ name:'NORMAL', gegner:1.00, verdacht:1.00, muede:1.00, zeit:1.00, leben:0 },
  hart:  { name:'HART',   gegner:1.15, verdacht:1.30, muede:1.30, zeit:0.75, leben:0 },
};
const SCHWER_REIHE=['locker','normal','hart'];
const schwierigkeit=()=>{ let k='normal';
  try{ k=localStorage.getItem(SCHWER_KEY)||'normal'; }catch(e){}
  return SCHWIERIGKEITEN[k]?k:'normal'; };
const schwer=()=>SCHWIERIGKEITEN[schwierigkeit()];
function setzeSchwierigkeit(k){ if(!SCHWIERIGKEITEN[k]) return;
  try{ localStorage.setItem(SCHWER_KEY,k); }catch(e){} }
function wechsleSchwierigkeit(r){
  const i=SCHWER_REIHE.indexOf(schwierigkeit());
  setzeSchwierigkeit(SCHWER_REIHE[(i+r+SCHWER_REIHE.length)%SCHWER_REIHE.length]);
}
