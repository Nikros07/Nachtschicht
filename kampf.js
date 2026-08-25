/* ============================================================================
   NACHTSCHICHT - DER NAHKAMPF

   Ein Kampf ist immer dasselbe: einer holt aus, du entscheidest dich, einer
   von euch liegt. Was sich unterscheidet, sind Zahlen und Angriffsmuster -
   und die stehen als Daten in KAEMPFER, nicht als Code im Level.

   Vorher gab es den Kampf zweimal: ausgewachsen im alten Endlos-Modus
   (runner.html) und als abgespeckte Konter-Abfrage in Level 2. Level 4 haette
   ihn ein drittes Mal gebraucht. Also liegt er jetzt hier.

   ---- Die Regeln ----

   Der Gegner laeuft eine feste Kette ab, und jeder Schritt ist sichtbar:

       kommt -> wartet -> holt aus -> schlaegt -> erholt sich -> wartet ...

   Manchmal geht er statt dessen in Deckung. Dann prallst Du ab.

   Er ist nicht dauerhaft angreifbar. Solange er auf den Beinen steht, hat er
   die Haende oben - da prallst Du ab. Es gibt genau zwei Momente, in denen er
   offen ist, und beide muss er selbst herbeifuehren:

     im letzten Drittel des Ausholens   KONTER      doppelter Schaden
     waehrend er sich erholt            TREFFER     einfacher Schaden

   Alles andere kostet Dich Zeit:

     zu frueh im Ausholen               ABGEPRALLT  du stehst lange offen
     waehrend er schon schlaegt         ZU SPAET    dito
     gegen seine Deckung                ABGEPRALLT  dito
     ins Leere                          DANEBEN     dito

   Damit ist Knopfhaemmern die schlechteste aller Taktiken - genau das war
   vorher das Problem: drei Schlaege blind, und der Kampf war vorbei.

   Dazu die Ausdauer. Jeder Schlag kostet, und wer sie leerdrischt, steht eine
   Sekunde nur da. Ohne sie waere die beste Taktik, den Knopf zu haemmern.

   Und manche Angriffe kann man nicht kontern. Die sind rot angesagt, und die
   einzige Antwort darauf ist, aus der Reichweite zu gehen.

   ---- Wie ein Level das benutzt ----

     S.kampf = neuerKampf('kracher', { x:120, blick:1 });
     ...
     const ev = kampfSchritt(S.kampf, dt, S.x, { schlag:hatEGedrueckt, ducken:false });
     for(const e of ev) { ... }        // 'treffer' 'konter' 'wehgetan' 'aus' ...
     kampfZeichnen(S.kampf, BODEN);    // Gegner, Balken, Ansagen

   Braucht nachtschicht.js (Sprites, Text, Farben) und wird danach geladen.
   ========================================================================== */

/* ==========================================================================
   DIE REGLER
   Gelten fuer jeden Kampf. Was pro Gegner anders ist, steht in KAEMPFER.
   ========================================================================== */
