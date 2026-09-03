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

- [x] **Der Kracher hat vier Angriffsmuster** — Schwinger, Finte, Sturm, Doppel,
      in fester Reihenfolge und härter mit jedem Treffer, den er kassiert.
      Konterfenster nur im letzten Stück, zu früh gedrückt kostet den Schlag
- [x] **Mehr Leute in der Wohnung** — sechs Gäste als graue Silhouetten, mit
      Hintergrundgerede. Farbe und Name heißt anfassbar, grau heißt Kulisse
- [x] **Musik kippt mit dem Pegel** — lauter, ab 55 von `square` auf
      `sawtooth`, und sie fängt an zu eiern. Dieselbe Schwelle, ab der auch
      das Bild schwankt
- [ ] Kampfdauer im Blick behalten: sauber gespielt rund 30 s von 190 s. Wenn
      das zu viel von der Uhr frisst, sind `gegnerPause` und `gegnerTreffer`
      die Regler dafür
- [ ] Idee: Konterfenster schrumpft mit dem Pegel. Verbindet die beiden
      Systeme des Levels — aber bestraft dann das Trinken, das man für den
      Balkon braucht. Erst entscheiden, dann bauen
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

Zwei dieser Regeln stehen inzwischen im Kracher-Kampf in `level2.html` und
haben sich dort bewährt — beim Zusammenführen von dort abschreiben, nicht neu
erfinden.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar.
      Im Kracher-Kampf greift die Frage nicht: dort konterst Du nur, Du
      schlägst nie von Dir aus zu
- [x] **Fehlschläge bestrafen** — im Kracher-Kampf umgesetzt: kurze Sperre
      *und* der laufende Schlag ist verspielt. Die Sperre allein reichte
      nicht, sie ist kürzer als das Ausholen
- [x] **Konterfenster verkleinern** — im Kracher-Kampf das letzte Stück
      (`konterFenster`), mit sichtbarer Marke im Balken
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] **Spielstand speichern** — `spielstand.js`: freigeschaltete Level, Crew,
      Bestzeit pro Level. Alte Stände wandern automatisch mit
- [x] **Übergänge zwischen den Leveln** — welches Level auf welches folgt,
      steht im Verzeichnis. Kein fester Dateiname mehr im Spielcode
- [ ] **Level-Daten in eine eigene Struktur** — halb erledigt. Das *Verzeichnis*
      der Level (Name, Datei, wer freigeschaltet wird) liegt in `spielstand.js`.
      Die Level-Inhalte selbst (`RAEUME`, `MOEBEL`, `LEHRER_START` …) stecken
      weiter in der jeweiligen HTML-Datei. Nächster Schritt: eine gemeinsame
      Engine, die so eine Beschreibung lädt — sonst wird jedes neue Level
      wieder eine Kopie von 1900 Zeilen
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
- [x] Level-Verzeichnis und Spielstand in `spielstand.js` — eine Stelle statt
      zweimal dasselbe in jeder Leveldatei
- [x] Levelleiste zeigt alle acht Stufen: gespielt, gesperrt, noch nicht gebaut
- [x] `%` fehlte im Bitmap-Font — „+15% TEMPO" stand als „+15? TEMPO" da
- [x] Am Ende von Level 1 stand „E WEITER ZU LEVEL 2", E hat aber neu gestartet
- [x] `?touch=1` ging beim Levelwechsel verloren
