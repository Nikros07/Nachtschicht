# auftrag-level6.md - Level 6, Afterhour, der Traum (`level6.html`)

Aufwand M, zusaetzlich 2:30 Erzaehlzeit (Pflicht 1:30). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level6.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

02:00, die Afterhour, und der Spieler traeumt die Schule zurueck, verzerrt, alle Uhren auf 17:30. Hier antworten die Echos aus Level 1 und 2: der Hausmeister mit dem Schluessel (Knoten 1), Moritz mit den Kartons, Marvin mit dem Trikot. Lea stellt die Frage der Nacht, `Warum rennst du die ganze Nacht?`, und gibt die Antwort, die das Spiel seit Level 1 schuldet: Wer stehenbleibt, muss Tschuess sagen. Das ist nicht schlimm.

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6). `kapitelZeigen(6)` in `neuesSpiel()`. Karte: `02:00` / `AFTERHOUR` / `ALLE UHREN ZEIGEN 17:30.` `PLAUSCH.lade(PLAUSCH_ZEILEN)`. Wo der Traum eine Uhrzeit oder Wanduhr zeichnet (Grep `UHR`, `:30`), steht `17:30`.
2. **Hausmeister-Echo** (bestehender Knoten `HAST DU MEINEN SCHLUESSEL GESEHEN.`, per Grep): wird ein Gespraech mit Wahl:
   ```js
   const HAUSMEISTER_ECHO={
     start:{ wer:'HAUSMEISTER', text:'Hast du meinen Schluessel gesehen.',
       wahl:[ { txt:'Hier. Ich bring ihn zurueck.', wenn:{hat:'SCHLUESSEL', flag:'hausmeisterHilft'},
                tu:{flag:'schluesselVersprochen', mag:['HAUSMEISTER',6]}, geh:'gutH' },
              { txt:'Hier. Ich bring ihn zurueck.', wenn:{hat:'SCHLUESSEL', nichtFlag:'hausmeisterHilft'},
                tu:{flag:'schluesselVersprochen', mag:['HAUSMEISTER',6]}, geh:'gut' },
              { txt:'Welchen?', geh:'welchen' },
              { txt:'Ich hab ihn nicht mehr.', wenn:{nichtHat:'SCHLUESSEL'}, geh:'weg' } ], zeit:0 },
     gutH:   { wer:'HAUSMEISTER', text:'Gut gemacht. Dann fehlt nichts.', geh:'sehen' },
     gut:    { wer:'HAUSMEISTER', text:'Gut. Dann fehlt nichts.',        geh:'sehen' },
     welchen:{ wer:'HAUSMEISTER', text:'Den mit der roten Wolle.',      geh:'sehen' },
     weg:    { wer:'HAUSMEISTER', text:'Dann sucht er sich selbst.',    geh:'sehen' },
     sehen:  { wer:'HAUSMEISTER', text:'Ich seh die Schule, wenn ihr weg seid.', geh:'@ende' },
   };
   ```
   (`wenn:{hat:..., flag:...}` wirkt als Und; `nichtHat` ist neu in `nacht.js` (Engine-Auftrag): so erscheint `Ich hab ihn nicht mehr.` nur ohne Schluessel. Bei `gut`/`gutH` die Wachheit wie bei den guten Antworten im Bestand erhoehen, Grep `wach`, Wert +20.)
3. **Moritz-Echo, dritte Option** im bestehenden Baum `Hast du mich heute eigentlich gefragt, ob ich mitwill? Oder einfach entschieden?`: neue Wahl `Ich hab die Kartons gesehen.` mit `wenn:{flag:'moritzKartonGesehen'}`, `tu:{flag:'moritzGeheimnis', mag:['MORITZ',6]}` und Antwort `MORITZ: Dann weisst du's. Sag's den anderen nicht. Noch nicht.` (Wachheit +, wie bei guten Antworten).
4. **Marvin-Echo:** vor der bestehenden Zeile `Du hast Angst vor mir. Ich seh das.` ein Knoten. Einstieg waehlt der Code: bei `flag('marvinNachgerufen')` `MARVIN: Du hast gerufen. Ich hab es gehoert.` sonst `MARVIN: Ihr habt mich nach der sechsten nicht mehr gefragt. Ich hab gewartet.` Danach unveraendert weiter (`angstZugegeben` bleibt).
5. **Lea fuehrt und fragt** (ersetzt den knappen Lea-Auftritt am Ende; `Das hier ist nicht echt. Aber du bist es.` bleibt als letzter Satz):
   ```js
   const LEA_FRAGE={
     start:{ wer:'LEA', text:'Ich hab euch den ganzen Abend fotografiert. Seite 9.', geh:'frage' },
     seite:{ wer:'LEA', text:'Du hast meine Fotos gefunden. Mindestens drei. Gut.', geh:'frage' },
     frage:{ wer:'LEA', text:'Warum rennst du die ganze Nacht?',
       wahl:[ { txt:'Weil danach alles anders ist.', tu:{flag:'traumEinsicht', mag:['LEA',8]}, geh:'a' },
              { txt:'Ich renn nicht.',               tu:{mag:['LEA',3]}, geh:'b' },
              { txt:'Keine Ahnung.',                 tu:{mag:['LEA',3]}, geh:'c' } ], zeit:0 },
     a:{ wer:'LEA', text:'Wenn du stehenbleibst, ist es vorbei. Stimmt nicht.', geh:'a2' },
     a2:{ wer:'LEA', text:'Aber ich versteh\'s.', geh:'uhr' },
     b:{ wer:'LEA', text:'Okay. Dann sitzt du ganz ruhig da.', geh:'uhr' },
     c:{ wer:'LEA', text:'Das ist auch eine Antwort.', geh:'uhr' },
     uhr:{ wer:'LEA', text:'Die Schule hat jeden Abend um halb sechs zu.', geh:'uhr2' },
     uhr2:{ wer:'LEA', text:'Auch heute. Das ist nicht schlimm.', geh:'echt' },
     echt:{ wer:'LEA', text:'Das hier ist nicht echt. Aber du bist es.', geh:'@ende' },
   };
   ```
   Einstiegsknoten: `MOMENT.anzahl()>=3 ? 'seite' : 'start'`. Antwort `a` gibt zusaetzlich Wachheit +30 wie im Bestand fuer `traumEinsicht`. Crew `LEA` wie bisher am Ende.
