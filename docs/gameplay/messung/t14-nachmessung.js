/* Nachmessung T14 - Konterfenster, Fristen und Fehlerfaelle mit Zahlen belegen.
   Aus der Projektwurzel starten: node docs/gameplay/messung/t14-nachmessung.js

   Was hier passiert:
   - Jede Messung laeuft in ihrem eigenen try/catch. Schlaegt sie fehl (Name fehlt,
     Seite nicht lesbar), steht in der Tabelle Status FEHLT und der Grund.
   - Ziel verfehlt -> Status ZIEL VERFEHLT; am Ende Exit 1, wenn eine Messung ihr Ziel verfehlt.
   - Nichts hier aendert Spieldateien. Die Messung liest nur den Zustand der Seiten. */
const path = require('path');
const WURZEL = path.join(__dirname, '..', '..', '..');
process.chdir(WURZEL);
const N = require(path.join(WURZEL, 'tools', 'nachttest.js'));

const ERGEBNISSE = [];
let fehlerZahl = 0;

function zeile(name, wert, ziel, status, hinweis) {
  ERGEBNISSE.push({ name, wert, ziel, status, hinweis: hinweis || '' });
  if (status === 'ZIEL VERFEHLT' || status === 'FEHLT') fehlerZahl++;
}

function messe(name, ziel, fn) {
  try {
    const r = fn();
    // r = { wert: string|number, ok: true|false|null, hinweis? }
    const status = r.ok === null ? 'INFO' : (r.ok ? 'OK' : 'ZIEL VERFEHLT');
    zeile(name, r.wert, ziel, status, r.hinweis);
  } catch (e) {
    zeile(name, '-', ziel, 'FEHLT', String(e && e.message || e).slice(0, 120));
  }
}

const STUFEN = ['locker', 'normal', 'hart'];
const schalte = (L, k) => L.api.ev('setzeSchwierigkeit("' + k + '")');
const rund = x => Math.round(x);

/* 1. Engine-Konterfenster Flitzer/Schlaeger (level4.html, konterAnteilFuer aus kampf.js) */
for (const k of STUFEN) {
  const ziel = k === 'locker' ? 249 : (k === 'normal' ? 179 : null);
  messe('1 Konterfenster Engine ' + k, ziel ? '>= ' + ziel + ' ms' : '-', () => {
    const L = N.lade('level4.html');
    schalte(L, k);
    const werte = ['flitzer', 'schlaeger'].map(art => {
      const ms = L.api.ev('(function(){ const g=gegner("' + art + '",0,0.5); return konterAnteilFuer(g)*g.ausholenDauer/schwer().gegner*1000; })()');
      return ms;
    });
    const min = Math.min(...werte);
    return { wert: rund(min) + ' ms (Flitzer ' + rund(werte[0]) + ', Schlaeger ' + rund(werte[1]) + ')',
      ok: ziel ? min >= ziel : null };
  });
}

/* 2. Level 2 Tuerkampf: Konterfenster je Stufe */
for (const k of STUFEN) {
  messe('2 Level 2 Tuerkampf ' + k, k === 'normal' ? '>= 330 ms' : '-', () => {
    const L = N.lade('level2.html');
    schalte(L, k);
    L.api.ev('S.gegner={lern:false}');
    const ms = L.api.ev('windupJetzt()*TUNE.konterFenster*1000');
    return { wert: rund(ms) + ' ms', ok: k === 'normal' ? ms >= 330 : null };
  });
}

/* 3. Level 4 Jab-Fenster je Stufe */
for (const k of STUFEN) {
  messe('3 Level 4 Jab-Fenster ' + k, '>= 359 ms', () => {
    const L = N.lade('level4.html');
    schalte(L, k);
    const ms = L.api.ev('(function(){ const a=Math.max(TUNE.fensterAnteil,TUNE.fensterMinSek*schwer().gegner/TUNE.jabWindup); return a*TUNE.jabWindup/schwer().gegner*1000; })()');
    return { wert: rund(ms) + ' ms', ok: ms >= 359 };
  });
}

/* 4. Level 7 Pfandwurf: Zeit in der Trefferzone je Durchgang (normal) */
messe('4 Level 7 Pfandwurf normal', '>= 100 ms', () => {
  const L = N.lade('level7.html');
  schalte(L, 'normal');
  const [lo, hi] = L.api.ev('wurfZone()');
  const hz = L.api.ev('TUNE.wurfPendel');
  const schritt = 0.0005; // 0,5 ms
  const periode = 1 / hz;
  let n = 0;
  const schritte = Math.round(periode / schritt);
  for (let i = 0; i < schritte; i++) {
    const t = i * schritt;
    const kraft = 0.5 - 0.5 * Math.cos(2 * Math.PI * hz * t);
    if (kraft >= lo && kraft <= hi) n++;
  }
  // Das Pendel durchquert die Zone zweimal je Periode; ein Durchgang = halbe Zeit.
  const ms = (n * schritt) / 2 * 1000;
  return { wert: rund(ms) + ' ms (Zone ' + lo.toFixed(3) + ' bis ' + hi.toFixed(3) + ')', ok: ms >= 100 };
});

/* 5. Level 1 Sonder-Moebel: Anteil der Runden mit Sonder-Moebel (Ziel 0) */
messe('5 Level 1 Sonder-Moebel', '0 Runden', () => {
  const L = N.lade('index.html');
  let treffer = 0;
  const RUNDEN = 1000;
  for (let i = 0; i < RUNDEN; i++) {
    L.api.ev('neuesSpiel()');
    // Raum -1 = kein Platz auf der Karte (Schluessel oder Fund ohne Raum) - dort gibt es kein Moebel.
    const hat = L.api.ev('!!((S.schluesselRaum>=0&&sonderMoebel(S.schluesselRaum,S.schluesselMoebel))||S.zettel.some(z=>z.raum>=0&&sonderMoebel(z.raum,z.moebel))||S.funde.some(f=>f.raum>=0&&sonderMoebel(f.raum,f.moebel)))');
    if (hat) treffer++;
  }
  return { wert: treffer + ' von ' + RUNDEN + ' Runden (' + (treffer / RUNDEN * 100).toFixed(1).replace('.', ',') + ' %)', ok: treffer === 0 };
});

