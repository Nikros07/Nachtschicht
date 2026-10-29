/* ============================================================================
   NACHTSCHICHT - ENGINE: lehre
   Das Zwischenbild vor jedem Level: was ist hier NEU an der Steuerung?

   Bisher stand die Bedienung als Tastenliste auf dem Titelbild - zum Lesen,
   nicht zum Probieren. Hier leuchtet jede Taste auf, sobald man sie drueckt:
   man merkt, dass sie funktioniert, bevor es ernst wird. Am Handy sind es
   dieselben Schritte; die Knoepfe des Bedienfelds passen sich an (siehe
   mobilKontext unten).

   Wann es erscheint: beim ersten Mal je Level, direkt wenn das Intro beginnt.
   Danach nie wieder. Immer erzwingen: ?lektion=1 an die Adresse. Abschalten
   (Tests, Messungen): ?lektion=0.

   Eingebaut ist es so: kern.js fragt in jedem Bild LEHRE.pruefe(). Ist die
   Lektion aktiv, laeuft das Level nicht - die Tasten gehen hierher und
   nicht ans Level (sie werden im Capture abgefangen).

   Die Uebungspuppe hat eine eigene Uhr (PUPPE_TUNE) und braucht kampf.js
   nicht - sie laeuft in allen Leveln, auch in den funf ohne kampf.js.

   Alles Tunbare steht in LEKTIONEN und PUPPE_TUNE. Neues Level = ein Eintrag.
   ========================================================================== */

/* Ein Schritt:  gr   Tastengruppen, JEDE Gruppe muss einmal gedrueckt werden
                      ([['KeyA','ArrowLeft'],['KeyD','ArrowRight']] = links UND rechts)
                 taste  was auf der Taste steht      touch  was am Handy dort steht
                 was    was sie tut                   opt    true = freiwillig
                 btn    Aufschrift des Handy-Knopfs   block  true = Blockknopf zeigen
                 stick  true = am Handy per Stick (kein Blockknopf)
                 puppe  'konter'|'block'|'rolle' = Uebungspuppe, erst nach der
                        richtigen Antwort erledigt
                 textTouch  optional: Absaetze fuer das Handy (sonst text) */
