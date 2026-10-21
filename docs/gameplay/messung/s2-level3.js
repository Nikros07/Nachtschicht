/* Messung Stufe 2 - Level 3 (Nachtbus, level3.html).
   node docs/gameplay/messung/s2-level3.js

   (a) SOFORTNEUSTART: Scheitern im Bus -> E -> Bus-Zustand wie beim Einsteigen
       (Pegel, Zeit, kein Titel, kein Sprint). Scheitern im Sprint bleibt "NOCHMAL".
   (b) KURVEN: Vorwarnung 1 s, dann Schub; Weg in Pfeilrichtung, Abstand der Kurven.
   (c) RANG: echtes Levelende (Tuer erreicht -> Kassenbild) ruft WERTUNG.abschluss;
       zwei Laeufe, ein guter und ein schlechter Stand.
   (d) SAFT und MUSIK: Aufrufe zaehlen, Song und Abschnitt im Bus.

   Laeuft aus dem Projektordner (tools/nachttest.js liest die Seite relativ). Exit 1 bei Fehlern. */
const path=require('path');
process.chdir(path.join(__dirname,'..','..','..'));
const N=require('../../../tools/nachttest.js');

let fehler=0;
const pruefe=(name,ok,info)=>{ if(!ok) fehler++;
  console.log((ok?'  OK     ':'  FEHLER ')+name+(info!==undefined?'  ('+info+')':'')); };

function neu(){
  const L=N.lade('level3.html','?lektion=0');
  const E=c=>L.api.ev(c);
  E('KAPITEL.aktiv=false');                       // Kapitelkarte nicht mitzaehlen
  return {L,E};
}
/* Simuliert Sekunden. Update und Zeichnen, wie das Spiel es jedes Bild macht. */
function laufe(E,sek){ const n=Math.round(sek*60); for(let i=0;i<n;i++) E('update(1/60);draw(1/60)'); }
const zustand=E=>JSON.parse(E('JSON.stringify({modus:S.modus,pegel:+S.pegel.toFixed(2),zeit:+S.zeit.toFixed(2),'+
  'hp:S.hp,imBus:S.imBus,busZeit:+S.busZeit.toFixed(2),x:+S.x.toFixed(1),geredet:Object.keys(S.geredet).length,'+
  'kurve:S.kurve?S.kurve.phase:null,verdacht:+S.verdacht.toFixed(1),maxV:+S.maxVerdacht.toFixed(1),'+
  'erwischt:S.erwischtZahl,aktion:mobilKontext().aktion,zwei:mobilKontext().zwei})'));

