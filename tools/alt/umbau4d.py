# -*- coding: utf-8 -*-
"""Level 4, Teil 4: Arena mit Tiefe zeichnen, HUD mit Ausdauer."""
import io

p = 'level4.html'
s = io.open(p, encoding='utf-8').read()


def fn_ende(src, i):
    d = 0
    st = False
    for j in range(i, len(src)):
        c = src[j]
        if c == '{':
            d += 1
            st = True
        elif c == '}':
            d -= 1
            if st and d == 0:
                return j + 1
    raise SystemExit('Klammer nicht gefunden')


def ersetze_fn(src, sig, neu):
    i = src.index(sig)
    return src[:i] + neu + src[fn_ende(src, i):]


s = ersetze_fn(s, 'function zeichneArena(){', """function zeichneArena(){
  zeichneKulisse();
  const b=S.boss, s=S.spieler;

  /* Das Laufband sichtbar machen - ohne das schwebt bei Tiefe alles. */
  ctx.fillStyle='#1a1526';
  ctx.fillRect(0,bodenY(0)-2,W,bodenY(1)-bodenY(0)+6);
  ctx.fillStyle='#2b2340'; ctx.fillRect(0,bodenY(0)-2,W,1);
  ctx.fillStyle='#0d0a16'; ctx.fillRect(0,bodenY(1)+3,W,1);
  /* Absperrung hinten - macht die hintere Grenze lesbar */
  for(let x=6;x<W;x+=26){
    ctx.fillStyle='#3a3152'; ctx.fillRect(x,bodenY(0)-9,1,8);
    ctx.fillStyle='#4a3f66'; ctx.fillRect(x,bodenY(0)-10,2,1);
  }

  const zeichnungen=[];

  /* ---- Tuersteher ---- */
  if(b){
    zeichnungen.push({t:b.t, mal:()=>{
      let rows=SPR.bossSteh, kopf=SPR.bossKopf;
      if(b.zustand==='ausholen') rows=SPR.bossWind;
      else if(b.zustand==='schlag') rows=SPR.bossSchlag;
      const blinkt=b.zustand==='getroffen'&&Math.floor(S.t*20)%2===0;
      const fuss=bodenY(b.t);
      const y=fuss-rows.length-kopf.length;
      bodenSchatten(b,9,.3);
      outline(kopf,b.x,y,1,.6); outline(rows,b.x,y+kopf.length,1,.6);
      const tint=blinkt?'#ffffff':(b.zustand==='block'?'#42d9ff':null);
      spriteFlip(kopf,b.x,y,1,tint); spriteFlip(rows,b.x,y+kopf.length,1,tint);
      if(b.zustand==='ausholen'&&Math.floor(S.t*10)%2===0)
        text('!',b.x+2,y-9,b.unblockbarJetzt?P.gold:P.rot);
    }});
  }

  /* ---- Spieler ---- */
  zeichnungen.push({t:s.t, mal:()=>{
    let rows=SPR.steh;
    if(s.zustand==='getroffen') rows=SPR.treffer;
    else if(s.zustand==='schlag'||s.zustand==='ausholen') rows=SPR.konter;
    const fuss=bodenY(s.t);
    const rollt=s.zustand==='rolle';
    const y=fuss-rows.length+(rollt?3:0);
    bodenSchatten(s,7,.28);
    const blinkt=s.unverwundbar>0&&Math.floor(S.t*18)%2===0;
    const tint=rollt?'#8d86a8':(s.zustand==='block'?'#42d9ff':(blinkt?'#ffffff':null));
    outline(rows,s.x,y,1,.6);
    if(s.blick<0) spriteFlip(rows,s.x,y,1,tint); else sprite(rows,s.x,y,1,tint);
    /* Deckung sichtbar machen */
    if(s.zustand==='block'){
      ctx.fillStyle='#42d9ff';
      const bx=s.x+(s.blick>0?8:-2);
      ctx.fillRect(bx,y+3,1,7);
    }
  }});

  zeichneNachTiefe(zeichnungen);

  /* ---- Ausholbalken mit Konterfenster ---- */
  if(b&&b.zustand==='ausholen'){
    const bw=76, bx=Math.round(W/2-bw/2), by=29;
    const f=Math.min(1,b.zT/b.ausholenDauer);
    ctx.fillStyle='#000a'; ctx.fillRect(bx-2,by-2,bw+4,9);
    ctx.fillStyle='#2a2440'; ctx.fillRect(bx,by,bw,5);
    if(!b.unblockbarJetzt){
      const start=1-b.fensterAnteil;
      ctx.fillStyle='#ffd44766';
      ctx.fillRect(bx+Math.round(bw*start),by,Math.round(bw*b.fensterAnteil),5);
    }
    ctx.fillStyle=b.unblockbarJetzt?P.gold:P.rot;
    ctx.fillRect(bx,by,Math.round(bw*f),5);
    const name=b.art==='schwung'?'SCHWUNG':b.art==='jab'?'JAB':'RAMME - AUSWEICHEN';
    textC(name,by-8,b.unblockbarJetzt?P.gold:P.gold);
  }

  /* ---- Lebensbalken des Tuerstehers ---- */
  if(b){
    const bw=40, bx=Math.round(W/2-bw/2);
    ctx.fillStyle='#000a'; ctx.fillRect(bx-1,13,bw+2,6);
    ctx.fillStyle=P.rot;
    ctx.fillRect(bx,14,Math.round(bw*Math.max(0,b.hp)/TUNE.bossTreffer),4);
    /* Phasenstriche, damit man sieht wann es haerter wird */
    ctx.fillStyle='#0008';
    ctx.fillRect(bx+Math.round(bw*TUNE.phase2Ab),13,1,6);
    ctx.fillRect(bx+Math.round(bw*TUNE.phase3Ab),13,1,6);
  }
}""")

