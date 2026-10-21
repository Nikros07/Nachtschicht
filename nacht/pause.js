/* ============================================================================
   NACHTSCHICHT - ENGINE: pause
   Das Pausemenue am Rechner: Esc haelt das Level an und oeffnet
   WEITER / NEU STARTEN / EINSTELLUNGEN / ZUM MENUE.

   Oeffentliche API (im Browser window.PAUSE, in Node die Konstante PAUSE):
     PAUSE.eintraege(modus)  reine Liste {id,txt,wert?}; modus 'haupt' | 'einst' | 'neuSicher'
     PAUSE.darfAuf()         true, wenn die Pause jetzt aufgehen darf
     PAUSE.aktiv()           true, solange die Pause offen ist
     PAUSE.kaputt()          true, wenn sich das Menue nach einem Fehler aufgegeben hat
     PAUSE.auf() / PAUSE.zu()
     PAUSE.aktiviere(id)     fuehrt einen Eintrag aus (Tasten und Maus rufen das auch)
     PAUSE.modus()           aktueller Zustand (fuer Tests)
     PAUSE.zeichne()         kern.js ruft das nach draw() auf, nur wenn aktiv

   Am Handy gibt es das HTML-Menue aus nacht/mobil.js (Knopf MENUE); dort tut
   diese Datei nichts: darfAuf() ist dann false.

   Gibt sich bei jedem Fehler auf (aktiv=false, kaputt=true, oeffnet nie wieder).
   Das Spiel darf dabei nie stehen bleiben.

   Klassisches Script, kein ES-Modul. Ohne Browser ladbar (node test/pause.test.js).
   ========================================================================== */

/* Stellschrauben der Pause */
const PAUSE_TUNE={
  DUNKEL:.78,     // Abdunkelung des Bildes hinter dem Menue (0 = aus, 1 = schwarz)
  SPERRE:.15,     // Sekunden nach dem Oeffnen, in denen Enter/E/Leertaste nichts ausloesen
  BREITE:160,     // Breite der Eintraege in Bildpunkten
  ZEILE:14,       // Abstand zwischen zwei Eintraegen in Bildpunkten
};

