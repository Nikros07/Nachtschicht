/* Messkoffer C - gemeinsame Werkzeuge fuer c-level7.js, c-level8.js, c-karte.js, c-runner.js.
   Aus der Projektwurzel starten: node docs/gameplay/messung/c-level7.js

   Was hier passiert:
   - lade(): eine Seite ueber tools/nachttest.js (Attrappen-Browser) laden.
   - rekorder(): taktet update(1/60), liest jedes Bild den Zustand und schreibt Ereignisse
     mit Zeitstempel (Moduswechsel, Meldungen, Hinweise, Gespraechsknoten, Plausch,
     Kapitel-/Momentkarten, neu gesetzte Flags, levelspezifische Ereignisse).
   - Lesezeit-Modell: ein Bot drueckt sonst in 0 s durch jeden Dialog. Wir warten wie ein
     Mensch: 0,6 s Reaktion + Zeichen/14 pro s, bei Auswahl +0,8 s + 0,35 s je Antwort.
   - leere(): laengste Strecke ohne Impuls (Entscheidung, Herausforderung, Information).
   Nichts hier aendert Spieldateien. */
const path=require('path');
const WURZEL=path.join(__dirname,'..','..','..');
process.chdir(WURZEL);
const N=require(path.join(WURZEL,'tools','nachttest.js'));

const DT=1/60;
const LESE_ZEICHEN_PRO_S=14, LESE_REAKTION=0.6, LESE_WAHL=0.8, LESE_JE_ANTWORT=0.35;
const lesezeit=(text,nWahl)=>LESE_REAKTION+String(text||'').length/LESE_ZEICHEN_PRO_S
  +(nWahl?LESE_WAHL+LESE_JE_ANTWORT*nWahl:0);

/* Zustand, der in jedem Level gleich heisst. extra = levelspezifischer Ausdruck. */
function zustandsAusdruck(extra){
  return `JSON.stringify({
    m:S.modus,
    me:(S.meldungT>0?S.meldung:''), meT:+(S.meldungT||0),
    hi:(S.hinweisT>0?S.hinweis:''), hiT:+(S.hinweisT||0),
    g:(typeof GESPR!=='undefined'&&GESPR&&GESPR.knoten)?{wer:GESPR.knoten.wer||'',text:GESPR.knoten.text||'',
       n:GESPR.wahlen.length,name:GESPR.name,w:GESPR.wahlen.map(w=>w.txt),zeit:+(GESPR.zeitRest||0)}:null,
    pl:(typeof PLAUSCH!=='undefined'&&PLAUSCH.jetzt)?((PLAUSCH.jetzt.wer?PLAUSCH.jetzt.wer+': ':'')+PLAUSCH.jetzt.text):'',
    ka:(typeof KAPITEL!=='undefined')&&KAPITEL.aktiv, mo:(typeof MOMENT_KARTE!=='undefined')&&MOMENT_KARTE.aktiv,
    fl:(typeof NACHT!=='undefined')?Object.keys(NACHT.flags).filter(k=>NACHT.flags[k]):[],
    x:+(S.x||0),
    e:(${extra||'null'})
  })`;
}

/* Kategorien fuer die Leere-Messung */
const ENTSCHEIDUNG=new Set(['entscheidung']);
const HERAUSFORDERUNG=new Set(['gefahr','angriff','fenster']);
const INFO=new Set(['info','meldung','hinweis','gespraech','plausch','kapitel','moment','szene','angebot','fund']);

