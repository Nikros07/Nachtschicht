/* Messung C - Level 8: Wie viel Sonne bleibt? Und wann ist der Heimweg unschaffbar?
   Aus der Projektwurzel: node docs/gameplay/messung/c-level8-sonne.js
   1) Sweep: Umwege auf der Karte (0..7) x Kampfausgang (gewonnen/verloren/frieden) x
      Hindernistreffer (0/1/2). Ein perfekter Laeufer (D halten, an jeder Tonne springen,
      die ersten N Hindernisse absichtlich mitnehmen). Ergebnis: Licht an der Haustuer
      oder ERWISCHT.
   2) Sonnenaufgangs-Weg (Flag endeSonne aus Level 7): kann man dort ueberhaupt verlieren?
      Bot steht 70 s still.
   3) Neustart-Kette nach ERWISCHT: wie lange bis man wieder laeuft (Intro per E-Halten
      uebersprungen, sofort "Dann los", Kampf mit dem Konter-Bot)?
   4) Hindernis-Takt: Abstand zwischen zwei Hindernissen in Sekunden (volles Tempo).
   Nichts hier aendert Spieldateien. */
const H=require('./c-hilfe.js');
const fs=require('fs');
const BOT=(()=>{ const src=fs.readFileSync(__dirname+'/c-level8.js','utf8');
  const a=src.indexOf('window.__bot=function'); return src.slice(a,src.indexOf('};`);',a)+2); })();

function lade(opt){
  const L=H.lade('level8.html'); const E=c=>L.api.ev(c);
  const flags=['marvinKennt','taxiTipp','endeHeim'].concat(opt.flags||[]);
  E(`localStorage.setItem(CREW_KEY,'["MORITZ","MAX FERDI","JONAS","DENNIS","SEMIH","LEA"]');
     ${flags.map(f=>`setzeFlag('${f}');`).join('')}
     ${Array.from({length:opt.umwege||0},(_,i)=>`setzeFlag('umweg_${i+1}');`).join('')}
     neuesSpiel();`);
  return {L,E};
}

/* Teil 1: Sweep. Der Kampf wird nicht gespielt, sondern sein Ausgang gesetzt - genau wie
   beendeGrossenKampf() es tut (Licht + 22 bei Niederlage). */
function lauf(umwege,ausgang,treffer,tempoMaxFerdi=true){
  const {L,E}=lade({umwege});
  if(!tempoMaxFerdi) E(`localStorage.setItem(CREW_KEY,'["MORITZ"]'); neuesSpiel();`);
  E(`KAPITEL.aktiv=false; S.modus='spiel'; S.abb.plan=[];`);
  if(ausgang==='verloren') E(`S.licht=Math.min(95,S.licht+KAMPF8.lichtStrafeBeiNiederlage);`);
  const licht0=E('S.licht');
  L.taste('KeyD',true);
  const gesprungen=new Set(); let t=0, halt=0;
  while(E('S.modus')==='spiel'&&t<200){
    const o=JSON.parse(E(`JSON.stringify((()=>{ for(let i=0;i<HINDERNISSE.length;i++){ if(S.hinTreffer[i]) continue;
      const o=HINDERNISSE[i]; const effX=o.art==='jogger'?o.x+Math.sin(S.t*TUNE.joggerTempo+i)*TUNE.joggerAmplitude:o.x;
      const d=effX-S.x; if(d>-15&&d<40) return {i,d,boden:S.amBoden}; } return null; })())`));
    if(o&&!gesprungen.has(o.i)&&o.i>=treffer&&o.d<=24&&o.boden){ L.taste('Space',true); gesprungen.add(o.i); halt=14; }
    if(halt>0){ halt--; if(!halt) L.taste('Space',false); }
    E('update(1/60)'); t+=1/60;
  }
  L.taste('KeyD',false);
  const m=E('S.modus');
  return { umwege, ausgang, treffer, licht0:Math.round(licht0), ergebnis:m==='finale'?'heim, Licht '+Math.round(E('S.licht')):'ERWISCHT', getroffen:E('Object.keys(S.hinTreffer).length'), laufS:+t.toFixed(1) };
}
const sweep=[];
for(const tempo of [true,false])
  for(const ausgang of ['gewonnen','verloren'])
    for(const treffer of [0,1,2])
      for(let u=0;u<=7;u++){ const r=lauf(u,ausgang,treffer,tempo); r.maxFerdi=tempo; sweep.push(r); }

