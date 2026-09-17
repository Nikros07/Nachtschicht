/* ============================================================================
   NACHTSCHICHT - ENGINE: kern
   Aufbau und Lauf: Canvas, Skalierung, Vollbild, Eingabe-Helfer, Schleife.

   Klassisches Script, absichtlich KEIN ES-Modul: Module sind bei file://
   vom Browser blockiert, und laut README soll ein Doppelklick auf
   index.html weiter reichen. Deshalb globale Deklarationen statt Export -
   der Level-Code benutzt W, H, ctx, text(), sprite() unveraendert weiter.

   Diese Datei muss als ERSTE geladen werden: sie legt cv, ctx, W und H an,
   auf die alle anderen Engine-Teile zugreifen.
   ========================================================================== */

/* ---- Canvas ---- */
const cv=document.getElementById('c');
/* ctx ist bewusst let: Level 6 zeichnet fuer den Verzerrungs-Effekt kurz
   in einen Zwischenpuffer und tauscht den Kontext dafuer aus. */
let ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
let W=320;            // waechst auf breiten Schirmen mit, siehe anpassen()
const H=180;          // bleibt fest, damit die Pixel stimmen

/* ---- Touch-Geraet? maxTouchPoints ist verlaesslicher als pointer:coarse.
   ?touch=1 erzwingt es, damit man es am Rechner testen kann. ---- */
const IS_TOUCH=navigator.maxTouchPoints>0||'ontouchstart' in window||/[?&]touch=1/.test(location.search);
if(IS_TOUCH) document.documentElement.classList.add('touch');

const imVollbild=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);

function anpassen(){
  const rand=(imVollbild()||IS_TOUCH)?0:46;
  const vw=innerWidth-rand, vh=innerHeight-rand;
  /* Breite waechst mit dem Bildschirm mit, damit auf langen Handys keine
     schwarzen Balken bleiben. Die Hoehe bleibt fest. */
  W=Math.max(320,Math.min(432,Math.round(H*(vw/vh)/2)*2));
  cv.width=W; ctx.imageSmoothingEnabled=false;
  const roh=Math.min(vw/W,vh/H);
  const s=roh<3?Math.max(.5,Math.floor(roh*4)/4):Math.floor(roh);
  cv.style.width=(W*s)+'px'; cv.style.height=(H*s)+'px';
}
addEventListener('resize',anpassen);
addEventListener('orientationchange',()=>setTimeout(anpassen,120));
['fullscreenchange','webkitfullscreenchange'].forEach(e=>document.addEventListener(e,()=>setTimeout(anpassen,60)));
anpassen();

function vollbild(){
  const root=document.getElementById('cab');
  if(imVollbild()){ (document.exitFullscreen||document.webkitExitFullscreen).call(document); return; }
  const req=root.requestFullscreen||root.webkitRequestFullscreen; if(!req) return;
  Promise.resolve(req.call(root)).then(()=>{
    if(screen.orientation&&screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
  }).catch(()=>{});
}

/* ---- Eingabe-Helfer ---- */
const keys={};
const el=id=>document.getElementById(id);
const bind=(id,evs,fn)=>{ const e=el(id); if(!e) return;
  evs.forEach(ev=>e.addEventListener(ev,ev2=>{ev2.preventDefault();fn();},{passive:false})); };

/* Vollbild-Knopf, Vollbild-Ausstieg am Handy, und die erste Beruehrung
   schaltet ins Vollbild. In jedem Level gleich - deshalb hier. */
const fsKnopf=el('fs');
if(fsKnopf) fsKnopf.addEventListener('click',e=>{e.preventDefault();vollbild();});
bind('texit',['touchstart','mousedown'],()=>{ if(imVollbild()) vollbild(); });
if(IS_TOUCH) addEventListener('touchstart',function einmal(){ vollbild();
  removeEventListener('touchstart',einmal); },{once:true});

/* ---- Schleife. update(dt) und draw(dt) kommen aus dem Level. ---- */
let letzte=performance.now();
function bild(jetzt){
  const dt=Math.min(.05,(jetzt-letzte)/1000); letzte=jetzt;
  update(dt); draw(dt);
  requestAnimationFrame(bild);
}
function starteSchleife(){ letzte=performance.now(); requestAnimationFrame(bild); }
