/* Messung C - Level 8 (Heimweg). Aus der Projektwurzel: node docs/gameplay/messung/c-level8.js [--log]
   Ablauf im Spiel: Titel -> Intro (6 Karten) + Kapitelkarte -> Konfrontation (Gespraech, 9 s Bedenkzeit)
   -> Endkampf (3 Phasen) oder Frieden -> Wettlauf gegen die Sonne (5160 px) -> Finale (Karten,
   3 Wahlen) -> Abspann -> Endbildschirm.
   Szenarien:
     K1..K4  Endkampf mit den Taktiken konter / blocker / haemmern / nichts (danach Wettlauf perfekt)
     W1      Frieden (Kampf faellt weg), Wettlauf perfekt, Tschuess bei jeder Abbiegung, Finale lesen
     W2      Wettlauf ohne zu springen (wie schlimm sind die Hindernisse?)
     W3      Wettlauf mit 7 Umwegen auf der Karte + verlorenem Kampf (schlimmster normaler Fall)
     W4      Sonne erwischt: was passiert danach? (Neustart-Kette messen) */
const H=require('./c-hilfe.js');
const LOG=process.argv.includes('--log');

const EXTRA=`{licht:+S.licht.toFixed(1), y:+S.y.toFixed(1),
  k:(S.modus==='kampf'&&S.gegner&&S.spielerK)?{gz:S.gegner.zustand, ga:S.gegner.art||'', ghp:+S.gegner.hp.toFixed(2),
     shp:+S.spielerK.hp.toFixed(2), sz:S.spielerK.zustand, arena:S.arena,
     hl:S.handlanger.map(h=>h.zustand+':'+h.hp).join(','), fl:S.flaschen.length, aus:Math.round(S.spielerK.ausdauer)}:null,
  hind:(()=>{ if(S.modus!=='spiel') return -1; for(let i=0;i<HINDERNISSE.length;i++){ if(S.hinTreffer[i]) continue;
     const d=HINDERNISSE[i].x-S.x; if(d>-15&&d<40) return i; } return -1; })(),
  getroffen:Object.keys(S.hinTreffer).length,
  fenster:(S.abb&&S.abb.fenster)?S.abb.fenster.name:'',
  fin:(S.modus==='finale'&&S.fin&&S.fin.st)?(S.fin.st.txt||(S.fin.st.wahl?'(wahl)':'(auto)')):'',
  szene:(S.modus==='cutscene'&&S.szenen&&S.szenen[S.szene])?(S.szenen[S.szene].txt||S.szenen[S.szene].art||'(leer)'):'',
  ende:S.modus==='ende'?(S.gewonnen?'GEWONNEN '+endeTitel():'VERLOREN: '+S.faenger):''}`;

function detektor(v,z,R){
  if(!v||!z.e||!v.e) return;
  const e=z.e, w=v.e;
  if(e.k&&w.k){
    if(e.k.gz==='ausholen'&&w.k.gz!=='ausholen') R.notiere('angriff','Anfuehrer holt aus: '+e.k.ga);
    const hn=e.k.hl.split(','), ho=w.k.hl.split(',');
    hn.forEach((h,i)=>{ if(h.startsWith('ausholen')&&!(ho[i]||'').startsWith('ausholen')) R.notiere('angriff','Handlanger '+i+' holt aus'); });
    if(e.k.fl>w.k.fl) R.notiere('angriff','Flasche fliegt');
    if(e.k.arena!==w.k.arena) R.notiere('info','Arena '+e.k.arena);
    if(e.k.shp<w.k.shp) R.notiere('schaden','DU: '+w.k.shp+' > '+e.k.shp);
    if(e.k.ghp<w.k.ghp) R.notiere('treffer','ANFUEHRER: '+w.k.ghp+' > '+e.k.ghp);
  }
  if(e.hind>=0&&e.hind!==w.hind) R.notiere('gefahr','Hindernis '+e.hind+' naht (x='+Math.round(z.x)+', Licht '+e.licht+')');
  if(e.getroffen>w.getroffen) R.notiere('schaden','Hindernis getroffen, Licht '+e.licht);
  if(e.fenster&&e.fenster!==w.fenster) R.notiere('fenster','Abbiegen: '+e.fenster);
  if(e.fin&&e.fin!==w.fin&&e.fin!=='(wahl)'&&e.fin!=='(auto)') R.notiere('szene','Finale: '+e.fin);
  if(e.szene&&e.szene!==w.szene) R.notiere('szene','Abspann: '+e.szene);
  if(e.ende&&e.ende!==w.ende) R.notiere('info','ENDE: '+e.ende);
}

