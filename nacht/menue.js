/* ============================================================================
   NACHTSCHICHT - ENGINE: menue
   Startmenue, Einstellungen, Enden-Galerie und Credits - das, was ein
   fertiges Spiel vor dem ersten Level und zwischen den Naechten zeigt.

   Haengt sich wie lehre.js in die Schleife (kern.js: bild()). Klassisches
   Script, kein ES-Modul.
   ========================================================================== */

const MENUE={};

/* ---------------------------------------------------------------------------
   ENDEN-GALERIE und Momente-Sammlung
   Ein HTML-Overlay (Umlaute gehen), im Stil des Handyfensters. Quellen sind
   NACHT.gesehen, NACHT.knotenBest und NACHT.momenteBest - nicht die Flags,
   die beim Neuanfang der Nacht geloescht werden.
   Aufruf: MENUE.galerie() (Handy-Menue: Knopf ENDEN; Titelbild: Taste G, wird
   im Level-1-Auftrag verdrahtet). MENUE.galerieZu() schliesst, Esc ebenfalls.
   --------------------------------------------------------------------------- */
const GALERIE_TUNE={ MOMENTE:8, KNOTEN_MAX:3, Z:80 };

/* Reine Daten, ohne DOM - damit testbar. */
MENUE.galerieDaten=function(){
  const st=(typeof NACHT!=='undefined'&&NACHT)||{};
  const gesehen=Array.isArray(st.gesehen)?st.gesehen:[];
  const best=st.knotenBest||{};
  const mb=Array.isArray(st.momenteBest)?st.momenteBest:[];
  const tm=(typeof TEXTE_MOMENTE!=='undefined'&&TEXTE_MOMENTE)||{};
  const alle=(typeof ENDEN_ALLE!=='undefined'&&Array.isArray(ENDEN_ALLE))?ENDEN_ALLE:[];
  const enden=alle.map(function(e){
    const g=gesehen.includes(e.titel);
    return { id:e.id, titel:e.titel, gesehen:g,
      knoten:g?Math.max(0,Math.min(GALERIE_TUNE.KNOTEN_MAX,best[e.titel]||0)):0 };
  });
  const momente=[]; let anzahl=0;
  for(let n=1;n<=GALERIE_TUNE.MOMENTE;n++){
    const da=mb.includes(n); if(da) anzahl++;
    const t=tm[n]||{};
    momente.push({ n:n, gefunden:da, titel:da?(t.titel||''):'', l1:da?(t.l1||''):'', l2:da?(t.l2||''):'' });
  }
  return { enden:enden, endenGesehen:enden.filter(function(e){ return e.gesehen; }).length,
           momente:momente, momenteAnzahl:anzahl };
};

