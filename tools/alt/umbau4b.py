# -*- coding: utf-8 -*-
"""Level 4, Teil 2: Kampflogik, Zeichnen mit Tiefe, HUD."""
import io

p = 'level4.html'
s = io.open(p, encoding='utf-8').read()


def fn_ende(src, i):
    d = 0
    started = False
    for j in range(i, len(src)):
        c = src[j]
        if c == '{':
            d += 1
            started = True
        elif c == '}':
            d -= 1
            if started and d == 0:
                return j + 1
    raise SystemExit('Klammer nicht gefunden')


def ersetze_fn(src, sig, neu):
    i = src.index(sig)
    return src[:i] + neu + src[fn_ende(src, i):]


def ersetze(src, alt, neu):
    assert alt in src, 'nicht gefunden: ' + alt[:70]
    return src.replace(alt, neu, 1)


# ---------- Boss aufstellen ----------
s = ersetze_fn(s, 'function starteLevel(){', """function starteLevel(){
  S.modus='kampf';
  S.boss=kaempfer({ x:W+30, t:0.5, blick:-1, art:'tuersteher',
    hp:TUNE.bossTreffer, maxHp:TUNE.bossTreffer, reichweite:19,
    pauseT:0.9, anlauf:true, vorZustand:'frei' });
  zeigeHinweis('E IM AUSHOLEN - GANZ AM ENDE DES BALKENS',3.5);
  SFX.warn(); meldung('NA WARTE',1.4);
}""")

# ---------- Angriffswahl mit Phasen ----------
s = ersetze_fn(s, 'function naechsteArt(b){', """function bossPhase(b){
  const anteil=b.hp/TUNE.bossTreffer;
  return anteil<=TUNE.phase3Ab?3:anteil<=TUNE.phase2Ab?2:1;
}
function naechsteArt(b){
  /* Ab Phase 2 kommt der Rammstoss dazu. Der ist unblockbar - ab da reicht
     Decken allein nicht mehr, man muss ausweichen. */
  const moeglich = bossPhase(b)>=TUNE.rammeAb ? ['schwung','jab','ramme']
                                              : ['schwung','jab'];
  let art=pick(moeglich);
  if(b.letzteArt===art) b.serie=(b.serie||0)+1; else b.serie=0;
  if(b.serie>=TUNE.serieMax){
    const andere=moeglich.filter(a=>a!==art);
    art=pick(andere); b.serie=0;
  }
  b.letzteArt=art;
  return art;
}""")

# ---------- Angriff starten ----------
s = ersetze_fn(s, 'function starteWind(b,art){', """function starteAngriff(b,art){
  const phase=bossPhase(b);
  const kuerzer=1-(phase-1)*TUNE.phaseWindupKuerzer;
  b.art=art;
  b.ausholenDauer=(art==='schwung'?TUNE.schwungWindup
                  :art==='jab'?TUNE.jabWindup:TUNE.rammeWindup)*kuerzer;
  b.schlagDauer=(art==='schwung'?TUNE.schwungSchlag
                :art==='jab'?TUNE.jabSchlag:TUNE.rammeSchlag);
  b.unblockbarJetzt=(art==='ramme');
  /* Der Pegel aus den vorigen Leveln macht das Fenster enger, Dennis in der
     Crew macht es wieder breiter. */
  const pegelFaktor=1-(S.pegelStart/100)*TUNE.pegelFensterStrafeMax;
  b.fensterAnteil=Math.max(0.12,TUNE.fensterAnteil*S.fensterMult*pegelFaktor);
  b.zustand='ausholen'; b.zT=0; b.trefferGesetzt=false;
  SFX.warn();
}""")

# ---------- Fehlschlag ----------
s = ersetze_fn(s, 'function fehlschlag(){', """function fehlschlag(){
  if(S.erholungT>0) return;
  S.erholungT=TUNE.fehlschlagErholung; S.ruettel=2; SFX.fehl();
  meldung('DANEBEN',0.9);
}""")