const BASIS_FLAGS=['marvinKennt','taxiTipp','endeHeim','tobiBruecke','mitgesungen','busDurchDieCrew'];
function neu(opt={}){
  const L=H.lade('level8.html');
  const R=H.rekorder(L,{extra:EXTRA,detektor});
  const crew=opt.crew||['MORITZ','MAX FERDI','JONAS','DENNIS','SEMIH','LEA'];
  R.E(`localStorage.setItem(CREW_KEY,${JSON.stringify(JSON.stringify(crew))});
    ${(opt.flags||BASIS_FLAGS).map(f=>`setzeFlag('${f}');`).join('')}
    ${(opt.umwege||0)?Array.from({length:opt.umwege},(_,i)=>`setzeFlag('umweg_${i+1}');`).join(''):''}
    ${opt.mut!=null?`setzeWert('mut',${opt.mut});`:''} ${opt.ruf!=null?`setzeWert('ruf',${opt.ruf});`:''}
    speicherePegel(${opt.pegel||10}); neuesSpiel();`);
  /* Die Kampf-KI des Bots lebt im Seitenkontext, damit sie die Spielfunktionen nutzen kann. */
  R.E(`window.__bot=function(taktik,reaktion){
    const s=S.spielerK, g=S.gegner, o={l:0,r:0,u:0,d:0,b:0,e:0,roll:0};
    if(!s||!g) return o;
    const feinde=[g].concat(S.handlanger.filter(h=>h.hp>0));
    const nahAnDir=f=>Math.abs(f.x-s.x)<30&&tiefeNah(f.t,s.t,KAMPF.tiefeToleranz+0.05);
    const fenster=f=>imKonterfenster(f)&&f.zT>=(f.ausholenDauer||(f.regler||KAMPF).ausholen)*(1-KAMPF.konterAnteil)+reaktion;
    /* Bewegung: auf 12 px an den Anfuehrer, gleiche Tiefe */
    const ziel=g.x-12*(Math.sign(g.x-s.x)||1), dx=ziel-s.x;
    if(Math.abs(dx)>3){ if(dx>0) o.r=1; else o.l=1; }
    else if(Math.sign(g.x-s.x)!==s.blick){ if(g.x>s.x) o.r=1; else o.l=1; }
    const dt=(g.t||0)-(s.t||0); if(Math.abs(dt)>0.08){ if(dt>0) o.d=1; else o.u=1; }
    if(taktik==='nichts') return {l:0,r:0,u:0,d:0,b:0,e:0,roll:0};
    if(taktik==='haemmern'){ if(s.zustand==='frei') o.e=1; return o; }
    if(taktik==='blocker'){
      o.b=1;
      if((g.zustand==='erholung'||g.zustand==='getroffen')&&trifftRaeumlich(s,g,KAMPF.reichweite)&&s.ausdauer>=KAMPF.ausdauerSchlag){ o.b=0; o.e=1; }
      return o;
    }
    /* konter */
    const flasche=S.flaschen.find(f=>Math.abs(f.x-s.x)<45&&Math.sign(s.x-f.x)===Math.sign(f.vx)&&Math.abs(f.t-s.t)<=KAMPF.tiefeToleranz+0.05);
    if(flasche&&s.ausdauer>=KAMPF.ausdauerRolle){ o.roll=1; return o; }
    if(g.art==='ramme'&&g.zustand==='ausholen'&&nahAnDir(g)&&g.zT>g.ausholenDauer*0.45){ o.roll=1; return o; }
    if(s.zustand==='frei'&&s.ausdauer>=KAMPF.ausdauerSchlag){
      for(const f of feinde){
        if(f.art==='ramme'&&f===g&&g.unblockbarJetzt) continue;
        if(f.zustand==='ausholen'&&fenster(f)&&trifftRaeumlich(s,f,KAMPF.reichweite)){ o.e=1; return o; }
      }
    }
    for(const h of S.handlanger) if(h.hp>0&&h.zustand==='ausholen'&&nahAnDir(h)&&!trifftRaeumlich(s,h,KAMPF.reichweite)) o.b=1;
    if(!o.b&&(g.zustand==='erholung'||g.zustand==='getroffen')&&trifftRaeumlich(s,g,KAMPF.reichweite)&&s.ausdauer>=45&&s.zustand==='frei') o.e=1;
    return o;
  };`);
  R.takt();
  return R;
}

