# -*- coding: utf-8 -*-
"""Level 1, Teil 2: Lehrer und Spieler mit Tiefenversatz, sortiert gezeichnet,
und der Sichtkegel als Trapez auf dem Laufband statt als Rechteck."""
import io

p = 'index.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# Helfer neben die anderen Zeichenhelfer legen
s = ersetze(s, 'function zeichneKorridor(){',
    """/* Wie weit eine Figur wegen ihrer Tiefe nach oben rutscht.
   t=0 ist ganz hinten an der Wand, t=1 ganz vorne am Betrachter. */
const tiefeVersatz = t => Math.round(TUNE.tiefeBand*(1-Math.max(0,Math.min(1,t))));

function zeichneKorridor(){""")

# Lehrer- und Spielerblock ersetzen: erst sammeln, dann nach Tiefe zeichnen
alt_lehrer = """  for(const L of S.lehrer){
    const by=BODEN[L.e], fern=L.e!==S.etage;
    ctx.globalAlpha=fern?.35:1;
    /* Sichtkegel - schrumpft sichtbar mit, wenn du schleichst */
    if(!fern){
      ctx.globalAlpha=.10+L.verdacht*.22;
      ctx.fillStyle=L.jagd>0?P.rot:(L.chef?'#e0708f':P.gold);
      const w=(L.chef?TUNE.chefSicht:TUNE.sichtWeite)*(S.schleicht?TUNE.schleichSicht:1);
      const h=L.chef?20:16;
      if(L.v>0) ctx.fillRect(L.x+6,by-h,w,h); else ctx.fillRect(L.x-w+2,by-h,w,h);
      ctx.globalAlpha=1;
    }
    const bewegt=Math.abs(L.v)>0;
    const rows = L.chef ? SPR.direktor
               : ((L.jagd>0||bewegt) && Math.floor(S.t*6)%2 ? SPR.lehrerGeh : SPR.lehrer);
    const hoehe = L.chef?17:13;
    if(!fern) outline(rows,L.x,by-hoehe,1,.6);
    if(L.v>0) spriteFlip(rows,L.x,by-hoehe); else sprite(rows,L.x,by-hoehe);
    /* Hausmeister: Schluesselbund am Guertel und Statusanzeige */
    if(L.hausmeister&&!fern){
      if(L.hatSchluessel){
        sprite(SPR.schluessel,L.x+(L.v>0?-3:7),by-7);
        if(Math.floor(S.t*2)%2===0) text('HAUSMEISTER',L.x+3-textW('HAUSMEISTER')/2,by-24,P.gold);
      }
      const abgelenkt=L.abgelenkt>0||L.suchtX!=null;
      if(abgelenkt&&L.hatSchluessel&&Math.floor(S.t*5)%2===0)
        text('JETZT',L.x+3-textW('JETZT')/2,by-31,P.gruen);
    }
    /* Verdachtsbalken */
    if(!fern&&L.verdacht>.02){
      const bw=14;
      ctx.fillStyle='#000a'; ctx.fillRect(L.x-4,by-22,bw+2,4);
      ctx.fillStyle=L.jagd>0?P.rot:(L.verdacht>.6?P.gold:P.neon2);
      ctx.fillRect(L.x-3,by-21,Math.round(bw*L.verdacht),2);
      if(L.jagd>0&&Math.floor(S.t*8)%2===0) text('!',L.x+2,by-28,P.rot);
    }
    ctx.globalAlpha=1;
  }

  /* Spieler */
  const blinkt = S.unverwundbar>0 && Math.floor(S.t*16)%2===0;
  if(!blinkt&&S.modus!=='cutscene'&&S.imSpind<0) zeichneSpieler(S.x,S.y);"""

