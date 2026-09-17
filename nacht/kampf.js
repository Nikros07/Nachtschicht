/* ============================================================================
   NACHTSCHICHT - ENGINE: kampf
   Nahkampf mit Kontern, Blocken, Ausdauer und Ausweichen in die Tiefe.

   Herkunft: der Kern kommt aus runner.html (Zustandsautomat, Gegnertypen,
   Knockback, Hit-Stop). Die Konter-Mathematik kommt aus level4.html, weil
   sie dort besser war: das Fenster ist ein ANTEIL am Ende des Ausholens
   statt des ganzen Ausholens, und Fehlschlaege kosten Erholung.

   Neu und vorher nirgends im Projekt vorhanden: Blocken (auch fuer Gegner),
   Ausdauer, Ausweichrolle, unblockbare Angriffe.

   Braucht welt.js (Tiefe, bewegeTiefe) - deshalb NACH welt.js laden.

   Spieler und Gegner benutzen denselben Automaten:
     frei -> ausholen -> schlag -> erholung -> frei
     quer dazu: block, rolle, getroffen
   ========================================================================== */

const KAMPF = {
  /* (1) SPIELER-SCHLAG */
  ausholen:      0.18,   // kurz - der Spieler soll sich flink anfuehlen
  schlagDauer:   0.12,
  erholung:      0.22,
  fehlErholung:  0.55,   // Luftschlag bestraft: so lange steht man dumm da
  reichweite:      16,
  tiefeToleranz: 0.22,   // wie genau die Tiefe stimmen muss, um zu treffen

  /* (2) KONTER - Anteil am ENDE des gegnerischen Ausholens */
  konterAnteil:     0.34,
  konterSchaden:       3,
  konterBetaeubung:  0.9,

  /* (3) AUSDAUER - beendet das Knopf-Haemmern */
  ausdauerMax:      100,
  ausdauerSchlag:    18,
  ausdauerRolle:     25,
  ausdauerZurueck:   26,  // pro Sekunde, nur im Zustand frei
  ausdauerPause:    0.7,  // so lange nach Verbrauch kommt nichts zurueck

  /* (4) BLOCKEN
     Bewusst KEIN sicherer Dauerzustand: im Spieltest hat ein Bot, der immer
     geblockt hat, den Kampf fast unbeschadet gewonnen. Deshalb blutet
     Dauerdeckung (Anteil durch) und kostet spuerbar Ausdauer. */
  blockSchadenAnteil: 0.35,  // was trotzdem durchkommt
  ausdauerBlockKosten: 22,   // pro geblocktem Treffer
  gardeBruch:          1.1,  // Betaeubung, wenn die Ausdauer beim Blocken reisst

  /* (5) AUSWEICHROLLE - in die Tiefe, dafuer ist die dritte Achse da */
  rolleDauer:        0.34,
  rolleWeite:        0.42,   // Anteil des Tiefenbandes
  rolleUnverwundbar: 0.22,

  /* (6) TREFFER */
  unverwundbarNachTreffer: 0.55,
  rueckstoss:   22,
  hitStop:    0.07,   // kurzer Zeitstopp, macht Treffer wuchtig
};

/* Kurzer Zeitstopp nach einem Treffer. Das Level multipliziert sein dt
   damit - dadurch fuehlt sich ein Treffer nach etwas an. */
let kampfStop = 0;
const kampfZeitFaktor = () => kampfStop > 0 ? 0 : 1;
function kampfStopTakt(dt){ if(kampfStop > 0) kampfStop = Math.max(0, kampfStop - dt); }

function kaempfer(o){
  return Object.assign({
    x:0, t:0.5, h:0, blick:1, vt:0,
    hp:3, maxHp:3,
    ausdauer:KAMPF.ausdauerMax, ausdauerPause:0,
    zustand:'frei', zT:0, unverwundbar:0, betaeubt:0,
    art:'spieler', trefferGesetzt:false, denkT:0,
  }, o||{});
}

