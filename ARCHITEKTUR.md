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
| `index.html` | Level 1 — Die Schule. Zeigt zuerst das **Startmenü** (`menue.js`); NEUE NACHT setzt den Speicherstand zurück. |
| `level2.html` … `level8.html` | Bei Moritz, Der Nachtbus, Die Schlange, Club, Afterhour, Späti, Heimweg (Level 8 hat Finale, Abspann und Enden) |
| `karte.html` | Die Stadtkarte zwischen den Leveln, `?nach=N` (setzt dabei das Kapitel) |
| `runner.html` | Bonus-Level, nicht Teil der Nacht |
| `ueber.html` | Über das Spiel: Steuerung, Hinweise (Alkohol, Flackern), Datenschutz, Impressum, Credits, „Spielstand löschen“ |
| `404.html` | „Diese Tür ist zu“ — Seite für Adressen, die es nicht gibt |
| `sw.js` | Service Worker: Offline und Installieren (siehe unten) |
| `manifest.webmanifest` | App-Daten: Name, Symbole, Vollbild, Querformat, `start_url` `./index.html?app=1` |
| `icons/` | Symbole und Link-Vorschau (`og.png`), erzeugt von `tools/icons.py` |

Jede Seite hat dasselbe Gehäuse: `#cab` → `#marquee`, `#screen` (mit
`<canvas id="c">` und `#crt`), `#fs`, `#levelbar`, `#base`.
Das Aussehen steht **einmal** in `nacht/stil.css`; gefärbt wird über zwei
Variablen (`--raum`, `--glanz`).

## Die Engine (`nacht/`)

Reihenfolge der Script-Tags ist die Ladereihenfolge — `kern.js` zuerst, danach `geraet.js`
(damit auch spätere Ladefehler gefangen werden). Die Tabelle steht in dieser Reihenfolge
(`kampf.js` nur in den Seiten mit Kampf):

`kern → geraet → bild → hud → ton → komfort → stand → welt → nacht → dialog → [kampf] → eingabe → lehre → mobil → handy → texte → erzaehl → epilog → menue`

Eine neue Engine-Datei hängt `python tools/engine_einbinden.py NAME --nach VORGAENGER` in alle
Seiten ein; sie darf nur benutzen, was vor ihr geladen wird. Danach `python tools/version.py`.

| Datei | Verantwortung |
|:--|:--|
| `kern.js` | Canvas, Skalierung, Vollbild, `keys`, Spielschleife `bild()`. Legt `cv`, `ctx`, `W`, `H`, `IS_TOUCH` an (`?touch=1` erzwingt Touch am Rechner). Fragt in jedem Bild erst `MENUE.laufe`, dann `LEHRE.pruefe`, dann erst das Level. |
| `geraet.js` | Alles fürs fertige Spiel auf fremden Geräten: Fehlerschutz mit Fehlerseite statt weißer Fläche, Toasts (`GERAET.hinweis`), Ton aus im Hintergrund, Speichertest, Service-Worker-Anmeldung samt „NEUE VERSION“-Hinweis, die Notausgänge (`?reset`, `?fehlertest`, `?sw`). Trägt `GERAET.version` und `GERAET.build`. Alles in try/catch, benutzt nur DOM und Browser-APIs, nie spätere Engine-Dateien. |
| `bild.js` | 3×5-Bitmap-Font, Sprite-Cache, `text*`, `sprite`, `outline`, `verlauf`, `gehBeine` |
| `hud.js` | Gemeinsame Anzeigen (Herzen, Balken u. ä.) |
| `ton.js` | Audio-Grundlagen: `AC`, `muted`, `piep`, `glissando`, `rauschen`. SFX und Musik bleiben im Level. |
| `komfort.js` | Einstellungen des Spielers und die Schutzschalter für Effekte: `KOMFORT` (Flackerschutz, Wackeln, Röhren-Look, Inhaltshinweis bestätigt) und `FX` (siehe unten) |
| `stand.js` | Crew, Pegel, Bestzeiten, **Schwierigkeit** |
| `welt.js` | **Tiefe** (dritte Achse), Sichtkegel, Zeichenreihenfolge, Laufanimation |
| `nacht.js` | Der Speicherstand der Nacht: Werte, Beziehungen, Inventar, Flags, Kapitel |
| `dialog.js` | Gesprächsbäume mit Bedingungen, Wirkungen, Zeitdruck |
| `kampf.js` | Nahkampf: Zustandsautomat, Konter, Blocken, Ausdauer, Rolle, Gegner-KI |
| `eingabe.js` | Die Tasten, die überall dasselbe tun |
| `lehre.js` | Das Zwischenbild vor jedem Level: neue Steuerung zum Ausprobieren, Tabelle `LEKTIONEN` |
| `mobil.js` | Die Handy-Fassung: schwebender Stick links, Hauptknopf mit Bogen und Tippfläche rechts, Menü mit Einstellungen, Gesprächsflächen |
| `handy.js` | Das Handy im Spiel: Nachrichten und Antworten |
| `texte.js` | Reine Daten: Kapitelkarten (`TEXTE_KAPITEL`), Rückblick-Zeilen (`TEXTE_BISHER`), Polaroid-Texte (`TEXTE_MOMENTE`), Menütexte (`TEXTE_MENUE`) |
| `erzaehl.js` | Was die Nacht erzählt, ohne anzuhalten: `STIMMEN` (Farbe und Ton je Sprecher), `zeichneKarte`, Kapitelkarte (`kapitelZeigen`), `PLAUSCH` (Untertitel beim Gehen), `MOMENT` (Polaroids) |
| `epilog.js` | Was nach dem Finale kommt: Epilog-Folien je Crew-Figur, Gruppenchat, Album, „Was wir nie wieder erwähnen“, Kater, die Wolle mit den drei Knoten, `ENDEN_ALLE` und `endeRegistrieren` |
| `menue.js` | Startmenü (Titel von Level 1), Einstellungen, Enden-Galerie und Momente-Sammlung (`MENUE.galerie()`), Credits |

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

