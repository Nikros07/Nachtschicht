# Was noch fertig werden muss

Stand: Level 1 (Die Schule) ist fertig. Alles andere steht hier.

Reihenfolge ist bewusst: was oben steht, blockiert das darunter.

---

## Als Naechstes: Level-Daten aus dem Code loesen

Das ist jetzt der Flaschenhals. Level 1 steht komplett, aber es steht in
`index.html` verstreut: `RAEUME`, `SPINDE`, `LEHRER_START`, `BODEN`,
`AUSGANG`, `FENSTER`, `STIL`, dazu `INTRO` und `SZENEN`. Solange das so
liegt, heisst jedes neue Level: Code kopieren und anpassen. Sieben Mal.

- [ ] **Ein Level ist ein Objekt**, kein Satz globaler Konstanten
- [ ] **Was allgemein ist, vom Schul-Level trennen** — Schluesselsuche,
      Zettel und Brecheisen sind Level-1-Regeln, nicht Spielregeln
- [ ] **Ziele als Daten** — "finde X, bring es nach Y" statt fest
      verdrahtetem `hatSchluessel`
- [ ] **Uebergang zwischen zwei Leveln** — ein Level endet, das naechste
      faengt an, ohne Neuladen
- [ ] **Spielstand speichern** — welches Level ist frei, welche Jungs sind
      dabei, welcher Bestwert. Der Bestwert von Level 1 liegt schon im
      `localStorage`, das Muster steht also

Erst danach lohnt sich Level 2. Vorher baut man den Umbau doppelt.

---

## Level 1 — Die Schule (fertig)

Spielbar, durchspielbar, zwei Wege raus. Was noch auffaellt, ist Feinschliff
und nicht mehr blockierend:

- [ ] Die zehn Raeume haben sieben Stile, ein paar Moebel wiederholen sich
      trotzdem
- [ ] Der Direktor hat keinen eigenen Abschluss, wenn man durchs Fenster
      geht — er merkt es nie
- [ ] Kein Grund, ein zweites Mal zu spielen, ausser dem Bestwert

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

**Offen:** Das haengt am Spielstand — ohne gespeicherten Fortschritt gibt es
nichts freizuschalten. Steht deshalb hinter dem Level-Daten-Umbau.

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [ ] **Fehlschläge bestrafen** — lange Erholung, damit Spammen aufhört
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

**Offen:** Level 1 kommt ganz ohne Kampf aus und ist dadurch als
Schleich-Level rund. Ob das Kampfsystem ueberhaupt in die Schule gehoert
oder erst ab Level 2 dazukommt, ist noch nicht entschieden.

---

## Technik

- [ ] Musik pro Level statt einer Schleife
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen
- [ ] Es gibt keinen automatischen Test. Geprueft wird bisher mit einem
      Wegwerf-Skript, das den `<script>`-Block aus `index.html` in Node
      laedt und einen Bot das Level spielen laesst. Das gehoert
      irgendwann ins Repo, sonst faengt jede Aenderung wieder bei null an

---

## Optik

- [ ] Wetter und Tageszeit pro Level
- [ ] Übergangsbilder zwischen den Leveln
- [ ] Mehr Animationsbilder für den Spieler
- [ ] Bildschirmerschütterung und Treffer-Effekte feiner abstimmen

---

## Erledigt

**Grundgeruest**

- [x] Pixel-Art-Grundgerüst mit CRT-Optik und eigenem Bitmap-Font
- [x] Bild-Cache: Zeichenzeit von 4,8 ms auf 1,2 ms pro Bild
- [x] Vollbild auf Desktop und Handy, Querformat-Hinweis
- [x] Touch-Steuerung mit runden Tasten
- [x] Bildbreite wächst mit dem Bildschirm mit, keine schwarzen Balken
- [x] Bewegung mit Beschleunigung und Bremsung statt an/aus
- [x] GitHub Pages läuft
- [x] Kampfsystem mit Kontern, fünf Gegnertypen, vier Bossen (in `runner.html`)

**Level 1**

- [x] Etagen, Treppen, Räume, Schlüsselsuche, Lehrer mit Sichtkegel
- [x] Cutscene am Ende: der Direktor wird gepackt
- [x] Story-Text am Anfang — warum Du überhaupt eingesperrt bist
- [x] Eigene Raumstile, damit die zehn Räume nicht gleich aussehen
- [x] Verstecken in Spinden
- [x] Schleichen — langsamer, dafür halbe Sichtweite
- [x] Direktor patrouilliert über alle Etagen, nicht nur die Cutscene
- [x] Stromausfälle im Gang
- [x] Zettel als Hinweise: erster nennt die Etage, zweiter den Raum.
      Damit ist die Schlüsselsuche eine Spur statt einer Abklapperliste
- [x] **Türen hörbar machen** — jedes Geräusch hat eine Reichweite, wer es
      hört, geht nachsehen. Schleichen macht Türen zusätzlich leiser
- [x] **Blick durch den Türspalt** — an der Tür und im Spind steht, was im
      Gang los ist. Wenn Türen zu hören sind, darf das Rausgehen kein
      Blindflug sein
- [x] **Der Gang läuft weiter, während Du im Raum suchst** — vorher war
      jeder Raum eine Pausetaste
- [x] **Lehrer mit Pausen und Umschauen** statt stumpfem Hin und Her
- [x] **Fairer Neustart nach dem Erwischen** — der Fänger rückt ab und
      schaut weg, solange Du unverwundbar bist
- [x] **Zweiter Ausgang** — Fenster im Erdgeschoss, Brecheisen beim
      Hausmeister, zwölf Sekunden Aufhebeln in Etappen
- [x] **Mehr Fundstücke** — Zettel und Brecheisen neben dem Schlüssel
- [x] **Zeitbonus** — Punkte aus Zeit, Herzen, Weg, ungesehen und Zetteln,
      Bestwert im `localStorage`
