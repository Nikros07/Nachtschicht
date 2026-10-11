/* Store-Inventur: zaehlt im Spielcode, was fuer eine App-Huelle (Capacitor) und die
   Store-Pruefung wichtig ist. Liest nur, aendert nichts.
   Aufruf aus der Projektwurzel:  node docs/gameplay/messung/store-inventur.js
   Gehoert zu docs/gameplay/recherche-store.md. */
const fs=require('fs'), path=require('path');
const WURZEL=process.cwd();
const dateien=[]
  .concat(fs.readdirSync(WURZEL).filter(f=>/\.html$/.test(f)))
  .concat(fs.readdirSync(path.join(WURZEL,'nacht')).filter(f=>/\.(js|css)$/.test(f)).map(f=>'nacht/'+f));

const SUCHE={
  'localStorage (direkt)':        /localStorage/g,
  'Schluessel nachtschicht.*':    /['"]nachtschicht\.[a-zA-Z0-9_]+/g,
  'navigator.vibrate':            /navigator\.vibrate\(/g,
  'requestFullscreen':            /requestFullscreen/g,
  'screen.orientation.lock':      /orientation\.lock/g,
  'Gamepad API':                  /getGamepads|gamepadconnected/g,
  'Service Worker':               /serviceWorker/g,
  'env(safe-area-inset)':         /env\(safe-area-inset/g,
  'externe Adresse (https://)':   /https:\/\/[^\s'"<>)]+/g,
  'Platzhalter [GROSS]':          /\[(NAME|ANSCHRIFT|E-MAIL|WEITERE CREDITS)\]/g,
  'pauseTaste definiert':         /function pauseTaste/g,
  'Pegel-Bedingung im Dialog':    /wenn:\{[^}]*pegel/g,
  'Pegel-Wirkung im Dialog':      /tu:\{[^}]*pegel/g,
};

const summe={}, wo={};
for(const d of dateien){
  const t=fs.readFileSync(path.join(WURZEL,d),'utf8');
  for(const [name,re] of Object.entries(SUCHE)){
    const m=t.match(re)||[];
    if(!m.length) continue;
    summe[name]=(summe[name]||0)+m.length;
    (wo[name]=wo[name]||[]).push(d+' ('+m.length+')');
    if(name==='externe Adresse (https://)') (wo['_adressen']=wo['_adressen']||new Set()) && m.forEach(a=>wo['_adressen'].add(a));
  }
}
console.log('STORE-INVENTUR ('+dateien.length+' Dateien)\n');
for(const name of Object.keys(SUCHE)){
  console.log(String(summe[name]||0).padStart(4)+'  '+name+(wo[name]?'   -> '+wo[name].join(', '):''));
}
if(wo._adressen){ console.log('\nExterne Adressen:'); [...wo._adressen].forEach(a=>console.log('  '+a)); }
