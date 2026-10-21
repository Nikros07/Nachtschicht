/* Pruefstand Stufe 2, Level 4 (DIE SCHLANGE): Combo, PERFEKT, Phasen-Ansage, Rang.
   node docs/gameplay/messung/s2-level4.js        (aus dem Projektordner starten)

   (a) Das neue Element wirkt: Zustandswerte vorher/nachher, dazu die SAFT- und MUSIK-Aufrufe,
       die das Level tatsaechlich macht (abgefangen durch Wrapper, die nur mitschreiben).
   (b) Ein simuliertes Levelende: der Tuersteher faellt, die Cutscene wird gehalten, und
       WERTUNG.abschluss liefert den Rang.
   Keine Pixel, kein Ton - nur die Zustandswerte. Die Konter-Druecke werden gesetzt, nicht
   gespielt; die Reaktionszeit misst s2-Bots, nicht dieses Skript. */
'use strict';
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));
const L=N.lade('level4.html','?lektion=0');
const E=c=>L.api.ev(c);
const bild=(n=1)=>{ for(let i=0;i<n;i++) E('update(1/60)'); };

/* Aufrufe mitschreiben: die Wrapper rufen das Original weiter. */
E(`(()=>{ window.__log=[];
  const w=(obj,name,tag)=>{ const f=obj[name]; obj[name]=function(...a){
    __log.push(tag+' '+JSON.stringify(a)); return f.apply(this,a); }; };
  w(SAFT,'popup','popup'); w(SAFT,'treffer','treffer'); w(SAFT,'zeitlupe','zeitlupe');
  w(SAFT,'schaden','schaden'); w(SAFT,'erfolg','erfolg'); w(SAFT,'fund','fund');
  w(MUSIK,'stinger','stinger'); w(WERTUNG,'abschluss','abschluss');
})()`);
const logLeeren=()=>E('__log.length=0');
const log=()=>E('__log.slice()');

const zustand=()=>E(`({modus:S.modus, konter:S.konter, versuche:S.versuche, treffer:S.treffer,
  combo:S.combo, maxCombo:S.maxCombo, perfekt:S.perfekt, phase:S.phase,
  hinweisCombo:S.hinweisCombo, ansage:S.ansage, ansageT:+S.ansageT.toFixed(2),
  herz:S.herzVerlust, bossHp:S.boss?S.boss.hp:null})`);

/* Kampf vorbereiten: Tuersteher steht, Spieler in Reichweite, ohne Angriffe dazwischen. */
E(`(()=>{ starteKampf(); const b=S.boss, s=S.spieler;
  b.anlauf=false; b.pauseT=99; b.x=200; s.x=186; s.t=b.t; S.erholungT=0; })()`);
bild(1);

/* Ein Konter-Druck: der Tuersteher holt aus, der Druck faellt auf den Zeitpunkt zT
   im Fenster (d = Ausholdauer). PERFEKT ab 0.887 (letztes Drittel bei Anteil 0.34). */
function konter(zT){
  bild(30);                            // Hitstop des letzten Konters abwarten, sonst puffert das Spiel den Druck
  E(`(()=>{ const b=S.boss, s=S.spieler;
    b.zustand='ausholen'; b.zT=${zT}; b.ausholenDauer=1; b.fensterAnteil=TUNE.fensterAnteil;
    b.art='schwung'; b.unblockbarJetzt=false; b.trefferGesetzt=false;
    s.zustand='frei'; s.zT=0; s.trefferGesetzt=false; s.ausdauer=KAMPF.ausdauerMax; S.erholungT=0; })()`);
  L.taste('KeyE',true); L.taste('KeyE',false);
  bild(1);
}
/* Ein Druck ohne Konter (Tuersteher holt nicht aus): zaehlt als Versuch, nicht als Konter. */
function fehlgriff(){
  bild(30);
  E(`(()=>{ const b=S.boss, s=S.spieler; b.zustand='frei'; b.pauseT=99; s.zustand='frei';
    s.ausdauer=KAMPF.ausdauerMax; S.erholungT=0; })()`);
  L.taste('KeyE',true); L.taste('KeyE',false); bild(1);
}

