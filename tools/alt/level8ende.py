# -*- coding: utf-8 -*-
"""Level 8: das Finale fuehrt die Nacht zusammen.

Der grosse Fight stand schon. Was fehlte, war alles, was ihn mit der Nacht
verbindet:

- DER ANFUEHRER HAT EIN GESICHT. Wer Marvin im Club gesehen hat, trifft ihn
  wieder - und er erinnert sich, wie es beim letzten Mal lief. Vor dem Kampf
  wird geredet, und es gibt einen seltenen Weg ganz ohne Kampf.
- WAS MAN UNTERWEGS GELERNT HAT, ZAEHLT. Der Taxifahrer-Tipp macht sein
  Ausholen lesbarer. Wer im Traum die Angst zugegeben hat, steht mit einem
  Leben mehr da. Tobi und die Crew gehen dazwischen (crewHilfeTakt).
- NEUN ENDEN. Heim, weiterziehen oder Sonnenaufgang (Level 7) mal Sieg,
  Niederlage oder kein Kampf. Dazu Zeilen aus der ganzen Nacht: wer
  schreibt, wem man geholfen hat, wer nicht mehr dabei ist. Gesehene Enden
  werden gezaehlt - das ist der Grund, die Nacht nochmal zu spielen.
- Wer auf den Sonnenaufgang wartet, verliert nicht mehr gegen die Sonne.
"""
import io, re

p = 'level8.html'
s = io.open(p, encoding='utf-8').read()


def ersetze(alt, neu, n=1):
    global s
    assert s.count(alt) == n, 'gefunden %d statt %d: %s' % (s.count(alt), n, alt[:80])
    s = s.replace(alt, neu)


s, n = re.subn(r'(<script src="nacht/nacht\.js\?v=([0-9]+)"></script>)',
               lambda m: m.group(1) + '\n<script src="nacht/dialog.js?v=%s"></script>' % m.group(2), s)
assert n == 1

