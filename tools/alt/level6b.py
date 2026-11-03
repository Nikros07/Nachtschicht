# -*- coding: utf-8 -*-
"""Level 6, Teil 2: Verhalten und Bild."""
import io

p = 'level6.html'
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


def loesche(name):
    global s
    start = s.index('\nfunction ' + name + '(') + 1
    ende = s.index('\n}\n', start) + 3
    s = s[:start] + s[ende:]


# Die alte Zeilen-Rede ist durch dialog.js ersetzt
loesche('rede')
loesche('naechsteZeile')
ersetze("/* ---- Reden ---- */\n", "")

LOGIK = r"""
/* ==========================================================================
   WAS IN REICHWEITE IST - eine Stelle fuer Aktion, Knopf und Anzeige.
   ========================================================================== */
function naechstesZiel(){
  let bestes=null, d0=1e9;
  const pruefe=(obj,art,tiefe)=>{
    if(Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;
    const d=Math.abs(obj.x-S.x);
    if(d<TUNE.reichweite&&d<d0){ bestes={art,obj}; d0=d; }
  };
  for(const d of DINGE) pruefe(d,'ding',d.t);
  for(const so of SOFAS) pruefe(so,'sofa',so.t);
  for(const t of TUEREN) pruefe(t,'tuer',t.t);
  for(const e of ECHOS) pruefe(e,'echo',e.t);
  for(const e of NACHTECHOS) if(!S.geredetMit[e.id]) pruefe(e,'nachtecho',e.t);
  pruefe(LEA,'lea',LEA.t);
  return bestes;
}

function redeImTraum(z){
  S.vx=0; S.vt=0; S.ruht=null; SFX.reden();
  if(z.art==='echo'){ starteGespraech(zeilenBaum(z.obj.name,z.obj.zeilen),'start',traumEnde); return; }
  if(z.art==='lea'){
    starteGespraech(alleErinnerungen()?LEA_BAUM:LEA_NOCH_NICHT,'start',traumEnde); return;
  }
  const e=z.obj;
  S.geredetMit[e.id]=true;
  let baum;
  if(e.id==='moritz') baum=MORITZ_ECHO;
  else if(e.id==='sie') baum=sieEcho().baum;
  else baum=marvinEcho().baum;
  starteGespraech(baum,'start',traumEnde);
}
/* Wer das Echo ist, steht erst zur Laufzeit fest - der Name haengt an den
   Flags aus dem Club. */
const echoName=e=>e.id==='moritz'?'MORITZ':e.id==='sie'?sieEcho().name:marvinEcho().name;

/* Wegknicken. Kein Game Over - man wacht am letzten Sofa auf, Zeit ist
   vergangen, und der Pegel ist ein Stueck runter. */
function wegknicken(){
  S.modus='schwarz'; S.schwarzT=0; S.weggeknickt++; S.vx=0; S.vt=0;
  SFX.nichts();
}
function aufwachen(){
  S.modus='spiel'; S.x=S.sofa.x+8; S.tiefe=S.sofa.t+0.1;
  S.kondition=TUNE.aufwachenMit; S.pegel=Math.max(0,S.pegel-10);
  S.kamX=Math.max(0,Math.min(LEVEL_B-W,S.x-W/2));
  meldung(S.weggeknickt>1?'SCHON WIEDER WEGGEKNICKT':'DU BIST WEGGEKNICKT',2.2);
  zeigeHinweis('AUF DEM SOFA AUFGEWACHT',2.4);
}

function mobilKontext(){
  if(S.modus==='titel')    return {aktion:'START',  zwei:null};
  if(S.modus==='intro'||S.modus==='cutscene') return {aktion:'WEITER', zwei:null};
  if(S.modus==='ende')     return {aktion:S.gewonnen?'WEITER':'NOCHMAL', zwei:null};
  if(S.modus==='pause'||S.modus==='schwarz') return {aktion:null, zwei:null};
  if(S.ruht)               return {aktion:'AUFSTEHEN', zwei:null};
  const z=naechstesZiel();
  const txt=!z?null:{ding:S.durchsucht[z.obj.art]?'LEER':'SUCHEN',sofa:'AUSRUHEN',tuer:'TUER',
                     echo:'REDEN',nachtecho:'REDEN',lea:'LEA'}[z.art];
  return {aktion:txt, zwei:'SPRUNG'};
}
"""
ersetze("/* ---- Erinnerungen suchen ---- */", LOGIK + "\n/* ---- Erinnerungen suchen ---- */")

