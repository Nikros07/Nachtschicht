/* ============================================================================
   NACHTSCHICHT - ENGINE: mobil
   Die Handy-Fassung. Keine anderen Knoepfe - eine andere Bedienung.

   Was vorher da war: vier runde Knoepfe lagen ueber dem Bild, das Handy
   musste quer gehalten werden, und die Daumen verdeckten genau die Ecken,
   in denen etwas passiert. Jede Datei hatte ihre eigene Knopfleiste - in
   index.html fehlte einmal der Runter-Knopf, und das Level war am Handy
   nicht mehr spielbar. Neun Kopien, neun Gelegenheiten fuer denselben
   Fehler.

   Diese Datei macht daraus eine eigene Fassung:

   1. EIN EINGABEMODELL FUER ALLE LEVEL. Die Bedienung schickt synthetische
      Tastatur-Ereignisse. Jedes Level hat schon eine vollstaendige
      Tastatursteuerung - also bekommt jedes Level die volle Handy-Steuerung,
      ohne dass im Level eine Zeile dafuer steht. Ein fehlender Knopf kann
      strukturell nicht mehr vorkommen.

   2. ANALOGER STICK STATT VIER KNOEPFE. Seit es die Tiefenachse gibt, muss
      man schraeg laufen koennen - mit getrennten Knoepfen geht das nur, wenn
      man zwei gleichzeitig trifft. Der Stick kann alle acht Richtungen. Und
      er ist wirklich analog: sanft gezogen schleicht man, voll gezogen geht
      man.

   3. KNOEPFE, DIE WISSEN WAS SIE TUN. Ein Level darf mobilKontext()
      definieren und sagen, was gerade moeglich ist. Dann steht auf dem
      Knopf REDEN, SPIND, TUER oder SCHLAG - nicht E.

   4. GESPRAECHE WERDEN ANGETIPPT. Am Rechner blaettert man mit links/rechts
      durch die Antworten. Am Handy stehen sie als echte Flaechen im
      Bedienfeld und man tippt die an, die man meint.

   5. HOCH- UND QUERFORMAT. Das "HANDY DREHEN" ist weg. Im Hochformat liegt
      das Bild oben und das Bedienfeld darunter - die Daumen sind nie im
      Bild. Quer bleibt es eine Auflage, dafuer groesser.

   6. RUECKMELDUNG AM GERAET. Treffer, Bloecke und Fehlschlaege vibrieren
      unterschiedlich.

   Einbau ins Level: eine Zeile, nach den anderen Engine-Dateien.
     <script src="nacht/mobil.js"></script>
   ========================================================================== */

window.MOBIL = { an:false, hoch:false, kontext:null };

/* Vibration. Kurz fuer Treffer, laenger fuers Einstecken. Wer das Geraet
   stumm haelt, merkt davon nichts - deshalb ist es nur Zugabe, nie Info. */
function mobilVibriere(muster){
  if(!window.MOBIL.an || !navigator.vibrate) return;
  try{ navigator.vibrate(muster); }catch(e){}
}

(function(){
if(!IS_TOUCH) return;
window.MOBIL.an=true;

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
/* Die alte Knopfleiste, der Vollbild-Ausstieg und die Dreh-Aufforderung
   sind abgeloest - falls eine Seite sie noch mitbringt, bleiben sie aus. */
html.touch #touch, html.touch #rotate, html.touch #texit,
html.touch #levelbar, html.touch #fs { display:none !important; }

/* html UND body sind im Level als Flex-Box zentriert. Bleibt html dabei,
   wird body nur so breit wie sein Inhalt - und das ganze Bedienfeld sitzt
   in einer 320 Pixel breiten Spalte statt auf dem Schirm.
   overscroll-behavior verhindert das Gummiband beim Wischen. */
html.touch, html.touch body { height:100%; overflow:hidden; display:block;
  overscroll-behavior:none; -webkit-touch-callout:none; }
html.touch #cab { display:flex; flex-direction:column; width:100%; height:100%;
  padding:0; background:#05040c; }
@supports (height:100dvh){ html.touch #cab { height:100dvh; } }

/* Hochkant: Bild oben, Bedienfeld darunter. Das Bild bekommt die volle
   Breite (siehe lage()), oben bleibt Platz fuer die Kamera-Kerbe. */
html.touch #screen { flex:0 0 auto; align-self:center;
  margin-top:calc(env(safe-area-inset-top,0px) + 8px); }
#mdeck { position:relative; flex:1 1 auto; min-height:0;
  touch-action:none; user-select:none; -webkit-user-select:none; }

/* Quer liegt das Bedienfeld ueber dem Bild - sonst bliebe vom Bild nichts. */
html.touch.mobil-quer #cab { display:block; position:relative; }
html.touch.mobil-quer #screen { position:absolute; inset:0; display:flex;
  align-items:center; justify-content:center; margin:0; }
