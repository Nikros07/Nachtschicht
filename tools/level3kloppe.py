# -*- coding: utf-8 -*-
"""Level 3, vierter Teil: die erste echte Kloppe.

Im letzten Waggon steht eine andere Gruppe vor der Ausstiegstuer. Das ist
der erste Kampf der Nacht - bewusst klein gehalten, weil er die Regeln
beibringt, die in Level 4 und Level 8 dann zaehlen:

  E        schlagen, und im richtigen Moment ist das ein Konter
  UMSCHALT blocken, kostet Ausdauer
  LEER     ausweichen in die Tiefe

Vor dem Kampf steht ein Gespraech. Es gibt vier Wege daran vorbei, und nur
einer davon ist Schlagen:

  - mit grosser Crew steigen sie aus, ohne dass jemand etwas anfasst
  - mit genug Mut kann man sie anblaffen
  - wer zurueckweicht, kommt durch und zahlt mit Geld und Mut
  - wer will, schlaegt sich durch

Verlieren beendet das Level NICHT. Sie nehmen dir das Geld ab und lassen
dich stehen - genauso wie der grosse Fight in Level 8 es macht. Ein Kampf,
der zum Neustart zwingt, wuerde hier nur die zwei Minuten davor bestrafen.
"""
import io

p = 'level3.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu):
    global s
    assert alt in s, 'nicht gefunden: ' + alt[:80]
    s = s.replace(alt, neu, 1)


ersetze('<script src="nacht/dialog.js"></script>',
        '<script src="nacht/dialog.js"></script>\n'
        '<script src="nacht/kampf.js"></script>')

# ------------------------------------------------------------------ TUNE ----
ersetze("""  /* (5) DAS RUCKELN - der Bus faehrt nicht immer ruhig */""",
"""  /* (4e) DIE KLOPPE IM LETZTEN WAGGON
     Der erste Kampf der Nacht. Klein, weil er die Regeln beibringt:
     zwei Gegner, keine Phasen, kein Zeitdruck. */
  kloppeX:        648,   // ab hier stehen sie im Weg
  kloppeLeben:      4,   // Treffer, die der Spieler einstecken kann
  kloppeSchaden:    1,
  kloppeReich:     17,
  kloppeTiefe:   0.55,   // Mitte des Gangs - sie stellen sich breit hin
  kloppeGeld:      -6,   // was eine Niederlage kostet

  /* (5) DAS RUCKELN - der Bus faehrt nicht immer ruhig */""")

# ------------------------------------------------------------- Zustand ----
ersetze("""    tiefe:TUNE.gangTiefe, vt:0,""",
"""    tiefe:TUNE.gangTiefe, vt:0,
    kloppeStand:'offen', ich:null, gegner:[], rolleGedrueckt:false, blockAn:false,""")

