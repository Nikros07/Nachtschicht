/* Prueft den Service Worker (sw.js) ohne Browser.   node test/sw.test.js
   (node test/sw.test.js --streng: auch die Hinweise am Ende sind dann Fehler)

   sw.js wird in einer Attrappe von self/caches/clients/fetch ausgefuehrt. Die
   Attrappen sind absichtlich klein, aber sie kennen die Eigenheiten, auf die es
   ankommt: Speicher-Treffer mit ignoreSearch, Antworten mit type/redirected/ok,
   Nachrichten-Ereignisse. Der Netz-Inhalt ist ausgedacht (mit passenden Stempeln),
   damit der Test nicht davon abhaengt, ob die echten Seiten gerade gestempelt sind.

   Was NICHT geht: das echte Zusammenspiel mit Browser, Registrierung und
   Lebenszyklus (wartend/aktiv). Das bleibt der Browser-Abnahme. */
const fs=require('fs'), vm=require('vm'), path=require('path');
const WURZEL=path.join(__dirname,'..');
/* SW_DATEI: eine andere sw.js pruefen (z.B. eine absichtlich beschaedigte, um zu sehen,
   dass der Test sie wirklich bemerkt). */
const QUELLE=fs.readFileSync(process.env.SW_DATEI||path.join(WURZEL,'sw.js'),'utf8');
const STRENG=process.argv.includes('--streng');

let ok=0, fail=0, hinweise=0;
const pruefe=(name,bed,info)=>{ if(bed){ ok++; console.log('  OK   '+name); }
  else { fail++; console.log('  FEHL '+name+(info?'   -> '+info:'')); } };
const hinweis=(text)=>{ hinweise++; console.log('  HINWEIS '+text); };

/* ---- Attrappen -------------------------------------------------------------- */
class Antwort{
  constructor(body,init){
    init=init||{};
    this.body=body==null?'':String(body);
    this.status=init.status==null?200:init.status;
    this.ok=this.status>=200&&this.status<300;
    this.type=init.type||'basic';
    this.redirected=!!init.redirected;
    this._h=init.headers||{};
    const h=this._h;
    this.headers={ get:k=>{ const n=Object.keys(h).find(x=>x.toLowerCase()===String(k).toLowerCase()); return n?h[n]:null; } };
  }
  clone(){ return new Antwort(this.body,{status:this.status,type:this.type,redirected:this.redirected,headers:this._h}); }
  async text(){ return this.body; }
}
class Anfrage{
  constructor(url,init){
    init=init||{};
    this.url=typeof url==='string'?url:url.url;
    this.method=init.method||'GET';
    this.mode=init.mode||'cors';
    this.cache=init.cache||'default';
    const h={}; Object.keys(init.headers||{}).forEach(k=>{ h[k.toLowerCase()]=init.headers[k]; });
    this.headers={ get:k=>h[String(k).toLowerCase()]||null };
  }
}
/* Ein Speicher wie caches: mehrere Ablagen mit Namen. match mit ignoreSearch. */
function neuerSpeicher(){
  const ablagen=new Map();
  const api={ ablagen, globalMatch:0, matchOptionen:[],
    async open(n){
      if(!ablagen.has(n)) ablagen.set(n,new Map());
      const m=ablagen.get(n);
      return {
        async put(k,r){ m.set(typeof k==='string'?k:k.url,r); },
        async match(k,opt){
          opt=opt||{}; api.matchOptionen.push(opt); const key=typeof k==='string'?k:k.url;
          const norm=u=>opt.ignoreSearch?u.split('?')[0]:u;
          for(const [kk,v] of m) if(norm(kk)===norm(key)) return v;
          return undefined;
        },
      };
    },
    async keys(){ return [...ablagen.keys()]; },
    async delete(n){ return ablagen.delete(n); },
    async match(){ api.globalMatch++; return undefined; },   // sw.js darf das nie benutzen: es durchsucht ALLE Ablagen der Herkunft
  };
  return api;
}

