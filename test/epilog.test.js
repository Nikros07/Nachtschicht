/* Prueft nacht/epilog.js (Knoten, Stempel, Kater, Enden, Epilog-Auswahl, Abspann)
   und die Enden-Galerie-Daten aus nacht/menue.js. Ohne Browser.
   node test/epilog.test.js */
const fs=require('fs'), vm=require('vm');
const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };
const rechtecke=[];
const ctxStub=new Proxy({},{ get:(t,k)=>k in t?t[k]:(k==='fillRect'||k==='strokeRect'?(...a)=>rechtecke.push([k,...a]):()=>{}),
  set:(t,k,v)=>{ t[k]=v; return true; } });
const k={ Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
  localStorage:speicher(), W:320, H:180, IS_TOUCH:false, ctx:ctxStub, muted:false,
  performance:{now:()=>0}, window:{}, setTimeout(){}, };
vm.createContext(k);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),k);
lade('nacht/stand.js'); lade('nacht/nacht.js'); lade('nacht/texte.js'); lade('nacht/epilog.js'); lade('nacht/menue.js');
const E=c=>vm.runInContext(c,k);

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };
const frisch=()=>E("nachtZuruecksetzen(); NACHT.gesehen=[]; NACHT.knotenBest={}; NACHT.momenteBest=[];");
const sicher=c=>{ try{ E(c); return true; }catch(e){ return false; } };

console.log('\n--- Knoten und Stempel ---');
frisch();
pruefe('0 Knoten', E('knoten()')===0&&E('stempel()')==='BIS GLEICH');
E("setzeFlag('schluesselVersprochen')");
pruefe('1 Knoten', E('knoten()')===1&&E('stempel()')==='ROTER FADEN 1 VON 3');
E("setzeFlag('wirEuchAuch')");
pruefe('2 Knoten', E('knoten()')===2&&E('stempel(2)')==='ROTER FADEN 2 VON 3');
E("setzeFlag('tschuessGesagt')");
pruefe('3 Knoten', E('knoten()')===3&&E('stempel()')==='SCHICHTWECHSEL');
frisch(); E("setzeFlag('tschuessGesagt')");
pruefe('Knoten zaehlt Flags unabhaengig von der Reihenfolge', E('knoten()')===1);
pruefe('zeichneWolle: keine Ausnahme (0 bis 3 Knoten)', [0,1,2,3].every(n=>sicher('zeichneWolle('+n+',100,0)')));
rechtecke.length=0; E('zeichneWolle(3,100,0)');
pruefe('Wolle bei 3: Goldrand', rechtecke.some(r=>r[0]==='strokeRect'));

console.log('\n--- Kater ---');
frisch();
const kater=v=>{ E('setzeWert("pegel",'+v+')'); return E('katerStufe()'); };
pruefe('0 und 24: LEICHT', kater(0)==='LEICHT'&&kater(24)==='LEICHT');
pruefe('25 und 59: MITTEL', kater(25)==='MITTEL'&&kater(59)==='MITTEL');
pruefe('60 und 100: ARCHE NOAH', kater(60)==='ARCHE NOAH'&&kater(100)==='ARCHE NOAH');
pruefe('Text', E('katerText()')==='DEIN KATER AM SAMSTAG: ARCHE NOAH.');

console.log('\n--- Epilog: erste zutreffende Zeile ---');
frisch();
pruefe('Moritz neutral', E("epilogZeile('MORITZ')").startsWith('MORITZ ZIEHT UM'));
E("aendereBeziehung('MORITZ',15)");
pruefe('Moritz warm', E("epilogZeile('MORITZ')").startsWith('MORITZ: SEPTEMBER'));
E("setzeFlag('moritzGeheimnis')");
pruefe('Geheimnis schlaegt warm (erste Zeile gilt)', E("epilogZeile('MORITZ')").startsWith('MORITZ HAT ES DIR ZUERST'));
frisch(); E("aendereBeziehung('MORITZ',-12)");
pruefe('Moritz kalt (<= -5): meldet sich mittags', E("epilogZeile('MORITZ')").includes('ERST MITTAGS'));
frisch(); E("aendereBeziehung('MORITZ',-2)");
pruefe('Moritz leicht negativ: meldet sich', E("epilogZeile('MORITZ')").startsWith('NOCH KEIN WORT'));
frisch();
pruefe('Crew-Figur ohne Crew: keine Folie', E("epilogZeile('JONAS')")===null&&E('epilogFolien().length')===1);
E("speichereCrew('JONAS'); speichereCrew('LEA'); speichereCrew('MAX FERDI')");
pruefe('mit Crew: Moritz zuerst, dann Reihenfolge',
  JSON.stringify(E('epilogFolien().map(f=>f.txt.split("|")[0].split(" ")[0])'))==='["MORITZ","JONAS","LEA","MAX"]');
