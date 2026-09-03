/* ============================================================================
   NACHTSCHICHT - SPIELSTAND UND LEVEL-VERZEICHNIS

   Bis hierher wusste jede Leveldatei nur von sich selbst. Wer zu welchem
   Level darf, wie das naechste heisst und wen man unterwegs aufsammelt,
   stand doppelt in index.html und level2.html - jedes Mal ein bisschen
   anders. Mit Level 3 bis 8 waere das nicht mehr zu halten.

   Hier steht das jetzt einmal:

     LEVEL        was es ueberhaupt gibt, wie es heisst, wen es freischaltet
     Spielstand   was davon der Spieler schon geschafft hat
     Levelbar     die Leiste unter dem Bild, gebaut aus beidem

   Die Leveldateien holen sich alles ueber `NS`. Sie kennen nur ihre eigene
   Nummer - `data-level` an der Leiste sagt sie ihnen.

   Neues Level dazuschreiben heisst: einen Eintrag in LEVEL, sonst nichts.
   ========================================================================== */
(function(global){
'use strict';

/* ---------------------------------------------------------------------------
   DAS VERZEICHNIS

   Ein Eintrag pro Stufe des Abends. `datei: null` heisst: gibt es noch nicht.
   Solche Level erscheinen trotzdem in der Leiste - ausgegraut, als Nummer.
   Das ist Absicht: man soll sehen, wie lang die Nacht noch wird.

   `bringt` ist der Junge, den man in dem Level aufsammelt. Wer das Level
   schafft, hat ihn ab dann in jeder Runde dabei.
   --------------------------------------------------------------------------- */
const LEVEL = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   kurz:'SCHULE',   bringt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   kurz:'MORITZ',   bringt:'MORITZ'    },
  { nr:3, datei:null,          name:'DER NACHTBUS', kurz:'BUS'       },
  { nr:4, datei:null,          name:'DIE SCHLANGE', kurz:'SCHLANGE'  },
  { nr:5, datei:null,          name:'CLUB',         kurz:'CLUB'      },
  { nr:6, datei:null,          name:'AFTERHOUR',    kurz:'AFTER'     },
  { nr:7, datei:null,          name:'SPAETI',       kurz:'SPAETI'    },
  { nr:8, datei:null,          name:'HEIMWEG',      kurz:'HEIMWEG'   },
];

/* Was die Jungs koennen. Bisher nur Tempo - der Rest kommt, wenn die
   restliche Crew steht. Wichtig ist, dass es hier steht und nicht als
   feste 1.15 mitten im Spielcode. */
const FAEHIGKEIT = {
  'MAX FERDI': { tempo: 1.15 },   // Sportler
  'MORITZ':    {},                // wirkt erst im Club-Level
};

/* ---------------------------------------------------------------------------
   SPEICHER

   localStorage kann fehlen: privater Modus, abgeschaltete Seitendaten,
   manche Browser bei file://. Dann faellt der Spielstand auf den Speicher
   im Arbeitsspeicher zurueck. Die laufende Sitzung funktioniert weiter,
   nur ueber einen Neustart hinaus haelt nichts.
   --------------------------------------------------------------------------- */
const SPEICHER = (function(){
  const notfall = Object.create(null);
  let echt = null;
  try {
    const probe = 'nachtschicht.probe';
    global.localStorage.setItem(probe,'1');
    global.localStorage.removeItem(probe);
    echt = global.localStorage;
  } catch(e){ echt = null; }
  return {
    verfuegbar: !!echt,
    lies(k){
      let v = null;
      if(echt){ try { v = echt.getItem(k); } catch(e){ v = null; } }
      /* Der Notfallspeicher springt auch ein, wenn das Schreiben vorhin
         am Kontingent gescheitert ist. */
      return v===null && k in notfall ? notfall[k] : v;
    },
    schreib(k,v){ notfall[k]=v; if(echt){ try { echt.setItem(k,v); } catch(e){} } },
    loesche(k){ delete notfall[k]; if(echt){ try { echt.removeItem(k); } catch(e){} } },
  };
})();

const K_CREW = 'nachtschicht.crew';
const K_FREI = 'nachtschicht.frei';
const K_BEST = nr => 'nachtschicht.bestzeit' + nr;   // Namen der alten Staende

/* ---------------------------------------------------------------------------
   CREW
   --------------------------------------------------------------------------- */
