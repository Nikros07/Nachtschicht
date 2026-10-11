/* Messung C - Level 7 (Spaeti). Aus der Projektwurzel: node docs/gameplay/messung/c-level7.js [--log]
   Szenarien:
     A  Vollspieler: 15 EURO, volle Crew, redet mit allen, kauft, Bank-Runde, Tobi, Marvin, Foto, Ecke.
     B  Schnelllaeufer: 15 EURO, nur Kasse und Ecke.
     C  Pleite und flink: 0 EURO, sammelt sofort Pfand (naechste Flasche zuerst), dann Kasse.
     D  Pleite und neugierig: 0 EURO, redet erst mit Taxi und Nele (wie ein Erstspieler), dann Pfand.
     E  Nichtstun 90 s: wie viele Flaschen holt Heinz?
   Nichts wird geaendert; alles laeuft im Attrappen-Browser von tools/nachttest.js. */
const H=require('./c-hilfe.js');
const LOG=process.argv.includes('--log');

const EXTRA=`{tiefe:+S.tiefe.toFixed(3), geld:wert('geld'), pfand:NACHT.inventar.PFAND||0,
  ziel:(S.modus==='spiel'&&!gespraechAktiv()&&!S.karte)?((z)=>z?(z.art==='heinz'?'heinz':z.art+':'+(z.obj.id||z.obj.art||Math.round(z.obj.x))):'')(naechstesZiel()):'',
  karte:S.karte?S.karte.txt[S.karte.i]:'',
  szene:(S.modus==='cutscene'&&S.szenen[S.szene])?S.szenen[S.szene].txt:'',
  wegPfand:S.pfand.filter(f=>f.weg).length, heinzX:Math.round(S.heinz.x), pegel:+S.pegel.toFixed(1),
  wasser:flag('spaetiWasser'), snack:flag('spaetiSnack')}`;

function detektor(v,z,R){
  if(!v) return;
  const e=z.e, w=v.e; if(!e||!w) return;
  if(e.ziel&&e.ziel!==w.ziel) R.notiere('angebot','E-Ziel in Reichweite: '+e.ziel);
  if(e.karte&&e.karte!==w.karte) R.notiere('info','Anlauf-Karte: '+e.karte);
  if(e.szene!==w.szene&&e.szene) R.notiere('szene',e.szene);
  if(e.pfand>w.pfand) R.notiere('fund','Pfand aufgehoben ('+e.pfand+')');
  if(e.wegPfand>w.wegPfand&&e.pfand<=w.pfand) R.notiere('heinz','Heinz nimmt eine Flasche (weg: '+e.wegPfand+')');
  if(e.geld!==w.geld) R.notiere('geld','Geld '+w.geld+' > '+e.geld);
}

function neu(geld,opt={}){
  const L=H.lade('level7.html');
  const R=H.rekorder(L,{extra:EXTRA,detektor,passivExtra:z=>z.e&&!!z.e.karte});
  const crew=opt.crew||['MORITZ','MAX FERDI','JONAS','DENNIS','SEMIH','LEA'];
  R.E(`localStorage.setItem(CREW_KEY,${JSON.stringify(JSON.stringify(crew))});
    setzeWert('geld',${geld}); speicherePegel(${opt.pegel||60});
    ${(opt.flags||[]).map(f=>`setzeFlag('${f}');`).join('')}
    aendereBeziehung('JONAS',12); neuesSpiel();`);
  R.takt();
  return R;
}

/* Laufen zu (x,t). Haelt D/A und W/S wie ein Mensch, laesst los, sobald das gewuenschte
   Ziel blinkt (naechstesZiel). Steht Heinz naeher, wartet der Bot kurz, bis er vorbei ist. */
const STECKEN=[];
function geheZu(R,x,t,zielArt,abbruch){
  const tasten={r:false,l:false,h:false,u:false};
  const setze=(k,code,an)=>{ if(tasten[k]!==an){ R.halte(code,an); tasten[k]=an; } };
  let lief=false, tief=false, ok=false;
  const ende=R.t+25;
  while(R.t<ende){
    const z=R.vor; if(!z||z.m!=='spiel'||z.g){ R.takt(); continue; }
    if(zielArt&&String(z.e.ziel).startsWith(zielArt)){ ok=true; break; }
    if(abbruch&&abbruch()){ ok=null; break; }
    const dx=x-z.x, dtf=(t==null?z.e.tiefe:t)-z.e.tiefe;
    const fertigX=Math.abs(dx)<3, fertigT=Math.abs(dtf)<0.1;
    setze('r','KeyD',!fertigX&&dx>0); setze('l','KeyA',!fertigX&&dx<0);
    setze('u','KeyS',!fertigT&&dtf>0); setze('h','KeyW',!fertigT&&dtf<0);
    if(!fertigX) lief=true; if(!fertigT) tief=true;
    if(fertigX&&fertigT&&!zielArt){ ok=true; break; }
    R.takt();
  }
  for(const [k,c] of [['r','KeyD'],['l','KeyA'],['h','KeyW'],['u','KeyS']]) setze(k,c,false);
  if(lief) R.verb('laufen'); if(tief) R.verb('tiefe');
  if(ok===false){ STECKEN.push(R.t.toFixed(1)+'s '+zielArt+'@'+x); R.notiere('bot','Ziel nicht erreicht: '+zielArt+' bei '+x); }
  R.takt(4);                                    // kurz stehen
  return ok;
}
/* E druecken; zaehlt als Verb nur, wenn etwas passiert (Gespraech, Pfand, Meldung, Karte) */
function aktion(R,label,art){
  if(art){ R.bis(z=>String(z.e&&z.e.ziel).startsWith(art),4); }
  const v=R.vor; R.taste('KeyE'); R.takt(2);
  const z=R.vor;
  const wirkung=!!z.g||z.e.pfand!==v.e.pfand||(z.me&&z.me!==v.me)||z.e.karte!==v.e.karte||z.mo||z.m!==v.m;
  R.verb(wirkung?label:'E ohne Wirkung');
  return wirkung;
}
const nimm=(...wunsch)=>(w)=>{ for(const s of wunsch){ const i=w.findIndex(x=>x.toLowerCase().includes(s.toLowerCase())); if(i>=0) return i; } return 0; };

