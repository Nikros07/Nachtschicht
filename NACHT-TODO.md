# NACHT-TODO — die Liste für die Nachtroutinen

Diese Datei ist die **Warteschlange**. Alles, was beim Arbeiten offen bleibt,
steht hier — und die Routinen holen es nachts ab:

Eine Routine, nachts, **in der Cloud** (claude.ai → Routinen). Sie testet zuerst alles,
schreibt `NACHT-BERICHT.md`, trägt Funde hier ein und arbeitet danach diese Liste von oben
ab — jeden Punkt gemessen, getestet, einzeln committet. Der Ablauf steht in
`routinen/nacht.md`. Sie arbeitet auf dem Branch **`claude/nacht`**; nach `main` pusht sie
nie — die Live-Seite bleibt, wie sie ist.

Morgens: `NACHT-LOG.md` lesen (was passiert ist), den Branch ansehen
(`git log main..origin/claude/nacht`) und, wenn es passt, nach `main` mergen.

## Wie ein Eintrag aussieht

```
- [ ] **P1 · Kurztitel** — was falsch ist oder fehlt, und warum es nervt.
  Wo: level5.html (Funktion/Zeile) · Fertig wenn: woran man es messen kann
```

- **P1** = Spielfehler oder großer Mangel · **P2** = spürbar · **P3** = Feinschliff
- „Fertig wenn" ist Pflicht: ohne messbares Ende wird nichts abgehakt.
- Eine Entscheidung, die nur der Spieler-/Auftraggeber treffen kann, kommt
  unter **Entscheidung nötig**, nicht unter Offen. Die Routinen fassen die nicht an.

---

## Offen

### P1

*Regel für alles Folgende: ein Punkt = höchstens ~15 Minuten, ein Bereich, eine Messzahl. Ist er größer, vorher teilen.*

- [ ] **P1 · Club-Decke: Banner oder Galerie an der Rückwand** — Dritter Schritt für Bar und Raucherecke. Siehe „Blockiert": die vorgeschriebene Messung (node tools/nachttest.js) erreicht diesen Bereich nicht, bevor hier weitergebaut wird, muss erst das geklärt sein.
  Wo: level5.html (zeichneClub) · Fertig wenn: leere Bildzeilen im Club höchstens 48 %. Erst danach gilt die obere Bildhälfte im Club als erledigt.
### P2