# ------------------------------------------------------- Gespraech + Kampf --
KLOPPE = r"""
/* ==========================================================================
   DIE KLOPPE IM LETZTEN WAGGON
   Vor der Tuer stehen drei. Reden geht - auf vier verschiedene Arten.
   ========================================================================== */
const DIE_DREI = {
  start:{ wer:'DER MIT DER KAPPE', text:'Wo willst du hin? Das ist unsere tuer.',
    wahl:[
      { txt:'Wir sind zu viert. Geh zur seite.', wenn:{crew:'JONAS'},  geh:'zurueckgewichen' },
      { txt:'Verschwinde.',                      wenn:{mut:50},        geh:'angeblafft' },
      { txt:'Alles gut, ich warte.',                                   geh:'gewartet' },
      { txt:'Dann macht doch was.',                                    geh:'kampf' },
    ], zeit:8, standard:2 },

  zurueckgewichen:{ wer:'DER MIT DER KAPPE', text:'Schon gut. Wir wollten sowieso raus.',
    tu:{ruf:6, flag:'busDurchDieCrew'}, geh:'ende' },

  angeblafft:{ wer:'DER MIT DER KAPPE', text:'...na dann geh halt. Assi.',
    tu:{mut:5, ruf:3, flag:'busAngeblafft'}, geh:'ende' },

  gewartet:{ wer:'DER MIT DER KAPPE', text:'Braver junge. Zehn euro und du darfst durch.',
    wahl:[
      { txt:'Hier.',            wenn:{geld:10}, geh:'gezahlt' },
      { txt:'Hab nichts dabei.',                geh:'kampf' },
    ], zeit:6, standard:1 },

  gezahlt:{ wer:'DER MIT DER KAPPE', text:'Siehst du. Geht doch.',
    tu:{geld:-10, mut:-6, ruf:-4, flag:'busGezahlt'}, geh:'ende' },

  kampf:{ wer:'DER MIT DER KAPPE', text:'Dann machen wir was.',
    tu:{flag:'busKloppe'}, geh:'ende' },

  ende:null,
};

/* Der Kampf selbst. Zwei Gegner, unterschiedlich schnell - damit man lernt,
   dass ein Konter auf den Flitzer anders getimt ist als auf den Schlaeger. */
function starteKloppe(){
  S.modus='kloppe'; S.kloppeStand='kampf';
  S.ich=kaempfer({ x:S.x, t:TUNE.kloppeTiefe, blick:1,
                   hp:TUNE.kloppeLeben, maxHp:TUNE.kloppeLeben });
  S.tiefe=TUNE.kloppeTiefe;
  S.gegner=[ gegner('schlaeger', TUNE.kloppeX+28, 0.45),
             gegner('flitzer',   TUNE.kloppeX+52, 0.66) ];
  zeigeHinweis('E SCHLAEGT - UMSCHALT BLOCKT - LEERTASTE WEICHT AUS',4);
  SFX.warn();
}

function kloppeVorbei(gewonnen){
  S.kloppeStand = gewonnen ? 'gewonnen' : 'verloren';
  S.modus='spiel'; S.gegner=[]; S.ich=null;
  S.tiefe=TUNE.gangTiefe; S.unverwundbarT=TUNE.unverwundbarDauer;
  if(gewonnen){
    wirke({mut:8, ruf:8, flag:'busKloppeGewonnen'});
    meldung('SIE MACHEN PLATZ',2.2); SFX.sieg();
  } else {
    /* Verlieren beendet nichts. Es kostet - und die Tuer ist trotzdem frei,
       weil sie dich nach dem Geld einfach stehen lassen. */
    wirke({geld:TUNE.kloppeGeld, ruf:-6, flag:'busKloppeVerloren'});
    meldung('SIE NEHMEN DAS GELD UND GEHEN',2.6); SFX.erwischt();
  }
}

function kloppe(dt){
  kampfStopTakt(dt);
  const z=kampfZeitFaktor(); if(z===0) return;
  const d=dt*z;

  const ich=S.ich;
  kaempferTakt(ich,d);
  S.tiefe=ich.t;

  /* Laufen und Ausweichen in der Flaeche */
  const richtung=(rechtsAn?1:0)-(linksAn?1:0);
  const rt=(runterAn?1:0)-(hochAn?1:0);
  if(ich.zustand==='frei'||ich.zustand==='block'){
    if(richtung){ ich.x+=richtung*TUNE.gehTempo*0.62*d; ich.blick=richtung; }
    if(rt) bewegeTiefe(ich,rt,d,TIEFE.tempo*0.8,16);
  }
  ich.x=Math.max(TUNE.kloppeX-40,Math.min(BUS_B-14,ich.x));
  S.x=ich.x;

  if(S.rolleGedrueckt){ S.rolleGedrueckt=false; rolle(ich, rt||(ich.t<0.5?1:-1)); }
  blocke(ich, !!S.blockAn && aktionPuffer.length===0);

  /* Schlagen. Der Konter wird beim DRUECKEN geprueft, nicht wenn der
     eigene Schlag aktiv wird - sonst frisst die eigene Ausholzeit das
     ganze Fenster. Steht so auch in kampf.js. */
  while(aktionPuffer.length){
    aktionPuffer.shift();
    let gekontert=false;
    for(const g of S.gegner){
      if(g.hp<=0) continue;
      if(konterVersuch(ich,g,{reichweite:TUNE.kloppeReich})){ gekontert=true; SFX.warn(); break; }
    }
    if(!gekontert) schlage(ich);
  }

  if(ich.zustand==='schlag'){
    for(const g of S.gegner){
      if(g.hp<=0) continue;
      const was=spielerTrifft(ich,g,{reichweite:TUNE.kloppeReich,schaden:1});
      if(was==='treffer'||was==='konter'||was==='gardebruch'){ SFX.stolper(); break; }
    }
  }

  for(const g of S.gegner){
    if(g.hp<=0) continue;
    gegnerTakt(g,d,ich);
    if(g.zustand==='schlag'){
      const was=loeseTreffer(g,ich,{reichweite:g.reichweite,schaden:TUNE.kloppeSchaden});
      if(was==='treffer'){ S.ruettel=7; S.blitz=.4; SFX.erwischt(); }
      else if(was==='block') SFX.nichts();
    }
  }

  if(S.gegner.every(g=>g.hp<=0)) kloppeVorbei(true);
  else if(ich.hp<=0) kloppeVorbei(false);

  kamera(dt);
}

function zeichneKloppe(){
  const liste=[];
  for(const g of S.gegner){
    if(g.hp<=0) continue;
    liste.push({ t:g.t, mal:()=>{
      const rows = g.art==='flitzer'?SPR.schmal:SPR.breit;
      const fuss=bodenY(g.t), y=fuss-rows.length;
      ctx.globalAlpha=.22; ctx.fillStyle='#000';
      ctx.fillRect(Math.round(g.x-3),Math.round(fuss),7,1); ctx.globalAlpha=1;
      /* Ausholen faerbt den Umriss - das ist das Konterfenster, das man
         sehen koennen muss. */
      const rand = g.zustand==='ausholen' ? P.gold
                 : g.zustand==='block'    ? P.neon2
                 : g.zustand==='getroffen'? P.rot : null;
      outline(rows,g.x-3,y,1,rand?.9:.55,rand||undefined);
      if(g.blick<0) spriteFlip(rows,g.x-3,y); else sprite(rows,g.x-3,y);
      for(let i=0;i<g.maxHp;i++){
        ctx.fillStyle=i<g.hp?P.rot:'#2a2440';
        ctx.fillRect(Math.round(g.x-3+i*3),y-7,2,2);
      }
    }});
  }
  const ich=S.ich;
  liste.push({ t:ich.t, mal:()=>{
    const rows = ich.zustand==='rolle' ? SPR.versteckt
               : ich.zustand==='block' ? SPR.steh
               : ich.zustand==='schlag'||ich.zustand==='ausholen' ? SPR.geh[1]
               : SPR.steh;
    const fuss=bodenY(ich.t), y=fuss-rows.length;
    if(ich.unverwundbar>0&&Math.floor(S.t*14)%2===0) return;
    ctx.globalAlpha=.26; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(ich.x-3),Math.round(fuss),7,1); ctx.globalAlpha=1;
    outline(rows,ich.x-3,y,1,.7,ich.zustand==='block'?P.neon2:undefined);
    if(ich.blick<0) spriteFlip(rows,ich.x-3,y); else sprite(rows,ich.x-3,y);
  }});
  zeichneNachTiefe(liste);
}

/* Ausdauer- und Lebensbalken - ohne die sieht man nicht, warum ein
   Dauerblock irgendwann nicht mehr geht. */
function kloppeHud(){
  const ich=S.ich; if(!ich) return;
  for(let i=0;i<ich.maxHp;i++){
    ctx.fillStyle=i<ich.hp?P.rot:'#2a2440';
    ctx.fillRect(6+i*7,6,5,4);
  }
  const bw=54;
  ctx.fillStyle='#000a'; ctx.fillRect(4,13,bw+4,5);
  ctx.fillStyle='#2a2440'; ctx.fillRect(6,14,bw,3);
  ctx.fillStyle=ich.ausdauer<KAMPF.ausdauerSchlag?P.rot:P.neon2;
  ctx.fillRect(6,14,Math.round(bw*ich.ausdauer/KAMPF.ausdauerMax),3);
  textC('DIE TUER IST HINTER IHNEN',24,P.dim);
}
"""

