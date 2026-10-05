/* ============================================================================
   NACHTSCHICHT - ENGINE: mobil
   Die Handy-Fassung, neu gebaut nach dem, was Action-Spiele am Handy tun.

   Die Bedienung teilt sich auf die zwei Daumen auf:

     LINKS   Ein Stick, der dort erscheint, wo der Daumen aufsetzt. Sanft
             gezogen schleicht man, voll gezogen geht man. Auf Wunsch fest.
     RECHTS  Ein grosser Hauptknopf unten aussen, und die uebrigen Knoepfe
             liegen im BOGEN um ihn - genau dort, wohin der Daumen ohne
             Umgreifen kommt. Dazu die Regel aus Spielen wie Brawl Stars:
             die ganze rechte Haelfte ist der Hauptknopf. Man muss ihn nicht
             treffen, ein Tippen irgendwo rechts genuegt.

   Alles geht als Tastendruck ins Level. Jedes Level hat schon eine volle
   Tastatursteuerung, also bekommt jedes die volle Handy-Steuerung, ohne dass
   im Level eine Zeile dafuer steht. Ein Level darf mobilKontext() definieren
   und sagen, was gerade moeglich ist:

     { aktion:'REDEN', zwei:'SPRUNG'|null, block:true|false,
       extras:[{txt:'LAMPE',code:'KeyQ'}, ...] }

   Steht auf dem Hauptknopf eine besondere Aufschrift (REDEN, SPIND, TUER ...), pulsiert er:
   hier ist jetzt etwas zu tun.

   Was neu ist gegenueber der ersten Fassung:
   - Hauptknopf plus Bogen statt vier Kreise irgendwo; die ganze rechte
     Haelfte ist Aktion; unsichtbar vergroesserte Trefferflaechen.
   - Ein kleines Menue (rechts am Rand) statt der Knopfleiste: Ton, Vollbild,
     Handy, Levelwahl, Einstellungen. Es haelt das Spiel an.
   - Einstellungen, die bleiben: Haendigkeit, Groesse, Stick frei oder fest,
     Tippen rechts, Vibration.
   - Quer liegt das Gespraech als Leiste unten - das Bild bleibt sichtbar.
   - Hochkant ein Hinweis, dass quer besser ist.

   Einbau ins Level: eine Zeile, nach den anderen Engine-Dateien.
     <script src="nacht/mobil.js"></script>
   ========================================================================== */

window.MOBIL = { an:false, hoch:false, kontext:null, vibration:true };

/* Vibration. Kurz fuer Treffer, laenger fuers Einstecken. Wer das Geraet
   stumm haelt, merkt davon nichts - deshalb ist es nur Zugabe, nie Info. */
function mobilVibriere(muster){
  if(!window.MOBIL.an || !window.MOBIL.vibration || !navigator.vibrate) return;
  try{ navigator.vibrate(muster); }catch(e){}
}

