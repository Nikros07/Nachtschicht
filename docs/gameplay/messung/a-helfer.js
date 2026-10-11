/* Messkoffer A - gemeinsame Hilfen fuer die Monotonie-Messung (Level 1-3).
   Start immer aus der Projektwurzel:  node docs/gameplay/messung/a-level1.js

   Was hier passiert:
   - laedt eine Seite ueber tools/nachttest.js (Engine + Level in einer Funktion)
   - ersetzt den AudioContext durch eine Attrappe, die jeden Ton mitschreibt
     (Musik und Soundeffekte getrennt: musik() wird umwickelt)
   - schreibt jedes Bild einen Schnappschuss und leitet daraus Ereignisse ab
     (Moduswechsel, Meldungen, Hinweise, Gespraechsknoten, Plausch, Karten,
     Treffer, Wackeln, Blitz) - plus levelspezifische Ereignisse
   - wertet aus: laengste Strecke ohne neues Ereignis, Verben, Rueckmeldung

   Aendert keine Spieldatei. */
const path=require('path');
const N=require(path.resolve('tools/nachttest.js'));

const DT=1/60;

function ladeLevel(seite,{saat=0,abfrage='?lektion=0'}={}){
  const L=N.lade(seite,abfrage);
  const E=c=>L.api.ev(c);
  /* andere Zufallsfolge: rng einige Male weiterdrehen; starte() wuerfelt neu */
  for(let i=0;i<saat*7;i++) L.rng();
  /* Ton-Attrappe. ton/glissando/rauschen/musik sind Funktionsdeklarationen und
     lassen sich deshalb neu binden; piep (const) ruft ton() beim Namen. */
  E(`window.TONLOG=[]; window.SIMZEIT=0; window.INMUSIK=false;
    AC={ get currentTime(){ return window.SIMZEIT; }, sampleRate:200, destination:{},
      createOscillator(){ return {type:'',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},start(){},stop(){}}; },
      createGain(){ return {gain:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}; },
      createBuffer(c,n){ return {getChannelData:()=>new Float32Array(Math.max(1,n|0))}; },
      createBufferSource(){ return {connect(){},start(){}}; } };
    MUS.next=0; MUS.step=0;
    ton=function(f,w,d,ty,v){ window.TONLOG.push({art:'ton',f:f,w:w,d:d,ty:ty||'square',v:v,mus:window.INMUSIK,t:window.SIMZEIT}); };
    glissando=function(f1,f2,d,ty,v){ window.TONLOG.push({art:'gliss',f:f1,f2:f2,d:d,mus:window.INMUSIK,t:window.SIMZEIT}); };
    rauschen=function(d,v){ window.TONLOG.push({art:'rausch',d:d,mus:window.INMUSIK,t:window.SIMZEIT}); };
    if(typeof rauschenKurz==='function'){ rauschenKurz=function(w){ window.TONLOG.push({art:'rausch',d:.02,mus:window.INMUSIK,t:window.SIMZEIT,w:w}); }; }
    { const _m=musik; musik=function(){ window.INMUSIK=true; try{ _m(); } finally { window.INMUSIK=false; } }; }
    0`);
  return {L,E,seite};
}

/* Ein Bild weiter: Uhr der Ton-Attrappe mitziehen */
function takt(E){ E('window.SIMZEIT+=1/60; update(1/60)'); }

/* Allgemeiner Schnappschuss - gilt fuer alle drei Level */
const SCHNAPP_ALLG=`({
  t:S.t, zeit:S.zeit, modus:S.modus,
  meldung:S.meldung||'', meldungT:S.meldungT||0, hinweis:S.hinweis||'', hinweisT:S.hinweisT||0,
  gespr:(typeof GESPR!=='undefined'&&GESPR)?GESPR.name:null,
  gesprWer:(typeof GESPR!=='undefined'&&GESPR&&GESPR.knoten)?(GESPR.knoten.wer||''):'',
  gesprText:(typeof GESPR!=='undefined'&&GESPR&&GESPR.knoten)?(GESPR.knoten.text||''):'',
  gesprWahlen:(typeof GESPR!=='undefined'&&GESPR)?GESPR.wahlen.map(w=>w.txt):[],
  plausch:PLAUSCH.jetzt?((PLAUSCH.jetzt.wer?PLAUSCH.jetzt.wer+': ':'')+PLAUSCH.jetzt.text):null,
  kapitel:KAPITEL.aktiv, moment:MOMENT_KARTE.aktiv,
  hp:S.hp, ruettel:S.ruettel||0, blitz:S.blitz||0, x:S.x
})`;