funktion('update', r"""
function update(dt){
  S.t+=dt; musik();
  S.ruettel=Math.max(0,S.ruettel-dt*16);
  S.blitz=Math.max(0,S.blitz-dt*2.2);
  if(S.hinweisT>0) S.hinweisT-=dt;
  if(S.meldungT>0) S.meldungT-=dt;
  if(S.modus==='pause'||S.modus==='titel') return;
  if(S.modus==='intro'){ intro(dt); return; }
  if(gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }
  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt); return; }
  if(S.modus==='ende'){ return; }
  if(S.modus==='schwarz'){ S.schwarzT+=dt; if(S.schwarzT>2.2) aufwachen(); return; }

  S.zeit+=dt;
  if(S.pegel>0) S.pegel=Math.max(0,S.pegel-TUNE.pegelAbbauProSek*dt);

  /* --- Erschoepfung --- */
  if(S.ruht){
    S.kondition=Math.min(100,S.kondition+TUNE.sofaErholung*dt);
    if(linksAn||rechtsAn||hochAn||runterAn||S.kondition>=100){
      S.ruht=null; meldung(S.kondition>=100?'AUSGERUHT':'AUFGESTANDEN',1);
    }
    aktionPuffer.length=0; kamera(dt); return;
  }
  const renntAnteil=Math.min(1,Math.abs(S.vx)/TUNE.gehTempo);
  S.kondition-=(TUNE.konditionAbbau+TUNE.konditionPegel*S.pegel/100
               +TUNE.konditionRennen*renntAnteil)*dt;
  if(S.kondition<=0){ S.kondition=0; wegknicken(); return; }

  const ort=ortBei(S.x);
  if(ort&&ort.wiederholt&&!S.wiederholungGezeigt){
    S.wiederholungGezeigt=true; zeigeHinweis('DIESEN RAUM GAB ES SCHON EINMAL',3);
  }

  /* --- Bewegung --- */
  const richtung=(rechtsAn?1:0)-(linksAn?1:0);
  if(richtung) S.blick=richtung;
  const langsam = (S.pegel>TUNE.langsamAb ? 1-(S.pegel-TUNE.langsamAb)/100 : 1)
                * (S.kondition<TUNE.schwereAb ? 0.55+0.45*S.kondition/TUNE.schwereAb : 1);
  const hoechst = TUNE.gehTempo*langsam;
  const kontrolle = S.amBoden?1:TUNE.luftKontrolle;
  if(richtung){
    S.vx+=richtung*TUNE.beschleunigung*kontrolle*dt;
    if(Math.abs(S.vx)>hoechst) S.vx=hoechst*Math.sign(S.vx);
  } else {
    const brems=TUNE.bremsung*kontrolle*dt;
    S.vx=Math.abs(S.vx)<=brems?0:S.vx-Math.sign(S.vx)*brems;
  }
  S.x+=S.vx*dt;
  S.x=Math.max(14,Math.min(LEVEL_B-14,S.x));
  /* Tiefe ausgeschrieben - S.t ist die Spielzeit (siehe WEITER.md). */
  const rt=(runterAn?1:0)-(hochAn?1:0);
  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);
  S.tiefe=Math.max(0,Math.min(1,S.tiefe+S.vt*dt));

  /* --- Die Schleife im Raum 101 --- */
  if(S.x>SCHLEIFE.x&&S.x<SCHLEIFE.x+12&&!S.erledigt[SCHLEIFE.braucht]){
    S.x=SCHLEIFE.zurueck; S.kamX=Math.max(0,S.x-W/2); S.schleifen++; S.blitz=.4;
    SFX.nichts();
    meldung(S.schleifen===1?'DIESEN RAUM GAB ES SCHON EINMAL':
            S.schleifen===2?'SCHON WIEDER RAUM 101':'WAS IST IM CHEMIERAUM PASSIERT?',2.4);
  }

  if(S.amBoden&&tempo2D(S.vx,S.vt)>12){
    S.gehPhase+=tempo2D(S.vx,S.vt)*dt*.09;
    const n=Math.floor(S.gehPhase);
    if(n!==S.schritte){ S.schritte=n; if(n%2===0) SFX.schritt(); }
  }
  while(sprungPuffer.length){
    const t0=sprungPuffer.shift();
    if(S.t-t0>TUNE.puffermMs/1000) continue;
    if(S.amBoden||(S.t-S.letzterBoden)<TUNE.coyoteMs/1000){
      S.vy=TUNE.sprungKraft; S.amBoden=false; SFX.sprung(); }
  }
  if(!sprungAn&&S.vy<0) S.vy*=(1-TUNE.kurzsprung*dt*12);
  S.vy+=TUNE.gravitation*dt; S.y+=S.vy*dt;
  if(S.y>=BODEN){ S.y=BODEN; if(!S.amBoden) SFX.landen();
    S.vy=0; S.amBoden=true; S.letzterBoden=S.t; } else S.amBoden=false;

  if(S.suchT>0){
    S.suchT-=dt;
    if(S.suchT<=0) suchErgebnis();
    kamera(dt); return;
  }

  while(aktionPuffer.length){
    aktionPuffer.shift();
    const z=naechstesZiel();
    if(!z) continue;
    if(z.art==='ding'){ benutze(z.obj); break; }
    if(z.art==='sofa'){
      S.ruht=z.obj; S.sofa=z.obj; S.vx=0; S.vt=0;
      meldung('DU LEGST DICH KURZ HIN',1.4); break;
    }
    if(z.art==='tuer'){
      S.x=z.obj.ziel; S.kamX=Math.max(0,Math.min(LEVEL_B-W,S.x-W/2)); S.blitz=.6; SFX.nichts();
      meldung(z.obj.luegt?'DAS WAR NICHT RAUS':'DURCH DIE TUER',1.8); break;
    }
    redeImTraum(z); break;
  }
  kamera(dt);
}""")

