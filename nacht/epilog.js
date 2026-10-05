/* ============================================================================
   NACHTSCHICHT - ENGINE: epilog
   Was nach dem Finale kommt: Epilog-Folien je Crew-Figur, Gruppenchat, Album,
   "Was wir nie wieder erwaehnen", Kater, die Wolle mit den drei Knoten und die
   Verwaltung der zehn Enden (fuer die Galerie in menue.js).

   Alle Funktionen kennen das Level nicht: level8.html uebergibt
     p={weg:'heim|weiter|sonne', kampf:'gewonnen|verloren|frieden', anfuehrer:'MARVIN'|'DER ANFUEHRER'}
   und bekommt Karten {d, txt} zurueck ('|' = Zeilenumbruch, siehe zeichneKarte).

   EPILOG ist der Austausch-Ort: hier stehen die Texte, die spaeter durch die
   echten Plaene der echten Freunde ersetzt werden. Die ERSTE zutreffende Zeile
   gilt. Texte: Grossbuchstaben ohne Umlaute, Zeilen hoechstens 44 Zeichen.

   Alles fehlertolerant: fehlt ein Wert, kommt eine Karte weniger, keine Ausnahme.
   Klassisches Script, kein ES-Modul. Braucht: nacht.js, stand.js (ladeCrew).
   ========================================================================== */

const EPILOG_TUNE={
  FOLIE_DAUER:2.6, KARTE_DAUER:2.6, CHAT_KOPF:2.0, CHAT_PAAR:3.2, WOLLE_DAUER:4.0,
  FOLIEN_MAX:7,            // hoechstens so viele Epilog-Folien
  CHAT_MAX:6,              // hoechstens so viele Chatzeilen
  NIEWIEDER_MAX:4,         // hoechstens so viele Punkte
  ALBUM_SEITE9:5,          // ab so vielen Momenten schickt Lea die Zeitungsseite
  MORITZ_WARM:15, MORITZ_ARG:-5, WARM:8,
  KATER_LEICHT:25, KATER_MITTEL:60,
  KNOTEN_MAX:3,
  WOLLE_FARBE:'#ff3d3d', WOLLE_GOLD:'#ffd447',
};

/* ------------------------------------------------------------- Hilfen --- */
const _epF=n=>{ try{ return typeof flag==='function'&&flag(n); }catch(e){ return false; } };
const _epB=n=>{ try{ return typeof beziehung==='function'?beziehung(n):0; }catch(e){ return 0; } };
const _crew=()=>{ try{ return typeof ladeCrew==='function'?ladeCrew():[]; }catch(e){ return []; } };
function _momentZahl(){
  let c=0; for(let i=1;i<=8;i++) if(_epF('moment'+i)) c++; return c;
}

