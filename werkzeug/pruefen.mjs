/* ===========================================================================
   NACHTSCHICHT - kopflose Pruefung

   Das Spiel hat keinen Build und keine Testbibliothek, und das soll so
   bleiben. Diese Datei ist trotzdem da, weil sich zwei Sorten Fehler von
   Hand kaum finden lassen:

     - eine Datei laedt gar nicht mehr (Tippfehler im Skript)
     - der Kampf laesst sich mit stumpfem Tastendruecken gewinnen

   Beides hat sie beim Umbau des Kracher-Kampfs tatsaechlich gefunden.

   Zum Spielen wird nichts davon gebraucht. Wer sie laufen lassen will:

       npm install playwright && npx playwright install chromium
       node werkzeug/pruefen.mjs

   =========================================================================== */
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const seite = (datei) => 'file://' + join(wurzel, datei);

const ergebnisse = [];
const pruefe = (name, bestanden, zusatz='') =>
  ergebnisse.push({ name, bestanden, zusatz });

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

/* ---------------------------------------------------------------------------
   1. Laedt jede Datei ohne Fehler und malt ueberhaupt etwas?
   --------------------------------------------------------------------------- */
for (const datei of ['index.html', 'level2.html', 'runner.html']) {
  const page = await browser.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await page.goto(seite(datei));
  await page.waitForTimeout(800);
  const gemalt = await page.evaluate(() => {
    const d = ctx.getImageData(0, 0, W, H).data;
    let an = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) an++;
    return an;
  }).catch(() => 0);
  pruefe(datei + ' laedt fehlerfrei', fehler.length === 0, fehler.join('; '));
  pruefe(datei + ' malt ein Bild', gemalt > 0);
  await page.close();
}

/* ---------------------------------------------------------------------------
   2. Der Kracher-Kampf in level2.html

   Der Kampf laeuft komplett synchron in einem evaluate ab - dazwischen kommt
   kein requestAnimationFrame dran, die Schrittweite ist also fest und das
   Ergebnis wiederholbar. Zwei Spielweisen:

     bot   beantwortet jedes Muster richtig  -> muss gewinnen, ohne ein Herz
                                                zu verlieren
     spam  drueckt nur E                     -> darf nie gewinnen
   --------------------------------------------------------------------------- */
{
  const page = await browser.newPage();
  const fehler = [];
  page.on('pageerror', e => fehler.push(e.message));
  page.on('console', m => { if (m.type() === 'error') fehler.push(m.text()); });
  await page.goto(seite('level2.html'));
  await page.waitForTimeout(300);

  const lauf = (art) => page.evaluate((art) => {
    starte(); S.modus = 'spiel';
    AUFGABEN.forEach(a => S.erledigt[a.id] = true);
    S.x = 110; S.hp = TUNE.leben;
    starteKampf();

    const dt = 1 / 60;
    const gesehen = {};
    let bilder = 0, fehlschlaege = 0, halten = 0, vorErholung = 0;

    while (S.modus === 'kampf' && bilder < 60 * 120) {
      const g = S.gegner;
      if (g) {
        gesehen[g.zustand === 'wind' ? g.muster : g.zustand] = true;
        if (art === 'bot') {
          if (g.zustand === 'wind') {
            const fenster = g.windup * (1 - TUNE.konterFenster);
            if (g.muster === 'schlag' && g.t >= fenster + 0.02 && Math.abs(S.x - g.x) < 34) druckAktion();
            else if (g.muster === 'fege' && g.t >= g.windup - 0.12 && S.amBoden) { druckSprung(); halten = 16; }
          } else if (g.zustand === 'offen') druckAktion();
          else if (g.zustand === 'wurf' && g.flasche && Math.abs(g.flasche.x - S.x) < 14) druckAktion();
        } else druckAktion();
      }
      if (S.erholung > 0 && vorErholung <= 0) fehlschlaege++;
      vorErholung = S.erholung;
      sprungAn = halten-- > 0;              // ein echter Spieler haelt die Taste
      update(dt); bilder++;
    }
    return { modus: S.modus, hp: S.hp, gegnerHp: S.gegner ? S.gegner.hp : 0,
             sekunden: +(bilder / 60).toFixed(1), fehlschlaege,
             muster: Object.keys(gesehen).join(',') };
  }, art);

  const bots = [], spams = [];
  for (let i = 0; i < 6; i++) {
    bots.push(await lauf('bot'));
    await page.reload(); await page.waitForTimeout(150);
    spams.push(await lauf('spam'));
    await page.reload(); await page.waitForTimeout(150);
  }
  const leben = await page.evaluate(() => TUNE.leben);
  const alleMuster = bots.map(b => b.muster).join(',');

  pruefe('Kampf: wer richtig spielt, gewinnt jedes Mal',
    bots.every(b => b.modus === 'cutscene'),
    bots.map(b => b.modus).join(','));
  pruefe('Kampf: wer richtig spielt, verliert kein Herz',
    bots.every(b => b.hp === leben), bots.map(b => b.hp).join(','));
  pruefe('Kampf: wer richtig spielt, schlaegt nie daneben',
    bots.every(b => b.fehlschlaege === 0));
  pruefe('Kampf: alle drei Muster kommen vor',
    ['schlag', 'fege', 'flasche'].every(m => alleMuster.includes(m)), alleMuster);
  pruefe('Kampf: stumpfes E-Gehaemmer gewinnt nie',
    spams.every(s => s.modus !== 'cutscene'),
    spams.map(s => s.modus + '/' + s.gegnerHp).join(','));
  pruefe('Kampf: keine Fehler in der Konsole', fehler.length === 0, fehler.join('; '));
  await page.close();
}