# ---------------------------------------------------------------- Bild ----
funktion('zeichneFlur', r"""
function zeichneFlur(){
  ctx.save();
  const rx=(Math.random()-.5)*S.ruettel, ry=(Math.random()-.5)*S.ruettel*.6;
  ctx.translate(Math.round(rx),Math.round(ry));
  const kx=Math.round(S.kamX);
  ctx.translate(-kx,0);

  for(const o of ORTE){
    ctx.fillStyle=o.wand; ctx.fillRect(o.von,20,o.bis-o.von,TIEFE.hinten-20);
    ctx.fillStyle='#00000044'; ctx.fillRect(o.von,20,o.bis-o.von,2);
    ctx.fillStyle='#0d0a14'; ctx.fillRect(o.bis-2,20,2,TIEFE.hinten-20);
    ctx.fillStyle=o.boden; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,H-TIEFE.hinten);
    ctx.fillStyle=P.bodenKante; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,1);
    text(raumName(o),o.von+6,26,'#ffffff18');
  }
  /* Dieselbe Tafel, zweimal - der Raum wiederholt sich absichtlich */
  sprite(SPR.tafel,260,TIEFE.hinten-34);
  sprite(SPR.tafel,640,TIEFE.hinten-34);
  /* Die Wand am Ende des zweiten Raum 101 - sichtbar, solange sie gilt */
  if(!S.erledigt[SCHLEIFE.braucht]){
    ctx.globalAlpha=.35+Math.sin(S.t*3)*.15;
    for(let y=TIEFE.hinten-10;y<H;y+=14) sprite(SPR.wand,SCHLEIFE.x+4,y-14);
    ctx.globalAlpha=1;
  }

  const liste=[];
  for(const d of DINGE){ const rows=SPR[d.moebel];
    liste.push({t:d.t, mal:()=>{ const y=bodenY(d.t)-rows.length;
      outline(rows,d.x,y,1,.5); sprite(rows,d.x,y,1,S.durchsucht[d.art]?'#3a3350':null); }}); }
  for(const so of SOFAS) liste.push({t:so.t, mal:()=>{
    const y=bodenY(so.t)-SPR.sofa.length; sprite(SPR.sofa,so.x-6,y);
    if(S.ruht===so){ const rows=SPR.fall; spriteFlip(rows,so.x-4,y-6); } }});
  for(const tu of TUEREN) liste.push({t:tu.t, mal:()=>{
    const y=bodenY(tu.t)-SPR.tuer.length; sprite(SPR.tuer,tu.x-4,y);
    text(tu.name,tu.x-textW(tu.name)/2,y-8,P.dim); }});
  for(const e of ECHOS) liste.push({t:e.t, mal:()=>{
    const rows=SPR.steh, y=bodenY(e.t)-rows.length;
    outline(rows,e.x-3,y,1,.4); sprite(rows,e.x-3,y,1,e.tint,.8);
    if(Math.abs(e.x-S.x)<60) text(e.name,e.x+2-textW(e.name)/2,y-9,P.dim); }});
  for(const e of NACHTECHOS){ if(S.geredetMit[e.id]) continue;
    liste.push({t:e.t, mal:()=>{
      const rows=SPR.steh, y=bodenY(e.t)-rows.length+Math.round(Math.sin(S.t*2+e.x)*1);
      sprite(rows,e.x-3,y,1,e.tint,.7);
      if(Math.abs(e.x-S.x)<70){ const n=echoName(e); text(n,e.x+2-textW(n)/2,y-9,e.tint); } }}); }
  liste.push({t:LEA.t, mal:()=>{
    const rows=SPR.lea, y=bodenY(LEA.t)-rows.length;
    outline(rows,LEA.x-3,y,1,.7); sprite(rows,LEA.x-3,y);
    textGlow('LEA',LEA.x+2-textW('LEA')/2,y-9,P.neon2); }});

  if(!S.ruht&&S.modus!=='schwarz') liste.push({t:S.tiefe, mal:()=>{
    let rows;
    if(S.suchT>0) rows=SPR.suchen;
    else if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;
    else if(tempo2D(S.vx,S.vt)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];
    else rows=SPR.steh;
    const versatz=BODEN-bodenY(S.tiefe), y=S.y-versatz-rows.length;
    ctx.globalAlpha=.28; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(S.x-3),Math.round(bodenY(S.tiefe)),7,1); ctx.globalAlpha=1;
    outline(rows,S.x-3,y,1,.6);
    if(S.blick<0) spriteFlip(rows,S.x-3,y); else sprite(rows,S.x-3,y);
  }});
  zeichneNachTiefe(liste);
  ctx.restore();

  /* Erschoepfung zieht das Bild von den Raendern zu */
  const muede=Math.max(0,1-S.kondition/TUNE.schwereAb);
  ctx.globalAlpha=Math.min(1,.5+muede*.5);
  ctx.drawImage(verlauf('vig',W,H,g=>{
    const gr=g.createRadialGradient(W/2,H*.55,44,W/2,H*.55,W*.6);
    gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,1)');
    g.fillStyle=gr; g.fillRect(0,0,W,H); }),0,0);
  if(muede>0){ ctx.globalAlpha=muede*.45*(0.6+0.4*Math.sin(S.t*1.3)); ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H); }
  ctx.globalAlpha=1;
}""")

