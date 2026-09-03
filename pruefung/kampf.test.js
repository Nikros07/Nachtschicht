/* ============================================================================
   DER KRACHER - der Kampf am Ende von Level 2

   Der Kampf wird Bild fuer Bild mit festem dt durchgespielt. Welcher
   Angriff kommt, wird ueber die echten Spielfelder gesteuert: hp waehlt
   die Phase, zug den Angriff aus dem Muster. Keine Hintertueren im
   Spielcode.
   ========================================================================== */
const { Pruefung, seite } = require('./hilfen');

module.exports = async (browser, server) => {
  const P = new Pruefung('Kracher-Kampf');
  const p = await seite(browser, server.adresse, 'level2.html?alle=1');
  await p.evaluate(() => {
    /* Kampf in einem bestimmten Muster starten. */
    NP.kampf = (hp, zug) => {
      /* Uhr auf null: sonst zaehlt jede Pruefung die Sekunden der
         vorherigen mit, und die gemessene Kampfdauer waere Unsinn. */
      S.modus = 'spiel'; S.hp = TUNE.leben; S.x = 120; S.zeit = 0;
      starteKampf();
      S.gegner.hp = hp; S.gegner.zug = zug;
    };
    NP.insFenster = () => NP.bis(g => g.t >= g.dauer * (1 - TUNE.konterFenster));
  });

  /* ---- Welcher Angriff wann --------------------------------------------- */
  P.abschnitt('Das Muster');
  const angriffBei = (hp, zug) => p.evaluate(([hp, zug]) => {
    NP.kampf(hp, zug); NP.bis(g => g.zustand !== 'komm');
    return { angriff: S.gegner.angriff, zustand: S.gegner.zustand };
  }, [hp, zug]);
  P.ok('frisch faengt er mit dem Schwinger an', (await angriffBei(3, 0)).angriff === 'schwinger');
  P.ok('und zeigt in der ersten Phase die Finte', (await angriffBei(3, 2)).angriff === 'finte');
  const s = await angriffBei(2, 2);
  P.ok('angeschlagen kommt der Sturm', s.angriff === 'sturm' && s.zustand === 'sturmWarn', s);
  P.ok('ganz am Ende das Doppel', (await angriffBei(1, 2)).angriff === 'doppel');

  /* ---- Schwinger --------------------------------------------------------- */
  P.abschnitt('Schwinger');
  let r = await p.evaluate(() => {
    NP.kampf(3, 0); NP.bis(g => g.zustand === 'wind'); NP.insFenster();
    NP.druck(); NP.schritt();
    return { hp: S.gegner.hp, zustand: S.gegner.zustand, meineHp: S.hp };
  });
  P.ok('Konter im Fenster sitzt', r.hp === 2 && r.zustand === 'getroffen', r);
  P.ok('und kostet kein eigenes Herz', r.meineHp === 3, r);

  r = await p.evaluate(() => {
    NP.kampf(3, 0); NP.bis(g => g.zustand === 'wind');
    NP.schritt(2); NP.druck(); NP.schritt();          // klar zu frueh
    const gleich = { hp: S.gegner.hp, gesperrt: S.erholung > 0, verpasst: S.gegner.verpasst };
    NP.bis(g => g.zustand === 'schlag');
    return { ...gleich, meineHp: S.hp };
  });
  P.ok('zu frueh trifft nicht', r.hp === 3, r);
  P.ok('sperrt kurz', r.gesperrt === true, r);
  P.ok('verspielt den ganzen Schlag', r.verpasst === true, r);
  P.ok('und kostet ein Herz', r.meineHp === 2, r);

  r = await p.evaluate(() => {
    NP.kampf(3, 0); NP.bis(g => g.zustand === 'wind');
    NP.schritt(2); NP.druck(); NP.schritt();
    /* Die Sperre ist kuerzer als das Ausholen. Ohne das Verpasst-Merkmal
       kaeme man danach noch ins Fenster - genau das darf nicht sein. */
    NP.bis((g, S) => S.erholung <= 0 && g.t >= g.dauer * (1 - TUNE.konterFenster));
    const nochImAusholen = S.gegner.zustand === 'wind';
    NP.druck(); NP.schritt();
    return { nochImAusholen, hp: S.gegner.hp };
  });
  P.ok('nach einem Patzer rettet auch richtiges Timing nichts',
    r.nochImAusholen && r.hp === 3, r);

  /* ---- Finte ------------------------------------------------------------- */
  P.abschnitt('Finte');
  P.ok('bricht ab, bevor das Konterfenster aufgeht - sonst ist sie keine',
    await p.evaluate(() => TUNE.finteAbbruch < 1 - TUNE.konterFenster),
    await p.evaluate(() => [TUNE.finteAbbruch, 1 - TUNE.konterFenster]));
  r = await p.evaluate(() => {
    NP.kampf(3, 2);
    NP.bis(g => g.zustand === 'finte');
    const abbruch = S.gegner.zustand;
    NP.bis(g => g.zustand === 'wind' && g.echt);
    return { abbruch, zweite: S.gegner.dauer, voll: TUNE.gegnerWindup };
  });
  P.ok('sie bricht wirklich ab', r.abbruch === 'finte', r);
  P.ok('und der echte Schlag kommt schneller', r.zweite < r.voll, r);

  r = await p.evaluate(() => {
    /* Kein Zeitpunkt im Scheinausholen darf kontern. Also jeden einzeln,
       jedes Mal mit frischem Kampf. */
    let getroffen = 0, versuche = 0, kostet = 0;
    for (let f = 0; f < 40; f++) {
      NP.kampf(3, 2); NP.bis(g => g.zustand === 'wind'); NP.schritt(f);
      if (S.gegner.zustand !== 'wind' || S.gegner.echt) break;
      versuche++;
      NP.druck(); NP.schritt();
      if (S.gegner.hp < 3) getroffen++;
      NP.bis(g => g.zustand === 'schlag' || g.zustand === 'getroffen', 400);
      if (S.hp < TUNE.leben) kostet++;
    }
    return { versuche, getroffen, kostet };
  });
  P.ok('kein Zeitpunkt im Scheinausholen kontert', r.versuche > 5 && r.getroffen === 0, r);
  P.ok('und jeder davon kostet ein Herz', r.kostet === r.versuche, r);

  r = await p.evaluate(() => {
    NP.kampf(3, 2);
    NP.bis(g => g.zustand === 'wind' && g.echt);      // den echten abwarten
    NP.insFenster(); NP.druck(); NP.schritt();
    return { hp: S.gegner.hp, meineHp: S.hp };
  });
  P.ok('wer wartet, kontert auch die Finte', r.hp === 2 && r.meineHp === 3, r);

  /* ---- Sturm ------------------------------------------------------------- */
  P.abschnitt('Sturm');
  r = await p.evaluate(() => {
    NP.kampf(2, 2); NP.bis(g => g.zustand === 'sturmWarn');
    NP.rechts(true);
    NP.bis(g => g.zustand === 'offen' || g.zustand === 'schlag', 400);
    NP.rechts(false);
    const z = S.gegner.zustand;
    NP.druck(); NP.schritt();
    return { z, hp: S.gegner.hp, meineHp: S.hp };
  });
  P.ok('Ausweichen laesst ihn ins Leere laufen', r.z === 'offen', r);
  P.ok('und kostet kein Herz', r.meineHp === 3, r);
  P.ok('danach steht er offen fuer einen freien Treffer', r.hp === 1, r);

  r = await p.evaluate(() => {
    NP.kampf(2, 2); NP.bis(g => g.zustand === 'sturmWarn');
    NP.bis(g => g.zustand === 'schlag' || g.zustand === 'offen', 400);
    return { z: S.gegner.zustand, meineHp: S.hp };
  });
  P.ok('stehenbleiben kostet ein Herz', r.z === 'schlag' && r.meineHp === 2, r);

  r = await p.evaluate(() => {
    NP.kampf(2, 2); NP.bis(g => g.zustand === 'sturmWarn');
    NP.druck(); NP.schritt();
    return { hp: S.gegner.hp, gesperrt: S.erholung > 0 };
  });
  P.ok('gegen den Sturm ist Kontern ein Patzer', r.hp === 2 && r.gesperrt, r);

  /* ---- Doppel ------------------------------------------------------------ */
  P.abschnitt('Doppel');
  r = await p.evaluate(() => {
    NP.kampf(1, 2); NP.bis(g => g.zustand === 'wind');
    const schlaege = S.gegner.rest;
    NP.schritt(2); NP.druck(); NP.schritt();          // den ersten verpatzen
    NP.bis(g => g.zustand === 'schlag');
    NP.bis(g => g.zustand === 'wind', 200);
    return { schlaege, zweite: S.gegner.dauer, verpasst: S.gegner.verpasst };
  });
  P.ok('es sind zwei Schlaege', r.schlaege === 2, r);
  P.ok('der zweite kommt schneller', r.zweite < 0.85, r);
  P.ok('und ist wieder eine eigene Gelegenheit', r.verpasst === false, r);

  /* ---- Draufhauen gegen Zuschauen ---------------------------------------- */
  P.abschnitt('Draufhauen gegen Zuschauen');
  r = await p.evaluate(() => {
    NP.kampf(3, 0);
    for (let i = 0; i < 60 * 25 && S.modus === 'kampf'; i++) { NP.druck(); NP.schritt(); }
    return { modus: S.modus, gewonnen: S.gewonnen, meineHp: S.hp };
  });
  P.ok('Dauerdruecken verliert den Kampf', r.modus === 'ende' && r.gewonnen === false, r);

  r = await p.evaluate(() => {
    /* Sauber: warten, im Fenster kontern, vor dem Sturm weggehen. */
    NP.kampf(3, 0);
    for (let i = 0; i < 60 * 60 && S.modus === 'kampf'; i++) {
      const g = S.gegner;
      NP.rechts(g.zustand === 'sturmWarn' || g.zustand === 'sturm');
      if (g.zustand === 'offen') NP.druck();
      else if (g.zustand === 'wind' && !g.verpasst
               && g.t >= g.dauer * (1 - TUNE.konterFenster) + 0.02
               && !(g.angriff === 'finte' && !g.echt)) NP.druck();
      NP.schritt();
    }
    return { modus: S.modus, meineHp: S.hp, zeit: Math.round(S.zeit) };
  });
  P.ok('sauber gespielt gewinnt man', r.modus === 'cutscene', r);
  P.ok('ohne ein einziges Herz zu verlieren', r.meineHp === 3, r);
  P.ok('und der Kampf frisst die Uhr nicht auf', r.zeit < 15, r);
  console.log('         (sauber gespielt: ' + r.zeit + ' s von 190)');

  /* Der eigentliche Balance-Waechter: wer die Haelfte trifft, soll noch
     eine Chance haben, wer fast alles trifft, soll fast immer gewinnen.
     Fester Zufallskeim, damit die Zahlen jedes Mal dieselben sind. */
  const beiGuete = guete => p.evaluate(g => {
    let siege = 0, laengste = 0;
    for (let runde = 0; runde < 20; runde++) {
      NP.kampf(TUNE.gegnerTreffer, 0);
      let saat = runde * 7919 + 13;
      const zufall = () => (saat = (saat * 1103515245 + 12345) % 2147483648) / 2147483648;
      for (let i = 0; i < 60 * 120 && S.modus === 'kampf'; i++) {
        const gg = S.gegner, trifft = zufall() < g;
        NP.rechts((gg.zustand === 'sturmWarn' || gg.zustand === 'sturm') && trifft);
        if (gg.zustand === 'offen') NP.druck();
        else if (gg.zustand === 'wind' && !gg.verpasst && !(gg.angriff === 'finte' && !gg.echt)) {
          const imFenster = gg.t >= gg.dauer * (1 - TUNE.konterFenster) + 0.02;
          if (imFenster ? zufall() < g : zufall() < (1 - g) * 0.06) NP.druck();
        }
        NP.schritt();
      }
      if (S.modus === 'cutscene') siege++;
      laengste = Math.max(laengste, S.zeit);
    }
    NP.rechts(false);
    return { quote: Math.round(100 * siege / 20), laengste: +laengste.toFixed(1) };
  }, guete);
  const gut = await beiGuete(0.8), mittel = await beiGuete(0.5);
  P.ok('wer fast alles trifft, gewinnt fast immer', gut.quote >= 80, gut);
  P.ok('wer die Haelfte trifft, hat noch eine Chance',
    mittel.quote >= 25 && mittel.quote <= 85, mittel);
  P.ok('auch der zaeheste Kampf bleibt kurz', gut.laengste < 20 && mittel.laengste < 20,
    { gut: gut.laengste, mittel: mittel.laengste });
  console.log('         (Trefferquote 80% -> ' + gut.quote + '% Siege, '
    + '50% -> ' + mittel.quote + '% Siege)');

  /* ---- Nichts haengt, nichts bricht -------------------------------------- */
  P.abschnitt('Robustheit');
  r = await p.evaluate(() => {
    NP.kampf(3, 0);
    const gesehen = new Set();
    for (let i = 0; i < 60 * 90 && S.modus === 'kampf'; i++) {
      if (S.gegner) gesehen.add(S.gegner.zustand);
      if (i % 7 === 0) NP.druck();
      NP.links(i % 40 < 12); NP.rechts(i % 40 >= 30);
      NP.schritt();
    }
    return { modus: S.modus, gesehen: [...gesehen] };
  });
  P.ok('der Kampf endet immer', r.modus !== 'kampf', r);
  P.ok('alle Zustaende kommen vor',
    ['komm', 'wind', 'schlag', 'pause'].every(z => r.gesehen.includes(z)), r.gesehen);

  r = await p.evaluate(() => {
    NP.kampf(3, 0);
    let min = 1e9, max = -1e9, dichteste = 1e9;
    NP.rechts(true);
    for (let i = 0; i < 60 * 20 && S.modus === 'kampf'; i++) {
      if (i === 400) { NP.rechts(false); NP.links(true); }
      NP.schritt();
      min = Math.min(min, S.x); max = Math.max(max, S.x);
      if (S.gegner && S.gegner.zustand !== 'sturm' && S.gegner.zustand !== 'schlag')
        dichteste = Math.min(dichteste, S.x - S.gegner.x);
    }
    NP.links(false);
    return { spanne: Math.round(max - min), dichteste: Math.round(dichteste),
             platz: TUNE.kampfPlatz, nah: TUNE.kampfNah };
  });
  P.ok('der Rueckzug ist begrenzt', r.spanne <= r.platz + 2, r);
  P.ok('und man laeuft nicht durch ihn durch', r.dichteste >= r.nah - 2, r);

  P.ok('kein Fehler in der Konsole', p.fehler.length === 0, p.fehler);
  await p.ctx.close();
  return P.bilanz();
};