/* ---------- (a) SOFORTNEUSTART ---------- */
console.log('(a) Sofortneustart im Bus');
{
  const {E,L}=neu();
  E('starteSprint()');
  E('window.__hol=[]');
  L.taste('KeyD',true);
  laufe(E,5);                                    // 5 s Sprint, damit die Zeit nicht 0 ist
  L.taste('KeyD',false);
  E('S.pegel=37');                               // vor dem Einsteigen: Pegel 37
  E('S.x=SPRINT_B-10');
  laufe(E,1/60);                                 // Bus betreten
  const einstieg=zustand(E);
  pruefe('im Bus nach dem Einsteigen', einstieg.modus==='spiel'&&einstieg.imBus===true, einstieg.modus);
  laufe(E,12);                                   // zwoelf Sekunden im Bus, Pegel sinkt, Zeit laeuft
  const vorher=zustand(E);
  pruefe('Pegel im Bus gesunken', vorher.pegel<37, vorher.pegel);
  E('S.hp=1; erwischt()');                        // Kontrolle, letztes Leben -> Ende
  const ende=zustand(E);
  pruefe('Scheitern im Bus -> Ende mit imBus', ende.modus==='ende'&&ende.imBus===true, ende.modus);
  pruefe('Ende-Knoepfe: NOCHMAL AB BUS / GANZ VON VORN', ende.aktion==='NOCHMAL AB BUS'&&ende.zwei==='GANZ VON VORN',
         ende.aktion+' | '+ende.zwei);
  L.taste('KeyE',true); L.taste('KeyE',false);  // Hauptknopf
  const nach=zustand(E);
  console.log('  Zustand              Einstieg  vorher   Ende     nach Neustart');
  console.log('  Modus               ',einstieg.modus.padEnd(9),vorher.modus.padEnd(9),ende.modus.padEnd(9),nach.modus);
  console.log('  Pegel               ',String(einstieg.pegel).padEnd(9),String(vorher.pegel).padEnd(9),String(ende.pegel).padEnd(9),nach.pegel);
  console.log('  Zeit (s)            ',String(einstieg.zeit).padEnd(9),String(vorher.zeit).padEnd(9),String(ende.zeit).padEnd(9),nach.zeit);
  console.log('  Leben               ',String(einstieg.hp).padEnd(9),String(vorher.hp).padEnd(9),String(ende.hp).padEnd(9),nach.hp);
  pruefe('Neustart direkt im Bus (kein Titel, kein Sprint)', nach.modus==='spiel'&&nach.imBus===true, nach.modus);
  pruefe('Pegel vom Einstieg zurueck', Math.abs(nach.pegel-37)<0.01, nach.pegel);
  pruefe('Zeit vom Einstieg zurueck', Math.abs(nach.zeit-einstieg.zeit)<0.02, nach.zeit+' vs '+einstieg.zeit);
  pruefe('Leben und Gespraeche zurueckgesetzt', nach.hp===3&&nach.geredet===0, 'hp '+nach.hp+', geredet '+nach.geredet);
  pruefe('Bus-Zeit bei 0', nach.busZeit<0.05, nach.busZeit);
  // Die Zeit darf nach dem Neustart wieder normal weiterlaufen (kein Stillstand)
  laufe(E,1); const weiter=zustand(E);
  pruefe('Bus laeuft nach dem Neustart weiter', weiter.busZeit>0.9, weiter.busZeit);
  // Sprint-Scheitern bleibt wie bisher: NOCHMAL, nicht im Bus
  const {E:E2,L:L2}=neu();
  E2('starteSprint()'); E2('S.sprintZeit=TUNE.sprintSekunden+1'); laufe(E2,1/60);
  const sp=zustand(E2);
  pruefe('Sprint-Scheitern -> Ende ohne imBus', sp.modus==='ende'&&sp.imBus===false, sp.modus);
  pruefe('Sprint-Scheitern Knopf NOCHMAL', sp.aktion==='NOCHMAL'&&sp.zwei===null, sp.aktion);
}

