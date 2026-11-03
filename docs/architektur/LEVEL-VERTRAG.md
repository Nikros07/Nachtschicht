# Level-Vertrag

Welche globalen Namen eine Seite (`index.html`, `level2.html` ... `level8.html`) der Engine
(`nacht/*.js`) bereitstellen muss oder darf. Belegt mit Datei:Zeile, Stand 03.11.2026.
Geprüft von `tools/nachttest.js` (Funktion `vertrag`, erste Zeilenhälfte jeder Seite:
`Vertrag ok` / `Vertrag: ohne pauseTaste, ...`). Fehlende **Pflicht** = harter Fehler (Exit 1),
fehlende **optionale** Namen = nur Hinweis. Die Engine selbst fragt fast alles mit `typeof` ab –
ein fehlender optionaler Name macht also still eine Funktion unwirksam, ohne Fehlermeldung.

`runner.html` hat eine eigene Schleife und ist ausgenommen. `karte.html` hat eigene Regeln
(unten).

## Namen

| Name | Pflicht? | Wer fragt (Datei:Zeile) | Was passiert, wenn es fehlt |
|---|---|---|---|
| `update(dt)` | **Pflicht** | `kern.js:132` (ohne `typeof`) | `ReferenceError` in jedem Bild; `geraet.js` fängt es ab und zeigt nach 1,5 s die Fehlerseite (`geraet.js:449`) |
| `draw(dt)` | **Pflicht** | `kern.js:119,136,139` (ohne `typeof`) | wie `update`; auch die Pause kann das Bild nicht darunter halten |
| Aufruf `starteSchleife();` (Engine-Funktion, `kern.js:145`) | **Pflicht** | steht am Ende jeder Seite; Prüfung per Text, `geraet.js:449` | kein einziges Bild läuft, weiße Fläche, dann Fehlerseite |
| `S` (Objekt) | **Pflicht** | `eingabe.js:52,62`, `pause.js:99`, `hilfe.js:149,168`, `lehre.js:186`, `erzaehl.js:239`, `wertung.js:127`, `mobil.js:548,707` (alle mit `typeof S`) | Pause, WAS JETZT?, Lektion, Tipps, Wertungstafel und Handy-Infoleiste schalten sich still ab |
| `S.modus` (Text) | **Pflicht** | `pause.js:100`, `hilfe.js:149,169`, `lehre.js:186`, `erzaehl.js:239`, `mobil.js:548`, `eingabe.js:52`, `wertung.js:127` | Modus-Abfragen ergeben `undefined`: Pause öffnet auf dem Titel, Lektion startet nie |
| `S.modus` startet als `'titel'` | Hinweis | `pause.js:100`, `eingabe.js:52,62` (Titel: keine Pause, `L` und Ziffern 1-8 springen) | Sprungmarken/`L` gehen nicht, Pause kann auf dem Titel aufgehen |
| `TUNE` (Objekt) | **Pflicht** (Projektregel in CLAUDE.md, die Engine fragt nicht) | keine Engine-Stelle; Messskripte und `nachttest` lesen es | Stellschrauben stehen verstreut in der Logik |
| `starte()` | optional | `menue.js:308` (Startmenü, NEUE NACHT) | Menü fällt auf `index.html?neu=1` zurück; nur in `index.html` im Einsatz |
| `neuesSpiel()` | optional | `pause.js:156` (Pause: NEU STARTEN, JA) | der Eintrag schließt die Pause und tut sonst nichts |
| `pauseTaste()` | optional | `eingabe.js:49` (Taste P), `mobil.js:548,555` (Handy-Menü hält das Spiel an) | P tut nichts; das Handy-Menü läuft über dem laufenden Spiel |
| `mobilKontext()` | optional | `mobil.js:744` | Standard `{aktion:'AKTION', zwei:'SPRUNG', block:false, extras:null}`; Aufschriften der Handy-Knöpfe stimmen nicht zur Lage |
| `PLAUSCH_ZEILEN` | optional | keine Abfrage; `neuesSpiel()` übergibt sie an `PLAUSCH.lade(...)` (`erzaehl.js:8`), `nachttest.js` prüft sie (Länge ≤ 44, Schrift) | keine Plauderzeilen; `index.html` ruft bewusst `PLAUSCH.lade([])` (`index.html:486`) |
| `S.hinweis`, `S.hinweisT` | optional (Level muss **lesen und zeichnen**) | `hilfe.js:101,112,153,157` schreibt, `mobil.js:708` liest | Tipps (HILFE) werden gesetzt, aber nie gezeigt; Prüfung: Text `S.hinweisT` steht im Level |
| `S.meldung`, `S.meldungT` | optional | `mobil.js:709` (Handy-Infoleiste), `nachttest.js` (Nichtstun-Ereignisse) | Meldungen fehlen nur in der Handy-Infoleiste |
| `S.gewonnen` | optional | `hilfe.js:151` (Niederlage erkennen, LOCKER-Angebot) | `modus==='ende'` zählt immer als Niederlage |
| `S.minute` | optional | `handy.js:194` (Uhr im Handy) | Uhr bleibt leer |
| `W`, `H`, `ctx`, `cv`, `keys`, `text()`, `sprite()`, `piep()`, `wert()`, `setzeFlag()` ... | von der Engine geliefert, nicht Sache des Levels | `kern.js`, `bild.js`, `ton.js`, `stand.js` | nicht überschreiben (`pruefe.js` meldet doppelte Namen) |

