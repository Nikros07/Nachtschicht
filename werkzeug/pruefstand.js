/* ============================================================================
   PRUEFSTAND

   Laedt ein Level-HTML in einen kopflosen Nachbau von Browser, Canvas und
   Audio - gerade so viel, wie das Spiel anfasst. Damit laesst sich die
   Spiellogik ohne Browser fahren: Kaempfe simulieren, Zufallseingaben
   draufwerfen, Zahlen nachrechnen.

   Kein npm, keine Abhaengigkeiten. Nur node.

     node werkzeug/kampfbalance.js
     node werkzeug/leveltest.js

   Grenze: gezeichnet wird nichts. Der Canvas schluckt alles kommentarlos.
   Wie es aussieht, muss weiterhin ein Mensch im Browser beurteilen.
   ========================================================================== */
const fs=require('fs'), path=require('path'), vm=require('vm');

function malflaeche(){
  const verlauf={ addColorStop(){} };
  return {
    imageSmoothingEnabled:true, fillStyle:'#000', globalAlpha:1,
    fillRect(){}, clearRect(){}, drawImage(){}, save(){}, restore(){},
    translate(){}, scale(){}, setTransform(){}, beginPath(){}, closePath(){},
    moveTo(){}, lineTo(){}, stroke(){}, fill(){}, rect(){}, clip(){}, arc(){},
    getImageData(){ return {data:[]}; }, putImageData(){},
    createLinearGradient(){ return verlauf; },
    createRadialGradient(){ return verlauf; }, createPattern(){ return null; },
  };
}
function element(id){
  return { id, style:{}, classList:{ add(){},remove(){},toggle(){} },
    width:320, height:180, textContent:'',
    addEventListener(){}, removeEventListener(){}, appendChild(){},
    getContext:()=>malflaeche(),
    requestFullscreen:()=>Promise.resolve(),
    getBoundingClientRect:()=>({left:0,top:0,width:320,height:180}) };
}

/* Laedt <script> aus einer HTML-Datei und gibt einen Zugriff darauf zurueck.
   Wichtig: top-level let/const landen NICHT auf globalThis, deshalb geht
   alles ueber ev('...') statt ueber Punktzugriff. */
function lade(htmlDatei){
  const html=fs.readFileSync(htmlDatei,'utf8');
  const treffer=html.match(/<script>([\s\S]*)<\/script>/);
  if(!treffer) throw new Error('kein <script> in '+htmlDatei);

  const speicher={}, horcher={};
  const sand={
    console, Math, JSON, Date,
    document:{
      getElementById:element, createElement:()=>element('neu'),
      documentElement:{ classList:{ add(){},remove(){} } }, body:element('body'),
      addEventListener(t,f){ (horcher[t]=horcher[t]||[]).push(f); },
      fullscreenElement:null, webkitFullscreenElement:null,
    },
    navigator:{ maxTouchPoints:0 },
    location:{ search:'', href:'' },
    localStorage:{ getItem:k=>k in speicher?speicher[k]:null,
      setItem:(k,v)=>{ speicher[k]=String(v); }, removeItem:k=>{ delete speicher[k]; } },
    performance:{ now:()=>0 },
    requestAnimationFrame:()=>0,
    addEventListener(t,f){ (horcher[t]=horcher[t]||[]).push(f); },
    innerWidth:1280, innerHeight:800,
    setTimeout:()=>0, clearTimeout(){},
    AudioContext:undefined, webkitAudioContext:undefined,   // ohne Ton
  };
  sand.window=sand; sand.globalThis=sand;
  const raum=vm.createContext(sand);
  vm.runInContext(treffer[1],raum,{ filename:htmlDatei });

  return {
    ev:code=>vm.runInContext(code,raum),
    taste(code,runter=true){
      for(const f of (horcher[runter?'keydown':'keyup']||[]))
        f({ code, key:code, preventDefault(){}, repeat:false });
    },
    speicher,
  };
}

const levelPfad=n=>path.join(__dirname,'..',n===1?'index.html':'level'+n+'.html');
module.exports={ lade, levelPfad };
