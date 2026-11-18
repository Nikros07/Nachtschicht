/* Gewinn-Bot Level 4 (level4.html, Tuersteher): Warten in der Schlange (Gespraech mit
   Standardantwort), dann der Kampf wie der "profi" aus docs/gameplay/messung/b-level4.js:
   ranlaufen, im goldenen Fenster kontern (+50 ms), vor dem Rammstoss rollen, nachsetzen,
   wenn er betaeubt ist. Cutscene: E halten. */
'use strict';
module.exports={ seite:'level4.html', laufe(k){
  const {E}=k;
  if(!k.titel(['schlange','kampf'])) throw new Error('Spiel startet nicht');
  let letzteZ=null, plan=null, angriffN=0, stunId=-1;
  for(let i=0;i<60*500;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }
    if(E('gespraechAktiv()')){ k.halte(); k.tipp('KeyE'); k.takt(1); continue; }
    if(m!=='kampf'){ k.halte(); k.takt(1); continue; }
    const b=E('({x:S.boss.x,z:S.boss.zustand,zT:S.boss.zT,d:S.boss.ausholenDauer||0,fa:S.boss.fensterAnteil||0,art:S.boss.art||"",anl:!!S.boss.anlauf,bt:S.boss.betaeubt||0})');
    const s=E('({x:S.spieler.x,z:S.spieler.zustand,aus:S.spieler.ausdauer,bl:S.spieler.blick,er:S.erholungT})');
    const dx=b.x-s.x;
    if(Math.abs(dx)>2&&Math.sign(dx)!==s.bl&&s.z==='frei'){ k.tipp(dx>0?'KeyD':'KeyA'); }   // zum Boss drehen
    const gehe=Math.abs(dx)>15&&b.z!=='ausholen'&&s.z==='frei'&&!b.anl;
    k.halte(gehe&&dx>0?'KeyD':null,gehe&&dx<0?'KeyA':null);
    if(b.z==='ausholen'&&letzteZ!=='ausholen'){
      angriffN++;
      plan=b.art==='ramme'?{roll:b.d-0.14}:{e:b.d*(1-b.fa)+0.05};
    }
    letzteZ=b.z;
    if(b.z==='ausholen'&&plan){
      if(plan.e!==undefined&&b.zT>=plan.e){ k.tipp('KeyE'); plan.e=undefined; }
      if(plan.roll!==undefined&&b.zT>=plan.roll){ k.tipp('Space'); plan.roll=undefined; }
    } else if((b.z==='getroffen'&&b.bt>0.25||b.z==='erholung')&&s.z==='frei'&&s.aus>=18&&s.er<=0&&stunId!==angriffN){
      stunId=angriffN; k.tipp('KeyE');   // nachsetzen
    }
    k.takt(1);
  }
}};