/* 6. Level 1 Direktor startet auf der Etage TUNE.chefStartEtage */
messe('6 Level 1 Direktor Startetage', '= TUNE.chefStartEtage (2)', () => {
  const L = N.lade('index.html');
  L.api.ev('neuesSpiel()');
  const e = L.api.ev('S.lehrer.find(l=>l.chef).e');
  const soll = L.api.ev('TUNE.chefStartEtage');
  return { wert: 'Etage ' + e + ' (Soll ' + soll + ')', ok: e === soll };
});

/* 7. Level 5 Blackout: Pegel nach Neustart (Ziel <= 60) */
messe('7 Level 5 Blackout Pegel', '<= 60', () => {
  const L = N.lade('level5.html');
  L.api.ev('speicherePegel(100);neuesSpiel()');
  const p = L.api.ev('S.pegel');
  return { wert: 'Pegel ' + p, ok: p <= 60 };
});

/* 8. Level 6 Aufwachen: Ankunft am naechsten Sofa links (Ziel x >= 1000) */
messe('8 Level 6 Aufwachen', 'x >= 1000', () => {
  const L = N.lade('level6.html');
  L.api.ev('S.x=1500;aufwachen()');
  const x = L.api.ev('S.x');
  return { wert: 'x ' + rund(x), ok: x >= 1000 };
});

/* 9. Level 8 Sprung: Gipfelhoehe ueber dem Boden (Ziel > TUNE.hindernisHoehe) */
messe('9 Level 8 Sprung Gipfel', '> TUNE.hindernisHoehe', () => {
  const L = N.lade('level8.html');
  L.api.ev('S.modus="spiel";S.y=BODEN;S.amBoden=true;S.vy=0');
  const soll = L.api.ev('TUNE.hindernisHoehe');
  let gipfel = 0;
  for (let i = 0; i < 3; i++) { L.taste('Space', true); L.api.ev('update(1/60)'); }
  L.taste('Space', false);
  for (let i = 0; i < 60; i++) {
    L.api.ev('update(1/60)');
    const h = L.api.ev('BODEN-S.y');
    if (h > gipfel) gipfel = h;
  }
  return { wert: rund(gipfel) + ' px (Hoehe ' + soll + ')', ok: gipfel > soll };
});

/* 10. Level 8 Sonne: Licht bei Ankunft nach Deckelung (Ziel <= 100 - 2 * hindernisStrafe) */
messe('10 Level 8 Sonne Ankunft', '<= 100-2*hindernisStrafe', () => {
  const L = N.lade('level8.html');
  L.api.ev('S.licht=95;S.x=2000;sonneDeckeln(S.x)');
  const licht = L.api.ev('lichtBeiAnkunft(S.x,S.licht)');
  const grenze = L.api.ev('100-2*TUNE.hindernisStrafe');
  return { wert: rund(licht) + ' %', ok: licht <= grenze, hinweis: 'Grenze ' + rund(grenze) };
});

/* 11. Dialog-Standard (level3.html): vorgewaehlte Antwort beginnt mit 'Alles gut' */
messe('11 Dialog Standardantwort', 'beginnt mit "Alles gut"', () => {
  const L = N.lade('level3.html');
  L.api.ev('NACHT.werte.mut=30');
  L.api.ev('starteGespraech(DIE_DREI,"start",()=>{})');
  const txt = L.api.ev('GESPR.wahlen[GESPR.gewaehlt].txt');
  try { L.api.ev('GESPR=null'); } catch (e) { /* ohne Gespraech egal */ }
  return { wert: '"' + txt + '"', ok: String(txt).startsWith('Alles gut') };
});

/* 12. Hilfe stumm / Hilfe an: Tipps ohne Hilfe-Parameter false, mit ?hilfe=1 true */
messe('12 Hilfe stumm bei ?lektion=0', 'false', () => {
  const L = N.lade('level4.html');
  const r = L.api.ev('hilfeTipp("x","A","B")');
  return { wert: String(r), ok: r === false };
});
messe('12b Hilfe an mit ?hilfe=1', 'true', () => {
  const L = N.lade('level4.html', '?lektion=0&hilfe=1');
  const r = L.api.ev('hilfeTipp("x","A","B")');
  return { wert: String(r), ok: r === true };
});

/* ---- Ausgabe ---- */
const spalten = ['Messung', 'Wert', 'Ziel', 'Status'];
const breite = spalten.map(s => s.length);
const zeilen = ERGEBNISSE.map(e => [e.name, String(e.wert) + (e.hinweis ? ' (' + e.hinweis + ')' : ''), e.ziel, e.status]);
for (const z of zeilen) z.forEach((c, i) => { breite[i] = Math.max(breite[i], c.length); });
const fmt = z => '| ' + z.map((c, i) => c.padEnd(breite[i])).join(' | ') + ' |';
console.log(fmt(spalten));
console.log('| ' + breite.map(b => '-'.repeat(b)).join(' | ') + ' |');
zeilen.forEach(z => console.log(fmt(z)));
console.log('');
console.log(fehlerZahl ? (fehlerZahl + ' Messung(en) verfehlen Ziel oder fehlen.') : 'Alle Messungen im Ziel.');
process.exit(fehlerZahl ? 1 : 0);
