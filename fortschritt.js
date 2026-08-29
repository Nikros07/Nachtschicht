/* ============================================================================
   NACHTSCHICHT - FORTSCHRITT UND LEVELLISTE

   Alles, was ueber ein einzelnes Level hinaus gilt, steht hier: welche Level
   es gibt, welche davon frei sind, wer aus der Crew dabei ist und was die
   Jungs koennen. Vorher lag das dreifach in den Leveldateien - die Leiste
   unter dem Bild war von Hand getippt, und ein neues Level haette geheissen:
   jede vorhandene Datei anfassen.

   Ein neues Level dazubauen heisst jetzt: einen Eintrag in LEVEL. Sonst
   nichts. Die Leiste, die Levelauswahl auf dem Titelbild und der Uebergang
   nach gewonnenem Level bauen sich daraus selbst.

   Bewusst ein ganz normales Script, kein Modul: ein Doppelklick auf
   index.html soll reichen, und Module scheitern ueber file:// an CORS.
   ========================================================================== */
(function(global){
'use strict';

/* ---- Die Level. Reihenfolge = Reihenfolge der Nacht. ---- */
var LEVEL = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE', uhr:'16:40' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ', uhr:'21:10' },
];

/* ---- Die Jungs. Jedes Level bringt einen, jeder gibt eine Faehigkeit.
   `tempo` ist ein Faktor auf das Gehtempo, alles andere sind Marken, die
   die Level abfragen koennen (`Fortschritt.hat('MORITZ')`). ---- */
var CREW = [
  { name:'MAX FERDI', ausLevel:1, tempo:1.15, kann:'+15% TEMPO' },
  { name:'MORITZ',    ausLevel:2, tempo:1,    kann:'BESSER BEI DEN CHAYAS' },
];

var KEY = 'nachtschicht.stand';

/* Zum Ausprobieren: ?alle=1 macht jedes Level frei, ohne den Spielstand
   anzufassen. Wie ?touch=1 fuer die Handysteuerung. */
var ALLE_FREI = /[?&]alle=1/.test(global.location ? global.location.search : '');

/* ---- Alte Spielstaende uebernehmen -------------------------------------
   Bis hierher lag der Fortschritt in drei Schluesseln: nachtschicht.crew
   und je eine Bestzeit pro Level. Wer schon gespielt hat, soll nicht
   ploetzlich wieder vor einem zugesperrten Level 2 stehen. */
function uebernehmeAlt(){
  var d = { crew:[], geschafft:[], best:{} };
  try {
    var c = JSON.parse(localStorage.getItem('nachtschicht.crew'));
    if(Array.isArray(c)) d.crew = c.filter(function(n){ return typeof n === 'string'; });
  } catch(e){}
  LEVEL.forEach(function(l){
    var v = parseFloat(localStorage.getItem('nachtschicht.bestzeit'+l.nr));
    if(isFinite(v)){
      d.best[l.nr] = v;
      if(d.geschafft.indexOf(l.nr) < 0) d.geschafft.push(l.nr);
    }
  });
  /* Wer einen Jungen dabei hat, hat dessen Level auch geschafft - auch wenn
     die Bestzeit fehlt, weil die Cutscene uebersprungen wurde. */
  d.crew.forEach(function(n){
    var p = person(n);
    if(p && d.geschafft.indexOf(p.ausLevel) < 0) d.geschafft.push(p.ausLevel);
  });
  return d;
}

function lies(){
  var d = null;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
  if(!d || typeof d !== 'object') d = uebernehmeAlt();
  if(!Array.isArray(d.crew)) d.crew = [];
  if(!Array.isArray(d.geschafft)) d.geschafft = [];
  if(!d.best || typeof d.best !== 'object') d.best = {};
  return d;
}

/* Schreiben darf nie das Spiel abschiessen: im privaten Modus mancher
   Browser wirft localStorage beim Setzen. Dann laeuft die Runde eben ohne
   Spielstand weiter. */
function schreib(d){
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){}
  return d;
}

function person(name){
  for(var i=0;i<CREW.length;i++) if(CREW[i].name === name) return CREW[i];
  return null;
}
function levelNr(nr){
  for(var i=0;i<LEVEL.length;i++) if(LEVEL[i].nr === nr) return LEVEL[i];
  return null;
}