/* Rekorder: vergleicht Schnappschuesse und schreibt Ereignisse */
class Rekorder{
  constructor(E,extra){
    this.E=E; this.extra=extra||null; this.ev=[]; this.alt=null; this.altX=null; this.uhr=0;
    this.bilder=[];
  }
  log(typ,txt,klasse){ this.ev.push({t:+this.uhr.toFixed(3),typ,txt:String(txt),klasse}); }
  schritt(){
    const s=this.E(SCHNAPP_ALLG);
    const x=this.extra?this.E(this.extra):null;
    const a=this.alt;
    if(a){
      if(s.modus!==a.modus) this.log('modus',a.modus+' > '+s.modus,'modus');
      if(s.meldungT>a.meldungT+0.05||(s.meldung!==a.meldung&&s.meldungT>0)) this.log('meldung',s.meldung,klassifiziereMeldung(s.meldung));
      if(s.hinweisT>a.hinweisT+0.05||(s.hinweis!==a.hinweis&&s.hinweisT>0)) if(s.hinweis) this.log('hinweis',s.hinweis,'info');
      if(s.gespr!==a.gespr){
        if(s.gespr) this.log('gespraech',(s.gesprWer?s.gesprWer+': ':'')+s.gesprText.slice(0,60)+(s.gesprWahlen.length?'  [WAHL: '+s.gesprWahlen.join(' | ')+']':''),
          s.gesprWahlen.length?'entscheidung':'info');
        else this.log('gespraech','(Ende, Knoten '+a.gespr+')','modus');
      }
      if(s.plausch&&s.plausch!==a.plausch) this.log('plausch',s.plausch,'info');
      if(s.kapitel&&!a.kapitel) this.log('karte','Kapitelkarte','info');
      if(s.moment&&!a.moment) this.log('karte','Polaroid-Karte','info');
      if(typeof s.hp==='number'&&typeof a.hp==='number'&&s.hp<a.hp) this.log('treffer','HP '+a.hp+' > '+s.hp,'herausforderung');
      if(s.ruettel>a.ruettel+0.5) this.log('fx','Wackeln '+s.ruettel.toFixed(1),'fx');
      if(s.blitz>a.blitz+0.05) this.log('fx','Blitz '+s.blitz.toFixed(2),'fx');
    }
    if(x&&this.altX&&this.extraVergleich) this.extraVergleich(x,this.altX,s);
    this.alt=s; this.altX=x;
    this.uhr+=DT;
    return {s,x};
  }
}

/* Meldungen ohne neuen Inhalt: reine Quittung einer Eingabe */
const LEER_MELDUNGEN=/^(NICHTS DRIN|NICHTS|NUR KRAM|LEER|SCHON DURCHSUCHT|SCHON LEER|ETAGE \d|VERSTECKT|RAUS AUS DEM SPIND|HIER NICHT|NOCH \d+ SEKUNDEN|AUA|TASCHENLAMPE (AN|AUS)|GEWORFEN|TON (AN|AUS)|AUF EX|RUNTER DAMIT|NOCH EINEN|GEHT SO|DU SIEHST GUT AUS|HAST SCHON EINE|NICHT OHNE DIE JUNGS|ABGESCHLOSSEN|NUR ZEUG\.|ZU WEIT VORNE.*)$/;
function klassifiziereMeldung(m){ return LEER_MELDUNGEN.test(m||'')?'quittung':'info'; }

/* Laengste Strecken ohne "neues" Ereignis.
   klassen: welche Ereignisklassen als neu zaehlen. von/bis: Zeitfenster. */
