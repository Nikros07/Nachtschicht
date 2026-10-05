/* ============================================================================
   NACHTSCHICHT - Service Worker
   Macht das Spiel offline spielbar und installierbar.

   Strategie: Cache zuerst. Jede Fassung des Spiels (BUILD) bekommt einen
   eigenen Speicher "nachtschicht-<BUILD>", der beim Installieren komplett
   vorgeladen wird. Pages und Engine einer Fassung liegen so immer zusammen -
   nie ein neues Level mit einer alten Engine (der Fehler, den tools/version.py
   verhindern soll).

   Warum das keine Falle wird, in der ein kaputter Stand ewig haengt:
   - Der Browser holt sw.js selbst IMMER am Netz vorbei (auch bei max-age 600 auf
     GitHub Pages). Aendert tools/version.py die BUILD-Nummer, ist es ein neuer
     Worker mit neuem Speicher; beim Aktivieren verschwinden alle alten.
   - Vorab geladen wird mit cache:'reload' (am HTTP-Cache vorbei) und nur, wenn die
     Seiten wirklich zu dieser BUILD gehoeren (Stempel ?v= stimmt) - sonst bricht die
     Installation ab, und die alte, in sich stimmige Fassung bleibt.
   - Ein einzelnes fehlendes Nebenfile bricht nichts: nur index.html ist Pflicht.
     Eine Datei, die es nicht mehr gibt, kann ein Update also nie fuer immer blockieren.
   - Es werden nur gute Antworten gespeichert (200, gleiche Herkunft, keine
     Weiterleitung, kein HTML anstelle von Skript/Bild).
   - Notausgang fuer die Person: Adresse ...?reset=1 (siehe nacht/geraet.js) oder
     bei einem Fehler der Knopf NEU LADEN auf der Fehlerseite.

   Ein neuer Worker uebernimmt NICHT von allein (kein skipWaiting beim Installieren):
   mitten in einer Nacht soll sich nichts unter dem Spiel aendern. nacht/geraet.js
   zeigt "NEUE VERSION - TIPPEN ZUM LADEN" und schickt dann SKIP_WAITING.

   BUILD, INHALT und die Liste PRECACHE schreibt tools/version.py - nicht von Hand
   aendern. Fremde Herkunft fasst dieser Worker nie an, und er schaut nur in den
   eigenen Speicher (nicht in die anderer Projekte derselben github.io-Adresse).
   ========================================================================== */

const BUILD='202610051115';      // wird von tools/version.py gestempelt
const INHALT='728bd715f2d557fd';          // Pruefsumme der Dateien (python tools/version.py --pruefen)
const CACHE_PRAEFIX='nachtschicht-';
const CACHE=CACHE_PRAEFIX+BUILD;
const KERN='index.html';  // ohne diese Datei wird nichts installiert

// PRECACHE-START
const PRECACHE=[
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'icons/favicon.ico',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/icon.svg',
  'icons/og.png',
  'index.html',
  'karte.html',
  'level2.html',
  'level3.html',
  'level4.html',
  'level5.html',
  'level6.html',
  'level7.html',
  'level8.html',
  'manifest.webmanifest',
  'nacht/bild.js',
  'nacht/dialog.js',
  'nacht/eingabe.js',
  'nacht/epilog.js',
  'nacht/erzaehl.js',
  'nacht/geraet.js',
  'nacht/handy.js',
  'nacht/hud.js',
  'nacht/kampf.js',
  'nacht/kern.js',
  'nacht/komfort.js',
  'nacht/lehre.js',
  'nacht/menue.js',
  'nacht/mobil.js',
  'nacht/nacht.js',
  'nacht/stand.js',
  'nacht/stil.css',
  'nacht/texte.js',
  'nacht/ton.js',
  'nacht/welt.js',
  'runner.html',
  'ueber.html',
];
// PRECACHE-ENDE

/* Der Ordner, in dem sw.js liegt, ist der Geltungsbereich. Alle Pfade sind relativ dazu,
   damit es unter /Nachtschicht/ auf GitHub Pages ebenso geht wie auf localhost. */
const BASIS=new URL('./',self.location.href);

/* Ein Schluessel je Datei, egal welche ?v=-Nummer dranhaengt; eine Ordneradresse
   ("/Nachtschicht/") ist index.html. */
function schluessel(url){
  let pfad=url.pathname;
  if(pfad.charAt(pfad.length-1)==='/') pfad+='index.html';
  return url.origin+pfad;
}

/* Soll diese Antwort in den Speicher? Alles Zweifelhafte nein: lieber einmal mehr
   das Netz fragen, als etwas Kaputtes festzuhalten. */