const PAUSE=(function(){
  /* Farben wie im Startmenue (nacht/menue.js) */
  const P={ neon:'#ff3d8b', gold:'#ffd447', weiss:'#f2f0ff', dim:'#8d86a8', dunkel:'#4a4363',
            gruen:'#5fe08a', feld:'#161230', wahl:'#2a2440' };
  /* Die Schalter, die Links/Rechts im Modus EINSTELLUNGEN umschalten */
  const WECHSEL=['flacker','wackeln','roehre','ton'];

  const Z={ aktiv:false, kaputt:false, modus:'haupt', liste:[], sel:0, hits:[], seit:0, zeiger:null };

  /* ---- Hilfen (alles abgesichert: die Datei laeuft auch ohne Browser) ---- */
  const fenster=function(){ return typeof window!=='undefined'?window:null; };
  const maass=function(){ return { w:typeof W==='number'?W:320, h:typeof H==='number'?H:180 }; };
  const jetzt=function(){
    try{ if(typeof performance!=='undefined'&&performance&&typeof performance.now==='function') return performance.now(); }catch(e){}
    return Date.now();
  };
  const ton=function(f,d){ try{ if(typeof piep==='function') piep(f,d||.05,'square',.04); }catch(e){} };
  const musikDaempfen=function(an){
    try{ if(typeof MUSIK!=='undefined'&&MUSIK&&typeof MUSIK.daempfen==='function') MUSIK.daempfen(an); }catch(e){}
  };
  const an=function(k){
    try{ return typeof KOMFORT!=='undefined'&&KOMFORT&&KOMFORT.hole(k)?'AN':'AUS'; }catch(e){ return 'AUS'; }
  };
  const stumm=function(){
    try{ return typeof muted!=='undefined'&&!!muted; }catch(e){ return false; }
  };

  /* ---- Reine Daten ---- */
  function eintraege(modus){
    if(modus==='neuSicher') return [{ id:'abbrechen', txt:'ABBRECHEN' },{ id:'neuJa', txt:'JA, NEU STARTEN' }];
    if(modus==='einst') return [
      { id:'flacker', txt:'FLACKERSCHUTZ', wert:an('flackerschutz') },
      { id:'wackeln', txt:'WACKELN',       wert:an('wackeln') },
      { id:'roehre',  txt:'ROEHREN-LOOK',  wert:an('roehre') },
      { id:'ton',     txt:'TON',           wert:stumm()?'AUS':'AN' },
      { id:'zurueck', txt:'ZURUECK' },
    ];
    return [
      { id:'weiter',  txt:'WEITER' },
      { id:'neu',     txt:'NEU STARTEN' },
      { id:'einst',   txt:'EINSTELLUNGEN' },
      { id:'menue',   txt:'ZUM MENUE' },
    ];
  }

  /* ---- Zustand ---- */
  function darfAuf(){
    try{
      if(Z.kaputt) return false;
      const f=fenster();
      if(f&&f.MOBIL&&f.MOBIL.an) return false;                       // Handy: HTML-Menue aus mobil.js
      if(!(typeof S!=='undefined'&&S)) return false;
      if(S.modus==='titel') return false;
      if(typeof MENUE!=='undefined'&&MENUE){
        if(typeof MENUE.aktiv==='function'&&MENUE.aktiv()) return false;
        if(typeof MENUE.galerieOffen==='function'&&MENUE.galerieOffen()) return false;
      }
      if(f&&f.HANDY&&f.HANDY.offen) return false;
      if(typeof kapitelAktiv==='function'&&kapitelAktiv()) return false;
      if(f&&f.LEHRE&&f.LEHRE.aktiv) return false;                    // nur lesen, LEHRE.pruefe() bleibt aus
      return true;
    }catch(e){ aufgeben(); return false; }
  }

  function aufgeben(){
    Z.kaputt=true; Z.aktiv=false; Z.zeiger=null;
    musikDaempfen(false);
  }

  function setze(m){ Z.modus=m; Z.liste=eintraege(m); Z.sel=0; Z.zeiger=null; }

  function auf(){
    try{
      if(Z.aktiv) return true;
      if(!darfAuf()) return false;
      Z.aktiv=true; Z.modus='haupt'; Z.liste=eintraege('haupt'); Z.sel=0; Z.zeiger=null; Z.hits=[];
      Z.seit=jetzt();
      try{ const f=fenster(); if(f&&typeof Event==='function') f.dispatchEvent(new Event('blur')); }catch(e){}
      musikDaempfen(true);
      return true;
    }catch(e){ aufgeben(); return false; }
  }

  function zu(){
    try{ Z.aktiv=false; Z.zeiger=null; musikDaempfen(false); }
    catch(e){ aufgeben(); }
  }

  function aktiviere(id){
    try{
      ton(520);
      switch(id){
        case 'weiter': zu(); break;
        case 'neu': setze('neuSicher'); break;
        case 'neuJa': zu(); if(typeof neuesSpiel==='function') neuesSpiel(); break;
        case 'einst': setze('einst'); break;
        case 'flacker': case 'wackeln': case 'roehre': {
          const k=id==='flacker'?'flackerschutz':id;
          if(typeof KOMFORT!=='undefined'&&KOMFORT) KOMFORT.umschalten(k);
          ton(600); Z.liste=eintraege(Z.modus); break; }
        case 'ton':
          if(typeof muted!=='undefined'){ muted=!muted; if(!muted&&typeof ensureAudio==='function') ensureAudio(); }
          ton(600); Z.liste=eintraege(Z.modus); break;
        case 'menue':
          if(typeof location!=='undefined') location.href='index.html'; break;
        case 'zurueck': case 'abbrechen': setze('haupt'); break;
        default: break;
      }
    }catch(e){ aufgeben(); }
  }

  function verschiebe(r){ const n=Z.liste.length; if(n) Z.sel=((Z.sel+r)%n+n)%n; }

  /* ---- Zeichnen ---- */
  function zeichneListe(yOben,m){
    const bw=Math.min(PAUSE_TUNE.BREITE,m.w-120), bx=Math.round((m.w-bw)/2), h=PAUSE_TUNE.ZEILE-3;
    const blink=Math.floor(jetzt()/333)%2===0;
    Z.hits=[];
    Z.liste.forEach(function(e,i){
      const y=yOben+i*PAUSE_TUNE.ZEILE, wahl=i===Z.sel;
      ctx.fillStyle=wahl?P.wahl:P.feld; ctx.fillRect(bx,y,bw,h);
      if(wahl){ ctx.fillStyle=P.neon; ctx.fillRect(bx,y,1,h); ctx.fillRect(bx+bw-1,y,1,h);
                ctx.fillRect(bx,y,bw,1); ctx.fillRect(bx,y+h-1,bw,1); }
      const ty=y+Math.round((h-5)/2);
      const col=wahl?P.weiss:(e.id==='weiter'?P.gold:P.dim);
      if(e.wert!==undefined){
        text(e.txt,bx+7,ty,col);
        const vc=e.wert==='AUS'?P.dunkel:P.gruen;
        text(e.wert,bx+bw-7-textW(e.wert),ty,wahl?P.gold:vc);
        if(wahl&&blink) text('<',bx+bw-7-textW(e.wert)-8,ty,P.gold);
      } else {
        const tw=textW(e.txt), maxB=bw-8;
        text(e.txt,bx+Math.round((bw-Math.min(tw,maxB))/2),ty,col);
      }
      Z.hits.push({ i:i, x:bx, y:y, w:bw, h:h });
    });
  }

  function zeichne(){
    try{
      if(!Z.aktiv) return;
      const m=maass();
      ctx.fillStyle='rgba(7,6,13,'+PAUSE_TUNE.DUNKEL+')'; ctx.fillRect(0,0,m.w,m.h);
      const titel=Z.modus==='einst'?'EINSTELLUNGEN':Z.modus==='neuSicher'?'NEU STARTEN?':'PAUSE';
      textGlowC(titel,22,P.neon,2);
      let yOben=50;
      if(Z.modus==='neuSicher'){ textC('DER STAND DIESES LEVELS GEHT VERLOREN.',44,P.weiss); yOben=58; }
      zeichneListe(yOben,m);
      textC('PFEILE: WAEHLEN   E: OK   ESC: ZURUECK',m.h-12,P.dunkel);
    }catch(e){ aufgeben(); }
  }

  /* ---- Tasten (Capture, damit das Level nichts davon sieht) ---- */
  /* Browser-Kuerzel, Ton, Vollbild und Lautstaerke-Taste gehen unberuehrt durch. */
  const DURCH=function(e){
    return e.ctrlKey||e.metaKey||e.altKey||/^F([1-9]|1[0-2])$/.test(e.code)||e.code==='KeyM'||e.code==='KeyF';
  };
  function taste(e){
    try{
      if(!Z.aktiv){
        if(e.code==='Escape'&&!e.repeat&&darfAuf()){ e.preventDefault(); e.stopImmediatePropagation(); auf(); }
        return;
      }
      if(DURCH(e)) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const c=e.code;
      if(c==='ArrowUp'||c==='KeyW') verschiebe(-1);
      else if(c==='ArrowDown'||c==='KeyS') verschiebe(1);
      else if(c==='ArrowLeft'||c==='KeyA'||c==='ArrowRight'||c==='KeyD'){
        const e0=Z.liste[Z.sel];
        if(Z.modus==='einst'&&e0&&WECHSEL.indexOf(e0.id)>=0) aktiviere(e0.id);
      }
      else if(c==='Enter'||c==='KeyE'||c==='Space'||c==='NumpadEnter'){
        const e0=Z.liste[Z.sel];
        if(!e.repeat&&e0&&jetzt()-Z.seit>=PAUSE_TUNE.SPERRE*1000) aktiviere(e0.id);
      }
      else if(c==='Escape'||c==='Backspace'){ if(Z.modus==='haupt') zu(); else setze('haupt'); }
      else if(c==='KeyP') zu();
    }catch(err){ aufgeben(); }
  }

  /* ---- Maus und Finger ---- */
  function lage(e){
    if(typeof cv==='undefined'||!cv) return null;
    const b=cv.getBoundingClientRect(); if(!b||!b.width) return null;
    const m=maass();
    return { x:(e.clientX-b.left)/b.width*m.w, y:(e.clientY-b.top)/b.height*m.h };
  }
  function treffer(p){
    for(const h of Z.hits){
      if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h) return h;
    }
    return null;
  }
  function klick(e){
    try{
      if(!Z.aktiv) return;
      const p=lage(e), m=maass();
      /* Klicks ausserhalb des Bildes (Levelleiste, Vollbild-Knopf) bleiben frei; im Bild
         gehoert jeder Klick der Pause, damit das Level darunter nichts ausloest. */
      if(!p||p.x<0||p.y<0||p.x>m.w||p.y>m.h) return;
      e.preventDefault(); e.stopPropagation();
      const h=treffer(p);
      if(!h) return;
      Z.sel=h.i;
      aktiviere(Z.liste[h.i].id);
    }catch(err){ aufgeben(); }
  }
  function ueberfahren(e){
    try{
      if(!Z.aktiv||e.pointerType!=='mouse'||e.buttons) return;   // nur Mauszeiger ohne Taste
      const p=lage(e), h=p&&treffer(p);
      if(h) Z.sel=h.i;
    }catch(err){ aufgeben(); }
  }

  if(typeof document!=='undefined'&&typeof addEventListener==='function'){
    addEventListener('keydown',taste,true);
    addEventListener('pointerdown',klick,true);
    addEventListener('pointermove',ueberfahren,true);
  }

  return {
    eintraege:eintraege,
    darfAuf:darfAuf,
    aktiv:function(){ return !!Z.aktiv; },
    kaputt:function(){ return !!Z.kaputt; },
    auf:auf,
    zu:zu,
    aktiviere:aktiviere,
    modus:function(){ return Z.modus; },
    zeichne:zeichne,
  };
})();

if(typeof window!=='undefined') window.PAUSE=PAUSE;
