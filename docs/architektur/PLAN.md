# Architektur-Plan (Stand 03.11.2026)

Gesamtbild, Schwachstellen und was als Nächstes umgebaut werden sollte – mit dem Ziel, dass
künftige Sitzungen (Menschen und KI) **schneller und sicherer** ändern können. Was risikoarm
war, ist am 03.11. schon umgesetzt (Abschnitt 5). Große Umbauten stehen nur als Plan da
(Abschnitt 6) und brauchen einen Browser-Durchlauf.

Die Karte des heutigen Codes bleibt `ARCHITEKTUR.md`. Diese Datei ist der Blick nach vorn.

## 1. Gesamtbild in Zahlen

| Teil | Umfang | Bemerkung |
|:--|:--|:--|
| 10 Seiten (`index.html`, `level2-8.html`, `karte.html`, `runner.html`) | 15 069 Zeilen | je ein großes Inline-`<script>`; `index.html` 2 387 Zeilen, `level5.html` 2 131 |
| Engine `nacht/` | 26 Dateien, 6 741 Zeilen | klassische Skripte, alles global |
| Tests `test/` | 19 Dateien | ohne Framework, laufen in Attrappen (`vm`, Proxys) |
| Messskripte `docs/gameplay/messung/` | 56 Dateien | Wegwerf-Bots und Szenarien über `tools/nachttest.js` |
| Werkzeuge `tools/` | 12 aktiv, 28 alt | alt = erledigte Umbau-Skripte, jetzt in `tools/alt/` |

## 2. Modulgrenzen

Drei Schichten, von unten nach oben. Eine Datei darf nur benutzen, was **vor ihr** geladen ist.

1. **Gerät und Grundlagen** – `kern` (Canvas, Schleife, `keys`), `geraet` (Fehlerschutz, SW,
   Sichtbarkeit), `bild` (Schrift, Sprites), `hud`, `ton`, `komfort` (`FX`, Flackerschutz).
   Keine Spiellogik, keine Kenntnis von Leveln.
2. **Spielsysteme** – `musik`/`songs`, `saft`, `stand`, `welt` (Tiefe), `nacht` (Speicherstand,
   Flags, Werte), `dialog`, `kampf`, `eingabe`, `lehre`, `mobil`, `handy`, `texte`, `erzaehl`,
   `hilfe`, `erfolge`, `epilog`, `wertung`. Reden über **Haken**, die das Level definiert
   (`mobilKontext()`, `pauseTaste()`, `erzaehlTakt()` …), und über Tabellen.
3. **Hüllen** – `menue` (Startmenü), `pause` (Esc-Menü). Fragen den Zustand ab, steuern ihn
   aber nur über `S.modus` und Neuladen.

Gut: Abhängigkeiten nach oben gehen nur über `typeof X!=='undefined'` oder Meldelisten
(`GERAET.beiSichtbar`). Dadurch stürzt nichts, wenn eine Seite eine Datei weglässt.

Schwach: Es gibt keinen Vertrag, welche Haken ein Level anbieten **muss**. Er steckt verstreut
in den Engine-Dateien. Siehe 6.2.

## 3. Ladereihenfolge

Die eine gültige Reihenfolge steht seit heute als `REIHENFOLGE` in `tools/pruefe.js` und wird
für jede Seite geprüft (weglassen erlaubt, vertauschen nicht). Begründete Ausnahmen stehen dort
mit Grund in `AUSNAHMEN`:

- `runner.html` lädt `menue` vor `hilfe`/`erfolge` (alt, harmlos – `menue` greift nur zur Laufzeit zu).
- `level4.html` und `level8.html` laden `kampf` direkt nach `welt` (harmlos – `kampf.js` benutzt
  weder `nacht` noch `dialog`).

Neue Engine-Datei: `python tools/engine_einbinden.py NAME --nach VORGAENGER`, dann den Namen in
`REIHENFOLGE` eintragen – sonst meldet `pruefe.js` einen Fehler.

## 4. Datenflüsse

```
Tasten/Touch ─► kern.keys ◄─ mobil (Knöpfe senden dieselben Codes)
                   │
bild() je Frame:  MENUE.laufe ─► LEHRE.pruefe ─► PAUSE.aktiv ─► Level.update(dt)
                   │                                    ▲
                   │         SAFT.takt(dt) liefert die Spielzeit (Hitstop, Zeitlupe)
                   ▼
Level.update ─► S (Levelzustand, flüchtig)  ─► Level.draw ─► SAFT/WERTUNG zeichnen darüber
          └──► NACHT (Speicherstand: Werte, Flags, Beziehungen, Kapitel) ─► localStorage
                    ▲  dialog.tu / wenn  ·  erzaehl/epilog lesen  ·  menue liest gesehen/momenteBest
Level-Ende ─► WERTUNG.abschluss(level,punkte) ─► Bestrang (localStorage) ─► karte.html?nach=N
Sichtbarkeit: geraet (visibilitychange) ─► GERAET.beiSichtbar ─► PAUSE.auf (je Wechsel einmal)
Stempel:  tools/version.py ─► ?v= in allen Seiten, BUILD/INHALT/PRECACHE in sw.js, GERAET.build
```

