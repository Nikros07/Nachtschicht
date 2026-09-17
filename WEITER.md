# Weitermachen

Diese Datei ist die Übergabe. Wenn Du "continue" sagst, liest Claude hier
nach, wo es stand, und macht genau dort weiter.

**Stand:** Phase 0, 1, 2 fertig. Phase 3 läuft — Level 1 und 2 umgebaut.
**Zuletzt aktualisiert:** 2026-09-17

---

## Wo wir stehen

Der große Plan steht in [PLAN.md](PLAN.md) — was gebaut wird und warum.

| Phase | Was | Stand |
|:--|:--|:--|
| 0 | Gemeinsame Engine statt neunfacher Kopie | ✅ fertig |
| 1 | Tiefe, Gespräche, Werte, Speicherstand | ✅ fertig |
| 2 | Kampfsystem + die zwei Kämpfe | ✅ fertig |
| 3 | Level 1–8 ausbauen, chronologisch | 🔧 läuft, Level 1 dran |
| 4 | Stadtkarte, Handy, Verzweigungen, Enden | ⬜ offen |
| 5 | Nebenaufgaben, Balancing, Schwierigkeitsgrade | ⬜ offen |

## Die Engine (`nacht/`)

| Datei | Inhalt |
|:--|:--|
| `kern.js` | Canvas, Skalierung, Vollbild, Eingabe-Helfer, Schleife. **Muss zuerst geladen werden.** |
| `bild.js` | 3x5-Bitmap-Font, Sprite-Cache, Text, Verläufe |
| `ton.js` | Audio-Grundlagen. SFX und Musik bleiben im Level |
| `stand.js` | Crew, Pegel, Bestzeiten (die alten Schlüssel) |
| `nacht.js` | Werte, Beziehungen, Inventar, Flags, Kapitel |
| `dialog.js` | Gesprächsbäume mit Bedingungen, Wirkungen, Zeitdruck |
| `welt.js` | Tiefenachse, Tiefensortierung, Abstand, Sichtkegel |
| `kampf.js` | Nahkampf, Konter, Blocken, Ausdauer, Ausweichrolle, Gegner-KI |

**Wichtig:** klassische Scripts, keine ES-Module — sonst funktioniert
Doppelklick auf `index.html` nicht mehr (`file://` blockiert Module).
Deshalb globale Namen: `W`, `H`, `ctx`, `text()`, `sprite()` gelten überall.

## Regeln, die beim Weiterbauen gelten

- **Schrift kann nur** `A-Z 0-9 . : - ! ? / + , < > * %` — keine Umlaute im
  Bild, ae/oe/ue/ss ausschreiben. Sonst erscheinen Fragezeichen.
- **Jede Tastatur-Aktion braucht einen Touch-Knopf** mit Druck *und*
  Loslassen. In index.html fehlte mal der Runter-Knopf — das war ein
  kompletter Softlock am Handy.
- **Alle Regler in den TUNE-Block** oben in der Datei, keine festen Zahlen
  in der Spiellogik.
- Nach jeder Änderung im Browser prüfen: Konsole leer, Level erreicht
  seinen Spielzustand.
- **Vorsicht bei `bewegeTiefe(obj, …)`:** die Funktion schreibt auf `obj.t`.
  In Level 1 ist `S.t` die *Spielzeit* — der Aufruf mit `S` hat dort jeden
  Frame die Uhr überschrieben und alle Animationen eingefroren. Entweder ein
  eigenes Objekt übergeben (wie die Kämpfer in Level 4 und 8) oder die drei
  Zeilen ausschreiben. Der Fehler ist still: nichts stürzt ab, es wirkt nur
  alles seltsam zäh.

## Was schon umgebaut ist

- **Level 2 (Bei Moritz)** hat Tiefe (Reden geht nur, wenn man auch hingeht)
  und am Ende die Entscheidung, wen man mitnimmt. Die Wahl setzt Crew, Flags
  und Beziehungen — und wirkt messbar weiter: Level 4 braucht je nach
  Gruppengröße 6, 5 oder 4 Treffer, Level 8 bekommt dafür mehr Hilfe im
  großen Fight.
- **Level 1 (Die Schule)** hat Tiefe: Lehrer sehen in einem Kegel in der
  Fläche, wer weit genug vorne läuft kommt vorbei. Türen und Spinde liegen
  an der Rückwand. Dazu das eingezogene Handy als zweites, freiwilliges Ziel
  und ein Gespräch mit dem Hausmeister, das einen zweiten Lösungsweg öffnet.
- **Level 4 (Türsteher)** läuft komplett auf dem neuen Kampfsystem: Bewegung
  in der Fläche, Blocken, Ausdauer, Ausweichrolle, Rammstoß (unblockbar) und
  drei Phasen.
- **Level 8 (Heimweg)** hat den großen Fight davor: drei Phasen mit
  wechselnder Arena (Straße → Hinterhof → Baustelle), Handlanger ab Phase 2,
  Würfe ab Phase 3, Crew mischt sich ein. Verlieren beendet das Spiel nicht,
  es macht den Heimweg härter.

## Nächster Schritt

**Level 3 (Nachtbus)** ist als nächstes dran — chronologisch. Danach Level 5
(Club), der größte Brocken.

Offen aus Level 1, wenn Zeit ist:

- [ ] Lehrer-Routinen: Kaffee holen, Klo, Kopierer statt nur Patrouille
- [ ] Keller als vierte Ebene
- [ ] Spind mit Zahlencode, die Nummer steht woanders
- [ ] Optionale Abrechnung mit dem Direktor am Ausgang (Gespräch statt
      fester Cutscene)
- [ ] Mehr Möbelarten, damit sich die zehn Räume unterscheiden

Danach **Level 2 (Bei Moritz)**: Wohnung mit Tiefe, mehr Leute mit eigenen
Gesprächsbäumen, Trinkspiele, und die Entscheidung wen man mitnimmt.

**Level 5 (Club)** ist der wichtigste Brocken — dort gehört Nicks
Hauptwunsch hin: das Ansprechen als echter Entscheidungsbaum, dazu die
kleine Schlägerei aus Phase 2 (die ist bewusst noch nicht gebaut, damit die
Datei nicht zweimal angefasst wird).

## Testen

```bash
node tools/pruefe.js      # alle Level gegen die Engine, ohne Browser
node test/kampf.test.js   # 22 Prüfungen der Kampflogik
```

Im Browser: `python -m http.server 5173`, dann die Level einzeln aufmachen.
**Achtung:** der Server schickt keine Cache-Header — beim Testen von
Änderungen einen Parameter anhängen (`level8.html?v=2`), sonst liefert der
Browser die alte Datei. Das hat mich schon eine Fehlersuche gekostet.

## Offen, braucht Dich

- Echte Namen und Pixel-Köpfe der Jungs. Aktuell Platzhalter: Jonas,
  Dennis, Semih, Lea (dazu Max Ferdi und Moritz aus den alten Leveln).