const kannHandeln = k => k.zustand === 'frei' && k.betaeubt <= 0;
const hatAusdauer = (k,n) => k.ausdauer >= n;

function verbrauche(k,n){
  k.ausdauer = Math.max(0, k.ausdauer - n);
  k.ausdauerPause = KAMPF.ausdauerPause;
}

/* ---- Aktionen ---- */
function schlage(k){
  if(!kannHandeln(k) || !hatAusdauer(k, KAMPF.ausdauerSchlag)) return false;
  verbrauche(k, KAMPF.ausdauerSchlag);
  k.zustand = 'ausholen'; k.zT = 0; k.trefferGesetzt = false;
  return true;
}
function blocke(k,an){
  if(an){ if(kannHandeln(k)) k.zustand = 'block'; }
  else if(k.zustand === 'block') k.zustand = 'frei';
}
function rolle(k,richtung){
  if(k.zustand !== 'frei' && k.zustand !== 'block') return false;
  if(k.betaeubt > 0) return false;
  if(!hatAusdauer(k, KAMPF.ausdauerRolle)) return false;
  verbrauche(k, KAMPF.ausdauerRolle);
  k.zustand = 'rolle'; k.zT = 0; k.rolleZiel = richtung;
  k.unverwundbar = Math.max(k.unverwundbar, KAMPF.rolleUnverwundbar);
  return true;
}

/* ---- Automat ---- */
function kaempferTakt(k,dt){
  k.zT += dt;
  if(k.unverwundbar > 0) k.unverwundbar -= dt;
  if(k.betaeubt > 0){
    k.betaeubt -= dt;
    if(k.betaeubt <= 0 && k.zustand === 'getroffen'){ k.zustand = 'frei'; k.zT = 0; }
  }

  /* Ausdauer kommt nur im Nichtstun zurueck, und erst nach kurzer Pause. */
  if(k.ausdauerPause > 0) k.ausdauerPause -= dt;
  else if(k.zustand === 'frei')
    k.ausdauer = Math.min(KAMPF.ausdauerMax, k.ausdauer + KAMPF.ausdauerZurueck * dt);

  const r = k.regler || KAMPF;

  if(k.zustand === 'ausholen' && k.zT >= (k.ausholenDauer || r.ausholen)){
    k.zustand = 'schlag'; k.zT = 0; k.trefferGesetzt = false;
  }
  else if(k.zustand === 'schlag' && k.zT >= (k.schlagDauer || r.schlagDauer)){
    /* Nichts getroffen? Dann die lange Erholung - Luftschlaege muessen weh tun. */
    k.aktErholung = k.trefferGesetzt ? (r.erholung || KAMPF.erholung)
                                     : (r.fehlErholung || KAMPF.fehlErholung);
    k.zustand = 'erholung'; k.zT = 0;
  }
  else if(k.zustand === 'erholung' && k.zT >= (k.aktErholung || r.erholung)){
    k.zustand = 'frei'; k.zT = 0;
  }
  else if(k.zustand === 'rolle'){
    bewegeTiefe(k, k.rolleZiel, dt, KAMPF.rolleWeite / KAMPF.rolleDauer, 22);
    if(k.zT >= KAMPF.rolleDauer){ k.zustand = 'frei'; k.zT = 0; k.vt = 0; }
  }
}

/* Steckt der Angreifer im konterbaren Teil seines Ausholens? */
function imKonterfenster(g, anteil){
  if(g.zustand !== 'ausholen') return false;
  const a = anteil || KAMPF.konterAnteil;
  const d = g.ausholenDauer || (g.regler || KAMPF).ausholen;
  return g.zT >= d * (1 - a);
}

/* In Reichweite UND auf gleicher Tiefe? Beides muss stimmen - das ist der
   Grund, warum die Ausweichrolle ueberhaupt etwas bringt. */
