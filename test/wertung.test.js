/* Prueft nacht/wertung.js (Rang am Levelende) und den Bestrang im LEVEL-WAEHLEN-Menue.
   Ohne Browser. Aus dem Projektordner starten:  node test/wertung.test.js */
const fs=require('fs'), vm=require('vm');
const quelle=fs.readFileSync('nacht/wertung.js','utf8');

const speicher=()=>{ const m=new Map(); return {getItem:k=>m.has(k)?m.get(k):null,
  setItem:(k,v)=>m.set(k,String(v)), removeItem:k=>m.delete(k)}; };

// Frische Instanz von wertung.js; was nicht uebergeben wird, existiert nicht (typeof undefined).
function baue(o){
  o=o||{};
  const f=new Function('window','localStorage','performance','S','ctx','W','H','text','textW','MUSIK','SAFT',
    quelle+'\nreturn WERTUNG;');
  return f(o.window,o.localStorage,o.performance,o.S,o.ctx,o.W,o.H,o.text,o.textW,o.MUSIK,o.SAFT);
}

// Testuhr (Millisekunden, wie performance.now) und Aufzeichnung der Zeichenaufrufe.
let zeit=0;
const uhr={now:()=>zeit};
let gez=[];
const sch=(s)=>gez.push(String(s));                  // text(str,x,y,col,s): nur der Text zaehlt
const breitW=(s,z)=>String(s).length*4*z-z;
const ctxStub=new Proxy({},{get:(t,k)=>k in t?t[k]:()=>{}, set:(t,k,v)=>{ t[k]=v; return true; }});
let stinger=[], teil=[];
const musikStub={stinger:n=>stinger.push(n)};
const saftStub={teilchen:(art)=>teil.push(art)};

// Ein Bild bei Sekunde s; gibt die gezeichneten Texte zurueck.
function bild(w,s){ zeit=s*1000; gez=[]; w.zeichne(); return gez.slice(); }

// Vollstaendige Szene: Level abschliessen (Uhr auf 0) und Zeichen-Umgebung mit allen Attrappen.
function szene(store,level,punkte,zeilen){
  zeit=0; stinger=[]; teil=[];
  const w=baue({window:{}, localStorage:store, performance:uhr, S:{modus:'ende'}, ctx:ctxStub,
    W:320, H:180, text:sch, textW:breitW, MUSIK:musikStub, SAFT:saftStub});
  const r=w.abschluss(level,punkte,zeilen);
  return {w,r};
}

const wirftNicht=f=>{ try{ f(); return true; }catch(e){ return false; } };

let ok=0, fail=0;
const pruefe=(n,b,i)=>{ if(b){ ok++; console.log('  OK   '+n); } else { fail++; console.log('  FEHL '+n+(i?'   -> '+i:'')); } };

console.log('\n--- GRENZEN (S>=90, A>=75, B>=55, sonst C) ---');
const grenz=[[90,'S'],[89.9,'A'],[75,'A'],[74.9,'B'],[55,'B'],[54.9,'C'],[0,'C'],[100,'S'],
  [150,'S'],[-5,'C'],['x','C'],[undefined,'C']];
grenz.forEach(([p,e])=>{ pruefe('Punkte '+p+' -> '+e, baue({}).abschluss(1,p,[]).rang===e); });

console.log('\n--- BESTRANG WIRD NUR VERBESSERT ---');
const st1=speicher(), w1=baue({localStorage:st1});
const a1=w1.abschluss(2,60,[]);
pruefe('erster Lauf B: neuer Bestrang', a1.rang==='B'&&a1.neuerBest===true);
pruefe('best(2) ist B', w1.best(2)==='B');
const a2=w1.abschluss(2,40,[]);
pruefe('schlechter Lauf C: kein neuer Bestrang, B bleibt', a2.rang==='C'&&a2.neuerBest===false&&w1.best(2)==='B');
const a3=w1.abschluss(2,80,[]);
pruefe('besser A: neuer Bestrang', a3.rang==='A'&&a3.neuerBest===true&&w1.best(2)==='A');
pruefe('gleich A: kein neuer Bestrang', w1.abschluss(2,82,[]).neuerBest===false);
w1.abschluss(2,95,[]);
pruefe('S gespeichert', w1.best(2)==='S'&&st1.getItem('nachtschicht.rang2')==='S');
const a4=w1.abschluss(2,70,[]);
pruefe('schlechter nach S: Bestrang bleibt S', a4.rang==='B'&&w1.best(2)==='S'&&st1.getItem('nachtschicht.rang2')==='S');
const u9=w1.abschluss(9,99,[]);
pruefe('Level 9 ungueltig: Rang ja, nichts gespeichert', u9.rang==='S'&&u9.neuerBest===false&&w1.best(9)===null&&st1.getItem('nachtschicht.rang9')===null);
pruefe('best(0), best("x") -> null', w1.best(0)===null&&w1.best('x')===null);
const al=w1.alle();
pruefe('alle(): Schluessel 1..8, Level 2 = S, Rest null', Object.keys(al).join()==='1,2,3,4,5,6,7,8'&&al[2]==='S'&&al[1]===null&&al[8]===null, JSON.stringify(al));

