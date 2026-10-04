/* Prueft nacht/geraet.js ohne Browser.   node test/geraet.test.js

   geraet.js laeuft hier in einem vm-Kontext mit einem kleinen Attrappen-Browser:
   Elemente mit Kindern/Klassen/Klicks, Zeitgeber, requestAnimationFrame, Speicher,
   Service-Worker-Objekte. Die Spielschleife ist die ECHTE aus nacht/kern.js (der Teil
   ab "Schleife"), damit die Umhuellung gegen den wirklichen Code geprueft wird.

   Was NICHT geht: wie die Fehlerseite aussieht, ob der Toast die Touch-Bedienung
   verdeckt, ob der Vollbild-Umzug im echten Browser klappt, und der echte
   Service-Worker-Lebenszyklus. Das bleibt der Browser-Abnahme (siehe die
   Hinweise am Ende der Ausgabe). */
const fs=require('fs'), vm=require('vm'), path=require('path');
const WURZEL=path.join(__dirname,'..');
/* GERAET_DATEI: eine andere geraet.js pruefen (z.B. eine absichtlich beschaedigte). */
const GERAET_QUELLE=fs.readFileSync(process.env.GERAET_DATEI||path.join(WURZEL,'nacht/geraet.js'),'utf8');
const KERN=fs.readFileSync(path.join(WURZEL,'nacht/kern.js'),'utf8');
/* Nur die Schleife aus kern.js: der Rest braucht einen echten Canvas. */
const SCHLEIFE=KERN.slice(KERN.indexOf('/* ---- Schleife.'));

let ok=0, fail=0;
const pruefe=(name,bed,info)=>{ if(bed){ ok++; console.log('  OK   '+name); }
  else { fail++; console.log('  FEHL '+name+(info?'   -> '+info:'')); } };

/* ---- Attrappen-Browser ---------------------------------------------------------- */
class El{
  constructor(tag){ this.tagName=String(tag).toUpperCase(); this.children=[]; this.parentNode=null;
    this.attrs={}; this.listeners={}; this.className=''; this.textContent=''; this.id='';
    this.style={}; this.disabled=false;
    const self=this;
    this.classList={
      _l:()=>self.className.split(/\s+/).filter(Boolean),
      add(c){ if(!this._l().includes(c)) self.className=(self.className+' '+c).trim(); },
      remove(c){ self.className=this._l().filter(x=>x!==c).join(' '); },
      contains(c){ return this._l().includes(c); } };
  }
  appendChild(c){ if(c.parentNode) c.parentNode.removeChild(c); c.parentNode=this; this.children.push(c); return c; }
  removeChild(c){ const i=this.children.indexOf(c); if(i>=0) this.children.splice(i,1); c.parentNode=null; return c; }
  setAttribute(k,v){ this.attrs[k]=v; }
  addEventListener(n,f){ (this.listeners[n]=this.listeners[n]||[]).push(f); }
  click(){ (this.listeners.click||[]).slice().forEach(f=>f({preventDefault(){},stopPropagation(){}})); }
  focus(){ this.fokus=true; }
  alle(){ return this.children.reduce((a,c)=>a.concat([c],c.alle()),[]); }
  finde(f){ return this.alle().find(f); }
  text(){ return this.textContent+this.children.map(c=>c.text()).join(' '); }
}
function speicher(){ const m=new Map(); return {
  getItem:k=>m.has(k)?m.get(k):null, setItem:(k,v)=>{ m.set(k,String(v)); }, removeItem:k=>{ m.delete(k); },
  key:i=>[...m.keys()][i]===undefined?null:[...m.keys()][i], get length(){ return m.size; }, _m:m }; }
function kaputterSpeicher(){ return { getItem(){ throw new Error('SecurityError'); }, setItem(){ throw new Error('QuotaExceededError'); },
  removeItem(){}, key(){ return null; }, length:0 }; }

