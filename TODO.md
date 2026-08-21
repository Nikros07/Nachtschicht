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

**Erledigt in Level 2:**

- [x] Acht Statisten in der Wohnung, die nur rumstehen — einer redet auf einmal,
      Pausen werden mit steigendem Pegel kürzer. Beim Druck auf `E` haben sie
      die niedrigste Priorität, damit sie nie ein Möbel verdecken
- [x] Der Kracher hat vier Angriffsmuster: Schwinger (kontern), tiefer Tritt
      (springen), Finte (warten, dann kontern), Flasche (springen, Phase 2).
      Konterfenster als goldenes Stück am Balken, Fehlschlag bestraft mit
      halber Sekunde ohne Konter, ab der Hälfte Phase 2 mit höherem Tempo
- [x] Musik reagiert auf den Pegel: lauter, verstimmt, schleppender Takt,
      Übersteuerung und Tiefpass über einen eigenen Audio-Bus

**Offen in Level 2:**

- [ ] Der Kampf findet im Flur statt — die Statisten kriegen nichts davon mit.
      Ein Ring aus Zuschauern wäre besser, braucht aber einen zweiten Kampfort
- [ ] Blocken kann der Kracher nicht. Ergibt erst Sinn, wenn Du selbst angreifen
      kannst — das kommt mit dem Kampfsystem aus `runner.html`
- [ ] Statisten haben nur eine Steh-Pose, das Wippen kommt aus dem Sinus
- [ ] **Level 3 — Der Nachtbus.** Fahrender Untergrund, Kontrolleure, Timing
      *Wartet auf Dich:* Level 3 soll wie die anderen einen aus der Crew
      bringen. Wer das ist und wie er drauf ist, steht nirgends — das kommt
      vom Nick. Der Platz dafür ist da: `bringt:'…'` in `LEVELS`
      (`spielstand.js`), dann macht der Rest sich von selbst.
      Ebenfalls offen: welche Fähigkeit er gibt.
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

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [ ] **Fehlschläge bestrafen** — lange Erholung, damit Spammen aufhört
      *(im Kracher von Level 2 als `whiffDauer` schon drin, muss beim
      Zusammenführen mit übernommen werden)*
- [ ] **Konterfenster verkleinern** auf das letzte Drittel des Ausholens
      *(Level 2 nimmt bewusst die letzten 55 % — erster Kampf im Spiel.
      Der Regler heißt dort `konterFenster`)*
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase
      *(Fernangriff und Phasenwechsel gibt es im Kracher schon als Vorlage:
      Flaschenwurf mit Abstandnehmen, Phase 2 über `phase2Tempo`)*

---

## Technik

- [x] **Levelliste in eine eigene Struktur** — `spielstand.js` kennt als
      einzige Stelle alle Level. Ein neues Level ist eine Zeile in `LEVELS`;
      Levelleiste, Levelwahl, Zahlentasten und der Weiter-Knopf richten sich
      danach. Ungebaute Level stehen als gestrichelter Eintrag da
- [x] **Spielstand speichern** — ein Schlüssel `nachtschicht.stand` mit
      `{ frei, crew, zeiten }`. Alte Einzelschlüssel werden übernommen,
      kaputte Daten geprüft und verworfen. `?alle=1` öffnet zum Testen alles
- [x] **Übergänge zwischen den Leveln** — Level 1 versprach im Bild
      „E WEITER ZU LEVEL 2", startete aber neu: der Fall stand unter dem
      allgemeinen Ende-Fall und war nie erreichbar. Level 2 sprang stur
      zurück nach Level 1. Beides geht jetzt über die Levelliste
- [ ] Der **Inhalt** eines Levels ist weiter Code — Räume, Möbel und Leute
      liegen zwar als Daten in der jeweiligen Datei, aber Zeichnen und Regeln
      hängen daran. Ein Level ohne eine Zeile Code gibt es noch nicht
- [ ] Der geteilte Unterbau (Font, Bild-Cache, Audio, Eingabe, Vollbild) liegt
      dreimal fast gleich in `index.html`, `level2.html` und `runner.html`.
      Vor Level 3 wäre das der richtige Zeitpunkt, ihn neben `spielstand.js`
      zu legen
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
- [x] Wohnung voller Statisten, vier Angriffsmuster für den Kracher,
      Pegel greift in den Klang der Musik
- [x] Gemeinsamer Spielstand, Levelliste an einer Stelle, Level schalten
      sich der Reihe nach frei