console.log('\n--- NEUANFANG UEBERLEBT DER BESTRANG ---');
const sp=speicher(), wa=baue({localStorage:sp});
wa.abschluss(4,92,[]);
wa.reset();
pruefe('nach reset bleibt nachtschicht.rang4 = S', sp.getItem('nachtschicht.rang4')==='S');
const wb=baue({localStorage:sp});
pruefe('frische Instanz (Neue Nacht): best(4) bleibt S', wb.best(4)==='S');
pruefe('neuer schwacher Lauf aendert nichts', wb.abschluss(4,50,[]).neuerBest===false&&wb.best(4)==='S');
sp.setItem('nachtschicht.rang5','X');
pruefe('kaputter Wert im Speicher: null', baue({localStorage:sp}).best(5)===null);

console.log('\n--- OHNE UMGEBUNG: NICHTS WIRFT ---');
pruefe('ohne localStorage: abschluss gibt A', wirftNicht(()=>{ if(baue({}).abschluss(3,80,[]).rang!=='A') throw 1; }));
pruefe('kaputte zeilen (kein Array): kein Wurf', wirftNicht(()=>baue({}).abschluss(3,80,'kaputt')));
pruefe('window.WERTUNG wird gesetzt', (()=>{ const wo={}; baue({window:wo}); return typeof wo.WERTUNG==='object'&&typeof wo.WERTUNG.zeichne==='function'; })());
pruefe('ohne window: laedt ohne Fehler', wirftNicht(()=>baue({})));
{
  const n1=baue({localStorage:speicher()}); n1.abschluss(3,80,[]);
  pruefe('zeichne ohne S und ctx: kein Wurf', wirftNicht(()=>n1.zeichne()));
  const n2=baue({localStorage:speicher(), S:{modus:'ende'}, text:sch, textW:breitW});
  n2.abschluss(3,80,[]); gez=[];
  pruefe('zeichne mit S, ohne ctx: nichts gezeichnet', wirftNicht(()=>n2.zeichne())&&gez.length===0);
  const n3=baue({localStorage:speicher(), ctx:ctxStub, text:sch, textW:breitW});
  n3.abschluss(3,80,[]); gez=[];
  pruefe('zeichne mit ctx, ohne S: nichts gezeichnet', wirftNicht(()=>n3.zeichne())&&gez.length===0);
  const n4=baue({localStorage:speicher(), S:{modus:'ende'}, ctx:ctxStub});
  n4.abschluss(3,80,[]);
  pruefe('zeichne ohne text/MUSIK/SAFT: kein Wurf', wirftNicht(()=>{ n4.zeichne(); bild(n4,4); }));
  pruefe('zeichne nicht aktiv (vor abschluss): kein Wurf', wirftNicht(()=>baue({S:{modus:'ende'},ctx:ctxStub}).zeichne()));
}

