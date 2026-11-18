/* Gewinn-Bot Level 3 (level3.html, Nachtbus): Sprint (Hindernisse ueberspringen), im Bus
   hinten in der Sitzreihe an den Kontrolleuren vorbei (die sehen nur den Gang), vor der Tuer
   das Gespraech mit der Standardantwort, Cutscene mit gehaltenem E. */
'use strict';
module.exports={ seite:'level3.html', laufe(k){
  const {E}=k;
  if(!k.titel(['sprint'])) throw new Error('Spiel startet nicht');
  const luft=2*Math.abs(E('TUNE.sprungKraft'))/E('TUNE.gravitation');     // Flugzeit eines Sprungs
  let springt=false;
  for(let i=0;i<60*400;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(m==='intro'){ k.halte('KeyE'); k.takt(1); continue; }
    if(E('gespraechAktiv()')){ k.halte(); k.tipp('KeyE'); k.takt(1); continue; }
    if(m==='sprint'){
      const x=E('S.x'), vx=Math.max(E('S.vx'),60), amBoden=E('S.amBoden');
      const naechste=E('S.hindernisse.filter(h=>!h.getroffen&&h.x+4>S.x-12).map(h=>h.x+4)')[0];
      const halbweg=vx*luft/2;
      if(amBoden&&!springt&&naechste!==undefined&&naechste-x<=halbweg+2){ springt=true; k.halte('ArrowRight','Space'); }
      else if(springt&&amBoden&&E('S.vy')===0&&(naechste===undefined||naechste-x>halbweg+10||naechste-x<-14)) { springt=false; k.halte('ArrowRight'); }
      else if(springt&&!amBoden) k.halte('ArrowRight','Space');
      else k.halte('ArrowRight',springt?'Space':null);
      k.takt(1); continue;
    }
    if(m==='spiel'){
      const tz=E('TUNE.sitzTiefe')-0.02;       // in die Sitzreihe: dort sehen die Kontrolleure nicht hin
      k.halte('ArrowRight', E('S.tiefe')>tz?'ArrowUp':null);
    } else k.halte();
    k.takt(1);
  }
}};
