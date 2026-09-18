# -*- coding: utf-8 -*-
"""Level 7, Teil 2: Verhalten und Bild."""
import io

p = 'level7.html'
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


loesche('benutze')
loesche('rede')
loesche('naechsteZeile')
ersetze("/* ---- Dinge einpacken ---- */\n", "")
ersetze("/* ---- Reden ---- */\n", "")

LOGIK = r"""
/* ==========================================================================
   WAS IN REICHWEITE IST - eine Stelle fuer Aktion, Knopf und Anzeige.
   ========================================================================== */
function naechstesZiel(){
  let bestes=null, d0=1e9;
  const pruefe=(obj,art,tiefe,reich)=>{
    if(Math.abs(tiefe-S.tiefe)>TUNE.redeTiefe) return;
    const d=Math.abs(obj.x-S.x);
    if(d<(reich||TUNE.reichweite)&&d<d0){ bestes={art,obj}; d0=d; }
  };
  for(const f of S.pfand) if(!f.weg) pruefe(f,'pfand',f.t,11);
  pruefe(OEZDEMIR,'kasse',OEZDEMIR.t);
  for(const d of DINGE) pruefe(d,'regal',d.t);
  for(const m of NACHTMENSCHEN){
    if(m.id==='nele'&&S.nele.weg) continue;
    if(m.id==='tobi'&&flag('tobiDabei')) continue;
    pruefe(m,'mensch',m.t);
  }
  if(!S.heinz.friedlich) pruefe(S.heinz,'heinz',S.heinz.t);
  for(const c of S.crew) pruefe(c,'crew',c.t);
  pruefe({x:TUNE.ausgangX},'ecke',S.tiefe,20);
  return bestes;
}

function redeMit(baum,wer){
  S.vx=0; S.vt=0; SFX.reden();
  starteGespraech(baum,'start',e=>spaetiEnde(e,wer));
}
/* Was nach einem Gespraech passiert. Die Baeume setzen Flags und Geld -
   was es im Laden bewirkt, steht hier. */
function spaetiEnde(e,wer){
  if(e==='@snack'){
    S.kondition=Math.min(100,(S.kondition||0)+TUNE.snackKondition);
    meldung('SNACKS FUER ALLE',1.6); SFX.fund(); return redeMit(OEZDEMIR_BAUM,'oezdemir');
  }
  if(e==='@pfand'){
    let n=0; while(gibDing('PFAND')) n++;
    const euro=n*TUNE.pfandWert;
    aendereWert('geld',euro);
    meldung(n+' FLASCHEN - '+euro.toFixed(2).replace('.',',')+' EURO',2);
    SFX.erledigt(); return redeMit(OEZDEMIR_BAUM,'oezdemir');
  }
  if(e==='@gut'){ S.nele.weg=true; meldung('NELE LAEUFT ZU IHREN FREUNDINNEN',2); SFX.erledigt(); return; }
  if(e==='@wasserWeg'){ S.nele.weg=true; setzeFlag('spaetiWasser',false);
    meldung('DEIN WASSER IST WEG. NOCHMAL KAUFEN?',2.4); return; }
  if(e==='@tobi'){ meldung('TOBI KOMMT MIT',2); SFX.erledigt(); return; }
  if(e==='@heinz'){ S.heinz.friedlich=true; meldung('HEINZ LAESST DIR EINEN SCHLUCK DA',2); return; }
  if(e==='@heim'||e==='@weiter'||e==='@sonne'){
    setzeFlag({'@heim':'endeHeim','@weiter':'endeWeiter','@sonne':'endeSonne'}[e]);
    starteCutscene(e); return;
  }
}

/* Heinz sammelt dieselben Flaschen. Er geht zur naechsten freien, bueckt
   sich, und weg ist sie. Das ist das Wettrennen - und wer ihn anspricht,
   kann es auch einfach lassen. */
function heinzTakt(dt){
  const h=S.heinz;
  if(h.friedlich){ h.x+=(40-h.x)*Math.min(1,dt); return; }
  if(!h.ziel||h.ziel.weg){
    const frei=S.pfand.filter(f=>!f.weg);
    frei.sort((a,b)=>Math.abs(a.x-h.x)-Math.abs(b.x-h.x));
    h.ziel=frei[0]||null; h.greifT=0;
  }
  if(!h.ziel) return;
  const dx=h.ziel.x-h.x;
  if(Math.abs(dx)>2){
    h.blick=Math.sign(dx); h.x+=h.blick*TUNE.heinzTempo*dt;
    h.t+=(h.ziel.t-h.t)*Math.min(1,1.5*dt);
    return;
  }
  h.greifT+=dt;
  if(h.greifT>=TUNE.heinzGreift){ h.ziel.weg=true; h.ziel=null; }
}

function mobilKontext(){
  if(S.modus==='titel')    return {aktion:'START',  zwei:null};
  if(S.modus==='intro'||S.modus==='cutscene') return {aktion:'WEITER', zwei:null};
  if(S.modus==='ende')     return {aktion:'WEITER', zwei:null};
  if(S.modus==='pause')    return {aktion:null, zwei:null};
  const z=naechstesZiel();
  const txt=!z?null:{pfand:'AUFHEBEN',kasse:'KASSE',regal:'ANSEHEN',mensch:'REDEN',
                     heinz:'REDEN',crew:'REDEN',ecke:'UND JETZT?'}[z.art];
  return {aktion:txt, zwei:'SPRUNG'};
}
"""
ersetze("""/* ---- Kamera ---- */""", LOGIK + "\n/* ---- Kamera ---- */")

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

  S.zeit+=dt;
  const spanne=TUNE.endMinute-TUNE.startMinute;
  S.minute=TUNE.startMinute+Math.min(spanne,S.zeit/TUNE.levelSekunden*spanne);
  if(S.pegel>0) S.pegel=Math.max(0,S.pegel-TUNE.pegelAbbau*dt);

  const richtung=(rechtsAn?1:0)-(linksAn?1:0);
  if(richtung) S.blick=richtung;
  const langsam = S.pegel>TUNE.langsamAb ? 1-(S.pegel-TUNE.langsamAb)/100 : 1;
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
  /* Tiefe ausgeschrieben - S.t ist die Spielzeit. */
  const rt=(runterAn?1:0)-(hochAn?1:0);
  S.vt+=(rt*TUNE.tiefeTempo*langsam-S.vt)*Math.min(1,14*dt);
  S.tiefe=Math.max(0,Math.min(1,S.tiefe+S.vt*dt));

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

  heinzTakt(dt);

  while(aktionPuffer.length){
    aktionPuffer.shift();
    const z=naechstesZiel();
    if(!z) continue;
    if(z.art==='pfand'){
      z.obj.weg=true; nimmDing('PFAND'); SFX.fund();
      const n=NACHT.inventar.PFAND||0;
      meldung('PFAND: '+n+' FLASCHEN',1); continue;
    }
    if(z.art==='kasse'){ redeMit(OEZDEMIR_BAUM,'oezdemir'); return; }
    if(z.art==='regal'){
      meldung(z.obj.art==='wasser'?'WASSER - 2 EURO. BEZAHLEN AN DER KASSE':'SNACKS - 3 EURO. BEZAHLEN AN DER KASSE',2);
      continue;
    }
    if(z.art==='mensch'){ redeMit({taxi:TAXI_BAUM,nele:NELE_BAUM,tobi:TOBI_BAUM}[z.obj.id],z.obj.id); return; }
    if(z.art==='heinz'){ redeMit(HEINZ_BAUM,'heinz'); return; }
    if(z.art==='crew'){
      const c=z.obj;
      const zeilen=beziehung(c.name)>=10?['DAS WAR EINE NACHT.','DANKE, DASS DU MICH MITGENOMMEN HAST.']:
                   ['ICH BIN SO DURCH.','HAST DU WAS ZU TRINKEN?'];
      const b={}; zeilen.forEach((t,i)=>b[i?'z'+i:'start']={wer:c.name,text:t,geh:i+1<zeilen.length?'z'+(i+1):'@ende'});
      redeMit(b,c.name); return;
    }
    if(z.art==='ecke'){
      if(!alleFertig()){ meldung('ERST WASSER UND WAS ZU ESSEN',1.8); SFX.nichts(); continue; }
      redeMit(ENDE_BAUM,'crew'); return;
    }
  }
  kamera(dt);
}""")

# ------------------------------------------------------------ Cutscene ----
alt = s[s.index('function baueSzenen(){'):s.index('function starteCutscene(){')]
s = s.replace(alt, "")
ersetze("""function starteCutscene(){ S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; SFX.sieg(); }""",
"""/* Die Bilanz. Was man heute Nacht fuer andere getan hat, steht hier noch
   einmal - und die Entscheidung, wie es weitergeht. */
