# NACHT-LOG — Protokoll der Nachtroutine

*(Wird angehängt, nicht überschrieben. Neueste Einträge oben lesen? Nein -
chronologisch, ältester zuerst, wie ein Logbuch.)*

---

## 2026-10-01 — Nacht — Test und Bau

Start-Commit: `df02d2664867bbac4a50c413da34b8fc5751801d`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
61/50/7 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig, direkt
mit der Liste weitergemacht.

### Erledigt (5 Punkte, ~35 Minuten)

1. **Nachttest: Software-Canvas für Pixelmessung** · `307b659` — echter Pixelpuffer in
   `tools/nachttest.js` (fillRect/drawImage/Pfade/Verläufe, translate/scale/rotate).
   Leere Bildzeilen, gemittelt über den 60-s-Zufallslauf, gegen die Browser-Referenz aus
   PLAYTEST.md: Wohnung 65 % (Referenz 66, Diff 1) · Club 78 % (73, Diff 5) · Afterhour
   69 % (72, Diff 3) · Späti 73 % (77, Diff 4) · Heimweg 76 % (77, Diff 1) — alle
   innerhalb der 8 Punkte. Vorher: gar keine Pixelmessung möglich.
2. **Bus: Ablenkung zog Kontrolleure auf den Spieler zu** · `5dbf1c1` — Ziel war die
   feste Position des Betrunkenen, die zwangsläufig nah am Spieler liegt (man muss dort
   hin, um mit ihm zu reden). Vorher/nachher am nächsten Kontrolleur (Spieler reglos,
   8 s Ablenkung): Abstand sank von 85 px auf 0 und löste Alarm aus → Abstand wächst auf
   289–668 px, kein Alarm.
3. **Club: Ausgang öffnete ab Sekunde 0 ohne Grund** · `297f845` — abgespalten vom
   größeren Club-Punkt (siehe Blockiert). Jetzt zählt die Tür erst als Ziel nach
   mindestens einer Interaktion (`S.warAktiv`). Vorher/nachher: direkter Lauf zum
   Ausgang ohne Interaktion öffnete ihn (Modus → cutscene) / öffnet ihn jetzt nicht
   mehr (Modus bleibt spiel), nach einer Interaktion schon.
4. **Level 2: Mitnehmen-Wahl kam nach dem Kampf** · `b524a82` — stand am Levelende,
   wenn ohnehin schon alle vier Aufgaben erledigt waren. Jetzt steht sie am
   Levelanfang, `aktiveAufgaben()` filtert die Liste danach (bei „klein" fehlen
   Schläfer+Telefonierer, bei „mittel" nur der Telefonierer). Dazu: DER SCHLÄFER/DER
   TELEFONIERER heißen jetzt FINN/DAVID mit je drei eigenen Sätzen. Gemessen: bei
   „klein" reichen jacke+ausweis zum Auslösen des Kampfs, Crew danach [MORITZ, MAX
   FERDI]; bei „alle" bleibt es ohne Schläfer+Telefonierer blockiert, danach Crew
   [MORITZ, MAX FERDI, FINN, DAVID].
5. **Bus: blinkendes E über Verstecken erschien nie** · `ba1890b` — Zeichenroutine
   prüfte Tiefe hartkodiert (`<=0.3`) statt mit `tiefeNah()` wie `naheVersteck()`.
   Da S.tiefe im Bus (Tiefe aus) bei gangTiefe (0.72) steht und alle Verstecke
   t 0.10–0.20 haben, war die Bedingung nie erfüllt. Verstecken selbst funktionierte
   die ganze Zeit (naheVersteck() prüft richtig) — nur das Blinken fehlte.

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js --kurz erneut
grün; `verloren` in flagcheck.js blieb durchgehend bei 7 (keine neuen verwaisten Flags).

### Blockiert (bewusst nicht gebaut, kein Code geändert)

- **Club zum Ort machen: vier von sechs Bereichen sind leer** — zu groß für einen
  Eingriff (Ausgang-Bedingung, echter Inhalt für vier Bereiche, mehr
  Nichtstun-Ereignisse sind drei verschiedene Dinge). Ausgang-Teil abgespalten und
  erledigt (siehe oben); der Inhaltsteil bleibt als eigener, kleinerer Punkt offen.
- **Obere Bildhälfte füllen** — Club müsste von ~78 % auf unter 45 % leere Zeilen, das
  braucht durchgehende neue Deko über die ganze Levelbreite, kein kleinster Eingriff.
  Jetzt mit echter Messzahl statt Schätzung dokumentiert.
- **Level 4: jede Phase soll die vorige Antwort entwerten** (P2) — kurz geprüft:
  Phase 2 unterscheidet sich bereits von Phase 1 (Rammstoß, unblockbar, braucht
  Ausweichen statt Kontern). Phase 3 bräuchte eine echte neue Mechanik, und die
  Kampfbalance in Level 4 ist laut Liste bereits an zwei Stellen (Pegel verengt das
  Fenster, Phase-3-Timing) als heikel markiert — nicht unter Zeitdruck angefasst.
  Nicht unter „Blockiert" eingetragen, da nicht wirklich versucht; bleibt unter „Offen".

