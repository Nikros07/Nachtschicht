/* ============================================================================
   SPIELSTAND, LEVELVERZEICHNIS UND LEVELLEISTE

   Laeuft zweimal: ueber http (so laeuft es auf GitHub Pages) und ueber
   file:// (so laeuft es beim Doppelklick, und das verspricht das README).
   ========================================================================== */
const path = require('path');
const { starteServer, starteBrowser, Pruefung, WURZEL } = require('./hilfen');

async function lauf(browser, wurzel, wie) {
  const P = new Pruefung('Spielstand (' + wie + ')');
  const neu = async () => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    const fehler = [];
    p.on('pageerror', e => fehler.push(String(e)));
    p.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });
    p.fehler = fehler; p.ctx = ctx;
    return p;
  };
  const auf = (datei, frage = '') => wurzel + '/' + datei + frage;

  /* ---- Frischer Spielstand ---------------------------------------------- */
  P.abschnitt('Frisch angefangen');
  let p = await neu();
  await p.goto(auf('index.html'));
  await p.waitForTimeout(500);
  P.ok('laedt ohne Fehler', p.fehler.length === 0, p.fehler);
  P.ok('NS ist da', await p.evaluate(() => typeof NS === 'object'));
  P.ok('acht Level im Verzeichnis', (await p.evaluate(() => NS.LEVEL.length)) === 8);

  const leiste = () => p.evaluate(() => [...document.querySelectorAll('#levelbar > *')]
    .map(e => ({ tag: e.tagName, cls: e.className, href: e.getAttribute('href') })));
  let bar = await leiste();
  P.ok('Leiste zeigt alle acht', bar.length === 8, bar.length);
  P.ok('Level 1 ist der aktive Link', bar[0].tag === 'A' && bar[0].cls === 'aktiv', bar[0]);
  P.ok('Level 2 ist gesperrt', bar[1].tag === 'SPAN' && bar[1].cls === 'zu', bar[1]);
  P.ok('gesperrtes Level hat keinen Link', bar[1].href === null, bar[1]);
  P.ok('Level 3 bis 8 sind noch nicht gebaut',
    bar.slice(2).every(e => e.cls === 'bald'), bar.slice(2).map(e => e.cls));

  const gemalt = () => p.evaluate(() => {
    const c = document.getElementById('c');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 60) n++;
    return n;
  });
  P.ok('Titelbild wird gezeichnet', (await gemalt()) > 500);

  await p.keyboard.press('Digit2');
  await p.waitForTimeout(300);
  P.ok('Taste 2 fuehrt nicht ins gesperrte Level', p.url().includes('index.html'), p.url());
  P.ok('und die Titelzeile sagt warum',
    /ZUERST LEVEL 1/.test((await p.evaluate(() => NS.titelZeilen(1, 2)))[1].txt));

  /* ---- Level 1 geschafft ------------------------------------------------- */
  P.abschnitt('Level 1 geschafft');
  let r = await p.evaluate(() => ({
    neu: NS.geschafft(1, 120), frei2: NS.frei(2), crew: NS.crew(),
    best: NS.bestzeit(1), bonus: NS.tempoBonus(),
  }));
  P.ok('meldet die neue Bestzeit', r.neu === true, r);
  P.ok('oeffnet Level 2', r.frei2 === true, r);
  P.ok('nimmt Max Ferdi auf', r.crew.includes('MAX FERDI'), r);
  P.ok('merkt sich die Zeit', r.best === 120, r);
  P.ok('und gibt 15% Tempo', Math.abs(r.bonus - 1.15) < 1e-9, r);
  P.ok('langsamer ist keine Bestzeit', (await p.evaluate(() => NS.geschafft(1, 200))) === false);
  P.ok('schneller schon', (await p.evaluate(() => NS.geschafft(1, 90))) === true);

  await p.reload(); await p.waitForTimeout(400);
  bar = await leiste();
  P.ok('nach dem Neuladen ist Level 2 offen', bar[1].tag === 'A', bar[1]);
  await p.keyboard.press('Digit2');
  await p.waitForTimeout(500);
  P.ok('Taste 2 wechselt jetzt wirklich', p.url().includes('level2.html'), p.url());
  P.ok('Level 2 laedt ohne Fehler', p.fehler.length === 0, p.fehler);
  P.ok('und kennt seine Nummer',
    (await p.evaluate(() => document.getElementById('levelbar').dataset.level)) === '2');
  await p.ctx.close();

  /* ---- Alte Spielstaende ------------------------------------------------- */
  P.abschnitt('Stand von vor der Umstellung');
  p = await neu();
  await p.goto(auf('index.html'));
  await p.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nachtschicht.crew', JSON.stringify(['MAX FERDI']));
    localStorage.setItem('nachtschicht.bestzeit1', '143.5');
  });
  await p.reload(); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({
    frei2: NS.frei(2), frei3: NS.frei(3), best: NS.bestzeit(1),
    geschrieben: JSON.parse(localStorage.getItem('nachtschicht.frei')),
  }));
  P.ok('alte Bestzeit bleibt', r.best === 143.5, r);
  P.ok('Level 2 gilt als geschafft', r.frei2 === true, r);
  P.ok('Level 3 bleibt zu', r.frei3 === false, r);
  P.ok('und der Stand wird einmal festgeschrieben',
    Array.isArray(r.geschrieben) && r.geschrieben.includes(2), r);
  await p.ctx.close();

  /* ---- Schalter in der Adresszeile --------------------------------------- */
  P.abschnitt('?alle=1 und ?touch=1');
  p = await neu();
  await p.goto(auf('index.html', '?touch=1&alle=1'));
  await p.waitForTimeout(400);
  bar = await leiste();
  P.ok('?alle=1 macht gebaute Level klickbar', bar[1].tag === 'A', bar[1]);
  P.ok('baut aber kein Level 3 herbei', bar[2].cls === 'bald', bar[2]);
  const link = await p.evaluate(() =>
    document.querySelector('#levelbar a[href*="level2"]').getAttribute('href'));
  P.ok('beide Schalter wandern in den Levellink',
    link.includes('alle=1') && link.includes('touch=1'), link);
  P.ok('touch schaltet die Handysteuerung frei',
    await p.evaluate(() => document.documentElement.classList.contains('touch')));
  await p.ctx.close();

  /* ---- Level 2 und die Grenzen des Verzeichnisses ------------------------ */
  P.abschnitt('Level 2 und die Raender');
  p = await neu();
  await p.goto(auf('level2.html', '?alle=1'));
  await p.waitForTimeout(500);
  P.ok('laedt ohne Fehler', p.fehler.length === 0, p.fehler);
  P.ok('nach 2 kommt 3, und das ist noch nicht gebaut',
    await p.evaluate(() => { const n = NS.naechstes(2); return n.nr === 3 && !NS.gebaut(n); }));
  P.ok('nach 8 kommt nichts', await p.evaluate(() => NS.naechstes(8) === null));
  P.ok('Level 9 laesst sich nicht freischalten', await p.evaluate(() => NS.schalteFrei(9) === false));
  P.ok('und man kann nicht in ein ungebautes Level springen',
    await p.evaluate(() => NS.gehZu(3) === false));
  r = await p.evaluate(() => { NS.geschafft(2, 88); return { crew: NS.crew(), frei3: NS.frei(3) }; });
  P.ok('Level 2 nimmt Moritz auf', r.crew.includes('MORITZ'), r);
  P.ok('und merkt Level 3 vor', r.frei3 === true, r);
  P.ok('Titelbild von Level 2 wird gezeichnet', (await gemalt()) > 500);
  await p.ctx.close();

  /* ---- Von vorn ---------------------------------------------------------- */
  P.abschnitt('Zuruecksetzen');
  p = await neu();
  await p.goto(auf('index.html'));
  r = await p.evaluate(() => {
    NS.geschafft(1, 100); NS.geschafft(2, 100); NS.zuruecksetzen();
    return { crew: NS.crew(), frei2: NS.frei(2), best: NS.bestzeit(1) };
  });
  P.ok('Crew ist leer', r.crew.length === 0, r);
  P.ok('Level 2 ist wieder zu', r.frei2 === false, r);
  P.ok('Bestzeit ist weg', r.best === null, r);
  await p.ctx.close();

  /* ---- Und einmal wirklich spielen --------------------------------------- */
  P.abschnitt('Eine Runde Level 1');
  p = await neu();
  await p.goto(auf('index.html'));
  await p.waitForTimeout(300);
  await p.keyboard.press('Space');
  await p.waitForTimeout(200);
  for (let i = 0; i < 10; i++) { await p.keyboard.press('KeyE'); await p.waitForTimeout(60); }
  await p.waitForTimeout(400);
  P.ok('das Spiel laeuft', ['spiel', 'intro'].includes(await p.evaluate(() => S.modus)),
    await p.evaluate(() => S.modus));
  await p.keyboard.down('KeyD'); await p.waitForTimeout(700); await p.keyboard.up('KeyD');
  P.ok('und man bewegt sich', (await p.evaluate(() => S.x)) > 60);
  P.ok('ohne einen Fehler in der Konsole', p.fehler.length === 0, p.fehler);
  await p.ctx.close();

  return P.bilanz();
}

module.exports = async (browser, server) => {
  let fehler = await lauf(browser, server.adresse, 'http');
  fehler += await lauf(browser, 'file://' + WURZEL, 'file');
  return fehler;
};
