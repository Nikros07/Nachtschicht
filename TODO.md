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
- [x] **Mehr Abwechslung in den Möbelarten selbst** — 20 neue Möbel, jede
      Raumart hat eigene. Ein Stück steht fest, der Rest wird jede Runde neu
      gezogen (`EINRICHTUNG` in `index.html`).

---

## Die anderen Level

Jedes Level ist eine Stufe des Abends. Level 1 steht, der Rest ist Konzept.

- [x] **Level 2 — Bei Moritz.** ✅ Wohnung, vier Aufgaben, Pegel-System, erster Kampf, Moritz schaltet frei

**Offen in Level 2:**

- [x] **Mehr Leute in der Wohnung, die nur rumstehen** — fünf Statisten, einer
      tanzt, einer hockt vorm Bad. Immer nur einer redet, ab Mut anderer Text.
- [x] **Der Kracher braucht mehr als ein Angriffsmuster** — Schwinger,
      Doppelschlag, Finte. Sie schalten sich mit jedem Konter frei, nie zweimal
      dasselbe hintereinander. Konterfenster nur noch im letzten Teil des
      Ausholens, Fehlschläge sperren dich 0,65 s.
- [x] **Musik lauter/verzerrter je höher der Pegel** — verstimmt ab 45 %,
      sägt ab 60 %, schiefe Quinte ab 75 %, Tempo zieht sich um 12 BPM.
- [x] **Das Level war eine Checkliste** — vier Aufgaben abhaken, dazwischen kein
      Druck. Jetzt springen die Jungs wieder ab: alle vier müssen *gleichzeitig*
      stehen. Wer wie lange durchhält, hängt daran, wie teuer er zurückzuholen
      ist. Reihenfolge ist das eigentliche Rätsel.
- [x] **Der Sprung war ein Knopf ohne Wirkung** — Möbel sind begehbar. Oben auf
      dem Schrank steht der Schnaps (setzt alle Balken zurück, kostet Pegel),
      und wer oben sitzt, ist von unten nicht ansprechbar.
- [x] **Der Pegel war ein Schalter** — jetzt zweiseitig: betrunken suchst du
      langsamer und übersiehst auch mal was. Erst nüchtern suchen, dann trinken.
- [ ] Noch offen im Kampf: Fernangriff (Flasche werfen), den man wegspringen
      muss — der Sprung tut im Kampf bisher nichts
- [ ] Von Hand gegenspielen: die Geduldswerte sind an einem Bot gemessen, der
      Dialoge sofort wegdrückt. Ein Mensch liest mit und ist langsamer — kann
      sein, dass 15 s für den Schläfer beim ersten Durchlauf zu knapp sind.
