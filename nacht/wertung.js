/* Rang am Levelende (Engine, E4 aus docs/gameplay/PLAN.md). Klassisches Script, kein Modul.

   OEFFENTLICHE API (Vertrag, nicht aendern):
   WERTUNG.abschluss(level, punkte, zeilen) -> {rang:'S'|'A'|'B'|'C', neuerBest:bool}
       level 1..8; punkte 0..100 (das Level rechnet, hier wird nur begrenzt);
       zeilen: bis zu 4 Zeilen {name:'ZEIT', wert:'1:42', pkt:30}.
       Grenzen: S>=90, A>=75, B>=55, sonst C. Es gibt kein "durchgefallen".
       Der Bestrang steht unter localStorage 'nachtschicht.rang'+level und wird nur verbessert.
   WERTUNG.best(level)  -> 'S'|'A'|'B'|'C'|null
   WERTUNG.zeichne()    -> von kern.js nach draw(), nur wenn aktiv und S.modus==='ende'.
                           Bildschirmkoordinaten, nach den Teilchen (SAFT) zeichnen.
   WERTUNG.reset()      -> aktiv=false (das Level ruft es in neuesSpiel).
   WERTUNG.alle()       -> {1:'A', 2:null, ..., 8:null}

   Fehlertolerant: ohne localStorage, ohne S oder ctx, ohne MUSIK/SAFT passiert nichts
   und es gibt keine Ausnahme. Canvas-Text nur Grossbuchstaben ohne Umlaute.
*/

/* Stellschrauben der Tafel. Zeiten in Sekunden seit abschluss(). */
const WERTUNG_TUNE={
  grenzen:{S:90,A:75,B:55},     // Mindestpunkte je Rang; darunter der naechste Rang
  zeileAb:0.3,                  // bis zur ersten Zeile
  zeilenAbstand:0.3,            // danach je Zeile; die Summenzeile folgt nach der letzten
  zaehlDauer:0.5,               // so lange zaehlen die Punkte einer Zeile hoch
  buchstabeAb:2.2,              // ab hier der grosse Rang-Buchstabe (Stinger, Konfetti bei S/A)
  schrumpfAb:3.4,               // ab hier schrumpft die Tafel in die obere rechte Ecke ...
  schrumpfDauer:0.4,            // ... und ist nach so viel Sekunden nur noch das Abzeichen
  zeilenMax:4,                  // mehr Zeilen aus dem Level werden abgeschnitten
  nameMax:12,                   // Zeichen je Spalte, damit sich die Spalten nicht ueberlappen
  wertMax:8,
  konfetti:24,                  // Teilchen beim grossen Buchstaben
  breite:176,                   // Tafelbreite in Pixeln
  zeilenHoehe:12,               // Zeilenabstand (die Schrift ist 5 Pixel hoch)
  abzeichenBreite:40,
  abzeichenRand:4,              // Abstand des Abzeichens zur Ecke
  farbe:{S:'#ffd84d',A:'#7ff0ff',B:'#9dff7a',C:'#ff9e6b'},
  schrift:'#f2efff',
  tafel:'rgba(8,6,20,0.95)'     // fast deckend: der Endtext darunter soll nicht durchscheinen
};

