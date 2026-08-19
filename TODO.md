# Was noch fertig werden muss

Stand: Level 1 bis 3 sind spielbar und durchspielbar und hängen aneinander.
Alles andere steht hier.

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

**Offen in Level 2:** — alles abgearbeitet

- [x] Mehr Leute in der Wohnung, die nur rumstehen — neun Statisten in sieben
      Posen, mit eigenem Gequatsche. Bewusst nicht ansprechbar, sonst wären
      Möbel neben ihnen nicht mehr durchsuchbar
- [x] Der Kracher am Ende braucht mehr als ein Angriffsmuster — Schwinger,
      Doppelschlag und Griff, dazu Konterfenster, Fehlschlag-Sperre und
      Bewegung im Kampf
- [x] Musik lauter/verzerrter je höher der Pegel — der Ton läuft jetzt über
      einen Bus mit Zerre und Tiefpass, dazu schiefe Töne und eiernder Takt

**Noch offen in Level 2:**

- [ ] Der Kracher könnte einen Fernangriff vertragen (Flasche), sobald das
      Kampfsystem aus `runner.html` drin ist
- [ ] Die Statisten reagieren nicht darauf, wenn man durch sie durchläuft

- [x] **Level 3 — Der Nachtbus.** ✅ Fahrender Boden mit Wanken und
      Haltestangen, zwei Kontrolleure mit Prüf-Fenstern, Fahrschein und
      Entwerter, Vollbremsung zum Schluss. Der Lotse schaltet frei.

**Offen in Level 3:**

- [ ] Aussteigen und an der nächsten Tür wieder rein — als dritter Weg an den
      Kontrolleuren vorbei. Rausgeworfen, weil erst der Kern stehen sollte
- [ ] Die Fahrgäste reagieren nicht, wenn man vor ihnen hinfällt
- [ ] Musik pro Streckenabschnitt statt einer Schleife

**Die restlichen Level:**

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

Drei stehen: **Max Ferdi** (+15 % Tempo, Level 1), **Moritz** (besser bei den
Chayas, Level 2), **Der Lotse** (ein Herz extra, Level 3). Die Fähigkeiten
wirken über Level hinweg — wer den Lotsen hat und Level 2 nochmal spielt, geht
mit vier Herzen in den Kampf.

- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen — drei sind da
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Die anderen tauchen in je einem Level auf
- [x] Fähigkeiten festlegen — drei sind fest, vier fehlen (Doppelsprung,
      härterer Konter, mehr Ausdauer …)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

Zwei Punkte davon stehen schon: am Kracher in Level 2 ist das Konterfenster
und die Strafe fürs Danebenhauen ausprobiert. Beim Umzug übernehmen statt neu
erfinden.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [x] **Fehlschläge bestrafen** — kurze Sperre, in Level 2 erprobt
- [x] **Konterfenster verkleinern** — in Level 2 auf die letzten 60 % des
      Ausholens, sichtbar als heller Strich unter dem Balken
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [ ] **Der gemeinsame Motor gehört ausgelagert.** Font, Bild-Cache, Sprites,
      Audio-Bus, Leinwand-Aufbau und Touch-Steuerung stehen jetzt dreimal fast
      wortgleich in `index.html`, `level2.html` und `level3.html` — rund 400
      Zeilen pro Datei. Vor Level 4 einmal in eine `motor.js` ziehen, sonst
      wird jede Änderung am Font viermal gemacht. Kein Build-Schritt nötig,
      ein `<script src>` reicht auch auf GitHub Pages
- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
- [x] Spielstand speichern — Crew, Restpegel und Bestzeiten liegen im
      `localStorage` und wandern zwischen den Leveln
- [ ] Welche Level frei sind, wird noch nicht gespeichert: alle drei sind
      immer anwählbar
- [x] Übergänge zwischen den Leveln — Levelleiste unter dem Bild, Tasten 1/2/3
      auf dem Titelbild, und der Siegbildschirm führt ins nächste Level
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
- [x] **Level 2: Wohnung, vier Aufgaben, Pegel, der Kracher mit drei Mustern**
- [x] Statisten in der Wohnung, die von selbst vor sich hin quatschen
- [x] Audio-Bus mit Zerre und Tiefpass — der Pegel färbt den Ton
- [x] **Level 3: Nachtbus mit fahrendem Boden, Wanken und Haltestangen**
- [x] Kontrolleure, die nur sehen, wenn sie laufen — Prüfen ist dein Fenster
- [x] Fahrschein finden und entwerten, oder schwarz vorbeikommen
- [x] Vollbremsung als Schlusspunkt, Hupe als Vorwarnung
- [x] Crew, Restpegel und Bestzeiten wandern zwischen den Leveln
