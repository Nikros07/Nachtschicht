# Was noch fertig werden muss

Stand: Level 1 (Die Schule) und Level 2 (Bei Moritz) sind fertig und
durchspielbar. Sie schalten sich der Reihe nach frei. Alles andere steht hier.

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

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei

**Level 2 ist damit auch durch:**

- [x] Mehr Leute in der Wohnung, die nur rumstehen — acht Gäste, wippen mit dem Pegel, reden halbe Sätze
- [x] Der Kracher hat drei Angriffsmuster: Schlag, Finte, schwerer Schlag
- [x] Musik wird lauter **und** verzerrter je höher der Pegel

**Als nächstes:**

- [ ] **Level 3 — Der Nachtbus.** Fahrender Untergrund, Kontrolleure, Timing
      → Motor und Spielstand stehen bereit. Was noch fehlt, ist die
      Entscheidung, wie das Level gespielt wird: Was ist hier die
      Aufgabe? Der Kontrolleur als Schleich-Gegner wäre eine Wiederholung
      von Level 1. Vorschlag zum Draufschauen: der Bus fährt, Du musst
      Dich festhalten (der Boden bewegt sich), und die eigentliche
      Aufgabe ist, die Jungs wach und im Bus zu halten, bis die richtige
      Haltestelle kommt.
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
- [x] Die Liste der Jungs steht in `fortschritt.js` (`CREW`), mitsamt Fähigkeit.
      Einen dazuschreiben ist eine Zeile — der Tempobonus rechnet sich daraus
      selbst zusammen
- [ ] Fähigkeiten festlegen (Doppelsprung, Extraherz, härterer Konter, mehr Ausdauer …)
      — Max Ferdi (+15 % Tempo) steht, Moritz hat noch keine Wirkung, weil das
      Club-Level fehlt
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [x] **Fehlschläge bestrafen** — wer zu früh drückt, hat den Konter für diesen
      Angriff verspielt (im Kracher, Level 2)
- [x] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens —
      und sichtbar machen: heller Abschnitt im Balken, Gegner blinkt weiß
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase
- [ ] Das Kampfsystem aus dem Kracher (Muster + Konterfenster) ist der bessere
      Ausgangspunkt als das aus `runner.html`. Es gehört als Nächstes selbst
      in `motor.js`, damit Level 4 (Türsteher) nicht wieder von vorn anfängt

---

## Technik

- [x] **Spielstand speichern** — `fortschritt.js`: welche Level sind frei, welche
      Jungs sind dabei, Bestzeit pro Level. Alte Spielstände werden übernommen
- [x] **Übergänge zwischen den Leveln** — Level schalten sich der Reihe nach frei,
      `E` am Ende führt ins nächste. `?alle=1` macht zum Ausprobieren alles frei
- [x] **Levelliste in eine eigene Struktur** — ein neues Level ist ein Eintrag in
      `LEVEL` (fortschritt.js). Leiste, Levelauswahl und Übergang bauen sich daraus
- [x] **Motor raus aus den Leveldateien** — `motor.js`: Schrift, Bild-Cache,
      Zeichnen, Ton, Leinwand. Waren 180 Zeilen doppelt
- [ ] **Leveldaten selbst** in eine Struktur (Räume, Möbel, Wege), damit ein Level
      wirklich ohne Code entsteht. Level 1 und 2 sind zu verschieden gebaut, um
      das jetzt schon festzulegen — sinnvoll erst mit Level 3 als drittem Beispiel
- [ ] Kampfsystem und Level-System zusammenführen (siehe Kampfsystem oben)
- [x] Musik pro Level statt einer Schleife — jedes Level hat seine eigene
      (Level 1 wechselt bei Verfolgung, Level 2 verzerrt mit dem Pegel)
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
- [x] **Level 2: Bei Moritz** — Wohnung, vier Aufgaben, Pegel, erster Kampf
- [x] Gemeinsamer Spielstand und Levelfreischaltung (`fortschritt.js`)
- [x] Gemeinsamer Motor (`motor.js`)
- [x] Der Kracher: Konterfenster, drei Angriffsmuster, Fehlschläge kosten
- [x] Gäste in der Wohnung, Musik verzerrt mit dem Pegel
