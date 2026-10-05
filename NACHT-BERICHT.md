# NACHT-BERICHT

Datum: 2026-10-05
Start-Commit: 6453365

## Die vier Prüfungen

| Prüfung | Befehl | Ergebnis |
|:--|:--|:--|
| Syntax/Doppelnamen | `node tools/pruefe.js` | alle 10 Seiten OK |
| Kampflogik | `node test/kampf.test.js` | 22 bestanden, 0 fehlgeschlagen |
| Verpuffte Entscheidungen | `node tools/flagcheck.js` | 61 Flags gesamt, 50 wirksam, **7 verloren**, 0 ohne Setzer |
| Spielbarkeit ohne Browser | `node tools/nachttest.js` | alle Seiten „alles gruen", Exit 0, kein harter Fehler |

Baseline ist grün. `nachttest.js` meldet keinen harten Fehler — Schritt 2 „Baseline
reparieren" entfällt.

## Nichtstun-Zahlen je Level (300 s)

| Level | Ereignisse | Letztes bei | Vergleich mit dem Vortag (2026-10-04) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | stimmt überein |
| level2.html | 0 | 0 s | stimmt überein |
| level3.html (Bus) | 1 | 34 s | stimmt überein |
| level4.html | 3 | 9 s | stimmt überein |
| level5.html (Club) | 16 | 295 s | stimmt überein |
| level6.html | 12 | 291 s | stimmt überein |
| level7.html | 0 | 0 s | stimmt überein |
| level8.html | 6 | 59 s | stimmt überein |
| karte.html | 1 | 0 s | stimmt überein |

## Funde

Keine neuen, belegten Funde. `flagcheck.js` bestätigt dieselben 7 verlorenen Flags
(`busDurchDieCrew`, `endeHeim`, `fightVerloren`, `friedlich`, `geantwortet_kira`,
`geantwortet_mia`, `geantwortet_sophie`) und dieselben 5 nie gelesenen Beziehungen
(HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI) — unverändert zum Vortag. Alle in
`NACHT-TODO.md` bereits erfasst.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** `nachttest.js` gibt je Level einen „leere Bildzeilen"-Wert
aus („Naeherung") — das ist keine Pixelmessung, sondern eine grobe Schätzung des
Zufallslaufs, und wird hier nicht als Ergebnis gemeldet. Nichts davon wurde geschätzt
oder als grün gemeldet.