### Beobachtung ohne Codeänderung

Level 2 meldet im Nichtstun-Test jetzt 0 statt vorher 1 Ereignis (`nachttest.js`
verfolgt nur `S.meldung`/`S.modus` — ein Dialog-Overlay wie die neue Mitnehmen-Wahl am
Levelanfang zählt dort nicht als Ereignis). Geprüft, kein neuer Softlock: die Wahl hat
`zeit:10` und wählt bei Nichtstun automatisch die Standardoption; die anschließende
Antwortzeile von MAX FERDI braucht wie jeder andere Dialog im Spiel einen Tastendruck
zum Weiterblättern — das ist ein bestehendes, durchgängiges Muster (jeder Dialog ohne
eigene `wahl` braucht E), nicht neu. Für einen Spieler, der gerade aktiv das Intro
übersprungen hat, ist das keine reale Blockade.

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P1: **Club: vier von sechs Bereichen bekommen
Inhalt** (braucht neue Sprites/Deko oder ambiente Ereignisse — echtes Gestaltungsthema,
kein kleinster Eingriff). Danach P2, angeführt von den beiden Level-4-Kampf-Punkten.

---

## 2026-10-02 — Nacht — Test und Bau

Start-Commit: `93268fee17b6db4080d39bf9ed8217bda3b1fc46`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
61/50/7 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig. Einzige
Auffälligkeit: level2.html meldet im Nichtstun-Test jetzt 0 statt 1 Ereignis (190 s) vom
Vortag — erklärt, kein Fehler (siehe NACHT-BERICHT.md): die MITNEHMEN-Wahl sitzt seit
gestern am Levelanfang, ihre Antwortzeile braucht wie jeder Dialog im Spiel ohne eigenes
`wahl` einen Tastendruck zum Weiterblättern.

### Erledigt (7 Punkte gebaut, 1 Punkt blockiert, ~29 Minuten)

1. **Club-Uhr: Ambient-Ereignisse gegen die 193-s-Stille** · `afea7a1` — TUNE.CLUB_EREIGNISSE
   (8 Sätze), Zufallsbeutel ohne direkte Wiederholung, ab Sekunde 20 alle ~25 s über
   `ambientTakt(dt)`. Nichtstun 300 s: vorher 4 Ereignisse/letztes bei 107 s → nachher 16
   Ereignisse/letztes bei 295 s (gefordert: mindestens 12, letztes nach 270 s).
2. **Club, Eingang: Garderobe zum Ansprechen** · `0c6e875` — GARDEROBE (x=70, SPR.theke),
   zwei Sätze, ruf+1, einmal nutzbar. Gemessen: naechstesZiel() liefert vorher
   {art:'garderobe'}, ruf 50→51; danach liefert naechstesZiel() dort null, ruf bleibt bei 51.
3. **Club, Raucherecke: zwei Stehende mit je einem Satz** · `39e80cb` — RAUCHER1 (x=900),
   RAUCHER2 (x=1010), vorhandener Tanzer-Umriss eingefärbt, kein Baum. naechstesZiel()
   liefert an beiden Stellen das jeweils eigene Ziel mit dem richtigen Satz.
4. **Club, Hinterausgang: Kisten und ein Lieferant** · `ad78867` — fünf vier-hoch gestapelte
   Kisten plus LIEFERANT (x=1250, Handlanger-Umriss) mit erklärendem Satz. Leere Bildzeilen
   im Kamera-Ausschnitt auf den Hinterausgang: 77,2 % → 69,4 % (gefordert: mindestens 5
   Punkte niedriger).
5. **Club, Klos: Befund war veraltet** — nicht gebaut, nur gemessen: WASCHBECKEN (x=1120)
   hat seit der ersten Fassung von Level 5 (`0a47a28`) schon eine echte Interaktion
   (Pegel −18, Meldung). Punkt gestrichen.
6. **Club-Decke: Lautsprecherreihe über die ganze Breite** · `13ef962` — Lautsprecher-Säule
   mit Gitterstreifen, alle 50 px über 1400 px Levelbreite. Leere Bildzeilen im Club
   (nachttest.js, 60 s): 77–78 % → 65 % (gefordert: höchstens 68 %).
7. **Club-Decke: Discokugel und Lichtsäulen über der Tanzfläche** · `c91cee8` — vier
   Discokugeln (Schachbrettmuster) mit gestreiften Lichtsäulen, nur x 170-620. Leere
   Bildzeilen: 65 % → 53 % (gefordert: höchstens 58 %).

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js (--kurz bzw. ganz)
erneut grün; `verloren` in flagcheck.js blieb durchgehend bei 7.