(function(){
if(!IS_TOUCH) return;
window.MOBIL.an=true;

/* --------------------------------------------------------------------------
   EINSTELLUNGEN - bleiben auf dem Geraet
   -------------------------------------------------------------------------- */
const EINST_KEY='nachtschicht.mobil';
const GROESSEN={ klein:0.85, mittel:1, gross:1.2 };
const einst=Object.assign({ hand:'rechts', groesse:'mittel', stick:'frei',
                            tippen:true, vibration:true },
  (function(){ try{ return JSON.parse(localStorage.getItem(EINST_KEY))||{}; }catch(e){ return {}; } })());
function speichere(){
  window.MOBIL.vibration=!!einst.vibration;
  try{ localStorage.setItem(EINST_KEY,JSON.stringify(einst)); }catch(e){}
}
window.MOBIL.vibration=!!einst.vibration;
window.MOBIL.einst=einst;

/* --------------------------------------------------------------------------
   TASTEN-BRUECKE
   Alles, was das Bedienfeld tut, geht als Tastendruck ins Level. Damit gilt
   im Level genau eine Eingabelogik - die, die am Rechner auch laeuft.
   -------------------------------------------------------------------------- */
const haelt=Object.create(null);
function taste(code,runter){
  if(!!haelt[code]===!!runter) return;          // kein Dauerfeuer
  haelt[code]=runter;
  document.dispatchEvent(new KeyboardEvent(runter?'keydown':'keyup',
    {code:code,key:code,bubbles:true,cancelable:true,repeat:false}));
}
function tipp(code){ taste(code,true); setTimeout(function(){ taste(code,false); },40); }
function allesLos(){ for(const c in haelt) if(haelt[c]) taste(c,false); }
addEventListener('blur',allesLos);
document.addEventListener('visibilitychange',function(){ if(document.hidden) allesLos(); });

/* --------------------------------------------------------------------------
   AUFBAU
   -------------------------------------------------------------------------- */
const stil=document.createElement('style');
stil.textContent=`
/* Alte Knopfleisten, Vollbild-Ausstieg und Dreh-Aufforderung sind abgeloest. */
html.touch #touch, html.touch #rotate, html.touch #texit,
html.touch #levelbar, html.touch #fs { display:none !important; }

/* html UND body sind im Level als Flex-Box zentriert; hier nicht. Gummiband
   beim Wischen und Tipp-Aufblitzen aus. */
html.touch, html.touch body { height:100%; overflow:hidden; display:block;
  overscroll-behavior:none; -webkit-touch-callout:none;
  -webkit-tap-highlight-color:transparent; }
html.touch #cab { display:flex; flex-direction:column; width:100%; height:100%;
  padding:0; background:#05040c; }
@supports (height:100dvh){ html.touch #cab { height:100dvh; } }

/* Hochkant: Bild oben, Bedienfeld darunter - die Daumen sind nie im Bild. */
html.touch #screen { flex:0 0 auto; align-self:center;
  margin-top:calc(env(safe-area-inset-top,0px) + 8px); }
#mdeck { position:relative; flex:1 1 auto; min-height:0; touch-action:none;
  user-select:none; -webkit-user-select:none; direction:ltr; }

/* Quer liegt das Bedienfeld ueber dem Bild. Die Flaechen darin schalten
   ihre Beruehrung selbst ein, damit das Bild darunter nichts verliert. */
html.touch.mobil-quer #cab { display:block; position:relative; }
html.touch.mobil-quer #screen { position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; margin:0; }
html.touch.mobil-quer #mdeck { position:absolute; inset:0; pointer-events:none; }
#mdeck > * { pointer-events:auto; }

/* ---- Die zwei Haelften ---- */
#mlinks, #mrechts { position:absolute; top:0; bottom:0; width:50%; }
#mlinks { left:0; }  #mrechts { right:0; }
html.links #mlinks { left:auto; right:0; }
html.links #mrechts { right:auto; left:0; }

/* ---- Der Stick ---- */
#mstick { position:absolute; border-radius:50%; pointer-events:none;
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,rgba(255,255,255,.08),rgba(255,255,255,.02) 70%);
  border:2px solid rgba(255,255,255,.16); opacity:.34; transition:opacity .15s; }
#mstick.zieht { opacity:1; }
#mstick .mring { position:absolute; inset:19%; border-radius:50%;
  border:1px dashed rgba(255,255,255,.14); }
#mknopf { position:absolute; left:50%; top:50%; width:42%; height:42%;
  margin:-21% 0 0 -21%; border-radius:50%;
  background:rgba(255,61,139,.34); border:2px solid #ff3d8b; transition:background .12s; }
#mstick.zieht #mknopf { background:rgba(255,61,139,.62); }

/* ---- Die Knoepfe ----
   Jeder hat eine unsichtbar groessere Trefferflaeche (::after), damit ein
   knapper Daumen reicht. Die Anordnung setzt platziere() in Pixeln. */
.mtaste { position:absolute; border-radius:50%; box-sizing:border-box;
  background:rgba(255,255,255,.08); border:2px solid rgba(255,255,255,.24);
  color:#cfc8e6; font:700 12px/1.1 monospace; letter-spacing:1px;
  display:flex; align-items:center; justify-content:center; text-align:center;
  padding:3px; transition:transform .06s, background .06s, opacity .15s; }
.mtaste::after { content:''; position:absolute; inset:-12px; border-radius:50%; }
.mtaste.druck { transform:scale(.92); background:rgba(255,61,139,.36);
  border-color:#ff3d8b; color:#fff; opacity:1 !important; }
.mtaste.aus { display:none; }
.mtaste.haupt { border-color:#ffd447; color:#ffd447; background:rgba(255,212,71,.10); }
.mtaste.haupt.druck { background:rgba(255,212,71,.38); border-color:#ffd447; color:#fff; }
.mtaste.block { border-color:#42d9ff; color:#42d9ff; background:rgba(66,217,255,.08); }
.mtaste.block.druck { background:rgba(66,217,255,.34); border-color:#42d9ff; color:#fff; }
.mtaste.extra { border-color:#b98cff; color:#b98cff; }
@keyframes mpuls { 0%,100% { box-shadow:0 0 0 0 rgba(255,212,71,.55); }
                   50%     { box-shadow:0 0 0 12px rgba(255,212,71,0); } }
.mtaste.haupt.ruf { animation:mpuls 1.1s ease-in-out infinite; }
html.touch.mobil-quer .mtaste { opacity:.66; }

/* ---- Die Tafel in der Mitte (nur hochkant) ---- */
#minfo { position:absolute; left:0; right:0; top:8px; padding:0 14px;
  text-align:center; pointer-events:none; z-index:1; }
#minfo .titel { font:700 11px/1.3 monospace; letter-spacing:3px; color:#4a4363; }
#minfo .hinweis { margin-top:10px; font:700 14px/1.45 monospace; color:#ffd447;
  min-height:42px; text-wrap:balance; }
#minfo .werte { margin-top:12px; display:flex; flex-wrap:wrap; gap:6px 10px;
  justify-content:center; font:700 10px/1 monospace; letter-spacing:1px; color:#4a4363; }
#minfo .werte b { color:#8d86a8; font-weight:700; }
#minfo .crew { margin-top:9px; font:400 10px/1.4 monospace; color:#42d9ff99; }
@keyframes mweg { 0%,80% { opacity:1; } 100% { opacity:0; } }
#minfo .dreh { margin-top:12px; font:700 10px/1.4 monospace; letter-spacing:1px;
  color:#8d86a8; animation:mweg 14s forwards; }
html.touch.mobil-quer #minfo { display:none; }

/* ---- Der Menue-Knopf ---- */
#mmenubtn { position:absolute; z-index:4; background:rgba(20,16,34,.82);
  border:1px solid #3a3160; border-radius:8px; color:#cfc8e6;
  font:700 10px/1 monospace; letter-spacing:2px; padding:9px 11px; }
#mmenubtn::after { content:''; position:absolute; inset:-8px; }
/* Auf Hoehe von rund einem Viertel: darueber liegt die Anzeige des Spiels (Uhr, Phase), darunter der Bogen der Knoepfe. */
html.touch.mobil-quer #mmenubtn { right:6px; top:calc(env(safe-area-inset-top,0px) + 24%); }
html.touch:not(.mobil-quer) #mmenubtn { right:8px; top:6px; }

/* ---- Blaetter: Menue, Levelwahl, Einstellungen ---- */
#mblatt { position:absolute; inset:0; display:none; flex-direction:column; gap:8px;
  padding:14px 14px calc(env(safe-area-inset-bottom,0px) + 14px);
  background:rgba(5,4,12,.96); overflow:auto; z-index:6; }
#mblatt.an { display:flex; }
#mblatt h2 { margin:0 0 4px; font:700 12px/1 monospace; letter-spacing:3px; color:#ff3d8b; }
#mblatt .zeile { display:flex; align-items:center; gap:8px; }
#mblatt .zeile > span { flex:1; font:700 11px/1.2 monospace; letter-spacing:1px; color:#8d86a8; }
#mblatt button, #mblatt a.lv { text-decoration:none; text-align:left; color:#cfc8e6;
  background:rgba(255,255,255,.06); border:1px solid #2a2246; border-radius:8px;
  font:700 12px/1 monospace; letter-spacing:1px; padding:15px 12px; }
#mblatt button:active, #mblatt a.lv:active { background:rgba(255,61,139,.26); color:#fff; }
#mblatt .wahl { display:flex; gap:6px; flex:0 0 auto; }
#mblatt .wahl button { padding:11px 12px; text-align:center; }
#mblatt .wahl button.an { border-color:#ffd447; color:#ffd447; background:rgba(255,212,71,.12); }
#mblatt a.lv.aktiv { color:#ff3d8b; border-color:#ff3d8b; }
#mblatt .zu { background:rgba(255,212,71,.10); border-color:#ffd447; color:#ffd447;
  text-align:center; letter-spacing:2px; }

/* Waehrend eines Gespraechs gehoeren die Daumen den Antworten: Stick, Knoepfe
   und Haelften sind dann weg und nicht beruehrbar. */
#mdeck.rede .mtaste, #mdeck.rede #mstick { visibility:hidden; }
#mdeck.rede #mlinks, #mdeck.rede #mrechts { pointer-events:none; }

/* ---- Gespraech: die Antworten sind Flaechen, keine Liste zum Blaettern ---- */
#mtalk { position:absolute; display:none; flex-direction:column; gap:7px;
  padding:10px 10px calc(env(safe-area-inset-bottom,0px) + 12px);
  background:#05040c; z-index:5; left:0; right:0; bottom:0; top:0; }
#mtalk.an { display:flex; }
#mtalk .wer { font:700 10px/1 monospace; letter-spacing:2px; color:#42d9ff; }
#mtalk .was { font:400 13px/1.45 monospace; color:#f2f0ff; flex:0 0 auto; }
#mtalk .liste { flex:1; display:flex; flex-direction:column; gap:8px;
  justify-content:flex-end; overflow:auto; }
#mtalk .opt { background:rgba(255,255,255,.05); border:1px solid #2a2246;
  border-left:3px solid #ff3d8b; border-radius:8px; color:#cfc8e6;
  font:400 13px/1.35 monospace; padding:13px 11px; text-align:left; }
#mtalk .opt:active { background:rgba(255,61,139,.26); color:#fff; }
#mtalk .weiter { background:rgba(255,212,71,.10); border:1px solid #ffd447;
  border-radius:8px; color:#ffd447; font:700 12px/1 monospace; letter-spacing:2px; padding:16px; }
#mtalk .uhr { height:3px; background:#ff3d8b; border-radius:2px; align-self:flex-start; }
/* Quer ist das Gespraech eine Leiste unten - das Bild bleibt zu sehen. */
html.touch.mobil-quer #mtalk { top:auto; max-height:80%;
  background:rgba(5,4,12,.94); border-top:2px solid #ff3d8b; }
html.touch.mobil-quer #mtalk .opt { padding:10px 11px; }
`;
document.head.appendChild(stil);

const deck=document.createElement('div'); deck.id='mdeck';
deck.innerHTML=[
  '<div id="minfo"><div class="titel"></div><div class="hinweis"></div>',
  '  <div class="werte"></div><div class="crew"></div>',
  '  <div class="dreh">QUER SPIELEN IST BESSER - HANDY DREHEN</div></div>',
  '<div id="mlinks"></div>',
  '<div id="mrechts"></div>',
  '<div id="mstick"><div class="mring"></div><div id="mknopf"></div></div>',
  '<div class="mtaste extra aus" id="mb-x1"></div>',
  '<div class="mtaste extra aus" id="mb-x2"></div>',
  '<div class="mtaste block aus" id="mb-block"></div>',
  '<div class="mtaste aus" id="mb-zwei"></div>',
  '<div class="mtaste haupt" id="mb-aktion"></div>',
  '<button id="mmenubtn">MENUE</button>',
  '<div id="mtalk"><div class="uhr"></div><div class="wer"></div>',
  '  <div class="was"></div><div class="liste"></div></div>',
  '<div id="mblatt"></div>',
  '<div id="msafe" style="position:absolute;left:0;top:0;width:0;height:0;visibility:hidden;',
  'padding:0 env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)"></div>'
].join('');
(document.getElementById('cab')||document.body).appendChild(deck);

const el=function(id){ return document.getElementById(id); };
const stick=el('mstick'), knopf=el('mknopf');
const zoneL=el('mlinks'), zoneR=el('mrechts');
const bAktion=el('mb-aktion'), bZwei=el('mb-zwei'), bBlock=el('mb-block');
const bX=[el('mb-x1'),el('mb-x2')];
const talk=el('mtalk'), blatt=el('mblatt');
const html=document.documentElement;
html.classList.toggle('links',einst.hand==='links');

/* --------------------------------------------------------------------------
   ANORDNUNG
   Hauptknopf unten aussen. Die uebrigen sitzen auf einem Bogen um seine Mitte:
   so liegen alle im Umkreis des Daumens. Quer richtet sich die Groesse nach
   der Hoehe, hochkant nach der Breite - nach der Breite gerechnet wuerde auf
   einem liegenden Handy der Hauptknopf fast den halben Schirm fuellen.
   -------------------------------------------------------------------------- */
let mitte={x:0,y:0}, stickGr=130, stickHeimPos={x:0,y:0};
function setze(elm,x,y,d){
  elm.style.width=elm.style.height=d+'px';
  elm.style.left=Math.round(x-d/2)+'px'; elm.style.top=Math.round(y-d/2)+'px';
  elm.style.fontSize=Math.max(10,Math.round(d*0.14))+'px';
}
function platziere(){
  const r=deck.getBoundingClientRect(), dw=r.width, dh=r.height;
  if(!dw||!dh) return;
  const sicher=getComputedStyle(el('msafe'));
  const sU=parseFloat(sicher.paddingBottom)||0, sL=parseFloat(sicher.paddingLeft)||0,
        sR=parseFloat(sicher.paddingRight)||0;
  const quer=!window.MOBIL.hoch, sk=GROESSEN[einst.groesse]||1;
  const k=Math.round((quer?Math.min(dh*0.27,dw*0.17):Math.min(dw*0.30,150))*sk);
  const s=Math.round(k*0.72), luecke=Math.round(k*0.12), rand=Math.round(k*0.2);
  const links=einst.hand==='links', vz=links?-1:1;
  const cx=links?(rand+sL+k/2):(dw-rand-sR-k/2), cy=dh-rand-sU-k/2;
  mitte={x:cx,y:cy};
  setze(bAktion,cx,cy,k);
  const R=k/2+s/2+luecke, R2=R+s*0.95+luecke;
  const bogen=function(elm,grad,radius,d){ const a=grad*Math.PI/180;
    setze(elm,cx-vz*Math.cos(a)*radius,cy-Math.sin(a)*radius,d); };
  bogen(bZwei,8,R,s);                 // fast waagerecht: Sprung/Rolle, am haeufigsten
  bogen(bBlock,62,R,s);               // darueber: Blocken
  bogen(bX[0],30,R2,Math.round(s*0.9));   // zweiter Ring: nur was dieses Level kann
  bogen(bX[1],78,R2,Math.round(s*0.9));
  /* Stick: Groesse und Ruhestellung auf der anderen Seite */
  stickGr=Math.max(100,Math.round(k*1.15));
  stick.style.width=stick.style.height=stickGr+'px';
  const heimX=Math.max(dw*0.17,stickGr*0.6+sL);
  stickHeimPos={ x:links?(dw-heimX):heimX,
                 y:dh-Math.max(rand+sU,0)-stickGr*0.62 };
  if(stickId===null) stickHeim();
}

/* --------------------------------------------------------------------------
   STICK
   Richtung gibt die Pfeiltasten, Auslenkung entscheidet zwischen Schleichen
   und Gehen - das ist der Teil, den vier Knoepfe nicht koennen.
   -------------------------------------------------------------------------- */
const TOT=0.22;        // darunter passiert nichts
const SCHLEICH=0.62;   // darunter wird geschlichen
let stickId=null;

/* Schleichen liegt in den Leveln auf der Umschalttaste - und im Kampf liegt
   dort das Blocken. Deshalb gilt analoges Schleichen nur, wenn der Blockknopf
   gerade NICHT gebraucht wird. */
const schleichenErlaubt=function(){ return !(window.MOBIL.kontext&&window.MOBIL.kontext.block); };

/* Richtungen mit Hysterese und Winkelsektoren: einschalten erst ueber AN,
   ausschalten erst unter AUS - sonst flackert eine Taste an der Schwelle. Eine
   Achse zaehlt nur ab SEKTOR der Auslenkung (echte acht Richtungen). */
const AN=0.26, AUS=0.16, SEKTOR=0.38;
function achse(code,wert,r){
  const war=!!haelt[code];
  taste(code, wert>(war?AUS:AN) && wert>=SEKTOR*r*(war?0.8:1));
}
function stickSetzen(dx,dy,r){
  const max=stickGr*0.29;
  knopf.style.transform='translate('+(dx*max).toFixed(1)+'px,'+(dy*max).toFixed(1)+'px)';
  achse('ArrowLeft',-dx,r); achse('ArrowRight',dx,r);
  achse('ArrowUp',-dy,r);   achse('ArrowDown',dy,r);
  const grenze=haelt['ShiftLeft']?SCHLEICH+0.06:SCHLEICH-0.06;
  taste('ShiftLeft',schleichenErlaubt()&&r>TOT&&r<grenze);
}
function stickLos(){
  stickId=null; stick.classList.remove('zieht'); knopf.style.transform='';
  ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].forEach(function(c){ taste(c,false); });
  if(schleichenErlaubt()) taste('ShiftLeft',false);
}
function stickAus(e){
  const r=stick.getBoundingClientRect();
  let dx=(e.clientX-(r.left+r.width/2))/(r.width/2);
  let dy=(e.clientY-(r.top+r.height/2))/(r.height/2);
  const len=Math.hypot(dx,dy);
  if(len>1){ dx/=len; dy/=len; }
  stickSetzen(dx,dy,Math.min(1,len));
}
/* Frei: der Stick geht dorthin, wo der Daumen aufsetzt. Fest: er bleibt in
   der Ruhestellung. Geklemmt, damit er nicht halb aus dem Bild ragt. */
function stickAn(x,y){
  if(einst.stick==='frei'){
    const z=zoneL.getBoundingClientRect(), b=stickGr*0.55;
    stick.style.left=Math.max(b,Math.min(z.width-b,x-z.left))+(parseFloat(zoneL.style.left)||0)+zoneOffset()+'px';
    stick.style.top =Math.max(b,Math.min(z.height-b,y-z.top))+'px';
  }
  stick.classList.add('zieht');
}
/* Linker Rand der Stick-Haelfte im Deck (bei Linkshaendern rechts). */
function zoneOffset(){ return zoneL.getBoundingClientRect().left-deck.getBoundingClientRect().left; }
function stickHeim(){
  stick.style.left=Math.round(stickHeimPos.x)+'px';
  stick.style.top =Math.round(stickHeimPos.y)+'px';
}
zoneL.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
  if(stickId!==null) return;
  stickId=e.pointerId;
  try{ zoneL.setPointerCapture(e.pointerId); }catch(err){}
  stickAn(e.clientX,e.clientY); stickAus(e);
});
zoneL.addEventListener('pointermove',function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickAus(e);
});
['pointerup','pointercancel'].forEach(function(ev){ zoneL.addEventListener(ev,function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickLos(); stickHeim();
}); });