const KT = {
  /* (1) DEIN SCHLAG */
  schlagVorlauf:   0.08,   // bis die Faust da ist
  schlagAktiv:     0.12,   // wie lange sie trifft
  schlagAbkling:   0.24,   // danach kannst du wieder
  reichweite:        20,   // wie nah du dran sein musst

  /* (2) FEHLSCHLAEGE BESTRAFEN
     Ohne das ist Knopfhaemmern die beste Taktik. Mit dem hier kostet jeder
     Schlag ins Leere mehr Zeit, als er im Erfolgsfall gebracht haette. */
  danebenAbkling:  0.60,   // ins Leere geschlagen
  geblocktAbkling: 0.80,   // in die Deckung geschlagen - noch teurer

  /* (3) AUSDAUER */
  ausdauerMax:      100,
  proSchlag:         26,   // vier Schlaege am Stueck, dann ist Schluss
  ausdauerNach:      36,   // kommt pro Sekunde zurueck
  ausdauerPause:   0.40,   // so lange nach einem Schlag kommt gar nichts
  ausgepowert:     1.00,   // bei null: so lange geht nichts

  /* (4) KONTERN
     konterFenster ist der Anteil des Ausholens ganz am Ende, in dem ein
     Schlag als Konter zaehlt. 1 waere das ganze Ausholen (zu einfach),
     0.34 ist das letzte Drittel. */
  konterFenster:   0.34,
  konterSchaden:      2,
  konterTaumel:    0.85,
  trefferSchaden:     1,
  trefferTaumel:   0.40,

  /* (5) NACH EINEM TREFFER
     Kurz unverwundbar, sonst haemmert er dich waehrend deiner Erholung um. */
  immunNachTreffer: 0.9,

  /* (6) DER GEGNER
     abstandHalten ist, wie nah er von sich aus rangeht. Das MUSS kleiner sein
     als deine reichweite - sonst steht er dauerhaft einen Schritt zu weit weg
     und kein Schlag von dir kommt je an. Seine eigene `reichweite` darf
     groesser sein: er hat die laengeren Arme, du musst also wirklich weg,
     nicht nur einen Schritt. */
  abstandHalten:     14,
  deckungDauer:    0.85,
  rueckstoss:        14,
};

/* ==========================================================================
   DIE GEGNER
   `muster` ist der Vorrat an Angriffen; `gewicht` sagt, wie oft einer kommt.
   Ein Boss bekommt zusaetzlich `phasen` - ab welchen Trefferpunkten er
   umschaltet und was sich dann aendert.
   ========================================================================== */
const KAEMPFER = {
  /* Level 2. Der erste Kampf im Spiel, also bewusst gutmuetig: langes
     Ausholen, selten Deckung, und der schwere Schlag kommt erst spaeter. */
  kracher: {
    name:'DER KRACHER', hp:3,
    spr:'kracher', sprAus:'kracherAus', sprDeckung:'kracherDeckung',
    tempo:72, reichweite:24, abstandHalten:14, deckungChance:0.18, pause:[0.55,1.05],
    muster:[
      { art:'schlag', wind:0.78, aktiv:0.20, erholung:1.05, schaden:1, gewicht:4,
        ansage:'HOLT AUS' },
      { art:'haken',  wind:0.55, aktiv:0.16, erholung:0.85, schaden:1, gewicht:2,
        ansage:'SCHNELL' },
      { art:'schwer', wind:0.95, aktiv:0.26, erholung:1.50, schaden:1, gewicht:1,
        nichtKonterbar:true, ansage:'NICHT KONTERBAR - WEG DA' },
    ],
    /* Ab dem letzten Treffer wird er wild: kuerzere Vorwarnung, oefter Deckung. */
    phasen:[ { abHp:1, windFaktor:0.8, deckungChance:0.3, sagt:'JETZT WIRD ER SAUER' } ],
  },
};

/* ==========================================================================
   EINEN KAMPF ANFANGEN
   ========================================================================== */
function neuerKampf(art, opt={}){
  const a = typeof art==='string' ? KAEMPFER[art] : art;
  if(!a) throw new Error('Unbekannter Gegner: '+art);
  return {
    art:a, name:a.name,
    x: opt.x||0, blick: opt.blick||-1,
    hp:a.hp, maxHp:a.hp,

    /* Der Gegner */
    zustand:'komm', t:0, muster:null, taumel:0, phase:-1, pauseBis:null,
    windFaktor:1, deckungChance:a.deckungChance||0,

    /* Du */
    immun:0,
    ausdauer:KT.ausdauerMax, ausdauerPause:0,
    schlagT:0, schlagPhase:'', trefferGesetzt:false, abkling:0, ausgepowert:0,

    geschosse:[],
    ansage:'', ansageT:0, ansageRot:false,
    vorbei:false, gewonnen:false,
  };
}

const kampfLaeuft = K => !!K && !K.vorbei;
/* Waehrend Du selbst schlaegst oder Dich erholst, sollst Du nicht laufen -
   sonst kann man jeden Schlag im Rueckwaertsgang setzen. */
const kampfDarfLaufen = K => !K || (K.schlagT<=0 && K.abkling<=0 && K.ausgepowert<=0);