- [ ] **P2 · nachttest.js: Zufallslauf in Level 5 kommt nie über x≈400 hinaus** — Der
  60-s-Spiellauf (`SPIEL_SEK`) bewegt sich mit dem festen Seed nur von x=40 bis x≈371
  (Eingang, ein Stück Tanzfläche), dann füllt ein Minispiel die restliche Zeit. Bar,
  Raucherecke, Klos und Hinterausgang (x 620-1400) werden von der „leere Bildzeilen"-
  Messung dieses Laufs nie gesehen - jede künftige Deko dort ist mit `node
  tools/nachttest.js level5` nicht prüfbar (siehe „Blockiert", Club-Decke-Galerie).
  Wo: tools/nachttest.js (der Tastenmix/die Gewichtung im Spiellauf) · Fertig wenn:
  derselbe Lauf erreicht x>900 irgendwann innerhalb der 60 s, gemessen über ein
  Protokoll der x-Werte wie in der Untersuchung zu diesem Fund.
- [ ] **P2 · Lektionen: Übungspuppe, nur Level 4, nur Konter** — zu groß für einen Punkt (mehr als
  eine Datenstruktur-Änderung: ein neuer Schritt-Typ in `nacht/lehre.js`, der waehrend der Lektion
  einen Mini-Kampf gegen eine reglose Puppe mit `kaempferTakt()`-Windup laufen laesst und den
  bestehenden Schritt „KONTERN IM GOLDENEN BEREICH" ersetzt, statt nur eine Taste einmal zu
  pruefen). Am 3.10. geteilt - zuerst nur Level 4, Block/Rolle (Level 3, 8) folgen als eigene
  Punkte, erst wenn der Mechanismus hier steht.
  Wo: nacht/lehre.js (neuer Schritt-Typ `puppe`), nacht/kampf.js (`kaempferTakt` wiederverwenden,
  nicht duplizieren) · Fertig wenn: der Schritt in LEKTIONEN['level4.html'] verlangt einen im
  Fenster getroffenen Konter gegen eine stillstehende Puppe, bevor er als erledigt gilt; per
  Simulation im Nachttest auslösbar (Taste zur richtigen Zeit drücken = Schritt fertig, zur
  falschen Zeit = nicht).
- [ ] **P2 · Lektionen: Übungspuppe auch für Block (Level 3) und Rolle (Level 8)** — baut auf dem
  Level-4-Mechanismus oben auf, sobald der steht. Wo: nacht/lehre.js · Fertig wenn: die Lektion
  von Level 3 verlangt einen Block, die von Level 8 eine Rolle gegen dieselbe Puppe.

- [ ] **P2 · Level 4: jede Phase soll die vorige Antwort entwerten** — bisher ändern
  die Phasen nur Zahlen; nach dem zweiten Konter ist alles gesehen.
  Wo: level4.html (`bossPhase`, `naechsteArt`) · Fertig wenn: Phase 2 und 3 verlangen
  je eine andere Antwort als Phase 1.
- [ ] **P2 · Level 4: Jab und Schwung unterscheidbar machen** — eigene Haltung je Angriff.
  Wo: level4.html (`SPR`, Zeichnen des Bosses) · Fertig wenn: beide Muster sehen im
  Ausholen verschieden aus.
- [ ] **P2 · Bus: Ein gekaufter Fahrschein schaltet den Bus für alle späteren Durchläufe ab** —
  Wo: level3.html (`starteBus`, Flag-Reset, `S.ticket`) · Fertig wenn: nach Neustart
  des Levels gilt kein alter Fahrschein mehr.
- [ ] **P2 · Bus: Fahrschein rettet eine Kontrolle statt das ganze Level** — sonst ist
  der Bus „gratis sicher oder sicher verloren". Wo: level3.html · Fertig wenn: mit
  Fahrschein kostet die erste Kontrolle kein Leben, die zweite schon.
- [ ] **P2 · Club: Die drei Frauen kennen sich** — Der Kommentar im Code verspricht,
  dass sich eine Abfuhr herumspricht. `S.abfuhren` gibt es schon.
  Wo: level5.html (`gespraechEnde`, die drei Bäume) · Fertig wenn: nach einer Abfuhr
  erwähnt mindestens eine andere Figur sie, gemessen per Baum-Durchlauf.
- [ ] **P2 · Club: Sophie hat keine Pegel-Bedingung, Lena ist nicht ansprechbar** —
  Wo: level5.html (`SOPHIE_BAUM`, `LENA`) · Fertig wenn: Sophie reagiert auf Pegel,
  Lena hat ein kurzes Gespräch.
- [ ] **P2 · Level 2: kein `mobilKontext()`** — am Handy heißt jeder Knopf „AKTION".
  Wo: level2.html, Muster aus index.html · Fertig wenn: Knopfaufschriften je Modus.
- [ ] **P2 · Level 2: Springen/Hoch/Runter werden beigebracht und tun nichts** —
  Wo: level2.html (Titelbild, Eingaben) · Fertig wenn: nur noch Eingaben, die etwas tun.
- [ ] **P2 · Analyse nachholen: Level 1, 6, 7, 8, Karte, Runner, Engine, Dramaturgie** —
  neun Prüfer sind am Nutzungslimit gescheitert, siehe PLAYTEST.md ganz unten.
  Fertig wenn: je Bereich Bugs, Schwachstellen und Ideen in PLAYTEST.md ergänzt.
- [ ] **P2 · Level 1: Titelbild ist eine Bedienungsanleitung** — sieben Tastenzeilen,
  zwei davon laufen ineinander. Wo: index.html `titelbild()` · Fertig wenn: höchstens
  vier Zeilen, nichts überlappt.
- [ ] **P2 · Zwei Handys auf zwei Tasten** — `H` stumm (Level 1), `T` Engine-Handy.
  Wo: index.html, nacht/handy.js · Fertig wenn: eine Taste, ein Handy.

### P3

- [ ] **P3 · Lektion wiederholen können** — wer sie übersprungen hat, bekommt sie nie wieder. Eine Taste
  oder ein Menüpunkt (nur Adresse `?lektion=1` geht heute). Wo: nacht/lehre.js, nacht/eingabe.js ·
  Fertig wenn: auf dem Titelbild lässt sich die Lektion des Levels erneut öffnen.

- [ ] **P3 · `tools/level5_baeume.js` löschen** — wortgleiche Zweitkopie der Bäume, wird nur
  von einem alten Umbau-Skript gelesen. Wo: tools/ · Fertig wenn: Datei weg, `pruefe.js` grün.
- [ ] **P3 · Bahn oder Bus?** — Intro sagt Bahn, das Schild sagt BUS. Wo: level3.html ·
  Fertig wenn: ein Wort überall.
- [x] ~~**P3 · README: Handy-Steuerung beschreibt den alten Stand**~~ (erledigt mit der neuen Handy-Fassung) — „Steuerkreuz links,
  Aktionstasten rechts" gibt es nicht mehr. Wo: README.md · Fertig wenn: beschreibt
  Stick, Info-Tafel und MENÜ-Knopf.
- [ ] **P3 · `TODO.md` ist veraltet** (Stand 17.9., „Level 3–8 Grundversionen") —
  Wo: TODO.md · Fertig wenn: stimmt mit dem Stand überein oder verweist hierher.

---

## Entscheidung nötig (die Routinen lassen das liegen)

- [ ] **Handy-Steuerung am echten Gerät beurteilen** — Größen, Bogen und Menü sind nur in der
  Emulation geprüft (375x812 und 812x375). Daumenreichweite, Knopfgrößen und ob die rechte
  Hälfte als Hauptknopf zu empfindlich ist, kann nur Nick am Telefon sagen. Die Werte stehen
  in `platziere()` in `nacht/mobil.js` (k, Bogenwinkel 8/62/30/78, Abstände).
- [ ] **Sprungknopf an die Hauptposition, wenn kein Hauptknopf da ist?** — in Level 1 und 8 steht
  der Hauptknopf leer, während SPRUNG im Bogen sitzt. Rechts tippen löst dann den Sprung aus;
  ob der Knopf trotzdem in die Ecke rücken soll, ist Geschmack.

- [ ] **Echte Namen und Gesichter der Freunde** — Platzhalter sind Jonas, Dennis, Semih,
  Lea, Max Ferdi, Moritz, Tobi. Braucht Eingabe von Nick.
- [ ] **Finale in Level 8 entschärfen?** — gemessen sehr knapp; ein reiner Counter-Bot
  bringt den Anführer auf 1 HP, bevor er fällt. Soll es leichter werden?
- [ ] **`runner.html` irgendwo verlinken?** — ist von nirgends erreichbar.

---

## Erledigt (Nacht)

*(Die 5-Uhr-Routine trägt hier ein: Datum · Titel · Commit-Hash)*

- [x] 2026-10-03 · P2 · Phase-3-Jab-Reaktionszeit: Konterfenster hat jetzt eine Mindestbreite · `add3dd5` ·
  Bei Pegel 100 und in Phase 3 schrumpfte das Fenster auf 0,085 s (unter jeder
  menschlichen Reaktionszeit). Neue TUNE.fensterMinSek (0,28s) hebt fensterAnteil
  so weit an, dass ausholenDauer*fensterAnteil nie darunter fällt. Betrifft nur
  schwung/jab, ramme bleibt unblockbar ohne Fenster. Gemessen: kleinste Fensterbreite
  über alle Phasen/Angriffe bei Pegel 100 vorher 0,085s, nachher exakt 0,280s
  (gefordert ≥0,28s). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P2 · Pegel verengt das Konterfenster unsichtbar: Befund war veraltet ·
  nicht gebaut, kein Code geändert außer dem Fix oben. zeichneAusholbalken() in
  nacht/hud.js liest b.fensterAnteil direkt - dieselbe Quelle wie konterVersuch() in
  nacht/kampf.js. Balken und echtes Fenster stimmen schon überein, vermutlich seit der
  Kampfsprache-Vereinheitlichung (Commit `781b327`). Gemessen (Pegel 80, Jab): Balken-
  Fensterstart 0,420s vs. echter Fensterstart 0,423s - Differenz nur Pixel-Rundung.

- [x] 2026-10-03 · P2 · Level 4: Leertaste startet jetzt wirklich · `044eef1` ·
  Space war nur an die Ausweichrolle gebunden, nie an druckAktion() - das Titelbild
  versprach „E ODER LEERTASTE", aber nur E/Enter starteten. Jetzt wie in level3.html
  (druckSprung): Space löst außerhalb des Kampfes druckAktion() aus. Nebenbefund: der
  Nachttest drückt am Anfang Leertaste zum Starten - das lief bisher ins Leere, der
  „Nichtstun"-Lauf von Level 4 blieb auf dem Titelbild stehen (daher die bisherigen
  „0 Ereignisse"). Löst nebenbei den P3-Punkt „Wer nichts tut, wird nie getroffen" auf
  (siehe unten). Gemessen: nachttest.js level4 Nichtstun 300s vorher 0 Ereignisse (auf
  dem Titelbild), nachher 3 Ereignisse, letztes bei 9s (echter Kampf). Alle vier
  Prüfungen grün.

- [x] 2026-10-03 · P3 · Level 4: untätiger Spieler verliert in 9 s · (im selben Fund wie `044eef1`) ·
  Frage war nicht beantwortbar, weil der Nichtstun-Lauf bisher auf dem Titelbild
  steckte (siehe Fund oben). Nach der Space-Korrektur gemessen: S.hp 3 → 0 nach dem
  Intro-Skip bis Sekunde 9, S.modus wird 'ende', S.gewonnen=false. Ein untätiger
  Spieler verliert also zuverlässig - kein Softlock, kein zeitloser Kampf.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 8 (Heimweg): Sterne, Mond, durchgehende Häuserreihe · `82c14c9` ·
  320 statt 30 Sterne (dichter verteilt, sonst reisst keine Zeile die Kanten-Schwelle),
  ein Mond gegenüber der Sonne, beide bis t=0,7 statt 0,6 sichtbar, und eine lückenlose
  Häuserreihe mit Fenstern statt einzelner Häuser mit 50-px-Lücken. Die lückenlose Reihe
  hätte die Sonne verdeckt, solange sie tief steht - zeichneSonne() läuft deshalb jetzt
  nach der Häuserreihe, nicht davor. Pixelprobe: Sonnenfarbe bei licht=0/30/60/75/100
  trifft exakt die erwarteten Werte (z. B. #fff4c2 bei licht=0), nicht mehr verschluckt.
  Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 76 % → 64 % (gefordert
  höchstens 66 %). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 7 (Späti): Regal und Leuchtreklame · `a03bfed` ·
  Zwei Regalreihen mit Waren und eine leuchtende OFFEN-Reklame im Schaufenster, in der
  Ladenwand (x 300-520). Wie bei Level 6 liegt die Deko in der Bildmitte (y 70-108),
  nicht am oberen Rand, wegen der permanenten Vignette (mindestens 50 % Deckkraft).
  Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 73 % → 59 % (gefordert
  höchstens 63 %). Alle vier Prüfungen grün.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 6 (Afterhour): Wanddeko (Plakate/Spinde) · `56f7b97` ·
  Deckenleuchten (y 23-29) blieben wirkungslos: die Vignette in zeichneFlur liegt mit
  mindestens 50 % Deckkraft permanent über dem Bild und schluckt dort fast jeden
  Kontrast (gemessen 68,685 % vor wie nach dem ersten Versuch, identisch bis auf drei
  Nachkommastellen). Näher an der Bildmitte (y 70-92, eine Sorte, wiederholt über die
  Flurbreite) bleibt genug Kontrast übrig. Gemessen (nachttest.js, 60 s Zufallslauf,
  Nachkommastellen temporär ausgegeben): 68,685 % → 58,494 % (gefordert höchstens
  59 %). Alle vier Prüfungen grün. Hinweis für Level 7/8: vor Deckenlicht-artigen
  Elementen prüfen, ob die jeweilige Zeichenfunktion eine ähnliche Vignette/Abdunklung
  am oberen Bildrand hat.

- [x] 2026-10-03 · P1 · Obere Bildhälfte Level 2 (Wohnung): Bilderrahmen, Regal, Wandverkleidung · `bcad605` ·
  Drei wiederholte Muster über die Breite (x 14-890) in zeichneWohnung(). Gemessen
  (nachttest.js, 60 s Zufallslauf): leere Bildzeilen 71 % → 49 % (gefordert höchstens
  55 %; die alte Referenz 65 % war vor dem Umbau der Mitnehmen-Wahl gemessen). Alle
  vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club-Decke: Discokugel und Lichtsäulen über der Tanzfläche · `c91cee8` ·
  Vier Discokugeln (Schachbrettmuster) mit gestreiften Lichtsäulen darunter, nur
  über x 170-620. Gemessen (nachttest.js, 60 s Zufallslauf): leere Bildzeilen
  65 % → 53 % (gefordert höchstens 58 %). Alle vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club-Decke: Lautsprecherreihe über die ganze Breite · `13ef962` ·
  Lautsprecher-Saeule mit Gitterstreifen, alle 50 px wiederholt ueber 1400 px
  Levelbreite in zeichneClub(). Gemessen (nachttest.js, 60 s Zufallslauf): leere
  Bildzeilen 77-78 % → 65 % (gefordert höchstens 68 %). Alle vier Prüfungen grün.

- [x] 2026-10-02 · P1 · Club, Klos: Befund war veraltet, Punkt gestrichen ·
  nicht gebaut, kein Spielcode geändert. WASCHBECKEN (x=1120) existiert seit der
  ersten Fassung von Level 5 (Commit `0a47a28`), lange vor dem Fund „vier von
  sechs Bereichen leer". Gemessen per Headless-Lauf: naechstesZiel() bei x=1120
  liefert {art:'wasser'}, E senkt den Pegel messbar (50,0 → 31,95) und zeigt
  „KALTES WASSER INS GESICHT". Klos hat also schon eine echte, wirksame
  Interaktion - der Befund war veraltet.

- [x] 2026-10-02 · P1 · Club, Hinterausgang: Kisten und ein Lieferant · `ad78867` ·
  Fuenf vier-hoch gestapelte Kisten (reichen in die leere Wand hinein) plus
  LIEFERANT (x=1250, Handlanger-Umriss) mit einem erklaerenden Satz. Gemessen mit
  Wegwerf-Software-Canvas auf den Hinterausgang-Ausschnitt: leere Bildzeilen 77.2 %
  auf 69.4 % (Differenz 7.8 Punkte, gefordert mindestens 5). nachttest.js grün.

- [x] 2026-10-02 · P1 · Club, Raucherecke: zwei Stehende mit je einem Satz · `39e80cb` ·
  RAUCHER1 (x=900) und RAUCHER2 (x=1010), vorhandener Tanzer-Umriss eingefaerbt, je
  ein Satz per E, kein Baum. Gemessen per Headless-Lauf: naechstesZiel() liefert an
  beiden Stellen das jeweils eigene Ziel mit dem richtigen Satz; nachttest.js grün.

- [x] 2026-10-02 · P1 · Club, Eingang: Garderobe zum Ansprechen · `0c6e875` ·
  GARDEROBE (x=70, SPR.theke), GARDEROBE_BAUM mit zwei Sätzen, ruf+1, einmal nutzbar.
  Gemessen per Headless-Lauf: naechstesZiel() am Eingang vorher {art:'garderobe'},
  ruf 50→51 · danach naechstesZiel() dort null, ruf bleibt 51. nachttest.js grün
  (5 Bäume/51 Knoten, vorher 4/48).

- [x] 2026-10-02 · P1 · Club-Uhr: Ambient-Ereignisse gegen die 193-s-Stille · `afea7a1` ·
  TUNE.CLUB_EREIGNISSE (8 Sätze), Zufallsbeutel ohne direkte Wiederholung, ab Sekunde 20
  alle ~25 s über ambientTakt(dt). Gemessen (Nichtstun 300 s): vorher 4 Ereignisse,
  letztes bei 107 s · nachher 16 Ereignisse, letztes bei 295 s (gefordert: mindestens 12,
  letztes nach 270 s).

- [x] 2026-10-01 · P1 · Nachttest: Software-Canvas für Pixelmessung · `307b659` ·
  leere Bildzeilen (60-s-Zufallslauf, Mittelwert): Wohnung 65 % (Referenz 66, Diff 1) ·
  Club 78 % (73, Diff 5) · Afterhour 69 % (72, Diff 3) · Späti 73 % (77, Diff 4) ·
  Heimweg 76 % (77, Diff 1) — alle innerhalb der geforderten 8 Punkte. Keine echte
  Browser-Messung, sondern ein eigener Software-Rasterizer (fillRect/drawImage/Pfade/
  Verläufe), gegen die Browser-Referenz aus PLAYTEST.md kalibriert.

- [x] 2026-10-01 · P1 · Bus: Ablenkung zieht Kontrolleure auf den Spieler zu ·
  `5dbf1c1` · Gemessen (Spieler reglos bei x=325, 8 s Ablenkung ab Trigger):
  Abstand des naechsten Kontrolleurs vorher 85 px, sank auf 0 und loeste Alarm
  (erwischt) aus · nachher (mit Fix) 289/317/322/338/668 px, kein Alarm in 8 s.

- [x] 2026-10-01 · P1 · Club: Ausgang öffnet erst mit einem Grund · `297f845` ·
  abgespalten von „Club zum Ort machen" (siehe Blockiert). Gemessen per Headless-Lauf:
  frischer Levelstart, direkt zum Ausgang, E gedrückt -> Modus blieb vorher 'cutscene'
  (sofort offen), jetzt bleibt er 'spiel'. Nach einer Interaktion (Wasser am
  Waschbecken) -> E am Ausgang wechselt zu 'cutscene'.

- [x] 2026-10-01 · P1 · Level 2: Mitnehmen-Wahl kommt nach dem Kampf · `b524a82` ·
  Wahl steht jetzt am Levelanfang, `aktiveAufgaben()` filtert danach. Gemessen per
  Headless-Lauf: bei „klein" sind nur jacke+ausweis aktiv, Kampf/Cutscene lösen schon
  danach aus, Crew danach [MORITZ, MAX FERDI]; bei „alle" bleibt alleFertig() mit nur
  jacke+ausweis false, nach allen vieren true, Crew danach [MORITZ, MAX FERDI, FINN,
  DAVID]. DER SCHLÄFER/DER TELEFONIERER heißen jetzt FINN/DAVID, mit je drei Sätzen
  nach dem Aufwecken/Holen.

- [x] 2026-10-01 · P2 · Bus: blinkendes E über den Verstecken erscheint nie · `ba1890b`
  · Zeichenroutine nutzte eine eigene hartkodierte Tiefenprüfung (<=0.3) statt
  tiefeNah() wie naheVersteck(). Da S.tiefe im Bus (Tiefe aus) bei gangTiefe (0.72)
  steht und alle Verstecke t 0.10-0.20 haben, war die Prüfung nie erfüllt. Gemessen:
  Bedingung für das E an Versteck v1 war false, ist jetzt true - naheVersteck() fand
  den Spot beide Male.

## Blockiert

*(Was die Routine zweimal versucht hat und zurückgerollt hat — mit Grund.)*

- **2026-10-02 · P1 · Club-Decke: Banner oder Galerie an der Rückwand** — zweimal
  gebaut (zuerst bei y 24, dann tiefer bei y 56, beides x 630-1060 ueber Bar und
  Raucherecke), beide Male per `git restore level5.html` zurueckgerollt, weil die
  vorgeschriebene Messung (`node tools/nachttest.js`) den Bereich nie erreicht:
  der 60-s-Zufallslauf bewegt sich in Level 5 mit diesem Seed nur von x=40 bis
  x≈371 (Eingang und ein Stueck Tanzflaeche, siehe neuer Punkt unten), bevor ein
  Minispiel die restliche Zeit fuellt. Direkt mit der Kamera auf x=800 gestellt
  (wie beim Hinterausgang) sinkt die Zeile dort tatsaechlich von 65 % auf 40,6 %
  - der Baustein wirkt also, aber `node tools/nachttest.js` meldet trotzdem
  unveraendert 52,83 % (gerundet 53 %), weil dort nie hingeschaut wird. Fertig
  wenn in NACHT-TODO.md verlangt „leere Bildzeilen im Club" aus genau diesem
  Lauf - mit dem jetzigen Zufallslauf ist das Ziel so nicht pruefbar. Bleibt
  offen, bis der neue Punkt „Nichtstun-Zufallslauf Level 5 kommt nie ueber
  x=400 hinaus" entschieden ist.

- **2026-10-01 · P1 · Obere Bildhälfte füllen** — nicht gebaut, kein Code geändert.
  Grund: das Ziel (Club unter 45 % leere Zeilen, gemessen gerade bei ~78 %) verlangt
  eine Senkung um über 30 Punkte - das braucht durchgehende neue Deko (Decke, Lichter,
  Lautsprecher) über weite Teile der 1400 px Levelbreite, nicht ein paar Lampen an
  einer Stelle. Das ist ein echtes Kunst-/Gestaltungsprojekt, kein kleinster Eingriff,
  und unter Zeitdruck zusammengeschustert haette es eher ungleichmaessig/unruhig
  gewirkt als geholfen (siehe „Zweifelst du..." in `routinen/nacht.md`). Aufgeteilt am 1.10. in die Punkte Club-Decke und Obere Bildhälfte Level 2/6/7/8 (P1).
  Bleibt offen, jetzt mit echter Messzahl (vorher geschaetzt, jetzt durch den Software-Canvas von
  heute Nacht gemessen: 78 % statt der frueheren Browser-Schaetzung 73 %, Naeherung).

- **2026-10-01 · P1 · Club zum Ort machen: vier von sechs Bereichen sind leer** — nicht
  gebaut, kein Code geändert. Grund: der Punkt ist drei verschiedene Dinge in einem
  (Ausgang-Bedingung, vier Bereiche mit echtem Inhalt, mehr Nichtstun-Ereignisse) und
  der Inhaltsteil braucht neue Sprites/Deko und geschriebene Szenen - kein kleinster
  Eingriff, und unter Zeitdruck zusammengeschustert hätte es dem Club eher geschadet
  als genützt (siehe „Zweifelst du..." in `routinen/nacht.md`). Aufgeteilt in zwei
  neue, kleinere Punkte unter „Offen": die Ausgang-Bedingung (klein, sicher) und der
  Inhalt der vier Bereiche (bleibt groß, aber jetzt ohne die Ausgang-Frage vermischt).