function trifftRaeumlich(a, z, reichweite){
  const vor = (z.x - a.x) * a.blick;
  if(vor < 0 || vor > reichweite) return false;
  return Math.abs((z.t || 0) - (a.t || 0)) <= KAMPF.tiefeToleranz;
}

/* ---- Treffer aufloesen ----
   Aufrufen, solange der Angreifer im Zustand 'schlag' ist.
   Liefert: 'daneben' | 'block' | 'gardebruch' | 'treffer' | null */
function loeseTreffer(angreifer, ziel, opt){
  opt = opt || {};
  if(angreifer.trefferGesetzt) return null;
  if(angreifer.zustand !== 'schlag') return null;
  const reich = opt.reichweite || angreifer.reichweite || KAMPF.reichweite;
  if(!trifftRaeumlich(angreifer, ziel, reich)) return null;

  angreifer.trefferGesetzt = true;

  /* Ausweichrolle: unverwundbar, der Schlag geht ins Leere. */
  if(ziel.unverwundbar > 0) return 'daneben';

  /* Blocken - ausser bei unblockbaren Angriffen. */
  if(ziel.zustand === 'block' && !opt.unblockbar){
    ziel.ausdauer -= KAMPF.ausdauerBlockKosten;
    ziel.ausdauerPause = KAMPF.ausdauerPause;
    ziel.hp -= (opt.schaden || 1) * KAMPF.blockSchadenAnteil;
    if(ziel.ausdauer <= 0){                 // Garde gebrochen
      ziel.ausdauer = 0;
      ziel.zustand = 'getroffen';
      ziel.betaeubt = KAMPF.gardeBruch;
      kampfStop = KAMPF.hitStop;
      return 'gardebruch';
    }
    kampfStop = KAMPF.hitStop * 0.6;
    return 'block';
  }

  ziel.hp -= (opt.schaden || 1);
  ziel.zustand = 'getroffen';
  ziel.betaeubt = opt.betaeubung || 0.4;
  ziel.unverwundbar = KAMPF.unverwundbarNachTreffer;
  ziel.x += (Math.sign(ziel.x - angreifer.x) || 1) * KAMPF.rueckstoss * 0.35;
  kampfStop = KAMPF.hitStop;
  return 'treffer';
}

/* Konterversuch im Moment des DRUECKENS.

   Warum nicht erst, wenn der eigene Schlag aktiv wird: der Spieler hat
   selbst eine Ausholzeit. Bei einem kurzen Gegner-Jab ist das Fenster
   keine 200 ms lang - zieht man davon die eigene Ausholzeit ab, bleiben
   ein paar Millisekunden uebrig. Im Spieltest war der Konter dadurch
   praktisch unmoeglich. Also zaehlt der Tastendruck, nicht der Treffer.

   Liefert true, wenn gekontert wurde. */
function konterVersuch(s, g, opt){
  opt = opt || {};
  if(opt.unblockbar) return false;      // manche Angriffe kontert man nicht
  if(s.zustand !== 'frei') return false;
  if(!imKonterfenster(g, opt.konterAnteil)) return false;
  if(!trifftRaeumlich(s, g, opt.reichweite || KAMPF.reichweite)) return false;
  if(!hatAusdauer(s, KAMPF.ausdauerSchlag)) return false;
  verbrauche(s, KAMPF.ausdauerSchlag);
  g.hp -= (opt.schaden || KAMPF.konterSchaden);
  g.zustand = 'getroffen';
  g.betaeubt = KAMPF.konterBetaeubung;
  g.unverwundbar = 0.1;
  /* Der Schlag wird trotzdem gezeigt, trifft aber nicht noch einmal. */
  s.zustand = 'schlag'; s.zT = 0; s.trefferGesetzt = true;
  kampfStop = KAMPF.hitStop * 1.6;
  return true;
}

