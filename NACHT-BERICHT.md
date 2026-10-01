# NACHT-BERICHT

Datum: 2026-10-01
Start-Commit: df02d2664867bbac4a50c413da34b8fc5751801d

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

| Level | Ereignisse | Letztes bei | Vergleich zum Vortag (1.10.2026) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | kein Vortagswert in der Anleitung vermerkt |
| level2.html | 1 | 190 s | kein Vortagswert vermerkt |
| level3.html (Bus) | 1 | 34 s | kein Vortagswert vermerkt |
| level4.html | 0 | 0 s | Referenz: null — **stimmt überein** |
| level5.html (Club) | 4 | 107 s | Referenz: 4 Ereignisse, letztes bei 107 s — **stimmt überein** |
| level6.html | 12 | 291 s | kein Vortagswert vermerkt |
| level7.html | 0 | 0 s | kein Vortagswert vermerkt |
| level8.html | 6 | 59 s | kein Vortagswert vermerkt |
| karte.html | 1 | 0 s | kein Vortagswert vermerkt |

Nur Level 4 und Club (level5) haben einen Referenzwert in `routinen/nacht.md`
(Stand 1.10.2026) — beide stimmen exakt mit der heutigen Messung überein. Für die
übrigen Level liegt kein Vortagswert vor, mit dem verglichen werden könnte (diese
Datei existierte vorher nicht).

## Funde

Keine neuen, belegten Funde über das hinaus, was bereits in `NACHT-TODO.md` unter
„Offen" steht. `flagcheck.js` bestätigt die dort bereits erfassten 7 verlorenen Flags
(`busDurchDieCrew`, `endeHeim`, `fightVerloren`, `friedlich`, `geantwortet_kira`,
`geantwortet_mia`, `geantwortet_sophie`) und die 5 nie gelesenen Beziehungen
(HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI) — das deckt sich mit dem Befund „Die
Hälfte aller Entscheidungen verpufft" in `PLAYTEST.md` und ist dort bzw. unter
„Entscheidung nötig" bereits dokumentiert.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** Nichts davon wurde geschätzt oder als grün gemeldet.
