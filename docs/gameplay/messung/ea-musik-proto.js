/* Entwurf A - Messung + Referenzkern: Sequencer fuer nacht/musik.js
   node docs/gameplay/messung/ea-musik-proto.js

   Reine Messung, aendert keine Spieldatei. Dieser Kern zeigt, dass das Song-Format aus
   entwurf-a.md (Abschnitt Musik) ohne AudioContext planbar und damit headless messbar ist:
   Muster in Tracker-Schreibweise, Akkorde, Arpeggio, Schlagzeug, Ebenen (Spannung),
   Abschnitte mit Fill, Tempo-Faktor, Stinger auf die naechste Achtel, KEIN Nachholen.
   Der Engine-Agent darf Teile davon nach nacht/musik.js uebernehmen (dort mit Klang-Ausgabe).

   Ausgabe: je Song Schleifenlaenge, Takte, Tonhoehen, Stimmen, Ereignisse/s je Ebene,
   hoechste Zahl gleichzeitig klingender Stimmen, und die Pruefungen
   (Wechsel nur an Taktgrenzen, Notenstau nach 5 s Stillstand, Stinger-Raster). */
'use strict';

/* ---------- Tonhoehen ---------- */
const HALB={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function midi(name){                       // 'A1', 'C#3', 'Bb2'
  const m=/^([A-G])([#b]?)(-?\d)$/.exec(name); if(!m) return null;
  return 12*(+m[3]+1)+HALB[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
}
const hz=n=>440*Math.pow(2,(n-69)/12);
const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus4:[0,5,7],sus2:[0,2,7],dim:[0,3,6],add9:[0,4,7,14]};
function akkord(sym,okt){                  // 'Am' -> [midi...]
  const m=/^([A-G])([#b]?)(maj7|m7|sus4|sus2|dim|add9|m|7)?$/.exec(sym); if(!m) return null;
  const grund=12*(okt+1)+HALB[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
  return QUAL[m[3]||''].map(i=>grund+i);
}

/* ---------- Muster lesen ----------
   Zellen durch Leerzeichen getrennt. '.' Pause, '-' vorherigen Ton halten.
   Ton: 'A2' | Akkord: 'Am' (nur Stimmen mit akkord:true oder arp) | Schlag: 'x' laut, 'o' leise. */
function lies(zeile){ return zeile.trim().split(/\s+/); }
function zellenLaenge(m){ let n=0; for(const k in m) n=Math.max(n,lies(m[k]).length); return n; }

/* ---------- Ein Song (Beispiel; Format wie in entwurf-a.md) ---------- */
const SONGS={
  /* Leitmotiv "Nachtschicht-Thema", a-Moll, vi-IV-I-V. Kommt im Menue voll, auf der Karte als
     Spieluhr, im Traum verstimmt, im Finale mit allen Stimmen und einen Ganzton hoeher. */
  thema:{ bpm:100, schritte:16, grund:'A',
    stimmen:{ bass:{welle:'puls25',laut:.30}, akk:{welle:'dreieck',laut:.10,akkord:true,okt:3},
      arp:{welle:'puls12',laut:.08,arp:true,okt:4}, lead:{welle:'puls12',laut:.16},
      kick:{art:'kick',laut:.5}, hat:{art:'hat',laut:.12}, snare:{art:'snare',laut:.25} },
    muster:{
      A:{ bass:'A1 . . . A1 . . . F1 . . . F1 . . . C2 . . . C2 . . . G1 . . . G1 . G1 .',
          akk:'Am - - - - - - - F - - - - - - - C - - - - - - - G - - - - - - -',
          arp:'Am Am Am Am Am Am Am Am F F F F F F F F C C C C C C C C G G G G G G G G',
          kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . . .',
          hat:'. . x . . . x . . . x . . . x . . . x . . . x . . . x . . . x o' },
      B:{ bass:'A1 . A2 . A1 . A2 . F1 . F2 . F1 . F2 . C2 . C3 . C2 . C3 . G1 . G2 . G1 . G2 .',
          akk:'Am - - - - - - - F - - - - - - - C - - - - - - - G - - - - - - -',
          lead:'A4 - - - G4 - E4 - - - C4 - D4 - E4 - F4 - - - E4 - C4 - - - A3 - C4 - - - '+
               'G4 - - - E4 - C4 - - - G3 - C4 - E4 - D4 - - - - - B3 - D4 - G4 - - - - -',
          kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . . . '+
               'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . x x',
          snare:'. . . . x . . . . . . . x . . . . . . . x . . . . . . . x . . . '+
                '. . . . x . . . . . . . x . . . . . . . x . . . . . . . x . x x',
          hat:'x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o '+
              'x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o',
          arp:'Am Am Am Am Am Am Am Am F F F F F F F F C C C C C C C C G G G G G G G G '+
              'Am Am Am Am Am Am Am Am F F F F F F F F C C C C C C C C G G G G G G G G' },
      C:{ bass:'D2 . . . D2 . . . E2 . . . E2 . . . F2 . . . F2 . . . E2 . . . E2 . E2 .',
          akk:'Dm - - - - - - - E - - - - - - - F - - - - - - - E7 - - - - - - -',
          lead:'D4 - F4 - A4 - - - G#4 - - - E4 - - - A4 - C5 - B4 - A4 - G#4 - - - - - - - ',
          kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x x x x',
          hat:'. . x . . . x . . . x . . . x . . . x . . . x . . . x . . . x o',
          arp:'Dm Dm Dm Dm Dm Dm Dm Dm E E E E E E E E F F F F F F F F E7 E7 E7 E7 E7 E7 E7 E7' },
      FILL:{ snare:'x o x o x x x x', kick:'x . . . x . x .' },   // halber Takt, wird an den Taktrest angepasst
    },
    folge:{ normal:['A','B','A','C','B','C'] },
    ebenen:[['bass','akk'],['bass','akk','kick','hat'],['bass','akk','kick','hat','arp'],
            ['bass','akk','kick','hat','arp','lead','snare']],
  },
  /* Club: zwei Folgen (Strophe/Drop), Abschnitt "drop" mit Fill-Uebergang. */
  club:{ bpm:126, schritte:16, grund:'F#',
    stimmen:{ bass:{welle:'puls25',laut:.34}, akk:{welle:'puls50',laut:.07,akkord:true,okt:3},
      arp:{welle:'puls12',laut:.07,arp:true,okt:4}, lead:{welle:'puls12',laut:.13},
      kick:{art:'kick',laut:.6}, hat:{art:'hat',laut:.12}, snare:{art:'snare',laut:.22} },
    muster:{
      S1:{ bass:'F#1 . F#2 . F#1 . F#2 . D1 . D2 . D1 . D2 . A1 . A2 . A1 . A2 . E1 . E2 . E1 . E2 .',
           kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . . .',
           hat:'. . x . . . x . . . x . . . x . . . x . . . x . . . x . . . x .',
           akk:'F#m - - - - - - - D - - - - - - - A - - - - - - - E - - - - - - -' },
      S2:{ bass:'F#1 . F#2 . F#1 . F#2 . D1 . D2 . D1 . D2 . A1 . A2 . A1 . A2 . E1 . E2 . C#2 . E2 .',
           kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . . .',
           hat:'. . x . . . x . . . x . . . x . . . x . . . x . . . x . . . x x',
           akk:'F#m - - - - - - - D - - - - - - - A - - - - - - - E - - - - - - -',
           lead:'C#5 - - - A4 - - - F#4 - - - A4 - B4 - A4 - - - F#4 - D4 - - - - - E4 - F#4 - '+
                'A4 - - - - - E4 - C#4 - - - E4 - - - B3 - - - C#4 - E4 - D4 - - - C#4 - B3 -' },
      D1:{ bass:'F#1 F#1 F#2 F#1 F#1 F#1 F#2 F#1 D1 D1 D2 D1 D1 D1 D2 D1 A1 A1 A2 A1 A1 A1 A2 A1 E1 E1 E2 E1 E1 E1 E2 E1',
           kick:'x . . . x . . . x . . . x . . . x . . . x . . . x . . . x . . .',
           snare:'. . . . x . . . . . . . x . . . . . . . x . . . . . . . x . . .',
           hat:'x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o x o',
           arp:'F#m F#m F#m F#m F#m F#m F#m F#m D D D D D D D D A A A A A A A A E E E E E E E E',
           lead:'F#5 - - - E5 - C#5 - - - A4 - B4 - C#5 - D5 - - - C#5 - A4 - - - F#4 - A4 - - - ' },
      FILL:{ snare:'x x o x x x x x', hat:'. . . . . . . .' },
    },
    folge:{ strophe:['S1','S1','S2','S1','S2','S2','S1','S2'], drop:['D1','D1','S2','D1','D1','S2'] },
    ebenen:[['bass','kick'],['bass','kick','hat','akk'],['bass','kick','hat','akk','arp'],
            ['bass','kick','hat','akk','arp','lead','snare']],
  },
};

/* ---------- Der Planer ---------- */
function neuerPlayer(song){
  const P={ song, folgeName:Object.keys(song.folge)[0], folgeI:0, schrittImMuster:0,
    naechst:0, schritt:0, ebene:3, zielEbene:3, wunschAbschnitt:null, fill:false,
    tempoF:1, log:[], wechsel:[], stingerQ:[], uhr:0 };
  return P;
}
const schrittDauer=P=>60/(P.song.bpm*P.tempoF)/4;
const musterName=P=>P.song.folge[P.folgeName][P.folgeI%P.song.folge[P.folgeName].length];
function zelle(muster,stimme,i){ const z=muster[stimme]; if(!z) return '.'; const a=lies(z); return a[i%a.length]; }
function haltLaenge(muster,stimme,i,n){ const z=muster[stimme]; if(!z) return 1; const a=lies(z); let k=1; while(i+k<n&&a[(i+k)%a.length]==='-') k++; return k; }

function spieleSchritt(P,wann){
  const s=P.song, m=s.muster[musterName(P)], n=zellenLaenge(m), i=P.schrittImMuster;
  const taktGrenze=i%s.schritte===0;
  if(taktGrenze){
    /* Alle Wechsel nur hier: Ebene, Abschnitt. */
    if(P.zielEbene!==P.ebene){ P.ebene=P.zielEbene; P.wechsel.push({art:'ebene',wann,schritt:P.schritt}); }
  }
  const aktiv=new Set(s.ebenen[P.ebene]);
  const fillMuster=P.fill?s.muster.FILL:null;
  for(const [name,st] of Object.entries(s.stimmen)){
    if(!aktiv.has(name)) continue;
    let quelle=m, idx=i;
    if(fillMuster&&st.art){ quelle=fillMuster; idx=P.fillI; }       // Schlagzeug spielt den Fill
    const c=zelle(quelle,name,idx); if(c==='.'||c==='-') continue;
    if(st.art){ if(c==='x'||c==='o') P.log.push({wann,stimme:name,art:st.art,laut:st.laut*(c==='o'?.45:1),dauer:st.art==='kick'?.09:st.art==='snare'?.12:.03}); continue; }
    const len=haltLaenge(quelle,name,idx,n)*schrittDauer(P)*.9;
    if(st.arp){ const a=akkord(c,st.okt||4); if(!a) continue; const ton=a[P.schritt%a.length];
      P.log.push({wann,stimme:name,f:hz(ton),dauer:schrittDauer(P)*.8,laut:st.laut}); continue; }
    if(st.akkord){ const a=akkord(c,st.okt||3); if(!a) continue; for(const t of a) P.log.push({wann,stimme:name,f:hz(t),dauer:len,laut:st.laut/a.length*1.5}); continue; }
    const mi=midi(c); if(mi===null) continue; P.log.push({wann,stimme:name,f:hz(mi),dauer:len,laut:st.laut});
  }
  /* weiterzaehlen */
  if(P.fill) P.fillI++;
  P.schrittImMuster++; P.schritt++;
  if(P.schrittImMuster%s.schritte===0){
    if(P.wunschAbschnitt){ P.folgeName=P.wunschAbschnitt; P.folgeI=0; P.schrittImMuster=0; P.wunschAbschnitt=null; P.fill=false;
      P.wechsel.push({art:'abschnitt',wann:wann+schrittDauer(P),schritt:P.schritt}); return; }
    if(P.schrittImMuster>=n){ P.schrittImMuster=0; P.folgeI++; }
  }
}
/* Planer-Takt: plant bis jetzt+vorlauf. Liegt "naechst" in der Vergangenheit (Pause, Handy,
   Hintergrund), wird NICHT nachgeholt, sondern auf das naechste Schrittraster ab jetzt gesetzt. */
const VORLAUF=0.1;
function takt(P,jetzt){
  if(P.naechst<jetzt){ const sd=schrittDauer(P); P.naechst=jetzt+0.02; P.uebersprungen=(P.uebersprungen||0)+1; void sd; }
  while(P.naechst<jetzt+VORLAUF){ spieleSchritt(P,P.naechst); P.naechst+=schrittDauer(P); }
  /* Stinger: auf die naechste Achtel gerastert */
  while(P.stingerQ.length){ const st=P.stingerQ.shift(); const achtel=schrittDauer(P)*2;
    const rest=(P.schritt%2===0)?0:schrittDauer(P); const wann=P.naechst+rest; st.wann=wann; st.raster=achtel; P.log.push({wann,stimme:'stinger',f:hz(midi(st.ton)),dauer:.3,laut:.2,art:'stinger'}); }
}
const spannung=(P,w)=>{ const n=P.song.ebenen.length-1; const ziel=Math.max(0,Math.min(n,Math.round(w*n))); P.zielEbene=ziel; };
function abschnitt(P,name){ if(!P.song.folge[name]||name===P.folgeName) return; P.wunschAbschnitt=name; P.fill=true; P.fillI=0; }

/* ---------- Messung ---------- */
function messe(name){
  const song=SONGS[name], P=neuerPlayer(song);
  const takte=Object.values(song.folge).map(f=>f.reduce((a,m)=>a+zellenLaenge(song.muster[m])/song.schritte,0));
  const taktSek=60/song.bpm*4;
  /* 1) eine volle Folge auf hoechster Ebene, virtuelle Uhr in 1/60-Schritten */
  let t=0; const ende=takte[0]*taktSek;
  while(t<ende){ takt(P,t); t+=1/60; }
  const log=P.log.filter(e=>e.wann<ende);
  const melodisch=log.filter(e=>e.f);
  const tonhoehen=new Set(melodisch.map(e=>Math.round(e.f)));
  const stimmen=new Set(log.map(e=>e.stimme));
  /* gleichzeitig: Stimmen-Ueberlappung (Ereignisse, die zur selben Zeit klingen) */
  const punkte=[]; for(const e of log){ punkte.push([e.wann,1]); punkte.push([e.wann+e.dauer,-1]); }
  punkte.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); let akt=0, max=0; for(const [,d] of punkte){ akt+=d; max=Math.max(max,akt); }
  /* Ereignisse je Sekunde je Ebene */
  const jeEbene=song.ebenen.map(eb=>{ const s=new Set(eb); return +(log.filter(e=>s.has(e.stimme)).length/ende).toFixed(1); });
  /* 2) Wechsel nur an Taktgrenzen: Spannung mitten im Takt aendern */
  const Q=neuerPlayer(song); Q.ebene=Q.zielEbene=0; let u=0;
  for(let i=0;i<60*20;i++){ if(i===60*3+7) spannung(Q,1); if(i===60*9+23) spannung(Q,.3);
    if(i===60*12+11&&Object.keys(song.folge)[1]) abschnitt(Q,Object.keys(song.folge)[1]); takt(Q,u); u+=1/60; }
  const sd=60/song.bpm/4;
  const schief=Q.wechsel.filter(w=>Math.abs(((w.wann+1e-9)/(sd*song.schritte))%1)>1e-6&&Math.abs(((w.wann+1e-9)/(sd*song.schritte))%1-1)>1e-6);
  /* Zeit von Anforderung bis Wirkung */
  const reakt=Q.wechsel.map(w=>w.art+' bei '+w.wann.toFixed(2)+' s');
  /* 3) Notenstau: 5 s keine Takte (Handy offen), dann ein Takt */
  const R=neuerPlayer(song); let v=0; for(let i=0;i<120;i++){ takt(R,v); v+=1/60; }
  const vorher=R.log.length; v+=5; takt(R,v);
  const nach=R.log.slice(vorher); const vergangen=nach.filter(e=>e.wann<v-1e-9).length;
  /* 4) Stinger landet auf einer Achtel */
  const T=neuerPlayer(song); let w=0; for(let i=0;i<77;i++){ takt(T,w); w+=1/60; }
  T.stingerQ.push({ton:song.grund+'4'}); takt(T,w);
  const st=T.log.find(e=>e.art==='stinger'); const achtelRest=st?((st.wann/(sd*2))%1):null;
  return { song:name, bpm:song.bpm, takteJeFolge:takte, schleifeSek:+(takte[0]*taktSek).toFixed(1),
    muster:Object.keys(song.muster).filter(k=>k!=='FILL').length, tonhoehen:tonhoehen.size, stimmen:[...stimmen].join(','),
    ereignisseJeSekJeEbene:jeEbene, maxGleichzeitig:max,
    wechselNurAnTaktgrenzen:schief.length===0, wechsel:reakt,
    notenstau:{ereignisseImBildDanach:nach.length, davonInDerVergangenheit:vergangen},
    stingerAufAchtel:achtelRest!==null&&(achtelRest<1e-6||1-achtelRest<1e-6) };
}
for(const n of Object.keys(SONGS)) console.log(JSON.stringify(messe(n)));
module.exports={SONGS,midi,hz,akkord,neuerPlayer,takt,spannung,abschnitt};