### Blockiert (zweimal versucht, zurückgerollt)

- **Club-Decke: Banner oder Galerie an der Rückwand** (P1, dritter Schritt über Bar/
  Raucherecke) — zweimal gebaut (y 24, dann y 56, beides x 630-1060), beide Male mit
  `git restore level5.html` zurückgenommen. Grund: die Galerie senkt die leeren
  Bildzeilen am Ort nachweislich (Kamera direkt auf x=800: 65 % → 40,6 %), aber
  `node tools/nachttest.js` meldet unverändert 53 %, weil dessen 60-s-Zufallslauf in
  Level 5 mit dem festen Seed nie über x≈371 hinauskommt (Eingang + ein Stück
  Tanzfläche, dann füllt ein Minispiel die Zeit). Neuer P2-Punkt dafür angelegt
  („nachttest.js: Zufallslauf in Level 5 kommt nie über x≈400 hinaus").

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P1: **Club-Decke: Banner oder Galerie an der
Rückwand** bleibt stehen, ist aber erst wieder sinnvoll angehbar, wenn der neue P2-Punkt
zum Zufallslauf geklärt ist (sonst ist „Fertig wenn" mit dem vorgeschriebenen Werkzeug
nicht prüfbar). Danach die vier „Obere Bildhälfte Level 2/6/7/8"-Punkte, dann die
übrigen P2-Punkte.

---

## 2026-10-03 — Nacht — Test und Bau

Start-Commit: `30d6ae97b3fa047b02921abd4a3f3673d281e5e5`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
61/50/7 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig. Einzige
Auffälligkeit: level5.html zeigt im Nichtstun-Test jetzt 16 statt 4 Ereignisse (295 s statt
107 s) gegenüber der alten Referenz in `routinen/nacht.md` — kein neuer Fund, der gestrige
Bericht wurde vor der Club-Uhr-Ambient-Ereignisse-Nachtbau-Phase geschrieben, der jetzige
Stand ist der erwartete nach diesem Fix.

### Erledigt (7 Punkte gebaut, ~46 Minuten; davon 2 Funde als „Befund war veraltet"
ohne Codeänderung erledigt)

1. **Obere Bildhälfte Level 2 (Wohnung): Bilderrahmen, Regal, Wandverkleidung** · `bcad605`
   — drei wiederholte Muster über die Breite (x 14-890) in `zeichneWohnung()`. Leere
   Bildzeilen (nachttest.js, 60 s): 71 % → 49 % (gefordert: höchstens 55 %; die alte
   TODO-Referenz 65 % stammte von vor dem Mitnehmen-Wahl-Umbau).
2. **Obere Bildhälfte Level 6 (Afterhour): Wanddeko** · `56f7b97` — ein erster Versuch mit
   Deckenleuchten blieb wirkungslos (68,685 % vor wie nach, identisch bis auf drei
   Nachkommastellen): die Vignette in `zeichneFlur()` liegt mit mindestens 50 % Deckkraft
   permanent über dem Bild und schluckt dort fast jeden Kontrast. Plakate/Spinde näher an
   der Bildmitte (y 70-92) funktionierten: 68,685 % → 58,494 % (gefordert: höchstens 59 %).
   Hinweis für künftige Deko in Level 7/8 hinterlassen (dieselbe Vignette-Falle).
3. **Obere Bildhälfte Level 7 (Späti): Regal und Leuchtreklame** · `a03bfed` — zwei
   Regalreihen und eine leuchtende OFFEN-Reklame in der Ladenwand (x 300-520), gleich in
   der Bildmitte platziert (Lehre aus Punkt 2). Leere Bildzeilen: 73 % → 59 % (gefordert:
   höchstens 63 %).
4. **Obere Bildhälfte Level 8 (Heimweg): Sterne, Mond, durchgehende Häuserreihe** ·
   `82c14c9` — 320 statt 30 dichter verteilte Sterne, ein Mond gegenüber der Sonne (beide
   an den Lichtfaktor gekoppelt), lückenlose Häuserreihe mit Fenstern. Die lückenlose Reihe
   hätte die Sonne verdeckt, solange sie tief steht — `zeichneSonne()` läuft deshalb jetzt
   nach der Häuserreihe. Pixelprobe: Sonnenfarbe bei licht=0/30/60/75/100 trifft exakt die
   erwarteten Werte, nicht mehr verschluckt. Leere Bildzeilen: 76 % → 64 % (65,926 % exakt;
   gefordert: höchstens 66 %).
5. **Level 4: Leertaste startet jetzt wirklich** · `044eef1` — das Titelbild versprach
   „E ODER LEERTASTE", Space war aber nur an die Ausweichrolle gebunden. Jetzt wie in
   `level3.html` (`druckSprung`): Space löst außerhalb des Kampfes `druckAktion()` aus.
   Nebenbefund: der Nachttest drückt zum Start immer Leertaste — das lief bei Level 4
   bisher ins Leere, der „Nichtstun"-Lauf blieb auf dem Titelbild stehen (0 Ereignisse).
   Löst dabei den offenen P3-Punkt „Wer nichts tut, wird nie getroffen" auf: nach der
   Korrektur gemessen, S.hp 3→0 bis Sekunde 9, ein untätiger Spieler verliert zuverlässig.
