/* ============================================================================
   NACHTSCHICHT - ENGINE: erfolge
   Erfolge (Achievements): kleine Auszeichnungen fuer besondere Leistungen,
   gemerkt im Speicher des Browsers und im Menue unter ERFOLGE gezeigt.

   OEFFENTLICHE API (Vertrag, nicht aendern):
   ERFOLG.gib(id)     -> false, wenn die ID unbekannt ist oder schon erreicht war;
                         sonst true: merken, speichern, Popup "ERFOLG: TITEL" (SAFT.popup)
                         und Stinger 'fund' (MUSIK.stinger).
   ERFOLG.hat(id)     -> true/false
   ERFOLG.alle()      -> Kopie [{id, titel, text, hat}] in Listenreihenfolge
   ERFOLG.anzahl()    -> {hat, gesamt}
   ERFOLG.reset()     -> vergisst alles (nur fuer Tests)
   ERFOLG.liste       -> ERFOLGE (lesend)

   Einbau: wird vom Orchestrator nach nacht/hilfe.js eingebunden (klassisches
   <script>, kein Modul). Gelesen wird von wertung.js (Rang S) und menue.js
   (Eintrag ERFOLGE). Das Spiel laeuft auch ohne diese Datei weiter.

   Speicher: localStorage unter 'nachtschicht.erfolge' als JSON-Liste der IDs.
   Ohne Speicher (privates Fenster, gesperrt) gilt nur die laufende Sitzung.
   Jeder Zugriff steht in try, nichts davon wirft nach aussen.

   Canvas-Text nur A-Z 0-9 Leerzeichen und . : - ! ? / + , < > * % ( ) ' "
   (keine Umlaute, keine Kleinbuchstaben). Titel hoechstens 20, Texte 40 Zeichen.
   ========================================================================== */

/* Die Liste aller Erfolge. Reihenfolge = Reihenfolge im Menue. */
const ERFOLGE=[
  {id:'legende',      titel:'LEGENDE',              text:'RUF 85 ERREICHT'},
  {id:'probe_ruf',    titel:'MAN KENNT MICH',       text:'EINE RUF-PROBE BESTANDEN'},
  {id:'probe_mut',    titel:'HERZ AUS STAHL',       text:'EINE MUT-PROBE BESTANDEN'},
  {id:'rang_s',       titel:'GLATTE S',             text:'ERSTER RANG S'},
  {id:'alles_s',      titel:'PERFEKTE NACHT',       text:'IN ALLEN ACHT LEVELN RANG S'},
  {id:'l1_unsichtbar',titel:'GEIST',                text:'LEVEL 1 OHNE ALARM'},
  {id:'l2_perfekt',   titel:'BARKEEPER',            text:'PERFEKT EINGESCHENKT'},
  {id:'l3_schwarz',   titel:'SCHWARZFAHRER',        text:'BUS OHNE KONTROLLE GESCHAFFT'},
  {id:'l4_combo',     titel:'KONTERKOENIG',         text:'COMBO X5 GEGEN DIE SCHLANGE'},
  {id:'l5_tanz',      titel:'ON FIRE',              text:'IM CLUB IN FAHRT GETANZT'},
  {id:'l6_lichter',   titel:'LICHTFAENGER',         text:'ALLE DREI LICHTER GEFANGEN'},
  {id:'l7_pfand',     titel:'KLONK KLONK',          text:'FUENF PFANDTREFFER IN FOLGE'},
  {id:'l8_sonne',     titel:'VOR DER SONNE',        text:'MIT WENIG LICHT ZU HAUSE'},
  {id:'nacht_durch',  titel:'DIE GANZE NACHT',      text:'LEVEL 8 GESCHAFFT'}
];

/* Speicherschluessel im localStorage. */
const ERFOLG_KEY='nachtschicht.erfolge';

var ERFOLG=(function(){
  const kennt=function(id){ return ERFOLGE.some(function(e){ return e.id===id; }); };
  const eintrag=function(id){
    for(let i=0;i<ERFOLGE.length;i++) if(ERFOLGE[i].id===id) return ERFOLGE[i];
    return null;
  };

  // Laden: nur bekannte IDs; kaputter Speicher ergibt eine leere Liste.
  const lese=function(){
    try{
      const v=JSON.parse(localStorage.getItem(ERFOLG_KEY));
      return Array.isArray(v)?v.filter(function(s){ return typeof s==='string'&&kennt(s); }):[];
    }catch(e){ return []; }
  };
  let gemerkt=lese();

  const hat=function(id){ return gemerkt.indexOf(id)>=0; };
  const speichere=function(){
    try{ localStorage.setItem(ERFOLG_KEY,JSON.stringify(gemerkt)); }catch(e){}
  };

  function gib(id){
    if(typeof id!=='string'||!kennt(id)||hat(id)) return false;
    gemerkt.push(id);
    speichere();
    const e=eintrag(id);
    try{
      if(typeof SAFT!=='undefined'&&SAFT&&typeof SAFT.popup==='function')
        SAFT.popup('ERFOLG: '+e.titel,(typeof W==='number'?Math.round(W/2):160),62,'#ffd447');
    }catch(x){}
    try{
      if(typeof MUSIK!=='undefined'&&MUSIK&&typeof MUSIK.stinger==='function') MUSIK.stinger('fund');
    }catch(x){}
    return true;
  }

  function alle(){
    return ERFOLGE.map(function(e){ return {id:e.id, titel:e.titel, text:e.text, hat:hat(e.id)}; });
  }

  function anzahl(){
    return { hat:ERFOLGE.filter(function(e){ return hat(e.id); }).length, gesamt:ERFOLGE.length };
  }

  function reset(){
    gemerkt=[];
    try{ localStorage.removeItem(ERFOLG_KEY); }catch(e){}
  }

  return { gib:gib, hat:hat, alle:alle, anzahl:anzahl, reset:reset, liste:ERFOLGE };
})();

if(typeof window!=='undefined') window.ERFOLG=ERFOLG;