/* ---------- (b) KURVEN ---------- */
console.log('(b) Kurven im Bus');
{
  const {E,L}=neu();
  E('starteSprint()'); E('S.x=SPRINT_B-10'); laufe(E,1/60);     // in den Bus
  E('S.x=600; S.unverwundbarT=1e9');                           // stehen, nicht erwischt werden
  const ereignisse=[]; let warnBei=null, vorPhase=null, schubAb=null, x0=null, dir=0;
  for(let i=0;i<Math.round(32*60);i++){
    E('update(1/60);draw(1/60)');
    const z=JSON.parse(E('JSON.stringify({ph:S.kurve?S.kurve.phase:null,dir:S.kurve?S.kurve.dir:0,x:S.x,bz:S.busZeit})'));
    if(z.ph==='warn'&&vorPhase!=='warn'){                       // Vorwarnung beginnt
      ereignisse.push({warn:z.bz,dir:z.dir});
      if(!warnBei) warnBei={bz:z.bz};
    }
    if(z.ph==='schub'&&vorPhase!=='schub'){ x0=z.x; }         // Schub beginnt
    if(z.ph===null&&vorPhase==='schub'){                       // Schub vorbei
      const e=ereignisse[ereignisse.length-1]; e.fertig=true; e.dx=+(z.x-x0).toFixed(1);
    }
    vorPhase=z.ph;
  }
  const fert=ereignisse.filter(e=>e.fertig);
  console.log('  Kurven in 32 s:',ereignisse.length,'  Ereignisse:',JSON.stringify(ereignisse.map(e=>({warn:+e.warn.toFixed(2),dir:e.dir,dx:e.dx}))));
  pruefe('Mindestens drei Kurven in 32 s Busszeit', ereignisse.length>=3, ereignisse.length);
  if(ereignisse.length>=2){
    const abst=ereignisse[1].warn-ereignisse[0].warn;
    pruefe('Abstand der Kurven ~10 s', Math.abs(abst-10)<0.1, abst.toFixed(2));
  }
  if(fert.length){
    const f=fert[0];
    const erwartet=f.dir*70*0.8;
    pruefe('Schub-Weg in Pfeilrichtung (~56 px)', Math.sign(f.dx)===Math.sign(f.dir)&&Math.abs(Math.abs(f.dx)-Math.abs(erwartet))<3, f.dx+' erwartet '+erwartet.toFixed(1));
  } else pruefe('Schub-Weg gemessen', false, 'kein abgeschlossener Schub');
  pruefe('Erste Vorwarnung nach etwa 10 s', warnBei&&Math.abs(warnBei.bz-10)<0.2, warnBei&&warnBei.bz.toFixed(2));
}

/* ---------- (c) RANG am Levelende ---------- */
function rangLauf(titel,vorbereiten){
  const {E,L}=neu();
  E('window.__hol=[]; (function(){ const o=WERTUNG.abschluss; WERTUNG.abschluss=function(l,p,z){ window.__hol.push([l,p,z]); return o(l,p,z); }; })()');
  E('starteSprint()'); laufe(E,8);                            // 8 s Sprint
  E('S.x=SPRINT_B-10'); laufe(E,1/60); laufe(E,1);            // in den Bus
  E('S.kloppeStand="vorbei"; S.x=TUER_X+2; S.unverwundbarT=1e9');   // Tuer erreicht, Kloppe uebersprungen
  if(vorbereiten) E(vorbereiten);
  laufe(E,15);                                                // Abspann (12,4 s) laeuft durch
  const st=zustand(E);
  const hol=JSON.parse(E('JSON.stringify(window.__hol)'));
  const alle=JSON.parse(E('JSON.stringify(WERTUNG.alle())'));
  console.log('  '+titel+': modus='+st.modus+' | Aufrufe WERTUNG.abschluss='+hol.length+' | Rang='+alle[3]);
  if(hol.length) console.log('    Punkte '+hol[0][1]+'  Zeilen '+JSON.stringify(hol[0][2]));
  pruefe(titel+': Levelende erreicht', st.modus==='ende', st.modus);
  pruefe(titel+': WERTUNG.abschluss genau einmal', hol.length===1, hol.length);
  pruefe(titel+': Rang gesetzt', ['S','A','B','C'].includes(alle[3]), alle[3]);
  if(hol.length){
    const sum=hol[0][2].reduce((s,z)=>s+z.pkt,0);
    pruefe(titel+': Zeilen summieren sich zu den Punkten', sum===hol[0][1], sum+' = '+hol[0][1]);
    pruefe(titel+': Punkte 0..100', hol[0][1]>=0&&hol[0][1]<=100, hol[0][1]);
  }
  return {alle,hol};
}
console.log('(c) Rang am Levelende');
const gut=rangLauf('Lauf gut (natuerlich)', null);
const schlecht=rangLauf('Lauf schlecht (2 Kontrollen, 110 s, Verdacht 95)', 'S.zeit=110; S.erwischtZahl=2; S.maxVerdacht=95');
pruefe('schlechter Lauf ergibt niedrigeren oder gleichen Rang', schlecht.alle[3]!=='S'&&schlecht.alle[3]!==undefined, schlecht.alle[3]);
pruefe('Rang gut ist mindestens so gut wie schlecht',
  ['C','B','A','S'].indexOf(gut.alle[3])>=['C','B','A','S'].indexOf(schlecht.alle[3]), gut.alle[3]+' vs '+schlecht.alle[3]);

