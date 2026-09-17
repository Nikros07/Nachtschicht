/* ============================================================================
   NACHTSCHICHT - ENGINE: nacht
   Der Zustand, der die ganze Nacht traegt: Werte, Beziehungen, Inventar,
   Flags, Kapitel. Alles in EINEM Speicherstand.

   Die alten Schluessel (nachtschicht.crew, .pegel, .bestzeitN) bleiben
   unangetastet und gueltig - stand.js bedient sie weiter. Diese Datei legt
   sich darueber, damit bestehende Level nichts merken, waehrend die neuen
   Systeme dazukommen.
   ========================================================================== */

const STAND_KEY='nachtschicht.stand';

/* Startwerte. Wer hier etwas ergaenzt, muss nichts migrieren - fehlende
   Felder werden beim Laden aus der Vorlage aufgefuellt. */
const STAND_VORLAGE={
  kapitel:1,
  werte:{
    mut:        30,   // was du dich traust (0-100)
    ruf:        50,   // wie die Leute dich sehen (0-100)
    kondition:  100,  // wie fit du noch bist (0-100)
    geld:       15,   // Bargeld in Euro
  },
  beziehung:{},       // {'MORITZ':0-100} - wer wie gut auf dich zu sprechen ist
  inventar:{},        // {'PFAND':3,'FEUERZEUG':1}
  flags:{},           // {'clubDrin':true} - Entscheidungen, die spaeter zaehlen
  gesehen:[],         // welche Enden schon erreicht wurden
};

function tiefKopie(o){ return JSON.parse(JSON.stringify(o)); }

function ladeStand(){
  let s;
  try{ s=JSON.parse(localStorage.getItem(STAND_KEY))||{}; }catch(e){ s={}; }
  const v=tiefKopie(STAND_VORLAGE);
  /* flach auffuellen, damit neue Felder alte Staende nicht kaputtmachen */
  const st={...v,...s};
  st.werte={...v.werte,...(s.werte||{})};
  st.beziehung={...(s.beziehung||{})};
  st.inventar={...(s.inventar||{})};
  st.flags={...(s.flags||{})};
  st.gesehen=s.gesehen||[];
  return st;
}
let NACHT=ladeStand();
function speichereStand(){ try{ localStorage.setItem(STAND_KEY,JSON.stringify(NACHT)); }catch(e){} }

/* ---- Werte ---- */
const wert=n=>n==='pegel'?ladePegel():(NACHT.werte[n]||0);
function setzeWert(n,v){
  if(n==='pegel'){ speicherePegel(Math.max(0,Math.min(100,v))); return; }
  const grenze=n==='geld'?9999:100;
  NACHT.werte[n]=Math.max(0,Math.min(grenze,v));
  speichereStand();
}
const aendereWert=(n,d)=>setzeWert(n,wert(n)+d);

/* ---- Beziehungen ---- */
const beziehung=n=>NACHT.beziehung[n]||0;
function aendereBeziehung(n,d){
  NACHT.beziehung[n]=Math.max(-100,Math.min(100,beziehung(n)+d));
  speichereStand();
}

/* ---- Inventar ---- */
const hatDing=(n,anz=1)=>(NACHT.inventar[n]||0)>=anz;
function nimmDing(n,anz=1){ NACHT.inventar[n]=(NACHT.inventar[n]||0)+anz; speichereStand(); }
function gibDing(n,anz=1){
  if(!hatDing(n,anz)) return false;
  NACHT.inventar[n]-=anz;
  if(NACHT.inventar[n]<=0) delete NACHT.inventar[n];
  speichereStand(); return true;
}

/* ---- Flags: Entscheidungen, die spaeter noch zaehlen ---- */
const flag=n=>!!NACHT.flags[n];
function setzeFlag(n,v=true){ NACHT.flags[n]=v; speichereStand(); }

/* ---- Kapitel ---- */
function setzeKapitel(n){ if(n>NACHT.kapitel){ NACHT.kapitel=n; speichereStand(); } }

/* ---- Bedingungen, wie sie im Gespraechsbaum stehen ----
   {mut:40} heisst "mut mindestens 40". {geld:-5} heisst "hoechstens 5".
   {crew:'SEMIH'} / {hat:'PFAND'} / {flag:'clubDrin'} / {nichtFlag:'...'} */
function bedingungErfuellt(b){
  if(!b) return true;
  for(const [k,v] of Object.entries(b)){
    if(k==='crew'){ if(!ladeCrew().includes(v)) return false; continue; }
    if(k==='hat'){ if(!hatDing(v)) return false; continue; }
    if(k==='flag'){ if(!flag(v)) return false; continue; }
    if(k==='nichtFlag'){ if(flag(v)) return false; continue; }
    if(k==='mag'){ if(beziehung(v[0])<v[1]) return false; continue; }
    if(typeof v==='number'){
      if(v>=0 ? wert(k)<v : wert(k)>-v) return false;
      continue;
    }
  }
  return true;
}

/* ---- Wirkung einer Entscheidung ----
   {mut:+5, ruf:-10, flag:'geprahlt', mag:['MORITZ',+8], nimm:'PFAND'} */
function wirke(w){
  if(!w) return;
  for(const [k,v] of Object.entries(w)){
    if(k==='flag'){ setzeFlag(v); continue; }
    if(k==='mag'){ aendereBeziehung(v[0],v[1]); continue; }
    if(k==='nimm'){ nimmDing(v); continue; }
    if(k==='gib'){ gibDing(v); continue; }
    if(k==='crew'){ speichereCrew(v); continue; }
    if(typeof v==='number') aendereWert(k,v);
  }
}

/* Fuer Testlaeufe und einen sauberen Neuanfang. */
function nachtZuruecksetzen(){
  NACHT=tiefKopie(STAND_VORLAGE); speichereStand();
  try{ localStorage.removeItem(CREW_KEY); localStorage.removeItem(PEGEL_KEY); }catch(e){}
}
