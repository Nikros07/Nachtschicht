/* Rauchtest: jedes Level laden, das Intro wegklicken, alle Tasten
   druecken und eine Weile herumlaufen. Sucht nur nach JS-Fehlern.

   Das ist die Pruefung, die nach jedem Umbau laufen sollte: sie findet
   keinen schlechten Level-Aufbau, aber jeden Tippfehler und jede
   Funktion, die es nach einer Verschiebung nicht mehr gibt.

   Starten:  node test/rauch.test.js
   Bilder:   node test/rauch.test.js --bilder <ordner>
   Braucht:  npm i playwright   (einmalig, nicht Teil des Spiels) */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { starteServer, sammleFehler, browserPfad } = require('./hilfe');

const SEITEN = ['index.html', 'level2.html', 'runner.html'];
/* Alles, was irgendein Level belegt. Tasten, die ein Level nicht kennt,
   muessen folgenlos bleiben - genau das prueft der Durchlauf mit. */
const TASTEN = ['KeyQ','KeyH','KeyR','KeyE','KeyW','KeyS','ShiftLeft','Space',
                'KeyP','KeyP','KeyM','KeyM','Digit1','Digit2','Digit9'];

const bilderIdx = process.argv.indexOf('--bilder');
const BILDER = bilderIdx > 0 ? process.argv[bilderIdx + 1] : null;

(async () => {
  const { server, port } = await starteServer();
  const browser = await chromium.launch({ executablePath: browserPfad() });
  if (BILDER) fs.mkdirSync(BILDER, { recursive: true });
  let schlecht = 0;

  for (const datei of SEITEN) {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 700 } });
    const seite = await ctx.newPage();
    const fehler = sammleFehler(seite);

    /* Mit allem freigeschaltet spielen, sonst laufen die Zifferntasten
       ins Leere und der Levelwechsel wird nie angefasst. */
    await seite.goto(`http://127.0.0.1:${port}/shell.css`);
    await seite.evaluate(() => localStorage.setItem('nachtschicht.stand',
      JSON.stringify({ v:1, crew:['MAX FERDI','MORITZ'], geschafft:[1,2], zeiten:{} })));

    await seite.goto(`http://127.0.0.1:${port}/${datei}`, { waitUntil: 'load' });
    await seite.waitForTimeout(400);
    if (BILDER) await seite.screenshot({ path: path.join(BILDER, datei + '.1-titel.png') });

    await seite.keyboard.press('Space');                      // Titel -> Intro
    for (let i = 0; i < 12; i++) { await seite.keyboard.press('KeyE'); await seite.waitForTimeout(90); }
    await seite.waitForTimeout(300);
    if (BILDER) await seite.screenshot({ path: path.join(BILDER, datei + '.2-spiel.png') });

    for (let runde = 0; runde < 4; runde++) {
      for (const t of TASTEN) { await seite.keyboard.press(t); await seite.waitForTimeout(35); }
      await seite.keyboard.down('KeyD'); await seite.waitForTimeout(450); await seite.keyboard.up('KeyD');
      await seite.keyboard.down('KeyA'); await seite.waitForTimeout(250); await seite.keyboard.up('KeyA');
    }
    if (BILDER) await seite.screenshot({ path: path.join(BILDER, datei + '.3-lauf.png') });

    const stand = await seite.evaluate(() => {
      try { return { modus: S.modus, t: Math.round(S.t), wo: location.pathname }; }
      catch (e) { return { fehler: String(e) }; }
    });

    console.log(`\n== ${datei} ==`);
    console.log('   ', JSON.stringify(stand));
    /* Die Zifferntasten duerfen im laufenden Spiel nicht wegnavigieren. */
    if (stand.wo && !stand.wo.endsWith(datei)) {
      schlecht++; console.log('   FEHLER: Seite gewechselt, obwohl gespielt wurde');
    }
    const einmalig = [...new Set(fehler)];
    if (einmalig.length) { schlecht++; console.log('   FEHLER:'); einmalig.slice(0, 10).forEach(e => console.log('    -', e)); }
    else console.log('    keine Fehler');
    await ctx.close();
  }

  await browser.close(); server.close();
  console.log(schlecht ? `\n${schlecht} Seite(n) mit Fehlern` : '\nalles gruen');
  process.exit(schlecht ? 1 : 0);
})();
