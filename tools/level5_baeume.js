/* ==========================================================================
   DIE GESPRAECHE IM CLUB
   Drei Leute, drei Persoenlichkeiten - und jede reagiert anders darauf, WIE
   man auftritt. Es gibt keine Antwort, die bei allen funktioniert:

     MIA     direkt, testet dich. Mag Ehrlichkeit, hasst Sprueche. Ist wegen
             Lenas Geburtstag hier - wer Lena ignoriert, hat schon verloren.
     SOPHIE  laut, lustig, will feiern. Mag Humor und Mut. Kennt man ein
             gutes Erlebnis von heute Nacht, ist das Gold wert.
     KIRA    ruhig, beobachtet, wartet auf ihr Taxi. Mag Zuhoeren. Wer
             betrunken und laut ankommt, ist sofort raus.

   Was freischaltet: Mut, Ruf, Geld, Pegel, wer in der Crew ist, und was
   in den Leveln davor passiert ist. Die Zuneigung laeuft ueber
   beziehung('MIA') usw. - das "mag" in den Bedingungen.

   Knoten, die mit @ anfangen, gibt es nicht - dort endet das Gespraech,
   und gespraechEnde() entscheidet, was passiert:
     @ja      ihr geht zusammen raus (die Ecke)
     @nummer  sie gibt dir ihre Nummer
     @nett    freundlich auseinander, Ruf steigt
     @nein    Abfuhr - spricht sich im Club rum
     @tanz    Tanz-Minispiel, danach geht es bei tanzGut / tanzSchlecht weiter

   Schrift: nur A-Z 0-9 . : - ! ? / + , < > * %  - keine Umlaute.
   (Am Handy steht der Text im Bedienfeld, dort gingen Umlaute - am Rechner
   laeuft er durch den Pixel-Font.)
   ========================================================================== */

