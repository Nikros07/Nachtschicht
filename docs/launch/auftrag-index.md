# auftrag-index.md - Level 1, Die Schule (`index.html`)

Aufwand S, zusaetzlich 1:30 Erzaehlzeit (Pflicht 0:45). Voraussetzung: `auftrag-engine.md` ist gebaut. Datei: **nur `index.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md`.

## Ziel in der Geschichte

Freitag, letzter Schultag, 16:40, Nachsitzen, die Tuer ist abgeschlossen. Das Level stellt die Nacht auf: Sie ist die Nachholfahrt einer abgesagten Klassenfahrt, und der Hausmeister gibt dem Spieler den Zweitschluessel mit roter Wolle mit (Knoten 1 des roten Fadens). Max Ferdi springt durchs Fenster und sagt als Erster `BIS GLEICH!` - niemand sagt in dieser Nacht Tschuess.

## PFLICHT

1. **Haken einbauen** (`auftrag-engine.md` Kap. 6): in `starte()`, `update`, `draw`, im Aktionshandler und in `mobilKontext()`. `kapitelZeigen(1)` kommt in `starte()` direkt nach dem Titelbild. `PLAUSCH.lade([])` (in Level 1 redet keiner mit dir). Karte (Daten schreibt `auftrag-karte.md`): `16:40` / `DIE SCHULE` / `DIE TUER IST ABGESCHLOSSEN.`
2. **Titelbild** (`titelbild()`): unter `NACHTSCHICHT` die Zeile `PARTY GAME DRUNK` (Groesse 1, `P.dim`, y=34). Am Desktop unten `G: ENDEN` (Groesse 1, `P.dim`, y=H-10); am Handy kein Text (Knopf im Menue). Taste `G` im Titelmodus ruft `MENUE.galerie()` (nur `if(typeof MENUE!=='undefined'&&MENUE.galerie)`). Mit Grep `S.modus==='titel'` die Tastenstelle finden (Zeile ~688).
3. **Zwei neue Zettel** in `NOTIZEN` (Zeile ~377):
   - `ZETTEL: SPIND LEEREN BIS 17:00. DANN IST ZU.`
   - `ZETTEL: ABSCHLUSSZEITUNG. SEITEN BIS FREITAG. LEA`
   Den bestehenden Zettel `KLASSENFAHRT ABGESAGT. SCHON WIEDER.` auf `... SCHON WIEDER. - LEA` ergaenzen. Der Zettel `WER DAS LIEST SCHULDET MIR ZEHN EURO` bleibt.
4. **Der Schluessel wird Inventar:** an jeder Stelle, wo der Zweitschluessel in die Hand des Spielers kommt (gefunden im Versteck, vom Hausmeister bekommen, abgezockt; mit Grep `schluessel` und `hausmeisterHilft` suchen), `nimm:'SCHLUESSEL'` bzw. `nimmDing('SCHLUESSEL')`, dazu `meldung('ROTE WOLLE AM SCHLUESSEL.',2)`.
5. **Hausmeister-Gespraech** (`HAUSMEISTER_GESPRAECH`, Zeile ~1319): vor der Entscheidung zwei neue Knoten, in dieser Reihenfolge und nur einmal je Gespraech:
   - `Ich schliess jeden Abend ab. Ihr seht die Schule am Tag.`
   - `Ich seh sie, wenn ihr weg seid.`
   Auf dem ehrlichen Weg (`hausmeisterHilft`) beim Uebergeben: `Rote Wolle dran. Damit ich ihn finde. Tu ihn zurueck.` Auf dem Abzock-Weg keine Rede, nur die Meldung aus Schritt 4. Beziehung `HAUSMEISTER` bleibt wie sie ist.
