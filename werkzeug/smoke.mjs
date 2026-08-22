/* ============================================================================
   NACHTSCHICHT - RAUCHPROBE

   Startet jedes Level in einem echten Browser, drueckt Tasten und schaut zu,
   ob etwas kaputtgeht. Kein Ersatz fuers Spielen, aber es faengt genau die
   Fehler, die man beim Draufschauen uebersieht: ein vertipptes Feld, eine
   Funktion die es nicht mehr gibt, ein Spielstand der nicht ankommt.

   Braucht Playwright und einen Chromium. Beides liegt in dieser Umgebung
   schon bereit:

     node werkzeug/smoke.mjs

   Kein npm install noetig, keine Abhaengigkeit im Repo - laeuft das Skript
   nicht, ist das Spiel trotzdem in Ordnung.
   ========================================================================== */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/* Playwright darf lokal oder global liegen - beides ist in Ordnung. */
async function ladePlaywright(){
  try{ return await import('playwright'); }catch(e){}
  const orte=[];
  try{ orte.push(execSync('npm root -g',{encoding:'utf-8'}).trim()); }catch(e){}
  orte.push(join(dirname(process.execPath),'..','lib','node_modules'));
  const req=createRequire(import.meta.url);
  for(const ort of orte){
    try{ return await import(pathToFileURL(req.resolve('playwright',{paths:[ort]})).href); }catch(e){}
  }
  console.error('Playwright nicht gefunden. Einmal "npm i -g playwright" und der Test laeuft.');
  process.exit(2);
}
const pw = await ladePlaywright();
const chromium = pw.chromium || (pw.default && pw.default.chromium);

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const TYPEN = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
                '.css':'text/css', '.md':'text/markdown' };

/* Ein winziger Server, damit localStorage einen echten Ursprung hat. */
function server(){
  return new Promise(fertig=>{
    const s = createServer(async (req,res)=>{
      const pfad = join(WURZEL, normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/,''));
      try{
        const daten = await readFile(pfad);
        res.writeHead(200,{'content-type':TYPEN[extname(pfad)]||'application/octet-stream'});
        res.end(daten);
      }catch(e){ res.writeHead(404); res.end('weg'); }
    });
    s.listen(0,'127.0.0.1',()=>fertig([s,'http://127.0.0.1:'+s.address().port]));
  });
}

const fehler = [];
const pruefe = (bedingung, was) => {
  if(bedingung) console.log('  ok   '+was);
  else { console.log('  FEHL '+was); fehler.push(was); }
};

/* Seite oeffnen und dabei jeden Konsolenfehler mitschreiben.
   Alle Seiten liegen im selben Kontext - sonst haette jede ihren eigenen
   Spielstand und der Uebergang von Level zu Level waere nicht pruefbar. */
async function oeffne(kontext, adresse){
  const seite = await kontext.newPage();
  const meckern = [];
  seite.on('console', m=>{ if(m.type()==='error') meckern.push(m.text()); });
  seite.on('pageerror', e=>meckern.push(String(e)));
  await seite.goto(adresse,{waitUntil:'load'});
  await seite.waitForTimeout(400);
  return [seite, meckern];
}

const spielt = seite => seite.evaluate(()=>({
  modus: S.modus, x: S.x, hp: S.hp, zeit: S.zeit,
  frei: NACHT.frei(), crew: NACHT.crew(), stand: NACHT.stand(),
}));

async function taste(seite, code, dauer=40){
  await seite.keyboard.down(code); await seite.waitForTimeout(dauer);
  await seite.keyboard.up(code);
}

