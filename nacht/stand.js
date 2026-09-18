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