/* --------------------------------------------------------------------------
   KNOEPFE UND DIE RECHTE HAELFTE
   -------------------------------------------------------------------------- */
function halte(elm,code){
  let gedrueckt='';
  const los=function(e){ if(e) e.preventDefault(); elm.classList.remove('druck');
    if(gedrueckt){ taste(gedrueckt,false); gedrueckt=''; } };
  elm.addEventListener('pointerdown',function(e){ e.preventDefault(); e.stopPropagation(); ensureAudio();
    const c=code(); if(!c) return;        // ohne Taste gibt es nichts zu druecken
    try{ elm.setPointerCapture(e.pointerId); }catch(err){}
    mobilVibriere(8);                 // kurzer Tick, damit der Druck ankommt
    gedrueckt=c; elm.classList.add('druck'); taste(c,true); });
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){ elm.addEventListener(ev,los); });
}
halte(bAktion,function(){ return 'KeyE'; });
halte(bZwei,  function(){ return 'Space'; });
halte(bBlock, function(){ return 'ShiftLeft'; });
/* Die Zusatzknoepfe wechseln ihre Taste mit dem Kontext. Deshalb haengt der
   Code in einer Zelle, die kontextPflege() neu fuellt. */
const xCode=['',''];
bX.forEach(function(elm,i){ halte(elm,function(){ return xCode[i]; }); });

