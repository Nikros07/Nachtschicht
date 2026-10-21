/* Messung Stufe 2, Level 2 (Moritz): neues Element, Musik-Haken, Rang.
   node docs/gameplay/messung/s2-level2.js
   Laeuft gegen den Pruefstand aus tools/nachttest.js (ohne Browser, ohne Ton). */
const path=require('path');
const ROOT=path.join(__dirname,'..','..','..');
process.chdir(ROOT);
const N=require(path.join(ROOT,'tools','nachttest.js'));
let fehler=0;
const pruef=(name,ok,info)=>{ if(!ok) fehler++; console.log((ok?'OK   ':'FEHL ')+name+(info!==undefined?'  -> '+info:'')); };
const frisch=(setup)=>{ const L=N.lade('level2.html','?lektion=0'); const E=c=>L.api.ev(c);
  E(`S.modus='spiel'; S.mitnehmenOffen=false; S.reden=null;`+setup); return {L,E}; };

// (a1) Halten fuellt das Glas, (a2) Loslassen unter der Zone gibt Pegel nach Fuellstand
{
  const {L,E}=frisch(`S.x=500; S.kamX=340; S.pegel=0; S.mut=0;`);
  const vorher=E('S.pegel');
  L.taste('KeyE',true);
  E('update(1/60)');
  const f0=E('S.schenk&&S.schenk.f');
  for(let i=0;i<30;i++) E('update(1/60)');
  const f1=E('S.schenk&&S.schenk.f');
  L.taste('KeyE',false);
  for(let i=0;i<3;i++) E('update(1/60)');
  const nachher=E('S.pegel');
  pruef('(a1) Halten fuellt das Glas',f0!==null&&f1>f0&&f1<0.6,'f '+Number(f0).toFixed(2)+' -> '+Number(f1).toFixed(2)+' in 0.5 s');
  pruef('(a2) Loslassen unter Zone gibt Pegel nach Fuellstand',nachher>vorher&&E('S.schenk')===null,'Pegel '+vorher+' -> '+nachher.toFixed(1));
}
// (a3) PERFEKT: loslassen, sobald der Fuellstand in der Zone ist
{
  const {L,E}=frisch(`S.x=500; S.kamX=340; S.pegel=20; S.mut=0;`);
  L.taste('KeyE',true);
  let los=null;
  for(let i=0;i<200;i++){
    E('update(1/60)');
    const f=E('S.schenk&&S.schenk.f');
    if(f!==null&&f>=0.78){ los=f; L.taste('KeyE',false); break; }
  }
  for(let i=0;i<3;i++) E('update(1/60)');
  const pegel=E('S.pegel'), mut=E('S.mut');
  pruef('(a3) PERFEKT in der Zone: Mut +3 und halber Zuwachs (ca. 8, abzueglich Abbau)',mut===3&&pegel>26&&pegel<28.5,
    'f '+Number(los).toFixed(2)+' Pegel '+pegel.toFixed(1)+' Mut '+mut);
}
// (a4) Ueberlauf: ganz halten, das Glas laeuft ueber
{
  const {L,E}=frisch(`S.x=500; S.kamX=340; S.pegel=20; S.mut=0;`);
  L.taste('KeyE',true);
  E('update(1/60)');
  for(let i=0;i<200&&E('S.schenk');i++) E('update(1/60)');
  for(let i=0;i<3;i++) E('update(1/60)');
  const pegel=E('S.pegel'), meld=E('S.meldung');
  pruef('(a4) Ueberlauf: kein Pegel (nur Abbau), Meldung VERSCHUETTET',pegel<=20&&meld==='VERSCHUETTET',pegel+' / '+meld);
}
// (a5) Anlage erledigt MUSIK LAUTER, der Strich waechst; (a6) Spannung steigt
{
  const {L,E}=frisch(`S.x=370; S.kamX=260;`);
  const vorher=E('erledigtAnteil()');
  L.taste('KeyE',true); L.taste('KeyE',false);
  for(let i=0;i<3;i++) E('update(1/60)');
  const ok=E('S.erledigt.musik===true');
  for(let i=0;i<12;i++) E('update(1/60)');
  const strich=E('S.striche.musik');
  pruef('(a5) Anlage erledigt MUSIK LAUTER, Strich laeuft',ok&&strich>0.15,'Strich '+Number(strich).toFixed(2)+' s');
  const nachher=E('erledigtAnteil()');
  pruef('(a6) Spannung steigt mit erledigten Aufgaben',nachher>vorher,'Anteil '+Number(vorher).toFixed(2)+' -> '+Number(nachher).toFixed(2));
}
// (a7) FINN WECKEN, danach FINN ZUDECKEN
{
  const {L,E}=frisch(`S.x=256; S.kamX=150; S.inventar.dose=true;`);
  const weck=()=>{ for(let i=0;i<300&&E('S.reden');i++){ L.taste('KeyE',true); L.taste('KeyE',false); for(let j=0;j<2;j++) E('update(1/60)'); } };
  L.taste('KeyE',true); L.taste('KeyE',false);
  for(let i=0;i<5;i++) E('update(1/60)');
  weck();
  const geweckt=E('S.erledigt.schlaefer');
  E('S.x=256; S.reden=null');
  L.taste('KeyE',true); L.taste('KeyE',false);
  for(let i=0;i<5;i++) E('update(1/60)');
  weck();
  pruef('(a7) FINN WECKEN und danach FINN ZUDECKEN',geweckt===true&&E('S.erledigt.zudecken')===true,
    'geweckt '+geweckt+' zudecken '+E('S.erledigt.zudecken'));
}
// (b1) Rang bei gutem Spiel
{
  const {E}=frisch('');
  E(`neuesSpiel(); S.modus='spiel'; S.mitnehmenOffen=false; S.reden=null;
     ['jacke','ausweis','schlaefer','telefon','musik','zudecken'].forEach(k=>S.erledigt[k]=true);
     S.zeit=100; S.hp=TUNE.leben; S.fehl=0; S.gegner=null;`);
  E('levelGeschafft()');
  const best=E('WERTUNG.best(2)');
  pruef('(b1) WERTUNG.abschluss liefert einen Rang (gut)',['S','A','B','C'].includes(best),
    'Rang '+best+' | '+E('JSON.stringify(rangDaten())'));
}
// (b2) Schlechtes Spiel: spaet, viele Fehlgriffe, Treffer kassiert
{
  const {E}=frisch('');
  E(`neuesSpiel(); S.modus='spiel'; S.mitnehmenOffen=false; S.reden=null;
     ['jacke','ausweis','schlaefer','telefon'].forEach(k=>S.erledigt[k]=true);
     S.zeit=185; S.hp=1; S.fehl=9; S.gegner=null;`);
  E('levelGeschafft()');
  const best=E('WERTUNG.best(2)');
  const punkte=E('rangDaten().punkte');
  pruef('(b2) schlechtes Spiel bekommt C',best==='C'&&punkte<55,'Rang '+best+' Punkte '+punkte);
}
// (c) Spiel laeuft ohne Ausnahme; der Tuerkampf ruft den Abschnitt kampf, danach null
{
  const {E}=frisch('');
  let fehlerZaehl=0;
  try{ for(let i=0;i<60*60;i++) E('update(1/60)'); }catch(e){ fehlerZaehl++; }
  pruef('(c1) 60 s Spiel ohne Ausnahme',fehlerZaehl===0);
  E('globalThis.__abschn=[]; const __alt=MUSIK.abschnitt; MUSIK.abschnitt=(n)=>{ __abschn.push(n); return __alt(n); }');
  E('S.modus="kampf"; S.gegner={x:S.x-70,hp:3,zustand:"komm",t:0,getroffen:0,verpasst:false}');
  for(let i=0;i<3;i++) E('update(1/60)');
  E('S.modus="spiel"');
  for(let i=0;i<2;i++) E('update(1/60)');
  const rufe=E('JSON.stringify(__abschn)');
  pruef('(c2) Tuerkampf ruft abschnitt kampf, danach null',rufe.startsWith('[\"kampf')&&rufe.endsWith('null]'),'Aufrufe: '+rufe);
}
console.log(fehler?'\n'+fehler+' Fehler':'\nalles gut');
process.exit(fehler?1:0);
