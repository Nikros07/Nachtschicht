/* ============================================================================
   NACHTSCHICHT - ENGINE: handy
   Das Handy als eigenes System.

   Die Nacht schreibt dir. Moritz fragt, wo du bleibst, Mama fragt, wann du
   heimkommst - und wird immer unruhiger, wenn keiner antwortet. Wer im Club
   eine Nummer bekommen hat, bekommt eine Nachricht. Antworten setzen Flags,
   und das Ende in Level 8 erzaehlt davon.

   Ohne das Handy aus Level 1 (Flag handyZurueck) bleibt es stumm: die
   Nachrichten laufen trotzdem ein, man sieht sie nur nicht - und am Ende
   der Nacht stehen sie alle auf einmal da.

   Waehrend das Handy offen ist, steht das Spiel still: kern.js ruft
   update() nicht auf, solange HANDY.offen gilt.

   Bedienung: T oder der Knopf HANDY oben am Handy-Bildschirm.

   Einbau: nach nacht.js laden. Braucht nacht.js (Flags, wirke).
   ========================================================================== */

window.HANDY={ offen:false };

/* Das Drehbuch der Nacht. ab = ab welchem Level (Seite) die Nachricht
   kommen kann. wenn = Bedingung wie in den Gespraechsbaeumen.
   Antworten wirken wie Auswahlen im Gespraech (tu). */
const HANDY_DREHBUCH=[
  { id:'moritz1', ab:2, von:'MORITZ', text:'Wo bleibst du? Hier laeuft schon was.',
    antworten:[ { txt:'Bin unterwegs.',               tu:{mag:['MORITZ',3]} },
                { txt:'Wurde eingesperrt. Lange Geschichte.', tu:{mag:['MORITZ',5]} } ] },
  { id:'mama1',   ab:3, von:'MAMA',   text:'Wann bist du zuhause?',
    antworten:[ { txt:'Um zwoelf. Versprochen.',      tu:{flag:'mamaAngelogen'} },
                { txt:'Wird spaet. Schlaf ruhig.',    tu:{flag:'mamaBescheid'} } ] },
  { id:'jonas1',  ab:4, von:'JONAS',  text:'Der Tuersteher sieht aus wie mein Onkel. Ich hab Angst.', wenn:{crew:'JONAS'},
    antworten:[ { txt:'Du stehst doch neben mir.',    tu:{mag:['JONAS',4]} } ] },
  { id:'mama2',   ab:5, von:'MAMA',   text:'Es ist nach Mitternacht.', wenn:{nichtFlag:'mamaBescheid'},
    antworten:[ { txt:'Sorry. Mir gehts gut.',        tu:{flag:'mamaBescheid'} },
                { txt:'Bin gleich da.',               tu:{flag:'mamaAngelogen'} } ] },
  { id:'mia1',    ab:6, von:'MIA',    text:'Lena will wissen, ob du noch lebst. Ich auch.', wenn:{flag:'schreibt_mia'},
    antworten:[ { txt:'Lebe noch. Knapp.',            tu:{mag:['MIA',6], flag:'geantwortet_mia'} },
                { txt:'hey',                          tu:{mag:['MIA',-8]} } ] },
  { id:'sophie1', ab:6, von:'SOPHIE', text:'WO SEID IHR HIN?? Ich will noch tanzen', wenn:{flag:'schreibt_sophie'},
    antworten:[ { txt:'Afterhour. Komm doch.',        tu:{mag:['SOPHIE',6], flag:'geantwortet_sophie'} } ] },
  { id:'kira1',   ab:6, von:'KIRA',   text:'Bin zuhause. Danke fuers Zuhoeren.', wenn:{flag:'schreibt_kira'},
    antworten:[ { txt:'Gern. Schlaf gut.',            tu:{mag:['KIRA',8], flag:'geantwortet_kira'} } ] },
  { id:'moritz2', ab:7, von:'MORITZ', text:'Die anderen fragen, warum wir sie nicht mitgenommen haben.', wenn:{flag:'gruppeKlein'},
    antworten:[ { txt:'Naechstes Mal alle.',          tu:{mag:['MORITZ',2]} },
                { txt:'War besser so.',               tu:{mag:['MORITZ',-4]} } ] },
  { id:'mama3',   ab:8, von:'MAMA',   text:'Ich kann nicht schlafen.', wenn:{nichtFlag:'mamaBescheid'},
    antworten:[ { txt:'Bin gleich da. Ehrlich.',      tu:{flag:'mamaBescheid'} } ] },
  { id:'marvin1', ab:8, von:'UNBEKANNT', text:'Wir sehen euch.', wenn:{flag:'marvinKennt'},
    antworten:[ { txt:'Wir euch auch.',               tu:{mut:4} } ] },
];

