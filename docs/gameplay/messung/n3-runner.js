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
