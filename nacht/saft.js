/* ============================================================================
   NACHTSCHICHT - ENGINE: saft
   Das Spielgefuehl: Hitstop, Zeitlupe, Bildschirmwackeln, Teilchen, Popups,
   Blitze und roter Randschaden. Jede Sekunde soll antworten.

   Warum eine eigene Datei: Jedes Level baute bisher sein eigenes Wackeln und
   seine eigenen Funken. Hier liegt das einmal, mit festen Pools (keine
   Allokation je Bild). Blitze und Wackeln gehen nur ueber FX (komfort.js) -
   nur dort greift der Flackerschutz.

   Oeffentliche API (x und y in Bildschirm-Pixeln, nicht in Welt-Koordinaten):

     SAFT.takt(dt) -> dt'       Jedes Bild zuerst rufen (vor update). Liefert die Spielzeit:
                                0 im Hitstop, dt*faktor in Zeitlupe, sonst dt. Die Effekte
                                laufen in echter Zeit, auch wenn das Spiel steht.
     SAFT.stop(sek)             Hitstop. Mehrere Stopps addieren sich, gedeckelt auf stopMax.
     SAFT.zeitlupe(faktor,sek)  Spielzeit mal faktor (0..1) fuer sek Sekunden.
     SAFT.trauma(m)             0..1 addieren (max 1). Wackeln = trauma^2 * wackelPx, Abbau 1.2/s.
     SAFT.versatz() -> {x,y}    Ganzzahlig, {0,0} ohne Wackeln. Dasselbe Objekt bei jedem Aufruf:
                                sofort auslesen, nicht speichern.
     SAFT.teilchen(art,x,y,n,richtung)
                                art: staub, funken, konfetti, schweiss, glas, herz, stern, rauch.
                                richtung: 1 = nach rechts, -1 = nach links, 0 oder weggelassen = rundum.
                                Hoechstens 240 Teilchen gleichzeitig. Ist der Pool voll, ersetzt das
                                neue Teilchen das am fast verbrauchten.
     SAFT.popup(txt,x,y,farbe)  Text steigt 14 px in 0.9 s, mit dunkler Kontur.
                                x,y = Mitte, Oberkante. Hoechstens 8 gleichzeitig.
     SAFT.blitz(farbe,alpha,dauer) -> true|false
                                Vollbild-Aufheller, Alpha durch FX.blitz gedaempft. Hoechstens 3 je
                                Sekunde (mit Flackerschutz 2). false = nicht gezeigt.
     SAFT.rand(farbe,alpha)     Vignette am Bildrand, klingt in 0.4 s ab (ebenfalls durch FX.blitz).
     SAFT.zeichne()             Von kern.js nach draw(): Teilchen, Popups, Blitz, Rand.
     SAFT.leeren()              Alles aus (beim Levelwechsel).

   Rezepte (das rufen die Level auf). Wucht ist 0..1:
     SAFT.treffer(x,y,richtung,wucht)  Hitstop, Wackeln, Funken, Vibration
     SAFT.landung(x,y,wucht)           Staub
     SAFT.fund(x,y,txt)                Konfetti, Sterne, schwacher goldener Blitz, Popup, Stinger 'fund'
     SAFT.schaden(wucht)               roter Rand, Wackeln, Vibration
     SAFT.erfolg(x,y,txt)              Sterne und Popup, ohne Blitz

   Fehlt ein Haken (MUSIK, mobilVibriere, FX, ctx, text), passiert dort nichts - ohne Ausnahme.
   Ohne FX gibt es keine Blitze, keinen Rand und kein Wackeln.

   Klassisches Script, kein ES-Modul. Canvas-Text: text() macht Grossbuchstaben.
   ========================================================================== */

/* Stellschrauben. Hitstop und Blitzrate sind Sicherheitsgrenzen - nicht ohne Grund erhoehen. */
const SAFT_TUNE={
  stopMax:0.15,       // laengster Hitstop in Sekunden, auch wenn sich mehrere addieren
  wackelPx:5,         // Ausschlag des Wackelns bei trauma 1, vor FX.wackel
  wackelAbbau:1.2,    // trauma pro Sekunde
  blitzProSek:3,      // hoechstens so viele Blitzbeginne je Sekunde (WCAG 2.3.1); FX.hz kann weniger
  blitzDauer:0.12,    // Standarddauer eines Blitzes in Sekunden
  teilchenMax:240,    // Obergrenze gleichzeitiger Teilchen (feste Pool-Groesse)
  popupMax:8,         // gleichzeitige Popups
  popupSek:0.9,       // Lebensdauer eines Popups
  popupSteig:14,      // Pixel, um die ein Popup aufsteigt
  randSek:0.4,        // Ausklingen der Randvignette
  kontur:'#100818',   // Farbe der Kontur um Popups
};

