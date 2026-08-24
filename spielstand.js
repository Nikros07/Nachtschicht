/* ============================================================================
   NACHTSCHICHT - SPIELSTAND UND LEVELREGISTER

   Was das Spiel sich ueber Runden hinweg merkt, und welche Level es
   ueberhaupt gibt. Beides gehoert zusammen: ein Level ist frei, weil das
   davor geschafft ist.

   Vorher lag das verstreut - crew in beiden Leveln, bestzeit1 und
   bestzeit2 in je einem, und "welches Level ist frei" nirgends. Jetzt
   liegt alles unter EINEM Schluessel. Alte Schluessel werden beim ersten
   Start uebernommen, damit niemand seinen Fortschritt verliert.

   Geladen VOR dem Level-Skript, NACH engine.js ist nicht noetig - diese
   Datei kommt ohne die Engine aus.
   ========================================================================== */

/* ==========================================================================
   DAS REGISTER
   Hier steht, welche Level es gibt. Ein neues Level eintragen reicht -
   Levelleiste, Freischaltung, Zifferntasten und "weiter zu" ziehen nach.
   ========================================================================== */
const LEVELS = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE', zeit:'16:40', bringt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ', zeit:'21:10', bringt:'MORITZ'    },
];
const levelNr = nr => LEVELS.find(l=>l.nr===nr) || null;

/* ==========================================================================
   DIE JUNGS
   Jeder aus der Crew bringt eine Faehigkeit mit. Die Tabelle ist die
   einzige Stelle, an der eine Faehigkeit definiert wird - die Level lesen
   sie nur aus.
   ========================================================================== */
const JUNGS = {
  'MAX FERDI': { ab:1, kann:'+15% TEMPO',          tempo:1.15 },
  'MORITZ':    { ab:2, kann:'BESSER BEI DEN CHAYAS', chaya:1  },
};

/* ==========================================================================
   DER SPEICHER
   ========================================================================== */
const STAND_KEY = 'nachtschicht.stand';
const LEER = { v:1, crew:[], geschafft:[], zeiten:{} };

/* Testschalter: mit ?frei=1 an der Adresse ist alles offen. Gilt fuer die
   ganze Sitzung, damit man sich beim Durchklicken nicht verliert. Der
   Spielstand selbst bleibt unangetastet. */
function allesFrei(){
  try{
    if(/[?&]frei=1/.test(location.search)) sessionStorage.setItem('nachtschicht.frei','1');
    return sessionStorage.getItem('nachtschicht.frei')==='1';
  }catch(e){ return /[?&]frei=1/.test(location.search); }
}

function standLies(){
  let s=null;
  try{ s=JSON.parse(localStorage.getItem(STAND_KEY)); }catch(e){}
  if(!s||typeof s!=='object') s=uebernehmeAlt();
  /* Gegen halb geschriebene Staende von frueheren Versionen */
  return {
    v: 1,
    crew:      Array.isArray(s.crew)      ? s.crew      : [],
    geschafft: Array.isArray(s.geschafft) ? s.geschafft : [],
    zeiten:    (s.zeiten&&typeof s.zeiten==='object') ? s.zeiten : {},
  };
}
function standSchreib(s){
  try{ localStorage.setItem(STAND_KEY,JSON.stringify(s)); }catch(e){}
}

/* Die alten Einzelschluessel einsammeln. Laeuft genau einmal - danach
   steht der neue Schluessel und dieser Zweig wird nie wieder betreten.
   Wer Level 1 gewonnen hat, hat eine bestzeit1 oder MAX FERDI dabei; aus
   beidem laesst sich "geschafft" ableiten. */
function uebernehmeAlt(){
  const s={ v:1, crew:[], geschafft:[], zeiten:{} };
  try{
    const c=JSON.parse(localStorage.getItem('nachtschicht.crew'));
    if(Array.isArray(c)) s.crew=c;
  }catch(e){}
  for(const l of LEVELS){
    const v=parseFloat(localStorage.getItem('nachtschicht.bestzeit'+l.nr));
    if(isFinite(v)){ s.zeiten[l.nr]=v; if(!s.geschafft.includes(l.nr)) s.geschafft.push(l.nr); }
  }
  /* Wer den Jungen aus einem Level dabei hat, hat das Level geschafft -
     auch wenn die Bestzeit fehlt. */
  for(const name of s.crew){
    const j=JUNGS[name];
    if(j && !s.geschafft.includes(j.ab)) s.geschafft.push(j.ab);
  }
  s.geschafft.sort((a,b)=>a-b);
  standSchreib(s);
  return s;
}

/* ==========================================================================
   WAS DIE LEVEL DAVON BRAUCHEN
   ========================================================================== */
