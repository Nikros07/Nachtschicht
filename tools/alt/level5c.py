# -*- coding: utf-8 -*-
"""Level 5, Teil 3: das Bild.

Alles mit Tiefe kommt in eine Liste und wird von hinten nach vorn gemalt.
Dazu die Ecke (Schwarzbild mit Text), die Schlaegerei und das HUD.
"""
import io

p = 'level5.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


def funktion(name, neu):
    global s
    start = s.index('\nfunction ' + name + '(') + 1
    ende = s.index('\n}\n', start) + 3
    s = s[:start] + neu.strip('\n') + '\n' + s[ende:]


funktion('zeichneClub', r"""
function zeichneClub(){
  const kx=Math.round(S.kamX);
  ctx.save(); ctx.translate(-kx,0);

  for(const o of ORTE){
    ctx.fillStyle=o.wand; ctx.fillRect(o.von,20,o.bis-o.von,TIEFE.hinten-20);
    ctx.fillStyle='#00000044'; ctx.fillRect(o.von,20,o.bis-o.von,2);
    ctx.fillStyle='#0d0a14'; ctx.fillRect(o.bis-2,20,2,TIEFE.hinten-20);
    ctx.fillStyle=o.boden; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,H-TIEFE.hinten);
    ctx.fillStyle=P.bodenKante; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,1);
    ctx.fillStyle='#00000033';
    for(let y=TIEFE.hinten+8;y<H;y+=9) for(let x=o.von+((y>>1)%14);x<o.bis;x+=14) ctx.fillRect(x,y,7,1);
    text(o.name,o.von+6,26,'#ffffff18');
  }

  /* Partylicht - nur ueber der Tanzflaeche, gedaempft, nie reines Weiss */
  const lichter=[[240,'#ff3d8b',0],[390,'#42d9ff',1.4],[540,'#ffd447',.6]];
  for(const [lx,col,off] of lichter){
    const puls=(Math.sin(S.t*1+off)*.5+.5);
    ctx.globalAlpha=.08+puls*.09;
    ctx.drawImage(verlauf('licht'+col,180,110,g=>{
      const gr=g.createRadialGradient(90,18,4,90,18,90);
      const rgb=col==='#ff3d8b'?'255,60,180':col==='#42d9ff'?'70,210,255':'255,210,80';
      gr.addColorStop(0,`rgba(${rgb},1)`); gr.addColorStop(1,`rgba(${rgb},0)`);
      g.fillStyle=gr; g.fillRect(0,0,180,110); }),lx-90,20);
  }
  ctx.globalAlpha=1;
  /* Raucherecke: eine Laterne statt Discolicht */
  ctx.globalAlpha=.12; ctx.fillStyle='#ffd447'; ctx.fillRect(900,30,120,TIEFE.hinten-30); ctx.globalAlpha=1;

  sprite(SPR.dj,120,TIEFE.hinten-14);

  const naechst=S.modus==='spiel'?naechstesZiel():null;
  const blink=Math.floor(S.t*4)%2===0;
  const liste=[];
  const schatten=(x,t)=>{ ctx.globalAlpha=.24; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(x-3),Math.round(bodenY(t)),7,1); ctx.globalAlpha=1; };

  for(const tz of TANZER){
    liste.push({t:tz.t, mal:()=>{
      const y=bodenY(tz.t)-5+Math.round(Math.sin(S.t*3+tz.seed));
      sprite(SPR.tanzer,tz.x-2,y);
    }});
  }

  /* Bar und Waschbecken stehen an der Rueckwand */
  liste.push({t:BARTHEKE.t, mal:()=>{
    const y=bodenY(BARTHEKE.t)-4;
    outline(SPR.theke,BARTHEKE.x-6,y,1,.5); sprite(SPR.theke,BARTHEKE.x-6,y);
    text('BAR',BARTHEKE.x-textW('BAR')/2+0,y-10,P.dim);
    if(naechst&&naechst.obj===BARTHEKE&&blink) text('E',BARTHEKE.x-2,y-18,P.gold);
  }});
  liste.push({t:WASCHBECKEN.t, mal:()=>{
    const y=bodenY(WASCHBECKEN.t)-SPR.waschbecken.length;
    sprite(SPR.waschbecken,WASCHBECKEN.x-3,y);
    if(naechst&&naechst.obj===WASCHBECKEN&&blink) text('E',WASCHBECKEN.x-1,y-8,P.gold);
  }});
  liste.push({t:AUSGANG.t, mal:()=>{
    const y=bodenY(AUSGANG.t)-SPR.tuer.length;
    sprite(SPR.tuer,AUSGANG.x-4,y);
    text('AFTERHOUR',AUSGANG.x-textW('AFTERHOUR')/2,y-8,P.gold);
    if(naechst&&naechst.obj===AUSGANG&&blink) text('E',AUSGANG.x-1,y-16,P.gold);
  }});

  for(const z of ZIELE){
    if(z.weg) continue;
    liste.push({t:z.t, mal:()=>{
      const rows=SPR[z.spr], y=bodenY(z.t)-rows.length;
      schatten(z.x,z.t);
      outline(rows,z.x-3,y,1,.55); sprite(rows,z.x-3,y);
      /* Name nur in der Naehe - sonst ist das Bild voller Beschriftung */
      if(Math.abs(z.x-S.x)<60){
        const farbe={offen:P.weiss,ja:P.gold,nummer:P.gruen,nett:P.dim,nein:P.rot,weg:P.dunkel}[z.stand];
        text(z.name,z.x+3-textW(z.name)/2,y-9,farbe);
        if(z.stand==='weg') text('MIT MARVIN',z.x+3-textW('MIT MARVIN')/2,y-16,P.dunkel);
      }
      if(naechst&&naechst.obj===z&&blink) text('E',z.x+2,y-16,P.gold);
    }});
  }
  liste.push({t:LENA.t, mal:()=>{
    const rows=SPR.lena, y=bodenY(LENA.t)-rows.length;
    schatten(LENA.x,LENA.t); sprite(rows,LENA.x-3,y);
    if(Math.abs(LENA.x-S.x)<40) text('LENA',LENA.x+3-textW('LENA')/2,y-9,P.dunkel);
  }});

  const m=S.marvin;
  if(m.da&&!m.fertig&&S.modus!=='kloppe'){
    liste.push({t:m.t, mal:()=>{
      const lauf=laufBild(m);
      const rows=lauf>=0?gehBeine(SPR.marvin,lauf):SPR.marvin, y=bodenY(m.t)-rows.length;
      schatten(m.x,m.t);
      outline(rows,m.x-3,y,1,.6);
      if(m.blick<0) spriteFlip(rows,m.x-3,y,1,m.wut?'#ff8080':null);
      else sprite(rows,m.x-3,y,1,m.wut?'#ff8080':null);
      if(Math.abs(m.x-S.x)<80) text('MARVIN',m.x+3-textW('MARVIN')/2,y-9,m.wut?P.rot:P.dim);
      /* Wie lange er schon bei ihr steht - man soll sehen, dass es eng wird */
      if(m.beiT>0&&m.ziel){
        const f=Math.min(1,m.beiT/TUNE.marvinNimmt);
        ctx.fillStyle='#2a2440'; ctx.fillRect(Math.round(m.x-5),y-4,11,2);
        ctx.fillStyle=P.rot; ctx.fillRect(Math.round(m.x-5),y-4,Math.round(11*f),2);
      }
    }});
  }

  if(S.modus==='kloppe') zeichneKloppe(liste);
  else liste.push({t:S.tiefe, mal:()=>{
    let rows;
    if(S.stolpernT>0) rows=SPR.steh;
    else if(tempo2D(S.vx,S.vt)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];
    else rows=SPR.steh;
    const tint=S.stolpernT>0?'#ff4d4d':(S.confidenceT>0?'#ffd447':null);
    const y=bodenY(S.tiefe)-rows.length;
    schatten(S.x,S.tiefe);
    outline(rows,S.x-3,y,1,.6);
    if(S.blick<0) spriteFlip(rows,S.x-3,y,1,tint); else sprite(rows,S.x-3,y,1,tint);
  }});

  zeichneNachTiefe(liste);
  ctx.restore();

  const p=S.pegel/100;
  ctx.globalAlpha=Math.min(1,.5+p*.4);
  ctx.drawImage(verlauf('vig',W,H,g=>{
    const gr=g.createRadialGradient(W/2,H*.55,44,W/2,H*.55,W*.6);
    gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,1)');
    g.fillStyle=gr; g.fillRect(0,0,W,H); }),0,0);
  ctx.globalAlpha=1;
}

/* Die Schlaegerei. Im Stroboskop ist das Ausholen oft nicht zu sehen -
   das ist Absicht und steht so im Plan: schlechte Sicht, Leute im Weg. */
function zeichneKloppe(liste){
  const malK=(k,steh,grund)=>liste.push({t:k.t, mal:()=>{
    const lauf=laufBild(k);
    let rows=steh;
    if(lauf>=0&&(k.zustand==='frei'||k.zustand==='block')) rows=steh===SPR.steh?SPR.geh[lauf]:gehBeine(steh,lauf);
    const y=bodenY(k.t)-rows.length+(k.zustand==='rolle'?3:0);
    const blinkt=k.unverwundbar>0&&Math.floor(S.t*18)%2===0;
    const tint=k.zustand==='block'?'#42d9ff':k.zustand==='ausholen'?P.gold:
               k.zustand==='getroffen'?'#ff8080':blinkt?'#ffffff':grund;
    ctx.globalAlpha=.24; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(k.x-3),Math.round(bodenY(k.t)),7,1); ctx.globalAlpha=1;
    outline(rows,k.x-3,y,1,.6);
    if(k.blick<0) spriteFlip(rows,k.x-3,y,1,tint); else sprite(rows,k.x-3,y,1,tint);
    if(k!==S.ich) for(let i=0;i<k.maxHp;i++){
      ctx.fillStyle=i<k.hp?P.rot:'#2a2440'; ctx.fillRect(Math.round(k.x-4+i*3),y-6,2,2); }
  }});
  for(const g of S.gegner) if(g.hp>0) malK(g, g.marvin?SPR.marvin:SPR.handlanger, null);
  if(S.ich) malK(S.ich, SPR.steh, null);
}""")