pruefe('Jonas Standardzeile', E("epilogZeile('JONAS')").startsWith('JONAS SCHREIBT'));
E("setzeFlag('jonasAngstTeilen')"); pruefe('Jonas Angst', E("epilogZeile('JONAS')").includes('ALS ERSTER'));
E("setzeFlag('tschuess_jonas')"); pruefe('tschuess_jonas hat Vorrang', E("epilogZeile('JONAS')").includes('TSCHUESS'));
pruefe('Lea ohne Momente: Fotos', E("epilogZeile('LEA')").startsWith('LEA HAT 212'));
E("[1,2,3,4,5].forEach(n=>setzeFlag('moment'+n))");
pruefe('Lea ab 5 Momenten: Zeitung', E("epilogZeile('LEA')").includes('ZEITUNG'));
frisch(); E("speichereCrew('DENNIS')");
pruefe('Dennis kalt', E("epilogZeile('DENNIS')").startsWith('DENNIS TRAINIERT'));
E("aendereBeziehung('DENNIS',8)"); pruefe('Dennis ab 8 warm', E("epilogZeile('DENNIS')").includes('ZWEI KARTEN'));
frisch(); E("speichereCrew('TOBI')"); E("setzeFlag('tobiBruecke')");
pruefe('Tobi Bruecke: Foto', E("epilogZeile('TOBI')").includes('05:17'));
pruefe('Folien hoechstens 7', E('epilogFolien().length')<=7);
frisch();
pruefe('Marvin-Folie nur mit marvinKennt', E('marvinFolie({})')===null);
E("setzeFlag('marvinKennt')");
pruefe('Marvin Standard: Hand', E('marvinFolie({})').startsWith('MARVIN REICHT'));
pruefe('Marvin Frieden ueber p.kampf', E("marvinFolie({kampf:'frieden'})").includes('WONDERWALL'));
pruefe('Marvin gewonnen: Trikot', E("marvinFolie({kampf:'gewonnen'})").includes('TRIKOT'));
E("setzeFlag('marvinMitkommen')");
pruefe('Mitkommen gilt zuerst', E("marvinFolie({kampf:'gewonnen'})").startsWith('MARVIN IST MITGEKOMMEN'));

console.log('\n--- Gruppenchat und Abspann ---');
frisch();
pruefe('Chat leer: 5 Zeilen (ALI, OEZDEMIR, HAUSMEISTER, BAECKERIN, FRAU)', E('chatZeilen().length')===5);
E("['taxiTipp','spaetiWasser','mitgesungen','schluesselVersprochen'].forEach(f=>setzeFlag(f))");
pruefe('Chat voll: hoechstens 6, Reihenfolge bleibt', E('chatZeilen().length')===6&&E('chatZeilen()[0]').startsWith('ALI'));
pruefe('Chat: niedrigste Prioritaet faellt weg (Baeckerin)', !E('chatZeilen()').some(z=>z.startsWith('BAECKERIN')));
const chat=E('chatKarten()');
pruefe('Chat-Kopf und Paare', chat[0].txt==='GRUPPE: NACHTSCHICHT (6)'&&chat.length===4&&chat[1].txt.split('|').length===2);
frisch();
const mitte=E("abspannMitte({weg:'heim',kampf:'verloren'})"), schluss=E("abspannSchluss({weg:'heim',kampf:'verloren'})");
pruefe('leerer Stand: Karten, jede mit d und txt',
  mitte.length>=3&&schluss.length>=3&&[...mitte,...schluss].every(c=>typeof c.d==='number'&&typeof c.txt==='string'));
pruefe('Album 0 VON 8', mitte.some(c=>c.txt==='ALBUM: 0 VON 8'));
pruefe('letzte Karte ist die Wolle mit Stempel',
  (c=>c.art==='wolle'&&c.knoten===0&&c.stempel==='BIS GLEICH'&&c.d===4)(schluss[schluss.length-1]));
pruefe('NIEWIEDER: nur Fenster', schluss[0].txt==='WAS WIR NIE WIEDER ERWAEHNEN:|DAS FENSTER');
pruefe('bisGleichAmEnde nur mit Flag', !schluss.some(c=>c.txt.startsWith('ALLE HABEN')));
E("setzeFlag('bisGleichAmEnde')");
pruefe('bisGleichAmEnde bei 0 Knoten: Karte vor der Wolle',
  E("abspannSchluss({})").some(c=>c.txt==='ALLE HABEN BIS GLEICH GESAGT.|KEINER TSCHUESS.'));
E("['notbremse','marvinKennt','moritzKartonGesehen','endeSonne'].forEach(f=>setzeFlag(f))");
const np=E('niewiederPunkte({})');
pruefe('NIEWIEDER: hoechstens vier Punkte', np.length===4&&np[0]==='DAS FENSTER');
E("setzeFlag('schluesselVersprochen')");
pruefe('Schluessel-Karte am Ende der Mitte',
  E('abspannMitte({})').pop().txt==='DER SCHLUESSEL LIEGT IM BRIEFKASTEN.|ROTE WOLLE DRAN.');
