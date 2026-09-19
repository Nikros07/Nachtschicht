# Weitermachen

Diese Datei ist die Übergabe. Wenn Du "continue" sagst, liest Claude hier
nach, wo es stand, und macht genau dort weiter.

**Stand:** Phase 0–5 gebaut. Alle acht Level, Stadtkarte, Handy, Schwierigkeitsgrade, neun Enden.
**Zuletzt aktualisiert:** 2026-09-17

---

## Wo wir stehen

Der große Plan steht in [PLAN.md](PLAN.md) — was gebaut wird und warum.

| Phase | Was | Stand |
|:--|:--|:--|
| 0 | Gemeinsame Engine statt neunfacher Kopie | ✅ fertig |
| 1 | Tiefe, Gespräche, Werte, Speicherstand | ✅ fertig |
| 2 | Kampfsystem + die zwei Kämpfe | ✅ fertig |
| 3 | Level 1–8 ausbauen, chronologisch | 🔧 läuft, Level 1 dran |
| 4 | Stadtkarte, Handy, Verzweigungen, Enden | ⬜ offen |
| 5 | Nebenaufgaben, Balancing, Schwierigkeitsgrade | ⬜ offen |

## Die Engine (`nacht/`)

| Datei | Inhalt |
|:--|:--|
| `kern.js` | Canvas, Skalierung, Vollbild, Eingabe-Helfer, Schleife. **Muss zuerst geladen werden.** |
| `bild.js` | 3x5-Bitmap-Font, Sprite-Cache, Text, Verläufe |
| `ton.js` | Audio-Grundlagen. SFX und Musik bleiben im Level |
| `stand.js` | Crew, Pegel, Bestzeiten (die alten Schlüssel) |
| `nacht.js` | Werte, Beziehungen, Inventar, Flags, Kapitel |
| `dialog.js` | Gesprächsbäume mit Bedingungen, Wirkungen, Zeitdruck |
| `welt.js` | Tiefenachse, Tiefensortierung, Abstand, Sichtkegel |
| `kampf.js` | Nahkampf, Konter, Blocken, Ausdauer, Ausweichrolle, Gegner-KI |

**Wichtig:** klassische Scripts, keine ES-Module — sonst funktioniert
Doppelklick auf `index.html` nicht mehr (`file://` blockiert Module).
Deshalb globale Namen: `W`, `H`, `ctx`, `text()`, `sprite()` gelten überall.

## Regeln, die beim Weiterbauen gelten

- **Schrift kann nur** `A-Z 0-9 . : - ! ? / + , < > * %` — keine Umlaute im
  Bild, ae/oe/ue/ss ausschreiben. Sonst erscheinen Fragezeichen.
- **Jede Tastatur-Aktion braucht einen Touch-Knopf** mit Druck *und*
  Loslassen. In index.html fehlte mal der Runter-Knopf — das war ein
  kompletter Softlock am Handy.
- **Alle Regler in den TUNE-Block** oben in der Datei, keine festen Zahlen
  in der Spiellogik.
- Nach jeder Änderung im Browser prüfen: Konsole leer, Level erreicht
  seinen Spielzustand.
- **Vorsicht bei `bewegeTiefe(obj, …)`:** die Funktion schreibt auf `obj.t`.
  In Level 1 ist `S.t` die *Spielzeit* — der Aufruf mit `S` hat dort jeden
  Frame die Uhr überschrieben und alle Animationen eingefroren. Entweder ein
  eigenes Objekt übergeben (wie die Kämpfer in Level 4 und 8) oder die drei
  Zeilen ausschreiben. Der Fehler ist still: nichts stürzt ab, es wirkt nur
  alles seltsam zäh.

- **Nach jeder Änderung in `nacht/*.js`: `python tools/version.py`.** Die
  Engine-Dateien hängen mit `?v=…` im Level. Ohne neue Nummer liefert der
  Browser (und GitHub Pages bis zu 10 Minuten lang) die alte Engine zum
  neuen Level — beim Testen stürzte `update()` mit „tempo2D is not defined“ ab.
