/* Messung n3 - Level 3: Gratis-Wiederholung (NOCHMAL AB BUS), Ticket, Notbremse, Szene.
   node docs/gameplay/messung/n3-level3-gratis.js     (aus dem Projektordner; Exit 1 bei FEHL)
   Zustand wird gezielt gesetzt (L.api.ev), dann laeuft die update-Schleife. */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
let fehler=0;
const ok=(b,t,d)=>{ if(!b) fehler++; console.log((b?'OK   ':'FEHL ')+t+(d!==undefined?'  ['+d+']':'')); };
const frisch=()=>{ const L=N.lade('level3.html','?lektion=0'); const E=c=>L.api.ev(c);
  E('setzeFlag("busNeustartErklaert",true)'); E('neuesSpiel(); S.pegel=0.3; S.zeit=42; starteBus()');
  return E; };
const lauf=(E,n)=>{ for(let i=0;i<n;i++) E('update(1/60)'); };
const sauber=E=>E(`(()=>{ const bad=[S.x,S.y,S.zeit,S.verdacht,S.hp,S.pegel,S.tiefe,S.ablenkT,S.unverwundbarT].some(v=>typeof v!=='number'||!isFinite(v)); return !bad && S.kontrolleure.every(k=>isFinite(k.x)); })()`);
const gespr=(E,id,vorherJs)=>E(`(()=>{ const f=FAHRGAESTE.find(f=>f.id==='${id}'); const vorher=${vorherJs}; return [f,vorher]; })()`);
function versuche(fn,name){ try{ fn(); }catch(e){ fehler++; console.log('FEHL '+name+' - Ausnahme: '+String(e.stack||e).split('\n').slice(0,2).join(' | ')); } }

/* 1. TICKET: gekauft (Flag + Geld weg) -> S.ticket; Verdacht 100 -> verbraucht, kein Lebensverlust */
versuche(()=>{
  const E=frisch(); const hp0=E('S.hp');
  E('setzeWert("geld",20)');
  E(`(()=>{ const f=FAHRGAESTE.find(f=>f.id==='automat'); const v={geld:wert('geld'),bremse:flag('notbremse'),szene:flag('busSzene')};
    setzeWert('geld',wert('geld')-TUNE.ticketPreis); setzeFlag('busTicket',true); gespraechFolgen(f,v); })()`);
  ok(E('S.ticket')===true,'Ticket: nach Kauf S.ticket=true');
  E('S.verdacht=101; S.unverwundbarT=0');
  lauf(E,2);
  ok(E('S.ticket')===false,'Ticket: bei Verdacht 100 verbraucht');
  ok(E('S.hp')===hp0&&E('S.erwischtZahl')===0,'Ticket: kein Leben verloren, nicht erwischt','hp '+E('S.hp'));
  ok(E('S.verdacht')<100&&E('S.unverwundbarT')>0,'Ticket: Verdacht zurueck, Schonfrist laeuft');
  ok(E('S.modus')==='spiel','Ticket: Modus spiel');
  /* zweite Kontrolle trifft normal */
  E('S.verdacht=101; S.unverwundbarT=0'); lauf(E,2);
  ok(E('S.hp')===hp0-1&&E('S.erwischtZahl')===1,'Ticket: zweite Kontrolle trifft normal','hp '+E('S.hp'));
  lauf(E,120); ok(sauber(E),'Ticket: kein NaN nach 2 s');
},'Ticket');

/* 2. NOTBREMSE: Flag -> Ablenkung, Kontrolleure laufen zum Einstieg, danach zurueck */
versuche(()=>{
  const E=frisch();
  E(`(()=>{ const f=FAHRGAESTE.find(f=>f.id==='notbremse'); const v={geld:wert('geld'),bremse:flag('notbremse'),szene:flag('busSzene')};
    setzeFlag('notbremse',true); gespraechFolgen(f,v); })()`);
  ok(E('S.ablenkT')>=E('TUNE.notbremsAblenk')-1e-6,'Notbremse: Ablenkung gesetzt','ablenkT '+E('S.ablenkT'));
  ok(E('S.kontrolleure.every(k=>k.zielX===TUNE.einstiegX+20)'),'Notbremse: alle Kontrolleure laufen zum Einstieg');
  const d0=E('S.kontrolleure.map(k=>Math.abs(k.x-(TUNE.einstiegX+20)))');
  lauf(E,120);
  const d1=E('S.kontrolleure.map(k=>Math.abs(k.x-(TUNE.einstiegX+20)))');
  ok(d1.every((d,i)=>d<=d0[i]+1e-6)&&d1.some((d,i)=>d<d0[i]),'Notbremse: Kontrolleure naehern sich');
  ok(E('S.modus')==='spiel'&&sauber(E),'Notbremse: Modus spiel, kein NaN');
  lauf(E,Math.ceil(E('TUNE.notbremsAblenk')*60)+30);
  ok(E('S.ablenkT')<=0&&E('S.kontrolleure.every(k=>k.zielX===null)'),'Notbremse: danach Ablenkung vorbei, Ziel frei');
  /* Level-Ende-Folge: Flag spaetDran */
  E('setzeFlag("spaetDran",false)'); E('levelGeschafft()');
  ok(E('flag("spaetDran")')===true,'Notbremse: levelGeschafft setzt spaetDran');
},'Notbremse');