/* Die ganze rechte Haelfte ist der Hauptknopf: ein Tippen irgendwo genuegt.
   Nur wenn dieses Level gerade einen Hauptknopf zeigt. */
let rechtsId=null, rechtsCode='', rechtsKnopf=null;
zoneR.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
  if(!einst.tippen||rechtsId!==null) return;
  /* Aktion, wenn das Level sie zeigt - sonst Sprung (Laufstrecken wie Level 8). */
  if(!bAktion.classList.contains('aus')){ rechtsCode='KeyE'; rechtsKnopf=bAktion; }
  else if(!bZwei.classList.contains('aus')){ rechtsCode='Space'; rechtsKnopf=bZwei; }
  else return;
  rechtsId=e.pointerId;
  try{ zoneR.setPointerCapture(e.pointerId); }catch(err){}
  mobilVibriere(8); rechtsKnopf.classList.add('druck'); taste(rechtsCode,true);
});
['pointerup','pointercancel'].forEach(function(ev){ zoneR.addEventListener(ev,function(e){
  if(e.pointerId!==rechtsId) return;
  e.preventDefault(); rechtsId=null; rechtsKnopf.classList.remove('druck'); taste(rechtsCode,false);
}); });

/* Hochkant ist das Bild oben: Tippen darauf bestaetigt Startbildschirme und
   Zwischentexte. Nur Enter - E und Enter loesen im Level dasselbe aus, beide
   zusammen liessen das Intro zwei Texte ueberspringen. */