Zwei Speicherwelten, die man nicht mischen darf: **Flags** gelten für einen Durchgang (NEUE NACHT
löscht sie), **Dauerhaftes** (`NACHT.gesehen`, `momenteBest`, `knotenBest`, Bestränge, Erfolge)
überlebt. Alles liegt unter Schlüsseln `nachtschicht.*`.

## 5. Heute umgesetzt (risikoarm)

| Was | Wirkung für künftige Sitzungen |
|:--|:--|
| `tools/pruefliste.js` | **Ein** Befehl statt 22; parallel, ~18 s; nimmt jeden `test/*.test.js` automatisch mit (vorher fehlten `ruf`/`erfolge` in der Liste in CLAUDE.md). `--ohne-stempel` für ungestempelte Worktrees, `--kurz`. |
| `tools/nachttest.js` parallel | voller Lauf 48 s → ~26 s (4 Kerne); `--zeit` zeigt die Dauer je Seite, `--seriell` den alten Ablauf. |
| Ladereihenfolge in `pruefe.js` | Vertauschte Script-Tags fallen sofort auf. |
| `tools/alt/` | 28 erledigte Umbau-Skripte aus dem Blickfeld; `tools/` zeigt nur noch, was man benutzt. `level5_baeume.js` (Zweitkopie) gelöscht. |
| `.gitignore` `__pycache__/` | Agents committen keine `.pyc` mehr aus Versehen. |
| CLAUDE.md / ARCHITEKTUR.md | Prüfliste verweist auf `pruefliste.js`; `erfolge.js` in der Engine-Tabelle; neue Karte „Wo ändere ich was?“. |
| `n3-*`-Messskripte | Rang-Bots für Level 3/4/5/7/8, Pause-Ablauf, Handy-Layout als reine Rechnung (`rechneAnordnung` in `mobil.js`). |
| Headless-Chromium-Prüfung | Diese Umgebung hat Chromium + Playwright; damit lassen sich Screenshots und DOM-Rechtecke messen (Ergebnisse im Bericht vom 03.11.). Nicht dasselbe wie ein echtes Gerät. |

## 6. Größere Umbauten – nur Plan

Reihenfolge nach Nutzen pro Risiko. Jeder Schritt einzeln, mit vollem Nachttest und
Browser-Durchlauf.

### 6.1 Messhilfe als gemeinsame Bibliothek (klein, sicher)
Fast jedes der 56 Messskripte baut dieselben Helfer neu: `bild(n)`, Aufruf-Mitschreiber
(`SAFT.treffer`, `MUSIK.stinger`, `WERTUNG.abschluss`), „Titel verlassen, Intro überspringen“,
Zufallstasten mit Seed. → `tools/messhilfe.js` mit `starteLevel(seite,opt)`, `takte(n)`,
`schreibMit(obj,name)`, `rangAbfangen()`, `zufallsTasten(seed)`. Neue Skripte werden dann
10–20 statt 60–100 Zeilen. **Fertig wenn:** drei n3-Skripte darauf umgestellt, Ausgabe gleich.

### 6.2 Level-Vertrag ausdrücklich machen (klein)
Eine Tabelle in ARCHITEKTUR.md plus eine Prüfung in `nachttest.js`: welche globalen Namen ein
Level bereitstellen muss oder darf (`S`, `TUNE`, `update`, `draw`, `starte`, `neuesSpiel`,
`mobilKontext`, `pauseTaste`, `PLAUSCH_ZEILEN`, `S.modus`-Werte `titel/intro/spiel/ende`).
Heute erfährt man das nur durch Lesen von `kern`, `pause`, `mobil`, `hilfe`.
**Fertig wenn:** `nachttest` meldet je Seite fehlende Pflicht-Haken.

### 6.3 Gewinn-Bots für jedes Level (mittel)
Zufallstasten gewinnen Level 1, 2, 3 und 6 nie (gemessen 03.11.). Rang-Grenzen sind deshalb
dort nur per Szenario geprüft. Ein Bot je Level, der das Level **gewinnt** (aus den
s2/b/c-Skripten zusammengeführt), macht Balance-Änderungen messbar und wäre ein starker
Regressionstest („Level ist noch gewinnbar“). **Fertig wenn:** `nachttest --bots` gewinnt jedes
Level und meldet Zeit, Punkte, Rang.

