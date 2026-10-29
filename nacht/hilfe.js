/* NACHTSCHICHT - ENGINE: hilfe. Klassisches Script, kein Modul.

   Zweck: kurze Erst-Tipps im Hinweisplatz der Level (S.hinweis / S.hinweisT), gemerkt je Geraet
   (localStorage 'nachtschicht.hilfe'); Karte WAS JETZT? (Ziel, letzte Tipps, Steuerung, Lektion neu
   oeffnen); nach 2 Niederlagen im selben Level einmal das Angebot, auf LOCKER zu stellen.

   OEFFENTLICHE API (Vertrag, nicht aendern):
   HILFE.tipp(id, pc, handy, dauer)  -> bool. Einmal je id und Geraet; Schlange, wenn ein Hinweis laeuft.
   HILFE.sag(pc, handy, dauer)       -> bool. Sofort, ohne Merker.
   HILFE.lernt(id, n)                -> bool. Noch weniger als n Zaehler-Schritte (Standard n=1).
   HILFE.zaehle(id)                  -> zaehlt einen Schritt fuer id.
   HILFE.jetztMarke()                -> bool. JETZT! am Balken zeigen (LOCKER: immer, sonst bis jetztAnzahl).
   HILFE.ziel(t) / HILFE.zielText()  -> Ziel-Zeile fuer die Karte setzen / lesen.
   HILFE.verlauf()                   -> Kopie der letzten Tipps.
   HILFE.takt(dt)                    -> von kern.js nach update: Schlange, Niederlagen, Angebot.
   HILFE.zeichne()                   -> von kern.js am Ende von draw: Karte oder Angebot.
   HILFE.laeuft() / HILFE.schliessen() / HILFE.wasJetzt() -> Karte WAS JETZT? offen / zu / oeffnen.
   HILFE.darfAuf()                   -> bool. Darf die Karte jetzt aufgehen (Spielzustand, Lehre, Menue, Pause).
   HILFE.lektionNochmal()            -> schliesst die Karte und oeffnet die Lektion (LEHRE.zeige).
   HILFE.kontext()                   -> null, oder {aktion, zwei, block, extras} fuer mobil.js.
   HILFE.niederlage()                -> wird aus takt() beim Wechsel auf 'ende' gerufen (nicht gewonnen).
   HILFE.angebotAktiv() / HILFE.angebotAntwort(ja) -> LOCKER-Angebot.
   HILFE.an() / HILFE.eingeschaltet() / HILFE.setze(b) / HILFE.vergiss() / HILFE.stumm()
   HILFE.text(pc, handy)             -> Anzeigetext (Handy-Text, wenn IS_TOUCH).
   Globale Wrapper: hilfeTipp(id,pc,handy,dauer) und hilfeSag(pc,handy,dauer) (Seiten-Literale).

   EINBAU: kern.js ruft HILFE.takt(dt) nach update und HILFE.zeichne() am Ende; mobil.js fragt
   HILFE.kontext(); eingabe.js Tab -> HILFE.wasJetzt(); pause.js und menue.js haben Eintraege.
   Stumm bei ?lektion=0 (Tests, Messungen), ausser ?hilfe=1. ?hilfe=0 schaltet immer ab.
   Zur Ladezeit nur benutzen, was vorher geladen wird; alles mit typeof-Schutz. */

// Stellschrauben der Hilfen (TUNE-Block)
const HILFE_TUNE={
  zeichenProSek:12,   // Lesetempo: Anzeigedauer = Textlaenge / zeichenProSek + 1
  minDauer:2.5,       // kuerzeste Anzeigedauer in Sekunden
  maxDauer:6,         // laengste Anzeigedauer in Sekunden
  luecke:0.4,         // Pause in Sekunden zwischen zwei Tipps aus der Warteschlange
  schlangeMax:3,      // so viele Tipps duerfen hoechstens warten
  proSeiteMax:10,     // hoechstens so viele Tipps je Seite und Sitzung
  angebotNach:2,      // Niederlagen je Seite, bis das LOCKER-Angebot kommt
  jetztAnzahl:3,      // so viele gelungene Konter lang steht JETZT! am Balken (LOCKER: immer)
  verlaufMax:3,       // so viele letzte Tipps zeigt WAS JETZT?
  sperre:0.5          // Sekunden, in denen das Angebot noch keine Taste annimmt
};
const HILFE_KEY='nachtschicht.hilfe';

