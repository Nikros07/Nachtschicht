# NACHTSCHICHT — Regeln für jede Sitzung

Pixel-Art-Partyspiel im Browser, deutsch, ohne Build. Die Karte des Codes steht
in `ARCHITEKTUR.md` — vor jeder Änderung lesen.

## Pflicht am Ende jeder Aufgabe

**Rufe den Skill `todo-notieren` auf**, bevor du dem Nutzer das Ergebnis meldest.
Er schreibt alles Offene, Aufgeschobene, Ungeprüfte und neu Gefundene in
`NACHT-TODO.md`. Die Nachtroutine (testet, dann baut sie die Liste ab) hat
**kein Gedächtnis an diese Sitzung** — was nicht dort steht, passiert nachts nicht.

Ausnahme: reine Fragen ohne Änderung und ohne neue Erkenntnis. Und in der
Nachtroutine selbst, die ihre Liste eigenständig pflegt.

## Regeln des Projekts

- Alles auf Deutsch: Namen, Kommentare, Texte, Commit-Nachrichten.
- Keine ES-Module, kein Build — klassische `<script src>`-Tags (file:// muss gehen).
- Der Bitmap-Font kann nur `A-Z 0-9 . : - ! ? / + , < > * % ( ) ' "`. **Keine
  Umlaute auf dem Canvas** (ae/oe/ue/ss). Im HTML-Bedienfeld gehen Umlaute.
- Jede Stellschraube steht im `TUNE`-Block des Levels, nicht in der Logik.
- `S.t` ist in den Leveln die Spielzeit, `e.t` in der Engine die Tiefe —
  `bewegeTiefe(S,…)` überschreibt die Uhr.
- Nach **jeder** Änderung an Seiten (`*.html`) **und** in `nacht/` (auch `stil.css`) oder an den Symbolen:
  `python tools/version.py`. Sonst sieht, wer das Spiel schon besucht hat, die Änderung nie (der
  Service Worker hält die alte Fassung fest). `python tools/version.py --pruefen` meldet, ob etwas fehlt.
- Neue Blitze, Wackeln oder Flackern nur über `FX` (`nacht/komfort.js`), sonst gilt der Flackerschutz nicht.
- Neue Level-Texte (Kapitelkarte, Rückblick, Polaroids) stehen in `nacht/texte.js`, nicht im Level.
- Messen statt raten: `update(1/60)` in einer Schleife, Werte auslesen.

## Prüfen vor jedem Commit

```bash
node tools/pruefe.js        # alle 10 Seiten: Syntax, doppelte Namen
node test/kampf.test.js     # 22 Prüfungen der Kampflogik
node tools/nachttest.js     # jede Seite ohne Browser durchspielen (Ausnahmen, NaN,
                            # tote Gesprächsverweise, Konter in Level 2) - ~2 s
node tools/flagcheck.js     # Entscheidungen, die nie gelesen werden
node test/erzaehl.test.js   # Kapitelkarte, Plausch, Momente
node test/epilog.test.js    # Knoten, Enden, Epilog, Galerie-Daten
node test/menue.test.js     # Startmenü
node test/geraet.test.js    # Fehlerschutz, Service-Worker-Anmeldung, ?reset
node test/sw.test.js        # Service Worker (Offline, Stempelprüfung)
node test/launch.test.js    # Tests der Startwerkzeuge
python tools/version.py --pruefen   # alles gestempelt? (sonst: python tools/version.py)
node tools/launchcheck.js   # Startprüfung, muss BEREIT sagen
```

Reihenfolge-Faustregel: erst `python tools/version.py`, dann die Prüfliste; `launchcheck` und
`sw.test` schlagen sonst wegen alter Stempel an. Bei einer neuen Version: `GERAET.version`
(`nacht/geraet.js`) und die oberste Überschrift in `CHANGELOG.md` gleich halten.

`nachttest.js` kann **keine Pixel** messen und nichts hören — dafür den Browser
nehmen, wenn einer da ist.

## Nachtroutinen — Grenzen

Die Routine läuft unbeaufsichtigt **in der Cloud** und arbeitet auf dem Branch
`claude/nacht`. Ihr Ablauf steht in `routinen/nacht.md`; sie ändert `routinen/` nie. Sie pushen **nur dorthin, nie nach `main`**, nie mit `--force`.
Sie löschen nichts außer dem, was ein Listenpunkt ausdrücklich verlangt, und sie
fassen den Abschnitt „Entscheidung nötig" in `NACHT-TODO.md` nicht an.
Protokoll: `NACHT-LOG.md`. Testbericht: `NACHT-BERICHT.md`.
Eine Cloud-Sitzung hat **keinen Browser** — Messungen gehen über `tools/nachttest.js`.
