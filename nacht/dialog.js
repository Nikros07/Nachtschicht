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
   wird), standard (Index der Auswahl bei Zeitablauf), tu (Wirkung beim
   Betreten), geh (naechster Knoten ohne Auswahl).
   Auswahl-Felder: txt, wenn (Bedingung, sonst unsichtbar), tu, geh.
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
  text:'#f2f0ff', wahl:'#8d86a8', aktiv:'#ffd447', zeitBalken:'#ff3d8b' };

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
  GESPR.knoten=k; GESPR.name=name; GESPR.gewaehlt=0; GESPR.tippT=0;
  GESPR.wahlen=(k.wahl||[]).filter(w=>bedingungErfuellt(w.wenn));
  GESPR.zeitRest=(k.zeit&&GESPR.wahlen.length)?k.zeit:0;
}

function starteGespraech(baum,start='start',fertig=null){
  GESPR={baum,fertig,knoten:null,name:null,wahlen:[],gewaehlt:0,zeitRest:0,tippT:0};
  betrete(start);
}
const gespraechAktiv=()=>!!GESPR;

function gespraechWaehle(richtung){
  if(!GESPR||!GESPR.wahlen.length) return;
  const n=GESPR.wahlen.length;
  GESPR.gewaehlt=(GESPR.gewaehlt+richtung+n)%n;
}

function gespraechBestaetigen(){
  if(!GESPR) return;
  const k=GESPR.knoten;
  if(GESPR.wahlen.length){
    const w=GESPR.wahlen[GESPR.gewaehlt];
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
      GESPR.gewaehlt=Math.min(GESPR.wahlen.length-1,k.standard||0);
      gespraechBestaetigen();
    }
  }
}

function zeichneGespraech(){
  if(!GESPR) return;
  const k=GESPR.knoten, w=GESPR.wahlen;
  const zeilen=umbrich(k.text||'',W-24);
  const hoehe=20+zeilen.length*8+(w.length?w.length*9+4:10);
  const y0=H-hoehe;

  ctx.fillStyle=D_FARBE.kasten; ctx.fillRect(0,y0,W,hoehe);
  ctx.fillStyle=D_FARBE.rand;   ctx.fillRect(0,y0,W,1);

  if(k.wer) text(k.wer,8,y0+5,D_FARBE.name);

  /* Zeitbalken - nur wenn der Knoten Zeitdruck hat */
  if(GESPR.zeitRest>0&&k.zeit){
    const bw=Math.round((W-16)*(GESPR.zeitRest/k.zeit));
    ctx.fillStyle=D_FARBE.zeitBalken; ctx.fillRect(8,y0+12,bw,1);
  }

  zeilen.forEach((z,i)=>text(z,8,y0+16+i*8,D_FARBE.text));

  const yW=y0+16+zeilen.length*8+2;
  if(w.length){
    w.forEach((o,i)=>{
      const an=i===GESPR.gewaehlt;
      if(an) text('>',8,yW+i*9,D_FARBE.aktiv);
      text(o.txt,16,yW+i*9,an?D_FARBE.aktiv:D_FARBE.wahl);
    });
  } else if(Math.floor(GESPR.tippT*2)%2===0){
    const h=IS_TOUCH?'TIPPEN':'E WEITER';
    text(h,W-textW(h)-8,yW,D_FARBE.wahl);
  }
}