const LEKTIONEN={
  'index.html':{ titel:'DIE SCHULE',
    text:['DU BIST EINGESPERRT. SCHLEICH DICH AN DEN LEHRERN VORBEI UND FIND DEN SCHLUESSEL.'],
    textTouch:['DU BIST EINGESPERRT. SCHLEICH DICH AN DEN LEHRERN VORBEI UND FIND DEN SCHLUESSEL.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['ShiftLeft','ShiftRight']], taste:'SHIFT', touch:'STICK HALB', was:'SCHLEICHEN - LEISE, WENIGER SICHT', stick:true },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'TUER, SPIND (VERSTECK), DURCHSUCHEN', btn:'AKTION' },
      { gr:[['ArrowUp','KeyW'],['ArrowDown','KeyS']], taste:'W S', touch:'STICK', was:'TREPPE HOCH, RUNTER', opt:true },
      { gr:[['Space']], taste:'LEER', touch:'SPRUNG', was:'SPRINGEN', opt:true, btn:'SPRUNG' },
      { gr:[['KeyQ']], taste:'Q', touch:'LAMPE', was:'TASCHENLAMPE - MACHT DICH SICHTBAR', opt:true, btn:'LAMPE' },
      { gr:[['KeyR']], taste:'R', touch:'WERFEN', was:'WERFEN - LENKT AB', opt:true, btn:'WERFEN' },
    ]},
  'level2.html':{ titel:'BEI MORITZ',
    text:['SUCH DIE DINGE, REDE MIT DEN LEUTEN. TRINKEN MACHT MUTIG, ABER LANGSAM.',
          'AM ENDE KOMMT EINER: WARTE, BIS DER BALKEN GOLD IST - DANN E.'],
    textTouch:['SUCH DIE DINGE, REDE MIT DEN LEUTEN. TRINKEN MACHT MUTIG, ABER LANGSAM.',
          'AM ENDE KOMMT EINER: WARTE, BIS DER BALKEN GOLD IST - DANN KONTER.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'REDEN, SUCHEN, TRINKEN', btn:'AKTION' },
      { gr:[['KeyE']], taste:'E', touch:'KONTER', was:'KONTERN, WENN DER BALKEN GOLD IST', btn:'KONTER', puppe:'konter' },
    ]},
  'level3.html':{ titel:'DER NACHTBUS',
    text:['ERST RENNEN, DANN LEISE. KEIN TICKET - LASS DICH NICHT ERWISCHEN.',
          'GESPRAECH: A D WAEHLT, E BESTAETIGT. AM ENDE WIRD GEPRUEGELT.'],
    textTouch:['ERST RENNEN, DANN LEISE. KEIN TICKET - LASS DICH NICHT ERWISCHEN.',
          'GESPRAECH: ANTWORT ANTIPPEN. AM ENDE WIRD GEPRUEGELT.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['Space']], taste:'LEER', touch:'SPRUNG', was:'SPRINGEN (HINDERNISSE)', btn:'SPRUNG' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'REDEN, VERSTECKEN, SCHLAGEN', btn:'AKTION' },
      { gr:[['ShiftLeft','ShiftRight']], taste:'SHIFT', touch:'BLOCK', was:'BLOCKEN GEGEN EINEN ANGRIFF', block:true, puppe:'block' },
    ]},
  'level4.html':{ titel:'DIE SCHLANGE',
    text:['EIN GEGNER. WARTE, BIS DER BALKEN GOLD IST - DANN E.',
          'RAMMEN KANN MAN NICHT KONTERN: AUSWEICHEN.'],
    textTouch:['EIN GEGNER. WARTE, BIS DER BALKEN GOLD IST - DANN KONTER.',
          'RAMMEN KANN MAN NICHT KONTERN: AUSWEICHEN.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'KONTERN IM GOLDENEN BEREICH', btn:'KONTER', puppe:'konter' },
      { gr:[['ShiftLeft','ShiftRight']], taste:'SHIFT', touch:'BLOCK', was:'BLOCKEN - KOSTET KRAFT', block:true },
      { gr:[['Space']], taste:'LEER', touch:'ROLLE', was:'ROLLEN - WEICHT AUS', btn:'ROLLE' },
      { gr:[['ArrowUp','KeyW'],['ArrowDown','KeyS']], taste:'W S', touch:'STICK', was:'NACH HINTEN, VORNE AUSWEICHEN', opt:true },
    ]},
  'level5.html':{ titel:'DER CLUB',
    text:['REDEN ENTSCHEIDET. IM GESPRAECH: A D WAEHLT, E BESTAETIGT.',
          'WAS DU SAGST, ZAEHLT - AUCH SPAETER IN DER NACHT.'],
    textTouch:['REDEN ENTSCHEIDET. IM GESPRAECH: ANTWORT ANTIPPEN.',
          'WAS DU SAGST, ZAEHLT - AUCH SPAETER IN DER NACHT.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'REDEN, TRINKEN, TUER', btn:'AKTION' },
    ]},
  'level6.html':{ titel:'AFTERHOUR',
    text:['DIE FLURE WIEDERHOLEN SICH. SUCH DEINE ERINNERUNGEN.',
          'MUEDE? AUFS SOFA. LICHTER UND GESPRAECHE MACHEN WACH.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'REDEN, SUCHEN, AUSRUHEN', btn:'AKTION' },
      { gr:[['Space']], taste:'LEER', touch:'SPRUNG', was:'HALTEN: SCHWEBEN, LICHTER FANGEN', btn:'SPRUNG', opt:true },
    ]},
  'level7.html':{ titel:'DER SPAETI',
    text:['WASSER UND SNACKS KOSTEN GELD. WER PLEITE IST, SAMMELT PFAND.',
          'IM GESPRAECH: A D WAEHLT, E BESTAETIGT.'],
    textTouch:['WASSER UND SNACKS KOSTEN GELD. WER PLEITE IST, SAMMELT PFAND.',
          'IM GESPRAECH: ANTWORT ANTIPPEN.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['KeyE']], taste:'E', touch:'KNOPF', was:'REDEN, AUFHEBEN, KASSE', btn:'AKTION' },
      { gr:[['KeyE']], taste:'E HALTEN', touch:'HALTEN', was:'ZIELEN, LOSLASSEN WIRFT (PFANDWURF)', btn:'AKTION', opt:true },
    ]},
  'level8.html':{ titel:'DER LETZTE WEG',
    text:['LAUF NACH HAUSE. IM SCHATTEN STEIGT DIE SONNE LANGSAMER.',
          'WENN SIE DICH STELLEN: IM GOLD E KONTERT, SHIFT BLOCKT, LEER ROLLT.'],
    textTouch:['LAUF NACH HAUSE. IM SCHATTEN STEIGT DIE SONNE LANGSAMER.',
          'WENN SIE DICH STELLEN: IM GOLD KONTERN, BLOCKEN, ROLLEN.'],
    schritte:[
      { gr:[['KeyA','ArrowLeft'],['KeyD','ArrowRight']], taste:'A D', touch:'STICK', was:'LAUFEN' },
      { gr:[['Space']], taste:'LEER', touch:'SPRUNG', was:'SPRINGEN UEBER ALLES', btn:'SPRUNG' },
      { gr:[['ShiftLeft','ShiftRight']], taste:'SHIFT', touch:'BLOCK', was:'BLOCKEN IM KAMPF', opt:true, block:true },
      { gr:[['Space']], taste:'LEER', touch:'ROLLE', was:'ROLLEN GEGEN EINEN ANGRIFF', btn:'ROLLE', puppe:'rolle' },
    ]},
};

