# NACHTSCHICHT

*Party Game drunk.*

Ein Pixel-Art-Spiel im Browser über eine Nacht, die aus dem Ruder läuft. Jedes
Level ist eine Stufe des Abends. Kein Download, keine Installation, kein Konto.

**Jetzt spielen: [nikros07.github.io/Nachtschicht](https://nikros07.github.io/Nachtschicht/)**

> Was noch fehlt, steht in [TODO.md](TODO.md).

---

## Level 1 — Die Schule

Es ist nach Schulschluss und Du kommst nicht raus. Irgendwo im Gebäude liegt ein
Schlüssel. Die Lehrer sind noch da.

**Das Ziel:** Schlüssel finden, Ausgang im Erdgeschoss aufschließen, raus.

**Der Haken:** Drei Etagen, zehn Räume, und auf jeder Etage patrouilliert jemand.

**Oder:** das verriegelte Fenster im Erdgeschoss aufhebeln. Braucht keinen
Schlüssel, dafür ein Brecheisen, zwölf laute Sekunden und starke Nerven.

### Wie es sich spielt

Du siehst das Gebäude von der Seite — Korridore, Türen, Treppen. Was hinter einer
Tür ist, siehst Du erst, wenn Du reingehst. Türen, in denen Du noch nie warst,
zeigen nur `? ? ?`.

In den Räumen durchsuchst Du Schränke, Tische und Regale. Die meisten sind leer.
Einer hat den Schlüssel. Zwei haben Zettel, die die Suche eingrenzen: der erste
nennt die Etage, der zweite den Raum. Beim Hausmeister liegt ein Brecheisen.

**Räume sind sicher.** Solange Du drin bist, kann Dich niemand sehen oder
schnappen. Das ist Dein Versteck, wenn ein Lehrer den Korridor entlangkommt.

Draußen läuft die Patrouille aber weiter, während Du suchst — ein Raum ist ein
Versteck, keine Pausetaste. Deshalb steht an der Tür, was im Gang gerade los
ist: von `DRAUSSEN RUHIG` bis `JEMAND STEHT DAVOR`. Im Spind sagt Dir der
Sehschlitz dasselbe.

### Die Lehrer

Jeder Lehrer hat einen Sichtkegel in Laufrichtung. Kommst Du hinein, füllt sich
über seinem Kopf ein Balken — das ist Deine Reaktionszeit. Ist er voll, wird
gejagt.

Sie laufen nicht stur hin und her. Alle paar Sekunden bleiben sie stehen und
schauen in der Hälfte der Fälle einmal über die Schulter. Am Ende ihrer Bahn
halten sie kurz inne, bevor sie umdrehen.

Der Direktor ist ein eigener Fall: langsamer, sieht dafür deutlich weiter, gibt
später auf und wechselt die Etagen. Wenn er auf Deine kommt, hörst Du es.

Du bist schneller als sie. Weglaufen funktioniert, in einen Raum abbiegen auch.
Wirst Du erwischt, kostet das ein Herz, der Fänger schiebt Dich ins Treppenhaus
und geht wieder auf Runde — er steht Dir also nicht direkt wieder im Weg. Drei
Herzen, dann ist die Nacht vorbei, bevor sie angefangen hat.

Zum Verhältnis: über je acht Minuten Patrouille gemessen liegt jede Tür
zwischen **74 und 93 Prozent der Zeit** in keinem Sichtkegel. Es gibt immer ein
Fenster, man muss es nur abwarten.

### Die Schule hört zu

Jedes Geräusch hat eine Reichweite und wird nur auf der eigenen Etage gehört:
eine Tür weit, Deine Schritte kaum, ein Hammerschlag am Fenster fast über das
halbe Erdgeschoss.

Wer etwas hört, geht nachsehen — ein `?` über dem Kopf, und der Sichtkegel
wird größer, weil er jetzt aufmerksam ist. Ein Geräusch verrät Dich nie direkt.
Es holt nur jemanden dorthin, wo Du warst. Gesehen werden musst Du selbst.

Deshalb `SHIFT`: schleichen halbiert die Sichtweite der Lehrer, macht Deine
Schritte lautlos, und wer die Tür mit gedrücktem `SHIFT` öffnet, macht sie
deutlich leiser auf.

### Und am Ende

Am Ausgang steht jemand, der Dich nicht rauslassen will. Das klärt sich.

Beim Fenster steht niemand. Das ist der Punkt und der Preis: es geht auch ohne
Schlüssel raus, aber Du siehst den Direktor nie und es zählt weniger.

Danach wird abgerechnet: Zeit, übrige Herzen, welchen Weg Du genommen hast, ob
Du überhaupt einmal gesehen wurdest, und wie viele Zettel Du gefunden hast. Der
Bestwert bleibt im Browser.

---

## Steuerung

| Taste | Aktion |
|:--|:--|
| `A` `D` oder `←` `→` | Laufen |
| `Leertaste` | Springen |
| `W` oder `↑` | Treppe hoch |
| `S` oder `↓` | Treppe runter |
| **`E`** | Tür öffnen, durchsuchen, aufhebeln, reden |
| `SHIFT` | Schleichen — langsamer, dafür leise und schwerer zu sehen |
| `F` | Vollbild |
| `P` | Pause |
| `M` | Ton aus |

**Am Handy** im Querformat: Steuerkreuz links, Aktionstasten rechts, Schleichen
als eigene Taste. Die erste
Berührung schaltet ins Vollbild. Im Hochformat kommt ein Hinweis zum Drehen.

---

## Der alte Modus

Vor den Levels war das hier ein Endlos-Brawler mit Kampfsystem, Kontern, fünf
Gegnertypen und vier Bossen. Der liegt unverändert in **[runner.html](runner.html)**
und ist weiter spielbar:
[nikros07.github.io/Nachtschicht/runner.html](https://nikros07.github.io/Nachtschicht/runner.html)

Das Kampfsystem daraus wandert nach und nach in die Level.

---

## Selbst dran drehen

Ganz oben in `index.html` steht ein Block namens `TUNE`. Dort liegt das komplette
Spielgefühl in benannten Werten. Die Spiellogik enthält keine festen Zahlen, sie
fragt nur diesen Block ab.

| Regler | Bewirkt |
|:--|:--|
| `gehTempo` | Wie schnell Du läufst |
| `beschleunigung` / `bremsung` | Wie träge sich die Bewegung anfühlt |
| `sichtWeite` | Wie weit die Lehrer sehen |
| `verdachtProSek` | Wie schnell sie Dich bemerken |
| `jagdTempo` | Wie schnell sie hinter Dir her sind |
| `leben` | Wie viele Fehler Du machen darfst |
| `suchDauer` | Wie lange eine Durchsuchung dauert |
| `hoerTuer` `hoerSchritt` | Wie weit Türen und Schritte zu hören sind |
| `pruefDauer` `pruefTempo` | Wie lange und wie schnell sie nachsehen |
| `gehtBis` `pauseDauer` | Wie oft und wie lange sie stehen bleiben |
| `hebelDauer` `hoerHebel` | Wie lange das Fenster dauert und wie laut es ist |
| `punkte*` | Was am Ende was wert ist |

Das Level selbst steht direkt darunter als Daten: `RAEUME`, `LEHRER_START`,
`BODEN`, `AUSGANG`, `FENSTER`, `SPINDE`. Räume dazuschreiben geht ohne eine
Zeile Logik.

---

## Lokal starten

Doppelklick auf `index.html` reicht. Wer lieber einen Server will:

```bash
python -m http.server 5173
```

Mit `?touch=1` an der Adresse lässt sich die Handy-Steuerung am Rechner testen.

---

## Technisch

- 320 × 180 interne Auflösung, Breite wächst auf breiten Schirmen mit, damit
  keine schwarzen Balken bleiben
- Eigener 3×5-Bitmap-Font statt Browser-Schrift
- Sprites, Konturen, Schrift und Farbverläufe werden einmal gebacken und danach
  nur kopiert — Zeichenzeit 1,2 statt 4,8 ms pro Bild
- Bewegung mit Beschleunigung, Coyote-Zeit und Sprungpuffer
- Timing läuft in Spielzeit statt Wanduhrzeit, damit Pause nichts zerlegt

---

## Woran es sich orientiert

- **Night in the Woods** — Seitenansicht, Räume, in die man erst hineingehen
  muss, um zu sehen was drin ist. Das ist die Vorlage für das Schul-Level
- **Oxenfree** — Jugendliche, eine einzige Nacht, es kippt ins Unheimliche
- **HerrAnwalt: Lawyers Legacy** — Pixel-Art, Schule, Springen und Schlagen

---

## Stand

Level 1 ist fertig: zwei Wege raus, Geräusche, Schleichen, Hinweise, Punkte.
Als Nächstes müssen die Level-Daten aus dem Code heraus, sonst heißt jedes
weitere Level: kopieren und anpassen. Das und die anderen sieben Level stehen
in [TODO.md](TODO.md).
