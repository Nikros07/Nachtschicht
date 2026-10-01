# Wie NACHTSCHICHT gebaut ist

Diese Datei ist die Karte. Wer etwas ändern will, findet hier, **wo** es
steht — und was man dabei wissen muss.

## Grundregeln

1. **Kein Build, keine Abhängigkeiten.** Doppelklick auf `index.html` muss
   reichen. Deshalb klassische `<script src>`-Tags und **keine ES-Module**:
   Module sind bei `file://` vom Browser blockiert.
2. **Alles, woran man dreht, steht oben.** Jedes Level beginnt mit einem
   `TUNE`-Block. Feste Zahlen in der Spiellogik sind ein Fehler.
3. **Kommentare erklären das Warum**, nicht das Was. Was der Code tut, steht
   im Code.
4. **Deutsch.** Namen, Kommentare, Texte.

## Die Seiten

| Datei | Was |
|:--|:--|
| `index.html` | Level 1 — Die Schule. Gleichzeitig der Anfang der Nacht: setzt den Speicherstand zurück. |
| `level2.html` … `level8.html` | Level 2 bis 8 |
| `karte.html` | Die Stadtkarte zwischen den Leveln, `?nach=N` |
| `runner.html` | Bonus-Level, nicht Teil der Nacht |

Jede Seite hat dasselbe Gehäuse: `#cab` → `#marquee`, `#screen` (mit
`<canvas id="c">` und `#crt`), `#fs`, `#levelbar`, `#base`.
Das Aussehen steht **einmal** in `nacht/stil.css`; gefärbt wird über zwei
Variablen (`--raum`, `--glanz`).

## Die Engine (`nacht/`)

Reihenfolge der Script-Tags ist die Ladereihenfolge — `kern.js` zuerst.

| Datei | Verantwortung |
|:--|:--|
| `kern.js` | Canvas, Skalierung, Vollbild, `keys`, Spielschleife. Legt `cv`, `ctx`, `W`, `H`, `IS_TOUCH` an. |
| `bild.js` | 3×5-Bitmap-Font, Sprite-Cache, `text*`, `sprite`, `outline`, `verlauf`, `gehBeine` |
| `ton.js` | Audio-Grundlagen: `AC`, `muted`, `piep`, `glissando`, `rauschen`. SFX und Musik bleiben im Level. |
| `stand.js` | Crew, Pegel, Bestzeiten, **Schwierigkeit** |
| `welt.js` | **Tiefe** (dritte Achse), Sichtkegel, Zeichenreihenfolge, Laufanimation |
| `nacht.js` | Der Speicherstand der Nacht: Werte, Beziehungen, Inventar, Flags, Kapitel |
| `dialog.js` | Gesprächsbäume mit Bedingungen, Wirkungen, Zeitdruck |
| `kampf.js` | Nahkampf: Zustandsautomat, Konter, Blocken, Ausdauer, Rolle, Gegner-KI |
| `eingabe.js` | Die Tasten, die überall dasselbe tun |
| `lehre.js` | Das Zwischenbild vor jedem Level: neue Steuerung zum Ausprobieren, Tabelle `LEKTIONEN` |
| `mobil.js` | Die Handy-Fassung: schwebender Stick links, Hauptknopf mit Bogen und Tippfläche rechts, Menü mit Einstellungen, Gesprächsflächen |
| `handy.js` | Das Handy im Spiel: Nachrichten und Antworten |

## Die vier zentralen Tabellen

Wer Verhalten ändern will, ändert meistens **eine Zeile in einer dieser
Tabellen** — nicht neun Stellen in neun Leveln.

| Was | Wo |
|:--|:--|
| Welches Level Tiefe hat | `TIEFE_PRO_SEITE` in `nacht/welt.js` |
| Schwierigkeitsgrade | `SCHWIERIGKEITEN` in `nacht/stand.js` |
| Wann welche Handy-Nachricht kommt | `HANDY_DREHBUCH` in `nacht/handy.js` |
| Startwerte der Nacht | `STAND_VORLAGE` in `nacht/nacht.js` |

### Tiefe an- und abschalten

```js
const TIEFE_PRO_SEITE={
  'index.html':  false,    // flach
  'level3.html': 'kampf',  // flach, Tiefe nur im Kampf
  'level4.html': true,     // immer Tiefe
};
```

`false` heißt: **keine** Abfrage im Spiel fragt nach der Tiefe. `tWelt()`
liefert 0, `tiefeNah()` ist immer wahr, `bodenY()` gibt die Bodenlinie.
Level mit `'kampf'` schalten selbst um: `setzeTiefe(true)` beim Start des
Kampfes, `setzeTiefe(false)` am Ende.

## Wie man typische Dinge macht

**Ein Gespräch hinzufügen** — ein Baum ist reine Daten:

```js
const BAUM={
  start:{ wer:'WER', text:'Was er sagt.',
    wahl:[
      { txt:'Antwort',  wenn:{mut:40}, tu:{ruf:+3}, geh:'weiter' },
      { txt:'Andere',   geh:'@ende' },
    ], zeit:8, standard:1 },
  weiter:{ wer:'WER', text:'...', geh:'@ende' },
};
starteGespraech(BAUM,'start',ende=>{ /* ende ist der Knotenname, z.B. '@ende' */ });
```

