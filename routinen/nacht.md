# Die Nachtroutine — der ganze Ablauf

Du bist die Nachtroutine für das Spiel NACHTSCHICHT. Du läufst unbeaufsichtigt in
der Cloud, niemand antwortet auf Rückfragen. **Erst testest du, dann baust du, was auf
der Liste steht.** Alles in einem Lauf.

Arbeitsverzeichnis: der geklonte Repo-Ordner (GitHub `Nikros07/Nachtschicht`).
Deutsches Pixel-Art-Partyspiel im Browser, 8 Level + Karte + Runner, kein Build.
**In dieser Sitzung gibt es keinen Browser.** Messungen laufen über Node.

## Schritt 0 — Branch

Du arbeitest ausschließlich auf `claude/nacht`, nie auf `main`.

```
git fetch origin
git checkout -B claude/nacht origin/claude/nacht
git merge origin/main
```

Der Merge nur, wenn `main` weiter ist. Bei einem Konflikt in `NACHT-*.md` beide Seiten
behalten und keinen Eintrag verlieren. Bei einem Konflikt in Spielcode:
`git merge --abort`, im Log `abgebrochen: Merge-Konflikt` vermerken, pushen, enden.

Lies dann `CLAUDE.md` (die Regeln!), `ARCHITEKTUR.md`, `NACHT-TODO.md`, die ersten
80 Zeilen von `PLAYTEST.md` und — falls vorhanden — `NACHT-BERICHT.md` vom Vortag.

**Du darfst `routinen/` nie ändern.** Das ist deine Anleitung.

## Schritt 1 — Testen

Diese vier Befehle, genau so, Ergebnis jeweils festhalten:

```
node tools/pruefe.js        # 10 Seiten, Syntax + doppelte Namen — erwartet: alle OK
node test/kampf.test.js     # erwartet: 22 bestanden, 0 fehlgeschlagen
node tools/flagcheck.js     # Entscheidungen, die verpuffen — Zahl 'verloren' notieren
node tools/nachttest.js     # jede Seite 60 s Zufallstasten + 300 s Nichtstun; Exit 1 bei hartem Fehler
```

Notiere die Nichtstun-Zahlen je Level (Ereignisse, letztes bei) und vergleiche sie mit
dem Vortag. Referenz vom 1.10.2026: Club 4 Ereignisse, letztes bei 107 s; Level 4 null.

**Was du nicht prüfen kannst** — im Bericht ausdrücklich ausweisen, nie als grün
melden: Pixel, leere Bildzeilen, Layout, Ton, `runner.html`, echte Geräte. Schätze
nichts davon.

## Schritt 2 — Bericht und Funde

Schreibe `NACHT-BERICHT.md` neu: Datum (`date +%F`), Start-Commit, Tabelle der vier
Prüfungen, Nichtstun-Zahlen, Vergleich mit dem Vortag, Funde, Abschnitt „Nicht geprüft".
Nur Gemessenes und Gesehenes.

Trage jeden **neuen, belegten** Fund in `NACHT-TODO.md` unter „Offen" ein, im Format der
Datei, mit messbarem „Fertig wenn". Keine Duplikate. Der Abschnitt „Entscheidung nötig"
bleibt unberührt.

