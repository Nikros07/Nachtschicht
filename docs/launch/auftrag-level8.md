# auftrag-level8.md - Level 8, Heimweg und Finale (`level8.html`)

Aufwand L (ein Tag), zu gross fuer einen Durchgang: **zwei Durchgaenge nacheinander in derselben Datei**. **Teil A** = Pflicht 1 bis 3 (Haken, Vorgespraech, Abbiegungen); **Teil B** = Pflicht 4 und 5 (Finale, Abspann, Neustart). Teil B beginnt erst, wenn Teil A gruen ist. Zusaetzlich 3:00 Erzaehlzeit (Pflicht 1:30). Voraussetzung: `auftrag-engine.md` gebaut (`zeichneKarte`, `PLAUSCH`, `MOMENT`, `epilog.js`). Datei: **nur `level8.html`**. Namen aus `flags-vertrag.md`, Texte aus `STORY-BIBEL.md` (Kap. 4 und 7).

## Ziel in der Geschichte

04:10, die anderen biegen nach und nach ab. Wer stehenbleibt, muss Tschuess sagen, und Tschuess kostet Sonne: das ist die Frage der Nacht als Mechanik. Marvin, der Vergessene, steht auf der Strasse und hat dieselbe SMS gekriegt wie du. Am Ziel (05:20, Schichtwechsel) laufen die drei Knoten des roten Fadens zusammen: der Schluessel, `Wir sehen euch.`, und Moritz' Tschuess. Danach der Abspann.

## PFLICHT

1. **Haken** (`auftrag-engine.md` Kap. 6): `kapitelZeigen(8)` in `neuesSpiel()`; `PLAUSCH.lade(PLAUSCH_ZEILEN)`; `PLAUSCH.takt(dt, S.modus==='spiel')`. Karte: `04:10` / `DEIN HEIMWEG` / `DIE SONNE KOMMT UM 05:20.` Reset auf `false`: `marvinMitkommen`, `tschuessGesagt`, `bisGleichAmEnde`, `tschuess_jonas|dennis|semih|lea|tobi`. `INTRO[1]` wird `DIE ANDEREN BIEGEN NACH UND NACH AB.`
2. **Vorgespraech** (`vorDemKampf()`, baut die Wahlen per JS, damit Oder-Bedingungen gehen). `auftakt` erste zutreffende Zeile:
   - `marvinNachgerufen`: `Du hast gerufen. Im Club. Ich hab es gehoert.`
   - `marvinWasser`: `Danke fuer das Wasser. Das aendert nichts. Kein Stress.`
   - sonst Bestand.
   Neue erste Wahl bei `marvinKennt`: `Hast du die SMS auch gekriegt?` -> `MARVIN: Gleiche Nummer. Ich schreib so was nicht. Ich komm vorbei.`, danach dieselben Wahlen ohne diese Option (Hilfsfunktion `wahlen(ohneSms)`). **Frieden-Option** (`Heute nicht. Geh nach Hause, Marvin.`) zusaetzlich, wenn `marvinWasser` UND `marvinNachgerufen` UND Mut >= 40 (Oder zum Bestand `mut:60, ruf:65, marvinKennt`). Bei `traumEinsicht` im Frieden-Weg eine Zeile mehr: `MARVIN: ...Lea hat auch zu mir gesagt: Man darf.`
