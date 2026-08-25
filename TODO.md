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

## Level 2 — Bei Moritz ✅ fertig

Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei.

**Offen in Level 2:**

- [ ] Mehr Leute in der Wohnung, die nur rumstehen (Atmosphäre)
- [x] Der Kracher hat jetzt drei Angriffsmuster, geht in Deckung und wird beim
      letzten Treffer schneller
- [ ] Musik lauter/verzerrter je höher der Pegel

---

## Level 3 — Der Nachtbus ✅ fertig

Fahrender Untergrund, Kontrolleure, Timing — genau wie im Konzept.

Der Bus ist der Gegner: anfahren, bremsen, Kurven. Jeder Ruck ist angekündigt,
wer dabei läuft fällt hin, wer sich festhält kommt nicht weiter. Drei Wege an
der Kontrolle vorbei (Ticket lösen, hinter ihnen bleiben, an der Haltestelle
raus und wieder rein). Der Pegel aus Level 2 fährt mit und macht hier zum
ersten Mal alles schlimmer.

**Offen in Level 3:**

- [ ] **Der Name des Dritten kommt vom Nick.** Im Code steht `DER BUSTYP` als
      Platzhalter — an genau zwei Stellen: `CREW` und `LEVELS` in
      `nachtschicht.js`, plus die Cutscene-Zeilen in `level3.html`
- [ ] Kontrolleure könnten sich unterhalten, statt nur zu laufen
- [ ] Ein zweiter Fahrgast, der auch schwarzfährt und nervös wird
- [ ] Die Fahrgäste könnten bei einem Ruck mitrutschen

---

## Die anderen Level

Jedes Level ist eine Stufe des Abends.

- [ ] **Level 4 — Die Schlange.** Erster echter Boss: der Türsteher
- [ ] **Level 5 — Club.** Stroboskop, schlechte Sicht, das Mädels-Minispiel
- [ ] **Level 6 — Afterhour.** Surreal, verzerrt, die Schule taucht wieder auf
- [ ] **Level 7 — Späti.** Ruhepause, Story, kein Kampf
- [ ] **Level 8 — Heimweg.** Endgegner: die Sonne

Ein neues Level ist eine Datei plus **eine Zeile** in `LEVELS` in
`nachtschicht.js`. Levelleiste, Zifferntasten, Freischaltung, Bestzeit und der
Übergang vom Vorgänger hängen alle daran.

---

## Das Club-Minispiel

- [ ] Ansprechen startet ein eigenes Minispiel
- [ ] Erfolg → Confidence-Boost: kurz unverwundbar, schneller, mehr Schaden
- [ ] Misserfolg → geknickt: langsamer, weniger Reichweite, bis man sich fängt
- [ ] Mechanik muss noch festgelegt werden (Timing? Auswahl? Rhythmus?)
- [ ] Moritz' Fähigkeit `chayas` liegt schon in `CREW` bereit und wartet darauf

---

## Die Jungs

Das Herzstück. Jedes Level bringt einen aus der Crew, jeder gibt eine Fähigkeit.

**Steht:** `CREW` in `nachtschicht.js` hält Namen und Fähigkeit, und die
Fähigkeit wirkt in **jedem** Level, nicht nur in dem, wo man ihn getroffen hat.
Ein Level fragt `tempoBonus()` oder `hatFaehigkeit('extraherz')`.

- [x] Max Ferdi — +15 % Tempo (Level 1)
- [x] Moritz — besser bei den Chayas (Level 2), wartet auf Level 5
- [x] Der Bustyp — ein Herz mehr (Level 3), **Name ist ein Platzhalter**
- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Weitere Fähigkeiten festlegen (Doppelsprung, härterer Konter, mehr Ausdauer …)
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] **Namen und Eigenheiten: kommt vom Nick**

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur
wandern. Level 2 hat einen einfachen Konter-Kampf, mehr ist es noch nicht.

> **War fast weg.** Commit `64b4777` wollte `runner.html` unangetastet lassen
> — die Commit-Nachricht sagt das ausdrücklich — hat die Datei aber mit einer
> Kopie des damaligen Level 1 überschrieben. 1294 Zeilen Kampfsystem waren
> damit aus dem Arbeitsverzeichnis verschwunden, nur noch in der Historie.
> Aus `b5a76dd` zurückgeholt und geprüft: läuft, schlägt, zählt Combos.
>
> Praktisch dabei: zwei der vier Bosse dort sind genau die, die noch
> gebraucht werden — **DER TUERSTEHER** für Level 4 und **DIE SONNE** für
> Level 8. Dazu **DIE MEUTE** und **DIE MUEDIGKEIT**.

