/* Messung C - Bonus-Runner (runner.html), kurz.
   Aus der Projektwurzel: node docs/gameplay/messung/c-runner.js
   Bot nach dem Vorbild von demoBrain() (die Vorfuehrung im Titelbild): im Modus 'play'
   wird demoBrain() vor jedem update(1/60) aufgerufen. Varianten:
     demo        demoBrain wie im Titelbild (springt, duckt, schlaegt)
     demo+traege demoBrain, aber jede Eingabe 0,25 s spaeter (Mensch)
     nurLaufen   nur rechts halten
     ohneSchlag  demoBrain ohne Schlaege
   Gezeichnet: Etappen, Bosse, Treffer, KOs, Konter, Combos, Hitstops, Partikel,
   laengste Strecke ohne neues Ding im Bild, Ende (Grund, Meter, Punkte).
   Nichts hier aendert Spieldateien. */
const H=require('./c-hilfe.js');

function lauf(seed,variante,maxS=420){
  const L=H.lade('runner.html',''); const E=c=>L.api.ev(c);
  for(let i=0;i<seed*13;i++) L.rng();
  E('startGame();');
  let t=0; const ev=[]; const notiere=(a,x)=>ev.push({t:+t.toFixed(1),a,x});
  let vor=JSON.parse(E('JSON.stringify({e:S.etappe,b:!!S.boss,hp:S.hp,kos:S.kos,n:S.things.length,fr:S.freeze,part:PART.length,combo:S.combo})'));
  let gesehen=new WeakSet(); let letztesNeues=0, laengsteLeere=0, leereVon=0;
  let hitstops=0, partikel=0, maxCombo=0;
  E('window.__ids=0; window.__neu=0;');
  const verzoegert=[];
  while(E("S.mode")==='play'&&t<maxS){
    if(variante==='nurLaufen'){ E('rightHeld=true;'); }
    else {
      /* demoBrain schreibt direkt in die Eingabe-Variablen; fuer 'traege' fangen wir die
         Spruenge/Schlaege ab und reichen sie 0,25 s spaeter nach. */
      E('const __j=jumpQueue.length, __h=hitQueue.length; demoBrain(); window.__jn=jumpQueue.length-__j; window.__hn=hitQueue.length-__h;');
      if(variante==='ohneSchlag') E('hitQueue.length=0;');
      if(variante==='demo+traege'){
        const jn=E('__jn'), hn=E('__hn');
        if(jn>0){ E('jumpQueue.length=Math.max(0,jumpQueue.length-'+jn+');'); verzoegert.push({t:t+0.25,c:'jumpQueue.push(S.t); jumpHeld=true;'}); }
        if(hn>0){ E('hitQueue.length=Math.max(0,hitQueue.length-'+hn+');'); verzoegert.push({t:t+0.25,c:'hitQueue.push(S.t);'}); }
        while(verzoegert.length&&verzoegert[0].t<=t) E(verzoegert.shift().c);
      }
    }
    E('update(1/60)'); t+=1/60;
    const z=JSON.parse(E(`JSON.stringify({e:S.etappe,b:!!S.boss,hp:S.hp,kos:S.kos,fr:S.freeze,part:PART.length,combo:S.combo,
      bs:S.boss?S.boss.state:'',
      neu:(()=>{ let n=0; for(const o of S.things){ if(!o.__id){ o.__id=++__ids; if(o.x>W-20) n++; } } return n; })()})`));
    /* Boss: jeder telegrafierte Angriff zaehlt als neue Herausforderung */
    if(z.bs==='telegraph'&&vor.bs!=='telegraph') z.neu=(z.neu||0)+1;
    if(z.neu>0){ const l=t-letztesNeues; if(l>laengsteLeere){ laengsteLeere=l; leereVon=letztesNeues; } letztesNeues=t; }
    if(z.e!==vor.e) notiere('etappe',z.e);
    if(z.b&&!vor.b) notiere('boss','start');
    if(!z.b&&vor.b) notiere('boss','besiegt');
    if(z.hp<vor.hp) notiere('treffer','hp '+z.hp);
    if(z.fr>0&&vor.fr<=0) hitstops++;
    if(z.part>vor.part) partikel+=z.part-vor.part;
    if(z.combo>maxCombo) maxCombo=z.combo;
    vor=z;
  }
  const grund=E("S.mode==='play'?'Zeitlimit':(S.blackout?'BLACKOUT':S.geschnappt?'SPERRSTUNDE':'LEBEN')");
  return { seed, variante, dauerS:+t.toFixed(1), meter:Math.floor(E('S.dist/10')), punkte:Math.floor(E('S.score')),
    kos:E('S.kos'), maxCombo, hitstops, partikel, etappe:E('S.etappe'), bosse:ev.filter(e=>e.a==='boss'&&e.x==='besiegt').length,
    treffer:ev.filter(e=>e.a==='treffer').length, ende:grund, laengsteOhneNeuesS:+laengsteLeere.toFixed(1),
    ereignisse:ev.map(e=>e.t+'s '+e.a+(e.x!==undefined?' '+e.x:'')).join(' | ') };
}
for(const v of ['demo','demo+traege','ohneSchlag','nurLaufen']){
  const r=[]; for(let s=0;s<6;s++) r.push(lauf(s,v));
  const m=f=>+(r.reduce((a,b)=>a+f(b),0)/r.length).toFixed(1);
  console.log(JSON.stringify({variante:v, dauerMittel:m(x=>x.dauerS), meterMittel:m(x=>x.meter), punkteMittel:m(x=>x.punkte),
    kosMittel:m(x=>x.kos), bosseMittel:m(x=>x.bosse), hitstopsMittel:m(x=>x.hitstops), partikelMittel:m(x=>x.partikel),
    maxComboMax:Math.max(...r.map(x=>x.maxCombo)), laengsteOhneNeuesMax:Math.max(...r.map(x=>x.laengsteOhneNeuesS)),
    enden:r.map(x=>x.ende).join(',')}));
  if(v==='demo') for(const x of r.slice(0,2)) console.log('  Lauf',x.seed,':',x.ereignisse);
}