6. **Level 4: Konterfenster mit Mindestbreite** · `add3dd5` — bei Pegel 100 und Phase 3
   schrumpfte das Konterfenster auf 0,085 s, unter jeder menschlichen Reaktionszeit. Neue
   `TUNE.fensterMinSek` (0,28 s) hebt `fensterAnteil` so weit an, dass die Fensterbreite nie
   darunter fällt (nur schwung/jab betroffen, ramme bleibt unblockbar). Gemessen: kleinste
   Fensterbreite über alle Phasen/Angriffe bei Pegel 100 vorher 0,085 s, nachher exakt
   0,280 s. Dabei den verwandten TODO-Punkt „Pegel verengt das Konterfenster unsichtbar"
   als veraltet erkannt und gestrichen: `zeichneAusholbalken()` liest `fensterAnteil` schon
   direkt, Balken und echtes Fenster stimmen bereits überein.
7. **Bus: Fahrschein rettet nur noch eine Kontrolle, nicht die Fahrt** · `a13acb2` — zwei
   zusammenhängende Fehler in `S.ticket`: (1) machte komplett unverwundbar für den Rest der
   Fahrt statt nur die eine Kontrolle zu retten; (2) `ticket:flag('busTicket')` beim
   Levelstart ließ einen gekauften Fahrschein jeden Neustart überleben. Beides behoben:
   Verdacht steigt normal, rettet bei 100 einmal (verbraucht sich dabei), `ticket` startet
   jetzt immer `false`. Gemessen per Headless-Lauf mit erzwungener Kontrolle: 1. Kontrolle
   hp 3→3 (gerettet, verbraucht), 2. Kontrolle hp 3→2 (normal getroffen); nach `neuesSpiel()`
   mit weiterhin gesetztem Flag ist `S.ticket` jetzt `false` statt `true`.

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js erneut grün;
`verloren` in flagcheck.js blieb durchgehend bei 7. `PLAYTEST.md` entsprechend
nachgezogen (durchgestrichen bzw. mit Datum annotiert).

### Nicht gebaut (zu groß, geteilt statt zurückgerollt)

- **Lektionen: Übungspuppe für den Kampf** (P2) — ein neuer Schritt-Typ in
  `nacht/lehre.js`, der während der Lektion einen Mini-Kampf gegen eine reglose Puppe mit
  `kaempferTakt()`-Windup laufen lässt, plus die passende Simulation in `nachttest.js` für
  den Timing-Check. Mehr als ein kleinster Eingriff; in `NACHT-TODO.md` in zwei Punkte
  geteilt (zuerst nur Level 4/Konter, danach Level 3/8 für Block/Rolle), keiner davon heute
  begonnen — kein Rollback nötig, da nichts an Code geändert wurde.
- **Level 5 Zufallslauf** und **Level 4: jede Phase soll die vorige Antwort entwerten**
  (beide P2) — übersprungen: Ersteres würde `tools/nachttest.js`s gemeinsamen Tastenmix für
  alle neun Seiten ändern und jede bestehende Messzahl in `NACHT-TODO.md` neu kalibrieren
  nötig machen, Letzteres ist eine Spielgefühl-Frage (ab wann „entwertet" eine neue Phase
  eine Antwort wirklich). Beide bleiben unverändert in „Offen" stehen.

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P1: **Club-Decke: Banner oder Galerie an der
Rückwand** bleibt stehen, weiterhin blockiert durch den ungeklärten Zufallslauf-Punkt.
Danach P2 in Dateireihenfolge: Level-5-Zufallslauf (groß, siehe oben), dann die
Übungspuppen-Punkte (groß, siehe oben), dann Level 4 Phasen-Entwertung, Jab/Schwung-
Unterscheidung, Club-Beziehungen (drei Frauen, Sophie/Lena), Level-2-Kleinteile
(`mobilKontext`, tote Tasten), Analyse-Nachholbedarf (Level 1/6/7/8/Karte/Runner/Engine).

---

## 2026-10-04 — Nacht — Test und Bau

Start-Commit: `fad935a05e970b9a2f88e1a479e45abd58e8ad60`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
61/50/7 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig. Einziger
Unterschied zum Vortagsbericht: level4.html zeigte 3 Nichtstun-Ereignisse statt der im
Vortagsbericht noch genannten 0 - das ist die bereits dokumentierte Folge der
Leertasten-Korrektur vom 3.10. (`044eef1`), kein neuer Fund.

### Erledigt (8 Punkte, ~50 Minuten)

