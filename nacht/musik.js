/* ============================================================================
   NACHTSCHICHT - ENGINE: musik
   Der Sequencer. Spielt Songs aus SONGS (nacht/songs.js) Takt fuer Takt, nur
   mit Oszillatoren, Rauschen und Huellkurven - keine Audiodateien.

   Warum vorausplanen: Browser verzoegern Timer (Hintergrund-Tab, Last). Der
   Planer legt die Noten im Audio-Takt (AC.currentTime) rund 0,12 s im Voraus
   fest und wird alle 25 ms nachgefuellt. Hoert er auf (Tab weg), liegt der
   naechste Schritt in der Vergangenheit. Dann beginnt er bei "jetzt" neu,
   statt das Verpasste nachzuholen - sonst kaeme ein Notenstau: dutzende Noten
   auf einmal.

   Oeffentliche API:
     MUSIK.spiele(id)        Song aus SONGS[id]. Gleicher Song wie jetzt: nichts tun
                             (idempotent, wird jedes Bild gerufen). Anderer Song:
                             Wechsel an der naechsten Taktgrenze.
     MUSIK.stop()            alles aus, Planer aus
     MUSIK.spannung(w)       w 0..1 -> Ebene = min(n-1, floor(w*n)); Wechsel an der Taktgrenze
     MUSIK.abschnitt(name)   an der naechsten Taktgrenze in Abschnitt name; danach laeuft
                             song.folge weiter. Steht name nicht in der Folge, wird er in
                             Schleife gespielt, bis abschnitt(null).
     MUSIK.tempo(bpm)        ab der naechsten Taktgrenze; tempo(null) = Song-Tempo
     MUSIK.stinger(name)     'fund','sieg','fail','rang','alarm','combo': 3-6 Toene auf die
                             naechste Achtel, die Musik waehrenddessen geduckt
     MUSIK.daempfen(an)      Tiefpass 900 Hz und leiser (Pause, Handy, Kapitelkarte)
     MUSIK.takt()            Planer. Laeuft per setInterval alle 25 ms, kern.js ruft ihn zusaetzlich.
                             Darf beliebig oft gerufen werden.
     MUSIK.schlag()          {bpm, schritt 0..15, takt, bisSchlag, seitSchlag} fuer Tanzen im
                             Takt. null ohne Audio oder ohne Song. Immer dasselbe Objekt:
                             Werte gleich lesen, nicht speichern.
     MUSIK.aktuell()         {song, abschnitt, ebene}

   Fehlertolerant: fehlt AC (aus ton.js) oder SONGS, passiert nichts und es gibt
   keine Ausnahme. Bei muted rueckt die Zeit weiter, ohne zu spielen.
   Hoechstens MUSIK_TUNE.maxKnoten Klangknoten gleichzeitig (Oszillator, Quelle,
   Huellkurve, Filter zusammen); was darueber waere, entfaellt.

   Klassisches Script, kein ES-Modul (wie ton.js). Liest AC und muted aus ton.js.
   ========================================================================== */

const MUSIK_TUNE={
  laut:0.5,              // Gesamtlautstaerke des Musikbusses
  vorlauf:0.12,          // so viele Sekunden plant der Planer im Voraus ein
  nachlauf:0.05,         // nach einem Notenstau beginnt der Planer so viele Sekunden spaeter
  maxKnoten:32,          // hoechstens so viele gleichzeitige Klangknoten
  duckAnteil:0.4,        // waehrend eines Stingers ist die Musik auf diesen Anteil geduckt
  duckNach:0.3,          // Sekunden, bis die Musik nach dem Stinger wieder voll ist
  stingerLaut:0.14,      // Spitzenlautstaerke der Stinger-Toene
  daempfHz:900,          // Grenzfrequenz beim Daempfen
  daempfLaut:0.5,        // Lautstaerke-Faktor beim Daempfen
  kickLaut:0.7,          // Schlagzeug-Spitzen (werden mit song.laut.drums multipliziert)
  snareLaut:0.35,
  hatLaut:0.12,
  hatOffenLaut:0.14,
  tempoMin:40,
  tempoMax:220,
  standardLaut:{bass:0.20, arp:0.06, lead:0.10, drums:1},
  standardKlang:{bass:'triangle', arp:'puls12', lead:'puls50'},
};