# ---------------------------------------------------------------- draw ----
ersetze("""  hud();
  if(S.blitz>0){ ctx.fillStyle=`rgba(255,255,255,${(S.blitz*.4).toFixed(3)})`; ctx.fillRect(0,0,W,H); }
  bildschirme();""",
"""  hud();
  zeichneGespraech();
  if(S.modus==='ecke') zeichneEcke();
  if(S.blitz>0){ ctx.fillStyle=`rgba(255,255,255,${(S.blitz*.4).toFixed(3)})`; ctx.fillRect(0,0,W,H); }
  bildschirme();
}

/* Die Ecke: das Bild wird schwarz, die Zeilen kommen einzeln. */
function zeichneEcke(){
  const e=S.ecke; if(!e) return;
  ctx.fillStyle='#030208'; ctx.fillRect(0,0,W,H);
  const zeilen=ECKE[e.z.id];
  const y0=Math.round(H/2-zeilen.length*6);
  for(let i=0;i<=e.i&&i<zeilen.length;i++){
    const alpha=i<e.i?0.45:Math.min(1,e.t*2);
    ctx.globalAlpha=alpha;
    textC(zeilen[i],y0+i*12,i===e.i?P.weiss:P.dim);
  }
  ctx.globalAlpha=1;
  textC(e.z.name,y0-18,P.neon);
  if(Math.floor(S.t*2)%2===0) textC(IS_TOUCH?'TIPPEN':'E',H-14,P.dunkel);""")

