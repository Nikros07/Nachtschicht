/* ============================================================================
   GEMEINSAMES FUER ALLE PRUEFUNGEN

   Ein winziger Server fuer die Dateien, ein Browser, und eine Zaehlung von
   bestanden und durchgefallen. Mehr braucht es nicht.

   Der Trick, auf dem alle Pruefungen aufbauen: die Bildschleife des Spiels
   wird stillgelegt und update() von Hand mit festem dt aufgerufen. Sonst
   haengt jede Pruefung an der Wanduhr, und ein Kampf, der 30 Sekunden
   dauert, dauert auch beim Pruefen 30 Sekunden.
   ========================================================================== */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WURZEL = path.resolve(__dirname, '..');
const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

/* ---- Server: liefert nur, was im Projektordner liegt --------------------- */
function starteServer() {
  return new Promise(fertig => {
    const s = http.createServer((req, res) => {
      const rein = decodeURIComponent(req.url.split('?')[0]);
      const datei = path.join(WURZEL, rein === '/' ? 'index.html' : rein);
      if (!datei.startsWith(WURZEL + path.sep)) { res.writeHead(403); return res.end(); }
      fs.readFile(datei, (fehler, inhalt) => {
        if (fehler) { res.writeHead(404); return res.end('nicht da'); }
        res.writeHead(200, { 'Content-Type': TYPEN[path.extname(datei)] || 'application/octet-stream' });
        res.end(inhalt);
      });
    });
    s.listen(0, '127.0.0.1', () => fertig({
      adresse: 'http://127.0.0.1:' + s.address().port,
      stop: () => new Promise(f => s.close(f)),
    }));
  });
}

/* ---- Browser ------------------------------------------------------------
   Normalerweise nimmt Playwright sein eigenes Chromium. Wo eines
   vorinstalliert ist, sagt NACHTSCHICHT_CHROME wo.                         */
const starteBrowser = () => chromium.launch(
  process.env.NACHTSCHICHT_CHROME ? { executablePath: process.env.NACHTSCHICHT_CHROME } : {});

/* ---- Zaehlung ------------------------------------------------------------ */
class Pruefung {
  constructor(titel) { this.titel = titel; this.durch = 0; this.fehler = 0; }
  abschnitt(t) { console.log('\n  ' + t); }
  ok(name, bedingung, dabei) {
    if (bedingung) { this.durch++; console.log('    ok   ' + name); }
    else { this.fehler++; console.log('    NEIN ' + name + '   ->   ' + JSON.stringify(dabei)); }
  }
  bilanz() {
    const zeile = this.titel + ': ' + this.durch + ' bestanden'
      + (this.fehler ? ', ' + this.fehler + ' DURCHGEFALLEN' : '');
    console.log('\n  ' + zeile);
    return this.fehler;
  }
}

/* ---- Eine Seite mit stillgelegter Bildschleife --------------------------
   Alles, was die Pruefungen im Browser brauchen, haengt an window.NP.     */
async function seite(browser, adresse, datei) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const fehler = [];
  p.on('pageerror', e => fehler.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
  await p.goto(adresse + '/' + datei);
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const echt = window.update;
    window.update = () => {};                       // die Schleife zeichnet nur noch
    window.NP = {
      /* Ein Bild weiterdrehen, oder n Bilder. */
      schritt: (n = 1, dt = 1 / 60) => { for (let i = 0; i < n; i++) echt(dt); },
      /* Laufen lassen, bis die Bedingung gilt. Gibt die Zahl der Bilder
         zurueck, oder -1 wenn sie nie eintritt. */
      bis: (bedingung, max = 600) => {
        for (let i = 0; i < max; i++) {
          if (bedingung(S.gegner, S)) return i;
          echt(1 / 60);
        }
        return -1;
      },
      druck:  () => aktionPuffer.push(S.t),
      links:  v => { linksAn = v; },
      rechts: v => { rechtsAn = v; },
    };
  });
  p.fehler = fehler;
  p.ctx = ctx;
  return p;
}

module.exports = { starteServer, starteBrowser, Pruefung, seite, WURZEL };
