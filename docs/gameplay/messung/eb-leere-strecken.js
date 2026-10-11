/* Entwurf B - Leere Strecken im Raum.
   Start aus der Projektwurzel:  node docs/gameplay/messung/eb-leere-strecken.js

   Frage: Wo in der Welt gibt es lange Stuecke, auf denen nichts zum Anfassen, nichts
   Gefaehrliches und nichts zu Entscheiden liegt? Die Zeit-Messungen (messung-a/b/c) sagen,
   WANN es leer wird; diese Messung sagt, WO - damit ein Level-Agent weiss, welche Strecke
   er streicht (Welt kuerzer) oder fuellt (neues Element hinlegen).

   Gelesen werden die Tabellen der Level (DINGE, LEUTE, ZIELE, VERSTECKE ...) ueber
   tools/nachttest.js. "Punkt" = Stelle, an der E etwas tut, eine Gefahr steht oder ein
   Hindernis liegt. Gemessen wird der groesste Abstand zwischen zwei Punkten (inkl. Rand)
   in Pixeln und in Sekunden bei Gehtempo. Faustregel aus dem Entwurf (Abschnitt 4):
   hoechstens 4 s Gehen ohne Punkt. */
const N=require('../../../tools/nachttest.js');

function luecken(punkte,von,bis,tempo){
  const xs=[...new Set(punkte.map(Math.round))].filter(x=>x>=von&&x<=bis).sort((a,b)=>a-b);
  const alle=[von,...xs,bis];
  let max=0, wo=[von,bis], ueber4=0;
  for(let i=1;i<alle.length;i++){
    const d=alle[i]-alle[i-1];
    if(d>max){ max=d; wo=[alle[i-1],alle[i]]; }
    if(d/tempo>4) ueber4+=d;
  }
  return { punkte:xs.length, max, maxS:max/tempo, wo, anteilUeber4:ueber4/(bis-von) };
}
const ausgabe=[];
function zeile(name,r,tempo,notiz){
  ausgabe.push({name,r,tempo,notiz});
}