console.log('=== 1) Sweep: Licht an der Haustuer (Kampf-Frieden = wie gewonnen, kein Lichtaufschlag) ===');
for(const tempo of [true,false]){
  console.log('\n'+(tempo?'mit MAX FERDI (Tempo 115)':'ohne MAX FERDI (Tempo 100)'));
  console.log('Ausgang   Treffer | '+[0,1,2,3,4,5,6,7].map(u=>('U'+u).padStart(6)).join(''));
  for(const ausgang of ['gewonnen','verloren'])
    for(const treffer of [0,1,2]){
      const z=sweep.filter(r=>r.maxFerdi===tempo&&r.ausgang===ausgang&&r.treffer===treffer)
        .map(r=>((r.ergebnis==='ERWISCHT'?'X':r.ergebnis.replace('heim, Licht ',''))+(r.getroffen!==treffer?'*':'')).padStart(6));
      console.log(ausgang.padEnd(10)+String(treffer).padStart(7)+' | '+z.join(''));
    }
}

/* Teil 2: Sonnenaufgangs-Weg - stillstehen */
{
  const {L,E}=lade({flags:['endeSonne']});
  E(`KAPITEL.aktiv=false; S.modus='spiel'; S.abb.plan=[];`);
  let t=0; while(E('S.modus')==='spiel'&&t<90){ E('update(1/60)'); t+=1/60; }
  console.log('\n=== 2) Weg SONNENAUFGANG, 0 Eingaben ===');
  console.log(JSON.stringify({nachS:+t.toFixed(1), modus:E('S.modus'), x:Math.round(E('S.x')), licht:Math.round(E('S.licht')),
    gewonnen:E('S.gewonnen'), faenger:E('S.faenger')}));
}

/* Teil 3: Neustart-Kette */
{
  const {L,E}=lade({umwege:7});
  E(BOT);
  E(`KAPITEL.aktiv=false; S.modus='spiel'; S.licht=99.9; S.abb.plan=[];`);
  let t=0; const takt=()=>{ E('update(1/60)'); t+=1/60; };
  while(E('S.modus')==='spiel') takt();
  const tErwischt=t;
  for(let i=0;i<60;i++) takt();                 // 1 s lesen
  L.taste('Space',true); L.taste('Space',false); takt();   // Neustart -> titel
  L.taste('Space',true); L.taste('Space',false); takt();   // titel -> intro (+Kapitelkarte)
  L.taste('KeyE',true);
  let n=0; while(!E('!!GESPR')&&n<1200){ takt(); n++; }
  L.taste('KeyE',false); takt();
  const tGespraech=t;
  /* sofort "Dann los" (letzte Wahl): S bis unten, dann E */
  const nW=E('GESPR?GESPR.wahlen.length:0');
  for(let i=0;i<nW-1;i++){ L.taste('KeyS',true); L.taste('KeyS',false); takt(); }
  L.taste('KeyE',true); L.taste('KeyE',false); takt();
  const an={}; const halte=(k,c,s)=>{ if(!!an[k]!==!!s){ L.taste(c,!!s); an[k]=!!s; } };
  const tKampf=t;
  while(E('S.modus')==='kampf'&&t-tKampf<120){
    const o=JSON.parse(E(`JSON.stringify(__bot('konter',0.05))`));
    halte('l','KeyA',o.l); halte('r','KeyD',o.r); halte('u','KeyW',o.u); halte('d','KeyS',o.d); halte('b','ShiftLeft',o.b);
    if(o.e){ L.taste('KeyE',true); L.taste('KeyE',false); }
    if(o.roll){ L.taste('Space',true); L.taste('Space',false); }
    takt();
  }
  for(const [k,c] of [['l','KeyA'],['r','KeyD'],['u','KeyW'],['d','KeyS'],['b','ShiftLeft']]) halte(k,c,false);
  console.log('\n=== 3) Neustart-Kette nach ERWISCHT (7 Umwege) ===');
  console.log(JSON.stringify({ bisKonfrontationS:+(tGespraech-tErwischt).toFixed(1), kampfS:+(t-tKampf).toFixed(1),
    gesamtBisWiederLaufenS:+(t-tErwischt).toFixed(1), modusDanach:E('S.modus'), lichtStart:Math.round(E('S.licht')),
    kampf:E("flag('fightGewonnen')?'gewonnen':'verloren'"),
    kapitelkarteKamWieder:true }));
}

/* Teil 4: Hindernis-Takt */
{
  const {E}=lade({});
  const h=JSON.parse(E('JSON.stringify(HINDERNISSE)'));
  const tempo=115;
  const abst=h.slice(1).map((o,i)=>+((o.x-h[i].x)/tempo).toFixed(2));
  const sch=JSON.parse(E('JSON.stringify(SCHATTEN)'));
  console.log('\n=== 4) Hindernis-Takt bei Tempo 115 (s zwischen zwei Hindernissen) ===');
  console.log('Arten:',h.map(o=>o.art).join(','));
  console.log('Abstaende s:',abst.join(' '),'| min',Math.min(...abst),'max',Math.max(...abst));
  console.log('erstes Hindernis nach',(h[0].x-40)/tempo,'s; Haustuer nach',+((E('ZIEL_X')-40)/tempo).toFixed(1),'s');
  console.log('Schatten:',sch.map(s=>s.art+' '+s.von+'-'+s.bis).join(', '));
}