ersetze("""/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""",
        KLOPPE + """
/* ==========================================================================
   SPIELSTAND
   ========================================================================== */""")


# ------------------------------------------------ Ausloesen und Einhaengen --
ersetze("""  if(S.modus==='spiel'&&S.x>=TUER_X&&!S.versteckt) starteCutscene();""",
"""  /* Der letzte Waggon: vor der Tuer stehen drei. Erst wird geredet. */
  if(S.modus==='spiel'&&S.kloppeStand==='offen'&&S.x>=TUNE.kloppeX&&!S.versteckt){
    S.kloppeStand='geredet';
    starteGespraech(DIE_DREI,'start',()=>{
      if(flag('busKloppe')) starteKloppe();
      else { S.kloppeStand='vorbei'; meldung('SIE LASSEN DICH DURCH',1.8); }
    });
    return;
  }
  /* Solange sie noch da stehen, kommt niemand an der Tuer vorbei. */
  if(S.kloppeStand==='geredet'||S.kloppeStand==='kampf'){
    S.x=Math.min(S.x,TUNE.kloppeX+2);
  }

  if(S.modus==='spiel'&&S.x>=TUER_X&&!S.versteckt) starteCutscene();""")

ersetze("""  if(S.modus==='spiel'){ bus(dt); return; }""",
"""  if(S.modus==='spiel'){ bus(dt); return; }
  if(S.modus==='kloppe'){ kloppe(dt); return; }""")