/* ---- Level 1: drei Etagen, je ein Flur von 760 px ---- */
{
  const L=N.lade('index.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo||104'), B=E('LEVEL_B');
  for(let e=0;e<3;e++){
    const p=[...E(`RAEUME.filter(r=>r.e===${e}).map(r=>r.x)`),
      ...E(`SPINDE.filter(s=>s.e===${e}).map(s=>s.x)`),
      ...E(`ROUTINEN.filter(r=>r.e===${e}).map(r=>r.x)`),
      E('TREPPE_L'),E('TREPPE_R')];
    if(e===0) p.push(E('AUSGANG.x'));
    if(e===2) p.push(E('CODESPIND.x'));
    zeile('L1 Etage '+e,luecken(p,0,B,tempo),tempo,'Tueren, Spinde, Routine-Orte, Treppen');
  }
}
/* ---- Level 2: Wohnung ---- */
{
  const L=N.lade('level2.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo'), B=E('LEVEL_B');
  const p=[...E('DINGE.map(d=>d.x)'),...E('LEUTE.map(l=>l.x)')];
  zeile('L2 Wohnung',luecken(p,0,B,tempo),tempo,'Dinge und Leute; die Wohnungstuer liegt links');
}
/* ---- Level 3: Bus (Verstecke, Fahrgaeste, Kloppe) und Sprint ---- */
{
  const L=N.lade('level3.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo');
  const p=[...E('VERSTECKE.map(v=>v.x)'),...E('FAHRGAESTE.map(f=>f.x)'),E('TUNE.kloppeX'),
    ...E('TUNE.waggonGrenzen')];
  zeile('L3 Bus',luecken(p,E('TUNE.einstiegX'),E('TUNE.ausstiegX'),tempo),tempo,'Verstecke, Fahrgaeste, Durchgaenge, Kloppe');
  const abst=E('TUNE.hindernisAbstand'), st=E('TUNE.sprintTempo');
  ausgabe.push({name:'L3 Sprint',r:{punkte:E('TUNE.hindernisAnzahl'),max:abst,maxS:abst/st,wo:['gleichmaessig',''],anteilUeber4:0},
    tempo:st,notiz:'alle Hindernisse im selben Abstand (Messung A: keine Muster)'});
}
/* ---- Level 5: Club ---- */
{
  const L=N.lade('level5.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo'), B=E('LEVEL_B');
  const p=[...E('ZIELE.map(z=>z.x)'),E('BARTHEKE.x'),E('WASCHBECKEN.x'),E('AUSGANG.x'),E('GARDEROBE.x'),
    E('JULE.x'),E('RAUCHER1.x'),E('RAUCHER2.x'),E('LIEFERANT.x')];
  zeile('L5 Club',luecken(p,0,B,tempo),tempo,'ohne Tanzende (die sind Gefahr nur im Stroboskop)');
  const mitTanz=[...p,...E('TANZER.map(t=>t.x)')];
  zeile('L5 Club + Tanzende',luecken(mitTanz,0,B,tempo),tempo,'mit Tanzenden als Gefahr');
}
/* ---- Level 6: Traum ---- */
{
  const L=N.lade('level6.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo'), B=E('LEVEL_B');
  const pflicht=[...E('DINGE.map(d=>d.x)'),E('LEA.x'),...E('TUEREN.filter(t=>!t.luegt).map(t=>t.x)')];
  zeile('L6 nur Pflicht',luecken(pflicht,0,B,tempo),tempo,'drei Erinnerungen, echte Tuer, Lea');
  const alle=[...pflicht,...E('SOFAS.map(s=>s.x)'),...E('TUEREN.map(t=>t.x)'),...E('ECHOS.map(e=>e.x)'),
    ...E('NACHTECHOS.map(e=>e.x)'),E('FOTO6.x'),E('SCHLEIFE.x')];
  zeile('L6 alles',luecken(alle,0,B,tempo),tempo,'mit Sofas, Echos, Nacht-Echos, Polaroid, Schleife');
}
/* ---- Level 7: Spaeti ---- */
{
  const L=N.lade('level7.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo'), B=E('LEVEL_B');
  const p=[...E('DINGE.map(d=>d.x)'),E('KASSE.x'),...E('NACHTMENSCHEN.map(m=>m.x)'),E('BANKRUNDE.x'),
    E('FOTO7.x'),E('OEZDEMIR.x')];
  zeile('L7 ohne Pfand',luecken(p,0,B,tempo),tempo,'wer mit Geld kommt, sieht nur das');
  const mit=[...p,...E('PFAND_PLAETZE.map(q=>q[0])')];
  zeile('L7 mit Pfand',luecken(mit,0,B,tempo),tempo,'Pfand liegt ueberall');
}
/* ---- Level 8: Heimweg ---- */
{
  const L=N.lade('level8.html'), E=c=>L.api.ev(c);
  const tempo=E('TUNE.gehTempo')*1.15, B=E('LEVEL_B');   // im Wettlauf rennt man etwa 115 px/s (Messung C)
  const ziel=E("typeof ZIEL_X!=='undefined'?ZIEL_X:LEVEL_B");
  const p=[...E('HINDERNISSE.map(h=>h.x)')];
  zeile('L8 nur Hindernisse',luecken(p,0,B,tempo),tempo,'Tonne, Jogger, Laster');
  const ab=E('TUNE.abbiegeBei').map(a=>a*ziel);
  const sch=E('SCHATTEN').flatMap(s=>[s.von,s.bis]);
  zeile('L8 + Abbiegen + Schatten',luecken([...p,...ab,...sch],0,B,tempo),tempo,'Abbiegefenster und Schattenkanten mitgezaehlt');
}

console.log('\nLEERE STRECKEN IM RAUM (groesster Abstand zwischen zwei Punkten)\n');
console.log('Bereich                    Punkte   groesste Luecke      bei Tempo   Sekunden   Anteil der Strecke in Luecken > 4 s');
for(const a of ausgabe){
  const r=a.r;
  console.log(a.name.padEnd(26),String(r.punkte).padStart(6),
    (String(r.max)+' px').padStart(10),(' ('+r.wo.join('-')+')').padEnd(14),
    String(Math.round(a.tempo)).padStart(6),'px/s',r.maxS.toFixed(1).padStart(6),'s',
    (Math.round(r.anteilUeber4*100)+' %').padStart(8),'  ',a.notiz);
}
