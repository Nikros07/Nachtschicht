# -*- coding: utf-8 -*-
"""Level 8: den grossen Fight vor den Heimweg setzen.

Ablauf danach: Intro -> KAMPF (drei Phasen, wechselnde Arena) -> Lauf gegen
die Sonne -> Cutscene -> Ende. Verlieren beendet das Spiel nicht, es macht
den Heimweg nur haerter - so steht es im PLAN.md.
"""
import io

p = 'level8.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Engine-Module + Touch-Knoepfe ----------
s = ersetze(s, '<script src="nacht/stand.js"></script>',
    '<script src="nacht/stand.js"></script>\n'
    '<script src="nacht/welt.js"></script>\n'
    '<script src="nacht/kampf.js"></script>\n'
    '<script src="nacht/nacht.js"></script>')

s = ersetze(s,
    '      <div class="btn" id="tjump">SPR</div><div class="btn" id="thit">E</div>',
    '      <div class="btn" id="tjump">SPR</div><div class="btn" id="thit">E</div>\n'
    '      <div class="btn" id="tblock">BLOCK</div><div class="btn" id="trolle">ROLLE</div>')

s = ersetze(s, '  #thit   { right:3%; bottom:8%; width:17%; aspect-ratio:1; }',
    '  #thit   { right:3%;  bottom:8%;  width:17%; aspect-ratio:1; }\n'
    '  #tblock { right:12%; bottom:34%; width:15%; aspect-ratio:1; font-size:7px; display:none; }\n'
    '  #trolle { right:32%; bottom:34%; width:15%; aspect-ratio:1; font-size:7px; display:none; }\n'
    '  html.kampf #tblock, html.kampf #trolle { display:flex; }')