- **Laufanimation immer aus der echten Bewegung:** `tempo2D(vx,vt)` für die
  Spielfigur, `laufBild(k)` + `gehBeine(rows,bild)` für Kämpfer. Nur `vx`
  zu prüfen heißt: wer in die Tiefe läuft, gleitet mit steifen Beinen.

## Was schon umgebaut ist

- **Level 5 (Club)** ist das Herzstück: fünf Bereiche mit Tiefe, Stroboskop
  nur auf der Tanzfläche. Drei Gesprächsbäume mit eigenen Persönlichkeiten
  (Mia, Sophie, Kira), freigeschaltet über Mut, Ruf, Geld, Pegel, Crew und
  Flags aus früheren Leveln. Tanzen ist das alte Timing-Minispiel. Bei Erfolg
  die Ecke (erzählt, abgeblendet). Abfuhren kosten Ruf. Marvin, der Rivale,
  schnappt einem Leute weg und stellt einen nach einem Erfolg, danach die
  kleine Schlägerei und der Rausschmiss. Bäume nachgemessen: ein Ja kommt bei
  etwa 5–15 % der möglichen Gesprächswege heraus, betrunken hat man bei Kira
  keine Chance.
- **Level 8 (Heimweg)**: vor dem großen Fight ein Gespräch. Der Anführer
  ist MARVIN, wenn man ihn im Club gesehen hat, und er erinnert sich (Sieg,
  Kneifen, Rückzug). Seltener Weg ohne Kampf ab Mut 60 und Ruf 65.
  `angstZugegeben` aus dem Traum ergibt ein Leben mehr, `taxiTipp` macht sein
  Ausholen 15 % lesbarer. **Neun Enden**: Heim/Weiterziehen/Sonnenaufgang ×
  Sieg/Niederlage/Frieden, dazu Zeilen aus der ganzen Nacht. `NACHT.gesehen`
  zählt sie und überlebt den Neustart.
- **Neuanfang**: Level 1 setzt beim Start die Nacht zurück
  (`nachtZuruecksetzen`, gesehene Enden bleiben). Vorher schleppte ein zweiter
  Durchlauf alles aus dem ersten mit.
- **Level 7 (Späti)**: Geld zählt (Wasser 2 €, Snack 3 €). Wer pleite ist,
  sammelt Pfand im Wettrennen gegen Heinz. Nachtmenschen mit Gesprächen:
  Herr Özdemir, Taxifahrer (`taxiTipp` fürs Finale), Nele (Handy aus Level 1
  hilft), Tobi (geht in die Crew). Crew mit Beziehung ≤ −5 ist heim und fliegt
  per `entferneCrew` aus der Liste. Entscheidung am Ende: `endeHeim`,
  `endeWeiter` oder `endeSonne`.
- **Level 6 (Afterhour)**: Erschöpfung als Gegner (Kondition fällt, Sofas
  helfen, bei null wegknicken und am Sofa aufwachen, Wert geht an Level 7/8).
  Traumlogik: Raum 101 wiederholt sich, bis die Chemie-Erinnerung gefunden
  ist. Eine Tür „RAUS“ lügt. Echos der Nacht: Moritz, das Mädchen aus dem
  Club (oder die Abfuhr oder niemand) und Marvin. Antworten setzen Flags fürs
  Ende (`versprochen_*`, `angstZugegeben`, `traumMoritz`). Lea verrät, dass
  man auf dem Sofa der Afterhour weggeknickt ist.
- **Level 3 (Nachtbus)**: drei Waggons, Sitzblöcke, Kontrolleure verfolgen,
  Fahrgäste mit Gesprächen, Ticketautomat, Notbremse, erste Kloppe.

- **Level 2 (Bei Moritz)** hat Tiefe (Reden geht nur, wenn man auch hingeht)
  und am Ende die Entscheidung, wen man mitnimmt. Die Wahl setzt Crew, Flags
  und Beziehungen — und wirkt messbar weiter: Level 4 braucht je nach
  Gruppengröße 6, 5 oder 4 Treffer, Level 8 bekommt dafür mehr Hilfe im
  großen Fight.