# ---------- Die Kampfschleife ----------
s = ersetze_fn(s, 'function verarbeiteFehldruck(){', """function bossTakt(b,dt,ziel){
  kaempferTakt(b,dt);
  if(b.hp<=0) return;
  b.blick=Math.sign(ziel.x-b.x)||b.blick;

  /* Beim Rammen setzt er nach - deshalb reicht Stehenbleiben nicht. */
  if(b.art==='ramme'){
    if(b.zustand==='ausholen') b.x+=b.blick*TUNE.rammeTempo*0.18*dt;
    if(b.zustand==='schlag')   b.x+=b.blick*TUNE.rammeTempo*dt;
  }

  /* Nach jedem Angriff einmal Luft holen. Je tiefer die Phase, desto kuerzer. */
  if(b.zustand==='frei'&&b.vorZustand!=='frei'){
    const phase=bossPhase(b);
    b.pauseT=Math.max(0.25,TUNE.bossPause-(phase-1)*TUNE.phasePauseKuerzer);
  }
  b.vorZustand=b.zustand;

  if(b.zustand!=='frei') return;

  if(b.anlauf){
    const ziel2=Math.round(W*0.62);
    b.x+=(ziel2-b.x)*Math.min(1,6*dt);
    if(Math.abs(b.x-ziel2)<1){ b.x=ziel2; b.anlauf=false; b.pauseT=TUNE.bossPause; }
    return;
  }

  b.pauseT-=dt;
  if(b.pauseT>0){
    /* Er geht auf dich zu und zieht in deine Tiefe - wegrennen allein
       loest das Problem nicht. */
    const dx=ziel.x-b.x;
    if(Math.abs(dx)>b.reichweite*0.75) b.x+=Math.sign(dx)*42*dt;
    const dtf=(ziel.t||0)-(b.t||0);
    if(Math.abs(dtf)>0.05) bewegeTiefe(b,Math.sign(dtf),dt,TIEFE.tempo*0.6,9);
    return;
  }
  starteAngriff(b,naechsteArt(b));
}

function kampf(dt){
  const b=S.boss, s=S.spieler; if(!b||!s) return;

  /* Hit-Stop: nach einem Treffer steht die Welt ganz kurz. */
  kampfStopTakt(dt);
  const zdt=dt*kampfZeitFaktor();
  if(zdt<=0) return;

  if(S.erholungT>0) S.erholungT=Math.max(0,S.erholungT-zdt);

  /* ---- Ausweichrolle ---- */
  if(rolleGedrueckt){
    rolleGedrueckt=false;
    const r=(runterAn?1:0)-(hochAn?1:0);
    if(!rolle(s,r||(s.t<0.5?1:-1))&&s.ausdauer<KAMPF.ausdauerRolle)
      meldung('KEINE PUSTE',0.8);
  }

  /* ---- Blocken ---- */
  blocke(s,!!S.blockAn);

  /* ---- Laufen, auch in die Tiefe ---- */
  if(s.zustand==='frei'||s.zustand==='block'){
    const rx=(rechtsAn?1:0)-(linksAn?1:0);
    const langsamer=s.zustand==='block'?0.45:1;
    if(rx){ s.x+=rx*TUNE.gehTempo*langsamer*zdt; s.blick=rx; }
    const rt=(runterAn?1:0)-(hochAn?1:0);
    bewegeTiefe(s,rt,zdt,TIEFE.tempo*langsamer);
  }
  s.x=Math.max(TUNE.arenaLinks,Math.min(W-TUNE.arenaRechtsRand,s.x));

  /* ---- Zuschlagen ---- */
  while(aktionPuffer.length){
    aktionPuffer.shift();
    if(S.erholungT>0) continue;
    if(!schlage(s)){
      if(s.ausdauer<KAMPF.ausdauerSchlag) meldung('AUSSER PUSTE',0.9);
    }
  }

  kaempferTakt(s,zdt);
  bossTakt(b,zdt,s);

  /* ---- Treffer aufloesen: erst du, dann er ---- */
  if(s.zustand==='schlag'&&!s.trefferGesetzt){
    const r=spielerTrifft(s,b,{konterAnteil:b.fensterAnteil});
    if(r==='konter'){
      S.treffer++; S.ruettel=5; S.blitz=.5; SFX.klatsch();
      meldung(pick(['SITZT','KONTER','GEHT AUFS AUGE']),1.1);
    } else if(r==='treffer'){
      S.treffer++; S.ruettel=3; SFX.klatsch(); meldung('TREFFER',0.9);
    } else if(r==='block'||r==='gardebruch'){
      meldung(r==='gardebruch'?'DECKUNG WEG':'ER BLOCKT',0.9);
    } else if(r===null&&s.zT>0.02){
      /* ins Leere geschlagen - die lange Erholung kommt aus kaempferTakt */
    }
  }
  if(b.zustand==='schlag'&&!b.trefferGesetzt){
    const r=loeseTreffer(b,s,{schaden:1,unblockbar:b.unblockbarJetzt,
                              reichweite:b.reichweite,betaeubung:0.35});
    if(r==='treffer'||r==='gardebruch'){
      S.ruettel=6; S.blitz=.5; SFX.aua();
      meldung(r==='gardebruch'?'DURCH DIE DECKUNG'
             :b.art==='ramme'?'UMGERANNT'
             :b.art==='schwung'?'VOLL ERWISCHT':'AUTSCH',1.2);
    } else if(r==='block'){
      S.ruettel=2; meldung('GEBLOCKT',0.8);
    } else if(r==='daneben'){
      meldung('AUSGEWICHEN',0.9);
    }
  }

  /* ---- Ausgang ---- */
  S.hp=Math.max(0,Math.ceil(s.hp));
  if(s.hp<=0&&S.modus==='kampf'){
    S.modus='ende'; S.gewonnen=false;
    S.faenger=pick(['RAUSGESCHMISSEN','KEIN EINLASS HEUTE','DU LIEGST VOR DER TUER']);
    return;
  }
  if(b.hp<=0&&S.modus==='kampf'){ starteCutscene(); }
}""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Teil 2 fertig: Kampflogik mit Phasen, Rammstoss, Block, Ausdauer, Rolle')
