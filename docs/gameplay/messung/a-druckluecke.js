/* Messung A - laengste Strecke ohne HERAUSFORDERUNG oder ENTSCHEIDUNG (reine Infos zaehlen nicht).
   Die "laengste Leere" in den Level-Skripten zaehlt jede neue Information (auch Gespraechszeilen)
   als Ereignis. Hier zaehlt nur, was den Spieler fordert: eine Gefahr (Lehrer bemerkt dich,
   Jagd, Treffer, Kontrolleur-Alarm, Hindernis, Gegner holt aus) oder eine Wahl im Gespraech.
   node docs/gameplay/messung/a-druckluecke.js
   Nutzt die Bots aus a-level1/2/3.js (--lauf) und wertet deren Protokoll aus. */
const {execFileSync}=require('child_process');
const LAEUFE=[
  ['Level 1 vorsichtig','a-level1.js',['--lauf','0'],'intro > spiel'],
  ['Level 1 vorsichtig','a-level1.js',['--lauf','3'],'intro > spiel'],
  ['Level 1 vorsichtig','a-level1.js',['--lauf','14'],'intro > spiel'],
  ['Level 1 renner','a-level1.js',['--lauf','5','--renner'],'intro > spiel'],
  ['Level 2 erstspieler/alle','a-level2.js',['--lauf','0'],'intro > spiel'],
  ['Level 2 erstspieler/mittel','a-level2.js',['--lauf','1','--mittel'],'intro > spiel'],
  ['Level 2 kenner/klein','a-level2.js',['--lauf','0','--kenner','--klein'],'intro > spiel'],
  ['Level 3 vorsichtig/kampf','a-level3.js',['--lauf','0','--vorsichtig','--kampf'],'intro > sprint'],
  ['Level 3 redner/zahlen','a-level3.js',['--lauf','0','--redner','--zahlen'],'intro > sprint'],
  ['Level 3 redner/warten','a-level3.js',['--lauf','1','--redner'],'intro > sprint'],
];
for(const [name,skript,args,startMarke] of LAEUFE){
  const out=execFileSync(process.execPath,['docs/gameplay/messung/'+skript,...args],{encoding:'utf8',maxBuffer:64*1024*1024});
  const ev=[]; let st=null,en=null;
  for(const l of out.split('\n')){
    /* Level 1 schreibt die Klasse ohne Abstand vor den Typ ("herausforderunggefahr") */
    const m=l.match(/^\s*([\d.]+)\s+(herausforderung|entscheidung|info|quittung|modus|fx)\s*(\S+)\s+(.*)$/); if(!m) continue;
    const t=+m[1], kl=m[2], txt=m[4];
    if(kl==='modus'&&txt.includes(startMarke)&&st==null) st=t;
    if(kl==='modus'&&/> (cutscene|ende)/.test(txt)&&en==null&&st!=null) en=t;
    if(st!=null&&en==null&&(kl==='herausforderung'||kl==='entscheidung')) ev.push({t,txt:txt.slice(0,60)});
  }
  if(st==null||en==null){ console.log(name+': kein vollstaendiger Lauf'); continue; }
  const pk=[{t:st,txt:'(Start)'},...ev,{t:en,txt:'(Ende)'}];
  let best={d:0};
  for(let i=1;i<pk.length;i++){ const d=pk[i].t-pk[i-1].t; if(d>best.d) best={d,von:pk[i-1],bis:pk[i]}; }
  console.log(name.padEnd(28)+'Spielphase '+String((en-st).toFixed(1)).padStart(6)+' s  Forderungen '+String(ev.length).padStart(3)
    +'  laengste Strecke ohne: '+best.d.toFixed(1).padStart(5)+' s  ('+best.von.t.toFixed(1)+' "'+best.von.txt+'" -> '+best.bis.t.toFixed(1)+' "'+best.bis.txt+'")');
}