E("speichereCrew('LEA'); [1,2,3,4,5].forEach(n=>setzeFlag('moment'+n))");
pruefe('Album ab 5 mit Lea: Seite 9', E('abspannMitte({})').some(c=>c.txt.startsWith('ALBUM: 5 VON 8|SEITE 9')));
pruefe('kaputte Eingabe: keine Ausnahme', sicher('abspannMitte(undefined); abspannSchluss(null); epilogFolien(7)'));

console.log('\n--- endeRegistrieren ---');
frisch();
E("setzeFlag('schluesselVersprochen')");
pruefe('neues Ende: gesehen, Knoten 1',
  E("endeRegistrieren('HEIM - MIT SCHRAMMEN')")===1&&E('NACHT.gesehen.length')===1&&E("NACHT.knotenBest['HEIM - MIT SCHRAMMEN']")===1);
E("endeRegistrieren('HEIM - MIT SCHRAMMEN')");
pruefe('kein Doppeleintrag', E('NACHT.gesehen.length')===1);
E("NACHT.flags={}"); E("endeRegistrieren('HEIM - MIT SCHRAMMEN')");
pruefe('Knotenbest ist das Maximum', E("NACHT.knotenBest['HEIM - MIT SCHRAMMEN']")===1);
E("setzeFlag('schluesselVersprochen'); setzeFlag('wirEuchAuch'); setzeFlag('tschuessGesagt')");
E("endeRegistrieren('WEITERZIEHEN - OHNE EINEN SCHLAG')");
pruefe('3 Knoten: auch SCHICHTWECHSEL',
  E("NACHT.gesehen.includes('SCHICHTWECHSEL')")&&E("NACHT.knotenBest['SCHICHTWECHSEL']")===3&&E("NACHT.knotenBest['WEITERZIEHEN - OHNE EINEN SCHLAG']")===3);
pruefe('Speicher: gespeichert', JSON.parse(k.localStorage.getItem('nachtschicht.stand')||'{}').gesehen.length===3);
pruefe('Neuanfang bewahrt gesehen und knotenBest',
  (()=>{ E('nachtZuruecksetzen()'); return E('NACHT.gesehen.length')===3&&E("NACHT.knotenBest['SCHICHTWECHSEL']")===3; })());
pruefe('zehn Enden, Titel eindeutig', E('ENDEN_ALLE.length')===10&&new Set(E('ENDEN_ALLE.map(e=>e.titel)')).size===10);
pruefe('Ende ohne Titel: keine Ausnahme', sicher('endeRegistrieren(undefined)'));

console.log('\n--- Enden-Galerie (Daten) ---');
frisch();
let d=E('MENUE.galerieDaten()');
pruefe('leer: 0 von 10, 8 Momente ???',
  d.enden.length===10&&d.endenGesehen===0&&d.enden.every(e=>!e.gesehen)&&d.momenteAnzahl===0&&d.momente.length===8);
E("NACHT.gesehen=['HEIM - OHNE EINEN SCHLAG','SCHICHTWECHSEL']; NACHT.knotenBest={'HEIM - OHNE EINEN SCHLAG':2,'SCHICHTWECHSEL':3}; NACHT.momenteBest=[2,7]");
E('delete TEXTE_MOMENTE[7]');
E("TEXTE_MOMENTE[2]={titel:'DIE PINNWAND',l1:'ZEILE EINS',l2:'ZEILE ZWEI'}");
d=E('MENUE.galerieDaten()');
pruefe('zwei Enden gesehen mit Knoten',
  d.endenGesehen===2&&d.enden[2].gesehen&&d.enden[2].knoten===2&&d.enden[9].knoten===3&&!d.enden[0].gesehen);
pruefe('Momente: nur gefundene mit Text',
  d.momenteAnzahl===2&&d.momente[1].gefunden&&d.momente[1].titel==='DIE PINNWAND'&&d.momente[1].l1==='ZEILE EINS'&&!d.momente[0].gefunden&&d.momente[0].titel==='');
pruefe('Moment ohne Text: gefunden, Titel leer', d.momente[6].gefunden&&d.momente[6].titel==='');
pruefe('Quelle ist nicht der Flag-Stand', (()=>{ E("NACHT.flags={moment1:true}"); return E('MENUE.galerieDaten().momenteAnzahl')===2; })());
pruefe('galerie() ohne DOM: keine Ausnahme', sicher('MENUE.galerie&&MENUE.galerie()'));

console.log('\n'+ok+' ok, '+fail+' fehl');
process.exit(fail?1:0);