/* Welche Seite gerade laeuft: index = 1, levelN = N, karte = das Level
   davor plus ein halbes (die Nachrichten auf dem Weg). */
function handySeite(){
  const p=location.pathname;
  const m=p.match(/level(\d)\.html/); if(m) return +m[1];
  if(/karte\.html/.test(p)){ const n=+(new URLSearchParams(location.search).get('nach')||1); return n+1; }
  return 1;
}

function handyListe(){ if(!NACHT.nachrichten) NACHT.nachrichten=[]; return NACHT.nachrichten; }
const handyDa=()=>flag('handyZurueck');
const ungelesen=()=>handyListe().filter(n=>!n.gelesen).length;

/* Liefert die naechste faellige Nachricht aus - eine pro Aufruf, damit sie
   einzeln ankommen und nicht als Block. */
function handyZustellen(){
  const liste=handyListe(), seite=handySeite();
  for(const n of HANDY_DREHBUCH){
    if(n.ab>seite) continue;
    if(liste.some(x=>x.id===n.id)) continue;
    if(!bedingungErfuellt(n.wenn)) continue;
    liste.push({ id:n.id, gelesen:false, antwort:null });
    speichereStand();
    if(handyDa()){
      handyToast('NEUE NACHRICHT - '+n.von);
      if(typeof mobilVibriere==='function') mobilVibriere([0,40,60,40]);
      if(typeof piep==='function'){ try{ piep(1320,.05,'sine',.03); setTimeout(()=>piep(1760,.06,'sine',.03),90); }catch(e){} }
    }
    return true;
  }
  return false;
}

/* ---------------------------------------------------------------- DOM --- */
const _hs=document.createElement('style');
_hs.textContent=[
  '#hknopf { position:absolute; top:6px; right:84px; z-index:7; background:rgba(20,16,34,.8);',
  '  border:1px solid #2a2246; border-radius:5px; color:#8d86a8; font:700 9px monospace;',
  '  letter-spacing:1px; padding:4px 7px; cursor:pointer; }',
  '#hknopf b { color:#ff3d8b; }',
  'html.touch #hknopf { display:none; }',
  '#htoast { position:fixed; left:50%; top:10px; transform:translate(-50%,-140%); z-index:60;',
  '  background:#120e22; border:1px solid #ff3d8b; border-radius:8px; color:#f2f0ff;',
  '  font:700 11px/1 monospace; letter-spacing:1px; padding:9px 14px; transition:transform .25s;',
  '  pointer-events:none; }',
  '#htoast.an { transform:translate(-50%,0); }',
  '#hfenster { position:fixed; inset:0; z-index:50; display:none; align-items:center;',
  '  justify-content:center; background:rgba(4,3,10,.78); }',
  '#hfenster.an { display:flex; }',
  '#hgeraet { width:min(340px,92vw); height:min(560px,86vh); background:#0b0916;',
  '  border:2px solid #2a2246; border-radius:22px; box-shadow:0 0 40px rgba(255,61,139,.15);',
  '  display:flex; flex-direction:column; overflow:hidden; font-family:monospace; }',
  '#hkopf { padding:12px 14px 8px; color:#8d86a8; font:700 10px/1 monospace; letter-spacing:2px;',
  '  display:flex; justify-content:space-between; border-bottom:1px solid #1d1830; }',
  '#hliste { flex:1; overflow:auto; padding:10px; display:flex; flex-direction:column; gap:10px; }',
  '.hmsg { background:#161230; border-radius:10px; padding:9px 11px; color:#f2f0ff;',
  '  font:400 12px/1.4 monospace; }',
  '.hmsg .v { color:#42d9ff; font:700 10px/1 monospace; letter-spacing:1px; margin-bottom:5px; }',
  '.hmsg.neu { border-left:3px solid #ff3d8b; }',
  '.hmsg .ich { margin-top:7px; color:#ffd447; text-align:right; }',
  '.hmsg button { display:block; width:100%; margin-top:6px; text-align:left;',
  '  background:rgba(255,255,255,.05); border:1px solid #2a2246; border-radius:7px;',
  '  color:#cfc8e6; font:400 12px/1.3 monospace; padding:8px 9px; cursor:pointer; }',
  '.hmsg button:hover { border-color:#ffd447; }',
  '#hzu { margin:10px; background:rgba(255,212,71,.1); border:1px solid #ffd447; color:#ffd447;',
  '  border-radius:8px; font:700 11px/1 monospace; letter-spacing:2px; padding:12px; cursor:pointer; }',
  '#hleer { color:#4a4363; font:400 12px/1.5 monospace; text-align:center; margin-top:40px; }'
].join('\n');
document.head.appendChild(_hs);