neu_lehrer = """  /* Sichtkegel zuerst, flach auf dem Laufband - sie liegen unter allen
     Figuren, sonst ueberdecken sie die Lehrer. */
  for(const L of S.lehrer){
    if(L.e!==S.etage) continue;
    const by=BODEN[L.e];
    const w=(L.chef?TUNE.chefSicht:TUNE.sichtWeite)*(S.schleicht?TUNE.schleichSicht:1);
    ctx.globalAlpha=.10+L.verdacht*.22;
    ctx.fillStyle=L.jagd>0?P.rot:(L.chef?'#e0708f':P.gold);
    /* Der Kegel oeffnet sich mit der Entfernung und hat seitlich eine
       Grenze (welt.js). Als Trapez gezeichnet sieht man sofort, wo man
       hinten oder vorne vorbeikommt. */
    const richtung=Math.sign(L.v)||1;
    for(let d=3; d<w; d+=3){
      const px = richtung>0 ? L.x+6+d : L.x+2-d-3;
      const halbWelt = Math.min(TUNE.kegelOeffnung*d, TIEFE.kegelMax*TUNE.tiefeWelt);
      const halb = halbWelt/TUNE.tiefeWelt;
      const t0=Math.max(0,L.t-halb), t1=Math.min(1,L.t+halb);
      const y0=by-tiefeVersatz(t0), y1=by-tiefeVersatz(t1);
      ctx.fillRect(px,y0,3,Math.max(1,y1-y0+1));
    }
    ctx.globalAlpha=1;
  }

  /* Figuren der eigenen Etage nach Tiefe sortiert - wer hinten steht,
     wird zuerst gezeichnet und damit verdeckt. */
  const figuren=[];

  for(const L of S.lehrer){
    const by=BODEN[L.e], fern=L.e!==S.etage;
    const malen=()=>{
      ctx.globalAlpha=fern?.35:1;
      const versatz=fern?0:tiefeVersatz(L.t);
      const yb=by-versatz;
      const bewegt=Math.abs(L.v)>0;
      const rows = L.chef ? SPR.direktor
                 : ((L.jagd>0||bewegt) && Math.floor(S.t*6)%2 ? SPR.lehrerGeh : SPR.lehrer);
      const hoehe = L.chef?17:13;
      if(!fern){
        ctx.globalAlpha=.26; ctx.fillStyle='#000';
        ctx.fillRect(Math.round(L.x),Math.round(yb),7,1);
        ctx.globalAlpha=1;
        outline(rows,L.x,yb-hoehe,1,.6);
      }
      if(L.v>0) spriteFlip(rows,L.x,yb-hoehe); else sprite(rows,L.x,yb-hoehe);
      if(L.hausmeister&&!fern){
        if(L.hatSchluessel){
          sprite(SPR.schluessel,L.x+(L.v>0?-3:7),yb-7);
          if(Math.floor(S.t*2)%2===0) text('HAUSMEISTER',L.x+3-textW('HAUSMEISTER')/2,yb-24,P.gold);
        }
        const abgelenkt=L.abgelenkt>0||L.suchtX!=null;
        if(abgelenkt&&L.hatSchluessel&&Math.floor(S.t*5)%2===0)
          text('JETZT',L.x+3-textW('JETZT')/2,yb-31,P.gruen);
      }
      if(!fern&&L.verdacht>.02){
        const bw=14;
        ctx.fillStyle='#000a'; ctx.fillRect(L.x-4,yb-22,bw+2,4);
        ctx.fillStyle=L.jagd>0?P.rot:(L.verdacht>.6?P.gold:P.neon2);
        ctx.fillRect(L.x-3,yb-21,Math.round(bw*L.verdacht),2);
        if(L.jagd>0&&Math.floor(S.t*8)%2===0) text('!',L.x+2,yb-28,P.rot);
      }
      ctx.globalAlpha=1;
    };
    if(fern) malen(); else figuren.push({t:L.t, mal:malen});
  }

  /* Spieler */
  const blinkt = S.unverwundbar>0 && Math.floor(S.t*16)%2===0;
  if(!blinkt&&S.modus!=='cutscene'&&S.imSpind<0){
    figuren.push({t:S.tiefe, mal:()=>{
      const yb=S.y-tiefeVersatz(S.tiefe);
      ctx.globalAlpha=.26; ctx.fillStyle='#000';
      ctx.fillRect(Math.round(S.x),Math.round(S.y-tiefeVersatz(S.tiefe)),7,1);
      ctx.globalAlpha=1;
      zeichneSpieler(S.x,yb);
    }});
  }
  zeichneNachTiefe(figuren);"""

s = ersetze(s, alt_lehrer, neu_lehrer)

io.open(p, 'w', encoding='utf-8').write(s)
print('Teil 2: Tiefensortierung, Versatz, Sichtkegel als Trapez')
