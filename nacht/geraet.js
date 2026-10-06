/* ============================================================================
   NACHTSCHICHT - ENGINE: geraet
   Alles, was ein fertiges Spiel auf fremden Geraeten und in fremden Browsern
   braucht, aber kein Level wissen muss: Fehlerseite statt weisser Flaeche,
   Pause im Hintergrund, Installieren/Offline (Service Worker), Hinweise.

   Wird direkt nach kern.js geladen, damit auch spaetere Ladefehler gefangen
   werden. Klassisches Script, kein ES-Modul. Benutzt nur DOM und Browser-APIs
   (nicht text()/sprite() aus spaeteren Dateien) und ist komplett in try/catch
   gekapselt: ein Fehler HIER darf das Spiel nie schlechter machen als ohne
   diese Datei. Laeuft deshalb auch unter tools/nachttest.js (Attrappen).

   Bausteine (alle unten, in dieser Reihenfolge):
     Fehlerschutz      window error/unhandledrejection, die Spielschleife (bild)
                       ueberlebt Ausnahmen, Fehlerseite bei Dauerfehlern
     Hinweise          GERAET.hinweis(text,ms) - kleine Toasts
     Hintergrund       Ton anhalten, wenn der Tab verschwindet
     Speicher          Schreibtest, GERAET.speicherOk
     Service Worker    sw.js: Offline und Installieren, "neue Version"-Hinweis
     Support           ?reset=1, ?reset=cache, ?fehlertest=N, ?sw=1 / ?sw=0

   Zum Ausprobieren im Browser (Konsole oder Adresse):
     ?fehlertest=1   ein einzelner Ausnahmefall im Spielbild: es darf NICHTS sichtbar sein
     ?fehlertest=9   neun Ausnahmen in Folge: die Fehlerseite muss erscheinen
     GERAET.hinweis('Test',3000)         ein Toast
     ?reset=1        loescht alle nachtschicht.-Schluessel, den Offline-Speicher und
                     den Service Worker, laedt dann ohne den Parameter neu
     ?reset=cache    wie reset=1, aber der Spielstand bleibt
   ========================================================================== */

const GERAET={};

