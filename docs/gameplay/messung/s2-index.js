/* Messung Stufe 2, Level 1 (Schule, index.html): Flucht nach dem Schluessel, Lehrer-Tempo
   in der Flucht, Rang am Levelende und Scheitern am Countdown. Ohne Browser (nachttest-Attrappen).

   Lauf aus der Projektwurzel:  node docs/gameplay/messung/s2-index.js
   Der Pfad zu nachttest ist relativ zu dieser Datei; lade() liest nacht/*.js relativ zum Arbeitsordner. */
const path=require('path');
const fs=require('fs');
const N=require(path.resolve(__dirname,'../../../tools/nachttest.js'));
process.chdir(path.resolve(__dirname,'../../..'));
const DT=1/60;

/* Ein frisches Level direkt ins Spiel setzen (Kapitelkarte und Intro uebersprungen). */
function frisch(){
  const L=N.lade('index.html','?lektion=0');
  const E=c=>L.api.ev(c);
  const U=n=>{ for(let i=0;i<n;i++) E('update('+DT+')'); };
  const D=()=>{ try{ E('draw('+DT+')'); return 'ok'; }catch(e){ return 'FEHLER: '+e.message; } };
  E('starte()'); E('KAPITEL.aktiv=false; MOMENT_KARTE.aktiv=false'); E('starteLevel()');
  return {L,E,U,D};
}
const f2=x=>(Math.round(x*100)/100);
let fehler=0;
const pruefe=(name,ok)=>{ console.log((ok?'  OK     ':'  FEHLT  ')+name); if(!ok) fehler++; };

/* ---- (a) Neues Element: Flucht nach dem Schluessel ----------------------- */
console.log('(a) FLUCHT NACH DEM SCHLUESSEL');
{
  const {E,U,D}=frisch();
  const vorher={modus:E('S.modus'), fluchtAn:E('S.fluchtAn'), fluchtT:E('S.fluchtT')};
  E('globalThis.__ml=[]; const __abs=MUSIK.abschnitt; MUSIK.abschnitt=(n)=>{__ml.push(n); return __abs(n);}');
  E('S.hatSchluessel=true'); U(1);
  const nach1={modus:E('S.modus'), fluchtAn:E('S.fluchtAn'), fluchtT:f2(E('S.fluchtT')),
               meldung:E('S.meldung'), hinweis:E('S.hinweis'), musikAbschnitte:E('JSON.stringify(__ml)')};
  console.log('  vorher:', JSON.stringify(vorher));
  console.log('  nach 1 Bild:', JSON.stringify(nach1));
  pruefe('Flucht startet mit dem Schluessel (fluchtAn)', nach1.fluchtAn===true);
  pruefe('Countdown beginnt bei TUNE.fluchtSek', Math.abs(nach1.fluchtT-35)<0.1);
  pruefe('Durchsage HAUSMEISTER SCHLIESST AB!', nach1.meldung==='HAUSMEISTER SCHLIESST AB!');
  U(60);
  const musikNachher=E('JSON.stringify(__ml)');
  pruefe('Musik wechselt auf Abschnitt jagd (Flucht, ab dem naechsten Bild)', /"jagd"/.test(String(musikNachher)));
  const nach1s=f2(E('S.fluchtT'));
  console.log('  nach 1 s: fluchtT='+nach1s, '  Zeichnen:', D());
  pruefe('Countdown laeuft in Echtzeit (1 s = ca. 1 Sekunde weniger)', Math.abs((35-nach1s)-1)<0.1);
  /* Ablauf: Scheitern wie bei der Uhr */
  U(34*60+60);
  const ende={modus:E('S.modus'), gewonnen:E('S.gewonnen'), faenger:E('S.faenger'), fluchtT:E('S.fluchtT')};
  console.log('  nach Ablauf:', JSON.stringify(ende), '  Zeichnen:', D());
  pruefe('Ablauf setzt modus=ende, gewonnen=false', ende.modus==='ende' && ende.gewonnen===false);
  pruefe('Ablauf: Text HAUSMEISTER HAT ABGESCHLOSSEN', ende.faenger==='DER HAUSMEISTER HAT ABGESCHLOSSEN');
}