funktion('zeichnePrompts', r"""
function zeichnePrompts(){
  if(S.modus!=='spiel'||S.suchT>0||S.ruht||gespraechAktiv()) return;
  if(Math.floor(S.t*4)%2!==0) return;
  const z=naechstesZiel(); if(!z) return;
  const sx=Math.round(z.obj.x-S.kamX), sy=Math.round(bodenY(z.obj.t))-26;
  const t=z.art==='ding'&&S.durchsucht[z.obj.art]?'OK':'E';
  text(t,sx-textW(t)/2,sy,t==='OK'?P.dunkel:P.gold);
}""")

# HUD: Wachheit
ersetze("""  const zeitStr=Math.floor(S.zeit/60)+':'+String(Math.floor(S.zeit%60)).padStart(2,'0');
  text(zeitStr,W-textW(zeitStr)-6,6,P.dunkel);""",
"""  const zeitStr=Math.floor(S.zeit/60)+':'+String(Math.floor(S.zeit%60)).padStart(2,'0');
  text(zeitStr,W-textW(zeitStr)-6,6,P.dunkel);

  /* Wachheit - der eigentliche Gegner in diesem Level */
  { const kw=54, kx=W-kw-6, ky=15, k=S.kondition/100;
    ctx.fillStyle='#000a'; ctx.fillRect(kx-2,ky-2,kw+4,7);
    ctx.fillStyle='#2a2440'; ctx.fillRect(kx,ky,kw,3);
    const knapp=S.kondition<TUNE.schwereAb;
    ctx.fillStyle=knapp&&Math.floor(S.t*4)%2===0?P.rot:(knapp?P.gold:P.neon2);
    ctx.fillRect(kx,ky,Math.round(kw*k),3);
    text(S.ruht?'AUSRUHEN':'WACH',kx+kw-textW(S.ruht?'AUSRUHEN':'WACH'),ky+6,P.dunkel); }""")