/* Ein Angriff aus dem Vorrat, nach Gewicht. */
function _waehleMuster(K){
  const m=K.art.muster;
  let summe=0; for(const x of m) summe+=(x.gewicht||1);
  let r=Math.random()*summe;
  for(const x of m){ r-=(x.gewicht||1); if(r<=0) return x; }
  return m[m.length-1];
}

function _sag(K,txt,rot=false){ K.ansage=txt; K.ansageT=1.6; K.ansageRot=rot; }

/* ==========================================================================
   EIN BILD KAMPF
   Gibt eine Liste Ereignisse zurueck. Das Level entscheidet, was daraus wird
   (Ton, Ruettler, Herzen) - der Kampf selbst kennt weder S noch SFX.

   Ereignisse:
     {art:'konter'}      du hast im Ausholen getroffen
     {art:'treffer'}     normaler Treffer
     {art:'abgeprallt'}  gegen die Deckung
     {art:'daneben'}     ins Leere
     {art:'leer'}        Ausdauer alle
     {art:'wehgetan', schaden:n}   er hat dich erwischt
     {art:'holtAus', muster}       er faengt an auszuholen
     {art:'phase', sagt}           Boss schaltet um
     {art:'aus'}         er liegt
   ========================================================================== */
function kampfSchritt(K, dt, spielerX, ein={}){
  const E=[];
  if(!K || K.vorbei) return E;
  K.t+=dt;
  if(K.ansageT>0) K.ansageT-=dt;

  const abstand = Math.abs(spielerX-K.x);
  K.blick = spielerX>K.x ? 1 : -1;

  /* ---- Deine Ausdauer ---- */
  if(K.ausdauerPause>0) K.ausdauerPause-=dt;
  /* Luft holst Du nur, wenn Du nicht gerade offen dastehst. Sonst waere ein
     abgeprallter Schlag gratis: die lange Erholung wuerde die Ausdauer, die
     er gekostet hat, von selbst wieder auffuellen. */
  else if(K.abkling<=0 && K.ausdauer<KT.ausdauerMax)
    K.ausdauer=Math.min(KT.ausdauerMax,K.ausdauer+KT.ausdauerNach*dt);
  if(K.ausgepowert>0){ K.ausgepowert-=dt; if(K.ausgepowert<=0) _sag(K,'WIEDER LUFT'); }
  if(K.abkling>0) K.abkling-=dt;
  if(K.immun>0) K.immun-=dt;

  /* ---- Dein Schlag ---- */
  if(K.schlagT>0){
    K.schlagT-=dt;
    /* Die Faust ist erst nach dem Vorlauf gefaehrlich, und nur einmal. */
    const inAktiv = K.schlagT<=KT.schlagAktiv+KT.schlagAbkling
                 && K.schlagT> KT.schlagAbkling;
    if(inAktiv && !K.trefferGesetzt){
      K.trefferGesetzt=true;
      E.push(..._loeseSchlagAus(K,abstand));
    }
    if(K.schlagT<=0){ K.schlagPhase=''; }
  }
  else if(ein.schlag){
    if(K.ausgepowert>0){ /* keine Luft, gar nichts */ }
    else if(K.abkling>0){ /* noch in der Erholung */ }
    else if(K.ausdauer<KT.proSchlag){
      K.ausgepowert=KT.ausgepowert; K.ausdauer=0;
      _sag(K,'AUS DER PUSTE',true); E.push({art:'leer'});
    } else {
      K.ausdauer-=KT.proSchlag; K.ausdauerPause=KT.ausdauerPause;
      K.schlagT=KT.schlagVorlauf+KT.schlagAktiv+KT.schlagAbkling;
      K.schlagPhase='schlag'; K.trefferGesetzt=false;
    }
  }

  /* ---- Der Gegner ---- */
  if(K.taumel>0){
    K.taumel-=dt;
    K.x-=K.blick*KT.rueckstoss*dt*2;
    if(K.taumel<=0){
      if(K.hp<=0){ K.zustand='aus'; K.vorbei=true; K.gewonnen=true; E.push({art:'aus'}); return E; }
      K.zustand='warten'; K.t=0; K.pauseBis=null;
    }
    return E;
  }

  /* Boss-Phasen: ab einem Trefferstand wird er ein anderer. */
  const ph=K.art.phasen;
  if(ph) for(let i=0;i<ph.length;i++){
    if(i>K.phase && K.hp<=ph[i].abHp){
      K.phase=i;
      if(ph[i].windFaktor)     K.windFaktor=ph[i].windFaktor;
      if(ph[i].deckungChance!=null) K.deckungChance=ph[i].deckungChance;
      _sag(K,ph[i].sagt||'ER WIRD SCHNELLER',true);
      E.push({art:'phase', phase:i, sagt:ph[i].sagt});
    }
  }

  const z=K.zustand;
  if(z==='komm'){
    const nah=K.art.abstandHalten||KT.abstandHalten;
    if(abstand>nah) K.x+=K.blick*(K.art.tempo||70)*dt;
    else { K.zustand='warten'; K.t=0; K.pauseBis=null; }
  }
  else if(z==='warten'){
    /* Die Pause wird einmal beim Eintritt gewuerfelt, nicht jedes Bild. */
    if(K.pauseBis==null){
      const [a,b]=K.art.pause||[0.6,1.1];
      K.pauseBis=a+Math.random()*(b-a);
    }
    if(K.t>=K.pauseBis){
      K.pauseBis=null;
      /* Bist du weggegangen, kommt er nach - sonst steht er da und holt
         ins Leere aus. */
      if(abstand>(K.art.abstandHalten||KT.abstandHalten)+6){ K.zustand='komm'; K.t=0; }
      else if(Math.random()<K.deckungChance){
        /* Manchmal geht er erst mal in Deckung, statt anzugreifen. */
        K.zustand='deckung'; K.t=0; _sag(K,'DECKUNG');
      } else {
        K.muster=_waehleMuster(K); K.zustand='wind'; K.t=0;
        _sag(K,K.muster.ansage||'HOLT AUS', !!K.muster.nichtKonterbar);
        E.push({art:'holtAus', muster:K.muster});
      }
    }
  }
  else if(z==='deckung'){
    if(K.t>=KT.deckungDauer){ K.zustand='warten'; K.t=0; }
  }
  else if(z==='wind'){
    if(K.t>=K.muster.wind*K.windFaktor){ K.zustand='schlag'; K.t=0; K.trefferAus=false; }
  }
  else if(z==='schlag'){
    /* Der Schlag trifft genau einmal, und nur wenn du in Reichweite stehst. */
    if(!K.trefferAus){
      K.trefferAus=true;
      const hoch = K.muster.zone==='hoch';
      const drin = abstand < (K.art.reichweite||24);
      if(drin && !(hoch && ein.ducken) && K.immun<=0){
        K.immun=KT.immunNachTreffer;
        E.push({art:'wehgetan', schaden:K.muster.schaden||1});
      }
      /* Fernangriff fliegt in Deine Richtung */
      if(K.muster.fern) K.geschosse.push({ x:K.x, vx:K.blick*140, t:0 });
    }
    if(K.t>=K.muster.aktiv){
      K.zustand='erholung'; K.t=0;
      /* Ansage loeschen - sonst ueberlagert das verblassende "HOLT AUS"
         genau das OFFEN, auf das man jetzt achten soll. */
      K.ansageT=0;
    }
  }
  else if(z==='erholung'){
    if(K.t>=K.muster.erholung){ K.zustand='warten'; K.t=0; }
  }

  /* ---- Fernangriffe ---- */
  for(const g of K.geschosse){ g.t+=dt; g.x+=g.vx*dt; }
  K.geschosse=K.geschosse.filter(g=>g.t<3 && g.x>-20 && g.x<2000);

  return E;
}

