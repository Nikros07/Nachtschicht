# Was noch fertig werden muss

Stand: Level 1 (Die Schule) ist spielbar, durchspielbar und hat zwei Wege raus.
Alles andere steht hier.

Reihenfolge ist bewusst: was oben steht, blockiert das darunter.

---

## Level 1 — Die Schule (spielbar, fast fertig)

**Fehlt noch:**

- [ ] **Zweite Etage für den Direktor sperren?** — er wechselt frei, das kann
      sich unfair anfühlen, wenn er zweimal hintereinander hinterherkommt
- [ ] **Mehr Notizen mit echter Story** — die Zettel sagen bisher nur, wo der
      Schlüssel liegt. Sie könnten auch erzählen, warum Du eingesperrt bist
- [ ] **Ton für das Fenster feiner** — das Knacken klingt noch nach Klick,
      nicht nach Metall unter Druck

**Bekannte Schwächen:**

- [ ] Ohne Zettel ist die Schlüsselsuche immer noch lang. Der Hinweis auf die
      Etage kommt erst mit dem ersten Fund
- [ ] Die Türen sind je nach Raum zwischen 70 und 91 Prozent der Zeit sicher
      erreichbar. Am Sekretariat (70) ist es am engsten — dort steht die Runde
      des Lehrers am dichtesten vor der Tür
- [ ] Der Fensterweg hängt stark davon ab, wo der Lehrer gerade steht. Wer den
      Moment nicht abwarten kann, verliert Herzen, ohne zu verstehen warum

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

- [x] **Max Ferdi** ist freigeschaltet und gibt +15% Tempo. Er bleibt über
      Runden hinweg dabei
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

**Das hier blockiert alle weiteren Level:**

- [ ] **Level-Daten in eine eigene Struktur**, damit neue Level ohne Code
      entstehen. `RAEUME`, `SPINDE`, `LEHRER_START`, `BODEN`, `AUSGANG` und
      `FENSTER` liegen heute als lose Konstanten nebeneinander und heißen
      überall so, wie Level 1 sie braucht
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Übergänge zwischen den Leveln
- [ ] Spielstand: welches Level ist frei? (Crew, Bestzeit und Rekord liegen
      schon im `localStorage`, das Muster steht also)
- [ ] Musik pro Level statt einer Schleife
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen

---

## Optik

- [ ] Wetter und Tageszeit pro Level
- [ ] Übergangsbilder zwischen den Leveln
- [ ] Mehr Animationsbilder für den Spieler
- [ ] Bildschirmerschütterung und Treffer-Effekte feiner abstimmen
- [ ] Die Möbel in den Räumen wiederholen sich noch — die Wände nicht mehr

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
- [x] **Story-Text am Anfang** — Intro im Klassenzimmer, überspringbar
- [x] **Verstecken in Spinden** inklusive Nahaufnahme durch den Sehschlitz
- [x] **Schleichen** — langsamer, dafür halbe Sichtweite der Lehrer
- [x] **Türen und Geräusche** — Werfen lockt Lehrer weg, das Handy verrät Dich
- [x] **Mehr Fundstücke** — Zettel grenzen erst die Etage, dann den Raum ein
- [x] **Direktor als Patrouille**, wechselt die Etagen und folgt Dir die Treppe hoch
- [x] **Eigene Raumstile** — sieben Sorten Wand, Deko und Schild
- [x] **Zwei Spielarten** — Schlüssel im Raum oder am Gürtel des Hausmeisters
- [x] **Die Uhr** — um 17:30 schließt der Hausmeister endgültig ab
- [x] **Die dunkle Etage** und Stromausfälle, dazu Taschenlampe mit Akku
- [x] **Zweiter Ausgang** — das Fenster im Erdgeschoss, Brecheisen nötig
- [x] **Zeitbonus** — Punkteabrechnung am Ende, Rekord bleibt gespeichert
- [x] **Lehrer machen Pausen und schauen sich um** statt stumpf hin und her
- [x] **Fairer Neustart nach dem Erwischtwerden** — die Treppe weg vom Fänger