/* ---------------------------------------------------------------------------
   3. Die Musik muss mit dem Pegel kippen
   --------------------------------------------------------------------------- */
{
  const page = await browser.newPage();
  await page.goto(seite('level2.html'));
  await page.waitForTimeout(300);
  const messe = (p) => page.evaluate(async (p) => {
    ensureAudio(); await AC.resume();
    for (let i = 0; i < 40; i++) {
      /* Die Schleife laeuft weiter und wuerde bei 100 den Blackout ausloesen */
      S.modus = 'spiel'; S.pegel = p;
      S.t += 0.05; MUS.mische = -1; musik();
      await new Promise(r => setTimeout(r, 12));
    }
    return { wet: MWET.gain.value, filter: MFILT.frequency.value, zerr: zerrGrad() };
  }, p);

  const werte = [];
  for (const p of [0, 40, 60, 80, 99]) werte.push(await messe(p));
  pruefe('Musik: nuechtern unverzerrt',
    werte[0].wet < 0.02 && werte[0].filter > 12000);
  pruefe('Musik: unter dem Wackel-Pegel passiert nichts', werte[1].zerr === 0);
  pruefe('Musik: Verzerrung steigt durchgehend',
    werte.every((w, i) => i === 0 || w.wet >= werte[i - 1].wet - 0.001),
    werte.map(w => w.wet.toFixed(2)).join(' '));
  pruefe('Musik: der Filter macht zu',
    werte[4].filter < werte[0].filter * 0.4,
    werte.map(w => Math.round(w.filter)).join(' '));
  await page.close();
}

await browser.close();

for (const e of ergebnisse)
  console.log((e.bestanden ? 'OK   ' : 'FEHL ') + e.name + (e.zusatz && !e.bestanden ? '  -> ' + e.zusatz : ''));
const durch = ergebnisse.filter(e => !e.bestanden).length;
console.log(durch ? `\n${durch} von ${ergebnisse.length} fehlgeschlagen` : `\nalle ${ergebnisse.length} bestanden`);
process.exit(durch ? 1 : 0);