/* Was Deine Faust anrichtet, wenn sie ankommt. */
function _loeseSchlagAus(K,abstand){
  if(abstand>KT.reichweite){
    K.abkling=KT.danebenAbkling; _sag(K,'DANEBEN');
    return [{art:'daneben'}];
  }
  if(K.zustand==='deckung'){
    K.abkling=KT.geblocktAbkling; _sag(K,'ABGEPRALLT',true);
    return [{art:'abgeprallt'}];
  }
  /* Konter: im letzten Drittel des Ausholens - und nur, wenn der Angriff
     ueberhaupt konterbar ist. */
  if(K.zustand==='wind'){
    const voll=K.muster.wind*K.windFaktor;
    if(K.muster.nichtKonterbar){
      /* Den bricht kein Schlag ab. Er zieht durch. */
      K.abkling=KT.geblocktAbkling; _sag(K,'DEN STOPPST DU NICHT',true);
      return [{art:'abgeprallt'}];
    }
    if(K.t >= voll*(1-KT.konterFenster)){
      K.hp-=KT.konterSchaden; K.taumel=KT.konterTaumel; K.zustand='taumel';
      K.abkling=KT.schlagAbkling;
      return [{art:'konter'}];
    }
    K.abkling=KT.geblocktAbkling; _sag(K,'ZU FRUEH',true);
    return [{art:'abgeprallt', frueh:true}];
  }
  if(K.zustand==='erholung'){
    /* Sein Schlag ist durch, die Deckung noch unten. Das ist Dein Fenster. */
    K.hp-=KT.trefferSchaden; K.taumel=KT.trefferTaumel; K.zustand='taumel';
    K.abkling=KT.schlagAbkling;
    return [{art:'treffer'}];
  }
  if(K.zustand==='schlag'){
    K.abkling=KT.geblocktAbkling; _sag(K,'ZU SPAET',true);
    return [{art:'abgeprallt'}];
  }
  /* Er kommt oder wartet - Haende oben. Da geht nichts durch. */
  K.abkling=KT.geblocktAbkling; _sag(K,'ER HAT DIE HAENDE OBEN',true);
  return [{art:'abgeprallt'}];
}

