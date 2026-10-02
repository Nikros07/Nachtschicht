/* ============================================================================
   NACHTSCHICHT - ENGINE: komfort
   Die Einstellungen des Spielers, die nichts mit Touch zu tun haben, und die
   Schutzschalter fuer Effekte (Blitze, Wackeln, Roehren-Look).

   Warum eine eigene Datei: das Spiel hat ein Stroboskop (Level 5), weisse Blitze
   bei Treffern, Bildschirmwackeln und im Traum eine Verzerrung. Wer empfindlich
   auf Flackern reagiert, muss das abschalten koennen - und zwar an EINER Stelle,
   nicht in jedem Level extra. Jedes Level laesst Effektstaerken durch FX laufen:

     FX.blitz(alpha)   Helligkeit eines Blitzes/Aufhellers   (Flackerschutz: stark gedaempft)
     FX.wackel(px)     Staerke des Bildschirmwackelns in Pixeln
     FX.hz(f)          Blitzfrequenz in Hertz - nie mehr als drei pro Sekunde (WCAG 2.3.1)
     FX.ruhig()        true, wenn der Flackerschutz an ist

   Gespeichert wird in localStorage unter 'nachtschicht.komfort'. Die Touch-
   Einstellungen (Linkshaender, Knopfgroesse ...) liegen getrennt in mobil.js.
   Fehlt der Speicher (privates Fenster), laeuft alles mit den Standardwerten.

   Klassisches Script, kein ES-Modul.
   ========================================================================== */

const KOMFORT_KEY='nachtschicht.komfort';
const KOMFORT_STANDARD={
  flackerschutz:false,  // Stroboskop und Blitze stark daempfen
  wackeln:true,         // Bildschirmwackeln bei Treffern
  roehre:true,          // Scanlines und Vignette ueber dem Bild (#crt)
  hinweis:false,        // Inhaltshinweis beim ersten Start bestaetigt
};

const KOMFORT=(()=>{
  let werte={...KOMFORT_STANDARD};
  const hoerer=[];

  /* Wer im Betriebssystem "Bewegung reduzieren" eingestellt hat, bekommt den
     Flackerschutz als Voreinstellung - aber nur, solange er nie selbst gewaehlt hat. */
  const systemWunschReduziert=()=>{
    try{ const m=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)');
      return !!m&&m.matches===true; }catch(e){ return false; }
  };

  function anwenden(){
    try{ const c=document.getElementById('crt'); if(c) c.style.display=werte.roehre?'':'none'; }catch(e){}
  }
  function sichern(){ try{ localStorage.setItem(KOMFORT_KEY,JSON.stringify(werte)); }catch(e){} }
  function laden(){
    let s={};
    try{ const roh=JSON.parse(localStorage.getItem(KOMFORT_KEY)); if(roh&&typeof roh==='object') s=roh; }catch(e){ s={}; }
    werte={...KOMFORT_STANDARD,...s};
    if(!('flackerschutz' in s)&&systemWunschReduziert()) werte.flackerschutz=true;
    anwenden();
  }
  laden();

  return {
    standard:KOMFORT_STANDARD,
    hole:k=>werte[k],
    alle:()=>({...werte}),
    setze(k,v){
      if(!(k in KOMFORT_STANDARD)) return;
      werte[k]=v; sichern(); anwenden();
      hoerer.forEach(f=>{ try{ f(k,v); }catch(e){} });
    },
    umschalten(k){ this.setze(k,!werte[k]); return werte[k]; },
    beiAenderung:f=>hoerer.push(f),
    laden,
  };
})();

const FX={
  /* Bei Flackerschutz nur ein Viertel der Helligkeit, nie ueber 0.12 */
  blitz:a=>KOMFORT.hole('flackerschutz')?Math.min(a*0.25,0.12):a,
  wackel:px=>{
    if(!KOMFORT.hole('wackeln')) return 0;
    return KOMFORT.hole('flackerschutz')?px*0.5:px;
  },
  hz:f=>KOMFORT.hole('flackerschutz')?Math.min(f,2):Math.min(f,3),
  ruhig:()=>!!KOMFORT.hole('flackerschutz'),
};