const LEHRE_SKIP=0.6;       // so lange ENTER halten, dann ist die Lektion uebersprungen
const LEHRE_KEY='nachtschicht.lektion.';

/* Uebungspuppe: eigene Uhr, kein kampf.js noetig. Sie holt endlos aus, bis der
   Schritt erledigt ist. Ausholzeit je gelungenem Konter: erst langsam, dann
   schneller. Stellschrauben hier, nicht in der Logik. */
const PUPPE_TUNE={
  ausholen:[1.2,0.9,0.7], // Ausholzeit je gelungenem Konter (Index = Treffer)
  fenster:0.34,           // Konterfenster = letzter Anteil des Ausholens (wie KAMPF.konterAnteil)
  blockAb:0.5,            // Block/Rolle zaehlen ab diesem Anteil des Ausholens und im Schlag
  schlag:0.2, pause:0.7,  // Sekunden
  rueckmeldung:0.9,       // so lange steht GENAU!/ZU FRUEH
  konterNoetig:3, konterNoetigLocker:2,   // Konter in Folge, bis der Schritt erledigt ist
};
function neuePuppe(){ return { art:'puppe', zustand:'ausholen', zT:0, ausholenDauer:PUPPE_TUNE.ausholen[0],
  fensterAnteil:PUPPE_TUNE.fenster, treffer:0, versucht:false, rueck:'', rueckT:0 }; }
function puppeTakt(p,dt){
  p.zT+=dt; if(p.rueckT>0) p.rueckT-=dt;
  if(p.zustand==='ausholen'&&p.zT>=p.ausholenDauer){ p.zustand='schlag'; p.zT=0; }
  else if(p.zustand==='schlag'&&p.zT>=PUPPE_TUNE.schlag){ p.zustand='pause'; p.zT=0; }
  else if(p.zustand==='pause'&&p.zT>=PUPPE_TUNE.pause){ p.zustand='ausholen'; p.zT=0; p.versucht=false;
    p.ausholenDauer=PUPPE_TUNE.ausholen[Math.min(p.treffer,PUPPE_TUNE.ausholen.length-1)]; }
}
const konterNoetig=()=>(typeof schwierigkeit==='function'&&schwierigkeit()==='locker')?PUPPE_TUNE.konterNoetigLocker:PUPPE_TUNE.konterNoetig;

/* 'wann' liest nur den Zustand der Puppe, nie Level-Phasenlogik. */
const PUPPE_ARTEN={
  konter:{ codes:['KeyE'], wann:p=>p.zustand==='ausholen'&&!p.versucht&&p.zT>=p.ausholenDauer*(1-PUPPE_TUNE.fenster) },
  block:{ codes:['ShiftLeft','ShiftRight'], wann:p=>(p.zustand==='ausholen'&&p.zT>=p.ausholenDauer*PUPPE_TUNE.blockAb)||p.zustand==='schlag' },
  rolle:{ codes:['Space'], wann:p=>(p.zustand==='ausholen'&&p.zT>=p.ausholenDauer*PUPPE_TUNE.blockAb)||p.zustand==='schlag' },
};