/* 3. SZENE: Betrunkener -> alle weichen dem Spieler aus, ablenkT = ablenkDauer */
versuche(()=>{
  const E=frisch(); E('S.x=700');
  E(`(()=>{ const f=FAHRGAESTE.find(f=>f.id==='betrunkener'); const v={geld:wert('geld'),bremse:flag('notbremse'),szene:flag('busSzene')};
    setzeFlag('busSzene',true); gespraechFolgen(f,v); })()`);
  ok(E('S.ablenkT')>=E('TUNE.ablenkDauer')-1e-6,'Szene: Ablenkung gesetzt','ablenkT '+E('S.ablenkT'));
  ok(E('S.kontrolleure.every(k=>k.zielX!==null&&isFinite(k.zielX)&&k.zielX>=TUNE.einstiegX+10&&k.zielX<=BUS_B-10)'),'Szene: Ziele endlich, im Bus');
  lauf(E,120); ok(E('S.modus')==='spiel'&&sauber(E),'Szene: Modus spiel, kein NaN');
  lauf(E,Math.ceil(E('TUNE.ablenkDauer')*60)+30);
  ok(E('S.ablenkT')<=0,'Szene: Ablenkung laeuft ab');
},'Szene');

/* 4. Gratis-Wiederholung selbst: verloren im Bus -> Aktion -> direkt im Bus, ohne Sprint/Titel */
versuche(()=>{
  const E=frisch(); const zeit0=E('S.einstieg.zeit'), pegel0=E('S.einstieg.pegel');
  E('S.x=900; S.hp=1; S.verdacht=101; S.unverwundbarT=0; S.ticket=false'); lauf(E,3);
  ok(E('S.modus')==='ende'&&E('S.gewonnen')===false,'Wiederholung: Verlust -> Modus ende');
  E('druckAktion()');
  ok(E('S.modus')==='spiel'&&E('S.imBus')===true,'Wiederholung: Aktion startet direkt im Bus','Modus '+E('S.modus'));
  ok(E('S.x')===E('EINSTIEG_X'),'Wiederholung: Position am Einstieg','x '+E('S.x'));
  ok(Math.abs(E('S.zeit')-zeit0)<1e-6&&Math.abs(E('S.pegel')-pegel0)<1e-6,'Wiederholung: Zeit und Pegel wie beim Einsteigen');
  ok(E('S.hp')===E('TUNE.leben+schwer().leben')&&E('S.erwischtZahl')===0&&E('S.verdacht')===0,'Wiederholung: Leben/Zaehler zurueck','hp '+E('S.hp'));
  ok(E('S.ticket')===false,'Wiederholung: Ticket ist verbraucht/neu zu kaufen');
  ok(E('["busSzene","busKloppe","notbremse"].every(f=>!flag(f))'),'Wiederholung: Entscheidungen der Fahrt zurueckgesetzt');
  lauf(E,180); ok(E('S.modus')==='spiel'&&sauber(E),'Wiederholung: laeuft weiter, kein NaN');
  /* mehrfach hintereinander */
  for(let i=0;i<3;i++){ E('S.hp=1; S.verdacht=101; S.unverwundbarT=0'); lauf(E,3); E('druckAktion()'); }
  ok(E('S.modus')==='spiel'&&E('S.zeit')===zeit0,'Wiederholung: 3x hintereinander stabil, Zeit bleibt','zeit '+E('S.zeit'));
},'Wiederholung');

console.log(fehler?('\n'+fehler+' FEHLER'):'\nalles OK');
process.exit(fehler?1:0);
