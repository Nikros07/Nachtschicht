/* Prueft die Werkzeuge fuers Starten an kleinen Beispielprojekten, ohne Browser und ohne Netz:
     tools/launchcheck.js   findet es kaputte Symbole, falsche Gross-/Kleinschreibung, fremde Adressen,
                            Luecken im Offline-Speicher, uneinheitliche Versionen? Und bleibt es ruhig,
                            wenn alles stimmt (oder nur ein Kommentar nach "http" aussieht)?
     tools/umbenennen.py    ersetzt ganze Woerter, laesst Flag-Namen in Ruhe, schreibt auf dem Bild
                            keine Umlaute und macht sich mit --zurueck wieder rueckgaengig?

   Aufruf:  node test/launch.test.js        (aus dem Projektordner oder von ueberall)
   Jeder Fall baut sich ein frisches Mini-Projekt im Temp-Ordner - das echte Projekt wird nie angefasst.
   Die Umbenennen-Faelle brauchen Python; fehlt es, werden sie uebersprungen (und das gemeldet). */
'use strict';
const fs=require('fs'), os=require('os'), path=require('path'), cp=require('child_process'), zlib=require('zlib');

const WURZEL=path.resolve(__dirname,'..');
const CHECK=path.join(WURZEL,'tools','launchcheck.js');
const UMBENENNEN=path.join(WURZEL,'tools','umbenennen.py');

let ok=0, fail=0, uebersprungen=0;
const pruefe=(name,bed,info)=>{ if(bed){ ok++; console.log('  OK   '+name); } else { fail++; console.log('  FEHL '+name+(info?'   -> '+info:'')); } };
const tmpDirs=[];
process.on('exit',()=>{ for(const d of tmpDirs){ try{ fs.rmSync(d,{recursive:true,force:true}); }catch(e){} } });

/* ---------------------------------------------------------------- Mini-Projekt */
const crcTabelle=(()=>{ const t=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
const crc32=buf=>{ let c=0xFFFFFFFF; for(const b of buf) c=crcTabelle[(c^b)&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
function png(w,h){
  const chunk=(typ,daten)=>{ const l=Buffer.alloc(4); l.writeUInt32BE(daten.length); const t=Buffer.from(typ,'latin1');
    const c=Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t,daten]))); return Buffer.concat([l,t,daten,c]); };
  const kopf=Buffer.alloc(13); kopf.writeUInt32BE(w,0); kopf.writeUInt32BE(h,4); kopf[8]=8; kopf[9]=0;   // 8 Bit, Graustufen
  const zeilen=Buffer.alloc((w+1)*h);                                                                   // Filter 0, schwarz
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',kopf),chunk('IDAT',zlib.deflateSync(zeilen)),chunk('IEND',Buffer.alloc(0))]);
}

const SPIELSEITEN=['index.html','level2.html','level3.html','level4.html','level5.html','level6.html','level7.html','level8.html','karte.html'];
const BUILD='202610031200';
const kopfZeilen=(titel,extra)=>'<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n'
  +'<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>'+titel+'</title>\n'
  +'<meta name="description" content="Beschreibung '+titel+'">\n<meta name="theme-color" content="#04030a">\n'
  +'<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icons/icon.svg" type="image/svg+xml">\n'
  +'<link rel="icon" href="icons/favicon-32.png" sizes="32x32" type="image/png">\n'
  +'<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'+(extra||'')+'</head>\n<body>\n';
const spielSeite=(name,extra)=>kopfZeilen(name,'<link rel="stylesheet" href="nacht/stil.css?v='+BUILD+'">\n'+(extra||''))
  +'<canvas id="c"></canvas>\n<script src="nacht/kern.js?v='+BUILD+'"></script>\n<script src="nacht/geraet.js?v='+BUILD+'"></script>\n</body>\n</html>\n';
const OG='<meta property="og:title" content="T">\n<meta property="og:description" content="D">\n'
  +'<meta property="og:image" content="https://nikros07.github.io/Nachtschicht/icons/og.png">\n'
  +'<meta property="og:image:alt" content="Beschreibung des Bildes">\n'
  +'<meta property="og:url" content="https://nikros07.github.io/Nachtschicht/">\n'
  +'<link rel="canonical" href="https://nikros07.github.io/Nachtschicht/">\n';