1. **nachttest.js: Zufallslauf in Level 5 kommt jetzt durch den ganzen Level** · `66ecc5f`
   (nach einem falsch gemessenen ersten Versuch `c1e717e`, siehe unten) — der Tastenmix im
   60-s-Spiellauf war fast ausgeglichen (2× KeyD gegen 1× KeyA, dazu sieben Tasten ohne
   Seitwärtswirkung) und bewegte sich in Level 5 im Schnitt nur mit 10 % der
   Höchstgeschwindigkeit nach rechts. Der erste Fix (KeyD 5×) wurde mit einem Wegwerf-Skript
   ohne `draw()`-Aufrufe geprüft und war dadurch unbemerkt falsch: `draw()` zieht selbst aus
   `Math.random()` (Bildzittern bei hohem Pegel), das im Nachttest an denselben Seed gekoppelt
   ist wie die Tastenauswahl - ohne `draw()` lief die Zufallsfolge anders als im echten
   `node tools/nachttest.js`. Mit dem echten Skript nachgemessen: derselbe Tastenmix blieb bei
   x=639,8 nach 59 s hängen. KeyD jetzt 9× statt 2× (17 statt 10 Einträge) - echter Lauf
   überschreitet x=900 bei 41,4 s, Ende bei x=1354 (Modi jetzt sogar spiel/mini/cutscene/ende).
2. **Club-Decke: Banner an der Rückwand über Bar und Raucherecke** · `3243c27` — dritter
   Schritt gegen die leere obere Bildhälfte im Club, jetzt erreichbar dank Punkt 1. Ein erster
   Versuch mit einem nur halb so hohen Rahmen (y 38-105) kam auf 48,4 % statt der geforderten
   höchstens 48 - Banner jetzt über die volle Wandhöhe (y 20 bis TIEFE.hinten). Gemessen:
   46,5 % (vorher, direkt nach Punkt 1, ohne Banner: 53 %).
3. **Level 2: `mobilKontext()`** · `794c62b` — ohne eigene Funktion griff immer der
   ALLGEMEIN-Fallback (Knopf hieß überall AKTION). Jetzt REDEN/NEHMEN/TRINKEN/SPIEGEL/
   SUCHEN/LEER je nach Nähe (gleiche Vorrangregel wie die echte Aktionsauflösung), dazu
   WEITER/KONTER/NOCHMAL je nach Modus.
4. **Level 2: Titelbild bringt keine wirkungslose Taste mehr bei** · `c04f355` — Sprung
   (LEER) stand als Steuerung auf dem Titelbild, hat aber in der flachen Wohnung ohne
   Hindernisse nie eine Spielwirkung gehabt; „WASD" hatte dasselbe Problem (nur A/D bewegen).
   Titelbild zeigt jetzt nur noch A D und E, der Sprung bleibt im Code.
5. **Club: eine Abfuhr spricht sich jetzt im Gespräch herum** · `0e73e3a` — der
   Ruf-Abschlag wirkte schon, aber keine andere Figur erwähnte eine Abfuhr. Neuer Knoten
   `startAbfuhr` in allen drei Bäumen, ausgelöst sobald eine andere der drei schon einen
   Korb gegeben hat (nur einmal pro Figur). `tools/nachttest.js` um den neuen, von außen
   betretenen Knoten ergänzt (wie `tanzGut`/`tanzSchlecht`).
6. **Club: Sophie reagiert auf Pegel, Lena ist ansprechbar** · `b6a6d00` — Sophie hatte als
   einzige der drei keine Pegel-Bedingung; neue Wahl ab `pegel:55` wie bei Mia. Lena stand
   seit der ersten Fassung im Club, aber `naechstesZiel()` kannte sie nicht - neuer
   `LENA_BAUM`, als eigenes Ziel verdrahtet. Ein erster Versuch mit einer Zuneigungs-Wirkung
   auf der ersten Antwort hätte eine neue, nie gelesene Beziehung angelegt (flagcheck.js
   9→10) - wieder entfernt, das Gespräch braucht keine Wirkung, um zu zählen.
7. **Level 1: Titelbild zeigt nur noch vier Grundtasten** · `08af616` — sieben Tastenzeilen
   waren eine Bedienungsanleitung zum Lesen; eine Überlappung gab es laut Messung
   (Software-Canvas) keine mehr, nur die Zeilenzahl verfehlte das Ziel. Lampe (Q) und Wurf
   (R) kommen schon als eigene Schritte in der Lektion, H ist nur Audio - jetzt nur noch
   A D/SHIFT/W S/E, deckungsgleich mit der Touch-Fassung.