/* ---- Ein ausgedachtes Netz: liefert zu jeder Datei passenden Inhalt ----------- */
const BASIS='https://spiel.test/Nachtschicht/';
function inhalt(pfad,build,version){
  if(/\.html$/.test(pfad)) return { body:'<!doctype html><link rel="stylesheet" href="nacht/stil.css?v='+build+'">'+
    '<script src="nacht/kern.js?v='+build+'"></script><!--'+pfad+' '+version+'-->', typ:'text/html; charset=utf-8' };
  if(pfad==='nacht/geraet.js') return { body:'const GERAET={}; GERAET.build="'+build+'"; //'+version, typ:'application/javascript' };
  if(/\.js$/.test(pfad)) return { body:'//'+pfad+' '+version, typ:'application/javascript' };
  if(/\.css$/.test(pfad)) return { body:'/*'+pfad+' '+version+'*/', typ:'text/css' };
  return { body:pfad+' '+version, typ:'application/octet-stream' };
}
function neuesNetz(build,version){
  const n={ build, version:version||'v1', offline:false, tot:new Set(), netzfehler:new Set(), ersatz:new Map(), anfragen:[] };
  n.fetch=async req=>{
    n.anfragen.push(req);
    if(n.offline) throw new TypeError('Failed to fetch');
    const u=new URL(req.url);
    let p=u.pathname.replace('/Nachtschicht/',''); if(p==='') p='index.html';
    if(n.netzfehler.has(p)) throw new TypeError('Failed to fetch');
    if(n.ersatz.has(p)) return n.ersatz.get(p);
    if(n.tot.has(p)) return new Antwort('nicht gefunden',{status:404,headers:{'Content-Type':'text/html'}});
    const c=inhalt(p,n.build,n.version);
    return new Antwort(c.body,{headers:{'Content-Type':c.typ}});
  };
  return n;
}

/* ---- sw.js laden: eigener Kontext, eigene Ereignis-Haendler ------------------- */
function ladeSW(opt){
  opt=opt||{};
  const speicher=opt.speicher||neuerSpeicher();
  const netz=opt.netz;
  let q=QUELLE;
  if(opt.build) q=q.replace(/const BUILD='[^']*';/,"const BUILD='"+opt.build+"';");
  const h={}, z={ skipWaiting:0, claim:0 };
  const sb={ console, URL };
  sb.self=sb;
  sb.location={ href:BASIS+'sw.js' };
  sb.addEventListener=(n,f)=>{ h[n]=f; };
  sb.skipWaiting=()=>{ z.skipWaiting++; return Promise.resolve(); };
  sb.clients={ claim:()=>{ z.claim++; return Promise.resolve(); } };
  sb.caches=speicher; sb.Request=Anfrage; sb.Response=Antwort;
  sb.fetch=netz.fetch;
  vm.createContext(sb); vm.runInContext(q,sb);
  const lies=c=>vm.runInContext(c,sb);
  return {
    speicher, netz, z, lies,
    cacheName:lies('CACHE'), build:lies('BUILD'), liste:lies('PRECACHE'),
    async installieren(){ const ev={ waitUntil(p){ ev.p=p; } }; h.install(ev); await ev.p; },
    async aktivieren(){ const ev={ waitUntil(p){ ev.p=p; } }; h.activate(ev); await ev.p; },
    nachricht(daten){ h.message({ data:daten }); },
    /* Gibt {beruehrt, antwort} zurueck. beruehrt=false: respondWith wurde nie aufgerufen,
       der Browser haette die Anfrage selbst erledigt. */
    async anfrage(url,init){
      const req=new Anfrage(url.indexOf('http')===0?url:BASIS+url,init);
      const ev={ request:req, warten:[], respondWith(p){ ev.antwort=p; }, waitUntil(p){ ev.warten.push(p); } };
      h.fetch(ev);
      if(ev.antwort===undefined) return { beruehrt:false };
      const antwort=await ev.antwort; await Promise.all(ev.warten);
      return { beruehrt:true, antwort };
    },
    async eintraege(){ const a=speicher.ablagen.get(this.cacheName); return a?[...a.keys()]:[]; },
  };
}
const abgelehnt=async p=>{ try{ await p; return null; }catch(e){ return e; } };