/* Ein kompletter Aufbau: Seite + kern.js-Schleife + geraet.js. opt steuert Umgebung und Seite. */
function aufbau(opt){
  opt=opt||{};
  const sb={ console:opt.stumm===false?console:{ error(){}, warn(){}, log(){} } };
  sb.window=sb;
  let t=0;                                   // Zeit in ms, von vorspulen() bewegt
  const timer=[]; let tid=1;
  sb.Date={ now:()=>t };
  sb.setTimeout=(f,ms)=>{ const id=tid++; timer.push({id,f,ab:t+(ms||0)}); return id; };
  sb.clearTimeout=id=>{ const i=timer.findIndex(x=>x.id===id); if(i>=0) timer.splice(i,1); };
  sb.intervalle=[]; sb.setInterval=(f,ms)=>{ sb.intervalle.push({f,ms}); return tid++; };
  const vorspulen=ms=>{ const ende=t+ms;
    for(;;){ timer.sort((a,b)=>a.ab-b.ab); if(!timer.length||timer[0].ab>ende) break;
      const x=timer.shift(); t=Math.max(t,x.ab); x.f(); }
    t=ende; };
  const rafs=[]; sb.requestAnimationFrame=f=>{ rafs.push(f); return rafs.length; };
  sb.performance={ now:()=>t };
  const rahmen=()=>{ t+=16; const q=rafs.splice(0); q.forEach(f=>f(t)); };
  const ticken=n=>{ for(let i=0;i<n;i++) rahmen(); };

  const hoerer={};      // window/document: Name -> [Funktionen]
  const an=(ziel)=>(n,f)=>{ (ziel[n]=ziel[n]||[]).push(f); };
  sb.addEventListener=an(hoerer);
  const dokHoerer={};
  const doc={ createElement:tag=>new El(tag), body:new El('body'), head:new El('head'), documentElement:new El('html'),
    readyState:opt.readyState||'complete', visibilityState:opt.sichtbar||'visible', fullscreenElement:null,
    addEventListener:an(dokHoerer), removeEventListener(){} };
  sb.document=doc;
  sb.feuere=(n,ev)=>{ (hoerer[n]||[]).slice().forEach(f=>f(ev||{})); };
  sb.feuereDok=(n,ev)=>{ (dokHoerer[n]||[]).slice().forEach(f=>f(ev||{})); };
  sb.laden=()=>{ doc.readyState='complete'; sb.feuere('load'); };

  sb.localStorage=opt.lokal||speicher(); sb.sessionStorage=opt.sitzung||speicher();
  const ort={ protocol:'https:', host:'spiel.test', hostname:'spiel.test', pathname:'/Nachtschicht/level3.html',
    search:'', hash:'', href:'https://spiel.test/Nachtschicht/level3.html', neu:0, ersetzt:null,
    reload(){ this.neu++; }, replace(u){ this.ersetzt=u; } };
  Object.assign(ort,opt.ort||{});
  sb.location=ort;
  sb.navigator={ userAgent:'TestUA/1.0 (Attrappe)', onLine:opt.online!==false, serviceWorker:opt.sw };
  if(opt.caches) sb.caches=opt.caches;

  /* Das Spiel: update/draw zaehlen und koennen auf Wunsch werfen. */
  sb.zaehler={ update:0, draw:0 }; sb.werfe=null;
  sb.update=function(dt){ sb.zaehler.update++; if(sb.werfe) throw new Error(typeof sb.werfe==='string'?sb.werfe:'kaputt'); };
  sb.draw=function(dt){ sb.zaehler.draw++; };
  vm.createContext(sb);
  vm.runInContext(SCHLEIFE,sb,{filename:'kern.js'});
  if(opt.audio){ vm.runInContext('let AC=null;',sb); sb.AC_=opt.audio; vm.runInContext('AC=AC_;',sb); }
  if(opt.ohneGeraet!==true) vm.runInContext(GERAET_QUELLE,sb,{filename:'https://spiel.test/Nachtschicht/nacht/geraet.js'});
  const lies=c=>vm.runInContext(c,sb);
  return { sb, doc, ort, G:opt.ohneGeraet?null:lies('GERAET'), lies, vorspulen, rahmen, ticken, rafs,
    seite:()=>doc.body.alle().find(e=>e.className.split(' ').includes('ns-fehler')),
    toasts:()=>doc.body.alle().filter(e=>e.className.split(' ').includes('ns-toast')),
    start:()=>lies('starteSchleife()') };
}
const fehler=(msg,datei,extra)=>Object.assign({ message:msg, filename:datei, lineno:12, error:new Error(msg) },extra||{});
const EIGENE='https://spiel.test/Nachtschicht/level3.html';
const buttons=s=>s.alle().filter(e=>e.tagName==='BUTTON'||e.tagName==='A');
const knopf=(s,txt)=>buttons(s).find(b=>b.textContent.indexOf(txt)===0);
const warte=()=>new Promise(r=>setImmediate(r));