const schirm=el('screen');
if(schirm) schirm.addEventListener('pointerdown',function(e){
  e.preventDefault(); ensureAudio(); tipp('Enter');
});
deck.addEventListener('contextmenu',function(e){ e.preventDefault(); });

/* --------------------------------------------------------------------------
   MENUE UND EINSTELLUNGEN
   -------------------------------------------------------------------------- */
let selbstPausiert=false;
function menueAuf(){
  /* Das Menue haelt das Spiel an - sonst steht man darin mitten im Kampf. */
  if(typeof pauseTaste==='function'&&typeof S!=='undefined'&&S&&S.modus!=='pause'){
    pauseTaste(); selbstPausiert=(S.modus==='pause');
  }
  zeigeBlatt('menue');
}
function menueZu(){
  blatt.classList.remove('an');
  if(selbstPausiert&&typeof S!=='undefined'&&S&&S.modus==='pause'&&typeof pauseTaste==='function') pauseTaste();
  selbstPausiert=false;
}
function knopfIn(eltern,txt,fn,klasse){
  const b=document.createElement('button'); b.textContent=txt; if(klasse) b.className=klasse;
  b.addEventListener('pointerdown',function(e){ e.preventDefault(); e.stopPropagation(); ensureAudio(); fn(b); });
  eltern.appendChild(b); return b;
}
function auswahl(eltern,name,optionen,schluessel,wirkung){
  const z=document.createElement('div'); z.className='zeile';
  const t=document.createElement('span'); t.textContent=name; z.appendChild(t);
  const w=document.createElement('div'); w.className='wahl'; z.appendChild(w);
  const knoepfe=[];
  optionen.forEach(function(o){
    const b=knopfIn(w,o[0],function(){
      einst[schluessel]=o[1]; speichere(); knoepfe.forEach(function(x){ x.b.classList.toggle('an',x.w===o[1]); });
      if(wirkung) wirkung();
    });
    b.classList.toggle('an',einst[schluessel]===o[1]); knoepfe.push({b:b,w:o[1]});
  });
  eltern.appendChild(z);
}
function zeigeBlatt(was){
  blatt.innerHTML=''; blatt.classList.add('an');
  const h=document.createElement('h2'); blatt.appendChild(h);
  if(was==='menue'){
    h.textContent='MENUE';
    knopfIn(blatt,'WEITER',menueZu,'zu');
    knopfIn(blatt,typeof muted!=='undefined'&&muted?'TON AN':'TON AUS',function(b){
      ensureAudio(); tipp('KeyM'); setTimeout(function(){ b.textContent=muted?'TON AN':'TON AUS'; },80); });
    knopfIn(blatt,'VOLLBILD',function(){ vollbild(); });
    if(typeof handyAuf==='function') knopfIn(blatt,'HANDY',function(){ menueZu(); handyAuf(); });
    if(typeof MENUE!=='undefined'&&MENUE.galerie) knopfIn(blatt,'ENDEN',function(){ menueZu(); MENUE.galerie(); });
    knopfIn(blatt,'LEVEL WECHSELN',function(){ zeigeBlatt('level'); });
    knopfIn(blatt,'EINSTELLUNGEN',function(){ zeigeBlatt('einst'); });
  } else if(was==='level'){
    h.textContent='LEVEL';
    const leiste=el('levelbar');
    if(leiste) [].forEach.call(leiste.querySelectorAll('a'),function(a){
      const k=a.cloneNode(true); k.removeAttribute('style'); k.className='lv'+(a.classList.contains('aktiv')||a.getAttribute('aria-current')?' aktiv':'');
      blatt.appendChild(k); });
    knopfIn(blatt,'ZURUECK',function(){ zeigeBlatt('menue'); },'zu');
  } else {
    h.textContent='EINSTELLUNGEN';
    auswahl(blatt,'HAND',[['LINKS','links'],['RECHTS','rechts']],'hand',function(){
      html.classList.toggle('links',einst.hand==='links'); platziere(); });
    auswahl(blatt,'GROESSE',[['KLEIN','klein'],['MITTEL','mittel'],['GROSS','gross']],'groesse',platziere);
    auswahl(blatt,'STICK',[['FREI','frei'],['FEST','fest']],'stick',function(){ if(stickId===null) stickHeim(); });
    auswahl(blatt,'TIPPEN RECHTS = AKTION',[['AN',true],['AUS',false]],'tippen');
    auswahl(blatt,'VIBRATION',[['AN',true],['AUS',false]],'vibration',function(){ mobilVibriere(30); });
    knopfIn(blatt,'ZURUECK',function(){ zeigeBlatt('menue'); },'zu');
  }
}
el('mmenubtn').addEventListener('pointerdown',function(e){ e.preventDefault(); e.stopPropagation(); ensureAudio();
  if(blatt.classList.contains('an')) menueZu(); else menueAuf(); });