const Stand = {
  alles: ()=>standLies(),

  crew: ()=>standLies().crew,

  /* Einen Jungen dazuholen. Doppelt geht nicht. */
  jungeDazu(name){
    const s=standLies();
    if(!s.crew.includes(name)){ s.crew.push(name); standSchreib(s); }
  },

  durch:   nr => standLies().geschafft.includes(nr),
  bestzeit:nr => { const v=standLies().zeiten[nr]; return isFinite(v)?v:null; },

  /* Level 1 ist immer offen. Danach braucht jedes Level das davor. */
  frei(nr){
    if(nr<=1 || allesFrei()) return true;
    return standLies().geschafft.includes(nr-1);
  },

  /* Level geschafft. Gibt zurueck, ob es eine neue Bestzeit war - das
     Level zeigt das auf dem Endbildschirm an. */
  schaffe(nr, zeit){
    const s=standLies();
    if(!s.geschafft.includes(nr)){ s.geschafft.push(nr); s.geschafft.sort((a,b)=>a-b); }
    let best=false;
    if(isFinite(zeit)){
      const alt=s.zeiten[nr];
      if(!isFinite(alt)||zeit<alt){ s.zeiten[nr]=zeit; best=true; }
    }
    standSchreib(s);
    return best;
  },

  /* Das naechste Level, oder null wenn die Nacht hier aufhoert. */
  naechstes: nr => levelNr(nr+1),

  /* Fuer die Konsole, wenn man von vorn anfangen will. */
  zuruecksetzen(){
    try{
      localStorage.removeItem(STAND_KEY);
      localStorage.removeItem('nachtschicht.crew');
      LEVELS.forEach(l=>localStorage.removeItem('nachtschicht.bestzeit'+l.nr));
    }catch(e){}
  },
};

/* Alle Tempo-Boni der Crew multipliziert. Steht hier und nicht im Level,
   damit eine Faehigkeit an genau einer Stelle definiert ist. */
const tempoBonus = () => Stand.crew().reduce(
  (f,n)=>f*((JUNGS[n]&&JUNGS[n].tempo)||1), 1);

/* ==========================================================================
   DIE LEVELLEISTE
   Wird aus dem Register gebaut statt in jedem HTML von Hand gepflegt.
   Zu ist zu: gesperrte Level sind kein Link und verraten ihren Namen nicht.
   ========================================================================== */
function baueLevelleiste(aktuell){
  const bar=document.getElementById('levelbar');
  if(!bar) return;
  bar.textContent='';
  for(const l of LEVELS){
    /* Das Level, auf dem man steht, gilt immer als offen - sonst behauptet
       die Leiste, die Seite sei zu, die man gerade spielt. Wer den Link
       kennt, kommt sowieso rein; die Sperre ist zum Sortieren da, nicht
       als Schloss. */
    const frei=Stand.frei(l.nr)||l.nr===aktuell, durch=Stand.durch(l.nr);
    const n=document.createElement(frei?'a':'span');
    if(frei){
      n.href=l.datei;
      n.textContent=l.nr+' · '+l.name+(durch?' ✓':'');
      if(l.nr===aktuell) n.className='aktiv';
    }else{
      n.className='zu';
      n.textContent=l.nr+' · ? ? ?';
      n.title='Erst Level '+(l.nr-1)+' schaffen';
    }
    bar.appendChild(n);
  }
}

/* Zifferntasten auf dem Titelbild. darf() sagt, ob gerade gewechselt
   werden darf - im laufenden Spiel waere das ein Versehen.
   Rueckgabe passt direkt in starteEingabe({ tasten: ... }). */
function levelTasten(darf){
  const t={};
  for(const l of LEVELS){
    const spring=()=>{ if(!darf()||!Stand.frei(l.nr)) return; location.href=l.datei; };
    t['Digit'+l.nr]=spring;
    t['Numpad'+l.nr]=spring;
  }
  return t;
}

/* Nach gewonnenem Level weiter. Gibt es kein naechstes, bleibt man da. */
function weiterZumNaechsten(nr){
  const n=Stand.naechstes(nr);
  if(n) location.href=n.datei;
}

/* ==========================================================================
   TEXTE FUERS BILD
   Die Level malen selbst, aber was dasteht kommt aus dem Register - sonst
   verspricht ein Titelbild ein Level, das es nicht gibt oder das zu ist.
   ========================================================================== */

/* Eine Zeile je Level: welche Taste, welcher Name. Das Level, auf dem man
   gerade steht, liegt auf der Leertaste. Gesperrte verraten nichts. */
function levelZeilen(aktuell){
  return LEVELS.map(l=>{
    const taste=(l.nr===aktuell?'LEERTASTE':'TASTE '+l.nr).padEnd(11);
    if(!Stand.frei(l.nr)&&l.nr!==aktuell)
      return { txt:taste+'? ? ?', frei:false, hier:false };
    return { txt:taste+'LEVEL '+l.nr+' - '+l.name, frei:true, hier:l.nr===aktuell };
  });
}

/* Wer dabei ist und was er kann. null, wenn noch keiner dabei ist. */
function crewZeile(){
  const c=Stand.crew();
  if(!c.length) return null;
  const kann=c.map(n=>JUNGS[n]&&JUNGS[n].kann).filter(Boolean);
  return 'DABEI: '+c.join(', ')+(kann.length?'  '+kann.join(' + '):'');
}

/* Was auf dem Endbildschirm unter "geschafft" steht. */
function weiterZeile(nr){
  const n=Stand.naechstes(nr);
  return n ? 'E  WEITER ZU LEVEL '+n.nr+' - '+n.name : 'E  NOCH MAL';
}