const SAFT=(()=>{
  const T=SAFT_TUNE;

  /* Teilchen-Arten. Farbe wird zufaellig aus farben gewaehlt. g = Schwerkraft in px/s^2
     (negativ = steigt auf), leben = Lebensdauer-Spanne in s, tempo = Startgeschwindigkeit in px/s,
     br = Bremse (Anteil Geschwindigkeit, der je Sekunde verloren geht), gr = Kantenlaenge in Pixeln.
     Keine Transparenz je Teilchen: Pixel-Look, und jedes fillRect ist billig. */
  const ARTEN={
    staub:   {farben:['#8c8c96','#b4b4be'],                                  g:40,   leben:[.35,.55], tempo:[20,60],   br:2,   gr:1},
    funken:  {farben:['#ffe84d','#ffffff'],                                  g:260,  leben:[.18,.30], tempo:[120,230], br:.6,  gr:1},
    konfetti:{farben:['#ff4d6d','#ffd23f','#3ddc84','#42d9ff','#b57bff','#ff9e4d'], g:140, leben:[.9,1.3], tempo:[60,160], br:2.2, gr:2},
    schweiss:{farben:['#4fb3ff','#9ee0ff'],                                  g:380,  leben:[.4,.6],  tempo:[60,120],  br:.3,  gr:1},
    glas:    {farben:['#bfefff','#8fdcff'],                                  g:420,  leben:[.5,.8],  tempo:[90,200],  br:.2,  gr:2},
    herz:    {farben:['#ff7eb6','#ff9ecb'],                                  g:-70,  leben:[.9,1.2], tempo:[30,70],   br:1.2, gr:2},
    stern:   {farben:['#ffd23f','#ffe07a'],                                  g:0,    leben:[.5,.7],  tempo:[60,140],  br:3,   gr:2},
    rauch:   {farben:['#3c3c48','#4a4a58'],                                  g:-45,  leben:[.9,1.2], tempo:[10,30],   br:1.5, gr:2},
  };

  /* Randvignette aus drei Streifen: [Dicke in px, Anteil der Alpha]. Der aeussere ist am staerksten,
     so entsteht eine weiche Kante ohne Verlauf (ein Verlauf wuerde jedes Bild neu angelegt). */
  const RAND_SCHICHTEN=[[4,1],[10,.55],[18,.25]];

  /* Feste Pools: keine Allokation je Bild. */
  const TEIL=[];
  for(let i=0;i<T.teilchenMax;i++) TEIL.push({an:false,x:0,y:0,vx:0,vy:0,leben:0,f:'#ffffff',gr:1,g:0,br:0});
  const POP=[];
  for(let i=0;i<T.popupMax;i++) POP.push({an:false,txt:'',w:0,x:0,y:0,f:'#ffffff',t:0});

  /* Zustand. Alles Zeitliche zaehlt in echter Zeit (dt aus takt). */
  let stopRest=0;                        // Hitstop-Rest in Sekunden
  let slowF=1, slowRest=0;               // Zeitlupe
  let tr=0;                              // Trauma 0..1
  let wz=0;                              // Phase des Wackelns: glatt per Sinus, kein Zufall je Bild
  let blitzRoh=0, blitzF='#ffffff', blitzDau=T.blitzDauer, blitzRest=0;
  const blitzT=[-1e9,-1e9,-1e9];         // die letzten drei Blitzbeginne (Ringpuffer)
  let blitzI=0;
  let randRoh=0, randF='#000000', randRest=0;
  let zeit=0;                            // echte Zeit seit dem Start, fuer den Blitz-Zaehler
  const VERS={x:0,y:0};                  // wird bei jedem versatz() wiederverwendet

  /* Hilfen. Jede Eingabe wird geprueft: kein NaN in die Physik, keine Ausnahme. */
  const zahl=(v,d)=>(typeof v==='number'&&isFinite(v))?v:d;
  const klein=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const hatText=v=>v!==undefined&&v!==null&&String(v)!=='';
  /* FX ist die einzige Stelle fuer Blitze und Wackeln (Flackerschutz, WCAG 2.3.1). Fehlt FX,
     bleibt der Bildschirm still - das ist die sichere Seite. */
  const hatFX=()=>typeof FX!=='undefined'&&!!FX&&typeof FX.blitz==='function'&&typeof FX.hz==='function'&&typeof FX.wackel==='function';
  const fxA=a=>hatFX()?FX.blitz(a):0;
  const jetzt=()=>(typeof performance!=='undefined'&&performance&&typeof performance.now==='function')?performance.now()/1000:zeit;
  const bildBreite=()=>typeof W==='number'?W:320;
  const bildHoehe=()=>typeof H==='number'?H:180;
  /* Vibration und Musik sind optional: fehlen sie, passiert dort nichts. */
  function vibriere(muster){ try{ if(typeof mobilVibriere==='function') mobilVibriere(muster); }catch(e){} }
  function musik(name){ try{ if(typeof MUSIK!=='undefined'&&MUSIK&&typeof MUSIK.stinger==='function') MUSIK.stinger(name); }catch(e){} }

  /* ---- Spielzeit ---- */

  /* Jedes Bild zuerst. Der Hitstop friert die Spielzeit ein, die Effekte bewegen sich weiter. */
  function takt(dt){
    const d=klein(zahl(dt,0),0,.25);     // nach einer Pause kein Riesensprung
    zeit+=d;
    if(tr>0) tr=Math.max(0,tr-T.wackelAbbau*d);
    wz+=d*30;
    if(randRest>0) randRest=Math.max(0,randRest-d);
    if(blitzRest>0) blitzRest=Math.max(0,blitzRest-d);
    for(let i=0;i<TEIL.length;i++){
      const p=TEIL[i]; if(!p.an) continue;
      p.leben-=d; if(p.leben<=0){ p.an=false; continue; }
      p.vy+=p.g*d;
      const b=Math.max(0,1-p.br*d); p.vx*=b; p.vy*=b;
      p.x+=p.vx*d; p.y+=p.vy*d;
    }
    for(let i=0;i<POP.length;i++){
      const p=POP[i]; if(!p.an) continue;
      p.t+=d; if(p.t>=T.popupSek) p.an=false;
    }
    /* Der Hitstop schlaegt die Zeitlupe. 1e-9 statt 0, damit Rundungsreste keinen Bildrest erzeugen. */
    const imStopp=stopRest>1e-9;
    stopRest=imStopp?Math.max(0,stopRest-d):0;
    if(imStopp) return 0;
    if(slowRest>0){ slowRest=Math.max(0,slowRest-d); return d*slowF; }
    return d;
  }

  /* Hitstop: addiert sich, gedeckelt. So bleibt auch eine Trefferserie kurz lesbar. */
  function stop(sek){ stopRest=Math.min(T.stopMax,stopRest+Math.max(0,zahl(sek,0))); }

  /* Zeitlupe: die staerkste gewinnt, die laengste zaehlt. */
  function zeitlupe(faktor,sek){
    const f=klein(zahl(faktor,1),0,1), s=Math.max(0,zahl(sek,0));
    if(slowRest<=0||f<slowF) slowF=f;
    slowRest=Math.max(slowRest,s);
  }

  /* ---- Wackeln ---- */

  function trauma(m){ tr=klein(tr+Math.max(0,zahl(m,0)),0,1); }

  /* Quadrat, damit leichte Treffer kaum wackeln und schwere deutlich. Zwei Sinus-Wellen je Achse
     statt Zufall: der Wackel-Ausschlag ist glatt und ohne Ruckeln. */
  function versatz(){
    const px=hatFX()?FX.wackel(T.wackelPx*tr*tr):0;
    if(!(px>0)){ VERS.x=0; VERS.y=0; return VERS; }
    VERS.x=Math.round(px*(Math.sin(wz*1.7)+.5*Math.sin(wz*3.1+1))/1.5);
    VERS.y=Math.round(px*(Math.sin(wz*2.3+.7)+.5*Math.sin(wz*4.3))/1.5);
    return VERS;
  }

  /* ---- Teilchen ---- */

  /* Erster freier Platz. Ist der Pool voll, der am fast verbrauchte: so bleibt die Obergrenze hart,
     und die neue Spritzer-Welle sieht trotzdem vollstaendig aus. */
  function freierPlatz(){
    let bestI=0, bestL=Infinity;
    for(let i=0;i<TEIL.length;i++){
      const p=TEIL[i]; if(!p.an) return i;
      if(p.leben<bestL){ bestL=p.leben; bestI=i; }
    }
    return bestI;
  }

  function teilchen(art,x,y,n,richtung){
    const a=Object.prototype.hasOwnProperty.call(ARTEN,art)?ARTEN[art]:null;   // "constructor" ist kein Teilchen
    if(!a) return;
    const x0=zahl(x,0), y0=zahl(y,0);
    const m=klein(Math.floor(zahl(n,0)),0,T.teilchenMax);
    const r=zahl(richtung,0);
    for(let i=0;i<m;i++){
      /* Blickrichtung: leicht nach oben gefaechert (-0.5 rad), damit der Spritzer nicht flach liegt.
         Ohne Richtung rundum. */
      let w;
      if(r>0) w=-.5+(Math.random()-.5)*1.6;
      else if(r<0) w=Math.PI+.5+(Math.random()-.5)*1.6;
      else w=Math.random()*Math.PI*2;
      const v=a.tempo[0]+Math.random()*(a.tempo[1]-a.tempo[0]);
      const p=TEIL[freierPlatz()];
      p.an=true; p.x=x0; p.y=y0;
      p.vx=Math.cos(w)*v; p.vy=Math.sin(w)*v;
      p.leben=a.leben[0]+Math.random()*(a.leben[1]-a.leben[0]);
      p.f=a.farben[(Math.random()*a.farben.length)|0];
      p.gr=a.gr; p.g=a.g; p.br=a.br;
    }
  }

  /* ---- Popups ---- */

  /* Text steigt auf: schnell am Anfang, dann langsamer (ease-out). Die letzten 20 % verblassen. */
  function popup(txt,x,y,farbe){
    if(!hatText(txt)) return;
    let p=null;
    for(let i=0;i<POP.length;i++) if(!POP[i].an){ p=POP[i]; break; }
    if(!p){ p=POP[0]; for(let i=1;i<POP.length;i++) if(POP[i].t>p.t) p=POP[i]; }   // voll: der aelteste
    const s=String(txt).toUpperCase();
    p.an=true; p.txt=s;
    p.w=typeof textW==='function'?textW(s,1):s.length*4;
    p.x=zahl(x,0); p.y=zahl(y,0);
    p.f=hatText(farbe)?String(farbe):'#ffffff';
    p.t=0;
  }

  /* ---- Blitz und Rand ---- */

  /* Hoechstens blitzProSek Blitzbeginne je Sekunde. Der lim-letzte Beginn darf nicht juenger als
     eine Sekunde sein, sonst wuerde ein weiterer Blitz das Limit brechen. Gibt true zurueck,
     wenn der Blitz gezeigt wird. */
  function blitz(farbe,alpha,dauer){
    if(!hatFX()) return false;
    const lim=klein(Math.floor(zahl(FX.hz(T.blitzProSek),1)),1,T.blitzProSek);   // 3, mit Flackerschutz 2
    /* Gezaehlt wird mit der echten Uhr (pro Sekunde wirklich, auch wenn ein Bild hakt oder das Spiel
       steht). Ohne performance faellt es auf die Takt-Zeit zurueck. */
    const t=jetzt();
    const alt=blitzT[(blitzI-lim+3)%3];
    if(t-alt<1) return false;
    blitzT[blitzI]=t; blitzI=(blitzI+1)%3;
    blitzRoh=klein(zahl(alpha,.3),0,1);
    blitzDau=klein(zahl(dauer,T.blitzDauer),.02,1);
    blitzRest=blitzDau;
    blitzF=hatText(farbe)?String(farbe):'#ffffff';
    return true;
  }

  /* Der letzte Rand gewinnt. Die Alpha laeuft ueber FX.blitz, damit der Flackerschutz auch hier greift. */
  function rand(farbe,alpha){
    randRoh=klein(zahl(alpha,.3),0,1);
    randF=hatText(farbe)?String(farbe):'#000000';
    randRest=T.randSek;
  }

  /* ---- Zeichnen (Bildschirmkoordinaten, ohne Kamera) ---- */

  function zeichneTeilchen(){
    for(let i=0;i<TEIL.length;i++){
      const p=TEIL[i]; if(!p.an) continue;
      ctx.fillStyle=p.f;
      ctx.fillRect(Math.round(p.x),Math.round(p.y),p.gr,p.gr);
    }
  }

  function zeichnePopups(){
    for(let i=0;i<POP.length;i++){
      const p=POP[i]; if(!p.an) continue;
      const q=Math.min(1,p.t/T.popupSek);
      const hoch=Math.round(T.popupSteig*(1-(1-q)*(1-q)));
      const x=Math.round(p.x-p.w/2), y=Math.round(p.y-hoch);
      ctx.globalAlpha=q>.8?Math.max(0,(1-q)/.2):1;
      /* Dunkle Kontur: vier Kopien, je 1 px versetzt, dann der Text obendrauf. Lesbar auf jedem Hintergrund. */
      text(p.txt,x-1,y,T.kontur); text(p.txt,x+1,y,T.kontur);
      text(p.txt,x,y-1,T.kontur); text(p.txt,x,y+1,T.kontur);
      text(p.txt,x,y,p.f);
    }
    ctx.globalAlpha=1;
  }

  function zeichneBlitz(){
    if(blitzRest<=0) return;
    const a=fxA(blitzRoh)*(blitzRest/blitzDau);   // linear ausblenden
    if(!(a>0)) return;
    ctx.globalAlpha=a; ctx.fillStyle=blitzF;
    ctx.fillRect(0,0,bildBreite(),bildHoehe());
    ctx.globalAlpha=1;
  }

  function zeichneRand(){
    if(randRest<=0) return;
    const a=fxA(randRoh)*(randRest/T.randSek);
    if(!(a>0)) return;
    const w=bildBreite(), h=bildHoehe();
    ctx.fillStyle=randF;
    for(let s=0;s<RAND_SCHICHTEN.length;s++){
      const d=RAND_SCHICHTEN[s][0], f=RAND_SCHICHTEN[s][1];
      ctx.globalAlpha=klein(a*f,0,1);
      ctx.fillRect(0,0,w,d);
      ctx.fillRect(0,h-d,w,d);
      ctx.fillRect(0,d,d,h-2*d);
      ctx.fillRect(w-d,d,d,h-2*d);
    }
    ctx.globalAlpha=1;
  }

  /* Von kern.js nach draw(). Reihenfolge: Teilchen, Popups, Blitz, Rand (der Rand liegt oben). */
  function zeichne(){
    if(typeof ctx==='undefined'||!ctx) return;
    zeichneTeilchen();
    if(typeof text==='function') zeichnePopups();
    zeichneBlitz();
    zeichneRand();
  }

  function leeren(){
    stopRest=0; slowRest=0; slowF=1; tr=0; wz=0;
    blitzRest=0; blitzT.fill(-1e9); blitzI=0;
    randRest=0;
    for(let i=0;i<TEIL.length;i++) TEIL[i].an=false;
    for(let i=0;i<POP.length;i++) POP[i].an=false;
  }

  /* ---- Rezepte: das, was die Level aufrufen ---- */

  function treffer(x,y,richtung,wucht){
    const w=klein(zahl(wucht,.5),0,1);
    stop(.04+.06*w);
    trauma(.25+.35*w);
    teilchen('funken',x,y,Math.round(6+10*w),richtung);
    vibriere([Math.round(18+22*w)]);
  }

  function landung(x,y,wucht){
    const w=klein(zahl(wucht,.5),0,1);
    teilchen('staub',x,y,Math.round(4+8*w),0);
  }

  /* Der Fund ist der groesste Moment ohne Schaden: Konfetti, Sterne, ein schwacher goldener Schimmer. */
  function fund(x,y,txt){
    teilchen('konfetti',x,y,14,0);
    teilchen('stern',x,y,6,0);
    blitz('#ffd23f',.15,.25);
    if(hatText(txt)) popup(txt,x,y,'#ffd23f');
    musik('fund');
  }

  function schaden(wucht){
    const w=klein(zahl(wucht,.5),0,1);
    trauma(.3+.3*w);
    rand('#e0202e',.35+.35*w);
    vibriere([Math.round(30+50*w)]);
  }

  /* Ein kleiner Erfolg: Sterne und Text, bewusst ohne Blitz. */
  function erfolg(x,y,txt){
    teilchen('stern',x,y,5,0);
    if(hatText(txt)) popup(txt,x,y,'#7dff9b');
  }

  return {
    takt, stop, zeitlupe, trauma, versatz, teilchen, popup, blitz, rand,
    zeichne, leeren,
    treffer, landung, fund, schaden, erfolg,
  };
})();

if(typeof window!=='undefined') window.SAFT=SAFT;
