# NACHTSCHICHT — Regeln für jede Sitzung

Pixel-Art-Partyspiel im Browser, deutsch, ohne Build. Die Karte des Codes steht
in `ARCHITEKTUR.md` — vor jeder Änderung lesen (Abschnitt „Wo ändere ich was?“).
Der Plan für größere Umbauten: `docs/architektur/PLAN.md`.

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
python tools/version.py       # erst stempeln (nach Änderungen an *.html, nacht/, Symbolen)
node tools/pruefliste.js      # ALLE Prüfungen, parallel, ~20 s - muss "alle ... gruen" sagen
```

`pruefliste.js` ist die eine Quelle der Liste: `pruefe.js` (Syntax, doppelte Namen,
Ladereihenfolge), `nachttest.js` (jede Seite ohne Browser durchspielen), `flagcheck.js`,
**jeder** `test/*.test.js` (neue Tests laufen automatisch mit), `version.py --pruefen`,
`launchcheck.js` (muss BEREIT sagen). Bei Rot zeigt sie die letzten 15 Zeilen der Prüfung;
einzeln nachstarten geht wie gewohnt (`node test/pause.test.js`, `node tools/nachttest.js level5`).
In einem ungestempelten Worktree: `node tools/pruefliste.js --ohne-stempel`.

Reihenfolge-Faustregel: erst `python tools/version.py`, dann die Prüfliste; `launchcheck` und
`sw.test` schlagen sonst wegen alter Stempel an. Den Stempel als **eigenen, letzten Commit**
machen (weniger Merge-Konflikte). Bei einer neuen Version: `GERAET.version`
(`nacht/geraet.js`) und die oberste Überschrift in `CHANGELOG.md` gleich halten.

`nachttest.js` kann **keine Pixel** messen und nichts hören — dafür den Browser
nehmen, wenn einer da ist.

## Nachtroutinen — Grenzen

Die Routine läuft unbeaufsichtigt **in der Cloud** und arbeitet auf dem Branch
`claude/nacht`. Ihr Ablauf steht in `routinen/nacht.md`; sie ändert `routinen/` nie. Sie pushen **nur dorthin, nie nach `main`**, nie mit `--force`.
Sie löschen nichts außer dem, was ein Listenpunkt ausdrücklich verlangt, und sie
fassen den Abschnitt „Entscheidung nötig" in `NACHT-TODO.md` nicht an.
Protokoll: `NACHT-LOG.md`. Testbericht: `NACHT-BERICHT.md`.
Messungen gehen über `tools/nachttest.js`. Manche Cloud-Umgebungen haben ein headless Chromium
(Playwright) – damit gehen Screenshots und DOM-Maße, aber kein Ton und kein echtes Gerät.
