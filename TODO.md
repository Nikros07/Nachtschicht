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

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster
  Kampf, Moritz schaltet frei
- [x] **Level 3 — Der Nachtbus.** ✅ Sechs Haltestellen, Ruckeln und
  Haltestangen, Kontrolleure in Wellen, Türen als einziger Weg an ihnen vorbei

### Noch offen

**Level 2** — die drei offenen Punkte sind erledigt:

- [x] Sechs Leute stehen jetzt in Wohnzimmer, Küche und Moritz' Zimmer rum,
  schwanken im Takt und haben nichts zu sagen
- [x] Der Kracher hat drei Angriffsmuster: rot kontern, gelb ausweichen, blau
  drüberspringen. Wer ausweicht, kriegt ein Fenster zum Zuschlagen
- [x] Musik wird lauter, schneller und ab der Hälfte verstimmt, je höher der
  Pegel steht

- [ ] Die Leute im Hintergrund reagieren auf nichts — kein Jubel, wenn alle
  bereit sind, keine Reaktion auf den Kampf im Flur

**Level 3**

- [ ] Der Name des Jungen ist ein Platzhalter (`JUNGE` ganz oben in
  `level3.html`) — der echte Name kommt vom Nick
- [ ] Seine Fähigkeit ist noch nicht eingebaut: er fährt die Linie jedes
  Wochenende und hört die Bremsen vorher. Gedacht ist längere Vorwarnung bei
  allem, was sichtbar ausholt — das zahlt erst ab Level 4 ein
- [ ] Nur zwei Wellen Kontrolleure pro Fahrt. Bei mehr Haltestellen bräuchte es
  auch mal eine, die in der Mitte einsteigt
- [ ] Draußen auf dem Bürgersteig passiert nichts außer Laufen

### Kommt noch

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

- [x] Drei sind dabei: Max Ferdi (Level 1), Moritz (Level 2), der Junge aus dem
  Nachtbus (Level 3, Name noch offen)
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
- [x] **Fehlschläge bestrafen** — in Level 2 umgesetzt: ein Schlag ins Leere
  kostet 0,55 s, und jeder weitere Druck setzt die Zeit neu. Dauerfeuer auf `E`
  gewinnt den Kampf jetzt nicht mehr. Muss beim Zusammenführen mitwandern
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] **Gemeinsamer Kern in `engine.js`, Gehäuse in `gehaeuse.css`** — Font,
  Bild-Cache, Sprite-Helfer, Ton, Bildschirm. Stand vorher in jeder Level-Datei
  komplett drin
- [x] **Spielstand speichern** — ein Schlüssel `nachtschicht.stand` mit Crew,
  offenen und geschafften Leveln, Bestwerten und dem Pegel. Alte Einträge
  werden übernommen
- [x] **Übergänge zwischen den Leveln** — laufen über `LEVELS` in `engine.js`.
  Ein neues Level braucht dort eine Zeile, dann findet der Übergang davor es
- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
  — die Navigation steht, die Welt selbst steht noch in der Level-Datei
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Musik pro Level statt einer Schleife — jedes Level hat inzwischen eine
  eigene Basslinie, aber alle nach demselben Muster
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
- [x] Levelleiste zeigt, was geschafft ist und was noch kommt
- [x] Der Pegel läuft über die Level hinweg weiter
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