html.touch.mobil-quer #mdeck { position:absolute; inset:0; }
html.touch.mobil-quer .mtaste { opacity:.6; }
html.touch.mobil-quer .mtaste:active { opacity:1; }

/* ---- Der Stick ----
   Er steht nicht mehr fest: wo der Daumen die linke Haelfte beruehrt, dort
   erscheint er. Ein fester Kreis ist auf einem 812 Pixel hohen Schirm
   entweder zu weit unten oder zu weit oben - je nachdem, wie man haelt. */
#mzone { position:absolute; left:0; top:0; width:52%; height:100%; }
html.touch.mobil-quer #mzone { width:45%; }
#mstick { position:absolute; width:38vw; max-width:180px; aspect-ratio:1;
  margin-left:-19vw; margin-top:-19vw; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle at 50% 50%,rgba(255,255,255,.07),rgba(255,255,255,.02) 70%);
  border:2px solid rgba(255,255,255,.14); opacity:.32; transition:opacity .15s; }
@media (min-width:520px){ #mstick { margin-left:-90px; margin-top:-90px; } }
#mstick.zieht { opacity:1; }
#mknopf { position:absolute; left:50%; top:50%; width:40%; aspect-ratio:1;
  margin:-20% 0 0 -20%; border-radius:50%;
  background:rgba(255,61,139,.32); border:2px solid #ff3d8b;
  transition:background .12s; }
#mstick.zieht #mknopf { background:rgba(255,61,139,.6); }
#mstick .mring { position:absolute; inset:24%; border-radius:50%;
  border:1px dashed rgba(255,255,255,.12); }

/* ---- Die Knoepfe rechts ----
   Gross, weit unten, mit Abstand zum Rand: so liegt der rechte Daumen ohne
   Umgreifen darauf, und unter dem Home-Balken sitzt nichts. */
.mtaste { position:absolute; border-radius:50%;
  background:rgba(255,255,255,.07); border:2px solid rgba(255,255,255,.18);
  color:#cfc8e6; font:700 12px/1.1 monospace; letter-spacing:1px;
  display:flex; align-items:center; justify-content:center; text-align:center;
  padding:4px; transition:transform .06s, background .06s; }
.mtaste:active { background:rgba(255,61,139,.34); border-color:#ff3d8b; color:#fff;
  transform:scale(.94); }
.mtaste.aus { display:none; }
#mb-aktion { right:5%;  bottom:calc(env(safe-area-inset-bottom,0px) + 9%);
  width:34vw; max-width:170px; aspect-ratio:1;
  border-color:#ffd447; color:#ffd447; font-size:14px; }
#mb-aktion:active { background:rgba(255,212,71,.34); border-color:#ffd447; color:#fff; }
#mb-zwei { right:39%; bottom:calc(env(safe-area-inset-bottom,0px) + 15%);
  width:24vw; max-width:118px; aspect-ratio:1; }
#mb-block { right:6%; bottom:calc(env(safe-area-inset-bottom,0px) + 40%);
  width:24vw; max-width:118px; aspect-ratio:1;
  border-color:#42d9ff; color:#42d9ff; }
#mb-block:active { background:rgba(66,217,255,.30); border-color:#42d9ff; color:#fff; }
/* Zusatzknoepfe: was nur dieses Level kann. */
.mx { position:absolute; right:8%; width:21vw; max-width:100px; aspect-ratio:1;
  font-size:11px; }
#mb-x1 { bottom:calc(env(safe-area-inset-bottom,0px) + 40%); }
#mb-x2 { right:38%; bottom:calc(env(safe-area-inset-bottom,0px) + 44%); }