6. **Cutscene** (`SZENEN`, Zeile ~1435): das Ende vor `LEVEL 1 GESCHAFFT` ersetzen/erweitern um diese Karten, jede 2,2 bis 2,6 s:
   - `DU: DU BIST DURCHS FENSTER GESPRUNGEN.`
   - `MAX FERDI: REDEN WIR NIE WIEDER DRUEBER.`
   - `MAX FERDI: BIS GLEICH!`
   - `MORITZ: 21 UHR BEI MIR.|ICH HAB ALLES VORBEREITET.`
   Der Cutscene-Zeichner (Zeilen ~1479 und ~2166, `SZENEN[S.szene]`) ruft fuer Texte mit `|` `zeichneKarte(txt,y,col,1)` statt `textC` (mit `typeof`-Schutz).
7. **Polaroid `moment1`** (nur wenn `flag('ferdiSpindOffen')`): nach dem Spind-Code liegt im Raum des Spinds ein Fund: `MOMENT.zeichneFund(x,y,1)` im Zeichnen, im Aktionshandler bei Naehe `MOMENT.fund(1)`. Text steht in `texte.js` (`DER FLUR, ALLE SPINDE OFFEN.|JEMAND HAT ES FESTGEHALTEN.`).

## OPTIONAL (Prioritaet)

1. Ein dritter Zettel in `NOTIZEN` fuer Lea: `ZETTEL: WER HAT MEINE KAMERA? - LEA` (pflanzt, dass sie fotografiert).
2. Lehrer-Plauschzeile entfaellt bewusst; stattdessen im Direktor-Gespraech `DIREKTOR_AUSGANG` keine Aenderung (Bestand bleibt).
3. Hangover-Fail-Karte (`DER HAUSMEISTER HAT ABGESCHLOSSEN.|ES IST NOCH FREITAG.`), sobald die Engine eine Fail-Karte mitbringt: nicht Teil dieses Auftrags.

## Flags und Werte

- **Setzt:** `moment1` (Polaroid), Inventar `SCHLUESSEL`. Bestehende bleiben unveraendert (`handyZurueck`, `hausmeisterHilft`, `ferdiSpindOffen`, `direktorVersehen`, `direktorMontag`, `direktorGeflohen`).
- **Liest:** `ferdiSpindOffen` (Polaroid), `hausmeisterHilft`.
- `starte()` ruft weiterhin `nachtZuruecksetzen()`: loescht alle neuen Flags, auch `moment1..8`. Nichts weiter noetig.

## Textbudget

Neu: 2 Zettel (je <= 50 Zeichen), 2 Hausmeister-Saetze (je <= 70 Zeichen), 1 Uebergabesatz, 4 Cutscene-Karten (je Zeile <= 44), 1 Polaroid, 1 Titelzeile, Kapitelkarte. Zusammen unter 450 Zeichen. Erzaehlzeit +1:30; Pflichtanteil (Kapitelkarte 3,5 s, zwei Hausmeister-Saetze, Cutscene-Ende) etwa 0:45; ueberspringbar: Kapitelkarte (E/Tippen), Cutscene (E halten wie bisher), Polaroid optional.

## Handy-Hinweis

- Tastennamen im Text nur in Hinweiszeilen: `E: FOTO` am Desktop; `mobilKontext()` liefert fuer die Naehe zum Polaroid `{aktion:'FOTO'}`, waehrend die Kapitelkarte `erzaehlKontext()`.
- Alle Zeilen <= 44 Zeichen, zwei Zeilen je Karte.
- Keine Blitze in diesem Auftrag. Falls das Fenster-Aufspringen in der Cutscene einen Aufheller hat: nur ueber `FX.blitz(...)`, nie mehr als `FX.hz(3)`.

## Fertig-wenn

1. `node tools/pruefe.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen (neue Flags `moment1` ist per Allowlist ok).
2. Neuer Durchlauf im Browser: Titelbild zeigt `PARTY GAME DRUNK`; Kapitelkarte erscheint einmal, E ueberspringt; Hausmeister sagt die beiden neuen Saetze; `SCHLUESSEL` steht nach Gespraech im Inventar (`hatDing('SCHLUESSEL')` im Konsolentest); Cutscene endet mit `BIS GLEICH!` und der Moritz-Karte.
3. Am Handy-Format (375 px) bricht keine Zeile ueber den Rand.