/* Stil-Tabellen. Jede Zeile hat 16 Zeichen = 16 Sechzehntel eines Takts:
   'x' Schlag, 'o' leiser Schlag, '.' nichts. Die Funktion t liefert den Ton
   (Halbton-Abstand zur Basis, a = Akkord). Die Dauer einer Note ist der Abstand
   bis zum naechsten Schlag, so klingt jede Note bis zur naechsten. */
const MUSIK_STIL_BASS={
  halbe:    {p:'x'+'.'.repeat(7)+'x'+'.'.repeat(7), t:(s,a)=>0},
  puls:     {p:'x.'.repeat(8),                     t:(s,a)=>0},
  achtel:   {p:'x.'.repeat(8),                     t:(s,a)=>((s>>1)&1)?12:0},
  galopp:   {p:'x.xx'.repeat(4),                   t:(s,a)=>0},
  walk:     {p:'x...'.repeat(4),                   t:(s,a)=>[0,a.terz,a.quinte,a.sext][s>>2]},
  drohn:    {p:'x'+'.'.repeat(15),                 t:(s,a)=>0},
  schleich: {p:'x.....x...x.....',                 t:(s,a)=>s===6?a.quinte:0},
};

/* Schlagzeug: k = Kick, s = Snare, h = Hi-Hat ('O' offen, 120 ms; sonst kurz). */
const MUSIK_STIL_DRUMS={
  club:    {k:'x...'.repeat(4),    s:'....x.......x...', h:'..O.'.repeat(4)},
  rock:    {k:'x.......x.......',   s:'....x.......x...', h:'x.'.repeat(8)},
  schleich:{k:'x'+'.'.repeat(15),   s:'.'.repeat(16),     h:'o.'.repeat(8)},
  sprint:  {k:'x.'.repeat(8),       s:'....x.......x...', h:'xo'.repeat(8)},
  swing:   {k:'x.......x.......',   s:'.'.repeat(16),     h:'x.o.'.repeat(4)},
  traum:   {k:'x'+'.'.repeat(15),   s:'.'.repeat(16),     h:'......x.......x.'},
  aus:     {k:'.'.repeat(16),       s:'.'.repeat(16),     h:'.'.repeat(16)},
};

/* Arpeggio: t liefert den Ton (Halbton ueber der Mittellage). 'akkord' spielt
   alle drei Akkordtoene gleichzeitig, auf 1 und 9. */
const MUSIK_STIL_ARP={
  auf:     {p:'x'.repeat(16), t:(s,a)=>[0,a.terz,a.quinte,a.vierte][s&3]},
  ab:      {p:'x'.repeat(16), t:(s,a)=>[a.vierte,a.quinte,a.terz,0][s&3]},
  wechsel: {p:'x'.repeat(16), t:(s,a)=>(s&1)?a.quinte:0},
  aus:     {p:'.'.repeat(16), t:(s,a)=>0},
  akkord:  {p:'x'+'.'.repeat(7)+'x'+'.'.repeat(7), akkord:true},
};

/* Stinger: k = Klang, noten = [Halbton-Note (MIDI), Dauer in Achteln]. */
const MUSIK_STINGER={
  fund:  {k:'puls25',   noten:[[72,1],[76,1],[79,1],[84,2]]},
  sieg:  {k:'puls50',   noten:[[67,1],[71,1],[74,1],[79,1],[83,1],[86,2]]},
  fail:  {k:'triangle', noten:[[67,2],[66,2],[64,3]]},
  rang:  {k:'puls25',   noten:[[60,1],[64,1],[67,1],[72,2]]},
  alarm: {k:'square',   noten:[[81,1],[78,1],[81,1],[78,1]]},
  combo: {k:'puls12',   noten:[[72,1],[74,1],[76,2]]},
};