const WERTUNG=(function(){
  const T=WERTUNG_TUNE;
  const RAENGE=['S','A','B','C'];          // Liste der Raenge
  const ORDNUNG={S:3,A:2,B:1,C:0};         // macht "besser" vergleichbar
  const LEVEL_MAX=8;
  const SCHLUESSEL='nachtschicht.rang';    // + Levelnummer, z. B. nachtschicht.rang3
  const GROSS=5;                           // Schriftgroesse des Rang-Buchstabens
  const BUCHSTABE_H=5*GROSS;               // 5 Reihen Glyph mal Skalierung

  // Wandzeit statt S.t: bewegeTiefe() ueberschreibt die Uhr des Levels, die Tafel soll
  // trotzdem gleichmaessig ablaufen. Ohne performance faellt es auf Date.now zurueck; beim
  // Start und beim Zeichnen wird dieselbe Quelle benutzt, damit die Differenz stimmt.
  const jetzt=function(){ try{ return performance.now(); }catch(e){ return Date.now(); } };

  const rangVon=function(p){
    const g=T.grenzen;
    return p>=g.S?'S':p>=g.A?'A':p>=g.B?'B':'C';
  };
  const gueltig=function(n){ n=Number(n); return Number.isInteger(n)&&n>=1&&n<=LEVEL_MAX; };

  // Speicher: jeder Zugriff in try, weil localStorage im privaten Fenster fehlen oder werfen kann.
  const lese=function(n){
    try{ const v=localStorage.getItem(SCHLUESSEL+n); return RAENGE.indexOf(v)>=0?v:null; }
    catch(e){ return null; }
  };
  const schreibe=function(n,rang){
    try{ localStorage.setItem(SCHLUESSEL+n,rang); }catch(e){}
  };
  // Cache je Level: das Startmenue fragt jeden Frame, gelesen wird hoechstens einmal.
  const _best={};
  const bestVon=function(n){
    if(!(n in _best)) _best[n]=lese(n);
    return _best[n];
  };

  const sicher=function(f){ try{ f(); }catch(e){} };   // fremde Module duerfen den Bild nicht stoppen
  const anteil=function(t,ti){ const f=(t-ti)/T.zaehlDauer; return f<0?0:f>1?1:f; };   // 0..1 Zaehlfortschritt
  const lerp=function(a,b,f){ return Math.round(a+(b-a)*f); };
  const breiteVon=function(s,sz){ return typeof textW==='function'?textW(s,sz):String(s).length*4*sz-sz; };

  let st={aktiv:false};

  function tafel(x,y,w,h){ ctx.fillStyle=T.tafel; ctx.fillRect(x,y,w,h); }

  function abschluss(level,punkte,zeilen){
    const ok=gueltig(level), n=ok?Number(level):0;
    const p=Math.max(0,Math.min(100,Number(punkte)||0));
    const rang=rangVon(p);
    const alt=ok?bestVon(n):null;
    // "neu" heisst: erster Bestrang oder besser als der bisherige. Gleich oder schlechter aendert nichts.
    const neuerBest=ok&&(alt===null||ORDNUNG[rang]>ORDNUNG[alt]);
    if(neuerBest){ _best[n]=rang; schreibe(n,rang); }
    // Erfolge (nacht/erfolge.js): erster Rang S, und Rang S auf allen acht Levels. Fehler stoeren den Abschluss nicht.
    try{
      if(typeof ERFOLG!=='undefined'&&ERFOLG&&typeof ERFOLG.gib==='function'){
        if(rang==='S') ERFOLG.gib('rang_s');
        let alleS=true;
        for(let k=1;k<=LEVEL_MAX;k++){ if(best(k)!=='S'){ alleS=false; break; } }
        if(alleS) ERFOLG.gib('alles_s');
      }
    }catch(e){}
    const zl=[];
    if(Array.isArray(zeilen)){
      for(let i=0;i<zeilen.length&&zl.length<T.zeilenMax;i++){
        const z=zeilen[i]||{};
        zl.push({ name:String(z.name==null?'':z.name).toUpperCase().slice(0,T.nameMax),
                  wert:String(z.wert==null?'':z.wert).toUpperCase().slice(0,T.wertMax),
                  pkt:Number(z.pkt)||0 });
      }
    }
    st={ aktiv:true, n:n, rang:rang, neu:neuerBest, p:p, zeilen:zl, t0:jetzt(), gross:false,
         titel: n?'LEVEL '+n:'NACHT', abz:'RANG '+rang };
    return {rang:rang, neuerBest:neuerBest};
  }

  // Das Abzeichen oben rechts; bleibt bis zum Reset stehen.
  function abzeichen(bw){
    const x=bw-T.abzeichenBreite-T.abzeichenRand, y=T.abzeichenRand, h=st.neu?24:14;
    tafel(x,y,T.abzeichenBreite,h);
    if(typeof text!=='function') return;
    text(st.abz,x+6,y+4,T.farbe[st.rang],1);
    if(st.neu) text('NEU!',x+6,y+13,T.schrift,1);
  }

  function zeichne(){
    if(!st.aktiv) return;
    if(typeof S==='undefined'||!S) return;
    if(typeof ctx==='undefined'||!ctx) return;
    const t=(jetzt()-st.t0)/1000;
    const bw=typeof W==='number'?W:320, bh=typeof H==='number'?H:180;
    const nZ=st.zeilen.length;
    const hoehe=18+(nZ+1)*T.zeilenHoehe+4+BUCHSTABE_H+8;   // Kopf, Zeilen+Summe, Abstand, Buchstabe, Rand
    const br=T.breite, x0=Math.round((bw-br)/2), y0=Math.round((bh-hoehe)/2);

    // Phase 3: nur noch das Abzeichen
    if(t>=T.schrumpfAb+T.schrumpfDauer){ abzeichen(bw); return; }
    // Phase 2: die leere Tafel wandert in die Ecke und wird zum Abzeichen
    if(t>=T.schrumpfAb){
      const f=(t-T.schrumpfAb)/T.schrumpfDauer;
      tafel(lerp(x0,bw-T.abzeichenBreite-T.abzeichenRand,f), lerp(y0,T.abzeichenRand,f),
            lerp(br,T.abzeichenBreite,f), lerp(hoehe,st.neu?24:14,f));
      return;
    }

    // Phase 1: Tafel mittig, Zeilen nacheinander, dann der grosse Buchstabe
    tafel(x0,y0,br,hoehe);
    const sch=typeof text==='function'?text:null;
    const farbe=T.farbe[st.rang];
    const yZ=y0+18;
    if(sch) sch(st.titel,x0+10,y0+6,T.schrift,1);

    for(let i=0;i<nZ;i++){
      const ti=T.zeileAb+i*T.zeilenAbstand;
      if(t<ti||!sch) continue;
      const z=st.zeilen[i], y=yZ+i*T.zeilenHoehe;
      sch(z.name,x0+10,y,T.schrift,1);
      sch(z.wert,x0+70,y,T.schrift,1);
      const v=String(Math.round(z.pkt*anteil(t,ti)));
      sch(v,x0+br-10-breiteVon(v,1),y,T.schrift,1);
    }

    const tg=T.zeileAb+nZ*T.zeilenAbstand;
    if(t>=tg){
      const y=yZ+nZ*T.zeilenHoehe;
      ctx.fillStyle='#4a4670';
      ctx.fillRect(x0+8,y-3,br-16,1);   // Trennlinie vor der Summe
      if(sch){
        sch('GESAMT',x0+10,y,T.schrift,1);
        const v=String(Math.round(st.p*anteil(t,tg)));
        sch(v,x0+br-10-breiteVon(v,1),y,farbe,1);
      }
    }

    const yG=yZ+(nZ+1)*T.zeilenHoehe+4;
    if(t>=T.buchstabeAb){
      if(sch) sch(st.rang,x0+Math.round((br-breiteVon(st.rang,GROSS))/2),yG,farbe,GROSS);
      if(!st.gross){
        st.gross=true;   // einmal pro Ende, egal wie oft das Bild neu gezeichnet wird
        sicher(function(){ if(typeof MUSIK!=='undefined'&&MUSIK&&typeof MUSIK.stinger==='function') MUSIK.stinger('rang'); });
        if(st.rang==='S'||st.rang==='A'){
          sicher(function(){ if(typeof SAFT!=='undefined'&&SAFT&&typeof SAFT.teilchen==='function')
            SAFT.teilchen('konfetti',x0+Math.round(br/2),yG+Math.round(BUCHSTABE_H/2),T.konfetti,0); });
        }
      }
    }
  }

  function best(level){ return gueltig(level)?bestVon(Number(level)):null; }

  function alle(){
    const o={};
    for(let n=1;n<=LEVEL_MAX;n++) o[n]=bestVon(n);
    return o;
  }

  function reset(){ st.aktiv=false; }

  return { abschluss:abschluss, best:best, zeichne:zeichne, reset:reset, alle:alle };
})();

if(typeof window!=='undefined') window.WERTUNG=WERTUNG;