3. **Abbiegungen** im Wettlauf (nur wenn Sonne-Vorsprung > 8 s, sonst frei: `S.licht < 100 - 8*100/TUNE.lichtDauerBasis`). `TUNE`: `abbiegeBei:[0.15,0.30,0.45,0.60,0.75]` (Anteile von `ZIEL_X`; fuenf Slots, damit alle fuenf Abbieger drankommen koennen), `abbiegeFenster:2.0`, `abbiegeFensterKira:3.0`, `abbiegeKosten:1.5` (Sekunden Sonne, umgerechnet `1.5*100/lichtDauerBasis`). Reihenfolge der Abbieger (nur Crew, je ein Slot, Slots ohne Crew-Figur entfallen; das Kampf-Vorgespraech laeuft vorher, Crew hilft dort noch mit). **Neue Faehigkeit:** Level 8 zeichnet im Wettlauf keine Crew. Der Abbieger erscheint als Figur (`sprite`, Typ `steh` mit `tint` je Figur, wie in `level7.html`) am Strassenrand, nur waehrend seines Fensters; sonst gibt es keine Crew-Sprites und keine Crew-Bewegung: `DENNIS`, `SEMIH`, `JONAS`, `LEA`, `TOBI`; `MAX FERDI` und `MORITZ` biegen nie ab. Am Slot: Plausch `NAME: HIER LANG. BIS GLEICH.` (`PLAUSCH.sag`), Hinweis `E: TSCHUESS` (Handy-Knopf `TSCHUESS`, `mobilKontext` liefert `{aktion:'TSCHUESS'}`) fuer das Fenster (3,0 s bei `kiraTschuess`). Taste im Fenster: Figur bleibt stehen (Tempo 0) fuer `abbiegeKosten`, setzt `tschuess_<name>` (`wirke({flag:'tschuess_'+n.toLowerCase()})` mit literalem Namen je Zweig, damit `flagcheck` liest), `mag:[NAME,4]`, Antwort per Plausch: `DENNIS: PASST.` / `SEMIH: ICH RUF AN. KENN DEINE NUMMER.` / `JONAS: EHRLICH? ICH SCHREIB DIR.` / `LEA: SEITE 9. WARTE AB.` / `TOBI: 05:17. BRUECKE. FALLS DU FRAGST.` Wer nichts drueckt, laeuft durch; keine Strafe.
4. **Finale SCHICHTWECHSEL** (`starteFinale()`, ruft `pruefeZiel` und im Sonne-Ende `pruefeSonne` statt `starteCutscene`): Modus `finale`, Kartenfolge, ca. 75 s, jede Karte antippbar (`druckAktion`: `S.szeneT+=99`), E halten 0,7 s springt zur Abspann-Folge (`starteCutscene()`); Karten ueber `zeichneKarte`, Wahlen ueber `starteGespraech` (`zeit:0`).
   - Ort: `heim` `DEINE STRASSE. 05:20.`, `weiter` `DIE BAECKEREI AN DER ECKE. 05:20.`, `sonne` `DIE BRUECKE. 05:17.` (bei `tobiBruecke`, sonst `05:20.`).
   - Anwesend im Finale sind nur MORITZ und MAX FERDI (beide gehen in L7 nie heim) plus Marvin, die Baeckerin und Ali; die Abbieger sind weg, kein anderer Crew-Name spricht hier.
   - Moritz (immer da): `MORITZ: ICH ZIEH IM SEPTEMBER WEG.|ICH HAB VIER ANLAEUFE GEBRAUCHT.` Dann `moritzGeheimnis`: `DU: ICH WEISS.` sonst `DU: WAS?` + `MORITZ: DIE KARTONS. ICH HAB ES GEPLANT.|NUR NICHT, WIE MAN ES SAGT.` Bei `traumEinsicht` und Lea in der Crew danach die Handykarte `LEA (HANDY): DU DARFST STEHENBLEIBEN.|ES GEHT NICHTS KAPUTT.` (nicht als Figur im Bild; Lea ist abgebogen oder weit hinten).
   - Marvin (nur `marvinKennt`, Zeile je Ausgang): Frieden `MARVIN: IHR HABT DAS TRIKOT NOCH. GUT.`; gewonnen `MARVIN: IHR HABT DAS TRIKOT NOCH.`; verloren `MARVIN: KEIN STRESS.` Wahl `Kommst du mit?` (`flag:'marvinMitkommen'`, `mag:['MARVIN',6]`) / `Mach's gut.` / `(nicken)`; Marvin summt bei Frieden/Mitkommen.
   - Alle drei Orte liegen im Viertel: Baeckerei und Alis Laden stehen bei `heim`, `weiter` und `sonne` im Hintergrund (Rollladen, Tuer); bei `sonne` unten am Kanal.
   - Baeckerin: `BAECKERIN: FRUEH DRAN HEUT.|BROETCHEN SIND GLEICH FERTIG.` Dazu ein Hupton, kein Blitz.
   - UNBEKANNT: Karte `UNBEKANNT: WIR SEHEN EUCH.` Wahl nur wenn `wirEuchAuch` noch aus: `Wir euch auch.` (`flag:'wirEuchAuch'`) / `Wer bist du?`. Ali tritt aus der Tuer: `ALI: ICH MERK MIR GESICHTER.|MEIN VIERTEL PASST AUF SICH AUF.` Bei `aliNummer` dazu `ALI: DEINE NUMMER STAND AUF DER TUETE.`, sonst `ALI: KEINE TUETE. EGAL. GESICHT HAB ICH.` Ohne Handy (`!flag('handyZurueck')`) vorher `MORITZ HAELT DIR SEIN HANDY HIN.`
   - Moritz: `MORITZ: TSCHUESS.` Wahl `Tschuess.` (`tschuessGesagt`, `mag:['MORITZ',6]`) / `Bis gleich.` (`bisGleichAmEnde`) / `Bis September.` (`bisGleichAmEnde`). Dann `MAX FERDI SETZT SICH ALS ERSTER.|DAS IST NEU.`
   - Schluessel: bei `schluesselVersprochen` `ZWEI SCHLUESSEL IN DER HAND.|EINER ZUM RAUSKOMMEN. EINER ZUM HEIMKOMMEN.`, sonst `EIN SCHLUESSEL IN DER HAND.|DER ZUM HEIMKOMMEN.`
   - Polaroid: `MOMENT.fund(8)` als Karte (`ERSTES LICHT.|ALLE DREHEN SICH WEG. NUR EINER NICHT.`), automatisch, kein Fundort.
   - Letzte Karte: `DIE SONNE KOMMT. DU RENNST NICHT MEHR.|ES IST GUT.` (`FX.ruhig`: der Himmel hellt ohne Blitz auf.)