const MIA_BAUM = {
  start:{ wer:'MIA', text:'Ja? Kann ich dir helfen?',
    wahl:[
      { txt:'Hi. Ich wollte einfach hallo sagen.',          geh:'ehrlich',  tu:{mag:['MIA',8]} },
      { txt:'Kommst du oefter hierher?',                    geh:'spruch',   tu:{mag:['MIA',-8]} },
      { txt:'Deine Freundin schaut, als waer ihr langweilig.', wenn:{mut:45}, geh:'lena', tu:{mag:['MIA',4]} },
      { txt:'Du bist echt die schoenste hier.',              wenn:{pegel:55}, geh:'besoffen' },
    ], zeit:9, standard:1 },

  spruch:{ wer:'MIA', text:'Ernsthaft? Das ist dein erster Satz?',
    wahl:[
      { txt:'Ja. War schlecht. Neuer Versuch?',  wenn:{mut:30}, geh:'ehrlich', tu:{mag:['MIA',10]} },
      { txt:'Ich hab noch bessere.',             geh:'@nein' },
    ], zeit:7, standard:1 },

  besoffen:{ wer:'MIA', text:'Und du riechst nach Wodka. Lena, komm.', geh:'@nein' },

  lena:{ wer:'LENA', text:'Hey! Ich hab Geburtstag und keiner tanzt mit mir.',
    wahl:[
      { txt:'Alles Gute! Dann tanzen wir doch alle.', geh:'lenaGut', tu:{mag:['MIA',6]} },
      { txt:'Mein Kumpel tanzt mit dir.', wenn:{crew:'JONAS'}, geh:'kumpel' },
      { txt:'Mein Kumpel tanzt mit dir.', wenn:{crew:'MAX FERDI'}, geh:'kumpel' },
    ], zeit:8, standard:0 },

  kumpel:{ wer:'MIA', text:'Okay, das war gut. Jetzt hab ich Zeit.',
    tu:{mag:['MIA',12], flag:'lenaVersorgt'}, geh:'mitte' },

  lenaGut:{ wer:'MIA', text:'Du hast Lena gratuliert. Das hat heute noch keiner gemacht.', geh:'mitte' },

  ehrlich:{ wer:'MIA', text:'Hallo. Wir feiern Lenas Geburtstag. Das da ist Lena.',
    wahl:[
      { txt:'Alles Gute, Lena!',                    geh:'lenaGut', tu:{mag:['MIA',8]} },
      { txt:'Und warum stehst du dann hier rum?',   wenn:{mut:35}, geh:'dj', tu:{mag:['MIA',3]} },
      { txt:'Ich hol euch zwei was zu trinken.',    wenn:{geld:8}, geh:'drink', tu:{geld:-8, mag:['MIA',6]} },
      { txt:'Cool. Und du?',                        geh:'mitte', tu:{mag:['MIA',-3]} },
    ], zeit:9, standard:3 },

  dj:{ wer:'MIA', text:'Weil der DJ schlecht ist. Kannst du das besser?',
    wahl:[
      { txt:'Nein. Aber ich tanz trotzdem.',  geh:'@tanz' },
      { txt:'Ich kann besser reden als er.',  geh:'mitte', tu:{mag:['MIA',4]} },
    ], zeit:7, standard:1 },

  drink:{ wer:'MIA', text:'Aufmerksam. Lena, halt mal kurz.', geh:'mitte' },

  mitte:{ wer:'MIA', text:'Und was machst du hier, so ganz allein?',
    wahl:[
      { txt:'Mit meinen Jungs unterwegs. Lange Nacht.',  geh:'ende', tu:{mag:['MIA',4]} },
      { txt:'Ehrlich? Ich wollte dich ansprechen.',      wenn:{mut:40}, geh:'ende', tu:{mag:['MIA',8]} },
      { txt:'Weiss ich selbst nicht so genau.',          geh:'ende', tu:{mag:['MIA',-2]} },
    ], zeit:8, standard:2 },

  ende:{ wer:'MIA', text:'Und jetzt?',
    wahl:[
      { txt:'Komm kurz raus. Frische Luft.',  wenn:{mag:['MIA',24]}, geh:'ja' },
      { txt:'Tanzen?',                        geh:'@tanz' },
      { txt:'Gibst du mir deine Nummer?',     geh:'nummer' },
      { txt:'Ich lass euch mal feiern.',      geh:'@nett' },
    ], zeit:9, standard:3 },

  /* Die Nummer gibt es nicht umsonst: wer ihr egal ist, bekommt nur die
     zweite Antwort zu sehen. */
  nummer:{ wer:'MIA', text:'Hm. Warum sollte ich?',
    wahl:[
      { txt:'Weil ich dir mehr als hey schreiben will.', wenn:{mag:['MIA',10]}, geh:'nummerJa' },
      { txt:'War nur eine Frage.',                        geh:'@nett' },
    ], zeit:7, standard:1 },
  nummerJa:{ wer:'MIA', text:'Gib her. Aber wenn du nur hey schreibst, antworte ich nicht.',
    geh:'@nummer' },

  ja:{ wer:'MIA', text:'Okay. Aber nur kurz - Lena bringt mich sonst um.', geh:'@ja' },

  tanzGut:{ wer:'MIA', text:'Okay. Du kannst das ja wirklich.', tu:{mag:['MIA',10]},
    wahl:[
      { txt:'Komm kurz raus?',               wenn:{mag:['MIA',16]}, geh:'ja' },
      { txt:'Gibst du mir deine Nummer?',    geh:'nummerJa' },
    ], zeit:8, standard:1 },

  tanzSchlecht:{ wer:'MIA', text:'Das war... mutig. Lena lacht immer noch.', tu:{mag:['MIA',-4]},
    wahl:[
      { txt:'Mit Absicht. Fuer Lena.',       wenn:{mut:35}, geh:'ende', tu:{mag:['MIA',6]} },
      { txt:'Ich geh dann mal.',             geh:'@nett' },
    ], zeit:7, standard:1 },
};

