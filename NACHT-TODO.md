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

- [ ] **P1 · Club-Uhr: alle ~25 s ein Ereignis (Durchsage/DJ-Satz)** — Der Club ist nach 107 s still. Ein zeitgesteuertes Ambient-Ereignis (Meldung, kurzer Ton, Blitz) füllt die Lücke. Liste CLUB_EREIGNISSE im TUNE-Block, 6 bis 8 Sätze, zufällig ohne Wiederholung.
  Wo: level5.html (update, TUNE) · Fertig wenn: im Nichtstun-Test (300 s) mindestens 12 Ereignisse, das letzte nach 270 s.
- [ ] **P1 · Club, Eingang: Garderobe zum Ansprechen** — Der Eingang (x 0-170) enthält nichts. Ein Tresen-Objekt mit E-Interaktion (zwei Sätze, einmal nutzbar, kleine Wirkung wie ruf +1).
  Wo: level5.html (ORTE, naechstesZiel, Zeichnen, druckAktion) · Fertig wenn: naechstesZiel() liefert dort ein Ziel, die Aktion wirkt genau einmal, nachttest.js bleibt grün.
- [ ] **P1 · Club, Raucherecke: zwei Stehende mit je einem Satz** — Raucherecke (x 860-1060) ist leer. Zwei Figuren (vorhandene Sprites einfärben) mit je einem eigenen Satz per E. Keine Bäume, nur ein Satz.
  Wo: level5.html (ORTE, Figurenliste, Zeichnen) · Fertig wenn: zwei neue ansprechbare Ziele in dem Bereich; Sätze nur mit erlaubten Zeichen (nachttest.js prüft das).
- [ ] **P1 · Club, Hinterausgang: Kisten und ein Lieferant** — Hinterausgang (x 1200-1400) ist leer. Kisten als Deko plus ein Lieferant mit einem Satz, der den Hinterausgang erklärt.
  Wo: level5.html (ORTE, Zeichnen) · Fertig wenn: Deko sichtbar (leere Bildzeilen in dem Bereich mindestens 5 Punkte niedriger), ein ansprechbares Ziel.
- [ ] **P1 · Club, Klos: prüfen, ob der Befund veraltet ist** — Klos hat mit WASCHBECKEN schon eine Interaktion. Nur messen und entscheiden, kein Bauen.
  Wo: level5.html (ORTE, WASCHBECKEN) · Fertig wenn: Befund steht hier: entweder Klos ist ok und der Punkt gestrichen, oder ein neuer kleiner Punkt.
- [ ] **P1 · Club-Decke: Lautsprecher- und Lampenreihe über die ganze Breite** — Obere Bildhälfte: nur wiederholte Sprites in zeichneClub(), keine neue Kunst. Erster Schritt, nicht das Endergebnis.
  Wo: level5.html (zeichneClub) · Fertig wenn: leere Bildzeilen im Club von 78 % auf höchstens 68 % (Software-Canvas), ohne Fehler im Nachttest.
- [ ] **P1 · Club-Decke: Lichtkegel oder Discokugel über der Tanzfläche** — Zweiter Schritt, nur Tanzfläche (x 170-620), vorhandene Verlauf-Funktionen nutzen.
  Wo: level5.html (zeichneClub) · Fertig wenn: leere Bildzeilen im Club höchstens 58 %.
- [ ] **P1 · Club-Decke: Banner oder Galerie an der Rückwand** — Dritter Schritt für Bar und Raucherecke.
  Wo: level5.html (zeichneClub) · Fertig wenn: leere Bildzeilen im Club höchstens 48 %. Erst danach gilt die obere Bildhälfte im Club als erledigt.
- [ ] **P1 · Obere Bildhälfte Level 2 (Wohnung): ein Element über die Breite** — Bilder, Regal oder Lampen an der Wand. Eine Sorte, wiederholt.
  Wo: level2.html (zeichneWohnung) · Fertig wenn: leere Bildzeilen von 65 % auf höchstens 55 %.
- [ ] **P1 · Obere Bildhälfte Level 6 (Afterhour): ein Element über die Breite** — Deckenleuchten oder Wanddeko, passend zum Traum.
  Wo: level6.html (zeichneFlur) · Fertig wenn: leere Bildzeilen von 69 % auf höchstens 59 %.