8. **Level 1: H-Meldung heißt nicht mehr HANDY** · `6ce23e2` — H (eigenes Handy stumm,
   mit echter Schleich-Konsequenz über `laerm()`) und das Engine-Handy (T, andere
   Oberfläche) sind zwei echte Mechaniken, keine tote Dopplung - eine volle Zusammenlegung
   hätte die Laerm-Konsequenz in die levelneutrale `nacht/handy.js` tragen müssen, zu groß
   für einen Punkt. Kleinster sicherer Schritt: die Meldung bei H heißt jetzt TON AUS/TON AN
   statt HANDY STUMM/HANDY LAUT.

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js erneut grün;
`verloren` in flagcheck.js blieb durchgehend bei 7, Beziehungen bei 9. `PLAYTEST.md`
entsprechend nachgezogen (durchgestrichen bzw. mit Datum annotiert).

### Übersprungen oder nur geplant, nicht gebaut

- **Lektionen: Übungspuppe für Level 4** (P2) — nochmal angesehen und konkreter geplant
  (Code-Stellen, genauer Bauplan in `NACHT-TODO.md`), aber nicht begonnen: `nacht/lehre.js`
  ist gemeinsam für alle acht Level, fünf davon ohne `nacht/kampf.js` - jeder Zugriff auf
  `kaempfer()` muss defensiv geschützt sein, und Level 4s eigene Angriffs-Logik
  (`starteAngriff`) darf die gemeinsame Datei nicht aufrufen. Kein Rollback nötig, nichts
  an Code geändert.
- **Level 4: jede Phase soll die vorige Antwort entwerten** und **Level 4: Jab/Schwung
  unterscheidbar machen** (beide P2) — Ersteres eine Spielgefühl-Frage, Letzteres echte
  Pixel-Art-Arbeit (neue Sprite-Posen), die diese Sitzung ohne Browser nicht ansehen kann,
  um sie zu beurteilen - siehe „Zweifelst du..." in `routinen/nacht.md`. Beide unverändert
  in „Offen".
- **Analyse nachholen** (P2) — offene Recherche-/Analysearbeit ohne einzelnen Code-Fix,
  für einen Baupunkt zu groß und zu unscharf; unverändert in „Offen".

### Neuer Fund

**Club-Decke, vierter Schritt: Klos und Hinterausgang oben noch leer** (P1) — beim Messen
von Punkt 2 festgestellt: Kamera direkt auf x=1150 bzw. x=1300 gestellt, 56,7 % bzw. 59,4 %
leere Bildzeilen (gegen 46,5 % bei Bar/Raucherecke). In `NACHT-TODO.md` unter „Offen" → P1
eingetragen.

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P1: **Club-Decke, vierter Schritt (Klos/Hinterausgang)**,
heute gefunden. Danach P2 in Dateireihenfolge: die beiden Übungspuppen-Punkte (groß, heute
genauer geplant), Level-4-Phasen-Entwertung, Jab/Schwung-Unterscheidung, Analyse-Nachholbedarf
(Level 1/6/7/8/Karte/Runner/Engine/Dramaturgie).

---

## 2026-10-05 — Nacht — Test und Bau

Start-Commit: `6453365`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
61/50/7 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig. Alle
Nichtstun-Zahlen und flagcheck.js-Werte stimmten exakt mit dem Vortagsbericht überein,
keine neuen Funde beim Testen selbst.

### Erledigt (8 Punkte, ~54 Minuten)

1. **Club-Decke, vierter Schritt: Banner jetzt auch über Klos und Hinterausgang** ·
   `2981c28` — die Rückwand-Banner-Schleife (Bar/Raucherecke) lief bisher nur bis x=1065;
   kleinster Eingriff: dieselbe Schleife bis x=1400 verlängert. Der ursprüngliche Messweg
   (56,7 %/59,4 % bei Kamera auf x=1150/x=1300) war nicht mehr rekonstruierbar — eigene,
   dokumentierte Methode (direkter S.kamX, Spieler außerhalb des Bildes): leere Bildzeilen
   70,0 % → 27,2 % (kamX=1150) bzw. 86,7 % → 32,2 % (kamX=1300), beide unter 50 %.
2. **Lektionen: Übungspuppe für Level 4, nur Konter** · `2e60b48` — neuer Schritt-Typ
   `puppe` in nacht/lehre.js: eine stillstehende `kaempfer()`-Instanz holt endlos aus, E
   zählt nur im Konterfenster (`imKonterfenster()`), sonst bleibt der Schritt offen. Hinter
   `typeof kaempfer`-Wachen, da fünf von acht Leveln kampf.js nicht laden. nachttest.js um
   einen Fruehdruck-Check (darf nicht erledigen) und ein Takten bis ins Fenster ergänzt.
3. **Lektionen: Übungspuppe für Block in Level 3** · `59d5066` — `puppe`-Schritt-Typ
   verallgemeinert (`PUPPE_ARTEN` je Art Taste+Zeitfenster). Level 3s SHIFT-Schritt war
   optional und zählte bei jedem Druck — jetzt `puppe:'block'`, erledigt erst während die
   Puppe ausholt/schlägt.
4. **Lektionen: Übungspuppe für Rolle in Level 8** · `d62c683` — dritter Teil, nutzt
   `PUPPE_ARTEN.rolle` (stand schon seit Punkt 3), nur der neue Lektionsschritt war nötig.