/* --------------------------------------------------------------------------
   GESPRAECHE ANTIPPEN
   Solange geredet wird, ersetzt die Antwortliste das Bedienfeld. Sie zeigt
   genau die Auswahl, die dialog.js gerade fuehrt - inklusive der Antworten,
   die an Bedingungen haengen und deshalb manchmal fehlen.
   -------------------------------------------------------------------------- */
let talkStand='';
function talkPflege(){
  const aktiv=typeof gespraechAktiv==='function'&&gespraechAktiv();
  talk.classList.toggle('an',!!aktiv);
  if(!!aktiv!==deck.classList.contains('rede')){
    deck.classList.toggle('rede',!!aktiv);
    allesLos(); if(stickId!==null){ stickLos(); stickHeim(); }   // nichts bleibt gedrueckt haengen
  }
  if(!aktiv){ talkStand=''; return; }
  const k=GESPR.knoten, w=GESPR.wahlen;
  const kennung=GESPR.name+'|'+w.length;
  talk.querySelector('.uhr').style.width=(k.zeit&&GESPR.zeitRest>0)
    ? Math.round(100*GESPR.zeitRest/(GESPR.zeitGesamt||k.zeit))+'%' : '0';
  if(kennung===talkStand) return;
  talkStand=kennung;
  talk.querySelector('.wer').textContent=k.wer||'';
  talk.querySelector('.was').textContent=k.text||'';
  const liste=talk.querySelector('.liste'); liste.innerHTML='';
  if(w.length){
    w.forEach(function(o,i){
      const b=document.createElement('button'); b.className='opt'; b.textContent=o.txt;
      b.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
        GESPR.gewaehlt=i; gespraechBestaetigen(); talkPflege(); });
      liste.appendChild(b);
    });
  } else {
    const b=document.createElement('button'); b.className='weiter'; b.textContent='WEITER';
    b.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
      gespraechBestaetigen(); talkPflege(); });
    liste.appendChild(b);
  }
}

