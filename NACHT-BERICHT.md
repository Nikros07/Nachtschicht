# NACHT-BERICHT

Datum: 2026-10-11
Start-Commit: 6bf05c5

## Die vier Prüfungen

| Prüfung | Befehl | Ergebnis |
|:--|:--|:--|
| Syntax/Doppelnamen | `node tools/pruefe.js` | alle 10 Seiten OK |
| Kampflogik | `node test/kampf.test.js` | 22 bestanden, 0 fehlgeschlagen |
| Verpuffte Entscheidungen | `node tools/flagcheck.js` | 82 Flags gesamt, 78 wirksam, **0 verloren**, 0 ohne Setzer |
| Spielbarkeit ohne Browser | `node tools/nachttest.js` | alle Seiten „alles gruen", Exit 0, kein harter Fehler |

Baseline ist grün. `nachttest.js` meldet keinen harten Fehler — Schritt 2 „Baseline
reparieren" entfällt.

## Nichtstun-Zahlen je Level (300 s)

| Level | Ereignisse | Letztes bei | Vergleich mit dem Vortag (2026-10-06) |
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

Alle neun Werte decken sich exakt mit dem Bericht vom 6.10. — keine Regression.

## Offene Frage vom Vortag geklärt

Der Bericht vom 6.10. ließ offen, ob `level4.html`s „0 Ereignisse bei Nichtstun" ein
Softlock in der neuen `schlange`-Phase ist. Nachgelesen (level4.html:358-368,
nacht/dialog.js:53-102): `schlange(dt)` läuft unabhängig von Tasten per Timer
(`S.warteT`) und startet nach spätestens `WARTE_MAX`=16 s automatisch das Gespräch
`DENNIS_SCHLANGE`. Dessen Start-Knoten hat `zeit:10` und wählt bei Ablauf selbst die
Standardantwort — auch das läuft ohne Taste durch. Der Folge-Knoten `passt` hat aber
nur `geh:'ende'`, kein `zeit` — wie jeder andere einzeilige Antwortknoten im ganzen
Spiel (z. B. `frech` im Beispielbaum im Kopfkommentar von `nacht/dialog.js`) wartet er
auf eine Taste (`gespraechBestaetigen()`), sonst geht es nicht weiter. Das ist kein
Level-4-spezifischer Softlock, sondern dieselbe „zum Weiterlesen eine Taste drücken"-
Mechanik wie in jedem Gesprächsbaum des Spiels — mit Tasten (siehe der 60-s-Spiellauf
oben: Modi `schlange/kampf/ende/titel/intro`, der Kampf wird erreicht) läuft es normal
durch. Kein Fund, kein neuer NACHT-TODO-Eintrag, keine Codeänderung.

## Funde

Keine neuen, belegten Funde. `flagcheck.js` zeigt weiterhin 5 nie gelesene
Beziehungen (HAUSMEISTER, DER LAUTE, DIE FRAU, JONAS, TOBI) — unverändert zum Stand
vor den vier Fixes vom 6.10. (DENNIS/MARVIN/SEMIH/LEA sind draußen geblieben, wie
erwartet). „Verloren" weiterhin 0.

## Nicht geprüft

Wie in `routinen/nacht.md` vorgeschrieben: **Pixel, leere Bildzeilen, Layout, Ton,
`runner.html`, echte Geräte.** `nachttest.js` gibt je Level einen „leere Bildzeilen"-Wert
aus („Naeherung") — das ist keine Pixelmessung, sondern eine grobe Schätzung des
Zufallslaufs, und wird hier nicht als Ergebnis gemeldet. Nichts davon wurde geschätzt
oder als grün gemeldet.
