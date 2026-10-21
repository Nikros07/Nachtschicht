/* Prueft nacht/saft.js (Spielgefuehl) ohne Browser: Hitstop, Zeitlupe, Wackeln, Blitze,
   Teilchen, Popups und Rezepte. ctx ist eine Attrappe, die jedes Rechteck und jeden Text
   mitschreibt. KOMFORT ist eine Attrappe (Schalter in einem Objekt). FX kommt aus der echten
   komfort.js, damit die Flackerschutz-Regeln geprueft werden, nicht eine Kopie davon.
   node test/saft.test.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const datei=n=>path.join(__dirname,'..','nacht',n);

const rahmen=[];   // alle fillRect-Aufrufe seit dem letzten Leeren
const texte=[];    // alle text()-Aufrufe seit dem letzten Leeren
const ctx={
  fillStyle:'#000000', globalAlpha:1,
  fillRect(x,y,w,h){ rahmen.push({x,y,w,h,a:this.globalAlpha,f:this.fillStyle}); },
};
const schalter={flackerschutz:false,wackeln:true,roehre:true,hinweis:false};
const KOMFORT={hole:n=>schalter[n], setze:(n,v)=>{ schalter[n]=v; }, alle:()=>({...schalter})};

const k={ ctx, KOMFORT, W:320, H:180, window:{},
  text:(s,x,y,col)=>texte.push({s,x,y,col}),
  textW:s=>String(s).length*4-1,        // wie bild.js
};
vm.createContext(k);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),k);
const kf=fs.readFileSync(datei('komfort.js'),'utf8');
vm.runInContext(kf.slice(kf.indexOf('const FX=')),k);   // nur der FX-Block der echten Datei
lade(datei('saft.js'));
const E=c=>vm.runInContext(c,k);

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i!==undefined?'   -> '+String(i):'')); } };

const frame=(n=1)=>{ for(let i=0;i<n;i++) E('SAFT.takt(1/60)'); };
const zeichne=()=>{ rahmen.length=0; texte.length=0; E('SAFT.zeichne()'); };
const schalte=(n,v)=>E("KOMFORT.setze('"+n+"',"+v+")");

console.log('\n--- TAKT: HITSTOP UND ZEITLUPE ---');
E('SAFT.leeren()');
pruefe('ohne Effekt: takt gibt dt zurueck', Math.abs(E('SAFT.takt(1/60)')-1/60)<1e-12);
E('SAFT.leeren(); SAFT.stop(0.1)');
pruefe('takt liefert 0 im Stopp', E('SAFT.takt(1/60)')===0);
E('SAFT.leeren(); SAFT.stop(5)');
let n0=0; while(E('SAFT.takt(1/60)')===0&&n0<100) n0++;
pruefe('stop(5) begrenzt auf 0,15 s (9 Bilder bei 60 Hz)', n0===9, n0);
E('SAFT.leeren(); SAFT.stop(0.05); SAFT.stop(0.05); SAFT.stop(0.05)');
let n1=0; while(E('SAFT.takt(1/60)')===0&&n1<100) n1++;
pruefe('drei Stopps addieren sich bis zur Grenze (9 Bilder)', n1===9, n1);
E('SAFT.leeren(); SAFT.zeitlupe(0.5,0.2)');
const vz=E('SAFT.takt(1/60)');
pruefe('zeitlupe(0.5): halbe Spielzeit', Math.abs(vz-0.5/60)<1e-12, vz);
frame(30);
pruefe('zeitlupe laeuft nach Ablauf wieder normal', Math.abs(E('SAFT.takt(1/60)')-1/60)<1e-12);

console.log('\n--- WACKELN ---');
schalte('wackeln',false);
E('SAFT.leeren(); SAFT.trauma(1)'); frame(1);
const v0=E('SAFT.versatz()');
pruefe('wackeln:false: versatz immer {0,0}', v0.x===0&&v0.y===0, JSON.stringify({x:v0.x,y:v0.y}));
schalte('wackeln',true);
E('SAFT.leeren(); SAFT.trauma(5)');           // mehr als 1 darf nicht durchschlagen
let ganz=true, ausschlag=0;
for(let i=0;i<10;i++){
  frame(1);
  const v=E('SAFT.versatz()');
  if(!Number.isInteger(v.x)||!Number.isInteger(v.y)||Math.abs(v.x)>5||Math.abs(v.y)>5) ganz=false;
  if(v.x!==0||v.y!==0) ausschlag++;
}
pruefe('wackeln: ganzzahlig, hoechstens 5 px, schwingt', ganz&&ausschlag>0, ausschlag);
E('SAFT.leeren(); SAFT.trauma(1)'); frame(60);
const v2=E('SAFT.versatz()');
pruefe('trauma klingt in einer Sekunde ab', v2.x===0&&v2.y===0);

console.log('\n--- BLITZE UND FLACKERSCHUTZ ---');
schalte('flackerschutz',true);
E('SAFT.leeren()'); E("SAFT.blitz('#ffffff',1,0.3)"); zeichne();
const bl=rahmen.filter(r=>r.w===320&&r.h===180);
pruefe('Flackerschutz: Blitz-Alpha <= 0.12', bl.length>0&&bl.every(r=>r.a<=0.12+1e-12), bl.map(r=>r.a).join(','));
schalte('flackerschutz',false);
E('SAFT.leeren()'); E("SAFT.blitz('#ffffff',0.6,0.3)"); zeichne();
const bl2=rahmen.filter(r=>r.w===320&&r.h===180);
pruefe('ohne Flackerschutz: Blitz-Alpha unveraendert (0.6)', bl2.length===1&&Math.abs(bl2[0].a-0.6)<1e-12, bl2.map(r=>r.a).join(','));

/* Zaehlt, wie viele Blitze gezeigt werden, wenn in jedem von 180 Bildern (3 s) einer angefordert wird.
   Jedes Fenster von 60 Bildern (1 s) darf hoechstens so viele Blitzbeginne enthalten. */
