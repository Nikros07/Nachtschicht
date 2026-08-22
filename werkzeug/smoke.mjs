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

/* ---- 6. Level 3 - Der Nachtbus ----
   Die Fahrt selbst ist die Uhr des Levels, deshalb wird hier vorgespult:
   S.phaseT hochsetzen bringt den Bus zur naechsten Haltestelle. Alles
   andere laeuft normal. */
console.log('\nLEVEL 3 - DER NACHTBUS');
{
  /* Ein frisch gestartetes Level 3, ohne Titel und Intro. */
  const starteBus = async () => {
    const [seite, meckern] = await oeffne(kontext, basis+'/level3.html?alles=1');
    await seite.evaluate(()=>{ starte(); S.modus='spiel'; starteLevel(); });
    await seite.waitForTimeout(200);
    return [seite, meckern];
  };
  /* Bis zur naechsten Haltestelle vorspulen und dort ankommen. */
  const zurHaltestelle = async seite => {
    await seite.evaluate(()=>{ S.phaseT=TUNE.fahrtZeit+0.01; });
    await seite.waitForTimeout(2400);
  };

  {
    const [seite, meckern] = await starteBus();
    pruefe(meckern.length===0, 'laedt und startet ohne Fehler'+(meckern.length?': '+meckern[0]:''));

    /* An der Stange haelt man das Bremsen aus. */
    await seite.evaluate(()=>{ S.x=STANGEN[1]; S.vx=0; });
    await seite.keyboard.down('KeyE'); await seite.waitForTimeout(150);
    pruefe(await seite.evaluate(()=>S.haelt), 'E an der Stange greift');
    await zurHaltestelle(seite);
    const fest = await seite.evaluate(()=>({liegt:S.liegt, x:Math.round(S.x), phase:S.phase}));
    await seite.keyboard.up('KeyE');
    pruefe(fest.liegt<=0, 'wer sich festhaelt, faellt beim Bremsen nicht (liegt='+fest.liegt.toFixed(2)+')');
    pruefe(Math.abs(fest.x-await seite.evaluate(()=>STANGEN[1]))<6, 'und bleibt an seiner Stange');
    pruefe(fest.phase==='haelt', 'der Bus haelt danach');
    pruefe(await seite.evaluate(()=>S.tuerAuf)>0.9, 'die Tueren sind offen');
    await seite.close();
  }
  {
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.x=300; S.phaseT=TUNE.fahrtZeit+0.01; });
    await seite.waitForTimeout(1200);
    pruefe(await seite.evaluate(()=>S.liegt)>0, 'ohne Festhalten wirft dich das Bremsen um');
    await seite.close();
  }
  {
    /* Kontrolle ohne Fahrschein: ein Herz und an der naechsten raus. */
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.halt=1; kontrolleSteigtEin();
      S.x=200; S.kontrolleure[0].x=196; S.kontrolleure[0].richtung=1; });
    await seite.waitForTimeout(1500);
    const nach = await seite.evaluate(()=>({hp:S.hp, raus:S.raus}));
    pruefe(nach.hp===2, 'Kontrolle ohne Fahrschein kostet ein Herz (hp='+nach.hp+')');
    pruefe(nach.raus, 'und du fliegst an der naechsten Haltestelle raus');
    await zurHaltestelle(seite);
    pruefe(await seite.evaluate(()=>S.draussen), 'an der Haltestelle stehst du dann draussen');
    await seite.close();
  }
  {
    /* Mit Fahrschein ist dieselbe Kontrolle harmlos. */
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.inventar.fahrschein=true; S.halt=1; kontrolleSteigtEin();
      S.x=200; S.kontrolleure[0].x=196; });
    await seite.waitForTimeout(1500);
    const nach = await seite.evaluate(()=>({hp:S.hp, raus:S.raus}));
    pruefe(nach.hp===3&&!nach.raus, 'mit Fahrschein passiert bei der Kontrolle nichts');
    await seite.close();
  }
  {
    /* Am Kontrolleur kommt man im Gang nicht vorbei - daran haengt das Level. */
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.inventar.fahrschein=true; S.halt=1; kontrolleSteigtEin();
      S.kontrolleure[0].x=180; S.kontrolleure[0].richtung=1;
      S.kontrolleure[1].x=560; S.x=300; });
    await seite.keyboard.down('KeyA'); await seite.waitForTimeout(1500); await seite.keyboard.up('KeyA');
    const d = await seite.evaluate(()=>S.x-S.kontrolleure[0].x);
    pruefe(d>0, 'du kommst an einem Kontrolleur nicht vorbei (Abstand='+d.toFixed(1)+')');
    await seite.close();
  }
  {
    /* Automat: erst zwei Euro, dann der Schein. */
    const [seite] = await starteBus();
    const r = await seite.evaluate(()=>{
      S.x=AUTOMAT_X+3; benutze(); const ohne=S.meldung;
      S.muenzen=TUNE.muenzenNoetig; benutze();
      return { ohne, schein:!!S.inventar.fahrschein, rest:S.muenzen };
    });
    pruefe(/ZWEI EURO/.test(r.ohne), 'ohne Geld gibt der Automat nichts ("'+r.ohne+'")');
    pruefe(r.schein&&r.rest===0, 'mit Geld kommt der Fahrschein und das Geld ist weg');
    await seite.close();
  }
  {
    /* Kleingeld liegt wirklich in Sitzen und laesst sich finden. */
    const [seite] = await starteBus();
    const r = await seite.evaluate(async ()=>{
      const gefunden=[];
      for(const sx of S.geldBei){ S.x=sx+3; benutze(); S.suchT=0; suchErgebnis(); gefunden.push(S.muenzen); }
      return { versteckt:S.geldBei.length, muenzen:S.muenzen };
    });
    pruefe(r.versteckt===2&&r.muenzen===2, 'zwei Muenzen liegen in Sitzen und werden gefunden');
    await seite.close();
  }
  {
    /* Wer beim Losfahren draussen steht, guckt dem Bus hinterher. */
    const [seite] = await starteBus();
    await zurHaltestelle(seite);
    await seite.evaluate(()=>{ S.x=TUEREN[1].x; steigeUm(true); });
    await seite.waitForTimeout(420);
    pruefe(await seite.evaluate(()=>S.draussen&&S.y===BODEN_A), 'durch die offene Tuer kommt man raus');
    await seite.evaluate(()=>{ S.phaseT=TUNE.haltZeit+0.01; });
    await seite.waitForTimeout(500);
    const r = await seite.evaluate(()=>({modus:S.modus, gewonnen:S.gewonnen, faenger:S.faenger}));
    pruefe(r.modus==='ende'&&!r.gewonnen&&/OHNE DICH/.test(r.faenger),
      'wer draussen bleibt, verliert ("'+r.faenger+'")');
    await seite.close();
  }
  {
    /* Am Club drinnen sitzen bleiben ist auch verloren. */
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.halt=HALTE.length-1; });
    await zurHaltestelle(seite);
    await seite.evaluate(()=>{ S.phaseT=TUNE.haltZeit+0.01; });
    await seite.waitForTimeout(500);
    const r = await seite.evaluate(()=>({modus:S.modus, gewonnen:S.gewonnen, faenger:S.faenger}));
    pruefe(r.modus==='ende'&&!r.gewonnen&&/LETZTE HALTESTELLE/.test(r.faenger),
      'am Club sitzen bleiben heisst vorbeigefahren');
    await seite.close();
  }
  {
    /* Und der richtige Weg: am Club aussteigen. */
    const [seite, meckern] = await starteBus();
    await seite.evaluate(()=>{ S.halt=HALTE.length-1; });
    await zurHaltestelle(seite);
    await seite.evaluate(()=>{ S.x=TUEREN[1].x; steigeUm(true); });
    await seite.waitForTimeout(420);
    await seite.evaluate(()=>{ S.phaseT=TUNE.haltZeit+0.01; });
    await seite.waitForTimeout(500);
    pruefe(await seite.evaluate(()=>S.modus)==='cutscene', 'am Club aussteigen gewinnt das Level');
    /* Cutscene ueberspringen und das Endbild pruefen */
    await seite.evaluate(()=>{ S.szene=SZENEN.length-1; S.szeneT=99; });
    await seite.waitForTimeout(400);
    const r = await seite.evaluate(()=>({modus:S.modus, gewonnen:S.gewonnen,
      best:NACHT.best(3), stand:NACHT.stand()}));
    pruefe(r.modus==='ende'&&r.gewonnen, 'und fuehrt ins Endbild');
    pruefe(r.best!==null, 'die Bestzeit fuer Level 3 steht im Spielstand');
    pruefe(r.stand.frei>=4, 'Level 4 ist danach freigeschaltet (frei='+r.stand.frei+')');
    pruefe(meckern.length===0, 'die ganze Fahrt ohne Fehler'+(meckern.length?': '+meckern[0]:''));
    await seite.close();
  }
  {
    /* Moritz steigt an der dritten aus und muss zurueckgeholt werden. */
    const [seite] = await starteBus();
    await seite.evaluate(()=>{ S.halt=2; });
    await zurHaltestelle(seite);
    pruefe(await seite.evaluate(()=>S.moritzDraussen), 'Moritz steht an der dritten Haltestelle draussen');
    await seite.evaluate(()=>{ S.x=TUEREN[1].x; steigeUm(true); });
    await seite.waitForTimeout(420);
    await seite.evaluate(()=>{ S.x=S.moritzX; benutze(); });
    await seite.waitForTimeout(200);
    pruefe(await seite.evaluate(()=>!S.moritzDraussen&&!!S.erledigt.moritz), 'und laesst sich zurueckholen');
    await seite.close();
  }
  {
    /* Der Pegel aus Level 2 kommt an - gedeckelt. */
    const [seite] = await oeffne(kontext, basis+'/level3.html?alles=1');
    const r = await seite.evaluate(()=>{
      NACHT.merkePegel(100); neuesSpiel(); const voll=S.pegel;
      NACHT.merkePegel(0);   neuesSpiel(); const leer=S.pegel;
      return { voll, leer, kappe:TUNE.pegelKappe };
    });
    pruefe(r.voll>0&&r.voll<=r.kappe, 'der Pegel aus Level 2 kommt gedeckelt an ('+r.voll+')');
    pruefe(r.leer===0, 'wer nuechtern rauskam, faengt nuechtern an');
    await seite.close();
  }
}

} finally {
  await browser.close();
  srv.close();
}

console.log('\n'+(fehler.length ? fehler.length+' FEHLER' : 'alles gruen'));
process.exit(fehler.length?1:0);
