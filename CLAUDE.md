# NACHTSCHICHT — Regeln für jede Sitzung

Pixel-Art-Partyspiel im Browser, deutsch, ohne Build. Die Karte des Codes steht
in `ARCHITEKTUR.md` — vor jeder Änderung lesen.

## Pflicht am Ende jeder Aufgabe

**Rufe den Skill `todo-notieren` auf**, bevor du dem Nutzer das Ergebnis meldest.
Er schreibt alles Offene, Aufgeschobene, Ungeprüfte und neu Gefundene in
`NACHT-TODO.md`. Die Nachtroutinen (4 Uhr testen, 5 Uhr weiterbauen) arbeiten
diese Liste ab und haben **kein Gedächtnis an diese Sitzung** — was nicht dort
steht, passiert nachts nicht.

Ausnahme: reine Fragen ohne Änderung und ohne neue Erkenntnis. Und in den
Nachtroutinen selbst, die ihre Liste eigenständig pflegen.

## Regeln des Projekts

- Alles auf Deutsch: Namen, Kommentare, Texte, Commit-Nachrichten.
- Keine ES-Module, kein Build — klassische `<script src>`-Tags (file:// muss gehen).
- Der Bitmap-Font kann nur `A-Z 0-9 . : - ! ? / + , < > * % ( ) ' "`. **Keine
  Umlaute auf dem Canvas** (ae/oe/ue/ss). Im HTML-Bedienfeld gehen Umlaute.
- Jede Stellschraube steht im `TUNE`-Block des Levels, nicht in der Logik.
- `S.t` ist in den Leveln die Spielzeit, `e.t` in der Engine die Tiefe —
  `bewegeTiefe(S,…)` überschreibt die Uhr.
- Nach jeder Änderung in `nacht/`: `python tools/version.py`.
- Messen statt raten: `update(1/60)` in einer Schleife, Werte auslesen.

## Prüfen vor jedem Commit

```bash
node tools/pruefe.js        # alle 10 Seiten: Syntax, doppelte Namen
node test/kampf.test.js     # 22 Prüfungen der Kampflogik
```

## Nachtroutinen — Grenzen

Beide Routinen laufen unbeaufsichtigt. Sie committen **lokal** und **pushen nie**.
Sie löschen nichts außer dem, was ein Listenpunkt ausdrücklich verlangt, und sie
fassen den Abschnitt „Entscheidung nötig" in `NACHT-TODO.md` nicht an.
Protokoll: `NACHT-LOG.md`. Testbericht: `NACHT-BERICHT.md`.
