/* Messung B - Level 6 (Afterhour), Zusatzmessungen.
   node docs/gameplay/messung/b-level6-zusatz.js

   A  Erschoepfung - "der eigentliche Gegner" (TUNE 7): wie tief faellt die
      Kondition auf dem direkten Weg, je Pegel und Schwierigkeit?
   B  Wie oft trifft ein Spieler, der einfach den Hinweisen folgt, die
      Schleife in Raum 101? Und was kostet die luegende Tuer?
   C  Zeitbudget: reines Laufen, Lesen, Zuschauen - und was Springen bewirkt
   Aendert keine Spieldatei. */
'use strict';
const W=require('./b-werkzeug.js');
const B6=require('./b-level6.js');

const aus={};

/* ---------- A: Kondition auf dem direkten Weg ---------- */
{
  const tab={};
  for(const schw of ['locker','normal','hart']){
    for(const pegel of [0,40,80,100]){
      for(const kond of [100,60]){
        let minK=101, unter30=0;
        const ext=(v,j,ev,t)=>{ B6.extra(v,j,ev,t); if(j.m==='spiel'){ if(j.kond<minK) minK=j.kond; if(j.kond<30) unter30+=W.DT; } };
        const vorher=`localStorage.setItem(SCHWER_KEY,'${schw}'); localStorage.setItem(PEGEL_KEY,'${pegel}'); setzeWert('kondition',${kond});`;
        const r=W.lauf('level6.html',B6.bot('direkt',{seed:1}),{seed:1,vorher,snapExtra:B6.SNAP,ereignisExtra:ext,maxSek:400});
        tab[schw+' pegel'+pegel+' kond'+kond]={minKondition:Math.round(minK),sekUnter30:+unter30.toFixed(1),
          weggeknickt:r.E('S.weggeknickt'),gesamtSek:+r.t.toFixed(1),laufUhr:+r.E('S.zeit').toFixed(1),kondAmEnde:Math.round(r.E('S.kondition'))};
      }
    }
  }
  aus.A_kondition=tab;
}

/* ---------- B: Schleife und luegende Tuer ---------- */
{
  /* Spieler, der nur nach rechts laeuft und E drueckt, wenn ein Hinweis
     (das blinkende E / der Knopf) erscheint - mit Wahrscheinlichkeit p je Ding. */
  const tab={};
  for(const p of [1.0,0.8,0.5]){
    let schleifen=0, laeufe=0, schleifenLaeufe=0, zeit=0;
    for(let seed=1;seed<=20;seed++){
      const r=W.zufall(seed*97+1);
      const z={lesen:true}; const gemacht=new Set(); let wartenBis=0;
      const bot=(st,ctl)=>{
        if(st.m==='titel'){ if(!z.go){ ctl.tippe('KeyE'); z.go=true; } return; }
        if(W.kartenBot(st,ctl,z,true)) return;
        if(st.m==='ende') return 'fertig';
        if(st.m==='intro'||st.m==='cutscene'){ ctl.tippe('KeyE'); return; }
        if(W.gespraechBot(st,ctl,z,()=>0)){ ctl.halte('KeyD',false); return; }
        if(st.m!=='spiel') return;
        if(st.ruht){ ctl.tippe('KeyD'); return; }
        const k=ctl.E('(function(){const z=naechstesZiel(); return z?(z.art+":"+(z.obj.art||z.obj.id||z.obj.name||z.obj.x)):null;})()');
        if(k&&/^ding/.test(k)&&!gemacht.has(k)&&ctl.t>wartenBis){ gemacht.add(k); if(r()<p){ ctl.halte('KeyD',false); ctl.tippe('KeyE'); wartenBis=ctl.t+1; return; } }
        if(k&&/^lea/.test(k)&&ctl.t>wartenBis){ ctl.halte('KeyD',false); ctl.tippe('KeyE'); wartenBis=ctl.t+1; return; }
        /* nach dem dritten Mal Raum 101 ("WAS IST IM CHEMIERAUM PASSIERT?") dreht er um,
           geht zurueck in die Chemie und drueckt diesmal sicher E */
        if(st.schleifen>=3&&!/labortisch/.test(st.erl)&&!z.chemie){ z.chemie=true; }
        if(z.chemie){ if(st.x>440){ ctl.halte('KeyA',true); ctl.halte('KeyD',false); return; }
          ctl.halte('KeyA',false); ctl.halte('KeyD',false);
          if(Math.abs(st.x-430)<12&&ctl.t>wartenBis){ ctl.tippe('KeyE'); wartenBis=ctl.t+1; }
          if(/labortisch/.test(st.erl)) z.chemie=false; else { ctl.halte('KeyA',st.x>436); ctl.halte('KeyD',st.x<424); }
          return; }
        /* hat er etwas ausgelassen, geht er zurueck, sobald Lea ihn wegschickt */
        if(st.x>1540&&st.erl.split(',').filter(Boolean).length<3){ gemacht.clear(); z.zurueck=true; }
        if(z.zurueck){ ctl.halte('KeyA',true); ctl.halte('KeyD',false); if(st.x<190){ z.zurueck=false; ctl.halte('KeyA',false); } return; }
        ctl.halte('KeyD',true);
      };
      const res=W.lauf('level6.html',bot,{seed,snapExtra:B6.SNAP,ereignisExtra:B6.extra,maxSek:600});
      laeufe++; const s=res.E('S.schleifen'); schleifen+=s; if(s>0) schleifenLaeufe++; zeit+=res.E('S.zeit');
    }
    tab['druecktBeiDingMitP'+p]={laeufe,laeufeMitSchleife:schleifenLaeufe,schleifenGesamt:schleifen,laufUhrMittel:+(zeit/laeufe).toFixed(1)};
  }
  /* luegende Tuer: von x=1056 nach x=100 - Weg zurueck messen */
  {
    const {L,E}=W.oeffne('level6.html',{seed:1});
    E("starte(); starteLevel(); KAPITEL.aktiv=null; S.x=1056; S.tiefe=0.1; S.erledigt={spind:1,labortisch:1,buecher:1};");
    L.taste('KeyE',true); L.taste('KeyE',false); E('update(1/60)');
    const nach=E('S.x'); let t=0; L.taste('KeyD',true);
    while(E('S.x')<1056&&t<60){ E('update(1/60)'); t+=1/60; if(E('!!GESPR')) { E('GESPR=null'); } }
    L.taste('KeyD',false);
    tab.luegendeTuer={versetztNach:Math.round(nach),sekundenZurueck:+t.toFixed(1)};
  }
  aus.B_schleifeUndTuer=tab;
}

/* ---------- C: Springen ---------- */
{
  const src=require('fs').readFileSync(require('path').join(W.WURZEL,'level6.html'),'utf8');
  const yNutzung=(src.match(/S\.y\b/g)||[]).length;
  const hindernis=/hindernis|plattform|kiste|luecke|stufe/i.test(src.slice(src.indexOf('function update('),src.indexOf('function naechstesZiel(')));
  aus.C_springen={stellenMitSy:yNutzung,hindernisInUpdate:hindernis,
    befund:'S.y wird nur gegen BODEN geprueft (Landen) und zum Zeichnen benutzt - es gibt nichts, das ein Sprung erreicht oder ueberwindet'};
}

console.log(JSON.stringify(aus,null,1));
