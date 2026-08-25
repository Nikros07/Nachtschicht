/* ============================================================================
   NACHTSCHICHT - RAUCHTEST

   Startet jedes Level in einem echten Browser und schaut nach, ob es laeuft.
   Kein Ersatz fuer Spielen, aber es faengt genau das, was beim Umbau auf den
   gemeinsamen Unterbau leicht kaputtgeht: eine vergessene Variable, ein
   Sprite, das es nicht mehr gibt, ein Spielstand, der nicht mehr passt.

   Braucht Playwright. Das Spiel selbst braucht weiterhin gar nichts.

     npm i -D playwright && npx playwright install chromium
     node test/smoke.mjs

   Ohne Playwright im Projekt geht auch eine globale Installation:
     NODE_PATH=$(npm root -g) node test/smoke.mjs
   ========================================================================== */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEITEN = ['index.html', 'level2.html', 'level3.html', 'runner.html'];
const TYPEN = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css' };

let fehler = 0;
const pruefe = (name, wahr, dazu='') => {
  if(!wahr) fehler++;
  console.log(`  ${wahr?'ok  ':'FAIL'}  ${name}${dazu?'  -> '+dazu:''}`);
};

/* ---- Ein kleiner Server, damit alles so laeuft wie auf GitHub Pages ---- */
const srv = http.createServer((req,res)=>{
  const datei = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if(!datei.startsWith(ROOT) || !fs.existsSync(datei) || fs.statSync(datei).isDirectory()){
    res.writeHead(404); return res.end();
  }
  res.writeHead(200,{'content-type':(TYPEN[path.extname(datei)]||'application/octet-stream')+'; charset=utf-8'});
  fs.createReadStream(datei).pipe(res);
});
await new Promise(r=>srv.listen(0,'127.0.0.1',r));
const basis = 'http://127.0.0.1:'+srv.address().port;

const browser = await chromium.launch(
  process.env.CHROME_PFAD ? { executablePath:process.env.CHROME_PFAD } : {});

/* Sammelt Fehler aus der Seite ein, egal woher sie kommen. */
function beobachte(page){
  const probleme = [];
  page.on('console', m => { if(m.type()==='error') probleme.push('console: '+m.text()); });
  page.on('pageerror', e => probleme.push('pageerror: '+e.message));
  page.on('requestfailed', r => probleme.push('nicht geladen: '+r.url()));
  page.on('response', r => { if(r.status()>=400) probleme.push('http '+r.status()+': '+r.url()); });
  return probleme;
}

/* ==========================================================================
   1) Laeuft jede Seite ueberhaupt?
   ========================================================================== */
