# Was noch fertig werden muss

Stand: Alle acht Level sind durchspielbar. Level 1 und 2 sind ausgereift,
Level 3 bis 8 sind erste Grundversionen — spielbar, aber mit sichtbaren Ecken
und Kanten. Was daran noch fehlt, steht hier.

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

Jedes Level ist eine Stufe des Abends. Level 1 und 2 stehen, Level 3 bis 8
sind Grundversionen — durchspielbar, aber noch nicht poliert.

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei

**Offen in Level 2:**

- [ ] Mehr Leute in der Wohnung, die nur rumstehen (Atmosphäre)
- [ ] Der Kracher am Ende braucht mehr als ein Angriffsmuster
- [ ] Musik lauter/verzerrter je höher der Pegel

- [x] **Level 3 — Der Nachtbus.** 🔧 Grundversion. Sprint zur Bahn, dann Gang
      mit Kontrolleuren und Verdachtsbalken, Jonas schaltet frei.
- [x] **Level 4 — Die Schlange.** 🔧 Grundversion. Türsteher-Boss mit zwei
      Schlagmustern, reiner Konter-Kampf ohne Bewegung, Dennis schaltet frei.
- [x] **Level 5 — Club.** 🔧 Grundversion. Stroboskop-Sicht, Ansprechen- und
      Auf-Ex-Minispiel mit Timing-Leiste, Semih schaltet frei.
- [x] **Level 6 — Afterhour.** 🔧 Grundversion. Verzerrte Schule mit Echos und
      Erinnerungsfetzen statt echtem Kampf, Lea schaltet frei.
- [x] **Level 7 — Späti.** 🔧 Grundversion. Kein Kampf, kleine Besorgungen,
      Dialog mit der Crew.
- [x] **Level 8 — Heimweg.** 🔧 Grundversion. Wettlauf gegen die aufgehende
      Sonne, danach Gesamt-Neustart oder nur-dieses-Level-Neustart.

**Offen in Level 3-8 (alle Grundversionen):**

- [ ] Noch nicht auf echten Geräten getestet, nur per Touch-Emulation
- [ ] Crew-Namen (Jonas, Dennis, Semih, Lea) sind Platzhalter — Namen und
      Eigenheiten kommen noch vom Nick, siehe "Die Jungs" weiter unten
- [ ] Weniger Content-Dichte als Level 1/2 (kürzere Räume, weniger Zettel/
      Notizen, einfachere Gegnermuster) — bewusst fürs erste, aber macht
      sich bemerkbar
- [ ] Level 4: nur zwei Schlagmuster, könnte mehr Bosstiefe vertragen
- [ ] Level 5: Stroboskop-Timing und Fenstergrößen brauchen Feinschliff nach
      echtem Spieltest
- [ ] Level 6: Balance zwischen "surreal genug" und "noch navigierbar" prüfen
- [ ] Level 8: Sonne-Wettlauf ist noch recht einfach, könnte mehr Spannung
      vertragen

---

## Das Club-Minispiel

- [x] Ansprechen startet ein eigenes Minispiel — Timing-Leiste, `E` im
      grünen Fenster treffen, umgesetzt in Level 5 (level5.html)
- [x] Erfolg → Confidence-Boost: schneller, größere Reichweite, leichteres
      nächstes Fenster (es gibt kein Schaden-System in Level 5, daher diese
      Auslegung statt "mehr Schaden")
- [x] Misserfolg → geknickt: langsamer, weniger Reichweite, bis man sich fängt
- [x] Mechanik festgelegt: Timing (Zeiger läuft, Fenster treffen)
- [ ] Feinschliff nach echtem Spieltest (Fenstergrößen, Zeigertempo)

---

## Die Jungs

Das Herzstück. Jedes Level bringt einen aus der Crew, jeder gibt eine Fähigkeit.

- [x] Platzhalter-Namen für Level 1-6 vergeben, damit `ladeCrew()`/
      `speichereCrew()` durchgängig funktionieren: Max Ferdi (Tempo +15%),
      Moritz (Level 2/5-Bonus), Jonas (Level 3), Dennis (Level 4, stärkster
      Kampf-Bonus), Semih (Level 5), Lea (Level 6) — **alles Platzhalter,
      warten auf echte Namen und Eigenheiten vom Nick**
- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen — noch eine(r) offen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
      (aktuell: Max Ferdi, Moritz, Dennis — als Kandidaten, nicht final)
- [ ] Die anderen tauchen in je einem Level auf
- [ ] Fähigkeiten pro Person durchgängig festlegen und aufeinander abstimmen
      (aktuell hat jede Person nur einen einzelnen, level-spezifischen Bonus)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Echte Namen und Eigenheiten: kommt vom Nick

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
