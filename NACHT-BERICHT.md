# NACHT-BERICHT

Datum: 2026-10-24
Start-Commit: 09a7bb9

## Die vier Prüfungen

| Prüfung | Befehl | Ergebnis |
|:--|:--|:--|
| Syntax/Doppelnamen | `node tools/pruefe.js` | alle 10 Seiten OK |
| Kampflogik | `node test/kampf.test.js` | 22 bestanden, 0 fehlgeschlagen |
| Verpuffte Entscheidungen | `node tools/flagcheck.js` | 84 Flags gesamt, 80 wirksam, **0 verloren**, 0 ohne Setzer |
| Spielbarkeit ohne Browser | `node tools/nachttest.js` | alle Seiten „alles gruen", Exit 0, kein harter Fehler |

Baseline ist grün. `nachttest.js` meldet keinen harten Fehler — Schritt 2 „Baseline
reparieren" entfällt.

## Nichtstun-Zahlen je Level (300 s)

| Level | Ereignisse | Letztes bei | Vergleich mit dem Vortag (2026-10-11) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | stimmt überein |
| level2.html | 0 | 0 s | stimmt überein |
| level3.html (Bus) | 1 | 34 s | stimmt überein |
| level4.html | 0 | 0 s | stimmt überein |
| level5.html (Club) | 2 | 29 s | stimmt überein |
| level6.html | 12 | 291 s | stimmt überein |
| level7.html | 0 | 0 s | stimmt überein |
| level8.html | 6 | 59 s | stimmt überein |
| karte.html | 1 | 0 s | stimmt überein |

Alle neun Werte decken sich exakt mit dem Bericht vom 11.10. — keine Regression,
trotz der drei Commits dazwischen (Gameplay Stufe 2, Stufe 3, Gameplay-Plan): die
neuen Elemente (Musik, Saft, Rang, Pausemenü, Store-Gerüst) ändern das Nichtstun-
Verhalten der Zufallsläufe nicht.

## Funde

Keine neuen, belegten Funde. `flagcheck.js` zeigt weiterhin 3 nie gelesene
Beziehungen (HAUSMEISTER, DER LAUTE, DIE FRAU) — das sind laut `NACHT-TODO.md`
keine Crew-Figuren, sondern Nebenfiguren ohne Abspann-Zeile; unverändert zum
Stand vom 11.10. „Verloren" weiterhin 0; Flags gesamt und wirksam sind gegenüber
dem 11.10. (82/78) leicht gestiegen (84/80) — passt zu den zwei zusätzlichen
Gameplay-Commits seither, kein Fund.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** `nachttest.js` gibt je Level einen „leere Bildzeilen"-Wert
aus („Naeherung") — das ist keine Pixelmessung, sondern eine grobe Schätzung des
Zufallslaufs, und wird hier nicht als Ergebnis gemeldet. Nichts davon wurde geschätzt
oder als grün gemeldet.