const out=[];
const sep=t=>out.push('\n== '+t);

sep('(a) Vorher');
out.push(JSON.stringify(zustand()));

sep('(a) Konter 1: PERFEKT (zT 0.95)');
logLeeren(); konter(0.95);
out.push(JSON.stringify(zustand())); out.push(...log());

sep('(a) Konter 2: normal (zT 0.70) - Phasenwechsel bei Rest 3 von 5');
logLeeren(); konter(0.70);
out.push(JSON.stringify(zustand())); out.push(...log());
/* Spielzeit, die in 1.5 s echter Zeit ankommt (ohne Zeitlupe 1.5 s, minus Hitstop). */
out.push('Spielzeit in 1.5 s echter Zeit nach dem Phasenwechsel: '+E('(()=>{ let t=0; for(let i=0;i<90;i++) t+=SAFT.takt(1/60); return t.toFixed(3); })()')+' s (ohne Zeitlupe 1.5)');
out.push('Ansage nach 120 Bildern (2 s) abgelaufen:');
bild(120); out.push(JSON.stringify(zustand()));

sep('(a) Konter 3: PERFEKT - Combo 3 erreicht, Stinger combo');
logLeeren(); konter(0.95);
out.push(JSON.stringify(zustand())); out.push(...log());

sep('(a) Fehlgriff, dann Treffer kassiert: Combo muss auf 0');
logLeeren(); fehlgriff();
bild(30);
E(`(()=>{ const b=S.boss, s=S.spieler; b.zustand='schlag'; b.zT=0; b.schlagDauer=0.3;
  b.art='schwung'; b.trefferGesetzt=false; b.reichweite=19; s.unverwundbar=0; s.zustand='frei'; s.blockAn=false;
  s.x=b.x-10; s.t=b.t; S.erholungT=0; })()`);
bild(2);
out.push(JSON.stringify(zustand())); out.push(...log());

sep('(a) Konter bis zum Sieg (Rest-Lebenspunkte des Tuerstehers)');
let runden=0;
while(E('S.boss?S.boss.hp:0')>0 && runden<12 && E('S.modus')==='kampf'){
  E('S.spieler.unverwundbar=0; S.boss.zustand="frei"; S.boss.pauseT=99');
  konter(0.95); runden++;
}
out.push('Runden: '+runden+'  Modus: '+E('S.modus')+'  Combo: '+E('S.combo')+'  maxCombo: '+E('S.maxCombo'));
out.push('Letzte Phasen-Ansage: '+E('S.ansage')+' / '+E('S.ansageSatz')+'  Phase '+E('S.phase'));

sep('(b) Levelende: Cutscene halten, dann levelGeschafft');
E('S.zeit=75');                       // Spielzeit, damit die Zeitwertung eine Zahl hat
logLeeren();
/* Der Polaroid-Moment wartet auf einen Tipp (wie im Spiel), dann die Cutscene halten. */
for(let i=0;i<10 && E('S.szeneT')===0;i++){ L.taste('KeyE',true); L.taste('KeyE',false); bild(30); }
out.push('Cutscene-Szene nach Tippen: '+E('S.szene'));
L.taste('KeyE',true);
bild(90);                             // Cutscene wird nach 0.7 s Halten zum Ende
L.taste('KeyE',false);
out.push('Modus nach Halten: '+E('S.modus')+'  gewonnen: '+E('S.gewonnen'));
out.push(...log());
out.push('Bestrang Level 4: '+E('WERTUNG.best(4)')+'  alle: '+JSON.stringify(E('WERTUNG.alle()')));

sep('(b) Zeilen des Rangs');
out.push(JSON.stringify(E('__log.filter(x=>x.startsWith("abschluss")).map(x=>x)')));

console.log(out.join('\n'));
