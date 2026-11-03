/* Messung n3 - Level 7: Rang-Zeitgrenzen. Bot erledigt Liste + 5 Wuerfe, S.zeit/Rang am Ende.
   Aus der Projektwurzel: node docs/gameplay/messung/n3-level7-rang.js
   Gleiche Bot-Bausteine wie c-level7.js (Szenario A voll, C pleite+Pfand). */
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
function wirfe5(R){
  geheZu(R,R.pwx,R.pwt,'wurf'); 
  for(let i=0;i<5;i++){
    R.halte('KeyE',true); R.takt(1);
    for(let k=0;k<400;k++){ const kr=+R.E('S.wurf&&S.wurf.phase==="laden"?S.wurf.kraft:-1'); if(kr<0||(kr>=0.52&&kr<=0.68)) break; R.takt(1); }
    R.halte('KeyE',false);
    for(let k=0;k<200&&R.E('!!S.wurf');k++) R.takt(1);
    R.takt(5);
  }
}
function ende(R,mitWurf){
  if(mitWurf){ R.pwx=+R.E('PFANDWURF.x'); R.pwt=+R.E('PFANDWURF.t'); wirfe5(R); }
  return R;
}
function rang(R){ return JSON.parse(R.E('JSON.stringify({zeit:S.zeit,liste:LISTE.filter(a=>a.fertig()).length,wuerfe:S.wuerfe,treffer:S.treffer,gespr:Object.keys(S.gespr).length,r:rangRechnen(),modus:S.modus})')); }
/* A: pleite, sammelt Pfand, gibt es ab, kauft, Bank-Runde, redet mit Crew, 5 Wuerfe, Ecke */
function A(){
  const R=neu(0,{flags:['marvinKennt','handyZurueck']});
  starteUndIntro(R,true);
  pfandSammeln(R,5); kasseMitPfand(R);
  geheZu(R,546,0.08,'bank'); aktion(R,'reden','bank');
  R.gespraech((w)=>{ const i=w.findIndex(x=>x!=='Genug gefragt.'&&!/^(Hm\.|Mach das\.)/.test(x)); return i>=0?i:w.length-1; });
  geheZu(R,650,0.20,'mensch:tobi'); aktion(R,'reden','mensch:tobi'); R.gespraech(nimm('Komm mit','Wo?'));
  ende(R,true);
  geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke'); R.bis(z=>!!z.g,15); R.gespraech(nimm('Bruecke','Heim'));
  return R;
}
/* B: knapp: nur Pfand, Kasse, Bank, Wuerfe, Ecke */
function B(){
  const R=neu(0,{flags:['marvinKennt']});
  starteUndIntro(R,false);
  pfandSammeln(R,5); kasseMitPfand(R);
  geheZu(R,546,0.08,'bank'); aktion(R,'reden','bank');
  R.gespraech((w)=>{ const i=w.findIndex(x=>x!=='Genug gefragt.'&&!/^(Hm\.|Mach das\.)/.test(x)); return i>=0?i:w.length-1; });
  ende(R,true);
  geheZu(R,850,null,'ecke'); aktion(R,'ecke','ecke'); R.bis(z=>!!z.g,15); R.gespraech(nimm('Heim'));
  return R;
}
for(const [n,f] of [['A gemuetlich',A],['B knapp',B]]){ const R=f(); console.log(n, "R.t="+R.t.toFixed(1), "dialog="+R.dialog.toFixed(1), JSON.stringify(R.modusZeit), JSON.stringify(rang(R))); }