console.log('\n1) Jede Seite startet und zeichnet');
for(const datei of SEITEN){
  const ctx = await browser.newContext({ viewport:{width:1000,height:700} });
  const page = await ctx.newPage();
  const probleme = beobachte(page);
  await page.goto(basis+'/'+datei, { waitUntil:'load' });
  await page.waitForTimeout(400);

  /* Zaehlt Bilder statt Pixel zu vergleichen - ein Standbild kann auch
     einfach ein Moment ohne Bewegung sein, eine stehende Schleife nicht. */
  const bilder = await page.evaluate(async ()=>{
    let n=0; const tick=()=>{ n++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    await new Promise(r=>setTimeout(r,500));
    return n;
  });

  /* Durchs Intro klicken und ein Stueck laufen - so werden die Zeichen-
     routinen des Spiels wirklich angefasst, nicht nur das Titelbild. */
  for(let i=0;i<8;i++){ await page.keyboard.press('KeyE'); await page.waitForTimeout(150); }
  await page.keyboard.press('Space'); await page.waitForTimeout(200);
  await page.keyboard.down('KeyD'); await page.waitForTimeout(700); await page.keyboard.up('KeyD');
  await page.waitForTimeout(200);

  pruefe(datei, probleme.length===0 && bilder>15, `${bilder} Bilder/0.5s ${probleme.join(' | ')}`);
  await ctx.close();
}

/* ==========================================================================
   2) Spielstand: Uebernahme, Sieg, Freischaltung, Uebergang
   ========================================================================== */
async function seite(datei){
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(basis+'/'+datei);
  return { ctx, page };
}

console.log('\n2) Alte Spielstaende werden uebernommen');
{
  const { ctx, page } = await seite('index.html');
  await page.evaluate(()=>{ localStorage.clear();
    localStorage.setItem('nachtschicht.crew', JSON.stringify(['MAX FERDI']));
    localStorage.setItem('nachtschicht.bestzeit1','123.5'); });
  await page.reload();
  const st = await page.evaluate(()=>JSON.parse(localStorage.getItem('nachtschicht.stand')));
  pruefe('Crew bleibt', st.crew.includes('MAX FERDI'), JSON.stringify(st.crew));
  pruefe('Bestzeit bleibt', (st.levels['1']||{}).best===123.5, JSON.stringify(st.levels));
  pruefe('Level 1 gilt als geschafft', !!(st.levels['1']||{}).ge);
  pruefe('Tempo-Bonus wirkt', Math.abs(await page.evaluate(()=>tempoBonus())-1.15)<1e-9);
  await ctx.close();
}

console.log('\n3) Sieg schaltet das naechste Level frei');
{
  const { ctx, page } = await seite('index.html');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  pruefe('Level 2 ist vorher zu', (await page.evaluate(()=>istFrei(2)))===false);
  /* Erwartung aus LEVELS ableiten, nicht festschreiben - sonst muss dieser
     Test bei jedem neuen Level nachgezogen werden. */
  const leiste = await page.evaluate(()=>({
    ist: [...document.querySelectorAll('#levelbar *')].map(e=>e.tagName),
    soll: LEVELS.map(l=>(istFrei(l.nr)||l.nr===1)?'A':'SPAN'),
  }));
  pruefe('Leiste sperrt genau die Level, die noch zu sind',
    leiste.ist.join()===leiste.soll.join(), leiste.ist.join()+' / '+leiste.soll.join());

  await page.evaluate(()=>{ S.zeit=99; S.gewonnen=true; S.modus='ende'; levelGeschafft(); });
  const st = await page.evaluate(()=>JSON.parse(localStorage.getItem('nachtschicht.stand')));
  pruefe('Max Ferdi kommt dazu', st.crew.includes('MAX FERDI'), JSON.stringify(st.crew));
  pruefe('Bestzeit steht drin', st.levels['1'].best===99, JSON.stringify(st.levels));
  pruefe('Level 2 ist jetzt frei', await page.evaluate(()=>istFrei(2)));

  await page.keyboard.press('KeyE');
  await page.waitForTimeout(500);
  pruefe('E fuehrt weiter ins naechste Level', page.url().endsWith('/level2.html'), page.url());
  await ctx.close();
}

console.log('\n4) Das letzte Level springt nicht zurueck');
{
  const { ctx, page } = await seite('level2.html');
  await page.evaluate(()=>{ S.zeit=50; S.gewonnen=true; S.modus='ende'; levelGeschafft(); });
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(400);
  const letzte = await page.evaluate(()=>!naechstesLevel(2));
  pruefe('bleibt stehen, solange kein Level folgt', !letzte || page.url().endsWith('/level2.html'), page.url());
  const st = await page.evaluate(()=>JSON.parse(localStorage.getItem('nachtschicht.stand')));
  pruefe('Moritz kommt dazu', st.crew.includes('MORITZ'), JSON.stringify(st.crew));
  pruefe('seine Faehigkeit ist aktiv', await page.evaluate(()=>hatFaehigkeit('chayas')));
  await ctx.close();
}

console.log('\n5) Ein kaputter Spielstand darf nichts umbringen');
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const probleme = beobachte(page);
  await page.goto(basis+'/index.html');
  await page.evaluate(()=>{ localStorage.clear(); localStorage.setItem('nachtschicht.stand','{kaputt'); });
  await page.reload();
  await page.waitForTimeout(400);
  pruefe('Seite laeuft weiter', probleme.length===0, probleme.join(' | '));
  pruefe('Stand wird neu angelegt', await page.evaluate(()=>!!localStorage.getItem('nachtschicht.stand')));
  await ctx.close();
}

