/* Gewinn-Bot Level 8 (level8.html, Heimweg): Konfrontation mit der Standardantwort ("Dann los."),
   Endkampf mit der Taktik "konter" aus docs/gameplay/messung/c-level8.js (die Kampf-KI laeuft im
   Seitenkontext, weil sie imKonterfenster/trifftRaeumlich der Engine nutzt): Konter im Gold-Fenster
   (+0,05 s), Rolle vor Rammstoss und Flasche, Block gegen Handlanger. Wettlauf gegen die Sonne:
   rechts halten, vor jedem Hindernis springen, bei jeder Abbiegung E (Tschuess). Finale und Abspann:
   Gespraeche mit Standardantwort, sonst E halten (ueberspringt). */
'use strict';
const KI=`window.__bot=function(reaktion){
  const s=S.spielerK, g=S.gegner, o={l:0,r:0,u:0,d:0,b:0,e:0,roll:0};
  if(!s||!g) return o;
  const feinde=[g].concat(S.handlanger.filter(h=>h.hp>0));
  const nahAnDir=f=>Math.abs(f.x-s.x)<30&&tiefeNah(f.t,s.t,KAMPF.tiefeToleranz+0.05);
  const fenster=f=>imKonterfenster(f)&&f.zT>=(f.ausholenDauer||(f.regler||KAMPF).ausholen)*(1-KAMPF.konterAnteil)+reaktion;
  const ziel=g.x-12*(Math.sign(g.x-s.x)||1), dx=ziel-s.x;
  if(Math.abs(dx)>3){ if(dx>0) o.r=1; else o.l=1; }
  else if(Math.sign(g.x-s.x)!==s.blick){ if(g.x>s.x) o.r=1; else o.l=1; }
  const dt=(g.t||0)-(s.t||0); if(Math.abs(dt)>0.08){ if(dt>0) o.d=1; else o.u=1; }
  const flasche=S.flaschen.find(f=>Math.abs(f.x-s.x)<45&&Math.sign(s.x-f.x)===Math.sign(f.vx)&&Math.abs(f.t-s.t)<=KAMPF.tiefeToleranz+0.05);
  if(flasche&&s.ausdauer>=KAMPF.ausdauerRolle){ o.roll=1; return o; }
  if(g.art==='ramme'&&g.zustand==='ausholen'&&nahAnDir(g)&&g.zT>g.ausholenDauer*0.45){ o.roll=1; return o; }
  if(s.zustand==='frei'&&s.ausdauer>=KAMPF.ausdauerSchlag){
    for(const f of feinde){
      if(f.art==='ramme'&&f===g&&g.unblockbarJetzt) continue;
      if(f.zustand==='ausholen'&&fenster(f)&&trifftRaeumlich(s,f,KAMPF.reichweite)){ o.e=1; return o; }
    }
  }
  for(const h of S.handlanger) if(h.hp>0&&h.zustand==='ausholen'&&nahAnDir(h)&&!trifftRaeumlich(s,h,KAMPF.reichweite)) o.b=1;
  if(!o.b&&(g.zustand==='erholung'||g.zustand==='getroffen')&&trifftRaeumlich(s,g,KAMPF.reichweite)&&s.ausdauer>=45&&s.zustand==='frei') o.e=1;
  return o;
};`;
module.exports={ seite:'level8.html', laufe(k){
  const {E}=k;
  if(!k.titel(['reden','kampf'])) throw new Error('Spiel startet nicht');
  E(KI);
  let jump=0, abbGetippt=null;
  const gesprungen=new Set();
  for(let i=0;i<60*600;i++){
    const m=E('S.modus');
    if(m==='ende') break;
    if(k.gespraech()){ k.halte(); k.takt(1); continue; }       // Standardantworten
    if(m==='kampf'){
      const o=E('__bot(0.05)');
      k.halte(o.l?'KeyA':null,o.r?'KeyD':null,o.u?'KeyW':null,o.d?'KeyS':null,o.b?'ShiftLeft':null);
      if(o.e) k.tipp('KeyE');
      if(o.roll) k.tipp('Space');
      k.takt(1); continue;
    }
    if(m==='spiel'){
      const hin=E(`(()=>{ for(let i=0;i<HINDERNISSE.length;i++){ if(S.hinTreffer[i]) continue;
        const o=HINDERNISSE[i], effX=o.art==='jogger'?o.x+Math.sin(S.t*TUNE.joggerTempo+i)*TUNE.joggerAmplitude:o.x;
        const d=effX-S.x; if(d>-15&&d<40) return {i,d,boden:S.amBoden}; } return null; })()`);
      if(hin&&!gesprungen.has(hin.i)&&hin.d<=27&&hin.d>-5&&hin.boden){ gesprungen.add(hin.i); jump=14; }
      const fenster=E('S.abb&&S.abb.fenster?S.abb.fenster.name:""');
      if(fenster&&abbGetippt!==fenster){ abbGetippt=fenster; k.tipp('KeyE'); }   // Tschuess sagen
      if(!fenster) abbGetippt=null;
      k.halte('KeyD',jump>0?'Space':null); if(jump>0) jump--;
      k.takt(1); continue;
    }
    if(m==='finale'||m==='cutscene'){ k.halte('KeyE'); k.takt(1); continue; }   // E halten ueberspringt
    k.halte(); k.takt(1);
  }
}};