const blitzRate=schutz=>{
  schalte('flackerschutz',schutz);
  E('SAFT.leeren()');
  const gezeigt=[];
  for(let i=0;i<180;i++){
    gezeigt.push(E("SAFT.blitz('#ffffff',0.5,0.05)"));
    frame(1);
  }
  let max=0;
  for(let s=0;s<gezeigt.length;s++){
    let c=0;
    for(let j=s;j<Math.min(gezeigt.length,s+60);j++) if(gezeigt[j]) c++;
    if(c>max) max=c;
  }
  return {max, gesamt:gezeigt.filter(Boolean).length};
};
const r3=blitzRate(false);
pruefe('hoechstens 3 Blitze je Sekunde (ohne Flackerschutz)', r3.max<=3&&r3.max===3, JSON.stringify(r3));
const r2=blitzRate(true);
pruefe('hoechstens 2 Blitze je Sekunde (mit Flackerschutz)', r2.max<=2&&r2.max===2, JSON.stringify(r2));
schalte('flackerschutz',false);

console.log('\n--- RAND ---');
schalte('flackerschutz',true);
E('SAFT.leeren(); SAFT.schaden(1)'); zeichne();
pruefe('schaden mit Flackerschutz: Rand <= 0.12', rahmen.length>0&&rahmen.every(r=>r.a<=0.12+1e-12), rahmen.map(r=>r.a).join(','));
schalte('flackerschutz',false);
E('SAFT.leeren(); SAFT.schaden(1)'); zeichne();
pruefe('schaden: roter Rand, 4 Streifen je Schicht (12 Rechtecke)', rahmen.length===12&&rahmen.every(r=>r.f==='#e0202e'), rahmen.length);
E('SAFT.leeren(); SAFT.rand("#e0202e",0.5)'); frame(30); zeichne();
pruefe('Rand klingt in 0,4 s ab', rahmen.length===0);

