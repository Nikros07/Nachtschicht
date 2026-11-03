/* n3 - Runner: jede Etappe/jeder Boss einzeln erreichen (S.dist gesetzt), demoBrain spielt 90 s.
   Die normale Messung (c-runner.js) kommt mit dem Bot nie ueber Etappe 2.
   node docs/gameplay/messung/n3-runner.js */
const H=require('./c-hilfe.js');
for(let i=1;i<=4;i++){
  const erg=[];
  for(let seed=0;seed<4;seed++){
    const L=H.lade('runner.html',''); const E=c=>L.api.ev(c);
    for(let k=0;k<seed*13;k++) L.rng();
    E('startGame();'); E(`S.dist=(ETAPPEN[${i}].m+1)*10;`);
    let t=0, bossAn=-1, bossAus=-1, fehler='';
    try{
      while(E('S.mode')==='play'&&t<90){
        E('demoBrain();'); E('update(1/60)'); t+=1/60;
        const b=E('!!S.boss');
        if(b&&bossAn<0) bossAn=t; if(!b&&bossAn>=0&&bossAus<0) bossAus=t;
      }
    }catch(e){ fehler=e.message.slice(0,60); }
    erg.push({seed,dauer:+t.toFixed(1),boss:bossAn<0?'-':bossAn.toFixed(1)+'->'+(bossAus<0?'offen':bossAus.toFixed(1)),
      hp:+E('S.hp'),ende:E('S.mode'),fehler});
  }
  console.log('Etappe-Index',i,'('+H.lade('runner.html','').api.ev('ETAPPEN['+i+'].name')+')',JSON.stringify(erg));
}

/* Flackerschutz/Wackeln im Runner: Blitz bei Treffer (.42) und Tod (.50) muss ueber FX laufen.
   Gemessen wird der Alpha-Wert, mit dem draw() den Blitz wirklich fuellt. */
{
  const L=H.lade('runner.html',''); const E=c=>L.api.ev(c);
  const alphaVon=(schutz,wackeln)=>{
    E(`KOMFORT.setze('flackerschutz',${schutz}); KOMFORT.setze('wackeln',${wackeln});`);
    E('startGame();'); E('update(1/60);'); E("S.flash=.5; S.flashCol='255,77,77'; S.shake=7;");
    const a=E('(()=>{ const o=[]; const orig=ctx.fillRect; ctx.fillRect=function(){ const m=/rgba\\(255,77,77,([0-9.]+)\\)/.exec(String(ctx.fillStyle)); if(m) o.push(+m[1]); return orig.apply(this,arguments); }; draw(1/60); ctx.fillRect=orig; return JSON.stringify(o); })()');
    return JSON.parse(a);
  };
  const aus=alphaVon(false,true), an=alphaVon(true,true);
  console.log('Blitz-Alpha ohne Schutz',JSON.stringify(aus),'mit Flackerschutz',JSON.stringify(an),
    '(FX.blitz(.45)=',E('FX.blitz(.45)'),')');
  console.log('Wackeln FX.wackel(7): an',E('(KOMFORT.setze("flackerschutz",false),FX.wackel(7))'),
    'Schutz',E('(KOMFORT.setze("flackerschutz",true),FX.wackel(7))'),
    'aus',E('(KOMFORT.setze("flackerschutz",false),KOMFORT.setze("wackeln",false),FX.wackel(7))'));
  if(!(an.length&&aus.length&&an[0]<aus[0]&&an[0]<=0.12)) { console.log('FEHLER: Flackerschutz daempft den Runner-Blitz nicht'); process.exitCode=1; }
}