## Erzählen: Kapitel, Plausch, Momente, Stimmen, Enden

Jedes Level ruft dieselben Haken aus `erzaehl.js`; die Texte liegen in `texte.js`, nicht im Level.
Fehlt ein Eintrag oder eine Datei, passiert nichts (alles in try/catch).

| Haken | Wo im Level | Wirkung |
|:--|:--|:--|
| `kapitelZeigen(N)` | beim Levelstart, in `starte()` (Level 5: `starteLevel()`) | Kapitelkarte (Uhrzeit, Ort, Zeile, bis zu zwei BISHER-Zeilen aus `TEXTE_BISHER`), 3,5 s, Tippen/E überspringt ab 0,6 s |
| `PLAUSCH.lade(PLAUSCH_ZEILEN)` | `neuesSpiel()` | setzt die Untertitel-Zeilen des Levels. `PLAUSCH.ausloeser(id)` spielt passende Zeilen sofort, `PLAUSCH.sperre=true` hält ihn an (Gespräch, Kampf), `PLAUSCH.y` setzt die Zeile frei von Hinweisen. Etwa alle 14 s eine Zeile beim Gehen. |
| `MOMENT.fund(n)`, `MOMENT.zeichneFund(x,y,n)`, `MOMENT.hat(n)` | an einer Fundstelle je Level | Polaroid Nr. n (1 bis 8) einsammeln; gemerkt in `NACHT.momenteBest` (überlebt NEUE NACHT) und im Flag `momentN` |
| `erzaehlTakt(dt)`, `erzaehlZeichne()`, `erzaehlTaste()`, `erzaehlKontext()` | erste Zeile in `update`, letzte in `draw`, in der Aktionstaste, in `mobilKontext()` | Karten halten das Level an und fangen Tasten bzw. Tippen ab |

- **Stimmen:** `STIMMEN` in `erzaehl.js` gibt jedem Sprecher Farbe und Tonhöhe (Plausch, Karten).
- **Epilog und Enden:** `level8.html` übergibt `epilog.js` nur `{weg, kampf, anfuehrer}` und bekommt Karten zurück. Es gibt **zehn Enden** (`ENDEN_ALLE`): drei Wege (HEIM, WEITERZIEHEN, SONNENAUFGANG) mal drei Kampfausgänge, dazu SCHICHTWECHSEL, wenn alle drei Knoten der roten Wolle in einem Durchgang gesetzt sind (`schluesselVersprochen`, `wirEuchAuch`, `tschuessGesagt`). Gesehene Enden und Knoten stehen in `NACHT.gesehen` und `NACHT.knotenBest`, damit sie NEUE NACHT überleben; die Galerie (`menue.js`) liest nur diese, nicht die Flags.
- Wer die Geschichte inhaltlich ändern will: erst `docs/launch/STORY-BIBEL.md` (verbindlich) und `docs/launch/flags-vertrag.md` (Flag-Namen), dann `texte.js` und `epilog.js`.

### FX und KOMFORT