console.log('\n--- TEILCHEN ---');
E('SAFT.leeren()');
E("SAFT.teilchen('konfetti',100,100,500,0)"); E("SAFT.teilchen('konfetti',100,100,500,0)");
zeichne();
pruefe('Teilchen: hoechstens 240 gleichzeitig', rahmen.length===240, rahmen.length);
E('SAFT.leeren()');
['staub','funken','konfetti','schweiss','glas','herz','stern','rauch'].forEach(a=>E("SAFT.teilchen('"+a+"',50,50,3,0)"));
zeichne();
const klein1=rahmen.filter(r=>r.w===1&&r.h===1).length, gross2=rahmen.filter(r=>r.w===2&&r.h===2).length;
pruefe('acht Arten: staub/funken/schweiss 1x1, rest 2x2', klein1===9&&gross2===15&&rahmen.length===24, klein1+'/'+gross2);
pruefe('Teilchen haben Farben', rahmen.every(r=>/^#[0-9a-f]{6}$/i.test(r.f)));
E('SAFT.leeren()'); E("SAFT.teilchen('quatsch',1,1,5,0); SAFT.teilchen('constructor',1,1,5,0)");
zeichne();
pruefe('unbekannte Art wird ignoriert', rahmen.length===0);
E('SAFT.leeren()'); E("SAFT.teilchen('funken',100,100,40,1)"); frame(1); zeichne();
pruefe('richtung 1: alle nach rechts', rahmen.length>0&&rahmen.every(r=>r.x>=100), rahmen.map(r=>r.x).join(','));
E('SAFT.leeren()'); E("SAFT.teilchen('funken',100,100,40,-1)"); frame(1); zeichne();
pruefe('richtung -1: alle nach links', rahmen.length>0&&rahmen.every(r=>r.x<=100), rahmen.map(r=>r.x).join(','));

console.log('\n--- POPUPS ---');
E('SAFT.leeren()'); E("SAFT.popup('plus eins',100,50,'#ffd23f')"); zeichne();
pruefe('popup: vier dunkle Kopien, dann der Text', texte.length===5&&texte.slice(0,4).every(t=>t.col==='#100818')&&texte[4].col==='#ffd23f', texte.map(t=>t.col).join(','));
pruefe('popup: GROSSBUCHSTABEN', texte.every(t=>t.s==='PLUS EINS'));
const hx=texte[4].x, hy=texte[4].y;
pruefe('popup: Kontur liegt je 1 px versetzt um den Text', texte[0].x===hx-1&&texte[0].y===hy&&texte[1].x===hx+1&&texte[1].y===hy&&texte[2].x===hx&&texte[2].y===hy-1&&texte[3].x===hx&&texte[3].y===hy+1);
pruefe('popup: mittig auf x', hx===Math.round(100-35/2), hx);
E('SAFT.leeren()'); E("SAFT.popup('plus eins',100,50,'#ffd23f')");
let sichtbar=0, tiefste=50;
for(let i=0;i<70;i++){
  frame(1); zeichne();
  if(texte.length){ sichtbar++; tiefste=Math.min(tiefste,texte[texte.length-1].y); }
}
pruefe('popup lebt 0,9 s', sichtbar>=52&&sichtbar<=56, sichtbar);
pruefe('popup steigt etwa 14 px', (50-tiefste)>=12&&(50-tiefste)<=14, 50-tiefste);
E('SAFT.leeren()');
for(let i=0;i<10;i++) E("SAFT.popup('p"+i+"',100,50)");
zeichne();
pruefe('popups: hoechstens 8 gleichzeitig (5 Texte je Popup)', texte.length===40, texte.length);

console.log('\n--- REZEPTE OHNE MUSIK UND OHNE VIBRATION ---');
E('SAFT.leeren()');
let geworfen=false;
try{
  E("SAFT.treffer(10,10,1,0.8); SAFT.treffer(); SAFT.landung(10,10,0.5); SAFT.landung(); SAFT.fund(10,10,'SUPER'); SAFT.fund(); SAFT.schaden(0.5); SAFT.schaden(); SAFT.erfolg(10,10,'OK'); SAFT.erfolg(); SAFT.treffer(NaN,'x',null,Infinity)");
  frame(3); zeichne();
}catch(e){ geworfen=true; }
pruefe('Rezepte werfen nicht (ohne MUSIK, ohne mobilVibriere, fehlende Argumente)', !geworfen);
pruefe('keine NaN-Koordinaten', rahmen.every(r=>Number.isFinite(r.x)&&Number.isFinite(r.y)&&Number.isFinite(r.w)));

console.log('\n--- REZEPTE MIT MUSIK UND VIBRATION ---');
E('SAFT.leeren()');
E("var MUSIK_PROBE=[]; var MUSIK={stinger(n){ MUSIK_PROBE.push(n); }}; var VIB_PROBE=[]; function mobilVibriere(m){ VIB_PROBE.push(m); }");
E("SAFT.fund(10,10,'X'); SAFT.treffer(1,1,1,0.5); SAFT.schaden(0.2); SAFT.erfolg(1,1,'Y')");
pruefe('fund ruft MUSIK.stinger("fund")', E('MUSIK_PROBE.join()')==='fund', E('MUSIK_PROBE.join()'));
pruefe('treffer und schaden vibrieren (2x)', E('VIB_PROBE.length')===2, E('VIB_PROBE.length'));

console.log('\n--- LEEREN UND FEHLENDE HAKEN ---');
E("SAFT.leeren(); SAFT.teilchen('stern',1,1,5,0); SAFT.popup('A',1,1); SAFT.blitz('#fff',.5,.2); SAFT.rand('#000',.5)");
E('SAFT.leeren()'); zeichne();
pruefe('leeren raeumt alles weg', rahmen.length===0&&texte.length===0);
const alt=k.ctx; k.ctx=undefined; let ohneCtx=true;
try{ E('SAFT.zeichne(); SAFT.takt(1/60); SAFT.popup("x",1,1); SAFT.fund(1,1,"Y")'); }catch(e){ ohneCtx=false; }
k.ctx=alt;
pruefe('ohne ctx: keine Ausnahme', ohneCtx);
pruefe('window.SAFT gesetzt', E('window.SAFT===SAFT')===true);

console.log('\n'+ok+' ok, '+fail+' fehl');
process.exit(fail?1:0);