/* ------------------------------------------------------------- EPILOG --- */
/* wenn(p): Bedingung (p = Parameter von level8), txt: zwei Zeilen mit '|' */
const EPILOG={
  'MORITZ':{ crew:false, zeilen:[
    { wenn:()=>_epF('moritzGeheimnis'), txt:'MORITZ HAT ES DIR ZUERST GESAGT.|DU HATTEST ES SCHON GEWUSST.' },
    { wenn:()=>_epB('MORITZ')>=EPILOG_TUNE.MORITZ_WARM, txt:'MORITZ: SEPTEMBER, ANDERE STADT.|ER SCHREIBT ZUERST.' },
    { wenn:()=>_epB('MORITZ')>=0, txt:'MORITZ ZIEHT UM. DU WEISST NOCH|NICHT, WOHIN. DU FRAGST.' },
    { wenn:()=>_epB('MORITZ')<=EPILOG_TUNE.MORITZ_ARG, txt:'MORITZ ANTWORTET ERST MITTAGS.|ABER ER ANTWORTET.' },
    { wenn:()=>true, txt:'NOCH KEIN WORT VON MORITZ.|ER MELDET SICH.' },
  ]},
  'JONAS':{ crew:true, zeilen:[
    { wenn:()=>_epF('tschuess_jonas'), txt:'JONAS HAT TSCHUESS GESAGT. UND IST|GEBLIEBEN.' },
    { wenn:()=>_epF('jonasAngstTeilen'), txt:'JONAS HAT ES ALS ERSTER AUSGESPROCHEN.|ES HAT GEHOLFEN.' },
    { wenn:()=>true, txt:'JONAS SCHREIBT DIR MORGEN.|ER HAT SICH DAS VORGENOMMEN.' },
  ]},
  'DENNIS':{ crew:true, zeilen:[
    { wenn:()=>_epB('DENNIS')>=EPILOG_TUNE.WARM||_epF('tschuess_dennis'), txt:'DENNIS HAT ZWEI KARTEN FUER SEINEN KAMPF.|EINE IST FUER DICH.' },
    { wenn:()=>true, txt:'DENNIS TRAINIERT WEITER. DREIMAL DIE|WOCHE. PASST.' },
  ]},
  'SEMIH':{ crew:true, zeilen:[
    { wenn:()=>_epB('SEMIH')>=EPILOG_TUNE.WARM||_epF('tschuess_semih'), txt:'SEMIH KENNT JEDEN.|DICH HAT ER ZUERST ANGERUFEN.' },
    { wenn:()=>true, txt:'HEUT HAT KEINER SEMIH GEFRAGT, WEN ER|KENNT. ER FAND DAS GUT.' },
  ]},
  'LEA':{ crew:true, zeilen:[
    { wenn:()=>_momentZahl()>=EPILOG_TUNE.ALBUM_SEITE9||_epF('tschuess_lea'), txt:'LEA SCHICKT DIR DIE ZEITUNG.|SEITE 9 HEISST: LETZTE NACHT.' },
    { wenn:()=>true, txt:'LEA HAT 212 FOTOS GEMACHT.|DU BIST AUF SECHS.' },
  ]},
  'MAX FERDI':{ crew:true, zeilen:[
    { wenn:()=>true, txt:'MAX FERDI SETZT SICH ALS ERSTER.|DAS IST NEU.' },
  ]},
  'TOBI':{ crew:true, zeilen:[
    { wenn:()=>_epF('tobiBruecke')||_epF('tschuess_tobi'), txt:'TOBI SCHICKT EIN FOTO. ERSTES LICHT.|05:17.' },
    { wenn:()=>true, txt:'TOBI WEISS, WO MAN DIE SONNE ZUERST|SIEHT. DAS NAECHSTE MAL FRAGST DU.' },
  ]},
  /* Marvin: die Folie gibt es nur bei marvinKennt (siehe marvinFolie) */
  'MARVIN':{ crew:false, zeilen:[
    { wenn:()=>_epF('marvinMitkommen'), txt:'MARVIN IST MITGEKOMMEN.|ER SUMMT. ES IST WONDERWALL.' },
    { wenn:p=>_epF('fightFrieden')||(p&&p.kampf==='frieden'), txt:'MARVIN SITZT NEBEN DIR. ER SUMMT.|ES IST WONDERWALL.' },
    { wenn:p=>_epF('fightGewonnen')||(p&&p.kampf==='gewonnen'), txt:'MARVIN GEHT ALLEIN. SEIN LETZTER SATZ:|"IHR HABT DAS TRIKOT NOCH."' },
    { wenn:()=>true, txt:'MARVIN REICHT DIR DIE HAND.|KEIN STRESS.' },
  ]},
};
const EPILOG_REIHE=['MORITZ','JONAS','DENNIS','SEMIH','LEA','MAX FERDI','TOBI'];

/* Die erste zutreffende Zeile einer Figur, sonst null. */
function epilogZeile(name,p){
  try{
    const e=EPILOG[name]; if(!e) return null;
    if(e.crew&&!_crew().includes(name)) return null;
    for(const z of e.zeilen){ let ok=false; try{ ok=!!z.wenn(p); }catch(x){} if(ok) return z.txt; }
  }catch(e){}
  return null;
}

function epilogFolien(p){
  const out=[];
  try{
    for(const n of EPILOG_REIHE){
      if(out.length>=EPILOG_TUNE.FOLIEN_MAX) break;
      const t=epilogZeile(n,p); if(t) out.push({ d:EPILOG_TUNE.FOLIE_DAUER, txt:t });
    }
  }catch(e){}
  return out;
}
const marvinFolie=p=>_epF('marvinKennt')?epilogZeile('MARVIN',p):null;

