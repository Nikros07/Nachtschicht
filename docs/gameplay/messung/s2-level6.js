/* Messung Stufe 2, Level 6 (Afterhour): Schwebesprung, Lichter, Rang.
   Lauf aus dem Projektordner:  node docs/gameplay/messung/s2-level6.js
   Ohne Browser (nachttest-Harness). Prueft:
     (a) Schwebesprung: Hoehe, Sinken bei gehaltener Taste, Schwerkraft ohne Taste
     (b) Lichter: Beruehren gibt Wachheit, Lichter zaehlen je einmal
     (c) WERTUNG.abschluss: einmal aufgerufen, Rang in S/A/B/C, Zeilen und Punkte */
const N=require('../../../tools/nachttest.js');

let fehler=0;
const pruefe=(name,bed,info)=>{ if(!bed) fehler++;
  console.log((bed?'OK     ':'FEHLT  ')+name+(info!==undefined?'   ['+info+']':'')); };
const runde=(L,n,fn)=>{ for(let i=0;i<n;i++){ if(fn) fn(i); L.api.ev('update(1/60)'); } };
const r1=x=>Math.round(x*10)/10;

/* ---- (a) Schwebesprung ---------------------------------------------- */
{
  const L=N.lade('level6.html','?lektion=0'), E=c=>L.api.ev(c);
  E("neuesSpiel(); S.modus='spiel'; starteLevel();");
  E("S.x=60; S.y=BODEN; S.vy=0; S.amBoden=true; S.tiefe=0.5; S.vt=0; S.kondition=90;");

  /* Hoehe: Leertaste gehalten, bis die Figur wieder unten ist */
  const hoehe0=E('BODEN-S.y');
  L.taste('Space',true);
  let minY=E('S.y'), vyNachScheitel=null;
  runde(L,50,i=>{ E('S.kondition=Math.max(S.kondition,60)'); const y=E('S.y'); if(y<minY) minY=y;
    if(i===49) vyNachScheitel=E('S.vy'); });
  const hoehe=r1(E('BODEN')-minY);
  pruefe('Schwebesprung: Hoehe ca. 40 px (ohne Taste sonst ca. 29)',Math.abs(hoehe-40)<=3,'Hoehe '+hoehe+' px, Start '+hoehe0);

  /* Halten: nach dem Scheitel sinkt die Figur mit schwebeSink */
  runde(L,20,()=>E('S.kondition=Math.max(S.kondition,60)'));
  const vHalt=r1(E('S.vy'));
  pruefe('Taste halten: Sinken = schwebeSink (18 px/s)',Math.abs(vHalt-18)<0.5,'vy '+vHalt);
  L.taste('Space',false);

  /* Ohne Taste: Schwerkraft ein Drittel (0.33 * 920 = 304 px/s^2) */
  E("S.y=60; S.vy=0; S.amBoden=false; S.kondition=90;");
  runde(L,15,()=>E('S.kondition=Math.max(S.kondition,60)'));
  const vFrei=r1(E('S.vy'));
  const soll=E('0.33*920*0.25');
  pruefe('Schwerkraft im Traum: 0.33 x normal',Math.abs(vFrei-r1(soll))<=3,
         'vy nach 0.25 s '+vFrei+' (soll '+r1(soll)+'; normal waeren '+r1(920*0.25)+')');
  console.log('        Sprungkraft '+E('TUNE.sprungKraft')+' px/s, sinken '+E('TUNE.schwebeSink')+' px/s');
}

/* ---- (b) Lichter ---------------------------------------------------- */
{
  const L=N.lade('level6.html','?lektion=0'), E=c=>L.api.ev(c);
  E("neuesSpiel(); S.modus='spiel'; starteLevel();");
  E("S.x=250; S.y=BODEN; S.vy=0; S.amBoden=true; S.tiefe=LICHTER[0].t; S.vt=0; S.kondition=50;");
  const vorher=E('S.kondition');
  const vorherLicht=E("Object.keys(S.lichtGef).length");
  L.taste('Space',true);
  let flip=null;
  for(let i=0;i<200 && !flip;i++){
    const k0=E('S.kondition');
    L.api.ev('update(1/60)');
    if(E("S.lichtGef.licht1")) flip={k0, k1:E('S.kondition'), frame:i};
  }
  L.taste('Space',false);
  pruefe('Licht 1 (Sprung unter das Licht) beruehrt',!!flip,flip?'nach '+flip.frame+' Bildern':'');
  if(flip){
    const gewinn=r1(flip.k1-flip.k0);
    pruefe('Beruehren gibt Wachheit (+14 minus Abbau)',gewinn>12&&gewinn<15,'Wachheit '+r1(flip.k0)+' -> '+r1(flip.k1)+' ('+gewinn+')');
  }
  pruefe('Lichter-Zaehler: genau eins',E("Object.keys(S.lichtGef).length")-vorherLicht===1);
  /* Nochmal beruehren bringt nichts */
  const k2=E('S.kondition');
  E("S.x=250; S.y=BODEN; S.vy=0; S.amBoden=true; S.tiefe=LICHTER[0].t;");
  runde(L,30);
  pruefe('Licht beruehrt nur einmal (Wachheit unveraendert bis auf Abbau)',
         E("Object.keys(S.lichtGef).length")===1 && E('S.kondition')<k2);
}

/* ---- (c) Rang ------------------------------------------------------- */
function rangLauf(titel,setz){
  const L=N.lade('level6.html','?lektion=0'), E=c=>L.api.ev(c);
  E("neuesSpiel(); S.modus='spiel'; starteLevel();");
  E("WERTUNG.__o=WERTUNG.abschluss; WERTUNG.__n=0; WERTUNG.abschluss=(...a)=>{ WERTUNG.__n++; WERTUNG.__a=a; return WERTUNG.__r=WERTUNG.__o(...a); };");
  E(setz);
  E('levelGeschafft()');
  const n=E('WERTUNG.__n'), args=E('JSON.stringify(WERTUNG.__a)'), r=E('JSON.stringify(WERTUNG.__r)');
  const a=JSON.parse(args);
  const summe=a[1];
  console.log('        '+titel+': Aufrufe '+n+', Punkte '+summe+', Rang '+JSON.parse(r).rang);
  console.log('        Zeilen: '+a[2].map(z=>z.name+' '+z.wert+' '+z.pkt).join(' | '));
  pruefe(titel+': WERTUNG.abschluss genau einmal',n===1);
  pruefe(titel+': Rang in S/A/B/C',['S','A','B','C'].includes(JSON.parse(r).rang));
  pruefe(titel+': Summe 0..100 und 4 Zeilen',summe>=0&&summe<=100&&a[2].length===4);
  return {rang:JSON.parse(r).rang, summe};
}
const gut=rangLauf('gut gespielt',
  "AUFGABEN.forEach(a=>S.erledigt[a.id]=true); LICHTER.forEach(L=>S.lichtGef[L.id]=true); S.kondition=80; S.zeit=200;");
pruefe('gut gespielt ergibt S',gut.rang==='S',gut.rang+' '+gut.summe);
const schlecht=rangLauf('schlecht gespielt',"S.kondition=20; S.zeit=700;");
pruefe('schlecht gespielt ergibt C',schlecht.rang==='C',schlecht.rang+' '+schlecht.summe);

console.log(fehler?('\n'+fehler+' Pruefung(en) fehlgeschlagen'):'\nalles gruen');
process.exitCode=fehler?1:0;
