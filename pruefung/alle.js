#!/usr/bin/env node
/* ============================================================================
   ALLE PRUEFUNGEN

       node pruefung/alle.js

   Startet einen Server fuer den Projektordner, oeffnet einen Browser und
   laesst alle Pruefungen durchlaufen. Endet mit 0, wenn alles bestanden
   ist, sonst mit 1.
   ========================================================================== */
const { starteServer, starteBrowser } = require('./hilfen');

const PRUEFUNGEN = [
  ['Spielstand',   require('./spielstand.test')],
  ['Kampf',        require('./kampf.test')],
  ['Atmosphaere',  require('./atmosphaere.test')],
  ['Schrift',      require('./schrift.test')],
];

(async () => {
  const nur = process.argv[2];
  const server = await starteServer();
  const browser = await starteBrowser();
  let fehler = 0;
  try {
    for (const [name, lauf] of PRUEFUNGEN) {
      if (nur && !name.toLowerCase().startsWith(nur.toLowerCase())) continue;
      console.log('\n=== ' + name + ' ' + '='.repeat(Math.max(0, 60 - name.length)));
      fehler += await lauf(browser, server);
    }
  } finally {
    await browser.close();
    await server.stop();
  }
  console.log(fehler === 0
    ? '\nALLES BESTANDEN\n'
    : '\n' + fehler + ' PRUEFUNG(EN) DURCHGEFALLEN\n');
  process.exit(fehler ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
