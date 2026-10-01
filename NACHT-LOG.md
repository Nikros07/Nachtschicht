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