/* --------------------------------------------------------- GRUPPENCHAT --- */
/* prio: bei mehr als CHAT_MAX Zeilen fallen die niedrigsten weg; die Reihenfolge bleibt. */
const GRUPPENCHAT=[
  { prio:5, txt:()=>'ALI: SIE SIND GUT RAUS.' },
  { prio:4, wenn:()=>_epF('taxiTipp'), txt:()=>'TAXI: ICH HAB ALLES GESEHEN. WIE IMMER.' },
  { prio:6, txt:()=>_epF('spaetiWasser')?'OEZDEMIR: DER MIT DEM WASSER. GUTER MANN.':'OEZDEMIR: DER OHNE WASSER. NAJA. ER LEBT.' },
  { prio:6, txt:()=>_epF('schluesselVersprochen')?'HAUSMEISTER: SCHLUESSEL WIEDER DA. GUT.':'HAUSMEISTER: SCHLUESSEL WEG. EGAL.' },
  { prio:2, wenn:()=>_epF('mitgesungen'), txt:()=>'MUSIKER: DER HAT MITGESUNGEN. FALSCH.' },
  { prio:1, txt:()=>'BAECKERIN: BROETCHEN LIEGEN BEREIT.' },
  { prio:3, txt:()=>'FRAU: DER HUND SAGT HALLO.' },
];
function chatZeilen(){
  const k=[];
  try{
    GRUPPENCHAT.forEach((e,i)=>{ let ok=true; try{ if(e.wenn) ok=!!e.wenn(); }catch(x){ ok=false; }
      if(ok) k.push({ i, prio:e.prio||0, t:e.txt() }); });
    if(k.length>EPILOG_TUNE.CHAT_MAX){
      const raus=k.slice().sort((a,b)=>(a.prio-b.prio)||(b.i-a.i)).slice(0,k.length-EPILOG_TUNE.CHAT_MAX);
      raus.forEach(r=>k.splice(k.indexOf(r),1));
    }
  }catch(e){}
  return k.map(x=>x.t);
}
function chatKarten(){
  const z=chatZeilen(), out=[];
  if(!z.length) return out;
  out.push({ d:EPILOG_TUNE.CHAT_KOPF, txt:'GRUPPE: NACHTSCHICHT ('+z.length+')' });
  for(let i=0;i<z.length;i+=2) out.push({ d:EPILOG_TUNE.CHAT_PAAR, txt:z.slice(i,i+2).join('|') });
  return out;
}

/* ------------------------------------------------------------ NIEWIEDER --- */
const NIEWIEDER=[
  { wenn:()=>true, txt:'DAS FENSTER' },
  { wenn:()=>_epF('notbremse'), txt:'DIE NOTBREMSE' },
  { wenn:()=>_epF('marvinKennt'), txt:'DAS TRIKOT' },
  { wenn:()=>_epF('moritzKartonGesehen'), txt:'DIE KARTONS' },
  { wenn:p=>_epF('endeSonne')||!!(p&&p.weg==='sonne'), txt:'DAS AUF DER BRUECKE' },
];
function niewiederPunkte(p){
  const o=[];
  try{ for(const e of NIEWIEDER){ let ok=false; try{ ok=!!e.wenn(p); }catch(x){} if(ok) o.push(e.txt); } }catch(e){}
  return o.slice(0,EPILOG_TUNE.NIEWIEDER_MAX);
}

/* ---------------------------------------------------------------- KATER --- */
function katerStufe(){
  let v=0; try{ v=wert('pegel')||0; }catch(e){}
  return v<EPILOG_TUNE.KATER_LEICHT?'LEICHT':v<EPILOG_TUNE.KATER_MITTEL?'MITTEL':'ARCHE NOAH';
}
const katerText=()=>'DEIN KATER AM SAMSTAG: '+katerStufe()+'.';

/* ---------------------------------------------------------------- WOLLE --- */
function knoten(){
  return (_epF('schluesselVersprochen')?1:0)+(_epF('wirEuchAuch')?1:0)+(_epF('tschuessGesagt')?1:0);
}
function stempel(n){
  if(n===undefined) n=knoten();
  return n<=0?'BIS GLEICH':n>=3?'SCHICHTWECHSEL':'ROTER FADEN '+n+' VON 3';
}
/* Eine rote Linie mit drei Knoten bei 25/50/75 %; bei 3 ein ruhiger Goldrand.
   Keine Bewegung, kein Blinken - t bleibt fuer spaetere Auszahlung im Aufruf. */
function zeichneWolle(n,y,t){
  try{
    const T=EPILOG_TUNE, k=Math.max(0,Math.min(T.KNOTEN_MAX,n|0));
    if(k>=T.KNOTEN_MAX){
      ctx.strokeStyle=T.WOLLE_GOLD; ctx.lineWidth=1; ctx.strokeRect(10.5,y-14.5,W-21,29);
    }
    ctx.fillStyle=T.WOLLE_FARBE; ctx.fillRect(0,y-1,W,2);
    for(let i=0;i<T.KNOTEN_MAX;i++){
      const x=Math.round(W*(i+1)*.25);
      if(i<k){ ctx.fillStyle=T.WOLLE_FARBE; ctx.fillRect(x-3,y-3,6,6); }
      else { ctx.fillStyle='#08060f'; ctx.fillRect(x-3,y-3,6,6);
        ctx.strokeStyle=T.WOLLE_FARBE; ctx.lineWidth=1; ctx.strokeRect(x-2.5,y-2.5,5,5); }
    }
  }catch(e){}
}