# ---------- Der Fight ----------
FIGHT = r"""
/* ==========================================================================
   DER GROSSE FIGHT
   Die Gruppe, die euch seit dem Club verfolgt, stellt euch auf dem Heimweg.

   Drei Phasen, und die Arena wechselt mit jeder: Strasse, Hinterhof,
   Baustelle. Jede Phase bringt etwas dazu, das die vorige Antwort entwertet -
   in Phase 2 Handlanger, die dich einkreisen, in Phase 3 unblockbare
   Angriffe und Wuerfe. Nur Blocken reicht dann nicht mehr.

   Verlieren beendet das Spiel NICHT. Es kostet Licht-Vorsprung fuer den
   Heimweg und faerbt das Ende ein.
   ========================================================================== */
const KAMPF8 = {
  /* (1) DER ANFUEHRER */
  anfuehrerHp:      9,
  anfuehrerReich:  19,
  schwungWindup: 0.95, schwungSchlag: 0.22,
  jabWindup:     0.48, jabSchlag:     0.14,
  rammeWindup:   0.72, rammeSchlag:   0.28,
  wurfWindup:    0.85, wurfSchlag:    0.16,
  pause:         0.80,
  pauseKuerzerProPhase: 0.20,
  windupKuerzerProPhase:0.10,

  /* (2) HANDLANGER - ab Phase 2, sie kreisen dich ein */
  handlangerAb:     2,
  handlangerAnzahl: 2,

  /* (3) FLASCHEN - ab Phase 3, kommen geflogen */
  flascheTempo:   122,
  flascheSchaden:   1,

  /* (4) DEINE CREW - wer dich mag, geht dazwischen */
  hilfeIntervall: 5.5,   // Sekunden zwischen zwei Einmischungen
  hilfeBetaeubung: 1.0,

  /* (5) ARENA */
  arenaLinks:   18,
  arenaRechts:  22,
  tiefeHinten: 118,
  tiefeVorne:  152,
  gehTempo:     78,

  /* (6) NIEDERLAGE - kein Spielende, nur ein schwererer Heimweg */
  lichtStrafeBeiNiederlage: 22,
};

const ARENEN = [
  { name:'DIE STRASSE',   himmel:'#12101f', boden:'#1d1728', kante:'#3a2f4e' },
  { name:'DER HINTERHOF', himmel:'#0f1418', boden:'#18201c', kante:'#2e3a32' },
  { name:'DIE BAUSTELLE', himmel:'#1a1410', boden:'#241c14', kante:'#4a3720' },
];

function phase8(){
  const g=S.gegner; if(!g) return 1;
  const a=g.hp/KAMPF8.anfuehrerHp;
  return a<=0.34?3:a<=0.67?2:1;
}

function starteGrossenKampf(){
  S.modus='kampf';
  document.documentElement.classList.add('kampf');
  setzeTiefenband(KAMPF8.tiefeHinten,KAMPF8.tiefeVorne);
  S.spielerK=kaempfer({ x:70, t:0.5, blick:1, hp:3, maxHp:3 });
  S.gegner=kaempfer({ x:210, t:0.5, blick:-1, art:'anfuehrer',
    hp:KAMPF8.anfuehrerHp, maxHp:KAMPF8.anfuehrerHp,
    reichweite:KAMPF8.anfuehrerReich, pauseT:1.2, vorZustand:'frei' });
  S.handlanger=[]; S.flaschen=[]; S.arena=0; S.arenaWechselT=0;
  S.hilfeT=KAMPF8.hilfeIntervall; S.hilfeText='';
  S.blockAn=false;
  zeigeHinweis('E SCHLAGEN - SHIFT BLOCKEN - LEER AUSWEICHEN',4);
  meldung('DIE HABEN AUF EUCH GEWARTET',2);
}

function wechsleArena(neu){
  S.arena=neu; S.arenaWechselT=1.6;
  S.flaschen.length=0;
  meldung(ARENEN[neu].name,2);
  SFX.aua();
  /* Handlanger tauchen auf, sobald es in den Hinterhof geht. */
  if(neu+1>=KAMPF8.handlangerAb && !S.handlanger.length){
    for(let i=0;i<KAMPF8.handlangerAnzahl;i++)
      S.handlanger.push(gegner(i===0?'flitzer':'schlaeger',
        i===0?250:30, i===0?0.2:0.8));
  }
}

/* ---- Der Anfuehrer ---- */
function naechsterAngriff8(g){
  const ph=phase8();
  let moeglich=['schwung','jab'];
  if(ph>=2) moeglich.push('ramme');
  if(ph>=3) moeglich.push('wurf','ramme');
  let art=pick(moeglich);
  if(g.letzteArt===art) g.serie=(g.serie||0)+1; else g.serie=0;
  if(g.serie>=2){ art=pick(moeglich.filter(a=>a!==art)); g.serie=0; }
  g.letzteArt=art;
  return art;
}
function starteAngriff8(g,art){
  const ph=phase8();
  const k=1-(ph-1)*KAMPF8.windupKuerzerProPhase;
  g.art=art;
  g.ausholenDauer=(art==='schwung'?KAMPF8.schwungWindup
                  :art==='jab'?KAMPF8.jabWindup
                  :art==='ramme'?KAMPF8.rammeWindup:KAMPF8.wurfWindup)*k;
  g.schlagDauer=(art==='schwung'?KAMPF8.schwungSchlag
                :art==='jab'?KAMPF8.jabSchlag
                :art==='ramme'?KAMPF8.rammeSchlag:KAMPF8.wurfSchlag);
  g.unblockbarJetzt=(art==='ramme');
  g.fensterAnteil=KAMPF.konterAnteil;
  g.zustand='ausholen'; g.zT=0; g.trefferGesetzt=false;
  SFX.aua();
}
function anfuehrerTakt(dt,ziel){
  const g=S.gegner;
  kaempferTakt(g,dt);
  if(g.hp<=0) return;
  g.blick=Math.sign(ziel.x-g.x)||g.blick;

  if(g.art==='ramme'){
    if(g.zustand==='ausholen') g.x+=g.blick*30*dt;
    if(g.zustand==='schlag')   g.x+=g.blick*165*dt;
  }
  /* Der Wurf loest beim Schlag eine Flasche aus, kein Nahkampftreffer. */
  if(g.art==='wurf'&&g.zustand==='schlag'&&!g.trefferGesetzt){
    g.trefferGesetzt=true;
    S.flaschen.push({x:g.x,t:g.t,vx:g.blick*KAMPF8.flascheTempo});
  }

  if(g.zustand==='frei'&&g.vorZustand!=='frei')
    g.pauseT=Math.max(0.22,KAMPF8.pause-(phase8()-1)*KAMPF8.pauseKuerzerProPhase);
  g.vorZustand=g.zustand;
  if(g.zustand!=='frei') return;

  g.pauseT-=dt;
  const dx=ziel.x-g.x, dtf=(ziel.t||0)-(g.t||0);
  const fern=g.letzteArt==='wurf';
  const zuWeit=!fern&&(Math.abs(dx)>g.reichweite*0.8||Math.abs(dtf)>KAMPF.tiefeToleranz*0.8);
  if(g.pauseT>0||zuWeit){
    if(Math.abs(dx)>g.reichweite*0.75) g.x+=Math.sign(dx)*52*dt;
    if(Math.abs(dtf)>0.05) bewegeTiefe(g,Math.sign(dtf),dt,TIEFE.tempo*0.6,9);
    return;
  }
  starteAngriff8(g,naechsterAngriff8(g));
}

/* ---- Deine Crew mischt sich ein ----
   Wer dabei ist und dich mag, geht dazwischen. Wen du versetzt hast,
   schaut zu. Beziehung kommt aus nacht.js, Crew aus stand.js. */
function crewHilfeTakt(dt){
  const crew=ladeCrew();
  if(!crew.length) return;
  S.hilfeT-=dt;
  if(S.hilfeT>0) return;
  S.hilfeT=KAMPF8.hilfeIntervall;
  const willig=crew.filter(n=>beziehung(n)>=-20);
  if(!willig.length){ meldung('KEINER GEHT DAZWISCHEN',1.4); return; }
  const wer=pick(willig);
  /* Lieber einen Handlanger aufhalten als den Anfuehrer. */
  const ziel=S.handlanger.find(h=>h.hp>0)||S.gegner;
  ziel.zustand='getroffen'; ziel.betaeubt=KAMPF8.hilfeBetaeubung;
  S.hilfeText=wer+' GEHT DAZWISCHEN';
  meldung(S.hilfeText,1.6);
}

function kampf8(dt){
  kampfStopTakt(dt);
  const zdt=dt*kampfZeitFaktor();
  if(zdt<=0) return;
  const s=S.spielerK, g=S.gegner;

  if(S.arenaWechselT>0){ S.arenaWechselT-=zdt; return; }

  /* ---- Eingabe ---- */
  if(rolleGedrueckt){
    rolleGedrueckt=false;
    const r=(runterAn?1:0)-(hochAn?1:0);
    rolle(s,r||(s.t<0.5?1:-1));
  }
  blocke(s,!!S.blockAn && aktionPuffer.length===0);
  if(s.zustand==='frei'||s.zustand==='block'){
    const rx=(rechtsAn?1:0)-(linksAn?1:0);
    const langsamer=s.zustand==='block'?0.45:1;
    if(rx){ s.x+=rx*KAMPF8.gehTempo*langsamer*zdt; s.blick=rx; }
    const rt=(runterAn?1:0)-(hochAn?1:0);
    bewegeTiefe(s,rt,zdt,TIEFE.tempo*langsamer);
  }
  s.x=Math.max(KAMPF8.arenaLinks,Math.min(W-KAMPF8.arenaRechts,s.x));

  while(aktionPuffer.length){
    aktionPuffer.shift();
    if(s.ausdauer<KAMPF.ausdauerSchlag){ meldung('AUSSER PUSTE',0.9); continue; }
    /* Konter zuerst - gegen den Anfuehrer und gegen jeden Handlanger. */
    let gekontert=konterVersuch(s,g,{schaden:2,unblockbar:g.unblockbarJetzt});
    if(!gekontert){
      for(const h of S.handlanger){
        if(h.hp>0&&konterVersuch(s,h,{schaden:2})){ gekontert=true; break; }
      }
    }
    if(gekontert){ S.ruettel=5; SFX.klatsch(); meldung(pick(['SITZT','KONTER','BAM']),1.0); continue; }
    schlage(s);
  }

  kaempferTakt(s,zdt);
  anfuehrerTakt(zdt,s);
  for(const h of S.handlanger) if(h.hp>0) gegnerTakt(h,zdt,s,{tempoFaktor:0.9});
  crewHilfeTakt(zdt);

  /* ---- Flaschen ---- */
  for(const f of S.flaschen){ f.x+=f.vx*zdt; }
  S.flaschen=S.flaschen.filter(f=>{
    if(Math.abs(f.x-s.x)<7&&Math.abs(f.t-s.t)<=KAMPF.tiefeToleranz){
      if(s.unverwundbar<=0&&s.zustand!=='rolle'){
        s.hp-=KAMPF8.flascheSchaden; s.unverwundbar=KAMPF.unverwundbarNachTreffer;
        S.ruettel=5; SFX.aua(); meldung('FLASCHE',1.1);
      }
      return false;
    }
    return f.x>-10&&f.x<W+10;
  });

  /* ---- Treffer ---- */
  if(s.zustand==='schlag'&&!s.trefferGesetzt){
    let r=loeseTreffer(s,g,{schaden:1});
    if(!r) for(const h of S.handlanger){ if(h.hp>0){ r=loeseTreffer(s,h,{schaden:1}); if(r) break; } }
    if(r==='treffer'){ S.ruettel=3; SFX.klatsch(); }
    else if(r==='block') meldung('GEBLOCKT',0.7);
  }
  if(g.zustand==='schlag'&&g.art!=='wurf'&&!g.trefferGesetzt){
    const r=loeseTreffer(g,s,{schaden:1,unblockbar:g.unblockbarJetzt,
      reichweite:g.reichweite,betaeubung:0.35});
    if(r==='treffer'||r==='gardebruch'){ S.ruettel=6; SFX.aua();
      meldung(g.art==='ramme'?'UMGERANNT':'VOLL DRAUF',1.2); }
    else if(r==='block'){ S.ruettel=2; meldung('GEBLOCKT',0.7); }
    else if(r==='daneben') meldung('AUSGEWICHEN',0.9);
  }
  for(const h of S.handlanger){
    if(h.hp>0&&h.zustand==='schlag'&&!h.trefferGesetzt){
      const r=loeseTreffer(h,s,{schaden:1,reichweite:h.reichweite});
      if(r==='treffer'||r==='gardebruch'){ S.ruettel=4; SFX.aua(); meldung('VON HINTEN',1.0); }
    }
  }

  /* ---- Phasenwechsel ---- */
  const ph=phase8();
  if(ph-1>S.arena) wechsleArena(ph-1);

  /* ---- Ausgang ---- */
  if(s.hp<=0){ beendeGrossenKampf(false); return; }
  if(g.hp<=0){ beendeGrossenKampf(true); return; }
}

function beendeGrossenKampf(gewonnen){
  document.documentElement.classList.remove('kampf');
  S.kampfGewonnen=gewonnen;
  setzeFlag(gewonnen?'fightGewonnen':'fightVerloren');
  if(gewonnen){
    meldung('ER BLEIBT LIEGEN',2.2); SFX.sieg();
    aendereWert('ruf',12);
  } else {
    meldung('IHR KOMMT GERADE SO WEG',2.2); SFX.aua();
    aendereWert('ruf',-8);
    S.licht=Math.min(95,S.licht+KAMPF8.lichtStrafeBeiNiederlage);
  }
  S.modus='spiel';
  zeigeHinweis(gewonnen?'UND JETZT NACH HAUSE':'LOS - BEVOR DIE SONNE DA IST',3);
}

/* ---- Zeichnen ---- */
function zeichneKampf8(){
  const A=ARENEN[S.arena], s=S.spielerK, g=S.gegner;
  ctx.fillStyle=A.himmel; ctx.fillRect(0,0,W,H);

  /* Kulisse je Arena - grob, aber klar unterscheidbar */
  ctx.fillStyle='#00000033';
  for(let i=0;i<6;i++){
    const bx=(i*61)%W, bh=30+((i*37)%40);
    ctx.fillRect(bx,bodenY(0)-bh-16,44,bh);
  }
  if(S.arena===1){ ctx.fillStyle='#232c26';
    for(let i=0;i<4;i++) ctx.fillRect(20+i*74,bodenY(0)-26,16,26); }
  if(S.arena===2){ ctx.fillStyle='#5a4420';
    for(let i=0;i<5;i++){ ctx.fillRect(14+i*62,bodenY(0)-34,3,34); ctx.fillRect(14+i*62,bodenY(0)-34,26,3); } }

  ctx.fillStyle=A.boden; ctx.fillRect(0,bodenY(0)-2,W,H-bodenY(0)+2);
  ctx.fillStyle=A.kante; ctx.fillRect(0,bodenY(0)-2,W,1);
  ctx.fillStyle='#00000044'; ctx.fillRect(0,bodenY(1)+3,W,H-bodenY(1));

  const liste=[];
  const malKaempfer=(k,spr,tintBlock)=>({t:k.t, mal:()=>{
    const y=bodenY(k.t)-spr.length+(k.zustand==='rolle'?3:0);
    bodenSchatten(k,7,.3);
    const blinkt=k.unverwundbar>0&&Math.floor(S.t*18)%2===0;
    const tint=k.zustand==='block'?tintBlock:(blinkt?'#ffffff':
               (k.zustand==='getroffen'?'#ff8080':null));
    outline(spr,k.x-3,y,1,.6);
    if(k.blick<0) spriteFlip(spr,k.x-3,y,1,tint); else sprite(spr,k.x-3,y,1,tint);
    if(k.zustand==='ausholen'&&Math.floor(S.t*10)%2===0)
      text('!',k.x,y-9,k.unblockbarJetzt?P.gold:P.rot);
  }});
  liste.push(malKaempfer(s,SPR.steh,'#42d9ff'));
  liste.push(malKaempfer(g,SPR.steh,'#42d9ff'));
  for(const h of S.handlanger) if(h.hp>0) liste.push(malKaempfer(h,SPR.steh,'#42d9ff'));
  for(const f of S.flaschen) liste.push({t:f.t, mal:()=>{
    ctx.fillStyle=P.gruen; ctx.fillRect(Math.round(f.x),Math.round(bodenY(f.t)-9),2,3); }});
  zeichneNachTiefe(liste);

  /* Anfuehrer heben wir farblich ab, damit man ihn im Gewuehl findet */
  ctx.fillStyle=P.rot; ctx.fillRect(Math.round(g.x-2),Math.round(bodenY(g.t)-20),5,1);
}

function hudKampf8(){
  const s=S.spielerK, g=S.gegner;
  for(let i=0;i<s.maxHp;i++){
    const x=6+i*7,y=6, voll=i<Math.ceil(s.hp);
    ctx.fillStyle=voll?P.rot:'#2a2440';
    ctx.fillRect(x,y,2,3); ctx.fillRect(x+3,y,2,3); ctx.fillRect(x+1,y+2,3,2); ctx.fillRect(x+2,y+4,1,1);
  }
  const bw=46,bx=6,by=14;
  ctx.fillStyle='#000a'; ctx.fillRect(bx-1,by-1,bw+2,5);
  ctx.fillStyle='#2a2440'; ctx.fillRect(bx,by,bw,3);
  ctx.fillStyle=s.ausdauer<KAMPF.ausdauerSchlag?P.rot:P.gruen;
  ctx.fillRect(bx,by,Math.round(bw*s.ausdauer/KAMPF.ausdauerMax),3);

  const gw=70,gx=Math.round(W/2-gw/2);
  ctx.fillStyle='#000a'; ctx.fillRect(gx-1,5,gw+2,6);
  ctx.fillStyle=P.rot; ctx.fillRect(gx,6,Math.round(gw*Math.max(0,g.hp)/g.maxHp),4);
  textC('DER ANFUEHRER',14,P.dim);
  const ph='PHASE '+phase8()+'  '+ARENEN[S.arena].name;
  text(ph,W-textW(ph)-6,6,phase8()>1?P.gold:P.dunkel);

  if(S.arenaWechselT>0) textGlowC(ARENEN[S.arena].name,H/2-4,P.gold,2);
  if(S.meldungT>0){ ctx.globalAlpha=Math.min(1,S.meldungT*2);
    textGlowC(S.meldung,H-30,P.weiss,1); ctx.globalAlpha=1; }
  if(S.hinweisT>0){ ctx.globalAlpha=Math.min(1,S.hinweisT);
    textGlowC(S.hinweis,H-20,P.gold,1); ctx.globalAlpha=1; }
}
"""

