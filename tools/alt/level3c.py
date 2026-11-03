# -*- coding: utf-8 -*-
"""Level 3, dritter Teil: das Bild.

Bisher lag alles auf einer Linie und wurde in fester Reihenfolge gemalt.
Jetzt hat jedes Ding eine Tiefe, und gemalt wird von hinten nach vorn -
sonst steht der Kontrolleur vor dem Sitz, hinter dem man sich versteckt.

Dazu die drei Waggons als sichtbare Abschnitte und die Knopf-Aufschriften
fuer die Handy-Fassung.
"""
import io

p = 'level3.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu):
    global s
    assert alt in s, 'nicht gefunden: ' + alt[:80]
    s = s.replace(alt, neu, 1)


# Verstecke bekommen eine Tiefe - sie stehen alle an der Rueckwand
ersetze("""const VERSTECKE=[
  { id:'v1', x:150, art:'sitz'    },
  { id:'v2', x:260, art:'gepaeck' },
  { id:'v3', x:375, art:'sitz'    },
  { id:'v4', x:490, art:'gepaeck' },
  { id:'v5', x:590, art:'sitz'    },
];""",
"""const VERSTECKE=[
  { id:'v1', x:150, art:'sitz',    t:0.18 },
  { id:'v2', x:260, art:'gepaeck', t:0.12 },
  { id:'v3', x:375, art:'sitz',    t:0.20 },
  { id:'v4', x:490, art:'gepaeck', t:0.10 },
  { id:'v5', x:590, art:'sitz',    t:0.16 },
];""")


# ------------------------------------------------------- Zeichnen nach Tiefe
ersetze("""  for(const v of VERSTECKE){
    const rows=SPR[v.art]; const y=BODEN-rows.length;
    outline(rows,v.x,y,1,.6); sprite(rows,v.x,y);
    const nah=Math.abs(v.x-S.x)<TUNE.versteckReichweite&&S.modus==='spiel'&&!S.versteckt;
    if(nah&&Math.floor(S.t*4)%2===0) text('E',v.x+2,y-9,P.gold);
    if(S.versteckt===v.id) text('OK',v.x+2,y-9,P.gruen);
  }

  { const rows=SPR.tuerBus, y=BODEN-rows.length;
    outline(rows,TUER_X,y,1,.6); sprite(rows,TUER_X,y);
    text('AUSSTIEG',TUER_X+4-textW('AUSSTIEG')/2,y-9,P.gold); }

  for(const k of S.kontrolleure){
    const kegelX = k.blick>0?k.x+6:k.x+6-TUNE.sichtWeite;
    ctx.globalAlpha=.16; ctx.fillStyle=P.rot; ctx.fillRect(kegelX,BODEN-26,TUNE.sichtWeite,20); ctx.globalAlpha=1;
    const rows=SPR.kontrolleur, y=BODEN-rows.length;
    outline(rows,k.x-3,y,1,.55);
    if(k.blick<0) spriteFlip(rows,k.x-3,y); else sprite(rows,k.x-3,y);
  }

  if(S.versteckt){
    const spot=VERSTECKE.find(v=>v.id===S.versteckt);
    const rows=SPR.versteckt, y=BODEN-rows.length;
    if(spot) sprite(rows,spot.x,y,1,null,.85);
  } else zeichneSpieler();

  ctx.restore();""",

"""  /* Die Waggon-Uebergaenge. Sie sind nicht nur Deko: an ihnen sieht man,
     wo die Zone des naechsten Kontrolleurs anfaengt. */
  for(const gx of TUNE.waggonGrenzen){
    ctx.fillStyle='#0d0a18'; ctx.fillRect(gx-5,18,10,BODEN-18);
    ctx.fillStyle=KEY.u;     ctx.fillRect(gx-5,18,1,BODEN-18); ctx.fillRect(gx+4,18,1,BODEN-18);
    ctx.fillStyle='#161230'; ctx.fillRect(gx-3,26,6,BODEN-34);
  }

  /* Alles mit Tiefe kommt in eine Liste und wird von hinten nach vorn
     gemalt. Sonst steht der Kontrolleur vor dem Sitz, hinter dem man
     sich gerade versteckt. */
  const inTiefe=[];

  for(const v of VERSTECKE){
    inTiefe.push({ t:v.t, mal:()=>{
      const rows=SPR[v.art], fuss=bodenY(v.t), y=fuss-rows.length;
      outline(rows,v.x,y,1,.6); sprite(rows,v.x,y);
      const nah=Math.abs(v.x-S.x)<TUNE.versteckReichweite
               &&Math.abs(v.t-S.tiefe)<=0.3&&S.modus==='spiel'&&!S.versteckt;
      if(nah&&Math.floor(S.t*4)%2===0) text('E',v.x+2,y-9,P.gold);
      if(S.versteckt===v.id) text('OK',v.x+2,y-9,P.gruen);
    }});
  }

  for(const f of FAHRGAESTE){
    inTiefe.push({ t:f.t, mal:()=>{
      const rows=SPR[f.spr], fuss=bodenY(f.t), y=fuss-rows.length;
      ctx.globalAlpha=.22; ctx.fillStyle='#000';
      ctx.fillRect(Math.round(f.x-3),Math.round(fuss),7,1); ctx.globalAlpha=1;
      outline(rows,f.x-3,y,1,.55); sprite(rows,f.x-3,y);
      const nah=Math.abs(f.x-S.x)<TUNE.redeReichweite
               &&Math.abs(f.t-S.tiefe)<=0.3&&S.modus==='spiel'&&!S.versteckt;
      const farbe=S.geredet[f.id]?P.dim:P.gold;
      text(f.name,f.x+3-textW(f.name)/2,y-16,farbe);
      if(nah&&Math.floor(S.t*4)%2===0) text('E',f.x+2,y-9,P.gold);
    }});
  }

  { const rows=SPR.tuerBus, fuss=bodenY(TUNE.gangTiefe), y=fuss-rows.length;
    inTiefe.push({ t:TUNE.gangTiefe, mal:()=>{
      outline(rows,TUER_X,y,1,.6); sprite(rows,TUER_X,y);
      text('AUSSTIEG',TUER_X+4-textW('AUSSTIEG')/2,y-9,P.gold); }}); }

  for(const k of S.kontrolleure){
    inTiefe.push({ t:k.t, mal:()=>{
      const fuss=bodenY(k.t);
      /* Der Kegel wird als Flaeche gemalt, nicht als Balken - sonst sieht
         man nicht, dass er sich seitlich nicht beliebig oeffnet. */
      if(!S.ticket){
        ctx.globalAlpha=S.ablenkT>0?.07:.15; ctx.fillStyle=P.rot;
        const seit=Math.min(TIEFE.kegelMax,TUNE.kegelOeffnung)*(TIEFE.vorne-TIEFE.hinten);
        ctx.beginPath();
        ctx.moveTo(k.x+k.blick*4,fuss-6);
        ctx.lineTo(k.x+k.blick*(4+TUNE.sichtWeite),fuss-6-seit);
        ctx.lineTo(k.x+k.blick*(4+TUNE.sichtWeite),fuss-6+seit);
        ctx.closePath(); ctx.fill(); ctx.globalAlpha=1;
      }
      const rows=SPR.kontrolleur, y=fuss-rows.length;
      ctx.globalAlpha=.22; ctx.fillStyle='#000';
      ctx.fillRect(Math.round(k.x-3),Math.round(fuss),7,1); ctx.globalAlpha=1;
      outline(rows,k.x-3,y,1,.55);
      if(k.blick<0) spriteFlip(rows,k.x-3,y); else sprite(rows,k.x-3,y);
      if(S.ablenkT>0) text('?',k.x+2,y-9,P.gold);
    }});
  }

  if(S.versteckt){
    const spot=VERSTECKE.find(v=>v.id===S.versteckt);
    if(spot) inTiefe.push({ t:spot.t+0.01, mal:()=>{
      const rows=SPR.versteckt, y=bodenY(spot.t)-rows.length;
      sprite(rows,spot.x,y,1,null,.85); }});
  } else {
    inTiefe.push({ t:S.tiefe, mal:()=>zeichneSpieler() });
  }

  zeichneNachTiefe(inTiefe);

  ctx.restore();""")