/* Der Spieler schlaegt zu. Trifft er den Gegner im Ausholen, ist es ein
   Konter - das ist der Kern des ganzen Kampfsystems. */
function spielerTrifft(spieler, gegner, opt){
  opt = opt || {};
  if(!spieler.trefferGesetzt && imKonterfenster(gegner, opt.konterAnteil)){
    const reich = opt.reichweite || KAMPF.reichweite;
    if(trifftRaeumlich(spieler, gegner, reich)){
      spieler.trefferGesetzt = true;
      gegner.hp -= KAMPF.konterSchaden;
      gegner.zustand = 'getroffen';
      gegner.betaeubt = KAMPF.konterBetaeubung;
      gegner.unverwundbar = 0.1;
      kampfStop = KAMPF.hitStop * 1.6;
      return 'konter';
    }
  }
  return loeseTreffer(spieler, gegner, opt);
}

/* ---- Gegnertypen. Werte stammen aus runner.html und sind dort erprobt. ---- */
const GEGNER_ARTEN = {
  schlaeger: { hp:2, tempo:26, ausholen:0.52, schlagDauer:0.16, erholung:0.62,
               fehlErholung:0.62, reichweite:16, blockChance:0.25 },
  brocken:   { hp:4, tempo:15, ausholen:0.78, schlagDauer:0.20, erholung:0.80,
               fehlErholung:0.80, reichweite:18, blockChance:0.45, unblockbar:true },
  flitzer:   { hp:1, tempo:54, ausholen:0.34, schlagDauer:0.12, erholung:0.48,
               fehlErholung:0.48, reichweite:14, blockChance:0.10 },
  werfer:    { hp:1, tempo:18, ausholen:0.60, schlagDauer:0.14, erholung:0.70,
               fehlErholung:0.70, reichweite:78, blockChance:0.05, fern:true },
};

function gegner(art, x, t){
  const a = GEGNER_ARTEN[art] || GEGNER_ARTEN.schlaeger;
  return kaempfer({
    x:x, t:(t === undefined ? 0.5 : t), art:art,
    hp:a.hp, maxHp:a.hp, regler:a,
    ausholenDauer:a.ausholen, schlagDauer:a.schlagDauer,
    reichweite:a.reichweite, tempo:a.tempo,
    blockChance:a.blockChance, unblockbar:!!a.unblockbar, fern:!!a.fern,
  });
}

/* Einfache, aber nicht dumme KI: heranlaufen, die Tiefe des Ziels angleichen,
   zuschlagen wenn nah genug, und gelegentlich decken statt angreifen -
   das allein macht stumpfes Haemmern schon unrentabel. */
function gegnerTakt(g, dt, ziel, opt){
  opt = opt || {};
  kaempferTakt(g, dt);
  if(g.hp <= 0 || g.betaeubt > 0) return;
  g.blick = Math.sign(ziel.x - g.x) || g.blick;
  if(g.zustand !== 'frei' && g.zustand !== 'block') return;

  const dx = Math.abs(ziel.x - g.x);
  const dtf = (ziel.t || 0) - (g.t || 0);
  const nah = dx <= g.reichweite * 0.9 && Math.abs(dtf) <= KAMPF.tiefeToleranz;

  g.denkT -= dt;
  if(nah){
    if(g.zustand === 'block'){ if(g.denkT <= 0) blocke(g, false); return; }
    if(g.denkT <= 0 && Math.random() < g.blockChance){
      blocke(g, true); g.denkT = 0.5 + Math.random() * 0.6; return;
    }
    schlage(g);
    return;
  }
  if(g.zustand === 'block') blocke(g, false);
  const tempo = (g.tempo || 24) * (opt.tempoFaktor || 1);
  g.x += Math.sign(ziel.x - g.x) * tempo * dt;
  if(Math.abs(dtf) > 0.04) bewegeTiefe(g, Math.sign(dtf), dt, TIEFE.tempo * 0.55, 10);
}
