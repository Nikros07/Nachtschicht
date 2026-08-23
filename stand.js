/* ============================================================================
   NACHTSCHICHT - SPIELSTAND UND LEVELLISTE

   Eine Datei fuer alle Level. Bisher hatte jedes Level seine eigenen
   localStorage-Schluessel und seine eigene, von Hand geschriebene
   Levelleiste. Bei zwei Leveln geht das, bei acht nicht mehr: dann steht
   dieselbe Liste an vier Stellen und eine davon ist immer falsch.

   Ein neues Level heisst jetzt: eine Zeile in LEVELS, fertig. Leiste,
   Freischaltung und "weiter zum naechsten" ergeben sich daraus.

   Wird als normales <script> vor der Spiellogik eingebunden - kein Build,
   kein Modul, funktioniert auch beim Doppelklick auf die Datei.
   ========================================================================== */

/* Die Reihenfolge hier ist die Reihenfolge der Nacht. */
const LEVELS = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE', junge:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ', junge:'MORITZ' },
];
const levelNr = nr => LEVELS.find(l => l.nr === nr) || null;

const STAND = (() => {
  const KEY = 'nachtschicht.stand';
  const leer = () => ({ crew:[], geschafft:{}, bestzeit:{} });
  let d = leer();

  try {
    const roh = localStorage.getItem(KEY);
    if (roh) d = Object.assign(leer(), JSON.parse(roh) || {});
  } catch(e) {}
  /* Sicherheitsnetz, falls im Speicher Unsinn steht */
  if (!Array.isArray(d.crew)) d.crew = [];
  if (!d.geschafft || typeof d.geschafft !== 'object') d.geschafft = {};
  if (!d.bestzeit || typeof d.bestzeit !== 'object') d.bestzeit = {};

  /* Die alten Einzelschluessel uebernehmen. Wer Level 1 schon durch hat,
     soll nicht dadurch von vorne anfangen, dass hier umgebaut wurde.
     Eine gespeicherte Bestzeit heisst: das Level war geschafft. */
  try {
    const alteCrew = JSON.parse(localStorage.getItem('nachtschicht.crew') || 'null');
    if (Array.isArray(alteCrew))
      for (const n of alteCrew) if (!d.crew.includes(n)) d.crew.push(n);
    for (const l of LEVELS) {
      const b = parseFloat(localStorage.getItem('nachtschicht.bestzeit' + l.nr));
      if (isFinite(b)) {
        if (d.bestzeit[l.nr] == null || b < d.bestzeit[l.nr]) d.bestzeit[l.nr] = b;
        d.geschafft[l.nr] = true;
      }
    }
  } catch(e) {}

  const sichern = () => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e) {} };
  sichern();

  /* ?frei=1 macht alles auf. Zum Ausprobieren eines spaeteren Levels, ohne
     jedes Mal die Nacht von vorne zu spielen - dasselbe wie ?touch=1. */
  const alleFrei = /[?&]frei=1/.test(location.search);

  return {
    crew:        () => d.crew.slice(),
    hatJungen:   n  => d.crew.includes(n),
    nimmJungen(n)   { if (!d.crew.includes(n)) { d.crew.push(n); sichern(); } },
    bestzeit:    nr => (d.bestzeit[nr] != null ? d.bestzeit[nr] : null),
    geschafft:   nr => !!d.geschafft[nr],
    /* Das erste Level ist immer frei, jedes weitere braucht das davor. */
    frei(nr)        { return alleFrei || nr <= LEVELS[0].nr || !!d.geschafft[nr - 1]; },
    alleFrei:    () => alleFrei,
    /* Gibt zurueck, ob das eine neue Bestzeit war. */
    schaffe(nr, zeit) {
      d.geschafft[nr] = true;
      let neu = false;
      if (zeit != null && (d.bestzeit[nr] == null || zeit < d.bestzeit[nr])) {
        d.bestzeit[nr] = zeit; neu = true;
      }
      sichern();
      return neu;
    },
    naechstes(nr)   { const i = LEVELS.findIndex(l => l.nr === nr); return i < 0 ? null : (LEVELS[i+1] || null); },
    zuruecksetzen() { d = leer(); sichern(); },
  };
})();

/* --------------------------------------------------------------------------
   Die Leiste unter dem Bildschirm. Gesperrte Level sind da, aber zu - man
   soll sehen, dass die Nacht weitergeht, und auch woran es gerade haengt.
   -------------------------------------------------------------------------- */
function baueLevelleiste(aktuell) {
  const bar = document.getElementById('levelbar');
  if (!bar) return;
  bar.textContent = '';
  for (const l of LEVELS) {
    /* Das Level, auf dem man gerade steht, zeigt immer seinen Namen. Wer
       level2.html direkt aufruft, ohne Level 1 durch zu haben, soll nicht
       auf einen Knopf mit der Aufschrift ZU schauen, auf dem er steht. */
    const frei = STAND.frei(l.nr) || l.nr === aktuell;
    const e = document.createElement(frei ? 'a' : 'span');
    if (frei) e.href = l.datei;
    e.className = (l.nr === aktuell ? 'aktiv' : '') + (frei ? '' : ' zu');
    e.textContent = l.nr + ' · ' + (frei ? l.name : 'ZU');
    if (!frei) {
      const davor = levelNr(l.nr - 1);
      e.title = davor ? 'Erst Level ' + davor.nr + ' schaffen' : 'Noch zu';
    }
    bar.appendChild(e);
  }
}

/* --------------------------------------------------------------------------
   Dieselbe Liste noch einmal fuers Titelbild im Spiel. Am Handy im Vollbild
   ist die HTML-Leiste weg, dort ist das hier die einzige Levelauswahl.
   Liefert nur die Zeilen - gezeichnet wird im jeweiligen Level, weil nur
   das seine Farben und seinen Font kennt.
   Ab vier fremden Leveln wird es eine Zeile: acht Zeilen passen unter den
   Steuerungsblock nicht mehr drunter.
   -------------------------------------------------------------------------- */
function levelZeilen(aktuell) {
  const andere = LEVELS.filter(l => l.nr !== aktuell);
  if (andere.length > 3) {
    const offen = andere.filter(l => STAND.frei(l.nr)).map(l => l.nr);
    return [['TASTE', offen.length ? 'LEVELWAHL  ' + offen.join(' ') : 'NOCH KEIN WEITERES LEVEL', !!offen.length]];
  }
  return andere.map(l => {
    const frei = STAND.frei(l.nr);
    return ['TASTE ' + l.nr, 'LEVEL ' + l.nr + ' - ' + (frei ? l.name : 'NOCH ZU'), frei];
  });
}
