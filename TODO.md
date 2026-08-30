# Was noch fertig werden muss

Stand: Level 1 (Die Schule) ist spielbar und durchspielbar. Alles andere steht hier.

Reihenfolge ist bewusst: was oben steht, blockiert das darunter.

---

## Level 1 — Die Schule ✅ fertig

Alles aus der ursprünglichen Liste ist umgesetzt: Intro, Spinde, Schleichen,
Geräusche, Fundstücke, Direktor als Patrouille, Zeitdruck, Zettel-Hinweise,
Handy mit Taschenlampe und Nachrichten, zwei Spielarten, Cutscene mit Max Ferdi.

**Offen geblieben (bewusst):**

- [ ] Zweiter Ausgang durchs Fenster — verworfen, brachte zu wenig
- [ ] Handy-Steuerung auf einem echten Gerät testen (bisher nur emuliert)
- [ ] Mehr Abwechslung in den Möbelarten selbst (nicht nur Position)

---

## Die anderen Level

Jedes Level ist eine Stufe des Abends. Level 1 steht, der Rest ist Konzept.

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, Kampf mit drei Mustern, Moritz schaltet frei

**Offen in Level 2:**

- [x] **Sechs Statisten in der Wohnung** — wippen, trinken, sagen ab und zu
      was; rein optisch, sie blockieren nichts
- [x] **Der Kracher hat jetzt drei Angriffsmuster** — Schwinger (kontern),
      Tiefschlag (drüberspringen, dann kontern) und Doppel (zweimal kontern);
      Konterfenster nur im letzten Drittel, Fehlschläge werden bestraft, sein
      Ausholen wird mit jedem Treffer kürzer
- [x] **Musik lauter und verzerrter je höher der Pegel** — ein verstimmter
      Zwilling legt sich über den Bass, ab der Hälfte kippt die Wellenform
      und der Takt fängt an zu schleppen
- [ ] **Level 3 — Der Nachtbus.** Fahrender Untergrund, Kontrolleure, Timing
- [ ] **Level 4 — Die Schlange.** Erster echter Boss: der Türsteher
- [ ] **Level 5 — Club.** Stroboskop, schlechte Sicht, das Mädels-Minispiel
- [ ] **Level 6 — Afterhour.** Surreal, verzerrt, die Schule taucht wieder auf
- [ ] **Level 7 — Späti.** Ruhepause, Story, kein Kampf
- [ ] **Level 8 — Heimweg.** Endgegner: die Sonne

---

## Das Club-Minispiel

- [ ] Ansprechen startet ein eigenes Minispiel
- [ ] Erfolg → Confidence-Boost: kurz unverwundbar, schneller, mehr Schaden
- [ ] Misserfolg → geknickt: langsamer, weniger Reichweite, bis man sich fängt
- [ ] Mechanik muss noch festgelegt werden (Timing? Auswahl? Rhythmus?)

---

## Die Jungs

Das Herzstück. Jedes Level bringt einen aus der Crew, jeder gibt eine Fähigkeit.

- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Die anderen tauchen in je einem Level auf
- [x] **Struktur für Fähigkeiten steht** — die Liste `JUNGS` in `spielstand.js`
      hält Name, Level und Wirkung; die Level rechnen nicht mehr selbst
- [ ] Restliche Fähigkeiten festlegen (Doppelsprung, Extraherz, härterer Konter,
      mehr Ausdauer …) — bisher belegt: Tempo (Max Ferdi), Charme (Moritz)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [x] **Fehlschläge bestrafen** — beim Kracher umgesetzt (Treffer plus 0,8 s
      danebenstehen). Im übernommenen Kampfsystem noch offen.
- [x] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens —
      beim Kracher umgesetzt, sichtbar als grünes Stück am Balken
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] **Spielstand speichern** — `spielstand.js`: freigeschaltete Level, Crew und
      Bestzeiten in einem Schlüssel, alte Spielstände werden übernommen
- [x] **Übergänge zwischen den Leveln** — Abblenden, Levelkarte, Aufblenden
- [x] **Levelliste als Daten** — die Liste `LEVEL` in `spielstand.js` ist die
      einzige Stelle, an der ein Level angemeldet wird; Levelleiste,
      Freischaltung und Übergänge lesen von dort
- [ ] Auch die **Level-Inhalte** als Daten (Räume, Möbel, Gegner) — noch stecken
      sie in der jeweiligen HTML-Datei, ein neues Level heißt neue Datei
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Musik pro Level statt einer Schleife
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen

---

## Optik

- [ ] Mehr Abwechslung in den Räumen — aktuell wiederholen sich die Möbel
- [ ] Wetter und Tageszeit pro Level
- [ ] Übergangsbilder zwischen den Leveln
- [ ] Mehr Animationsbilder für den Spieler
- [ ] Bildschirmerschütterung und Treffer-Effekte feiner abstimmen

---

## Erledigt

- [x] Pixel-Art-Grundgerüst mit CRT-Optik und eigenem Bitmap-Font
- [x] Bild-Cache: Zeichenzeit von 4,8 ms auf 1,2 ms pro Bild
- [x] Vollbild auf Desktop und Handy, Querformat-Hinweis
- [x] Touch-Steuerung mit runden Tasten
- [x] Bildbreite wächst mit dem Bildschirm mit, keine schwarzen Balken
- [x] Kampfsystem mit Kontern, fünf Gegnertypen, vier Bossen (in `runner.html`)
- [x] **Level 1: Etagen, Treppen, Räume, Schlüsselsuche, Lehrer mit Sichtkegel**
- [x] **Cutscene am Ende von Level 1: der Direktor wird gepackt**
- [x] Bewegung mit Beschleunigung und Bremsung statt an/aus
- [x] GitHub Pages läuft
- [x] Intro: letzter Schultag, Nachsitzen verpennt
- [x] Sieben eigene Raumstile mit Wandfarbe, Fenstern, Einrichtung
- [x] Spinde zum Verstecken, mit Sehschlitz und Nahaufnahme
- [x] Schleichen auf Shift, halbiert die Sichtweite
- [x] Werfen auf R, lenkt ab und bricht Verfolgungen ab
- [x] Handy: Taschenlampe, Akku, Nachrichten der Jungs, verräterische Vibration
- [x] Zettel als Hinweise — erster Fund nennt die Etage, zweiter den Raum
- [x] Der Direktor wandert über alle Etagen
- [x] Zwei Spielarten pro Runde: Schlüssel im Raum oder beim Hausmeister
- [x] Uhr mit Zeitdruck und Zeitstrafe beim Erwischtwerden
- [x] Funde: Akku, Energydrink, Notizen
- [x] Max Ferdi als erster Junge freigeschaltet, +15 % Tempo
- [x] Bestzeit, Cutscene überspringbar
- [x] Vollständige Spielanleitung im README
- [x] Gemeinsamer Spielstand für alle Level (`spielstand.js`)
- [x] Levelleiste zeigt alle acht Level, gesperrte sichtbar aber nicht anklickbar
- [x] Übergangsbild beim Levelwechsel
- [x] Spielstand löschen über die Levelleiste
- [x] `E` auf dem Endbild von Level 1 führt wirklich weiter (lief vorher ins Leere)
- [x] Prozentzeichen im Bitmap-Font (`+15% TEMPO` stand als `+15? TEMPO` da)
- [x] Der Kracher mit drei Angriffsmustern, Konterfenster und Fehlschlagstrafe
- [x] Im Kampf kann gesprungen werden (vorher stand die Physik still)
- [x] Statisten in Moritz' Wohnung
- [x] Musik verzieht sich mit dem Pegel
