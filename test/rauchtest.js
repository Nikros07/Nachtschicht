/* ============================================================================
   RAUCHTEST

   Startet index.html in einem echten Browser, spielt einen Durchlauf durch
   und prueft die Regeln, die man beim Draufschauen nicht sieht: welche
   Aufsicht in welcher Spielart im Haus steht, wann ein Konter zaehlt, was
   ein Fehlschlag kostet, ob ein alter Spielstand uebernommen wird.

   Laufen lassen:   npm test
   Anderer Browser: CHROME_PATH=/pfad/zu/chrome npm test
   ========================================================================== */
const path = require('path');
/* playwright bringt den Browser mit, playwright-core nicht - dafuer gibt es
   CHROME_PATH. In der CI ist es das erste, lokal oft das zweite. */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require('playwright-core')); }
const EXE = process.env.CHROME_PATH || null;
const URL = 'file://' + path.join(__dirname, '..', 'index.html');

const fails = [];
const ok = [];
function pruefe(name, bedingung, detail) {
  (bedingung ? ok : fails).push(name + (bedingung ? '' : '  <-- ' + JSON.stringify(detail)));
}

(async () => {
  const browser = await chromium.launch(EXE ? { executablePath: EXE } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const fehler = [];
  page.on('pageerror', e => fehler.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') fehler.push('console: ' + m.text()); });

  await page.goto(URL);
  const frames = n => page.evaluate(k => new Promise(r => {
    let i = 0; const tick = () => (++i >= k ? r() : requestAnimationFrame(tick));
    requestAnimationFrame(tick);
  }), n);
  const modus = () => page.evaluate(() => S.modus);
  const zustand = () => page.evaluate(() => ({
    modus: S.modus, gewonnen: S.gewonnen, hp: S.hp, level: (typeof LV !== 'undefined' ? LV.nr : 1),
  }));

  await frames(4);
  pruefe('Startbild ist der Titel', await modus() === 'titel', await modus());

  /* Titel -> (Karte ->) Intro */
  await page.keyboard.press('Space');
  await frames(3);
  let m = await modus();
  if (m === 'karte') {                     // neue Levelauswahl
    ok.push('Karte erscheint nach dem Titel');
    await page.keyboard.press('KeyE');
    await frames(3);
    m = await modus();
  }
  pruefe('Intro startet', m === 'intro', m);

  /* Intro ueberspringen */
  for (let i = 0; i < 12 && await modus() === 'intro'; i++) {
    await page.keyboard.press('KeyE'); await frames(2);
  }
  pruefe('Level laeuft nach dem Intro', await modus() === 'spiel', await modus());

  /* Raum betreten und durchsuchen */
  await page.evaluate(() => {
    const r = RAEUME.findIndex(r => r.e === 0);
    S.etage = RAEUME[r].e; S.x = RAEUME[r].x; S.y = BODEN[S.etage]; S.vx = 0;
  });
  await frames(2); await page.keyboard.press('KeyE'); await frames(3);
  pruefe('Raum betreten', await modus() === 'raum', await modus());
  await page.keyboard.press('KeyE'); await frames(3);
  await page.keyboard.press('KeyE'); await frames(3);
  pruefe('Raum wieder verlassen (oder noch drin)', ['raum', 'spiel'].includes(await modus()), await modus());

  /* Verstecken, werfen, Lampe */
  await page.evaluate(() => { S.modus = 'spiel'; S.raum = null; });
  await page.keyboard.press('KeyQ'); await frames(2);
  pruefe('Taschenlampe schaltet', await page.evaluate(() => S.lampe === true));
  await page.keyboard.press('KeyR'); await frames(2);
  pruefe('Wurf fliegt', await page.evaluate(() => !!S.wurf || S.wurfAbkuehlung > 0));
  await page.evaluate(() => { S.etage = SPINDE[0].e; S.x = SPINDE[0].x; S.y = BODEN[S.etage]; });
  await frames(2); await page.keyboard.press('KeyE'); await frames(3);
  pruefe('Spind versteckt', await page.evaluate(() => S.imSpind >= 0), await page.evaluate(() => S.imSpind));
  await page.keyboard.press('KeyE'); await frames(3);

  /* Erwischt werden */
  await page.evaluate(() => { gefangen(S.lehrer[0]); });
  await frames(2);
  pruefe('Erwischt-Bildschirm', await modus() === 'gefangen', await modus());
  await page.keyboard.press('Space'); await frames(3);
  pruefe('Weiter nach dem Erwischtwerden', await modus() === 'spiel', await modus());

  /* Schluessel schnappen und raus */
  await page.evaluate(() => {
    S.hatSchluessel = true; S.etage = AUSGANG.e; S.x = AUSGANG.x; S.y = BODEN[S.etage]; S.vx = 0;
  });
  await frames(2); await page.keyboard.press('KeyE'); await frames(3);
  pruefe('Cutscene startet am Ausgang', await modus() === 'cutscene', await modus());

  /* Cutscene ueberspringen: E halten */
  await page.keyboard.down('KeyE'); await frames(70); await page.keyboard.up('KeyE');
  await frames(5);
  const z = await zustand();
  pruefe('Level gewonnen', z.modus === 'ende' && z.gewonnen === true, z);

  const stand = await page.evaluate(() => JSON.parse(localStorage.getItem('nachtschicht.spielstand') || 'null'));
  pruefe('Spielstand geschrieben', stand && stand.v === 1, stand);
  pruefe('Junge freigeschaltet', stand && stand.crew.includes('MAX FERDI'), stand && stand.crew);
  pruefe('Naechste Station offen', stand && stand.frei === 2, stand && stand.frei);
  pruefe('Bestzeit gespeichert', stand && isFinite(stand.zeiten[1]), stand && stand.zeiten);

  /* Uebergang zur naechsten Station */
  await page.keyboard.press('Space'); await frames(4);
  pruefe('Uebergang laeuft', await modus() === 'uebergang', await modus());
  await page.keyboard.press('Space'); await frames(4);
  pruefe('Karte danach', await modus() === 'karte', await modus());
  pruefe('Karte steht auf Station 2', await page.evaluate(() => LEVELS[karteWahl].nr) === 2);

  /* Station 2 ist offen, aber noch nicht gebaut - sie darf nicht starten */
  await page.keyboard.press('KeyE'); await frames(4);
  pruefe('Ungebaute Station startet nicht', await modus() === 'karte', await modus());
  /* Station 3 ist noch gar nicht offen */
  await page.keyboard.press('ArrowRight'); await frames(2);
  await page.keyboard.press('KeyE'); await frames(4);
  pruefe('Verschlossene Station startet nicht', await modus() === 'karte', await modus());
  /* Zurueck auf Station 1 - die laesst sich starten */
  await page.keyboard.press('ArrowLeft'); await frames(2);
  await page.keyboard.press('ArrowLeft'); await frames(2);
  pruefe('Wieder auf Station 1', await page.evaluate(() => LEVELS[karteWahl].nr) === 1);
  await page.keyboard.press('KeyE'); await frames(4);
  pruefe('Station 1 startet erneut', await modus() === 'intro', await modus());
  pruefe('Tempobonus wirkt', await page.evaluate(() => tempoBonus()) > 1.1);
  /* Ueber jede Station der Karte laufen - jede muss sich zeichnen lassen */
  await page.evaluate(() => { zeigeKarte(0); });
  for (let i = 0; i < 9; i++) { await page.keyboard.press('ArrowRight'); await frames(3); }
  pruefe('Karte zeigt alle Stationen', await modus() === 'karte', await modus());

  /* Beide Spielarten muessen die richtige Aufsicht ins Haus stellen */
  await page.reload(); await frames(4);
  const variante = async art => page.evaluate(a => {
    LEVELS[0].varianten = [a]; levelStarten(1);
    return {
      variante: S.variante,
      hausmeister: S.lehrer.filter(l => l.hausmeister).length,
      chef: S.lehrer.filter(l => l.chef).length,
      lehrer: S.lehrer.filter(l => !l.chef && !l.hausmeister).length,
      schluesselRaum: S.schluesselRaum,
      zettel: S.zettel.length,
      imSchluesselraum: S.zettel.filter(z => z.raum === S.schluesselRaum).length,
    };
  }, art);
  const vr = await variante('raum');
  pruefe('Variante RAUM: kein Hausmeister', vr.hausmeister === 0, vr);
  pruefe('Variante RAUM: Direktor und drei Lehrer', vr.chef === 1 && vr.lehrer === 3, vr);
  pruefe('Variante RAUM: Schluessel liegt in einem Raum', vr.schluesselRaum >= 0, vr);
  pruefe('Variante RAUM: Zettel nicht im Schluesselraum', vr.imSchluesselraum === 0, vr);
  const vh = await variante('hausmeister');
  pruefe('Variante HAUSMEISTER: er ist da', vh.hausmeister === 1, vh);
  pruefe('Variante HAUSMEISTER: kein Raumschluessel', vh.schluesselRaum === -1, vh);
  /* Schluessel klauen, aber nur wenn er abgelenkt ist */
  const klau = await page.evaluate(() => {
    S.modus = 'spiel';
    /* Mitten in seinem Revier, sonst zieht ihn die Patrouillenlogik im
       naechsten Bild zurueck und man steht allein da. */
    S.x = 420; S.y = BODEN[0]; S.etage = 0; S.vx = 0;
    const hm = S.lehrer.find(l => l.hausmeister);
    hm.e = 0; hm.x = 425; hm.suchtX = null; hm.abgelenkt = 0;
    druckAktion(); update(1 / 60);
    const wach = S.hatSchluessel;
    hm.x = 425; hm.abgelenkt = 2; druckAktion(); update(1 / 60);
    return { wach, abgelenkt: S.hatSchluessel, nochAmGuertel: hm.hatSchluessel };
  });
  pruefe('Wachem Hausmeister klaut man nichts', klau.wach === false, klau);
  pruefe('Abgelenktem Hausmeister schon', klau.abgelenkt === true, klau);

  /* ---- Kampfsystem ----
     Level 1 hat keine Gegner. Fuer den Test bekommt es welche, damit die
     vier Regeln aus TODO.md einzeln nachweisbar sind. */
  await page.reload(); await frames(4);
  const kampfAuf = () => page.evaluate(() => {
    LEVELS[0].gegner = [{ e: 0, x: 300, art: 'schlaeger' }, { e: 0, x: 500, art: 'brocken' }];
    levelStarten(1); S.modus = 'spiel';
    S.x = 280; S.y = BODEN[0]; S.etage = 0; S.vx = 0; S.blick = 1;
    const o = S.kampf.gegner[0]; o.x = 290; o.st = 'lauf'; o.t = 0;
    return { gegner: S.kampf.gegner.length, ausdauer: S.kampf.ausdauer };
  });
  const k0 = await kampfAuf();
  pruefe('Level ohne Gegner hat keinen Kampf', await page.evaluate(() => {
    const merk = LEVELS[0].gegner;
    delete LEVELS[0].gegner; levelStarten(1); const leer = S.kampf === null;
    LEVELS[0].gegner = merk; return leer;
  }));
  pruefe('Level mit Gegnern baut den Kampf auf', k0.gegner === 2, k0);

  /* Regel 3: Kontern nur im letzten Drittel des Ausholens */
  const konter = await page.evaluate(() => {
    const probe = (restAnteil) => {
      levelStarten(1); S.modus = 'spiel';
      S.x = 280; S.y = BODEN[0]; S.etage = 0; S.blick = 1;
      const o = S.kampf.gegner[0];
      o.x = 288; o.st = 'aus'; o.t = o.ausholen * restAnteil;
      S.kampf.schlagFrei = 0; schlage();
      for (let i = 0; i < 12; i++) update(1 / 120);   // durch das Trefferfenster
      return { hp: o.hp, maxHp: o.maxHp, tot: o.tot };
    };
    return { frueh: probe(0.9), spaet: probe(0.2) };
  });
  pruefe('Frueh im Ausholen ist kein Konter',
    konter.frueh.hp === konter.frueh.maxHp - 1 && !konter.frueh.tot, konter.frueh);
  pruefe('Im letzten Drittel schon', konter.spaet.tot === true, konter.spaet);

  /* Gepanzerte lassen sich nicht kontern */
  const panzer = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 280; S.y = BODEN[0]; S.etage = 0; S.blick = 1;
    const o = S.kampf.gegner.find(g => g.panzer) || S.kampf.gegner[0];
    o.x = 288; o.st = 'aus'; o.t = o.ausholen * 0.1;
    S.kampf.schlagFrei = 0; schlage();
    for (let i = 0; i < 12; i++) update(1 / 120);
    return { hp: o.hp, maxHp: o.maxHp, tot: o.tot, panzer: !!o.panzer };
  });
  pruefe('Gepanzerte sind nicht konterbar',
    panzer.panzer && !panzer.tot && panzer.hp === panzer.maxHp - 1, panzer);

  /* Regel 2: Fehlschlag kostet mehr als ein Treffer */
  const erholung = await page.evaluate(() => {
    const probe = (nah) => {
      levelStarten(1); S.modus = 'spiel';
      S.x = 280; S.y = BODEN[0]; S.etage = 0; S.blick = 1;
      S.kampf.gegner.forEach(g => { g.x = nah ? 288 : 700; g.st = 'lauf'; });
      S.kampf.schlagFrei = 0; const t0 = S.t; schlage();
      for (let i = 0; i < 12; i++) update(1 / 120);
      return S.kampf.schlagFrei - t0;
    };
    return { treffer: probe(true), daneben: probe(false) };
  });
  pruefe('Fehlschlag dauert laenger als ein Treffer',
    erholung.daneben > erholung.treffer * 1.5, erholung);

  /* Regel 1: Gegner koennen blocken, und Blocken kostet dich */
  const block = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 280; S.y = BODEN[0]; S.etage = 0; S.blick = 1;
    const o = S.kampf.gegner[0];
    o.x = 288; o.st = 'block'; o.t = 5; const hp0 = o.hp;
    S.kampf.schlagFrei = 0; const t0 = S.t; schlage();
    for (let i = 0; i < 12; i++) update(1 / 120);
    return { schaden: hp0 - o.hp, strafe: S.kampf.schlagFrei - t0, stehtNoch: o.st === 'block' };
  });
  pruefe('Auf einen Block gibt es keinen Schaden', block.schaden === 0, block);
  pruefe('Und der Abpraller kostet Zeit', block.strafe >= 0.7, block);

  /* Regel 4: Ausdauer begrenzt das Schlagen */
  const ausdauer = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 280; S.y = BODEN[0]; S.etage = 0; S.blick = 1;
    S.kampf.gegner.forEach(g => { g.x = 700; });
    let schlaege = 0;
    for (let i = 0; i < 600; i++) {           // fuenf Sekunden Dauerfeuer
      const vorher = S.kampf.ausdauer;
      S.kampf.schlagFrei = 0;                  // Erholung ausblenden, nur Ausdauer messen
      schlage();
      if (S.kampf.ausdauer < vorher) schlaege++;
      update(1 / 120);
    }
    return { schlaege, ausserAtem: S.kampf.ausserAtem > 0 || S.kampf.ausdauer < KAMPF.ausdauer };
  });
  pruefe('Ausdauer deckelt das Dauerfeuer', ausdauer.schlaege > 0 && ausdauer.schlaege < 40, ausdauer);

  /* Gegner schlaegt zurueck und nimmt ein Herz */
  const rueck = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 280; S.y = BODEN[0]; S.etage = 0; S.unverwundbar = 0;
    const o = S.kampf.gegner[0];
    o.x = 285; o.st = 'schlag'; o.t = o.schlag; o.trafSchon = false;
    const hp0 = S.hp; update(1 / 120);
    return { verloren: hp0 - S.hp };
  });
  pruefe('Gegner nimmt dir ein Herz', rueck.verloren === 1, rueck);

  /* E schlaegt, wenn jemand vor dir steht - sonst oeffnet es Tueren */
  const taste = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    const r = RAEUME.findIndex(x => x.e === 0);
    S.x = RAEUME[r].x; S.y = BODEN[0]; S.etage = 0;
    S.kampf.gegner.forEach(g => { g.x = 700; });
    druckAktion(); update(1 / 120);
    const tuer = S.modus === 'raum';
    S.modus = 'spiel'; S.raum = null;
    S.kampf.gegner[0].x = S.x + 8; S.kampf.gegner[0].e = 0;
    S.kampf.schlagFrei = 0; const t0 = S.kampf.schlagT;
    druckAktion(); update(1 / 120);
    return { tuer, geschlagen: S.kampf.schlagT > t0 };
  });
  pruefe('E oeffnet die Tuer, wenn niemand da ist', taste.tuer === true, taste);
  pruefe('E schlaegt, wenn jemand da ist', taste.geschlagen === true, taste);

  /* Die Zustandsmaschine muss von allein durchlaufen und darf nicht haengen.
     Einer steht direkt vor dir und schlaegt zu, einer kommt von weit her. */
  const dauerlauf = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 300; S.y = BODEN[0]; S.etage = 0; S.hp = 99;
    S.kampf.gegner[0].x = 306;
    S.kampf.gegner[1].x = 700;
    const gesehen = new Set();
    for (let i = 0; i < 1800; i++) {          // 30 Sekunden, ohne selbst zu schlagen
      S.kampf.gegner.forEach(g => gesehen.add(g.st));
      update(1 / 60);
      if (S.hp < 50) { S.hp = 99; S.unverwundbar = 0; }
    }
    return { zustaende: [...gesehen].sort(), modus: S.modus, hp: S.kampf.gegner[0].hp };
  });
  pruefe('Der Kreis laeuft von allein durch',
    ['aus', 'lauf', 'offen', 'schlag'].every(z => dauerlauf.zustaende.includes(z)),
    dauerlauf.zustaende);
  pruefe('Ohne Gegenwehr bleibt der Gegner heil', dauerlauf.hp === 2, dauerlauf);

  /* Ob er nach dem Offenstehen in Deckung geht, ist Zufall - fuer den Test
     wird die Neigung auf 1 gestellt, sonst prueft man den Wuerfel. */
  const deckung = await page.evaluate(() => {
    levelStarten(1); S.modus = 'spiel';
    S.x = 300; S.y = BODEN[0]; S.etage = 0; S.hp = 99;
    const o = S.kampf.gegner[0];
    S.kampf.gegner[1].x = 700;
    o.x = 306; o.blockNeigung = 1; o.st = 'offen'; o.t = 0.01;
    for (let i = 0; i < 4; i++) update(1 / 60);
    const ging = o.st === 'block';
    /* Wer blockt, darf nicht gleichzeitig ausholen */
    let schlugZu = false;
    for (let i = 0; i < 40; i++) { update(1 / 60); if (o.st === 'aus' || o.st === 'schlag') schlugZu = true; }
    return { ging, schlugZu, danach: o.st };
  });
  pruefe('Nach dem Offenstehen geht er in Deckung', deckung.ging === true, deckung);
  pruefe('Wer blockt, schlaegt nicht', deckung.schlugZu === false, deckung);
  await page.evaluate(() => { delete LEVELS[0].gegner; });

  /* Ein alter Spielstand von vor der Levelauswahl muss uebernommen werden */
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('nachtschicht.crew', JSON.stringify(['MAX FERDI']));
    localStorage.setItem('nachtschicht.bestzeit1', '99.5');
  });
  await page.reload(); await frames(4);
  const alt = await page.evaluate(() => STAND);
  pruefe('Alter Stand uebernommen',
    alt.crew.includes('MAX FERDI') && alt.zeiten[1] === 99.5 && alt.frei === 2, alt);

  /* Ein kaputter Spielstand darf das Spiel nicht kosten */
  await page.evaluate(() => { localStorage.setItem('nachtschicht.spielstand', '{kaputt'); });
  await page.reload(); await frames(4);
  pruefe('Kaputter Stand faellt auf leer zurueck', await page.evaluate(() => STAND.frei >= 1));
  pruefe('Titel trotz kaputtem Stand', await modus() === 'titel', await modus());

  /* Ein zweiter Durchlauf muss genauso sauber starten */
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await frames(4);
  await page.keyboard.press('Space'); await frames(3);
  if (await modus() === 'karte') { await page.keyboard.press('KeyE'); await frames(3); }
  for (let i = 0; i < 12 && await modus() === 'intro'; i++) { await page.keyboard.press('KeyE'); await frames(2); }
  pruefe('Zweiter Durchlauf startet', await modus() === 'spiel', await modus());

  /* Eine Weile laufen lassen, damit Lehrerlogik und Zeichnen Zeit haben */
  await page.keyboard.down('ArrowRight');
  await frames(180);
  await page.keyboard.up('ArrowRight');
  pruefe('Laeuft 3 Sekunden ohne Absturz', ['spiel', 'raum', 'gefangen'].includes(await modus()), await modus());

  await browser.close();

  console.log(ok.map(o => '  ok   ' + o).join('\n'));
  if (fehler.length) { console.log('\nKONSOLE:'); fehler.slice(0, 20).forEach(f => console.log('  ! ' + f)); }
  if (fails.length) { console.log('\nFEHLER:'); fails.forEach(f => console.log('  X ' + f)); }
  console.log(`\n${ok.length} ok, ${fails.length} fehlgeschlagen, ${fehler.length} Konsolenfehler`);
  process.exit(fails.length || fehler.length ? 1 : 0);
})().catch(e => { console.error('HARNESS-FEHLER', e); process.exit(2); });