GESPRAECH = r"""
/* ==========================================================================
   VOR DEM KAMPF
   Wer Marvin im Club gesehen hat, trifft ihn wieder, und er weiss noch,
   wie es lief. Wer nicht, trifft einen Fremden, der seit dem Club hinter
   einem her ist.
   ========================================================================== */
const anfuehrerName=()=>flag('marvinKennt')?'MARVIN':'DER ANFUEHRER';
function vorDemKampf(){
  const wer=anfuehrerName();
  const auftakt =
      flag('clubKloppeGewonnen') ? 'Du schon wieder. Im Club hattest du Glueck.'
    : flag('clubGekniffen')      ? 'Der, der im Club gekniffen hat. Diesmal laeufst du nicht.'
    : flag('marvinRueckzug')     ? 'Deine Jungs sehen muede aus. Heute Nacht zaehlt das.'
    : flag('marvinKennt')        ? 'Wir haben noch was offen, du und ich.'
    :                              'Ihr lauft seit dem Club durch unsere Strasse.';
  return {
    start:{ wer, text:auftakt,
      wahl:[
        { txt:'Ich hab Angst. Aber ich geh nicht weg.', wenn:{flag:'angstZugegeben'}, geh:'ehrlich' },
        /* Der seltene Weg: wer mutig UND angesehen ist, redet ihn runter.
           Ohne Kampf nach Hause ist ein eigenes Ende. */
        { txt:'Heute nicht. Geh nach Hause, Marvin.', wenn:{mut:60, ruf:65, flag:'marvinKennt'}, geh:'frieden' },
        { txt:'Lass uns einfach vorbei.',              geh:'lacht' },
        { txt:'Dann los.',                             geh:'@kampf', tu:{mut:2} },
      ], zeit:9, standard:3 },
    ehrlich:{ wer, text:'...Das hat noch keiner zu mir gesagt. Egal. Komm.',
      tu:{flag:'mutigerKopf'}, geh:'@kampf' },
    lacht:{ wer, text:'Vorbei. Klar. Erst durch mich.', geh:'@kampf' },
    frieden:{ wer, text:'...Weisst du was. Du hast recht. Ich bin auch muede.',
      tu:{flag:'friedlich', ruf:10}, geh:'@frieden' },
  };
}
function starteKonfrontation(){
  S.modus='reden';
  starteGespraech(vorDemKampf(),'start',e=>{
    if(e==='@frieden'){
      setzeFlag('fightFrieden');
      S.modus='spiel'; meldung(anfuehrerName()+' GEHT EINFACH',2.4);
      zeigeHinweis('JETZT NACH HAUSE',3);
      return;
    }
    starteGrossenKampf();
  });
}

/* ==========================================================================
   DIE ENDEN
   Drei Wege (Level 7) mal drei Ausgaenge des Kampfes. Dazu Zeilen aus der
   ganzen Nacht - wer schreibt, wem man geholfen hat, wer fehlt.
   ========================================================================== */
const ENDE_WEG={ heim:'HEIM', weiter:'WEITERZIEHEN', sonne:'SONNENAUFGANG' };
const ENDE_KAMPF={ gewonnen:'MIT SCHRAMMEN', verloren:'MIT BLAUEM AUGE', frieden:'OHNE EINEN SCHLAG' };
const endeWeg=()=>flag('endeSonne')?'sonne':flag('endeWeiter')?'weiter':'heim';
const endeKampf=()=>flag('fightFrieden')?'frieden':flag('fightGewonnen')?'gewonnen':'verloren';
const endeTitel=()=>ENDE_WEG[endeWeg()]+' - '+ENDE_KAMPF[endeKampf()];

function baueEnde(){
  const z=[{ d:1.0, txt:'' }];
  const weg=endeWeg();
  if(weg==='heim') z.push(
    { d:2.4, txt:'*DU SCHLIESST LEISE DIE HAUSTUER*' },
    { d:2.2, txt:'DRAUSSEN WIRD ES HELL. ABER DU BIST DRIN.' });
  else if(weg==='weiter') z.push(
    { d:2.4, txt:'IHR LAUFT AN DEINEM HAUS VORBEI.' },
    { d:2.4, txt:'IRGENDWO HAT NOCH WAS OFFEN. IRGENDWO IST IMMER WAS OFFEN.' });
  else z.push(
    { d:2.4, txt:'OBEN AUF DER BRUECKE SETZT IHR EUCH HIN.' },
    { d:2.6, txt:'DIE SONNE KOMMT. KEINER SAGT WAS.' });

  const k=endeKampf();
  if(k==='frieden') z.push({ d:2.4, txt:anfuehrerName()+' IST EINFACH GEGANGEN. DAS REICHT.' });
  else if(k==='gewonnen') z.push({ d:2.4, txt:'DEINE HAND TUT WEH. SIE WIRD HEILEN.' });
  else z.push({ d:2.4, txt:'DEIN AUGE WIRD MORGEN BLAU SEIN. DU WIRST ES ERKLAEREN MUESSEN.' });

  /* Wer schreibt - aus Level 5 und dem Traum in Level 6 */
  for(const n of ['mia','sophie','kira']){
    const name=n.toUpperCase();
    if(flag('versprochen_'+n)) z.push({ d:2.6, txt:'DEIN HANDY VIBRIERT. '+name+': BIST DU GUT HEIMGEKOMMEN?' });
    else if(flag('schreibt_'+n)) z.push({ d:2.6, txt:'EINE NACHRICHT VON '+name+'. DU LIEST SIE ERST MITTAGS.' });
  }
  if(!flag('handyZurueck')) z.push({ d:2.4, txt:'DEIN HANDY LIEGT NOCH IM LEHRERZIMMER. MONTAG.' });
  if(flag('neleGeholfen'))  z.push({ d:2.2, txt:'NELE IST AUCH HEIMGEKOMMEN.' });
  if(flag('tobiDabei'))     z.push({ d:2.2, txt:'TOBI HAT JETZT EINE NEUE CREW.' });
  const crew=ladeCrew();
  z.push({ d:2.4, txt:crew.length?'MIT DABEI: '+crew.join(', '):'GANZ ALLEIN DURCH DIE NACHT.' });
  z.push({ d:2.6, txt:'ENDE: '+endeTitel() });
  return z;
}
"""
ersetze("""/* ==========================================================================
   DER GROSSE FIGHT""", GESPRAECH + """
/* ==========================================================================
   DER GROSSE FIGHT""")

# ------------------------------------------------- Einstieg ueber Gespraech --
ersetze("""function starteLevel(){ starteGrossenKampf(); return;""",
        """function starteLevel(){ starteKonfrontation(); return;""")

