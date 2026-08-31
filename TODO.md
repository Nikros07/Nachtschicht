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

**Offen in Level 2:** — nichts mehr, siehe Erledigt

- [x] Mehr Leute in der Wohnung, die nur rumstehen (Atmosphäre)
- [x] Der Kracher am Ende braucht mehr als ein Angriffsmuster
- [x] Musik lauter/verzerrter je höher der Pegel

- [x] **Level 3 — Der Nachtbus.** ✅ Fahrender Untergrund, Kontrolleure, Timing,
      der Pegel fährt mit, *Der mit der Box* schaltet frei

**Offen in Level 3:**

- [ ] **Der Name von *Der mit der Box*** — er heißt nach dem, was er trägt, weil
      Namen und Eigenheiten laut unten vom Nick kommen. Mechanik und Cutscene
      stehen, nur der Name muss ersetzt werden. Steht in `SZENEN_MIT`,
      `redeBoxmann()` und `SPIELSTAND.merkeCrew(...)`
- [ ] Die letzten ~100 Pixel ganz hinten erreicht ein Kontrolleur in einem
      Streckenabschnitt nicht — für die letzte Kontrolle ist die hinterste Bank
      damit sicher. Entweder Bus kürzen oder Kontrolle einen Halt früher
- [ ] Mehr als eine Sorte Ruck — bisher unterscheiden sich Bremse, Kurve und
      Anfahren nur in Richtung und Vorwarnzeit, nicht im Verhalten

**Die nächsten Level:**

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

Bisher vergeben: **Max Ferdi** (Level 1, +15 % Tempo), **Moritz** (Level 2,
läuft besser mit den Chayas), **Der mit der Box** (Level 3, ein Herz mehr —
Name noch offen).

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
      *(in Level 2 als `TUNE.fehlSperre` gebaut — beim Zusammenführen übernehmen)*
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
      *(in Level 2 als `TUNE.konterFenster` gebaut, steht auf 0,7 —
      beim Zusammenführen übernehmen und härter stellen)*
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase
      *(Muster-Tabelle aus Level 2 (`MUSTER`) ist die Vorlage: pro Angriff
      Farbe, Zeichen, Bild, Vorwarnzeit, Reichweite und Antwort)*

---

## Technik

- [x] **Gemeinsamer Unterbau in `engine.js`** — Font, Bild-Cache, Vollbild,
      Touch, Ton, Musikbus, Spielstand. Vorher trug jede Seite ihre eigene
      Kopie; bei acht Leveln wären es acht gewesen
- [x] **Spielstand speichern** — Crew, Bestzeit je Level und der Pegel, der von
      Level zu Level mitfährt. Welches Level frei ist, ergibt sich aus der Crew
      statt aus einem eigenen Eintrag
- [x] **Musik pro Level** — jedes Level hat eine eigene Basslinie, und der
      Musikbus (Zerre + Tiefpass) hängt am Pegel

- [ ] **Level 1 und 2 auf `engine.js` umstellen.** Sie laufen noch auf ihren
      eigenen Kopien des Unterbaus — rund 250 Zeilen doppelt, je Datei.
      Level 3 zeigt, wie es geht. Weil beide Level fertig und durchspielbar
      sind, gehört das mit Bildvergleich vorher/nachher gemacht, nicht
      nebenbei. **Das blockiert alles Weitere an der Technik.**
- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
      *(erst sinnvoll, wenn alle drei Level auf demselben Unterbau laufen)*
- [ ] Übergänge zwischen den Leveln — bisher springt man über `location.href`
      von Abspann zu Titelbild
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Level frei/gesperrt auch in der Leiste anzeigen — `SPIELSTAND.frei(n)`
      steht bereit, die Leiste lässt aber bewusst noch überall hin
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
- [x] **Acht Statisten in Moritz' Wohnung** — drei Posen, eigene Kleidung,
      jubeln wenn was klappt, geben Sprüche von sich. Ohne Aufgabe, ohne
      Einfluss aufs Spiel; die Aufstellung wird beim Laden geprüft
- [x] **Der Kracher hat drei Angriffsmuster** — Schwinger (kontern), Griff
      (weglaufen), Feger (springen). Dafür darf man im Kampf laufen und
      springen, und wer ihn ins Leere greifen lässt, kriegt sein Fenster
- [x] **Konterfenster und Fehlschlag-Sperre** — der Konter zählt erst im
      letzten Teil des Ausholens, Danebenhauen sperrt kurz die Taste
- [x] **Musikbus mit Zerre und Tiefpass** — Musik wird lauter, dreckiger und
      dumpfer mit dem Pegel; Rückmeldungs-Geräusche bleiben sauber
- [x] **`engine.js`** — gemeinsamer Unterbau für alle Level, als normales
      Script statt als Modul, damit der Doppelklick auf `index.html` weiter reicht
- [x] **Level 3: Der Nachtbus** — Ruck mit Vorwarnung und Festhalten,
      Kontrolleure die den Bus durchsweepen, Verstecken im Pulk, Aussteigen und
      vorne wieder rein, die Box als Belohnung mit Wirkung, Stadt und Straße
      laufen mit dem Bustempo mit
- [x] **Der Pegel fährt von Level 2 nach Level 3 mit** — und macht dort nicht
      mutiger, sondern wackeliger
