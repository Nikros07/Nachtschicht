/* ============================================================================
   NACHTSCHICHT - ENGINE: welt
   Tiefe. Aus dem Strich wird eine Flaeche.

   Bisher lief alles auf einer Linie: S.x nach links/rechts, S.y war der
   Boden, und die Y-Achse war ausserdem schon fuer die Sprunghoehe belegt
   (Gravitation, S.vy). Tiefe kann da nicht mit rein - sie kommt als
   DRITTE Achse dazu:

     e.x   links / rechts   wie bisher
     e.t   hinten / vorne   NEU, 0 = ganz hinten, 1 = ganz vorne
     e.h   Hoehe ueber dem Boden (Sprung) - das alte S.y minus Boden

   Gezeichnet wird bei  y = bodenY(e.t) - e.h.
   Wer weiter hinten steht, wird zuerst gezeichnet und ist damit verdeckt.

   Bewusst KEINE Groessenskalierung nach Tiefe: bei 320x180 und 7 Pixel
   breiten Figuren wird Skalierung matschig. Versatz plus Zeichenreihenfolge
   verkauft die Tiefe sauberer.

   Ein Level legt sein Band einmal fest:
     setzeTiefenband(126, 152);   // Boden-Y hinten, Boden-Y vorne
   ========================================================================== */

const TIEFE={
  hinten:126,   // Boden-Y der hintersten Laufebene
  vorne:152,    // Boden-Y der vordersten
  welt:64,      // wie "tief" das Band in Weltmass ist - nur fuer Sichtkegel
                // und Abstaende, damit ein Schritt nach hinten sich wie ein
                // Schritt zur Seite anfuehlt
  tempo:1.15,   // volle Banddurchquerung pro Sekunde bei vollem Druck
  kegelMax:0.38,// Anteil des Bandes, den ein Blick seitlich MAXIMAL erfasst.
                // Ohne diese Grenze waechst der Kegel mit der Entfernung
                // ueber das ganze Band - dann bringt Ausweichen in die Tiefe
                // gar nichts mehr, und genau davon lebt das Schleichen.
};
function setzeTiefenband(hinten,vorne,welt){
  TIEFE.hinten=hinten; TIEFE.vorne=vorne;
  if(welt!==undefined) TIEFE.welt=welt;
}

/* Boden-Y fuer eine Tiefe. t wird geklemmt, damit niemand aus dem Band faellt. */
function bodenY(t){
  const k=Math.max(0,Math.min(1,t));
  return TIEFE.hinten+k*(TIEFE.vorne-TIEFE.hinten);
}
/* Bildschirm-Y einer Figur, Sprunghoehe eingerechnet. */
const figurY=e=>bodenY(e.t)-(e.h||0);
/* Tiefe in Weltmass - fuer Abstaende und Sichtkegel. */
const tWelt=t=>t*TIEFE.welt;

/* ---- Bewegung in die Tiefe ----
   richtung: -1 nach hinten, +1 nach vorne, 0 nichts.
   traegheit macht es weich statt an/aus; 0 waere sofortiges Stoppen. */
function bewegeTiefe(e,richtung,dt,tempo,traegheit=14){
  const ziel=(richtung||0)*(tempo||TIEFE.tempo);
  e.vt=(e.vt||0)+(ziel-(e.vt||0))*Math.min(1,traegheit*dt);
  e.t=Math.max(0,Math.min(1,(e.t||0)+e.vt*dt));
}

/* ---- Abstand in der Flaeche ----
   Tiefe wird auf Weltmass gebracht, damit "zwei Schritte hinter mir" und
   "zwei Schritte neben mir" gleich weit sind. */
function abstand2D(a,b){
  const dx=a.x-b.x, dt=tWelt((a.t||0)-(b.t||0));
  return Math.hypot(dx,dt);
}
const nah2D=(a,b,r)=>abstand2D(a,b)<=r;