function starteUndIntro(R,lesen=true){
  R.taste('Space','starten'); R.takt();
  if(lesen) R.bis(z=>z.m==='spiel',60);
  else { R.halte('KeyE',true); R.bis(z=>!z.ka,10); R.bis(z=>z.m==='spiel',10); R.halte('KeyE',false); }
  R.takt(30);
}
function bisEnde(R){
  R.bis(z=>z.m==='ende',60);
  return R.t;
}

/* ---------------- Szenario A: Vollspieler ---------------- */
function szenarioA(){
  const R=neu(15,{flags:['marvinKennt','busDurchDieCrew','mitgesungen','handyZurueck']});
  starteUndIntro(R);
  const tSpiel=R.t;
  geheZu(R,120,0.30,'mensch:taxi'); aktion(R,'reden','mensch:taxi'); R.gespraech(nimm('Lange Nacht','Was siehst'));
  geheZu(R,240,0.78,'mensch:nele'); aktion(R,'reden','mensch:nele'); R.gespraech(nimm('Alles okay','Nimm meins'));
  geheZu(R,350,0.06,'regal:wasser'); aktion(R,'ansehen','regal:wasser');
  geheZu(R,500,0.12,'kasse'); aktion(R,'reden','kasse');
  R.gespraech(nimm('Ein Wasser','Und was zu essen','Wie lange','Warum','Das wars'));
  R.takt(10); if(R.vor.g) R.gespraech(nimm('Wie lange','Warum','Das wars'));
  geheZu(R,546,0.08,'bank'); aktion(R,'reden','bank');
  R.gespraech((w)=>{ const i=w.findIndex(x=>x!=='Genug gefragt.'&&!/^(Hm\.|Mach das\.)/.test(x)); return i>=0?i:w.length-1; });
  geheZu(R,570,0.03,'foto'); aktion(R,'fotografieren','foto'); R.bis(z=>!z.mo,10);
  geheZu(R,596,0.10,'crew:crew2'); aktion(R,'reden','crew:crew2'); R.gespraech();
  geheZu(R,650,0.20,'mensch:tobi'); aktion(R,'reden','mensch:tobi'); R.gespraech(nimm('Komm mit','Wo?'));
  geheZu(R,860,0.50,'mensch:marvin'); aktion(R,'reden','mensch:marvin'); R.gespraech(nimm('Wasser rueber'));
  geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke');
  R.bis(z=>!!z.g,15); R.gespraech(nimm('Bruecke'));
  const tEnde=bisEnde(R);
  return {R,tSpiel,tEnde};
}
/* ---------------- Szenario B: Schnelllaeufer ---------------- */
function szenarioB(){
  const R=neu(15,{flags:['marvinKennt']});
  starteUndIntro(R,false);
  const tSpiel=R.t;
  geheZu(R,500,0.12,'kasse'); aktion(R,'reden','kasse');
  R.gespraech(nimm('Ein Wasser','Und was zu essen','Das wars'));
  R.takt(10); if(R.vor.g) R.gespraech(nimm('Das wars'));
  geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke');
  R.bis(z=>!!z.g,15); R.gespraech(nimm('Heim'));
  R.halte('KeyE',true); R.bis(z=>z.m==='ende',20); R.halte('KeyE',false);
  return {R,tSpiel,tEnde:R.t};
}
/* Pfand sammeln: immer die naechste freie Flasche, bis genug Geld zusammen ist. */
function pfandSammeln(R,ziel){
  for(let n=0;n<40;n++){
    const z=R.vor, haben=z.e.geld+z.e.pfand*0.5;
    if(haben>=ziel) return true;
    const frei=JSON.parse(R.E('JSON.stringify(S.pfand.map((f,i)=>({i,x:f.x,t:f.t,weg:f.weg,heinz:S.heinz.ziel===f})).filter(f=>!f.weg))'));
    if(!frei.length) return false;
    const kand=frei.filter(f=>!f.heinz).length?frei.filter(f=>!f.heinz):frei;
    kand.sort((a,b)=>Math.abs(a.x-z.x)-Math.abs(b.x-z.x));
    const f=kand[0];
    geheZu(R,f.x,f.t,'pfand',()=>R.E('S.pfand['+f.i+'].weg'));
    const zz=String(R.vor.e.ziel);
    if(zz.startsWith('pfand')) aktion(R,'aufheben');
    else if(zz.startsWith('heinz')){ aktion(R,'reden'); R.gespraech(nimm('Wer zuerst')); }
  }
  return false;
}
function kasseMitPfand(R){
  geheZu(R,500,0.12,'kasse'); aktion(R,'reden','kasse');
  R.gespraech(nimm('Pfand abgeben','Ein Wasser','Und was zu essen','Das wars'));
  for(let i=0;i<3&&R.vor.g;i++){ R.takt(10); R.gespraech(nimm('Pfand abgeben','Ein Wasser','Und was zu essen','Das wars')); }
}
function szenarioC(){
  const R=neu(0,{flags:['marvinKennt']});
  starteUndIntro(R,false);
  const tSpiel=R.t;
  const genug=pfandSammeln(R,5);
  kasseMitPfand(R);
  const fertig=R.vor.e.wasser&&R.vor.e.snack;
  if(fertig){ geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke'); R.bis(z=>!!z.g,15); R.gespraech(nimm('Heim'));
    R.halte('KeyE',true); R.bis(z=>z.m==='ende',20); R.halte('KeyE',false); }
  return {R,tSpiel,tEnde:R.t,genug,fertig};
}
function szenarioD(){
  const R=neu(0,{flags:['marvinKennt','handyZurueck']});
  starteUndIntro(R,true);
  const tSpiel=R.t;
  geheZu(R,120,0.30,'mensch:taxi'); aktion(R,'reden','mensch:taxi'); R.gespraech(nimm('Lange Nacht','Was siehst'));
  geheZu(R,240,0.78,'mensch:nele'); aktion(R,'reden','mensch:nele'); R.gespraech(nimm('Alles okay','Nimm meins'));
  geheZu(R,350,0.06,'regal:wasser'); aktion(R,'ansehen','regal:wasser');
  geheZu(R,500,0.12,'kasse'); aktion(R,'reden','kasse'); R.gespraech(nimm('Das wars'));
  const genug=pfandSammeln(R,5);
  kasseMitPfand(R);
  const fertig=R.vor.e.wasser&&R.vor.e.snack;
  /* Ohne Kauf: an der Ecke probieren - was sagt das Spiel? */
  geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke');
  if(fertig){ R.bis(z=>!!z.g,15); R.gespraech(nimm('Heim')); R.bis(z=>z.m==='ende',60); }
  else R.sek(5);
  return {R,tSpiel,tEnde:R.t,genug,fertig};
}
function szenarioE(){
  const R=neu(0);
  starteUndIntro(R,false);
  const t0=R.t; R.sek(90);
  return {R,tSpiel:t0,tEnde:R.t,weg:R.vor.e.wegPfand};
}