window.LEHRE=(function(){
  const seite=((typeof location!=='undefined'&&location.pathname)||'').split('/').pop().toLowerCase()||'index.html';
  const abfrage=(typeof location!=='undefined'&&location.search)||'';
  const L=LEKTIONEN[seite]||null;
  const erzwungen=/[?&]lektion=1/.test(abfrage), aus=/[?&]lektion=0/.test(abfrage);
  const gesehen=()=>{ try{ return !!localStorage.getItem(LEHRE_KEY+seite); }catch(e){ return false; } };
  const merke=()=>{ try{ localStorage.setItem(LEHRE_KEY+seite,'1'); }catch(e){} };

  const Z={ aktiv:false, fertig:false, L, t:0, skipT:0, erledigt:[], runter:new Set() };

  /* Eigener Umbruch: dialog.js (umbrich) ist nicht in jedem Level geladen -
     Level 4 hat keine Gespraeche. */
  const umbruch=(txt,maxB)=>{ const zl=[]; let z='';
    for(const w of String(txt).split(' ')){ const t=z?z+' '+w:w;
      if(textW(t)>maxB&&z){ zl.push(z); z=w; } else z=t; }
    if(z) zl.push(z); return zl; };

  Z.alleErledigt=()=>!!L&&L.schritte.every((s,i)=>s.opt||Z.erledigt[i]);

  /* Eine frische Lektion: alle Schritte offen, Puppen stehen bereit. */
  const starten=function(){
    Z.aktiv=true; Z.t=0; Z.skipT=0; Z.runter.clear();
    Z.erledigt=L.schritte.map(()=>false);
    L.schritte.forEach((s)=>{
      s._offen=s.gr.map(()=>true);
      if(s.puppe) s._puppe=neuePuppe();
    });
  };

  /* Das Gesamte fragt kern.js in jedem Bild. true = Lektion laeuft, Level ruht. */
  Z.pruefe=function(){
    if(Z.aktiv) return true;
    if(Z.fertig||!L||aus) return false;
    if(typeof S==='undefined'||!S||S.modus!=='intro') return false;
    if(gesehen()&&!erzwungen){ Z.fertig=true; return false; }
    if(typeof kapitelAktiv==='function'&&kapitelAktiv()) return false;   // erst die Kapitelkarte
    starten();
    return true;
  };

  /* Oeffnet die Lektion jederzeit wieder (WAS JETZT? in nacht/hilfe.js). */
  Z.zeige=function(){
    if(!L) return false;
    Z.fertig=false;
    starten();
    return true;
  };

  Z.beenden=function(){
    Z.aktiv=false; Z.fertig=true; merke();
    try{ if(typeof piep==='function') piep(660,.06,'sine',.04); }catch(e){}
  };

  /* Eine Taste kam. Gehoert sie zu einem Schritt, leuchtet er. */
  Z.taste=function(code,runter){
    if(!Z.aktiv) return;
    if(!runter){ Z.runter.delete(code); return; }
    Z.runter.add(code);
    /* Der Tipp, der das Intro uebersprungen hat, darf nicht schon KNOPF abhaken. */
    if(Z.t<.4&&code==='KeyE'&&typeof IS_TOUCH!=='undefined'&&IS_TOUCH) return;
    const weiter=(code==='Enter')||(code==='KeyE'&&Z.alleErledigt());
    if(weiter&&Z.alleErledigt()){ Z.beenden(); return; }
    L.schritte.forEach((s,i)=>{
      /* Puppe: nur die richtige Antwort auf einen Ausholer zaehlt - eine
         Taste zur falschen Zeit bleibt wirkungslos, der Schritt bleibt offen. */
      if(s.puppe){
        const art=PUPPE_ARTEN[s.puppe], p=s._puppe;
        if(!art||!art.codes.includes(code)||Z.erledigt[i]||!p) return;
        if(art.wann(p)){
          p.versucht=true;
          if(s.puppe==='konter'){
            p.treffer++;
            p.rueck=p.treffer>=konterNoetig()?'GENAU!':'GENAU! '+p.treffer+'/'+konterNoetig();
            p.rueckT=PUPPE_TUNE.rueckmeldung;
            if(p.treffer<konterNoetig()) return;
          } else { p.rueck='GENAU!'; p.rueckT=PUPPE_TUNE.rueckmeldung; }
          s._offen[0]=false; Z.erledigt[i]=true;
          try{ if(typeof piep==='function') piep(520+i*70,.05,'square',.04); }catch(e){}
        } else {
          if(p.zustand==='ausholen') p.versucht=true;
          if(s.puppe==='konter') p.treffer=0;
          p.rueck=p.zustand==='schlag'?'ZU SPAET':'ZU FRUEH';
          p.rueckT=PUPPE_TUNE.rueckmeldung;
          try{ if(typeof piep==='function') piep(220,.06,'square',.04); }catch(e){}
        }
        return;
      }
      s.gr.forEach((g,k)=>{ if(s._offen[k]&&g.includes(code)) s._offen[k]=false; });
      if(!Z.erledigt[i]&&s._offen.every(o=>!o)){
        Z.erledigt[i]=true;
        try{ if(typeof piep==='function') piep(520+i*70,.05,'square',.04); }catch(e){}
      }
    });
  };

  Z.takt=function(dt){
    Z.t+=dt;
    /* ENTER halten ueberspringt - auch wenn noch nicht alles probiert ist. */
    /* Am Handy gibt es keine Enter-Taste: dort zaehlt das Halten des Hauptknopfs (E),
       langsamer, damit ein zu langes Tippen auf KNOPF nicht aus Versehen ueberspringt. */
    const halt=Z.runter.has('Enter')?1:((typeof IS_TOUCH!=='undefined'&&IS_TOUCH&&Z.runter.has('KeyE')&&Z.t>1)?.5:0);
    if(halt){ Z.skipT+=dt*halt; if(Z.skipT>=LEHRE_SKIP) Z.beenden(); }
    else Z.skipT=Math.max(0,Z.skipT-dt*2);
    /* Puppen: eigene Uhr, holen endlos neu aus. */
    L.schritte.forEach(s=>{ if(s._puppe) puppeTakt(s._puppe,dt); });
  };

  /* Am Handy richtet sich das Bedienfeld nach der Lektion: nur die Knoepfe,
     die in ihr vorkommen, damit jeder Schritt dort auch ausfuehrbar ist. */
  Z.mobilKontext=function(){
    const k={ aktion:null, zwei:null, block:false, extras:[] };
    /* Mehrere Schritte teilen sich Space (z.B. SPRUNG und, spaeter in der
       Lektion, ROLLE): solange der frueheste davon noch offen ist, gehoert
       ihm der Knopf - sonst wuerde der letzte Schritt immer gewinnen. */
    const leer=[];
    L.schritte.forEach((s,i)=>{
      const c=s.gr[0][0];
      if(c==='KeyE') k.aktion=s.btn||'AKTION';
      else if(c==='Space') leer.push(i);
      /* stick:true = am Handy mit dem Stick, ohne Blockknopf - sonst schaltet
         mobil.js das analoge Schleichen ab. */
      else if((c==='ShiftLeft'&&!s.stick)||s.block) k.block=true;
      else if((c==='KeyQ'||c==='KeyR')&&k.extras.length<2) k.extras.push({txt:s.btn||'?',code:c});
    });
    if(leer.length){
      const offen=leer.find(i=>!Z.erledigt[i]);
      k.zwei=L.schritte[offen!==undefined?offen:leer[leer.length-1]].btn||'SPRUNG';
    }
    if(Z.alleErledigt()||!k.aktion) k.aktion='WEITER';
    return k;
  };

  /* ---------------------------------------------------------------------- */
  Z.zeichne=function(){
    const touch=IS_TOUCH;
    const P={ ink:'#07060d', neon:'#ff3d8b', gold:'#ffd447', weiss:'#f2f0ff', dim:'#8d86a8',
              dunkel:'#4a4363', gruen:'#5fe08a', cyan:'#42d9ff' };
    ctx.fillStyle=P.ink; ctx.fillRect(0,0,W,H);
    for(let i=0;i<40;i++){ ctx.fillStyle=i%7===0?'#2a2440':'#15121f'; ctx.fillRect((i*79)%W,(i*53)%H,1,1); }

    textC('STEUERUNG',9,P.dunkel);
    textGlowC(L.titel,18,P.neon,2);

    /* Erklaerung (am Handy eigene Saetze, falls vorhanden) */
    let y=40;
    /* Quer am Handy liegen rechts Bogenknoepfe und Menue - der Text bleibt links davon. */
    const schmal=window.MOBIL&&window.MOBIL.an&&!window.MOBIL.hoch;
    const absaetze=(touch&&L.textTouch)?L.textTouch:L.text;
    for(const absatz of absaetze){
      for(const z of umbruch(absatz,schmal?Math.min(W-44,176):W-44)){ textC(z,y,P.weiss); y+=8; }
      y+=2;
    }

    /* Die Schritte */
    y=Math.max(y+4,64);
    const blink=Math.floor(Z.t*3)%2===0;
    const labVon=q=>touch?((q.touch==='KNOPF'&&q.btn)?q.btn:q.touch):q.taste;
    /* Die offene Uebungspuppe braucht unten Platz (Figur und Ausholbalken). */
    const puppeOffen=L.schritte.findIndex((s,i)=>s._puppe&&!Z.erledigt[i]);
    const unten=puppeOffen>=0?46:34;
    const rowH=Math.min(11,Math.floor((H-unten-y)/L.schritte.length));
    /* alle Tasten gleich breit, damit die Texte buendig stehen */
    const bwAlle=Math.max(22,...L.schritte.map(q=>textW(labVon(q))+8));
    L.schritte.forEach((s,i)=>{
      const fertig=Z.erledigt[i], lab=labVon(s);
      const bw=bwAlle, bx=20;
      /* Taste: gold wenn gedrueckt, sonst dunkel; die naechste offene blinkt */
      const naechste=!fertig&&!s.opt&&L.schritte.findIndex((q,j)=>!Z.erledigt[j]&&!q.opt)===i;
      ctx.fillStyle=fertig?P.gold:'#2a2440'; ctx.fillRect(bx,y-1,bw,9);
      ctx.fillStyle=fertig?'#a8841a':(naechste&&blink?P.gold:'#4a4363');
      ctx.fillRect(bx,y+7,bw,1);
      text(lab,bx+Math.round((bw-textW(lab))/2),y+1,fertig?P.ink:P.weiss);
      text(s.was+(s.opt&&!schmal?' (OPTIONAL)':''),bx+bw+7,y+1,fertig?P.gruen:(s.opt?P.dunkel:P.dim));
      if(fertig){ const hx=schmal?9:W-24;   // quer am Handy liegt rechts das Menue
        ctx.fillStyle=P.gruen; ctx.fillRect(hx,y+2,5,5); ctx.fillStyle=P.ink; ctx.fillRect(hx+1,y+3,3,3); ctx.fillStyle=P.gruen; ctx.fillRect(hx+2,y+4,1,1); }
      y+=rowH;
    });

    /* Uebungspuppe: Figur, und ihr Ausholbalken mit Rueckmeldung. */
    if(puppeOffen>=0){
      const sp=L.schritte[puppeOffen], p=sp._puppe;
      ctx.fillStyle='#ff3d8b'; ctx.fillRect(Math.round(W/2)-52,H-42,5,10);
      if(p.zustand==='schlag') ctx.fillRect(Math.round(W/2)-47,H-38,5,2);
      const name=p.rueckT>0?p.rueck:(sp.puppe==='konter'?'UEBEN '+p.treffer+'/'+konterNoetig():'UEBEN');
      if(p.zustand==='ausholen'&&typeof zeichneAusholbalken==='function') zeichneAusholbalken(p,name,H-33);
      else textC(p.rueckT>0?p.rueck:'GLEICH HOLT ER AUS',H-41,p.rueckT>0?P.gold:P.dim);
    }

    /* Fuss */
    const fussY=H-20;
    if(Z.alleErledigt()){
      if(blink) textGlowC(touch?'TIPPEN: LOS':'ENTER ODER E: LOS',fussY,P.weiss,1);
    } else {
      textC(touch?'PROBIER JEDEN KNOPF':'PROBIER JEDE TASTE',fussY,P.dim);
    }
    if(Z.skipT>0){
      const f=Math.min(1,Z.skipT/LEHRE_SKIP), bw=54, bx=Math.round((W-bw)/2);
      ctx.fillStyle='#2a2440'; ctx.fillRect(bx,H-8,bw,2);
      ctx.fillStyle=P.gold; ctx.fillRect(bx,H-8,Math.round(bw*f),2);
    } else if(Z.t>1.5){
      textC(touch?'HAUPTKNOPF HALTEN: UEBERSPRINGEN':'ENTER HALTEN: UEBERSPRINGEN',H-9,P.dunkel);
    }
  };

  /* Die Tasten gehoeren der Lektion, solange sie laeuft - im Capture, damit
     das Level (das sonst bei E sofort das Intro ueberspringt) nichts merkt. */
  addEventListener('keydown',function(e){
    if(!Z.aktiv) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(!e.repeat) Z.taste(e.code,true);
  },true);
  addEventListener('keyup',function(e){
    if(!Z.aktiv) return;
    e.preventDefault(); e.stopImmediatePropagation();
    Z.taste(e.code,false);
  },true);
  return Z;
})();
