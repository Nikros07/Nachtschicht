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

**Offen in Level 2:** nichts mehr.

- [x] Mehr Leute in der Wohnung, die nur rumstehen — vier Rumsteher mit
      Becher, eigenem Takt und Sprüchen
- [x] Der Kracher am Ende braucht mehr als ein Angriffsmuster — drei
      Muster (Schwinger, Finte, Flasche), die phasenweise dazukommen
- [x] Musik lauter/verzerrter je höher der Pegel — Sägezahn, zweite
      Stimme daneben, alles sackt ab, dichtere Hi-Hats

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

> **Blockiert alles darunter: die Namen fehlen.**
> Fähigkeiten, Sprites und Freischaltungen hängen daran, wer die Personen
> überhaupt sind. Solange das nicht vom Nick kommt, lässt sich hier nichts
> Sinnvolles bauen — erfundene Namen für echte Leute wären Unsinn und
> müssten sowieso wieder raus.
>
> Die **Struktur** steht dagegen schon: `JUNGS` in `spielstand.js` ist die
> eine Stelle, an der ein Junge und seine Fähigkeit definiert werden. Einen
> Eintrag dazuschreiben reicht, der Rest zieht nach.

- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Die anderen tauchen in je einem Level auf
- [ ] Fähigkeiten festlegen (Doppelsprung, Extraherz, härterer Konter, mehr Ausdauer …)
- [ ] Gesichter als Pixel-Köpfe — `KOPF` in `engine.js` ist genau dieser Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: **kommt vom Nick**
- [x] Tabelle für Fähigkeiten statt if-Abfragen im Level (`JUNGS`)
- [x] Freischaltungen überstehen einen Neustart und werden angezeigt

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [ ] **Fehlschläge bestrafen** — lange Erholung, damit Spammen aufhört
      — *Anfang steht:* die Finte in Level 2 macht Danebenhauen teuer
      (`danebenDauer`). Fehlt noch als Regel für jeden Schlag, nicht nur
      gegen die Finte
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere
      Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase
      — *Anfang steht:* der Kracher wirft (`flasche`), holt pro Phase
      schneller aus und legt pro Phase ein Muster nach

---

## Technik

- [x] **Gemeinsame Engine** — Font, Bild-Cache, Zeichenhelfer, Ton, Leinwand
      und Eingabe liegen einmal in `engine.js`, das Gehäuse in `shell.css`.
      Ein Level ist nur noch das, was dieses Level ausmacht
- [x] **Spielstand speichern** — ein Schlüssel in `spielstand.js`: welche
      Level geschafft sind, welche frei, wer dabei ist, Bestzeiten. Alte
      Einzelschlüssel werden übernommen
- [x] **Übergänge zwischen den Leveln** — kommen aus dem Register `LEVELS`.
      Levelleiste, Zifferntasten und "weiter zu" ziehen automatisch nach
- [x] **Prüfungen** — `test/` lädt jede Seite in einem echten Browser
- [ ] **Level-Daten in eine eigene Struktur** — halb erledigt. Register und
      Engine stehen, aber Räume, Möbel und Personen stecken noch als Arrays
      im jeweiligen HTML. Nächster Schritt wäre eine Datei pro Level, die
      nur Daten enthält
- [ ] Kampfsystem und Level-System zusammenführen — Level 2 hat einen
      eigenen kleinen Kampf, `runner.html` hat den vollen. Beide sollten
      derselbe sein
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
- [x] Engine, Gehäuse und Spielstand aus den Leveln herausgezogen
- [x] Level werden nacheinander freigeschaltet, Spielstand überlebt Neustart
- [x] Prüfskripte in `test/` — jede Seite in einem echten Browser

---

## Wo es hakt

Damit die nächste Durchsicht nicht bei null anfängt:

**Die Namen der Jungs fehlen.** Blockiert den ganzen Abschnitt „Die Jungs"
und damit die Belohnung jedes neuen Levels. Level 3 lässt sich bauen, aber
am Ende steht dann jemand ohne Namen. Kommt vom Nick.

**Das Club-Minispiel hat noch keine Mechanik.** In der Liste steht, was es
bewirken soll, aber nicht, was man tut. Timing? Auswahl? Rhythmus? Ohne die
Entscheidung ist Level 5 nicht baubar.

**Zwei Kampfsysteme.** `runner.html` hat das ausgewachsene, Level 2 einen
kleinen eigenen. Bevor Level 4 (Türsteher) drankommt, sollten die eins sein
— sonst gibt es ein drittes.