function brauchbar(url,r){
  if(!r||!r.ok||r.status!==200) return false;
  if(r.type!=='basic') return false;       // gleiche Herkunft; sonst opak oder fremd
  if(r.redirected) return false;           // eine Weiterleitung taugt nicht als Antwort auf eine Seitenanfrage
  const art=(r.headers&&r.headers.get&&r.headers.get('content-type'))||'';
  /* Ein Anmeldeportal oder eine Fehlerseite liefert gern HTML mit Status 200 -
     fuer eine Skript-, Stil- oder Bilddatei ist das nie richtig. */
  if(/\.(js|css|png|ico|svg|webmanifest|json)$/i.test(url.pathname)&&/text\/html/i.test(art)) return false;
  return true;
}

/* Gehoert diese Datei zur BUILD dieses Workers? Prueft die Stempel, die
   tools/version.py setzt. Verhindert, dass ein CDN, das noch die alte Seite
   ausliefert, eine Mischung in den neuen Speicher bringt. */
async function stimmig(url,r){
  const pfad=url.pathname;
  if(/\.html$/i.test(pfad)){
    const t=await r.clone().text();
    const stempel=[...t.matchAll(/(?:src|href)="nacht\/[a-z]+\.(?:js|css)\?v=([0-9]+)"/g)];
    return stempel.every(m=>m[1]===BUILD);
  }
  if(/\/nacht\/geraet\.js$/.test(pfad)){
    const t=await r.clone().text();
    return t.indexOf('GERAET.build="'+BUILD+'"')>=0;
  }
  return true;
}

async function vorladen(){
  if(BUILD==='STAND') throw new Error('sw.js ist nicht gestempelt - python tools/version.py ausfuehren');
  const cache=await caches.open(CACHE);
  let kernOk=false, unstimmig=null;
  await Promise.all(PRECACHE.map(async pfad=>{
    try{
      const url=new URL(pfad,BASIS);
      /* reload: am HTTP-Cache vorbei. Sonst wuerde eine bis zu 10 Minuten alte Kopie
         (GitHub Pages: max-age 600) in den frischen Speicher wandern. */
      const r=await fetch(new Request(url.href,{cache:'reload'}));
      if(!brauchbar(url,r)) return;            // fehlt/kaputt: nicht festhalten, Rest laeuft weiter
      if(!(await stimmig(url,r))){ unstimmig=pfad; return; }
      await cache.put(schluessel(url),r);
      if(pfad===KERN) kernOk=true;
    }catch(e){ /* Netzfehler bei einer Datei: die kommt spaeter beim Spielen aus dem Netz */ }
  }));
  /* Lieber gar nicht installieren als halb oder gemischt: die alte Fassung bleibt aktiv,
     der Browser versucht es beim naechsten Pruefen erneut. */
  if(unstimmig) throw new Error('Stempel in '+unstimmig+' passt nicht zu BUILD '+BUILD);
  if(!kernOk) throw new Error(KERN+' konnte nicht geladen werden');
}

async function aufraeumen(){
  const namen=await caches.keys();
  /* Nur eigene Speicher (Praefix). Auf einer gemeinsamen github.io-Adresse liegen auch
     die anderer Projekte - die gehen uns nichts an. */
  await Promise.all(namen.filter(n=>n.indexOf(CACHE_PRAEFIX)===0&&n!==CACHE).map(n=>caches.delete(n)));
  await self.clients.claim();
}

async function antwort(event,req,url){
  const cache=await caches.open(CACHE);
  const key=schluessel(url);
  const treffer=await cache.match(key,{ignoreSearch:true,ignoreVary:true});
  if(treffer) return treffer;
  try{
    const r=await fetch(req);
    if(brauchbar(url,r)) event.waitUntil(Promise.resolve(cache.put(key,r.clone())).catch(()=>{}));
    return r;
  }catch(e){
    /* Offline und nicht im Speicher: bei einer Seitenanfrage wenigstens das Menue. */
    if(req.mode==='navigate'){
      const start=await cache.match(schluessel(new URL(KERN,BASIS)),{ignoreSearch:true,ignoreVary:true});
      if(start) return start;
    }
    return new Response('Offline',{status:504,statusText:'Offline',headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}

self.addEventListener('install',event=>{
  /* KEIN skipWaiting hier: ein neuer Worker wartet, bis die Person im Spiel zustimmt. */
  event.waitUntil(vorladen());
});

self.addEventListener('activate',event=>{
  event.waitUntil(aufraeumen());
});

self.addEventListener('message',event=>{
  const d=event.data;
  if(d==='SKIP_WAITING'||(d&&d.type==='SKIP_WAITING')) self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  let url; try{ url=new URL(req.url); }catch(e){ return; }
  /* Fremde Herkunft (Schriften, Zaehler, ...) und alles ausserhalb unseres Ordners
     bleibt unberuehrt: der Browser holt es wie ohne Worker. */
  if(url.origin!==BASIS.origin||url.pathname.indexOf(BASIS.pathname)!==0) return;
  /* Teilanfragen (Range) kennt ein Speicher nicht - direkt ans Netz. */
  if(req.headers&&req.headers.get&&req.headers.get('range')) return;
  event.respondWith(antwort(event,req,url));
});