(function(){
  if(typeof document==='undefined'||!document.createElement) return;
  let overlay=null, tastenFn=null;
  /* Im Vollbild ist alles ausserhalb des Vollbild-Elements unsichtbar - wie bei
     den Toasts in geraet.js haengen wir uns dort ein. */
  const wirt=function(){
    try{ return document.fullscreenElement||document.webkitFullscreenElement||document.body; }catch(e){ return null; }
  };
  function stil(){
    if(document.getElementById('galstil')) return;
    const s=document.createElement('style'); s.id='galstil';
    s.textContent=[
      '#galerie { position:fixed; inset:0; z-index:'+GALERIE_TUNE.Z+'; display:flex; align-items:center;',
      '  justify-content:center; background:rgba(4,3,10,.88); font-family:monospace; }',
      '#galbox { width:min(380px,94vw); max-height:92vh; background:#0b0916; border:2px solid #2a2246;',
      '  border-radius:18px; box-shadow:0 0 40px rgba(255,61,139,.15); display:flex; flex-direction:column;',
      '  overflow:hidden; }',
      '#galliste { flex:1; overflow:auto; padding:12px 14px; -webkit-overflow-scrolling:touch; }',
      '#galliste h2 { margin:10px 0 8px; font:700 12px/1 monospace; letter-spacing:3px; color:#ff3d8b; }',
      '#galliste h2:first-child { margin-top:2px; }',
      '.galz { display:flex; justify-content:space-between; gap:10px; padding:7px 9px; margin-bottom:5px;',
      '  background:#161230; border-radius:8px; color:#f2f0ff; font:400 12px/1.3 monospace; }',
      '.galz.leer { color:#4a4363; }',
      '.galz small { color:#ffd447; font:700 10px/1.4 monospace; white-space:nowrap; letter-spacing:1px; }',
      '.galm { display:block; }',
      '.galm b { display:block; color:#ffd447; font:700 10px/1.4 monospace; letter-spacing:1px; }',
      '#galzu { margin:10px 14px 14px; min-height:44px; background:rgba(255,212,71,.1);',
      '  border:1px solid #ffd447; color:#ffd447; border-radius:8px; font:700 12px/1 monospace;',
      '  letter-spacing:2px; padding:14px; cursor:pointer; }',
      'html.touch #galzu { min-height:56px; font-size:14px; }',
    ].join('\n');
    document.head.appendChild(s);
  }
  const zeile=function(klasse,html){
    const d=document.createElement('div'); d.className=klasse; d.innerHTML=html; return d;
  };
  const esc=function(t){
    return String(t).replace(/[&<>]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]; });
  };
  const umhaengen=function(){
    try{ const x=wirt(); if(overlay&&x&&overlay.parentNode!==x) x.appendChild(overlay); }catch(e){}
  };

  MENUE.galerieZu=function(){
    try{
      if(overlay&&overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay=null;
      if(tastenFn){ document.removeEventListener('keydown',tastenFn,true); tastenFn=null; }
    }catch(e){}
  };
  MENUE.galerieOffen=function(){ return !!overlay; };

  MENUE.galerie=function(){
    try{
      if(overlay) return;
      const w=wirt(); if(!w) return;
      stil();
      const d=MENUE.galerieDaten();
      overlay=document.createElement('div'); overlay.id='galerie';
      const box=document.createElement('div'); box.id='galbox';
      const liste=document.createElement('div'); liste.id='galliste';
      const h1=document.createElement('h2');
      h1.textContent='ENDEN  '+d.endenGesehen+' VON '+d.enden.length; liste.appendChild(h1);
      d.enden.forEach(function(e){
        liste.appendChild(e.gesehen
          ? zeile('galz','<span>'+esc(e.titel)+'</span><small>'+e.knoten+' VON '+GALERIE_TUNE.KNOTEN_MAX+' KNOTEN</small>')
          : zeile('galz leer','<span>???</span>'));
      });
      const h2=document.createElement('h2');
      h2.textContent='MOMENTE: '+d.momenteAnzahl+' VON '+GALERIE_TUNE.MOMENTE; liste.appendChild(h2);
      d.momente.forEach(function(m){
        liste.appendChild(m.gefunden
          ? zeile('galz','<span class="galm"><b>'+m.n+'  '+esc(m.titel)+'</b>'+esc(m.l1)+'</span>')
          : zeile('galz leer','<span>???</span>'));
      });
      const zu=document.createElement('button'); zu.id='galzu'; zu.textContent='ZURUECK';
      /* pointerdown wie im Handy-Menue; click als Rueckfall fuer Tastatur und Maus */
      zu.addEventListener('pointerdown',function(e){ e.preventDefault(); e.stopPropagation(); MENUE.galerieZu(); });
      zu.addEventListener('click',function(){ MENUE.galerieZu(); });
      overlay.addEventListener('pointerdown',function(e){ e.stopPropagation(); });
      box.appendChild(liste); box.appendChild(zu); overlay.appendChild(box); w.appendChild(overlay);
      tastenFn=function(e){
        if(e.code==='Escape'||e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); MENUE.galerieZu(); }
      };
      document.addEventListener('keydown',tastenFn,true);
      try{ zu.focus(); }catch(e){}
    }catch(e){ try{ MENUE.galerieZu(); }catch(x){} }
  };
  ['fullscreenchange','webkitfullscreenchange'].forEach(function(n){
    try{ document.addEventListener(n,umhaengen); }catch(e){}
  });
})();