/* ---------- (d) SAFT und MUSIK ---------- */
console.log('(d) Saft- und Musik-Aufrufe');
{
  const {E,L}=neu();
  E(`window.__saft={}; window.__mus=[];
    (function(){
      for(const k of ["treffer","schaden","fund","erfolg","landung","trauma","teilchen"]){
        const o=SAFT[k]; SAFT[k]=function(){ window.__saft[k]=(window.__saft[k]||0)+1; return o.apply(this,arguments); };
      }
      const sp=MUSIK.spiele; MUSIK.spiele=function(id){ window.__mus.push("spiele:"+id); return sp.apply(this,arguments); };
      const ab=MUSIK.abschnitt; MUSIK.abschnitt=function(n){ window.__mus.push("abschnitt:"+n); return ab.apply(this,arguments); };
      const st=MUSIK.stinger; MUSIK.stinger=function(n){ window.__mus.push("stinger:"+n); return st.apply(this,arguments); };
    })()`);
  E('starteSprint()'); L.taste('KeyD',true);
  for(let i=0;i<12*60;i++){ if(i%40===0) L.taste('Space',true); if(i%40===3) L.taste('Space',false); E('update(1/60);draw(1/60)'); }
  L.taste('KeyD',false);                                     // Sprint: Stolpern und Landungen
  E('S.x=SPRINT_B-10'); laufe(E,1/60);                       // in den Bus
  E('S.x=FOTO3.x; S.tiefe=FOTO3.t; S.unverwundbarT=1e9'); L.taste('KeyE',true); L.taste('KeyE',false); laufe(E,1/60); // Polaroid
  E('S.x=600; S.unverwundbarT=0; S.verdacht=80'); laufe(E,2);      // Verdacht hoch -> Alarm-Abschnitt
  E('S.verdacht=0'); laufe(E,2);                             // Verdacht weg -> ohne Alarm
  E('S.hp=1; erwischt()'); laufe(E,1/60);                    // Fail-Stinger
  E('S.hp=3; S.modus="spiel"; S.imBus=true; S.kloppeStand="vorbei"; S.x=TUER_X+2; S.unverwundbarT=1e9'); laufe(E,1/60); laufe(E,15);  // Ziel -> Sieg
  const z=JSON.parse(E('JSON.stringify(window.__saft)'));
  const m=JSON.parse(E('JSON.stringify(window.__mus)'));
  console.log('  SAFT-Aufrufe:',JSON.stringify(z));
  console.log('  MUSIK-Aufrufe (erste Eintraege):',JSON.stringify([...new Set(m)]));
  const arten=Object.keys(z).filter(k=>k!=='trauma'&&z[k]>0).length;
  pruefe('mindestens 6 Saft-Stellen wirken (Aufrufarten >= 6)', arten>=6, arten+' Arten: '+Object.keys(z).join(','));
  pruefe('Erschuettern ueber SAFT.trauma', (z.trauma||0)>0, z.trauma||0);
  pruefe('Song Sprint im Sprint, Song Bus im Bus', m.includes('spiele:sprint')&&m.includes('spiele:bus'));
  pruefe('Alarm-Abschnitt ab Verdacht 70', m.includes('abschnitt:alarm'));
  pruefe('Stinger fail und sieg', m.includes('stinger:fail')&&m.includes('stinger:sieg'));
}

console.log(fehler?'\nFEHLER: '+fehler+' Pruefung(en) rot':'\nALLE PRUEFUNGEN GRUEN');
process.exit(fehler?1:0);