/* --------------------------------------------------------------------------
   DIE TAFEL - spiegelt Hinweis und Werte gross unter das Bild (hochkant)
   -------------------------------------------------------------------------- */
const info=el('minfo');
let infoStand='';
function infoPflege(){
  if(window.MOBIL.hoch===false) return;
  const titel=(document.title||'').replace(/^NACHTSCHICHT\s*-?\s*/,'')||'NACHTSCHICHT';
  let hinweis='';
  if(typeof S!=='undefined'&&S){
    if(S.hinweisT>0&&S.hinweis) hinweis=S.hinweis;
    else if(S.meldungT>0&&S.meldung) hinweis=S.meldung;
  }
  let werte='';
  if(typeof wert==='function'){
    const w=[['MUT','mut'],['RUF','ruf'],['GELD','geld'],['WACH','kondition']];
    werte=w.map(function(e){ return '<span>'+e[0]+' <b>'+Math.round(wert(e[1]))+'</b></span>'; }).join('');
    if(typeof ladePegel==='function') werte+='<span>PEGEL <b>'+Math.round(ladePegel())+'</b></span>';
  }
  let crew='';
  if(typeof ladeCrew==='function'){ const c=ladeCrew(); if(c.length) crew='DABEI: '+c.join(', '); }
  const kennung=titel+'|'+hinweis+'|'+werte+'|'+crew;
  if(kennung===infoStand) return;
  infoStand=kennung;
  info.querySelector('.titel').textContent=titel;
  info.querySelector('.hinweis').textContent=hinweis;
  info.querySelector('.werte').innerHTML=werte;
  info.querySelector('.crew').textContent=crew;
}