/* ---- Sichtkegel in der Flaeche ----
   Die Wache schaut in Blickrichtung (blick: -1 oder +1). Getroffen wird, wer
   vor ihr steht, innerhalb der Reichweite, und nicht zu weit seitlich -
   der Kegel wird mit der Entfernung breiter, wie ein echter Blick.
   oeffnung ist der Tangens des halben Oeffnungswinkels (0.6 ~ 31 Grad). */
function imSichtkegel(wache,ziel,weite,oeffnung=0.5){
  const vor=(ziel.x-wache.x)*(wache.blick||1);
  if(vor<=0||vor>weite) return false;
  const seit=Math.abs(tWelt((ziel.t||0)-(wache.t||0)));
  /* Der Kegel waechst mit der Entfernung, aber nicht unbegrenzt: seitlich
     ist bei kegelMax Schluss. Wer weit genug hinten oder vorne laeuft, ist
     sicher - egal wie weit weg. Das macht die Tiefe zum Werkzeug. */
  const grenze=Math.min(oeffnung*vor, TIEFE.kegelMax*TIEFE.welt);
  return seit<=grenze;
}

/* ---- Zeichnen nach Tiefe ----
   Das Level sammelt seine Figuren und Moebel ein und ruft einmal auf.
   Jeder Eintrag: {t, mal}. mal() zeichnet an der richtigen Stelle.
   Stabil sortiert, damit gleich tiefe Dinge nicht flackern. */
function zeichneNachTiefe(liste){
  liste
    .map((o,i)=>[o,i])
    .sort((a,b)=> (a[0].t-b[0].t) || (a[1]-b[1]))
    .forEach(([o])=>o.mal());
}

/* ---- Schatten unter einer Figur ----
   Verankert sie auf dem Boden - ohne ihn schwebt bei Tiefe alles. */
function bodenSchatten(e,breite=7,deckkraft=.28){
  ctx.globalAlpha=deckkraft; ctx.fillStyle='#000';
  ctx.fillRect(Math.round(e.x-breite/2),Math.round(bodenY(e.t)),breite,1);
  ctx.globalAlpha=1;
}

/* ---- Laufanimation aus der tatsaechlichen Bewegung ----
   Vorher hing der Gehzyklus nur am Seitwaertstempo (vx). Wer nach hinten
   oder vorne lief, glitt mit steifen Beinen durchs Bild - am Handy mit dem
   Stick fiel das sofort auf, weil man dort staendig schraeg laeuft. Und
   Kaempfer hatten gar keinen Gehzyklus.
   Diese Funktion misst die Bewegung seit dem letzten Aufruf (x UND Tiefe)
   und liefert das Bild im Gehzyklus, oder -1 fuer Stehen. Sie schreibt nur
   auf e._lx, e._lt, e._lauf, e._stehT - nie auf e.t (siehe bewegeTiefe). */
function laufBild(e,dt,tiefe){
  if(dt===undefined) dt=bildDt;
  const t = tiefe===undefined ? (e.t||0) : tiefe;
  if(e._lx===undefined){ e._lx=e.x; e._lt=t; e._lauf=0; e._stehT=1; }
  const d=Math.max(dt,1/240);
  const tempo=Math.hypot((e.x-e._lx)/d, tWelt(t-e._lt)/d);
  e._lx=e.x; e._lt=t;
  /* Kurze Nachlaufzeit: ein einzelner Frame ohne Bewegung (Stick an der
     Schwelle, Hit-Stop) soll nicht sofort ins Stehbild springen. */
  if(tempo>10){ e._lauf+=tempo*dt*0.09; e._stehT=0; }
  else e._stehT+=dt;
  return e._stehT<0.08 ? Math.floor(e._lauf)%4 : -1;
}

/* Gehtempo in der Flaeche: seitwaerts plus Tiefe, in Weltpixeln pro Sekunde.
   Fuer Level, die vx und vt selbst fuehren (Spielerfigur ausserhalb von
   Kaempfen). */
const tempo2D=(vx,vt)=>Math.hypot(vx||0,(vt||0)*TIEFE.welt);
