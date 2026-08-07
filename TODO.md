# Was noch fertig werden muss

Stand: Level 1 (Die Schule) ist spielbar und durchspielbar. Alles andere steht hier.

Reihenfolge ist bewusst: was oben steht, blockiert das darunter.

---

## Level 1 — Die Schule (spielbar, noch nicht fertig)

**Fehlt noch:**

- [ ] **Zweiter Ausgang** als Alternative (Fenster im Erdgeschoss)
- [ ] **Direktor als Patrouille** vor der Cutscene, nicht nur am Ende
- [ ] **Zeitbonus** — schneller raus gibt mehr Punkte

**Bekannte Schwächen:**

- [ ] Schleichen ist noch zu selten nötig. Solange man nicht rennt, kommt man
      fast überall durch — die Geräusche müssten mehr wehtun oder die
      Sichtkegel enger stehen
- [ ] Alle drei Lehrer verhalten sich gleich. Es fehlt einer, der schneller
      ist, und einer, der stur an einer Stelle klebt
- [ ] Die Spinde stehen alle 130 Pixel im gleichen Abstand. Das sieht nach
      Raster aus, nicht nach Schule
- [ ] Der Direktor am Ende ist reine Cutscene, kein Kampf. Sobald das
      Kampfsystem drin ist, gehört das zusammen

---

## Die anderen Level

Jedes Level ist eine Stufe des Abends. Level 1 steht, der Rest ist Konzept.

- [ ] **Level 2 — Vorglühen.** Enge Wohnung, erste Kämpfe, Pegel-System wird eingeführt
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
- [ ] Fähigkeiten festlegen (Doppelsprung, Extraherz, härterer Konter, mehr Ausdauer …)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [ ] **Fehlschläge bestrafen** — lange Erholung, damit Spammen aufhört
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
- [ ] Spielstand speichern (welches Level ist frei, welche Jungs sind dabei)
- [ ] Übergänge zwischen den Leveln
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
- [x] **Story-Text am Anfang** — sechs Karten Vorspann, einmal pro Sitzung
- [x] **Verstecken in Spinden** — fünf Stück pro Etage, Deckung im Flur
- [x] **Schleichen** — halbes Tempo, Lehrer sieht nur noch 62 % weit
- [x] **Türen hörbar machen** — Geräusch-System: Türen, Rennen und Landen
      sind laut, Schleichen ist lautlos. Lehrer gehen dem Krach nach
- [x] **Mehr Fundstücke** — fünf Zettel, einer verrät die Etage
- [x] Schlüsselsuche eingegrenzt: Hausmeisterzettel plus Notbremse nach
      sieben leeren Fächern
- [x] Lehrer mit Pausen, Umschauen und Nachhorchen statt stumpfem Hin und Her
- [x] Blick durch den Türspalt: steht jemand im Flur, bevor man rausgeht?
- [x] **Am Handy fehlte die Runter-Taste** — Level 1 war dort nicht
      durchspielbar, sobald man einmal oben war