const MUSIK=(()=>{
  const SCHRITTE=16, RING=8;
  const WURZEL={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const AKK={};   // Akkord-Cache: Name -> {w, terz, quinte, sext, vierte}

  const M={
    laeuft:false, song:null, songId:null, wunsch:null,
    liste:[['bass','drums','arp','lead']],        // Ebenen des Songs (Instrumente je Ebene)
    abschnitt:null, sec:null, folgeIdx:-1, schleife:false, abTakt:0,
    akkord:null, ebene:0, wSpannung:0, wTempo:undefined, tempoOver:null,
    wSongId:undefined, wAbschnitt:undefined,      // undefined = kein Wunsch offen
    bpm:120, sd:0.125, swing:0, nummer:-1,        // sd = Sechzehntel in Sekunden
    schritt:0, naechster:0, jetzt:0,
    daempf:false,
    st:{bass:null, drums:null, arp:null, lead:null},   // Stil je Takt; null = schweigt
    laut:{}, klang:{},
    ac:null, duck:null, bus:null, tief:null,
    wellen:{}, rausch:null, stimmen:[],
    ring:[], ringI:0,                              // letzte geplante Schritte, fuer schlag()
  };
  for(let i=0;i<RING;i++) M.ring.push({t:0, s:0, b:0, sd:0.125});
  const SCHLAG={bpm:120, schritt:0, takt:0, bisSchlag:0, seitSchlag:0};

  /* ---- Helfer ---- */
  const klemme=(v,a,b)=>Math.max(a,Math.min(b,v));
  const eigen=(T,k)=>(T&&Object.prototype.hasOwnProperty.call(T,k))?T[k]:null;
  const stumm=()=>typeof muted!=='undefined'&&!!muted;

  function akkord(name){
    const k=String(name);
    if(AKK[k]) return AKK[k];
    // Grundton A-G, optional # oder b, optional m (Moll), optional 7. Unbekannt = C-Dur.
    const m=/^([A-G])([#b]?)(m?)(7?)$/.exec(k);
    let w=0, moll=false, sept=false;
    if(m){
      w=(WURZEL[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+12)%12;
      moll=m[3]==='m'; sept=m[4]==='7';
    }
    return (AKK[k]={w:w, terz:moll?3:4, quinte:7, sext:moll?8:9, vierte:sept?10:12});
  }

  function notenMidi(t){
    const m=/^([A-G])([#b]?)([0-9])$/.exec(t);
    if(!m) return -1;
    return (parseInt(m[3],10)+1)*12+WURZEL[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
  }

  // Wie viele Schritte die Note ab s klingt: bis zum naechsten Schlag (hoechstens max).
  function dauerSchritte(p,s,max){
    let n=1;
    while(n<max && p[(s+n)&15]==='.') n++;
    return n;
  }

  function lautVon(so,k){ const l=so.laut; return (l&&typeof l[k]==='number')?l[k]:MUSIK_TUNE.standardLaut[k]; }
  function klangVon(so,k){ const c=so.klang; return (c&&typeof c[k]==='string')?c[k]:MUSIK_TUNE.standardKlang[k]; }

  function songDaten(id){
    return (typeof SONGS!=='undefined'&&SONGS)?eigen(SONGS,id):null;
  }
  function abschnittDaten(name){
    return (M.song&&M.song.abschnitte)?eigen(M.song.abschnitte,name):null;
  }
  function folgeListe(){
    const so=M.song;
    if(Array.isArray(so.folge)&&so.folge.length) return so.folge;
    return Object.keys(so.abschnitte||{});
  }
  function laenge(){ const a=M.sec&&M.sec.akkorde; return (a&&a.length)?a.length:1; }

  /* ---- Audio-Aufbau ----
     Die Knoten entstehen erst, wenn AC da ist (ton.js legt es beim ersten Ton an).
     Kette: Notenbus -> duck (Stinger) -> bus (Lautstaerke) -> tief (Tiefpass) -> Ausgang.
     Stinger-Toene gehen direkt auf bus, damit das Ducken sie nicht trifft. */
  function aufbauen(){
    try{
      const A=AC, duck=A.createGain(), bus=A.createGain(), tief=A.createBiquadFilter();
      duck.gain.value=1;
      bus.gain.value=MUSIK_TUNE.laut*(M.daempf?MUSIK_TUNE.daempfLaut:1);
      tief.type='lowpass';
      tief.frequency.value=M.daempf?MUSIK_TUNE.daempfHz:20000;
      tief.Q.value=0.7;
      duck.connect(bus); bus.connect(tief); tief.connect(A.destination);
      M.ac=A; M.duck=duck; M.bus=bus; M.tief=tief;
      M.wellen={}; M.rausch=null; M.stimmen=[];
      return true;
    }catch(e){ M.ac=null; return false; }
  }
  function bereit(){
    if(typeof AC==='undefined'||!AC) return false;
    if(M.ac!==AC && !aufbauen()) return false;
    return true;
  }

  // Puls-Welle mit Tastverhaeltnis d (0.125/0.25/0.5), einmal gebaut. Fourier-Reihe
  // einer Rechteckwelle: a_n = 2 sin(2 pi n d)/(n pi), b_n = 2 (1 - cos(2 pi n d))/(n pi).
  function welle(name){
    const W=M.wellen;
    if(W[name]) return W[name];
    const d=name==='puls12'?0.125:name==='puls25'?0.25:0.5;
    const N=64, re=new Float32Array(N), im=new Float32Array(N);
    for(let n=1;n<N;n++){
      re[n]=2*Math.sin(2*Math.PI*n*d)/(n*Math.PI);
      im[n]=2*(1-Math.cos(2*Math.PI*n*d))/(n*Math.PI);
    }
    W[name]=AC.createPeriodicWave(re,im);
    return W[name];
  }
  function klangSetzen(o,name){
    if(typeof name==='string'&&name.indexOf('puls')===0){
      try{ o.setPeriodicWave(welle(name)); return; }catch(e){}
    }
    o.type=(name==='square'||name==='triangle'||name==='sine'||name==='sawtooth')?name:'triangle';
  }
  // Ein Rauschpuffer von 1 s, einmal gebaut; jede Hi-Hat/Snare startet an einer anderen Stelle.
  function rauschPuffer(){
    if(M.rausch) return M.rausch;
    const sr=AC.sampleRate||44100, b=AC.createBuffer(1,sr,sr), d=b.getChannelData(0);
    for(let i=0;i<sr;i++) d[i]=Math.random()*2-1;
    M.rausch=b;
    return b;
  }

  /* ---- Klangknoten-Budget ----
     Jede Stimme merkt sich, wie viele Knoten sie belegt und bis wann. frei() wirft
     abgelaufene heraus und prueft, ob n weitere Knoten noch hineinpassen. Ist kein
     Platz, entfaellt die Note - lieber eine Note weniger als ein Notenstau. */
  function frei(n){
    const L=M.stimmen, j=M.jetzt;
    let belegt=0, k=0;
    for(let i=0;i<L.length;i++){
      const v=L[i];
      if(v.ende>j){ belegt+=v.n; L[k++]=v; }
    }
    L.length=k;
    return belegt+n<=MUSIK_TUNE.maxKnoten;
  }
  function stimme(n,ende,quellen){ M.stimmen.push({n:n, ende:ende, q:quellen}); }

  /* ---- Klaenge ---- */
  function tonNote(ziel,klang,midi,t,dauer,spitze){
    if(!(spitze>0)||!frei(2)) return;
    const d=Math.max(0.02,dauer), ende=t+d+0.06;
    const o=AC.createOscillator(), g=AC.createGain();
    klangSetzen(o,klang);
    o.frequency.setValueAtTime(440*Math.pow(2,(midi-69)/12),t);
    // Huellkurve: Attack 5 ms, halten ueber die Notendauer, dann Release
    g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(spitze,t+0.005);
    g.gain.setValueAtTime(spitze,t+d);
    g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.05);
    o.connect(g); g.connect(ziel);
    o.start(t); o.stop(ende);
    stimme(2,ende,[o]);
  }
  function schlagKick(ziel,t,v){
    if(!(v>0)||!frei(2)) return;
    const o=AC.createOscillator(), g=AC.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(150,t);
    o.frequency.exponentialRampToValueAtTime(45,t+0.09);   // 150 -> 45 Hz in 90 ms
    g.gain.setValueAtTime(v,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.1);
    o.connect(g); g.connect(ziel);
    o.start(t); o.stop(t+0.11);
    stimme(2,t+0.11,[o]);
  }
  function schlagSnare(ziel,t,v){
    if(!(v>0)||!frei(5)) return;
    // Rauschen durch Bandpass 1800 Hz, 120 ms ...
    const q=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
    q.buffer=rauschPuffer();
    f.type='bandpass'; f.frequency.setValueAtTime(1800,t); f.Q.value=1;
    g.gain.setValueAtTime(v,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
    q.connect(f); f.connect(g); g.connect(ziel);
    q.start(t,Math.random()*0.5); q.stop(t+0.12);
    // ... dazu ein Dreieck auf 180 Hz, das den Koerper gibt
    const o=AC.createOscillator(), h=AC.createGain();
    o.type='triangle'; o.frequency.setValueAtTime(180,t);
    h.gain.setValueAtTime(v*0.6,t);
    h.gain.exponentialRampToValueAtTime(0.0001,t+0.08);
    o.connect(h); h.connect(ziel);
    o.start(t); o.stop(t+0.09);
    stimme(5,t+0.12,[q,o]);
  }
  function schlagHat(ziel,t,v,dauer){
    if(!(v>0)||!frei(3)) return;
    const q=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
    q.buffer=rauschPuffer();
    f.type='highpass'; f.frequency.setValueAtTime(7000,t);
    g.gain.setValueAtTime(v,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dauer);
    q.connect(f); f.connect(g); g.connect(ziel);
    q.start(t,Math.random()*0.5); q.stop(t+dauer+0.01);
    stimme(3,t+dauer+0.01,[q]);
  }

  /* ---- Planen eines Schritts ----
     s = Schritt im Takt (0..15), tt = Abspielzeit (mit Swing). */
  function planeBass(s,tt){
    const B=M.st.bass, ch=B.p[s];
    if(ch!=='x'&&ch!=='o') return;
    const a=M.akkord, n=dauerSchritte(B.p,s,SCHRITTE);
    tonNote(M.duck,M.klang.bass,36+a.w+B.t(s,a),tt,n*M.sd*0.92,M.laut.bass*(ch==='o'?0.5:1));
  }
  function planeArp(s,tt){
    const R=M.st.arp, ch=R.p[s];
    if(ch!=='x'&&ch!=='o') return;
    const a=M.akkord, sp=M.laut.arp*(ch==='o'?0.5:1), basis=60+a.w;
    if(R.akkord){
      const d=dauerSchritte(R.p,s,4)*M.sd*0.92;
      tonNote(M.duck,M.klang.arp,basis,tt,d,sp*0.8);
      tonNote(M.duck,M.klang.arp,basis+a.terz,tt,d,sp*0.8);
      tonNote(M.duck,M.klang.arp,basis+a.quinte,tt,d,sp*0.8);
    }else{
      tonNote(M.duck,M.klang.arp,basis+R.t(s,a),tt,dauerSchritte(R.p,s,SCHRITTE)*M.sd*0.92,sp);
    }
  }
  function planeLead(s,tt){
    const T=M.st.lead, tok=T[s];
    if(!tok||tok==='.'||tok==='-') return;
    const midi=notenMidi(tok);
    if(midi<0) return;
    let n=1;
    while(s+n<SCHRITTE && T[s+n]==='-') n++;    // '-' haelt die Note
    tonNote(M.duck,M.klang.lead,midi,tt,n*M.sd*0.92,M.laut.lead);
  }
  function planeDrums(s,tt){
    const D=M.st.drums, L=M.laut.drums;
    const k=D.k[s], sn=D.s[s], h=D.h[s];
    if(k==='x'||k==='o') schlagKick(M.duck,tt,MUSIK_TUNE.kickLaut*L*(k==='o'?0.5:1));
    if(sn==='x'||sn==='o') schlagSnare(M.duck,tt,MUSIK_TUNE.snareLaut*L*(sn==='o'?0.5:1));
    if(h==='x'||h==='o') schlagHat(M.duck,tt,MUSIK_TUNE.hatLaut*L*(h==='o'?0.5:1),0.03);
    else if(h==='O') schlagHat(M.duck,tt,MUSIK_TUNE.hatOffenLaut*L,0.12);
  }
  function planeSchritt(s,t){
    // Swing: jeder zweite Sechzehntel kommt etwas spaeter (Raster bleibt fuer schlag() gleich)
    const tt=(s&1)?t+M.swing*M.sd:t, st=M.st;
    if(st.bass) planeBass(s,tt);
    if(st.drums) planeDrums(s,tt);
    if(st.arp) planeArp(s,tt);
    if(st.lead) planeLead(s,tt);
  }

  /* ---- Takt- und Abschnittswechsel ----
     Alle Wuensche (Song, Abschnitt, Ebene, Tempo) werden NUR hier uebernommen:
     am Anfang eines Takts. So bricht kein Takt mitten im Ton um. */
  function leadTokens(l,i){
    if(!l) return null;
    const txt=Array.isArray(l)?l[i%l.length]:l;
    if(typeof txt!=='string') return null;
    return txt.trim().split(/\s+/);
  }
  function setzeAbschnitt(name,idx,schleife){
    M.abschnitt=name; M.sec=abschnittDaten(name); M.folgeIdx=idx; M.schleife=schleife; M.abTakt=0;
  }
  // Naechster Abschnitt aus der Folge. Schleife: derselbe Abschnitt von vorn.
  function abschnittNaechster(){
    if(M.schleife){ M.abTakt=0; return; }
    const f=folgeListe();
    if(!f.length){ M.abschnitt=null; M.sec=null; M.abTakt=0; return; }
    const i=(M.folgeIdx+1)%f.length;   // -1 + 1 = 0: nach einer Schleife beginnt die Folge vorn
    setzeAbschnitt(f[i],i,false);
  }
  function songStarten(id){
    const so=SONGS[id];
    M.song=so; M.songId=id; M.nummer=-1;
    M.folgeIdx=-1; M.schleife=false; M.abTakt=0;
    M.liste=(so.ebenen&&so.ebenen.length)?so.ebenen:[['bass','drums','arp','lead']];
    M.laut={bass:lautVon(so,'bass'), arp:lautVon(so,'arp'), lead:lautVon(so,'lead'), drums:lautVon(so,'drums')};
    M.klang={bass:klangVon(so,'bass'), arp:klangVon(so,'arp'), lead:klangVon(so,'lead')};
    abschnittNaechster();
  }
  function stilSetzen(){
    const sec=M.sec||{}, eb=M.liste[M.ebene]||[], st=M.st;
    const inEbene=(n)=>eb.indexOf(n)>=0;
    const a=sec.akkorde, nA=(a&&a.length)?a.length:0;
    M.akkord=akkord(nA?a[M.abTakt%nA]:null);
    st.bass  =(inEbene('bass')  && sec.bass ) ? eigen(MUSIK_STIL_BASS,sec.bass)   : null;
    st.drums =(inEbene('drums') && sec.drums) ? eigen(MUSIK_STIL_DRUMS,sec.drums) : null;
    st.arp   =(inEbene('arp')   && sec.arp  ) ? eigen(MUSIK_STIL_ARP,sec.arp)     : null;
    st.lead  = inEbene('lead') ? leadTokens(sec.lead,M.abTakt) : null;
  }
  // Wird am Anfang jedes Takts gerufen. false = kein Song, nichts zu planen.
  function grenzeBeginn(){
    let frisch=false;
    if(M.wSongId!==undefined){
      const id=M.wSongId; M.wSongId=undefined;
      if(id&&id!==M.songId&&songDaten(id)){ songStarten(id); frisch=true; }
    }
    if(!M.song) return false;
    // Beim Songstart ist der Abschnitt schon gesetzt; ein offener Wunsch greift trotzdem sofort.
    let neu=frisch;
    if(M.wAbschnitt!==undefined){
      const w=M.wAbschnitt; M.wAbschnitt=undefined;
      if(w===null) M.schleife=false;
      else if(abschnittDaten(w)){
        const i=folgeListe().indexOf(w);
        setzeAbschnitt(w,i,i<0);         // steht w nicht in der Folge: Schleife
        neu=true;
      }
    }
    // Sonst weiter im Abschnitt, am Ende der Folge nach.
    if(!neu){
      if(M.abTakt+1<laenge()) M.abTakt++;
      else abschnittNaechster();
    }
    M.ebene=Math.min(M.liste.length-1, Math.floor(M.wSpannung*M.liste.length));
    if(M.wTempo!==undefined){ M.tempoOver=M.wTempo; M.wTempo=undefined; }
    M.bpm=klemme(M.tempoOver||Number(M.song.bpm)||120, MUSIK_TUNE.tempoMin, MUSIK_TUNE.tempoMax);
    M.sd=60/M.bpm/4;
    M.swing=klemme(Number(M.song.swing)||0,0,0.3);
    M.nummer++;
    stilSetzen();
    return true;
  }

  /* ---- Planer ---- */
  function takt(){
    if(!M.laeuft||!bereit()) return;
    const jetzt=AC.currentTime;
    M.jetzt=jetzt;
    // NIE nachholen: liegt der naechste Schritt in der Vergangenheit, neu bei "jetzt" beginnen
    if(M.naechster<jetzt) M.naechster=jetzt+MUSIK_TUNE.nachlauf;
    const grenze=jetzt+MUSIK_TUNE.vorlauf;
    for(let i=0;i<4&&M.naechster<grenze;i++){
      if(M.schritt===0&&!grenzeBeginn()) return;
      const s=M.schritt, t=M.naechster, r=M.ring[M.ringI];
      M.ringI=(M.ringI+1)%RING;
      r.t=t; r.s=s; r.b=M.nummer; r.sd=M.sd;
      if(!stumm()) planeSchritt(s,t);          // muted: Zeit laeuft weiter, nichts klingt
      M.naechster=t+M.sd;
      M.schritt=(s+1)%SCHRITTE;
    }
  }

  function alleStoppen(){
    const t=(typeof AC!=='undefined'&&AC)?AC.currentTime:0;
    for(let i=0;i<M.stimmen.length;i++){
      const q=M.stimmen[i].q;
      for(let j=0;j<q.length;j++){ try{ q[j].stop(t); }catch(e){} }
    }
    M.stimmen.length=0;
  }

  /* ---- Oeffentliche API ---- */
  function spiele(id){
    if(typeof id!=='string'||!songDaten(id)) return;
    if(M.wunsch===id) return;                  // idempotent: jedes Bild darf das rufen
    M.wunsch=id; M.wSongId=id; M.laeuft=true;
  }
  function stop(){
    alleStoppen();
    M.laeuft=false; M.song=null; M.songId=null; M.wunsch=null;
    M.wSongId=undefined; M.wAbschnitt=undefined;
    M.sec=null; M.abschnitt=null; M.schritt=0; M.nummer=-1;
    // Wuensche des letzten Spiels (Tempo, Spannung) gehoeren zu diesem Spiel und
    // duerfen nicht in den naechsten Song wandern.
    M.tempoOver=null; M.wTempo=undefined; M.wSpannung=0;
    // Planer-Zeit und Schrittspeicher leeren: ein neuer Start beginnt bei "jetzt",
    // nicht bei einem alten Schritt (sonst wartet der Planer bis dorthin).
    M.naechster=0;
    for(let i=0;i<RING;i++) M.ring[i].t=-1e9;
  }
  function spannung(w){
    const v=Number(w);
    M.wSpannung=isFinite(v)?klemme(v,0,1):0;
  }
  function abschnitt(name){
    if(name===null){
      if(M.schleife||M.wAbschnitt!==undefined) M.wAbschnitt=null;
      return;
    }
    if(typeof name!=='string') return;
    if(M.song&&!abschnittDaten(name)) return;
    if(M.wAbschnitt===undefined&&M.abschnitt===name) return;   // laeuft schon: nichts tun
    M.wAbschnitt=name;
  }
  function tempo(bpm){
    if(bpm===null){ M.wTempo=null; return; }
    const v=Number(bpm);
    if(!isFinite(v)||v<=0) return;
    M.wTempo=klemme(v,MUSIK_TUNE.tempoMin,MUSIK_TUNE.tempoMax);
  }
  function daempfen(an){
    M.daempf=!!an;
    if(!bereit()) return;
    const t=AC.currentTime;
    M.tief.frequency.setTargetAtTime(M.daempf?MUSIK_TUNE.daempfHz:20000,t,0.03);
    M.bus.gain.setTargetAtTime(MUSIK_TUNE.laut*(M.daempf?MUSIK_TUNE.daempfLaut:1),t,0.05);
  }
  function stinger(name){
    const st=eigen(MUSIK_STINGER,name);
    if(!st||!bereit()||stumm()) return;
    const jetzt=AC.currentTime;
    M.jetzt=jetzt;
    // Achtel: im Takt zwei Schritte, ohne Song 0,25 s. Start auf die naechste Achtel.
    const ach=M.song?2*M.sd:0.25;
    let t=jetzt+0.03;
    if(M.song){
      let n=M.naechster;
      if(M.schritt&1) n+=M.sd;
      if(n>t) t=n;
    }
    let tt=t;
    for(let i=0;i<st.noten.length;i++){
      const midi=st.noten[i][0], d=st.noten[i][1]*ach;
      tonNote(M.bus,st.k,midi,tt,d*0.9,MUSIK_TUNE.stingerLaut);
      tt+=d;
    }
    // Musik ducken: auf duckAnteil waehrend der Toene, danach zurueck auf voll
    const g=M.duck.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(MUSIK_TUNE.duckAnteil,t);
    g.setValueAtTime(1,tt+MUSIK_TUNE.duckNach);
  }
  function schlag(){
    if(!M.song||!bereit()) return null;
    const jetzt=AC.currentTime;
    // letzter geplanter Schritt, der schon erklingt
    let best=null;
    for(let i=0;i<RING;i++){
      const r=M.ring[i];
      if(r.t<=jetzt+1e-9&&(best===null||r.t>best.t)) best=r;
    }
    if(best===null||jetzt-best.t>2*best.sd+0.05) return null;   // Planer steht: kein Takt
    const tq=best.t-(best.s&3)*best.sd;          // Beginn des laufenden Viertels
    SCHLAG.bpm=60/(best.sd*4);
    SCHLAG.schritt=best.s;
    SCHLAG.takt=best.b;
    SCHLAG.seitSchlag=jetzt-tq;
    SCHLAG.bisSchlag=tq+4*best.sd-jetzt;
    return SCHLAG;
  }
  function aktuell(){
    return {song:M.songId, abschnitt:M.abschnitt, ebene:M.ebene};
  }

  return {spiele:spiele, stop:stop, spannung:spannung, abschnitt:abschnitt, tempo:tempo,
          stinger:stinger, daempfen:daempfen, takt:takt, schlag:schlag, aktuell:aktuell};
})();

// kern.js prueft window.MUSIK; ein top-level const haengt nicht am window, daher ausdruecklich setzen.
if(typeof window!=='undefined') window.MUSIK=MUSIK;

// Der Planer laeuft auch ohne Level-Haken; ohne setInterval (z. B. im Testlauf) eben nicht.
if(typeof setInterval==='function') setInterval(MUSIK.takt,25);
