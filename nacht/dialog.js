/* ============================================================================
   NACHTSCHICHT - ENGINE: dialog
   Gespraeche mit Entscheidungsbaum.

   Ein Gespraech ist ein Objekt aus Knoten - reine Daten, keine Logik:

     const BEIM_TUERSTEHER = {
       start:{ wer:'TUERSTEHER', text:'Heute nicht, Jungs.',
         wahl:[
           {txt:'Wir stehen seit einer stunde hier.', geh:'frech', tu:{ruf:+3}},
           {txt:'Alles gut, wir gehen.',              geh:'ende',  tu:{mut:-5}},
           {txt:'Semih hat gesagt, ich soll fragen.', wenn:{crew:'SEMIH'}, geh:'rein'},
         ], zeit:7, standard:1 },
       frech:{ wer:'TUERSTEHER', text:'Und? Dann steht ihr noch eine.', geh:'ende' },
       rein: { wer:'TUERSTEHER', text:'Na dann. Rein mit euch.',
               tu:{flag:'clubDrin', ruf:+10}, geh:'ende' },
       ende:  null,
     };

   Knoten-Felder: wer, text, wahl[], zeit (Sekunden bis automatisch gewaehlt
   wird), standard (Index in der VOLLEN wahl-Liste; diese Antwort ist vorgewaehlt und wird bei Zeitablauf genommen; ist sie gerade unsichtbar, gilt die erste sichtbare), tu (Wirkung beim
   Betreten), geh (naechster Knoten ohne Auswahl).
   Auswahl-Felder: txt, wenn (Bedingung, sonst unsichtbar), tu, geh.
   probe (optional): Probe-Antwort, z. B. {ruf:60} oder {mut:40} - genau ein
   Schluessel, die Zahl ist der Mindestwert. Anders als wenn bleibt die Antwort
   IMMER sichtbar; ist die Probe nicht bestanden, ist sie gesperrt (gedimmt,
   nicht waehlbar). Bestanden und bestaetigt meldet sie ERFOLG.gib('probe_ruf')
   bzw. 'probe_mut'.
   Bedingungen und Wirkungen gehen an nacht.js, siehe dort.

   ACHTUNG Schrift: der 3x5-Font kann nur A-Z 0-9 und . : - ! ? / + , < > * %
   Keine Umlaute - ae/oe/ue/ss ausschreiben. Gross/klein ist egal, es wird
   ohnehin in Grossbuchstaben gezeichnet.

   Einbau ins Level:
     update: if(gespraechAktiv()){ gespraechTakt(dt); return; }
     draw:   zeichneGespraech();
     E:      if(gespraechAktiv()){ gespraechBestaetigen(); return; }
     links/rechts: gespraechWaehle(-1) / gespraechWaehle(+1)
   ========================================================================== */

const D_FARBE={ kasten:'#000000e8', rand:'#ff3d8b', name:'#42d9ff',
  text:'#f2f0ff', wahl:'#8d86a8', aktiv:'#ffd447', zeitBalken:'#ff3d8b',
  gesperrt:'#4a4363', probe:'#ffd447' };

/* Probe-Antwort: Schluessel (ruf/mut) und Mindestwert, oder null wenn keine Probe. */
function probeBestanden(w){
  return !!(w&&w.probe&&typeof bedingungErfuellt==='function'&&bedingungErfuellt(w.probe));
}
function probeGesperrt(w){
  return !!(w&&w.probe&&typeof bedingungErfuellt==='function'&&!bedingungErfuellt(w.probe));
}

let GESPR=null;   // {baum, knoten, wahlen[], gewaehlt, zeitRest, fertig, tippT}

/* Bricht Text an Wortgrenzen auf die Bildbreite um. */
function umbrich(txt,maxBreite,s=1){
  const worte=String(txt).split(' '), zeilen=[]; let z='';
  for(const w of worte){
    const probe=z?z+' '+w:w;
    if(textW(probe,s)>maxBreite&&z){ zeilen.push(z); z=w; } else z=probe;
  }
  if(z) zeilen.push(z);
  return zeilen;
}

function betrete(name){
  const k=GESPR.baum[name];
  if(!k){ const f=GESPR.fertig; GESPR=null; if(f) f(name); return; }
  wirke(k.tu);
  if(k.wer&&typeof stimmePiep==='function') stimmePiep(k.wer);
  GESPR.knoten=k; GESPR.name=name; GESPR.tippT=0;
  GESPR.wahlen=(k.wahl||[]).filter(w=>bedingungErfuellt(w.wenn));
  GESPR.gesperrt=GESPR.wahlen.map(w=>probeGesperrt(w));
  /* Sind alle sichtbaren Antworten gesperrt, sind alle frei - nie festhaengen. */
  if(GESPR.gesperrt.length&&GESPR.gesperrt.every(x=>x)) GESPR.gesperrt=GESPR.gesperrt.map(()=>false);
  const std=(k.wahl&&k.standard!==undefined)?k.wahl[k.standard]:null;
  const si=std?GESPR.wahlen.indexOf(std):-1;
  GESPR.standardIdx=si>=0?si:0;     // unsichtbare Standardantwort: die erste sichtbare
  /* Die Standardantwort darf nie gesperrt sein: dann die erste freie nehmen. */
  if(GESPR.gesperrt[GESPR.standardIdx]){
    const frei=GESPR.gesperrt.indexOf(false);
    if(frei>=0) GESPR.standardIdx=frei;
  }
  GESPR.gewaehlt=GESPR.standardIdx; // vorgewaehlt: Abwarten und E bedeuten dasselbe
  /* Bedenkzeit nach Schwierigkeit - auf LOCKER anderthalbmal so lang. */
  const zf=(typeof schwer==='function')?schwer().zeit:1;
  GESPR.zeitGesamt=k.zeit?k.zeit*zf:0;
  GESPR.zeitRest=(k.zeit&&GESPR.wahlen.length)?GESPR.zeitGesamt:0;
}