5. **Abspann** (`baueEnde()`): Reihenfolge laut `STORY-BIBEL.md` Kap. 7: Weg- und Kampfzeile wie bisher, dann `abspannMitte(p)`, Mama (3 Varianten, danach `SIE SAGT NICHT, WORAUF.`), `abspannSchluss(p)`, `ENDE: <Titel>`, `ENDEN GESEHEN: n VON 10`, `Party Game drunk`. Streichen: `TOBI HAT JETZT EINE NEUE CREW.`, die vier Nachhallzeilen (statt vier jetzt drei, `NACHHALL_ANZAHL=3`). `NACHHALL`-Aenderungen laut Bibel: `lenaVersorgt` mit JULE, `direktorMontag` `ZEUGNISVERGABE: ER SIEHT DICH ZUERST AN.`, Moritz `<=-10`. Zeile 515 (`NACHT.gesehen.push`) ersetzen durch `endeRegistrieren(titel)`. Den bestehenden Endbildschirm (Zeile ~815) von `VON 9` auf `VON 10` stellen (`ENDEN_ALLE.length`). Cutscene-Zeichner (Zeile ~803) ruft `zeichneKarte` und `zeichneWolle` bei `z.art==='wolle'`.

6. **Nach dem Abspann / Neustart** (Zeilen ~315 bis 328, ~810): der Endbildschirm bleibt wie er ist: `E` (Tippen) = `location.href='index.html'`, dort `starte()` -> `nachtZuruecksetzen()` loescht Flags (auch `moment1..8`), Inventar, Pegel, Crew, behaelt aber `gesehen`, `knotenBest`, `momenteBest`. Leertaste (nur Level 8) behaelt die Flags der Nacht; `tschuess_*`, `marvinMitkommen`, `tschuessGesagt`, `bisGleichAmEnde` werden dabei durch den Levelstart zurueckgesetzt. Kein Abspann-Replay.

## OPTIONAL (Prioritaet)

1. Plausch: `ROCKY: WUFF.` (`nach:30`), `KAPPE: DU SCHON WIEDER.` bei `busGezahlt`, `DAS WAR EIN GUTER BUS.` (Max, `busDurchDieCrew`), `TOBI: 05:19. KORREKTUR: 05:17.`
2. Fail-Karte bei Erwischt: `DER HAUSMEISTER HAT ABGESCHLOSSEN.|ES IST NOCH FREITAG.` oder bei Blackout `DU WACHST AUF. DU HAELST EIN SCHILD.|KEINE FRAGEN.`
3. Kappe als Handlanger im Kampf: `Du schon wieder.` (Bestand, bei `busKloppeGewonnen` blaues Auge).

## Flags und Werte

- **Setzt:** `marvinMitkommen`, `wirEuchAuch`, `tschuessGesagt`, `bisGleichAmEnde`, `tschuess_jonas|dennis|semih|lea|tobi`, `moment8`; Beziehungen Abbiegung +4 (je Figur), `MORITZ` +6, `MARVIN` +6. Bestehend: `fightGewonnen|Verloren|Frieden`, `friedlich`, `mutigerKopf`.
- **Liest:** `marvinNachgerufen`, `marvinWasser`, `marvinKennt`, `moritzGeheimnis`, `traumEinsicht`, `kiraTschuess`, `aliNummer`, `schluesselVersprochen`, `tobiBruecke`, `handyZurueck`, `endeHeim|endeWeiter|endeSonne`, `busGezahlt`; Pegel (Kater).

## Textbudget

Neu: Vorgespraech 6 Zeilen, Abbiegungen 10, Finale ca. 40 Karten-Zeilen, Abspann ca. 30 Zeilen. Zusammen ca. 3500 Zeichen. Pflicht 1:30: Marvin-Vorgespraech, Abbiegungen (freiwillig, keine Strafe), Finale 75 s, Abspann 60 bis 90 s (antippbar, E halten ueberspringt).

## Handy-Hinweis

- Buttons: `TSCHUESS` (Fenster), `WEITER` (Finale). Tastenhinweise nur im Hinweistext. Karten brechen ueber `zeichneKarte`; nie ueber 44 Zeichen je Zeile.
- Das Abbiege-Fenster blendet `TSCHUESS` am Knopf ein, ohne Blinken (`FX.ruhig()` respektieren). Stroboskop-Effekte des Kampfes bleiben ueber `FX.blitz`/`FX.wackel`; im Finale gar keine.

## Fertig-wenn

1. `node tools/pruefe.js`, `node test/kampf.test.js`, `node tools/nachttest.js`, `node tools/flagcheck.js` gruen: die sieben "verloren" aus dem Ist-Stand sind weg (`fightVerloren`, `friedlich`, `endeHeim` gelesen).
2. `nachttest`: Finale und `baueEnde` laufen mit leerem Speicherstand und mit allen Flags auf `true` ohne Ausnahme; Wolle zeigt 0 bis 3 Knoten; `SCHICHTWECHSEL` erscheint nur bei allen drei.
3. Browser: Abbiegefenster mit 2,0 s und mit `kiraTschuess` 3,0 s; Wettlauf bleibt schaffbar (Test: alle Fenster nutzen, Sonne reicht noch); alle drei Finale-Orte; 375 px ohne Zeilenueberlauf.