# Der Spieler zeichnet sich jetzt auf seiner Tiefe
ersetze("""function zeichneSpieler(){
  if(S.unverwundbarT>0&&Math.floor(S.t*12)%2===0) return;
  let rows;
  if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;
  else if(Math.abs(S.vx)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];
  else rows=SPR.steh;
  outline(rows,S.x-3,S.y-rows.length,1,.6);
  if(S.blick<0) spriteFlip(rows,S.x-3,S.y-rows.length); else sprite(rows,S.x-3,S.y-rows.length);
}""",
"""function zeichneSpieler(){
  if(S.unverwundbarT>0&&Math.floor(S.t*12)%2===0) return;
  let rows;
  if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;
  else if(Math.abs(S.vx)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];
  else rows=SPR.steh;
  /* Im Sprint gibt es keine Tiefe - da bleibt S.y der Boden. Im Bus
     verschiebt die Tiefe zusaetzlich, S.y traegt weiter die Sprunghoehe. */
  const versatz = szeneFuerModus()==='bus' ? BODEN-bodenY(S.tiefe) : 0;
  const y=S.y-versatz-rows.length;
  if(versatz!==0){
    ctx.globalAlpha=.26; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(S.x-3),Math.round(bodenY(S.tiefe)),7,1); ctx.globalAlpha=1;
  }
  outline(rows,S.x-3,y,1,.6);
  if(S.blick<0) spriteFlip(rows,S.x-3,y); else sprite(rows,S.x-3,y);
}""")


# ------------------------------------------------------------ mobilKontext
ersetze("""const meldung=(t,d=1.5)=>{ S.meldung=t; S.meldungT=d; };""",
"""/* ==========================================================================
   WAS DIE KNOEPFE AM HANDY GERADE TUN
   nacht/mobil.js fragt das ab. Im Bus ist E dreierlei: reden, verstecken,
   auftauchen - und am Handy sieht man die Figur nicht, weil der Daumen
   davor ist. Also sagt es der Knopf.
   ========================================================================== */
function mobilKontext(){
  if(S.modus==='titel')    return {aktion:'START',  zwei:null};
  if(S.modus==='intro')    return {aktion:'WEITER', zwei:null};
  if(S.modus==='cutscene') return {aktion:'WEITER', zwei:null};
  if(S.modus==='ende')     return {aktion:S.gewonnen?'WEITER':'NOCHMAL', zwei:null};
  if(S.modus==='pause')    return {aktion:null,     zwei:null};
  /* Im Sprint gibt es nur eine Sache zu tun: springen. */
  if(S.modus==='sprint')   return {aktion:null, zwei:'SPRINGEN'};

  if(S.versteckt)          return {aktion:'RAUS', zwei:null};
  const f=naherFahrgast();
  if(f) return {aktion:f.ding?(f.id==='automat'?'TICKET':'BREMSE'):'REDEN', zwei:null};
  if(naheVersteck())       return {aktion:'VERSTECKEN', zwei:null};
  return {aktion:null, zwei:null};
}

const meldung=(t,d=1.5)=>{ S.meldung=t; S.meldungT=d; };""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 3: Zeichnen nach Tiefe, Waggons und Handy-Kontext eingebaut')
