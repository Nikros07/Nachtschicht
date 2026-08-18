/* ============================================================================
   NACHTSCHICHT - SPIELSTAND

   Ein Speicher fuer alle Level. Vorher hatte jede Datei ihre eigenen
   localStorage-Schluessel und ihre eigene fest eingebaute Levelleiste -
   ein drittes Level haette man an vier Stellen nachtragen muessen.

   Hier steht jetzt beides an einer Stelle:
     LEVEL       - die Liste aller Level (Datei, Name, Farbe)
     SPIELSTAND  - was der Spieler geschafft hat, wer dabei ist, Bestzeiten

   Die Datei ist absichtlich ein ganz normales <script> und kein Modul.
   So laeuft sie auch, wenn man die HTML-Datei per Doppelklick direkt vom
   Rechner oeffnet - Module blockiert der Browser dabei.
   ========================================================================== */

/* --------------------------------------------------------------------------
   DIE LEVEL

   Neues Level anlegen: Datei schreiben, hier eine Zeile eintragen, fertig.
   Die Levelleiste unter dem Bild und die Auswahl auf dem Titelbild bauen
   sich daraus von selbst.

   frei:true heisst "ohne Bedingung spielbar". Alles andere schaltet sich
   frei, sobald das Level davor geschafft ist.
   -------------------------------------------------------------------------- */
const LEVEL = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   kurz:'SCHULE',  frei:true },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   kurz:'MORITZ'  },
  { nr:3, datei:'level3.html', name:'DER NACHTBUS', kurz:'BUS'     },
];

/* --------------------------------------------------------------------------
   SPEICHER

   Alles liegt unter einem Schluessel. Die alten Einzelschluessel
   (nachtschicht.crew, nachtschicht.bestzeit1, .bestzeit2) werden beim
   ersten Laden uebernommen - wer schon gespielt hat, verliert nichts.
   -------------------------------------------------------------------------- */