const nimm=(...wunsch)=>(w)=>{ for(const s of wunsch){ const i=w.findIndex(x=>x.toLowerCase().includes(s.toLowerCase())); if(i>=0) return i; } return 0; };

function startBisKonfrontation(R,lesen=true){
  R.taste('Space','starten'); R.takt();
  if(lesen) R.bis(z=>!!z.g,60);
  else { R.halte('KeyE',true); R.bis(z=>!z.ka,10); R.bis(z=>!!z.g,10); R.halte('KeyE',false); }
}

/* Kampf mit einer Taktik bis zum Ende. Tasten werden wie ein Mensch gehalten/losgelassen. */
function kaempfe(R,taktik,reaktion=0.05){
  const st={l:'KeyA',r:'KeyD',u:'KeyS',d:'KeyS',b:'ShiftLeft'}; const an={};
  const halte=(k,code,soll)=>{ if(!!an[k]!==!!soll){ R.halte(code,!!soll); an[k]=!!soll; if(soll){
    R.verb({l:'laufen',r:'laufen',u:'tiefe',d:'tiefe',b:'blocken'}[k]); } } };
  const t0=R.t; let konter=0, schlaege=0, rollen=0;
  while(R.vor.m==='kampf'&&R.t-t0<240){
    const o=JSON.parse(R.E(`JSON.stringify(__bot('${taktik}',${reaktion}))`));
    halte('l','KeyA',o.l); halte('r','KeyD',o.r); halte('u','KeyW',o.u); halte('d','KeyS',o.d); halte('b','ShiftLeft',o.b);
    if(o.e){ R.taste('KeyE','E (schlagen/kontern)'); schlaege++; }
    if(o.roll){ R.taste('Space'); rollen++; R.verb('rollen'); }
    R.takt();
  }
  for(const [k,c] of [['l','KeyA'],['r','KeyD'],['u','KeyW'],['d','KeyS'],['b','ShiftLeft']]) halte(k,c,false);
  const im=R.log.filter(e=>e.t>=t0);
  konter=im.filter(e=>e.art==='meldung'&&/^(SITZT|KONTER|BAM)$/.test(e.txt)).length;
  const zaehl=re=>im.filter(e=>e.art==='meldung'&&re.test(e.txt)).length;
  return {dauer:+(R.t-t0).toFixed(1), eDruecke:schlaege, konter, rollen,
    angriffe:im.filter(e=>e.art==='angriff').length,
    eingesteckt:im.filter(e=>e.art==='schaden').length, ausgeteilt:im.filter(e=>e.art==='treffer').length,
    geblockt:zaehl(/^GEBLOCKT$/), ausgewichen:zaehl(/^AUSGEWICHEN$/), ausserPuste:zaehl(/^AUSSER PUSTE$/),
    crewHilfe:zaehl(/GEHT DAZWISCHEN/), ergebnis:R.E("flag('fightGewonnen')?'gewonnen':flag('fightVerloren')?'verloren':'?'"),
    hpEnde:R.E('S.spielerK&&+S.spielerK.hp.toFixed(2)'), gegnerHpEnde:R.E('S.gegner&&+S.gegner.hp.toFixed(2)')};
}

