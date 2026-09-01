/* ==========================================================================
   LEVEL 2 - BEI MORITZ

   Zwei Sachen werden geprueft:
   1. Ein kompletter Durchlauf: Titel, Intro, alle vier Aufgaben, Kampf,
      Cutscene, Endbild. Faengt alles, was auf dem Weg abstuerzt.
   2. Der Kracher gegen sechs verschiedene Spieler. Ein Kampf ist nur dann
      gut eingestellt, wenn sauberes Spiel gewinnt UND stumpfes Haemmern
      verliert - beides muss man messen, nicht hoffen.
   ========================================================================== */
const { lade }=require('./harness.js');
const { gruppe, pruefe, bilanz }=require('./pruefen.js');

const NAMEN=['TUNE','update','draw','neuesSpiel','starteKampf','alleFertig',
             'AUFGABEN','LEUTE','DINGE','STAFFAGE','imKonterfenster','BODEN'];
const neu=()=>lade('level2.html',NAMEN);

/* ==========================================================================
   1. EIN DURCHLAUF
   ========================================================================== */
gruppe('Level 2 - ein kompletter Durchlauf');
{
  const g=neu();
  g.takt(30);
  pruefe('Titelbild zeichnet', g.S().modus==='titel');

  g.S().modus='intro'; g.S().szene=0; g.S().szeneT=0;
  g.sekunden(20);
  pruefe('Intro laeuft ins Spiel', g.S().modus==='spiel', 'modus='+g.S().modus);

  const S=g.S();

  /* Getraenke heben den Pegel */
  S.reden=null; S.x=506; g.takt(2); g.druck(); g.takt(2);
  pruefe('Trinken hebt den Pegel', S.pegel>0, 'pegel='+S.pegel.toFixed(1));

  /* Hoher Pegel darf nichts umwerfen - Wackeln, Vignette, Musik haengen dran */
  S.pegel=95; g.sekunden(1);
  pruefe('Hoher Pegel wirft nichts um', g.S().modus==='spiel');
  S.pegel=20;

  /* Alle Moebel durchsuchen. Ein laufendes Gespraech wird vorher
     weggeraeumt, sonst frisst der Dialog den Tastendruck - das Sofa
     steht auf dem Schlaefer. */
  for(const d of g.DINGE){
    S.reden=null; S.x=d.x+6; g.takt(2);
    S.reden=null; g.druck(); g.takt(2);
    g.sekunden(g.TUNE.suchDauer+0.2);
  }
  pruefe('Jacke liegt auffindbar', !!S.inventar.jacke, 'bei '+S.jackeBei);
  pruefe('Ausweis liegt auffindbar', !!S.inventar.ausweis, 'bei '+S.ausweisBei);
  pruefe('Energydrink im Kuehlschrank', !!S.inventar.dose||!!S.erledigt.schlaefer);

  const zu=id=>{ const p=g.LEUTE.find(l=>l.id===id);
    S.reden=null; S.x=p.x; g.takt(2); g.druck(); g.takt(2);
    for(let i=0;i<12;i++){ g.druck(); g.takt(2); } S.reden=null; };

  zu('moritz');
  pruefe('Moritz nimmt seinen Ausweis', !!S.erledigt.ausweis);
  zu('schlaefer');
  pruefe('Der Schlaefer wacht von der Dose auf', !!S.erledigt.schlaefer);

  S.pegel=0; zu('telefon');
  pruefe('Ohne Mut bleibt der Telefonierer haengen', !S.erledigt.telefon);
  S.pegel=g.TUNE.mutAb+5; zu('telefon');
  pruefe('Mit Mut kommt er mit', !!S.erledigt.telefon);
  pruefe('Alle vier Aufgaben erledigt', g.alleFertig());

  S.x=40; g.druck(); g.takt(2);
  pruefe('An der Wohnungstuer startet der Kampf', g.S().modus==='kampf',
    'modus='+g.S().modus);

  /* Kampf abkuerzen: letzter Treffer im Konterfenster */
  const gg=g.S().gegner;
  gg.hp=1; gg.muster='schwinger'; gg.zustand='wind';
  gg.dauer=g.TUNE.windSchwinger; gg.t=g.TUNE.windSchwinger*0.9;
  g.takt(4,()=>g.druck());
  g.sekunden(2);
  pruefe('Der letzte Konter fuehrt in die Cutscene',
    g.S().modus==='cutscene'||g.S().modus==='ende', 'modus='+g.S().modus);
  g.sekunden(40);
  pruefe('Die Cutscene endet im Endbild', g.S().modus==='ende', 'modus='+g.S().modus);
  pruefe('Level gilt als geschafft', g.S().gewonnen===true);
  pruefe('Moritz landet in der Crew',
    (JSON.parse(g.speicher['nachtschicht.crew']||'[]')).includes('MORITZ'));
  g.sekunden(1);
}

/* ==========================================================================
   2. VERLIEREN
   ========================================================================== */