function luecken(ev,{klassen=['info','entscheidung','herausforderung'],von=0,bis=Infinity,top=3}={}){
  const pkte=ev.filter(e=>klassen.includes(e.klasse)&&e.t>=von&&e.t<=bis);
  const zeiten=[von,...pkte.map(e=>e.t),bis];
  const out=[];
  for(let i=1;i<zeiten.length;i++){
    out.push({dauer:+(zeiten[i]-zeiten[i-1]).toFixed(1),von:+zeiten[i-1].toFixed(1),bis:+zeiten[i].toFixed(1),
      vorher:i>1?pkte[i-2].txt:'(Start)',nachher:i-1<pkte.length?pkte[i-1].txt:'(Ende)'});
  }
  return out.sort((a,b)=>b.dauer-a.dauer).slice(0,top);
}

/* Ton-Auswertung: Musik (Schleifenlaenge, Stimmen, Tonvorrat) und SFX je Minute */
function tonAuswertung(E,{von=0,bis=Infinity}={}){
  const log=E('window.TONLOG').filter(x=>x.t>=von&&x.t<=bis);
  const mus=log.filter(x=>x.mus), sfx=log.filter(x=>!x.mus);
  const musTon=mus.filter(x=>x.art==='ton');
  const tonvorrat=[...new Set(musTon.map(x=>Math.round(x.f)))].sort((a,b)=>a-b);
  const stimmen=[...new Set(musTon.map(x=>x.ty))];
  /* Periode der Notenfolge: kleinste p, bei der die Folge sich wiederholt */
  const folge=musTon.map(x=>Math.round(x.f)+x.ty[0]);
  let periode=null;
  for(let p=1;p<=Math.min(256,folge.length/3);p++){
    let ok=true; for(let i=p;i<Math.min(folge.length,p*6);i++) if(folge[i]!==folge[i-p]){ ok=false; break; }
    if(ok){ periode=p; break; }
  }
  const dauer=Math.max(1e-6,Math.min(bis,log.length?log[log.length-1].t:0)-von);
  const sfxArten={};
  for(const x of sfx){ const k=x.art+(x.art==='ton'?':'+Math.round(x.f):''); sfxArten[k]=(sfxArten[k]||0)+1; }
  return { musikNoten:musTon.length, musikRausch:mus.filter(x=>x.art==='rausch').length,
    tonvorrat, stimmen, periodeNoten:periode, sfxGesamt:sfx.length, sfxProMin:+(sfx.length/dauer*60).toFixed(1),
    sfxArten:Object.entries(sfxArten).sort((a,b)=>b[1]-a[1]).slice(0,12) };
}

/* Verben: jede Eingabe des Bots mit Absicht, Zeit und ob sie etwas bewirkt hat */
class Verben{
  constructor(){ this.liste=[]; this.halten={}; }
  druck(verb,t,wirkung){ this.liste.push({verb,t,wirkung:!!wirkung}); }
  halte(verb,dt){ this.halten[verb]=(this.halten[verb]||0)+dt; }
  zusammen(){
    const z={};
    for(const v of this.liste){ z[v.verb]=z[v.verb]||{n:0,mitWirkung:0}; z[v.verb].n++; if(v.wirkung) z[v.verb].mitWirkung++; }
    return { druecke:z, halten:Object.fromEntries(Object.entries(this.halten).map(([k,v])=>[k,+v.toFixed(1)])) };
  }
}

/* Tastendruck (runter + im naechsten Bild hoch passiert ueber loslassen()) */
function drueck(L,code){ L.taste(code,true); L.taste(code,false); }

/* Fingerabdruck fuer "hat die Eingabe etwas bewirkt" */
function fingerabdruck(s,x){ return JSON.stringify([s.modus,s.meldung,s.meldungT>0?Math.floor(s.meldungT*10):0,s.hinweis,s.gespr,s.hp,x]); }

const runde=(v,n=1)=>+(+v).toFixed(n);
function median(a){ if(!a.length) return null; const b=[...a].sort((x,y)=>x-y); const m=b.length>>1; return b.length%2?b[m]:(b[m-1]+b[m])/2; }
function mittel(a){ return a.length?a.reduce((p,c)=>p+c,0)/a.length:null; }

module.exports={N,DT,ladeLevel,takt,Rekorder,luecken,tonAuswertung,Verben,drueck,fingerabdruck,klassifiziereMeldung,runde,median,mittel,SCHNAPP_ALLG};