/* ============================================================================
   STARTMENUE
   Das erste, was man beim Oeffnen von index.html sieht - ein Zustand wie die
   Lektion in lehre.js: kern.js fragt in jedem Bild MENUE.laufe(dt); solange es
   true meldet, ruht das Level und die Tasten gehoeren dem Menue.

   Es erscheint NICHT, wenn die Adresse ?neu=1, ?lektion oder ?level enthaelt -
   dann gilt der alte Titelbild-Pfad von Level 1. Und es gibt sich bei jedem
   Fehler auf: das Spiel startet dann wie vorher.

   Fortschritt: NACHT.kapitel (nacht.js). karte.html setzt es beim Laden auf
   "geschafftes Level + 1"; NEUE NACHT setzt es zurueck. Bestzeiten bleiben (Rekorde)
   und schalten nur die Levelauswahl frei.
   --------------------------------------------------------------------------- */
const START_TUNE={
  LETZTES:8,          // so viele Level hat die Nacht
  BREITE:160,         // Breite der Eintraege in Bildpunkten (rechts bleibt Platz fuer den Hauptknopf)
  TOUCH_PX:44,        // kleinste Flaeche am Handy in CSS-Pixeln
  ZIEHEN_PX:8,        // ab so viel Wischen scrollt die Liste statt zu waehlen
  BLITZ_ALLE:9,       // Sekunden zwischen zwei Logo-Aufhellern (immer ueber FX)
  BLITZ_DAUER:.12,
  SPERRE:.25,         // Sekunden nach dem Erscheinen, in denen nichts ausloest
};

/* ---- Reine Daten (ohne DOM, testbar) ---- */
MENUE.ortVon=function(n){
  const k=(typeof TEXTE_KAPITEL!=='undefined'&&TEXTE_KAPITEL)?TEXTE_KAPITEL[n]:null;
  return (k&&k.ort)||'';
};
MENUE.seiteVon=function(n){ return n<=1?'index.html?level=1':'level'+n+'.html'; };
MENUE.levelText=function(n){ const o=MENUE.ortVon(n); return 'LEVEL '+n+(o?' - '+o:''); };

MENUE.fortschritt=function(){
  const L=START_TUNE.LETZTES;
  const st=(typeof NACHT!=='undefined'&&NACHT)||{};
  let kap=Math.floor(+st.kapitel); if(!(kap>=1)) kap=1; if(kap>L) kap=L;
  let best=0;
  for(let n=1;n<=L;n++){
    try{ if(typeof ladeBestN==='function'&&ladeBestN(n)!==null) best=n; }catch(e){}
  }
  const erreicht=Math.min(L,Math.max(kap,best+1));
  let weiter=null;
  if(kap>=2){
    let offen=false;
    try{ offen=typeof flag==='function'&&!flag('umweg_'+(kap-1)); }catch(e){}
    weiter={ level:kap, ort:MENUE.ortVon(kap), text:MENUE.levelText(kap),
             seite:offen?'karte.html?nach='+(kap-1):MENUE.seiteVon(kap) };
  }
  return { kapitel:kap, erreicht:erreicht, weiter:weiter };
};

MENUE.startModus=function(){
  let g=false; try{ g=!!KOMFORT.hole('hinweis'); }catch(e){ g=true; }
  return g?'haupt':'hinweis';
};