const SOPHIE_BAUM = {
  start:{ wer:'SOPHIE', text:'Du stehst zwischen mir und der Bar. Das kostet dich einen Shot.',
    wahl:[
      { txt:'Deal. Aber du trinkst mit.',       wenn:{geld:6}, geh:'shot', tu:{geld:-6, pegel:12, mag:['SOPHIE',8]} },
      { txt:'Ich stand hier zuerst.',           geh:'konter', tu:{mag:['SOPHIE',6]} },
      { txt:'Oh. Sorry.',                       geh:'langweilig', tu:{mag:['SOPHIE',-6]} },
    ], zeit:8, standard:2 },

  langweilig:{ wer:'SOPHIE', text:'Sorry? Gott. Na gut, du darfst nochmal.',
    wahl:[
      { txt:'Dann trink ich halt zwei.', wenn:{geld:6}, geh:'shot', tu:{geld:-6, pegel:14, mag:['SOPHIE',10]} },
      { txt:'Lass mal.',                 geh:'@nein' },
    ], zeit:7, standard:1 },

  konter:{ wer:'SOPHIE', text:'Frech. Mag ich. Was trinkst du?',
    wahl:[
      { txt:'Was du trinkst.',   geh:'witz', tu:{mag:['SOPHIE',4]} },
      { txt:'Wasser.',           geh:'witz', tu:{mag:['SOPHIE',-4]} },
    ], zeit:6, standard:0 },

  shot:{ wer:'SOPHIE', text:'Auf ex! ...Okay, du bist in Ordnung.', geh:'witz' },

  witz:{ wer:'SOPHIE', text:'Erzaehl mir was Lustiges. Du hast zehn Sekunden.',
    wahl:[
      { txt:'Ich hab heute im Bus die Notbremse gezogen.', wenn:{flag:'notbremse'},        geh:'lacht', tu:{mag:['SOPHIE',14]} },
      { txt:'Ich hab mit dem Tuersteher geboxt. Und gewonnen.', wenn:{flag:'tuersteherBesiegt'}, geh:'lacht', tu:{mag:['SOPHIE',12], ruf:3} },
      { txt:'Ich wurde heute in der Schule eingesperrt.',  geh:'lacht', tu:{mag:['SOPHIE',8]} },
      { txt:'Mir faellt nichts ein.',                       geh:'frage', tu:{mag:['SOPHIE',-5]} },
    ], zeit:10, standard:3 },

  lacht:{ wer:'SOPHIE', text:'NEIN! Ernsthaft? Du bist ja komplett irre.', geh:'frage' },

  frage:{ wer:'SOPHIE', text:'Okay. Tanzen oder noch einen?',
    wahl:[
      { txt:'Tanzen.',                          geh:'@tanz' },
      { txt:'Noch einen.',                      wenn:{geld:6}, geh:'nochEiner', tu:{geld:-6, pegel:14} },
      { txt:'Weder noch. Lass raus, reden.',    wenn:{mag:['SOPHIE',18]}, geh:'ja' },
      { txt:'Gib mir deine Nummer.',            geh:'nummer' },
    ], zeit:8, standard:0 },

  nochEiner:{ wer:'SOPHIE', text:'Na also! Aber jetzt wird getanzt.', geh:'@tanz' },

  nummer:{ wer:'SOPHIE', text:'Nummer? Wie alt bist du, vierzig?',
    wahl:[
      { txt:'Einundvierzig. Also?',  wenn:{mag:['SOPHIE',8]}, geh:'nummerJa' },
      { txt:'Vergiss es.',           geh:'@nett' },
    ], zeit:7, standard:1 },
  nummerJa:{ wer:'SOPHIE', text:'Haha. Na gut, gib her.', geh:'@nummer' },

  ja:{ wer:'SOPHIE', text:'Endlich sagt mal einer was Vernuenftiges. Komm.', geh:'@ja' },

  tanzGut:{ wer:'SOPHIE', text:'JA! So muss das! Du bist mein neuer Lieblingsmensch.', tu:{mag:['SOPHIE',10]},
    wahl:[
      { txt:'Dann komm mit raus.',  wenn:{mag:['SOPHIE',16]}, geh:'ja' },
      { txt:'Nummer?',              geh:'nummer' },
    ], zeit:8, standard:1 },

  tanzSchlecht:{ wer:'SOPHIE', text:'Okay, tanzen ist nicht deins. Macht nix. Ist lustig.',
    wahl:[
      { txt:'Dann reden wir halt draussen.', wenn:{mag:['SOPHIE',20]}, geh:'ja' },
      { txt:'Nummer als Trostpreis?',        geh:'nummer' },
      { txt:'Ich geh mich schaemen.',        geh:'@nett' },
    ], zeit:8, standard:1 },
};