/* --------------------------------------------------------------- ABSPANN --- */
function abspannMitte(p){
  const out=[];
  try{
    const mf=marvinFolie(p); if(mf) out.push({ d:EPILOG_TUNE.FOLIE_DAUER, txt:mf });
    out.push(...epilogFolien(p));
    out.push(...chatKarten());
    const m=_momentZahl();
    const album=[ 'ALBUM: '+m+' VON 8' ];
    if(m>=EPILOG_TUNE.ALBUM_SEITE9&&_crew().includes('LEA')) album.push('SEITE 9: LETZTE NACHT. VON LEA.');
    out.push({ d:EPILOG_TUNE.KARTE_DAUER, txt:album.join('|') });
    if(_epF('schluesselVersprochen'))
      out.push({ d:EPILOG_TUNE.KARTE_DAUER, txt:'DER SCHLUESSEL LIEGT IM BRIEFKASTEN.|ROTE WOLLE DRAN.' });
  }catch(e){}
  return out;
}

function abspannSchluss(p){
  const out=[];
  try{
    const pk=niewiederPunkte(p);
    if(pk.length) out.push({ d:EPILOG_TUNE.KARTE_DAUER+.4*pk.length, txt:['WAS WIR NIE WIEDER ERWAEHNEN:'].concat(pk).join('|') });
    out.push({ d:EPILOG_TUNE.KARTE_DAUER, txt:katerText() });
    const n=knoten();
    if(n===0&&_epF('bisGleichAmEnde'))
      out.push({ d:EPILOG_TUNE.KARTE_DAUER, txt:'ALLE HABEN BIS GLEICH GESAGT.|KEINER TSCHUESS.' });
    out.push({ d:EPILOG_TUNE.WOLLE_DAUER, txt:'', art:'wolle', knoten:n, stempel:stempel(n) });
  }catch(e){}
  return out;
}

/* ----------------------------------------------------------------- ENDEN --- */
/* Titel wie in NACHT.gesehen gespeichert (level8.html: endeTitel()). */
const ENDEN_ALLE=[
  { id:'heim_gewonnen',    titel:'HEIM - MIT SCHRAMMEN' },
  { id:'heim_verloren',    titel:'HEIM - MIT BLAUEM AUGE' },
  { id:'heim_frieden',     titel:'HEIM - OHNE EINEN SCHLAG' },
  { id:'weiter_gewonnen',  titel:'WEITERZIEHEN - MIT SCHRAMMEN' },
  { id:'weiter_verloren',  titel:'WEITERZIEHEN - MIT BLAUEM AUGE' },
  { id:'weiter_frieden',   titel:'WEITERZIEHEN - OHNE EINEN SCHLAG' },
  { id:'sonne_gewonnen',   titel:'SONNENAUFGANG - MIT SCHRAMMEN' },
  { id:'sonne_verloren',   titel:'SONNENAUFGANG - MIT BLAUEM AUGE' },
  { id:'sonne_frieden',    titel:'SONNENAUFGANG - OHNE EINEN SCHLAG' },
  { id:'schichtwechsel',   titel:'SCHICHTWECHSEL' },
];

/* Traegt ein Ende ein: gesehen, bei drei Knoten zusaetzlich SCHICHTWECHSEL,
   und je Titel die beste Knotenzahl. Rueckgabe: Knotenzahl dieses Durchgangs. */
function endeRegistrieren(titel){
  let n=0;
  try{
    n=knoten();
    if(!Array.isArray(NACHT.gesehen)) NACHT.gesehen=[];
    if(!NACHT.knotenBest||typeof NACHT.knotenBest!=='object') NACHT.knotenBest={};
    const eintragen=(t,k)=>{
      if(!t) return;
      if(!NACHT.gesehen.includes(t)) NACHT.gesehen.push(t);
      NACHT.knotenBest[t]=Math.max(NACHT.knotenBest[t]||0,k);
    };
    eintragen(titel,n);
    if(n>=EPILOG_TUNE.KNOTEN_MAX) eintragen('SCHICHTWECHSEL',n);
    if(typeof speichereStand==='function') speichereStand();
  }catch(e){}
  return n;
}
