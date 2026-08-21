/* ==========================================================================
   NACHTSCHICHT - SPIELSTAND UND LEVELLISTE

   Alles, was ueber ein einzelnes Level hinaus gilt, steht hier: welche Level
   offen sind, wer aus der Crew dabei ist, welche Bestzeiten stehen und was
   nach einem geschafften Level kommt.

   Vorher lag das verstreut. Jede Leveldatei kannte die Dateinamen der anderen
   von Hand, die Bestzeit hatte pro Level einen eigenen localStorage-Schluessel,
   und welches Level freigespielt war, wusste ueberhaupt niemand - man konnte
   Level 2 anspringen, ohne Level 1 je gesehen zu haben. Ein Level dazuzubauen
   hiess: in jeder bestehenden Datei nachziehen.

   Jetzt steht die Levelliste an genau einer Stelle. Ein neues Level ist eine
   Zeile in LEVELS.

   Bewusst eine klassische Datei ohne Module und ohne Bundler: Nachtschicht
   muss sich per Doppelklick oeffnen lassen, und ein ES-Modul wuerde der
   Browser unter file:// blockieren.
   ========================================================================== */

/* Die ganze Nacht in einer Liste. `datei: null` heisst: gibt es noch nicht.
   `bringt` ist der aus der Crew, den das Level freischaltet. */
const LEVELS = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   uhr:'16:40', bringt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   uhr:'21:10', bringt:'MORITZ' },
  { nr:3, datei:null,          name:'DER NACHTBUS', uhr:'22:00' },
  { nr:4, datei:null,          name:'DIE SCHLANGE', uhr:'23:20' },
  { nr:5, datei:null,          name:'CLUB',         uhr:'00:40' },
  { nr:6, datei:null,          name:'AFTERHOUR',    uhr:'03:10' },
  { nr:7, datei:null,          name:'SPAETI',       uhr:'05:00' },
  { nr:8, datei:null,          name:'HEIMWEG',      uhr:'06:20' },
];

/* Zum Entwickeln und Testen: mit ?alle=1 an der Adresse sind alle gebauten
   Level offen, ohne den gespeicherten Stand anzufassen. Gleiche Idee wie das
   schon vorhandene ?touch=1. */
const ALLE_OFFEN = /[?&]alle=1/.test(location.search);

const Spielstand = (() => {
  const KEY = 'nachtschicht.stand';
  const leer = () => ({ frei:1, crew:[], zeiten:{} });
  let stand = null;

  /* Wer schon gespielt hat, faengt nicht bei null an: beim ersten Start
     werden die alten Einzelschluessel eingesammelt. Eine gelaufene Bestzeit
     ist der Beweis, dass das Level geschafft wurde - also gilt das naechste
     als frei. */
  function ausAltemFormat(){
    const s = leer();
    try {
      const c = JSON.parse(localStorage.getItem('nachtschicht.crew'));
      if (Array.isArray(c)) s.crew = c.filter(n => typeof n === 'string');
    } catch(e){}
    for (const l of LEVELS){
      let v = NaN;
      try { v = parseFloat(localStorage.getItem('nachtschicht.bestzeit' + l.nr)); } catch(e){}
      if (isFinite(v) && v > 0){
        s.zeiten[l.nr] = v;
        s.frei = Math.max(s.frei, Math.min(LEVELS.length, l.nr + 1));
      }
    }
    return s;
  }

  /* Fremde oder kaputte Daten duerfen das Spiel nicht umbringen - im
     Zweifel steht der Stand danach eben auf Anfang. */
  function pruefe(s){
    const g = leer();
    if (!s || typeof s !== 'object') return g;
    const frei = parseInt(s.frei, 10);
    if (isFinite(frei)) g.frei = Math.max(1, Math.min(LEVELS.length, frei));
    if (Array.isArray(s.crew)) g.crew = s.crew.filter(n => typeof n === 'string');
    if (s.zeiten && typeof s.zeiten === 'object'){
      for (const l of LEVELS){
        const v = parseFloat(s.zeiten[l.nr]);
        if (isFinite(v) && v > 0) g.zeiten[l.nr] = v;
      }
    }
    return g;
  }

  function lade(){
    if (stand) return stand;
    let roh = null;
    try { roh = JSON.parse(localStorage.getItem(KEY)); } catch(e){}
    stand = roh ? pruefe(roh) : ausAltemFormat();
    return stand;
  }
  function schreibe(){
    try { localStorage.setItem(KEY, JSON.stringify(lade())); } catch(e){}
  }

  return {
    /* --- Crew --- */
    crew:     () => lade().crew.slice(),
    hatCrew:  n  => lade().crew.indexOf(n) >= 0,
    crewDazu(n){
      const s = lade();
      if (n && s.crew.indexOf(n) < 0){ s.crew.push(n); schreibe(); }
    },

    /* --- Fortschritt --- */
    frei:  () => lade().frei,
    offen: nr => ALLE_OFFEN || nr <= lade().frei,
    bestzeit(nr){ const v = lade().zeiten[nr]; return isFinite(v) ? v : null; },

    /* Level abgeschlossen. Schaltet das naechste frei, traegt die Zeit ein
       und gibt zurueck, ob es eine neue Bestzeit war. */
    geschafft(nr, zeit){
      const s = lade();
      let neu = false;
      if (isFinite(zeit) && zeit > 0 && (!isFinite(s.zeiten[nr]) || zeit < s.zeiten[nr])){
        s.zeiten[nr] = zeit; neu = true;
      }
      s.frei = Math.max(s.frei, Math.min(LEVELS.length, nr + 1));
      schreibe();
      return neu;
    },

    /* --- Levelliste --- */
    level: nr => LEVELS.find(l => l.nr === nr) || null,
    /* Das naechste Level, das es wirklich gibt. null heisst: hier ist die
       Nacht vorerst zu Ende. */
    naechstes(nr){ return LEVELS.find(l => l.nr > nr && l.datei) || null; },
    /* Was in der Leiste auftaucht: alles Gebaute, plus das erste, das noch
       fehlt - damit man sieht, wohin es geht, ohne acht tote Knoepfe. */
    inDerLeiste(){
      const naechstesUngebaut = LEVELS.find(l => !l.datei);
      return LEVELS.filter(l => l.datei || l === naechstesUngebaut);
    },
    /* Zum Testen und fuer den Fall, dass jemand von vorn anfangen will. */
    zuruecksetzen(){ stand = leer(); schreibe(); },
  };
})();

