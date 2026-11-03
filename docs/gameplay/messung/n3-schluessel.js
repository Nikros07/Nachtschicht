/* n3 - Engine: welche Schluessel stehen in wenn:{}, tu:{}, probe:{} aller Seiten?
   Gueltig laut nacht/nacht.js (bedingungErfuellt/wirke) und stand.js/STAND_VORLAGE.
   Unbekannte Schluessel werden dort still geschluckt bzw. legen neue Werte an.
   node docs/gameplay/messung/n3-schluessel.js */
const fs=require('fs'), path=require('path');
const dateien=['index.html',...[2,3,4,5,6,7,8].map(i=>`level${i}.html`),'karte.html',
  ...fs.readdirSync('nacht').filter(f=>f.endsWith('.js')).map(f=>'nacht/'+f)];
const GUELTIG={
  wenn:['crew','hat','flag','nichtFlag','nichtHat','mag','mut','ruf','geld','kondition','pegel'],
  probe:['mut','ruf','geld','kondition','pegel','crew','hat','flag','nichtFlag','nichtHat','mag'],
  tu:['flag','mag','nimm','gib','crew','mut','ruf','geld','kondition','pegel'],
};
let schlecht=0;
for(const art of Object.keys(GUELTIG)){
  const zaehl={};
  for(const f of dateien){
    const s=fs.readFileSync(f,'utf8');
    for(const m of s.matchAll(new RegExp('\\b'+art+':\\s*\\{([^{}]*)\\}','g')))
      for(const k of m[1].matchAll(/(?:^|,)\s*([A-Za-z_]+)\s*:/g)){
        zaehl[k[1]]=(zaehl[k[1]]||0)+1;
        if(!GUELTIG[art].includes(k[1])){ schlecht++; console.log('UNBEKANNT',art,k[1],f); }
      }
  }
  console.log(art,JSON.stringify(zaehl));
}
console.log(schlecht?schlecht+' unbekannte Schluessel':'alle Schluessel gueltig');