function starteGespraech(baum,start='start',fertig=null){
  GESPR={baum,fertig,knoten:null,name:null,wahlen:[],gewaehlt:0,zeitRest:0,tippT:0};
  betrete(start);
}
const gespraechAktiv=()=>!!GESPR;

function gespraechGesperrt(i){ return !!(GESPR&&GESPR.gesperrt&&GESPR.gesperrt[i]); }

function gespraechWahlText(i){
  const w=GESPR&&GESPR.wahlen[i];
  if(!w) return '';
  if(!w.probe) return w.txt;
  const k=Object.keys(w.probe)[0], n=w.probe[k];
  return (gespraechGesperrt(i)?'['+k.toUpperCase()+' '+n+'] ':'['+k.toUpperCase()+'] ')+w.txt;
}

function gespraechWaehle(richtung){
  if(!GESPR||!GESPR.wahlen.length) return;
  const n=GESPR.wahlen.length;
  let i=GESPR.gewaehlt;
  for(let s=0;s<n;s++){          // gesperrte Proben ueberspringen (hoechstens n Schritte)
    i=(i+richtung+n)%n;
    if(!gespraechGesperrt(i)){ GESPR.gewaehlt=i; return; }
  }
}

function gespraechBestaetigen(){
  if(!GESPR) return;
  const k=GESPR.knoten;
  if(GESPR.wahlen.length){
    const w=GESPR.wahlen[GESPR.gewaehlt];
    if(gespraechGesperrt(GESPR.gewaehlt)){
      if(typeof piep==='function') piep(140,.08,'square',.04);
      return;                    // nicht bestandene Probe: nichts passiert
    }
    if(probeBestanden(w)&&typeof ERFOLG!=='undefined'&&ERFOLG&&ERFOLG.gib)
      ERFOLG.gib(Object.keys(w.probe)[0]==='mut'?'probe_mut':'probe_ruf');
    wirke(w.tu);
    betrete(w.geh||'ende');
  } else {
    betrete(k.geh||'ende');
  }
}

function gespraechTakt(dt){
  if(!GESPR) return;
  GESPR.tippT+=dt;
  if(GESPR.zeitRest>0){
    GESPR.zeitRest-=dt;
    if(GESPR.zeitRest<=0){
      /* Zeit rum - der Charakter antwortet fuer dich. */
      const k=GESPR.knoten;
      GESPR.gewaehlt=Math.min(GESPR.wahlen.length-1,GESPR.standardIdx||0);
      gespraechBestaetigen();
    }
  }
}

function zeichneGespraech(){
  if(!GESPR) return;
  /* Am Handy steht das Gespraech als antippbare Flaechen im Bedienfeld
     unter dem Bild (nacht/mobil.js). Der Kasten auf dem Bild waere dann
     dasselbe zweimal - und er verdeckt genau die Szene, um die es geht. */
  if(window.MOBIL && window.MOBIL.an) return;
  const k=GESPR.knoten, w=GESPR.wahlen;
  const zeilen=umbrich(k.text||'',W-24);
  const hoehe=20+zeilen.length*8+(w.length?w.length*9+4:10);
  const y0=H-hoehe;

  ctx.fillStyle=D_FARBE.kasten; ctx.fillRect(0,y0,W,hoehe);
  ctx.fillStyle=D_FARBE.rand;   ctx.fillRect(0,y0,W,1);

  if(k.wer) text(k.wer,8,y0+5,typeof stimmeFarbe==='function'?stimmeFarbe(k.wer):D_FARBE.name);

  /* Zeitbalken - nur wenn der Knoten Zeitdruck hat */
  if(GESPR.zeitRest>0&&k.zeit){
    const bw=Math.round((W-16)*(GESPR.zeitRest/(GESPR.zeitGesamt||k.zeit)));
    ctx.fillStyle=D_FARBE.zeitBalken; ctx.fillRect(8,y0+12,bw,1);
  }

  zeilen.forEach((z,i)=>text(z,8,y0+16+i*8,D_FARBE.text));

  const yW=y0+16+zeilen.length*8+2;
  if(w.length){
    w.forEach((o,i)=>{
      const an=i===GESPR.gewaehlt, gs=gespraechGesperrt(i);
      if(an&&!gs) text('>',8,yW+i*9,D_FARBE.aktiv);
      /* Der Bitmap-Font hat keine eckigen Klammern: auf dem Canvas stehen runde. */
      const t=gespraechWahlText(i).replace(/\[/g,'(').replace(/\]/g,')');
      const farbe=gs?D_FARBE.gesperrt:an?D_FARBE.aktiv:(probeBestanden(o)?D_FARBE.probe:D_FARBE.wahl);
      text(t,16,yW+i*9,farbe);
    });
  } else if(Math.floor(GESPR.tippT*2)%2===0){
    const h=IS_TOUCH?'TIPPEN':'E WEITER';
    text(h,W-textW(h)-8,yW,D_FARBE.wahl);
  }
}