/* Die Zeilen eines Menue-Zustands. typ 'info' ist nur Text und nicht waehlbar. */
MENUE.eintraege=function(modus){
  const touch=typeof IS_TOUCH!=='undefined'&&!!IS_TOUCH;
  const kh=function(k){ try{ return !!KOMFORT.hole(k); }catch(e){ return false; } };
  const an=function(b){ return b?'AN':'AUS'; };
  const fort=MENUE.fortschritt();
  if(modus==='hinweis'){
    const l=[{ id:'hinweisWeiter', txt:'WEITER' }];
    if(!kh('flackerschutz')) l.push({ id:'hinweisRuhig', txt:'FLACKERSCHUTZ AN' });
    return l;
  }
  if(modus==='neuSicher') return [{ id:'abbrechen', txt:'ABBRECHEN' },{ id:'neuJa', txt:'JA, NEUE NACHT' }];
  if(modus==='level'){
    const l=[];
    for(let n=1;n<=fort.erreicht;n++) l.push({ id:'level'+n, txt:MENUE.levelText(n), level:n });
    l.push({ id:'zurueck', txt:'ZURUECK' });
    return l;
  }
  if(modus==='einst'){
    const l=[
      { id:'flacker',    txt:'FLACKERSCHUTZ', wert:an(kh('flackerschutz')) },
      { id:'wackeln',    txt:'WACKELN',       wert:an(kh('wackeln')) },
      { id:'roehre',     txt:'ROEHREN-LOOK',  wert:an(kh('roehre')) },
      { id:'schwer',     txt:'SCHWIERIGKEIT', wert:(function(){ try{ return schwer().name; }catch(e){ return 'NORMAL'; } })() },
    ];
    if(touch) l.push({ id:'handyInfo', txt:'HANDY: KNOPF MENUE', typ:'info' });
    l.push({ id:'zurueck', txt:'ZURUECK' });
    return l;
  }
  const l=[{ id:'neu', txt:'NEUE NACHT' }];
  if(fort.weiter) l.push({ id:'weiter', txt:'WEITER: '+fort.weiter.text, ziel:fort.weiter.seite });
  if(fort.erreicht>=2) l.push({ id:'level', txt:'LEVEL WAEHLEN' });
  l.push({ id:'einst', txt:'EINSTELLUNGEN' });
  l.push({ id:'enden', txt:'ENDEN' });
  l.push({ id:'ueber', txt:'UEBER' });
  return l;
};

/* Vorgewaehlt: im Hauptmenue WEITER (wenn da), bei der Rueckfrage ABBRECHEN. */
MENUE.standardWahl=function(liste,modus){
  if(modus==='haupt'){ const i=liste.findIndex(function(e){ return e.id==='weiter'; }); if(i>=0) return i; }
  const j=liste.findIndex(function(e){ return e.typ!=='info'; });
  return j<0?0:j;
};
/* Naechster waehlbarer Eintrag in Richtung r (+1/-1), mit Umbruch am Rand. */
MENUE.naechste=function(liste,i,r){
  const n=liste.length; if(!n) return 0;
  for(let k=1;k<=n;k++){
    const j=((i+r*k)%n+n)%n;
    if(liste[j].typ!=='info') return j;
  }
  return i;
};