/* ---- Abfragen ---------------------------------------------------------- */
function crew(){ return lies().crew; }
function hat(name){ return crew().indexOf(name) >= 0; }
function geschafft(nr){ return lies().geschafft.indexOf(nr) >= 0; }

/* Level 1 ist immer frei. Jedes weitere braucht das davor. */
function frei(nr){
  if(ALLE_FREI) return true;
  var i = LEVEL.findIndex(function(l){ return l.nr === nr; });
  if(i <= 0) return true;
  return geschafft(LEVEL[i-1].nr);
}

function best(nr){
  var v = lies().best[nr];
  return (typeof v === 'number' && isFinite(v)) ? v : null;
}

function naechstes(nr){
  var i = LEVEL.findIndex(function(l){ return l.nr === nr; });
  return (i >= 0 && i+1 < LEVEL.length) ? LEVEL[i+1] : null;
}

/* Die Adresse eines Levels. Der Rest der Zeile wird mitgenommen, sonst
   verliert man ?touch=1 und ?alle=1 beim ersten Levelwechsel - genau dann,
   wenn man beim Ausprobieren ist. */
function adresse(l){
  return l.datei + (global.location ? global.location.search : '');
}

/* Alle Faehigkeiten der Jungs, die schon dabei sind, multipliziert.
   Bisher stand das als `crew.includes('MAX FERDI')?1.15:1` in jeder
   Leveldatei - beim dritten Jungen waere das nicht mehr aufgegangen. */
function tempoBonus(){
  return crew().reduce(function(f,n){
    var p = person(n);
    return f * (p && p.tempo ? p.tempo : 1);
  }, 1);
}

/* ---- Aendern ----------------------------------------------------------- */
function crewDazu(name){
  var d = lies();
  if(d.crew.indexOf(name) < 0) d.crew.push(name);
  return schreib(d);
}

/* Level gewonnen. Gibt zurueck, was der Endbildschirm anzeigen will:
   ob die Zeit eine neue Bestzeit war und welches Level dadurch aufgeht. */
function fertig(nr, zeit){
  var d = lies();
  var auf = naechstes(nr);
  /* Vor dem Speichern merken, ob das naechste Level schon offen war -
     sonst ist die Freischaltung nie "neu" und der Endbildschirm feiert
     bei jedem Durchlauf dasselbe. */
  var warSchonOffen = !auf || frei(auf.nr);

  var neu = false;
  if(d.geschafft.indexOf(nr) < 0) d.geschafft.push(nr);
  if(typeof zeit === 'number' && isFinite(zeit)){
    var alt = d.best[nr];
    if(typeof alt !== 'number' || !isFinite(alt) || zeit < alt){ d.best[nr] = zeit; neu = true; }
  }
  schreib(d);
  return { neueBestzeit:neu, freigeschaltet:warSchonOffen ? null : auf };
}

function zuruecksetzen(){
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem('nachtschicht.crew');
    LEVEL.forEach(function(l){ localStorage.removeItem('nachtschicht.bestzeit'+l.nr); });
  } catch(e){}
}

/* ---- Die Leiste unter dem Bild ----------------------------------------
   Zugesperrte Level bleiben sichtbar, aber sind kein Link: man soll sehen,
   dass die Nacht weitergeht, ohne vorspringen zu koennen. */
function leiste(aktuell){
  var bar = document.getElementById('levelbar');
  if(!bar) return;
  bar.textContent = '';
  LEVEL.forEach(function(l){
    var offen = frei(l.nr);
    var e = document.createElement(offen ? 'a' : 'span');
    if(offen) e.href = adresse(l);
    e.className = (l.nr === aktuell ? 'aktiv' : '') + (offen ? '' : ' zu');
    e.textContent = l.nr + ' · ' + l.name;
    if(!offen) e.title = 'Erst Level ' + (l.nr-1) + ' schaffen';
    bar.appendChild(e);
  });
}

global.Fortschritt = {
  LEVEL:LEVEL, CREW:CREW,
  crew:crew, hat:hat, person:person, level:levelNr,
  geschafft:geschafft, frei:frei, best:best, naechstes:naechstes, adresse:adresse,
  tempoBonus:tempoBonus, crewDazu:crewDazu, fertig:fertig,
  zuruecksetzen:zuruecksetzen, leiste:leiste,
};
})(window);