Committe diese Dokumente (`git add NACHT-BERICHT.md NACHT-TODO.md`, deutsche Nachricht
„Nachttest: …", mit der Co-Authored-By-Zeile deiner Sitzung) und pushe:
`git push origin claude/nacht`. Bei Ablehnung `git pull --rebase origin claude/nacht`
und erneut pushen.

**Ist die Baseline rot oder meldet `nachttest.js` einen harten Fehler,** behebst du das
als Allererstes mit dem kleinsten Eingriff (ein Commit). Gelingt es in zwei Versuchen
nicht: ins Log schreiben, pushen, **beenden, ohne weiterzubauen**.

## Schritt 3 — Bauen

**Auswahl.** Aus „Offen": erst alle P1, dann P2, dann P3, in der Reihenfolge der Datei.
„Entscheidung nötig" ist **tabu**. Höchstens **8 Punkte** oder etwa **90 Minuten** Bauzeit,
was zuerst eintritt. Prüfe mit `date`, bevor du einen neuen Punkt beginnst; nach 100
Minuten seit Start fängst du keinen neuen mehr an.

Punkte, deren „Fertig wenn" eine **Pixelmessung** verlangt, überspringst du, solange
`tools/nachttest.js` keine Pixel messen kann — vermerke „braucht Software-Canvas". Der
Punkt „Nachttest: Software-Canvas" selbst ist erlaubt (er ändert nur `tools/nachttest.js`).

**Jeder Punkt, immer in dieser Reihenfolge:**

1. **Ausgangslage messen**, gemäß „Fertig wenn". Spiel ohne Bildschirm takten:
   `update(1/60)` in einer Schleife, Werte auslesen (in `nachttest.js` über `E('...')`;
   `S` ist ein `let`, nicht auf `window`). Wegwerf-Skripte nach `$TMPDIR`, nicht ins Repo.
   Ist der Punkt laut Messung schon erfüllt oder falsch beschrieben: nicht bauen,
   Befund im Eintrag notieren, nach „Erledigt (Nacht)" mit „bereits erfüllt".
2. **Kleinster Eingriff**, der das Kriterium erfüllt. Nichts ohne Grund umbauen.
   Regeln aus `CLAUDE.md`: deutsch, keine ES-Module, keine Umlaute auf dem Canvas,
   Stellschrauben in den `TUNE`-Block, `S.t` ist die Spielzeit.
3. **Prüfen:** `pruefe.js`, `kampf.test.js`, `nachttest.js --kurz`, `flagcheck.js`
   (verloren darf nicht steigen). Nach jeder Änderung in `nacht/` zusätzlich
   `python3 tools/version.py` (oder `python`). Dann das „Fertig wenn" erneut messen.
4. **Grün:** ein Commit pro Punkt. Nur geänderte Dateien einzeln mit `git add <Datei>`,
   **nie** `git add -A` oder `git add .`. Deutsche Nachricht, die erklärt **warum**, mit
   Messzahl vorher/nachher und der Co-Authored-By-Zeile. Punkt in `NACHT-TODO.md` nach
   „Erledigt (Nacht)": Datum · Titel · Hash · Messzahl. Dann **sofort**
   `git push origin claude/nacht`, damit nichts verloren geht, wenn die Sitzung abbricht.
5. **Rot:** ein zweiter Versuch mit anderem Ansatz. Scheitert auch der, rolle **nur deine
   eigenen** Dateien mit `git restore` zurück und verschiebe den Punkt nach „Blockiert"
   mit Grund und dem, was du probiert hast. Weiter mit dem nächsten.
6. **Folgearbeit** oder neue Fehler, die du entdeckst: als neue Einträge unter „Offen"
   (Format der Datei, „Fertig wenn" Pflicht). Nicht in denselben Commit bauen.

Ist ein Punkt größer als ~15 Minuten Arbeit: nicht halb bauen, sondern in der Liste in kleinere Punkte teilen (je ein Bereich, eine Messzahl) und mit dem ersten davon weitermachen.

Zweifelst du, ob eine Änderung das Spielgefühl verschlechtert: nicht bauen, Punkt unter
„Blockiert" mit der Frage notieren. Erledigte Zeilen in `PLAYTEST.md` durchstreichen.

## Schritt 4 — Ende

Hänge an `NACHT-LOG.md` einen Eintrag „Nacht — Test und Bau" an: Datum, Start-Commit,
Testergebnis in einer Zeile, erledigte Punkte mit Hashes und Messzahlen vorher/nachher,
blockierte Punkte mit Grund, was als Nächstes oben steht. Committe `NACHT-LOG.md`,
`NACHT-TODO.md`, `PLAYTEST.md` und pushe auf `claude/nacht`. Zum Schluss muss
`git status` sauber sein.

## Grenzen (hart)

- Pushe **nur** auf `claude/nacht`. Niemals nach `main`, niemals `--force`, kein
  `git reset --hard`, kein `git clean`, keinen Branch löschen.
- Nichts löschen, außer ein Listenpunkt verlangt es ausdrücklich — dann nur diese Datei.
- Keine Zugangsdaten, keine fremden Webseiten, keine echten Namen oder Gesichter von
  Personen erfinden (die Crew-Namen sind Platzhalter und bleiben es).
- Erscheint ein Nutzungslimit (`session limit`, HTTP 429): den laufenden Punkt
  zurückrollen, sauber beenden, im Log `abgebrochen: Limit` vermerken, pushen.
  Lieber ein Punkt weniger als ein halber.
- Im Log steht, was du **gemessen** hast, mit Zahl. Was du nur gelesen oder angenommen
  hast, ist so markiert. Ein „grün" gilt nur für das, was du tatsächlich gemessen hast.