5. **Level 4: Jab und Schwung im Ausholen unterscheidbar** · `926e612` — neue
   SPR.bossWindJab (enger, mit roter Faust statt blossem Torso) statt derselben Sprite für
   beide Angriffsarten. Gemessen: 6 von 72 Zeichen zwischen bossWind und bossWindJab
   unterschiedlich (vorher 0, identisch).
6. **Analyse nachholen: Level 1** · `9508e31` — erster von acht Teilen des aufgeteilten
   Analyse-Punkts. Ein Analyse-Agent hat index.html und die elf geladenen Engine-Dateien
   gelesen; sechs belegte Funde (toter Tiefen-Code, nie gelesene HAUSMEISTER-Zuneigung,
   zwei ungenutzte TUNE-Werte, wirkungsloser Sprung, hartcodierte Wurf-Physik, ein
   wirkungsloser Ausschluss) als neuer Abschnitt „Level 1" in PLAYTEST.md. Ein siebter,
   projektweiter Fund als eigener Punkt unter „Offen" (siehe Punkt 7).
7. **Komfort-Schalter FLACKERSCHUTZ/WACKELN wirken jetzt** · `727f73e` — betraf alle acht
   Level: S.blitz/S.ruettel (in Level 5 zusätzlich das Stroboskop S.flacker) wurden roh
   gezeichnet statt durch FX.blitz()/FX.wackel() geschickt. Gemessen: FX.blitz(1) 1,000 ohne
   Flackerschutz, 0,120 mit; FX.wackel(6) 6,00 ohne, 3,00 mit.
8. **Analyse nachholen: Level 6** · `7e60128` — zweiter Teil. Sechs belegte Funde
   (dieselbe tote Tiefen-Logik wie Level 1, ein zu schnell fallender Pegel, ein
   wirkungsloser Mobil-Sprungknopf, eine hartcodierte Pegelzahl neben einem echten
   TUNE-Wert, zwei Trigger für denselben Hinweistext, ein nie gelesenes Datenfeld) als
   neuer Abschnitt „Level 6" in PLAYTEST.md; alle sechs einzeln unter „Offen" eingetragen
   (der Tiefe-Fund zusammengelegt mit dem aus Level 1).

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js erneut grün;
`verloren` in flagcheck.js blieb durchgehend bei 7. `kampf.test.js` meldete nach Punkt 7
einmal 21/22 (ein Lauf) — fünf direkt folgende Wiederholungen liefen 22/22; die Datei testet
nur nacht/kampf.js in Isolation und lädt keine der an Punkt 7 geänderten Leveldateien, also
kein Zusammenhang mit der Änderung. `PLAYTEST.md` entsprechend nachgezogen.

### Blockiert (bewusst nicht gebaut, kein Code geändert)

- **Level 4: jede Phase soll die vorige Antwort entwerten** (P2) — Zweifel am Spielgefühl,
  kein gescheiterter Bauversuch. Phase 2 entwertet die Phase-1-Antwort bereits echt (Ramme,
  unblockbar, Konter explizit abgelehnt in `konterVersuch()`). Phase 3 bräuchte einen neuen,
  nur-block-baren Angriff — das heißt `unblockbarJetzt` in getrennte Fahnen für Konter/Block
  aufzuspalten, eine neue Windup-Pose und eine Balance-Entscheidung, die den ohnehin knappen
  Kampf eher verschlechtert hätte als verbessert. Mit der Frage unter „Blockiert" vermerkt.

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P2 in Dateireihenfolge: **Level 1 und 6: toter
Tiefen-Code** (zusammengelegt), **Level 6: Pegel fällt zu schnell**, **Level 6:
Mobil-Sprungknopf ohne Wirkung**, dann die restlichen sechs Analyse-Teile (Level 7, 8,
Karte, Runner, Engine, Dramaturgie). Danach P3, angeführt von drei neuen Level-6-Kleinfunden
und der bestehenden Liste (Lektion wiederholen, `level5_baeume.js` löschen, Bahn-oder-Bus,
`TODO.md` veraltet).

---

## 2026-10-06 — Nacht — Test und Bau

Start-Commit: `1e803e0`

**Testergebnis:** Baseline grün (pruefe.js 10/10, kampf.test.js 22/22, flagcheck.js
82/78/0 verloren, nachttest.js ohne harten Fehler) — kein Reparatur-Commit nötig. Zwischen
dem Bericht vom 5.10. und heute wurde der Launch-Branch nach `claude/nacht` gemergt
(`1e803e0`, nicht von dieser Routine) — Spielinhalt und -umfang grundlegend anders, daher
im Bericht nur eingeschränkt mit dem Vortag vergleichbar (Details: NACHT-BERICHT.md).
Neuer Fund: `flagcheck.js` zählt seit dem Merge 9 statt 5 nie gelesene Beziehungen
(DENNIS, MARVIN, SEMIH, LEA neu dazu).

