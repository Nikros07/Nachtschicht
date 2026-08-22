/* ============================================================================
   NACHTSCHICHT - BILDVERGLEICH

   Macht von jedem Level immer dieselben Bilder: Titel, Intro, Spiel, Endbild.
   Damit zweimal dasselbe rauskommt, wird vorher alles Zufaellige festgenagelt
   (Math.random, die Spielzeit, die Schleife).

     node werkzeug/bilder.mjs vorher     - Bilder anlegen
     node werkzeug/bilder.mjs nachher    - neue Bilder anlegen und vergleichen

   Gedacht fuer Umbauten, bei denen sich am Bild NICHTS aendern darf. Die
   Rauchprobe sieht Fehler, dieses Skript sieht Verschiebungen.
   ========================================================================== */
import { createServer } from 'node:http';
import { readFile, mkdir, readdir, stat } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

async function ladePlaywright(){
  try{ return await import('playwright'); }catch(e){}
  const orte=[];
  try{ orte.push(execSync('npm root -g',{encoding:'utf-8'}).trim()); }catch(e){}
  orte.push(join(dirname(process.execPath),'..','lib','node_modules'));
  const req=createRequire(import.meta.url);
  for(const ort of orte){
    try{ return await import(pathToFileURL(req.resolve('playwright',{paths:[ort]})).href); }catch(e){}
  }
  console.error('Playwright nicht gefunden.'); process.exit(2);
}
const pw = await ladePlaywright();
const chromium = pw.chromium || (pw.default && pw.default.chromium);

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const runde = process.argv[2]==='nachher' ? 'nachher' : 'vorher';
const ZIEL = join(WURZEL,'werkzeug','bilder',runde);
await mkdir(ZIEL,{recursive:true});

function server(){
  return new Promise(fertig=>{
    const s=createServer(async (req,res)=>{
      const pfad=join(WURZEL,normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/,''));
      try{ const d=await readFile(pfad);
        res.writeHead(200,{'content-type':extname(pfad)==='.js'?'text/javascript':'text/html; charset=utf-8'});
        res.end(d);
      }catch(e){ res.writeHead(404); res.end('weg'); }
    });
    s.listen(0,'127.0.0.1',()=>fertig([s,'http://127.0.0.1:'+s.address().port]));
  });
}

/* Alles festnageln, was sich von allein bewegt: den Zufall, die Schleife und
   damit auch die Spielzeit. Gezeichnet wird nur noch, wenn dieses Skript es
   sagt - sonst haengt das Bild davon ab, wann der Schnappschuss faellt. */
const EINFRIEREN = `
  Math.random=()=>0.42;
  window.requestAnimationFrame=()=>0;
`;

/* Welche Bilder von welchem Level. Jede Lage setzt den Zustand direkt -
   gespielt wird hier nicht, es geht nur ums Aussehen. */
const LAGEN = {
  'index.html': [
    ['titel',  ()=>{ S.modus='titel'; S.t=3; }],
    ['intro',  ()=>{ starte(); S.modus='intro'; S.szene=2; S.szeneT=1; S.t=3; }],
    ['spiel',  ()=>{ starte(); S.modus='spiel'; S.t=3; S.x=300; S.etage=0;
                     S.kamX=S.x-W/2; S.kamY=0; S.hinweisT=0; S.meldungT=0; }],
    ['ende',   ()=>{ starte(); S.modus='ende'; S.gewonnen=true; S.zeit=61.5; S.t=3;
                     S.durchsucht=new Set([1,2,3]); }],
  ],
  'level2.html': [
    ['titel',  ()=>{ S.modus='titel'; S.t=3; }],
    ['intro',  ()=>{ starte(); S.modus='intro'; S.szene=2; S.szeneT=1; S.t=3; }],
    ['spiel',  ()=>{ starte(); S.modus='spiel'; S.t=3; S.x=300; S.pegel=40;
                     S.kamX=Math.max(0,S.x-W/2); S.hinweisT=0; S.meldungT=0; }],
    ['kampf',  ()=>{ starte(); S.modus='spiel'; starteKampf(); S.t=3;
                     const g=S.gegner; g.zustand='wind'; g.muster='schnell';
                     g.dauer=MUSTER.schnell.dauer(); g.t=g.dauer*0.8;
                     S.hinweisT=0; S.meldungT=0; }],
    ['ende',   ()=>{ starte(); S.modus='ende'; S.gewonnen=true; S.zeit=88; S.t=3; }],
  ],
  'level3.html': [
    ['titel',  ()=>{ S.modus='titel'; S.t=3; }],
    ['intro',  ()=>{ starte(); S.modus='intro'; S.szene=2; S.szeneT=1; S.t=3; }],
    ['spiel',  ()=>{ starte(); S.modus='spiel'; S.t=3; S.x=300; S.kamX=180;
                     S.busTempo=1; S.strecke=400; S.hinweisT=0; S.meldungT=0; }],
    ['halt',   ()=>{ starte(); S.modus='spiel'; S.t=3; S.halt=3; S.phase='haelt';
                     S.phaseT=2; S.tuerAuf=1; S.x=TUEREN[1].x; S.kamX=Math.max(0,S.x-W/2);
                     S.busTempo=0; S.hinweisT=0; S.meldungT=0; }],
    ['kontrolle',()=>{ starte(); S.modus='spiel'; S.t=3; S.halt=2; kontrolleSteigtEin();
                     S.kontrolleure[0].x=260; S.kontrolleure[1].x=420;
                     S.x=340; S.kamX=180; S.hinweisT=0; S.meldungT=0; }],
    ['ende',   ()=>{ starte(); S.modus='ende'; S.gewonnen=true; S.zeit=126; S.t=3; }],
  ],
};

const [srv,basis]=await server();
const browser=await chromium.launch();
const kontext=await browser.newContext({viewport:{width:1000,height:700},deviceScaleFactor:1});
try{
  for(const [datei,lagen] of Object.entries(LAGEN)){
    for(const [name,aufbau] of lagen){
      const seite=await kontext.newPage();
      await seite.addInitScript(EINFRIEREN);
      await seite.goto(basis+'/'+datei+'?alles=1&reset=1',{waitUntil:'load'});
      await seite.waitForTimeout(250);
      /* Der Aufbau laeuft, waehrend update() tot ist - danach einmal zeichnen. */
      await seite.evaluate('('+aufbau.toString()+')()');
      await seite.evaluate(()=>{ draw(0); });
      await seite.waitForTimeout(60);
      await seite.locator('#screen').screenshot({
        path: join(ZIEL, datei.replace('.html','')+'-'+name+'.png') });
      await seite.close();
    }
  }
} finally { await browser.close(); srv.close(); }

console.log('Bilder in werkzeug/bilder/'+runde);

/* Vergleichen, wenn es eine Vorher-Runde gibt. */
if(runde==='nachher'){
  const vorher=join(WURZEL,'werkzeug','bilder','vorher');
  let gleich=0, anders=[];
  for(const f of await readdir(ZIEL)){
    try{
      const [a,b]=await Promise.all([readFile(join(vorher,f)),readFile(join(ZIEL,f))]);
      if(a.equals(b)) gleich++;
      else anders.push(f+' ('+a.length+' -> '+b.length+' bytes)');
    }catch(e){ anders.push(f+' (kein Vorher-Bild)'); }
  }
  console.log('\ngleich: '+gleich);
  if(anders.length){ console.log('ANDERS:'); anders.forEach(a=>console.log('  '+a)); }
  else console.log('kein Bild hat sich veraendert.');
  process.exit(anders.length?1:0);
}
