# Was noch fertig werden muss

Stand: Level 1 (Die Schule), Level 2 (Bei Moritz) und Level 3 (Der Nachtbus)
sind spielbar und durchspielbar, die Übergänge dazwischen stehen. Alles andere
steht hier.

Reihenfolge ist bewusst: was oben steht, blockiert das darunter.

**Als nächstes dran:** Level 4 — Die Schlange, mit dem Türsteher als erstem
echten Boss. Dafür sollte vorher das Kampfsystem aus `runner.html` in die
Level-Struktur wandern (siehe unten) — ein Boss, den man nur kontern kann,
wäre zu dünn.

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

**In Level 2 erledigt:**

- [x] Mehr Leute in der Wohnung, die nur rumstehen — sechs Statisten, reden,
      wippen mit dem Pegel mit
- [x] Der Kracher hat vier Angriffsmuster statt einem: schwer, schnell, Finte,
      Doppelschlag. Kommen dazu, je öfter Du getroffen hast
- [x] Musik lauter/verzerrter je höher der Pegel

**Offen geblieben in Level 2:**

- [ ] Die Statisten sind reine Kulisse. Wer sie ansprechen will, kann es nicht —
      dafür bräuchte es eine zweite Reichweiten-Ebene, damit sie den Aufgaben
      nicht das `E` wegnehmen
- [ ] Der Kracher steht noch. Ein Gegner, der zurückweicht oder die Seite
      wechselt, wäre der nächste Schritt — hängt am Kampfsystem unten

- [x] **Level 3 — Der Nachtbus.** ✅ Fahrender Untergrund, Kontrolleure,
      Türhopping an den Haltestellen, Fahrschein am Automaten, Ausstieg am Club

**Offen in Level 3:**

- [ ] **Kein neuer Jung.** Das Level hat einen Platz dafür — wer im Nachtbus
      dazustößt und was er kann, kommt vom Nick. `nacht.js` braucht dafür nur
      einen Eintrag bei `JUNGS` mit `level:3`
- [ ] Die Fahrgäste steigen an den Haltestellen nicht wirklich ein und aus,
      sie stehen die ganze Fahrt an derselben Stelle
- [ ] Der Fahrer ist nicht zu sehen. Eine Fahrerkabine ganz vorne wäre der
      nächste Schritt für die Optik
- [ ] Ohne Fahrschein durchzukommen ist möglich, aber nie geprüft worden —
      der Testbot löst das Level immer über den Automaten

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

- [x] Liste der Jungs samt Fähigkeiten liegt zentral in `nacht.js` — Name,
      Level, Bonus als Zahl. Bisher stehen Max Ferdi und Moritz drin
- [ ] Level 3 hat noch keinen. Die Namen kommen vom Nick, deshalb steht dort
      bewusst kein erfundener drin
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

Der Kampf in Level 2 ist der erste Schritt: dort steckt jetzt das Grundgerüst
aus Mustern, Konterfenster und Erholung. Es kennt aber nur *Kontern* — der
Spieler kann nicht selbst angreifen. Alles, was mit eigenem Zuschlagen zu tun
hat, wartet auf die Zusammenführung mit `runner.html`.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar.
      *Wartet auf den eigenen Angriff: solange man nur kontert, hat eine
      Deckung beim Gegner keine Wirkung, die man merken würde*
- [x] **Fehlschläge bestrafen** — halbe Sekunde Erholung, in der nichts geht
      (in Level 2; gilt bisher nur fürs Kontern)
- [x] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
      (in Level 2; beim ersten, schweren Schlag bewusst noch großzügig)
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] **Spielstand speichern** — ein versionierter Stand in `nacht.js`: freies
      Level, Crew, Bestzeiten. Alte Stände werden übernommen
- [x] **Übergänge zwischen den Leveln** — `E` führt vom Endbild ins nächste
      Level, aber nur wenn es gebaut ist. Vorher war das toter Code
- [x] Levelleiste, Tastenkürzel und Freischaltung kommen aus der Level-Liste
- [x] Rauchprobe im echten Browser: `node werkzeug/smoke.mjs`
- [ ] **Level-Daten in eine eigene Struktur, damit neue Level ohne Code
      entstehen** — halb, und Level 3 hat gezeigt, warum. Die *Liste* der Level
      ist Daten, der *Inhalt* nicht. Aber die Inhalte ähneln sich kaum: Räume
      mit Türen, eine Wohnung mit Aufgaben und ein fahrender Bus haben fast
      nichts gemeinsam. Ein gemeinsames Levelformat würde hier wenig sparen.
      Was sich wirklich wiederholt, steht eine Zeile tiefer
- [ ] Kampfsystem und Level-System zusammenführen
- [x] Musik pro Level statt einer Schleife — jedes Level hat inzwischen seine
      eigene: Schule, Vorglühen am Pegel, Motorpuls im Bus
- [ ] Die Levelleiste unter dem Bildschirm wird mit acht Leveln zu eng.
      Spätestens ab Level 5 braucht sie kürzere Namen oder zwei Reihen
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen
- [ ] **Der Unterbau steht dreimal da.** Font, Bild-Cache, Sprite- und
      Textausgabe, die Ton-Helfer, das Aufsetzen der Leinwand, Vollbild,
      Touch-Tasten und die Eingabe sind in `index.html`, `level2.html` und
      `level3.html` praktisch identisch — zusammen rund 300 Zeilen pro Datei.
      Das ist der Teil, der in eine gemeinsame Datei gehört, nicht die
      Level-Inhalte. Spätestens vor Level 4 machen

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
- [x] **Level 2: Die Wohnung, vier Aufgaben, Pegel, erster Kampf**
- [x] Gemeinsamer Spielstand über alle Level (`nacht.js`)
- [x] Statisten, vier Angriffsmuster, Musik am Pegel
- [x] **Level 3: Der Nachtbus mit fahrendem Boden, Kontrolle und Türhopping**
- [x] Der Pegel geht von Level zu Level mit