**Steht in `kampf.js`.** Ein Gegner ist ein Eintrag in `KAEMPFER` — Zahlen und
Angriffsmuster, kein Code. Level 2 läuft schon darauf.

- [x] Nahkampf und Kontern übernommen
- [x] **Gegner blocken** — er ist nur in zwei Momenten angreifbar, im letzten
      Drittel seines Ausholens und während seiner Erholung. Sonst prallst Du ab
- [x] **Fehlschläge bestraft** — 0,6 s nach daneben, 0,8 s nach abgeprallt, und
      in dieser Zeit kommt keine Ausdauer zurück
- [x] **Konterfenster** auf das letzte Drittel (`KT.konterFenster = 0.34`)
- [x] **Ausdauer** — vier Schläge, dann eine Sekunde gar nichts
- [x] **Unblockbare Angriffe** (`nichtKonterbar`) — rot angesagt, nur Weggehen hilft
- [x] **Boss-Phasen** (`phasen`) — ab einem Trefferstand kürzere Vorwarnung und
      mehr Deckung
- [x] **Fernangriffe** (`fern`) — sind angelegt, aber noch von keinem Gegner benutzt
- [ ] **Combos** — im alten Endlos-Modus zählen sie Punkte. Im Duell braucht es
      dafür erst eine Idee, was eine Combo dort überhaupt belohnen soll
- [ ] **Arena verändert sich pro Phase** — das Ereignis `phase` liegt bereit,
      was damit passiert, hängt an Level 4
- [ ] Level 3 hat noch keinen Kampf. Muss es auch nicht — aber der Nachtbus
      wäre eine Arena, in der der Boden ruckt
- [ ] **Die Zahlen wollen gespielt werden.** Geprüft ist bislang nur, dass
      Timing sich lohnt und Hämmern nicht (`test/smoke.mjs`, Abschnitt 6):
      Hämmern kostet drei Herzen und braucht zwölf Sekunden, sauberes Kontern
      keins und acht. Ob sich das *gut anfühlt*, kann nur einer sagen, der es
      spielt — alle Regler stehen in `KT` oben in `kampf.js`

---

## Technik

- [x] **Gemeinsamer Unterbau** — Bildschirm, Schrift, Bild-Cache, Töne liegen
      einmal in `nachtschicht.js` statt in jeder Level-Datei
- [x] **Spielstand speichern** — ein Eintrag `nachtschicht.stand` mit Crew,
      geschafften Leveln und Bestzeiten; alte Einzelschlüssel werden übernommen
- [x] **Übergänge zwischen den Leveln** — laufen über `LEVELS`, kein Level kennt
      mehr den Dateinamen eines anderen
- [x] **Freischaltung** — ein Level ist offen, wenn sein Vorgänger geschafft ist
- [x] **Der Pegel wandert mit** von Level zu Level
- [x] Rauchtest, der jedes Level im Browser startet (`test/smoke.mjs`)
- [ ] **Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen.**
      Halb erledigt: der *Motor* ist geteilt, die *Level-Daten* stehen als Tabellen
      oben in jeder Datei (`RAEUME`, `ORTE`/`DINGE`/`LEUTE`, `SITZE`/`TUEREN`/
      `STANGEN`). Ein gemeinsames Format für alle drei gibt es noch nicht — dafür
      müsste erst klar sein, was Level 4 bis 8 überhaupt brauchen
- [x] **Kampfsystem und Level-System zusammengeführt** — `kampf.js`, Level 2
      läuft darauf, Level 4 muss ihn nicht neu bauen
- [ ] Musik pro Level statt einer Schleife — bislang hat jedes Level seine eigene
      Basslinie, aber der Aufbau ist überall derselbe
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
- [x] **Level 2: Wohnung, vier Aufgaben, Pegel, erster Kampf, Moritz**
- [x] **Level 3: Nachtbus, Fahrphysik, Kontrolleure, Ticket, der Bustyp**
- [x] Levelauswahl als Leiste unter dem Bild und als Zahlenreihe im Titelbild
