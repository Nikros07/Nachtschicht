# NACHT-BERICHT

Datum: 2026-10-02
Start-Commit: 93268fee17b6db4080d39bf9ed8217bda3b1fc46

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

| Level | Ereignisse | Letztes bei | Vergleich zum Vortag (2026-10-01) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | stimmt überein |
| level2.html | 0 | 0 s | **anders** (Vortag: 1, 190 s) — siehe Fund unten |
| level3.html (Bus) | 1 | 34 s | stimmt überein |
| level4.html | 0 | 0 s | Referenz routinen/nacht.md: null — stimmt überein |
| level5.html (Club) | 4 | 107 s | Referenz routinen/nacht.md: 4 Ereignisse, letztes bei 107 s — stimmt überein |
| level6.html | 12 | 291 s | stimmt überein |
| level7.html | 0 | 0 s | stimmt überein |
| level8.html | 6 | 59 s | stimmt überein |
| karte.html | 1 | 0 s | stimmt überein |

## Funde

**level2.html: Nichtstun-Lauf bleibt ab Sekunde 0 ohne jedes Ereignis (vorher 1 bei 190 s).**
Ursache geprüft, kein Fehler: `starteLevel()` zeigt seit dem gestrigen Umbau
(„Level 2: Mitnehmen-Wahl an den Levelanfang", `b524a82`) das Gespräch `MITNEHMEN`
sofort beim Levelstart statt wie vorher erst nach dem Kampf. Dessen erster Knoten hat
`zeit:10` und löst nach 10 s ohne Tastendruck aus (per Simulation bestätigt: `GESPR.name`
wechselt zu einer Antwort wie `alle`). Diese Antwortzeile selbst hat wie alle reinen
Text-Knoten ohne `wahl` im ganzen Spiel kein `zeit` und wartet auf Bestätigung (E) —
das ist dasselbe Muster wie z. B. `frech` im Beispiel-Baum in `nacht/dialog.js`. Ein
echter Spieler drückt dort E und spielt normal weiter; der reine Nichtstun-Test kommt
an dieser einen Konfirm-Zeile nicht vorbei, weil er nie eine Taste drückt. Kein Softlock,
keine Ausnahme, `pruefe.js`/`kampf.test.js`/`nachttest.js` bleiben grün — daher kein
neuer Eintrag unter „Offen": es ist erklärtes, beabsichtigtes Verhalten des
Dialogsystems, keine neue, belegte Störung.

Sonst keine neuen, belegten Funde über das hinaus, was bereits in `NACHT-TODO.md` unter
„Offen" steht. `flagcheck.js` bestätigt die dort bereits erfassten 7 verlorenen Flags
(`busDurchDieCrew`, `endeHeim`, `fightVerloren`, `friedlich`, `geantwortet_kira`,
`geantwortet_mia`, `geantwortet_sophie`) und die 5 nie gelesenen Beziehungen
(HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI) — unverändert zum Vortag.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** Nichts davon wurde geschätzt oder als grün gemeldet.