ersetze("""  if(szeneFuerModus()==='sprint') zeichneSprint(); else zeichneBus();""",
"""  if(szeneFuerModus()==='sprint') zeichneSprint();
  else { zeichneBus(); if(S.modus==='kloppe'){ ctx.save(); ctx.translate(-Math.round(S.kamX),0);
         zeichneKloppe(); ctx.restore(); } }""")

ersetze("""function szeneFuerModus(){
  if(S.modus==='sprint') return 'sprint';
  if(S.modus==='spiel') return 'bus';""",
"""function szeneFuerModus(){
  if(S.modus==='sprint') return 'sprint';
  if(S.modus==='spiel'||S.modus==='kloppe') return 'bus';""")

ersetze("""  hud();
  zeichneGespraech();""",
"""  hud();
  if(S.modus==='kloppe') kloppeHud();
  zeichneGespraech();""")

# Block und Rolle auf die Tastatur
ersetze("""  if(e.code==='Space'){ e.preventDefault(); druckSprung(); }""",
"""  if(['ShiftLeft','ShiftRight'].includes(e.code)){ e.preventDefault(); S.blockAn=true; }
  if(e.code==='Space'&&S.modus==='kloppe'){ e.preventDefault(); S.rolleGedrueckt=true; return; }
  if(e.code==='Space'){ e.preventDefault(); druckSprung(); }""")

ersetze("""  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;""",
"""  if(['ArrowUp','KeyW'].includes(e.code)) hochAn=false;
  if(['ArrowDown','KeyS'].includes(e.code)) runterAn=false;
  if(['ShiftLeft','ShiftRight'].includes(e.code)&&S) S.blockAn=false;""")

ersetze("""addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=hochAn=runterAn=false; });""",
"""addEventListener('blur',()=>{ linksAn=rechtsAn=sprungAn=aktionGehalten=hochAn=runterAn=false;
  if(S) S.blockAn=false; });""")

# Pause auch im Kampf
ersetze("""  if(e.code==='KeyP'&&(S.modus==='sprint'||S.modus==='spiel'||S.modus==='pause')){""",
"""  if(e.code==='KeyP'&&(S.modus==='sprint'||S.modus==='spiel'||S.modus==='kloppe'||S.modus==='pause')){""")

# Handy-Knoepfe im Kampf
ersetze("""  if(S.versteckt)          return {aktion:'RAUS', zwei:null};""",
"""  if(S.modus==='kloppe')   return {aktion:'SCHLAG', zwei:'AUSWEICHEN', block:true};
  if(S.versteckt)          return {aktion:'RAUS', zwei:null};""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 3: die erste Kloppe im letzten Waggon eingebaut')