Jeder Blitz, jedes Wackeln und jede Blitzfrequenz läuft durch **`FX`** (`komfort.js`), nie roh aus dem Level:
`FX.blitz(alpha)`, `FX.wackel(px)`, `FX.hz(f)` (nie mehr als drei pro Sekunde, WCAG 2.3.1), `FX.ruhig()`.
Neuer Effekt im Level: Stärke durch `FX` schicken, sonst umgeht er den Flackerschutz.
`KOMFORT` hält die Werte (`flackerschutz`, `wackeln`, `roehre`, `hinweis`) im Speicher unter
`nachtschicht.komfort`; „Bewegung reduzieren“ im System schaltet den Flackerschutz anfangs ein.

### Startmenü

`menue.js` läuft nur auf `index.html` und nur ohne `?neu=1`, `?lektion` oder `?level` in der Adresse;
bei jedem Fehler gibt es sich selbst auf (dann läuft der alte Titelbild-Weg). Einträge: NEUE NACHT,
WEITER (nur bei Fortschritt `NACHT.kapitel >= 2`), LEVEL WAEHLEN, EINSTELLUNGEN, ENDEN, UEBER;
beim ersten Start vorab der Inhaltshinweis. Tasten: Pfeile/W S + E/Enter, Esc zurück, G Enden, U Über.
Ausführlich: `docs/launch/startmenue.md`.

## Offline, Installieren, Stempel

- **`sw.js`** — Cache zuerst. Jede Fassung hat einen eigenen Speicher `nachtschicht-<BUILD>`, der
  beim Installieren komplett vorgeladen wird (Liste `PRECACHE` zwischen `// PRECACHE-START` und
  `// PRECACHE-ENDE`). Ein neuer Worker übernimmt **nicht von allein**; `geraet.js` zeigt
  „NEUE VERSION - TIPPEN ZUM LADEN“ und schickt dann `SKIP_WAITING`.
  `BUILD`, `INHALT` und `PRECACHE` schreibt `tools/version.py` — nie von Hand.
- **Stempelprüfung:** vor dem Vorladen prüft `sw.js`, ob alle `?v=`-Stempel der Seiten zu `BUILD` passen;
  sonst bricht die Installation ab und die alte, in sich stimmige Fassung bleibt. Fehlt nur ein
  Nebenfile, bricht nichts (Pflicht ist allein `index.html`).
- **`sw.js` nie löschen oder umbenennen** (siehe `LAUNCH.md`, Zurückrollen).
- `manifest.webmanifest`: Vollbild, Querformat, Symbole; `start_url` und `scope` bleiben relativ.
- Den Service Worker gibt es nur über https oder `localhost`, nicht über die WLAN-Adresse des Testservers
  (`?sw=1` schaltet ihn auf `localhost` ein, `?sw=0` aus).

### Adress-Zusätze (URL-Parameter)

| Parameter | Wirkung |
|:--|:--|
| `?reset=1` | löscht alle `nachtschicht.`-Schlüssel, den Offline-Speicher und den Service Worker, lädt dann ohne den Parameter neu |
| `?reset=cache` | wie `reset=1`, aber der Spielstand bleibt |
| `?fehlertest=N` | erzwingt N Ausnahmen in Folge im Spielbild (`1`: nichts darf sichtbar sein, `9`: die Fehlerseite muss erscheinen) |
| `?sw=1` / `?sw=0` | Service Worker auf `localhost` ein-/ausschalten (bleibt gemerkt) |
| `?neu=1` | Level 1 ohne Startmenü: der alte Titelbild-Weg mit Schwierigkeit und START |
| `?lektion=1` / `?lektion=0` | Lektion vor dem Level erzwingen / abschalten |
| `?level=1` | wie `?neu=1`: Level 1 ohne Startmenü (so springt LEVEL WAEHLEN dorthin; die anderen Level sind `levelN.html`) |
| `?nach=N` | `karte.html`: Karte nach Level N |
| `?touch=1` | Touch-Bedienung am Rechner erzwingen |
| `?app=1` | `start_url` der installierten App |

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
- **Nach jeder Änderung an Seiten (`*.html`) UND in `nacht/` (auch `stil.css`) oder an den Symbolen:
  `python tools/version.py`.** Sonst liefert der Browser die alte Engine zum neuen Level — und der
  Service Worker hält Besuchern die alte Fassung fest, bis sich der Stempel ändert. Prüfen ohne zu
  ändern: `python tools/version.py --pruefen` (Exit 1, wenn etwas ungestempelt ist). Nach einem
  Zurückrollen erzwingt `--neu` einen frischen Stempel.