/* Quer bemisst sich alles an der HOEHE. Nach der Breite gerechnet wird
   der Aktionsknopf auf einem liegenden Handy fast halb so hoch wie der
   Schirm und deckt das halbe Bild zu. */
html.touch.mobil-quer #mstick { width:44vh; margin-left:-22vh; margin-top:-22vh; max-width:none; }
html.touch.mobil-quer #mb-aktion { width:26vh; max-width:none; bottom:6%; right:3%; }
html.touch.mobil-quer #mb-zwei   { width:19vh; max-width:none; bottom:10%; right:26%; }
html.touch.mobil-quer #mb-block  { width:19vh; max-width:none; bottom:44%; right:4%; }
html.touch.mobil-quer .mx        { width:17vh; max-width:none; right:5%; }
html.touch.mobil-quer #mb-x1 { bottom:44%; }
html.touch.mobil-quer #mb-x2 { bottom:48%; right:24%; }

/* ---- Die Tafel in der Mitte ----
   Hochkant bleibt unter dem Bild Platz, den kein Spielinhalt braucht.
   Dort steht gross, was auf dem kleinen Bild klein ist. */
#minfo { position:absolute; left:0; right:0; top:8px; padding:0 14px;
  text-align:center; pointer-events:none; z-index:1; }
#minfo .titel { font:700 11px/1.3 monospace; letter-spacing:3px; color:#4a4363; }
#minfo .hinweis { margin-top:10px; font:700 14px/1.45 monospace; color:#ffd447;
  min-height:42px; text-wrap:balance; }
#minfo .werte { margin-top:12px; display:flex; flex-wrap:wrap; gap:6px 10px;
  justify-content:center; font:700 10px/1 monospace; letter-spacing:1px; color:#4a4363; }
#minfo .werte b { color:#8d86a8; font-weight:700; }
#minfo .crew { margin-top:9px; font:400 10px/1.4 monospace; color:#42d9ff99; }
html.touch.mobil-quer #minfo { display:none; }

/* ---- Die kleine Leiste ----
   Sie sass direkt unter dem Bild und nahm den besten Platz weg. Jetzt ist
   sie eine schmale Zeile ganz unten, weit weg von den Daumen. */
#mbar { position:absolute; left:0; right:0; bottom:0; display:flex; gap:5px;
  padding:5px 8px calc(env(safe-area-inset-bottom,0px) + 5px); z-index:3; }
#mbar button, #mbar a { flex:1; text-decoration:none; text-align:center;
  background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.12);
  border-radius:6px; color:#8d86a8; font:700 9px/1 monospace; letter-spacing:1px;
  padding:7px 2px; }
/* Quer nimmt die Leiste die Ecke weg, in der das Spiel seine Anzeige hat.
   Deshalb steckt sie dort hinter einem Knopf. */
#mtoggle { display:none; position:absolute; right:6px; top:6px; z-index:4;
  background:rgba(20,16,34,.8); border:1px solid #2a2246; border-radius:6px;
  color:#8d86a8; font:700 9px/1 monospace; letter-spacing:1px; padding:7px 9px; }
html.touch.mobil-quer #mtoggle { display:block; }
html.touch.mobil-quer #mbar { display:none; flex-direction:column; width:auto;
  left:auto; right:6px; top:34px; bottom:auto; padding:0; gap:4px; opacity:.9; }
html.touch.mobil-quer #mbar.auf { display:flex; }
html.touch.mobil-quer #mbar button, html.touch.mobil-quer #mbar a { padding:7px 10px; }

/* Gespraech: die Antworten sind hier Flaechen, keine Liste zum Blaettern. */
#mtalk { position:absolute; inset:0; display:none; flex-direction:column;
  gap:7px; padding:10px 10px calc(env(safe-area-inset-bottom,0px) + 12px);
  background:#05040c; z-index:4; }
#mtalk.an { display:flex; }
#mtalk .wer { font:700 10px/1 monospace; letter-spacing:2px; color:#42d9ff; }
#mtalk .was { font:400 13px/1.45 monospace; color:#f2f0ff; flex:0 0 auto; }
#mtalk .liste { flex:1; display:flex; flex-direction:column; gap:8px;
  justify-content:flex-end; overflow:hidden; }