var HILFE=(function(){
  // Seite und Abfrage (wie in nacht/lehre.js)
  const abfrage=(typeof location!=='undefined'&&location&&location.search)||'';
  const seite=(((typeof location!=='undefined'&&location&&location.pathname)||'').split('/').pop().toLowerCase())||'index.html';
  const istStumm=/[?&]hilfe=0/.test(abfrage)||(/[?&]lektion=0/.test(abfrage)&&!/[?&]hilfe=1/.test(abfrage));

  const P={neon:'#ff3d8b',gold:'#ffd447',weiss:'#f2f0ff',dim:'#8d86a8',dunkel:'#4a4363'};

  // Gemerkte Daten. Ohne Speicher laeuft alles nur fuer die Sitzung.
  let d={gesehen:{},zaehler:{},niederlagen:{},angebot:{},aus:false};
  try{
    const roh=localStorage.getItem(HILFE_KEY);
    if(roh) Object.assign(d,JSON.parse(roh));
  }catch(e){}
  function speichern(){
    try{ localStorage.setItem(HILFE_KEY,JSON.stringify(d)); }catch(e){}
  }

  // Laufzeit-Zustand der Sitzung
  const Z={schlange:[],freiT:0,proSeite:0,verlauf:[],ziel:'',offen:false,angebot:false,angebotSeit:0,vorModus:null};

  function touch(){ return typeof IS_TOUCH!=='undefined'&&!!IS_TOUCH; }
  function jetzt(){
    try{ return performance.now()/1000; }catch(e){ return Date.now()/1000; }
  }
  function dauerVon(t){
    return Math.min(HILFE_TUNE.maxDauer,Math.max(HILFE_TUNE.minDauer,t.length/HILFE_TUNE.zeichenProSek+1));
  }
  function nimmText(pc,handy){
    const t=touch()?(handy||''):(pc||'');
    return String(t).trim();
  }
  function an(){ return !istStumm&&!d.aus; }
  function eingeschaltet(){ return !d.aus; }
  function stumm(){ return istStumm; }
  function setze(b){ d.aus=!b; speichern(); }
  function vergiss(){
    d.gesehen={}; d.zaehler={}; d.niederlagen={}; d.angebot={};
    speichern(); Z.proSeite=0;
  }

  function tipp(id,pc,handy,dauer){
    if(!an()||!id||d.gesehen[id]||Z.proSeite>=HILFE_TUNE.proSeiteMax) return false;
    if(typeof S==='undefined'||!S) return false;
    const t=nimmText(pc,handy);
    if(!t) return false;
    const dau=dauer||dauerVon(t);
    if(S.hinweisT>0||Z.schlange.length>0){
      if(Z.schlange.length>=HILFE_TUNE.schlangeMax) return false;
      Z.schlange.push({txt:t,dauer:dau});
    } else {
      S.hinweis=t; S.hinweisT=dau;
    }
    d.gesehen[id]=1; speichern(); Z.proSeite++;
    Z.verlauf.push(t);
    while(Z.verlauf.length>HILFE_TUNE.verlaufMax) Z.verlauf.shift();
    return true;
  }
  function sag(pc,handy,dauer){
    if(istStumm||typeof S==='undefined'||!S) return false;
    const t=nimmText(pc,handy);
    if(!t) return false;
    S.hinweis=t; S.hinweisT=dauer||dauerVon(t);
    return true;
  }

  function lernt(id,n){ return an()&&(d.zaehler[id]||0)<(n||1); }
  function zaehle(id){
    d.zaehler[id]=(d.zaehler[id]||0)+1; speichern();
  }
  function jetztMarke(){
    if(istStumm) return false;
    if(typeof schwierigkeit==='function'&&schwierigkeit()==='locker') return true;
    return lernt('konter-jetzt',HILFE_TUNE.jetztAnzahl);
  }
  function ziel(t){ Z.ziel=t?String(t):''; }
  function zielText(){ return Z.ziel; }
  function verlauf(){ return Z.verlauf.slice(); }

  function niederlage(){
    if(istStumm) return;
    d.niederlagen[seite]=(d.niederlagen[seite]||0)+1; speichern();
    let k='normal';
    try{ if(typeof schwierigkeit==='function') k=schwierigkeit(); }catch(e){}
    if(d.niederlagen[seite]>=HILFE_TUNE.angebotNach&&k!=='locker'&&!d.angebot[seite]&&!d.aus){
      Z.angebot=true; Z.angebotSeit=jetzt();
      d.angebot[seite]=1; speichern();
    }
  }
  function angebotAktiv(){ return Z.angebot; }
  function angebotAntwort(ja){
    Z.angebot=false;
    if(ja&&typeof setzeSchwierigkeit==='function'){
      try{ setzeSchwierigkeit('locker'); }catch(e){}
      sag('AB JETZT LOCKER - VIEL GLUECK','AB JETZT LOCKER - VIEL GLUECK',2.5);
    }
  }

  function takt(dt){
    if(typeof S==='undefined'||!S) return;
    const m=S.modus;
    if(m==='ende'&&Z.vorModus!==null&&Z.vorModus!=='ende'&&!S.gewonnen) niederlage();
    Z.vorModus=m;
    if(S.hinweisT>0){ Z.freiT=0; return; }
    Z.freiT+=dt;
    if(Z.schlange.length&&Z.freiT>=HILFE_TUNE.luecke){
      const q=Z.schlange.shift();
      S.hinweis=q.txt; S.hinweisT=q.dauer;
      Z.freiT=0;
    }
  }

  // Ist ein Objekt aktiv? aktiv kann Funktion oder Wahrheitswert sein.
  function istAktiv(a){
    try{ return typeof a==='function'?!!a():!!a; }catch(e){ return false; }
  }
  function darfAuf(){
    try{
      if(typeof S==='undefined'||!S) return false;
      if(['titel','intro','ende','cutscene','pause'].indexOf(S.modus)>=0) return false;
      if(Z.angebot) return false;
      const le=(typeof LEHRE!=='undefined'&&LEHRE)||(typeof window!=='undefined'&&window&&window.LEHRE)||null;
      if(le&&istAktiv(le.aktiv)) return false;
      if(typeof kapitelAktiv==='function'&&kapitelAktiv()) return false;
      const me=(typeof MENUE!=='undefined'&&MENUE)||(typeof window!=='undefined'&&window&&window.MENUE)||null;
      if(me&&istAktiv(me.aktiv)) return false;
      const pa=(typeof PAUSE!=='undefined'&&PAUSE)||(typeof window!=='undefined'&&window&&window.PAUSE)||null;
      if(pa&&istAktiv(pa.aktiv)) return false;
      return true;
    }catch(e){ return false; }
  }
  function wasJetzt(){
    if(!darfAuf()) return false;
    Z.offen=true;
    return true;
  }
  function laeuft(){ return Z.offen; }
  function schliessen(){ Z.offen=false; }
  function lektionNochmal(){
    Z.offen=false;
    try{
      const le=(typeof window!=='undefined'&&window.LEHRE)||null;
      if(le&&typeof le.zeige==='function') le.zeige();
    }catch(e){}
  }
  function kontext(){
    if(Z.angebot) return {aktion:'LOCKER',zwei:'NEIN',block:false,extras:[]};
    if(Z.offen) return {aktion:'WEITER',zwei:'UEBEN',block:false,extras:[]};
    return null;
  }

  function taste(e){
    try{
      if(!Z.angebot&&!Z.offen) return;
      if(e.code==='KeyM'||e.code==='KeyF'||e.ctrlKey||e.metaKey||e.altKey) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if(e.repeat) return;
      if(Z.angebot){
        if(jetzt()-Z.angebotSeit<HILFE_TUNE.sperre) return;
        if(e.code==='KeyE'||e.code==='Enter'||e.code==='NumpadEnter') angebotAntwort(true);
        else if(e.code==='Space'||e.code==='Escape'||e.code==='Backspace') angebotAntwort(false);
        return;
      }
      if(e.code==='KeyL'||e.code==='Space'){ lektionNochmal(); return; }
      if(['KeyE','Enter','NumpadEnter','Escape','Tab','Backspace'].indexOf(e.code)>=0) schliessen();
    }catch(err){}
  }
  if(typeof addEventListener==='function') addEventListener('keydown',taste,true);

  function lektionsEintrag(){
    try{
      const L=(typeof LEKTIONEN!=='undefined'&&LEKTIONEN)||null;
      const e=L&&L[seite];
      return e&&e.schritte&&e.schritte.length?e:null;
    }catch(err){ return null; }
  }

  function zeichneKarte(){
    ctx.fillStyle='rgba(7,6,13,0.92)';
    ctx.fillRect(0,0,W,H);
    textGlowC('WAS JETZT?',10,P.neon,1);
    let y=24;
    const breite=Math.min(W-40,260);
    // Woerter umbrechen, jede Zeile mit textW auf die Breite pruefen
    function zeilen(txt,farbe){
      const woerter=String(txt).toUpperCase().split(/\s+/);
      let zeile='';
      const zeige=(z)=>{ textC(z,y,farbe); y+=8; };
      woerter.forEach(w=>{
        const probe=zeile?zeile+' '+w:w;
        if(zeile&&textW(probe)>breite){ zeige(zeile); zeile=w; }
        else zeile=probe;
      });
      if(zeile) zeige(zeile);
    }
    textC('ZIEL',y,P.dunkel); y+=8;
    zeilen(Z.ziel||'SCHAU DICH UM',P.gold); y+=3;
    if(Z.verlauf.length){
      textC('ZULETZT',y,P.dunkel); y+=8;
      Z.verlauf.forEach(t=>zeilen(t,P.weiss));
      y+=3;
    }
    const le=lektionsEintrag();
    if(le){
      textC('STEUERUNG',y,P.dunkel); y+=8;
      for(const s of le.schritte){
        if(y>H-22) break;
        const lab=touch()?((s.touch==='KNOPF'&&s.btn)?s.btn:s.touch):s.taste;
        textC(String(lab)+'  '+String(s.was),y,P.dim); y+=8;
      }
    }
    textC(touch()?'WEITER ODER UEBEN: KNOEPFE RECHTS':'E: WEITER   L: STEUERUNG UEBEN',H-10,P.dunkel);
  }
  function zeichneAngebot(){
    const bw=Math.min(W-24,220), bh=50;
    const bx=Math.round((W-bw)/2), by=Math.round(H/2-bh/2);
    ctx.fillStyle='#000000ee';
    ctx.fillRect(bx,by,bw,bh);
    ctx.fillStyle=P.neon;
    ctx.fillRect(bx,by,bw,1);
    ctx.fillRect(bx,by+bh-1,bw,1);
    textC('ZU SCHWER?',by+6,P.gold);
    textC('AUF LOCKER STELLEN?',by+16,P.weiss);
    textC('LANGSAMERE GEGNER, MEHR ZEIT.',by+25,P.dim);
    textC(touch()?'LOCKER: JA   NEIN: SO LASSEN':'E: JA   LEER: NEIN',by+38,P.gold);
  }
  function zeichne(){
    try{
      if(typeof ctx==='undefined'||!ctx) return;
      if(Z.offen) zeichneKarte();
      else if(Z.angebot) zeichneAngebot();
    }catch(e){}
  }

  return {
    tipp, sag, lernt, zaehle, jetztMarke, ziel, zielText, verlauf, takt, zeichne,
    laeuft, wasJetzt, darfAuf, schliessen, lektionNochmal, kontext, niederlage,
    angebotAktiv, angebotAntwort, an, eingeschaltet, setze, vergiss, stumm,
    text: nimmText
  };
})();

function hilfeTipp(id,pc,handy,dauer){ return HILFE.tipp(id,pc,handy,dauer); }
function hilfeSag(pc,handy,dauer){ return HILFE.sag(pc,handy,dauer); }
if(typeof window!=='undefined') window.HILFE=HILFE;
