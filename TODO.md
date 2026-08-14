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

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei

**Offen in Level 2:**

- [x] Mehr Leute in der Wohnung, die nur rumstehen (Atmosphäre) — zehn Statisten
      in `STATISTEN`, tanzend, sitzend, quatschend. Reine Kulisse, sie tauchen in
      keiner Reichweiten-Prüfung auf
- [x] Der Kracher am Ende braucht mehr als ein Angriffsmuster — Schwinger, Finte
      und Flaschenwurf, dazu Deckung ab dem zweiten Treffer. Farbe des Balkens
      sagt die Antwort. Bewegung und Springen im Kampf freigeschaltet
- [x] Musik lauter/verzerrter je höher der Pegel — eigener Musikbus mit
      Verzerrer und Tiefpass, Beat zieht sich, Bass schwankt
- [ ] Die Statisten sind noch stumme Kulisse — ein oder zwei davon könnten beim
      zweiten Durchgang etwas Nützliches sagen (wo die Jacke liegt zum Beispiel)
- [ ] Der Kracher wiederholt sich nach vier Treffern nicht mehr — für einen
      härteren Modus fehlt eine zweite Phase (kürzere Vorwarnung, zwei Flaschen)
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

In Level 2 ist ein erster Teil davon schon gebaut und getestet — Blocken,
Patzer-Strafe und ein begrenztes Konterfenster stehen dort im `TUNE`-Block und
können beim Zusammenführen von dort übernommen werden.

- [ ] Nahkampf, Konter, Combos übernehmen
- [x] **Gegner müssen blocken können** — in Level 2 gebaut: der Kracher deckt
      sich ab dem zweiten kassierten Treffer beim Anlauf
- [x] **Fehlschläge bestrafen** — in Level 2 gebaut: ein Patzer kostet Tempo
      *und* den laufenden Angriff. Blindes Hämmern verliert dort zuverlässig
- [x] **Konterfenster verkleinern** auf das letzte Stück des Ausholens — in
      Level 2 gebaut (`konterFenster`, letzte 62 % des Ausholens)
- [ ] Dasselbe für die Gegner aus `runner.html` nachziehen
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] Spielstand speichern (welches Level ist frei, welche Jungs sind dabei) —
      ein Schlüssel `nachtschicht.stand` mit `{ frei, crew, zeiten }`. Alte
      Stände (`nachtschicht.crew`, `nachtschicht.bestzeitN`) werden beim ersten
      Laden übernommen. `?frei=alle` hängt zum Ausprobieren alle Schlösser aus
- [x] Übergänge zwischen den Leveln — Level 1 schaltet Level 2 frei, `E` auf dem
      Siegbildschirm führt wirklich dorthin (stand vorher hinter einem `return`
      und war toter Code), die Levelleiste sperrt was noch zu ist
- [ ] **Level-Daten in eine eigene Struktur, damit neue Level ohne Code
      entstehen.** Das ist inzwischen der eigentliche Engpass, siehe unten
- [ ] Kampfsystem und Level-System zusammenführen

### Entscheidung vor Level 3

`index.html` und `level2.html` sind zwei vollständige Kopien derselben Engine:
Bitmap-Font, Bild-Cache, Sprite-Backen, Vollbild, Touch, Kamera, Audio und
jetzt auch der Spielstand-Block stehen in beiden Dateien wortgleich. Bei zwei
Dateien ist das noch überschaubar, bei acht Leveln ist es nicht mehr zu warten
— jede Änderung am Font oder am Spielstand muss dann achtmal gemacht werden.

Ein drittes Level anzufangen heißt, eine dritte Kopie anzulegen. Deshalb steht
hier eine Entscheidung an, bevor der Nachtbus gebaut wird:

- **A — gemeinsame Datei.** Engine nach `motor.js` ziehen, Level laden sie per
  `<script src>`. Läuft auch von der Festplatte. Kostet die Eigenschaft, dass
  jede Leveldatei für sich allein funktioniert.
- **B — eine Datei, mehrere Level.** Alles in `index.html`, Level als Daten,
  Umschalten ohne Seitenwechsel. Passt am besten zu „kein Download, keine
  Installation“, ist aber der größte Umbau.
- **C — weiter kopieren.** Schnell für Level 3, teuer ab Level 4.

**Braucht eine Ansage vom Nick.** Bis dahin bleibt es bei C.
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
- [x] Zehn Statisten in Moritz' Wohnung — tanzen, sitzen, quatschen
- [x] Der Kracher mit drei Angriffsmustern, Deckung und Patzer-Strafe
- [x] Bewegen und Springen während des Kampfes
- [x] Musik reagiert auf den Pegel: Zerre, Tiefpass, schleppender Beat
- [x] Pause funktioniert auch mitten im Kampf und führt dorthin zurück
- [x] Ein gemeinsamer Spielstand statt drei einzelner Schlüssel
- [x] Level 2 ist gesperrt, bis Level 1 durch ist
