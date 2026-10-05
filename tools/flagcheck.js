/* Kreuzprueft die Entscheidungen der Nacht ueber alle Dateien.
   node tools/flagcheck.js

   Sucht Flags, die gesetzt und nie gelesen werden (die Entscheidung
   verpufft) und solche, die gelesen und nie gesetzt werden (toter Inhalt).
   Dazu Beziehungen und Gegenstaende nach demselben Muster.

   Grenzen: Namen, die zur Laufzeit zusammengesetzt werden ('schreibt_'+id),
   werden als Vorsilbe erkannt. Flags, die ueber eine Tabelle gesetzt werden,
   findet das Skript, solange die Namen als Text in der setzeFlag-Zeile stehen. */
const fs=require('fs');
const dateien=['index.html','level2.html','level3.html','level4.html','level5.html',
  'level6.html','level7.html','level8.html','karte.html','nacht/handy.js'];
const setzt={}, liest={};
const merke=(m,k,d,l)=>{ (m[k]=m[k]||[]).push(d+':'+l); };

for(const d of dateien){
  fs.readFileSync(d,'utf8').split(/\r?\n/).forEach((z,i)=>{
    const l=i+1; let m;
    /* setzeFlag(...) - alle Texte in der Klammer, ohne '@...' und ohne ,false */
    const reS=/setzeFlag\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    while((m=reS.exec(z))){
      if(/,\s*false\s*$/.test(m[1])) continue;
      for(const t of m[1].matchAll(/'([A-Za-z_][A-Za-z0-9_]*)'/g)) merke(setzt,t[1],d,l);
    }
    /* {flag:'x'} - Lesen, wenn es hinter wenn:/nichtFlag: steht, sonst Schreiben */
    for(const t of z.matchAll(/\bflag:\s*'([^']+)'/g)){
      const vor=z.slice(0,t.index);
      const lesen=Math.max(vor.lastIndexOf('wenn:'),vor.lastIndexOf('nichtFlag:'))>vor.lastIndexOf('tu:');
      merke(lesen?liest:setzt,t[1],d,l);
    }
    for(const t of z.matchAll(/(?<![a-zA-Z])flag\(\s*'([^']+)'\s*\)/g)) merke(liest,t[1],d,l);
    for(const t of z.matchAll(/nichtFlag:\s*'([^']+)'/g)) merke(liest,t[1],d,l);
  });
}

/* Vorsilben wie 'schreibt_' stehen fuer 'schreibt_mia', 'schreibt_kira' ... */
const vorsilbe=n=>n.endsWith('_');
const gesetztWie=n=>setzt[n]||Object.keys(setzt).filter(vorsilbe).filter(p=>n.startsWith(p)).map(p=>setzt[p]).flat();
const gelesenWie=n=>liest[n]||Object.keys(liest).filter(vorsilbe).filter(p=>n.startsWith(p)).map(p=>liest[p]).flat();

const alle=[...new Set([...Object.keys(setzt),...Object.keys(liest)])].sort();
/* Dynamisch gelesen ('moment'+n in erzaehl.js, 'tschuess_'+name im Epilog): Allowlist */
const ERLAUBT=/^(moment[0-9]*|tschuess_.*)$/;
const verloren=alle.filter(f=>!ERLAUBT.test(f)&&gesetztWie(f).length&&!(gelesenWie(f)||[]).length&&!vorsilbe(f));
const tot=alle.filter(f=>!ERLAUBT.test(f)&&(gelesenWie(f)||[]).length&&!gesetztWie(f).length&&!vorsilbe(f));
const wirksam=alle.length-verloren.length-tot.length-alle.filter(vorsilbe).length;

console.log('FLAGS: '+alle.length+' gesamt | wirksam '+wirksam+' | verloren '+verloren.length+' | ohne Setzer '+tot.length);
if(verloren.length){ console.log('\nGESETZT, NIE GELESEN (die Entscheidung verpufft):');
  verloren.forEach(f=>console.log('  '+f.padEnd(22)+' '+setzt[f].slice(0,2).join(' '))); }
if(tot.length){ console.log('\nGELESEN, NIE GESETZT (toter Inhalt):');
  tot.forEach(f=>console.log('  '+f.padEnd(22)+' '+liest[f].slice(0,2).join(' '))); }

/* ---- Beziehungen ---- */
const bz={s:{},l:{}};
for(const d of dateien){ const s=fs.readFileSync(d,'utf8');
  for(const m of s.matchAll(/aendereBeziehung\(\s*'([^']+)'|mag:\s*\[\s*'([^']+)'\s*,\s*[-+0-9]/g)) (bz.s[m[1]||m[2]]=bz.s[m[1]||m[2]]||new Set()).add(d);
  for(const m of s.matchAll(/(?<!aendere)beziehung\(\s*'([^']+)'|wenn:\{[^}]*mag:\s*\[\s*'([^']+)'/g)) (bz.l[m[1]||m[2]]=bz.l[m[1]||m[2]]||new Set()).add(d);
}
const bzNie=Object.keys(bz.s).filter(n=>!bz.l[n]);
console.log('\nBEZIEHUNGEN: '+Object.keys(bz.s).length+' veraendert | nie gelesen: '+(bzNie.join(', ')||'-'));

/* Mit --streng schlaegt der Lauf bei Flags ohne Setzer fehl (toter Inhalt
   ist ein echter Fehler; verlorene Entscheidungen sind eine Schwaeche). */
if(process.argv.includes('--streng')&&tot.length) process.exit(1);