- [ ] **Level 3 — Der Nachtbus.** Fahrender Untergrund, Kontrolleure, Timing

  <details><summary>Vorschlag, wie das Level funktionieren könnte — bitte
  gegenlesen, bevor es gebaut wird</summary>

  **Was es anders macht als 1 und 2.** In Level 1 geht es ums Nichtgesehenwerden,
  in Level 2 darum, eine Meute in Bewegung zu kriegen. Hier bewegt sich **das
  Level selbst**. Das ist der Haken, den es sonst nirgends gibt.

  **Der Bus als Gegner.** Er beschleunigt, bremst, nimmt Kurven. Bei jeder
  Bewegung rutschst Du in Fahrtrichtung, und wer nicht an einer **Haltestange**
  hängt (`E`), fällt hin: laut, und Du liegst zwei Sekunden. Vorne an der
  Frontscheibe siehst Du die Straße — eine Kurve kündigt sich an, bevor sie
  kommt. Das ist das Timing aus dem Zettel.

  **Der Kontrolleur.** Steigt an der zweiten Haltestelle zu und arbeitet sich
  durch den Bus. Drei Wege an ihm vorbei, alle an die Busbewegung gekoppelt:
  Fahrschein am Automaten ziehen (Münzen unter den Sitzen suchen, geht nur wenn
  der Bus ruhig fährt), hinten in der Menge verschwinden, oder an einer
  Haltestelle raus und durch die andere Tür wieder rein, bevor sie zugeht.

  **Warum das trägt:** Festhalten und Handeln schließen sich aus. Jede Aktion —
  suchen, Automat, Tür — kostet genau die Sekunden, in denen Du nicht
  festhältst. Der Bus entscheidet, wann Du Dir das leisten kannst.

  **Technisch steht alles bereit:** `motor.js` bringt Schrift, Sprites, Ton und
  Leinwand mit, `spielstand.js` hat Level 3 schon als Eintrag (`datei:null` →
  wird als `BALD` angezeigt). Ein neues Level ist eine HTML-Datei nach dem
  Muster von `level2.html` plus die Dateiangabe in `LEVEL`.

  **Was fehlt und nicht ohne Nick entschieden werden kann:**

  - **Wer steigt hier zu?** Level 1 gibt Max Ferdi, Level 2 Moritz. Für Level 3
    fehlt der Name und die Eigenheit — genau das, was unten unter *Die Jungs*
    als „kommt vom Nick" steht. Solange das offen ist, schaltet Level 3 keinen
    frei (`junge:null` in `spielstand.js`), und das Level funktioniert trotzdem.
  - **Wohin fährt der Bus?** Level 4 ist die Schlange vor dem Club. Ob der Bus
    dort ankommt oder ob noch was dazwischen liegt, gehört zur Story.

  </details>
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
      — **das blockiert gerade Level 3.** Fest sind bisher nur Max Ferdi
      (Level 1, +15 % Tempo) und Moritz (Level 2, besser bei den Chayas).
      Wer ab Level 3 dazukommt und was er kann, steht noch nicht fest.

---

## Kampfsystem (aus dem alten Modus übernehmen und härter machen)

Das Kampfsystem liegt fertig in `runner.html` und muss in die Level-Struktur wandern.

- [ ] Nahkampf, Konter, Combos übernehmen
- [ ] **Gegner müssen blocken können** — nicht dauerhaft angreifbar
- [~] **Fehlschläge bestrafen** — im Kracher-Kampf drin (0,65 s Sperre), muss
      beim Zusammenführen ins gemeinsame Kampfsystem wandern
- [~] **Konterfenster verkleinern** — im Kracher-Kampf als `konterFenster`
      (letzte 40 % des Ausholens), gilt noch nicht für `runner.html`
- [ ] **Ausdauer** — nicht unbegrenzt schlagen können
- [ ] **Bosse deutlich härter**: Fernangriffe (Silvesterraketen), kürzere Vorwarnung, unblockbare Angriffe, Arena verändert sich pro Phase

---

## Technik

- [x] **Motor aus den Leveldateien ziehen** — `motor.js`: Schrift, Bild-Cache,
      Zeichenhilfen, Ton, Leinwand. Lag vorher in jeder Leveldatei doppelt
      und war schon auseinandergelaufen.
- [ ] Level-Daten in eine eigene Struktur, damit neue Level ohne Code entstehen
      (Räume, Möbel, Wege als Daten — der Motor steht, die Levelbeschreibung
      fehlt noch)
- [x] **Spielstand speichern** — `spielstand.js`, ein Datensatz für alle Level:
      Fortschritt, Crew, Bestzeiten. Level schalten sich frei, die Leiste zeigt
      offen/zu/bald. Alte Einzelschlüssel werden übernommen.
- [ ] Übergänge zwischen den Leveln
- [ ] Kampfsystem und Level-System zusammenführen
- [ ] Musik pro Level statt einer Schleife
- [ ] Ladezeit prüfen, wenn mehr Level dazukommen

---

## Optik

- [x] **Mehr Abwechslung in den Räumen** — jede Raumart hat eigene Möbel, die
      Einrichtung wird pro Runde gewürfelt (Level 1). Level 2 hat weiter feste
      Möbel, dort ist ihre Position aber Teil des Rätsels.
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
