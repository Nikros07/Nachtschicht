# Weitermachen

Diese Datei ist die Übergabe. Wenn Du "continue" sagst, liest Claude hier
nach, wo es stand, und macht genau dort weiter.

**Stand:** Phase 0 und 1 fertig. Phase 2 läuft.
**Zuletzt aktualisiert:** 2026-09-17

---

## Wo wir stehen

Der große Plan steht in [PLAN.md](PLAN.md) — was gebaut wird und warum.

| Phase | Was | Stand |
|:--|:--|:--|
| 0 | Gemeinsame Engine statt neunfacher Kopie | ✅ fertig |
| 1 | Tiefe, Gespräche, Werte, Speicherstand | ✅ fertig |
| 2 | Kampfsystem + die zwei Kämpfe | 🔧 läuft |
| 3 | Level 1–8 ausbauen, chronologisch | ⬜ offen |
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

## Nächster Schritt

Phase 2, Kampfsystem (`nacht/kampf.js`):
- Kern aus `runner.html` übernehmen (fünf Gegnertypen, Bosse mit drei
  Phasen, Trefferzonen, Combos, Knockback, Hit-Stop)
- Konter-Mathematik aus `level4.html` darüberlegen (Fenster als Anteil vom
  Ausholen, Fehlschlag-Strafe, `serieMax`, Crew-Bonus)
- **Neu bauen, existiert nirgends:** Blocken (Spieler und Gegner), Ausdauer,
  Ausweichrolle in die Tiefe, unblockbare Angriffe
- Danach: kleiner Kampf im Club (Level 5/6), großer Drei-Phasen-Fight mit
  wechselnder Arena als Finale (Level 8)

Danach Phase 3: Level der Reihe nach ausbauen, Level 1 zuerst.

## Offen, braucht Dich

- Echte Namen und Pixel-Köpfe der Jungs. Aktuell Platzhalter: Jonas,
  Dennis, Semih, Lea (dazu Max Ferdi und Moritz aus den alten Leveln).