(function(){
  if(typeof document==='undefined'||typeof cv==='undefined'||typeof ctx==='undefined') return;
  const abfrage=(typeof location!=='undefined'&&location.search)||'';
  const seite=((typeof location!=='undefined'&&location.pathname)||'').split('/').pop().toLowerCase()||'index.html';
  /* Nur auf dem Titel von Level 1, und nur ohne die Adresszusaetze der alten Wege. */
  const erlaubt=(seite==='index.html')&&!/[?&](neu=1|lektion|level)/.test(abfrage);

  const Z=MENUE.z={ aktiv:false, zu:!erlaubt, fehler:false, modus:'haupt', liste:[], sel:0, off:0, t:0,
                    hits:[], geo:null, zeiger:null };
  const P={ ink:'#07060d', neon:'#ff3d8b', gold:'#ffd447', weiss:'#f2f0ff', dim:'#8d86a8',
            dunkel:'#4a4363', rot:'#ff4d4d', gruen:'#5fe08a', cyan:'#42d9ff', feld:'#161230', wahl:'#2a2440' };
  const gal=function(){ try{ return !!MENUE.galerieOffen&&MENUE.galerieOffen(); }catch(e){ return false; } };
  const ton=function(f,d){ try{ if(typeof piep==='function') piep(f,d||.05,'square',.04); }catch(e){} };
  const mobilAn=function(){ return !!(window.MOBIL&&window.MOBIL.an); };
  const hoch=function(){ return mobilAn()&&!!window.MOBIL.hoch; };

  function aufgeben(){ Z.fehler=true; Z.aktiv=false; Z.zu=true; }
  function modusSetze(m,wahl){
    Z.modus=m; Z.liste=MENUE.eintraege(m);
    Z.sel=(wahl!==undefined&&wahl>=0&&wahl<Z.liste.length)?wahl:MENUE.standardWahl(Z.liste,m);
    Z.off=0; Z.zeiger=null;
  }
  function neuAufbauen(){   // Werte haben sich geaendert, Auswahl bleibt
    const id=Z.liste[Z.sel]&&Z.liste[Z.sel].id;
    Z.liste=MENUE.eintraege(Z.modus);
    const i=Z.liste.findIndex(function(e){ return e.id===id; });
    Z.sel=i>=0?i:Math.min(Z.sel,Z.liste.length-1);
  }

  /* ---- Handlungen ---- */
  function gehe(url){ try{ location.href=url; }catch(e){} }
  function startNeu(){
    Z.aktiv=false; Z.zu=true;
    try{ if(typeof ensureAudio==='function') ensureAudio(); }catch(e){}
    if(typeof starte==='function') starte(); else gehe('index.html?neu=1');
  }
  function wechsle(id,r){
    try{
      if(id==='flacker') KOMFORT.umschalten('flackerschutz');
      else if(id==='wackeln') KOMFORT.umschalten('wackeln');
      else if(id==='roehre') KOMFORT.umschalten('roehre');
      else if(id==='schwer') wechsleSchwierigkeit(r||1);
      else return false;
    }catch(e){ return false; }
    ton(r<0?440:660); neuAufbauen(); return true;
  }
  function aktiviere(i){
    const e=Z.liste[i]; if(!e||e.typ==='info') return;
    if(Z.t<START_TUNE.SPERRE) return;
    Z.sel=i;
    switch(e.id){
      case 'neu':
        if(MENUE.fortschritt().kapitel>=2){ ton(330); modusSetze('neuSicher'); }
        else startNeu();
        break;
      case 'neuJa': startNeu(); break;
      case 'weiter': ton(660); gehe(e.ziel); break;
      case 'level': ton(520); modusSetze('level'); break;
      case 'einst': ton(520); modusSetze('einst'); break;
      case 'enden': ton(520); MENUE.galerie(); break;
      case 'ueber': gehe('ueber.html'); break;
      case 'abbrechen': case 'zurueck': ton(400); modusSetze('haupt'); break;
      case 'hinweisWeiter': try{ KOMFORT.setze('hinweis',true); }catch(er){} ton(660); modusSetze('haupt'); break;
      case 'hinweisRuhig':
        try{ KOMFORT.setze('flackerschutz',true); KOMFORT.setze('hinweis',true); }catch(er){}
        ton(660); modusSetze('haupt'); break;
      default:
        if(e.level){ ton(660); gehe(MENUE.seiteVon(e.level)); }
        else wechsle(e.id,1);
    }
  }
  function zurueckTaste(){
    if(Z.modus==='level'||Z.modus==='einst'||Z.modus==='neuSicher'){ ton(400); modusSetze('haupt'); }
  }

  /* ---- Schnittstelle fuer kern.js und mobil.js ---- */
  MENUE.aktiv=function(){ return !!Z.aktiv; };
  MENUE.mobilKontext=function(){
    return { aktion:Z.modus==='hinweis'?'WEITER':'WAEHLEN', zwei:null, block:false, extras:[] };
  };
  MENUE.pruefe=function(){
    if(Z.aktiv) return true;
    if(Z.zu||Z.fehler) return false;
    try{
      if(typeof S==='undefined'||!S||S.modus!=='titel') return false;
      Z.aktiv=true; Z.t=0; modusSetze(MENUE.startModus());
      return true;
    }catch(e){ aufgeben(); return false; }
  };
  MENUE.laufe=function(dt){
    try{
      if(!MENUE.pruefe()) return false;
      Z.t+=dt; MENUE.zeichne(); return true;
    }catch(e){ aufgeben(); return false; }
  };

  /* ---- Zeichnen ---- */
  function umbruch(txt,maxB){
    const zl=[]; let z='';
    String(txt).split(' ').forEach(function(w){
      const t=z?z+' '+w:w;
      if(textW(t)>maxB&&z){ zl.push(z); z=w; } else z=t;
    });
    if(z) zl.push(z); return zl;
  }
  function massstab(){
    try{ const b=cv.getBoundingClientRect(); if(b.width>0) return b.width/W; }catch(e){}
    return 2;
  }
  /* Geometrie: Liste zwischen yOben und yUnten, Flaechen mindestens 44 px hoch am Handy. */
  function geometrie(yOben,yUnten){
    const touch=typeof IS_TOUCH!=='undefined'&&IS_TOUCH, s=massstab();
    const pitch=touch?Math.max(14,Math.ceil(START_TUNE.TOUCH_PX/s)+2):14;
    const vis=Math.max(1,Math.floor((yUnten-yOben)/pitch));
    const bw=Math.min(START_TUNE.BREITE,W-120), bx=Math.round((W-bw)/2);
    return { pitch:pitch, vis:vis, bw:bw, bx:bx, yOben:yOben, yUnten:yUnten, s:s, h:pitch-(touch?2:3) };
  }
  function pfeil(x,y,runter,col){
    ctx.fillStyle=col;
    for(let r=0;r<3;r++){ const w=runter?5-r*2:1+r*2; ctx.fillRect(x+(5-w)/2,y+r,w,1); }
  }
  function zeichneListe(yOben){
    const touch=typeof IS_TOUCH!=='undefined'&&IS_TOUCH;
    const g=Z.geo=geometrie(yOben,touch?H-3:H-16);
    const n=Z.liste.length;
    if(Z.sel<Z.off) Z.off=Z.sel;
    if(Z.sel>=Z.off+g.vis) Z.off=Z.sel-g.vis+1;
    Z.off=Math.max(0,Math.min(Math.max(0,n-g.vis),Z.off));
    Z.hits=[];
    const blink=Math.floor(Z.t*3)%2===0;
    for(let k=0;k<g.vis&&Z.off+k<n;k++){
      const i=Z.off+k, e=Z.liste[i], y=g.yOben+k*g.pitch, wahl=(i===Z.sel)&&e.typ!=='info';
      if(e.typ==='info'){
        textC(e.txt,y+Math.round((g.h-5)/2),P.dunkel); continue;
      }
      ctx.fillStyle=wahl?P.wahl:P.feld; ctx.fillRect(g.bx,y,g.bw,g.h);
      if(wahl){ ctx.fillStyle=P.neon; ctx.fillRect(g.bx,y,1,g.h); ctx.fillRect(g.bx+g.bw-1,y,1,g.h);
                ctx.fillRect(g.bx,y,g.bw,1); ctx.fillRect(g.bx,y+g.h-1,g.bw,1); }
      const ty=y+Math.round((g.h-5)/2);
      const col=wahl?P.weiss:(e.id==='weiter'?P.gold:P.dim);
      if(e.wert!==undefined){
        text(e.txt,g.bx+7,ty,col);
        const vc=e.wert==='AUS'?P.dunkel:(e.id==='schwer'?(e.wert==='HART'?P.rot:e.wert==='LOCKER'?P.gruen:P.gold):P.gruen);
        text(e.wert,g.bx+g.bw-7-textW(e.wert),ty,wahl?P.gold:vc);
        if(wahl&&blink) text('<',g.bx+g.bw-7-textW(e.wert)-8,ty,P.gold);
      } else {
        const tw=textW(e.txt), maxB=g.bw-8;
        text(e.txt,g.bx+Math.round((g.bw-Math.min(tw,maxB))/2),ty,col);
      }
      Z.hits.push({ i:i, x:g.bx, y:y, w:g.bw, h:g.h });
    }
    if(Z.off>0) pfeil(g.bx+g.bw+4,g.yOben,false,P.dim);
    if(Z.off+g.vis<n) pfeil(g.bx+g.bw+4,g.yOben+g.vis*g.pitch-4,true,P.dim);
  }
  function hintergrund(){
    ctx.fillStyle=P.ink; ctx.fillRect(0,0,W,H);
    for(let i=0;i<46;i++){ ctx.fillStyle=i%7===0?'#2a2440':'#15121f'; ctx.fillRect((i*79)%W,(i*53)%H,1,1); }
  }
  function logo(kompakt){
    ctx.globalAlpha=.8+.2*Math.sin(Z.t*2);
    if(kompakt) textGlowC('NACHTSCHICHT',5,P.neon,2); else textGlowC('NACHTSCHICHT',12,P.neon,3);
    ctx.globalAlpha=1;
  }
  function aufheller(){
    /* Ein seltener, weicher Aufheller - Staerke immer ueber FX (Flackerschutz). */
    if(Z.modus==='hinweis') return;
    const ph=Z.t%START_TUNE.BLITZ_ALLE;
    if(Z.t>2&&ph<START_TUNE.BLITZ_DAUER){
      const a=FX.blitz(.22*(1-ph/START_TUNE.BLITZ_DAUER));
      if(a>0){ ctx.globalAlpha=a; ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H); ctx.globalAlpha=1; }
    }
  }
  const TITEL={ level:'LEVEL WAEHLEN', einst:'EINSTELLUNGEN', neuSicher:'NEUE NACHT?' };

  MENUE.zeichne=function(){
    hintergrund();
    const touch=typeof IS_TOUCH!=='undefined'&&IS_TOUCH;
    const kompakt=touch&&!hoch();
    logo(kompakt);
    const schmal=mobilAn()&&!hoch();
    if(Z.modus==='hinweis'){
      let y=kompakt?19:34;
      textC('INHALTSHINWEIS',y,P.gold); y+=10;
      const zeilen=['DIE NACHT HANDELT VON EINER PARTY MIT ALKOHOL.','NICHTS DAVON IST ZUM NACHMACHEN.',
                    'ES GIBT BLITZE UND FLACKERNDES LICHT.','ABSCHALTEN: EINSTELLUNGEN, FLACKERSCHUTZ.'];
      zeilen.forEach(function(a){
        umbruch(a,schmal?176:Math.min(W-40,236)).forEach(function(z){ textC(z,y,P.weiss); y+=8; });
        y+=1;
      });
      zeichneListe(y+4);
    } else {
      const y=kompakt?19:30;
      if(Z.modus==='haupt') textC('PARTY GAME DRUNK',y,P.dim);
      else textC(TITEL[Z.modus]||'',y,P.gold);
      if(Z.modus==='neuSicher'&&!kompakt){
        textC('DEIN STAND VON LEVEL '+MENUE.fortschritt().kapitel+' GEHT VERLOREN.',40,P.weiss);
        textC('ENDEN UND BESTZEITEN BLEIBEN.',49,P.dim);
        zeichneListe(62);
      } else if(Z.modus==='neuSicher'){
        textC('STAND VON LEVEL '+MENUE.fortschritt().kapitel+' GEHT VERLOREN',27,P.weiss);
        zeichneListe(36);
      } else zeichneListe(kompakt?30:46);
    }
    if(!touch){
      const f='PFEILE: WAEHLEN   E: OK   ESC: ZURUECK';
      text(f,Math.round((W-textW(f))/2),H-9,P.dunkel);
    }
    aufheller();
  };

  /* ---- Eingabe: Tasten (Capture, damit das Level nichts davon sieht) ---- */
  const DURCH=function(e){
    /* Browser-Kuerzel, Ton, Vollbild und die Ziffern-Sprungmarken bleiben unberuehrt. */
    return e.ctrlKey||e.metaKey||e.altKey||/^F\d+$/.test(e.code)||e.code==='KeyM'||e.code==='KeyF'
      ||/^(Digit|Numpad)\d$/.test(e.code);
  };
  addEventListener('keydown',function(e){
    if(!Z.aktiv||gal()||DURCH(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    try{
      const c=e.code, e0=Z.liste[Z.sel]||{};
      if(c==='ArrowUp'||c==='KeyW'){ Z.sel=MENUE.naechste(Z.liste,Z.sel,-1); ton(440,.03); }
      else if(c==='ArrowDown'||c==='KeyS'){ Z.sel=MENUE.naechste(Z.liste,Z.sel,1); ton(440,.03); }
      else if(c==='ArrowLeft'||c==='KeyA'){
        if(Z.modus==='einst') wechsle(e0.id,-1);
        else if(Z.modus==='hinweis'||Z.modus==='neuSicher'){ Z.sel=MENUE.naechste(Z.liste,Z.sel,-1); ton(440,.03); } }
      else if(c==='ArrowRight'||c==='KeyD'){
        if(Z.modus==='einst') wechsle(e0.id,1);
        else if(Z.modus==='hinweis'||Z.modus==='neuSicher'){ Z.sel=MENUE.naechste(Z.liste,Z.sel,1); ton(440,.03); } }
      else if(c==='Enter'||c==='KeyE'||c==='Space'||c==='NumpadEnter'){ if(!e.repeat) aktiviere(Z.sel); }
      else if(c==='Escape'||c==='Backspace'){ zurueckTaste(); }
      else if(c==='KeyG'&&Z.modus==='haupt'){ MENUE.galerie(); }
      else if(c==='KeyU'&&Z.modus==='haupt'){ gehe('ueber.html'); }
    }catch(err){ aufgeben(); }
  },true);
  addEventListener('keyup',function(e){
    if(!Z.aktiv||gal()||DURCH(e)) return;
    e.preventDefault(); e.stopImmediatePropagation();
  },true);

  /* ---- Eingabe: Maus und Finger ---- */
  function lage(e){
    const b=cv.getBoundingClientRect(); if(!b.width) return null;
    return { x:(e.clientX-b.left)/b.width*W, y:(e.clientY-b.top)/b.height*H };
  }
  function treffer(p){
    for(let k=0;k<Z.hits.length;k++){ const h=Z.hits[k];
      if(p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h) return h; }
    return null;
  }
  const grenze=function(){ return Z.geo?Math.max(0,Z.liste.length-Z.geo.vis):0; };
  addEventListener('pointerdown',function(e){
    try{
      if(!Z.aktiv||gal()||!Z.geo) return;
      /* Knoepfe des Handy-Bedienfelds, das Handy-Menue und Links behalten ihre Beruehrung. */
      if(e.target&&e.target.closest&&e.target.closest('button,a,.mtaste,#mblatt,#mtalk')) return;
      const p=lage(e); if(!p||p.x<0||p.y<0||p.x>W||p.y>H) return;
      const g=Z.geo, h=treffer(p);
      const inListe=p.x>=g.bx&&p.x<=g.bx+g.bw&&p.y>=g.yOben&&p.y<=g.yUnten;
      /* Hochkant gehoert das ganze Bild dem Menue (dort wuerde sonst ein Tippen Enter schicken). */
      if(!h&&!inListe&&!hoch()) return;
      e.preventDefault(); e.stopPropagation();
      Z.zeiger={ id:e.pointerId, y0:e.clientY, off0:Z.off, i:h?h.i:-1, gezogen:false };
      if(h&&Z.liste[h.i].typ!=='info') Z.sel=h.i;
    }catch(err){ aufgeben(); }
  },true);
  addEventListener('pointermove',function(e){
    try{
      if(!Z.aktiv||gal()||!Z.geo) return;
      const q=Z.zeiger;
      if(q&&q.id===e.pointerId){
        const dy=e.clientY-q.y0;
        if(Math.abs(dy)>START_TUNE.ZIEHEN_PX) q.gezogen=true;
        if(q.gezogen){
          e.preventDefault();
          const stufe=Z.geo.pitch*Z.geo.s;
          Z.off=Math.max(0,Math.min(grenze(),q.off0-Math.round(dy/stufe)));
        }
        return;
      }
      if(e.pointerType==='mouse'&&!e.buttons){   // nur Mauszeiger: Ueberfahren waehlt vor
        const p=lage(e), h=p&&treffer(p);
        if(h&&Z.liste[h.i].typ!=='info') Z.sel=h.i;
      }
    }catch(err){ aufgeben(); }
  },true);
  addEventListener('pointerup',function(e){
    try{
      const q=Z.zeiger; if(!Z.aktiv||!q||q.id!==e.pointerId) return;
      Z.zeiger=null; e.preventDefault(); e.stopPropagation();
      if(q.gezogen||q.i<0) return;
      const p=lage(e), h=p&&treffer(p);
      if(h&&h.i===q.i) aktiviere(q.i);
    }catch(err){ aufgeben(); }
  },true);
  addEventListener('pointercancel',function(e){ if(Z.zeiger&&Z.zeiger.id===e.pointerId) Z.zeiger=null; },true);
  addEventListener('wheel',function(e){
    try{
      if(!Z.aktiv||gal()) return;
      e.preventDefault();
      Z.sel=MENUE.naechste(Z.liste,Z.sel,e.deltaY>0?1:-1);
    }catch(err){}
  },{capture:true,passive:false});
  addEventListener('blur',function(){ Z.zeiger=null; });
})();