- [ ] **P1 · Obere Bildhälfte Level 7 (Späti): Regal und Leuchtreklame** — Oben fehlt die Ladenwand.
  Wo: level7.html (zeichneSzene) · Fertig wenn: leere Bildzeilen von 73 % auf höchstens 63 %.
- [ ] **P1 · Obere Bildhälfte Level 8 (Heimweg): Himmel mit Sternen, Mond, Häuserreihe** — Himmel und Silhouetten, an den Lichtfaktor gekoppelt (himmelFarbe).
  Wo: level8.html (zeichneStrasse) · Fertig wenn: leere Bildzeilen von 76 % auf höchstens 66 %, Sonnenaufgang sieht weiterhin richtig aus (Pixelprobe).

### P2

- [ ] **P2 · Level 4: jede Phase soll die vorige Antwort entwerten** — bisher ändern
  die Phasen nur Zahlen; nach dem zweiten Konter ist alles gesehen.
  Wo: level4.html (`bossPhase`, `naechsteArt`) · Fertig wenn: Phase 2 und 3 verlangen
  je eine andere Antwort als Phase 1.
- [ ] **P2 · Level 4: Jab und Schwung unterscheidbar machen** — eigene Haltung je Angriff.
  Wo: level4.html (`SPR`, Zeichnen des Bosses) · Fertig wenn: beide Muster sehen im
  Ausholen verschieden aus.
- [ ] **P2 · Pegel verengt das Konterfenster unsichtbar (bis −40 %)** — der Balken zeigt
  das Fenster in voller Breite, das echte ist kleiner. Das ist die unfaire Art von schwer.
  Wo: level4.html (`fensterAnteil`, `pegelFaktor`), `nacht/hud.js` · Fertig wenn: der
  goldene Streifen im Balken ist so breit wie das echte Fenster.
- [ ] **P2 · Phase-3-Jab auf HART mit Pegel liegt unter der Reaktionszeit** —
  Wo: level4.html / `KAMPF`-Werte · Fertig wenn: kleinste Vorwarnzeit ≥ 0,28 s auf
  jeder Schwierigkeit, gemessen.
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

- [ ] **P3 · Level 4: Wer nichts tut, wird in 300 s nie getroffen — zu prüfen** —
  `nachttest.js` meldet im Nichtstun-Lauf von Level 4 null Ereignisse. Möglich, dass der
  Boss einen untätigen Spieler nie trifft (Kampf ohne Zeitdruck), möglich auch, dass er es
  tut und nur nichts gemeldet wird. Erst messen: `S.hp` vor und nach 300 s Nichtstun.
  Wo: level4.html (`bossTakt`, `kampf`) · Fertig wenn: der Befund steht hier, und ein
  untätiger Spieler verliert entweder, oder es ist als gewollt vermerkt.
- [ ] **P3 · `tools/level5_baeume.js` löschen** — wortgleiche Zweitkopie der Bäume, wird nur
  von einem alten Umbau-Skript gelesen. Wo: tools/ · Fertig wenn: Datei weg, `pruefe.js` grün.
- [ ] **P3 · Bahn oder Bus?** — Intro sagt Bahn, das Schild sagt BUS. Wo: level3.html ·
  Fertig wenn: ein Wort überall.
- [ ] **P3 · README: Handy-Steuerung beschreibt den alten Stand** — „Steuerkreuz links,
  Aktionstasten rechts" gibt es nicht mehr. Wo: README.md · Fertig wenn: beschreibt
  Stick, Info-Tafel und MENÜ-Knopf.
- [ ] **P3 · `TODO.md` ist veraltet** (Stand 17.9., „Level 3–8 Grundversionen") —
  Wo: TODO.md · Fertig wenn: stimmt mit dem Stand überein oder verweist hierher.

---

## Entscheidung nötig (die Routinen lassen das liegen)

- [ ] **Echte Namen und Gesichter der Freunde** — Platzhalter sind Jonas, Dennis, Semih,
  Lea, Max Ferdi, Moritz, Tobi. Braucht Eingabe von Nick.
- [ ] **Finale in Level 8 entschärfen?** — gemessen sehr knapp; ein reiner Counter-Bot
  bringt den Anführer auf 1 HP, bevor er fällt. Soll es leichter werden?
- [ ] **`runner.html` irgendwo verlinken?** — ist von nirgends erreichbar.

---

## Erledigt (Nacht)

*(Die 5-Uhr-Routine trägt hier ein: Datum · Titel · Commit-Hash)*

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