/* ==========================================================================
   ZEICHNEN
   Der Gegner samt Balken. Den Spieler zeichnet das Level selbst - der sieht
   in jedem Level anders aus und steht an einer anderen Stelle.
   ========================================================================== */
function kampfZeichnen(K, boden){
  if(!K) return;
  const a=K.art;
  let name = a.spr;
  if(K.zustand==='deckung' && a.sprDeckung && SPR[a.sprDeckung]) name=a.sprDeckung;
  else if((K.zustand==='wind'||K.zustand==='schlag') && a.sprAus) name=a.sprAus;
  const rows=SPR[name]||SPR[a.spr];
  const y=boden-rows.length;

  /* Beim Taumeln blinkt er */
  const blink = K.taumel>0 && Math.floor(K.taumel*20)%2===0;
  outline(rows,K.x-3,y,1,.7);
  if(!blink){
    if(K.blick>0) spriteFlip(rows,K.x-3,y); else sprite(rows,K.x-3,y);
  } else sprite(rows,K.x-3,y,1,'#ffffff');

  /* Wenn er offen steht, muss man das sehen - sonst ist der einzige
     Angriffsmoment reines Raten. */
  if(K.zustand==='erholung'){
    ctx.globalAlpha=.35+Math.sin(K.t*16)*.12;
    ctx.fillStyle=KAMPF_FARBE.konter;
    ctx.fillRect(K.x-4,y-3,9,2);
    ctx.globalAlpha=1;
    if(Math.floor(K.t*8)%2===0) text('OFFEN',K.x-8,y-21,KAMPF_FARBE.konter);
  }
  /* Deckung sichtbar machen - sonst schlaegt man ahnungslos rein */
  if(K.zustand==='deckung'){
    ctx.globalAlpha=.5+Math.sin(K.t*14)*.15;
    ctx.fillStyle=KAMPF_FARBE.deckung;
    ctx.fillRect(K.x+(K.blick>0?-8:4),y+3,4,rows.length-6);
    ctx.globalAlpha=1;
  }

  /* Ausholbalken. Rot heisst: den kannst du nicht kontern. */
  if(K.zustand==='wind'){
    const voll=K.muster.wind*K.windFaktor, a2=Math.min(1,K.t/voll);
    const bw=22, bx=K.x-bw/2+2, by=y-7;
    ctx.fillStyle='#000a'; ctx.fillRect(bx-1,by-1,bw+2,5);
    ctx.fillStyle='#2a2440'; ctx.fillRect(bx,by,bw,3);
    ctx.fillStyle=K.muster.nichtKonterbar?KAMPF_FARBE.hart:KAMPF_FARBE.wind;
    ctx.fillRect(bx,by,Math.round(bw*a2),3);
    /* Das Konterfenster als heller Abschnitt am Ende */
    if(!K.muster.nichtKonterbar){
      const kx=bx+Math.round(bw*(1-KT.konterFenster));
      ctx.fillStyle=KAMPF_FARBE.konter;
      ctx.fillRect(kx,by-1,Math.round(bw*KT.konterFenster),1);
      ctx.fillRect(kx,by+3,Math.round(bw*KT.konterFenster),1);
    }
  }

  /* Seine Trefferpunkte */
  const hw=26, hx=K.x-hw/2+2, hy=y-13;
  ctx.fillStyle='#000a'; ctx.fillRect(hx-1,hy-1,hw+2,5);
  ctx.fillStyle='#2a2440'; ctx.fillRect(hx,hy,hw,3);
  ctx.fillStyle=KAMPF_FARBE.hp;
  ctx.fillRect(hx,hy,Math.round(hw*Math.max(0,K.hp)/K.maxHp),3);

  /* Die Ansage steht ueber ihm, nicht in der Bildmitte: sie sagt etwas ueber
     ihn, und in der Mitte lag sie quer ueber dem halben Raum. */
  if(K.ansageT>0){
    ctx.globalAlpha=Math.min(1,K.ansageT*1.5);
    const t=K.ansage;
    textGlow(t,Math.round(K.x-textW(t)/2+2),y-21,K.ansageRot?KAMPF_FARBE.hart:KAMPF_FARBE.wind);
    ctx.globalAlpha=1;
  }

  /* Fernangriffe */
  for(const g of K.geschosse){
    ctx.fillStyle=KAMPF_FARBE.hart;
    ctx.fillRect(Math.round(g.x),Math.round(boden-20+Math.sin(g.t*8)*3),3,3);
  }
}