const aus={};
for(const [name,f] of [['A',szenarioA],['B',szenarioB],['C',szenarioC],['D',szenarioD],['E',szenarioE]]){
  const r=f(); const R=r.R;
  if(LOG) H.drucke(R,'Level 7 Szenario '+name);
  const s=H.zusammenfassung(R,r.tSpiel,r.tEnde);
  aus[name]={ spielBeginnS:+r.tSpiel.toFixed(1), endeS:+r.tEnde.toFixed(1), spielS:+(r.tEnde-r.tSpiel).toFixed(1),
    modusAmEnde:R.vor.m, geld:R.vor.e.geld, wasser:R.vor.e.wasser, snack:R.vor.e.snack,
    flaschenWeg:R.vor.e.wegPfand, pegelEnde:R.vor.e.pegel,
    heinzFlaschen:R.log.filter(e=>e.art==='heinz').length, eigeneFlaschen:R.log.filter(e=>e.art==='fund').length,
    genug:r.genug, fertig:r.fertig, ...s };
}
/* Softlock-Sweep: Startgeld x Troedelzeit (Sekunden Reden/Schauen, bevor man Pfand sammelt).
   Gemessen: reicht das Geld fuer Wasser (2) und Snack (3)? */
const sweep={};
for(const geld of [0,1,2,3,4]){
  for(const troedel of [0,10,20,30,45,60]){
    const R=neu(geld,{flags:['marvinKennt']});
    starteUndIntro(R,false);
    R.sek(troedel);
    const genug=pfandSammeln(R,5);
    const z=R.vor;
    sweep['geld'+geld+'_troedel'+troedel]={ eigene:z.e.pfand, heinz:z.e.wegPfand-z.e.pfand,
      summeEuro:+(z.e.geld+z.e.pfand*0.5).toFixed(1), reicht:z.e.geld+z.e.pfand*0.5>=5 };
  }
}
aus.softlockSweep=sweep;
aus.botStecken=STECKEN;
console.log(JSON.stringify(aus,null,1));