console.log('\n--- TAFEL-PHASEN NACH ZEIT ---');
const zeilen=[{name:'zeit',wert:'1:42',pkt:30},{name:'treffer',wert:'2',pkt:20}];
const sz=szene(speicher(),3,95,zeilen);
pruefe('Rueckgabe S mit neuem Bestrang', sz.r.rang==='S'&&sz.r.neuerBest===true);
let g=bild(sz.w,0.1);
pruefe('0.1 s: Titel da, noch keine Zeile, kein grosser Buchstabe', g.includes('LEVEL 3')&&!g.includes('ZEIT')&&!g.includes('S'), g.join('|'));
g=bild(sz.w,0.55);
pruefe('0.55 s: Zeile 1 da, Punkte halb gezaehlt (15)', g.includes('ZEIT')&&g.includes('15')&&!g.includes('30'), g.join('|'));
g=bild(sz.w,0.9);
pruefe('0.9 s: Zeile 1 voll (30), Zeile 2 halb (12)', g.includes('30')&&g.includes('12'), g.join('|'));
g=bild(sz.w,1.5);
pruefe('1.5 s: Summenzeile GESAMT mit 95', g.includes('GESAMT')&&g.includes('95'), g.join('|'));
g=bild(sz.w,2.1);
pruefe('2.1 s: noch kein grosser Buchstabe, kein Stinger', !g.includes('S')&&stinger.length===0&&teil.length===0);
g=bild(sz.w,2.3);
pruefe('2.3 s: grosses S, Stinger rang, Konfetti (S)', g.includes('S')&&stinger.join()==='rang'&&teil.join()==='konfetti', g.join('|'));
bild(sz.w,2.6);
pruefe('2.6 s: Stinger und Konfetti nur einmal', stinger.length===1&&teil.length===1);
g=bild(sz.w,3.6);
pruefe('3.6 s: Tafel schrumpft, Inhalt ist weg', g.length===0, g.join('|'));
g=bild(sz.w,4.0);
pruefe('4.0 s: Abzeichen RANG S mit NEU!, ohne Zeilen', g.includes('RANG S')&&g.includes('NEU!')&&!g.includes('ZEIT')&&!g.includes('GESAMT'), g.join('|'));
g=bild(sz.w,6.0);
pruefe('6.0 s: Abzeichen bleibt stehen', g.includes('RANG S'));

const spB=speicher(); spB.setItem('nachtschicht.rang1','S');   // alter Bestrang S: B ist kein neuer Bestrang
const sb=szene(spB,1,60,[]);
bild(sb.w,2.3);
pruefe('B: Stinger, aber kein Konfetti', stinger.join()==='rang'&&teil.length===0);
g=bild(sb.w,4.0);
pruefe('B, Level ohne neuen Bestrang: RANG B ohne NEU!', g.includes('RANG B')&&!g.includes('NEU!'), g.join('|'));

const sa=szene(speicher(),2,80,[]);
bild(sa.w,2.3);
pruefe('A: Stinger und Konfetti', stinger.join()==='rang'&&teil.join()==='konfetti');

const sr=szene(speicher(),3,95,[]);
sr.w.reset();
g=bild(sr.w,4.0);
pruefe('nach reset wird nichts gezeichnet', g.length===0);

const sk=szene(speicher(),3,80,[{name:'a',wert:'1',pkt:1},{name:'b',wert:'1',pkt:1},{name:'c',wert:'1',pkt:1},
  {name:'d',wert:'1',pkt:1},{name:'e',wert:'1',pkt:1},{name:'f',wert:'1',pkt:1}]);
g=bild(sk.w,2.0);
pruefe('hoechstens 4 Zeilen aus dem Level (A bis D, E und F fehlen)', g.includes('D')&&!g.includes('E')&&!g.includes('F'), g.join('|'));

console.log('\n--- MENUE: BESTRANG HINTER DEM LEVEL (LEVEL WAEHLEN) ---');
const kx={Math,console,Object,JSON,Date,Array,String,Number,Set,Map,
  localStorage:speicher(), W:320, H:180, IS_TOUCH:false, window:{}, setTimeout(){}, matchMedia:undefined,
  performance:{now:()=>0}};
vm.createContext(kx);
const lade=f=>vm.runInContext(fs.readFileSync(f,'utf8'),kx);
const E=c=>vm.runInContext(c,kx);
['nacht/komfort.js','nacht/stand.js','nacht/nacht.js','nacht/texte.js','nacht/epilog.js','nacht/menue.js','nacht/wertung.js'].forEach(lade);
E('NACHT.kapitel=3');
const label=n=>E("MENUE.eintraege('level').find(e=>e.id==='level"+n+"').txt");
pruefe('ohne Bestrang: nur Name', label(3)==='LEVEL 3 - DER LETZTE BUS', label(3));
E('WERTUNG.abschluss(3,80,[])');
pruefe('mit Bestrang A: zwei Leerzeichen und A', label(3)==='LEVEL 3 - DER LETZTE BUS  A', label(3));
pruefe('Level 1 unveraendert', label(1)==='LEVEL 1 - DIE SCHULE', label(1));
E('WERTUNG.abschluss(3,40,[])');
pruefe('schlechterer Lauf aendert die Anzeige nicht', label(3)==='LEVEL 3 - DER LETZTE BUS  A', label(3));

console.log('\n'+ok+' ok, '+fail+' fehl');
if(fail) process.exit(1);