const swText=(build,liste)=>"const BUILD='"+build+"';\nconst INHALT='abc';\n// PRECACHE-START\nconst PRECACHE=[\n"
  +liste.map(f=>"  '"+f+"',").join('\n')+"\n];\n// PRECACHE-ENDE\n"
  +"self.addEventListener('install',e=>{ e.waitUntil(Promise.resolve()); });\n"
  +"self.addEventListener('fetch',e=>{ e.respondWith(caches.match(e.request,{ignoreSearch:true})); });\n";

function projekt(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nachtschicht-launch-')); tmpDirs.push(dir);
  const d={};
  for(const s of SPIELSEITEN) d[s]=spielSeite(s,s==='index.html'?OG:'');
  d['index.html']=d['index.html'].replace('<canvas id="c"></canvas>','<canvas id="c"></canvas>\n<a href="ueber.html">Ueber</a>');
  d['runner.html']=spielSeite('runner.html');
  d['ueber.html']=kopfZeilen('Ueber','')+'<section id="datenschutz"><p>Text</p></section>\n</body>\n</html>\n';
  d['404.html']='<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    +'<title>404</title>\n<meta name="description" content="Gibt es nicht">\n<meta name="theme-color" content="#04030a">\n</head>\n<body>\n<a href="/Nachtschicht/">Zurueck</a>\n</body>\n</html>\n';
  d['nacht/kern.js']="const KERN=1;\n";
  d['nacht/geraet.js']='const GERAET={};\nGERAET.version="1.0.0";\nGERAET.build="'+BUILD+'";\n';
  d['nacht/stil.css']='body{background:#04030a}\n';
  d['icons/icon-192.png']=png(192,192); d['icons/icon-512.png']=png(512,512); d['icons/icon-maskable-512.png']=png(512,512);
  d['icons/apple-touch-icon.png']=png(180,180); d['icons/favicon-32.png']=png(32,32); d['icons/og.png']=png(120,63);
  d['icons/icon.svg']='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"></svg>\n';
  d['manifest.webmanifest']=JSON.stringify({name:'NACHTSCHICHT',short_name:'Nachtschicht',start_url:'./index.html?app=1',scope:'./',id:'./',
    display:'fullscreen',background_color:'#04030a',theme_color:'#04030a',icons:[
      {src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
      {src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
      {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
      {src:'icons/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},null,2);
  d['robots.txt']='User-agent: *\nAllow: /\n';
  d['CHANGELOG.md']='# Aenderungen\n\n## 1.0.0 - 2026-10-03\n\n- Anfang.\n';
  const vorgeladen=Object.keys(d).filter(f=>/\.(html|js|css|webmanifest)$/.test(f)&&f!=='404.html').concat(['icons/apple-touch-icon.png','icons/favicon-32.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/icon.svg','icons/og.png']).sort();
  d['sw.js']=swText(BUILD,vorgeladen);
  for(const [f,inh] of Object.entries(d)){ const p=path.join(dir,f); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,inh); }
  return dir;
}
const lesen=(dir,f)=>fs.readFileSync(path.join(dir,f),'utf8');
const schreiben=(dir,f,inh)=>fs.writeFileSync(path.join(dir,f),inh);
function ersetzen(dir,f,alt,neu){ const t=lesen(dir,f); if(!t.includes(alt)) throw new Error('Testaufbau: "'+alt+'" steht nicht in '+f); schreiben(dir,f,t.replace(alt,neu)); }
function check(dir,extra){
  const r=cp.spawnSync(process.execPath,[CHECK,'--wurzel='+dir].concat(extra||[]),{encoding:'utf8'});
  return {code:r.status,out:(r.stdout||'')+(r.stderr||'')};
}
/* Ein Fall: Projekt bauen, veraendern, pruefen lassen. erwartet: {code, enthaelt:[...], enthaeltNicht:[...]} */
function fall(name,aendern,erwartet){
  let dir; try{ dir=projekt(); if(aendern) aendern(dir); }catch(e){ pruefe(name,false,'Testaufbau: '+e.message); return; }
  const r=check(dir);
  const fehlt=(erwartet.enthaelt||[]).filter(t=>!r.out.includes(t));
  const zuviel=(erwartet.enthaeltNicht||[]).filter(t=>r.out.includes(t));
  pruefe(name,r.code===erwartet.code&&!fehlt.length&&!zuviel.length,
    'Exit '+r.code+' (erwartet '+erwartet.code+')'+(fehlt.length?'; fehlt in der Ausgabe: '+fehlt.join(' | '):'')+(zuviel.length?'; unerwartet: '+zuviel.join(' | '):'')
    +((r.code!==erwartet.code||fehlt.length||zuviel.length)?'\n'+r.out.split('\n').filter(l=>/FEHLER|WARNUNG/.test(l)).slice(0,6).join('\n'):''));
}

/* ====================================================================== launchcheck */
console.log('\n--- launchcheck: ein sauberes Projekt ---');
fall('sauberes Mini-Projekt: bereit, keine harten Fehler',null,{code:0,enthaelt:['ERGEBNIS: BEREIT - 0 harte Fehler'],enthaeltNicht:['FEHLER    ']});

console.log('\n--- launchcheck: Kopfzeilen und Dateien ---');
fall('lang="de" fehlt -> harter Fehler',d=>ersetzen(d,'level3.html','<html lang="de">','<html>'),{code:1,enthaelt:['level3.html: Kopfzeile fehlt: <html lang="de">','NICHT BEREIT']});
fall('theme-color fehlt -> harter Fehler',d=>ersetzen(d,'level4.html','<meta name="theme-color" content="#04030a">\n',''),{code:1,enthaelt:['level4.html: Kopfzeile fehlt: meta theme-color']});
fall('sw.js fehlt -> Fehler statt Absturz',d=>fs.rmSync(path.join(d,'sw.js')),{code:1,enthaelt:['sw.js: fehlt'],enthaeltNicht:['abgestuerzt']});
fall('ueber.html und 404.html fehlen -> Fehler statt Absturz',d=>{ fs.rmSync(path.join(d,'ueber.html')); fs.rmSync(path.join(d,'404.html')); },
  {code:1,enthaelt:['ueber.html: fehlt','404.html: fehlt'],enthaeltNicht:['abgestuerzt']});
fall('404.html darf einen absoluten Ersatzpfad und keine Symbole haben',null,{code:0,enthaelt:['404.html:']});
fall('Gross-/Kleinschreibung eines Verweises -> harter Fehler',d=>ersetzen(d,'level2.html','href="icons/favicon-32.png"','href="Icons/favicon-32.png"'),
  {code:1,enthaelt:['Gross-/Kleinschreibung stimmt nicht, die Datei heisst icons/favicon-32.png']});
fall('absoluter Pfad in einer Seite -> harter Fehler',d=>ersetzen(d,'level5.html','href="nacht/stil.css?v='+BUILD+'"','href="/nacht/stil.css?v='+BUILD+'"'),
  {code:1,enthaelt:['absoluter Pfad bricht unter /Nachtschicht/']});
fall('Verweis auf fehlende Seite -> harter Fehler',d=>ersetzen(d,'index.html','<a href="ueber.html">','<a href="fehlt.html">'),{code:1,enthaelt:['fehlt.html: Datei fehlt']});
fall('toter Anker -> nur Warnung',d=>ersetzen(d,'index.html','<a href="ueber.html">','<a href="ueber.html#gibtsnicht">'),{code:0,enthaelt:['Anker #gibtsnicht']});
fall('og:image zeigt auf fehlende Datei -> harter Fehler',d=>fs.rmSync(path.join(d,'icons','og.png')),{code:1,enthaelt:['icons/og.png: Datei fehlt']});
fall('og:image:alt wird nicht als Adresse gelesen',null,{code:0,enthaeltNicht:['og:image:alt ist keine absolute Adresse']});

console.log('\n--- launchcheck: Manifest und Symbole ---');
fall('Symbol fehlt -> harter Fehler',d=>fs.rmSync(path.join(d,'icons','icon-512.png')),{code:1,enthaelt:['icons/icon-512.png: Datei fehlt']});
fall('Symbol hat die falsche Groesse -> harter Fehler',d=>schreiben(d,'icons/icon-192.png',png(100,100)),{code:1,enthaelt:['ist 100x100, das Manifest sagt 192x192']});
fall('kein maskable-Symbol -> harter Fehler',d=>ersetzen(d,'manifest.webmanifest','"purpose": "maskable"','"purpose": "any"'),{code:1,enthaelt:['kein Symbol mit purpose "maskable"']});
fall('kaputtes JSON im Manifest -> harter Fehler',d=>schreiben(d,'manifest.webmanifest','{ nicht json'),{code:1,enthaelt:['kein gueltiges JSON']});
fall('start_url fest verdrahtet -> harter Fehler',d=>ersetzen(d,'manifest.webmanifest','./index.html?app=1','https://nikros07.github.io/Nachtschicht/'),{code:1,enthaelt:['start_url zeigt auf eine feste Adresse']});

console.log('\n--- launchcheck: Service Worker ---');
fall('Seite laedt Skript, das der Vorladeliste fehlt -> harter Fehler',d=>ersetzen(d,'sw.js',"  'nacht/kern.js',\n",''),{code:1,enthaelt:['deckt nicht ab: nacht/kern.js']});
fall('Vorladeliste nennt eine Datei, die es nicht gibt -> harter Fehler',d=>ersetzen(d,'sw.js',"  'nacht/kern.js',\n","  'nacht/kern.js',\n  'nacht/gibtsnicht.js',\n"),{code:1,enthaelt:['nacht/gibtsnicht.js']});
fall('leere Vorladeliste -> harter Fehler',d=>schreiben(d,'sw.js',swText(BUILD,[])),{code:1,enthaelt:['PRECACHE ist leer']});
fall('Spielseite fehlt in der Vorladeliste -> harter Fehler',d=>ersetzen(d,'sw.js',"  'level7.html',\n",''),{code:1,enthaelt:['deckt nicht ab: level7.html']});
fall('Symbol fehlt in der Vorladeliste -> nur Warnung',d=>ersetzen(d,'sw.js',"  'icons/icon.svg',\n",''),{code:0,enthaelt:['deckt nicht ab: icons/icon.svg']});

console.log('\n--- launchcheck: Versionen ---');
fall('?v= auf einer Seite weicht ab -> harter Fehler',d=>ersetzen(d,'level5.html','nacht/kern.js?v='+BUILD,'nacht/kern.js?v=202601010000'),{code:1,enthaelt:['?v= der Skript-Tags ist nicht ueberall gleich']});
fall('Skript-Tag ohne ?v= -> harter Fehler',d=>ersetzen(d,'level6.html','nacht/geraet.js?v='+BUILD,'nacht/geraet.js'),{code:1,enthaelt:['ohne ?v=Nummer']});
fall('noch nicht gestempelt (STAND) -> harter Fehler',d=>ersetzen(d,'sw.js',"const BUILD='"+BUILD+"'","const BUILD='STAND'"),{code:1,enthaelt:['noch nicht gestempelt']});
fall('Build in geraet.js weicht von sw.js ab -> harter Fehler',d=>ersetzen(d,'nacht/geraet.js','GERAET.build="'+BUILD+'"','GERAET.build="202601010000"'),{code:1,enthaelt:['Build-Stempel nicht einheitlich']});
fall('Spielversion in CHANGELOG weicht ab -> harter Fehler',d=>ersetzen(d,'CHANGELOG.md','## 1.0.0','## 1.0.1'),{code:1,enthaelt:['Spielversion nicht einheitlich: geraet.js 1.0.0, CHANGELOG.md 1.0.1']});
fall('Version in geraet.js fehlt -> harter Fehler',d=>ersetzen(d,'nacht/geraet.js','GERAET.version="1.0.0";\n',''),{code:1,enthaelt:['keine Spielversion gefunden']});

console.log('\n--- launchcheck: fremde Adressen ---');
fall('fremdes Skript in einer Seite -> harter Fehler',d=>ersetzen(d,'level3.html','</body>','<script src="https://cdn.example.com/x.js"></script>\n</body>'),
  {code:1,enthaelt:['https://cdn.example.com/x.js','fremden Servern']});
fall('Adresse nur in einem Kommentar -> in Ordnung',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"// siehe https://example.org/doku\n/* oder https://example.org/mehr */\n"),{code:0});
fall('Adresse in einer Zeichenkette -> harter Fehler',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const u='https://tracker.example.com/p';\n"),{code:1,enthaelt:['tracker.example.com']});
fall('Regex-Literal mit Anfuehrungszeichen verwirrt den Zerleger nicht',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const r=/['\"]/g; // http://example.com\nconst s='ok';\n"),{code:0});
fall('GitHub-Link in einer Zeichenkette ist erlaubt',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const MELDEN='https://github.com/Nikros07/Nachtschicht/issues/new';\n"),{code:0});
fall('GitHub-Adresse in einem Ladeaufruf -> harter Fehler',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"fetch('https://github.com/Nikros07/x.json');\n"),{code:1,enthaelt:['nicht in einem Ladeaufruf']});
fall('XML-Namensraum ist erlaubt',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const NS='http://www.w3.org/2000/svg';\n"),{code:0});
fall('Google Fonts im Stil -> harter Fehler',d=>fs.appendFileSync(path.join(d,'nacht','stil.css'),"@import url('https://fonts.googleapis.com/css?family=Foo');\n"),{code:1,enthaelt:['fonts.googleapis.com']});

console.log('\n--- launchcheck: Reste, Platzhalter, Groessen ---');
fall('[NAME]-Platzhalter in ueber.html -> nur Warnung mit Hinweis',d=>ersetzen(d,'ueber.html','<p>Text</p>','<p>[NAME], [E-MAIL]</p>'),{code:0,enthaelt:['Platzhalter [NAME] im Text - vor dem Launch ausfuellen','Platzhalter [E-MAIL]']});
fall('TODO im Spieltext -> nur Warnung',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const T='TODO: Text schreiben';\n"),{code:0,enthaelt:['"TODO" in einem Spieltext']});
fall('TODO in einem Kommentar -> keine Warnung',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"// TODO spaeter\n"),{code:0,enthaeltNicht:['" in einem Spieltext']});
fall('console.log in nacht/*.js -> nur Warnung',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"console.log('x');\n"),{code:0,enthaelt:['Debug-Rest console.log(']});
fall('Syntaxfehler in nacht/*.js -> harter Fehler',d=>fs.appendFileSync(path.join(d,'nacht','kern.js'),"const = ;\n"),{code:1,enthaelt:['Syntaxfehler']});
fall('Seite ueber 3 MB -> harter Fehler',d=>fs.appendFileSync(path.join(d,'runner.html'),'<!-- '+'x'.repeat(3*1024*1024+10)+' -->\n'),{code:1,enthaelt:['runner.html:','mehr als 3 MB']});
fall('ueber.html ohne Verlinkung -> Warnung',d=>ersetzen(d,'index.html','<a href="ueber.html">Ueber</a>',''),{code:0,enthaelt:['ueber.html (Impressum/Namensangabe) wird weder']});

console.log('\n--- launchcheck: Git ---');
{
  const git=cp.spawnSync('git',['--version'],{encoding:'utf8'});
  if(git.status!==0){ uebersprungen++; console.log('  --   Git nicht gefunden: .gitignore-Fall uebersprungen'); }
  else{
    const dir=projekt();
    cp.spawnSync('git',['init','-q'],{cwd:dir});
    schreiben(dir,'.gitignore','*.png\n!icons/*.png\n');
    fs.writeFileSync(path.join(dir,'nacht','bild.png'),png(8,8));
    ersetzen(dir,'level2.html','<canvas id="c"></canvas>','<canvas id="c"></canvas>\n<img src="nacht/bild.png" alt="x">');
    const r=check(dir);
    pruefe('Bild, das .gitignore verschluckt -> harter Fehler',r.code===1&&r.out.includes('nacht/bild.png: wird verlinkt, steht aber in .gitignore'),r.out.split('\n').filter(l=>/FEHLER/.test(l)).join(' | '));
    const sauber=projekt(); cp.spawnSync('git',['init','-q'],{cwd:sauber}); schreiben(sauber,'.gitignore','*.png\n!icons/*.png\n');
    const r2=check(sauber);
    pruefe('icons/*.png sind von .gitignore ausgenommen -> kein Fehler',r2.code===0,r2.out.split('\n').filter(l=>/FEHLER/.test(l)).join(' | '));
  }
}

/* ====================================================================== umbenennen.py */
console.log('\n--- umbenennen.py ---');
function python(){
  for(const py of ['python','python3','py']){ const r=cp.spawnSync(py,['--version'],{encoding:'utf8'}); if(r.status===0) return py; }
  return null;
}
const PY=python();
function umbenennenProjekt(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nachtschicht-umb-')); tmpDirs.push(dir);
  fs.mkdirSync(path.join(dir,'tools')); fs.mkdirSync(path.join(dir,'nacht'));
  fs.copyFileSync(UMBENENNEN,path.join(dir,'tools','umbenennen.py'));
  /* CRLF wie im echten Projekt: es muss beim Zurueckholen Byte fuer Byte wiederkommen */
  const html=['<!doctype html>','<title>BEI JONAS</title>',
    '<p>JONAS und Jonas\' Hund, FINNS Jacke. jonasDabei und traumJonas bleiben, JONAS_X auch.</p>',
    '<p title="Bei Jonas">MAX&nbsp;FERDI und Max Ferdi</p>',
    '<a href="jonas.html#jonas">x</a>',
    '<script>',
    "const FIG={jonas:{x:1}}; const a={id:'jonas', name:'JONAS'}; /* JONAS im Kommentar */",
    "const t='DU:\\nJONAS'; flag('jonasDabei'); const url='jonas.png'; const m=['JONAS',3];",
    "const k=FIG.jonas, W=Math.max(1,2); const g='MAX FERDIS HANDY';",
    '</script>',''].join('\r\n');
  fs.writeFileSync(path.join(dir,'index.html'),html);
  fs.writeFileSync(path.join(dir,'nacht','handy.js'),"const N={crew:'JONAS',zeile:'ey jonas komm'};\r\n");
  fs.writeFileSync(path.join(dir,'README.md'),'JONAS bleibt hier stehen\n');
  return dir;
}
const umb=(dir,args)=>{ const r=cp.spawnSync(PY,[path.join(dir,'tools','umbenennen.py')].concat(args),{encoding:'utf8',cwd:dir,env:Object.assign({},process.env,{PYTHONIOENCODING:'utf-8'})});
  return {code:r.status,out:(r.stdout||'')+(r.stderr||'')}; };
if(!PY){ uebersprungen+=5; console.log('  --   Python nicht gefunden: die umbenennen-Faelle werden uebersprungen'); }
else{
  {
    const dir=umbenennenProjekt(); const vorher=lesen(dir,'index.html');
    const r=umb(dir,['JONAS=BEN']);
    pruefe('Vorschau aendert nichts',r.code===0&&lesen(dir,'index.html')===vorher&&!fs.existsSync(path.join(dir,'.umbenennen-sicherung.json')),r.out.slice(0,300));
    pruefe('Vorschau nennt Treffer und Beispiele',/Treffer:\s+\d+ in 2 Dateien/.test(r.out)&&r.out.includes('Beispiele:')&&r.out.includes('Das war nur die Vorschau'),r.out.slice(0,400));
  }
  {
    const dir=umbenennenProjekt(); const vorherHtml=lesen(dir,'index.html'), vorherJs=lesen(dir,'nacht/handy.js');
    const r=umb(dir,['JONAS=BEN','MAX FERDI=MAX','FINN=TIM','--ja','--ohne-pruefung']);
    const h=lesen(dir,'index.html'), j=lesen(dir,'nacht/handy.js');
    pruefe('--ja ersetzt die drei Schreibweisen',h.includes('<title>BEI BEN</title>')&&h.includes('<p title="Bei Ben">')&&j.includes("crew:'BEN'")&&j.includes('ey ben komm'),r.out.slice(-300)+'\n'+h);
    pruefe('Genitiv-s wandert mit (FINNS -> TIMS, MAX FERDIS -> MAX\'); nach s steht schon ein Apostroph und bleibt',
      h.includes('TIMS Jacke')&&h.includes("MAX\\' HANDY")&&h.includes("Ben' Hund"),h.split('\r\n').join(' | '));
    pruefe('Flag- und Bezeichner-Namen bleiben (jonasDabei, traumJonas, JONAS_X)',h.includes('jonasDabei')&&h.includes('traumJonas')&&h.includes('JONAS_X')&&h.includes("flag('jonasDabei')"),h);
    pruefe('Schluessel wandern konsistent mit (id, Objektschluessel, FIG.jonas, mag-Liste)',
      h.includes("const FIG={ben:{x:1}}")&&h.includes("id:'ben'")&&h.includes('FIG.ben')&&h.includes("['BEN',3]")&&h.includes("name:'BEN'"),h);
    pruefe('Kommentare, Dateinamen und Adressen bleiben; vom Linkziel wandert nur der Anker',
      h.includes('/* JONAS im Kommentar */')&&h.includes("'jonas.png'")&&h.includes('href="jonas.html#ben"'),h);
    pruefe('Escape \\n vor dem Namen stoert nicht (DU:\\nJONAS)',h.includes("'DU:\\nBEN'"),h);
    pruefe('Math.max und Markdown bleiben unberuehrt',h.includes('Math.max(1,2)')&&lesen(dir,'README.md')==='JONAS bleibt hier stehen\n',h);
    pruefe('Zeilenenden (CRLF) bleiben erhalten',h.includes('\r\n')&&!/[^\r]\n/.test(h)&&j.endsWith('\r\n'));
    pruefe('Sicherung angelegt',fs.existsSync(path.join(dir,'.umbenennen-sicherung.json')));
    const z=umb(dir,['--zurueck']);
    pruefe('--zurueck stellt alles Byte fuer Byte wieder her',z.code===0&&lesen(dir,'index.html')===vorherHtml&&lesen(dir,'nacht/handy.js')===vorherJs&&!fs.existsSync(path.join(dir,'.umbenennen-sicherung.json')),z.out.slice(-300));
  }
  {
    const dir=umbenennenProjekt(); const vorher=lesen(dir,'index.html');
    const r=umb(dir,['JONAS=Jan Luca','--ja','--ohne-pruefung']);
    pruefe('Ersatz ohne gueltigen Bezeichner, wo der Name im Code steht -> Abbruch, nichts geschrieben',r.code===1&&r.out.includes('Bezeichner im Code')&&lesen(dir,'index.html')===vorher,r.out.slice(0,300));
  }
  {
    const dir=umbenennenProjekt();
    const r=umb(dir,['JONAS=Jörg','--ja','--ohne-pruefung']);
    const h=lesen(dir,'index.html'), j=lesen(dir,'nacht/handy.js');
    pruefe('Umlaut im Ersatz: im Skript AE/OE/UE, im HTML-Text bleibt er',j.includes("crew:'JOERG'")&&h.includes("name:'JOERG'")&&h.includes('<title>BEI JÖRG</title>'),h.split('\r\n')[1]+' | '+j);
  }
  {
    const dir=umbenennenProjekt();
    const r=umb(dir,['JONAS=J&rg']);
    pruefe('unerlaubtes Zeichen im Namen wird abgewiesen',r.code===1&&r.out.includes('nicht erlaubt'),r.out.slice(0,200));
  }
  {
    const dir=umbenennenProjekt();
    umb(dir,['JONAS=BEN','--ja','--ohne-pruefung']);
    fs.appendFileSync(path.join(dir,'index.html'),'<!-- spaetere Aenderung -->\r\n');
    const z=umb(dir,['--zurueck']);
    pruefe('--zurueck laesst eine seither geaenderte Datei in Ruhe (ohne --erzwingen)',z.code===1&&lesen(dir,'index.html').includes('spaetere Aenderung')&&lesen(dir,'nacht/handy.js').includes("crew:'JONAS'"),z.out.slice(0,300));
  }
}

console.log('\n============================');
console.log(ok+' bestanden, '+fail+' fehlgeschlagen'+(uebersprungen?', '+uebersprungen+' uebersprungen':''));
process.exit(fail?1:0);
