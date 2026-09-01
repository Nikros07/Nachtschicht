/* ==========================================================================
   KOPFLOSER TESTLAUF

   Laedt das Spiel aus der HTML-Datei in einen nachgebauten Browser: DOM und
   Canvas werden nur soweit gestellt, wie das Spiel sie anfasst. Danach laesst
   sich die Schleife von Hand takten, Tasten druecken und der Zustand pruefen -
   ohne Browser, ohne Installation, nur mit Node.

   Gezeichnet wird trotzdem: alle Zeichenaufrufe laufen in einen leeren
   Kontext. Das faengt keine haesslichen Bilder, aber jeden Absturz im
   Zeichenpfad - und der ist bei einem Spiel, das jede Zeile pro Bild
   ausfuehrt, die haeufigste Art kaputtzugehen.

   Benutzung:  const spiel = lade('level2.html');
               spiel.takt(60);            // eine Sekunde
               spiel.druck();             // E
               spiel.S().modus
   ========================================================================== */
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const WURZEL=path.join(__dirname,'..');

/* Alles, was die drei HTML-Dateien am Kontext aufrufen. Zu ergaenzen, sobald
   eine neue Zeichenfunktion dazukommt - fehlt eine, faellt der Test mit
   "is not a function" um und sagt genau welche. */
const MALEREI=['arc','beginPath','clearRect','clip','closePath','drawImage',
  'fill','fillRect','fillText','lineTo','moveTo','rect','restore','rotate',
  'save','scale','setTransform','stroke','strokeRect','translate'];
function malKontext(){
  const c={}, nichts=()=>{};
  for(const k of MALEREI) c[k]=nichts;
  c.createRadialGradient=()=>({addColorStop:nichts});
  c.createLinearGradient=()=>({addColorStop:nichts});
  return c;
}
const malFlaeche=(w,h)=>({ width:w||1, height:h||1, style:{},
  getContext:malKontext, addEventListener:()=>{} });

function lade(datei,extra=[]){
  const quelle=fs.readFileSync(path.join(WURZEL,datei),'utf8');
  const treffer=quelle.match(/<script>([\s\S]*)<\/script>/);
  if(!treffer) throw new Error(datei+': kein <script>-Block gefunden');

  const speicher={};
  const fenster={
    innerWidth:1280, innerHeight:720,
    localStorage:{ getItem:k=>k in speicher?speicher[k]:null,
      setItem:(k,v)=>{ speicher[k]=String(v); },
      removeItem:k=>{ delete speicher[k]; } },
  };
  const dokument={
    documentElement:{ classList:{ add:()=>{} } },
    createElement:t=>t==='canvas'?malFlaeche():{ style:{}, addEventListener:()=>{} },
    getElementById:()=>Object.assign(malFlaeche(320,180),
      { addEventListener:()=>{}, classList:{add:()=>{}}, requestFullscreen:null }),
    addEventListener:()=>{},
  };
  const kiste={
    document:dokument, window:fenster,
    navigator:{ maxTouchPoints:0 }, location:{ search:'', href:'' },
    localStorage:fenster.localStorage, screen:{},
    innerWidth:fenster.innerWidth, innerHeight:fenster.innerHeight,
    addEventListener:()=>{}, removeEventListener:()=>{},
    requestAnimationFrame:()=>0, performance:{ now:()=>0 },
    setTimeout:()=>0, clearTimeout:()=>{},
    Math, console, JSON, Date,
    AudioContext:undefined, webkitAudioContext:undefined,
  };
  const ktx=vm.createContext(kiste);

  /* Alles, was der Test anfassen darf, wird namentlich herausgereicht.
     typeof-Schutz, weil nicht jedes Level jeden Namen kennt. */
  const raus=extra.map(n=>`${n}:(typeof ${n}!=='undefined'?${n}:undefined)`).join(',');
  vm.runInContext(treffer[1]+`
;globalThis.__spiel={
  S:()=>S, setzeS:v=>{ S=v; },
  druck:()=>{ if(typeof aktionPuffer!=='undefined') aktionPuffer.push(S.t); },
  sprung:()=>{ if(typeof sprungPuffer!=='undefined') sprungPuffer.push(S.t); },
  links:v=>{ linksAn=v; }, rechts:v=>{ rechtsAn=v; },
  sprungAn:v=>{ sprungAn=v; }, aktionAn:v=>{ aktionGehalten=v; },
  ${raus} };`, ktx, { filename:datei });

  const spiel=kiste.__spiel;
  spiel.speicher=speicher;
  spiel.dt=1/60;
  /* Ein Bild: erst rechnen, dann zeichnen - wie in der echten Schleife */
  spiel.takt=(bilder=1,vorher)=>{
    for(let i=0;i<bilder;i++){
      if(vorher) vorher(spiel.S(),i);
      spiel.update(spiel.dt); spiel.draw(spiel.dt);
    }
  };
  spiel.sekunden=(s,vorher)=>spiel.takt(Math.round(s*60),vorher);
  return spiel;
}

module.exports={ lade };