function starteCutscene(wahl){
  const z=[{ d:1.0, txt:'' }, { d:2.4, txt:'DRAUSSEN WIRD ES SCHON WIEDER HELLER.' }];
  if(flag('oezdemirGeschichte')) z.push({ d:2.4, txt:'HERR OEZDEMIR WINKT DURCH DIE SCHEIBE.' });
  if(flag('neleGeholfen'))       z.push({ d:2.4, txt:'IRGENDWO ZWEI STRASSEN WEITER LACHT NELE.' });
  if(flag('heinzGeholfen'))      z.push({ d:2.4, txt:'HEINZ SCHIEBT SEINEN WAGEN UM DIE ECKE.' });
  if(flag('tobiDabei'))          z.push({ d:2.4, txt:'TOBI GEHT MIT. ER REDET ZUM ERSTEN MAL.' });
  if(S.crewWeg.length)           z.push({ d:2.4, txt:S.crewWeg.join(', ')+' IST NICHT MEHR DABEI.' });
  z.push({ d:2.6, txt: wahl==='@heim'   ? 'DU: HEIM. EINFACH NUR HEIM.'
                     : wahl==='@weiter' ? 'DU: DIE NACHT IST NOCH NICHT VORBEI.'
                     :                    'DU: ZUR BRUECKE. DIE SONNE KOMMT GLEICH.' });
  if(flag('taxiTipp')) z.push({ d:2.4, txt:'DER TAXIFAHRER HAT GESAGT: STEHENBLEIBEN UND BLOCKEN.' });
  z.push({ d:2.4, txt:'LEVEL 7 GESCHAFFT' });
  S.szenen=z; S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; SFX.sieg();
}""")
ersetze("SZENEN[S.szene]", "S.szenen[S.szene]", 2)
ersetze("S.szene>=SZENEN.length", "S.szene>=S.szenen.length")
ersetze("""function levelGeschafft(){
  const best=ladeBest();""", """function levelGeschafft(){
  setzeKapitel(8);
  if(S.kondition) setzeWert('kondition',Math.max(wert('kondition'),Math.round(S.kondition)));
  const best=ladeBest();""")

# ----------------------------------------------------------------- Bild ----
funktion('zeichneSzene', r"""
function zeichneSzene(){
  const kx=Math.round(S.kamX);
  ctx.save(); ctx.translate(-kx,0);

  for(const o of ORTE){
    ctx.fillStyle=o.wand; ctx.fillRect(o.von,20,o.bis-o.von,TIEFE.hinten-20);
    ctx.fillStyle='#00000044'; ctx.fillRect(o.von,20,o.bis-o.von,2);
    ctx.fillStyle='#0d0a14'; ctx.fillRect(o.bis-2,20,2,TIEFE.hinten-20);
    ctx.fillStyle=o.boden; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,H-TIEFE.hinten);
    ctx.fillStyle=P.bodenKante; ctx.fillRect(o.von,TIEFE.hinten,o.bis-o.von,1);
    text(o.name,o.von+6,26,'#ffffff18');
    if(!o.drinnen){
      for(let i=0;i<Math.round((o.bis-o.von)/9);i++){
        const sx=o.von+(i*37)%(o.bis-o.von), sy=24+(i*17)%50;
        ctx.fillStyle=i%4===0?'#ffffff55':'#ffffff22'; ctx.fillRect(sx,sy,1,1);
      }
    }
  }
  /* Das Schaufenster wirft Licht auf den Gehweg */
  ctx.globalAlpha=.10; ctx.fillStyle='#ffe08a'; ctx.fillRect(300,TIEFE.hinten,220,H-TIEFE.hinten); ctx.globalAlpha=1;
  /* Die Ecke: der Himmel faengt an, heller zu werden */
  ctx.globalAlpha=.18; ctx.fillStyle='#ff9a5a'; ctx.fillRect(760,20,140,30); ctx.globalAlpha=1;

  const naechst=S.modus==='spiel'&&!gespraechAktiv()?naechstesZiel():null;
  const blink=Math.floor(S.t*4)%2===0;
  const liste=[];
  const figur=(o,rows,name,tint,farbe)=>liste.push({t:o.t, mal:()=>{
    const y=bodenY(o.t)-rows.length;
    ctx.globalAlpha=.24; ctx.fillStyle='#000'; ctx.fillRect(Math.round(o.x-3),Math.round(bodenY(o.t)),7,1); ctx.globalAlpha=1;
    outline(rows,o.x-3,y,1,.55);
    if(o.blick<0) spriteFlip(rows,o.x-3,y,1,tint); else sprite(rows,o.x-3,y,1,tint);
    if(name&&Math.abs(o.x-S.x)<60) text(name,o.x+3-textW(name)/2,y-9,farbe||P.dim);
    if(naechst&&naechst.obj===o&&blink) text('E',o.x+2,y-16,P.gold);
  }});

  liste.push({t:0.02, mal:()=>{ sprite(SPR.taxi,70,bodenY(0.02)-SPR.taxi.length); }});
  liste.push({t:0.05, mal:()=>{ sprite(SPR.bank,556,bodenY(0.05)-SPR.bank.length); }});
  for(const d of DINGE){ const rows=SPR[d.moebel];
    liste.push({t:d.t, mal:()=>{ const y=bodenY(d.t)-rows.length;
      outline(rows,d.x-3,y,1,.5); sprite(rows,d.x-3,y);
      if(flag(d.art==='wasser'?'spaetiWasser':'spaetiSnack')) text('OK',d.x+1-textW('OK')/2,y-8,P.gruen);
      if(naechst&&naechst.obj===d&&blink) text('E',d.x,y-16,P.gold); }}); }
  liste.push({t:KASSE.t, mal:()=>{ sprite(SPR.tisch,KASSE.x-4,bodenY(KASSE.t)-SPR.tisch.length); }});
  figur(OEZDEMIR,SPR.verkaeufer,OEZDEMIR.name,null,P.gold);

  for(const f of S.pfand) if(!f.weg) liste.push({t:f.t, mal:()=>{
    const y=bodenY(f.t)-SPR.pfand.length; sprite(SPR.pfand,f.x-1,y);
    if(naechst&&naechst.obj===f&&blink) text('E',f.x-1,y-8,P.gold); }});

  for(const m of NACHTMENSCHEN){
    if(m.id==='nele'&&S.nele.weg) continue;
    if(m.id==='tobi'&&flag('tobiDabei')) continue;
    figur(m,SPR[m.spr],m.name);
  }
  if(flag('tobiDabei')) figur({x:S.x-16,t:Math.min(1,S.tiefe+0.1),blick:S.blick},SPR.tobi,null);
  const h=S.heinz;
  liste.push({t:h.t+0.01, mal:()=>{ sprite(SPR.wagen,h.x+(h.blick>0?-9:4),bodenY(h.t)-SPR.wagen.length); }});
  { const lauf=laufBild(h), rows=lauf>=0?gehBeine(SPR.heinz,lauf):SPR.heinz;
    const gebueckt=h.greifT>0&&h.ziel;
    figur(h, gebueckt?rows.slice(2):rows, 'HEINZ', null, h.friedlich?P.gruen:P.dim); }
  for(const c of S.crew) figur(c,SPR[c.spr]||SPR.steh,c.name,c.tint);

  liste.push({t:S.tiefe, mal:()=>{
    let rows;
    if(!S.amBoden) rows=S.vy<0?SPR.sprung:SPR.fall;
    else if(tempo2D(S.vx,S.vt)>12) rows=SPR.geh[Math.floor(S.gehPhase)%4];
    else rows=SPR.steh;
    const versatz=BODEN-bodenY(S.tiefe), y=S.y-versatz-rows.length;
    ctx.globalAlpha=.28; ctx.fillStyle='#000';
    ctx.fillRect(Math.round(S.x-3),Math.round(bodenY(S.tiefe)),7,1); ctx.globalAlpha=1;
    outline(rows,S.x-3,y,1,.6);
    if(S.blick<0) spriteFlip(rows,S.x-3,y); else sprite(rows,S.x-3,y);
  }});
  zeichneNachTiefe(liste);

  const bereit=alleFertig();
  text('WEITER',TUNE.ausgangX-textW('WEITER')/2,TIEFE.hinten-12,bereit?P.gold:P.dunkel);
  ctx.restore();

  const p=S.pegel/100;
  ctx.globalAlpha=Math.min(1,.5+p*.4);
  ctx.drawImage(verlauf('vig',W,H,g=>{
    const gr=g.createRadialGradient(W/2,H*.55,44,W/2,H*.55,W*.6);
    gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(0,0,0,1)');
    g.fillStyle=gr; g.fillRect(0,0,W,H); }),0,0);
  ctx.globalAlpha=1;
}""")

# ------------------------------------------------------------------ HUD ----
alt = s[s.index("  /* Aufgabenliste */"):s.index("  if(S.meldungT>0){", s.index("  /* Aufgabenliste */"))]
s = s.replace(alt, """  /* Geld, Pfand und was noch fehlt */
  text('GELD '+Number(wert('geld')).toFixed(2).replace('.',',')+' EURO',6,6,P.weiss);
  const pf=NACHT.inventar.PFAND||0;
  if(pf) text('PFAND '+pf,6,14,P.gruen);
  let y=24;
  for(const [f,t] of [['spaetiWasser','WASSER'],['spaetiSnack','SNACKS']]){
    const ok=flag(f);
    text(ok?'X':'-',6,y,ok?P.gruen:P.dunkel); text(t,14,y,ok?P.dunkel:P.weiss); y+=8;
  }
  if(alleFertig()&&Math.floor(S.t*2)%2===0) textC('ZUR ECKE - WIE GEHT DIE NACHT WEITER?',H-42,P.gold);

""")
alt = s[s.index("  /* Gespraech */\n  if(S.reden){"):s.index("\n}\n", s.index("  /* Gespraech */\n  if(S.reden){"))]
s = s.replace(alt, "  zeichneGespraech();")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 7 Teil 2')