/* --------------------------------------------------------------------------
   KONTEXT - was die Knoepfe gerade heissen und welche es gibt
   -------------------------------------------------------------------------- */
function beschrifte(elm,txt,code){
  const zeigen=!!txt;
  elm.classList.toggle('aus',!zeigen);
  if(zeigen&&elm.textContent!==txt) elm.textContent=txt;
  /* Verschwindet ein Knopf, waehrend er gehalten wird, muss die Taste los -
     sonst laeuft die Figur ewig weiter. */
  if(!zeigen&&code){ elm.classList.remove('druck'); taste(code,false); }
}
/* Diese Aufschriften sind der Dauerzustand - sie sollen nicht pulsieren. */
const ALLGEMEIN=['AKTION','WEITER','START','SCHLAG','KONTER','TIPPEN'];
function kontextPflege(){
  let k={aktion:'AKTION',zwei:'SPRUNG',block:false,extras:null};
  if(typeof mobilKontext==='function'){ try{ k=Object.assign(k,mobilKontext()||{}); }catch(e){} }
  /* Waehrend der Lektion (nacht/lehre.js) zeigt das Bedienfeld genau die
     Knoepfe, die in ihr vorkommen. */
  if(window.LEHRE&&window.LEHRE.aktiv){
    try{ k=Object.assign({aktion:null,zwei:null,block:false,extras:null},window.LEHRE.mobilKontext()); }catch(e){}
  }
  window.MOBIL.kontext=k;
  beschrifte(bAktion,k.aktion,'KeyE');
  /* Pulsiert, sobald dort mehr steht als AKTION oder WEITER: jetzt ist was zu tun. */
  bAktion.classList.toggle('ruf',!!k.aktion&&!ALLGEMEIN.includes(k.aktion));
  beschrifte(bZwei,k.zwei,'Space');
  beschrifte(bBlock,k.block?'BLOCK':null,'ShiftLeft');
  const ex=k.extras||[];
  bX.forEach(function(elm,i){
    const e=ex[i];
    if(xCode[i]&&(!e||e.code!==xCode[i])) taste(xCode[i],false);   // alte Taste loslassen
    xCode[i]=e?e.code:'';
    beschrifte(elm,e?e.txt:null,e?e.code:null);
  });
}

/* --------------------------------------------------------------------------
   LAGE - hoch oder quer, und die Pixel dazu
   -------------------------------------------------------------------------- */
function lage(){
  const quer=innerWidth>innerHeight;
  html.classList.toggle('mobil-quer',quer);
  window.MOBIL.hoch=!quer;
  anpassen();
  /* Hochkant nutzt das Bild die volle Breite. anpassen() rechnet mit ganzen
     und viertel Stufen und landete auf einem 375er Schirm bei Faktor 1 - also
     320 Pixel Bild und 55 Pixel schwarzem Rand. */
  if(!quer){
    const s=innerWidth/W;
    cv.style.width=Math.round(W*s)+'px'; cv.style.height=Math.round(H*s)+'px';
  }
  platziere();
}

/* Der Bildschirm soll beim Spielen nicht ausgehen. Geht nur nach einer
   Beruehrung und nur, wo der Browser es kann - sonst passiert nichts. */
let wachSchloss=null;
async function bildschirmWach(){
  try{
    if(!navigator.wakeLock||wachSchloss) return;
    wachSchloss=await navigator.wakeLock.request('screen');
    wachSchloss.addEventListener('release',function(){ wachSchloss=null; });
  }catch(e){}
}
document.addEventListener('visibilitychange',function(){ if(!document.hidden) bildschirmWach(); });
addEventListener('pointerdown',bildschirmWach,{once:true});
addEventListener('resize',lage);
addEventListener('orientationchange',function(){ setTimeout(lage,140); });
if(window.ResizeObserver) new ResizeObserver(function(){ platziere(); }).observe(deck);
lage();
kontextPflege();

setInterval(function(){ talkPflege(); kontextPflege(); infoPflege(); },90);
})();