Nicht zum Vertrag gehören `starteLevel` (nur Level-intern: `index.html:688`; `level3.html` hat
es nicht und braucht es nicht) und `gespraechAktiv`, `kapitelAktiv`, `kapitelZeigen`: die liefert
die Engine (`dialog.js`, `erzaehl.js`), das Level ruft sie nur auf.

## `S.modus`-Werte

Das Level darf beliebige Modi haben (`spiel`, `sprint`, `schlange`, `reden` ...). Die Engine
kennt und beachtet nur diese:

| Wert | Wer beachtet ihn (Datei:Zeile) | Wirkung |
|---|---|---|
| `titel` | `pause.js:100`, `eingabe.js:52,62`, `hilfe.js:169` | keine Pause/Hilfe; `L` und Ziffern 1-8 gelten nur hier |
| `intro` | `lehre.js:186` (Lektion startet **nur** im Intro), `hilfe.js:169`, `erzaehl.js:239` | ohne Intro-Modus gibt es nie eine Lektion; Tipps und Plausch ruhen |
| `ende` | `hilfe.js:151,169`, `erzaehl.js:239` | Niederlage/Sieg (`S.gewonnen`), Plausch ruht |
| `pause` | `pause.js` (Z.modus), `mobil.js:548,555`, `hilfe.js:169`, `erzaehl.js:239` | vom Level in `pauseTaste()` gesetzt; Plausch/Tipps ruhen |
| `cutscene`, `kampf`, `kloppe`, `gefangen`, `schwarz` | `erzaehl.js:239` (Plausch ruht), `hilfe.js:169` (`cutscene`) | nur diese zählen als „nicht plauderbar“ |
| `spiel` und alle anderen | – | normaler Lauf |

`S.mode==='attract'` (`eingabe.js:52,62`) ist ein Altlast-Name ohne Nutzer in den Seiten.

## `karte.html`

Pflicht: `update`, `draw`, `S` mit `S.modus` (hier `fahrt/wahl/umweg`, **kein** `titel`),
Aufruf `starteSchleife();`. Optional: `mobilKontext`. Kein `TUNE`, `pauseTaste`, `neuesSpiel`,
`starte`: die Karte hat weder Pause noch Neustart.

## Stand der Seiten (03.11.2026)

Alle neun Seiten erfüllen die Pflicht. Hinweis: `index.html` ohne `PLAUSCH_ZEILEN` (gewollt,
siehe oben). `nachttest` meldet je Seite `Vertrag ok` oder `Vertrag: ohne ...`.