- **Level 1 (Die Schule)** hat Tiefe: Lehrer sehen in einem Kegel in der
  Fläche, wer weit genug vorne läuft kommt vorbei. Türen und Spinde liegen
  an der Rückwand. Dazu das eingezogene Handy als zweites, freiwilliges Ziel
  und ein Gespräch mit dem Hausmeister, das einen zweiten Lösungsweg öffnet.
- **Level 4 (Türsteher)** läuft komplett auf dem neuen Kampfsystem: Bewegung
  in der Fläche, Blocken, Ausdauer, Ausweichrolle, Rammstoß (unblockbar) und
  drei Phasen.
- **Level 8 (Heimweg)** hat den großen Fight davor: drei Phasen mit
  wechselnder Arena (Straße → Hinterhof → Baustelle), Handlanger ab Phase 2,
  Würfe ab Phase 3, Crew mischt sich ein. Verlieren beendet das Spiel nicht,
  es macht den Heimweg härter.

## Nächster Schritt

Phase 3, 4 und 5 sind gebaut:

- [x] **Schwierigkeitsgrade** – `stand.js` (`schwer()`), gewählt auf dem
      Titelbild von Level 1. Wirkt zentral in `kampf.js` (Gegner-Uhr, Leben),
      `dialog.js` (Bedenkzeit), Level 1/3 (Verdacht), Level 6 (Erschöpfung).
- [x] **Handy** – `nacht/handy.js`. Drehbuch `HANDY_DREHBUCH`, Taste T oder
      Knopf HANDY, Spiel pausiert solange offen. Antworten setzen Flags, Level 8
      erzählt davon (Mama).
- [x] **Stadtkarte** – `karte.html?nach=N` zwischen allen Leveln, mit einem
      Umweg (Nebenaufgabe) pro Wegstück. Umwege kosten Licht in Level 8.
- [x] **Level 1** – Lehrer-Routinen, Keller mit Sicherung, Ferdis Spind mit
      Code, Direktor am Ausgang.
- [x] **runner.html** läuft auf der gemeinsamen Engine, mit Handy-Fassung,
      feste Breite 320 bleibt.

Noch offen:

- [ ] Mehr Mädels- und Crew-Sprites mit echten Gesichtern (braucht Nick)

Offen aus Level 1, wenn Zeit ist:

- [ ] Lehrer-Routinen: Kaffee holen, Klo, Kopierer statt nur Patrouille
- [ ] Keller als vierte Ebene
- [ ] Spind mit Zahlencode, die Nummer steht woanders
- [ ] Optionale Abrechnung mit dem Direktor am Ausgang (Gespräch statt
      fester Cutscene)
- [ ] Mehr Möbelarten, damit sich die zehn Räume unterscheiden

Danach **Level 2 (Bei Moritz)**: Wohnung mit Tiefe, mehr Leute mit eigenen
Gesprächsbäumen, Trinkspiele, und die Entscheidung wen man mitnimmt.

**Level 5 (Club)** ist der wichtigste Brocken — dort gehört Nicks
Hauptwunsch hin: das Ansprechen als echter Entscheidungsbaum, dazu die
kleine Schlägerei aus Phase 2 (die ist bewusst noch nicht gebaut, damit die
Datei nicht zweimal angefasst wird).

- **Neue Seiten** (`karte.html`, `runner.html`) stehen in `tools/pruefe.js`
  und `tools/version.py` – wer eine Seite ergänzt, trägt sie dort ein.

## Testen

```bash
node tools/pruefe.js      # alle Level gegen die Engine, ohne Browser
node test/kampf.test.js   # 22 Prüfungen der Kampflogik
```

Im Browser: `python -m http.server 5173`, dann die Level einzeln aufmachen.
**Achtung:** der Server schickt keine Cache-Header — beim Testen von
Änderungen einen Parameter anhängen (`level8.html?v=2`), sonst liefert der
Browser die alte Datei. Das hat mich schon eine Fehlersuche gekostet.

## Offen, braucht Dich

- Echte Namen und Pixel-Köpfe der Jungs. Aktuell Platzhalter: Jonas,
  Dennis, Semih, Lea (dazu Max Ferdi und Moritz aus den alten Leveln).