const KIRA_BAUM = {
  /* Wer betrunken ankommt, sieht die ruhigen Antworten gar nicht erst -
     {pegel:-54} heisst "hoechstens 54". Kira ist die eine, bei der Pegel
     nichts oeffnet, sondern alles schliesst. */
  start:{ wer:'KIRA', text:'...',
    wahl:[
      { txt:'Alles okay bei dir?',               wenn:{pegel:-54}, geh:'okay',   tu:{mag:['KIRA',8]} },
      { txt:'Hast du Feuer?',                    wenn:{pegel:-54}, geh:'feuer',  tu:{mag:['KIRA',2]} },
      { txt:'Warum stehst du so allein hier?',   wenn:{mut:40, pegel:-54}, geh:'allein' },
      { txt:'Heyyy! Laechel doch mal!',          wenn:{pegel:50}, geh:'laut' },
      { txt:'Du siehst traurig aus. Brauchst du wen?', wenn:{pegel:55}, geh:'laut' },
    ], zeit:9, standard:1 },

  laut:{ wer:'KIRA', text:'Nein.', geh:'@nein' },

  feuer:{ wer:'KIRA', text:'Ich rauch nicht. Ich steh hier nur, weil es leiser ist.',
    wahl:[
      { txt:'Verstehe ich. Drinnen ist es krass.', geh:'okay', tu:{mag:['KIRA',6]} },
      { txt:'Dann lass ich dich mal.',             geh:'@nett' },
    ], zeit:8, standard:0 },

  allein:{ wer:'KIRA', text:'Weil meine Leute weg sind. Und ich warte auf ein Taxi.', tu:{mag:['KIRA',3]}, geh:'taxi' },

  okay:{ wer:'KIRA', text:'Geht so. Meine Leute sind weg. Ich warte auf ein Taxi.', geh:'taxi' },

  taxi:{ wer:'KIRA', text:'Dauert noch.',
    wahl:[
      { txt:'Ich warte mit dir.',                  geh:'warten', tu:{mag:['KIRA',10]} },
      { txt:'Komm doch mit uns, wir ziehen weiter.', geh:'mitkommen', tu:{mag:['KIRA',-4]} },
      { txt:'Schade. Komm gut heim.',              geh:'@nett' },
    ], zeit:9, standard:2 },

  mitkommen:{ wer:'KIRA', text:'Mit fuenf fremden Jungs? Nein danke.',
    wahl:[
      { txt:'Fair. Dann warte ich mit dir.', geh:'warten', tu:{mag:['KIRA',8]} },
      { txt:'Sei doch nicht so.',            geh:'@nein' },
    ], zeit:7, standard:1 },

  warten:{ wer:'KIRA', text:'Du musst nicht. ...Aber danke.',
    wahl:[
      { txt:'Was machst du eigentlich so?',          geh:'erzaehlt', tu:{mag:['KIRA',6]} },
      { txt:'Ich wurde heute in der Schule eingesperrt.', geh:'lacht', tu:{mag:['KIRA',5]} },
    ], zeit:9, standard:0 },

  lacht:{ wer:'KIRA', text:'Wie bitte? Erzaehl.', tu:{mag:['KIRA',3]}, geh:'erzaehlt' },

  erzaehlt:{ wer:'KIRA', text:'Ich zieh naechsten Monat weg. Andere Stadt. Keiner weiss es.',
    wahl:[
      { txt:'Das klingt mutig.',                    geh:'schluss', tu:{mag:['KIRA',10]} },
      { txt:'Und warum erzaehlst du es mir?',       geh:'schluss', tu:{mag:['KIRA',6]} },
      { txt:'Krass. Egal, willst du was trinken?',  geh:'schluss', tu:{mag:['KIRA',-10]} },
    ], zeit:10, standard:1 },

  schluss:{ wer:'KIRA', text:'Mein Taxi kommt in zehn Minuten.',
    wahl:[
      { txt:'Dann haben wir zehn Minuten.',       wenn:{mag:['KIRA',32]}, geh:'ja' },
      { txt:'Gibst du mir deine Nummer?',         wenn:{mag:['KIRA',20]}, geh:'nummer' },
      { txt:'Ich bring dich zum Taxi.',           geh:'@nett', tu:{ruf:3} },
    ], zeit:10, standard:2 },

  nummer:{ wer:'KIRA', text:'Okay. Aber nur, weil du zugehoert hast.', geh:'@nummer' },
  ja:{ wer:'KIRA', text:'...Okay. Komm mit raus.', geh:'@ja' },

  /* Tanzen gibt es bei Kira nicht - sie steht draussen. Die Knoten muessen
     trotzdem existieren, falls gespraechEnde je danach fragt. */
  tanzGut:{ wer:'KIRA', text:'Du tanzt hier draussen? Okay.', geh:'schluss' },
  tanzSchlecht:{ wer:'KIRA', text:'...', geh:'schluss' },
};

