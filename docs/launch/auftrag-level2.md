# auftrag-level2.md - Level 2, Vorgluehen bei Moritz (`level2.html`)

Aufwand M, zusaetzlich 2:00 Erzaehlzeit (Pflicht 1:00). Voraussetzung: `auftrag-engine.md` gebaut. Datei: **nur `level2.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

21:10 bei Moritz. Er hat aufgeraeumt, was er noch nie getan hat, und plant den Abend, damit keiner ueber September reden muss. Der Spieler stellt die Gruppe zusammen und findet zwei unbeschriftete Kartons. Moritz setzt zum ersten Mal an, `Du, ich muss dir was...` (Anlauf 1), und es klingelt.

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6). `kapitelZeigen(2)` in `neuesSpiel()`. Karte: `21:10` / `BEI MORITZ` / `MORITZ HAT AUFGERAEUMT. DAS HAT ER NOCH NIE.` (Daten in `texte.js`). `PLAUSCH.lade(PLAUSCH_ZEILEN)`.
2. **Zeit-Reparatur "Bahn" wird "Bus":** mit Grep `Bahn`/`BAHN` in der ganzen Datei finden und ersetzen (u. a. `MAX FERDI: BAHN. JETZT.` wird `MAX FERDI: BUS. JETZT.`). Uhrzeit-Texte auf die Zeitleiste der Bibel (Abfahrt 22:00) pruefen.
3. **Kartons-Szene** in Moritz' Zimmer (Fundstelle wie die anderen Aufgabenobjekte; neues Objekt `kartons` mit Aktion E, `mobilKontext` `{aktion:'KARTONS'}`). Gespraechsbaum, einmalig:
   ```js
   const KARTONS={
     start:{ wer:'', text:'Zwei Kartons. Nicht beschriftet.',
       wahl:[ { txt:'Was ist da drin?', tu:{flag:'moritzKartonGesehen', mag:['MORITZ',4]}, geh:'zeug' },
              { txt:'Egal. Weiter.', geh:'@ende' } ], zeit:0 },
     zeug:{ wer:'MORITZ', text:'Zeug. Muss mal aussortiert werden.', geh:'@ende' },
   };
   ```
   (Wenn der Gespraechsrahmen `wer:''` nicht kann: `wer:'ERZAEHLER'`.) Der Anlauf `Du, ich muss dir was...` kommt in L2 nur einmal, an der Tuer (naechster Punkt): Anlauf 1 von vier.
4. **Anlauf 1 vor dem Tuerkampf:** beim Betreten des Flurs/der Tuer feuert `PLAUSCH.ausloeser('tuer')` die Zeile `MORITZ: DU, ICH MUSS DIR WAS...`; die naechste Zeile (nach 2,5 s) `*ES KLINGELT*` (als `PLAUSCH.sag('', '*ES KLINGELT*')` oder als Meldung). Bei `flag('gruppeKlein')` stattdessen die Langform als Dialogzeile im Mitnehmen-Echo: `Nur wir zwei? ...Okay. Ich muss dir eh was sagen.`
5. **Hinweiszeile:** beim ersten Betreten des Flurs `meldung('DER SCHULSCHLUESSEL KLIMPERT IN DER TASCHE.',2.4)`, nur wenn `hatDing('SCHLUESSEL')`.
6. **Cutscene `SZENEN`** (Zeile ~696): die drei Trikot-Karten ersetzen, Rest unveraendert:
   - `MORITZ: WARTE - MEIN TRIKOT`
   - `DU: DAS PASST DIR SEIT DER|SECHSTEN NICHT MEHR.`
   - `MORITZ: EBEN. DAS BRINGT GLUECK.`
   Der Cutscene-Zeichner nutzt fuer `|`-Texte `zeichneKarte(txt,y,col,1)` (wie in `auftrag-index.md` Schritt 6). Die Zeile `DU: DAS TRAEGST DU SEIT DREI TAGEN` entfaellt ersatzlos.
7. **Polaroid `moment2`** (Pinnwand in Moritz' Zimmer): `MOMENT.zeichneFund(x,y,2)`, im Aktionshandler `MOMENT.fund(2)`. Text in `texte.js`: `MORITZ UND DU, SIEBTE KLASSE.|BEIDE MIT FURCHTBARER FRISUR.`

## PLAUSCH_ZEILEN (Pflicht-Daten, 5 Zeilen)

```js
{id:'l2a', wer:'MORITZ',    text:'ICH HAB AUFGERAEUMT. FRAG NICHT.', nach:8},
{id:'l2b', wer:'MAX FERDI', text:'ALTER WO BLEIBT DER REST', nach:30, wenn:{nichtFlag:'gruppeKlein'}},
{id:'l2c', wer:'FINN',      text:'ZZZZZ... ICH HAB ALLES GEHOERT.', ausloeser:'finnWach'},
{id:'l2d', wer:'DAVID',     text:'JA GUT. AUFGELEGT.', ausloeser:'davidAb'},
{id:'l2e', wer:'MORITZ',    text:'DER BUS FAEHRT UM 22:00. KEIN DRUCK.', nach:55},
```
`PLAUSCH.ausloeser('finnWach')` beim Wecken von Finn (Energydrink), `'davidAb'` beim Abnehmen des Handys. Beide ersetzen kein bestehendes Gespraech, sie kommen danach.

## OPTIONAL (Prioritaet)

1. Zweite Moritz-Plauschzeile bei `moritzKartonGesehen`: `MORITZ: DIE KARTONS WAREN NUR ZEUG. JA.` (nach 15 s nach dem Fund).
2. Beim Trikot-Fund (falls im Level ein Trikot-Objekt existiert): `MORITZ: NUMMER 7. GROESSE 140. ES HAELT.` als Meldung.
3. Echo auf die Mitnehmen-Wahl als Karte `GRUPPE: VIER MANN. DAS WIRD LAUT.` (nur bei `gruppeGross`), 2 s.

## Flags und Werte

- **Setzt:** `moritzKartonGesehen` (Kartons), `moment2`; Beziehung `MORITZ` +4 (Kartons). Bestehend: `gruppeGross`/`gruppeKlein`, Crew MORITZ/FINN/DAVID.
- **Liest:** `gruppeKlein`, `gruppeGross`, Inventar `SCHLUESSEL`.
- **Reset beim Levelstart:** `moritzKartonGesehen` auf `false` (zusammen mit `gruppeGross`/`gruppeKlein`, die schon dort geloescht werden).

## Textbudget

Neu: Kartons-Baum (4 Zeilen), 5 Plauschzeilen (je <= 44 Zeichen inkl. `WER: `), 2 Anlauf-Zeilen, 1 Hinweiszeile, 3 Cutscene-Karten, 1 Polaroid, Kapitelkarte. Zusammen ca. 700 Zeichen. Pflicht 1:00 (Karte 3,5 s, Kartons 15 s, Cutscene), Rest Plausch und Funde.

## Handy-Hinweis

- Aktion fuer die Kartons und das Polaroid: `E` am Desktop, am Handy der Hauptknopf; `mobilKontext()` liefert `{aktion:'KARTONS'}` bzw. `{aktion:'FOTO'}`, waehrend der Kapitelkarte `erzaehlKontext()`.
- Zeilen <= 44 Zeichen, zwei Zeilen je Karte. Keine neuen Blitze; der bestehende Pegel-Schwank im Level laeuft weiter ueber `FX.wackel`.
- `SMS lea1` (`ab:2`) schreibt der Karte-Agent in `handy.js`; kein Eingriff hier.

## Fertig-wenn

1. `node tools/pruefe.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen; `moritzKartonGesehen` hat Leser (L6/L7 laut Vertrag; bis dahin darf `flagcheck` ihn melden).
2. Im Browser: Kapitelkarte, Kartons-Wahl setzt Flag und Beziehung, Hinweiszeile kommt nur mit Schluessel, Trikot-Cutscene zeigt die neue Zeile mit Zeilenumbruch, nirgends mehr `BAHN`.
3. Der Konter-Test im `nachttest` laeuft weiter durch.