ersetze("""  if(alleErinnerungen()&&Math.floor(S.t*2)%2===0) textC('GEH ZU LEA',H-42,P.gold);""",
        """  if(alleErinnerungen()&&Math.floor(S.t*2)%2===0) textC('GEH ZU LEA',H-42,P.gold);
  zeichneGespraech();
  if(S.modus==='schwarz'){ ctx.fillStyle=`rgba(0,0,0,${Math.min(1,S.schwarzT*1.5).toFixed(3)})`;
    ctx.fillRect(0,0,W,H); if(S.schwarzT>0.8) textC('...',H/2,P.dunkel); }""")

# ---------------------------------------------------------------- Ende ----
ersetze("""const SZENEN=[
  { d:1.0, txt:'' },
  { d:2.4, txt:'LEA: HEY. SCHAU MICH AN.' },
  { d:2.2, txt:'LEA: DAS HIER IST NICHT ECHT.' },
  { d:2.2, txt:'DU: ABER ES FUEHLT SICH ECHT AN.' },
  { d:2.4, txt:'LEA: ICH WEISS. KOMM MIT.' },
  { d:1.6, txt:'' },
  { d:2.6, txt:'DIE FLURE WERDEN DUENNER.' },
  { d:2.6, txt:'LEA BLEIBT DIE GANZE NACHT KLAR.' },
  { d:2.4, txt:'LEVEL 6 GESCHAFFT' },
];""",
"""const SZENEN=[
  { d:1.0, txt:'' },
  { d:2.4, txt:'DU MACHST DIE AUGEN AUF.' },
  { d:2.4, txt:'EIN SOFA. EINE FREMDE WOHNUNG. MUSIK AUS DER KUECHE.' },
  { d:2.4, txt:'LEA SITZT NEBEN DIR UND GRINST.' },
  { d:2.4, txt:'LEA: GUTEN MORGEN. ES IST HALB VIER.' },
  { d:2.6, txt:'LEA: DIE ANDEREN SIND SCHON UNTEN. SPAETI.' },
  { d:2.4, txt:'LEVEL 6 GESCHAFFT' },
];""")

ersetze("""function levelGeschafft(){
  speichereCrew('LEA');""",
"""function levelGeschafft(){
  speichereCrew('LEA');
  /* Wie wach man aus der Afterhour rauskommt, traegt man in den Heimweg. */
  setzeWert('kondition',Math.round(S.kondition));
  setzeKapitel(7);""")

# Titel und Intro sagen, worum es geht
ersetze("""function starteLevel(){ S.modus='spiel'; zeigeHinweis('FIND DEINE ERINNERUNGEN. GEH DANN ZU LEA.',4);""",
        """function starteLevel(){ S.modus='spiel'; zeigeHinweis('FIND DEINE ERINNERUNGEN. BLEIB WACH. SOFAS HELFEN.',4);""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 6 Teil 2: Verhalten und Bild')