(async()=>{
  console.log('\n--- Grundlagen ---');
  {
    const a=aufbau();
    pruefe('GERAET.version ist 1.0.0', a.G.version==='1.0.0');
    pruefe('GERAET.build ist eine 12-stellige Zahl (oder noch STAND)', /^[0-9]{12}$/.test(a.G.build)||a.G.build==='STAND', a.G.build);
    const src=GERAET_QUELLE.replace(/\r/g,'');
    pruefe('die Quelle bleibt reines ASCII (Umlaute nur als \\u-Escape)', !/[^\x00-\x7f]/.test(src));
    vm.runInContext(GERAET_QUELLE,vm.createContext({}));
    pruefe('laeuft ohne document/window/navigator (reiner Kontext) ohne Ausnahme', true);
  }

  console.log('\n--- Spielschleife ---');
  {
    const a=aufbau(); a.start();
    pruefe('bild() ist umhuellt', a.lies('typeof bild==="function"&&bild.nsGeschuetzt===true'));
    a.ticken(10);
    pruefe('normale Bilder: update und draw laufen jedes Mal', a.sb.zaehler.update===10&&a.sb.zaehler.draw===10&&a.G.bilder===10, JSON.stringify(a.sb.zaehler));
    pruefe('die Schleife bleibt dabei bei genau EINEM bestellten Takt', a.rafs.length===1, String(a.rafs.length));
  }
  {
    const a=aufbau(); a.start(); a.ticken(3);
    a.sb.werfe='Einzelfall'; a.ticken(1); a.sb.werfe=null;
    pruefe('nach einer einzelnen Ausnahme ist der naechste Takt bestellt (Spiel friert nicht ein)', a.rafs.length===1);
    const vor=a.sb.zaehler.draw; a.ticken(5);
    pruefe('... und das Spiel laeuft danach normal weiter', a.sb.zaehler.draw===vor+5&&!a.seite());
    pruefe('die Ausnahme wurde gemerkt (GERAET.fehler), aber nichts angezeigt', a.G.fehler.length===1&&a.G.fehler[0].text==='Einzelfall'&&a.G.fehler[0].art==='bild'&&!a.seite()&&a.toasts().length===0);
  }
  {
    const a=aufbau(); a.start(); a.sb.werfe='Dauerfehler';
    a.ticken(5);
    pruefe('fuenf Ausnahmen in Folge zeigen noch NICHTS', !a.seite()&&a.rafs.length===1);
    a.sb.werfe=null; a.ticken(1); a.sb.werfe='Dauerfehler'; a.ticken(5);
    pruefe('ein gutes Bild dazwischen setzt die Zaehlung zurueck', !a.seite());
    a.ticken(1);
    pruefe('die sechste in Folge zeigt die Fehlerseite', !!a.seite());
    pruefe('... und die Schleife steht danach still (kein weiterer Takt)', a.rafs.length===0);
    const z=a.sb.zaehler.update; a.ticken(3);
    pruefe('... das Spiel rechnet nicht mehr im Hintergrund', a.sb.zaehler.update===z);
  }
  {
    const a=aufbau({ ort:{ search:'?fehlertest=9' } });
    pruefe('?fehlertest=9 merkt sich neun absichtliche Fehler', a.G.testFehler===9);
    a.start(); a.ticken(6);
    pruefe('?fehlertest=9: nach sechs Bildern steht die Fehlerseite', !!a.seite());
    const b=aufbau({ ort:{ search:'?fehlertest=1' } }); b.start(); b.ticken(8);
    pruefe('?fehlertest=1: ein einziger Fehler zeigt nichts und das Spiel laeuft weiter', !b.seite()&&b.sb.zaehler.draw===7);
  }
  {
    /* Original hat seinen Takt schon vor der Ausnahme bestellt: nicht doppelt laufen. */
    const a=aufbau(); a.start();
    const huelle=a.lies('bild'); const orig=huelle.nsOriginal;
    a.rafs.length=0;
    a.sb.requestAnimationFrame(huelle); a.sb.requestAnimationFrame(huelle);   // zwei Schleifen im selben Bild
    a.ticken(1);
    pruefe('doppelter Takt im selben Bild wird abgefangen (kein doppeltes Tempo)', a.sb.zaehler.draw===1&&a.rafs.length===1, a.sb.zaehler.draw+' draws, '+a.rafs.length+' Takte');
    pruefe('Huelle merkt sich das Original', typeof orig==='function'&&orig.name==='bild');
  }

  console.log('\n--- Fehlerseite ---');
  {
    const a=aufbau({ lokal:(()=>{ const s=speicher(); s.setItem('nachtschicht.stand','1'); s.setItem('nachtschicht.crew','2'); s.setItem('andere.app','x'); return s; })() });
    a.start(); a.sb.werfe='Boom im Level'; a.ticken(6);
    const s=a.seite();
    pruefe('Fehlerseite ist ein alertdialog im Spielstil', !!s&&s.attrs.role==='alertdialog');
    const txt=s?s.text():'';
    pruefe('Text: ETWAS IST SCHIEFGELAUFEN', txt.includes('ETWAS IST SCHIEFGELAUFEN'));
    pruefe('Text: die kurze Fehlermeldung steht klein darunter', txt.includes('Boom im Level'));
    const namen=buttons(s).map(b=>b.textContent);
    pruefe('vier Bedienelemente: NEU LADEN, ZUM MENUE, SPIELSTAND LOESCHEN, MELDEN',
      namen.length===4&&namen[0]==='NEU LADEN'&&namen[1]==='ZUM MENÜ'&&namen[2]==='SPIELSTAND LÖSCHEN'&&namen[3]==='MELDEN', namen.join('|'));
    const css=a.doc.head.alle().concat([a.doc.head]).map(e=>e.textContent).join('')+a.doc.documentElement.alle().map(e=>e.textContent).join('');
    pruefe('Stil: Rosa #ff3d8b und Gold #ffd447, Monospace, dunkler Grund', /#ff3d8b/.test(css)&&/#ffd447/.test(css)&&/monospace/.test(css)&&/#04030a/.test(css));
    const m=knopf(s,'MELDEN');
    const url=decodeURIComponent(m.href);
    pruefe('MELDEN ist nur ein Link zu den GitHub-Issues (nichts wird gesendet)', m.tagName==='A'&&m.href.indexOf('https://github.com/Nikros07/Nachtschicht/issues/new?')===0&&m.target==='_blank'&&/noopener/.test(m.rel));
    pruefe('... vorbefuellt mit Version, Seite, Fehler und Browser', url.includes('1.0.0')&&url.includes('level3.html')&&url.includes('Boom im Level')&&url.includes('TestUA/1.0'), url);
    knopf(s,'NEU LADEN').click();
    pruefe('NEU LADEN laedt neu (beim ersten Mal ohne den Offline-Speicher anzufassen)', a.ort.neu===1);
    knopf(s,'ZUM MEN').click();
    pruefe('ZUM MENUE geht auf index.html', a.ort.href==='index.html');
    const weg=knopf(s,'SPIELSTAND');
    weg.click();
    pruefe('SPIELSTAND LOESCHEN fragt erst nach (erster Klick loescht nichts)', a.sb.localStorage.getItem('nachtschicht.stand')==='1'&&/WIRKLICH/.test(weg.textContent));
    a.vorspulen(7000);
    pruefe('... die Rueckfrage verfaellt nach einigen Sekunden', /SPIELSTAND/.test(weg.textContent));
    weg.click(); weg.click();
    pruefe('zweiter Klick loescht NUR nachtschicht.-Schluessel', a.sb.localStorage.getItem('nachtschicht.stand')===null&&a.sb.localStorage.getItem('nachtschicht.crew')===null&&a.sb.localStorage.getItem('andere.app')==='x');
    a.ort.href='x'; a.vorspulen(800);
    pruefe('... und geht danach zum Menue', a.ort.href==='index.html');
  }
  {
    /* Zweites Mal im selben Tab: NEU LADEN leert auch den Offline-Speicher. */
    const sitzung=speicher();
    const ablagen=new Map([['nachtschicht-1',1],['nachtschicht-2',1],['fremd-1',1]]);
    const geloescht=[]; const reg={ n:0, unregister(){ reg.n++; return Promise.resolve(true); } };
    const caches={ keys:()=>Promise.resolve([...ablagen.keys()]), delete:n=>{ geloescht.push(n); ablagen.delete(n); return Promise.resolve(true); } };
    const sw={ controller:null, getRegistration:()=>Promise.resolve(reg), addEventListener(){}, register:()=>new Promise(()=>{}) };
    const a=aufbau({ sitzung, caches, sw, ort:{ protocol:'http:' , host:'x', hostname:'x' } });
    a.G.zeigeFehlerseite(new Error('erstes Mal'));
    knopf(a.seite(),'NEU LADEN').click(); await warte();
    pruefe('erstes Mal: einfaches Neuladen, Offline-Speicher bleibt', a.ort.neu===1&&geloescht.length===0&&reg.n===0);
    const b=aufbau({ sitzung, caches, sw, ort:{ protocol:'http:', host:'x', hostname:'x' } });
    b.G.zeigeFehlerseite(new Error('zweites Mal'));
    knopf(b.seite(),'NEU LADEN').click(); await warte(); await warte();
    pruefe('zweites Mal im selben Tab: nur nachtschicht-Speicher geleert, fremde nicht', geloescht.sort().join()==='nachtschicht-1,nachtschicht-2'&&ablagen.has('fremd-1'), geloescht.join());
    pruefe('... der eigene Service Worker wird abgemeldet und danach neu geladen', reg.n===1&&b.ort.neu===1);
    const c=aufbau({ sitzung, caches:{ keys:()=>Promise.resolve(['nachtschicht-9']), delete:()=>Promise.resolve(true) }, sw, online:false });
    c.G.zeigeFehlerseite(new Error('offline'));
    knopf(c.seite(),'NEU LADEN').click(); await warte();
    pruefe('offline wird der Speicher NIE geleert (sonst gaebe es nichts mehr zu laden)', c.ort.neu===1);
  }

  console.log('\n--- harmlose und echte Fehler (window error) ---');
  {
    const a=aufbau(); a.start(); a.ticken(2);
    const harmlos=[
      fehler('ResizeObserver loop completed with undelivered notifications.',EIGENE),
      fehler('Script error.',''), fehler('Script error.','https://spiel.test/x.js'),
      fehler('irgendwas','' ), fehler('Boom','chrome-extension://abcdef/inhalt.js'), fehler('Boom','moz-extension://abc/x.js'),
      fehler('Boom','https://fremde-werbung.example/tracker.js'), fehler('Boom','about:blank'),
    ];
    for(let i=0;i<30;i++) harmlos.forEach(e=>a.sb.feuere('error',e));
    pruefe('Rauschen (ResizeObserver, Script error, Erweiterungen, fremde Herkunft) zeigt nichts und wird nicht mitgezaehlt', !a.seite()&&a.G.fehler.length===0);
    a.sb.feuere('error',fehler('Echter Fehler',EIGENE));
    pruefe('ein einzelner eigener Fehler wird gemerkt, zeigt aber nichts', !a.seite()&&a.G.fehler.length===1&&/level3\.html:12/.test(a.G.fehler[0].ort));
    for(let i=0;i<30;i++) a.sb.feuere('unhandledrejection',{ reason:new Error('Vollbild abgelehnt') });
    pruefe('unhandledrejection wird gemerkt (nur die letzten 10), zeigt aber nie allein etwas', !a.seite()&&a.G.fehler.length===10);
    for(let i=0;i<25;i++) a.sb.feuere('error',fehler('Sturm',EIGENE));
    pruefe('ein Sturm eigener Fehler (20 in 5 s) zeigt die Fehlerseite', !!a.seite());
  }
  {
    const a=aufbau(); a.start(); a.ticken(1);
    for(let i=0;i<30;i++){ a.sb.feuere('error',fehler('langsam',EIGENE)); a.vorspulen(1000); }
    pruefe('dieselben Fehler ueber lange Zeit verteilt zeigen nichts', !a.seite());
  }
  {
    /* Ladefehler: das Level-Skript wirft, starteSchleife() wird nie erreicht. */
    const a=aufbau({ readyState:'loading' });
    a.sb.feuere('error',fehler('x is not defined',EIGENE));
    a.sb.laden(); a.vorspulen(1400);
    pruefe('Ladefehler: vor Ablauf der Frist noch keine Seite', !a.seite());
    a.vorspulen(200);
    pruefe('Ladefehler ohne ein einziges Bild: 1,5 s nach dem Laden erscheint die Fehlerseite', !!a.seite()&&a.seite().text().includes('x is not defined'));
    const b=aufbau({ readyState:'loading' });
    b.sb.feuere('error',fehler('nebensaechlich',EIGENE)); b.start(); b.ticken(3); b.sb.laden(); b.vorspulen(2000);
    pruefe('Fehler beim Laden, aber das Spiel laeuft trotzdem: keine Fehlerseite', !b.seite());
    const c=aufbau({ readyState:'loading', sichtbar:'hidden' });
    c.sb.feuere('error',fehler('x',EIGENE)); c.sb.laden(); c.vorspulen(3000);
    pruefe('Tab im Hintergrund beim Laden: keine falsche Fehlerseite (dort laufen keine Bilder)', !c.seite());
    c.doc.visibilityState='visible'; c.sb.feuereDok('visibilitychange'); c.vorspulen(1600);
    pruefe('... aber beim Zurueckkommen wird nachgeprueft', !!c.seite());
    const d=aufbau({ readyState:'loading' }); d.sb.laden(); d.vorspulen(3000);
    pruefe('ohne jeden Fehler bleibt es ruhig, auch ohne Bild', !d.seite());
  }
  {
    /* Eigene Schleife (runner.html): frame() wird erst bei DOMContentLoaded umhuellt. */
    const a=aufbau({ ort:{ pathname:'/Nachtschicht/runner.html' } });
    let n=0, werfen=false;
    vm.runInContext('function frame(now){ zaehle(); if(werf()) throw new Error("runner kaputt"); requestAnimationFrame(frame); }',a.sb);
    a.sb.zaehle=()=>{ n++; }; a.sb.werf=()=>werfen;
    a.sb.feuereDok('DOMContentLoaded');
    pruefe('runner.html: frame() wird umhuellt', a.lies('frame.nsGeschuetzt===true'));
    a.rafs.length=0; a.sb.requestAnimationFrame(a.lies('frame')); a.ticken(2); werfen=true; a.ticken(1);
    pruefe('runner.html: eine Ausnahme beendet die Schleife nicht', a.rafs.length===1);
    a.ticken(6);
    pruefe('runner.html: Dauerfehler zeigt die Fehlerseite', !!a.seite());
    const b=aufbau({ ort:{ pathname:'/Nachtschicht/level3.html' } });
    vm.runInContext('function frame(x){ return x; }',b.sb); b.sb.feuereDok('DOMContentLoaded');
    pruefe('Seiten ohne eigene Schleife: ein Hilfswort frame() bleibt unangetastet', b.lies('frame.nsGeschuetzt===undefined'));
  }

  console.log('\n--- Hintergrund (Ton) ---');
  {
    const mk=state=>{ const f={ state, suspend:0, resume:0, suspend(){ f.nSusp=(f.nSusp||0)+1; f.state='suspended'; return Promise.resolve(); },
      resume(){ f.nRes=(f.nRes||0)+1; f.state='running'; return Promise.resolve(); } }; return f; };
    const ac=mk('running'); const a=aufbau({ audio:ac });
    a.doc.visibilityState='hidden'; a.sb.feuereDok('visibilitychange');
    pruefe('Tab weg: der AudioContext wird angehalten', ac.nSusp===1);
    a.doc.visibilityState='visible'; a.sb.feuereDok('visibilitychange');
    pruefe('Tab zurueck: der AudioContext laeuft wieder', ac.nRes===1&&ac.state==='running');
    const ios=mk('interrupted'); const b=aufbau({ audio:ios });
    b.doc.visibilityState='visible'; b.sb.feuereDok('visibilitychange');
    pruefe('iOS: Zustand interrupted wird beim Zurueckkommen fortgesetzt', ios.nRes===1);
    const gesperrt=mk('suspended'); const c=aufbau({ audio:gesperrt });
    c.doc.visibilityState='hidden'; c.sb.feuereDok('visibilitychange'); c.doc.visibilityState='visible'; c.sb.feuereDok('visibilitychange');
    pruefe('ein vom Browser gesperrter Kontext (Autoplay) wird nicht unaufgefordert geweckt', !gesperrt.nRes&&!gesperrt.nSusp);
    const d=aufbau(); d.doc.visibilityState='hidden'; d.sb.feuereDok('visibilitychange'); d.doc.visibilityState='visible'; d.sb.feuereDok('visibilitychange');
    pruefe('ohne ton.js/AudioContext passiert nichts Schlimmes', true);
    const kaputt={ state:'running', suspend(){ return Promise.reject(new Error('nein')); }, resume(){ return Promise.reject(new Error('nein')); } };
    const e=aufbau({ audio:kaputt }); e.doc.visibilityState='hidden'; e.sb.feuereDok('visibilitychange');
    e.doc.visibilityState='visible'; e.sb.feuereDok('visibilitychange'); await warte();
    pruefe('abgelehntes suspend/resume erzeugt keine unbehandelte Ablehnung', true);
  }

  console.log('\n--- Hinweise (Toast) ---');
  {
    const a=aufbau();
    a.G.hinweis('Hallo',2000);
    let t=a.toasts();
    pruefe('Toast erscheint mit Text und role=status', t.length===1&&t[0].textContent==='Hallo'&&t[0].attrs.role==='status');
    a.vorspulen(100);
    pruefe('... wird nach einem Takt eingeblendet (Klasse an)', t[0].classList.contains('an'));
    a.G.hinweis('Hallo',2000);
    pruefe('gleicher Text stapelt sich nicht', a.toasts().length===1);
    a.G.hinweis('Zweiter',1500);
    pruefe('ein zweiter Toast wartet, bis der erste weg ist', a.toasts().length===1&&a.toasts()[0].textContent==='Hallo');
    a.vorspulen(2400);
    pruefe('... danach kommt der zweite', a.toasts().length===1&&a.toasts()[0].textContent==='Zweiter', a.toasts().map(x=>x.textContent).join());
    a.vorspulen(2000);
    pruefe('... und danach ist keiner mehr da', a.toasts().length===0);
    const css=a.doc.head.children.map(e=>e.textContent).join('')+a.doc.documentElement.children.map(e=>e.textContent).join('');
    pruefe('Schrift im Toast mindestens 14 px', /\.ns-toast\{[^}]*font:700 14px/.test(css));
    pruefe('Toast faengt keine Beruehrungen ab (pointer-events:none), Handy: oben mittig', /\.ns-toast\{[^}]*pointer-events:none/.test(css)&&/html\.touch \.ns-toast\{[^}]*top:/.test(css));
    pruefe('Toast liegt unter dem Handy-Fenster (z-index 40 < 50)', /\.ns-toast\{[^}]*z-index:40/.test(css));
    pruefe('GERAET.hinweis ohne document gibt false und wirft nicht', (()=>{ const x=vm.createContext({}); vm.runInContext(GERAET_QUELLE,x); return vm.runInContext('GERAET.hinweis("x")',x)===false; })());
  }
  {
    const a=aufbau(); let getippt=0;
    a.G.hinweis('Tippen!',3000,{ beiTippen:()=>{ getippt++; } });
    const t=a.toasts()[0];
    pruefe('Toast mit beiTippen ist ein Knopf', t.tagName==='BUTTON'&&/tipp/.test(t.className));
    t.click(); a.vorspulen(400);
    pruefe('Antippen ruft die Aktion auf und schliesst den Toast', getippt===1&&a.toasts().length===0);
  }
  {
    /* Vollbild: alles ausserhalb des Vollbild-Elements ist unsichtbar. */
    const a=aufbau(); const cab=new El('div'); a.doc.body.appendChild(cab); a.doc.fullscreenElement=cab;
    a.G.hinweis('Im Vollbild',2000);
    pruefe('im Vollbild haengt der Toast IM Vollbild-Element', cab.alle().some(e=>e.textContent==='Im Vollbild')&&!a.doc.body.children.includes(a.toasts()[0]));
    a.doc.fullscreenElement=null; a.sb.feuereDok('fullscreenchange');
    pruefe('beim Verlassen des Vollbilds zieht er zurueck in den Body', a.doc.body.children.some(e=>e.textContent==='Im Vollbild'));
    const b=aufbau(); const cab2=new El('div'); b.doc.body.appendChild(cab2);
    b.start(); b.sb.werfe='x'; b.doc.fullscreenElement=cab2; b.ticken(6);
    pruefe('auch die Fehlerseite erscheint im Vollbild-Element', cab2.children.some(e=>/ns-fehler/.test(e.className)));
  }

  console.log('\n--- Speicher-Gesundheit ---');
  {
    const a=aufbau();
    pruefe('funktionierender Speicher: speicherOk bleibt true, kein Hinweis', a.G.speicherOk===true&&a.toasts().length===0&&a.sb.localStorage.length===0);
    const sitzung=speicher();
    const b=aufbau({ lokal:kaputterSpeicher(), sitzung });
    pruefe('Schreibtest scheitert: speicherOk=false', b.G.speicherOk===false);
    pruefe('... und ein kleiner Hinweis erscheint', b.toasts().length===1&&/Speichern/.test(b.toasts()[0].textContent));
    const c=aufbau({ lokal:kaputterSpeicher(), sitzung });
    pruefe('... aber nur einmal je Tab (naechste Seite zeigt ihn nicht wieder)', c.G.speicherOk===false&&c.toasts().length===0);
    const d=aufbau({ lokal:{ getItem:()=>null, setItem(){}, removeItem(){}, key:()=>null, length:0 } });
    pruefe('Speicher, der Werte verschluckt, gilt als kaputt', d.G.speicherOk===false);
    pruefe('das Spiel laeuft ohne Speicher normal weiter', (()=>{ b.start(); b.ticken(5); return b.sb.zaehler.draw===5; })());
  }

  console.log('\n--- Service Worker ---');
  const fakeSW=(opt)=>{
    opt=opt||{};
    const reg={ waiting:opt.waiting||null, installing:null, updates:0, ereignisse:{}, unreg:0,
      addEventListener(n,f){ reg.ereignisse[n]=f; }, update(){ reg.updates++; return Promise.resolve(); }, unregister(){ reg.unreg++; return Promise.resolve(true); } };
    const sw={ controller:opt.controller===false?null:{}, aufrufe:[], ereignisse:{}, reg,
      addEventListener(n,f){ sw.ereignisse[n]=f; },
      register(url,o){ sw.aufrufe.push([url,o]); return opt.ablehnen?Promise.reject(new Error('SecurityError')):Promise.resolve(reg); },
      getRegistration(){ return Promise.resolve(reg); } };
    return sw;
  };
  {
    const sw=fakeSW(); const a=aufbau({ sw, readyState:'loading' });
    pruefe('vor dem Laden wird noch nicht registriert', sw.aufrufe.length===0);
    a.sb.laden(); await warte();
    pruefe('https: sw.js wird nach dem Laden registriert', sw.aufrufe.length===1&&sw.aufrufe[0][0]==='sw.js');
    pruefe('... mit updateViaCache:none (sw.js kommt nie aus dem HTTP-Cache)', sw.aufrufe[0][1]&&sw.aufrufe[0][1].updateViaCache==='none');
    pruefe('... und es wird regelmaessig nach neuen Versionen gesehen', a.sb.intervalle.length===1&&a.sb.intervalle[0].ms>=10*60*1000);
    pruefe('ohne wartende Version kein Hinweis', a.toasts().length===0);
    const b=aufbau({ sw:fakeSW(), ort:{ protocol:'file:', host:'', hostname:'' } }); await warte();
    pruefe('file://: nichts wird registriert, das Spiel laeuft einfach weiter', b.sb.navigator.serviceWorker.aufrufe.length===0);
    const c=aufbau({ ort:{ protocol:'https:' } }); await warte();
    pruefe('Browser ohne Service Worker: keine Ausnahme', true);
    const d=aufbau({ sw:fakeSW({ ablehnen:true }) }); await warte();
    pruefe('Registrierung scheitert: kein Fehlerbild, das Spiel laeuft weiter', !d.seite()&&d.toasts().length===0);
    d.start(); d.ticken(3);
    pruefe('... und die Schleife laeuft', d.sb.zaehler.draw===3);
  }
  {
    /* Neue Version wartet bereits beim Laden. */
    const waiting={ gesendet:[], postMessage(m){ waiting.gesendet.push(m); } };
    const sw=fakeSW({ waiting }); const a=aufbau({ sw }); await warte();
    const t=a.toasts();
    pruefe('wartende neue Version: Hinweis NEUE VERSION - TIPPEN ZUM LADEN', t.length===1&&t[0].textContent==='NEUE VERSION - TIPPEN ZUM LADEN', t.map(x=>x.textContent).join());
    pruefe('... und es wird NICHT von allein neu geladen', a.ort.neu===0&&waiting.gesendet.length===0);
    sw.ereignisse.controllerchange&&sw.ereignisse.controllerchange();
    pruefe('Wechsel des Service Workers ohne Antippen laedt NICHT neu (mitten im Spiel)', a.ort.neu===0);
    t[0].click();
    pruefe('Antippen schickt SKIP_WAITING an die neue Version', waiting.gesendet.length===1&&waiting.gesendet[0].type==='SKIP_WAITING');
    pruefe('... und noch laedt nichts neu (erst wenn sie uebernommen hat)', a.ort.neu===0);
    sw.ereignisse.controllerchange(); sw.ereignisse.controllerchange();
    pruefe('controllerchange nach dem Antippen laedt genau einmal neu', a.ort.neu===1);
  }
  {
    /* Neue Version kommt erst waehrend des Spiels (updatefound). */
    const sw=fakeSW(); const a=aufbau({ sw }); await warte();
    const neu={ state:'installing', lauscher:{}, addEventListener(n,f){ neu.lauscher[n]=f; }, postMessage(){} };
    sw.reg.installing=neu; sw.reg.ereignisse.updatefound();
    neu.state='installing'; neu.lauscher.statechange();
    pruefe('Zwischenzustaende zeigen noch nichts', a.toasts().length===0);
    neu.state='installed'; neu.lauscher.statechange();
    pruefe('installed + bestehende Steuerung: Hinweis erscheint', a.toasts().length===1&&/NEUE VERSION/.test(a.toasts()[0].textContent));
    const erst=fakeSW({ controller:false }); const b=aufbau({ sw:erst }); await warte();
    const n2={ state:'installed', lauscher:{}, addEventListener(n,f){ n2.lauscher[n]=f; } };
    erst.reg.installing=n2; erst.reg.ereignisse.updatefound(); n2.lauscher.statechange();
    pruefe('allererste Installation (noch keine Steuerung): KEIN Hinweis', b.toasts().length===0);
    erst.ereignisse.controllerchange&&erst.ereignisse.controllerchange();
    pruefe('... und die Uebernahme des ersten Workers laedt nichts neu', b.ort.neu===0);
    a.sb.feuereDok('visibilitychange'); a.vorspulen(11*60*1000); a.doc.visibilityState='visible'; a.sb.feuereDok('visibilitychange');
    pruefe('Rueckkehr nach laengerer Zeit stoesst eine Update-Pruefung an', sw.reg.updates===1, String(sw.reg.updates));
  }
  {
    /* localhost: aus, ausser mit ?sw=1 (gemerkt). */
    const sw=fakeSW(); const a=aufbau({ sw, ort:{ protocol:'http:', host:'localhost:5173', hostname:'localhost' } }); await warte();
    pruefe('localhost: Service Worker bleibt AUS (kein Haengen alter Dateien beim Entwickeln)', sw.aufrufe.length===0);
    pruefe('... und ein frueher registrierter wird dort entfernt', sw.reg.unreg===1);
    const lokal=speicher();
    const sw2=fakeSW(); const b=aufbau({ sw:sw2, lokal, ort:{ protocol:'http:', host:'127.0.0.1:5173', hostname:'127.0.0.1', search:'?sw=1' } }); await warte();
    pruefe('localhost mit ?sw=1: wird registriert und die Wahl gemerkt', sw2.aufrufe.length===1&&lokal.getItem('nachtschicht.sw')==='1');
    const sw3=fakeSW(); const c=aufbau({ sw:sw3, lokal, ort:{ protocol:'http:', host:'127.0.0.1:5173', hostname:'127.0.0.1', search:'' } }); await warte();
    pruefe('... auch auf der naechsten Seite ohne Parameter', sw3.aufrufe.length===1);
    const sw4=fakeSW(); const d=aufbau({ sw:sw4, lokal, ort:{ protocol:'http:', host:'127.0.0.1:5173', hostname:'127.0.0.1', search:'?sw=0' } }); await warte();
    pruefe('?sw=0 schaltet wieder ab', sw4.aufrufe.length===0&&lokal.getItem('nachtschicht.sw')===null);
  }

  console.log('\n--- ?reset ---');
  {
    const lokal=speicher(); ['nachtschicht.stand','nachtschicht.bestzeit3','nachtschicht.komfort','andere.projekt'].forEach(k=>lokal.setItem(k,'1'));
    const sitzung=speicher(); sitzung.setItem('nachtschicht.fehlerseite','1'); sitzung.setItem('fremd','1');
    const ablagen=new Map([['nachtschicht-5',1],['fremd',1]]);
    const caches={ keys:()=>Promise.resolve([...ablagen.keys()]), delete:n=>{ ablagen.delete(n); return Promise.resolve(true); } };
    const sw=fakeSW();
    const a=aufbau({ lokal, sitzung, caches, sw, ort:{ search:'?nach=3&reset=1' } });
    pruefe('?reset=1: alle nachtschicht.-Schluessel sind sofort weg, fremde bleiben',
      lokal.getItem('nachtschicht.stand')===null&&lokal.getItem('nachtschicht.bestzeit3')===null&&lokal.getItem('nachtschicht.komfort')===null&&lokal.getItem('andere.projekt')==='1'&&sitzung.getItem('fremd')==='1'&&sitzung.getItem('nachtschicht.fehlerseite')===null);
    a.start(); a.ticken(3);
    pruefe('... das Spiel laeuft bis zum Neuladen nicht (nichts schreibt zwischendurch neu)', a.sb.zaehler.update===0);
    await warte(); await warte();
    pruefe('... Offline-Speicher: nur nachtschicht-, und der Service Worker wird abgemeldet', !ablagen.has('nachtschicht-5')&&ablagen.has('fremd')&&sw.reg.unreg===1);
    pruefe('... dann wird OHNE reset, aber mit den uebrigen Parametern neu geladen', a.ort.ersetzt==='/Nachtschicht/level3.html?nach=3', String(a.ort.ersetzt));
    const l2=speicher(); l2.setItem('nachtschicht.stand','1');
    const b=aufbau({ lokal:l2, ort:{ search:'?reset=cache' }, caches:{ keys:()=>Promise.resolve([]), delete:()=>Promise.resolve(true) } });
    await warte(); await warte();
    pruefe('?reset=cache: Spielstand bleibt, Seite laedt ohne den Parameter neu', l2.getItem('nachtschicht.stand')==='1'&&b.ort.ersetzt==='/Nachtschicht/level3.html');
    const c=aufbau({ ort:{ search:'?reset=1' }, caches:{ keys:()=>new Promise(()=>{}), delete:()=>Promise.resolve(true) } });
    c.vorspulen(2600); await warte(); await warte();
    pruefe('haengt das Aufraeumen, laedt die Seite nach spaetestens 2,5 s trotzdem neu', c.ort.ersetzt==='/Nachtschicht/level3.html');
    const d=aufbau({ ort:{ search:'?x=1' } });
    pruefe('ohne ?reset passiert nichts dergleichen', d.G.zuruecksetzen===false&&d.ort.ersetzt===null);
  }

  console.log('\n============================');
  console.log(ok+' bestanden, '+fail+' fehlgeschlagen');
  console.log('Nicht geprueft (Browser noetig): Aussehen der Fehlerseite, Lage des Toasts neben der Touch-Bedienung,');
  console.log('Vollbild-Umzug, echter Service-Worker-Lebenszyklus, Ton nach iOS-Unterbrechung.');
  process.exit(fail?1:0);
})().catch(e=>{ console.log('FEHL  Test selbst abgestuerzt: '+(e&&e.stack||e)); process.exit(1); });