# ----------------------------------------------------------------- HUD ----
ersetze("""  /* Erfolge */
  text('ERFOLGE '+S.erfolge+'/'+TUNE.erfolgeZumSieg,6,6,P.weiss);""",
"""  /* Erfolge und Ruf - der Ruf entscheidet, welche Antworten noch gehen */
  text('ERFOLGE '+S.erfolge,6,6,P.weiss);
  text('RUF '+Math.round(wert('ruf')),6,14,wert('ruf')<40?P.rot:P.dim);
  if(S.modus==='kloppe'&&S.ich){
    for(let i=0;i<S.ich.maxHp;i++){ ctx.fillStyle=i<S.ich.hp?P.rot:'#2a2440'; ctx.fillRect(6+i*7,24,5,4); }
    ctx.fillStyle='#2a2440'; ctx.fillRect(6,31,54,3);
    ctx.fillStyle=S.ich.ausdauer<KAMPF.ausdauerSchlag?P.rot:P.neon2;
    ctx.fillRect(6,31,Math.round(54*S.ich.ausdauer/KAMPF.ausdauerMax),3);
  }""")

ersetze("""  if(S.confidenceT>0&&Math.floor(S.t*3)%2===0) text('CONFIDENCE',6,22,P.gold);
  if(S.geknicktT>0&&Math.floor(S.t*3)%2===0) text('GEKNICKT',6,22,P.rot);""",
"""  if(S.modus!=='kloppe'){
    if(S.confidenceT>0&&Math.floor(S.t*3)%2===0) text('CONFIDENCE',6,24,P.gold);
    if(S.geknicktT>0&&Math.floor(S.t*3)%2===0) text('GEKNICKT',6,24,P.rot);
  }""")

ersetze("""    text(m.art==='ex'?'AUF EX':'ANSPRECHEN',8,H-38,P.neon2);""",
        """    text(m.art==='ex'?'AUF EX':'TANZEN MIT '+m.ziel.name,8,H-38,P.neon2);""")

ersetze("""      textC('ERFOLGE  '+S.erfolge+'/'+TUNE.erfolgeZumSieg,96,P.dim);""",
        """      textC('ERFOLGE  '+S.erfolge+'   RUF  '+Math.round(wert('ruf')),96,P.dim);""")

# --------------------------------------------------------------- Titel ----
ersetze("""  const zeilen=['DIE SICHT FLACKERT DEN GANZEN ABEND','SPRICH LEUTE AN ODER GEH AN DIE BAR','GENUG ERFOLGE UND DIE TUER GEHT AUF'];""",
        """  const zeilen=['AUF DER TANZFLAECHE SIEHT MAN NICHTS','WAS DU SAGST, ENTSCHEIDET','UND MARVIN IST AUCH HIER'];""")
ersetze("""  const st=IS_TOUCH?[['< >','LAUFEN'],['E','ANSPRECHEN, TRINKEN, TUER']]
                   :[['A D','LAUFEN'],['E','ANSPRECHEN, TRINKEN, TUER']];""",
        """  const st=IS_TOUCH?[['STICK','LAUFEN'],['KNOPF','REDEN, TRINKEN, TUER']]
                   :[['WASD','LAUFEN'],['E','REDEN, TRINKEN, TUER']];""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 5 Teil 3: Bild')