- **Kapitelkarte nicht in `neuesSpiel()`.** `kapitelZeigen(N)` gehört in den Levelstart (`starte()`),
  denn `neuesSpiel()` läuft auch bei jedem Wiederholungsversuch; zusätzlich sperrt `KAPITEL.gelaufen`
  eine zweite Karte ohne Neuladen. (Der Kopfkommentar von `erzaehl.js` nennt noch `neuesSpiel()` —
  maßgeblich sind die Level.)
- **Effekte nie am `FX` vorbei** (Flackerschutz, siehe oben).
- **Der Plausch ist nur Stimmung.** Was der Spieler wissen muss, gehört in Karten, Zettel oder Gespräche.
- **Flags und Dauerhaftes trennen:** Flags gelten für einen Durchgang und werden bei NEUE NACHT gelöscht;
  was bleiben soll (Enden, Momente, Bestzeiten), liegt in `NACHT.gesehen`, `momenteBest`, `knotenBest`.
- **Flags, die nur für einen Versuch gelten**, müssen beim Levelstart
  zurückgesetzt werden — sonst wirkt eine Entscheidung aus dem letzten
  Durchlauf nach.

## Testen

```bash
node tools/pruefe.js            # alle 10 Seiten gegen ihre Engine: Syntax, Doppelnamen
node test/kampf.test.js         # 22 Prüfungen der Kampflogik
node test/erzaehl.test.js       # Kapitelauswahl, Plausch, Momente (52)
node test/epilog.test.js        # Knoten, Stempel, Kater, Enden, Epilog, Galerie-Daten (60)
node test/menue.test.js         # Startmenü: Fortschritt, Weiter-Auswahl, Einträge, Navigation (30)
node test/geraet.test.js        # geraet.js: Fehlerschutz, Fehlerseite, Toast, Service-Worker-Anmeldung, ?reset (111)
node test/sw.test.js            # sw.js in einer Attrappe: install, activate, fetch, Neuinstallation (50)
node test/launch.test.js        # Tests der Startwerkzeuge (61)
node tools/launchcheck.js       # statische Startprüfung; muss BEREIT sagen (Warnungen ansehen)
python tools/version.py --pruefen   # Stempel, Offline-Liste, Prüfsumme (nach Änderungen: ohne --pruefen)
node tools/flagcheck.js         # Entscheidungen der Nacht: gesetzt und nie gelesen?
node tools/nachttest.js         # jede Seite ohne Browser durchspielen (--kurz: 20 s statt 60 s)
```

`nachttest.js` setzt Engine und Level in einer Funktion zusammen; `document`,
Canvas und Speicher sind Attrappen. Es prüft Ausnahmen, NaN, tote Gesprächsverweise,
Zeichen außerhalb der Schrift, einen 5-Minuten-Nichtstun-Lauf je Level und den Konter
in Level 2. **Pixel, Ton und Layout kann es nicht** — das bleibt dem Browser.
Das Handy ist bisher nur in Emulation gemessen (`docs/launch/handy-abnahme.md`).

### Werkzeuge

| Werkzeug | Zweck |
|:--|:--|
| `tools/version.py` | stempelt Seiten, Engine, Stil und `sw.js` (BUILD, Prüfsumme, Offline-Liste) sowie `GERAET.build`; `--pruefen`, `--neu` |
| `tools/launchcheck.js` | statische Startprüfung: Kopfzeilen, Symbole, Manifest, Offline-Liste, Versionen (`GERAET.version` gegen `CHANGELOG.md`), fremde Adressen, Platzhalter; `--leise`, `--git` |
| `tools/paket.py` | baut `dist/nachtschicht-<version>.zip` für itch.io (vorher läuft die Startprüfung) |
| `tools/umbenennen.py` | tauscht Crew-Namen in Seiten und `nacht/*.js` aus; erst Vorschau, dann `--ja`, rückgängig mit `--zurueck` |
| `tools/server.py` | Testserver mit `Cache-Control: no-store`; `--lan` fürs Handy im WLAN |
| `tools/engine_einbinden.py` | hängt eine neue Engine-Datei in alle Seiten ein |
| `tools/icons.py` | erzeugt Symbole, Link-Vorschau und das Mond-Bild der 404-Seite (braucht Pillow) |

Im Browser: `python tools/server.py` (nicht `http.server`: der schickt keine Cache-Verbote).
Für Messungen lässt sich das Spiel ohne Bildschirm takten — `update(1/60)` in einer Schleife
aufrufen und danach Werte auslesen. So sind alle Balance-Zahlen im Projekt entstanden.

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