s = ersetze_fn(s, 'function hud(){', """function hud(){
  const s=S.spieler;
  for(let i=0;i<S.maxHp;i++){
    const x=6+i*7,y=6, voll=i<S.hp;
    if(!voll){ ctx.fillStyle='#2a2440'; ctx.fillRect(x,y,5,4); ctx.fillRect(x+1,y+4,3,1); continue; }
    ctx.fillStyle=(S.hp===1&&Math.floor(S.t*6)%2===0)?P.weiss:P.rot;
    ctx.fillRect(x,y,2,3); ctx.fillRect(x+3,y,2,3); ctx.fillRect(x+1,y+2,3,2); ctx.fillRect(x+2,y+4,1,1);
  }

  /* Ausdauer - der Balken, der das Knopf-Haemmern beendet. Rot, sobald
     kein Schlag mehr drin ist. */
  if(s){
    const bw=46, bx=6, by=14, f=s.ausdauer/KAMPF.ausdauerMax;
    ctx.fillStyle='#000a'; ctx.fillRect(bx-1,by-1,bw+2,5);
    ctx.fillStyle='#2a2440'; ctx.fillRect(bx,by,bw,3);
    ctx.fillStyle=s.ausdauer<KAMPF.ausdauerSchlag?P.rot:P.gruen;
    ctx.fillRect(bx,by,Math.round(bw*f),3);
    ctx.fillStyle='#0008';
    ctx.fillRect(bx+Math.round(bw*KAMPF.ausdauerSchlag/KAMPF.ausdauerMax),by,1,3);
  }

  const tr='TREFFER '+S.treffer+'/'+TUNE.bossTreffer;
  text(tr,W-textW(tr)-6,6,P.dim);
  if(S.boss&&!S.boss.anlauf){
    const ph='PHASE '+bossPhase(S.boss);
    text(ph,W-textW(ph)-6,14,bossPhase(S.boss)>1?P.gold:P.dunkel);
  }
  if(S.erholungT>0) textC('DANEBEN - WARTEN',H-52,P.rot);

  if(S.meldungT>0){ ctx.globalAlpha=Math.min(1,S.meldungT*2);
    textGlowC(S.meldung,H-30,P.weiss,1); ctx.globalAlpha=1; }
  if(S.hinweisT>0){ ctx.globalAlpha=Math.min(1,S.hinweisT);
    textGlowC(S.hinweis,H-20,P.gold,1); ctx.globalAlpha=1; }
}""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Teil 4 fertig: Arena mit Tiefe, Ausdauerbalken, Phasenanzeige')
