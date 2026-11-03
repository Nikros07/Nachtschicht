/* Messung n3 - Level 8: Textbreiten und Lage (W=320, H=180). Aus der Projektwurzel:
     node docs/gameplay/messung/n3-level8-text.js
   textW(s,size)=Zeichen*4*size-size (nacht/bild.js). Pixel bleiben im Browser ungeprueft. */
const N=require('../../../tools/nachttest.js');
const L=N.lade('level8.html','?lektion=0'); const E=s=>L.api.ev(s);
const W=320, H=180; let fehler=0;
const tw=(s,z=1)=>E(`textW(${JSON.stringify(s)},${z})`);
const pruef=(n,ok,i)=>{ console.log((ok?'OK   ':'FEHL ')+n+'  -> '+i); if(!ok) fehler++; };
/* 1) Fail-Text unten (Zeile 1307: Groesse 1, zentriert, y=H-18) */
for(const [n,t] of [['Tastatur','E: NOCHMAL HIER - LEERTASTE: GANZ VON VORN'],['Touch','NOCHMAL HIER - ODER GANZ VON VORN']])
  pruef('Fail-Text '+n, tw(t)<312, tw(t)+' px (Grenze 312)');
/* 2) Ansage: Titel Groesse 3 bei y=H/2-26, Satz bei y=H/2+6; Arena-Name Groesse 2 bei y=H/2-4 */
const ti=tw('RUNDE 2',3), tx=Math.round((W-ti)/2);
pruef('Ansage-Titel breit', ti<312, ti+' px, x '+tx+'..'+(tx+ti));
const satz=[E('TUNE.ansageSatz2'),E('TUNE.ansageSatz3')];
satz.forEach(s=>pruef('Ansage-Satz '+s, tw(s)<312, tw(s)+' px'));
/* Lebensbalken des Anfuehrers: x W/2-35..W/2+35 (70 px +1 Rand), y 5..10; Herzen/Ausdauer links x 6..~60, y 6..17;
   PHASE-Text rechts oben y 6..10. Ansage-Titel y = H/2-26 .. +14 */
const yT=H/2-26, hT=5*3, yHud=11;
pruef('Ansage-Titel unter dem Lebensbalken (y '+yT+' > '+yHud+')', yT>yHud+10, 'Abstand '+(yT-yHud)+' px');
const ph=['PHASE 3  DIE BAUSTELLE'].map(s=>tw(s)); 
pruef('PHASE-Text kollidiert nicht mit Lebensbalken', W-ph[0]-6 > W/2+36, 'PHASE-Text beginnt x '+(W-ph[0]-6)+', Balken endet x '+(W/2+36));
const arena=['DIE STRASSE','DER HINTERHOF','DIE BAUSTELLE'].map(s=>tw(s,2));
pruef('Arena-Name breit', Math.max(...arena)<312, arena.join('/')+' px');
/* Arena-Name (y 86..95, Glow +-2 = 84..97) und Ansage laufen gleichzeitig (arenaWechselT 1.6 s, ansageSek 1.5 s) */
const titelEnde=yT+hT, arenaAnf=H/2-4, arenaEnde=arenaAnf+10, satzAnf=H/2+6;
pruef('Arena-Name zwischen Titel und Satz', titelEnde<=arenaAnf && arenaEnde<=satzAnf, 'Titel bis y '+titelEnde+', Arena '+arenaAnf+'..'+arenaEnde+', Satz ab y '+satzAnf+' (Glow +-2 beruehrt Titel/Satz)');
console.log(fehler?fehler+' Fehler':'alles gruen');
