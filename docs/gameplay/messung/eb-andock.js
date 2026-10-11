/* Entwurf B - Andockstellen und Platzbudget je Seite.
   Start aus der Projektwurzel:  node docs/gameplay/messung/eb-andock.js

   Fragt fuer jede Spielseite ab, was ein Level-Agent wissen muss, bevor er ein
   neues Kernelement in EINER Datei einbaut:
   - wie gross die Datei und ihr Level-Script sind (Platz fuer ~300-600 neue Zeilen?)
   - welche Modi es gibt (S.modus) und wie viele davon Spiel sind
   - ob die Haken existieren, an die ein Mikrospiel/ein Abschnitt-Neustart andockt:
     erzaehlTakt am Anfang von update(), druckAktion, druckSprung, mobilKontext,
     pauseTaste, neuesSpiel, starte()
   - welche Engine-Dateien geladen sind (kampf.js?) und ob der Dateiname dem
     Lademuster von tools/nachttest.js entspricht (nur Kleinbuchstaben)
   - welche Handy-Knoepfe das Level schon belegt (extras) - wie viel Platz fuer neue Verben bleibt
   Keine Spieldatei wird veraendert. */
const fs=require('fs');
const N=require('../../../tools/nachttest.js');

const SEITEN=['index.html','level2.html','level3.html','level4.html','level5.html',
  'level6.html','level7.html','level8.html','karte.html','runner.html'];

function tuneSchluessel(src){
  const i=src.indexOf('const TUNE'); if(i<0) return 0;
  let tiefe=0, start=src.indexOf('{',i), j=start;
  for(;j<src.length;j++){ const c=src[j]; if(c==='{') tiefe++; else if(c==='}'){ tiefe--; if(!tiefe) break; } }
  const block=src.slice(start+1,j).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');
  /* nur Schluessel der obersten Ebene zaehlen */
  let n=0; tiefe=0;
  for(const zeile of block.split('\n')){
    if(tiefe===0&&/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(zeile)) n++;
    for(const c of zeile){ if(c==='{'||c==='['||c==='(') tiefe++; else if(c==='}'||c===']'||c===')') tiefe--; }
  }
  return n;
}
function funktionsLaenge(src,name){
  const re=new RegExp('function\\s+'+name+'\\s*\\(');
  const m=re.exec(src); if(!m) return 0;
  let i=src.indexOf('{',m.index), tiefe=0, j=i;
  for(;j<src.length;j++){ const c=src[j]; if(c==='{') tiefe++; else if(c==='}'){ tiefe--; if(!tiefe) break; } }
  return src.slice(m.index,j).split('\n').length;
}
function ersteZeilen(src,name,n){
  const re=new RegExp('function\\s+'+name+'\\s*\\([^)]*\\)\\s*\\{');
  const m=re.exec(src); if(!m) return '';
  return src.slice(m.index+m[0].length).split('\n').slice(0,n).map(z=>z.trim()).filter(Boolean).join(' | ').slice(0,150);
}

const zeilen=[];
for(const seite of SEITEN){
  const h=fs.readFileSync(seite,'utf8');
  const skript=(h.match(/<script>([\s\S]*?)<\/script>/)||['',''])[1];
  const engine=[...h.matchAll(/<script src="nacht\/([^".?]+)\.js/g)].map(m=>m[1]);
  const modi=new Set([...skript.matchAll(/modus\s*=\s*'([a-z0-9_]+)'/g)].map(m=>m[1]));
  const passiv=['titel','intro','cutscene','ende','pause','fahrt','attract','schwarz'];
  const spielModi=[...modi].filter(m=>!passiv.includes(m));
  const haken={
    erzaehlTakt:/function update[\s\S]{0,400}erzaehlTakt/.test(skript),
    druckAktion:/function druckAktion/.test(skript),
    druckSprung:/function druckSprung/.test(skript),
    mobilKontext:/function mobilKontext/.test(skript),
    pauseTaste:/function pauseTaste/.test(skript),
    neuesSpiel:/function neuesSpiel/.test(skript),
    starte:/function starte\w*\s*\(/.test(skript),
  };
  /* Handy-Extras (zweiter Ring) - belegte Codes */
  const extras=new Set([...skript.matchAll(/code:'(Key[A-Z]|Arrow\w+|Digit\d)'/g)].map(m=>m[1]));
  let geladen=null, mk=null;
  try{
    const L=N.lade(seite,'?lektion=0');
    geladen={ levelB: L.api.ev("typeof LEVEL_B!=='undefined'?LEVEL_B:null"),
      geh: L.api.ev("typeof TUNE!=='undefined'&&TUNE.gehTempo?TUNE.gehTempo:null") };
    mk=L.api.ev("typeof mobilKontext==='function'?JSON.stringify(mobilKontext()):null");
  }catch(e){ geladen={fehler:String(e.message).slice(0,60)}; }
  zeilen.push({ seite, datei:h.split('\n').length, skript:skript.split('\n').length,
    tune:tuneSchluessel(skript), update:funktionsLaenge(skript,'update'), draw:funktionsLaenge(skript,'draw'),
    modi:[...modi].join(','), spiel:spielModi.join(','), haken, engine, extras:[...extras],
    kampf:engine.includes('kampf'), lademuster:engine.every(n=>/^[a-z]+$/.test(n)),
    geladen, mk, updateKopf:ersteZeilen(skript,'update',4) });
}

console.log('\nANDOCKSTELLEN UND PLATZBUDGET JE SEITE\n');
console.log('Seite        Datei  Skript TUNE update draw | Spielmodi                   | Haken (E=erzaehlTakt A=druckAktion S=druckSprung M=mobilKontext P=pause N=neuesSpiel St=starte)');
for(const z of zeilen){
  const h=z.haken;
  const hk=[h.erzaehlTakt?'E':'-',h.druckAktion?'A':'-',h.druckSprung?'S':'-',h.mobilKontext?'M':'-',
            h.pauseTaste?'P':'-',h.neuesSpiel?'N':'-',h.starte?'St':'-'].join(' ');
  console.log(z.seite.padEnd(12),String(z.datei).padStart(5),String(z.skript).padStart(6),
    String(z.tune).padStart(4),String(z.update).padStart(6),String(z.draw).padStart(4),'|',
    z.spiel.padEnd(27),'|',hk);
}
console.log('\nGeladen (ueber tools/nachttest.js): Breite der Welt, Gehtempo, Durchquerung in s, Handy-Kontext im Titel');
for(const z of zeilen){
  const g=z.geladen||{};
  const durch=(g.levelB&&g.geh)?(g.levelB/g.geh).toFixed(1)+' s':'-';
  console.log(z.seite.padEnd(12),'LEVEL_B',String(g.levelB).padStart(5),' geh',String(g.geh).padStart(4),
    ' durchqueren',durch.padStart(7),' kampf.js',z.kampf?'ja ':'nein','  Extras belegt:',z.extras.join(',')||'-');
}
console.log('\nKopf von update() (dort dockt mikroTakt/etappeTakt an, direkt nach erzaehlTakt):');
for(const z of zeilen) console.log(' ',z.seite.padEnd(12),z.updateKopf);
console.log('\nEngine-Dateinamen passen zum Lademuster von nachttest.js (/^[a-z]+$/):',
  zeilen.every(z=>z.lademuster)?'ja':'NEIN');
console.log('Folge fuer neue Engine-Dateien: Name nur aus Kleinbuchstaben (mikro.js, hatz.js ...),');
console.log('sonst laedt tools/nachttest.js sie nicht mit (Regex nacht/([a-z]+).js).');