(async()=>{
  const BUILD='202610031200';
  const probe=ladeSW({ build:BUILD, netz:neuesNetz(BUILD) });
  const LISTE=probe.liste;

  console.log('\n--- Liste und Aufbau ---');
  pruefe('PRECACHE ist nicht leer und enthaelt index.html', LISTE.length>0&&LISTE.includes('index.html'));
  pruefe('PRECACHE: relative Pfade, keine Doppelten, alphabetisch',
    LISTE.every(p=>!/^(\/|[a-z]+:)/i.test(p))&&new Set(LISTE).size===LISTE.length&&LISTE.join('|')===[...LISTE].sort().join('|'));
  pruefe('PRECACHE: nie 404.html, sw.js oder Werkzeuge', !LISTE.some(p=>p==='404.html'||p==='sw.js'||/^(tools|docs|test|routinen)\//.test(p)));
  pruefe('Cache-Name ist nachtschicht-<BUILD>', probe.cacheName==='nachtschicht-'+BUILD);

  console.log('\n--- install ---');
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    await sw.installieren();
    const ein=await sw.eintraege();
    pruefe('alle Dateien der Liste stehen danach im Speicher', LISTE.every(p=>ein.includes(BASIS+p)), ein.length+' von '+LISTE.length);
    pruefe('Vorladen am HTTP-Cache vorbei (cache:reload)', netz.anfragen.length===LISTE.length&&netz.anfragen.every(a=>a.cache==='reload'));
    pruefe('install ruft KEIN skipWaiting auf', sw.z.skipWaiting===0);
    pruefe('install uebernimmt noch nichts (clients.claim erst bei activate)', sw.z.claim===0);
  }
  {
    const netz=neuesNetz(BUILD); netz.tot.add('index.html');
    const sw=ladeSW({ build:BUILD, netz });
    pruefe('index.html nicht ladbar: Installation scheitert (alte Fassung bleibt)', !!await abgelehnt(sw.installieren()));
  }
  {
    const netz=neuesNetz(BUILD); netz.tot.add('nacht/hud.js'); netz.netzfehler.add('icons/icon-192.png');
    const sw=ladeSW({ build:BUILD, netz });
    const e=await abgelehnt(sw.installieren());
    const ein=await sw.eintraege();
    pruefe('fehlende oder nicht ladbare Nebendatei bricht die Installation NICHT ab', e===null, e&&e.message);
    pruefe('... und wird nicht gespeichert, der Rest schon', !ein.includes(BASIS+'nacht/hud.js')&&ein.includes(BASIS+'index.html')&&ein.length===LISTE.length-2, String(ein.length));
  }
  {
    const netz=neuesNetz(BUILD,'v1'), sw=ladeSW({ build:BUILD, netz });
    netz.ersatz.set('level2.html',new Antwort('<script src="nacht/kern.js?v=202609010000"></script>',{headers:{'Content-Type':'text/html'}}));
    pruefe('Seite mit fremdem ?v=-Stempel (CDN liefert noch die alte): Installation scheitert', !!await abgelehnt(sw.installieren()));
  }
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    netz.ersatz.set('nacht/geraet.js',new Antwort('GERAET.build="202609010000";',{headers:{'Content-Type':'application/javascript'}}));
    pruefe('alte geraet.js (falsche Build-Nummer): Installation scheitert', !!await abgelehnt(sw.installieren()));
  }
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    netz.ersatz.set('nacht/kern.js',new Antwort('<html>Bitte anmelden</html>',{headers:{'Content-Type':'text/html'}}));
    await sw.installieren(); const ein=await sw.eintraege();
    pruefe('HTML anstelle einer .js-Datei (Anmeldeportal) wird nicht gespeichert', !ein.includes(BASIS+'nacht/kern.js'));
  }
  {
    const sw=ladeSW({ build:'STAND', netz:neuesNetz('STAND') });
    pruefe('ungestempelte sw.js (BUILD=STAND) installiert sich nie', !!await abgelehnt(sw.installieren()));
  }

  console.log('\n--- activate ---');
  {
    const speicher=neuerSpeicher();
    await speicher.open('nachtschicht-202601010000'); await speicher.open('nachtschicht-202602020000');
    await speicher.open('andere-app-v3'); await speicher.open('nachtschicht-'+BUILD);
    const sw=ladeSW({ build:BUILD, netz:neuesNetz(BUILD), speicher });
    await sw.aktivieren();
    const namen=[...speicher.ablagen.keys()].sort();
    pruefe('alte nachtschicht-Speicher werden geloescht', !namen.includes('nachtschicht-202601010000')&&!namen.includes('nachtschicht-202602020000'), namen.join(','));
    pruefe('der aktuelle Speicher bleibt', namen.includes('nachtschicht-'+BUILD));
    pruefe('Speicher fremder Projekte (anderes Praefix) bleiben unberuehrt', namen.includes('andere-app-v3'));
    pruefe('activate uebernimmt die offenen Seiten (clients.claim)', sw.z.claim===1);
  }

  console.log('\n--- fetch: Speicher zuerst ---');
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    await sw.installieren(); const vorher=netz.anfragen.length;
    const r=await sw.anfrage('nacht/kern.js');
    pruefe('Treffer wird aus dem Speicher geliefert, ohne das Netz zu fragen', r.beruehrt&&netz.anfragen.length===vorher&&r.antwort.body.includes('nacht/kern.js v1'));
    const r2=await sw.anfrage('nacht/kern.js?v=999999999999');
    pruefe('ignoreSearch: kern.js?v=ANDERE trifft denselben Eintrag', r2.beruehrt&&netz.anfragen.length===vorher&&r2.antwort.body===r.antwort.body);
    const r3=await sw.anfrage('index.html?app=1');
    pruefe('ignoreSearch: index.html?app=1 (Start aus dem Manifest)', r3.beruehrt&&netz.anfragen.length===vorher&&r3.antwort.body.includes('index.html'));
    const r4=await sw.anfrage('',{mode:'navigate'});
    pruefe('Ordner-Adresse /Nachtschicht/ liefert index.html aus dem Speicher', r4.beruehrt&&netz.anfragen.length===vorher&&r4.antwort.body.includes('index.html'));
    netz.offline=true;
    const r5=await sw.anfrage('level3.html?v=1',{mode:'navigate'});
    pruefe('offline: Seite aus dem Speicher', r5.beruehrt&&r5.antwort.body.includes('level3.html'));
    pruefe('Speicher-Suche laeuft mit ignoreSearch:true (zusaetzlich zum Schluessel ohne ?v=)', sw.speicher.matchOptionen.length>0&&sw.speicher.matchOptionen.every(o=>o.ignoreSearch===true));
    pruefe('weder install noch fetch benutzen caches.match (sucht in ALLEN Ablagen der Herkunft)', sw.speicher.globalMatch===0);
  }
  {
    const speicher=neuerSpeicher();
    const fremd=await speicher.open('andere-app-v1'); await fremd.put(BASIS+'nacht/kern.js',new Antwort('FREMDER INHALT'));
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz, speicher });
    const r=await sw.anfrage('nacht/kern.js');
    pruefe('ein Eintrag im Speicher eines anderen Projekts wird nie ausgeliefert', r.beruehrt&&r.antwort.body.includes('nacht/kern.js v1'), r.antwort&&r.antwort.body);
  }

  console.log('\n--- fetch: Verfehlen, schlechte Antworten, offline ---');
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });   // nichts vorgeladen
    const r=await sw.anfrage('nacht/neu.js?v=1');
    const ein=await sw.eintraege();
    pruefe('Treffer fehlt: Antwort kommt aus dem Netz', r.beruehrt&&r.antwort.body.includes('nacht/neu.js'));
    pruefe('... und eine gute Antwort wird gespeichert', ein.includes(BASIS+'nacht/neu.js'));
    netz.offline=true;
    const r2=await sw.anfrage('nacht/neu.js?v=2');
    pruefe('... und ist beim naechsten Mal offline da', r2.antwort.body.includes('nacht/neu.js'));
  }
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    netz.tot.add('nacht/weg.js');
    const r=await sw.anfrage('nacht/weg.js');
    pruefe('404 wird durchgereicht, aber NICHT gespeichert', r.antwort.status===404&&!(await sw.eintraege()).includes(BASIS+'nacht/weg.js'));
    netz.ersatz.set('seite.html',new Antwort('weitergeleitet',{redirected:true,headers:{'Content-Type':'text/html'}}));
    const r2=await sw.anfrage('seite.html',{mode:'navigate'});
    pruefe('weitergeleitete Antwort wird nicht gespeichert (taugt nicht fuer Seitenanfragen)', r2.antwort.redirected&&!(await sw.eintraege()).includes(BASIS+'seite.html'));
    netz.ersatz.set('bild.png',new Antwort('<html>Portal</html>',{headers:{'Content-Type':'text/html'}}));
    await sw.anfrage('bild.png');
    pruefe('HTML anstelle eines Bildes wird nicht gespeichert', !(await sw.eintraege()).includes(BASIS+'bild.png'));
    netz.ersatz.set('luecke.js',new Antwort('teil',{status:206,headers:{'Content-Type':'application/javascript'}}));
    await sw.anfrage('luecke.js');
    pruefe('Teilantwort (206) wird nicht gespeichert', !(await sw.eintraege()).includes(BASIS+'luecke.js'));
  }
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    await sw.installieren(); netz.offline=true;
    const r=await sw.anfrage('gibtsnicht.html',{mode:'navigate'});
    pruefe('offline + unbekannte Seite: Rueckfall auf index.html', r.beruehrt&&r.antwort.body.includes('index.html'));
    const r2=await sw.anfrage('gibtsnicht.png');
    pruefe('offline + unbekannte Datei (keine Seite): Fehlerantwort, nichts Erfundenes', r2.beruehrt&&!r2.antwort.ok&&r2.antwort.status===504);
  }

  console.log('\n--- fetch: was nicht angefasst wird ---');
  {
    const netz=neuesNetz(BUILD), sw=ladeSW({ build:BUILD, netz });
    await sw.installieren(); const vorher=netz.anfragen.length;
    pruefe('fremde Herkunft bleibt unberuehrt', !(await sw.anfrage('https://fonts.example.com/nacht/kern.js')).beruehrt);
    pruefe('POST bleibt unberuehrt', !(await sw.anfrage('nacht/kern.js',{method:'POST'})).beruehrt);
    pruefe('Range-Anfragen bleiben unberuehrt', !(await sw.anfrage('nacht/kern.js',{headers:{Range:'bytes=0-9'}})).beruehrt);
    pruefe('Adressen ausserhalb des Spielordners bleiben unberuehrt', !(await sw.anfrage('https://spiel.test/anderes-projekt/index.html')).beruehrt);
    pruefe('... und es ging dabei nichts ins Netz', netz.anfragen.length===vorher);
  }

  console.log('\n--- message ---');
  {
    const sw=ladeSW({ build:BUILD, netz:neuesNetz(BUILD) });
    sw.nachricht('hallo'); sw.nachricht({type:'ETWAS'}); sw.nachricht(undefined);
    pruefe('fremde Nachrichten loesen kein skipWaiting aus', sw.z.skipWaiting===0);
    sw.nachricht({type:'SKIP_WAITING'});
    pruefe('{type:"SKIP_WAITING"} loest skipWaiting aus', sw.z.skipWaiting===1);
    sw.nachricht('SKIP_WAITING');
    pruefe('"SKIP_WAITING" als Text loest skipWaiting aus', sw.z.skipWaiting===2);
  }

  console.log('\n--- eine neue BUILD ersetzt alles ---');
  {
    const speicher=neuerSpeicher();
    const netzA=neuesNetz('202610010000','alt'), A=ladeSW({ build:'202610010000', netz:netzA, speicher });
    await A.installieren(); await A.aktivieren();
    const netzB=neuesNetz('202610020000','neu'), B=ladeSW({ build:'202610020000', netz:netzB, speicher });
    await B.installieren();
    const rA=await A.anfrage('index.html');
    pruefe('solange B wartet, liefert A weiter seine eigene, stimmige Fassung', rA.antwort.body.includes('alt'));
    pruefe('B legt einen EIGENEN Speicher an (kein Vermischen)', speicher.ablagen.has('nachtschicht-202610010000')&&speicher.ablagen.has('nachtschicht-202610020000'));
    await B.aktivieren();
    pruefe('nach activate ist der Speicher von A weg', !speicher.ablagen.has('nachtschicht-202610010000'));
    const rB=await B.anfrage('level2.html?v=202610020000');
    pruefe('B liefert nur neue Dateien, nichts Altes mehr', rB.antwort.body.includes('neu')&&!rB.antwort.body.includes('alt'));
    const alleNeu=(await Promise.all(LISTE.map(async p=>(await B.anfrage(p)).antwort.body))).every(b=>b.includes('neu'));
    pruefe('...das gilt fuer jede Datei der Liste', alleNeu);
  }

  console.log('\n--- die echten Dateien (Hinweise, kein Fehler ohne --streng) ---');
  {
    const gibt=p=>fs.existsSync(path.join(WURZEL,p));
    const fehlend=LISTE.filter(p=>!gibt(p));
    if(fehlend.length) hinweis('in PRECACHE, aber nicht auf der Platte: '+fehlend.join(', ')+'  (python tools/version.py)');
    const soll=[];
    fs.readdirSync(WURZEL).filter(f=>/\.html$/.test(f)&&f!=='404.html').forEach(f=>soll.push(f));
    fs.readdirSync(path.join(WURZEL,'nacht')).filter(f=>/\.js$/.test(f)).forEach(f=>soll.push('nacht/'+f));
    const unvollstaendig=soll.filter(f=>!LISTE.includes(f));
    if(unvollstaendig.length) hinweis('Seiten/Engine-Dateien fehlen in PRECACHE: '+unvollstaendig.join(', ')+'  (python tools/version.py)');
    const stempel=new Set();
    soll.filter(f=>/\.html$/.test(f)).forEach(f=>{
      const t=fs.readFileSync(path.join(WURZEL,f),'utf8');
      for(const m of t.matchAll(/(?:src|href)="nacht\/[a-z]+\.(?:js|css)\?v=([0-9]+)"/g)) stempel.add(m[1]);
    });
    const echtBuild=(QUELLE.match(/const BUILD='([^']*)';/)||[])[1];
    if(echtBuild==='STAND') hinweis('sw.js ist nicht gestempelt (python tools/version.py)');
    if(stempel.size>1||(stempel.size===1&&!stempel.has(echtBuild))) hinweis('Seiten tragen andere ?v=-Stempel als BUILD '+echtBuild+': '+[...stempel].join(', ')+'  (python tools/version.py)');
    pruefe('sw.js traegt eine 12-stellige Build-Nummer (oder ist noch ungestempelt)', /^[0-9]{12}$/.test(echtBuild)||echtBuild==='STAND', echtBuild);
  }

  console.log('\n============================');
  console.log(ok+' bestanden, '+fail+' fehlgeschlagen'+(hinweise?', '+hinweise+' Hinweis(e)':''));
  process.exit(fail||(STRENG&&hinweise)?1:0);
})().catch(e=>{ console.log('FEHL  Test selbst abgestuerzt: '+(e&&e.stack||e)); process.exit(1); });
