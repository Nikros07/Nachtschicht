/* ============================================================================
   FEHLENDE ZEICHEN IM BITMAP-FONT

   Der Font ist selbstgebaut und kennt nur, was in F steht. Was fehlt,
   wird stillschweigend als "?" gezeichnet - so stand "+15% TEMPO" lange
   als "+15? TEMPO" auf dem Titelbild, ohne dass irgendwas gemeckert hat.

   Darum: text() und textTo() mitschreiben und jedes Zeichen gegen den
   Font halten, waehrend die Bildschirme durchlaufen.
   ========================================================================== */
const { Pruefung } = require('./hilfen');

const SPITZEL = () => {
  window.__fehlt = new Set();
  const pruef = s => String(s).toUpperCase().split('')
    .forEach(c => { if (!GLYPH[c]) window.__fehlt.add(c); });
  const t0 = window.text, tt0 = window.textTo;
  window.text = function (s, ...r) { pruef(s); return t0.call(this, s, ...r); };
  window.textTo = function (g, s, ...r) { pruef(s); return tt0.call(this, g, s, ...r); };
};

module.exports = async (browser, server) => {
  const P = new Pruefung('Bitmap-Font');
  for (const datei of ['index.html', 'level2.html']) {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto(server.adresse + '/' + datei + '?alle=1');
    await p.evaluate(() => { NS.geschafft(1, 150); NS.geschafft(2, 150); });
    await p.reload();
    await p.waitForTimeout(400);
    await p.evaluate(SPITZEL);
    await p.waitForTimeout(500);                                    // Titelbild
    await p.evaluate(() => { S.modus = 'ende'; S.gewonnen = true; S.zeit = 99; S.neueBestzeit = true; });
    await p.waitForTimeout(500);                                    // gewonnen
    await p.evaluate(() => { S.gewonnen = false; });
    await p.waitForTimeout(400);                                    // verloren
    await p.evaluate(() => { S.modus = 'pause'; });
    await p.waitForTimeout(300);
    const fehlt = await p.evaluate(() => [...window.__fehlt]);
    P.ok(datei + ': jedes gezeichnete Zeichen steht im Font', fehlt.length === 0, fehlt);
    await ctx.close();
  }
  return P.bilanz();
};
