/* Prueft spielstand.js: Freischaltung, Bestzeiten, und vor allem die
   Uebernahme alter Spielstaende. Wer schon gespielt hat, soll seinen
   Fortschritt nicht verlieren, nur weil sich das Speicherformat aendert.

   Starten:  node test/spielstand.test.js
   Braucht:  npm i playwright   (einmalig, nicht Teil des Spiels) */
const { chromium } = require('playwright');
const { starteServer, pruefer, browserPfad } = require('./hilfe');

(async () => {
  const { server, port } = await starteServer();
  const browser = await chromium.launch({ executablePath: browserPfad() });
  const p = pruefer();

  /* Jeder Abschnitt kriegt einen leeren Browser. Erst eine kleine Datei
     vom selben Server laden - vorher gibt es keinen Speicher zum Fuellen. */
  async function frisch(vorbereiten) {
    const ctx = await browser.newContext();
    const seite = await ctx.newPage();
    await seite.goto(`http://127.0.0.1:${port}/shell.css`);
    if (vorbereiten) await seite.evaluate(vorbereiten);
    await seite.goto(`http://127.0.0.1:${port}/index.html`);
    await seite.waitForTimeout(150);
    return { ctx, seite };
  }

  console.log('\n-- frischer Stand --');
  {
    const { ctx, seite } = await frisch(null);
    p.ist('Level 1 ist frei', await seite.evaluate(() => Stand.frei(1)), true);
    p.ist('Level 2 ist zu', await seite.evaluate(() => Stand.frei(2)), false);
    p.ist('niemand dabei', await seite.evaluate(() => Stand.crew()), []);
    p.ist('Leiste zeigt ein Schloss',
      await seite.evaluate(() => document.querySelectorAll('#levelbar span.zu').length), 1);
    await ctx.close();
  }

  console.log('\n-- alter Spielstand wird uebernommen --');
  {
    const { ctx, seite } = await frisch(() => {
      localStorage.setItem('nachtschicht.crew', JSON.stringify(['MAX FERDI']));
      localStorage.setItem('nachtschicht.bestzeit1', '143.5');
    });
    p.ist('Crew uebernommen', await seite.evaluate(() => Stand.crew()), ['MAX FERDI']);
    p.ist('Level 1 gilt als geschafft', await seite.evaluate(() => Stand.durch(1)), true);
    p.ist('Level 2 dadurch frei', await seite.evaluate(() => Stand.frei(2)), true);
    p.ist('Bestzeit uebernommen', await seite.evaluate(() => Stand.bestzeit(1)), 143.5);
    p.ist('kein Schloss mehr',
      await seite.evaluate(() => document.querySelectorAll('#levelbar span.zu').length), 0);
    p.ist('Max Ferdis Tempo greift', await seite.evaluate(() => tempoBonus()), 1.15);
    await ctx.close();
  }

  console.log('\n-- Crew ohne Bestzeit (frueh abgebrochene Runde) --');
  {
    const { ctx, seite } = await frisch(() => {
      localStorage.setItem('nachtschicht.crew', JSON.stringify(['MAX FERDI', 'MORITZ']));
    });
    p.ist('beide Level als geschafft erkannt',
      await seite.evaluate(() => Stand.alles().geschafft), [1, 2]);
    await ctx.close();
  }

  console.log('\n-- schaffen, Bestzeit, Crew --');
  {
    const { ctx, seite } = await frisch(null);
    p.ist('erste Zeit ist eine Bestzeit', await seite.evaluate(() => Stand.schaffe(1, 120)), true);
    p.ist('langsamer ist keine', await seite.evaluate(() => Stand.schaffe(1, 200)), false);
    p.ist('schneller ist wieder eine', await seite.evaluate(() => Stand.schaffe(1, 90)), true);
    p.ist('die schnellste bleibt stehen', await seite.evaluate(() => Stand.bestzeit(1)), 90);
    p.ist('Level 2 jetzt frei', await seite.evaluate(() => Stand.frei(2)), true);
    p.ist('geschafft steht nur einmal drin',
      await seite.evaluate(() => Stand.alles().geschafft), [1]);
    p.ist('ein Junge kommt nur einmal dazu', await seite.evaluate(() => {
      Stand.jungeDazu('MAX FERDI'); Stand.jungeDazu('MAX FERDI'); return Stand.crew();
    }), ['MAX FERDI']);
    p.ist('naechstes Level nach 1', await seite.evaluate(() => Stand.naechstes(1).nr), 2);
    p.ist('nach dem letzten kommt nichts', await seite.evaluate(() => Stand.naechstes(2)), null);
    await ctx.close();
  }

  console.log('\n-- kaputter Eintrag im Speicher --');
  {
    const { ctx, seite } = await frisch(() => {
      localStorage.setItem('nachtschicht.stand', '{ das ist kein json');
    });
    p.ist('faellt auf leer zurueck', await seite.evaluate(() => Stand.crew()), []);
    p.ist('Level 1 laeuft trotzdem', await seite.evaluate(() => Stand.frei(1)), true);
    await ctx.close();
  }

  console.log('\n-- Testschalter ?frei=1 --');
  {
    const ctx = await browser.newContext();
    const seite = await ctx.newPage();
    await seite.goto(`http://127.0.0.1:${port}/index.html?frei=1`);
    await seite.waitForTimeout(150);
    p.ist('alles offen', await seite.evaluate(() => Stand.frei(2)), true);
    p.ist('der echte Stand bleibt sauber',
      await seite.evaluate(() => Stand.alles().geschafft), []);
    await seite.goto(`http://127.0.0.1:${port}/index.html`);
    p.ist('gilt fuer die ganze Sitzung', await seite.evaluate(() => Stand.frei(2)), true);
    await ctx.close();
  }

  await browser.close(); server.close();
  const fehler = p.fehler();
  console.log(fehler ? `\n${fehler} FEHLER` : '\nalles gruen');
  process.exit(fehler ? 1 : 0);
})();
