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
