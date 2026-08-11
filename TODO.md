# Was noch fertig werden muss

Stand: Level 1 (Die Schule) ist spielbar und durchspielbar. Das Gerüst für die
ganze Nacht steht — Level sind Daten, der Spielstand hält Fortschritt und Crew,
die Karte verbindet die Stationen, und der Kampf ist drin und wartet auf ein
Level, das ihn benutzt. Alles andere steht hier.

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

Alle acht stehen inzwischen auf der Karte im Spiel — mit Namen, Untertitel und
einem Satz dazu. Was noch nicht gebaut ist, lässt sich anschauen, aber nicht
starten. Ein Level der Bauart `schule` braucht nur noch ein Datenobjekt; alles
andere braucht vorher seine eigene Spielart.

- [ ] **Level 2 — Vorglühen.** Enge Wohnung, erste Kämpfe, Pegel-System wird eingeführt

      Technisch steht alles bereit: das Level ist ein Datenobjekt, der Kampf
      hängt an einer `gegner`-Liste. **Was fehlt, sind Entscheidungen, die
      nicht am Code hängen** — und die laut dieser Liste vom Nick kommen:

      - Was macht der **Pegel** eigentlich? Steigt er durch Trinken, sinkt er
        mit der Zeit? Hilft er (mutiger, mehr Schaden) oder stört er
        (Steuerung schwimmt, Sicht schwankt)? Wahrscheinlich beides — aber ab
        welchem Punkt kippt es?
      - **Wer** ist auf der Party, und wer von den Jungs kommt hier dazu?
      - Was ist das **Ziel** in der Wohnung? Rauskommen? Jemanden mitnehmen?
      - Warum wird überhaupt geprügelt — wer fängt an?

      Solange das offen ist, wäre ein gebautes Level 2 geraten. Deshalb steht
      es auf der Karte als "wird noch gebaut" und nicht als halbe Fassung.

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

- [x] **Struktur steht:** `CREW` im Code — Name, Gabe, Wirkung an einer Stelle.
      Ein neuer Junge ist ein Eintrag dort plus `freischaltung` beim Level
- [ ] **Insgesamt rund 7 Personen** über mehrere Freundesgruppen
- [ ] Die **drei Besten** begleiten die ganze Nacht und haben die stärksten Fähigkeiten
- [ ] Die anderen tauchen in je einem Level auf
- [ ] Fähigkeiten festlegen (Doppelsprung, Extraherz, härterer Konter, mehr Ausdauer …)
      — bisher wirkt nur `tempo`, weitere Gaben brauchen je einen Haken in der Logik
- [ ] Gesichter als Pixel-Köpfe — der Kopf ist im Code bereits ein eigener Block
- [ ] Fotos bleiben lokal, nur die Sprites landen im Repo
- [ ] Namen und Eigenheiten: kommt vom Nick

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt in `runner.html`. **Achtung:** die Datei war eine Weile
mit dem alten Schul-Prototyp überschrieben — wiederhergestellt aus `b5a76dd`.

- [x] **Nahkampf und Konter übernommen** — steht in `index.html` unter `KAMPF`
      und `GEGNER_ART`. Ein Level schaltet es mit einer `gegner`-Liste ein
- [x] **Gegner können blocken** — eigener Zustand `block`, Treffer prallen ab.
      Wer blockt, kann nicht schlagen: Deckung kostet ihn Tempo
- [x] **Fehlschläge bestrafen** — daneben 0,62 s Erholung statt 0,26 s, in
      einen Block 0,80 s. Spammen kostet mehr, als es bringt
- [x] **Konterfenster verkleinert** auf das letzte Drittel des Ausholens
      (`KAMPF.konterFenster`). Der Balken über dem Gegner leuchtet auf,
      wenn es offen ist — Gepanzerte bleiben rot und sind nicht konterbar
- [x] **Ausdauer** — vier Schläge, dann ist außer Atem. Balken links unten
- [ ] Combos: gezählt und angezeigt, aber sie **wirken noch nicht**.
      Offen: was eine Combo eigentlich bringen soll (Schaden? Tempo?)
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere
      Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase
      — braucht erst ein Level mit Boss
- [ ] Kampf im Raum: drinnen steht die Zeit still, Räume sind weiter sicher.
      Absichtlich so, aber für Level 5 (Club) vermutlich falsch

---

## Technik

- [x] **Level-Daten in eine eigene Struktur** — ein Level ist reine Daten
      (`LEVELS`), die Logik kennt keinen Wert aus der Schule mehr
- [x] **Spielstand speichern** — `nachtschicht.spielstand`: welche Station
      offen ist, wer dabei ist, welche Bestzeiten stehen. Alte Stände werden
      übernommen
- [x] **Übergänge zwischen den Leveln** — Karte, Übergangsbild, Freischaltung
- [ ] Kampfsystem und Level-System zusammenführen ← **blockiert Level 2**
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
- [x] Level als Daten statt als Code — neue Level ohne eine Zeile Logik
- [x] Spielstand mit Fortschritt, Crew und Bestzeiten je Station
- [x] Karte der Nacht mit allen acht Stationen, Übergang zwischen den Leveln