/* Wettlauf: D halten, ueber Hindernisse springen. sprungAb: Abstand, ab dem gesprungen wird.
   tschuess: bei jeder Abbiegung E. */
let __rng=12345; const zufall=()=>{ __rng=(__rng*1664525+1013904223)>>>0; return __rng/4294967296; };
function wettlauf(R,{springen=true,sprungAb=27,streuung=0,tschuess=false}={}){
  const t0=R.t, l0=R.vor.e.licht;
  R.halte('KeyD',true); R.verb('laufen');
  let sprünge=0, tsch=0; const gesprungen=new Set();
  while(R.vor.m==='spiel'&&R.t-t0<180){
    const z=R.vor;
    if(springen&&z.e.hind>=0&&!gesprungen.has(z.e.hind)){
      const o=JSON.parse(R.E(`JSON.stringify((()=>{const i=${z.e.hind},o=HINDERNISSE[i];
        const effX=o.art==='jogger'?o.x+Math.sin(S.t*TUNE.joggerTempo+i)*TUNE.joggerAmplitude:o.x;
        return {d:effX-S.x, boden:S.amBoden};})())`));
      if(!R.__ab) R.__ab=sprungAb+(zufall()*2-1)*streuung;
      if(o.d<=R.__ab&&o.d>-5&&o.boden){ R.__ab=0; R.halte('Space',true); gesprungen.add(z.e.hind); sprünge++; R.verb('springen');
        R.takt(14); R.halte('Space',false); continue; }
    }
    if(tschuess&&z.e.fenster){ R.sek(0.4); R.taste('KeyE','tschuess'); tsch++; }
    R.takt();
  }
  R.halte('KeyD',false);
  return {dauer:+(R.t-t0).toFixed(1), lichtStart:l0, lichtEnde:R.vor.e.licht, getroffen:R.vor.e.getroffen, sprünge, tschuess:tsch, modus:R.vor.m};
}
function finaleUndAbspann(R,ueberspringen=false){
  const t0=R.t;
  while(R.vor.m==='finale'&&R.t-t0<300){
    if(R.vor.g) R.gespraech(nimm('Kommst du mit','Wir euch auch','Tschuess.'));
    else R.takt();
  }
  const tFin=R.t;
  if(ueberspringen){ R.halte('KeyE',true); R.bis(z=>z.m==='ende',5); R.halte('KeyE',false); }
  else R.bis(z=>z.m==='ende',400);
  return {finaleS:+(tFin-t0).toFixed(1), abspannS:+(R.t-tFin).toFixed(1)};
}

function lauf(name,opt){
  const R=neu(opt.neu||{});
  startBisKonfrontation(R,opt.lesen!==false);
  const tSteuer=R.t;
  R.gespraech(opt.konfrontation||nimm('Dann los'));
  R.takt(2);
  let kampf=null;
  if(R.vor.m==='kampf') kampf=kaempfe(R,opt.taktik||'konter',opt.reaktion==null?0.05:opt.reaktion);
  R.bis(z=>z.m==='spiel'||z.m==='ende',10);
  const tLauf=R.t;
  const w=R.vor.m==='spiel'?wettlauf(R,opt.wettlauf||{}):null;
  const tFin=R.t;
  let fin=null;
  if(R.vor.m==='finale') fin=finaleUndAbspann(R,!!opt.ueberspringen);
  const ende=R.vor.e.ende;
  if(LOG) H.drucke(R,'Level 8 '+name);
  const s=H.zusammenfassung(R,tSteuer,R.t);
  return { name, introBisSteuerungS:+tSteuer.toFixed(1), konfrontationS:+((kampf?tLauf-kampf.dauer:tLauf)-tSteuer).toFixed(1),
    kampf, wettlauf:w, finale:fin, ende, gesamtS:+R.t.toFixed(1),
    leereWettlauf:H.leere(R,H.alleImpulse,tLauf,tFin), leereWettlaufHart:H.leere(R,H.harteImpulse,tLauf,tFin),
    leereFinaleAbspann:H.leere(R,H.harteImpulse,tFin,R.t),
    ereignisse:s.ereignisse, verben:s.verben, passivS:s.passivS, dialogS:s.dialogS, modusZeit:s.modusZeit, R };
}

