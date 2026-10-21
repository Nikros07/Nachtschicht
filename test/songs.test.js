/* Prueft nacht/songs.js (nur Daten): IDs, Abschnitte, Akkord- und Notennamen, Stil-Namen,
   Lead-Zeilen (16 Zellen, Tonumfang A3..E6), Schleifenlaenge und Melodiebreite. Ohne Browser.
   node test/songs.test.js */
const fs=require('fs'), path=require('path');
const quelle=fs.readFileSync(path.join(__dirname,'..','nacht','songs.js'),'utf8');
let SONGS=null, fehler=null;
try{ SONGS=new Function(quelle+'\nreturn SONGS;')(); }catch(e){ fehler=e; }

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i!==undefined?'   -> '+i:'')); } };

const IDS=['menue','karte','schule','moritz','sprint','bus','tuer','club','traum','spaeti','heimweg'];
// Zusatzabschnitte, die das Spiel gezielt ruft (MUSIK.abschnitt): muessen existieren
const EXTRA={schule:['jagd'],moritz:['kampf'],bus:['alarm'],tuer:['phase2','phase3'],club:['drop','dj'],heimweg:['finale']};
const STIL={bass:['halbe','puls','achtel','galopp','walk','drohn','schleich'],
  drums:['club','rock','schleich','sprint','swing','traum','aus'],
  arp:['auf','ab','wechsel','akkord','aus']};
const EBENEN_OK=['bass','drums','arp','lead'];
const WELLEN=['puls12','puls25','puls50','square','triangle','sine','sawtooth'];
const AKKORD=/^[A-G][#b]?m?7?$/;          // Grundton A-G, optional #/b, optional m, optional 7
const NOTE=/^([A-G])([#b]?)(\d)$/;        // Notenname mit Oktave, z.B. A4, C#5, Bb3
const TON={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
// MIDI-Nummer: C4 = 60, A3 = 57, E6 = 88
const midi=t=>{ const m=NOTE.exec(t); if(!m) return null;
  return (parseInt(m[3],10)+1)*12+TON[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0); };

console.log('\n--- AUFBAU ---');
pruefe('songs.js laedt ohne Fehler', SONGS!==null, fehler&&fehler.message);
if(!SONGS){ console.log('\n'+ok+' ok, '+fail+' fehl'); process.exit(1); }
pruefe('alle elf IDs da', IDS.every(id=>SONGS[id]&&typeof SONGS[id]==='object'), IDS.filter(id=>!SONGS[id]).join(','));
pruefe('keine fremden IDs', Object.keys(SONGS).every(id=>IDS.includes(id)), Object.keys(SONGS).join(','));

for(const id of IDS){
  const s=SONGS[id]; if(!s) continue;
  console.log('\n--- '+id+' ---');
  const ab=s.abschnitte||{}, namen=Object.keys(ab);
  pruefe(id+': bpm 60..200, schritte 16, swing 0..0.3',
    typeof s.bpm==='number'&&s.bpm>=60&&s.bpm<=200&&s.schritte===16&&(s.swing||0)>=0&&(s.swing||0)<=0.3);
  pruefe(id+': mindestens zwei Abschnitte', namen.length>=2, namen.join(','));
  for(const x of EXTRA[id]||[]) pruefe(id+': Zusatzabschnitt '+x+' da', !!ab[x]);
  pruefe(id+': mindestens 3 Ebenen, nur bekannte Namen',
    Array.isArray(s.ebenen)&&s.ebenen.length>=3&&s.ebenen.every(e=>Array.isArray(e)&&e.every(k=>EBENEN_OK.includes(k))));
  pruefe(id+': Klang-Namen gueltig', !s.klang||Object.values(s.klang).every(w=>WELLEN.includes(w)));

  const toene=new Set(), akk=new Set(); let lead=false;
  const ungueltig=[], tonBad=[], stilBad=[], akkBad=[], leadBad=[];
  for(const n of namen){
    const a=ab[n], L=a.akkorde;
    if(!Array.isArray(L)||L.length===0||!L.every(c=>AKKORD.test(c))) akkBad.push(n+':'+JSON.stringify(L));
    else L.forEach(c=>akk.add(c));
    for(const k of ['bass','drums','arp']) if(!STIL[k].includes(a[k])) stilBad.push(n+'.'+k+'='+a[k]);
    if(a.lead){
      lead=true;
      if(!Array.isArray(a.lead)||a.lead.length!==(L||[]).length) leadBad.push(n+': lead-Laenge '+(Array.isArray(a.lead)?a.lead.length:'kein Array')+' vs akkorde '+(L||[]).length);
      (Array.isArray(a.lead)?a.lead:[]).forEach((z,i)=>{
        const zellen=String(z).trim().split(/\s+/);
        if(zellen.length!==16||!zellen.every(t=>t==='.'||t==='-'||NOTE.test(t)))
          ungueltig.push(n+' Takt '+(i+1)+' ('+zellen.length+' Zellen)');
        zellen.forEach(t=>{ if(NOTE.test(t)){ const m=midi(t); if(m<57||m>88) tonBad.push(t); toene.add(t); } });
      });
    }
  }
  pruefe(id+': Akkordnamen gueltig', akkBad.length===0, akkBad.join(' '));
  pruefe(id+': Stil-Namen aus den Tabellen', stilBad.length===0, stilBad.join(' '));
  pruefe(id+': lead je Takt ein String, gleiche Laenge wie akkorde', leadBad.length===0, leadBad.join('; '));
  pruefe(id+': lead-Zeilen genau 16 Zellen aus Note . -', ungueltig.length===0, ungueltig.join('; '));
  pruefe(id+': Tonumfang A3..E6', tonBad.length===0, tonBad.join(' '));
  pruefe(id+': Lead in mindestens einem Abschnitt', lead);

  const folgeOk=Array.isArray(s.folge)&&s.folge.length>0&&s.folge.every(f=>ab[f]);
  pruefe(id+': folge nur bekannte Abschnitte', folgeOk, JSON.stringify(s.folge));
  if(folgeOk){
    const takte=s.folge.reduce((t,f)=>t+ab[f].akkorde.length,0);
    pruefe(id+': Folge mindestens 8 Takte ('+takte+')', takte>=8);
    const sek=s.folge.length*16*60/(s.bpm*4);
    pruefe(id+': Schleife (folge*16 Sechzehntel) >= 15 s', sek>=15, sek.toFixed(2)+' s');
  }
  pruefe(id+': >= 12 verschiedene Lead-Tonhoehen', toene.size>=12, toene.size);
  pruefe(id+': >= 12 Tonhoehen ueber Lead+Akkorde', new Set([...toene,...akk]).size>=12);
}

console.log('\n'+ok+' ok, '+fail+' fehl');
process.exit(fail?1:0);