#mtalk .opt { background:rgba(255,255,255,.05); border:1px solid #2a2246;
  border-left:3px solid #ff3d8b; border-radius:8px; color:#cfc8e6;
  font:400 13px/1.35 monospace; padding:13px 11px; text-align:left; }
#mtalk .opt:active { background:rgba(255,61,139,.26); color:#fff; }
#mtalk .weiter { background:rgba(255,212,71,.10); border:1px solid #ffd447;
  border-radius:8px; color:#ffd447; font:700 12px/1 monospace; letter-spacing:2px;
  padding:16px; }
#mtalk .uhr { height:3px; background:#ff3d8b; border-radius:2px; align-self:flex-start; }

/* Levelmenue - baut sich aus der Leiste, die am Rechner unter dem Bild steht. */
#mmenu { position:absolute; inset:0; display:none; flex-direction:column; gap:6px;
  padding:10px; background:#05040c; overflow:auto; z-index:5; }
#mmenu.an { display:flex; }
#mmenu a { text-decoration:none; text-align:left; color:#cfc8e6;
  background:rgba(255,255,255,.05); border:1px solid #2a2246; border-radius:6px;
  font:700 12px/1 monospace; letter-spacing:1px; padding:14px 12px; }
#mmenu a.aktiv { color:#ff3d8b; border-color:#ff3d8b; }
#mmenu .zu { background:rgba(255,212,71,.10); border:1px solid #ffd447; color:#ffd447;
  border-radius:6px; font:700 11px/1 monospace; letter-spacing:2px; padding:14px; }