const browser = await chromium.launch();
const kontext = await browser.newContext();
const [srv, basis] = await server();
try{

/* ---- 1. Level 1 startet, laeuft, bewegt sich ---- */
console.log('\nLEVEL 1 - DIE SCHULE');
{
  const [seite, meckern] = await oeffne(kontext, basis+'/index.html?reset=1');
  pruefe(meckern.length===0, 'laedt ohne Fehler'+(meckern.length?': '+meckern[0]:''));
  pruefe((await spielt(seite)).modus==='titel', 'startet im Titelbild');

  /* Die Leiste unter dem Bild kommt jetzt aus nacht.js */
  const leiste = await seite.$$eval('#levelbar > *', els=>els.map(e=>e.tagName+':'+e.className+':'+e.textContent.trim()));
  pruefe(leiste.length>=2, 'Levelleiste ist gefuellt ('+leiste.length+' Eintraege)');
  pruefe(leiste.some(e=>e.startsWith('SPAN')), 'gesperrtes Level ist nicht anklickbar');
  pruefe(leiste[0].includes('aktiv'), 'das laufende Level ist markiert');

  /* Ohne Level 1 im Ruecken darf Taste 2 nirgends hinfuehren */
  await taste(seite,'Digit2'); await seite.waitForTimeout(150);
  pruefe(seite.url().includes('index.html'), 'Taste 2 fuehrt ohne Freischaltung nirgendwohin');

  await taste(seite,'Space');                      // Titel -> Intro
  for(let i=0;i<8;i++) await taste(seite,'KeyE',30); // Intro durchklicken
  await seite.waitForTimeout(300);
  const nachIntro = await spielt(seite);
  pruefe(nachIntro.modus==='spiel', 'Intro fuehrt ins Spiel (modus='+nachIntro.modus+')');

  const vorher = nachIntro.x;
  await taste(seite,'KeyD',350);
  await seite.waitForTimeout(120);
  pruefe((await spielt(seite)).x > vorher, 'D bewegt den Spieler nach rechts');

  await taste(seite,'Space',80); await seite.waitForTimeout(60);
  await taste(seite,'KeyQ'); await taste(seite,'KeyR'); await taste(seite,'ShiftLeft',200);
  await taste(seite,'KeyH'); await taste(seite,'KeyP'); await taste(seite,'KeyP');
  await seite.waitForTimeout(500);
  pruefe(meckern.length===0, 'Springen, Lampe, Werfen, Schleichen, Pause ohne Fehler'
    +(meckern.length?': '+meckern[0]:''));

  /* Level 1 gewinnen, ohne es zu spielen - der Abschluss ist das Interessante */
  await seite.evaluate(()=>{ S.zeit=42.5; levelGeschafft(); S.modus='ende'; S.gewonnen=true; });
  await seite.waitForTimeout(200);
  const nachSieg = await spielt(seite);
  pruefe(nachSieg.frei>=2, 'Sieg schaltet Level 2 frei (frei='+nachSieg.frei+')');
  pruefe(nachSieg.crew.includes('MAX FERDI'), 'Max Ferdi ist danach dabei');
  pruefe(nachSieg.stand.best['1']===42.5, 'Bestzeit steht im Spielstand');

  /* Und jetzt muss E wirklich weiterfuehren - genau das ging vorher nicht */
  await taste(seite,'KeyE'); await seite.waitForTimeout(400);
  pruefe(seite.url().includes('level2.html'), 'E fuehrt vom Endbild nach Level 2 (url='+seite.url().split('/').pop()+')');
  await seite.close();
}

/* ---- 2. Der Spielstand ueberlebt den Wechsel ---- */
console.log('\nSPIELSTAND');
{
  const [seite, meckern] = await oeffne(kontext, basis+'/level2.html');
  const st = await spielt(seite);
  pruefe(st.crew.includes('MAX FERDI'), 'Crew ist in Level 2 bekannt');
  pruefe(st.frei>=2, 'Level 2 ist frei');
  pruefe(await seite.evaluate(()=>NACHT.tempoFaktor())===1.15, 'Max Ferdi gibt +15% Tempo');
  pruefe(await seite.evaluate(()=>NACHT.best(1))===42.5, 'Bestzeit aus Level 1 ist lesbar');
  pruefe(meckern.length===0, 'Level 2 laedt ohne Fehler'+(meckern.length?': '+meckern[0]:''));
  await seite.close();
}

/* ---- 3. Alte Staende werden uebernommen ---- */
console.log('\nALTER SPIELSTAND');
{
  const seite = await kontext.newPage();
  await seite.goto(basis+'/index.html?reset=1',{waitUntil:'load'});
  await seite.evaluate(()=>{
    localStorage.clear();
    localStorage.setItem('nachtschicht.crew',JSON.stringify(['MAX FERDI']));
    localStorage.setItem('nachtschicht.bestzeit1','61.25');
  });
  await seite.goto(basis+'/index.html',{waitUntil:'load'});
  await seite.waitForTimeout(200);
  const st = await seite.evaluate(()=>NACHT.stand());
  pruefe(st.crew.includes('MAX FERDI'), 'alte Crew uebernommen');
  pruefe(st.best['1']===61.25, 'alte Bestzeit uebernommen');
  pruefe(st.frei>=2, 'daraus folgt: Level 2 ist frei');
  await seite.close();
}

/* ---- 4. Level 2 spielt ---- */
console.log('\nLEVEL 2 - BEI MORITZ');
{
  const [seite, meckern] = await oeffne(kontext, basis+'/level2.html');
  await taste(seite,'Space');
  for(let i=0;i<8;i++) await taste(seite,'KeyE',30);
  await seite.waitForTimeout(300);
  pruefe((await spielt(seite)).modus==='spiel', 'Intro fuehrt ins Spiel');

  const vorher = (await spielt(seite)).x;
  await taste(seite,'KeyD',400); await seite.waitForTimeout(120);
  pruefe((await spielt(seite)).x > vorher, 'D bewegt den Spieler');

  /* Trinken, bis der Pegel wackelt - da haengt viel dran */
  await seite.evaluate(()=>{ S.x=506; });
  for(let i=0;i<5;i++){ await taste(seite,'KeyE',60); await seite.waitForTimeout(700); }
  const pegel = await seite.evaluate(()=>S.pegel);
  pruefe(pegel>0, 'Trinken hebt den Pegel (Pegel='+Math.round(pegel)+')');

  await seite.waitForTimeout(600);
  pruefe(meckern.length===0, 'Level 2 laeuft ohne Fehler'+(meckern.length?': '+meckern[0]:''));
  await seite.close();
}

/* ---- 5. Der Kampf am Ende ----
   Zwei Spielweisen gegeneinander: wer im Konterfenster drueckt, gewinnt;
   wer nur haemmert, kassiert. Genau dafuer sind die Muster da. */
console.log('\nDER KRACHER');
{
  const [seite, meckern] = await oeffne(kontext, basis+'/level2.html');

  /* --- der gute Spieler: drueckt nur, wenn das Fenster offen ist --- */
  await seite.evaluate(()=>{ S.modus='spiel'; starteKampf();
    window.__gesehen={};
    window.__uhr=setInterval(()=>{
      const g=S.gegner; if(!g||S.modus!=='kampf') return;
      window.__gesehen[g.muster]=true;
      if(g.zustand!=='wind') return;
      const f=MUSTER[g.muster].fenster();
      if(f>0&&g.t>=g.dauer*(1-f)&&S.erholung<=0) druckAktion();
    },8);
  });
  for(let i=0;i<120&&await seite.evaluate(()=>S.modus)==='kampf';i++) await seite.waitForTimeout(250);
  const sauber = await seite.evaluate(()=>{ clearInterval(window.__uhr);
    return { modus:S.modus, hp:S.hp, muster:Object.keys(window.__gesehen) }; });
  pruefe(sauber.modus==='cutscene', 'sauberes Kontern gewinnt den Kampf (modus='+sauber.modus+')');
  pruefe(sauber.hp===3, 'und kostet kein Herz (hp='+sauber.hp+')');
  pruefe(sauber.muster.length>=2, 'mehr als ein Angriffsmuster gesehen: '+sauber.muster.join(', '));
  pruefe(meckern.length===0, 'Kampf laeuft ohne Fehler'+(meckern.length?': '+meckern[0]:''));
  await seite.close();
}
{
  /* --- der Haemmerer: E im Dauerfeuer, egal was der Gegner macht --- */
  const [seite, meckern] = await oeffne(kontext, basis+'/level2.html');
  await seite.evaluate(()=>{ S.modus='spiel'; starteKampf();
    window.__uhr=setInterval(()=>{ if(S.modus==='kampf') druckAktion(); },60); });
  for(let i=0;i<60;i++){
    if(await seite.evaluate(()=>S.modus)!=='kampf') break;
    await seite.waitForTimeout(250);
  }
  const wild = await seite.evaluate(()=>{ clearInterval(window.__uhr);
    return { modus:S.modus, hp:S.hp }; });
  pruefe(wild.hp<3||wild.modus==='ende', 'Draufhauen ohne Timing kostet Herzen (hp='+wild.hp+')');
  pruefe(meckern.length===0, 'auch das ohne Fehler'+(meckern.length?': '+meckern[0]:''));
  await seite.close();
}

} finally {
  await browser.close();
  srv.close();
}

console.log('\n'+(fehler.length ? fehler.length+' FEHLER' : 'alles gruen'));
process.exit(fehler.length?1:0);
