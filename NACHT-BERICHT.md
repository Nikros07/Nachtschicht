# NACHT-BERICHT

Datum: 2026-10-03
Start-Commit: 30d6ae97b3fa047b02921abd4a3f3673d281e5e5

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

| Level | Ereignisse | Letztes bei | Vergleich zum Vortag (2026-10-02) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | stimmt überein |
| level2.html | 0 | 0 s | stimmt überein |
| level3.html (Bus) | 1 | 34 s | stimmt überein |
| level4.html | 0 | 0 s | Referenz routinen/nacht.md: null — stimmt überein |
| level5.html (Club) | 16 | 295 s | **anders** (Vortag-Bericht: 4, 107 s) — Bericht vom 2.10. wurde vor der Nachtbau-Phase geschrieben; die dort gebaute „Club-Uhr: Ambient-Ereignisse" (Commit `afea7a1`) steckt jetzt im getesteten Stand. Kein neuer Fund, nur ein späterer Messzeitpunkt. |
| level6.html | 12 | 291 s | stimmt überein |
| level7.html | 0 | 0 s | stimmt überein |
| level8.html | 6 | 59 s | stimmt überein |
| karte.html | 1 | 0 s | stimmt überein |

## Funde

Keine neuen, belegten Funde über das hinaus, was bereits in `NACHT-TODO.md` unter
„Offen" steht. `flagcheck.js` bestätigt die dort bereits erfassten 7 verlorenen Flags
(`busDurchDieCrew`, `endeHeim`, `fightVerloren`, `friedlich`, `geantwortet_kira`,
`geantwortet_mia`, `geantwortet_sophie`) und die 5 nie gelesenen Beziehungen
(HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI) — unverändert zum Vortag.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** `nachttest.js` gibt je Level einen „leere Bildzeilen"-Wert
aus („Naeherung") — das ist keine Pixelmessung, sondern eine grobe Schätzung des
Zufallslaufs, und wird hier nicht als Ergebnis gemeldet. Nichts davon wurde geschätzt
oder als grün gemeldet.