`;
document.head.appendChild(stil);

const deck=document.createElement('div'); deck.id='mdeck';
deck.innerHTML=[
  '<div id="mbar">',
  '  <button id="mb-pause">PAUSE</button>',
  '  <button id="mb-ton">TON</button>',
  '  <button id="mb-voll">VOLL</button>',
  '  <button id="mb-handy">HANDY</button>',
  '  <button id="mb-menu">LEVEL</button>',
  '</div>',
  '<button id="mtoggle">MENUE</button>',
  '<div id="minfo"><div class="titel"></div><div class="hinweis"></div>',
  '  <div class="werte"></div><div class="crew"></div></div>',
  '<div id="mzone"></div>',
  '<div id="mstick"><div class="mring"></div><div id="mknopf"></div></div>',
  '<div class="mtaste mx" id="mb-x1">X</div>',
  '<div class="mtaste mx" id="mb-x2">X</div>',
  '<div class="mtaste" id="mb-block">BLOCK</div>',
  '<div class="mtaste" id="mb-zwei">SPRUNG</div>',
  '<div class="mtaste" id="mb-aktion">AKTION</div>',
  '<div id="mtalk"><div class="uhr"></div><div class="wer"></div>',
  '  <div class="was"></div><div class="liste"></div></div>',
  '<div id="mmenu"></div>'
].join('');
(document.getElementById('cab')||document.body).appendChild(deck);

const stick=document.getElementById('mstick');
const zone=document.getElementById('mzone');
const knopf=document.getElementById('mknopf');
const bAktion=document.getElementById('mb-aktion');
const bZwei=document.getElementById('mb-zwei');
const bBlock=document.getElementById('mb-block');
const bX=[document.getElementById('mb-x1'),document.getElementById('mb-x2')];
const talk=document.getElementById('mtalk');

/* --------------------------------------------------------------------------
   STICK
   Ein Finger im Kreis. Richtung gibt die Pfeiltasten, Auslenkung entscheidet
   zwischen Schleichen und Gehen - das ist der Teil, den vier Knoepfe nicht
   koennen.
   -------------------------------------------------------------------------- */
const TOT=0.22;        // darunter passiert nichts
const SCHLEICH=0.62;   // darunter wird geschlichen
let stickId=null;

/* Schleichen liegt in den Leveln auf der Umschalttaste - und im Kampf liegt
   dort das Blocken. Waere das analoge Schleichen im Kampf aktiv, wuerde ein
   sanft gezogener Stick die Deckung hochreissen. Deshalb gilt es nur, wenn
   der Blockknopf gerade NICHT gebraucht wird. */
const schleichenErlaubt = () =>
  !(window.MOBIL.kontext && window.MOBIL.kontext.block);

/* Richtungen mit Hysterese und Winkelsektoren.
   Vorher schaltete jede Achse hart bei 0.22 um. Zwei Folgen, beide in der
   Animation sichtbar:
   - Wer den Daumen knapp an der Schwelle hielt, liess die Taste jedes Bild
     an- und ausgehen. Die Figur bremste und beschleunigte staendig und
     sprang zwischen Steh- und Gehbild hin und her.
   - Schon 13 Grad neben der Waagerechten kam die Hoch/Runter-Taste dazu -
     wer "nach rechts" meinte, driftete in die Tiefe.
   Jetzt: einschalten erst ueber AN, ausschalten erst unter AUS, und eine
   Achse zaehlt nur, wenn sie mindestens SEKTOR der Auslenkung ausmacht
   (sin 22.5 Grad - also echte acht Richtungen). */
const AN=0.26, AUS=0.16, SEKTOR=0.38;
function achse(code,wert,r){
  const war=!!haelt[code];
  const genug = wert > (war?AUS:AN) && wert >= SEKTOR*r*(war?0.8:1);
  taste(code,genug);
}
function stickSetzen(dx,dy,r){
  const max=stick.clientWidth*0.29;
  knopf.style.transform='translate('+(dx*max).toFixed(1)+'px,'+(dy*max).toFixed(1)+'px)';
  achse('ArrowLeft',  -dx, r);
  achse('ArrowRight',  dx, r);
  achse('ArrowUp',    -dy, r);
  achse('ArrowDown',   dy, r);
  /* Auch das Schleichen mit Hysterese, sonst flackert die Figur beim
     Uebergang zwischen leise und normal. */
  const schleichtSchon=!!haelt['ShiftLeft'];
  const grenze=schleichtSchon?SCHLEICH+0.06:SCHLEICH-0.06;
  taste('ShiftLeft', schleichenErlaubt() && r>TOT && r<grenze);
}
function stickLos(){
  stickId=null; stick.classList.remove('zieht');
  knopf.style.transform='';
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

/* Der Stick geht dorthin, wo der Daumen aufsetzt. Sonst passt seine feste
   Stelle immer nur zu einer Handhaltung - und die halbe linke Flaeche ist
   tot. Geklemmt wird er so, dass er nicht halb aus dem Bild ragt. */
function stickAn(x,y){
  const z=zone.getBoundingClientRect(), b=stick.offsetWidth||140;
  const lx=Math.max(b*0.45,Math.min(z.width -b*0.45,x-z.left));
  const ly=Math.max(b*0.45,Math.min(z.height-b*0.45,y-z.top));
  stick.style.left=lx+'px'; stick.style.top=ly+'px';
  stick.classList.add('zieht');
}
/* Ruhestellung, wenn keiner ihn anfasst: unten links, gut sichtbar. */
function stickHeim(){
  const z=zone.getBoundingClientRect(), b=stick.offsetWidth||140;
  stick.style.left=Math.round(Math.min(z.width*0.36,z.width-b*0.5))+'px';
  stick.style.top =Math.round(z.height-b*0.55)+'px';
}

/* Pointer statt Touch: derselbe Code bedient Finger, Stift und Maus - das
   ist nicht nur zum Testen gut, es gibt genug Geraete, die beides koennen.
   setPointerCapture haelt die Meldungen, wenn der Daumen ueber den Rand
   der Zone hinausrutscht. */
zone.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
  if(stickId!==null) return;
  stickId=e.pointerId;
  try{ zone.setPointerCapture(e.pointerId); }catch(err){}
  stickAn(e.clientX,e.clientY); stickAus(e);
});
zone.addEventListener('pointermove',function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickAus(e);
});
['pointerup','pointercancel'].forEach(function(ev){ zone.addEventListener(ev,function(e){
  if(e.pointerId!==stickId) return;
  e.preventDefault(); stickLos(); stickHeim();
}); });

/* --------------------------------------------------------------------------
   KNOEPFE
   -------------------------------------------------------------------------- */
function halte(elm,code){
  elm.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
    try{ elm.setPointerCapture(e.pointerId); }catch(err){}
    mobilVibriere(8);              // kurzer Tick, damit der Druck ankommt
    taste(code,true); });
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
    elm.addEventListener(ev,function(e){ e.preventDefault(); taste(code,false); }); });
}
halte(bAktion,'KeyE');
halte(bZwei,'Space');
halte(bBlock,'ShiftLeft');

/* Die Zusatzknoepfe wechseln ihre Taste mit dem Kontext. Deshalb haengt der
   Code in einer Zelle, die kontextPflege() neu fuellt - und beim Wechsel
   wird die alte Taste losgelassen, sonst bliebe sie haengen. */
const xCode=['',''];
bX.forEach(function(elm,i){
  elm.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
    try{ elm.setPointerCapture(e.pointerId); }catch(err){}
    if(xCode[i]) taste(xCode[i],true); });
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
    elm.addEventListener(ev,function(e){ e.preventDefault();
      if(xCode[i]) taste(xCode[i],false); }); });
});

function klick(id,fn){ const e=document.getElementById(id); if(!e) return;
  e.addEventListener('pointerdown',function(ev){ ev.preventDefault(); ev.stopPropagation(); fn(); }); }
klick('mb-pause',function(){ tipp('KeyP'); });
klick('mb-ton',  function(){ ensureAudio(); tipp('KeyM'); });
klick('mb-voll', function(){ vollbild(); });
klick('mb-handy',function(){ if(typeof handyAuf==='function') handyAuf(); });
klick('mtoggle',function(){ document.getElementById('mbar').classList.toggle('auf'); });

/* Das Levelmenue baut sich aus #levelbar - der Leiste, die am Rechner unter
   dem Bild steht und am Handy ausgeblendet ist. Damit gibt es die Liste nur
   einmal pro Datei und kann nicht auseinanderlaufen. */
const menue=document.getElementById('mmenu');
klick('mb-menu',function(){
  if(menue.classList.contains('an')){ menue.classList.remove('an'); return; }
  if(!menue.childElementCount){
    const leiste=document.getElementById('levelbar');
    if(leiste) [].forEach.call(leiste.querySelectorAll('a'),function(a){
      const k=a.cloneNode(true); k.removeAttribute('style'); menue.appendChild(k);
    });
    const zu=document.createElement('button');
    zu.className='zu'; zu.textContent='ZURUECK';
    zu.addEventListener('pointerdown',function(e){ e.preventDefault();
      menue.classList.remove('an'); });
    menue.appendChild(zu);
  }
  menue.classList.add('an');
});

/* Tippen aufs Bild bestaetigt - Startbildschirme und Zwischentexte wollen
   nur "weiter", und dafuer soll man nicht den Aktionsknopf suchen muessen. */
const schirm=document.getElementById('screen');
if(schirm) schirm.addEventListener('pointerdown',function(e){
  /* Nur Enter. Vorher gingen Enter UND E raus - beide loesen in jedem
     Level dieselbe Aktion aus, also passierte alles doppelt: das Intro
     sprang zwei Texte weiter, Zwischenbildschirme wurden uebersprungen. */
  e.preventDefault(); ensureAudio(); tipp('Enter');
});

/* --------------------------------------------------------------------------
   GESPRAECHE ANTIPPEN
   Solange geredet wird, ersetzt die Antwortliste das Bedienfeld. Sie zeigt
   genau die Auswahl, die dialog.js gerade fuehrt - inklusive der Antworten,
   die an Bedingungen haengen und deshalb manchmal fehlen.
   -------------------------------------------------------------------------- */
let talkStand='';
function talkPflege(){
  const aktiv = typeof gespraechAktiv==='function' && gespraechAktiv();
  talk.classList.toggle('an',!!aktiv);
  if(!aktiv){ talkStand=''; return; }
  const k=GESPR.knoten, w=GESPR.wahlen;
  const kennung=GESPR.name+'|'+w.length;
  if(k.zeit&&GESPR.zeitRest>0){
    talk.querySelector('.uhr').style.width=Math.round(100*GESPR.zeitRest/(GESPR.zeitGesamt||k.zeit))+'%';
  } else talk.querySelector('.uhr').style.width='0';
  if(kennung===talkStand) return;
  talkStand=kennung;
  talk.querySelector('.wer').textContent=k.wer||'';
  talk.querySelector('.was').textContent=k.text||'';
  const liste=talk.querySelector('.liste'); liste.innerHTML='';
  if(w.length){
    w.forEach(function(o,i){
      const b=document.createElement('button');
      b.className='opt'; b.textContent=o.txt;
      b.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
        GESPR.gewaehlt=i; gespraechBestaetigen(); talkPflege(); });
      liste.appendChild(b);
    });
  } else {
    const b=document.createElement('button');
    b.className='weiter'; b.textContent='WEITER';
    b.addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio();
      gespraechBestaetigen(); talkPflege(); });
    liste.appendChild(b);
  }
}

/* --------------------------------------------------------------------------
   DIE TAFEL
   Spiegelt Hinweis und Werte gross unter das Bild. Sie liest nur, was da
   ist - fehlt nacht.js, bleibt die Werte-Zeile eben leer.
   -------------------------------------------------------------------------- */
const info=document.getElementById('minfo');
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
    if(typeof ladePegel==='function')
      werte+='<span>PEGEL <b>'+Math.round(ladePegel())+'</b></span>';
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
   KONTEXT
   Ein Level darf mobilKontext() definieren:
     { aktion:'REDEN', zwei:'SPRUNG'|null, block:true|false,
       extras:[{txt:'LAMPE',code:'KeyQ'},{txt:'WERFEN',code:'KeyR'}] }
   aktion  - Aufschrift des grossen Knopfes, null blendet ihn aus
   zwei    - zweiter Knopf (Sprung oder Rolle), null blendet ihn aus
   block   - Blockknopf zeigen (nur im Kampf sinnvoll)
   extras  - bis zu zwei level-eigene Tasten. Genau dafuer ist das da: die
             Lampe und der Wurf in Level 1 waren am Handy vorher ueberhaupt
             nicht erreichbar, weil die feste Knopfleiste sie nicht kannte.
   Fehlt die Funktion, bleibt es bei der Vorgabe.
   -------------------------------------------------------------------------- */
function beschrifte(elm,txt,code){
  const zeigen=!!txt;
  elm.classList.toggle('aus',!zeigen);
  if(zeigen&&elm.textContent!==txt) elm.textContent=txt;
  /* Verschwindet ein Knopf, waehrend er gehalten wird, muss die Taste los -
     sonst laeuft die Figur ewig weiter. Ohne code ist nichts loszulassen. */
  if(!zeigen&&code) taste(code,false);
}
function kontextPflege(){
  let k={aktion:'AKTION',zwei:'SPRUNG',block:false,extras:null};
  if(typeof mobilKontext==='function'){
    try{ k=Object.assign(k,mobilKontext()||{}); }catch(e){}
  }
  window.MOBIL.kontext=k;
  beschrifte(bAktion,k.aktion,'KeyE');
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

/* Lage. Quer legt sich das Bedienfeld ueber das Bild, hoch darunter. */
function lage(){
  const quer=innerWidth>innerHeight;
  document.documentElement.classList.toggle('mobil-quer',quer);
  window.MOBIL.hoch=!quer;
  anpassen();
  /* Hochkant nutzt das Bild die volle Breite. anpassen() rechnet mit
     ganzen und viertel Stufen und landete auf einem 375er Schirm bei
     Faktor 1 - also 320 Pixel Bild und 55 Pixel schwarzem Rand. Hier
     zaehlt jeder Pixel mehr, deshalb die genaue Breite. */
  if(!quer){
    const s=innerWidth/W;
    cv.style.width=Math.round(W*s)+'px';
    cv.style.height=Math.round(H*s)+'px';
  }
  stickHeim();
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
document.addEventListener('visibilitychange',function(){
  if(!document.hidden) bildschirmWach();
});
addEventListener('pointerdown',bildschirmWach,{once:true});
addEventListener('resize',lage);
addEventListener('orientationchange',function(){ setTimeout(lage,140); });
lage();

setInterval(function(){ talkPflege(); kontextPflege(); infoPflege(); },90);
})();