const _fenster=document.createElement('div'); _fenster.id='hfenster';
_fenster.innerHTML='<div id="hgeraet"><div id="hkopf"><span>HANDY_DREHBUCH</span><span id="huhr"></span></div>'+
  '<div id="hliste"></div><button id="hzu">WEGLEGEN</button></div>';
document.body.appendChild(_fenster);
const _toast=document.createElement('div'); _toast.id='htoast'; document.body.appendChild(_toast);
const _knopf=document.createElement('button'); _knopf.id='hknopf'; _knopf.textContent='T HANDY';
(document.getElementById('cab')||document.body).appendChild(_knopf);

let _toastT=null;
function handyToast(t){
  _toast.textContent=t+(IS_TOUCH?'':'   T ZUM LESEN');
  _toast.classList.add('an'); clearTimeout(_toastT);
  _toastT=setTimeout(()=>_toast.classList.remove('an'),2600);
  handyKnopf();
}
function handyKnopf(){
  const n=ungelesen();
  _knopf.innerHTML='T HANDY'+(handyDa()&&n?' <b>'+n+'</b>':'');
  const m=document.getElementById('mb-handy');
  if(m) m.textContent='HANDY'+(handyDa()&&n?' '+n:'');
}

function handyZeichnen(){
  const l=document.getElementById('hliste'); l.innerHTML='';
  if(!handyDa()){
    l.innerHTML='<div id="hleer">DEIN HANDY LIEGT IM LEHRERZIMMER.<br><br>'+
      handyListe().length+' HANDY_DREHBUCH, DIE DU NICHT SIEHST.</div>'; return;
  }
  const liste=handyListe();
  if(!liste.length){ l.innerHTML='<div id="hleer">KEINE HANDY_DREHBUCH.<br>NOCH NICHT.</div>'; return; }
  for(const e of liste.slice().reverse()){
    const n=HANDY_DREHBUCH.find(x=>x.id===e.id); if(!n) continue;
    const d=document.createElement('div'); d.className='hmsg'+(e.gelesen?'':' neu');
    d.innerHTML='<div class="v"></div><div class="t"></div>';
    d.querySelector('.v').textContent=n.von; d.querySelector('.t').textContent=n.text;
    if(e.antwort!=null){
      const a=document.createElement('div'); a.className='ich';
      a.textContent=n.antworten[e.antwort].txt; d.appendChild(a);
    } else if(n.antworten){
      n.antworten.forEach((a,i)=>{
        const b=document.createElement('button'); b.textContent=a.txt;
        b.addEventListener('click',ev=>{ ev.preventDefault(); e.antwort=i; wirke(a.tu); speichereStand(); handyZeichnen(); });
        d.appendChild(b);
      });
    }
    l.appendChild(d);
  }
}

function handyAuf(){
  if(HANDY.offen){ handyZu(); return; }
  HANDY.offen=true; _fenster.classList.add('an');
  handyZeichnen();
  /* Gelesen ist erst, was man gesehen hat */
  if(handyDa()){ handyListe().forEach(n=>n.gelesen=true); speichereStand(); }
  handyKnopf();
  const u=document.getElementById('huhr'); if(u) u.textContent=typeof S!=='undefined'&&S&&S.minute?
    (Math.floor(S.minute/60)%24)+':'+String(Math.floor(S.minute%60)).padStart(2,'0'):'';
}
function handyZu(){ HANDY.offen=false; _fenster.classList.remove('an'); }

_knopf.addEventListener('click',e=>{ e.preventDefault(); handyAuf(); });
document.getElementById('hzu').addEventListener('click',e=>{ e.preventDefault(); handyZu(); });
_fenster.addEventListener('click',e=>{ if(e.target===_fenster) handyZu(); });

/* Tasten: T oeffnet, T/Escape schliesst. Solange es offen ist, geht keine
   Taste ans Level - sonst schlaegt man im Hintergrund zu. Registriert in
   der Capture-Phase auf window, also vor den Leveln. */
addEventListener('keydown',e=>{
  if(e.code==='KeyT'){ e.preventDefault(); e.stopImmediatePropagation(); handyAuf(); return; }
  if(HANDY.offen){
    if(e.code==='Escape') handyZu();
    e.stopImmediatePropagation();
  }
},true);

/* Zustellung: die erste kurz nach dem Start, dann alle 25 Sekunden eine. */
setTimeout(function zustellen(){
  if(!document.hidden&&!HANDY.offen) handyZustellen();
  setTimeout(zustellen,25000);
},6000);
handyKnopf();
