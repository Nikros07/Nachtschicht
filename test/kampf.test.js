/* Spielt den Kracher am Ende von Level 2 richtig durch und prueft, dass
   die drei Muster tun, was sie sollen:

     roter Balken   -> E kontert und nimmt ihm ein Leben
     goldener Balken-> E haut daneben und macht dich offen
     Flasche        -> Sprung geht drueber, Stehenbleiben kostet ein Herz

   Am Ende muss der Kampf gewonnen sein, ohne ein einziges Herz zu
   verlieren - sonst ist ein Muster nicht fair loesbar.

   Starten:  node test/kampf.test.js
   Braucht:  npm i playwright */
const { chromium } = require('playwright');
const { starteServer, sammleFehler, pruefer, browserPfad } = require('./hilfe');

/* Ab dieser Entfernung springt der Prueferling. Wer beim Wurf sofort
   hochgeht, ist wieder unten, bevor die Flasche da ist - genau wie ein
   Mensch, der zu frueh springt. Der Sprung gehoert kurz davor. */
const NAH = 34;

/* Bis in den Kampf: Intro weg, Kampf von Hand starten. Den ganzen Level
   durchzuspielen waere hier nur Umweg - geprueft wird der Kampf. */
async function bisZumKampf(seite, port){
  await seite.goto(`http://127.0.0.1:${port}/level2.html`);
  await seite.keyboard.press('Space');
  for(let i=0;i<10;i++){ await seite.keyboard.press('KeyE'); await seite.waitForTimeout(70); }
  await seite.evaluate(()=>{ S.x=100; starteKampf(); });
  await seite.waitForTimeout(100);
}
/* Warten, bis im Spiel etwas passiert - feste Wartezeiten sind bei
   einem Kampf mit Phasen zu unzuverlaessig. */
async function warteAuf(seite, pruefung, maxMs){
  const bis=Date.now()+maxMs;
  while(Date.now()<bis){
    if(pruefung(await lage(seite))) return true;
    await seite.waitForTimeout(25);
  }
  return false;
}
const lage = seite => seite.evaluate(()=>({
  modus:S.modus, hp:S.hp, offen:S.danebenT>0, amBoden:S.amBoden,
  g:S.gegner?{ z:S.gegner.zustand, hp:S.gegner.hp, flasche:!!S.gegner.flasche,
               weg:S.gegner.flasche?Math.abs(S.gegner.flasche.x-S.x):999 }:null,
}));

(async () => {
  const { server, port } = await starteServer();
  const browser = await chromium.launch({ executablePath: browserPfad() });
  const p = pruefer();

  /* --- einzelne Muster --- */
  {
    const ctx=await browser.newContext(); const seite=await ctx.newPage();
    await bisZumKampf(seite,port);

    console.log('\n-- Schwinger --');
    await seite.evaluate(()=>{ S.gegner.zustand='wind'; S.gegner.t=0; });
    await seite.keyboard.press('KeyE'); await seite.waitForTimeout(80);
    let l=await lage(seite);
    p.ist('Konter nimmt ein Leben', l.g.hp, 2);
    p.ist('kein Herz verloren', l.hp, 3);

    console.log('\n-- Finte --');
    await seite.evaluate(()=>{ S.gegner.zustand='finte'; S.gegner.t=0; S.danebenT=0; });
    await seite.keyboard.press('KeyE'); await seite.waitForTimeout(80);
    l=await lage(seite);
    p.ist('E auf die Finte trifft nicht', l.g.hp, 2);
    p.ist('dafuer stehst du offen', l.offen, true);
    p.ist('kostet aber kein Herz', l.hp, 3);

    console.log('\n-- offen in den Schwinger --');
    await seite.evaluate(()=>{ S.gegner.zustand='wind'; S.gegner.t=0; });
    await seite.keyboard.press('KeyE'); await seite.waitForTimeout(80);
    l=await lage(seite);
    p.ist('wer offen ist, kontert nicht', l.g.hp, 2);

    console.log('\n-- Flasche, stehen geblieben --');
    await seite.evaluate(()=>{ S.gegner.zustand='zurueck'; S.gegner.t=0; S.danebenT=0;
                               S.gegner.getroffen=2; S.gegner.flasche=null; S.hp=3; });
    await seite.waitForTimeout(2000);
    l=await lage(seite);
    p.ist('stehen bleiben kostet ein Herz', l.hp, 2);

    console.log('\n-- Flasche, gesprungen --');
    await seite.evaluate(()=>{ S.gegner.zustand='zurueck'; S.gegner.t=0; S.gegner.flasche=null; S.hp=3; });
    /* Springen, sobald die Flasche unterwegs ist - so wie ein Mensch es
       auch machen wuerde: kurz vorher und kurz gehalten. */
    await warteAuf(seite, l=>l.g&&l.g.flasche&&l.g.weg<NAH, 2500);
    await seite.keyboard.down('Space'); await seite.waitForTimeout(120); await seite.keyboard.up('Space');
    await seite.waitForTimeout(900);
    l=await lage(seite);
    p.ist('wer springt, kommt drueber', l.hp, 3);
    await ctx.close();
  }

  /* --- der ganze Kampf, richtig gespielt --- */
  console.log('\n-- ganzer Kampf --');
  {
    const ctx=await browser.newContext(); const seite=await ctx.newPage();
    const fehler=sammleFehler(seite);
    await bisZumKampf(seite,port);

    let runden=0;
    while(runden++ < 900){
      const l=await lage(seite);
      if(l.modus!=='kampf') break;
      if(!l.g) break;
      if(l.g.z==='wind' && !l.offen) await seite.keyboard.press('KeyE');
      else if(l.g.z==='wurf' && l.g.flasche && l.g.weg<NAH && l.amBoden){
        await seite.keyboard.down('Space'); await seite.waitForTimeout(110); await seite.keyboard.up('Space');
      }
      /* auf 'finte' und alles andere: Finger stillhalten */
      await seite.waitForTimeout(30);
    }
    const l=await lage(seite);
    p.ist('Kampf ist vorbei', l.modus!=='kampf', true);
    p.ist('und zwar gewonnen', ['cutscene','ende'].includes(l.modus), true);
    p.ist('ohne ein Herz zu verlieren', l.hp, 3);
    p.ist('keine JS-Fehler', fehler, []);
    await ctx.close();
  }

  await browser.close(); server.close();
  const fehler=p.fehler();
  console.log(fehler?`\n${fehler} FEHLER`:'\nalles gruen');
  process.exit(fehler?1:0);
})();