const aus=[];
const kurz=r=>{ const {R,...rest}=r; return rest; };
aus.push(kurz(lauf('K1 konter',{taktik:'konter'})));
aus.push(kurz(lauf('K1b konter traege (0,15 s Reaktion)',{taktik:'konter',reaktion:0.15})));
aus.push(kurz(lauf('K2 blocker',{taktik:'blocker'})));
aus.push(kurz(lauf('K3 haemmern',{taktik:'haemmern'})));
aus.push(kurz(lauf('K4 nichts',{taktik:'nichts'})));
aus.push(kurz(lauf('K5 konter ohne Taxi-Tipp',{taktik:'konter',neu:{flags:BASIS_FLAGS.filter(f=>f!=='taxiTipp')}})));
/* Frieden: marvinKennt + mut>=60 + ruf>=65 */
aus.push(kurz(lauf('W1 Frieden, Tschuess, Finale lesen',{neu:{mut:70,ruf:70},
  konfrontation:nimm('Heute nicht'),wettlauf:{tschuess:true}})));
aus.push(kurz(lauf('W2 ohne Springen',{neu:{mut:70,ruf:70},konfrontation:nimm('Heute nicht'),wettlauf:{springen:false},ueberspringen:true})));
aus.push(kurz(lauf('W1b Frieden, Tschuess, Springen streut +-12 px',{neu:{mut:70,ruf:70},
  konfrontation:nimm('Heute nicht'),wettlauf:{tschuess:true,streuung:12},ueberspringen:true})));
aus.push(kurz(lauf('W1c Frieden, ohne Tschuess, Springen streut +-12 px',{neu:{mut:70,ruf:70},
  konfrontation:nimm('Heute nicht'),wettlauf:{streuung:12},ueberspringen:true})));
aus.push(kurz(lauf('W3 7 Umwege + Kampf verloren',{taktik:'nichts',neu:{umwege:7},ueberspringen:true})));
aus.push(kurz(lauf('W3b 7 Umwege + Kampf verloren + ohne Springen',{taktik:'nichts',neu:{umwege:7},wettlauf:{springen:false},ueberspringen:true})));

/* W4: Sonne erwischt -> Leertaste -> was kommt? */
{
  const R=neu({umwege:7});
  startBisKonfrontation(R,false);
  R.gespraech(nimm('Dann los')); R.takt(2);
  kaempfe(R,'nichts');
  R.bis(z=>z.m==='spiel',10);
  wettlauf(R,{springen:false});
  const nachSonne=R.vor.m+' / '+R.vor.e.ende;
  R.sek(1); R.taste('Space','neustart'); R.takt(3);
  const nachNeustart=R.vor.m;
  R.taste('Space'); R.takt(3);
  const danach=R.vor.m;
  R.halte('KeyE',true); R.bis(z=>!!z.g,30); R.halte('KeyE',false);
  aus.push({name:'W4 Neustart nach Sonne',nachSonne,nachNeustart,nachZweitemDruck:danach,
    wiederInKonfrontation:!!R.vor.g, knoten:R.vor.g&&R.vor.g.text});
}
console.log(JSON.stringify(aus,null,1));
