/* ============================================================================
   NACHTSCHICHT - ENGINE: eingabe
   Die Tasten, die in JEDEM Level dasselbe tun.

   Bisher standen sie neunmal da: die Antwortauswahl im Gespraech, Ton,
   Vollbild, Pause und die Sprungmarken zu anderen Leveln. Neun Kopien
   heisst neun Stellen, an denen eine neue Taste vergessen wird.

   Was hier liegt:
     LINKS/RECHTS/HOCH/RUNTER  waehlen im Gespraech die Antwort
     M   Ton an und aus
     F   Vollbild
     P   Pause - das Level sagt selbst, was das heisst (pauseTaste)
     1-8 auf dem Titelbild: direkt zu diesem Level. Die Liste kommt aus
         der Levelleiste unter dem Bild, steht also nur einmal pro Seite.

   Solange ein Gespraech laeuft, werden die Richtungstasten hier verbraucht
   (stopImmediatePropagation) - das Level bekommt sie gar nicht erst und
   muss sich nicht darum kuemmern, dass man beim Antworten losrennt.

   Einbau: nach ton.js und dialog.js laden, VOR dem Level-Script.
   ========================================================================== */

const GESPR_LINKS =['ArrowLeft','KeyA','ArrowUp','KeyW'];
const GESPR_RECHTS=['ArrowRight','KeyD','ArrowDown','KeyS'];

/* Die Level dieser Sammlung, aus der Leiste unter dem Bild gelesen. */
function levelSeiten(){
  const leiste=document.getElementById('levelbar');
  if(!leiste) return [];
  return [].map.call(leiste.querySelectorAll('a'),a=>a.getAttribute('href'));
}

addEventListener('keydown',e=>{
  if(e.repeat) return;

  /* Im Gespraech gehoeren die Richtungstasten der Antwortauswahl. */
  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){
    if(GESPR_LINKS.includes(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); gespraechWaehle(-1); return; }
    if(GESPR_RECHTS.includes(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); gespraechWaehle(1); return; }
  }

  if(e.code==='KeyM'){ muted=!muted; if(!muted) ensureAudio(); return; }
  if(e.code==='KeyF'){ e.preventDefault(); vollbild(); return; }
  if(e.code==='KeyP'){ if(typeof pauseTaste==='function') pauseTaste(); return; }

  /* Sprungmarken - nur auf dem Titelbild, sonst waere es ein Ausrutscher
     mitten im Spiel. */
  const m=e.code.match(/^(?:Digit|Numpad)([1-8])$/);
  if(m&&typeof S!=='undefined'&&S&&(S.modus==='titel'||S.mode==='attract')){
    const seiten=levelSeiten(), ziel=seiten[+m[1]-1];
    if(ziel){ e.preventDefault(); location.href=ziel; }
  }
});