const SPIELSTAND = (function(){
  const SCHLUESSEL = 'nachtschicht.spielstand';
  const LEER = { version:1, crew:[], geschafft:{}, best:{} };

  /* Kein localStorage (Privatmodus, file:// in manchen Browsern)? Dann
     laeuft das Spiel eben ohne Gedaechtnis weiter, statt abzustuerzen. */
  function rohLesen(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function rohSchreiben(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

  let stand = null;

  function lade(){
    if(stand) return stand;
    let s = null;
    try{ s = JSON.parse(rohLesen(SCHLUESSEL)); }catch(e){ s = null; }
    if(!s || typeof s !== 'object') s = uebernehmeAlt();
    stand = {
      version: 1,
      crew:      Array.isArray(s.crew) ? s.crew.slice() : [],
      geschafft: (s.geschafft && typeof s.geschafft==='object') ? Object.assign({},s.geschafft) : {},
      best:      (s.best      && typeof s.best     ==='object') ? Object.assign({},s.best)      : {},
    };
    return stand;
  }

  /* Der alte Stand: eine Crew-Liste und zwei Bestzeiten. Wer eine Bestzeit
     fuer ein Level hat, hat es auch geschafft - daraus faellt die
     Freischaltung mit ab. */
  function uebernehmeAlt(){
    const alt = { crew:[], geschafft:{}, best:{} };
    try{ const c=JSON.parse(rohLesen('nachtschicht.crew')); if(Array.isArray(c)) alt.crew=c; }catch(e){}
    for(const l of LEVEL){
      const v = parseFloat(rohLesen('nachtschicht.bestzeit'+l.nr));
      if(isFinite(v)){ alt.best[l.nr]=v; alt.geschafft[l.nr]=true; }
    }
    return alt;
  }

  function sichere(){ if(stand) rohSchreiben(SCHLUESSEL, JSON.stringify(stand)); }

  /* Zum Ausprobieren: ?frei=1 an die Adresse haengen, dann sind alle Level
     offen. Wird nicht gespeichert, gilt nur fuer diesen Aufruf. */
  const allesFrei = /[?&]frei=1/.test(location.search);

  const api = {
    lade,

    /* --- Freischaltung --- */
    frei(nr){
      if(allesFrei) return true;
      const l = LEVEL.find(x=>x.nr===nr);
      if(!l) return false;
      if(l.frei) return true;
      return !!lade().geschafft[nr-1];
    },
    geschafft(nr){ return !!lade().geschafft[nr]; },

    /* Level abgeschlossen. Gibt true zurueck, wenn es eine neue Bestzeit war,
       damit das Endbild das anzeigen kann. */
    schaffe(nr, zeit){
      const s = lade();
      s.geschafft[nr] = true;
      let neu = false;
      if(typeof zeit === 'number' && isFinite(zeit)){
        const alt = s.best[nr];
        if(alt === undefined || zeit < alt){ s.best[nr] = zeit; neu = true; }
      }
      sichere();
      return neu;
    },
    bestzeit(nr){ const v = lade().best[nr]; return (typeof v==='number'&&isFinite(v)) ? v : null; },

    /* --- Die Jungs --- */
    crew(){ return lade().crew.slice(); },
    nimmAuf(name){
      const s = lade();
      if(!s.crew.includes(name)){ s.crew.push(name); sichere(); }
    },
    dabei(name){ return lade().crew.includes(name); },
    /* Max Ferdi gibt Tempo. Weitere Faehigkeiten kommen hier dazu. */
    tempoBonus(){ return api.dabei('MAX FERDI') ? 1.15 : 1; },

    /* --- Navigation --- */
    level(nr){ return LEVEL.find(x=>x.nr===nr) || null; },
    /* Das naechste freigeschaltete Level nach nr, sonst null. */
    naechstes(nr){
      const l = LEVEL.find(x=>x.nr===nr+1);
      return (l && api.frei(l.nr)) ? l : null;
    },
    gehZu(nr){
      const l = api.level(nr);
      if(!l || !api.frei(nr)) return false;
      location.href = l.datei + (allesFrei ? '?frei=1' : '');
      return true;
    },

    /* Zifferntaste auf dem Titelbild. Gibt zurueck, was passiert ist:
         'start'      - es ist das Level, in dem man schon steckt
         'gewechselt' - es wird gerade zum anderen Level gesprungen
         'zu'         - das Level ist noch nicht freigespielt
         null         - keine Levelzahl
       Das Zeichnen und den Ton macht die Seite, die Levelkunde liegt hier. */
    tasteZuLevel(code, aktuellNr){
      const m = /^(?:Digit|Numpad)([1-9])$/.exec(code || '');
      if(!m) return null;
      const nr = parseInt(m[1], 10);
      if(!api.level(nr)) return null;
      if(nr === aktuellNr) return 'start';
      if(!api.frei(nr)) return 'zu';
      api.gehZu(nr);
      return 'gewechselt';
    },

    /* Was das Titelbild im Spielbild zeichnen soll. */
    menue(aktuellNr){
      return LEVEL.map(l=>({
        nr:l.nr, name:l.name, kurz:l.kurz,
        frei: api.frei(l.nr),
        geschafft: api.geschafft(l.nr),
        aktuell: l.nr===aktuellNr,
      }));
    },

    alles(){ return JSON.parse(JSON.stringify(lade())); },
    loesche(){ stand = JSON.parse(JSON.stringify(LEER)); sichere(); },
  };
  return api;
})();

/* --------------------------------------------------------------------------
   DIE LEISTE UNTER DEM BILD

   Baut sich aus LEVEL. Gesperrte Level stehen mit Schloss da, sind aber
   nicht anklickbar - man soll sehen, dass da noch was kommt.
   Erwartet <div id="levelbar"> und <body data-level="N">.
   -------------------------------------------------------------------------- */
function levelleisteBauen(){
  const leiste = document.getElementById('levelbar');
  if(!leiste) return;
  const aktuell = parseInt(document.body.dataset.level, 10);
  leiste.innerHTML = '';
  for(const l of LEVEL){
    const frei = SPIELSTAND.frei(l.nr);
    const a = document.createElement(frei ? 'a' : 'span');
    a.textContent = l.nr + ' · ' + (frei ? l.name : 'ZU');
    a.title = frei ? l.name : 'ERST LEVEL ' + (l.nr-1) + ' SCHAFFEN';
    if(frei) a.href = l.datei + (/[?&]frei=1/.test(location.search) ? '?frei=1' : '');
    if(l.nr === aktuell) a.className = 'aktiv';
    else if(!frei) a.className = 'zu';
    else if(SPIELSTAND.geschafft(l.nr)) a.className = 'fertig';
    leiste.appendChild(a);
  }
}
if(document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', levelleisteBauen);
else levelleisteBauen();
