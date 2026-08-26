/* ============================================================================
   NACHTSCHICHT - FORTSCHRITT

   Alles, was ueber ein einzelnes Level hinaus gilt, steht hier und nur hier:
   welche Level es gibt, wer schon dabei ist, was freigeschaltet ist und
   welche Bestzeiten stehen.

   Vorher lag das in jeder Level-Datei nochmal. Bei zwei Levels ging das
   gerade so, bei acht waere jede neue Datei ein Suchen-und-Ersetzen ueber
   das ganze Repo gewesen - und die Leiste unten haette in jeder Datei von
   Hand gepflegt werden muessen.

   Eingebunden wird die Datei als ganz normales <script src>. Das laeuft
   auch beim Doppelklick ueber file:// - Module und fetch taeten das nicht.
   ========================================================================== */
(function(global){
'use strict';

/* --------------------------------------------------------------------------
   DIE LEVEL

   `datei` null heisst: das Level ist geplant, aber noch nicht gebaut. Es
   steht dann in der Leiste, ist aber nicht anklickbar.
   `gibt` ist der Junge, den man dort freischaltet - daran erkennt ein alter
   Spielstand, welche Level schon geschafft sind.
   -------------------------------------------------------------------------- */
const LEVEL = [
  { nr:1, datei:'index.html',  name:'DIE SCHULE',   gibt:'MAX FERDI' },
  { nr:2, datei:'level2.html', name:'BEI MORITZ',   gibt:'MORITZ'    },
  { nr:3, datei:'level3.html', name:'DER NACHTBUS', gibt:'DER LANGE' },
  { nr:4, datei:null,          name:'DIE SCHLANGE', gibt:null        },
  { nr:5, datei:null,          name:'CLUB',         gibt:null        },
  { nr:6, datei:null,          name:'AFTERHOUR',    gibt:null        },
  { nr:7, datei:null,          name:'SPAETI',       gibt:null        },
  { nr:8, datei:null,          name:'HEIMWEG',      gibt:null        },
];

/* --------------------------------------------------------------------------
   SPEICHER

   Die Schluessel bleiben, wie sie waren. Wer das Spiel schon gespielt hat,
   behaelt seine Crew und seine Bestzeiten.
   -------------------------------------------------------------------------- */
const K_CREW = 'nachtschicht.crew';
const K_GESCHAFFT = 'nachtschicht.geschafft';
const K_BEST = nr => 'nachtschicht.bestzeit'+nr;

function lies(schluessel, ersatz){
  try{
    const roh = localStorage.getItem(schluessel);
    if(roh===null) return ersatz;
    const v = JSON.parse(roh);
    return v===null||v===undefined ? ersatz : v;
  }catch(e){ return ersatz; }
}
function schreib(schluessel, wert){
  try{ localStorage.setItem(schluessel, JSON.stringify(wert)); return true; }
  catch(e){ return false; }
}

const alsListe = v => Array.isArray(v) ? v : [];

/* ---- Die Jungs ---- */
function crew(){ return alsListe(lies(K_CREW, [])); }
function hat(name){ return crew().indexOf(name)>=0; }
function nimmAuf(name){
  const c = crew();
  if(c.indexOf(name)<0){ c.push(name); schreib(K_CREW, c); }
  return c;
}

/* ---- Geschaffte Level ----
   Ein alter Spielstand kennt nur die Crew. Wer MAX FERDI dabei hat, hat
   Level 1 geschafft - sonst waere nach dem Update auf einmal alles wieder
   zu. Deshalb zaehlt der Junge genauso wie der Eintrag. */
function geschaffteListe(){
  const gespeichert = alsListe(lies(K_GESCHAFFT, [])).filter(n=>typeof n==='number');
  const ausCrew = LEVEL.filter(l=>l.gibt&&hat(l.gibt)).map(l=>l.nr);
  return [...new Set([...gespeichert, ...ausCrew])].sort((a,b)=>a-b);
}
function istGeschafft(nr){ return geschaffteListe().indexOf(nr)>=0; }
function geschafft(nr){
  const g = geschaffteListe();
  if(g.indexOf(nr)<0){ g.push(nr); g.sort((a,b)=>a-b); schreib(K_GESCHAFFT, g); }
  return g;
}

/* ---- Freigeschaltet ----
   Level 1 ist immer offen. Alles andere braucht das Level davor. Ein Level
   ohne Datei ist nie spielbar, auch wenn es freigeschaltet waere. */
function frei(nr){
  if(nr<=1) return true;
  return istGeschafft(nr-1);
}
function spielbar(nr){
  const l = levelNr(nr);
  return !!(l && l.datei && frei(nr));
}

/* ---- Bestzeiten ---- */
function bestzeit(nr){
  const v = parseFloat(localStorage.getItem(K_BEST(nr)));
  return isFinite(v) ? v : null;
}
/* Gibt true zurueck, wenn es wirklich eine neue Bestzeit war. */
function setzeBestzeit(nr, sekunden){
  if(!isFinite(sekunden)) return false;
  const alt = bestzeit(nr);
  if(alt!==null && sekunden>=alt) return false;
  try{ localStorage.setItem(K_BEST(nr), String(sekunden)); }catch(e){}
  return true;
}

/* ---- Der Pegel ----
   Er begleitet die ganze Nacht: was Du bei Moritz getrunken hast, stehst
   Du im Bus noch. Gespeichert wird beim Verlassen eines Levels, gelesen
   beim Betreten des naechsten. Ein Neustart der Nacht setzt ihn zurueck. */
const K_PEGEL = 'nachtschicht.pegel';
function pegel(){
  const v = parseFloat(localStorage.getItem(K_PEGEL));
  return isFinite(v) ? Math.max(0,Math.min(100,v)) : 0;
}
function setzePegel(wert){
  if(!isFinite(wert)) return;
  try{ localStorage.setItem(K_PEGEL, String(Math.max(0,Math.min(100,wert)))); }catch(e){}
}

/* ---- Nachschlagen ---- */
function levelNr(nr){ return LEVEL.find(l=>l.nr===nr)||null; }
/* Das naechste spielbare Level nach nr - oder null, wenn da noch nichts ist. */
function naechstes(nr){
  const l = LEVEL.find(x=>x.nr>nr && x.datei);
  return l||null;
}

/* --------------------------------------------------------------------------
   DIE LEISTE UNTER DEM BILD

   Gebaut statt geschrieben: ein neues Level braucht nur eine Zeile oben in
   LEVEL, nicht eine Aenderung in jeder HTML-Datei.

   Gezeigt werden das aktive Level, alle freigeschalteten und immer genau
   das naechste gesperrte - damit man sieht, dass es weitergeht, aber nicht
   acht graue Kaesten unter dem Bild kleben hat.
   -------------------------------------------------------------------------- */
/* Welche Level gehoeren in die Auswahl? Dieselbe Antwort fuer die Leiste
   unter dem Bild und fuer die Zeilen auf dem Titelbild im Spiel. */
function auswahl(aktivNr){
  const zeigen = LEVEL.filter(l=>l.nr===aktivNr||frei(l.nr));
  /* Wenn alles Gezeigte spielbar ist, kommt das erste gesperrte noch dazu -
     sonst sieht es aus, als waere das Spiel hier zu Ende. Steht dagegen
     schon ein "BALD" in der Reihe, reicht das als Ausblick. */
  if(zeigen.every(l=>spielbar(l.nr))){
    const naechstesZu = LEVEL.find(l=>!frei(l.nr));
    if(naechstesZu) zeigen.push(naechstesZu);
  }
  return zeigen;
}
function leiste(aktivNr, ziel){
  const bar = ziel || document.getElementById('levelbar');
  if(!bar) return;
  const zeigen = auswahl(aktivNr);
  bar.innerHTML='';
  for(const l of zeigen){
    const beschriftung = l.nr+' · '+l.name;
    /* Das Level, in dem man gerade steckt, ist nie "gesperrt" - wer per
       Adresszeile hier gelandet ist, soll nicht lesen, dass er zu ist. */
    if(spielbar(l.nr)||l.nr===aktivNr){
      const a=document.createElement('a');
      a.href=l.datei; a.textContent=beschriftung;
      if(l.nr===aktivNr) a.className='aktiv';
      bar.appendChild(a);
    } else {
      const s=document.createElement('span');
      s.className='zu';
      s.textContent = l.datei ? beschriftung+' · ZU' : beschriftung+' · BALD';
      s.title = l.datei ? 'Erst Level '+(l.nr-1)+' schaffen' : 'Wird noch gebaut';
      bar.appendChild(s);
    }
  }
}

/* Fuer die Titelbilder im Spiel: was steht als naechstes an? */
function stand(){
  const g = geschaffteListe();
  return {
    crew: crew(),
    geschafft: g,
    offen: LEVEL.filter(l=>spielbar(l.nr)).map(l=>l.nr),
    naechstesOffenes: LEVEL.find(l=>spielbar(l.nr)&&!istGeschafft(l.nr))||null,
  };
}

/* Nur fuer den Notfall und zum Testen. */
function zuruecksetzen(){
  [K_CREW,K_GESCHAFFT,K_PEGEL].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
  LEVEL.forEach(l=>{ try{ localStorage.removeItem(K_BEST(l.nr)); }catch(e){} });
}

global.Fortschritt = {
  LEVEL, crew, hat, nimmAuf,
  geschafft, istGeschafft, frei, spielbar,
  bestzeit, setzeBestzeit, pegel, setzePegel,
  levelNr, naechstes, auswahl, leiste, stand, zuruecksetzen,
};
})(window);
