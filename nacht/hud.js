/* ============================================================================
   NACHTSCHICHT - ENGINE: hud
   Die Anzeigen, die in jedem Level dasselbe bedeuten muessen.

   Grund fuer diese Datei: Level 4 hatte einen Ausholbalken, der genau sagt,
   was gleich kommt und wann man kontern kann. Die drei anderen Kaempfe
   (Bus, Club, Heimweg) zeigten nur ein blinkendes Ausrufezeichen - obwohl
   die Engine dort dasselbe Timing verlangt. Wer in Level 4 etwas gelernt
   hatte, konnte es im Finale nicht anwenden, weil die Anzeige fehlte.

   Dasselbe beim Ueberspringen: die Cutscenes konnten "halten", die Intros
   nicht, und niemand hat es irgendwo gesehen.

   Was hier liegt, gilt ueberall gleich. Neue gemeinsame Anzeigen kommen
   hierher, nicht in neun Level.
   ========================================================================== */

/* Halten zum Ueberspringen: Hinweis plus Balken, wie lange noch. */
function zeichneUeberspringen(t,dauer){
  if(!(t>0)) return;
  const f=Math.min(1,t/(dauer||0.5)), bw=54, bx=Math.round((W-bw)/2), by=H-12;
  const h=IS_TOUCH?'HALTEN ZUM UEBERSPRINGEN':'E HALTEN ZUM UEBERSPRINGEN';
  text(h,Math.round((W-textW(h))/2),by-9,'#8d86a8');
  ctx.fillStyle='#2a2440'; ctx.fillRect(bx,by,bw,2);
  ctx.fillStyle='#ffd447'; ctx.fillRect(bx,by,Math.round(bw*f),2);
}

/* Ausholbalken: was der Gegner gerade macht und wo das Konterfenster liegt.
   Erwartet einen Kaempfer aus nacht/kampf.js (zustand, zT, ausholenDauer).
   fensterAnteil und unblockbarJetzt sind freiwillig - fehlen sie, gilt der
   Grundwert aus KAMPF. */
function zeichneAusholbalken(k,name,y){
  if(!k||k.zustand!=='ausholen') return;
  const dauer=k.ausholenDauer||(k.regler&&k.regler.ausholen)||
              (typeof KAMPF!=='undefined'?KAMPF.ausholen:0);
  if(!dauer) return;
  const anteil=(k.fensterAnteil!==undefined)?k.fensterAnteil
             : (typeof KAMPF!=='undefined'?KAMPF.konterAnteil:0.34);
  const bw=76, bx=Math.round((W-bw)/2), by=(y===undefined)?29:y;
  const f=Math.min(1,k.zT/dauer);
  ctx.fillStyle='#000000aa'; ctx.fillRect(bx-2,by-2,bw+4,9);
  ctx.fillStyle='#2a2440';   ctx.fillRect(bx,by,bw,5);
  /* Das goldene Stueck ist das Konterfenster - unblockbare Angriffe haben
     keins, und dann darf dort auch nichts leuchten. */
  if(!k.unblockbarJetzt){
    ctx.fillStyle='#ffd44766';
    ctx.fillRect(bx+Math.round(bw*(1-anteil)),by,Math.round(bw*anteil),5);
  }
  ctx.fillStyle=k.unblockbarJetzt?'#ffd447':'#ff3d8b';
  ctx.fillRect(bx,by,Math.round(bw*f),5);
  if(name) text(name,Math.round((W-textW(name))/2),by-8,'#ffd447');
}

/* Wer von mehreren gerade gefaehrlich ist: der naechste, der ausholt.
   In den Kloppen stehen bis zu drei gleichzeitig um einen herum - ohne
   diese Auswahl muesste jedes Level selbst sortieren. */
function naechsterAngreifer(liste,s){
  if(!liste||!s) return null;
  let bester=null, nah=1e9;
  for(const g of liste){
    if(!g||g.hp<=0||g.zustand!=='ausholen') continue;
    const d=Math.abs((g.x||0)-(s.x||0));
    if(d<nah){ nah=d; bester=g; }
  }
  return bester;
}
