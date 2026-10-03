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