### 6.4 Große Seiten aufteilen (groß, nur mit Browser)
`index.html` (2 387 Zeilen) und `level5.html` (2 131) sind für eine KI-Sitzung zu groß, um sie
am Stück zu lesen. Vorschlag ohne Build und ohne Module: je Level ein Ordner `levelN/` mit
`tune.js`, `daten.js` (Bäume, Plausch, Sprites), `logik.js`, `zeichnen.js`, eingebunden als
klassische `<script src>` nach der Engine. `pruefe.js`, `nachttest.js` (`lade()`), `version.py`
(Stempel, PRECACHE), `launchcheck.js` und `tools/www.py` müssen die neuen Dateien kennen.
Zuerst an **einem** kleinen Level (Level 4, 1 091 Zeilen) erproben.
**Risiko:** Stempel/Offline-Liste, Reihenfolge, doppelte Namen über Dateigrenzen.
**Fertig wenn:** Level 4 läuft aus vier Dateien, alle Prüfungen grün, Browser-Durchlauf ok.

### 6.5 Globale Namen bündeln (mittel, schrittweise)
`mobil.js` legt 59 globale Namen an, `epilog`/`erzaehl`/`kampf`/`nacht` je 24. Kollisionen mit
Level-Namen fängt `pruefe.js` zwar ab, aber jede neue Funktion im Level kann eine Engine-Funktion
still überschreiben, wenn sie nach ihr geladen wird. Ziel: jede Engine-Datei hängt alles an
**ein** Objekt (`MOBIL`, `KAMPF` …), wie es `pause`, `wertung`, `saft` schon tun. Alte Namen als
Weiterleitung behalten, bis kein Level sie mehr ruft.

### 6.6 Stempel-Konflikte zwischen Branches (Ablauf, kein Code)
`version.py` ändert bei jedem Lauf alle zehn Seiten (`?v=`). Zwei Branches (z. B. `claude/nacht`
und `claude/gameplay`) kollidieren deshalb bei jedem Merge in allen Seiten. Regel: der Stempel ist
**immer ein eigener, letzter Commit** („Stempel …“); beim Merge Konflikte in `?v=`-Zeilen
ignorieren (eine Seite nehmen) und danach neu stempeln. Optional: `tools/version.py --nach-merge`,
das genau das tut.

### 6.7 Doku verschlanken
Im Wurzelordner liegen 13 Markdown-Dateien, darunter veraltete (`TODO.md` vom 17.9., `PLAN.md`
aus der Engine-Planung, `WEITER.md`). `NACHT-TODO.md` hat 943 Zeilen, davon ~470 „Erledigt“.
Vorschlag: `docs/archiv/` für Abgeschlossenes (alte Erledigt-Einträge, alter Plan), im Wurzelordner
nur noch README, CLAUDE, ARCHITEKTUR, CHANGELOG, LAUNCH, NACHT-TODO, NACHT-LOG, PLAYTEST.
Achtung: Routine und Skill `todo-notieren` erwarten die Abschnitte in `NACHT-TODO.md` – Überschriften
bleiben, nur alte Einträge wandern.

## 7. Schwachstellen (Stand heute)

| Schwachstelle | Folge | Gegenmittel |
|:--|:--|:--|
| Keine echte Gerätprüfung | Touch, Ton, iPad-Leiste, Schärfe nur gerechnet oder emuliert | Liste unter „Entscheidung nötig“ – nur Nick kann am Telefon prüfen |
| Rang-Zeitkriterien in Level 4/5/7/8 trennen kaum | Bots holen immer volle Zeitpunkte; Grenzen gegen Menschen ungeprüft | echte Spielzeiten sammeln (Playtest), dann Grenzen setzen |
| Level 8: S praktisch unerreichbar | Licht bei Ankunft bleibt ~56 % → höchstens 82 Punkte | Entscheidung, ob S erreichbar sein soll |
| Große Inline-Skripte | KI-Sitzungen lesen in Ausschnitten, übersehen Zusammenhänge | 6.4 |
| Messskripte duplizieren Helfer | jedes neue Skript kostet 60–100 Zeilen | 6.1 |
| Stempel in allen Seiten | Merge-Konflikte zwischen Branches | 6.6 |

## 8. Wie eine Sitzung am schnellsten sicher arbeitet

1. `CLAUDE.md`, dann in `ARCHITEKTUR.md` die Karte „Wo ändere ich was?“.
2. Im Level nur den `TUNE`-Block und die genannte Funktion lesen (`grep -n "function name"`),
   nicht die ganze Seite.
3. Messen mit `tools/nachttest.js` (`lade()`), Skript nach `docs/gameplay/messung/`.
4. `python tools/version.py`, dann `node tools/pruefliste.js` – muss „alle … grün“ sagen.
5. Mehrere Agents parallel: je einer eigenen Worktree und eigene Dateien; Stempel setzt nur der
   Hauptprozess am Ende (`node tools/pruefliste.js --ohne-stempel` in den Worktrees).
