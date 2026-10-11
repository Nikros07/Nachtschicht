/* Messung C - Stadtkarte zwischen den Leveln (karte.html?nach=N).
   Aus der Projektwurzel: node docs/gameplay/messung/c-karte.js [--log]
   Je Karte zwei Laeufe: (a) direkt WEITER, (b) UMWEG nehmen und das Gespraech lesend fuehren.
   Gemessen: Zeit bis zum Seitenwechsel, Entscheidungen, Informationen, Verben,
   und ob die Folge (Sonne in Level 8: +4 je Umweg) irgendwo angezeigt wird. */
const H=require('./c-hilfe.js');
const LOG=process.argv.includes('--log');
const EXTRA=`{wahl:S.wahl, weg:+S.weg.toFixed(2), href:location.href, opt:(typeof optionen==='function')?optionen().map(o=>o.txt):[]}`;
function detektor(v,z,R){
  if(!v||!z.e||!v.e) return;
  if(z.m==='wahl'&&v.m!=='wahl') R.notiere('entscheidung','Karte: '+z.e.opt.join(' | '));
  if(z.e.href!==v.e.href) R.notiere('info','Seitenwechsel: '+z.e.href);
}
const nimm=(...wunsch)=>(w)=>{ for(const s of wunsch){ const i=w.findIndex(x=>x.toLowerCase().includes(s.toLowerCase())); if(i>=0) return i; } return 0; };
/* Je Umweg die "freundliche" Antwort, die ein Erstspieler nehmen wuerde */
const WAHL={1:nimm('Einmal alles','Nur ne Cola'),2:nimm('Lass stecken'),3:nimm('Laut mitsingen','2 Euro'),
  4:nimm('Wer bist du'),5:nimm('Eine ganze','Eins fuer mich'),6:nimm('Kopf rein'),7:nimm('Telefonzelle','Anrufen','Mir gehts')};
const aus=[];
for(let n=1;n<=7;n++){
  for(const umweg of [false,true]){
    const L=H.lade('karte.html','?nach='+n);
    const R=H.rekorder(L,{extra:EXTRA,detektor});
    R.E("setzeWert('geld',15); setzeWert('mut',45);");
    R.takt();
    const href0=R.vor.e.href;
    R.bis(z=>z.m==='wahl',10);                 // Fahrt laeuft von allein (2,6 s)
    const tWahl=R.t;
    R.sek(H.lesezeit(R.vor.e.opt.join(' '),R.vor.e.opt.length));
    if(umweg&&R.vor.e.opt.length>1){
      R.taste('KeyS','waehlen'); R.takt(); R.taste('KeyE','umweg'); R.takt(2);
      R.gespraech(WAHL[n]);
      R.bis(z=>z.m==='wahl',5); R.sek(1.6);   // "ZEIT VERGEHT" lesen
    }
    R.taste('KeyE','weiter'); R.takt(2);
    if(LOG) H.drucke(R,'Karte nach '+n+(umweg?' mit Umweg':''));
    const umwegTexte=R.log.filter(e=>/entscheidung|gespraech|meldung/.test(e.art)).map(e=>e.txt);
    aus.push({nach:n, umweg, dauerS:+R.t.toFixed(1), fahrtS:+tWahl.toFixed(1), seitenwechsel:R.vor.e.href!==href0?R.vor.e.href.replace('http://localhost/',''):'-',
      entscheidungen:R.log.filter(e=>e.art==='entscheidung').length, verben:R.verben,
      sonneErwaehnt:umwegTexte.some(t=>/SONNE|HELL|ZEIT/i.test(t)), texte:umwegTexte});
  }
}
for(const a of aus) console.log(JSON.stringify(a));
/* Statisch: Wo wird die Folge eines Umwegs angezeigt? */
const fs=require('fs'); const k=fs.readFileSync('karte.html','utf8');
console.log('\nkarte.html erwaehnt "SONNE":',/SONNE/.test(k.replace(/\/\*[\s\S]*?\*\//g,'')),
  '| Musik-Aufruf (musik()/ton()) in karte.html:',/\bmusik\(|\bton\(/.test(k));

/* Zusatz: (a) Doppeltipp beim Ankommen - sieht man den Umweg ueberhaupt?
   (b) Umweg oeffnen und ablehnen ("Nee, danke.") - kostet das trotzdem Sonne?
   (c) Wie viele Umwege sind bezahlbar, wenn man mit wenig Geld unterwegs ist? */
{
  const L=H.lade('karte.html','?nach=3'); const R=H.rekorder(L,{extra:EXTRA,detektor});
  R.takt(6); R.taste('KeyE'); R.takt(1); R.taste('KeyE'); R.takt(2);
  console.log('\n(a) Doppeltipp nach 0,1 s: Seite gewechselt =',R.vor.e.href.includes('level4'),
    '| Zeit auf der Karte', R.t.toFixed(2)+' s', '| Umweg-Option je im Bild:', R.log.some(e=>e.art==='entscheidung'));
}
for(const n of [1,3,5,7]){
  const L=H.lade('karte.html','?nach='+n); const R=H.rekorder(L,{extra:EXTRA,detektor});
  R.E("setzeWert('geld',15);"); R.takt(); R.bis(z=>z.m==='wahl',10);
  R.taste('KeyS'); R.takt(); R.taste('KeyE'); R.takt(2);
  R.gespraech(w=>w.length-1);              // letzte Antwort = ablehnen
  console.log('(b) nach='+n+' Umweg geoeffnet und abgelehnt: umweg_'+n+' gesetzt =',R.E(`flag('umweg_${n}')`),
    '| Meldung:', (R.log.filter(e=>e.art==='meldung').pop()||{}).txt);
}