gruppe('Level 2 - die zwei Arten zu verlieren');
{
  const g=neu();
  g.S().modus='spiel'; g.S().pegel=g.TUNE.blackoutBei;
  g.sekunden(0.5);
  pruefe('Voller Pegel heisst Blackout',
    g.S().modus==='ende'&&/BLACKOUT/.test(g.S().faenger||''), g.S().faenger);
}
{
  const g=neu();
  g.S().modus='spiel'; g.S().zeit=g.TUNE.levelSekunden+1;
  g.sekunden(0.2);
  pruefe('Abgelaufene Uhr heisst Bahn weg',
    g.S().modus==='ende'&&/BAHN/.test(g.S().faenger||''), g.S().faenger);
}

/* ==========================================================================
   3. DER KRACHER GEGEN SECHS SPIELER
   ========================================================================== */
function kampfLauf(bot,opt={}){
  const g=neu();
  g.neuesSpiel();
  const S=g.S();
  S.modus='spiel';
  for(const a of g.AUFGABEN) S.erledigt[a.id]=true;
  if(opt.pegel) S.pegel=opt.pegel;
  g.starteKampf();
  const zustaende={};
  let n=0;
  const grenze=60*90;
  while(n<grenze){
    const s=g.S();
    if(s.modus!=='kampf') break;
    zustaende[s.gegner.zustand]=(zustaende[s.gegner.zustand]||0)+1;
    bot(g,s,s.gegner);
    g.takt(1);
    n++;
  }
  const s=g.S();
  return { s, g, n, zustaende, sek:n/60,
    gewonnen:s.modus==='cutscene', verloren:s.modus==='ende',
    haengt:s.modus==='kampf' };
}

/* Spielt sauber: kontert im Fenster, springt ueber den Sturm, nutzt die
   freien Schlaege. */
function profi(g,S,gg){
  g.sprungAn(false);
  if(gg.zustand==='wind'&&g.imKonterfenster(gg)) g.druck();
  else if(gg.zustand==='sturm'&&S.amBoden&&Math.abs(gg.x+3-S.x)<60){
    g.sprung(); g.sprungAn(true); }
  else if(gg.zustand==='benommen'&&gg.frei>0) g.druck();
  if(!S.amBoden&&S.vy<0) g.sprungAn(true);
}
/* Wie ein Mensch: reagiert erst, nachdem das Fenster aufgegangen ist. */
function mensch(reaktion){
  let seit=null, vorher=null;
  return (g,S,gg)=>{
    g.sprungAn(false);
    if(gg.zustand!==vorher){ vorher=gg.zustand; seit=null; }
    const laeuft=()=>{ seit=(seit===null)?0:seit+1/60; return seit>=reaktion; };
    if(gg.zustand==='wind'){ if(g.imKonterfenster(gg)&&laeuft()){ g.druck(); seit=-99; } }
    else if(gg.zustand==='sturm'){
      if(laeuft()&&S.amBoden&&Math.abs(gg.x+3-S.x)<70){ g.sprung(); g.sprungAn(true); } }
    else if(gg.zustand==='benommen'&&gg.frei>0){ if(laeuft()){ g.druck(); seit=0; } }
    if(!S.amBoden&&S.vy<0) g.sprungAn(true);
  };
}
const hammer=g=>g.druck();
const faul=()=>{};
const ungeduldig=(g,S,gg)=>{ profi(g,S,gg); if(gg.zustand==='deckung') g.druck(); };

gruppe('Der Kracher - wer gewinnt und wer nicht');
const L={
  profi:      kampfLauf(profi),
  mut:        kampfLauf(profi,{pegel:60}),
  mensch180:  kampfLauf(mensch(.18)),
  mensch220:  kampfLauf(mensch(.22)),
  hammer:     kampfLauf(hammer),
  faul:       kampfLauf(faul),
  deckung:    kampfLauf(ungeduldig),
};
for(const [name,r] of Object.entries(L))
  console.log('   '+name.padEnd(11)+
    (r.gewonnen?'gewonnen':r.verloren?'verloren':'haengt fest').padEnd(12)+
    'herzen '+r.s.hp+'/'+r.g.TUNE.leben+'   '+r.sek.toFixed(1)+' s');

pruefe('Sauberes Spiel gewinnt ohne Treffer',
  L.profi.gewonnen&&L.profi.s.hp===L.profi.g.TUNE.leben);
pruefe('Mut verkuerzt den Kampf spuerbar', L.mut.gewonnen&&L.mut.n<L.profi.n,
  Math.round(100-L.mut.n/L.profi.n*100)+' % kuerzer');
pruefe('Menschliche Reaktionszeit reicht',
  L.mensch180.gewonnen&&L.mensch220.gewonnen);
pruefe('Dauerhaemmern auf E gewinnt NICHT', !L.hammer.gewonnen);
pruefe('Nichtstun verliert', L.faul.verloren);
pruefe('Auf die Deckung schlagen kostet', L.deckung.s.hp<L.profi.s.hp);
pruefe('Kein Lauf haengt fest', Object.values(L).every(r=>!r.haengt));
pruefe('Alle vier Muster kommen vor',
  ['wind','deckung','warnung','sturm'].every(k=>L.profi.zustaende[k]>0));
pruefe('Der Wandtreffer oeffnet ihn wirklich', L.profi.zustaende.benommen>0);

process.exit(bilanz()?1:0);