function crew(){
  try {
    const r = JSON.parse(SPEICHER.lies(K_CREW));
    return Array.isArray(r) ? r.filter(n => typeof n === 'string') : [];
  } catch(e){ return []; }
}
function crewDazu(name){
  const c = crew();
  if(c.includes(name)) return false;
  c.push(name);
  SPEICHER.schreib(K_CREW, JSON.stringify(c));
  return true;
}
function hatDabei(name){ return crew().includes(name); }

/* Alle Tempo-Boni der Crew multipliziert. Ohne Crew genau 1. */
function tempoBonus(){
  return crew().reduce((f,n) => f * ((FAEHIGKEIT[n] && FAEHIGKEIT[n].tempo) || 1), 1);
}

/* ---------------------------------------------------------------------------
   BESTZEITEN - pro Level eine
   --------------------------------------------------------------------------- */
function bestzeit(nr){
  const v = parseFloat(SPEICHER.lies(K_BEST(nr)));
  return isFinite(v) ? v : null;
}
/* Gibt true zurueck, wenn es eine neue Bestzeit war. */
function merkeBestzeit(nr, t){
  if(!isFinite(t)) return false;
  const b = bestzeit(nr);
  if(b !== null && t >= b) return false;
  SPEICHER.schreib(K_BEST(nr), String(t));
  return true;
}

/* ---------------------------------------------------------------------------
   FREIGESCHALTETE LEVEL

   Level 1 ist immer frei. Der Rest kommt, wenn das Level davor durch ist.

   Wer schon vor dieser Aenderung gespielt hat, hat keinen Frei-Stand - wohl
   aber Bestzeiten und Crew. Beides zaehlt als Beweis und wird einmalig
   umgeschrieben, damit niemand ein Level nochmal spielen muss.
   --------------------------------------------------------------------------- */
function frei(){
  const s = new Set([1]);
  let roh = null;
  try { roh = JSON.parse(SPEICHER.lies(K_FREI)); } catch(e){ roh = null; }

  if(Array.isArray(roh)){
    roh.forEach(n => { if(typeof n === 'number' && isFinite(n)) s.add(n); });
    return s;
  }

  const dabei = crew();
  LEVEL.forEach(l => {
    if(bestzeit(l.nr) !== null) s.add(l.nr + 1);
    if(l.bringt && dabei.includes(l.bringt)) s.add(l.nr + 1);
  });
  schreibeFrei(s);
  return s;
}
function schreibeFrei(menge){
  SPEICHER.schreib(K_FREI, JSON.stringify(Array.from(menge).sort((a,b)=>a-b)));
}
function istFrei(nr){ return ALLE_FREI || frei().has(nr); }
function schalteFrei(nr){
  if(!level(nr)) return false;          // hinter Level 8 gibt es nichts
  const s = frei();
  if(s.has(nr)) return false;
  s.add(nr);
  schreibeFrei(s);
  return true;
}

/* ---------------------------------------------------------------------------
   VERZEICHNIS-ZUGRIFF
   --------------------------------------------------------------------------- */
const level     = nr => LEVEL.find(l => l.nr === nr) || null;
const naechstes = nr => level(nr + 1);
const gebaut    = l  => !!(l && l.datei);

/* Alles, was am Ende eines Levels passiert, an einer Stelle:
   Jungen aufnehmen, naechstes Level oeffnen, Bestzeit pruefen.
   Rueckgabe: true bei neuer Bestzeit - genau das, was der Endbildschirm
   wissen will. */
function geschafft(nr, zeit){
  const l = level(nr);
  if(l && l.bringt) crewDazu(l.bringt);
  schalteFrei(nr + 1);
  return zeit === undefined ? false : merkeBestzeit(nr, zeit);
}

/* ---------------------------------------------------------------------------
   NAVIGATION

   Die Adresszeile wird mitgeschleppt. Sonst verliert man beim Levelwechsel
   `?touch=1` (Handysteuerung am Rechner testen) und `?alle=1`.
   --------------------------------------------------------------------------- */
const PARAM     = new global.URLSearchParams(global.location.search || '');
const ALLE_FREI = PARAM.get('alle') === '1';   // Entwicklerschalter

function adresse(datei){ return datei + (global.location.search || ''); }

/* Springt zum Level, wenn es das gibt und es frei ist. Sonst passiert
   nichts - der Aufrufer muss nicht selbst pruefen. */
