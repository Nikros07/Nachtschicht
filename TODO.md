# Was noch fertig werden muss

Stand: Level 1 bis 3 sind spielbar und durchspielbar. Alles andere steht hier.

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

Jedes Level ist eine Stufe des Abends. Drei stehen, der Rest ist Konzept.

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei
- [x] **Level 3 — Der Nachtbus.** ✅ Fahrender Untergrund, Ruck mit Vorwarnung, zwei Kontrolleure, fünf Stationen, der Lange schaltet frei

**Offen in Level 2:**

- [x] Mehr Leute in der Wohnung, die nur rumstehen (Atmosphäre)
- [x] Der Kracher am Ende braucht mehr als ein Angriffsmuster
- [x] Musik lauter/verzerrter je höher der Pegel

**Offen in Level 3:**

- [ ] Ein Wegbier von Moritz: Pegel rauf gegen Mut — noch keine Verwendung für
      Mut im Bus gefunden, deshalb erstmal draußen gelassen
- [ ] Der Bus könnte an einer Station leerer und an einer voller werden
- [ ] Der Fahrer als Figur (er sieht Dich im Spiegel, wenn Du liegst)

**Noch nicht angefangen:**

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
- [ ] Moritz' Fähigkeit hängt daran — er ist seit Level 2 dabei und kann bisher
      nichts. Das ist die einzige offene Schuld im Crew-System.

---

## Die Jungs

Das Herzstück. Jedes Level bringt einen aus der Crew, jeder gibt eine Fähigkeit.

Die Fähigkeiten liegen jetzt zentral in `spielstand.js` (`tempoBonus`,
`lebenBonus`). Ein neues Level fragt sie nur noch ab.

- [x] Max Ferdi (Level 1) — +15 % Tempo
- [ ] Moritz (Level 2) — Fähigkeit steht noch aus, hängt am Club-Minispiel
- [x] Der Lange (Level 3) — ein Herz mehr
- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Weitere Fähigkeiten festlegen (Doppelsprung, härterer Konter, mehr Ausdauer …)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] **Namen und Eigenheiten: kommt vom Nick.** „Der Lange" ist ein Platzhalter
      im Stil von „Der Schläfer" und „Der Telefonierer" — echte Namen fehlen.

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das alte Kampfsystem liegt weiter in `runner.html`. In Level 2 steht inzwischen
ein eigener, kleinerer Kampf, in dem ein Teil davon schon umgesetzt ist.

- [x] **Fehlschläge bestrafen** — ein Schlag ins Leere gibt eine Erholung, die
      genau so lang ist, dass man das echte Fenster verpasst (Level 2)
- [x] **Konterfenster verkleinern** auf das letzte Stück des Ausholens (Level 2)
- [x] **Unblockbare Angriffe** — der Wuchtige, den man ausweichen muss (Level 2)
- [ ] Nahkampf und Combos aus `runner.html` übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere
      Vorwarnung, Arena verändert sich pro Phase
- [ ] Das Kampfsystem gehört in eine gemeinsame Datei neben `motor.js` — aktuell
      steht der Level-2-Kampf noch komplett in `level2.html`

---

## Technik

- [x] Spielstand speichern (welches Level ist frei, welche Jungs sind dabei,
      Bestzeiten, Pegel) — `spielstand.js`
- [x] Übergänge zwischen den Leveln — Siegbild führt ins nächste, Levelleiste
      und Titelauswahl bauen sich aus der Levelliste
- [x] Gemeinsamer Motor: Bildschirm, Zeichensatz, Bild-Cache, Toene liegen in
      `motor.js` statt dreimal wortgleich in den Leveldateien
- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
      — halb erledigt: die Levelliste steht zentral, der Inhalt eines Levels ist
      weiterhin Code
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Musik pro Level statt einer Schleife — Level 2 und 3 haben eigene, Level 1
      noch die alte
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen
- [ ] Ein automatischer Durchlauf im Browser als Regressionstest wäre wenig
      Arbeit — die Level lassen sich mit abgeklemmter Bildschleife in
      Millisekunden durchsimulieren

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
- [x] Level 2 komplett: Wohnung, Pegel, vier Aufgaben, Kracher mit drei Mustern
- [x] Level 3 komplett: Nachtbus, Ruck, Kontrolleure, Monatskarte, fünf Stationen