### Erledigt (8 Punkte, ~20 Minuten)

1. **DENNIS-Zuneigung fließt in den Abspann ein** · `bb2369d` — neue NACHHALL-Zeile in
   level8.html nach dem bestehenden MORITZ-Muster: `beziehung('DENNIS')>=8`. Gemessen:
   flagcheck.js zählt DENNIS nicht mehr unter „nie gelesen".
2. **MARVIN-Zuneigung fließt in den Abspann ein** · `56a1674` — gleiches Muster,
   `beziehung('MARVIN')>=14`.
3. **SEMIH-Zuneigung fließt in den Abspann ein** · `6cd95f1` — gleiches Muster,
   `beziehung('SEMIH')>=10`.
4. **LEA-Zuneigung fließt in den Abspann ein** · `c9602d9` — gleiches Muster,
   `beziehung('LEA')>=14`. Damit lesen alle neun seit dem Merge betroffenen Beziehungen
   außer den fünf schon vorher bekannten (HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI)
   wieder irgendwo im Spiel.
5. **Level 8: Wettlauf-Balance nachgemessen, bereits erfüllt** · kein Code geändert,
   Hash des Dokumentations-Commits `cba5f49` — ein Wegwerf-Bot (Node, nicht im Repo)
   springt rechtzeitig über alle elf Hindernisse (ohne Sprung verliert jeder Lauf sofort
   an den Hindernissen, nicht an der Sonne — das wäre die falsche Messung gewesen).
   Ergebnis: Start-Licht 0/7/14/21/28 mit MAX FERDI kommt immer an (Licht 57–85 % an der
   Haustür), Start-Licht 40 ohne MAX FERDI mit allen fünf Abschieden geht verloren (Licht
   100 % bei x=4849 von 5160), Gegenprobe mit MAX FERDI ohne Abschiede kommt bei Start 40
   knapp an (97,1 %). Beide Hälften des „Fertig wenn" erfüllt.
6. **nachttest.js Level 5: x>900-Kriterium nachgemessen, bereits erfüllt** · kein Code
   geändert — der Fix vom 4.10. (`66ecc5f`) hält auch nach dem Launch-Merge: maxX=1386 im
   60-s-Zufallslauf (gefordert >900), gemessen mit einer Protokoll-Kopie von
   tools/nachttest.js (inklusive der draw()-Aufrufe wie im Original — ohne sie läuft die
   Zufallsfolge anders, siehe die Notiz zum ursprünglichen Fix).
7. **Level 2: Mobil-Sprungknopf verschwindet, da Sprung hier nichts tut** · `a438b31` —
   Titelbild/Lektion waren schon seit `c04f355` (4.10.) bereinigt, `mobilKontext()` zeigte
   SPRUNG aber weiterhin in jedem Zustand. Jetzt `zwei:null` an allen drei Stellen.
8. **Fünf stehengebliebene Duplikate in NACHT-TODO aufgeräumt** · kein Code geändert —
   Lektionen-Übungspuppe (Level 3/4/8), Level-4-Jab/Schwung, Club-Abfuhr, Club-Sophie/Lena
   standen trotz längst erledigter Commits (`2e60b48`, `59d5066`, `d62c683`, `926e612`,
   `0e73e3a`, `b6a6d00`) noch unter „Offen" — vom Launch-Merge mitgebracht, der eine ältere
   NACHT-TODO.md-Fassung enthielt. Je per grep gegen den aktuellen Code gegengeprüft.

Nach jedem Punkt: pruefe.js, kampf.test.js, flagcheck.js, nachttest.js --kurz erneut grün;
`python3 tools/version.py` nach jeder Änderung an einer `*.html`-Seite. `verloren` in
flagcheck.js blieb bei 0. PLAYTEST.md: die MORITZ-Zeile unter „Die Hälfte aller
Entscheidungen verpufft" durchgestrichen (seit dem Merge gelesen, DENNIS/MARVIN/SEMIH/LEA
jetzt ebenfalls).

### Was als Nächstes oben steht

In `NACHT-TODO.md` unter „Offen" → P2 in Dateireihenfolge: **Gesprächsleiste quer: mehr
als 3 lange Antworten scrollen** (braucht eine echte Layout-Messung im Browser — mobil.js
ist aus dem Software-Canvas-Lader ausgenommen, `nachttest.js` kann das nicht prüfen, wurde
deshalb heute Nacht übersprungen), dann **Analyse nachholen: Level 1, 6, 7, 8, Karte,
Runner, Engine, Dramaturgie** und die restlichen Level-6-Einzelfunde. Lohnt sich: einmal
komplett durch NACHT-TODO.md gehen und prüfen, ob der Launch-Merge noch weitere erledigte
Punkte unter „Offen" stehen gelassen hat — heute wurden nur die ersten ~20 Zeilen von P2
durchgesehen.
