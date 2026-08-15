/* ============================================================================
   NACHTSCHICHT - DER SPIELSTAND

   Bis hierher hat jedes Level fuer sich gespeichert: die Crew unter einem
   Schluessel, jede Bestzeit unter einem eigenen. Welches Level frei ist,
   wusste niemand - die Leiste unter dem Bild zeigte immer alles.

   Ab jetzt liegt alles in einem Datensatz, und jedes Level fragt hier nach.
   Neue Level tragen sich in LEVEL ein, sonst nichts.

     { v, geschafft:[1,2], crew:['MAX FERDI'], best:{ '1':142.6 } }

   Alte Staende werden beim ersten Laden uebernommen, niemand verliert was.

   Zum Ausprobieren: ?frei=alle an die Adresse haengen macht alle Level auf.
   In der Konsole setzt Stand.zuruecksetzen() den Fortschritt zurueck.
   ========================================================================== */
(function (global) {
  'use strict';

  var SCHLUESSEL = 'nachtschicht.stand';
  var VERSION = 1;

  /* ---- Die Level. Alles andere haengt an dieser Liste. ----
     datei:null heisst "gibt es noch nicht" - die Leiste zeigt es als BALD.
     junge ist der, der sich nach dem Level anschliesst. */
  var LEVEL = [
    { nr: 1, datei: 'index.html',  name: 'DIE SCHULE',   junge: 'MAX FERDI' },
    { nr: 2, datei: 'level2.html', name: 'BEI MORITZ',   junge: 'MORITZ' },
    { nr: 3, datei: null,          name: 'DER NACHTBUS', junge: null },
  ];

  var ALLE_FREI = /[?&]frei=alle/.test(global.location.search);

  function leer() { return { v: VERSION, geschafft: [], crew: [], best: {} }; }

  function schreib(s) {
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(s)); } catch (e) {}
  }

  /* Nichts ungeprueft uebernehmen. Ein kaputter Eintrag im Speicher darf
     nicht das ganze Spiel lahmlegen - im Zweifel faengt man eben neu an. */
  function lies() {
    var roh = null;
    try { roh = JSON.parse(localStorage.getItem(SCHLUESSEL)); } catch (e) {}
    if (!roh || typeof roh !== 'object') return uebernehmeAlt();
    var s = leer();
    if (Array.isArray(roh.geschafft))
      s.geschafft = roh.geschafft.filter(function (n) { return typeof n === 'number' && isFinite(n); });
    if (Array.isArray(roh.crew))
      s.crew = roh.crew.filter(function (n) { return typeof n === 'string' && n.length; });
    if (roh.best && typeof roh.best === 'object')
      for (var k in roh.best) {
        var v = parseFloat(roh.best[k]);
        if (isFinite(v) && v > 0) s.best[k] = v;
      }
    s.geschafft.sort(function (a, b) { return a - b; });
    return s;
  }

  /* Einmalige Uebernahme der alten Einzelschluessel. */
  function uebernehmeAlt() {
    var s = leer(), i, l;
    try {
      var c = JSON.parse(localStorage.getItem('nachtschicht.crew'));
      if (Array.isArray(c)) s.crew = c.filter(function (x) { return typeof x === 'string' && x.length; });
    } catch (e) {}
    for (i = 0; i < LEVEL.length; i++) {
      l = LEVEL[i];
      var v = NaN;
      try { v = parseFloat(localStorage.getItem('nachtschicht.bestzeit' + l.nr)); } catch (e) {}
      if (isFinite(v) && v > 0) {
        s.best[l.nr] = v;
        if (s.geschafft.indexOf(l.nr) < 0) s.geschafft.push(l.nr);
      }
    }
    /* Bestzeiten gab es erst spaeter als die Crew. Wer den Jungen aus einem
       Level dabei hat, hat es geschafft - das ist der aeltere Beleg. */
    for (i = 0; i < LEVEL.length; i++) {
      l = LEVEL[i];
      if (l.junge && s.crew.indexOf(l.junge) >= 0 && s.geschafft.indexOf(l.nr) < 0) s.geschafft.push(l.nr);
    }
    s.geschafft.sort(function (a, b) { return a - b; });
    if (s.crew.length || s.geschafft.length) schreib(s);
    return s;
  }

  var stand = lies();

  var Stand = {
    LEVEL: LEVEL,
    alleFrei: ALLE_FREI,

    /* ---- Lesen ---- */
    crew: function () { return stand.crew.slice(); },
    hat: function (name) { return stand.crew.indexOf(name) >= 0; },
    best: function (nr) { var v = stand.best[nr]; return isFinite(v) ? v : null; },
    istGeschafft: function (nr) { return stand.geschafft.indexOf(nr) >= 0; },
    level: function (nr) {
      for (var i = 0; i < LEVEL.length; i++) if (LEVEL[i].nr === nr) return LEVEL[i];
      return null;
    },
    /* Level 1 ist immer offen, jedes weitere braucht das davor. */
    frei: function (nr) { return ALLE_FREI || nr <= 1 || stand.geschafft.indexOf(nr - 1) >= 0; },
    /* Das naechste Level, das es wirklich schon gibt. */
    naechstes: function (nr) {
      for (var i = 0; i < LEVEL.length; i++) if (LEVEL[i].nr > nr && LEVEL[i].datei) return LEVEL[i];
      return null;
    },

    /* ---- Schreiben ---- */
    /* Ein Level ist durch. Gibt true zurueck, wenn es eine neue Bestzeit war. */
    geschafft: function (nr, zeit, junge) {
      if (stand.geschafft.indexOf(nr) < 0) {
        stand.geschafft.push(nr);
        stand.geschafft.sort(function (a, b) { return a - b; });
      }
      if (junge && stand.crew.indexOf(junge) < 0) stand.crew.push(junge);
      var neu = false;
      if (isFinite(zeit) && zeit > 0) {
        var alt = stand.best[nr];
        if (!isFinite(alt) || zeit < alt) { stand.best[nr] = zeit; neu = true; }
      }
      schreib(stand);
      return neu;
    },
    zuruecksetzen: function () {
      stand = leer();
      try {
        localStorage.removeItem(SCHLUESSEL);
        localStorage.removeItem('nachtschicht.crew');
        for (var i = 0; i < LEVEL.length; i++) localStorage.removeItem('nachtschicht.bestzeit' + LEVEL[i].nr);
      } catch (e) {}
      return 'Spielstand geloescht.';
    },

    /* ---- Navigation ---- */
    /* ?frei=alle muss beim Wechsel mitwandern, sonst ist es nach einem
       Klick wieder weg und man steht vor derselben Sperre. */
    link: function (datei) { return ALLE_FREI ? datei + '?frei=alle' : datei; },
    geheZu: function (nr) {
      var l = Stand.level(nr);
      if (!l || !l.datei || !Stand.frei(nr)) return false;
      global.location.href = Stand.link(l.datei);
      return true;
    },

    /* ---- Die Leiste unter dem Bild ----
       Sie war bisher fest im HTML verdrahtet. Jedes neue Level haette in
       jeder Datei nachgetragen werden muessen. */
    baueLeiste: function (aktivNr) {
      var leiste = document.getElementById('levelbar');
      if (!leiste) return;
      leiste.innerHTML = '';
      for (var i = 0; i < LEVEL.length; i++) {
        var l = LEVEL[i], beschriftung = l.nr + ' · ' + l.name, kn;
        if (!l.datei) {
          kn = document.createElement('span');
          kn.className = 'bald';
          kn.textContent = beschriftung + ' · BALD';
        } else if (l.nr === aktivNr) {
          kn = document.createElement('a');
          kn.className = 'aktiv';
          kn.href = Stand.link(l.datei);
          kn.textContent = beschriftung;
        } else if (Stand.frei(l.nr)) {
          kn = document.createElement('a');
          kn.href = Stand.link(l.datei);
          kn.textContent = beschriftung;
        } else {
          kn = document.createElement('span');
          kn.className = 'zu';
          kn.textContent = beschriftung + ' · ZU';
          kn.title = 'Erst Level ' + (l.nr - 1) + ' schaffen';
        }
        leiste.appendChild(kn);
      }
    },
  };

  global.Stand = Stand;
})(window);