(function(){
  /* ---- Konstanten (alles, woran man drehen koennte, steht hier) ---- */
  const SPEICHER_PRAEFIX='nachtschicht.';   // alle Schluessel des Spiels beginnen so
  const CACHE_PRAEFIX='nachtschicht-';      // Namen der Offline-Speicher aus sw.js
  const MELDEN_URL='https://github.com/Nikros07/Nachtschicht/issues/new';
  const FOLGE_MAX=5;          // mehr Ausnahmen in Folge im Spielbild = Fehlerseite
  const STURM_ANZAHL=20;      // so viele eigene Fehler ...
  const STURM_MS=5000;        // ... in so vielen Millisekunden = Fehlerseite
  const START_PRUEFUNG_MS=1500;   // so lange nach dem Laden muss das erste Bild stehen
  const UPDATE_PRUEFEN_MS=30*60*1000;  // wie oft nach einer neuen Version geschaut wird

  GERAET.version="1.0.0";
  GERAET.build="202610060255";       // tools/version.py stempelt hier die Build-Nummer
  GERAET.speicherOk=true;     // false: localStorage geht nicht (privates Fenster, voll)
  GERAET.fehler=[];           // die letzten Fehler, fuer Support: GERAET.fehler in der Konsole
  GERAET.bilder=0;            // wie viele Spielbilder ohne Ausnahme gelaufen sind
  GERAET.fehlerseiteAn=false;
  GERAET.zuruecksetzen=false; // true, solange ?reset die Seite gerade neu laedt
  GERAET.testFehler=0;        // >0: so viele Bilder in Folge werfen absichtlich (?fehlertest=N)

  /* ---------------------------------------------------------------- Hilfen --- */
  const sicher=(f,sonst)=>{ try{ return f(); }catch(e){ return sonst; } };
  const hatDom=()=>typeof document!=='undefined'&&!!document&&typeof document.createElement==='function';
  const abfrage=()=>sicher(()=>String(location.search||''),'');
  const hatParam=(n,w)=>new RegExp('(^|[?&])'+n+'='+w+'(&|$)').test(abfrage());
  const seiteName=()=>sicher(()=>{ const p=String(location.pathname||''); return p.split('/').pop()||'index.html'; },'?');

  /* Der Speicher, den ein Hinweis, die Fehlerseite oder ein Reset anfassen duerfen. */
  const lokal=()=>sicher(()=>localStorage,null);
  const sitzung=()=>sicher(()=>sessionStorage,null);
  function schluesselLoeschen(speicher){
    let n=0;
    try{
      /* Erst einsammeln, dann loeschen: removeItem verschiebt die Indizes. */
      const ks=[];
      for(let i=0;i<speicher.length;i++){ const k=speicher.key(i); if(k&&k.indexOf(SPEICHER_PRAEFIX)===0) ks.push(k); }
      ks.forEach(k=>{ speicher.removeItem(k); n++; });
    }catch(e){}
    return n;
  }
  /* Loescht NUR Schluessel dieses Spiels. Auf einer gemeinsamen Adresse
     (github.io) liegen sonst die Daten anderer Projekte im selben Speicher. */
  GERAET.loescheSpielstand=()=>schluesselLoeschen(lokal())+schluesselLoeschen(sitzung());

  /* Offline-Speicher und Service Worker dieses Spiels entfernen (nur diese,
     nicht die anderer Projekte derselben Herkunft). Der Notausgang, falls je
     ein kaputter Stand im Cache haengt: ?reset=1, ?reset=cache oder die
     Fehlerseite beim zweiten Mal. Gibt ein Versprechen zurueck, das spaetestens
     nach 2,5 s erfuellt ist - der Aufrufer laedt danach so oder so neu. */
  GERAET.cacheLeeren=function(){
    const arbeit=[];
    sicher(()=>{
      if(typeof caches!=='undefined'&&caches&&caches.keys)
        arbeit.push(caches.keys().then(ns=>Promise.all(ns.filter(n=>n.indexOf(CACHE_PRAEFIX)===0).map(n=>caches.delete(n)))));
    });
    sicher(()=>{
      const sw=navigator.serviceWorker;
      /* getRegistration() ohne Argument meint genau den Geltungsbereich DIESER Seite;
         getRegistrations() lieferte alle der Herkunft, auch fremde Projekte. */
      if(sw&&sw.getRegistration) arbeit.push(sw.getRegistration().then(r=>r?r.unregister():false));
    });
    const alles=Promise.all(arbeit.map(p=>p.catch(()=>false)));
    const frist=new Promise(fertig=>setTimeout(fertig,2500));
    return Promise.race([alles,frist]);
  };

  /* ---------------------------------------------------------- Aussehen (CSS) --- */
  /* Alles hier per Skript eingefuegt statt in stil.css: die Fehlerseite muss auch
     dann gut aussehen, wenn die Stildatei selbst das Problem ist. Klassen beginnen
     mit ns-, damit sie nichts aus Level oder Engine treffen. */
  const CSS=[
    '.ns-toast{position:fixed;left:50%;bottom:16px;transform:translate(-50%,12px);z-index:40;',
    ' max-width:min(92vw,440px);box-sizing:border-box;background:#120e22;border:1px solid #ff3d8b;',
    ' border-radius:8px;color:#f2f0ff;font:700 14px/1.35 monospace;letter-spacing:.5px;padding:10px 14px;',
    ' text-align:center;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;}',
    /* Am Handy liegt unten die Bedienung (Stick, Knopf): der Toast sitzt oben mittig,
       unter dem Handy-Hinweis (top:10px, nacht/handy.js). */
    'html.touch .ns-toast{bottom:auto;top:calc(46px + env(safe-area-inset-top,0px));transform:translate(-50%,-12px);}',
    '.ns-toast.an,html.touch .ns-toast.an{opacity:1;transform:translate(-50%,0);}',
    /* Nur ein antippbarer Hinweis (neue Version) faengt Beruehrungen ab, alle anderen nie. */
    '.ns-toast.tipp{pointer-events:auto;cursor:pointer;border-color:#ffd447;color:#ffd447;min-height:44px;}',
    '@media (prefers-reduced-motion:reduce){.ns-toast{transition:none}}',

    '.ns-fehler{position:fixed;inset:0;z-index:2147483000;display:flex;overflow:auto;box-sizing:border-box;',
    ' padding:20px 16px;background:#04030a radial-gradient(ellipse at 50% 40%,#1b1030 0%,#04030a 70%);',
    ' color:#f2f0ff;font-family:monospace;text-align:center;touch-action:pan-y;}',
    /* margin:auto statt justify-content:center: bei wenig Hoehe (Handy quer) bleibt
       sonst die obere Haelfte unerreichbar abgeschnitten. */
    '.ns-innen{margin:auto;display:flex;flex-direction:column;align-items:center;gap:14px;max-width:min(92vw,44em);}',
    '.ns-fehler h1{margin:0;font:700 clamp(16px,4.6vw,26px)/1.25 monospace;letter-spacing:.18em;color:#ff3d8b;',
    ' text-shadow:0 0 10px #ff3d8b99,0 0 22px #ff3d8b55;}',
    '.ns-fehler p{margin:0;font:400 14px/1.5 monospace;color:#f2f0ff;}',
    '.ns-fehler .gold{color:#ffd447;}',
    '.ns-fehler .klein{font:400 12px/1.5 monospace;color:#8d86a8;}',
    '.ns-fehler .meldung{font:400 11px/1.4 monospace;color:#8d86a8;word-break:break-word;',
    ' border:1px dashed #2a2246;border-radius:6px;padding:6px 10px;max-width:100%;}',
    '.ns-tasten{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:4px;}',
    '.ns-fehler button,.ns-fehler a.knopf{display:inline-flex;align-items:center;justify-content:center;',
    ' min-height:44px;box-sizing:border-box;padding:12px 16px;border:2px solid #ff3d8b;border-radius:8px;',
    ' background:#120e22;color:#f2f0ff;font:700 14px/1 monospace;letter-spacing:.1em;cursor:pointer;',
    ' text-decoration:none;touch-action:manipulation;}',
    '.ns-fehler button.haupt{background:#ff3d8b;color:#04030a;}',
    '.ns-fehler button.gefahr{border-color:#ffd447;color:#ffd447;}',
    '.ns-fehler button:hover,.ns-fehler a.knopf:hover{filter:brightness(1.25);}',
    '.ns-fehler button:focus-visible,.ns-fehler a.knopf:focus-visible{outline:3px solid #ffd447;outline-offset:2px;}',
    '@media (max-height:430px){.ns-innen{gap:8px}.ns-fehler p{font-size:12px}.ns-fehler{padding:10px 12px}}'
  ].join('\n');
  let stilEl=null;
  function stilEinfuegen(){
    if(stilEl||!hatDom()) return;
    stilEl=document.createElement('style'); stilEl.id='ns-geraet-stil'; stilEl.textContent=CSS;
    (document.head||document.documentElement).appendChild(stilEl);
  }
  function el(tag,klasse,text){
    const e=document.createElement(tag);
    if(klasse) e.className=klasse;
    if(text!=null) e.textContent=text;
    return e;
  }

  /* Wohin mit Hinweis und Fehlerseite? Das Spiel geht ins Vollbild ueber #cab
     (kern.js: vollbild()). Im Vollbild ist alles AUSSERHALB dieses Elements
     unsichtbar - auch ein fixiertes Element am Seitenende. Darum haengen wir
     uns in das Vollbild-Element, wenn es eines gibt, und ziehen beim Wechsel um. */
  const wirt=()=>sicher(()=>document.fullscreenElement||document.webkitFullscreenElement,null)
    ||sicher(()=>document.body,null)||sicher(()=>document.documentElement,null);
  let toastEl=null, seiteEl=null;
  function umhaengen(){
    sicher(()=>{
      const w=wirt(); if(!w) return;
      [toastEl,seiteEl].forEach(x=>{ if(x&&x.parentNode!==w) w.appendChild(x); });
    });
  }
  if(hatDom()) ['fullscreenchange','webkitfullscreenchange'].forEach(n=>sicher(()=>document.addEventListener(n,umhaengen)));

  /* ------------------------------------------------------------- Hinweise --- */
  /* GERAET.hinweis(text, ms, {beiTippen}) - ein kleiner Toast. Immer nur einer
     sichtbar, weitere warten (hoechstens drei, die aeltesten fallen weg), gleiche
     Meldungen stapeln sich nicht. Mit beiTippen wird der Toast antippbar (Knopf);
     ohne ist er fuer Maus und Finger unsichtbar durchlaessig. */
  const schlange=[]; let aktuell=null;
  GERAET.hinweis=function(text,ms,opt){
    if(!hatDom()) return false;
    try{
      const e={ text:String(text), ms:Math.min(60000,ms>0?ms:4000),
        aktion:opt&&typeof opt.beiTippen==='function'?opt.beiTippen:null };
      if((aktuell&&aktuell.text===e.text)||schlange.some(x=>x.text===e.text)) return true;
      if(schlange.length>=3) schlange.shift();
      schlange.push(e);
      if(!aktuell) naechsterHinweis();
      return true;
    }catch(x){ return false; }
  };
  function naechsterHinweis(){
    try{
      if(aktuell||!schlange.length) return;
      const w=wirt();
      if(!w){ setTimeout(naechsterHinweis,250); return; }   // Seite noch nicht fertig aufgebaut
      stilEinfuegen();
      const e=aktuell=schlange.shift();
      const t=el(e.aktion?'button':'div','ns-toast'+(e.aktion?' tipp':''),e.text);
      if(e.aktion) t.type='button';
      t.setAttribute('role',e.aktion?'button':'status');
      toastEl=t;
      let weg=0;
      const schliessen=()=>{
        clearTimeout(weg); t.classList.remove('an');
        setTimeout(()=>{ sicher(()=>t.parentNode&&t.parentNode.removeChild(t)); if(toastEl===t) toastEl=null;
          aktuell=null; naechsterHinweis(); },300);
      };
      if(e.aktion) t.addEventListener('click',ev=>{ sicher(()=>{ ev.preventDefault(); ev.stopPropagation(); });
        sicher(e.aktion); schliessen(); });
      w.appendChild(t);
      setTimeout(()=>t.classList.add('an'),30);         // naechster Takt, damit die Einblendung laeuft
      weg=setTimeout(schliessen,e.ms);
    }catch(x){ aktuell=null; }
  }

  /* ----------------------------------------------------------- Hintergrund --- */
  /* Verschwindet der Tab (Handy gesperrt, App gewechselt), laeuft der Ton sonst
     weiter oder bleibt danach stumm haengen - iOS setzt den Kontext dabei auf
     "interrupted" und holt ihn nie von allein zurueck. AC kommt aus ton.js (spaeter
     geladen, deshalb erst hier zur Laufzeit gelesen; ohne ton.js einfach nichts tun). */
  const audio=()=>sicher(()=>typeof AC!=='undefined'&&AC?AC:null,null);
  let tonPausiert=false, geste=false;
  function ohneFehler(p){ if(p&&typeof p.catch==='function') p.catch(()=>{}); }
  function tonHalten(){
    sicher(()=>{
      const a=audio(); if(!a||a.state!=='running') return;
      tonPausiert=true; ohneFehler(a.suspend());
    });
  }
  function tonWiederholen(){
    sicher(()=>{
      const a=audio(); if(!a) return;
      if(a.state==='running'){ tonPausiert=false; return; }
      if(!tonPausiert&&a.state!=='interrupted') return;   // vom Browser gesperrt (Autoplay): nicht unsere Sache
      ohneFehler(a.resume());
      /* iOS verlangt nach einer Unterbrechung oft eine Geste. Der erste Tipp danach versucht es noch einmal. */
      if(geste) return; geste=true;
      const nochmal=()=>{ geste=false;
        ['pointerdown','touchend','keydown'].forEach(n=>sicher(()=>document.removeEventListener(n,nochmal,true)));
        sicher(()=>{ const b=audio(); if(b&&b.state!=='running') ohneFehler(b.resume()); }); };
      ['pointerdown','touchend','keydown'].forEach(n=>sicher(()=>document.addEventListener(n,nochmal,true)));
      tonPausiert=false;
    });
  }
  GERAET.tonHalten=tonHalten; GERAET.tonWiederholen=tonWiederholen;

  const beiSichtbar=[];     // Nachrichten an andere Bausteine: "Tab ist wieder da"
  let letzterBlick=Date.now();
  function sichtbarkeit(){
    sicher(()=>{
      if(document.visibilityState==='hidden'){ tonHalten(); return; }
      letzterBlick=Date.now();
      tonWiederholen();
      beiSichtbar.forEach(f=>sicher(f));
    });
  }
  if(hatDom()){
    sicher(()=>document.addEventListener('visibilitychange',sichtbarkeit));
    /* pageshow: Zurueck-Taste oder Wiederkehr aus dem Seitenspeicher des Browsers (bfcache) -
       dort feuert visibilitychange nicht immer. */
    sicher(()=>window.addEventListener('pageshow',e=>{ if(e&&e.persisted) sichtbarkeit(); }));
    sicher(()=>window.addEventListener('pagehide',tonHalten));
  }

  /* ----------------------------------------------------------- Fehlerschutz --- */
  let protokolliert=0, ladeFehler=0, ladeFehlerText=null, geladen=false, folge=0;
  const sturm=[];
  function fehlerText(f){
    if(f==null) return 'unbekannter Fehler';
    let t;
    if(typeof f==='string') t=f;
    else if(f.message) t=(f.name&&f.name!=='Error'?f.name+': ':'')+f.message;
    else t=String(f);
    return t.replace(/\s+/g,' ').slice(0,300);
  }
  /* "datei.js:zeile" aus dem Stack - der Hinweis, wo es knallt. */
  function ortAus(f){
    const s=f&&f.stack; if(typeof s!=='string') return '';
    const m=s.match(/([\w.\-]+\.(?:js|html))(?:\?[^\s:)]*)?:(\d+):(\d+)/);
    return m?m[1]+':'+m[2]:'';
  }
  function merke(art,f,ort){
    const e={ art, text:fehlerText(f), ort:ort||ortAus(f), zeit:Date.now() };
    GERAET.fehler.push(e); if(GERAET.fehler.length>10) GERAET.fehler.shift();
    /* Fehler weiter in die Konsole - sonst fehlt der Person, die nachsieht, jede Spur.
       Gedeckelt, damit ein Dauerfehler die Konsole nicht flutet. */
    if(protokolliert++<20) sicher(()=>console.error('[NACHTSCHICHT] '+art+': '+e.text+(e.ort?' ('+e.ort+')':''),f));
    return e;
  }
  const eigeneDatei=d=>{
    if(!d||typeof d!=='string') return false;
    return d.indexOf(sicher(()=>location.protocol,'')+'//'+sicher(()=>location.host,''))===0;
  };
  /* Harmlose Fehler: nichts zeigen, nichts zaehlen. Dazu gehoert alles, was nicht
     aus unseren eigenen Dateien kommt (Browser-Erweiterungen, fremde Skripte,
     "Script error." ohne Dateiname) und das bekannte ResizeObserver-Rauschen. */
  function istHarmlos(msg,datei){
    const m=String(msg||'');
    if(/ResizeObserver loop/i.test(m)) return true;
    if(/^Script error\.?$/i.test(m)) return true;
    if(!datei) return true;
    if(/^(chrome|moz|safari|safari-web|ms-browser)-extension:/i.test(datei)) return true;
    return !eigeneDatei(datei);
  }

  /* Die Meldung als fertiger Link: nichts wird gesendet, die Person klickt selbst. */
  function meldeUrl(text,ort){
    const ua=sicher(()=>String(navigator.userAgent||'').slice(0,200),'');
    const body='Version: '+GERAET.version+' ('+GERAET.build+')\nSeite: '+seiteName()+
      '\nFehler: '+text+(ort?' ['+ort+']':'')+'\nBrowser: '+ua+
      '\n\nWas ich gerade gemacht habe:\n';
    return MELDEN_URL+'?title='+encodeURIComponent('Fehler: '+text.slice(0,80))+'&body='+encodeURIComponent(body);
  }

  function neuLaden(wiederholt){
    /* Das zweite Mal im selben Tab leeren wir auch den Offline-Speicher: haengt ein
       kaputter Stand dort, brachte das einfache Neuladen ihn immer wieder zurueck.
       Offline NICHT - dann gaebe es danach gar nichts mehr zu laden. */
    const tief=wiederholt&&sicher(()=>navigator.onLine!==false,true);
    if(!tief){ sicher(()=>location.reload()); return; }
    GERAET.cacheLeeren().then(()=>location.reload(),()=>location.reload());
  }

  function zeigeFehlerseite(f){
    if(GERAET.fehlerseiteAn||!hatDom()) return;
    GERAET.fehlerseiteAn=true;
    tonHalten();
    try{
      stilEinfuegen();
      const text=fehlerText(f), ort=ortAus(f);
      const wiederholt=sicher(()=>sitzung().getItem(SPEICHER_PRAEFIX+'fehlerseite')==='1',false);
      sicher(()=>sitzung().setItem(SPEICHER_PRAEFIX+'fehlerseite','1'));

      const aussen=el('div','ns-fehler'); aussen.setAttribute('role','alertdialog');
      aussen.setAttribute('aria-modal','true'); aussen.setAttribute('aria-labelledby','ns-fehler-titel');
      const innen=el('div','ns-innen'); aussen.appendChild(innen);
      const h=el('h1',null,'ETWAS IST SCHIEFGELAUFEN'); h.id='ns-fehler-titel'; innen.appendChild(h);
      innen.appendChild(el('p','gold','Das Spiel ist stehen geblieben. Dein Spielstand liegt noch im Speicher.'));
      innen.appendChild(el('div','meldung',text+(ort?'   ['+ort+']':'')));

      const tasten=el('div','ns-tasten'); innen.appendChild(tasten);
      const neu=el('button','haupt','NEU LADEN'); neu.type='button';
      neu.addEventListener('click',()=>neuLaden(wiederholt));
      const menue=el('button',null,'ZUM MEN\u00dc'); menue.type='button';      // \u00dc = Ue, die Datei bleibt reines ASCII
      menue.addEventListener('click',()=>{ sicher(()=>{ location.href='index.html'; }); });
      const WEG='SPIELSTAND L\u00d6SCHEN';                                     // \u00d6 = Oe
      const weg=el('button','gefahr',WEG); weg.type='button';
      /* Rueckfrage ohne confirm(): der Browser-Dialog ist in Vollbild und installierten
         Apps unzuverlaessig. Erst tippen = scharf (6 s), dann nochmal tippen = loeschen. */
      let scharf=false, scharfTimer=0;
      weg.addEventListener('click',()=>{
        if(!scharf){
          scharf=true; weg.textContent='WIRKLICH? NOCHMAL TIPPEN';
          scharfTimer=setTimeout(()=>{ scharf=false; weg.textContent=WEG; },6000); return;
        }
        clearTimeout(scharfTimer);
        GERAET.loescheSpielstand();
        weg.textContent='GEL\u00d6SCHT'; weg.disabled=true;
        setTimeout(()=>{ sicher(()=>{ location.href='index.html'; }); },700);
      });
      const melden=el('a','knopf','MELDEN'); melden.href=meldeUrl(text,ort);
      melden.target='_blank'; melden.rel='noopener noreferrer';
      [neu,menue,weg,melden].forEach(b=>tasten.appendChild(b));

      innen.appendChild(el('p','klein','NEU LADEN behaelt deinen Fortschritt. ZUM MEN\u00dc beginnt eine neue Nacht. '+
        'MELDEN oeffnet eine vorbereitete Meldung auf GitHub - es wird nichts automatisch gesendet.'));

      seiteEl=aussen;
      wirt().appendChild(aussen);
      setTimeout(()=>sicher(()=>neu.focus()),50);
    }catch(x){
      sicher(()=>console.error('[NACHTSCHICHT] Fehlerseite konnte nicht gebaut werden',x));
    }
  }
  GERAET.zeigeFehlerseite=zeigeFehlerseite;

  /* window error: einzelne Fehler zeigen nichts, sie werden nur gemerkt. Ein Sturm
     eigener Fehler (Handler, die bei jedem Tastendruck werfen) ist dagegen ein
     Zeichen, dass etwas Grundsaetzliches kaputt ist. */
  function beiFehler(ev){
    try{
      if(!ev||istHarmlos(ev.message,ev.filename)) return;
      const datei=String(ev.filename).split('?')[0].split('/').pop();
      const e=merke('fehler',ev.error||ev.message,datei+(ev.lineno?':'+ev.lineno:''));
      if(!geladen){ ladeFehler++; ladeFehlerText=ev.error||ev.message; }
      const t=Date.now(); sturm.push(t);
      while(sturm.length&&t-sturm[0]>STURM_MS) sturm.shift();
      if(sturm.length>=STURM_ANZAHL) zeigeFehlerseite(ev.error||ev.message);
      return e;
    }catch(x){}
  }
  /* Unbehandelte Versprechen: nur merken. Sie sind fast immer Browser-Ablehnungen
     (Vollbild, Ton, Ausrichtung gesperrt) und duerfen nie allein eine Fehlerseite
     ausloesen - ein Aufruf pro Bild wuerde sie sonst sofort zeigen. */
  function beiAblehnung(ev){ sicher(()=>{ merke('versprechen',ev&&ev.reason); }); }
  if(typeof window!=='undefined'&&window&&typeof window.addEventListener==='function'){
    sicher(()=>window.addEventListener('error',beiFehler));
    sicher(()=>window.addEventListener('unhandledrejection',beiAblehnung));
  }

  /* Die Spielschleife. bild() in kern.js bricht bei einer Ausnahme still ab: das
     naechste requestAnimationFrame steht erst am Ende, wird also nie erreicht, und
     das Spiel friert ein, waehrend die Seite weiterlebt. Wir umhuellen die Funktion
     (eine globale Funktionsdeklaration, also neu zuweisbar) so, dass der naechste
     Takt auch nach einer Ausnahme kommt. kern.js ruft "requestAnimationFrame(bild)"
     ueber den Namen auf und nimmt dadurch ab dem naechsten Bild unsere Fassung. */
  function schuetzeSchleife(lesen,schreiben){
    const orig=lesen();
    if(typeof orig!=='function'||orig.nsGeschuetzt) return false;
    let letzteZeit=null;
    const huelle=function(jetzt){
      /* Doppelter Takt im selben Bild = zwei Schleifen waeren aktiv (etwa wenn die
         Originalfunktion ihren Takt vor der Ausnahme schon bestellt hatte): die
         zweite beenden wir, sonst liefe das Spiel doppelt so schnell. */
      if(typeof jetzt==='number'){ if(jetzt===letzteZeit) return; letzteZeit=jetzt; }
      if(GERAET.fehlerseiteAn||GERAET.zuruecksetzen) return;
      try{
        if(GERAET.testFehler>0){ GERAET.testFehler--; throw new Error('Testfehler (absichtlich, ?fehlertest=)'); }
        orig.apply(this,arguments);
        folge=0; GERAET.bilder++;
        if(GERAET.bilder===1200) sicher(()=>sitzung().removeItem(SPEICHER_PRAEFIX+'fehlerseite'));   // ~20 s laeuft es: wieder gesund
      }catch(e){
        folge++;
        merke('bild',e);
        if(folge>FOLGE_MAX){ zeigeFehlerseite(e); return; }      // kein weiterer Takt: die Seite steht still
        sicher(()=>requestAnimationFrame(huelle));
      }
    };
    huelle.nsGeschuetzt=true; huelle.nsOriginal=orig;
    schreiben(huelle);
    return true;
  }
  /* kern.js ist schon geladen; bild steht damit zur Verfuegung. */
  sicher(()=>schuetzeSchleife(()=>typeof bild==='function'?bild:null,f=>{ bild=f; }));
  /* Seiten mit eigener Schleife: runner.html ruft statt bild() seine Funktion frame().
     Deren Inline-Skript laeuft erst NACH uns, darum erst bei DOMContentLoaded umhuellen;
     ab dem zweiten Bild gilt dann die Huelle. Bewusst eine Tabelle nach Seitenname und
     nicht "alles, was frame heisst": ein gleichnamiges Hilfswort in einem Level wuerde
     sonst mit umhuellt. */
  const EIGENE_SCHLEIFE={ 'runner.html':'frame' };
  function eigeneSchleifeSchuetzen(){
    sicher(()=>{
      const n=EIGENE_SCHLEIFE[seiteName()]; if(!n) return;
      schuetzeSchleife(()=>window[n],f=>{ window[n]=f; });
    });
  }
  if(hatDom()){
    sicher(()=>document.addEventListener('DOMContentLoaded',eigeneSchleifeSchuetzen));
  }

  /* Ladefehler: ein Fehler im Level-Skript VOR starteSchleife() laesst das Spiel nie
     anlaufen - weisse Flaeche. Laeuft 1,5 s nach dem Laden noch kein einziges Bild
     (und war ein eigener Fehler da), zeigen wir die Fehlerseite. Ist der Tab im
     Hintergrund, laufen keine Bilder: dann erst beim Zurueckkommen pruefen. */
  let startWartet=false;
  function startPruefen(){
    sicher(()=>{
      if(GERAET.bilder>0||GERAET.fehlerseiteAn||GERAET.zuruecksetzen||ladeFehler===0) return;
      if(document.visibilityState==='hidden'){ startWartet=true; return; }
      zeigeFehlerseite(ladeFehlerText);
    });
  }
  beiSichtbar.push(()=>{ if(startWartet){ startWartet=false; setTimeout(startPruefen,START_PRUEFUNG_MS); } });
  function nachLaden(){ geladen=true; setTimeout(startPruefen,START_PRUEFUNG_MS); }
  if(hatDom()){
    if(sicher(()=>document.readyState==='complete',false)) nachLaden();
    else sicher(()=>window.addEventListener('load',nachLaden));
  }

  /* ---------------------------------------------------------------- Speicher --- */
  /* Privates Fenster, gesperrte Cookies, voller Speicher: setItem wirft, und das
     Spiel merkt sich dann nichts (Bestzeiten, Fortschritt der Nacht). Die Level
     fangen das still ab - die Person erfaehrt es nur hier. */
  GERAET.pruefeSpeicher=function(){
    let ok=true;
    try{
      const s=localStorage, k=SPEICHER_PRAEFIX+'test';
      s.setItem(k,'1'); if(s.getItem(k)!=='1') ok=false; s.removeItem(k);
    }catch(e){ ok=false; }
    GERAET.speicherOk=ok;
    return ok;
  };
  function speicherHinweis(){
    if(GERAET.pruefeSpeicher()) return;
    /* Einmal je Tab zeigen, nicht bei jedem Levelwechsel. Geht auch sessionStorage nicht,
       zeigen wir ihn eben bei jedem Laden. */
    const marke=SPEICHER_PRAEFIX+'speicherhinweis';
    if(sicher(()=>sitzung().getItem(marke)==='1',false)) return;
    sicher(()=>sitzung().setItem(marke,'1'));
    GERAET.hinweis('Speichern ist hier gesperrt (privates Fenster?). Der Fortschritt geht beim Beenden verloren.',7000);
  }
  sicher(speicherHinweis);

  /* ----------------------------------------------------------- Service Worker --- */
  /* sw.js macht das Spiel offline spielbar und installierbar. Nur ueber http(s) -
     bei file:// gibt es keine Service Worker, das Spiel laeuft einfach weiter.
     Auf localhost ist er standardmaessig AUS: tools/server.py schickt extra
     "no-store", damit beim Entwickeln nie eine alte Fassung haengt - ein Service
     Worker wuerde genau das wieder einfuehren. Mit ?sw=1 einschalten (bleibt
     gemerkt), mit ?sw=0 wieder aus. */
  const istLokal=()=>/^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost)$/.test(sicher(()=>location.hostname,''));
  function registriereSW(){
    const sw=sicher(()=>navigator.serviceWorker,null);
    if(!sw||!/^https?:$/.test(sicher(()=>location.protocol,''))) return;
    const wahl=swWahl();
    if(istLokal()&&wahl!=='1'){ if(sw.controller) GERAET.cacheLeeren(); return; }

    let wollteNeu=false, laedt=false, gemeldet=null;
    /* Neu laden NUR, wenn die Person den Hinweis angetippt hat. Der erste Service
       Worker uebernimmt die Seite ebenfalls per "controllerchange" - das darf nichts
       neu laden, und eine andere Registerkarte, die gewechselt hat, auch nicht. */
    sw.addEventListener('controllerchange',()=>{ if(!wollteNeu||laedt) return; laedt=true; sicher(()=>location.reload()); });
    const melde=w=>{
      if(gemeldet===w) return; gemeldet=w;
      GERAET.hinweis('NEUE VERSION - TIPPEN ZUM LADEN',20000,{ beiTippen(){
        wollteNeu=true;
        sicher(()=>w.postMessage({type:'SKIP_WAITING'}));
      }});
    };
    sw.register('sw.js',{updateViaCache:'none'}).then(reg=>{
      GERAET.sw=reg;
      if(reg.waiting&&sw.controller) melde(reg.waiting);
      reg.addEventListener('updatefound',()=>{
        const neu=reg.installing; if(!neu) return;
        neu.addEventListener('statechange',()=>{ if(neu.state==='installed'&&sw.controller) melde(neu); });
      });
      /* Wer das Spiel stundenlang offen laesst, bekommt sonst nie mit, dass es eine
         neue Fassung gibt: der Browser prueft sw.js sonst nur beim Laden einer Seite. */
      const pruefen=()=>{ sicher(()=>ohneFehler(reg.update())); };
      setInterval(pruefen,UPDATE_PRUEFEN_MS);
      let letzte=Date.now();
      beiSichtbar.push(()=>{ if(Date.now()-letzte>10*60*1000){ letzte=Date.now(); pruefen(); } });
    }).catch(e=>{ merke('sw',e); });
  }
  /* ?sw=1 / ?sw=0 (nur fuer localhost gedacht) und die gemerkte Wahl. */
  function swWahl(){
    const k=SPEICHER_PRAEFIX+'sw';
    sicher(()=>{
      if(hatParam('sw','1')) lokal().setItem(k,'1');
      else if(hatParam('sw','0')) lokal().removeItem(k);
    });
    return sicher(()=>lokal().getItem(k),null);
  }
  if(hatDom()){
    /* Nach dem Laden, damit das Vorab-Herunterladen nicht mit dem Spielstart um die Leitung streitet. */
    if(sicher(()=>document.readyState==='complete',false)) sicher(registriereSW);
    else sicher(()=>window.addEventListener('load',()=>sicher(registriereSW)));
  }

  /* ------------------------------------------------------------------ Support --- */
  /* ?reset=1: alle Schluessel des Spiels loeschen, Offline-Speicher und Service Worker
     entfernen, dann ohne den Parameter neu laden. ?reset=cache: dasselbe, aber der
     Spielstand bleibt. Fuer Support ("bei mir haengt etwas") - die Adresse genuegt.
     Die Seite laeuft bis zum Neuladen weiter; darum ist die Schleife oben gesperrt
     (GERAET.zuruecksetzen) und ein Deckblatt verdeckt das Bild. */
  function ohneReset(){
    return sicher(()=>{
      const rest=String(location.search||'').replace(/^\?/,'').split('&').filter(p=>p&&p.split('=')[0]!=='reset').join('&');
      return String(location.pathname||'')+(rest?'?'+rest:'')+String(location.hash||'');
    },'index.html');
  }
  function zuruecksetzen(nurCache){
    GERAET.zuruecksetzen=true;
    sicher(()=>{
      stilEinfuegen();
      const d=el('div','ns-fehler',null);
      d.appendChild(el('div','ns-innen')).appendChild(el('p','gold',nurCache?'SPEICHER WIRD GELEERT ...':'ALLES WIRD ZURUECKGESETZT ...'));
      seiteEl=d; wirt().appendChild(d);
    });
    if(!nurCache) GERAET.loescheSpielstand();
    GERAET.cacheLeeren().then(()=>{},()=>{}).then(()=>{
      /* Zweiter Durchgang: zwischen Start und Neuladen hat die Seite selbst schon
         wieder Werte geschrieben (index.html legt den Anfang der Nacht an). */
      if(!nurCache) GERAET.loescheSpielstand();
      sicher(()=>location.replace(ohneReset()));
    });
  }
  if(hatDom()){
    if(hatParam('reset','1')) sicher(()=>zuruecksetzen(false));
    else if(hatParam('reset','cache')) sicher(()=>zuruecksetzen(true));
    const ft=sicher(()=>/(^|[?&])fehlertest=(\d+)(&|$)/.exec(abfrage()),null);
    if(ft) GERAET.testFehler=Math.min(60,parseInt(ft[2],10)||0);
  }
})();