6. **Aufwachen-Karte** (bisher `GUTEN MORGEN. ES IST HALB VIER.`) ersetzen durch `LEA: GUTEN MORGEN. ES IST HALB DREI.|DIE ANDEREN SIND SCHON UNTEN. SPAETI.` (Karte mit `|` ueber `zeichneKarte`).
7. **Polaroid `moment6`**: die stehende Wanduhr in einem Raum des Traums (Flur oder Raum 101): `MOMENT.zeichneFund(x,y,6)`, `MOMENT.fund(6)`. Text in `texte.js`: `DIE WANDUHR. SIE STEHT.|17:30. SEIT HEUTE NACHMITTAG.`

## PLAUSCH_ZEILEN (Traum-Stimmung, 2 Zeilen; kein Moritz-Anlauf, es gibt genau vier: L2, L3, L5, L7)

```js
{id:'l6a', wer:'LEA',    text:'ICH FOTOGRAFIER NUR.', nach:14},
{id:'l6c', wer:'LEA',    text:'ALLE UHREN SIND STEHENGEBLIEBEN.', nach:70},
```

## OPTIONAL (Prioritaet)

1. `traumEinsicht` bleibt Knoten der Antwort; im Echo-Raum der Direktor-Zeile `ICH KOMME GLEICH VORBEI.` keine Aenderung.
2. Mia-Traum-Zeile `Schreibst du mir morgen? Oder war das nur heute Nacht?` unveraendert lassen (steht im Bestand).
3. Handy-Toast im Traum: wenn `HANDY` eine Nachricht (`unbekannt2`) bringt, den Traum nicht unterbrechen (Handy bleibt zu).

## Flags und Werte

- **Setzt:** `schluesselVersprochen`, `moritzGeheimnis`, `moment6`; Beziehung `HAUSMEISTER` +6, `MORITZ` +6, `LEA` +8/+3. Bestehend: `traumMoritz`, `traumEinsicht`, `versprochen_*`, `angstZugegeben`.
- **Liest:** Inventar `SCHLUESSEL`, `hausmeisterHilft`, `moritzKartonGesehen`, `marvinNachgerufen`, `MOMENT.anzahl()`.
- **Reset beim Levelstart:** `schluesselVersprochen`, `moritzGeheimnis` auf `false`.

## Textbudget

Neu: Hausmeister 8 Zeilen, Moritz 2, Marvin 2, Lea 11, 2 Plauschzeilen, 1 Polaroid, Kapitelkarte, Aufwachen-Karte. Zusammen ca. 1200 Zeichen. Pflicht 1:30 (Karte, Hausmeister 20 s, Lea 40 s, Moritz-Option), Rest Marvin-Echo, Plausch, Polaroid; die Traumszenen bleiben im Tempo des Bestands.

## Handy-Hinweis

- Gespraechsantworten ueber die bestehenden Gespraechsflaechen; Polaroid `{aktion:'FOTO'}`; Tasten nur als Hinweis (`E: FOTO`).
- Zeilen <= 44 Zeichen auf Karten; Gespraechsknoten hoechstens zwei Zeilen: die langen Lea-Saetze sind oben schon in zwei Knoten geteilt (`a`/`a2`, `uhr`/`uhr2`).
- Traum-Verzerrung und Wackeln nur ueber `FX.wackel`, `FX.blitz`, `FX.hz`; bei `FX.ruhig()` bleibt das Bild stehen.

## Fertig-wenn

1. `node tools/pruefe.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen: `moritzKartonGesehen`, `marvinNachgerufen` und `traumEinsicht` haben nun Leser.
2. Browser: alle Wahlmoeglichkeiten durchklicken (mit/ohne `SCHLUESSEL`, mit/ohne Kartons, mit/ohne `marvinNachgerufen`); keine toten Gespraechsverweise (`nachttest`); Aufwachen-Karte sagt `HALB DREI`; die Uhr im Traum zeigt `17:30`.

## Spaeter

- Moritz-Plauschzeile im Traum (`DU, ICH MUSS DIR WAS... SPAETER.`, bei `moritzKartonGesehen`): gestrichen (fuenfter Anlauf, und der Traum-Moritz hat schon die Kartons-Option).
