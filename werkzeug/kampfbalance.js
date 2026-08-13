/* ============================================================================
   KAMPFBALANCE - LEVEL 2, DER KRACHER

   Spielt den Kampf hundertfach gegen verschiedene Spielertypen durch und
   sagt, wie oft welcher gewinnt. Damit sind die Zahlen in TUNE nicht
   geraten, sondern gemessen.

   Was dabei rauskommen soll:
     - bis ~420 ms Reaktionszeit gewinnt man sicher (erster Kampf im Spiel)
     - deutlich langsamer wird es knapp
     - auf Finten reinbeissen kostet ungefaehr ein Herz
     - zu frueh druecken und E-Dauerfeuer gewinnen NIE

       node werkzeug/kampfbalance.js
   ========================================================================== */
const { lade, levelPfad } = require('./pruefstand');
const { ev } = lade(levelPfad(2));
const DT=1/60;

function einKampf(strategie,maxSek=90){
  ev('neuesSpiel(); S.modus="spiel"; starteKampf();');
  const gesehen=new Set(); let t=0, letzterDruck=-9;
  while(t<maxSek){
    if(ev('S.modus')!=='kampf') break;
    const g=ev('({z:S.gegner.zustand,t:S.gegner.t,w:S.gegner.windDauer,'
      +'m:S.gegner.muster,finte:!!MUSTER[S.gegner.muster].finte})');
    gesehen.add(g.m);
    if(strategie(g,t,letzterDruck)){ ev('aktionPuffer.push(S.t)'); letzterDruck=t; }
    ev(`update(${DT}); draw(${DT})`);
    t+=DT;
  }
  return { hp:ev('S.hp'), gewonnen:ev('S.modus==="cutscene"'), gesehen:[...gesehen], zeit:t };
}

const fenster=ev('TUNE.konterFenster');
const oeffnetBei=g=>g.w*(1-fenster);

/* Ein Mensch sieht das Ausholen anfangen - Farbe, Ton, Balken - und drueckt
   <reaktion> Sekunden spaeter. Vor der Marke drueckt er nicht, die lernt man
   nach dem zweiten Konter. */
const mensch=(reaktion,beisstAufFinten=false)=>(g,t,letzter)=>{
  if(g.z!=='wind'||t-letzter<0.35) return false;
  if(g.finte&&!beisstAufFinten) return false;
  return g.t>=Math.max(reaktion,oeffnetBei(g));
};

function reihe(name,strategie,n=60,maxSek=90){
  let siege=0, herzen=0, schlimmst=0, dauer=0, muster=new Set();
  for(let i=0;i<n;i++){
    const r=einKampf(strategie,maxSek);
    if(r.gewonnen) siege++;
    const v=3-r.hp; herzen+=v; if(v>schlimmst) schlimmst=v;
    dauer+=r.zeit; r.gesehen.forEach(m=>muster.add(m));
  }
  console.log(`  ${name.padEnd(24)} Siege ${String(Math.round(siege/n*100)).padStart(3)}%`
    +`   Herzen ${(herzen/n).toFixed(2)} (max ${schlimmst})`
    +`   ${(dauer/n).toFixed(1)}s   [${[...muster].sort().join(' ')}]`);
  return siege/n;
}

console.log('DER KRACHER - '+ev('TUNE.gegnerTreffer')+' Konter noetig, '
  +'Konterfenster '+fenster);
console.log('');
console.log('Ausholdauern (frisch / nach 3 Treffern):');
const langsamer=ev('Math.max(TUNE.gegnerTempoMin,1-TUNE.gegnerTempo*3)');
for(const m of ev('Object.keys(MUSTER)')){
  const w=ev(`TUNE.gegnerWindup*MUSTER["${m}"].wind`);
  console.log(`  ${m.padEnd(10)} ${w.toFixed(2)}s / ${(w*langsamer).toFixed(2)}s`
    +`   Konterfenster ${(w*fenster).toFixed(2)}s / ${(w*langsamer*fenster).toFixed(2)}s`);
}
console.log('');

const soll=[];
soll.push(['perfekt',            reihe('perfekt (0 ms)',        mensch(0)),            1,1]);
soll.push(['schnell',            reihe('schnell (200 ms)',      mensch(0.20)),         1,1]);
soll.push(['normal',             reihe('normal (300 ms)',       mensch(0.30)),         1,1]);
soll.push(['langsam',            reihe('langsam (420 ms)',      mensch(0.42)),        .9,1]);
soll.push(['sehr langsam',       reihe('sehr langsam (550 ms)', mensch(0.55)),         0,.8]);
soll.push(['Finten-Beisser',     reihe('beisst auf Finten',     mensch(0.25,true)),   .5,1]);
soll.push(['zu frueh',           reihe('zu frueh',
  (g,t,l)=>g.z==='wind'&&g.t>0.04&&t-l>0.5),                                            0,0]);
soll.push(['Spam 10/s',          reihe('spam 10/s',  (g,t,l)=>t-l>=0.1,20,45),          0,0]);
soll.push(['Spam jedes Bild',    reihe('spam jedes Bild', ()=>true,20,45),              0,0]);
soll.push(['Nichtstuer',         reihe('ruehrt sich nicht',()=>false,10,45),            0,0]);

console.log('');
let fehler=0;
for(const [name,quote,min,max] of soll){
  if(quote<min-1e-9||quote>max+1e-9){
    console.log(`  ERWARTUNG VERFEHLT: ${name} gewinnt ${Math.round(quote*100)}%`
      +`, erwartet ${Math.round(min*100)}-${Math.round(max*100)}%`);
    fehler++;
  }
}
console.log(fehler? fehler+' Erwartung(en) verfehlt' : 'Balance im Rahmen');
process.exit(fehler?1:0);
