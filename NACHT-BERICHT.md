# NACHT-BERICHT

Datum: 2026-10-06
Start-Commit: 1e803e0

## Die vier Prüfungen

| Prüfung | Befehl | Ergebnis |
|:--|:--|:--|
| Syntax/Doppelnamen | `node tools/pruefe.js` | alle 10 Seiten OK |
| Kampflogik | `node test/kampf.test.js` | 22 bestanden, 0 fehlgeschlagen |
| Verpuffte Entscheidungen | `node tools/flagcheck.js` | 82 Flags gesamt, 78 wirksam, **0 verloren**, 0 ohne Setzer |
| Spielbarkeit ohne Browser | `node tools/nachttest.js` | alle Seiten „alles gruen", Exit 0, kein harter Fehler |

Baseline ist grün. `nachttest.js` meldet keinen harten Fehler — Schritt 2 „Baseline
reparieren" entfällt.

**Wichtig für den Vergleich:** zwischen dem letzten Bericht (2026-10-05, Start-Commit
`6453365`) und heute wurde der Launch-Ausbau (Branch `claude/launch`) nach `claude/nacht`
gemergt (Commit `1e803e0`, „Nachtroutine vom 4. und 5.10. in den Launch-Zweig geholt").
Das ist kein Routine-Schritt gewesen (die Routine pusht nie nach `main` und ändert nie
`routinen/`, dieser Merge fand offenbar in einer Tagessitzung statt) — Spielinhalt und
-umfang haben sich dadurch grundlegend verändert (acht neu gebaute Level, Startmenü,
Lektionen, Erzähl-Engine). Die Zahlen unten sind deshalb **nicht wie sonst 1:1 mit dem
Vortag vergleichbar**; wo sie stark abweichen, steht das ausdrücklich dabei statt als
Regression gemeldet zu werden.

## Nichtstun-Zahlen je Level (300 s)

| Level | Ereignisse | Letztes bei | Vergleich mit dem Vortag (2026-10-05) |
|:--|--:|--:|:--|
| index.html (Level 1) | 1 | 165 s | stimmt überein |
| level2.html | 0 | 0 s | stimmt überein |
| level3.html (Bus) | 1 | 34 s | stimmt überein |
| level4.html | 0 | 0 s | weicht ab (Vortag: 3, letztes bei 9 s) — durch den Launch-Merge hat Level 4 jetzt eine vorgeschaltete „schlange"-Phase (Modi im Spiellauf: schlange/kampf/ende/titel/intro); nicht geprüft, ob das ein Softlock ist oder nur bedeutet, dass vor dem Kampf nichts passiert, wenn man nichts tut — siehe neuer Fund unten |
| level5.html (Club) | 2 | 29 s | weicht stark ab (Vortag: 16, letztes bei 295 s) — neue Inhalte durch den Merge, altes `TUNE.CLUB_EREIGNISSE`-Timing nicht direkt vergleichbar |
| level6.html | 12 | 291 s | stimmt überein |
| level7.html | 0 | 0 s | weicht ab (Vortag: 0, letztes bei 0 s — Zahl gleich, aber neuer Levelinhalt durch den Merge) |
| level8.html | 6 | 59 s | stimmt überein |
| karte.html | 1 | 0 s | stimmt überein |

Referenz vom 1.10. (laut `routinen/nacht.md`: Club 4 Ereignisse/107 s, Level 4 null) ist
seit den Club- und Level-4-Ausbauten ohnehin überholt und wird hier nicht mehr herangezogen.

## Funde

**Neu, belegt:** `flagcheck.js` zeigt jetzt 9 nie gelesene Beziehungen statt der 5 vom
Vortag: `HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, DENNIS, MARVIN, SEMIH, LEA, TOBI`. Die
vier neuen (DENNIS, MARVIN, SEMIH, LEA) sind Crew-Mitglieder — ihre `mag:[...]`-Werte
werden in mehreren Gesprächen in level4.html, level5.html, level6.html, level7.html,
level8.html und nacht/handy.js gesetzt (grep bestätigt: kein einziges `mag(` oder
`.mag`-Lesen dieser Namen in nacht/epilog.js oder nacht/nacht.js). Als neuer Punkt unter
„Offen" eingetragen.

Keine weiteren neuen, belegten Funde. Die 0 verlorenen Flags (vorher 7: `busDurchDieCrew`,
`endeHeim`, `fightVerloren`, `friedlich`, `geantwortet_kira`, `geantwortet_mia`,
`geantwortet_sophie`) sind eine Verbesserung, vermutlich Teil des Launch-Merges — nicht
weiter untersucht, da keine Verschlechterung.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** `nachttest.js` gibt je Level einen „leere Bildzeilen"-Wert
aus („Naeherung") — das ist keine Pixelmessung, sondern eine grobe Schätzung des
Zufallslaufs, und wird hier nicht als Ergebnis gemeldet. Nichts davon wurde geschätzt
oder als grün gemeldet.

Ebenfalls nicht geprüft: ob die neue „schlange"-Phase in level4.html bei Nichtstun ein
echter Softlock ist oder nur eine Wartephase ohne Ereignis — das verlangt genaueres
Nachmessen (siehe neuer Punkt unter „Offen").