/* ---- (a2) Lehrer-Tempo in der Flucht ---------------------------------- */
console.log('(a2) LEHRER-TEMPO IN DER FLUCHT (x TUNE.fluchtTempo)');
function lehrerWeg(flucht){
  const {E,U}=frisch();
  E('S.lehrer.forEach(L=>{L.routineT=999})');
  if(flucht){ E('S.hatSchluessel=true'); }
  U(1);
  /* Pausen des Lehrers ausschalten, damit nur das Tempo verglichen wird. */
  const x0=E('S.lehrer[0].x');
  for(let i=0;i<120;i++){ E('S.lehrer[0].pause=0; S.lehrer[0].umgedreht=false'); U(1); }
  const x1=E('S.lehrer[0].x');
  return x1-x0;
}
{
  const normal=lehrerWeg(false), flucht=lehrerWeg(true);
  const verhaeltnis=f2(flucht/normal);
  console.log('  Lehrer 2 s ohne Flucht: '+f2(normal)+' px, in Flucht: '+f2(flucht)+' px, Verhaeltnis '+verhaeltnis);
  pruefe('Lehrer in der Flucht schneller (Verhaeltnis ~1.25)', Math.abs(verhaeltnis-1.25)<0.05);
}

/* ---- (b) Rang am Levelende -------------------------------------------- */
console.log('(b) RANG AM LEVELENDE (WERTUNG.abschluss)');
function rangLauf(name,setup){
  const {L,E,U,D}=frisch();
  E('globalThis.__rl=[]; const __ab=WERTUNG.abschluss; WERTUNG.abschluss=(...a)=>{const r=__ab(...a); __rl.push({a,r}); return r;}');
  setup(E);
  E('S.etage=AUSGANG.e; S.x=AUSGANG.x; S.y=BODEN[S.etage]; S.vx=0');
  L.taste('KeyE',true);            // E halten: Ausgang nehmen, Szene durch halten ueberspringen
  U(1); U(400);
  const rl=E('JSON.stringify(__rl)');
  const liste=JSON.parse(rl||'[]');
  console.log('  '+name+': modus='+E('S.modus')+' gewonnen='+E('S.gewonnen')+' zeit='+f2(E('S.zeit'))+' Zeichnen: '+D());
  console.log('    Aufrufe WERTUNG.abschluss: '+liste.length);
  if(liste[0]){
    console.log('    Rang: '+liste[0].r.rang+' neuerBest='+liste[0].r.neuerBest+' Punkte='+liste[0].a[1]);
    liste[0].a[2].forEach(z=>console.log('      '+z.name.padEnd(7)+z.wert.padEnd(8)+z.pkt));
  }
  console.log('    WERTUNG.best(1)='+E('WERTUNG.best(1)'));
  return liste;
}
const gut=rangLauf('GUT (alles da, schnell, keine Alarme)', E=>{
  E('S.zeit=70; S.alarme=0; S.hp=3; S.hatSchluessel=true; S.polaroidRunde=true');
  E('S.zettel.forEach(z=>z.gefunden=true); S.funde.forEach(f=>f.gefunden=true)');
});
const schlecht=rangLauf('SCHLECHT (langsam, 3 Alarme, 1 Herz, nichts gefunden)', E=>{
  E('S.zeit=150; S.alarme=3; S.hp=1; S.hatSchluessel=true');
});
pruefe('Rang gut ergibt S', gut[0]&&gut[0].r.rang==='S');
pruefe('Rang schlecht ergibt C (kein Durchfallen, aber niedrig)', schlecht[0]&&schlecht[0].r.rang==='C');
pruefe('genau ein Aufruf je Levelende', gut.length===1 && schlecht.length===1);

console.log(fehler?'\n'+fehler+' Pruefung(en) fehlgeschlagen':'\nalle Messungen gruen');
process.exitCode=fehler?1:0;