const BAUM_FUER={ mia:MIA_BAUM, sophie:SOPHIE_BAUM, kira:KIRA_BAUM };

/* Die Ecke. Erzaehlt, nicht gezeigt: das Bild wird dunkel, die Zeilen
   kommen einzeln. Jede endet anders, weil jede eine andere Person ist. */
const ECKE={
  mia:[
    'IHR GEHT RAUS AUF DEN HOF.',
    'ES IST KALT. SIE STEHT TROTZDEM NAH.',
    'SIE KUESST DICH ZUERST.',
    '...',
    'IRGENDWANN RUFT LENA NACH IHR.',
    'SIE SCHREIBT DIR IHRE NUMMER AUF DIE HAND.',
  ],
  sophie:[
    'SIE ZIEHT DICH AN DER HAND DURCH DIE MENGE.',
    'HINTER DER GARDEROBE WIRD ES LEISER.',
    'SIE LACHT. DANN NICHT MEHR.',
    '...',
    'ALS IHR ZURUECKKOMMT, GRINST DER BARKEEPER.',
    'SIE HAT SICH IN DEIN HANDY GESPEICHERT. MIT HERZ.',
  ],
  kira:[
    'IHR WARTET DRAUSSEN AUF IHR TAXI.',
    'SIE REDET. DU HOERST ZU. LANGE.',
    'ALS DAS TAXI KOMMT, BLEIBT SIE NOCH KURZ STEHEN.',
    '...',
    'DANN STEIGT SIE EIN. AM FENSTER HEBT SIE DIE HAND.',
    'EINE MINUTE SPAETER VIBRIERT DEIN HANDY.',
  ],
};

/* Marvin stellt sich. Das ist der Moment, in dem man sein Gesicht zum
   ersten Mal sieht - am Ende der Nacht steht er wieder da. */
const MARVIN_BAUM = {
  start:{ wer:'MARVIN', text:'Du. Die war mit mir hier. Hast du ein Problem?',
    wahl:[
      { txt:'Sie hat sich entschieden. Nicht mein Problem.', wenn:{mut:40}, geh:'kampf' },
      { txt:'Such dir eine eigene.',                          geh:'kampf', tu:{mut:3} },
      { txt:'Ist ja gut. Kein Stress.',                       geh:'kneifen' },
      { txt:'Die Jungs sind hinter mir. Denk nochmal nach.', wenn:{crew:'DENNIS'}, geh:'rueckzug' },
    ], zeit:8, standard:1 },

  kneifen:{ wer:'MARVIN', text:'Kein Stress. Genau. Lauf.', tu:{ruf:-8, mut:-5, flag:'clubGekniffen'}, geh:'@ende' },
  rueckzug:{ wer:'MARVIN', text:'...Wir sehen uns noch. Heute Nacht.', tu:{ruf:6, flag:'marvinRueckzug'}, geh:'@ende' },
  kampf:{ wer:'MARVIN', text:'Dann komm.', geh:'@kampf' },
};