# Fight-Code vor die Schleife haengen
s = ersetze(s, '/* ==========================================================================\n   SCHLEIFE',
    FIGHT + '\n/* ==========================================================================\n   SCHLEIFE')

# ---------- Einhaengen ----------
s = ersetze(s,
    "function starteLevel(){ S.modus='spiel'; zeigeHinweis('LAUF NACH HAUSE - MEIDE DIE SONNE',3);",
    "function starteLevel(){ starteGrossenKampf(); return;\n"
    "  /* alter Direkteinstieg, bleibt fuer Tests erreichbar */\n"
    "  S.modus='spiel'; zeigeHinweis('LAUF NACH HAUSE - MEIDE DIE SONNE',3);")

s = ersetze(s,
    "  if(S.modus==='intro'){ intro(dt); return; }\n"
    "  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt); return; }",
    "  if(S.modus==='intro'){ intro(dt); return; }\n"
    "  if(S.modus==='kampf'){ kampf8(dt); return; }\n"
    "  if(S.modus==='cutscene'){ cutscene(dt); kamera(dt); return; }")

s = ersetze(s,
    "  if(S.modus==='titel'){ titelbild(); return; }\n"
    "  if(S.modus==='intro'){ zeichneIntro(); return; }",
    "  if(S.modus==='titel'){ titelbild(); return; }\n"
    "  if(S.modus==='intro'){ zeichneIntro(); return; }\n"
    "  if(S.modus==='kampf'){ zeichneKampf8(); hudKampf8(); bildschirme(); return; }")