function rekorder(L,opt={}){
  const E=c=>L.api.ev(c);
  const ausdruck=zustandsAusdruck(opt.extra);
  const R={ L, E, t:0, log:[], verben:{}, vor:null, passiv:0, dialog:0, modusZeit:{},
    detektor:opt.detektor||null, leise:!!opt.leise };
  R.notiere=(art,txt)=>{ R.log.push({t:+R.t.toFixed(2),art,txt:String(txt)}); };
  R.verb=(name)=>{ R.verben[name]=(R.verben[name]||0)+1; };
  R.lies=()=>JSON.parse(E(ausdruck));
  R.taste=(code,label)=>{ L.taste(code,true); L.taste(code,false); if(label) R.verb(label); };
  R.halte=(code,an)=>L.taste(code,an);
  R.takt=(n=1)=>{
    for(let i=0;i<n;i++){
      E('update('+DT+')');
      R.t+=DT;
      const z=R.lies(), v=R.vor;
      R.modusZeit[z.m]=(R.modusZeit[z.m]||0)+DT;
      const passiv=z.ka||z.mo||/^(titel|intro|cutscene|finale|ende|fahrt)$/.test(z.m)||(opt.passivExtra&&opt.passivExtra(z));
      if(passiv&&!z.g) R.passiv+=DT;
      if(z.g) R.dialog+=DT;
      if(!v||z.m!==v.m) R.notiere('modus',(v?v.m:'-')+' > '+z.m);
      if(z.g&&(!v||!v.g||z.g.text!==v.g.text||z.g.wer!==v.g.wer))
        R.notiere(z.g.n?'entscheidung':'gespraech',z.g.wer+': '+z.g.text.slice(0,70)+(z.g.n?'  ['+z.g.w.join(' | ')+']':''));
      if(z.me&&(!v||z.me!==v.me||z.meT>v.meT+0.05)) R.notiere('meldung',z.me);
      if(z.hi&&(!v||z.hi!==v.hi||z.hiT>v.hiT+0.05)) R.notiere('hinweis',z.hi);
      if(z.pl&&(!v||z.pl!==v.pl)) R.notiere('plausch',z.pl);
      if(z.ka&&(!v||!v.ka)) R.notiere('kapitel','Kapitelkarte');
      if(z.mo&&(!v||!v.mo)) R.notiere('moment','Polaroid-Karte');
      if(v){ const neu=z.fl.filter(f=>!v.fl.includes(f)); if(neu.length) R.notiere('flag',neu.join(',')); }
      if(R.detektor) R.detektor(v,z,R);
      R.vor=z;
    }
  };
  R.sek=(s)=>R.takt(Math.max(1,Math.round(s/DT)));
  /* bis Bedingung (auf dem gelesenen Zustand) - mit Notbremse */
  R.bis=(f,maxS=120)=>{ const ende=R.t+maxS; while(R.t<ende){ R.takt(); if(f(R.vor)) return true; } return false; };

  /* Ein Gespraech wie ein Mensch fuehren: lesen, waehlen, bestaetigen.
     waehler(wahlen, knoten) gibt den Index zurueck (Standard 0). */
  R.gespraech=(waehler,maxKnoten=60)=>{
    let k=0;
    while(R.vor&&R.vor.g&&k<maxKnoten){
      const g=R.vor.g; k++;
      R.sek(lesezeit(g.text,g.n));
      if(!R.vor.g) break;                         // Zeitablauf hat entschieden
      if(R.vor.g.text!==g.text) continue;
      if(g.n){
        let ziel=waehler?waehler(g.w,g):0; if(ziel<0||ziel>=g.n) ziel=0;
        for(let i=0;i<ziel;i++){ R.taste('KeyS','waehlen'); R.takt(); }
        R.taste('KeyE','antworten');
      } else R.taste('KeyE','weiterlesen');
      R.takt(2);
    }
  };
  return R;
}

/* Laengste Strecke ohne Impuls. kategorien: Set der zaehlenden Arten.
   von/bis: Zeitfenster (Sekunden). Gibt die drei laengsten Luecken zurueck. */
function leere(R,kategorien,von=0,bis=Infinity){
  const ts=R.log.filter(e=>kategorien.has(e.art)&&e.t>=von&&e.t<=bis).map(e=>e.t);
  const punkte=[von,...ts,Math.min(bis,R.t)].sort((a,b)=>a-b);
  const luecken=[];
  for(let i=1;i<punkte.length;i++) luecken.push({von:punkte[i-1],bis:punkte[i],dauer:+(punkte[i]-punkte[i-1]).toFixed(2)});
  luecken.sort((a,b)=>b.dauer-a.dauer);
  return luecken.slice(0,3);
}
const alleImpulse=new Set([...ENTSCHEIDUNG,...HERAUSFORDERUNG,...INFO]);
const harteImpulse=new Set([...ENTSCHEIDUNG,...HERAUSFORDERUNG]);

function drucke(R,titel,maxZeilen=400){
  console.log('\n=== '+titel+' ===');
  for(const e of R.log.slice(0,maxZeilen)) console.log(String(e.t.toFixed(1)).padStart(7)+'s  '+e.art.padEnd(13)+e.txt);
  if(R.log.length>maxZeilen) console.log('  ... '+(R.log.length-maxZeilen)+' weitere');
}
function zusammenfassung(R,von,bis){
  const lz=leere(R,alleImpulse,von,bis), lh=leere(R,harteImpulse,von,bis);
  const zaehl={}; for(const e of R.log) zaehl[e.art]=(zaehl[e.art]||0)+1;
  return { gesamtS:+R.t.toFixed(1), passivS:+R.passiv.toFixed(1), dialogS:+R.dialog.toFixed(1),
    modusZeit:Object.fromEntries(Object.entries(R.modusZeit).map(([k,v])=>[k,+v.toFixed(1)])),
    verben:R.verben, ereignisse:zaehl, leereAlles:lz, leereOhneEntscheidungOderGefahr:lh };
}

/* Eine Seite laden und den Speicherstand vorbereiten (vor neuesSpiel). */
function lade(seite,abfrage='?lektion=0'){ return N.lade(seite,abfrage); }

module.exports={ N, lade, rekorder, leere, drucke, zusammenfassung, lesezeit,
  alleImpulse, harteImpulse, ENTSCHEIDUNG, HERAUSFORDERUNG, INFO, DT };