/* Deine Ausdauer. Feste Bildschirmposition, also ausserhalb der
   Kameraverschiebung zeichnen. Unten links, weil die Mitte und der untere
   Rand in jedem Level schon mit Meldungen belegt sind. */
function kampfHud(K, x=6, y=H-12){
  if(!K) return;
  const bw=44;
  const leer=K.ausgepowert>0;
  ctx.fillStyle='#000a'; ctx.fillRect(x-2,y-8,bw+4,14);
  const t='AUSDAUER';
  text(t,x,y-7,leer?KAMPF_FARBE.hart:'#4a4363');
  ctx.fillStyle='#2a2440'; ctx.fillRect(x,y,bw,4);
  ctx.fillStyle=leer?KAMPF_FARBE.hart:K.ausdauer<KT.proSchlag?KAMPF_FARBE.wind:KAMPF_FARBE.ausdauer;
  ctx.fillRect(x,y,Math.round(bw*K.ausdauer/KT.ausdauerMax),4);
  /* Marke: ab hier reicht es fuer einen Schlag */
  ctx.fillStyle=KAMPF_FARBE.marke;
  ctx.fillRect(x+Math.round(bw*KT.proSchlag/KT.ausdauerMax),y-1,1,6);
}

/* Eigene Farbtabelle, damit der Kampf nicht davon abhaengt, wie ein Level
   seine Palette gerade umgefaerbt hat. */
const KAMPF_FARBE = {
  wind:'#ffd447', hart:'#ff4d4d', konter:'#48e08a',
  hp:'#ff4d4d', ausdauer:'#42d9ff', marke:'#48e08a', deckung:'#8d86a8',
};