/* Die Leiste unter dem Bild. Gebaut statt fest verdrahtet, damit ein neues
   Level nicht in jeder Datei nachgezogen werden muss. Gesperrte Level sind
   sichtbar, aber kein Link - man soll wissen, dass sie da sind. */
function baueLevelleiste(aktuell){
  const bar = document.getElementById('levelbar');
  if (!bar) return;
  bar.textContent = '';
  for (const l of Spielstand.inDerLeiste()){
    const offen = !!l.datei && Spielstand.offen(l.nr);
    const el = document.createElement(offen && l.nr !== aktuell ? 'a' : 'span');
    if (offen && l.nr !== aktuell) el.href = l.datei;
    el.textContent = l.nr + ' · ' + l.name;
    if (l.nr === aktuell) el.className = 'aktiv';
    else if (!l.datei) el.className = 'zu';
    else if (!offen) el.className = 'zu';
    el.title = !l.datei ? 'KOMMT NOCH'
             : !offen  ? 'ERST LEVEL ' + (l.nr - 1) + ' SCHAFFEN'
             : l.name;
    bar.appendChild(el);
  }
}

/* Levelwechsel per Zahlentaste. Gibt false zurueck, wenn da nichts ist -
   den Fehlton macht das aufrufende Level, das kennt seinen eigenen Klang. */
function wechsleZuLevel(nr, aktuell){
  if (nr === aktuell) return false;
  const l = Spielstand.level(nr);
  if (!l || !l.datei || !Spielstand.offen(nr)) return false;
  location.href = l.datei;
  return true;
}

/* Was auf dem Titelbild als Levelwahl steht. Genau zwei Zeilen, mehr laesst
   der Rand nicht zu - die CRT-Blende frisst die untersten Pixel weg.

   Zeile 1 ist immer dieses Level. Zeile 2 ist der wichtigste Ausgang von
   hier: das naechste gebaute Level, sonst der Weg zurueck, sonst der
   Hinweis, was als Naechstes kommt. Vorwaerts geht vor rueckwaerts, aber im
   Vollbild ist die Leiste unter dem Bild weg - dann muss hier wenigstens
   ein Weg heraus stehen.

   Gibt fertige Zeilen zurueck, gezeichnet wird im Level: die Schrift
   gehoert dorthin. */
function levelwahlZeilen(aktuell){
  const zeile = l => {
    const hier  = l.nr === aktuell;
    const offen = !!l.datei && Spielstand.offen(l.nr);
    const taste = hier ? 'LEERTASTE' : (offen ? 'TASTE ' + l.nr : '');
    const nach  = !l.datei ? '  KOMMT NOCH' : (!offen ? '  NOCH ZU' : '');
    return { txt:(taste + '           ').slice(0,11) + l.nr + ' - ' + l.name + nach,
             hier, offen };
  };
  const dieses  = Spielstand.level(aktuell);
  if (!dieses) return [];
  const weiter  = Spielstand.naechstes(aktuell);
  const zurueck = LEVELS.slice().reverse().find(l => l.nr < aktuell && l.datei);
  const kommt   = Spielstand.level(aktuell + 1);
  const zweite  = weiter || zurueck || kommt;
  if (!zweite) return [zeile(dieses)];
  /* Immer aufsteigend lesen - welches gerade laeuft, sagt schon das
     LEERTASTE davor. */
  const beide = [dieses, zweite].sort((a, b) => a.nr - b.nr);
  return beide.map(zeile);
}