Bedingungen (`wenn`) und Wirkungen (`tu`) stehen in `nacht/nacht.js`:
`{mut:40}` heißt mindestens 40, `{geld:-5}` höchstens 5, dazu `crew`,
`hat`, `flag`, `nichtFlag`, `mag`.

**Eine Handy-Nachricht hinzufügen:** einen Eintrag in `HANDY_DREHBUCH`.
`ab` ist die Levelnummer, ab der sie kommen kann.

**Eine Taste hinzufügen, die überall gilt:** `nacht/eingabe.js`.

**Eine Lektion ändern oder hinzufügen:** ein Eintrag in `LEKTIONEN` in `nacht/lehre.js`. Sie erscheint beim ersten Mal je Level, sobald das Intro beginnt (`?lektion=1` erzwingt, `?lektion=0` schaltet ab). Am Handy zeigt das Bedienfeld während der Lektion genau die Knöpfe ihrer Schritte.

**Ein Level pausieren lassen:** das Level definiert `pauseTaste()`.

**Knopf-Aufschriften am Handy:** das Level definiert `mobilKontext()` und
gibt `{aktion, zwei, block, extras}` zurück.

## Fallgruben

- **`S.t` ist in den Leveln die Spielzeit, `e.t` in der Engine die Tiefe.**
  `bewegeTiefe(S,…)` schreibt auf `S.t` und überschreibt damit die Uhr.
  Der Fehler ist still: nichts stürzt ab, alles wirkt nur zäh.
- **Die Schrift kann nur** `A-Z 0-9 . : - ! ? / + , < > * %`. Keine Umlaute
  auf dem Bild — `ae/oe/ue/ss` ausschreiben. Im Handy-Bedienfeld (HTML)
  gehen Umlaute.
- **Nach jeder Änderung in `nacht/`: `python tools/version.py`.** Sonst
  liefert der Browser die alte Engine zum neuen Level.
- **Flags, die nur für einen Versuch gelten**, müssen beim Levelstart
  zurückgesetzt werden — sonst wirkt eine Entscheidung aus dem letzten
  Durchlauf nach.

## Testen

```bash
node tools/pruefe.js      # jede Seite gegen ihre Engine: Syntax, Doppelnamen
node test/kampf.test.js   # 22 Prüfungen der Kampflogik, ohne Browser
python tools/version.py   # Engine-Version neu setzen
node tools/flagcheck.js   # Entscheidungen der Nacht: gesetzt und nie gelesen?
node tools/nachttest.js   # jede Seite ohne Browser durchspielen (--kurz: 20 s statt 60 s)
```

`nachttest.js` setzt Engine und Level in einer Funktion zusammen; `document`,
Canvas und Speicher sind Attrappen. Es prüft Ausnahmen, NaN, tote Gesprächsverweise,
Zeichen außerhalb der Schrift, einen 5-Minuten-Nichtstun-Lauf je Level und den Konter
in Level 2. **Pixel, Ton und Layout kann es nicht** — das bleibt dem Browser.

Im Browser: `python -m http.server 5173`. Für Messungen lässt sich das
Spiel ohne Bildschirm takten — `update(1/60)` in einer Schleife aufrufen
und danach Werte auslesen. So sind alle Balance-Zahlen im Projekt
entstanden.

## Die Nachtroutine

Eine Routine in der Cloud (claude.ai → Routinen), die nachts unbeaufsichtigt läuft:
erst testen, dann die Liste abarbeiten. Sie arbeitet auf dem Branch `claude/nacht`;
`main` fasst sie nie an. Sie hat kein Gedächtnis an die Tagessitzung — alles, was sie
weiß, steht in diesen Dateien:

| Datei | Wer schreibt | Inhalt |
|:--|:--|:--|
| `routinen/nacht.md` | von Hand | der Ablauf, den die Routine befolgt |
| `NACHT-TODO.md` | Skill `todo-notieren` am Ende jeder Aufgabe, die Routine | die Warteschlange: Offen (P1–P3), Entscheidung nötig, Erledigt, Blockiert |
| `NACHT-BERICHT.md` | die Routine | Testbericht der Nacht, wird überschrieben |
| `NACHT-LOG.md` | die Routine | Protokoll, angehängt — morgens hier lesen |

- Gepusht wird **nur auf `claude/nacht`**. Übernehmen: ansehen, mergen. Verwerfen: Branch
  löschen. Einzelnes zurücknehmen: `git revert`.
- Der Abschnitt „Entscheidung nötig" ist für sie tabu.
- Der Skill liegt in `.claude/skills/todo-notieren/`; `CLAUDE.md` verlangt, ihn am Ende
  jeder Aufgabe aufzurufen.
- Läuft in der Cloud, unabhängig davon, ob der Rechner oder die App an ist.
- Einrichtung und der einzutragende Prompt: `routinen/README.md`.