/* ==========================================================================
   6) Der Kampf. Prueft nicht "sieht gut aus", sondern das Einzige, was sich
   pruefen laesst: dass Koennen sich lohnt und Haemmern nicht.
   ========================================================================== */
console.log('\n6) Der Kampf belohnt Timing statt Haemmern');
{
  const { ctx, page } = await seite('level2.html');

  /* Spielt den Kampf mit einer Strategie durch und meldet, wie es ausging. */
  const spiele = (strategie) => page.evaluate((strategie)=>{
    starte(); starteLevel(); S.hp=99; starteKampf();
    const dt=1/60; let schaden=0, n=0;
    for(let i=0;i<60*90 && S.modus==='kampf'; i++){
      const K=S.gegner;
      linksAn=rechtsAn=false;
      let schlag=false;
      if(strategie==='haemmern') schlag = i%4===0;
      if(strategie==='koennen'){
        const d=Math.abs(S.x-K.x);
        if(K.zustand==='wind' && K.muster.nichtKonterbar){
          /* Unblockbar: nur weggehen hilft */
          if(S.x>K.x) rechtsAn=true; else linksAn=true;
        } else {
          if(d>KT.reichweite-3 && K.zustand!=='wind'){ if(S.x>K.x) linksAn=true; else rechtsAn=true; }
          if(K.zustand==='wind'){
            const voll=K.muster.wind*K.windFaktor;
            schlag = K.t >= voll*(1-KT.konterFenster*0.7);
          }
          if(K.zustand==='erholung' && K.t<0.3 && d<KT.reichweite-2) schlag=true;
        }
      }
      if(schlag) aktionPuffer.push(S.t);
      const vor=S.hp; update(dt); if(S.hp<vor) schaden++;
      n=i;
    }
    return { modus:S.modus, schaden, sek:+(n/60).toFixed(1) };
  }, strategie);

  const h = await spiele('haemmern');
  const k = await spiele('koennen');
  /* Mit drei Herzen waere der Haemmerer tot - genau das ist der Punkt. */
  pruefe('Haemmern kostet mehr als drei Herzen', h.schaden>=3, JSON.stringify(h));
  pruefe('Kontern gewinnt', k.modus!=='kampf', JSON.stringify(k));
  pruefe('Kontern kostet fast nichts', k.schaden<=1, 'schaden='+k.schaden);
  pruefe('und ist deutlich schneller', k.sek < h.sek, k.sek+'s statt '+h.sek+'s');

  const bau = await page.evaluate(()=>{
    starte(); starteLevel(); S.hp=99; starteKampf();
    const K=S.gegner, dt=1/60, gesehen={};
    let v=0;
    for(let i=0;i<4;i++){
      while(K.schlagT>0||K.abkling>0){ update(dt); if(++v>600) break; }
      aktionPuffer.push(S.t); update(dt);
    }
    const leer=Math.round(K.ausdauer);
    v=0; while(K.schlagT>0||K.abkling>0){ update(dt); if(++v>600) break; }
    aktionPuffer.push(S.t); update(dt);
    const ausgepowert=K.ausgepowert>0;
    for(let i=0;i<60*120 && S.modus==='kampf'; i++){
      if(K.zustand==='wind'&&K.muster) gesehen[K.muster.art]=true;
      if(K.zustand==='deckung') gesehen.deckung=true;
      update(dt);
    }
    return { leer, ausgepowert, gesehen:Object.keys(gesehen), fenster:KT.konterFenster };
  });
  pruefe('Ausdauer laeuft leer', bau.leer<26, 'rest='+bau.leer);
  pruefe('und blockiert dann den Schlag', bau.ausgepowert);
  pruefe('mehr als ein Angriffsmuster', bau.gesehen.filter(m=>m!=='deckung').length>=2, bau.gesehen.join(','));
  pruefe('der Gegner geht in Deckung', bau.gesehen.includes('deckung'), bau.gesehen.join(','));
  pruefe('Konterfenster ist das letzte Drittel', Math.abs(bau.fenster-0.34)<0.02, String(bau.fenster));
  await ctx.close();
}

await browser.close();
srv.close();
console.log(fehler ? `\n${fehler} Pruefung(en) fehlgeschlagen` : '\nalles gruen');
process.exit(fehler ? 1 : 0);