# Zustandsfelder ergaenzen
s = ersetze(s, "    modus:'titel', t:0, zeit:0,",
    "    modus:'titel', t:0, zeit:0,\n"
    "    spielerK:null, gegner:null, handlanger:[], flaschen:[],\n"
    "    arena:0, arenaWechselT:0, hilfeT:0, blockAn:false, kampfGewonnen:false,")

# Eingabe: Block und Rolle
s = ersetze(s,
    "addEventListener('blur',()=>{",
    "let rolleGedrueckt=false, hochAn=false, runterAn=false;\n"
    "addEventListener('keydown',e=>{\n"
    "  if(['ShiftLeft','ShiftRight'].includes(e.code)){ e.preventDefault(); if(S) S.blockAn=true; }\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=true;\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=true;\n"
    "});\n"
    "addEventListener('keyup',e=>{\n"
    "  if(['ShiftLeft','ShiftRight'].includes(e.code)&&S) S.blockAn=false;\n"
    "  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;\n"
    "  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;\n"
    "});\n"
    "bind('tblock',['touchstart','mousedown'],()=>{ if(S) S.blockAn=true; });\n"
    "bind('tblock',['touchend','mouseup','touchcancel'],()=>{ if(S) S.blockAn=false; });\n"
    "bind('trolle',['touchstart','mousedown'],()=>{ rolleGedrueckt=true; });\n"
    "addEventListener('blur',()=>{")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 8: grosser Fight eingebaut')
