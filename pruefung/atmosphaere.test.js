/* ============================================================================
   GAESTE UND MUSIK IN LEVEL 2

   Die Musik wird ohne Ohren geprueft: ton() wird mitgeschrieben statt
   abgespielt. Dann laesst sich nachsehen, ob Wellenform, Lautstaerke und
   Tonhoehe wirklich mit dem Pegel kippen.
   ========================================================================== */
const { Pruefung, seite } = require('./hilfen');

module.exports = async (browser, server) => {
  const P = new Pruefung('Atmosphaere');
  const p = await seite(browser, server.adresse, 'level2.html?alle=1');

  /* ---- Die Gaeste -------------------------------------------------------- */
  P.abschnitt('Gaeste');
  let r = await p.evaluate(() => ({
    anzahl: GAESTE.length,
    gerede: GAST_GEREDE.length,
    /* Keiner darf in Reichweite eines Moebels oder einer echten Person
       stehen - sonst geht man hin und drueckt E ins Leere. */
    kollision: GAESTE.filter(g =>
      DINGE.some(d => Math.abs(d.x + 6 - g.x) < TUNE.reichweite) ||
      LEUTE.some(l => Math.abs(l.x - g.x) < TUNE.reichweite)).map(g => g.x),
    ausserhalb: GAESTE.filter(g => g.x < 0 || g.x > LEVEL_B).map(g => g.x),
    sprites: GAESTE.every(g => !!SPR[g.spr]),
  }));
  P.ok('es stehen welche rum', r.anzahl >= 4, r);
  P.ok('keiner steht auf einem E-Symbol', r.kollision.length === 0, r);
  P.ok('alle in der Wohnung', r.ausserhalb.length === 0, r);
  P.ok('alle haben ein Sprite', r.sprites, r);
  P.ok('und es gibt genug zu reden', r.gerede >= 8, r);

  r = await p.evaluate(() => {
    S.modus = 'spiel'; S.reden = null;
    let geredet = 0; const verschiedene = new Set();
    for (let i = 0; i < 60 * 120 && S.modus === 'spiel'; i++) {
      NP.schritt();
      if (S.gastT > 0 && S.gastTxt) { geredet++; verschiedene.add(S.gastTxt); }
    }
    return { geredet, verschiedene: verschiedene.size };
  });
  P.ok('im Hintergrund wird geredet', r.geredet > 0, r);
  P.ok('und nicht immer dasselbe', r.verschiedene >= 3, r);

  r = await p.evaluate(() => {
    S.modus = 'spiel'; S.gastT = 0; S.gastPause = 0.05; S.reden = { zeilen: ['X'] };
    for (let i = 0; i < 60 * 20; i++) NP.schritt();
    const imGespraech = S.gastT;
    S.reden = null; S.hp = TUNE.leben; S.x = 120; starteKampf();
    S.gastT = 0; S.gastPause = 0.05;
    for (let i = 0; i < 60 * 5; i++) NP.schritt();
    return { imGespraech, imKampf: S.gastT };
  });
  P.ok('niemand quatscht in ein Gespraech', r.imGespraech <= 0, r);
  P.ok('und niemand in den Kampf', r.imKampf <= 0, r);

  /* ---- Die Musik --------------------------------------------------------- */
  P.abschnitt('Musik kippt mit dem Pegel');
  await p.evaluate(() => {
    /* Nur mitschreiben, nicht abspielen: sonst muesste die Audio-Uhr
       mitlaufen, und WebAudio lehnt Zeiten in der Vergangenheit ab. */
    window.__toene = [];
    window.ton = (f, when, dur, type, vol) => { window.__toene.push({ f, type, vol }); };
  });
  const musikBei = pegel => p.evaluate(pg => {
    S.modus = 'spiel'; S.reden = null; S.gegner = null; S.pegel = pg;
    ensureAudio();
    window.__toene = []; MUS.step = 0;
    /* Die Musik plant nur einen Wimpernschlag im Voraus. Also die Uhr
       jedes Mal auf jetzt zuruecksetzen und wieder aufrufen - so laeuft
       MUS.step durch ein ganzes Bassmuster. */
    for (let k = 0; k < 40; k++) { MUS.next = AC.currentTime; musik(); }
    const t = window.__toene.filter(x => x.type);
    return {
      wellen: [...new Set(t.map(x => x.type))],
      lauteste: Math.max(...t.map(x => x.vol)),
      hoehen: t.filter(x => x.type !== 'sine').map(x => x.f),
    };
  }, pegel);
  const verschiedene = a => new Set(a.filter(f => f > 0).map(f => f.toFixed(3))).size;

  const nuechtern = await musikBei(0);
  const dicht = await musikBei(90);
  P.ok('nuechtern laeuft sie auf square',
    nuechtern.wellen.includes('square') && !nuechtern.wellen.includes('sawtooth'), nuechtern.wellen);
  P.ok('dicht kippt sie auf sawtooth', dicht.wellen.includes('sawtooth'), dicht.wellen);
  P.ok('und wird lauter', dicht.lauteste > nuechtern.lauteste,
    { nuechtern: nuechtern.lauteste, dicht: dicht.lauteste });
  P.ok('und faengt an zu eiern', verschiedene(dicht.hoehen) > verschiedene(nuechtern.hoehen),
    { nuechtern: verschiedene(nuechtern.hoehen), dicht: verschiedene(dicht.hoehen) });
  P.ok('sie kippt genau dann, wenn auch das Bild schwankt',
    await p.evaluate(() => TUNE.musikKipptAb === TUNE.wackelnAb));

  P.ok('kein Fehler in der Konsole', p.fehler.length === 0, p.fehler);
  await p.ctx.close();
  return P.bilanz();
};
