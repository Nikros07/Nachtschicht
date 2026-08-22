/* ============================================================================
   NACHTSCHICHT - DIE NACHT

   Der gemeinsame Unterbau aller Level. Jedes Level bleibt eine eigene Datei
   mit eigener Spiellogik - hier steht nur, was ueber Level hinweg gilt:

     - welche Level es gibt und welches schon frei ist
     - wer aus der Crew dabei ist und was er kann
     - Bestzeiten
     - die Levelleiste unter dem Bildschirm

   Bewusst ein klassisches Script und kein Modul: so laeuft das Spiel weiter
   per Doppelklick ueber file://, wo Module an CORS scheitern wuerden.
   ========================================================================== */
(function(global){
'use strict';

/* ==========================================================================
   DIE NACHT IN STUFEN
   Ein Level dazuzuschreiben heisst: hier eine Zeile ergaenzen und die Datei
   anlegen. Leiste, Tastenkuerzel, Freischaltung und Uebergang kommen von
   allein. Level ohne "datei" sind noch Konzept und werden als BALD gezeigt.
   ========================================================================== */
var LEVELS=[
  { nr:1, id:'schule',    titel:'DIE SCHULE',   datei:'index.html',  zeit:'16:40' },
  { nr:2, id:'moritz',    titel:'BEI MORITZ',   datei:'level2.html', zeit:'21:10' },
  { nr:3, id:'bus',       titel:'DER NACHTBUS', datei:'level3.html', zeit:'22:00' },
  { nr:4, id:'schlange',  titel:'DIE SCHLANGE', datei:null,          zeit:'23:30' },
  { nr:5, id:'club',      titel:'CLUB',         datei:null,          zeit:'01:00' },
  { nr:6, id:'afterhour', titel:'AFTERHOUR',    datei:null,          zeit:'04:00' },
  { nr:7, id:'spaeti',    titel:'SPAETI',       datei:null,          zeit:'05:30' },
  { nr:8, id:'heimweg',   titel:'HEIMWEG',      datei:null,          zeit:'06:40' },
];

/* ==========================================================================
   DIE JUNGS
   Jedes Level bringt einen aus der Crew, jeder gibt eine Faehigkeit. Die
   Boni stehen hier als Zahlen, damit jedes Level sie gleich auslegt und
   niemand denselben Wert zweimal im Code stehen hat.

   name  - so steht er im Spielstand (die alten Staende benutzen den Namen,
           deshalb bleibt der Name der Schluessel und nicht die id)
   level - wo er dazukommt
   boni  - tempo: Faktor-Aufschlag beim Laufen (0.15 = +15%)
           herzen: zusaetzliche Leben
           charme: hilft im Club-Minispiel
           konter: groesseres Konterfenster im Kampf
   ========================================================================== */
var JUNGS=[
  { id:'maxferdi', name:'MAX FERDI', level:1, koennen:'+15% TEMPO',
    boni:{ tempo:0.15 } },
  { id:'moritz',   name:'MORITZ',    level:2, koennen:'BESSER BEI DEN CHAYAS',
    boni:{ charme:1 } },
];

/* ==========================================================================
   SPIELSTAND
   Alles in einem Schluessel, mit Version davor. Frueher lagen Crew und
   Bestzeiten in drei getrennten Schluesseln - die werden beim ersten Start
   uebernommen und danach nicht mehr angefasst.
   ========================================================================== */
var KEY='nachtschicht.stand';
var ALT_CREW='nachtschicht.crew';
var ALT_BEST=['nachtschicht.bestzeit1','nachtschicht.bestzeit2'];

var leer=function(){ return { v:1, crew:[], frei:1, best:{}, pegel:0 }; };

/* localStorage kann fehlen (privates Fenster, file:// in manchen Browsern).
   Das Spiel soll dann trotzdem laufen, nur eben ohne Gedaechtnis. */
function speicher(){
  try{ var s=global.localStorage; s.getItem(KEY); return s; }catch(e){ return null; }
}
function lesen(){
  var s=speicher(); if(!s) return leer();
  var roh=null;
  try{ roh=JSON.parse(s.getItem(KEY)); }catch(e){ roh=null; }
  if(!roh||typeof roh!=='object') return uebernehmeAlt(s);
  var st=leer();
  if(Array.isArray(roh.crew)) st.crew=roh.crew.filter(function(n){ return typeof n==='string'; });
  if(isFinite(roh.frei)) st.frei=Math.max(1,Math.min(LEVELS.length,Math.round(roh.frei)));
  if(roh.best&&typeof roh.best==='object'){
    for(var k in roh.best){ var v=parseFloat(roh.best[k]); if(isFinite(v)) st.best[k]=v; }
  }
  var pg=parseFloat(roh.pegel); if(isFinite(pg)) st.pegel=Math.max(0,Math.min(100,pg));
  return st;
}
function schreiben(st){
  var s=speicher(); if(!s) return st;
  try{ s.setItem(KEY,JSON.stringify(st)); }catch(e){}
  return st;
}
/* Ein Stand aus der Zeit vor dieser Datei: Crew und Bestzeiten lagen einzeln.
   Wer Level 1 geschafft hat, hat eine Bestzeit dafuer - daraus ergibt sich,
   wie weit die Nacht schon frei ist. */
function uebernehmeAlt(s){
  var st=leer(), gefunden=false;
  try{ var c=JSON.parse(s.getItem(ALT_CREW));
    if(Array.isArray(c)&&c.length){ st.crew=c.slice(); gefunden=true; } }catch(e){}
  for(var i=0;i<ALT_BEST.length;i++){
    var v=parseFloat(s.getItem(ALT_BEST[i]));
    if(isFinite(v)){ st.best[String(i+1)]=v; st.frei=Math.max(st.frei,i+2); gefunden=true; }
  }
  /* Ohne Bestzeit, aber mit Crew: der Jung verraet, welches Level lief. */
  for(var j=0;j<JUNGS.length;j++)
    if(st.crew.indexOf(JUNGS[j].name)>=0) st.frei=Math.max(st.frei,JUNGS[j].level+1);
  st.frei=Math.min(st.frei,LEVELS.length);
  if(gefunden) schreiben(st);
  return st;
}

/* ==========================================================================
   SCHALTER IN DER ADRESSZEILE
   ?alles=1  - alle gebauten Level anklickbar, ohne den Stand zu aendern.
               Zum Testen, damit man nicht jedes Mal durchspielen muss.
   ?reset=1  - Spielstand loeschen.
   ========================================================================== */
var such=(global.location&&global.location.search)||'';
var ALLES=/[?&]alles=1/.test(such);
if(/[?&]reset=1/.test(such)){ var s0=speicher(); if(s0){ try{ s0.removeItem(KEY); }catch(e){} } }

/* ==========================================================================
   ABFRAGEN
   ========================================================================== */
function level(nr){
  for(var i=0;i<LEVELS.length;i++) if(LEVELS[i].nr===nr) return LEVELS[i];
  return null;
}
function jungFuer(nr){
  for(var i=0;i<JUNGS.length;i++) if(JUNGS[i].level===nr) return JUNGS[i];
  return null;
}
function crew(){ return lesen().crew.slice(); }
function dabei(name){ return lesen().crew.indexOf(name)>=0; }
function frei(){ return ALLES?LEVELS.length:lesen().frei; }
function istFrei(nr){ return nr<=frei(); }
/* Spielbar ist nur, was frei UND schon gebaut ist. */
function spielbar(nr){ var l=level(nr); return !!(l&&l.datei&&istFrei(nr)); }
function best(nr){ var v=lesen().best[String(nr)]; return isFinite(v)?v:null; }

/* Alle Faehigkeiten der dabeigebliebenen Jungs zusammengerechnet. */
function boni(){
  var b={ tempo:0, herzen:0, charme:0, konter:0 }, c=lesen().crew;
  for(var i=0;i<JUNGS.length;i++){
    if(c.indexOf(JUNGS[i].name)<0) continue;
    var bo=JUNGS[i].boni||{};
    for(var k in bo) b[k]=(b[k]||0)+bo[k];
  }
  return b;
}
/* Der Faktor, mit dem in jedem Level das Lauftempo multipliziert wird. */
function tempoFaktor(){ return 1+boni().tempo; }

/* ==========================================================================
   AENDERN
   ========================================================================== */
function schaltFrei(name){
  var st=lesen();
  if(st.crew.indexOf(name)<0){ st.crew.push(name); schreiben(st); }
  return st.crew.slice();
}
/* Ein Level ist geschafft: Bestzeit vergleichen, naechstes Level aufmachen,
   den Jung aus dem Level dazunehmen. Gibt zurueck, was das Endbild braucht. */
function geschafft(nr,zeit){
  var st=lesen(), k=String(nr), neu=false;
  if(isFinite(zeit)){
    var alt=st.best[k];
    if(!isFinite(alt)||zeit<alt){ st.best[k]=zeit; neu=true; }
  }
  if(nr+1<=LEVELS.length) st.frei=Math.max(st.frei,nr+1);
  var j=jungFuer(nr);
  if(j&&st.crew.indexOf(j.name)<0) st.crew.push(j.name);
  schreiben(st);
  return { neueBestzeit:neu, best:isFinite(st.best[k])?st.best[k]:null,
           jung:j, naechstes:naechstes(nr) };
}
/* Der Pegel geht ueber das Level hinaus - wer bei Moritz zu tief ins Glas
   schaut, steht im Nachtbus schlechter. Wie viel davon ankommt, entscheidet
   das naechste Level; hier steht nur, womit du rausgegangen bist. */
function merkePegel(v){
  var st=lesen();
  st.pegel=isFinite(v)?Math.max(0,Math.min(100,v)):0;
  schreiben(st); return st.pegel;
}
function pegel(){ return lesen().pegel; }
function zuruecksetzen(){ return schreiben(leer()); }

/* Das Level nach diesem - egal ob schon gebaut. Wer wissen will, ob man
   hinkommt, fragt spielbar(). */
function naechstes(nr){ return level(nr+1); }
function gehZu(nr){
  var l=level(nr);
  if(l&&l.datei&&global.location) global.location.href=l.datei+(ALLES?'?alles=1':'');
}

/* ==========================================================================
   DIE LEISTE UNTER DEM BILDSCHIRM
   Zeigt jedes gebaute Level und das erste ungebaute als Ausblick. Was noch
   nicht frei ist, bleibt sichtbar, aber nicht anklickbar - man soll sehen,
   dass da noch was kommt, ohne es zu ueberspringen.
   ========================================================================== */
function leiste(el,aktuellNr){
  if(!el) return;
  var html='', gezeigt=0;
  for(var i=0;i<LEVELS.length;i++){
    var l=LEVELS[i];
    if(!l.datei){
      /* nur das naechste ungebaute als Ausblick, danach ist Schluss */
      html+='<span class="bald">'+l.nr+' &middot; BALD</span>';
      break;
    }
    gezeigt++;
    if(l.nr===aktuellNr) html+='<a href="'+l.datei+'" class="aktiv">'+l.nr+' &middot; '+l.titel+'</a>';
    else if(istFrei(l.nr)) html+='<a href="'+l.datei+'">'+l.nr+' &middot; '+l.titel+'</a>';
    else html+='<span class="zu" title="Erst nach Level '+(l.nr-1)+'">'+l.nr+' &middot; ZU</span>';
  }
  el.innerHTML=html;
}

/* Fuer das Titelbild im Spiel: welche Taste fuehrt wohin.
   Der Font im Spiel kann nur Grossbuchstaben, Ziffern und ein paar Zeichen -
   deshalb hier fertige, schlichte Zeilen. */
function levelZeilen(aktuellNr,max){
  var grenze=max||3, alle=[];
  for(var i=0;i<LEVELS.length;i++){
    var l=LEVELS[i];
    /* Das erste ungebaute Level als Ausblick, danach ist Schluss. */
    if(!l.datei){ alle.push({ nr:l.nr, taste:'', text:'LEVEL '+l.nr+' - '+l.titel,
                              zustand:'bald' }); break; }
    var zustand = l.nr===aktuellNr ? 'aktuell' : (istFrei(l.nr)?'frei':'zu');
    alle.push({ nr:l.nr,
      taste: l.nr===aktuellNr ? 'LEERTASTE' : ('TASTE '+l.nr),
      text: 'LEVEL '+l.nr+' - '+(zustand==='zu'?'NOCH ZU':l.titel),
      zustand: zustand });
  }
  if(alle.length<=grenze) return alle;
  /* Ein Fenster um das laufende Level - sonst waechst die Liste mit der
     Nacht mit und passt irgendwann nicht mehr auf den Bildschirm. */
  var mitte=0;
  for(var j=0;j<alle.length;j++) if(alle[j].zustand==='aktuell') mitte=j;
  var start=Math.min(Math.max(0,mitte-1),alle.length-grenze);
  return alle.slice(start,start+grenze);
}

/* Aus einem Tastendruck ein Level machen. Die Level rufen das im keydown
   auf, wenn das Titelbild laeuft. Gibt die Nummer zurueck, wenn gesprungen
   wurde - sonst 0. */
function tasteZuLevel(code){
  var m=/^(?:Digit|Numpad)([1-9])$/.exec(code||'');
  if(!m) return 0;
  var nr=parseInt(m[1],10);
  if(!spielbar(nr)) return 0;
  return nr;
}

global.NACHT={
  LEVELS:LEVELS, JUNGS:JUNGS,
  level:level, jungFuer:jungFuer,
  stand:lesen, crew:crew, dabei:dabei, boni:boni, tempoFaktor:tempoFaktor,
  frei:frei, istFrei:istFrei, spielbar:spielbar, best:best,
  schaltFrei:schaltFrei, geschafft:geschafft, zuruecksetzen:zuruecksetzen,
  merkePegel:merkePegel, pegel:pegel,
  naechstes:naechstes, gehZu:gehZu,
  leiste:leiste, levelZeilen:levelZeilen, tasteZuLevel:tasteZuLevel,
  alles:ALLES,
};
})(typeof globalThis!=='undefined'?globalThis:this);