# ------------------------------------------- Wirkung aus der Nacht im Kampf --
ersetze("""  S.spielerK=kaempfer({ x:70, t:0.5, blick:1, hp:3, maxHp:3 });""",
"""  /* Wer im Traum die Angst zugegeben und es ihm gesagt hat, steht
     fester. Ein Leben mehr ist viel in diesem Kampf - gemessen. */
  const leben=flag('mutigerKopf')?4:3;
  S.spielerK=kaempfer({ x:70, t:0.5, blick:1, hp:leben, maxHp:leben });""")
ersetze("""  zeigeHinweis('E SCHLAGEN - SHIFT BLOCKEN - LEER AUSWEICHEN',4);
  meldung('DIE HABEN AUF EUCH GEWARTET',2);""",
"""  zeigeHinweis(flag('taxiTipp')?'DER TAXIFAHRER HATTE RECHT: STEHENBLEIBEN, BLOCKEN, KONTERN'
                              :'E SCHLAGEN - SHIFT BLOCKEN - LEER AUSWEICHEN',4);
  meldung(anfuehrerName()==='MARVIN'?'MARVIN UND SEINE LEUTE':'DIE HABEN AUF EUCH GEWARTET',2);""")
ersetze("""  const k=1-(ph-1)*KAMPF8.windupKuerzerProPhase;""",
"""  /* Mit dem Tipp vom Taxifahrer kennt man sein Muster - sein Ausholen
     ist eine Spur laenger lesbar. */
  const k=(1-(ph-1)*KAMPF8.windupKuerzerProPhase)*(flag('taxiTipp')?1.15:1);""")
ersetze("""  textC('DER ANFUEHRER',14,P.dim);""", """  textC(anfuehrerName(),14,P.dim);""")

# ----------------------------------------------------------------- Update --
ersetze("""function update(dt){
  S.t+=dt; musik();""", """function update(dt){
  S.t+=dt; musik();
  if(typeof gespraechAktiv==='function'&&gespraechAktiv()){ gespraechTakt(dt); aktionPuffer.length=0; return; }""")

ersetze("""function pruefeSonne(){
  if(S.licht<100||S.modus==='ende') return false;""",
"""function pruefeSonne(){
  if(S.licht<100||S.modus==='ende') return false;
  /* Wer auf den Sonnenaufgang wartet, verliert nicht gegen die Sonne - er
     sieht sie. Die Nacht endet dann genau hier. */
  if(endeWeg()==='sonne'){ if(S.modus!=='cutscene') starteCutscene(); return true; }""")

# ----------------------------------------------------------------- Enden ----
ersetze("""const SZENEN=[
  { d:1.0, txt:'' },
  { d:2.4, txt:'*DU SCHLIESST LEISE DIE HAUSTUER*' },
  { d:2.2, txt:'DRAUSSEN WIRD ES HELL.' },
  { d:2.2, txt:'ABER DU BIST DRIN.' },
  { d:2.4, txt:'DIE NACHT IST VORBEI.' },
];
function starteCutscene(){ S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; S.vx=0; SFX.sieg(); }""",
"""function starteCutscene(){ S.szenen=baueEnde(); S.modus='cutscene'; S.szene=0; S.szeneT=0; S.skipT=0; S.vx=0; SFX.sieg(); }""")
ersetze("SZENEN[S.szene]", "S.szenen[S.szene]", 2)
ersetze("S.szene>=SZENEN.length", "S.szene>=S.szenen.length")

ersetze("""function levelGeschafft(){
  const best=ladeBest();""",
"""function levelGeschafft(){
  /* Gesehene Enden zaehlen - neun gibt es. */
  const titel=endeTitel();
  if(!NACHT.gesehen.includes(titel)){ NACHT.gesehen.push(titel); speichereStand(); }
  const best=ladeBest();""")

ersetze("""      textGlowC('DURCHGESPIELT',30,P.gold,2);
      textC('DU BIST ZUHAUSE. DIE SONNE WAR ZU LANGSAM.',52,P.weiss);""",
"""      textGlowC('DURCHGESPIELT',30,P.gold,2);
      textC('ENDE: '+endeTitel(),52,P.weiss);
      textC('ENDEN GESEHEN: '+NACHT.gesehen.length+' VON 9',62,P.gold);""")
ersetze("""      textC('DIE NACHT IST VORBEI.',108,P.dim);""",
        """      textC('SPIEL NOCHMAL - ANDERE ENTSCHEIDUNGEN, ANDERE NACHT.',108,P.dim);""")

io.open(p, 'w', encoding='utf-8').write(s)
print('Level 8: Konfrontation, Wirkung der Nacht, neun Enden')