function gehZu(nr){
  const l = level(nr);
  if(!gebaut(l) || !istFrei(nr)) return false;
  global.location.href = adresse(l.datei);
  return true;
}

/* ---------------------------------------------------------------------------
   ZEILEN FUER DEN TITELBILDSCHIRM

   Auf der Leinwand ist Platz fuer wenige Zeilen, spaeter aber acht Level.
   Darum: das eigene Level immer, dazu die naechsten spielbaren, bis das
   Fenster voll ist. Gezeichnet wird in der Leveldatei - die kennt ihre
   Farben.
   --------------------------------------------------------------------------- */
function titelZeilen(aktuell, maxZeilen){
  const max = maxZeilen || 2;
  const spielbar = LEVEL.filter(gebaut);
  const start = Math.max(0, Math.min(
    spielbar.findIndex(l => l.nr === aktuell),
    spielbar.length - max));
  return spielbar.slice(Math.max(0,start), Math.max(0,start) + max).map(l => {
    const hier = l.nr === aktuell;
    const offen = istFrei(l.nr);
    const taste = hier ? 'LEERTASTE' : 'TASTE ' + l.nr;
    const was = offen ? l.name : 'ZUERST LEVEL ' + (l.nr - 1);
    return {
      nr: l.nr,
      art: hier ? 'aktiv' : (offen ? 'offen' : 'zu'),
      txt: (taste + '  ').padEnd(11) + 'LEVEL ' + l.nr + ' - ' + was,
    };
  });
}

/* ---------------------------------------------------------------------------
   DIE LEISTE UNTER DEM BILD

   Vorher stand sie als festes HTML in beiden Dateien und zeigte immer alle
   Level, egal ob geschafft. Jetzt kommt sie aus dem Verzeichnis:

     gebaut und frei   anklickbarer Link
     gebaut, aber zu   grauer Kasten mit Hinweis
     noch nicht da     schmaler Kasten mit blosser Nummer

   Das aktuelle Level steht in `data-level` an der Leiste selbst.
   --------------------------------------------------------------------------- */
function baueLevelbar(){
  const bar = global.document.getElementById('levelbar');
  if(!bar) return;
  const aktuell = parseInt(bar.getAttribute('data-level'), 10);
  while(bar.firstChild) bar.removeChild(bar.firstChild);

  LEVEL.forEach(l => {
    const istDa = gebaut(l);
    const offen = istFrei(l.nr);
    const punkt = ' · ';

    if(istDa && offen){
      const a = global.document.createElement('a');
      a.href = adresse(l.datei);
      a.textContent = l.nr + punkt + l.name;
      if(l.nr === aktuell) a.className = 'aktiv';
      bar.appendChild(a);
      return;
    }

    const s = global.document.createElement('span');
    if(istDa){
      s.className = 'zu';
      s.textContent = l.nr + punkt + l.name;
      s.title = 'Erst Level ' + (l.nr - 1) + ' schaffen';
      s.setAttribute('aria-label', 'Level ' + l.nr + ' ' + l.name + ' - noch gesperrt');
    } else {
      s.className = 'bald';
      s.textContent = String(l.nr);
      s.title = 'Level ' + l.nr + ' - ' + l.name + ' - kommt noch';
      s.setAttribute('aria-label', 'Level ' + l.nr + ' ' + l.name + ' - in Arbeit');
    }
    bar.appendChild(s);
  });
}

/* ---------------------------------------------------------------------------
   ALLES LOESCHEN - fuer den Fall, dass man von vorn anfangen will
   --------------------------------------------------------------------------- */
function zuruecksetzen(){
  SPEICHER.loesche(K_CREW);
  SPEICHER.loesche(K_FREI);
  LEVEL.forEach(l => SPEICHER.loesche(K_BEST(l.nr)));
}

global.NS = {
  LEVEL, FAEHIGKEIT,
  level, naechstes, gebaut,
  crew, crewDazu, hatDabei, tempoBonus,
  bestzeit, merkeBestzeit,
  frei: istFrei, schalteFrei, geschafft,
  adresse, gehZu, titelZeilen, baueLevelbar, zuruecksetzen,
  alleFrei: ALLE_FREI,
  speicherEcht: SPEICHER.verfuegbar,
};

if(global.document){
  if(global.document.readyState === 'loading')
    global.document.addEventListener('DOMContentLoaded', baueLevelbar);
  else baueLevelbar();
}

})(window);
