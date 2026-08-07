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

Nachsitzen, weil Du gepennt hast. Beim Nachsitzen nochmal gepennt. Als Du
aufwachst, ist es dunkel und keiner mehr da. Auf dem Handy warten die Jungs.

### Wie es sich spielt

Du siehst das Gebäude von der Seite — Korridore, Türen, Treppen. Was hinter einer
Tür ist, siehst Du erst, wenn Du reingehst. Türen, in denen Du noch nie warst,
zeigen nur `? ? ?`.

In den Räumen durchsuchst Du Schränke, Tische und Regale. Die meisten sind leer.
Einer hat den Schlüssel.

Dazwischen liegen **fünf Zettel**. Vier davon erzählen, wo Du hier eigentlich
bist. Der fünfte ist vom Hausmeister und verrät, in welcher Etage der
Zweitschlüssel hängt — das ist die Abkürzung, nach der es sich zu suchen lohnt.
Findest Du ihn nicht, sagt es Dir das Spiel nach sieben leeren Fächern selbst.

**Räume sind sicher.** Solange Du drin bist, kann Dich niemand sehen oder
schnappen. Das ist Dein Versteck, wenn ein Lehrer den Korridor entlangkommt.

### Die Lehrer

Jeder Lehrer hat einen Sichtkegel in Laufrichtung. Kommst Du hinein, füllt sich
über seinem Kopf ein Balken — das ist Deine Reaktionszeit. Ist er voll, wird
gejagt.

Sie laufen nicht stur. Zwischendurch bleiben sie stehen und **schauen sich um** —
dabei drehen sie sich, und genau dann geht der Kegel dorthin, wo Du gerade
stehst. Über dem Kopf steht, was sie denken: `.` döst vor sich hin, `?` ist
einem Geräusch auf der Spur, `!` heißt, es ist zu spät.

Du bist schneller als sie. Weglaufen funktioniert, in einen Raum abbiegen auch.
Wirst Du erwischt, kostet das ein Herz und Du landest wieder an der Treppe.
Drei Herzen, dann ist die Nacht vorbei, bevor sie angefangen hat.

### Krach

Die Lehrer hören durch Wände. Jedes Geräusch zieht einen sichtbaren Ring — was
Du gerade verraten hast, siehst Du also.

| Was | Wie laut |
|:--|:--|
| Tür auf oder zu | am lautesten |
| Aus dem Sprung landen | mittel |
| Rennen | leise, aber hörbar |
| Schleichen | **gar nicht** |

Wer den Krach hört, weiß nur *wo* es geknallt hat, nicht wer da war. Er kommt
hin, schaut sich um und geht wieder. Das reicht, um Dich aus einem Versteck zu
treiben — oder um ihn absichtlich woandershin zu schicken.

### Schleichen und Verstecken

**Shift** drückt das Tempo auf die Hälfte. Dafür sieht ein Lehrer nur noch
62 Prozent so weit und braucht doppelt so lange, bis er sicher ist. Der
gezeichnete Sichtkegel schrumpft mit — was Du siehst, gilt auch.

In den Fluren stehen **Spinde**. `E` davor, und Du bist weg. Aber nur, wenn er
Dich nicht vorher gesehen hat: wer sich vor seinen Augen reinstellt, wird
wieder rausgeholt.

Und bevor Du einen Raum verlässt, sagt Dir der Blick durch den Türspalt, ob der
Flur frei ist.

### Und am Ende

Am Ausgang steht jemand, der Dich nicht rauslassen will. Das klärt sich.

---

## Steuerung

| Taste | Aktion |
|:--|:--|
| `A` `D` oder `←` `→` | Laufen |
| `Leertaste` | Springen |
| `W` oder `↑` | Treppe hoch |
| `S` oder `↓` | Treppe runter |
| **`Shift`** | Schleichen |
| **`E`** | Tür öffnen, Spind, durchsuchen, reden |
| `F` | Vollbild |
| `P` | Pause |
| `M` | Ton aus |

**Am Handy** im Querformat: Steuerkreuz links, Aktionstasten rechts. Die erste
Berührung schaltet ins Vollbild. Im Hochformat kommt ein Hinweis zum Drehen.

Schleichen ist am Handy ein **Schalter** statt einer Halte-Taste — man kann dort
nicht gleichzeitig laufen und eine zweite Taste festhalten. `SCHL` einmal
antippen, nochmal antippen zum Ausschalten.

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
| `schleichTempo` | Wie schnell Schleichen noch ist |
| `schleichSicht` | Wieviel Sichtweite beim Schleichen übrig bleibt |
| `hoerWeite` | Wie weit ein lautes Geräusch trägt |
| `pauseAbstand` | Wie oft ein Lehrer stehen bleibt |
| `tippNachSuchen` | Nach wievielen leeren Fächern die Etage verraten wird |

Das Level selbst steht direkt darunter als Daten: `RAEUME`, `LEHRER_START`,
`BODEN`, `AUSGANG`. Räume dazuschreiben geht ohne eine Zeile Logik.

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

Level 1 ist spielbar und durchspielbar — am Rechner wie am Handy. Es hat einen
Vorspann, Schleichen, Verstecken, Lehrer die zuhören und Zettel zum Finden.

Was noch fehlt: der zweite Ausgang, der Direktor als Patrouille, ein Zeitbonus.
Und dann die anderen sieben Level, das Kampfsystem aus `runner.html` und das
Freischalten der Crew — alles in [TODO.md](TODO.md).
