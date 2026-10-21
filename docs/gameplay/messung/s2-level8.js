/* Messung Stufe 2, Level 8: Neustart am Abschnitt (Wettlauf), Rang am Levelende.
   Aufruf aus dem Projektordner: node docs/gameplay/messung/s2-level8.js */
const N=require('../../../tools/nachttest.js');
const L=N.lade('level8.html','?lektion=0');
const ev=s=>L.api.ev(s);
let fehler=0;
const pruef=(name,ok,info)=>{ console.log((ok?'OK   ':'FEHL ')+name+(info!==undefined?'  -> '+info:'')); if(!ok) fehler++; };

ev("KAPITEL.aktiv=false; neuesSpiel(); S.modus='spiel'; S.x=600; S.licht=40; S.zeit=30; merkeWettlauf();");
for(let i=0;i<60;i++) ev('update(1/60)');
const xStart=ev('S.absch.x');
ev("S.x=1400; S.licht=100;");
ev('update(1/60)');
pruef('Sonne erwischt: Scheitern mit retry=wettlauf', ev("S.modus==='ende'&&!S.gewonnen&&S.retry==='wettlauf'"), ev('S.modus+" "+S.retry'));
L.taste('KeyE',true); ev('update(1/60)'); L.taste('KeyE',false);
for(let i=0;i<3;i++) ev('update(1/60)');
pruef('E: zurueck am Wettlauf-Start', ev("S.modus==='spiel'")&&Math.abs(ev('S.x')-xStart)<5, 'x '+Math.round(ev('S.x'))+' / '+xStart+', Licht '+Math.round(ev('S.licht')));
pruef('Neustart-Hinweis gezeigt', ev('S.neustartGezeigt===true'));

ev("S.licht=100; update(1/60);");
L.taste('Space',true); ev('update(1/60)'); L.taste('Space',false); ev('update(1/60)');
pruef('Leertaste nach Scheitern: ganz von vorn', ev("S.modus!=='spiel'&&S.modus!=='ende'"), ev('S.modus'));

ev("WERTUNG.reset&&0; let n=0; const alt=WERTUNG.abschluss; WERTUNG.abschluss=function(l,p,z){ n++; window._rang=[l,p,z]; return alt.call(WERTUNG,l,p,z); }; window._n=()=>n;");
ev("neuesSpiel(); S.modus='spiel'; S.licht=30; S.zeit=90; S.tschuessZahl=S.abb.plan.length; setzeFlag('fightFrieden'); levelGeschafft();");
const r=ev('window._rang');
pruef('Rang: genau ein Aufruf mit Level 8', ev('window._n()')===1&&r&&r[0]===8, JSON.stringify(r));
pruef('Rang: Summe 0..100, 4 Zeilen', r&&r[1]>=0&&r[1]<=100&&r[2].length===4);
console.log(fehler?fehler+' Fehler':'alles gruen');
