# Was noch fertig werden muss

Stand: Level 1 (Die Schule), Level 2 (Bei Moritz) und Level 3 (Der Nachtbus)
sind spielbar und durchspielbar. Alles andere steht hier.

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

Jedes Level ist eine Stufe des Abends. Eins bis drei stehen, der Rest ist Konzept.

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei

**Offen in Level 2:** nichts mehr — alle drei Punkte sind umgesetzt:

- [x] Acht Statisten, die rumstehen, im Takt wippen und vor sich hin reden
- [x] Der Kracher hat vier Angriffsmuster, die Balkenfarbe ist die Antwort
- [x] Musik zerrt, verstimmt und dumpft mit steigendem Pegel

- [x] **Level 3 — Der Nachtbus.** ✅ Fünf Haltestellen, Bremsen zum Festhalten,
      zwei Kontrolleure, Türen mit Zeitfenster, DER LANGE schaltet frei

**Offen in Level 3:**

- [ ] **Der Name „DER LANGE" ist ein Platzhalter** — kommt vom Nick, wie alle
      Namen. Steht an drei Stellen: `LEUTE` in `level3.html`, `speichereCrew`
      am Levelende und `maxLeben()` in allen drei Dateien
- [ ] Die Kontrolleure steigen nie aus und wieder ein — an einem Halt durch die
      andere Tür zurückzukommen wäre ihr bester Zug
- [ ] Die Haltestellen sehen alle gleich aus (ein Schild, ein Bahnsteig)
- [ ] Wer im Versteck sitzt, wenn der Bus an *seiner* Haltestelle hält, merkt
      nichts davon — ein Ton dafür fehlt

**Noch Konzept:**

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

- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen — drei sind da
      (Max Ferdi, Moritz, Der Lange), vier fehlen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Die anderen tauchen in je einem Level auf
- [x] **Fähigkeiten gelten über alle Level** — hängen an genau einer Stelle je
      Datei: `tempoBonus()` und `maxLeben()`
- [ ] Weitere Fähigkeiten festlegen (Doppelsprung, härterer Konter, mehr Ausdauer …)
      — vergeben sind bisher Tempo (Max Ferdi), Chayas (Moritz, wirkt erst im
      Club) und Extraherz (Der Lange)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

> Der Kracher in Level 2 ist der Prototyp für das, was hier steht: Muster als
> Daten (`MUSTER`), Phasen als Liste (`PHASEN`), Farbe des Balkens als Sprache,
> Starre statt Schadensstrafe für Fehlschläge. Wer das große Kampfsystem baut,
> fängt am besten dort an und nicht bei null.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [x] **Fehlschläge bestrafen** — Starre statt Herz, und jeder weitere Druck
      setzt sie neu (in Level 2 umgesetzt, muss noch überall gelten)
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
      — **wird dringend**: Font, Bild-Cache, Audio-Grundgerüst, Canvas-Anpassung
      und Eingabe stehen jetzt dreimal fast identisch in drei Dateien. Vor
      Level 4 sollte das in eine gemeinsame Datei
- [x] Spielstand speichern — `nachtschicht.crew`, `nachtschicht.pegel` und
      `nachtschicht.bestzeit1/2/3` im localStorage
- [x] Übergänge zwischen den Leveln — Levelleiste unter dem Bild, Ziffern auf
      dem Titelbild, und am Levelende geht es direkt ins nächste
- [ ] Level 4 an Level 3 anschließen (Level 3 endet noch auf Level 1)
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
