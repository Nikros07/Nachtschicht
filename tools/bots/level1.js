/* Gewinn-Bot Level 1 (index.html, Schule): Schluessel holen, zum Ausgang, Szene halten. */
'use strict';
module.exports={ seite:'index.html', laufe(k){
  const {E}=k;
  if(!k.titel()) throw new Error('Spiel startet nicht');
  const raeume=E('RAEUME.map(r=>[r.e,r.x])');
  const TL=E('TREPPE_L'), TR=E('TREPPE_R'), AUSX=E('AUSGANG.x');
  const gehZu=(x,etage)=>{        // liefert true, wenn angekommen
    const e=E('S.etage'), sx=E('S.x');
    if(e!==etage){
      const stx=Math.abs(sx-TL)<Math.abs(sx-TR)?TL:TR;
      if(Math.abs(sx-stx)>8){ k.halte(sx<stx?'ArrowRight':'ArrowLeft','ShiftLeft'); return false; }
      k.einBild(etage>e?'ArrowUp':'ArrowDown'); return false;   // Treppe: die Taste muss ein update() lang unten sein
    }
    if(Math.abs(sx-x)>5){ k.halte(sx<x?'ArrowRight':'ArrowLeft'); return false; }
    k.halte(); return true;
  };
  for(let i=0;i<60*400;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(k.gespraech()){ k.takt(1); continue; }
    if(m==='gefangen'){ k.tipp('Space'); k.takt(1); continue; }
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(m==='raum'){
      const r=E('S.raum'), pl=E('moebelPlaetze(RAEUME[S.raum]).map(p=>p.x+8)');
      if(E('S.suchT')>0){ k.halte(); k.takt(1); continue; }
      const ziel=E('S.schluesselMoebel');
      const gesucht=E('S.hatSchluessel')||r!==E('S.schluesselRaum');
      if(gesucht){ // raus
        if(!E('S.anTuerRaus')){ k.halte('ArrowLeft'); } else { k.halte(); k.tipp('KeyE'); }
      } else {
        const rx=E('S.raumX'), zx=pl[ziel];
        if(Math.abs(rx-zx)>4) k.halte(rx<zx?'ArrowRight':'ArrowLeft'); else { k.halte(); k.tipp('KeyE'); }
      }
      k.takt(1); continue;
    }
    if(m==='spiel'){
      if(E('S.hatSchluessel')){
        if(gehZu(AUSX,0)) k.tipp('KeyE');
      } else {
        const sr=E('S.schluesselRaum');
        if(sr<0){      // Variante 'hausmeister': er traegt den Schluessel; ansprechen, Standardantworten genuegen
          const hm=E('(()=>{const h=S.lehrer.find(L=>L.hausmeister); return h?[h.e,h.x]:null;})()');
          if(!hm) throw new Error('kein Hausmeister');
          if(gehZu(hm[1],hm[0])||Math.abs(E('S.x')-hm[1])<12) k.tipp('KeyE');
        } else if(gehZu(raeume[sr][1],raeume[sr][0])) k.tipp('KeyE');
      }
    }
    k.takt(1);
  }
}};
